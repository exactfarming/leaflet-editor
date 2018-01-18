import DrawEvents from './draw/events';
import EditPolygon from './edit/polygon';
import {
  precision,
  precisionGeoJSON
} from './utils/precision';

export default Object.assign({
  _selectedMarker: undefined,
  _selectedVLayer: undefined,
  _oldSelectedMarker: undefined,
  __polygonEdgesIntersected: false,
  _modeType: 'draw',
  _controlLayers: undefined,
  _getSelectedVLayer () {
    return this._selectedVLayer;
  },
  _setSelectedVLayer (layer) {
    this._selectedVLayer = layer;
  },
  _clearSelectedVLayer () {
    this._selectedVLayer = undefined;
  },
  _hideSelectedVLayer (layer) {
    layer.bringToBack();

    if (!layer) {
      return;
    }
    //show last layer
    this._showSelectedVLayer(this._getSelectedVLayer());
    //hide
    this._setSelectedVLayer(layer);
    layer._path.style.visibility = 'hidden';
  },
  _showSelectedVLayer (layer = this._selectedVLayer) {
    if (!layer) {
      return;
    }
    layer._path.style.visibility = '';
  },
  hasSelectedVLayer() {
    return this._getSelectedVLayer() !== undefined;
  },
  _addEGroup_To_VGroup () {
    let vGroup = this.getVGroup();
    let eGroup = this.getEGroup();

    eGroup.eachLayer((layer) => {
      if (!layer.isEmpty()) {
        let holes = layer._holes;
        let latlngs = layer.getLatLngs();
        if ($.isArray(holes)) {
          if (holes) {
            latlngs = [latlngs].concat(holes);
          }
        }
        vGroup.addLayer(L.polygon(latlngs));
      }
    });
  },
  _addEPolygon_To_VGroup () {
    let vGroup = this.getVGroup();
    let ePolygon = this.getEPolygon();

    let holes = ePolygon.getHoles();
    let latlngs = ePolygon.getLatLngs();

    if (latlngs.length <= 2) {
      return;
    }

    if ($.isArray(holes)) {
      if (holes) {
        latlngs = [latlngs].concat(holes);
      }
    }
    vGroup.addLayer(L.polygon(latlngs));
  },
  _setEPolygon_To_VGroup () {
    let ePolygon = this.getEPolygon();
    let selectedVLayer = this._getSelectedVLayer();

    if (!selectedVLayer) {
      return;
    }

    selectedVLayer._latlngs = ePolygon.getLatLngs();
    selectedVLayer._holes = ePolygon.getHoles();
    selectedVLayer.redraw();
  },
  _convert_EGroup_To_VGroup () {
    this.getVGroup().clearLayers();
    this._addEGroup_To_VGroup();
  },
  _convertToEdit (group) {
    if (group instanceof L.MultiPolygon) {
      let eGroup = this.getEGroup();

      eGroup.clearLayers();

      group.eachLayer((layer) => {
        let latlngs = layer.getLatLngs();

        let holes = layer._holes;
        if ($.isArray(holes)) {
          latlngs = [latlngs].concat(holes);
        }

        let editPolygon = new EditPolygon(latlngs);
        editPolygon.addTo(this);
        eGroup.addLayer(editPolygon);
      });
      return eGroup;
    }
    else if (group instanceof L.MarkerGroup) {
      let ePolygon = this.getEPolygon();
      let layers = group.getLayers();
      layers = layers.filter((layer) => !layer.isMiddle());
      let pointsArray = layers.map((layer) => layer.getLatLng());

      let holes = ePolygon.getHoles();

      if (holes) {
        pointsArray = [pointsArray].concat(holes);
      }

      ePolygon.setLatLngs(pointsArray);
      ePolygon.redraw();

      return ePolygon;
    }
  },
  _setMode (type) {
    let options = this.options;
    this.getEPolygon().setStyle(options.style[type]);
  },

  _getModeType () {
    return this._modeType;
  },
  _setModeType (type) {
    this.$.removeClass('map-' + this._modeType);
    this._modeType = type;
    this.$.addClass('map-' + this._modeType);
  },
  _setMarkersGroupIcon (markerGroup) {
    let mIcon = this.options.markerIcon;
    let mHoverIcon = this.options.markerHoverIcon;

    let mode = this._getModeType();
    if (mIcon) {
      if (!mIcon.mode) {
        markerGroup.options.mIcon = mIcon;
      } else {
        let icon = mIcon.mode[mode];
        if (icon !== undefined) {
          markerGroup.options.mIcon = icon;
        }
      }
    }

    if (mHoverIcon) {
      if (!mHoverIcon.mode) {
        markerGroup.options.mHoverIcon = mHoverIcon;
      } else {
        let icon = mHoverIcon[mode];
        if (icon !== undefined) {
          markerGroup.options.mHoverIcon = icon;
        }
      }
    }

    markerGroup.options.mHoverIcon = markerGroup.options.mHoverIcon || markerGroup.options.mIcon;

    if (mode === "afterDraw") {
      markerGroup.updateStyle();
    }
  },
  mode (type) {
    this.fire(this._modeType + '_events_disable');
    this.fire(type + '_events_enable');

    this._setModeType(type);

    if (type === undefined) {
      return this._modeType;
    } else {
      this._clearEvents();
      type = this[type]() || type;
      this._setMode(type);
    }
  },
  isMode (type) {
    return type === this._modeType;
  },
  draw () {
    if (this.isMode('edit') || this.isMode('view') || this.isMode('afterDraw')) {
      this._clearMap();

    }
    this._bindDrawEvents();
  },
  cancel () {
    this._clearMap();

    this.mode('view');
  },
  clear () {
    this._clearEvents();
    this._clearMap();
    this.fire('editor:map_cleared');
  },
  clearAll () {
    this.mode('view');
    this.clear();
    this.getVGroup().clearLayers();
  },
  /**
   *
   * The main idea is to save EPolygon to VGroup when:
   * 1) user add new polygon
   * 2) when user edit polygon
   *
   * */
  saveState () {

    let ePolygon = _map.getEPolygon();

    if (!ePolygon.isEmpty()) {
      //this.fitBounds(ePolygon.getBounds());
      //this.msgHelper.msg(this.options.text.forgetToSave);

      if (this._getSelectedVLayer()) {
        this._setEPolygon_To_VGroup();
      } else {
        this._addEPolygon_To_VGroup();
      }
    }

    this.clear();
    this.mode('draw');

    let geojson = this.getVGroup().toGeoJSON();
    if (geojson.geometry) {
      return geojson.geometry;
    }
    return {};
  },
  geoJSONArea(geoJSON) {
    let areaFunc = window.turf && window.turf.area || this.options.geoJSONArea;

    if (!areaFunc) {
      console.warn('Warning: Implement "geoJSONArea" function ( leaflet-editor )');
    }

    return (areaFunc) ? areaFunc(geoJSON) : 0;
  },
  area(props = {}) {

    let { precLatLng = 2 } = props;
    let vLayer = this.getVGroup();
    let ePolygonLayer = this.getEPolygon();
    let selectedLayer = this._getSelectedVLayer();

    let sum = 0;

    if (!ePolygonLayer.isEmpty()) {
      // if "eArea" < 0 than "ePolygonLayer" is hole layer
      let eArea = this.geoJSONArea(precisionGeoJSON(ePolygonLayer.toGeoJSON(), precLatLng));
      let vArea = this.geoJSONArea(precisionGeoJSON(vLayer.toGeoJSON(), precLatLng));

      let hArea = (selectedLayer) ? this.geoJSONArea(precisionGeoJSON(selectedLayer.toGeoJSON(), precLatLng)) : 0;

      if (this.hasSelectedVLayer() && eArea > 0) {
        vArea -= hArea;
      }
      sum = (eArea > 0) ? (vArea + eArea) : vArea;
    }

    return precision(sum, precLatLng);
  },
  getSelectedMarker () {
    return this._selectedMarker;
  },
  clearSelectedMarker () {
    this._selectedMarker = null;
  },
  removeSelectedMarker () {
    let selectedMarker = this._selectedMarker;
    let prevMarker = selectedMarker.prev();
    let nextMarker = selectedMarker.next();
    let midlePrevMarker = selectedMarker._middlePrev;
    let middleNextMarker = selectedMarker._middleNext;
    selectedMarker.remove();
    this._selectedMarker = midlePrevMarker;
    this._selectedMarker.remove();
    this._selectedMarker = middleNextMarker;
    this._selectedMarker.remove();
    prevMarker._middleNext = null;
    nextMarker._middlePrev = null;
  },
  removePolygon (polygon) {
    //this.getELineGroup().clearLayers();
    this.getEMarkersGroup().clearLayers();
    //this.getEMarkersGroup().getELineGroup().clearLayers();
    this.getEHMarkersGroup().clearLayers();

    polygon.clear();

    if (this.isMode('afterDraw')) {
      this.mode('draw');
    }

    this.clearSelectedMarker();
    this._setEPolygon_To_VGroup();
  },
  createEditPolygon (json) {
    let geoJson = L.geoJson(json);

    //avoid to lose changes
    if (this._getSelectedVLayer()) {
      this._setEPolygon_To_VGroup();
    } else {
      this._addEPolygon_To_VGroup();
    }

    this.clear();

    let layer = geoJson.getLayers()[0];

    if (layer) {
      let layers = layer.getLayers();
      let vGroup = this.getVGroup();
      for (let i = 0; i < layers.length; i++) {
        let _l = layers[i];
        vGroup.addLayer(_l);
      }
    }

    this.mode('draw');

    this._fitVBounds();
  },
  moveMarker (latlng) {
    this.getEMarkersGroup().getSelected().setLatLng(latlng);
  },
  _fitVBounds () {
    if (this.getVGroup().getLayers().length !== 0) {
      this.fitBounds(this.getVGroup().getBounds(), { padding: [30, 30] });
      //this.invalidateSize();
    }
  },
  _clearMap () {
    this.getEGroup().clearLayers();
    this.getEPolygon().clear();
    this.getEMarkersGroup().clear();
    let selectedMGroup = this.getSelectedMGroup();

    if (selectedMGroup) {
      selectedMGroup.getDELine().clear();
    }

    this.getEHMarkersGroup().clearLayers();

    this._activeEditLayer = undefined;

    this._showSelectedVLayer();
    this._clearSelectedVLayer();
    this.clearSelectedMarker();
  },
  _clearEvents () {
    //this._unBindViewEvents();
    this._unBindDrawEvents();
  },
  _activeEditLayer: undefined,
  _setActiveEditLayer (layer) {
    this._activeEditLayer = layer;
  },
  _getActiveEditLayer () {
    return this._activeEditLayer;
  },
  _clearActiveEditLayer () {
    this._activeEditLayer = null;
  },
  _setEHMarkerGroup (arrayLatLng) {
    let holeMarkerGroup = new L.MarkerGroup();
    holeMarkerGroup._isHole = true;

    this._setMarkersGroupIcon(holeMarkerGroup);

    let ehMarkersGroup = this.getEHMarkersGroup();
    holeMarkerGroup.addTo(ehMarkersGroup);

    let ehMarkersGroupLayers = ehMarkersGroup.getLayers();

    let hGroupPos = ehMarkersGroupLayers.length - 1;
    holeMarkerGroup._position = hGroupPos;

    for (let i = 0; i < arrayLatLng.length; i++) {
      // set hole marker
      holeMarkerGroup.setHoleMarker(arrayLatLng[i], undefined, {}, { hGroup: hGroupPos, hMarker: i });
    }

    let layers = holeMarkerGroup.getLayers();
    layers.map((layer, position) => {
      holeMarkerGroup._setMiddleMarkers(layer, position);
    });

    let ePolygon = this.getEPolygon();

    layers = holeMarkerGroup.getLayers();

    layers.forEach((layer) => {
      ePolygon.updateHolePoint(hGroupPos, layer.__position, layer._latlng);
    });

    //ePolygon.setHole()
    return holeMarkerGroup;
  },
  _moveEPolygonOnTop () {
    let ePolygon = this.getEPolygon();
    if (ePolygon._container) {
      let lastChild = $(ePolygon._container.parentNode).children().last();
      let $ePolygon = $(ePolygon._container);
      if ($ePolygon[0] !== lastChild) {
        $ePolygon.detach().insertAfter(lastChild);
      }
    }
  },
  restoreEPolygon (polygon) {
    polygon = polygon || this.getEPolygon();

    if (!polygon) {
      return;
    }

    // set markers
    let latlngs = polygon.getLatLngs();

    this.getEMarkersGroup().setAll(latlngs);

    //this.getEMarkersGroup()._connectMarkers();

    // set hole markers
    let holes = polygon.getHoles();
    if (holes) {
      for (let j = 0; j < holes.length; j++) {
        this._setEHMarkerGroup(holes[j]);
      }
    }
  },
  getControlLayers: () => this._controlLayers,
  edgesIntersected (value) {
    if (value === undefined) {
      return this.__polygonEdgesIntersected;
    } else {
      this.__polygonEdgesIntersected = value;
      if (value === true) {
        this.fire("editor:intersection_detected", { intersection: true });
      } else {
        this.fire("editor:intersection_detected", { intersection: false });
      }
    }
  },
  _errorTimeout: null,
  _showIntersectionError (text) {

    if (this._errorTimeout) {
      clearTimeout(this._errorTimeout);
    }

    this.msgHelper.msg(text || this.options.text.intersection, 'error', (this._storedLayerPoint || this.getSelectedMarker()));

    this._storedLayerPoint = null;

    this._errorTimeout = setTimeout(() => {
      this.msgHelper.hide();
    }, 10000);
  }
}, DrawEvents);
