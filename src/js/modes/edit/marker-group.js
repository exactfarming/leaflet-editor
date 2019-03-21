import BaseMGroup from '../../extended/BaseMarkerGroup.js';

import EVENTS from '../../event-names.js';

import * as icons from '../../marker-icons.js';

L.MarkerGroup = BaseMGroup.extend({
  _isHole: false,
  _position: null,
  options: {
    mIcon: null,
    mHoverIcon: null
  },
  initialize (layers) {
    L.LayerGroup.prototype.initialize.call(this, layers);

    this._markers = [];
  },
  onAdd (map) {
    this._map = map;
  },
  _updateDELine (latlng) {
    const deLine = this.getDELine();
    if (this._firstMarker) {
      deLine.update(latlng);
    }
    return deLine;
  },
  getDELine () {
    if (!this._map) {
      this._map.dashedEditLineGroup.addTo(this._map);
    }
    return this._map.dashedEditLineGroup;
  },
  hasMinimalMarkersLength() {
    return this.getLayers().filter((item) => {
      return item._icon.classList.contains('m-editor-div-icon') && !item._icon.classList.contains('m-editor-middle-div-icon');
    }).length <= 3;
  },
  setSelected (marker) {
    var map = this._map;

    if (this.hasFirstMarker()) {
      map.setSelectedMarker(this.getLast());
      map._oldSelectedMarker = map._selectedMarker;
      return;
    }

    map._oldSelectedMarker = map._selectedMarker;
    map.setSelectedMarker(marker);
  },
  getFirst () {
    return this._firstMarker;
  },
  getLast () {
    if (this.hasFirstMarker()) {
      var layers = this.getLayers();
      return layers[layers.length - 1];
    }
  },
  hasFirstMarker () {
    return !!(this.getFirst() && this.getFirst()._hasFirstIcon());
  },
  restore (layer) {
    this.setAll(layer._latlngs);
    this.setAllHoles(layer._holes);
  },
  _add(latlng, position, options = {}) {

    if (this._map.isMode('draw')) {
      if (!this._firstMarker) {
        options.icon = icons.firstIcon;
      }
    }

    var marker = this.addMarker(latlng, position, options);

    this.getDELine().addLatLng(latlng);

    if (this.getFirst()._hasFirstIcon()) {
      this._map.on('mousemove', (e) => {
        this._updateDELine(e.latlng);
      });
    } else {
      this.getDELine().clear();
    }

    if (marker._mGroup.getLayers().length > 2) {
      if (marker._mGroup._firstMarker._hasFirstIcon() && marker === marker._mGroup._lastMarker) {
        this._map.fire(EVENTS.last_marker_dblclick_mouseover, {marker: marker});
      }
    }

    return marker;
  },
  setMiddleMarker (position) {
    this.addMarker(position, null, {icon: icons.middleSelectedIcon});
  },
  setMiddleMarkers (position) {
    this.setMiddleMarker(position);
    this.setMiddleMarker(position + 2);
  },
  set (latlng, position, options) {
    return this._add(latlng, position, options);
  },
  setAll (latlngs) {
    latlngs.forEach((latlng, position) => {
      this.set(latlng, position);
    });

    this.getFirst().fire('click');
  },
  setAllHoles (holes) {
    holes.forEach((hole) => {
      var lastHGroup = this._map.getEHMarkersGroup().addHoleGroup();

      hole._each((latlng, position) => {
        lastHGroup.set(latlng, position);
      });

      lastHGroup.getFirst().fire('click');
    });
  },
  _bindLineEvents: undefined
});

const MarkerGroup = L.MarkerGroup;
export default MarkerGroup;
