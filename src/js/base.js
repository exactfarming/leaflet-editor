import DrawEvents from './modes/draw/events.js';

import {
  precision,
  precisionGeoJSON
} from './utils/precision.js';

import EVENTS from './event-names.js';

import MarkerGroup from './modes/edit/marker-group.js';

export default Object.assign({

  hasSelectedVLayer() {
    return this._getSelectedVLayer() !== undefined;
  },

  _selectedMarker: undefined,
  _selectedVLayer: undefined,
  _oldSelectedMarker: undefined,
  _modeType: 'draw',
  _activeEditLayer: undefined,
  _errorTimeout: null,

  mode(type) {
    if (this[`__mode_${type}`]) {
      this._setModeType(type);

      this._clearEvents();


      type = this[`__mode_${type}`]() || type;

      this._setMode(type);
    } else {
      console.error(`Mode "${type}" is not defined`);
    }
  },
  isMode(type) {
    return type === this._modeType;
  },
  __mode_draw() {
    this._bindDrawEvents();
  },
  clear() {
    this._clearEvents();
    this._clearMap();
    setTimeout(() => {
      this.fire(EVENTS.map_cleared);
    }, 0);
  },
  /**
   *
   * The main idea is to save EPolygon to VGroup when:
   * 1) user add new polygon
   * 2) when user edit polygon
   *
   * */
  saveState() {

    let ePolygon = this.getEPolygon();

    if (!ePolygon.isEmpty()) {
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
    let areaFunc = this.options.geoJSONArea || window.turf && window.turf.area;

    if (!areaFunc) {
      console.warn('Warning: Implement "geoJSONArea" function ( leaflet-editor )');
    }

    return (areaFunc) ? areaFunc(geoJSON) : 0;
  },
  /**
   * Get editable area with precision of lat, lng
   * Default precision is 6 (precLatLng)
   *
   * */
  area(props = {}) {

    let {precLatLng = 6} = props;
    let vLayer = this.getVGroup();
    let ePolygonLayer = this.getEPolygon();
    let selectedLayer = this._getSelectedVLayer();

    let sum = 0;

    let eArea = (!ePolygonLayer.isEmpty()) ? this.geoJSONArea(precisionGeoJSON(ePolygonLayer.toGeoJSON(), precLatLng)) : 0;
    let vArea = this.geoJSONArea(precisionGeoJSON(vLayer.toGeoJSON(), precLatLng));

    let hArea = (selectedLayer) ? this.geoJSONArea(precisionGeoJSON(selectedLayer.toGeoJSON(), precLatLng)) : 0;

    if (this.hasSelectedVLayer() && eArea > 0) {
      vArea -= hArea;
    }

    sum = (eArea > 0) ? (vArea + eArea) : vArea;

    return precision(sum, precLatLng);
  },
  getSelectedMarker() {
    return this._selectedMarker;
  },
  clearSelectedMarker() {
    this._selectedMarker = null;
  },
  setSelectedMarker(marker) {
    if (!marker || !marker._icon) {
      throw new Error('Error in method "setSelectedMarker". Check marker instance');
    }
    this._selectedMarker = marker;
  },
  removePolygon(polygon) {
    this.getEMarkersGroup().clearLayers();
    this.getEHMarkersGroup().clearLayers();

    polygon.clear();

    this.clearSelectedMarker();
    this._setEPolygon_To_VGroup();
  },
  createEditPolygon(json) {
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

    return geoJson;
  },

  _getSelectedVLayer() {
    return this._selectedVLayer;
  },
  _setSelectedVLayer(layer) {
    this._selectedVLayer = layer;
  },
  _clearSelectedVLayer() {
    this._selectedVLayer = undefined;
  },
  _hideSelectedVLayer(layer) {
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
  _showSelectedVLayer(layer = this._selectedVLayer) {
    if (!layer) {
      return;
    }
    layer._path.style.visibility = '';
  },
  _addEPolygon_To_VGroup() {
    let vGroup = this.getVGroup();
    let ePolygon = this.getEPolygon();

    let holes = ePolygon.getHoles();
    let latlngs = ePolygon.getLatLngs();

    if (latlngs.length <= 2) {
      return;
    }

    if (Array.isArray(holes)) {
      if (holes) {
        latlngs = [latlngs].concat(holes);
      }
    }
    vGroup.addLayer(L.polygon(latlngs));
  },
  _setEPolygon_To_VGroup() {
    let ePolygon = this.getEPolygon();
    let selectedVLayer = this._getSelectedVLayer();

    if (!selectedVLayer) {
      return;
    }

    selectedVLayer._latlngs = ePolygon.getLatLngs();
    selectedVLayer._holes = ePolygon.getHoles();
    selectedVLayer.redraw();
  },

  _convertToEdit(group) {
    if (group instanceof MarkerGroup) {
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
  _setMode(type) {
    let options = this.options;
    this.getEPolygon().setStyle(options.style[type]);
  },

  _setModeType(type) {
    try {
      this._container.classList.remove(`map-${this._modeType}`);
      this._container.classList.add(`map-${this._modeType}`);

      this._modeType = type;
    } catch (e) {
      console.error('Check "_setModeType"');
    }
  },
  _fitVBounds() {
    if (this.getVGroup().getLayers().length !== 0) {
      this.fitBounds(this.getVGroup().getBounds(), {padding: [30, 30]});
    }
  },
  _clearMap() {
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
  _clearEvents() {
    this._unBindDrawEvents();
  },
  _moveEPolygonOnTop() {
    const ePolygon = this.getEPolygon();
    const element = ePolygon._container;

    if (element) {
      element.parentElement.insertAdjacentElement('beforeend', element);
    }
  }
}, DrawEvents);
