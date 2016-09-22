(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _drawEvents = require('./draw/events');

var _drawEvents2 = _interopRequireDefault(_drawEvents);

var _editPolygon = require('./edit/polygon');

var _editPolygon2 = _interopRequireDefault(_editPolygon);

exports['default'] = $.extend({
  _selectedMarker: undefined,
  _selectedVLayer: undefined,
  _oldSelectedMarker: undefined,
  __polygonEdgesIntersected: false,
  _modeType: 'draw',
  _controlLayers: undefined,
  _getSelectedVLayer: function _getSelectedVLayer() {
    return this._selectedVLayer;
  },
  _setSelectedVLayer: function _setSelectedVLayer(layer) {
    this._selectedVLayer = layer;
  },
  _clearSelectedVLayer: function _clearSelectedVLayer() {
    this._selectedVLayer = undefined;
  },
  _hideSelectedVLayer: function _hideSelectedVLayer(layer) {
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
  _showSelectedVLayer: function _showSelectedVLayer() {
    var layer = arguments.length <= 0 || arguments[0] === undefined ? this._selectedVLayer : arguments[0];

    if (!layer) {
      return;
    }
    layer._path.style.visibility = '';
  },
  hasSelectedVLayer: function hasSelectedVLayer() {
    return this._getSelectedVLayer() !== undefined;
  },
  _addEGroup_To_VGroup: function _addEGroup_To_VGroup() {
    var vGroup = this.getVGroup();
    var eGroup = this.getEGroup();

    eGroup.eachLayer(function (layer) {
      if (!layer.isEmpty()) {
        var holes = layer._holes;
        var latlngs = layer.getLatLngs();
        if ($.isArray(holes)) {
          if (holes) {
            latlngs = [latlngs].concat(holes);
          }
        }
        vGroup.addLayer(L.polygon(latlngs));
      }
    });
  },
  _addEPolygon_To_VGroup: function _addEPolygon_To_VGroup() {
    var vGroup = this.getVGroup();
    var ePolygon = this.getEPolygon();

    var holes = ePolygon.getHoles();
    var latlngs = ePolygon.getLatLngs();

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
  _setEPolygon_To_VGroup: function _setEPolygon_To_VGroup() {
    var ePolygon = this.getEPolygon();
    var selectedVLayer = this._getSelectedVLayer();

    if (!selectedVLayer) {
      return;
    }

    selectedVLayer._latlngs = ePolygon.getLatLngs();
    selectedVLayer._holes = ePolygon.getHoles();
    selectedVLayer.redraw();
  },
  _convert_EGroup_To_VGroup: function _convert_EGroup_To_VGroup() {
    this.getVGroup().clearLayers();
    this._addEGroup_To_VGroup();
  },
  _convertToEdit: function _convertToEdit(group) {
    var _this = this;

    if (group instanceof L.MultiPolygon) {
      var eGroup = this.getEGroup();

      eGroup.clearLayers();

      group.eachLayer(function (layer) {
        var latlngs = layer.getLatLngs();

        var holes = layer._holes;
        if ($.isArray(holes)) {
          latlngs = [latlngs].concat(holes);
        }

        var editPolygon = new _editPolygon2['default'](latlngs);
        editPolygon.addTo(_this);
        eGroup.addLayer(editPolygon);
      });
      return eGroup;
    } else if (group instanceof L.MarkerGroup) {
      var ePolygon = this.getEPolygon();
      var layers = group.getLayers();
      layers = layers.filter(function (layer) {
        return !layer.isMiddle();
      });
      var pointsArray = layers.map(function (layer) {
        return layer.getLatLng();
      });

      var holes = ePolygon.getHoles();

      if (holes) {
        pointsArray = [pointsArray].concat(holes);
      }

      ePolygon.setLatLngs(pointsArray);
      ePolygon.redraw();

      return ePolygon;
    }
  },
  _setMode: function _setMode(type) {
    var options = this.options;
    this.getEPolygon().setStyle(options.style[type]);
  },

  _getModeType: function _getModeType() {
    return this._modeType;
  },
  _setModeType: function _setModeType(type) {
    this.$.removeClass('map-' + this._modeType);
    this._modeType = type;
    this.$.addClass('map-' + this._modeType);
  },
  _setMarkersGroupIcon: function _setMarkersGroupIcon(markerGroup) {
    var mIcon = this.options.markerIcon;
    var mHoverIcon = this.options.markerHoverIcon;

    var mode = this._getModeType();
    if (mIcon) {
      if (!mIcon.mode) {
        markerGroup.options.mIcon = mIcon;
      } else {
        var icon = mIcon.mode[mode];
        if (icon !== undefined) {
          markerGroup.options.mIcon = icon;
        }
      }
    }

    if (mHoverIcon) {
      if (!mHoverIcon.mode) {
        markerGroup.options.mHoverIcon = mHoverIcon;
      } else {
        var icon = mHoverIcon[mode];
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
  mode: function mode(type) {
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
  isMode: function isMode(type) {
    return type === this._modeType;
  },
  draw: function draw() {
    if (this.isMode('edit') || this.isMode('view') || this.isMode('afterDraw')) {
      this._clearMap();
    }
    this._bindDrawEvents();
  },
  cancel: function cancel() {
    this._clearMap();

    this.mode('view');
  },
  clear: function clear() {
    this._clearEvents();
    this._clearMap();
    this.fire('editor:map_cleared');
  },
  clearAll: function clearAll() {
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
  saveState: function saveState() {

    var ePolygon = _map.getEPolygon();

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

    var geojson = this.getVGroup().toGeoJSON();
    if (geojson.geometry) {
      return geojson.geometry;
    }
    return {};
  },
  area: function area() {

    if (!window.turf) {
      console.error('leaflet-editor: no "turf" library!!! http://turfjs.org/');

      return 0;
    }

    var vLayer = this.getVGroup();
    var ePolygonLayer = this.getEPolygon();
    var selectedLayer = this._getSelectedVLayer();

    // if "eArea" < 0 than "ePolygonLayer" is hole layer
    var eArea = turf.area(ePolygonLayer.toGeoJSON());
    var vArea = turf.area(vLayer.toGeoJSON());

    var hArea = selectedLayer ? turf.area(selectedLayer.toGeoJSON()) : 0;

    if (this.hasSelectedVLayer() && eArea > 0) {
      vArea -= hArea;
    }
    var sum = eArea > 0 ? vArea + eArea : vArea;

    return sum;
  },
  getSelectedMarker: function getSelectedMarker() {
    return this._selectedMarker;
  },
  clearSelectedMarker: function clearSelectedMarker() {
    this._selectedMarker = null;
  },
  removeSelectedMarker: function removeSelectedMarker() {
    var selectedMarker = this._selectedMarker;
    var prevMarker = selectedMarker.prev();
    var nextMarker = selectedMarker.next();
    var midlePrevMarker = selectedMarker._middlePrev;
    var middleNextMarker = selectedMarker._middleNext;
    selectedMarker.remove();
    this._selectedMarker = midlePrevMarker;
    this._selectedMarker.remove();
    this._selectedMarker = middleNextMarker;
    this._selectedMarker.remove();
    prevMarker._middleNext = null;
    nextMarker._middlePrev = null;
  },
  removePolygon: function removePolygon(polygon) {
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
  createEditPolygon: function createEditPolygon(json) {
    var geoJson = L.geoJson(json);

    //avoid to lose changes
    if (this._getSelectedVLayer()) {
      this._setEPolygon_To_VGroup();
    } else {
      this._addEPolygon_To_VGroup();
    }

    this.clear();

    var layer = geoJson.getLayers()[0];

    if (layer) {
      var layers = layer.getLayers();
      var vGroup = this.getVGroup();
      for (var i = 0; i < layers.length; i++) {
        var _l = layers[i];
        vGroup.addLayer(_l);
      }
    }

    this.mode('draw');

    this._fitVBounds();
  },
  moveMarker: function moveMarker(latlng) {
    this.getEMarkersGroup().getSelected().setLatLng(latlng);
  },
  _fitVBounds: function _fitVBounds() {
    if (this.getVGroup().getLayers().length !== 0) {
      this.fitBounds(this.getVGroup().getBounds(), { padding: [30, 30] });
      //this.invalidateSize();
    }
  },
  _clearMap: function _clearMap() {
    this.getEGroup().clearLayers();
    this.getEPolygon().clear();
    this.getEMarkersGroup().clear();
    var selectedMGroup = this.getSelectedMGroup();

    if (selectedMGroup) {
      selectedMGroup.getDELine().clear();
    }

    this.getEHMarkersGroup().clearLayers();

    this._activeEditLayer = undefined;

    this._showSelectedVLayer();
    this._clearSelectedVLayer();
    this.clearSelectedMarker();
  },
  _clearEvents: function _clearEvents() {
    //this._unBindViewEvents();
    this._unBindDrawEvents();
  },
  _activeEditLayer: undefined,
  _setActiveEditLayer: function _setActiveEditLayer(layer) {
    this._activeEditLayer = layer;
  },
  _getActiveEditLayer: function _getActiveEditLayer() {
    return this._activeEditLayer;
  },
  _clearActiveEditLayer: function _clearActiveEditLayer() {
    this._activeEditLayer = null;
  },
  _setEHMarkerGroup: function _setEHMarkerGroup(arrayLatLng) {
    var holeMarkerGroup = new L.MarkerGroup();
    holeMarkerGroup._isHole = true;

    this._setMarkersGroupIcon(holeMarkerGroup);

    var ehMarkersGroup = this.getEHMarkersGroup();
    holeMarkerGroup.addTo(ehMarkersGroup);

    var ehMarkersGroupLayers = ehMarkersGroup.getLayers();

    var hGroupPos = ehMarkersGroupLayers.length - 1;
    holeMarkerGroup._position = hGroupPos;

    for (var i = 0; i < arrayLatLng.length; i++) {
      // set hole marker
      holeMarkerGroup.setHoleMarker(arrayLatLng[i], undefined, {}, { hGroup: hGroupPos, hMarker: i });
    }

    var layers = holeMarkerGroup.getLayers();
    layers.map(function (layer, position) {
      holeMarkerGroup._setMiddleMarkers(layer, position);
    });

    var ePolygon = this.getEPolygon();
    var layers = holeMarkerGroup.getLayers();

    layers.forEach(function (layer) {
      ePolygon.updateHolePoint(hGroupPos, layer.__position, layer._latlng);
    });

    //ePolygon.setHole()
    return holeMarkerGroup;
  },
  _moveEPolygonOnTop: function _moveEPolygonOnTop() {
    var ePolygon = this.getEPolygon();
    if (ePolygon._container) {
      var lastChild = $(ePolygon._container.parentNode).children().last();
      var $ePolygon = $(ePolygon._container);
      if ($ePolygon[0] !== lastChild) {
        $ePolygon.detach().insertAfter(lastChild);
      }
    }
  },
  restoreEPolygon: function restoreEPolygon(polygon) {
    polygon = polygon || this.getEPolygon();

    if (!polygon) {
      return;
    }

    // set markers
    var latlngs = polygon.getLatLngs();

    this.getEMarkersGroup().setAll(latlngs);

    //this.getEMarkersGroup()._connectMarkers();

    // set hole markers
    var holes = polygon.getHoles();
    if (holes) {
      for (var j = 0; j < holes.length; j++) {
        this._setEHMarkerGroup(holes[j]);
      }
    }
  },
  getControlLayers: function getControlLayers() {
    return undefined._controlLayers;
  },
  edgesIntersected: function edgesIntersected(value) {
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
  _showIntersectionError: function _showIntersectionError(text) {
    var _this2 = this;

    if (this._errorTimeout) {
      clearTimeout(this._errorTimeout);
    }

    this.msgHelper.msg(text || this.options.text.intersection, 'error', this._storedLayerPoint || this.getSelectedMarker());

    this._storedLayerPoint = null;

    this._errorTimeout = setTimeout(function () {
      _this2.msgHelper.hide();
    }, 10000);
  }
}, _drawEvents2['default']);
module.exports = exports['default'];

},{"./draw/events":3,"./edit/polygon":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _options = require('../options');

var opts = _interopRequireWildcard(_options);

exports['default'] = L.Polyline.extend({
  options: opts.options.style.drawLine,
  _latlngToMove: undefined,
  onAdd: function onAdd(map) {
    L.Polyline.prototype.onAdd.call(this, map);
    this.setStyle(map.options.style.drawLine);
  },
  addLatLng: function addLatLng(latlng) {
    if (this._latlngToMove) {
      this._latlngToMove = undefined;
    }

    if (this._latlngs.length > 1) {
      this._latlngs.splice(-1);
    }

    this._latlngs.push(L.latLng(latlng));

    return this.redraw();
  },
  update: function update(pos) {

    if (!this._latlngToMove && this._latlngs.length) {
      this._latlngToMove = L.latLng(pos);
      this._latlngs.push(this._latlngToMove);
    }
    if (this._latlngToMove) {
      this._latlngToMove.lat = pos.lat;
      this._latlngToMove.lng = pos.lng;

      this.redraw();
    }
    return this;
  },
  _addLine: function _addLine(line, group, isLastMarker) {
    if (!isLastMarker) {
      line.addTo(group);
    }
  },
  clear: function clear() {
    this.setLatLngs([]);
  }
});
module.exports = exports['default'];

},{"../options":23}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _markerIcons = require('../marker-icons');

exports['default'] = {
  _bindDrawEvents: function _bindDrawEvents() {
    var _this = this;

    this._unBindDrawEvents();

    // click on map
    this.on('click', function (e) {
      _this._storedLayerPoint = e.layerPoint;
      // bug fix
      if (e.originalEvent && e.originalEvent.clientX === 0 && e.originalEvent.clientY === 0) {
        return;
      }

      if (e.target instanceof L.Marker) {
        return;
      }

      var eMarkersGroup = e.target.getEMarkersGroup();

      // start add new polygon
      if (eMarkersGroup.isEmpty()) {
        _this._addMarker(e);

        _this.fire('editor:start_add_new_polygon');
        var startDrawStyle = _this.options.style['startDraw'];

        if (startDrawStyle) {
          _this.getEPolygon().setStyle(startDrawStyle);
        }

        _this._clearSelectedVLayer();

        _this._selectedMGroup = eMarkersGroup;
        return false;
      }

      // continue with new polygon
      var firstMarker = eMarkersGroup.getFirst();

      if (firstMarker && firstMarker._hasFirstIcon()) {
        if (!(e.target instanceof L.Marker)) {
          _this._addMarker(e);
        }
        return false;
      }

      // start draw new hole polygon
      var ehMarkersGroup = _this.getEHMarkersGroup();
      var lastHole = ehMarkersGroup.getLastHole();
      if (firstMarker && !firstMarker._hasFirstIcon()) {
        if (e.target.getEPolygon()._path === e.originalEvent.target) {
          if (!lastHole || !lastHole.getFirst() || !lastHole.getFirst()._hasFirstIcon()) {
            _this.clearSelectedMarker();

            var lastHGroup = ehMarkersGroup.addHoleGroup();
            lastHGroup.set(e.latlng, null, { icon: _markerIcons.firstIcon });

            _this._selectedMGroup = lastHGroup;
            _this.fire('editor:start_add_new_hole');

            return false;
          }
        }
      }

      // continue with new hole polygon
      if (lastHole && !lastHole.isEmpty() && lastHole.hasFirstMarker()) {
        if (_this.getEMarkersGroup()._isMarkerInPolygon(e.latlng)) {
          var marker = ehMarkersGroup.getLastHole().set(e.latlng);
          var rslt = marker._detectIntersection(); // in case of hole
          if (rslt) {
            _this._showIntersectionError();

            //marker._mGroup.removeMarker(marker); //todo: detect intersection for hole
          }
        } else {
            _this._showIntersectionError();
          }
        return false;
      }

      // reset

      if (_this._getSelectedVLayer()) {
        _this._setEPolygon_To_VGroup();
      } else {
        _this._addEPolygon_To_VGroup();
      }
      _this.clear();
      _this.mode('draw');

      _this.fire('editor:marker_group_clear');
    });

    this.on('editor:__join_path', function (e) {
      var eMarkersGroup = e.mGroup;

      if (!eMarkersGroup) {
        return;
      }

      if (eMarkersGroup._isHole) {
        _this.getEHMarkersGroup().resetLastHole();
      }
      //1. set middle markers
      var layers = eMarkersGroup.getLayers();

      var position = -1;
      layers.forEach(function () {
        var marker = eMarkersGroup.addMarker(position, null, { icon: _markerIcons.middleIcon });
        position = marker.position + 2;
      });

      //2. clear line
      eMarkersGroup.getDELine().clear();

      eMarkersGroup.getLayers()._each(function (marker) {
        marker.dragging.enable();
      });

      eMarkersGroup.select();

      //reset style if 'startDraw' was used
      _this.getEPolygon().setStyle(_this.options.style.draw);

      if (eMarkersGroup._isHole) {
        _this.fire('editor:polygon:hole_created');
      } else {
        _this.fire('editor:polygon:created');
      }
    });

    var vGroup = this.getVGroup();

    vGroup.on('click', function (e) {
      vGroup.onClick(e);

      _this.msgHelper.msg(_this.options.text.clickToDrawInnerEdges, null, e.layerPoint);
      _this.fire('editor:polygon:selected');
    });

    this.on('editor:delete_marker', function () {
      _this._convertToEdit(_this.getEMarkersGroup());
    });
    this.on('editor:delete_polygon', function () {
      _this.getEHMarkersGroup().remove();
    });
  },
  _addMarker: function _addMarker(e) {
    var latlng = e.latlng;

    var eMarkersGroup = this.getEMarkersGroup();

    var marker = eMarkersGroup.set(latlng);

    this._convertToEdit(eMarkersGroup);

    return marker;
  },
  _updateDELine: function _updateDELine(latlng) {
    return this.getEMarkersGroup().getDELine().update(latlng);
  },
  _unBindDrawEvents: function _unBindDrawEvents() {
    this.off('click');
    this.getVGroup().off('click');
    //this.off('mouseout');
    this.off('dblclick');

    this.getDELine().clear();

    this.off('editor:__join_path');

    if (this._openPopup) {
      this.openPopup = this._openPopup;
      delete this._openPopup;
    }
  }
};
module.exports = exports['default'];

},{"../marker-icons":22}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = L.FeatureGroup.extend({
  isEmpty: function isEmpty() {
    return this.getLayers().length === 0;
  }
});
module.exports = exports["default"];

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = L.FeatureGroup.extend({
  _selected: false,
  _lastHole: undefined,
  _lastHoleToDraw: undefined,
  addHoleGroup: function addHoleGroup() {
    this._lastHole = new L.MarkerGroup();
    this._lastHole._isHole = true;
    this._lastHole.addTo(this);

    this._lastHole.position = this.getLength() - 1;

    this._lastHoleToDraw = this._lastHole;

    return this._lastHole;
  },
  getLength: function getLength() {
    return this.getLayers().length;
  },
  resetLastHole: function resetLastHole() {
    this._lastHole = undefined;
  },
  setLastHole: function setLastHole(layer) {
    this._lastHole = layer;
  },
  getLastHole: function getLastHole() {
    return this._lastHole;
  },
  remove: function remove() {
    this.eachLayer(function (hole) {
      while (hole.getLayers().length) {
        hole.removeMarkerAt(0);
      }
    });
  },
  repos: function repos(position) {
    this.eachLayer(function (layer) {
      if (layer.position >= position) {
        layer.position -= 1;
      }
    });
  },
  resetSelection: function resetSelection() {
    this.eachLayer(function (layer) {
      layer.getLayers()._each(function (marker) {
        marker.unSelectIconInGroup();
      });
    });
    this._selected = false;
  }
});
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = L.FeatureGroup.extend({
  update: function update() {
    var map = this._map;
    map._convertToEdit(map.getEMarkersGroup());
    map.getEMarkersGroup()._connectMarkers();
    //    map.getEPolygon().setStyle(map.editStyle[map._getModeType()]);
  }
});
module.exports = exports["default"];

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extendedBaseMarkerGroup = require('../extended/BaseMarkerGroup');

var _extendedBaseMarkerGroup2 = _interopRequireDefault(_extendedBaseMarkerGroup);

var _editMarker = require('../edit/marker');

var _editMarker2 = _interopRequireDefault(_editMarker);

var _editLine = require('../edit/line');

var _editLine2 = _interopRequireDefault(_editLine);

var _drawDashedLine = require('../draw/dashed-line');

var _drawDashedLine2 = _interopRequireDefault(_drawDashedLine);

var _utilsSortByPosition = require('../utils/sortByPosition');

var _utilsSortByPosition2 = _interopRequireDefault(_utilsSortByPosition);

var _markerIcons = require('../marker-icons');

var icons = _interopRequireWildcard(_markerIcons);

L.Util.extend(L.LineUtil, {
  // Checks to see if two line segments intersect. Does not handle degenerate cases.
  // http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
  segmentsIntersect: function segmentsIntersect( /*Point*/p, /*Point*/p1, /*Point*/p2, /*Point*/p3) {
    return this._checkCounterclockwise(p, p2, p3) !== this._checkCounterclockwise(p1, p2, p3) && this._checkCounterclockwise(p, p1, p2) !== this._checkCounterclockwise(p, p1, p3);
  },

  // check to see if points are in counterclockwise order
  _checkCounterclockwise: function _checkCounterclockwise( /*Point*/p, /*Point*/p1, /*Point*/p2) {
    return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
  }
});

var turnOffMouseMove = false;

exports['default'] = L.MarkerGroup = _extendedBaseMarkerGroup2['default'].extend({
  _isHole: false,
  _editLineGroup: undefined,
  _position: undefined,
  dashedEditLineGroup: new _drawDashedLine2['default']([]),
  options: {
    mIcon: undefined,
    mHoverIcon: undefined
  },
  initialize: function initialize(layers) {
    L.LayerGroup.prototype.initialize.call(this, layers);

    this._markers = [];
    //this._bindEvents();
  },
  onAdd: function onAdd(map) {
    this._map = map;
    this.dashedEditLineGroup.addTo(map);
  },
  _updateDELine: function _updateDELine(latlng) {
    var deLine = this.getDELine();
    if (this._firstMarker) {
      deLine.update(latlng);
    }
    return deLine;
  },
  _addMarker: function _addMarker(latlng) {
    //var eMarkersGroup = this.getEMarkersGroup();

    this.set(latlng);
    this.getDELine().addLatLng(latlng);

    this._map._convertToEdit(this);
  },
  getDELine: function getDELine() {
    if (!this.dashedEditLineGroup._map) {
      this.dashedEditLineGroup.addTo(this._map);
    }
    return this.dashedEditLineGroup;
  },
  _setHoverIcon: function _setHoverIcon() {
    var map = this._map;
    if (map._oldSelectedMarker !== undefined) {
      map._oldSelectedMarker._resetIcon(this.options.mIcon);
    }
    map._selectedMarker._setHoverIcon(this.options.mHoverIcon);
  },
  _sortByPosition: function _sortByPosition() {
    if (!this._isHole) {
      var layers = this.getLayers();

      layers = layers.sort(function (a, b) {
        return a._leaflet_id - b._leaflet_id;
      });

      var idArray = [];
      var posArray = [];
      layers.forEach(function (layer) {
        idArray.push(layer._leaflet_id);
        posArray.push(layer.__position);
      });

      (0, _utilsSortByPosition2['default'])(this._layers, idArray);
    }
  },
  updateStyle: function updateStyle() {
    var markers = this.getLayers();

    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      marker._resetIcon(this.options.mIcon);
      if (marker === this._map._selectedMarker) {
        this._setHoverIcon();
      }
    }
  },
  setSelected: function setSelected(marker) {
    var map = this._map;

    if (map.__polygonEdgesIntersected && this.hasFirstMarker()) {
      map._selectedMarker = this.getLast();
      map._oldSelectedMarker = map._selectedMarker;
      return;
    }

    map._oldSelectedMarker = map._selectedMarker;
    map._selectedMarker = marker;
  },
  resetSelected: function resetSelected() {
    var map = this._map;
    if (map._selectedMarker) {
      map._selectedMarker._resetIcon(this.options.mIcon);
      map._selectedMarker = undefined;
    }
  },
  getSelected: function getSelected() {
    return this._map._selectedMarker;
  },
  _setFirst: function _setFirst(marker) {
    this._firstMarker = marker;
    this._firstMarker._setFirstIcon();
  },
  getFirst: function getFirst() {
    return this._firstMarker;
  },
  getLast: function getLast() {
    if (this.hasFirstMarker()) {
      var layers = this.getLayers();
      return layers[layers.length - 1];
    }
  },
  hasFirstMarker: function hasFirstMarker() {
    return this.getFirst() && this.getFirst()._hasFirstIcon();
  },
  convertToLatLngs: function convertToLatLngs() {
    var latlngs = [];
    this.eachLayer(function (layer) {
      if (!layer.isMiddle()) {
        latlngs.push(layer.getLatLng());
      }
    });
    return latlngs;
  },
  restore: function restore(layer) {
    this.setAll(layer._latlngs);
    this.setAllHoles(layer._holes);
  },
  _add: function _add(latlng, position) {
    var _this = this;

    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (this._map.isMode('draw')) {
      if (!this._firstMarker) {
        options.icon = icons.firstIcon;
      }
    }

    var marker = this.addMarker(latlng, position, options);

    this.getDELine().addLatLng(latlng);

    //this._map.off('mousemove');
    turnOffMouseMove = true;
    if (this.getFirst()._hasFirstIcon()) {
      this._map.on('mousemove', function (e) {
        if (!turnOffMouseMove) {
          _this._updateDELine(e.latlng);
        }
      });
      turnOffMouseMove = false;
    } else {
      this.getDELine().clear();
    }

    if (marker._mGroup.getLayers().length > 2) {
      if (marker._mGroup._firstMarker._hasFirstIcon() && marker === marker._mGroup._lastMarker) {
        this._map.fire('editor:last_marker_dblclick_mouseover', { marker: marker });
      }
    }

    return marker;
  },
  _closestNotMiddleMarker: function _closestNotMiddleMarker(layers, position, direction) {
    return layers[position].isMiddle() ? layers[position + direction] : layers[position];
  },
  _setPrevNext: function _setPrevNext(marker, position) {
    var layers = this.getLayers();

    var maxLength = layers.length - 1;
    if (position === 1) {
      marker._prev = this._closestNotMiddleMarker(layers, position - 1, -1);
      marker._next = this._closestNotMiddleMarker(layers, 2, 1);
    } else if (position === maxLength) {
      marker._prev = this._closestNotMiddleMarker(layers, maxLength - 1, -1);
      marker._next = this._closestNotMiddleMarker(layers, 0, 1);
    } else {
      if (marker._middlePrev == null) {
        marker._prev = layers[position - 1];
      }
      if (marker._middleNext == null) {
        marker._next = layers[position + 1];
      }
    }

    return marker;
  },
  setMiddleMarker: function setMiddleMarker(position) {
    this.addMarker(position, null, { icon: icons.middleIcon });
  },
  setMiddleMarkers: function setMiddleMarkers(position) {
    this.setMiddleMarker(position);
    this.setMiddleMarker(position + 2);
  },
  set: function set(latlng, position, options) {
    if (!this.hasIntersection(latlng)) {
      this._map.edgesIntersected(false);
      return this._add(latlng, position, options);
    }
  },
  setMiddle: function setMiddle(latlng, position, options) {
    position = position < 0 ? 0 : position;

    //var func = (this._isHole) ? 'set' : 'setHoleMarker';
    var marker = this.set(latlng, position, options);

    marker._setMiddleIcon();
    return marker;
  },
  setAll: function setAll(latlngs) {
    var _this2 = this;

    latlngs.forEach(function (latlng, position) {
      _this2.set(latlng, position);
    });

    this.getFirst().fire('click');
  },
  setAllHoles: function setAllHoles(holes) {
    var _this3 = this;

    holes.forEach(function (hole) {
      //this.set(hole);
      var lastHGroup = _this3._map.getEHMarkersGroup().addHoleGroup();

      hole._each(function (latlng, position) {
        lastHGroup.set(latlng, position);
      });
      //var length = hole.length;
      //var i = 0;
      //for (; i < length; i++) {
      //  lastHGroup.set(hole[i], i);
      //}

      lastHGroup.getFirst().fire('click');
    });
  },
  setHoleMarker: function setHoleMarker(latlng) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? { isHoleMarker: true, holePosition: {} } : arguments[1];

    var marker = new _editMarker2['default'](this, latlng, options || {});
    marker.addTo(this);

    //this.setSelected(marker);

    if (this._map.isMode('draw') && this.getLayers().length === 1) {
      this._setFirst(marker);
    }

    return marker;
  },
  removeHole: function removeHole() {
    var map = this._map;
    //remove edit line
    //this.getELineGroup().clearLayers();
    //remove edit markers
    this.clearLayers();

    //remove hole
    map.getEPolygon().getHoles().splice(this._position, 1);
    map.getEPolygon().redraw();

    //redraw holes
    map.getEHMarkersGroup().clearLayers();
    var holes = map.getEPolygon().getHoles();

    var i = 0;
    for (; i < holes.length; i++) {
      map._setEHMarkerGroup(holes[i]);
    }
  },
  removeSelected: function removeSelected() {
    var _this4 = this;

    var selectedEMarker = this.getSelected();
    var markerLayersArray = this.getLayers();
    var latlng = selectedEMarker.getLatLng();
    var map = this._map;

    if (markerLayersArray.length > 0) {
      this.removeLayer(selectedEMarker);

      map.fire('editor:delete_marker', { latlng: latlng });
    }

    markerLayersArray = this.getLayers();

    if (this._isHole) {
      if (map.isMode('edit')) {
        var i = 0;
        // no need to remove last point
        if (markerLayersArray.length < 4) {
          this.removeHole();
        } else {
          //selectedEMarker = map.getSelectedMarker();
          var holePosition = selectedEMarker.options.holePosition;

          //remove hole point
          //map.getEPolygon().getHole(this._position).splice(holePosition.hMarker, 1);
          map.getEPolygon().getHole(this._position).splice(selectedEMarker.__position, 1);
          map.getEPolygon().redraw();
        }

        var _position = 0;
        this.eachLayer(function (layer) {
          layer.options.holePosition = {
            hGroup: _this4._position,
            hMarker: _position++
          };
        });
      }
    } else {
      if (map.isMode('edit')) {
        // no need to remove last point
        if (markerLayersArray.length < 3) {
          //remove edit markers
          this.clearLayers();
          map.getEPolygon().clear();
        }
      }
    }

    var position = 0;
    this.eachLayer(function (layer) {
      layer.options.title = position;
      layer.__position = position++;
    });
  },
  getPointsForIntersection: function getPointsForIntersection(polygon) {
    var _this5 = this;

    var map = this._map;
    this._originalPoints = [];
    var layers = (polygon ? polygon.getLayers() : this.getLayers()).filter(function (l) {
      return !l.isMiddle();
    });

    this._originalPoints = [];
    layers._each(function (layer) {
      var latlng = layer.getLatLng();
      _this5._originalPoints.push(_this5._map.latLngToLayerPoint(latlng));
    });

    if (!polygon) {
      if (map._selectedMarker == layers[0]) {
        // point is first
        this._originalPoints = this._originalPoints.slice(1);
      } else if (map._selectedMarker == layers[layers.length - 1]) {
        // point is last
        this._originalPoints.splice(-1);
      } else {
        // point is not first / last
        var tmpArrPoints = [];
        for (var i = 1; i < layers.length; i++) {
          if (map._selectedMarker === layers[i]) {
            tmpArrPoints = this._originalPoints.splice(i + 1);
            this._originalPoints = tmpArrPoints.concat(this._originalPoints);
            this._originalPoints.splice(-1);
            break;
          }
        }
      }
    }
    return this._originalPoints;
  },
  _bindLineEvents: undefined,
  _hasIntersection: function _hasIntersection(points, newPoint, isFinish) {
    var len = points ? points.length : 0,
        lastPoint = points ? points[len - 1] : null,

    // The previous previous line segment. Previous line segment doesn't need testing.
    maxIndex = len - 2;

    if (this._tooFewPointsForIntersection(1)) {
      return false;
    }

    return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, isFinish);
  },

  _hasIntersectionWithHole: function _hasIntersectionWithHole(points, newPoint, lastPoint) {
    var len = points ? points.length : 0,

    //lastPoint = points ? points[len - 1] : null,
    // The previous previous line segment. Previous line segment doesn't need testing.
    maxIndex = len - 2;

    if (this._tooFewPointsForIntersection(1)) {
      return false;
    }

    return this._lineHoleSegmentsIntersectsRange(lastPoint, newPoint);
  },

  hasIntersection: function hasIntersection(latlng, isFinish) {
    var map = this._map;
    if (map.options.allowIntersection) {
      return false;
    }

    var newPoint = map.latLngToLayerPoint(latlng);

    var points = this.getPointsForIntersection();

    var rslt1 = this._hasIntersection(points, newPoint, isFinish);
    var rslt2 = false;

    var fMarker = this.getFirst();
    if (fMarker && !fMarker._hasFirstIcon()) {
      // code was dublicated to check intersection from both sides
      // (the main idea to reverse array of points and check intersection again)

      points = this.getPointsForIntersection().reverse();
      rslt2 = this._hasIntersection(points, newPoint, isFinish);
    }

    map.edgesIntersected(rslt1 || rslt2);
    var edgesIntersected = map.edgesIntersected();
    return edgesIntersected;
  },
  hasIntersectionWithHole: function hasIntersectionWithHole(lArray, hole) {

    if (this._map.options.allowIntersection) {
      return false;
    }

    var newPoint = this._map.latLngToLayerPoint(lArray[0]);
    var lastPoint = this._map.latLngToLayerPoint(lArray[1]);

    var points = this.getPointsForIntersection(hole);

    var rslt1 = this._hasIntersectionWithHole(points, newPoint, lastPoint);

    // code was dublicated to check intersection from both sides
    // (the main idea to reverse array of points and check intersection again)

    points = this.getPointsForIntersection(hole).reverse();
    lastPoint = this._map.latLngToLayerPoint(lArray[2]);
    var rslt2 = this._hasIntersectionWithHole(points, newPoint, lastPoint);

    this._map.edgesIntersected(rslt1 || rslt2);
    var edgesIntersected = this._map.edgesIntersected();

    return edgesIntersected;
  },
  _tooFewPointsForIntersection: function _tooFewPointsForIntersection(extraPoints) {
    var points = this._originalPoints,
        len = points ? points.length : 0;
    // Increment length by extraPoints if present
    len += extraPoints || 0;

    return !this._originalPoints || len <= 3;
  },
  _lineHoleSegmentsIntersectsRange: function _lineHoleSegmentsIntersectsRange(p, p1) {
    var points = this._originalPoints,
        p2,
        p3;

    for (var j = points.length - 1; j > 0; j--) {
      p2 = points[j - 1];
      p3 = points[j];

      if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
        return true;
      }
    }

    return false;
  },
  _lineSegmentsIntersectsRange: function _lineSegmentsIntersectsRange(p, p1, maxIndex, isFinish) {
    var points = this._originalPoints,
        p2,
        p3;

    var min = isFinish ? 1 : 0;
    // Check all previous line segments (beside the immediately previous) for intersections
    for (var j = maxIndex; j > min; j--) {
      p2 = points[j - 1];
      p3 = points[j];

      if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
        return true;
      }
    }

    return false;
  },
  _isMarkerInPolygon: function _isMarkerInPolygon(marker) {
    var j = 0;

    var layers = this.getLayers();
    var sides = layers.length;

    var x = marker.lng;
    var y = marker.lat;

    var inPoly = false;

    for (var i = 0; i < sides; i++) {
      j++;
      if (j == sides) {
        j = 0;
      }
      var point1 = layers[i].getLatLng();
      var point2 = layers[j].getLatLng();
      if (point1.lat < y && point2.lat >= y || point2.lat < y && point1.lat >= y) {
        if (point1.lng + (y - point1.lat) / (point2.lat - point1.lat) * (point2.lng - point1.lng) < x) {
          inPoly = !inPoly;
        }
      }
    }

    return inPoly;
  }
});
module.exports = exports['default'];

},{"../draw/dashed-line":2,"../edit/line":6,"../edit/marker":8,"../extended/BaseMarkerGroup":10,"../marker-icons":22,"../utils/sortByPosition":28}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extendedTooltip = require('../extended/Tooltip');

var _extendedTooltip2 = _interopRequireDefault(_extendedTooltip);

var _markerIcons = require('../marker-icons');

var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (userAgent.indexOf("ipad") !== -1 || userAgent.indexOf("iphone") !== -1) {
  size = 2;
}

var tooltip;
var dragend = false;
var _markerToDeleteGroup = null;

exports['default'] = L.Marker.extend({
  _draggable: undefined, // an instance of L.Draggable
  _oldLatLngState: undefined,
  initialize: function initialize(group, latlng) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    options = $.extend({
      icon: _markerIcons.icon,
      draggable: false
    }, options);

    L.Marker.prototype.initialize.call(this, latlng, options);

    this._mGroup = group;

    this._isFirst = group.getLayers().length === 0;
  },
  removeGroup: function removeGroup() {
    if (this._mGroup._isHole) {
      this._mGroup.removeHole();
    } else {
      this._mGroup.remove();
    }
  },
  remove: function remove() {
    if (this._map) {
      this._mGroup.removeSelected();
    }
  },
  removeHole: function removeHole() {
    // deprecated
    this.removeGroup();
  },
  next: function next() {
    var next = this._next._next;
    if (!this._next.isMiddle()) {
      next = this._next;
    }
    return next;
  },
  prev: function prev() {
    var prev = this._prev._prev;
    if (!this._prev.isMiddle()) {
      prev = this._prev;
    }
    return prev;
  },
  changePrevNextPos: function changePrevNextPos() {
    if (this._prev.isMiddle()) {

      var prevLatLng = this._mGroup._getMiddleLatLng(this.prev(), this);
      var nextLatLng = this._mGroup._getMiddleLatLng(this, this.next());

      this._prev.setLatLng(prevLatLng);
      this._next.setLatLng(nextLatLng);
    }
  },
  /**
   * change events for marker (example: hole)
   */
  resetEvents: function resetEvents(callback) {
    if (callback) {
      callback.call(this);
    }
  },
  _posHash: function _posHash() {
    return this._prev.position + '_' + this.position + '_' + this._next.position;
  },
  _resetIcon: function _resetIcon(_icon) {
    if (this._hasFirstIcon()) {
      return;
    }
    var ic = _icon || _markerIcons.icon;

    this.setIcon(ic);
    this.prev().setIcon(ic);
    this.next().setIcon(ic);
  },
  _setHoverIcon: function _setHoverIcon(_hIcon) {
    if (this._hasFirstIcon()) {
      return;
    }
    this.setIcon(_hIcon || _markerIcons.hoverIcon);
  },
  _addIconClass: function _addIconClass(className) {
    L.DomUtil.addClass(this._icon, className);
  },
  _removeIconClass: function _removeIconClass(className) {
    L.DomUtil.removeClass(this._icon, className);
  },
  _setIntersectionIcon: function _setIntersectionIcon() {
    var iconClass = _markerIcons.intersectionIcon.options.className;
    var className = 'm-editor-div-icon';
    this._removeIconClass(className);
    this._addIconClass(iconClass);

    this._prevIntersected = this.prev();
    this._prevIntersected._removeIconClass(className);
    this._prevIntersected._addIconClass(iconClass);

    this._nextIntersected = this.next();
    this._nextIntersected._removeIconClass(className);
    this._nextIntersected._addIconClass(iconClass);
  },
  _setFirstIcon: function _setFirstIcon() {
    this._isFirst = true;
    this.setIcon(_markerIcons.firstIcon);
  },
  _hasFirstIcon: function _hasFirstIcon() {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-div-icon-first');
  },
  _setMiddleIcon: function _setMiddleIcon() {
    this.setIcon(_markerIcons.middleIcon);
  },
  isMiddle: function isMiddle() {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-middle-div-icon') && !L.DomUtil.hasClass(this._icon, 'leaflet-drag-target');
  },
  _setDragIcon: function _setDragIcon() {
    this._removeIconClass('m-editor-div-icon');
    this.setIcon(_markerIcons.dragIcon);
  },
  isPlain: function isPlain() {
    return L.DomUtil.hasClass(this._icon, 'm-editor-div-icon') || L.DomUtil.hasClass(this._icon, 'm-editor-intersection-div-icon');
  },
  _onceClick: function _onceClick() {
    var _this = this;

    if (this._isFirst) {
      this.once('click', function (e) {
        if (!_this._hasFirstIcon()) {
          return;
        }
        var map = _this._map;
        var mGroup = _this._mGroup;

        if (mGroup._markers.length < 3) {
          _this._onceClick();
          return;
        }

        var latlng = e.target._latlng;
        _this._map._storedLayerPoint = e.target;

        var hasIntersection = mGroup.hasIntersection(latlng);

        if (hasIntersection) {
          //map._showIntersectionError();
          _this._onceClick(); // bind 'once' again until has intersection
        } else {
            _this._isFirst = false;
            _this.setIcon(_markerIcons.icon);
            //mGroup.setSelected(this);
            map.fire('editor:__join_path', { mGroup: mGroup });
          }
      });
    }
  },
  _detectGroupDelete: function _detectGroupDelete() {
    var map = this._map;

    var selectedMGroup = map.getSelectedMGroup();
    if (this._mGroup._isHole || !this.isPlain() || selectedMGroup && selectedMGroup.hasFirstMarker()) {
      return false;
    }

    if (!this.isSelectedInGroup()) {
      _markerToDeleteGroup = null;
      return false;
    }

    if (_markerToDeleteGroup && this._leaflet_id === _markerToDeleteGroup._leaflet_id) {
      if (this._latlng.lat !== _markerToDeleteGroup._latlng.lat || this._latlng.lng !== _markerToDeleteGroup._latlng.lng) {
        return false;
      }
    }

    if (map.options.notifyClickMarkerDeletePolygon) {
      if (selectedMGroup && !selectedMGroup._isHole) {

        /* todo: refactoring */
        var plainMarkersLen = selectedMGroup.getLayers().filter(function (item) {
          return $(item._icon).hasClass('m-editor-div-icon');
        }).length;

        if (plainMarkersLen === 3) {
          if (_markerToDeleteGroup !== this) {
            _markerToDeleteGroup = this;
            return true;
          } else {
            _markerToDeleteGroup = null;
          }
        }
      }
    }
    return false;
  },
  isAcceptedToDelete: function isAcceptedToDelete() {
    return _markerToDeleteGroup === this && this.isSelectedInGroup();
  },
  _bindCommonEvents: function _bindCommonEvents() {
    var _this2 = this;

    this.on('click', function (e) {
      var map = _this2._map;

      if (_this2._detectGroupDelete()) {
        map.msgHelper.msg(map.options.text.acceptDeletion, 'error', _this2);
        return;
      }

      _this2._map._storedLayerPoint = e.target;

      var mGroup = _this2._mGroup;

      if (mGroup.hasFirstMarker() && _this2 !== mGroup.getFirst()) {
        return;
      }

      if (_this2._hasFirstIcon() && _this2._mGroup.hasIntersection(_this2.getLatLng(), true)) {
        map.edgesIntersected(false);
        return;
      }

      mGroup.setSelected(_this2);
      if (_this2._hasFirstIcon()) {
        return;
      }

      if (mGroup.getFirst()._hasFirstIcon()) {
        return;
      }

      if (!_this2.isSelectedInGroup()) {
        mGroup.select();

        if (_this2.isMiddle()) {
          map.msgHelper.msg(map.options.text.clickToAddNewEdges, null, _this2);
        } else {
          map.msgHelper.msg(map.options.text.clickToRemoveAllSelectedEdges, null, _this2);
        }

        return;
      }

      if (_this2.isMiddle()) {
        //add edge
        mGroup.setMiddleMarkers(_this2.position);
        _this2._resetIcon(_markerIcons.icon);
        mGroup.select();
        map.msgHelper.msg(map.options.text.clickToRemoveAllSelectedEdges, null, _this2);
        _markerToDeleteGroup = null;
      } else {
        //remove edge
        if (!mGroup.getFirst()._hasFirstIcon() && !dragend) {
          map.msgHelper.hide();

          var rsltIntersection = _this2._detectIntersection({ target: { _latlng: mGroup._getMiddleLatLng(_this2.prev(), _this2.next()) } });

          if (rsltIntersection) {
            _this2.resetStyle();
            map._showIntersectionError(map.options.text.deletePointIntersection);
            _this2._previewErrorLine();
            return;
          }

          var oldLatLng = _this2.getLatLng();

          var nextMarker = _this2.next();
          mGroup.removeMarker(_this2);

          if (!mGroup.isEmpty()) {
            var newLatLng = nextMarker._prev.getLatLng();

            if (newLatLng.lat === oldLatLng.lat && newLatLng.lng === oldLatLng.lng) {
              map.msgHelper.msg(map.options.text.clickToAddNewEdges, null, nextMarker._prev);
            }

            mGroup.setSelected(nextMarker);
          } else {
            if (mGroup._isHole) {
              map.fire('editor:polygon:hole_deleted');
            } else {
              map.fire('editor:polygon:deleted');
            }
            map.msgHelper.hide();
          }
          mGroup.select();
        }
      }
    });

    this.on('mouseover', function () {
      var map = _this2._map;
      if (_this2._mGroup.getFirst()._hasFirstIcon()) {
        if (_this2._mGroup.getLayers().length > 2) {
          if (_this2._hasFirstIcon()) {
            map.fire('editor:first_marker_mouseover', { marker: _this2 });
          } else if (_this2 === _this2._mGroup._lastMarker) {
            map.fire('editor:last_marker_dblclick_mouseover', { marker: _this2 });
          }
        }
      } else {
        if (_this2.isSelectedInGroup()) {
          if (_this2.isMiddle()) {
            map.fire('editor:selected_middle_marker_mouseover', { marker: _this2 });
          } else {
            map.fire('editor:selected_marker_mouseover', { marker: _this2 });
          }
        } else {
          map.fire('editor:not_selected_marker_mouseover', { marker: _this2 });
        }
      }
      if (_this2.isAcceptedToDelete()) {
        map.msgHelper.msg(map.options.text.acceptDeletion, 'error', _this2);
      }
    });
    this.on('mouseout', function () {
      _this2._map.fire('editor:marker_mouseout');
    });

    this._onceClick();

    this.on('dblclick', function () {
      var mGroup = _this2._mGroup;
      if (mGroup && mGroup.getFirst() && mGroup.getFirst()._hasFirstIcon()) {
        if (_this2 === mGroup._lastMarker) {
          mGroup.getFirst().fire('click');
          //this._map.fire('editor:__join_path', {marker: this});
        }
      }
    });

    this.on('drag', function (e) {
      var marker = e.target;

      marker.changePrevNextPos();

      var map = _this2._map;
      map._convertToEdit(map.getEMarkersGroup());

      _this2._setDragIcon();

      map.fire('editor:drag_marker', { marker: _this2 });
    });

    this.on('dragend', function () {

      _this2._mGroup.select();
      _this2._map.fire('editor:dragend_marker', { marker: _this2 });

      dragend = true;
      setTimeout(function () {
        dragend = false;
      }, 200);

      _this2._map.fire('editor:selected_marker_mouseover', { marker: _this2 });
    });
  },
  _isInsideHole: function _isInsideHole() {
    var map = this._map;
    var holes = map.getEHMarkersGroup().getLayers();
    for (var i = 0; i < holes.length; i++) {
      var hole = holes[i];
      if (this._mGroup !== hole) {
        if (hole._isMarkerInPolygon(this.getLatLng())) {
          return true;
        }
      }
    }
    return false;
  },
  _isOutsideOfPolygon: function _isOutsideOfPolygon(polygon) {
    return !polygon._isMarkerInPolygon(this.getLatLng());
  },
  _detectIntersection: function _detectIntersection(e) {
    var map = this._map;

    if (map.options.allowIntersection) {
      return;
    }

    var latlng = e === undefined ? this.getLatLng() : e.target._latlng;
    var isOutsideOfPolygon = false;
    var isInsideOfHole = false;
    if (this._mGroup._isHole) {
      isOutsideOfPolygon = this._isOutsideOfPolygon(map.getEMarkersGroup());
      isInsideOfHole = this._isInsideHole();
    } else {
      isInsideOfHole = this._isInsideHole();
    }

    var rslt = isInsideOfHole || isOutsideOfPolygon || this._mGroup.hasIntersection(latlng) || this._detectIntersectionWithHoles(e);

    map.edgesIntersected(rslt);
    if (rslt) {
      this._map._showIntersectionError();
    }

    return map.edgesIntersected();
  },
  _detectIntersectionWithHoles: function _detectIntersectionWithHoles(e) {
    var _this3 = this;

    var map = this._map,
        hasIntersection = false,
        hole,
        latlng = e === undefined ? this.getLatLng() : e.target._latlng;
    var holes = map.getEHMarkersGroup().getLayers();
    var eMarkersGroup = map.getEMarkersGroup();
    var prevPoint = this.prev();
    var nextPoint = this.next();

    if (prevPoint == null && nextPoint == null) {
      return;
    }

    var secondPoint = prevPoint.getLatLng();
    var lastPoint = nextPoint.getLatLng();
    var layers,
        tmpArray = [];

    if (this._mGroup._isHole) {
      for (var i = 0; i < holes.length; i++) {
        hole = holes[i];
        if (hole !== this._mGroup) {
          hasIntersection = this._mGroup.hasIntersectionWithHole([latlng, secondPoint, lastPoint], hole);
          if (hasIntersection) {
            return hasIntersection;
          }
          // check that hole is inside of other hole
          tmpArray = [];
          layers = hole.getLayers();

          layers._each(function (layer) {
            if (_this3._mGroup._isMarkerInPolygon(layer.getLatLng())) {
              tmpArray.push("");
            }
          });

          if (tmpArray.length === layers.length) {
            return true;
          }
        }
      }
      return this._mGroup.hasIntersectionWithHole([latlng, secondPoint, lastPoint], eMarkersGroup);
    } else {
      for (var i = 0; i < holes.length; i++) {
        hasIntersection = this._mGroup.hasIntersectionWithHole([latlng, secondPoint, lastPoint], holes[i]);

        // check that hole is outside of polygon
        if (hasIntersection) {
          return hasIntersection;
        }

        tmpArray = [];
        layers = holes[i].getLayers();
        for (var j = 0; j < layers.length; j++) {
          if (layers[j]._isOutsideOfPolygon(eMarkersGroup)) {
            tmpArray.push("");
          }
        }
        if (tmpArray.length === layers.length) {
          return true;
        }
      }
    }
    return hasIntersection;
  },
  onAdd: function onAdd(map) {
    var _this4 = this;

    L.Marker.prototype.onAdd.call(this, map);

    this.on('dragstart', function (e) {
      _this4._storedLayerPoint = null; //reset point

      _this4._mGroup.setSelected(_this4);
      _this4._oldLatLngState = e.target._latlng;

      if (_this4._prev.isPlain()) {
        _this4._mGroup.setMiddleMarkers(_this4.position);
      }
    }).on('drag', function (e) {
      _this4._onDrag(e);
    }).on('dragend', function (e) {
      _this4._onDragEnd(e);
    });

    this.on('mousedown', function () {
      if (!_this4.dragging._enabled) {
        return false;
      }
    });

    this._bindCommonEvents(map);
  },
  _onDrag: function _onDrag(e) {
    this._detectIntersection(e);
  },
  _onDragEnd: function _onDragEnd(e) {
    var rslt = this._detectIntersection(e);
    if (rslt && !this._map.options.allowCorrectIntersection) {
      this._restoreOldPosition();
    }
  },
  //todo: continue with option 'allowCorrectIntersection'
  _restoreOldPosition: function _restoreOldPosition() {
    var map = this._map;
    if (map.edgesIntersected()) {
      var stateLatLng = this._oldLatLngState;
      this.setLatLng(L.latLng(stateLatLng.lat, stateLatLng.lng));

      this.changePrevNextPos();
      map._convertToEdit(map.getEMarkersGroup());
      //
      map.fire('editor:drag_marker', { marker: this });

      this._oldLatLngState = undefined;
      this.resetStyle();
    } else {
      this._oldLatLngState = this.getLatLng();
    }
  },
  _animateZoom: function _animateZoom(opt) {
    if (this._map) {
      var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

      this._setPos(pos);
    }
  },
  resetIcon: function resetIcon() {
    this._removeIconClass('m-editor-intersection-div-icon');
    this._removeIconClass('m-editor-div-icon-drag');
  },
  unSelectIconInGroup: function unSelectIconInGroup() {
    this._removeIconClass('group-selected');
  },
  _selectIconInGroup: function _selectIconInGroup() {
    if (!this.isMiddle()) {
      this._addIconClass('m-editor-div-icon');
    }
    this._addIconClass('group-selected');
  },
  selectIconInGroup: function selectIconInGroup() {
    if (this._prev) {
      this._prev._selectIconInGroup();
    }
    this._selectIconInGroup();
    if (this._next) {
      this._next._selectIconInGroup();
    }
  },
  isSelectedInGroup: function isSelectedInGroup() {
    return L.DomUtil.hasClass(this._icon, 'group-selected');
  },
  onRemove: function onRemove(map) {
    this.off('mouseout');

    L.Marker.prototype.onRemove.call(this, map);
  },
  _errorLines: [],
  _prevErrorLine: null,
  _nextErrorLine: null,
  _drawErrorLines: function _drawErrorLines() {
    var map = this._map;
    this._clearErrorLines();

    var currPoint = this.getLatLng();
    var prevPoints = [this.prev().getLatLng(), currPoint];
    var nextPoints = [this.next().getLatLng(), currPoint];

    var errorLineStyle = this._map.options.errorLineStyle;

    this._prevErrorLine = new L.Polyline(prevPoints, errorLineStyle);
    this._nextErrorLine = new L.Polyline(nextPoints, errorLineStyle);

    this._prevErrorLine.addTo(map);
    this._nextErrorLine.addTo(map);

    this._errorLines.push(this._prevErrorLine);
    this._errorLines.push(this._nextErrorLine);
  },
  _clearErrorLines: function _clearErrorLines() {
    var _this5 = this;

    this._errorLines._each(function (line) {
      return _this5._map.removeLayer(line);
    });
  },
  setIntersectedStyle: function setIntersectedStyle() {
    this._setIntersectionIcon();

    //show intersected lines
    this._drawErrorLines();
  },
  resetStyle: function resetStyle() {
    this.resetIcon();
    this.selectIconInGroup();

    if (this._prevIntersected) {
      this._prevIntersected.resetIcon();
      this._prevIntersected.selectIconInGroup();
    }

    if (this._nextIntersected) {
      this._nextIntersected.resetIcon();
      this._nextIntersected.selectIconInGroup();
    }

    this._prevIntersected = null;
    this._nextIntersected = null;

    //hide intersected lines
    this._clearErrorLines();
  },
  _previewErLine: null,
  _pt: null,
  _previewErrorLine: function _previewErrorLine() {
    var _this6 = this;

    if (this._previewErLine) {
      this._map.removeLayer(this._previewErLine);
    }

    if (this._pt) {
      clearTimeout(this._pt);
    }

    var points = [this.next().getLatLng(), this.prev().getLatLng()];

    var errorLineStyle = this._map.options.previewErrorLineStyle;

    this._previewErLine = new L.Polyline(points, errorLineStyle);

    this._previewErLine.addTo(this._map);

    this._pt = setTimeout(function () {
      _this6._map.removeLayer(_this6._previewErLine);
    }, 900);
  }
});
module.exports = exports['default'];

},{"../extended/Tooltip":16,"../marker-icons":22}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extendedPolygon = require('../extended/Polygon');

var _extendedPolygon2 = _interopRequireDefault(_extendedPolygon);

var _extendedTooltip = require('../extended/Tooltip');

var _extendedTooltip2 = _interopRequireDefault(_extendedTooltip);

exports['default'] = L.EditPloygon = _extendedPolygon2['default'].extend({
  _oldE: undefined, // to reuse event object after "bad hole" removing to build new hole
  _k: 1, // to decrease 'diff' value which helps build a hole
  _holes: [],
  initialize: function initialize(latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    this._initWithHoles(latlngs);

    this.options.className = "leaflet-clickable polygon";
  },
  _update: function _update(e) {
    var marker = e.marker;

    if (marker._mGroup._isHole) {
      var markers = marker._mGroup._markers;
      markers = markers.filter(function (marker) {
        return !marker.isMiddle();
      });
      this._holes[marker._mGroup.position] = markers.map(function (marker) {
        return marker.getLatLng();
      });
    }
    this.redraw();
  },
  _removeHole: function _removeHole(e) {
    var holePosition = e.marker._mGroup.position;
    this._holes.splice(holePosition, 1);

    this._map.getEHMarkersGroup().removeLayer(e.marker._mGroup._leaflet_id);
    this._map.getEHMarkersGroup().repos(e.marker._mGroup.position);

    this.redraw();
  },
  onAdd: function onAdd(map) {
    var _this = this;

    L.Polyline.prototype.onAdd.call(this, map);

    map.off('editor:add_marker');
    map.on('editor:add_marker', function (e) {
      return _this._update(e);
    });
    map.off('editor:drag_marker');
    map.on('editor:drag_marker', function (e) {
      return _this._update(e);
    });
    map.off('editor:delete_marker');
    map.on('editor:delete_marker', function (e) {
      return _this._update(e);
    });
    map.off('editor:delete_hole');
    map.on('editor:delete_hole', function (e) {
      return _this._removeHole(e);
    });

    this.on('mousemove', function (e) {
      map.fire('editor:edit_polygon_mousemove', { layerPoint: e.layerPoint });
    });

    this.on('mouseout', function () {
      return map.fire('editor:edit_polygon_mouseout');
    });
  },
  onRemove: function onRemove(map) {
    this.off('mousemove');
    this.off('mouseout');

    map.off('editor:edit_polygon_mouseover');
    map.off('editor:edit_polygon_mouseout');

    L.Polyline.prototype.onRemove.call(this, map);
  },
  addHole: function addHole(hole) {
    this._holes = this._holes || [];
    this._holes.push(hole);

    this.redraw();
  },
  hasHoles: function hasHoles() {
    return this._holes.length > 0;
  },
  _resetLastHole: function _resetLastHole() {
    var map = this._map;

    map.getSelectedMarker().removeHole();

    if (this._k > 0.001) {
      this._addHole(this._oldE, 0.5);
    }
  },
  checkHoleIntersection: function checkHoleIntersection() {
    var map = this._map;

    if (map.options.allowIntersection || map.getEMarkersGroup().isEmpty()) {
      return;
    }

    var eHMarkersGroupLayers = this._map.getEHMarkersGroup().getLayers();
    var lastHole = eHMarkersGroupLayers[eHMarkersGroupLayers.length - 1];
    var lastHoleLayers = eHMarkersGroupLayers[eHMarkersGroupLayers.length - 1].getLayers();

    for (var i = 0; i < lastHoleLayers.length; i++) {
      var layer = lastHoleLayers[i];

      if (layer._detectIntersectionWithHoles()) {
        this._resetLastHole();
        break;
      }

      if (layer._isOutsideOfPolygon(this._map.getEMarkersGroup())) {
        this._resetLastHole();
        break;
      }

      for (var j = 0; j < eHMarkersGroupLayers.length; j++) {
        var eHoleMarkerGroupLayer = eHMarkersGroupLayers[j];

        if (lastHole !== eHoleMarkerGroupLayer && eHoleMarkerGroupLayer._isMarkerInPolygon(layer.getLatLng())) {
          this._resetLastHole();
          break;
        }
      }
    }
  }
});
module.exports = exports['default'];

},{"../extended/Polygon":14,"../extended/Tooltip":16}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _editMarker = require('../edit/marker');

var _editMarker2 = _interopRequireDefault(_editMarker);

var _utilsSortByPosition = require('../utils/sortByPosition');

var _utilsSortByPosition2 = _interopRequireDefault(_utilsSortByPosition);

exports['default'] = L.Class.extend({
  includes: L.Mixin.Events,

  _selected: false,
  _lastMarker: undefined,
  _firstMarker: undefined,
  _positionHash: undefined,
  _lastPosition: 0,
  _markers: [],
  onAdd: function onAdd(map) {
    this._map = map;
    this.clearLayers();
    //L.LayerGroup.prototype.onAdd.call(this, map);
  },
  onRemove: function onRemove(map) {
    //L.LayerGroup.prototype.onRemove.call(this, map);
    this.clearLayers();
  },
  clearLayers: function clearLayers() {
    var _this = this;

    this._markers.forEach(function (marker) {
      _this._map.removeLayer(marker);
    });
    this._markers = [];
  },
  addTo: function addTo(map) {
    map.addLayer(this);
  },
  addLayer: function addLayer(marker) {
    this._map.addLayer(marker);
    this._markers.push(marker);
    if (marker.position != null) {
      this._markers.move(this._markers.length - 1, marker.position);
    }
    marker.position = marker.position != null ? marker.position : this._markers.length - 1;
  },
  remove: function remove() {
    var _this2 = this;

    var markers = this.getLayers();
    markers._each(function (marker) {
      while (_this2.getLayers().length) {
        _this2.removeMarker(marker);
      }
    });

    var map = this._map;

    if (this._isHole) {
      map.fire('editor:polygon:hole_deleted');
    } else {
      map.getVGroup().removeLayer(map._getSelectedVLayer());
      map.fire('editor:polygon:deleted');
    }
  },
  removeLayer: function removeLayer(marker) {
    var position = marker.position;
    this._map.removeLayer(marker);
    this._markers.splice(position, 1);
  },
  getLayers: function getLayers() {
    return this._markers;
  },
  eachLayer: function eachLayer(cb) {
    this._markers.forEach(cb);
  },
  markerAt: function markerAt(position) {
    var rslt = this._markers[position];

    if (position < 0) {
      return this.firstMarker();
    }

    if (rslt === undefined) {
      rslt = this.lastMarker();
    }

    return rslt;
  },
  firstMarker: function firstMarker() {
    return this._markers[0];
  },
  lastMarker: function lastMarker() {
    var markers = this._markers;
    return markers[markers.length - 1];
  },
  removeMarker: function removeMarker(marker) {
    var b = !marker.isMiddle();

    var prevMarker = marker._prev;
    var nextMarker = marker._next;
    var nextnextMarker = marker._next._next;
    this.removeMarkerAt(marker.position);
    this.removeMarkerAt(prevMarker.position);
    this.removeMarkerAt(nextMarker.position);

    var map = this._map;

    if (this.getLayers().length > 0) {
      this.setMiddleMarker(nextnextMarker.position);

      if (b) {
        map.fire('editor:delete_marker', { marker: marker });
      }
    } else {
      if (this._isHole) {
        map.removeLayer(this);
        map.fire('editor:delete_hole', { marker: marker });
      } else {
        map.removePolygon(map.getEPolygon());

        map.fire('editor:delete_polygon');
      }
      map.fire('editor:marker_group_clear');
    }
  },
  removeMarkerAt: function removeMarkerAt(position) {
    if (this.getLayers().length === 0) {
      return;
    }

    var marker;
    if (typeof position === 'number') {
      marker = this.markerAt(position);
    } else {
      return;
    }

    var _changePos = false;
    var markers = this._markers;
    markers.forEach(function (_marker) {
      if (_changePos) {
        _marker.position = _marker.position === 0 ? 0 : _marker.position - 1;
      }
      if (_marker === marker) {
        marker._prev._next = marker._next;
        marker._next._prev = marker._prev;
        _changePos = true;
      }
    });

    this.removeLayer(marker);

    if (markers.length < 5) {
      this.clear();
      if (!this._isHole) {
        var map = this._map;
        map.getEPolygon().clear();
        map.getVGroup().removeLayer(map._getSelectedVLayer());
      }
    }
  },
  addMarker: function addMarker(latlng, position, options) {
    // 1. recalculate positions
    if (typeof latlng === 'number') {
      position = this.markerAt(latlng).position;
      this._recalcPositions(position);

      var prevMarker = position - 1 < 0 ? this.lastMarker() : this.markerAt(position - 1);
      var nextMarker = this.markerAt(position == -1 ? 1 : position);
      latlng = this._getMiddleLatLng(prevMarker, nextMarker);
    }

    if (this.getLayers().length === 0) {
      options.draggable = false;
    }

    if (this.getFirst()) {
      options.draggable = !this.getFirst()._hasFirstIcon();
    }

    var marker = new _editMarker2['default'](this, latlng, options);
    if (!this._firstMarker) {
      this._firstMarker = marker;
      this._lastMarker = marker;
    }

    if (position !== undefined) {
      marker.position = position;
    }

    //if (this.getFirst()._hasFirstIcon()) {
    //  marker.dragging.disable();
    //} else {
    //  marker.dragging.enable();
    //}

    this.addLayer(marker);

    {
      marker.position = marker.position !== undefined ? marker.position : this._lastPosition++;
      marker._prev = this._lastMarker;
      this._firstMarker._prev = marker;
      if (marker._prev) {
        this._lastMarker._next = marker;
        marker._next = this._firstMarker;
      }
    }

    if (position === undefined) {
      this._lastMarker = marker;
    }

    // 2. recalculate relations
    if (position !== undefined) {
      this._recalcRelations(marker);
    }
    // 3. trigger event
    if (!marker.isMiddle()) {
      this._map.fire('editor:add_marker', { marker: marker });
    }

    return marker;
  },
  clear: function clear() {
    var _this3 = this;

    var ids = this._ids();

    this.clearLayers();

    ids.forEach(function (id) {
      _this3._deleteEvents(id);
    });

    this._lastPosition = 0;

    this._firstMarker = undefined;
  },
  _deleteEvents: function _deleteEvents(id) {
    delete this._map._leaflet_events.viewreset_idx[id];
    delete this._map._leaflet_events.zoomanim_idx[id];
  },
  _getMiddleLatLng: function _getMiddleLatLng(marker1, marker2) {
    var map = this._map,
        p1 = map.project(marker1.getLatLng()),
        p2 = map.project(marker2.getLatLng());

    return map.unproject(p1._add(p2)._divideBy(2));
  },
  _recalcPositions: function _recalcPositions(position) {
    var _this4 = this;

    var markers = this._markers;

    var changePos = false;
    markers.forEach(function (marker, _position) {
      if (position === _position) {
        changePos = true;
      }
      if (changePos) {
        _this4._markers[_position].position += 1;
      }
    });
  },
  _recalcRelations: function _recalcRelations() {
    var _this5 = this;

    var markers = this._markers;

    markers.forEach(function (marker, position) {

      marker._prev = _this5.markerAt(position - 1);
      marker._next = _this5.markerAt(position + 1);

      // first
      if (position === 0) {
        marker._prev = _this5.lastMarker();
        marker._next = _this5.markerAt(1);
      }

      // last
      if (position === markers.length - 1) {
        marker._prev = _this5.markerAt(position - 1);
        marker._next = _this5.markerAt(0);
      }
    });
  },
  _ids: function _ids() {
    var rslt = [];

    for (var id in this._layers) {
      rslt.push(id);
    }

    rslt.sort(function (a, b) {
      return a - b;
    });

    return rslt;
  },
  select: function select() {
    if (this.isEmpty()) {
      this._map._selectedMGroup = null;
      return;
    }

    var map = this._map;
    if (this._isHole) {
      map.getEHMarkersGroup().resetSelection();
      map.getEMarkersGroup().resetSelection();
      map.getEHMarkersGroup().setLastHole(this);
    } else {
      map.getEHMarkersGroup().resetSelection();
      map.getEHMarkersGroup().resetLastHole();
    }

    this.getLayers()._each(function (marker) {
      marker.selectIconInGroup();
    });
    this._selected = true;

    this._map._selectedMGroup = this;
    this._map.fire('editor:marker_group_select');
  },
  isEmpty: function isEmpty() {
    return this.getLayers().length === 0;
  },
  resetSelection: function resetSelection() {
    this.getLayers()._each(function (marker) {
      marker.unSelectIconInGroup();
    });
    this._selected = false;
  }
});
module.exports = exports['default'];

},{"../edit/marker":8,"../utils/sortByPosition":28}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = L.Control.extend({
  options: {
    position: 'topleft',
    btns: [
      //{'title': 'remove', 'className': 'fa fa-trash'}
    ],
    eventName: "controlAdded",
    pressEventName: "btnPressed"
  },
  _btn: null,
  stopEvent: L.DomEvent.stopPropagation,
  initialize: function initialize(options) {
    L.Util.setOptions(this, options);
  },
  _titleContainer: null,
  onAdd: function onAdd(map) {
    var _this = this;

    map.on(this.options.pressEventName, function () {
      if (_this._btn && !L.DomUtil.hasClass(_this._btn, 'disabled')) {
        _this._onPressBtn();
      }
    });

    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-editor-buttons');

    map._controlContainer.appendChild(container);

    var options = this.options;

    var self = this;
    setTimeout(function () {
      self._setBtn(options.btns, container);
      if (options.eventName) {
        map.fire(options.eventName, { control: self });
      }

      L.DomEvent.addListener(self._btn, 'mouseover', _this._onMouseOver, _this);
      L.DomEvent.addListener(self._btn, 'mouseout', _this._onMouseOut, _this);
    }, 1000);

    map.getBtnControl = function () {
      return _this;
    };

    return container;
  },
  _onPressBtn: function _onPressBtn() {},
  _onMouseOver: function _onMouseOver() {},
  _onMouseOut: function _onMouseOut() {},
  _setBtn: function _setBtn(opts, container) {
    var _this2 = this;

    var _btn;
    opts.forEach(function (btn, index) {
      if (index === opts.length - 1) {
        btn.className += " last";
      }
      //var child = L.DomUtil.create('div', 'leaflet-btn' + (btn.className ? ' ' + btn.className : ''));

      var wrapper = document.createElement('div');
      container.appendChild(wrapper);
      var link = L.DomUtil.create('a', 'leaflet-btn', wrapper);
      link.href = '#';

      var stop = L.DomEvent.stopPropagation;
      L.DomEvent.on(link, 'click', stop).on(link, 'mousedown', stop).on(link, 'dblclick', stop).on(link, 'click', L.DomEvent.preventDefault);

      link.appendChild(L.DomUtil.create('i', 'fa' + (btn.className ? ' ' + btn.className : '')));

      var callback = (function (map, pressEventName) {
        return function () {
          map.fire(pressEventName);
        };
      })(_this2._map, btn.pressEventName || _this2.options.pressEventName);

      L.DomEvent.on(link, 'click', L.DomEvent.stopPropagation).on(link, 'click', callback);

      _btn = link;
    });
    this._btn = _btn;
  },
  getBtnContainer: function getBtnContainer() {
    return this._map._controlCorners['topleft'];
  },
  getBtnAt: function getBtnAt(pos) {
    return this.getBtnContainer().child[pos];
  },
  disableBtn: function disableBtn(pos) {
    L.DomUtil.addClass(this.getBtnAt(pos), 'disabled');
  },
  enableBtn: function enableBtn(pos) {
    L.DomUtil.removeClass(this.getBtnAt(pos), 'disabled');
  }
});
module.exports = exports["default"];

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BtnControl = require('./BtnControl');

var _BtnControl2 = _interopRequireDefault(_BtnControl);

exports['default'] = _BtnControl2['default'].extend({
  options: {
    eventName: 'loadBtnAdded',
    pressEventName: 'loadBtnPressed'
  },
  onAdd: function onAdd(map) {
    var _this = this;

    var container = _BtnControl2['default'].prototype.onAdd.call(this, map);

    map.on('loadBtnAdded', function () {
      _this._map.on('searchEnabled', _this._collapse, _this);

      _this._renderForm(container);
    });

    L.DomUtil.addClass(container, 'load-json-container');

    return container;
  },
  _onPressBtn: function _onPressBtn() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
    if (this._form.style.display != 'block') {
      this._form.style.display = 'block';
      this._textarea.focus();
      this._map.fire('loadBtnOpened');
    } else {
      this._collapse();
      this._map.fire('loadBtnHidden');
    }
  },
  _collapse: function _collapse() {
    this._form.style.display = 'none';
    this._textarea.value = '';
  },
  _renderForm: function _renderForm(container) {
    var form = this._form = L.DomUtil.create('form');

    var textarea = this._textarea = L.DomUtil.create('textarea');
    textarea.style.width = '200px';
    textarea.style.height = '100px';
    textarea.style.border = '1px solid white';
    textarea.style.padding = '5px';
    textarea.style.borderRadius = '4px';

    L.DomEvent.on(textarea, 'click', this.stopEvent).on(textarea, 'mousedown', this.stopEvent).on(textarea, 'dblclick', this.stopEvent).on(textarea, 'mousewheel', this.stopEvent);

    form.appendChild(textarea);

    var submitBtn = this._submitBtn = L.DomUtil.create('button', 'leaflet-submit-btn load-geojson');
    submitBtn.type = "submit";
    submitBtn.innerHTML = this._map.options.text.submitLoadBtn;

    L.DomEvent.on(submitBtn, 'click', this.stopEvent).on(submitBtn, 'mousedown', this.stopEvent).on(submitBtn, 'click', this._submitForm, this);

    form.appendChild(submitBtn);

    L.DomEvent.on(form, 'submit', L.DomEvent.preventDefault);
    container.appendChild(form);

    this._titleContainer = L.DomUtil.create('div', 'btn-leaflet-msg-container title-hidden');
    this._titleContainer.innerHTML = this._map.options.text.loadJson;
    container.appendChild(this._titleContainer);
  },
  _timeout: null,
  _submitForm: function _submitForm() {
    var _this2 = this;

    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    var json;
    var map = this._map;
    try {
      json = JSON.parse(this._textarea.value);

      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      L.DomUtil.removeClass(this._titleContainer, 'title-error');
      L.DomUtil.addClass(this._titleContainer, 'title-success');

      this._titleContainer.innerHTML = map.options.text.jsonWasLoaded;

      map.createEditPolygon(json);

      this._timeout = setTimeout(function () {
        L.DomUtil.addClass(_this2._titleContainer, 'title-hidden');
      }, 2000);

      this._collapse();
      this._map.fire('loadBtnHidden');
    } catch (e) {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      L.DomUtil.addClass(this._titleContainer, 'title-error');
      L.DomUtil.removeClass(this._titleContainer, 'title-success');

      this._titleContainer.innerHTML = map.options.text.checkJson;

      this._timeout = setTimeout(function () {
        L.DomUtil.addClass(_this2._titleContainer, 'title-hidden');
      }, 2000);
      this._collapse();
      this._map.fire('loadBtnHidden');
      this._map.mode('draw');
    }
  },
  _onMouseOver: function _onMouseOver() {
    if (this._form.style.display === 'block') {
      return;
    }
    L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
    L.DomUtil.removeClass(this._titleContainer, 'title-error');
    L.DomUtil.removeClass(this._titleContainer, 'title-success');
    this._titleContainer.innerHTML = this._map.options.text.loadJson;
  },
  _onMouseOut: function _onMouseOut() {
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
  }
});
module.exports = exports['default'];

},{"./BtnControl":11}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = L.Control.extend({
  options: {
    position: 'msgcenter',
    defaultMsg: null
  },
  initialize: function initialize(options) {
    L.Util.setOptions(this, options);
  },
  _titleContainer: null,
  onAdd: function onAdd(map) {
    var _this = this;

    var corner = L.DomUtil.create('div', 'leaflet-bottom');
    var container = L.DomUtil.create('div', 'leaflet-msg-editor');

    map._controlCorners['msgcenter'] = corner;
    map._controlContainer.appendChild(corner);

    setTimeout(function () {
      _this._setContainer(container, map);
      map.fire('msgHelperAdded', { control: _this });

      _this._changePos();
    }, 1000);

    map.getBtnControl = function () {
      return _this;
    };

    this._bindEvents(map);

    return container;
  },
  _changePos: function _changePos() {
    var controlCorner = this._map._controlCorners['msgcenter'];
    if (controlCorner && controlCorner.children.length) {
      var child = controlCorner.children[0].children[0];

      if (!child) {
        return;
      }

      var width = child.clientWidth;
      if (width) {
        controlCorner.style.left = (this._map._container.clientWidth - width) / 2 + 'px';
      }
    }
  },
  _bindEvents: function _bindEvents() {
    var _this2 = this;

    setTimeout(function () {
      window.addEventListener('resize', function () {
        _this2._changePos();
      });
    }, 1);
  },
  _setContainer: function _setContainer(container) {
    this._titleContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    this._titlePosContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    container.appendChild(this._titleContainer);
    document.body.appendChild(this._titlePosContainer);

    if (this.options.defaultMsg !== null) {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      this._titleContainer.innerHTML = this.options.defaultMsg;
    }
  },
  getOffset: function getOffset(el) {
    var _x = 0;
    var _y = 0;
    if (!this._map.isFullscreen || !this._map.isFullscreen()) {
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft;
        _y += el.offsetTop;
        el = el.offsetParent;
      }
    }
    return { y: _y, x: _x };
  },
  msg: function msg(text, type, object) {
    if (!text || !this._titlePosContainer) {
      return;
    }

    if (object) {
      L.DomUtil.removeClass(this._titlePosContainer, 'title-hidden');
      L.DomUtil.removeClass(this._titlePosContainer, 'title-error');
      L.DomUtil.removeClass(this._titlePosContainer, 'title-success');

      this._titlePosContainer.innerHTML = text;

      var point;

      //var offset = this.getOffset(document.getElementById(this._map._container.getAttribute('id')));
      var offset = this.getOffset(this._map._container);

      if (object instanceof L.Point) {
        point = object;
        point = this._map.layerPointToContainerPoint(point);
      } else {
        point = this._map.latLngToContainerPoint(object.getLatLng());
      }

      point.x += offset.x;
      point.y += offset.y;

      this._titlePosContainer.style.top = point.y - 8 + "px";
      this._titlePosContainer.style.left = point.x + 10 + "px";

      if (type) {
        L.DomUtil.addClass(this._titlePosContainer, 'title-' + type);
      }
    } else {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      L.DomUtil.removeClass(this._titleContainer, 'title-error');
      L.DomUtil.removeClass(this._titleContainer, 'title-success');

      this._titleContainer.innerHTML = text;

      if (type) {
        L.DomUtil.addClass(this._titleContainer, 'title-' + type);
      }
      this._changePos();
    }
  },
  hide: function hide() {
    if (this._titleContainer) {
      L.DomUtil.addClass(this._titleContainer, 'title-hidden');
    }

    if (this._titlePosContainer) {
      L.DomUtil.addClass(this._titlePosContainer, 'title-hidden');
    }
  },
  getBtnContainer: function getBtnContainer() {
    return this._map._controlCorners['msgcenter'];
  },
  getBtnAt: function getBtnAt(pos) {
    return this.getBtnContainer().child[pos];
  },
  disableBtn: function disableBtn(pos) {
    L.DomUtil.addClass(this.getBtnAt(pos), 'disabled');
  },
  enableBtn: function enableBtn(pos) {
    L.DomUtil.removeClass(this.getBtnAt(pos), 'disabled');
  }
});
module.exports = exports['default'];

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = L.Polygon.extend({
  isEmpty: function isEmpty() {
    var latLngs = this.getLatLngs();
    return latLngs === null || latLngs === undefined || latLngs && latLngs.length === 0;
  },
  getHole: function getHole(holeGroupNumber) {
    if (!$.isNumeric(holeGroupNumber)) {
      return;
    }
    return this._holes[holeGroupNumber];
  },
  getHolePoint: function getHolePoint(holeGroupNumber, holeNumber) {
    if (!$.isNumeric(holeGroupNumber) && !$.isNumeric(holeNumber)) {
      return;
    }

    return this._holes[holeGroupNumber][holeNumber];
  },
  getHoles: function getHoles() {
    return this._holes;
  },
  clearHoles: function clearHoles() {
    this._holes = [];
    this.redraw();
  },
  clear: function clear() {
    this.clearHoles();

    if ($.isArray(this._latlngs) && this._latlngs[0] !== undefined) {
      this.setLatLngs([]);
    }
  },
  updateHolePoint: function updateHolePoint(holeGroupNumber, holeNumber, latlng) {
    if ($.isNumeric(holeGroupNumber) && $.isNumeric(holeNumber)) {
      this._holes[holeGroupNumber][holeNumber] = latlng;
    } else if ($.isNumeric(holeGroupNumber) && !$.isNumeric(holeNumber)) {
      this._holes[holeGroupNumber] = latlng;
    } else {
      this._holes = latlng;
    }
    return this;
  },
  setHoles: function setHoles(latlngs) {
    this._holes = latlngs;
  },
  setHolePoint: function setHolePoint(holeGroupNumber, holeNumber, latlng) {
    var layer = this.getLayers()[0];
    if (layer) {
      if ($.isNumeric(holeGroupNumber) && $.isNumeric(holeNumber)) {
        layer._holes[holeGroupNumber][holeNumber] = latlng;
      }
    }
    return this;
  }
});
module.exports = exports["default"];

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = L.Control.extend({
  options: {
    position: 'topleft',
    email: ''
  },

  onAdd: function onAdd(map) {
    this._map = map;
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-search-bar');
    var wrapper = document.createElement('div');
    container.appendChild(wrapper);
    var link = L.DomUtil.create('a', '', wrapper);
    link.href = '#';

    var stop = L.DomEvent.stopPropagation;
    L.DomEvent.on(link, 'click', stop).on(link, 'mousedown', stop).on(link, 'dblclick', stop).on(link, 'click', L.DomEvent.preventDefault).on(link, 'click', this._toggle, this);

    link.appendChild(L.DomUtil.create('i', 'fa fa-search'));

    var form = this._form = document.createElement('form');

    L.DomEvent.on(form, 'mousewheel', stop);
    L.DomEvent.on(form, 'DOMMouseScroll', stop);
    L.DomEvent.on(form, 'MozMousePixelScroll', stop);

    var input = this._input = document.createElement('input');

    L.DomEvent.on(input, 'click', stop).on(input, 'mousedown', stop);

    form.appendChild(input);

    var submitBtn = this._submitBtn = L.DomUtil.create('button', 'leaflet-submit-btn search');
    submitBtn.type = "submit";

    L.DomEvent.on(submitBtn, 'click', stop).on(submitBtn, 'mousedown', stop).on(submitBtn, 'click', this._doSearch, this);

    form.appendChild(submitBtn);

    this._btnTextContainer = L.DomUtil.create('span', 'text');
    this._btnTextContainer.innerHTML = this._map.options.text.submitLoadBtn;
    submitBtn.appendChild(this._btnTextContainer);

    this._spinIcon = L.DomUtil.create('i', 'fa fa-refresh fa-spin');
    submitBtn.appendChild(this._spinIcon);

    L.DomEvent.on(form, 'submit', stop).on(form, 'submit', L.DomEvent.preventDefault);
    container.appendChild(form);

    this._map.on('loadBtnOpened', this._collapse, this);

    L.DomEvent.addListener(container, 'mouseover', this._onMouseOver, this);
    L.DomEvent.addListener(container, 'mouseout', this._onMouseOut, this);

    this._titleContainer = L.DomUtil.create('div', 'btn-leaflet-msg-container title-hidden');
    this._titleContainer.innerHTML = this._map.options.text.searchLocation;
    container.appendChild(this._titleContainer);

    return container;
  },

  _toggle: function _toggle() {
    if (this._form.style.display != 'block') {
      this._form.style.display = 'block';
      this._input.focus();
      this._map.fire('searchEnabled');
    } else {
      this._collapse();
      this._map.fire('searchDisabled');
    }
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
  },

  _collapse: function _collapse() {
    this._form.style.display = 'none';
    this._input.value = '';
  },

  _nominatimCallback: function _nominatimCallback(results) {

    if (this._results && this._results.parentNode) {
      this._results.parentNode.removeChild(this._results);
    }

    var resultsContainer = this._results = document.createElement('div');
    resultsContainer.style.height = '80px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.overflowX = 'hidden';
    resultsContainer.style.backgroundColor = 'white';
    resultsContainer.style.margin = '3px';
    resultsContainer.style.padding = '2px';
    resultsContainer.style.border = '2px grey solid';
    resultsContainer.style.borderRadius = '2px';

    L.DomEvent.on(resultsContainer, 'mousedown', L.DomEvent.stopPropagation);
    L.DomEvent.on(resultsContainer, 'mousewheel', L.DomEvent.stopPropagation);
    L.DomEvent.on(resultsContainer, 'DOMMouseScroll', L.DomEvent.stopPropagation);
    L.DomEvent.on(resultsContainer, 'MozMousePixelScroll', L.DomEvent.stopPropagation);

    var divResults = [];

    for (var i = 0; i < results.length; i++) {
      var div = L.DomUtil.create('div', 'search-results-el');
      div.innerHTML = results[i].display_name;
      div.title = results[i].display_name;
      resultsContainer.appendChild(div);

      var callback = (function (map, result, divEl) {
        return function () {
          for (var j = 0; j < divResults.length; j++) {
            L.DomUtil.removeClass(divResults[j], 'selected');
          }
          L.DomUtil.addClass(divEl, 'selected');

          var bbox = result.boundingbox;
          map.fitBounds(L.latLngBounds([[bbox[0], bbox[2]], [bbox[1], bbox[3]]]));
        };
      })(this._map, results[i], div);

      L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
      L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
      L.DomEvent.on(div, 'MozMousePixelScroll', L.DomEvent.stopPropagation);
      L.DomEvent.on(div, 'DOMMouseScroll', L.DomEvent.stopPropagation).on(div, 'click', callback);

      divResults.push(div);
    }

    this._form.appendChild(resultsContainer);

    if (results.length === 0) {
      this._results.parentNode.removeChild(this._results);
    }
    L.DomUtil.removeClass(this._submitBtn, 'loading');
  },

  _callbackId: 0,

  _doSearch: function _doSearch() {

    L.DomUtil.addClass(this._submitBtn, 'loading');

    var callback = '_l_osmgeocoder_' + this._callbackId++;
    window[callback] = L.Util.bind(this._nominatimCallback, this);
    var queryParams = {
      q: this._input.value,
      format: 'json',
      limit: 10,
      'json_callback': callback
    };
    if (this.options.email) queryParams.email = this.options.email;
    if (this._map.getBounds()) queryParams.viewbox = this._map.getBounds().toBBoxString();
    var url = 'http://nominatim.openstreetmap.org/search' + L.Util.getParamString(queryParams);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  },
  _onMouseOver: function _onMouseOver() {
    if (this._form.style.display === 'block') {
      return;
    }
    L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
  },
  _onMouseOut: function _onMouseOut() {
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
  }
});
module.exports = exports['default'];

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = L.Class.extend({
  _time: 2000,
  initialize: function initialize(map, text, time) {
    this._map = map;
    this._popupPane = map._panes.popupPane;
    this._text = '' || text;
    this._isStatic = false;
    this._container = L.DomUtil.create('div', 'leaflet-tooltip', this._popupPane);

    this._render();

    this._time = time || this._time;
  },

  dispose: function dispose() {
    if (this._container) {
      this._popupPane.removeChild(this._container);
      this._container = null;
    }
  },

  'static': function _static(isStatic) {
    this._isStatic = isStatic || this._isStatic;
    return this;
  },
  _render: function _render() {
    this._container.innerHTML = "<span>" + this._text + "</span>";
  },
  _updatePosition: function _updatePosition(latlng) {
    var pos = this._map.latLngToLayerPoint(latlng),
        tooltipContainer = this._container;

    if (this._container) {
      tooltipContainer.style.visibility = 'inherit';
      L.DomUtil.setPosition(tooltipContainer, pos);
    }

    return this;
  },

  _showError: function _showError(latlng) {
    if (this._container) {
      L.DomUtil.addClass(this._container, 'leaflet-show');
      L.DomUtil.addClass(this._container, 'leaflet-error-tooltip');
    }
    this._updatePosition(latlng);

    if (!this._isStatic) {
      this._map.on('mousemove', this._onMouseMove, this);
    }
    return this;
  },

  _showInfo: function _showInfo(latlng) {
    if (this._container) {
      L.DomUtil.addClass(this._container, 'leaflet-show');
      L.DomUtil.addClass(this._container, 'leaflet-info-tooltip');
    }
    this._updatePosition(latlng);

    if (!this._isStatic) {
      this._map.on('mousemove', this._onMouseMove, this);
    }
    return this;
  },

  _hide: function _hide() {
    if (this._container) {
      L.DomUtil.removeClass(this._container, 'leaflet-show');
      L.DomUtil.removeClass(this._container, 'leaflet-info-tooltip');
      L.DomUtil.removeClass(this._container, 'leaflet-error-tooltip');
    }
    this._map.off('mousemove', this._onMouseMove, this);
    return this;
  },

  text: function text(_text) {
    this._text = _text || this._text;
    this._render();
  },
  show: function show(latlng) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'info' : arguments[1];

    this.text();

    if (type === 'error') {
      this.showError(latlng);
    }
    if (type === 'info') {
      this.showInfo(latlng);
    }
  },
  showInfo: function showInfo(latlng) {
    this._showInfo(latlng);

    if (this._hideInfoTimeout) {
      clearTimeout(this._hideInfoTimeout);
      this._hideInfoTimeout = null;
    }

    this._hideInfoTimeout = setTimeout(L.Util.bind(this.hide, this), this._time);
  },
  showError: function showError(latlng) {
    this._showError(latlng);

    if (this._hideErrorTimeout) {
      clearTimeout(this._hideErrorTimeout);
      this._hideErrorTimeout = null;
    }

    this._hideErrorTimeout = setTimeout(L.Util.bind(this.hide, this), this._time);
  },
  hide: function hide() {
    this._hide();
  },
  _onMouseMove: function _onMouseMove(e) {
    this._updatePosition(e.latlng);
  },
  setTime: function setTime(time) {
    if (time) {
      this._time = time;
    }
  }
});
module.exports = exports['default'];

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BtnControl = require('./BtnControl');

var _BtnControl2 = _interopRequireDefault(_BtnControl);

exports['default'] = _BtnControl2['default'].extend({
  options: {
    eventName: 'trashAdded',
    pressEventName: 'trashBtnPressed'
  },
  _btn: null,
  onAdd: function onAdd(map) {
    var _this = this;

    map.on('trashAdded', function (data) {
      L.DomUtil.addClass(data.control._btn, 'disabled');

      map.on('editor:marker_group_select', _this._bindEvents, _this);
      map.on('editor:start_add_new_polygon', _this._bindEvents, _this);
      map.on('editor:start_add_new_hole', _this._bindEvents, _this);
      map.on('editor:marker_group_clear', _this._disableBtn, _this);
      map.on('editor:delete_polygon', _this._disableBtn, _this);
      map.on('editor:delete_hole', _this._disableBtn, _this);
      map.on('editor:map_cleared', _this._disableBtn, _this);

      _this._disableBtn();
    });

    var container = _BtnControl2['default'].prototype.onAdd.call(this, map);

    this._titleContainer = L.DomUtil.create('div', 'btn-leaflet-msg-container title-hidden');
    this._titleContainer.innerHTML = this._map.options.text.loadJson;
    container.appendChild(this._titleContainer);

    return container;
  },
  _bindEvents: function _bindEvents() {
    L.DomUtil.removeClass(this._btn, 'disabled');

    L.DomEvent.addListener(this._btn, 'mouseover', this._onMouseOver, this);
    L.DomEvent.addListener(this._btn, 'mouseout', this._onMouseOut, this);
    L.DomEvent.addListener(this._btn, 'click', this._onPressBtn, this);
  },
  _disableBtn: function _disableBtn() {
    L.DomUtil.addClass(this._btn, 'disabled');

    L.DomEvent.removeListener(this._btn, 'mouseover', this._onMouseOver);
    L.DomEvent.removeListener(this._btn, 'mouseout', this._onMouseOut);
    L.DomEvent.removeListener(this._btn, 'click', this._onPressBtn, this);
  },
  _onPressBtn: function _onPressBtn() {
    var map = this._map;
    var selectedMGroup = map.getSelectedMGroup();

    if (selectedMGroup === map.getEMarkersGroup() && selectedMGroup.getLayers()[0]._isFirst) {
      map.clear();
      map.mode('draw');
    } else {
      selectedMGroup.remove();
      selectedMGroup.getDELine().clear();
      L.DomUtil.addClass(this._btn, 'disabled');
      map.fire('editor:polygon:deleted');
    }
    this._onMouseOut();
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
  },
  _onMouseOver: function _onMouseOver() {
    if (!L.DomUtil.hasClass(this._btn, 'disabled')) {
      var map = this._map;
      var layer = map.getEMarkersGroup().getLayers()[0];
      if (layer && layer._isFirst) {
        this._titleContainer.innerHTML = map.options.text.rejectChanges;
      } else {
        this._titleContainer.innerHTML = map.options.text.deleteSelectedEdges;
      }
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
    }
  },
  _onMouseOut: function _onMouseOut() {
    if (!L.DomUtil.hasClass(this._btn, 'disabled')) {
      L.DomUtil.addClass(this._titleContainer, 'title-hidden');
    }
  }
});
module.exports = exports['default'];

},{"./BtnControl":11}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extendedSearchBtn = require('../extended/SearchBtn');

var _extendedSearchBtn2 = _interopRequireDefault(_extendedSearchBtn);

var _extendedTrashBtn = require('../extended/TrashBtn');

var _extendedTrashBtn2 = _interopRequireDefault(_extendedTrashBtn);

var _extendedLoadBtn = require('../extended/LoadBtn');

var _extendedLoadBtn2 = _interopRequireDefault(_extendedLoadBtn);

var _extendedBtnControl = require('../extended/BtnControl');

var _extendedBtnControl2 = _interopRequireDefault(_extendedBtnControl);

var _extendedMsgHelper = require('../extended/MsgHelper');

var _extendedMsgHelper2 = _interopRequireDefault(_extendedMsgHelper);

var _utilsMobile = require('../utils/mobile');

var _utilsMobile2 = _interopRequireDefault(_utilsMobile);

var _titlesZoomTitle = require('../titles/zoomTitle');

var _titlesZoomTitle2 = _interopRequireDefault(_titlesZoomTitle);

var _titlesFullScreenTitle = require('../titles/fullScreenTitle');

var _titlesFullScreenTitle2 = _interopRequireDefault(_titlesFullScreenTitle);

exports['default'] = function () {
  var _this = this;

  (0, _titlesZoomTitle2['default'])(this);
  (0, _titlesFullScreenTitle2['default'])(this);

  if (this.options.defaultControlLayers) {
    var OSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });
    // OSM.addTo(map);
    this.addLayer(OSM);

    this._controlLayers = new L.Control.Layers({
      Google: new L.Google(),
      OSM: OSM
    });

    this.addControl(this._controlLayers);
  }

  this.touchZoom.disable();
  this.doubleClickZoom.disable();

  //this.scrollWheelZoom.disable();
  this.boxZoom.disable();
  this.keyboard.disable();

  var controls = this.options.controls;

  if (controls) {
    if (controls.geoSearch) {
      this.addControl(new _extendedSearchBtn2['default']());
    }
  }

  this._BtnControl = _extendedBtnControl2['default'];

  var trashBtn = new _extendedTrashBtn2['default']({
    btns: [{ className: 'fa fa-trash' }]
  });

  var loadBtn = undefined;

  if (controls && controls.loadBtn) {
    loadBtn = new _extendedLoadBtn2['default']({
      btns: [{ className: 'fa fa-arrow-circle-o-down load' }]
    });
  }

  var msgHelper = this.msgHelper = new _extendedMsgHelper2['default']({
    defaultMsg: this.options.text.clickToStartDrawPolygonOnMap
  });

  this.on('msgHelperAdded', function () {
    var text = _this.options.text;

    _this.on('editor:marker_group_select', function () {

      _this.off('editor:not_selected_marker_mouseover');
      _this.on('editor:not_selected_marker_mouseover', function (data) {
        msgHelper.msg(text.clickToSelectEdges, null, data.marker);
      });

      _this.off('editor:selected_marker_mouseover');
      _this.on('editor:selected_marker_mouseover', function (data) {
        msgHelper.msg(text.clickToRemoveAllSelectedEdges, null, data.marker);
      });

      _this.off('editor:selected_middle_marker_mouseover');
      _this.on('editor:selected_middle_marker_mouseover', function (data) {
        msgHelper.msg(text.clickToAddNewEdges, null, data.marker);
      });

      // on edit polygon
      _this.off('editor:edit_polygon_mousemove');
      _this.on('editor:edit_polygon_mousemove', function (data) {
        msgHelper.msg(text.clickToDrawInnerEdges, null, data.layerPoint);
      });

      _this.off('editor:edit_polygon_mouseout');
      _this.on('editor:edit_polygon_mouseout', function () {
        msgHelper.hide();
        _this._storedLayerPoint = null;
      });

      // on view polygon
      _this.off('editor:view_polygon_mousemove');
      _this.on('editor:view_polygon_mousemove', function (data) {
        msgHelper.msg(text.clickToEdit, null, data.layerPoint);
      });

      _this.off('editor:view_polygon_mouseout');
      _this.on('editor:view_polygon_mouseout', function () {
        msgHelper.hide();
        _this._storedLayerPoint = null;
      });
    });

    // hide msg
    _this.off('editor:marker_mouseout');
    _this.on('editor:marker_mouseout', function () {
      msgHelper.hide();
    });

    // on start draw polygon
    _this.off('editor:first_marker_mouseover');
    _this.on('editor:first_marker_mouseover', function (data) {
      msgHelper.msg(text.clickToJoinEdges, null, data.marker);
    });

    // dblclick to join
    _this.off('editor:last_marker_dblclick_mouseover');
    _this.on('editor:last_marker_dblclick_mouseover', function (data) {
      msgHelper.msg(text.dblclickToJoinEdges, null, data.marker);
    });

    _this.on('editor:__join_path', function (data) {
      if (data.marker) {
        msgHelper.msg(_this.options.text.clickToRemoveAllSelectedEdges, null, data.marker);
      }
    });

    //todo: continue with option 'allowCorrectIntersection'
    _this.on('editor:intersection_detected', function (data) {
      // msg
      if (data.intersection) {
        msgHelper.msg(_this.options.text.intersection, 'error', _this._storedLayerPoint || _this.getSelectedMarker());
        _this._storedLayerPoint = null;
      } else {
        msgHelper.hide();
      }

      var selectedMarker = _this.getSelectedMarker();

      if (!_this.hasLayer(selectedMarker)) {
        return;
      }

      if (selectedMarker && !selectedMarker._mGroup.hasFirstMarker()) {
        //set marker style
        if (data.intersection) {
          //set 'error' style
          selectedMarker.setIntersectedStyle();
        } else {
          //restore style
          selectedMarker.resetStyle();

          //restore other markers which are also need to reset style
          var markersToReset = selectedMarker._mGroup.getLayers().filter(function (layer) {
            return L.DomUtil.hasClass(layer._icon, 'm-editor-intersection-div-icon');
          });

          markersToReset.map(function (marker) {
            return marker.resetStyle();
          });
        }
      }
    });
  });

  if (!_utilsMobile2['default'].isMobileBrowser()) {
    this.addControl(msgHelper);

    if (controls && controls.loadBtn) {
      this.addControl(loadBtn);
    }
  }

  if (controls && controls.trashBtn) {
    this.addControl(trashBtn);
  }
};

module.exports = exports['default'];

},{"../extended/BtnControl":11,"../extended/LoadBtn":12,"../extended/MsgHelper":13,"../extended/SearchBtn":15,"../extended/TrashBtn":17,"../titles/fullScreenTitle":24,"../titles/zoomTitle":25,"../utils/mobile":27}],19:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

window.LeafletEditor = (0, _map2['default'])();

},{"./map":21}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _viewGroup = require('./view/group');

var _viewGroup2 = _interopRequireDefault(_viewGroup);

var _editPolygon = require('./edit/polygon');

var _editPolygon2 = _interopRequireDefault(_editPolygon);

var _editHolesGroup = require('./edit/holesGroup');

var _editHolesGroup2 = _interopRequireDefault(_editHolesGroup);

var _editLine = require('./edit/line');

var _editLine2 = _interopRequireDefault(_editLine);

var _drawDashedLine = require('./draw/dashed-line');

var _drawDashedLine2 = _interopRequireDefault(_drawDashedLine);

var _drawGroup = require('./draw/group');

var _drawGroup2 = _interopRequireDefault(_drawGroup);

require('./edit/marker-group');

exports['default'] = {
  viewGroup: null,
  editGroup: null,
  editPolygon: null,
  editMarkersGroup: null,
  editLineGroup: null,
  dashedEditLineGroup: null,
  editHoleMarkersGroup: null,
  setLayers: function setLayers() {
    this.viewGroup = new _viewGroup2['default']([]);
    this.editGroup = new _drawGroup2['default']([]);
    this.editPolygon = new _editPolygon2['default']([]);
    this.editMarkersGroup = new L.MarkerGroup([]);
    this.editLineGroup = new _editLine2['default']([]);
    this.dashedEditLineGroup = new _drawDashedLine2['default']([]);
    this.editHoleMarkersGroup = new _editHolesGroup2['default']([]);
  }
};
module.exports = exports['default'];

},{"./draw/dashed-line":2,"./draw/group":4,"./edit/holesGroup":5,"./edit/line":6,"./edit/marker-group":7,"./edit/polygon":9,"./view/group":29}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _hooksControls = require('./hooks/controls');

var _hooksControls2 = _interopRequireDefault(_hooksControls);

var _layers = require('./layers');

var layers = _interopRequireWildcard(_layers);

var _options = require('./options');

var opts = _interopRequireWildcard(_options);

require('./utils/array');

function map(type) {
  var _this = this;

  var Instance = type === 'mapbox' ? L.mapbox.Map : L.Map;
  var map = Instance.extend($.extend(_base2['default'], {
    $: undefined,
    initialize: function initialize(id, options) {
      if (options.text) {
        $.extend(opts.options.text, options.text);
        delete options.text;
      }

      var controls = options.controls;
      if (controls) {
        if (controls.zoom === false) {
          options.zoomControl = false;
        }
      }

      //if (options.drawLineStyle) {
      //  $.extend(opts.options.drawLineStyle, options.drawLineStyle);
      //  delete options.drawLineStyle;
      //}
      if (options.style) {
        if (options.style.draw) {
          $.extend(opts.options.style.draw, options.style.draw);
        }
        //delete options.style.draw;
        if (options.style.view) {
          $.extend(opts.options.style.view, options.style.view);
        }
        if (options.style.startDraw) {
          $.extend(opts.options.style.startDraw, options.style.startDraw);
        }
        if (options.style.drawLine) {
          $.extend(opts.options.style.drawLine, options.style.drawLine);
        }
        delete options.style;
      }

      $.extend(this.options, opts.options, options);
      //L.Util.setOptions(this, opts.options);

      if (type === 'mapbox') {
        L.mapbox.Map.prototype.initialize.call(this, id, this.options.mapboxId, this.options);
      } else {
        L.Map.prototype.initialize.call(this, id, this.options);
      }

      this.$ = $(this._container);

      layers.setLayers();

      this._addLayers([layers.viewGroup, layers.editGroup, layers.editPolygon, layers.editMarkersGroup, layers.editLineGroup, layers.dashedEditLineGroup, layers.editHoleMarkersGroup]);

      this._setOverlays(options);

      if (this.options.forceToDraw) {
        this.mode('draw');
      }
    },
    _setOverlays: function _setOverlays(opts) {
      var overlays = opts.overlays;

      for (var i in overlays) {
        var oi = overlays[i];
        this._controlLayers.addOverlay(oi, i);
        oi.addTo(this);
        oi.bringToBack();
        oi.on('click', function () {
          return false;
        });
        oi.on('mouseup', function () {
          return false;
        });
      }
    },
    getVGroup: function getVGroup() {
      return layers.viewGroup;
    },
    getEGroup: function getEGroup() {
      return layers.editGroup;
    },
    getEPolygon: function getEPolygon() {
      return layers.editPolygon;
    },
    getEMarkersGroup: function getEMarkersGroup() {
      return layers.editMarkersGroup;
    },
    getELineGroup: function getELineGroup() {
      return layers.editLineGroup;
    },
    getDELine: function getDELine() {
      return layers.dashedEditLineGroup;
    },
    getEHMarkersGroup: function getEHMarkersGroup() {
      return layers.editHoleMarkersGroup;
    },
    getSelectedPolygon: function getSelectedPolygon() {
      return _this._selectedPolygon;
    },
    getSelectedMGroup: function getSelectedMGroup() {
      return this._selectedMGroup;
    }
  }));

  map.addInitHook(_hooksControls2['default']);

  return map;
}

exports['default'] = map;
module.exports = exports['default'];

},{"./base":1,"./hooks/controls":18,"./layers":20,"./options":23,"./utils/array":26}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _utilsMobile = require('./utils/mobile');

var _utilsMobile2 = _interopRequireDefault(_utilsMobile);

var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (_utilsMobile2["default"].isMobileBrowser()) {
  size = 2;
}

var firstIcon = L.divIcon({
  className: "m-editor-div-icon-first",
  iconSize: [10 * size, 10 * size]
});

exports.firstIcon = firstIcon;
var icon = L.divIcon({
  className: "m-editor-div-icon",
  iconSize: [10 * size, 10 * size]
});

exports.icon = icon;
var dragIcon = L.divIcon({
  className: "m-editor-div-icon-drag",
  iconSize: [10 * size * 3, 10 * size * 3]
});

exports.dragIcon = dragIcon;
var middleIcon = L.divIcon({
  className: "m-editor-middle-div-icon",
  iconSize: [10 * size, 10 * size]

});

exports.middleIcon = middleIcon;
// disable hover icon to simplify

var hoverIcon = icon || L.divIcon({
  className: "m-editor-div-icon",
  iconSize: [2 * 7 * size, 2 * 7 * size]
});

exports.hoverIcon = hoverIcon;
var intersectionIcon = L.divIcon({
  className: "m-editor-intersection-div-icon",
  iconSize: [2 * 7 * size, 2 * 7 * size]
});
exports.intersectionIcon = intersectionIcon;

},{"./utils/mobile":27}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var viewColor = '#00FFFF';
var drawColor = '#00F800';
var weight = 3;

var options = {
  allowIntersection: false,
  allowCorrectIntersection: false, //todo: unfinished
  forceToDraw: true,
  translations: {
    removePolygon: 'remove polygon',
    removePoint: 'remove point'
  },
  overlays: {},
  defaultControlLayers: true,
  style: {
    view: {
      opacity: 0.5,
      fillOpacity: 0.2,
      dashArray: null,
      clickable: false,
      fill: true,
      stroke: true,
      color: viewColor,
      weight: weight
    },
    draw: {
      opacity: 0.5,
      fillOpacity: 0.2,
      dashArray: '5, 10',
      clickable: true,
      fill: true,
      stroke: true,
      color: drawColor,
      weight: weight
    },
    startDraw: {},
    drawLine: {
      opacity: 0.7,
      fill: false,
      fillColor: drawColor,
      color: drawColor,
      weight: weight,
      dashArray: '5, 10',
      stroke: true,
      clickable: false
    }
  },
  markerIcon: undefined,
  markerHoverIcon: undefined,
  errorLineStyle: {
    color: 'red',
    weight: 3,
    opacity: 1,
    smoothFactor: 1
  },
  previewErrorLineStyle: {
    color: 'red',
    weight: 3,
    opacity: 1,
    smoothFactor: 1,
    dashArray: '5, 10'
  },
  text: {
    intersection: 'Self-intersection is prohibited',
    deletePointIntersection: 'Deletion of point is not possible. Self-intersection is prohibited',
    removePolygon: 'Remove polygon',
    clickToEdit: 'click to edit',
    clickToAddNewEdges: '<div>click&nbsp;&nbsp;<div class=\'m-editor-middle-div-icon static group-selected\'></div>&nbsp;&nbsp;to add new edges</div>',
    clickToDrawInnerEdges: 'click to draw inner edges',
    clickToJoinEdges: 'click to join edges',
    clickToRemoveAllSelectedEdges: '<div>click&nbsp;&nbsp;&nbsp;&nbsp;<div class=\'m-editor-div-icon static group-selected\'></div>&nbsp;&nbsp;to remove edge&nbsp;&nbsp;or<br>click&nbsp;&nbsp;<i class=\'fa fa-trash\'></i>&nbsp;&nbsp;to remove all selected edges</div>',
    clickToSelectEdges: '<div>click&nbsp;&nbsp;&nbsp;&nbsp;<div class=\'m-editor-div-icon static\'></div>&nbsp;/&nbsp;<div class=\'m-editor-middle-div-icon static\'></div>&nbsp;&nbsp;to select edges</div>',
    dblclickToJoinEdges: 'double click to join edges',
    clickToStartDrawPolygonOnMap: 'click to start draw polygon on map',
    deleteSelectedEdges: 'deleted selected edges',
    rejectChanges: 'reject changes',
    jsonWasLoaded: 'JSON was loaded',
    checkJson: 'check JSON',
    loadJson: 'load GeoJSON',
    forgetToSave: 'Save changes by pressing outside of polygon',
    searchLocation: 'Search location',
    submitLoadBtn: 'submit',
    zoom: 'Zoom',
    hideFullScreen: 'Hide full screen',
    showFullScreen: 'Show full screen'
  },
  worldCopyJump: true
};
exports.options = options;

},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (map) {
  if (!map.options.fullscreenControl) {
    return;
  }

  var link = map.fullscreenControl.link;
  link.title = "";
  L.DomUtil.addClass(link, 'full-screen');

  map.off('fullscreenchange');
  map.on('fullscreenchange', function () {
    L.DomUtil.addClass(map._titleFullScreenContainer, 'title-hidden');

    if (map.isFullscreen()) {
      map._titleFullScreenContainer.innerHTML = map.options.text.hideFullScreen;
    } else {
      map._titleFullScreenContainer.innerHTML = map.options.text.showFullScreen;
    }
  }, this);

  var fullScreenContainer = map.fullscreenControl._container;

  map._titleFullScreenContainer = L.DomUtil.create('div', 'btn-leaflet-msg-container title-hidden');
  map._titleFullScreenContainer.innerHTML = map.options.text.showFullScreen;
  fullScreenContainer.appendChild(map._titleFullScreenContainer);

  var _onMouseOver = function _onMouseOver() {
    L.DomUtil.removeClass(map._titleFullScreenContainer, 'title-hidden');
  };
  var _onMouseOut = function _onMouseOut() {
    L.DomUtil.addClass(map._titleFullScreenContainer, 'title-hidden');
  };

  L.DomEvent.addListener(fullScreenContainer, 'mouseover', _onMouseOver, this);
  L.DomEvent.addListener(fullScreenContainer, 'mouseout', _onMouseOut, this);
};

module.exports = exports['default'];

},{}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (map) {
  var controls = map.options.controls;
  if (controls && !controls.zoom) {
    return;
  }

  if (!map.zoomControl) {
    return;
  }

  var zoomContainer = map.zoomControl._container;
  map._titleZoomContainer = L.DomUtil.create('div', 'btn-leaflet-msg-container zoom title-hidden');
  map._titleZoomContainer.innerHTML = map.options.text.zoom;
  zoomContainer.appendChild(map._titleZoomContainer);

  var _onMouseOverZoom = function _onMouseOverZoom() {
    L.DomUtil.removeClass(map._titleZoomContainer, 'title-hidden');
  };
  var _onMouseOutZoom = function _onMouseOutZoom() {
    L.DomUtil.addClass(map._titleZoomContainer, 'title-hidden');
  };

  L.DomEvent.addListener(zoomContainer, 'mouseover', _onMouseOverZoom, this);
  L.DomEvent.addListener(zoomContainer, 'mouseout', _onMouseOutZoom, this);

  map.zoomControl._zoomInButton.title = "";
  map.zoomControl._zoomOutButton.title = "";
};

module.exports = exports['default'];

},{}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};
Array.prototype._each = function (func) {
  var length = this.length;
  var i = 0;
  for (; i < length; i++) {
    func.call(this, this[i], i);
  }
};
exports["default"] = Array;
module.exports = exports["default"];

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  isMobileBrowser: function isMobileBrowser() {
    var check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
        check = true;
      }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }
};
module.exports = exports["default"];

},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function () {
  var object = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var array = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var rslt = object;

  var tmp;
  var _func = function _func(id, index) {
    var position = rslt[id].position;
    if (position !== undefined) {
      if (position !== index) {
        tmp = rslt[id];
        rslt[id] = rslt[array[position]];
        rslt[array[position]] = tmp;
      }

      if (position != index) {
        _func.call(null, id, index);
      }
    }
  };
  array.forEach(_func);

  return rslt;
};

;
module.exports = exports["default"];

},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = L.MultiPolygon.extend({
  initialize: function initialize(latlngs, options) {
    var _this = this;

    L.MultiPolygon.prototype.initialize.call(this, latlngs, options);

    this.on('layeradd', function (e) {
      var mViewStyle = _this._map.options.style.view;
      e.target.setStyle($.extend({
        opacity: 0.7,
        fillOpacity: 0.35,
        color: '#00ABFF'
      }, mViewStyle));

      _this._map._moveEPolygonOnTop();
    });
  },
  isEmpty: function isEmpty() {
    return this.getLayers().length === 0;
  },
  onAdd: function onAdd(map) {
    L.MultiPolygon.prototype.onAdd.call(this, map);

    this.on('mousemove', function (e) {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mousemove', { layerPoint: e.layerPoint });
      } else {
        if (!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mousemove', { layerPoint: e.layerPoint });
        }
      }
    });
    this.on('mouseout', function () {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mouseout');
      } else {
        if (!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mouseout');
        }
      }
    });
  },
  onClick: function onClick(e) {
    var map = this._map;
    var selectedMGroup = map.getSelectedMGroup();
    var eMarkersGroup = map.getEMarkersGroup();
    if (eMarkersGroup.getFirst() && eMarkersGroup.getFirst()._hasFirstIcon() && !eMarkersGroup.isEmpty() || selectedMGroup && selectedMGroup.getFirst() && selectedMGroup.getFirst()._hasFirstIcon() && !selectedMGroup.isEmpty()) {
      var eMarkersGroup = map.getEMarkersGroup();
      eMarkersGroup.set(e.latlng);
      map._convertToEdit(eMarkersGroup);
    } else {
      // reset
      if (map._getSelectedVLayer()) {
        map._setEPolygon_To_VGroup();
      } else {
        map._addEPolygon_To_VGroup();
      }
      map.clear();
      map.mode('draw');

      map._hideSelectedVLayer(e.layer);

      eMarkersGroup.restore(e.layer);
      map._convertToEdit(eMarkersGroup);

      eMarkersGroup.select();
    }
  },
  onRemove: function onRemove(map) {
    this.off('mouseover');
    this.off('mouseout');

    map.off('editor:view_polygon_mousemove');
    map.off('editor:view_polygon_mouseout');
  }
});
module.exports = exports['default'];

},{}]},{},[19])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2Jhc2UuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZGFzaGVkLWxpbmUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZXZlbnRzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9kcmF3L2dyb3VwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L2hvbGVzR3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvbGluZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2V4YWN0ZmFybWluZy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXItZ3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvbWFya2VyLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L3BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0Jhc2VNYXJrZXJHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2V4YWN0ZmFybWluZy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvQnRuQ29udHJvbC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2V4YWN0ZmFybWluZy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTG9hZEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2V4YWN0ZmFybWluZy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTXNnSGVscGVyLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9Qb2x5Z29uLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9TZWFyY2hCdG4uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL1Rvb2x0aXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL1RyYXNoQnRuLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2V4YWN0ZmFybWluZy9sZWFmbGV0LWVkaXRvci9zcmMvanMvaW5kZXguanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2xheWVycy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2V4YWN0ZmFybWluZy9sZWFmbGV0LWVkaXRvci9zcmMvanMvbWFwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9tYXJrZXItaWNvbnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL29wdGlvbnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3RpdGxlcy9mdWxsU2NyZWVuVGl0bGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3RpdGxlcy96b29tVGl0bGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL2FycmF5LmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy91dGlscy9tb2JpbGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9leGFjdGZhcm1pbmcvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL3NvcnRCeVBvc2l0aW9uLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvZXhhY3RmYXJtaW5nL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy92aWV3L2dyb3VwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7MEJDQXVCLGVBQWU7Ozs7MkJBQ2QsZ0JBQWdCOzs7O3FCQUV6QixDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3RCLGlCQUFlLEVBQUUsU0FBUztBQUMxQixpQkFBZSxFQUFFLFNBQVM7QUFDMUIsb0JBQWtCLEVBQUUsU0FBUztBQUM3QiwyQkFBeUIsRUFBRSxLQUFLO0FBQ2hDLFdBQVMsRUFBRSxNQUFNO0FBQ2pCLGdCQUFjLEVBQUUsU0FBUztBQUN6QixvQkFBa0IsRUFBQyw4QkFBRztBQUNwQixXQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7R0FDN0I7QUFDRCxvQkFBa0IsRUFBQyw0QkFBQyxLQUFLLEVBQUU7QUFDekIsUUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7R0FDOUI7QUFDRCxzQkFBb0IsRUFBQyxnQ0FBRztBQUN0QixRQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztHQUNs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TyxDQUFDLEtBQUssRUFBRTtBQUNqQixZQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFdBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkQ7O0FBRUQsWUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtBQUN0QixXQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZEO0FBQ0QsWUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUMzQixXQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ2pFO0FBQ0QsWUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUMxQixXQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9EO0FBQ0QsZUFBTyxPQUFPLENBQUMsS0FBSyxDQUFDO09BQ3RCOztBQUVELE9BQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7QUFHOUMsVUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3JCLFNBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09B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LCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEcmF3RXZlbnRzIGZyb20gJy4vZHJhdy9ldmVudHMnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcblxuZXhwb3J0IGRlZmF1bHQgJC5leHRlbmQoe1xuICBfc2VsZWN0ZWRNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX3NlbGVjdGVkVkxheWVyOiB1bmRlZmluZWQsXG4gIF9vbGRTZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkOiBmYWxzZSxcbiAgX21vZGVUeXBlOiAnZHJhdycsXG4gIF9jb250cm9sTGF5ZXJzOiB1bmRlZmluZWQsXG4gIF9nZXRTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkVkxheWVyO1xuICB9LFxuICBfc2V0U2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2NsZWFyU2VsZWN0ZWRWTGF5ZXIgKCkge1xuICAgIHRoaXMuX3NlbGVjdGVkVkxheWVyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfaGlkZVNlbGVjdGVkVkxheWVyIChsYXllcikge1xuICAgIGxheWVyLmJyaW5nVG9CYWNrKCk7XG5cbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vc2hvdyBsYXN0IGxheWVyXG4gICAgdGhpcy5fc2hvd1NlbGVjdGVkVkxheWVyKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgIC8vaGlkZVxuICAgIHRoaXMuX3NldFNlbGVjdGVkVkxheWVyKGxheWVyKTtcbiAgICBsYXllci5fcGF0aC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIH0sXG4gIF9zaG93U2VsZWN0ZWRWTGF5ZXIgKGxheWVyID0gdGhpcy5fc2VsZWN0ZWRWTGF5ZXIpIHtcbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcbiAgfSxcbiAgaGFzU2VsZWN0ZWRWTGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkgIT09IHVuZGVmaW5lZDtcbiAgfSxcbiAgX2FkZEVHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgZUdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGlmICghbGF5ZXIuaXNFbXB0eSgpKSB7XG4gICAgICAgIHZhciBob2xlcyA9IGxheWVyLl9ob2xlcztcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgICAgICBsYXRsbmdzID0gW2xhdGxuZ3NdLmNvbmNhdChob2xlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZHcm91cC5hZGRMYXllcihMLnBvbHlnb24obGF0bG5ncykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfYWRkRVBvbHlnb25fVG9fVkdyb3VwICgpIHtcbiAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG5cbiAgICB2YXIgaG9sZXMgPSBlUG9seWdvbi5nZXRIb2xlcygpO1xuICAgIHZhciBsYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoIDw9IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gIH0sXG4gIF9zZXRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgc2VsZWN0ZWRWTGF5ZXIgPSB0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgaWYgKCFzZWxlY3RlZFZMYXllcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGVjdGVkVkxheWVyLl9sYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuICAgIHNlbGVjdGVkVkxheWVyLl9ob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIucmVkcmF3KCk7XG4gIH0sXG4gIF9jb252ZXJ0X0VHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLl9hZGRFR3JvdXBfVG9fVkdyb3VwKCk7XG4gIH0sXG4gIF9jb252ZXJ0VG9FZGl0IChncm91cCkge1xuICAgIGlmIChncm91cCBpbnN0YW5jZW9mIEwuTXVsdGlQb2x5Z29uKSB7XG4gICAgICB2YXIgZUdyb3VwID0gdGhpcy5nZXRFR3JvdXAoKTtcblxuICAgICAgZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAgIGdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG5cbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihsYXRsbmdzKTtcbiAgICAgICAgZWRpdFBvbHlnb24uYWRkVG8odGhpcyk7XG4gICAgICAgIGVHcm91cC5hZGRMYXllcihlZGl0UG9seWdvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBlR3JvdXA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NYXJrZXJHcm91cCkge1xuICAgICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgICAgdmFyIGxheWVycyA9IGdyb3VwLmdldExheWVycygpO1xuICAgICAgbGF5ZXJzID0gbGF5ZXJzLmZpbHRlcigobGF5ZXIpID0+ICFsYXllci5pc01pZGRsZSgpKTtcbiAgICAgIHZhciBwb2ludHNBcnJheSA9IGxheWVycy5tYXAoKGxheWVyKSA9PiBsYXllci5nZXRMYXRMbmcoKSk7XG5cbiAgICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG5cbiAgICAgIGlmIChob2xlcykge1xuICAgICAgICBwb2ludHNBcnJheSA9IFtwb2ludHNBcnJheV0uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cblxuICAgICAgZVBvbHlnb24uc2V0TGF0TG5ncyhwb2ludHNBcnJheSk7XG4gICAgICBlUG9seWdvbi5yZWRyYXcoKTtcblxuICAgICAgcmV0dXJuIGVQb2x5Z29uO1xuICAgIH1cbiAgfSxcbiAgX3NldE1vZGUgKHR5cGUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuc2V0U3R5bGUob3B0aW9ucy5zdHlsZVt0eXBlXSk7XG4gIH0sXG5cbiAgX2dldE1vZGVUeXBlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIF9zZXRNb2RlVHlwZSAodHlwZSkge1xuICAgIHRoaXMuJC5yZW1vdmVDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gICAgdGhpcy5fbW9kZVR5cGUgPSB0eXBlO1xuICAgIHRoaXMuJC5hZGRDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gIH0sXG4gIF9zZXRNYXJrZXJzR3JvdXBJY29uIChtYXJrZXJHcm91cCkge1xuICAgIHZhciBtSWNvbiA9IHRoaXMub3B0aW9ucy5tYXJrZXJJY29uO1xuICAgIHZhciBtSG92ZXJJY29uID0gdGhpcy5vcHRpb25zLm1hcmtlckhvdmVySWNvbjtcblxuICAgIHZhciBtb2RlID0gdGhpcy5fZ2V0TW9kZVR5cGUoKTtcbiAgICBpZiAobUljb24pIHtcbiAgICAgIGlmICghbUljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gbUljb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWNvbiA9IG1JY29uLm1vZGVbbW9kZV07XG4gICAgICAgIGlmIChpY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtSG92ZXJJY29uKSB7XG4gICAgICBpZiAoIW1Ib3Zlckljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBtSG92ZXJJY29uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGljb24gPSBtSG92ZXJJY29uW21vZGVdO1xuICAgICAgICBpZiAoaWNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiB8fCBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uO1xuXG4gICAgaWYgKG1vZGUgPT09IFwiYWZ0ZXJEcmF3XCIpIHtcbiAgICAgIG1hcmtlckdyb3VwLnVwZGF0ZVN0eWxlKCk7XG4gICAgfVxuICB9LFxuICBtb2RlICh0eXBlKSB7XG4gICAgdGhpcy5maXJlKHRoaXMuX21vZGVUeXBlICsgJ19ldmVudHNfZGlzYWJsZScpO1xuICAgIHRoaXMuZmlyZSh0eXBlICsgJ19ldmVudHNfZW5hYmxlJyk7XG5cbiAgICB0aGlzLl9zZXRNb2RlVHlwZSh0eXBlKTtcblxuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICAgIHR5cGUgPSB0aGlzW3R5cGVdKCkgfHwgdHlwZTtcbiAgICAgIHRoaXMuX3NldE1vZGUodHlwZSk7XG4gICAgfVxuICB9LFxuICBpc01vZGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIGRyYXcgKCkge1xuICAgIGlmICh0aGlzLmlzTW9kZSgnZWRpdCcpIHx8IHRoaXMuaXNNb2RlKCd2aWV3JykgfHwgdGhpcy5pc01vZGUoJ2FmdGVyRHJhdycpKSB7XG4gICAgICB0aGlzLl9jbGVhck1hcCgpO1xuXG4gICAgfVxuICAgIHRoaXMuX2JpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5fY2xlYXJNYXAoKTtcblxuICAgIHRoaXMubW9kZSgndmlldycpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICB0aGlzLl9jbGVhck1hcCgpO1xuICAgIHRoaXMuZmlyZSgnZWRpdG9yOm1hcF9jbGVhcmVkJyk7XG4gIH0sXG4gIGNsZWFyQWxsICgpIHtcbiAgICB0aGlzLm1vZGUoJ3ZpZXcnKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5jbGVhckxheWVycygpO1xuICB9LFxuICAvKipcbiAgICpcbiAgICogVGhlIG1haW4gaWRlYSBpcyB0byBzYXZlIEVQb2x5Z29uIHRvIFZHcm91cCB3aGVuOlxuICAgKiAxKSB1c2VyIGFkZCBuZXcgcG9seWdvblxuICAgKiAyKSB3aGVuIHVzZXIgZWRpdCBwb2x5Z29uXG4gICAqXG4gICAqICovXG4gIHNhdmVTdGF0ZSAoKSB7XG5cbiAgICB2YXIgZVBvbHlnb24gPSBfbWFwLmdldEVQb2x5Z29uKCk7XG5cbiAgICBpZiAoIWVQb2x5Z29uLmlzRW1wdHkoKSkge1xuICAgICAgLy90aGlzLmZpdEJvdW5kcyhlUG9seWdvbi5nZXRCb3VuZHMoKSk7XG4gICAgICAvL3RoaXMubXNnSGVscGVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5mb3JnZXRUb1NhdmUpO1xuXG4gICAgICBpZiAodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSkge1xuICAgICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcblxuICAgIHZhciBnZW9qc29uID0gdGhpcy5nZXRWR3JvdXAoKS50b0dlb0pTT04oKTtcbiAgICBpZiAoZ2VvanNvbi5nZW9tZXRyeSkge1xuICAgICAgcmV0dXJuIGdlb2pzb24uZ2VvbWV0cnk7XG4gICAgfVxuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgYXJlYSgpIHtcblxuICAgIGlmICghd2luZG93LnR1cmYpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2xlYWZsZXQtZWRpdG9yOiBubyBcInR1cmZcIiBsaWJyYXJ5ISEhIGh0dHA6Ly90dXJmanMub3JnLycpO1xuXG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBsZXQgdkxheWVyID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICBsZXQgZVBvbHlnb25MYXllciA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICBsZXQgc2VsZWN0ZWRMYXllciA9IHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCk7XG5cbiAgICAvLyBpZiBcImVBcmVhXCIgPCAwIHRoYW4gXCJlUG9seWdvbkxheWVyXCIgaXMgaG9sZSBsYXllclxuICAgIGxldCBlQXJlYSA9IHR1cmYuYXJlYShlUG9seWdvbkxheWVyLnRvR2VvSlNPTigpKTtcbiAgICBsZXQgdkFyZWEgPSB0dXJmLmFyZWEodkxheWVyLnRvR2VvSlNPTigpKTtcblxuICAgIGxldCBoQXJlYSA9IChzZWxlY3RlZExheWVyKSA/IHR1cmYuYXJlYShzZWxlY3RlZExheWVyLnRvR2VvSlNPTigpKSA6IDA7XG5cbiAgICBpZiAodGhpcy5oYXNTZWxlY3RlZFZMYXllcigpICYmIGVBcmVhID4gMCkge1xuICAgICAgdkFyZWEgLT0gaEFyZWE7XG4gICAgfVxuICAgIGxldCBzdW0gPSAoZUFyZWEgPiAwKSA/ICh2QXJlYSArIGVBcmVhKSA6IHZBcmVhO1xuXG4gICAgcmV0dXJuIHN1bTtcbiAgfSxcbiAgZ2V0U2VsZWN0ZWRNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZE1hcmtlcjtcbiAgfSxcbiAgY2xlYXJTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBudWxsO1xuICB9LFxuICByZW1vdmVTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgdmFyIHNlbGVjdGVkTWFya2VyID0gdGhpcy5fc2VsZWN0ZWRNYXJrZXI7XG4gICAgdmFyIHByZXZNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5wcmV2KCk7XG4gICAgdmFyIG5leHRNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5uZXh0KCk7XG4gICAgdmFyIG1pZGxlUHJldk1hcmtlciA9IHNlbGVjdGVkTWFya2VyLl9taWRkbGVQcmV2O1xuICAgIHZhciBtaWRkbGVOZXh0TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIuX21pZGRsZU5leHQ7XG4gICAgc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBtaWRsZVByZXZNYXJrZXI7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBtaWRkbGVOZXh0TWFya2VyO1xuICAgIHRoaXMuX3NlbGVjdGVkTWFya2VyLnJlbW92ZSgpO1xuICAgIHByZXZNYXJrZXIuX21pZGRsZU5leHQgPSBudWxsO1xuICAgIG5leHRNYXJrZXIuX21pZGRsZVByZXYgPSBudWxsO1xuICB9LFxuICByZW1vdmVQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgLy90aGlzLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHBvbHlnb24uY2xlYXIoKTtcblxuICAgIGlmICh0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJTZWxlY3RlZE1hcmtlcigpO1xuICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICB9LFxuICBjcmVhdGVFZGl0UG9seWdvbiAoanNvbikge1xuICAgIHZhciBnZW9Kc29uID0gTC5nZW9Kc29uKGpzb24pO1xuXG4gICAgLy9hdm9pZCB0byBsb3NlIGNoYW5nZXNcbiAgICBpZiAodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSkge1xuICAgICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXIoKTtcblxuICAgIHZhciBsYXllciA9IGdlb0pzb24uZ2V0TGF5ZXJzKClbMF07XG5cbiAgICBpZiAobGF5ZXIpIHtcbiAgICAgIHZhciBsYXllcnMgPSBsYXllci5nZXRMYXllcnMoKTtcbiAgICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIF9sID0gbGF5ZXJzW2ldO1xuICAgICAgICB2R3JvdXAuYWRkTGF5ZXIoX2wpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgdGhpcy5fZml0VkJvdW5kcygpO1xuICB9LFxuICBtb3ZlTWFya2VyIChsYXRsbmcpIHtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRTZWxlY3RlZCgpLnNldExhdExuZyhsYXRsbmcpO1xuICB9LFxuICBfZml0VkJvdW5kcyAoKSB7XG4gICAgaWYgKHRoaXMuZ2V0Vkdyb3VwKCkuZ2V0TGF5ZXJzKCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aGlzLmZpdEJvdW5kcyh0aGlzLmdldFZHcm91cCgpLmdldEJvdW5kcygpLCB7IHBhZGRpbmc6IFszMCwgMzBdIH0pO1xuICAgICAgLy90aGlzLmludmFsaWRhdGVTaXplKCk7XG4gICAgfVxuICB9LFxuICBfY2xlYXJNYXAgKCkge1xuICAgIHRoaXMuZ2V0RUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5jbGVhcigpO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IHRoaXMuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcblxuICAgIGlmIChzZWxlY3RlZE1Hcm91cCkge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuX3Nob3dTZWxlY3RlZFZMYXllcigpO1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRWTGF5ZXIoKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcbiAgfSxcbiAgX2NsZWFyRXZlbnRzICgpIHtcbiAgICAvL3RoaXMuX3VuQmluZFZpZXdFdmVudHMoKTtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIF9hY3RpdmVFZGl0TGF5ZXI6IHVuZGVmaW5lZCxcbiAgX3NldEFjdGl2ZUVkaXRMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2dldEFjdGl2ZUVkaXRMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUVkaXRMYXllcjtcbiAgfSxcbiAgX2NsZWFyQWN0aXZlRWRpdExheWVyICgpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBudWxsO1xuICB9LFxuICBfc2V0RUhNYXJrZXJHcm91cCAoYXJyYXlMYXRMbmcpIHtcbiAgICB2YXIgaG9sZU1hcmtlckdyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuX2lzSG9sZSA9IHRydWU7XG5cbiAgICB0aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKGhvbGVNYXJrZXJHcm91cCk7XG5cbiAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgaG9sZU1hcmtlckdyb3VwLmFkZFRvKGVoTWFya2Vyc0dyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cExheWVycyA9IGVoTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgdmFyIGhHcm91cFBvcyA9IGVoTWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaG9sZU1hcmtlckdyb3VwLl9wb3NpdGlvbiA9IGhHcm91cFBvcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMYXRMbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHNldCBob2xlIG1hcmtlclxuICAgICAgaG9sZU1hcmtlckdyb3VwLnNldEhvbGVNYXJrZXIoYXJyYXlMYXRMbmdbaV0sIHVuZGVmaW5lZCwge30sIHsgaEdyb3VwOiBoR3JvdXBQb3MsIGhNYXJrZXI6IGkgfSk7XG4gICAgfVxuXG4gICAgdmFyIGxheWVycyA9IGhvbGVNYXJrZXJHcm91cC5nZXRMYXllcnMoKTtcbiAgICBsYXllcnMubWFwKChsYXllciwgcG9zaXRpb24pID0+IHtcbiAgICAgIGhvbGVNYXJrZXJHcm91cC5fc2V0TWlkZGxlTWFya2VycyhsYXllciwgcG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICBsYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgIGVQb2x5Z29uLnVwZGF0ZUhvbGVQb2ludChoR3JvdXBQb3MsIGxheWVyLl9fcG9zaXRpb24sIGxheWVyLl9sYXRsbmcpO1xuICAgIH0pO1xuXG4gICAgLy9lUG9seWdvbi5zZXRIb2xlKClcbiAgICByZXR1cm4gaG9sZU1hcmtlckdyb3VwO1xuICB9LFxuICBfbW92ZUVQb2x5Z29uT25Ub3AgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICBpZiAoZVBvbHlnb24uX2NvbnRhaW5lcikge1xuICAgICAgdmFyIGxhc3RDaGlsZCA9ICQoZVBvbHlnb24uX2NvbnRhaW5lci5wYXJlbnROb2RlKS5jaGlsZHJlbigpLmxhc3QoKTtcbiAgICAgIHZhciAkZVBvbHlnb24gPSAkKGVQb2x5Z29uLl9jb250YWluZXIpO1xuICAgICAgaWYgKCRlUG9seWdvblswXSAhPT0gbGFzdENoaWxkKSB7XG4gICAgICAgICRlUG9seWdvbi5kZXRhY2goKS5pbnNlcnRBZnRlcihsYXN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVzdG9yZUVQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgcG9seWdvbiA9IHBvbHlnb24gfHwgdGhpcy5nZXRFUG9seWdvbigpO1xuXG4gICAgaWYgKCFwb2x5Z29uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gc2V0IG1hcmtlcnNcbiAgICB2YXIgbGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuc2V0QWxsKGxhdGxuZ3MpO1xuXG4gICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5fY29ubmVjdE1hcmtlcnMoKTtcblxuICAgIC8vIHNldCBob2xlIG1hcmtlcnNcbiAgICB2YXIgaG9sZXMgPSBwb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgaWYgKGhvbGVzKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGhvbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHRoaXMuX3NldEVITWFya2VyR3JvdXAoaG9sZXNbal0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZ2V0Q29udHJvbExheWVyczogKCkgPT4gdGhpcy5fY29udHJvbExheWVycyxcbiAgZWRnZXNJbnRlcnNlY3RlZCAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkID0gdmFsdWU7XG4gICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7IGludGVyc2VjdGlvbjogdHJ1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZmlyZShcImVkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWRcIiwgeyBpbnRlcnNlY3Rpb246IGZhbHNlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2Vycm9yVGltZW91dDogbnVsbCxcbiAgX3Nob3dJbnRlcnNlY3Rpb25FcnJvciAodGV4dCkge1xuXG4gICAgaWYgKHRoaXMuX2Vycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Vycm9yVGltZW91dCk7XG4gICAgfVxuXG4gICAgdGhpcy5tc2dIZWxwZXIubXNnKHRleHQgfHwgdGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uLCAnZXJyb3InLCAodGhpcy5fc3RvcmVkTGF5ZXJQb2ludCB8fCB0aGlzLmdldFNlbGVjdGVkTWFya2VyKCkpKTtcblxuICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBudWxsO1xuXG4gICAgdGhpcy5fZXJyb3JUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm1zZ0hlbHBlci5oaWRlKCk7XG4gICAgfSwgMTAwMDApO1xuICB9XG59LCBEcmF3RXZlbnRzKTtcbiIsImltcG9ydCAqIGFzIG9wdHMgZnJvbSAnLi4vb3B0aW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IEwuUG9seWxpbmUuZXh0ZW5kKHtcbiAgb3B0aW9uczogb3B0cy5vcHRpb25zLnN0eWxlLmRyYXdMaW5lLFxuICBfbGF0bG5nVG9Nb3ZlOiB1bmRlZmluZWQsXG4gIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICAgIHRoaXMuc2V0U3R5bGUobWFwLm9wdGlvbnMuc3R5bGUuZHJhd0xpbmUpO1xuICB9LFxuICBhZGRMYXRMbmcgKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9sYXRsbmdUb01vdmUpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGF0bG5ncy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9sYXRsbmdzLnNwbGljZSgtMSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGF0bG5ncy5wdXNoKEwubGF0TG5nKGxhdGxuZykpO1xuXG4gICAgcmV0dXJuIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIHVwZGF0ZSAocG9zKSB7XG5cbiAgICBpZiAoIXRoaXMuX2xhdGxuZ1RvTW92ZSAmJiB0aGlzLl9sYXRsbmdzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlID0gTC5sYXRMbmcocG9zKTtcbiAgICAgIHRoaXMuX2xhdGxuZ3MucHVzaCh0aGlzLl9sYXRsbmdUb01vdmUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubGF0ID0gcG9zLmxhdDtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZS5sbmcgPSBwb3MubG5nO1xuXG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgX2FkZExpbmUgKGxpbmUsIGdyb3VwLCBpc0xhc3RNYXJrZXIpIHtcbiAgICBpZiAoIWlzTGFzdE1hcmtlcikge1xuICAgICAgbGluZS5hZGRUbyhncm91cCk7XG4gICAgfVxuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgfVxufSk7IiwiaW1wb3J0IHtmaXJzdEljb24sIGljb24sIGRyYWdJY29uLCBtaWRkbGVJY29uLCBob3Zlckljb24sIGludGVyc2VjdGlvbkljb259IGZyb20gJy4uL21hcmtlci1pY29ucyc7XG5leHBvcnQgZGVmYXVsdCB7XG4gIF9iaW5kRHJhd0V2ZW50cyAoKSB7XG4gICAgdGhpcy5fdW5CaW5kRHJhd0V2ZW50cygpO1xuXG4gICAgLy8gY2xpY2sgb24gbWFwXG4gICAgdGhpcy5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fc3RvcmVkTGF5ZXJQb2ludCA9IGUubGF5ZXJQb2ludDtcbiAgICAgIC8vIGJ1ZyBmaXhcbiAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaWVudFggPT09IDAgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaWVudFkgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBMLk1hcmtlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gZS50YXJnZXQuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgICAvLyBzdGFydCBhZGQgbmV3IHBvbHlnb25cbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZSk7XG5cbiAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19wb2x5Z29uJyk7XG4gICAgICAgIHZhciBzdGFydERyYXdTdHlsZSA9IHRoaXMub3B0aW9ucy5zdHlsZVsnc3RhcnREcmF3J107XG5cbiAgICAgICAgaWYgKHN0YXJ0RHJhd1N0eWxlKSB7XG4gICAgICAgICAgdGhpcy5nZXRFUG9seWdvbigpLnNldFN0eWxlKHN0YXJ0RHJhd1N0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRWTGF5ZXIoKTtcblxuICAgICAgICB0aGlzLl9zZWxlY3RlZE1Hcm91cCA9IGVNYXJrZXJzR3JvdXA7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgcG9seWdvblxuICAgICAgdmFyIGZpcnN0TWFya2VyID0gZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpO1xuXG4gICAgICBpZiAoZmlyc3RNYXJrZXIgJiYgZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICghKGUudGFyZ2V0IGluc3RhbmNlb2YgTC5NYXJrZXIpKSB7XG4gICAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gc3RhcnQgZHJhdyBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgICB2YXIgbGFzdEhvbGUgPSBlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpO1xuICAgICAgaWYgKGZpcnN0TWFya2VyICYmICFmaXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKChlLnRhcmdldC5nZXRFUG9seWdvbigpLl9wYXRoID09PSBlLm9yaWdpbmFsRXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgIGlmICghbGFzdEhvbGUgfHwgIWxhc3RIb2xlLmdldEZpcnN0KCkgfHwgIWxhc3RIb2xlLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgICAgICAgdmFyIGxhc3RIR3JvdXAgPSBlaE1hcmtlcnNHcm91cC5hZGRIb2xlR3JvdXAoKTtcbiAgICAgICAgICAgIGxhc3RIR3JvdXAuc2V0KGUubGF0bG5nLCBudWxsLCB7IGljb246IGZpcnN0SWNvbiB9KTtcblxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWRNR3JvdXAgPSBsYXN0SEdyb3VwO1xuICAgICAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19ob2xlJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICBpZiAobGFzdEhvbGUgJiYgIWxhc3RIb2xlLmlzRW1wdHkoKSAmJiBsYXN0SG9sZS5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5faXNNYXJrZXJJblBvbHlnb24oZS5sYXRsbmcpKSB7XG4gICAgICAgICAgdmFyIG1hcmtlciA9IGVoTWFya2Vyc0dyb3VwLmdldExhc3RIb2xlKCkuc2V0KGUubGF0bG5nKTtcbiAgICAgICAgICB2YXIgcnNsdCA9IG1hcmtlci5fZGV0ZWN0SW50ZXJzZWN0aW9uKCk7IC8vIGluIGNhc2Ugb2YgaG9sZVxuICAgICAgICAgIGlmIChyc2x0KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcblxuICAgICAgICAgICAgLy9tYXJrZXIuX21Hcm91cC5yZW1vdmVNYXJrZXIobWFya2VyKTsgLy90b2RvOiBkZXRlY3QgaW50ZXJzZWN0aW9uIGZvciBob2xlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVzZXRcblxuICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpfX2pvaW5fcGF0aCcsIChlKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IGUubUdyb3VwO1xuXG4gICAgICBpZiAoIWVNYXJrZXJzR3JvdXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5faXNIb2xlKSB7XG4gICAgICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldExhc3RIb2xlKCk7XG4gICAgICB9XG4gICAgICAvLzEuIHNldCBtaWRkbGUgbWFya2Vyc1xuICAgICAgdmFyIGxheWVycyA9IGVNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IC0xO1xuICAgICAgbGF5ZXJzLmZvckVhY2goKCkgPT4ge1xuICAgICAgICB2YXIgbWFya2VyID0gZU1hcmtlcnNHcm91cC5hZGRNYXJrZXIocG9zaXRpb24sIG51bGwsIHsgaWNvbjogbWlkZGxlSWNvbiB9KTtcbiAgICAgICAgcG9zaXRpb24gPSBtYXJrZXIucG9zaXRpb24gKyAyO1xuICAgICAgfSk7XG5cbiAgICAgIC8vMi4gY2xlYXIgbGluZVxuICAgICAgZU1hcmtlcnNHcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgICBlTWFya2Vyc0dyb3VwLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgICAgbWFya2VyLmRyYWdnaW5nLmVuYWJsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAuc2VsZWN0KCk7XG5cbiAgICAgIC8vcmVzZXQgc3R5bGUgaWYgJ3N0YXJ0RHJhdycgd2FzIHVzZWRcbiAgICAgIHRoaXMuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZSh0aGlzLm9wdGlvbnMuc3R5bGUuZHJhdyk7XG5cblxuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuX2lzSG9sZSkge1xuICAgICAgICB0aGlzLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOmhvbGVfY3JlYXRlZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6cG9seWdvbjpjcmVhdGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcblxuICAgIHZHcm91cC5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgdkdyb3VwLm9uQ2xpY2soZSk7XG5cbiAgICAgIHRoaXMubXNnSGVscGVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5jbGlja1RvRHJhd0lubmVyRWRnZXMsIG51bGwsIGUubGF5ZXJQb2ludCk7XG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOnNlbGVjdGVkJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQodGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgIH0pO1xuICAgIHRoaXMub24oJ2VkaXRvcjpkZWxldGVfcG9seWdvbicsICgpID0+IHtcbiAgICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZW1vdmUoKTtcbiAgICB9KTtcbiAgfSxcbiAgX2FkZE1hcmtlciAoZSkge1xuICAgIHZhciBsYXRsbmcgPSBlLmxhdGxuZztcblxuICAgIHZhciBlTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCk7XG5cbiAgICB2YXIgbWFya2VyID0gZU1hcmtlcnNHcm91cC5zZXQobGF0bG5nKTtcblxuICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQoZU1hcmtlcnNHcm91cCk7XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBfdXBkYXRlREVMaW5lIChsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuZ2V0REVMaW5lKCkudXBkYXRlKGxhdGxuZyk7XG4gIH0sXG4gIF91bkJpbmREcmF3RXZlbnRzICgpIHtcbiAgICB0aGlzLm9mZignY2xpY2snKTtcbiAgICB0aGlzLmdldFZHcm91cCgpLm9mZignY2xpY2snKTtcbiAgICAvL3RoaXMub2ZmKCdtb3VzZW91dCcpO1xuICAgIHRoaXMub2ZmKCdkYmxjbGljaycpO1xuXG4gICAgdGhpcy5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpfX2pvaW5fcGF0aCcpO1xuXG4gICAgaWYgKHRoaXMuX29wZW5Qb3B1cCkge1xuICAgICAgdGhpcy5vcGVuUG9wdXAgPSB0aGlzLl9vcGVuUG9wdXA7XG4gICAgICBkZWxldGUgdGhpcy5fb3BlblBvcHVwO1xuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0SG9sZTogdW5kZWZpbmVkLFxuICBfbGFzdEhvbGVUb0RyYXc6IHVuZGVmaW5lZCxcbiAgYWRkSG9sZUdyb3VwICgpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IG5ldyBMLk1hcmtlckdyb3VwKCk7XG4gICAgdGhpcy5fbGFzdEhvbGUuX2lzSG9sZSA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEhvbGUuYWRkVG8odGhpcyk7XG5cbiAgICB0aGlzLl9sYXN0SG9sZS5wb3NpdGlvbiA9IHRoaXMuZ2V0TGVuZ3RoKCkgLSAxO1xuXG4gICAgdGhpcy5fbGFzdEhvbGVUb0RyYXcgPSB0aGlzLl9sYXN0SG9sZTtcblxuICAgIHJldHVybiB0aGlzLl9sYXN0SG9sZTtcbiAgfSxcbiAgZ2V0TGVuZ3RoICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGg7XG4gIH0sXG4gIHJlc2V0TGFzdEhvbGUgKCkge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gdW5kZWZpbmVkO1xuICB9LFxuICBzZXRMYXN0SG9sZSAobGF5ZXIpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IGxheWVyO1xuICB9LFxuICBnZXRMYXN0SG9sZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RIb2xlO1xuICB9LFxuICByZW1vdmUgKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChob2xlKSA9PiB7XG4gICAgICB3aGlsZSAoaG9sZS5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgaG9sZS5yZW1vdmVNYXJrZXJBdCgwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVwb3MgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBpZiAobGF5ZXIucG9zaXRpb24gPj0gcG9zaXRpb24pIHtcbiAgICAgICAgbGF5ZXIucG9zaXRpb24gLT0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVzZXRTZWxlY3Rpb24gKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgICB1cGRhdGUgKCkge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG4vLyAgICBtYXAuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZShtYXAuZWRpdFN0eWxlW21hcC5fZ2V0TW9kZVR5cGUoKV0pO1xuICAgIH1cbiAgfSk7IiwiaW1wb3J0IEJhc2VNR3JvdXAgZnJvbSAnLi4vZXh0ZW5kZWQvQmFzZU1hcmtlckdyb3VwJztcbmltcG9ydCBFZGl0TWFya2VyIGZyb20gJy4uL2VkaXQvbWFya2VyJztcbmltcG9ydCBFZGl0TGluZUdyb3VwIGZyb20gJy4uL2VkaXQvbGluZSc7XG5pbXBvcnQgRGFzaGVkRWRpdExpbmVHcm91cCBmcm9tICcuLi9kcmF3L2Rhc2hlZC1saW5lJztcblxuaW1wb3J0IHNvcnQgZnJvbSAnLi4vdXRpbHMvc29ydEJ5UG9zaXRpb24nO1xuaW1wb3J0ICogYXMgaWNvbnMgZnJvbSAnLi4vbWFya2VyLWljb25zJztcblxuTC5VdGlsLmV4dGVuZChMLkxpbmVVdGlsLCB7XG4gIC8vIENoZWNrcyB0byBzZWUgaWYgdHdvIGxpbmUgc2VnbWVudHMgaW50ZXJzZWN0LiBEb2VzIG5vdCBoYW5kbGUgZGVnZW5lcmF0ZSBjYXNlcy5cbiAgLy8gaHR0cDovL2NvbXBnZW9tLmNzLnVpdWMuZWR1L35qZWZmZS90ZWFjaGluZy8zNzMvbm90ZXMveDA2LXN3ZWVwbGluZS5wZGZcbiAgc2VnbWVudHNJbnRlcnNlY3QgKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMiwgLypQb2ludCovIHAzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMiwgcDMpICE9PVxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAxLCBwMiwgcDMpICYmXG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDEsIHAyKSAhPT1cbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMSwgcDMpO1xuICB9LFxuXG4gIC8vIGNoZWNrIHRvIHNlZSBpZiBwb2ludHMgYXJlIGluIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXJcbiAgX2NoZWNrQ291bnRlcmNsb2Nrd2lzZSAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyKSB7XG4gICAgcmV0dXJuIChwMi55IC0gcC55KSAqIChwMS54IC0gcC54KSA+IChwMS55IC0gcC55KSAqIChwMi54IC0gcC54KTtcbiAgfVxufSk7XG5cbmxldCB0dXJuT2ZmTW91c2VNb3ZlID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IEwuTWFya2VyR3JvdXAgPSBCYXNlTUdyb3VwLmV4dGVuZCh7XG4gIF9pc0hvbGU6IGZhbHNlLFxuICBfZWRpdExpbmVHcm91cDogdW5kZWZpbmVkLFxuICBfcG9zaXRpb246IHVuZGVmaW5lZCxcbiAgZGFzaGVkRWRpdExpbmVHcm91cDogbmV3IERhc2hlZEVkaXRMaW5lR3JvdXAoW10pLFxuICBvcHRpb25zOiB7XG4gICAgbUljb246IHVuZGVmaW5lZCxcbiAgICBtSG92ZXJJY29uOiB1bmRlZmluZWRcbiAgfSxcbiAgaW5pdGlhbGl6ZSAobGF5ZXJzKSB7XG4gICAgTC5MYXllckdyb3VwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF5ZXJzKTtcblxuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgICAvL3RoaXMuX2JpbmRFdmVudHMoKTtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8obWFwKTtcbiAgfSxcbiAgX3VwZGF0ZURFTGluZSAobGF0bG5nKSB7XG4gICAgdmFyIGRlTGluZSA9IHRoaXMuZ2V0REVMaW5lKCk7XG4gICAgaWYgKHRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICBkZUxpbmUudXBkYXRlKGxhdGxuZyk7XG4gICAgfVxuICAgIHJldHVybiBkZUxpbmU7XG4gIH0sXG4gIF9hZGRNYXJrZXIgKGxhdGxuZykge1xuICAgIC8vdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHRoaXMuc2V0KGxhdGxuZyk7XG4gICAgdGhpcy5nZXRERUxpbmUoKS5hZGRMYXRMbmcobGF0bG5nKTtcblxuICAgIHRoaXMuX21hcC5fY29udmVydFRvRWRpdCh0aGlzKTtcbiAgfSxcbiAgZ2V0REVMaW5lICgpIHtcbiAgICBpZiAoIXRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5fbWFwKSB7XG4gICAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8odGhpcy5fbWFwKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cDtcbiAgfSxcbiAgX3NldEhvdmVySWNvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLl9vbGRTZWxlY3RlZE1hcmtlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICB9XG4gICAgbWFwLl9zZWxlY3RlZE1hcmtlci5fc2V0SG92ZXJJY29uKHRoaXMub3B0aW9ucy5tSG92ZXJJY29uKTtcbiAgfSxcbiAgX3NvcnRCeVBvc2l0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgIGxheWVycyA9IGxheWVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLl9sZWFmbGV0X2lkIC0gYi5fbGVhZmxldF9pZDtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaWRBcnJheSA9IFtdO1xuICAgICAgdmFyIHBvc0FycmF5ID0gW107XG4gICAgICBsYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgICAgaWRBcnJheS5wdXNoKGxheWVyLl9sZWFmbGV0X2lkKTtcbiAgICAgICAgcG9zQXJyYXkucHVzaChsYXllci5fX3Bvc2l0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICBzb3J0KHRoaXMuX2xheWVycywgaWRBcnJheSk7XG4gICAgfVxuICB9LFxuICB1cGRhdGVTdHlsZSAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgIG1hcmtlci5fcmVzZXRJY29uKHRoaXMub3B0aW9ucy5tSWNvbik7XG4gICAgICBpZiAobWFya2VyID09PSB0aGlzLl9tYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICAgIHRoaXMuX3NldEhvdmVySWNvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2V0U2VsZWN0ZWQgKG1hcmtlcikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQgJiYgdGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gdGhpcy5nZXRMYXN0KCk7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gbWFya2VyO1xuICB9LFxuICByZXNldFNlbGVjdGVkICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9LFxuICBnZXRTZWxlY3RlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fc2VsZWN0ZWRNYXJrZXI7XG4gIH0sXG4gIF9zZXRGaXJzdCAobWFya2VyKSB7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIuX3NldEZpcnN0SWNvbigpO1xuICB9LFxuICBnZXRGaXJzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpcnN0TWFya2VyO1xuICB9LFxuICBnZXRMYXN0ICgpIHtcbiAgICBpZiAodGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICAgIHJldHVybiBsYXllcnNbbGF5ZXJzLmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgfSxcbiAgaGFzRmlyc3RNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpcnN0KCkgJiYgdGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKTtcbiAgfSxcbiAgY29udmVydFRvTGF0TG5ncyAoKSB7XG4gICAgdmFyIGxhdGxuZ3MgPSBbXTtcbiAgICB0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICAgIGlmICghbGF5ZXIuaXNNaWRkbGUoKSkge1xuICAgICAgICBsYXRsbmdzLnB1c2gobGF5ZXIuZ2V0TGF0TG5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsYXRsbmdzO1xuICB9LFxuICByZXN0b3JlIChsYXllcikge1xuICAgIHRoaXMuc2V0QWxsKGxheWVyLl9sYXRsbmdzKTtcbiAgICB0aGlzLnNldEFsbEhvbGVzKGxheWVyLl9ob2xlcyk7XG4gIH0sXG4gIF9hZGQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSkge1xuICAgICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgICBvcHRpb25zLmljb24gPSBpY29ucy5maXJzdEljb247XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5hZGRNYXJrZXIobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmdldERFTGluZSgpLmFkZExhdExuZyhsYXRsbmcpO1xuXG4gICAgLy90aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICB0dXJuT2ZmTW91c2VNb3ZlID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICBpZighdHVybk9mZk1vdXNlTW92ZSkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURFTGluZShlLmxhdGxuZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdHVybk9mZk1vdXNlTW92ZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldERFTGluZSgpLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKG1hcmtlci5fbUdyb3VwLmdldExheWVycygpLmxlbmd0aCA+IDIpIHtcbiAgICAgIGlmIChtYXJrZXIuX21Hcm91cC5fZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpICYmIG1hcmtlciA9PT0gbWFya2VyLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBfY2xvc2VzdE5vdE1pZGRsZU1hcmtlciAobGF5ZXJzLCBwb3NpdGlvbiwgZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIChsYXllcnNbcG9zaXRpb25dLmlzTWlkZGxlKCkpID8gbGF5ZXJzW3Bvc2l0aW9uICsgZGlyZWN0aW9uXSA6IGxheWVyc1twb3NpdGlvbl07XG4gIH0sXG4gIF9zZXRQcmV2TmV4dCAobWFya2VyLCBwb3NpdGlvbikge1xuICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgdmFyIG1heExlbmd0aCA9IGxheWVycy5sZW5ndGggLSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gMSkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIHBvc2l0aW9uIC0gMSwgLTEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIDIsIDEpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09IG1heExlbmd0aCkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIG1heExlbmd0aCAtIDEsIC0xKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIobGF5ZXJzLCAwLCAxKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVQcmV2ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gbGF5ZXJzW3Bvc2l0aW9uIC0gMV07XG4gICAgICB9XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVOZXh0ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gbGF5ZXJzW3Bvc2l0aW9uICsgMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0TWlkZGxlTWFya2VyIChwb3NpdGlvbikge1xuICAgIHRoaXMuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7aWNvbjogaWNvbnMubWlkZGxlSWNvbn0pO1xuICB9LFxuICBzZXRNaWRkbGVNYXJrZXJzIChwb3NpdGlvbikge1xuICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKHBvc2l0aW9uKTtcbiAgICB0aGlzLnNldE1pZGRsZU1hcmtlcihwb3NpdGlvbiArIDIpO1xuICB9LFxuICBzZXQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZykpIHtcbiAgICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZGQobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG4gICAgfVxuICB9LFxuICBzZXRNaWRkbGUgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiA8IDApID8gMCA6IHBvc2l0aW9uO1xuXG4gICAgLy92YXIgZnVuYyA9ICh0aGlzLl9pc0hvbGUpID8gJ3NldCcgOiAnc2V0SG9sZU1hcmtlcic7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuc2V0KGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpO1xuXG4gICAgbWFya2VyLl9zZXRNaWRkbGVJY29uKCk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0QWxsIChsYXRsbmdzKSB7XG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIHBvc2l0aW9uKSA9PiB7XG4gICAgICB0aGlzLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICB9LFxuICBzZXRBbGxIb2xlcyAoaG9sZXMpIHtcbiAgICBob2xlcy5mb3JFYWNoKChob2xlKSA9PiB7XG4gICAgICAvL3RoaXMuc2V0KGhvbGUpO1xuICAgICAgdmFyIGxhc3RIR3JvdXAgPSB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5hZGRIb2xlR3JvdXAoKTtcblxuICAgICAgaG9sZS5fZWFjaCgobGF0bG5nLCBwb3NpdGlvbikgPT4ge1xuICAgICAgICBsYXN0SEdyb3VwLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgLy92YXIgbGVuZ3RoID0gaG9sZS5sZW5ndGg7XG4gICAgICAvL3ZhciBpID0gMDtcbiAgICAgIC8vZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgLy8gIGxhc3RIR3JvdXAuc2V0KGhvbGVbaV0sIGkpO1xuICAgICAgLy99XG5cbiAgICAgIGxhc3RIR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgIH0pO1xuICB9LFxuICBzZXRIb2xlTWFya2VyIChsYXRsbmcsIG9wdGlvbnMgPSB7aXNIb2xlTWFya2VyOiB0cnVlLCBob2xlUG9zaXRpb246IHt9fSkge1xuICAgIHZhciBtYXJrZXIgPSBuZXcgRWRpdE1hcmtlcih0aGlzLCBsYXRsbmcsIG9wdGlvbnMgfHwge30pO1xuICAgIG1hcmtlci5hZGRUbyh0aGlzKTtcblxuICAgIC8vdGhpcy5zZXRTZWxlY3RlZChtYXJrZXIpO1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSAmJiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5fc2V0Rmlyc3QobWFya2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICByZW1vdmVIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIC8vcmVtb3ZlIGVkaXQgbGluZVxuICAgIC8vdGhpcy5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3JlbW92ZSBlZGl0IG1hcmtlcnNcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAvL3JlbW92ZSBob2xlXG4gICAgbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZXMoKS5zcGxpY2UodGhpcy5fcG9zaXRpb24sIDEpO1xuICAgIG1hcC5nZXRFUG9seWdvbigpLnJlZHJhdygpO1xuXG4gICAgLy9yZWRyYXcgaG9sZXNcbiAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGVzKCk7XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbWFwLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2ldKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRFTWFya2VyID0gdGhpcy5nZXRTZWxlY3RlZCgpO1xuICAgIHZhciBtYXJrZXJMYXllcnNBcnJheSA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhdGxuZyA9IHNlbGVjdGVkRU1hcmtlci5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVtb3ZlTGF5ZXIoc2VsZWN0ZWRFTWFya2VyKTtcblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfbWFya2VyJywge2xhdGxuZzogbGF0bG5nfSk7XG4gICAgfVxuXG4gICAgbWFya2VyTGF5ZXJzQXJyYXkgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gcmVtb3ZlIGxhc3QgcG9pbnRcbiAgICAgICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUhvbGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3NlbGVjdGVkRU1hcmtlciA9IG1hcC5nZXRTZWxlY3RlZE1hcmtlcigpO1xuICAgICAgICAgIHZhciBob2xlUG9zaXRpb24gPSBzZWxlY3RlZEVNYXJrZXIub3B0aW9ucy5ob2xlUG9zaXRpb247XG5cbiAgICAgICAgICAvL3JlbW92ZSBob2xlIHBvaW50XG4gICAgICAgICAgLy9tYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlKHRoaXMuX3Bvc2l0aW9uKS5zcGxpY2UoaG9sZVBvc2l0aW9uLmhNYXJrZXIsIDEpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGUodGhpcy5fcG9zaXRpb24pLnNwbGljZShzZWxlY3RlZEVNYXJrZXIuX19wb3NpdGlvbiwgMSk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkucmVkcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICAgICAgbGF5ZXIub3B0aW9ucy5ob2xlUG9zaXRpb24gPSB7XG4gICAgICAgICAgICBoR3JvdXA6IHRoaXMuX3Bvc2l0aW9uLFxuICAgICAgICAgICAgaE1hcmtlcjogX3Bvc2l0aW9uKytcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICAvLyBubyBuZWVkIHRvIHJlbW92ZSBsYXN0IHBvaW50XG4gICAgICAgIGlmIChtYXJrZXJMYXllcnNBcnJheS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgLy9yZW1vdmUgZWRpdCBtYXJrZXJzXG4gICAgICAgICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIub3B0aW9ucy50aXRsZSA9IHBvc2l0aW9uO1xuICAgICAgbGF5ZXIuX19wb3NpdGlvbiA9IHBvc2l0aW9uKys7XG4gICAgfSk7XG4gIH0sXG4gIGdldFBvaW50c0ZvckludGVyc2VjdGlvbiAocG9seWdvbikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICB2YXIgbGF5ZXJzID0gKChwb2x5Z29uKSA/IHBvbHlnb24uZ2V0TGF5ZXJzKCkgOiB0aGlzLmdldExheWVycygpKS5maWx0ZXIoKGwpID0+ICFsLmlzTWlkZGxlKCkpO1xuXG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICBsYXllcnMuX2VhY2goKGxheWVyKSA9PiB7XG4gICAgICB2YXIgbGF0bG5nID0gbGF5ZXIuZ2V0TGF0TG5nKCk7XG4gICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5wdXNoKHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIXBvbHlnb24pIHtcbiAgICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1swXSkgeyAvLyBwb2ludCBpcyBmaXJzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLnNsaWNlKDEpO1xuICAgICAgfSBlbHNlIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1tsYXllcnMubGVuZ3RoIC0gMV0pIHsgLy8gcG9pbnQgaXMgbGFzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgfSBlbHNlIHsgLy8gcG9pbnQgaXMgbm90IGZpcnN0IC8gbGFzdFxuICAgICAgICB2YXIgdG1wQXJyUG9pbnRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT09IGxheWVyc1tpXSkge1xuICAgICAgICAgICAgdG1wQXJyUG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMuc3BsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gdG1wQXJyUG9pbnRzLmNvbmNhdCh0aGlzLl9vcmlnaW5hbFBvaW50cyk7XG4gICAgICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vcmlnaW5hbFBvaW50cztcbiAgfSxcbiAgX2JpbmRMaW5lRXZlbnRzOiB1bmRlZmluZWQsXG4gIF9oYXNJbnRlcnNlY3Rpb24gKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKSB7XG4gICAgdmFyIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwLFxuICAgICAgbGFzdFBvaW50ID0gcG9pbnRzID8gcG9pbnRzW2xlbiAtIDFdIDogbnVsbCxcbiAgICAvLyBUaGUgcHJldmlvdXMgcHJldmlvdXMgbGluZSBzZWdtZW50LiBQcmV2aW91cyBsaW5lIHNlZ21lbnQgZG9lc24ndCBuZWVkIHRlc3RpbmcuXG4gICAgICBtYXhJbmRleCA9IGxlbiAtIDI7XG5cbiAgICBpZiAodGhpcy5fdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uKDEpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpbmVTZWdtZW50c0ludGVyc2VjdHNSYW5nZShsYXN0UG9pbnQsIG5ld1BvaW50LCBtYXhJbmRleCwgaXNGaW5pc2gpO1xuICB9LFxuXG4gIF9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZSAocG9pbnRzLCBuZXdQb2ludCwgbGFzdFBvaW50KSB7XG4gICAgdmFyIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwLFxuICAgIC8vbGFzdFBvaW50ID0gcG9pbnRzID8gcG9pbnRzW2xlbiAtIDFdIDogbnVsbCxcbiAgICAvLyBUaGUgcHJldmlvdXMgcHJldmlvdXMgbGluZSBzZWdtZW50LiBQcmV2aW91cyBsaW5lIHNlZ21lbnQgZG9lc24ndCBuZWVkIHRlc3RpbmcuXG4gICAgICBtYXhJbmRleCA9IGxlbiAtIDI7XG5cbiAgICBpZiAodGhpcy5fdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uKDEpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpbmVIb2xlU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UobGFzdFBvaW50LCBuZXdQb2ludCk7XG4gIH0sXG5cbiAgaGFzSW50ZXJzZWN0aW9uIChsYXRsbmcsIGlzRmluaXNoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3UG9pbnQgPSBtYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyk7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oKTtcblxuICAgIHZhciByc2x0MSA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbihwb2ludHMsIG5ld1BvaW50LCBpc0ZpbmlzaCk7XG4gICAgdmFyIHJzbHQyID0gZmFsc2U7XG5cbiAgICB2YXIgZk1hcmtlciA9IHRoaXMuZ2V0Rmlyc3QoKTtcbiAgICBpZiAoZk1hcmtlciAmJiAhZk1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIC8vIGNvZGUgd2FzIGR1YmxpY2F0ZWQgdG8gY2hlY2sgaW50ZXJzZWN0aW9uIGZyb20gYm90aCBzaWRlc1xuICAgICAgLy8gKHRoZSBtYWluIGlkZWEgdG8gcmV2ZXJzZSBhcnJheSBvZiBwb2ludHMgYW5kIGNoZWNrIGludGVyc2VjdGlvbiBhZ2FpbilcblxuICAgICAgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oKS5yZXZlcnNlKCk7XG4gICAgICByc2x0MiA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbihwb2ludHMsIG5ld1BvaW50LCBpc0ZpbmlzaCk7XG4gICAgfVxuXG4gICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdDEgfHwgcnNsdDIpO1xuICAgIHZhciBlZGdlc0ludGVyc2VjdGVkID0gbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcbiAgICByZXR1cm4gZWRnZXNJbnRlcnNlY3RlZDtcbiAgfSxcbiAgaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUgKGxBcnJheSwgaG9sZSkge1xuXG4gICAgaWYgKHRoaXMuX21hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5ld1BvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsQXJyYXlbMF0pO1xuICAgIHZhciBsYXN0UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVsxXSk7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oaG9sZSk7XG5cbiAgICB2YXIgcnNsdDEgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpO1xuXG4gICAgLy8gY29kZSB3YXMgZHVibGljYXRlZCB0byBjaGVjayBpbnRlcnNlY3Rpb24gZnJvbSBib3RoIHNpZGVzXG4gICAgLy8gKHRoZSBtYWluIGlkZWEgdG8gcmV2ZXJzZSBhcnJheSBvZiBwb2ludHMgYW5kIGNoZWNrIGludGVyc2VjdGlvbiBhZ2FpbilcblxuICAgIHBvaW50cyA9IHRoaXMuZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uKGhvbGUpLnJldmVyc2UoKTtcbiAgICBsYXN0UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVsyXSk7XG4gICAgdmFyIHJzbHQyID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUocG9pbnRzLCBuZXdQb2ludCwgbGFzdFBvaW50KTtcblxuICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKHJzbHQxIHx8IHJzbHQyKTtcbiAgICB2YXIgZWRnZXNJbnRlcnNlY3RlZCA9IHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKCk7XG5cbiAgICByZXR1cm4gZWRnZXNJbnRlcnNlY3RlZDtcbiAgfSxcbiAgX3Rvb0Zld1BvaW50c0ZvckludGVyc2VjdGlvbiAoZXh0cmFQb2ludHMpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXG4gICAgICBsZW4gPSBwb2ludHMgPyBwb2ludHMubGVuZ3RoIDogMDtcbiAgICAvLyBJbmNyZW1lbnQgbGVuZ3RoIGJ5IGV4dHJhUG9pbnRzIGlmIHByZXNlbnRcbiAgICBsZW4gKz0gZXh0cmFQb2ludHMgfHwgMDtcblxuICAgIHJldHVybiAhdGhpcy5fb3JpZ2luYWxQb2ludHMgfHwgbGVuIDw9IDM7XG4gIH0sXG4gIF9saW5lSG9sZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlIChwLCBwMSkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cywgcDIsIHAzO1xuXG4gICAgZm9yICh2YXIgaiA9IHBvaW50cy5sZW5ndGggLSAxOyBqID4gMDsgai0tKSB7XG4gICAgICBwMiA9IHBvaW50c1tqIC0gMV07XG4gICAgICBwMyA9IHBvaW50c1tqXTtcblxuICAgICAgaWYgKEwuTGluZVV0aWwuc2VnbWVudHNJbnRlcnNlY3QocCwgcDEsIHAyLCBwMykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBfbGluZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlIChwLCBwMSwgbWF4SW5kZXgsIGlzRmluaXNoKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLFxuICAgICAgcDIsIHAzO1xuXG4gICAgdmFyIG1pbiA9IGlzRmluaXNoID8gMSA6IDA7XG4gICAgLy8gQ2hlY2sgYWxsIHByZXZpb3VzIGxpbmUgc2VnbWVudHMgKGJlc2lkZSB0aGUgaW1tZWRpYXRlbHkgcHJldmlvdXMpIGZvciBpbnRlcnNlY3Rpb25zXG4gICAgZm9yICh2YXIgaiA9IG1heEluZGV4OyBqID4gbWluOyBqLS0pIHtcbiAgICAgIHAyID0gcG9pbnRzW2ogLSAxXTtcbiAgICAgIHAzID0gcG9pbnRzW2pdO1xuXG4gICAgICBpZiAoTC5MaW5lVXRpbC5zZWdtZW50c0ludGVyc2VjdChwLCBwMSwgcDIsIHAzKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9pc01hcmtlckluUG9seWdvbiAobWFya2VyKSB7XG4gICAgdmFyIGogPSAwO1xuXG4gICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIHNpZGVzID0gbGF5ZXJzLmxlbmd0aDtcblxuICAgIHZhciB4ID0gbWFya2VyLmxuZztcbiAgICB2YXIgeSA9IG1hcmtlci5sYXQ7XG5cbiAgICB2YXIgaW5Qb2x5ID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZGVzOyBpKyspIHtcbiAgICAgIGorKztcbiAgICAgIGlmIChqID09IHNpZGVzKSB7XG4gICAgICAgIGogPSAwO1xuICAgICAgfVxuICAgICAgdmFyIHBvaW50MSA9IGxheWVyc1tpXS5nZXRMYXRMbmcoKTtcbiAgICAgIHZhciBwb2ludDIgPSBsYXllcnNbal0uZ2V0TGF0TG5nKCk7XG4gICAgICBpZiAoKChwb2ludDEubGF0IDwgeSkgJiYgKHBvaW50Mi5sYXQgPj0geSkpIHx8ICgocG9pbnQyLmxhdCA8IHkpICYmIChwb2ludDEubGF0ID49IHkpKSkge1xuICAgICAgICBpZiAocG9pbnQxLmxuZyArICh5IC0gcG9pbnQxLmxhdCkgLyAocG9pbnQyLmxhdCAtIHBvaW50MS5sYXQpICogKHBvaW50Mi5sbmcgLSBwb2ludDEubG5nKSA8IHgpIHtcbiAgICAgICAgICBpblBvbHkgPSAhaW5Qb2x5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5Qb2x5O1xuICB9XG59KTsiLCJpbXBvcnQgVG9vbHRpcCBmcm9tICcuLi9leHRlbmRlZC9Ub29sdGlwJztcbmltcG9ydCB7Zmlyc3RJY29uLGljb24sZHJhZ0ljb24sbWlkZGxlSWNvbixob3Zlckljb24saW50ZXJzZWN0aW9uSWNvbn0gZnJvbSAnLi4vbWFya2VyLWljb25zJztcblxudmFyIHNpemUgPSAxO1xudmFyIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuaWYgKHVzZXJBZ2VudC5pbmRleE9mKFwiaXBhZFwiKSAhPT0gLTEgfHwgdXNlckFnZW50LmluZGV4T2YoXCJpcGhvbmVcIikgIT09IC0xKSB7XG4gIHNpemUgPSAyO1xufVxuXG52YXIgdG9vbHRpcDtcbnZhciBkcmFnZW5kID0gZmFsc2U7XG52YXIgX21hcmtlclRvRGVsZXRlR3JvdXAgPSBudWxsO1xuXG5leHBvcnQgZGVmYXVsdCBMLk1hcmtlci5leHRlbmQoe1xuICBfZHJhZ2dhYmxlOiB1bmRlZmluZWQsIC8vIGFuIGluc3RhbmNlIG9mIEwuRHJhZ2dhYmxlXG4gIF9vbGRMYXRMbmdTdGF0ZTogdW5kZWZpbmVkLFxuICBpbml0aWFsaXplIChncm91cCwgbGF0bG5nLCBvcHRpb25zID0ge30pIHtcblxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7XG4gICAgICBpY29uOiBpY29uLFxuICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgTC5NYXJrZXIucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmcsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fbUdyb3VwID0gZ3JvdXA7XG5cbiAgICB0aGlzLl9pc0ZpcnN0ID0gZ3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwO1xuICB9LFxuICByZW1vdmVHcm91cCAoKSB7XG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlSG9sZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlKCk7XG4gICAgfVxuICB9LFxuICByZW1vdmUgKCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHRoaXMuX21Hcm91cC5yZW1vdmVTZWxlY3RlZCgpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlSG9sZSAoKSB7IC8vIGRlcHJlY2F0ZWRcbiAgICB0aGlzLnJlbW92ZUdyb3VwKCk7XG4gIH0sXG4gIG5leHQgKCkge1xuICAgIHZhciBuZXh0ID0gdGhpcy5fbmV4dC5fbmV4dDtcbiAgICBpZiAoIXRoaXMuX25leHQuaXNNaWRkbGUoKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX25leHQ7XG4gICAgfVxuICAgIHJldHVybiBuZXh0O1xuICB9LFxuICBwcmV2ICgpIHtcbiAgICB2YXIgcHJldiA9IHRoaXMuX3ByZXYuX3ByZXY7XG4gICAgaWYgKCF0aGlzLl9wcmV2LmlzTWlkZGxlKCkpIHtcbiAgICAgIHByZXYgPSB0aGlzLl9wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gcHJldjtcbiAgfSxcbiAgY2hhbmdlUHJldk5leHRQb3MgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2LmlzTWlkZGxlKCkpIHtcblxuICAgICAgdmFyIHByZXZMYXRMbmcgPSB0aGlzLl9tR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLnByZXYoKSwgdGhpcyk7XG4gICAgICB2YXIgbmV4dExhdExuZyA9IHRoaXMuX21Hcm91cC5fZ2V0TWlkZGxlTGF0TG5nKHRoaXMsIHRoaXMubmV4dCgpKTtcblxuICAgICAgdGhpcy5fcHJldi5zZXRMYXRMbmcocHJldkxhdExuZyk7XG4gICAgICB0aGlzLl9uZXh0LnNldExhdExuZyhuZXh0TGF0TG5nKTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBjaGFuZ2UgZXZlbnRzIGZvciBtYXJrZXIgKGV4YW1wbGU6IGhvbGUpXG4gICAqL1xuICAgIHJlc2V0RXZlbnRzIChjYWxsYmFjaykge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0sXG4gIF9wb3NIYXNoICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJldi5wb3NpdGlvbiArICdfJyArIHRoaXMucG9zaXRpb24gKyAnXycgKyB0aGlzLl9uZXh0LnBvc2l0aW9uO1xuICB9LFxuICBfcmVzZXRJY29uIChfaWNvbikge1xuICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaWMgPSBfaWNvbiB8fCBpY29uO1xuXG4gICAgdGhpcy5zZXRJY29uKGljKTtcbiAgICB0aGlzLnByZXYoKS5zZXRJY29uKGljKTtcbiAgICB0aGlzLm5leHQoKS5zZXRJY29uKGljKTtcbiAgfSxcbiAgX3NldEhvdmVySWNvbiAoX2hJY29uKSB7XG4gICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0SWNvbihfaEljb24gfHwgaG92ZXJJY29uKTtcbiAgfSxcbiAgX2FkZEljb25DbGFzcyAoY2xhc3NOYW1lKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2ljb24sIGNsYXNzTmFtZSk7XG4gIH0sXG4gIF9yZW1vdmVJY29uQ2xhc3MgKGNsYXNzTmFtZSkge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9pY29uLCBjbGFzc05hbWUpO1xuICB9LFxuICBfc2V0SW50ZXJzZWN0aW9uSWNvbiAoKSB7XG4gICAgdmFyIGljb25DbGFzcyA9IGludGVyc2VjdGlvbkljb24ub3B0aW9ucy5jbGFzc05hbWU7XG4gICAgdmFyIGNsYXNzTmFtZSA9ICdtLWVkaXRvci1kaXYtaWNvbic7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKGNsYXNzTmFtZSk7XG4gICAgdGhpcy5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG5cbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQgPSB0aGlzLnByZXYoKTtcbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG5cbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQgPSB0aGlzLm5leHQoKTtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG4gIH0sXG4gIF9zZXRGaXJzdEljb24gKCkge1xuICAgIHRoaXMuX2lzRmlyc3QgPSB0cnVlO1xuICAgIHRoaXMuc2V0SWNvbihmaXJzdEljb24pO1xuICB9LFxuICBfaGFzRmlyc3RJY29uICgpIHtcbiAgICByZXR1cm4gdGhpcy5faWNvbiAmJiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWRpdi1pY29uLWZpcnN0Jyk7XG4gIH0sXG4gIF9zZXRNaWRkbGVJY29uICgpIHtcbiAgICB0aGlzLnNldEljb24obWlkZGxlSWNvbik7XG4gIH0sXG4gIGlzTWlkZGxlICgpIHtcbiAgICByZXR1cm4gdGhpcy5faWNvbiAmJiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbicpXG4gICAgICAmJiAhTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdsZWFmbGV0LWRyYWctdGFyZ2V0Jyk7XG4gIH0sXG4gIF9zZXREcmFnSWNvbiAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbicpO1xuICAgIHRoaXMuc2V0SWNvbihkcmFnSWNvbik7XG4gIH0sXG4gIGlzUGxhaW4gKCkge1xuICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWRpdi1pY29uJykgfHwgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgfSxcbiAgX29uY2VDbGljayAoKSB7XG4gICAgaWYgKHRoaXMuX2lzRmlyc3QpIHtcbiAgICAgIHRoaXMub25jZSgnY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG5cbiAgICAgICAgaWYgKG1Hcm91cC5fbWFya2Vycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgdGhpcy5fb25jZUNsaWNrKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhdGxuZyA9IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgICAgIHRoaXMuX21hcC5fc3RvcmVkTGF5ZXJQb2ludCA9IGUudGFyZ2V0O1xuXG4gICAgICAgIHZhciBoYXNJbnRlcnNlY3Rpb24gPSBtR3JvdXAuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZyk7XG5cbiAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgIC8vbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICAgICAgICB0aGlzLl9vbmNlQ2xpY2soKTsgLy8gYmluZCAnb25jZScgYWdhaW4gdW50aWwgaGFzIGludGVyc2VjdGlvblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2lzRmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnNldEljb24oaWNvbik7XG4gICAgICAgICAgLy9tR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpfX2pvaW5fcGF0aCcsIHsgbUdyb3VwOiBtR3JvdXAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgX2RldGVjdEdyb3VwRGVsZXRlKCkge1xuICAgIGxldCBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICB2YXIgc2VsZWN0ZWRNR3JvdXAgPSBtYXAuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUgfHwgIXRoaXMuaXNQbGFpbigpIHx8IChzZWxlY3RlZE1Hcm91cCAmJiBzZWxlY3RlZE1Hcm91cC5oYXNGaXJzdE1hcmtlcigpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICBfbWFya2VyVG9EZWxldGVHcm91cCA9IG51bGw7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKF9tYXJrZXJUb0RlbGV0ZUdyb3VwICYmIHRoaXMuX2xlYWZsZXRfaWQgPT09IF9tYXJrZXJUb0RlbGV0ZUdyb3VwLl9sZWFmbGV0X2lkKSB7XG4gICAgICBpZiAodGhpcy5fbGF0bG5nLmxhdCAhPT0gX21hcmtlclRvRGVsZXRlR3JvdXAuX2xhdGxuZy5sYXQgfHwgdGhpcy5fbGF0bG5nLmxuZyAhPT0gX21hcmtlclRvRGVsZXRlR3JvdXAuX2xhdGxuZy5sbmcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtYXAub3B0aW9ucy5ub3RpZnlDbGlja01hcmtlckRlbGV0ZVBvbHlnb24pIHtcbiAgICAgIGlmIChzZWxlY3RlZE1Hcm91cCAmJiAhc2VsZWN0ZWRNR3JvdXAuX2lzSG9sZSkge1xuXG4gICAgICAgIC8qIHRvZG86IHJlZmFjdG9yaW5nICovXG4gICAgICAgIGxldCBwbGFpbk1hcmtlcnNMZW4gPSBzZWxlY3RlZE1Hcm91cC5nZXRMYXllcnMoKS5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtLl9pY29uKS5oYXNDbGFzcygnbS1lZGl0b3ItZGl2LWljb24nKTtcbiAgICAgICAgfSkubGVuZ3RoO1xuXG4gICAgICAgIGlmIChwbGFpbk1hcmtlcnNMZW4gPT09IDMpIHtcbiAgICAgICAgICBpZiAoX21hcmtlclRvRGVsZXRlR3JvdXAgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIF9tYXJrZXJUb0RlbGV0ZUdyb3VwID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfbWFya2VyVG9EZWxldGVHcm91cCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgaXNBY2NlcHRlZFRvRGVsZXRlKCkge1xuICAgIHJldHVybiBfbWFya2VyVG9EZWxldGVHcm91cCA9PT0gdGhpcyAmJiB0aGlzLmlzU2VsZWN0ZWRJbkdyb3VwKCk7XG4gIH0sXG4gIF9iaW5kQ29tbW9uRXZlbnRzICgpIHtcbiAgICB0aGlzLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgICBpZiAodGhpcy5fZGV0ZWN0R3JvdXBEZWxldGUoKSkge1xuICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmFjY2VwdERlbGV0aW9uLCAnZXJyb3InLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9tYXAuX3N0b3JlZExheWVyUG9pbnQgPSBlLnRhcmdldDtcblxuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcblxuICAgICAgaWYgKG1Hcm91cC5oYXNGaXJzdE1hcmtlcigpICYmIHRoaXMgIT09IG1Hcm91cC5nZXRGaXJzdCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpICYmIHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb24odGhpcy5nZXRMYXRMbmcoKSwgdHJ1ZSkpIHtcbiAgICAgICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cblxuICAgICAgaWYgKG1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcblxuICAgICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICAgICAgbWFwLm1zZ0hlbHBlci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvQWRkTmV3RWRnZXMsIG51bGwsIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hcC5tc2dIZWxwZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMsIG51bGwsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7IC8vYWRkIGVkZ2VcbiAgICAgICAgbUdyb3VwLnNldE1pZGRsZU1hcmtlcnModGhpcy5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3Jlc2V0SWNvbihpY29uKTtcbiAgICAgICAgbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzLCBudWxsLCB0aGlzKTtcbiAgICAgICAgX21hcmtlclRvRGVsZXRlR3JvdXAgPSBudWxsO1xuICAgICAgfSBlbHNlIHsgLy9yZW1vdmUgZWRnZVxuICAgICAgICBpZiAoIW1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZHJhZ2VuZCkge1xuICAgICAgICAgIG1hcC5tc2dIZWxwZXIuaGlkZSgpO1xuXG4gICAgICAgICAgdmFyIHJzbHRJbnRlcnNlY3Rpb24gPSB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oeyB0YXJnZXQ6IHsgX2xhdGxuZzogbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcy5wcmV2KCksIHRoaXMubmV4dCgpKSB9IH0pO1xuXG4gICAgICAgICAgaWYgKHJzbHRJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgICAgICAgICAgbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IobWFwLm9wdGlvbnMudGV4dC5kZWxldGVQb2ludEludGVyc2VjdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aWV3RXJyb3JMaW5lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9sZExhdExuZyA9IHRoaXMuZ2V0TGF0TG5nKCk7XG5cbiAgICAgICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgIG1Hcm91cC5yZW1vdmVNYXJrZXIodGhpcyk7XG5cbiAgICAgICAgICBpZiAoIW1Hcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXdMYXRMbmcgPSBuZXh0TWFya2VyLl9wcmV2LmdldExhdExuZygpO1xuXG4gICAgICAgICAgICBpZiAobmV3TGF0TG5nLmxhdCA9PT0gb2xkTGF0TG5nLmxhdCAmJiBuZXdMYXRMbmcubG5nID09PSBvbGRMYXRMbmcubG5nKSB7XG4gICAgICAgICAgICAgIG1hcC5tc2dIZWxwZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzLCBudWxsLCBuZXh0TWFya2VyLl9wcmV2KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbUdyb3VwLnNldFNlbGVjdGVkKG5leHRNYXJrZXIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOmhvbGVfZGVsZXRlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOmRlbGV0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcC5tc2dIZWxwZXIuaGlkZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBpZiAodGhpcy5fbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzLl9tR3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMikge1xuICAgICAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzID09PSB0aGlzLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCB7IG1hcmtlcjogdGhpcyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pc0FjY2VwdGVkVG9EZWxldGUoKSkge1xuICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmFjY2VwdERlbGV0aW9uLCAnZXJyb3InLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLm9uKCdtb3VzZW91dCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vbmNlQ2xpY2soKTtcblxuICAgIHRoaXMub24oJ2RibGNsaWNrJywgKCkgPT4ge1xuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcbiAgICAgIGlmIChtR3JvdXAgJiYgbUdyb3VwLmdldEZpcnN0KCkgJiYgbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzID09PSBtR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICBtR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgICAgICAgIC8vdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpfX2pvaW5fcGF0aCcsIHttYXJrZXI6IHRoaXN9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZycsIChlKSA9PiB7XG4gICAgICB2YXIgbWFya2VyID0gZS50YXJnZXQ7XG5cbiAgICAgIG1hcmtlci5jaGFuZ2VQcmV2TmV4dFBvcygpO1xuXG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuXG4gICAgICB0aGlzLl9zZXREcmFnSWNvbigpO1xuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRyYWdfbWFya2VyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnZW5kJywgKCkgPT4ge1xuXG4gICAgICB0aGlzLl9tR3JvdXAuc2VsZWN0KCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmRyYWdlbmRfbWFya2VyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG5cbiAgICAgIGRyYWdlbmQgPSB0cnVlO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGRyYWdlbmQgPSBmYWxzZTtcbiAgICAgIH0sIDIwMCk7XG5cbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgIH0pO1xuICB9LFxuICBfaXNJbnNpZGVIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmdldExheWVycygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBob2xlID0gaG9sZXNbaV07XG4gICAgICBpZiAodGhpcy5fbUdyb3VwICE9PSBob2xlKSB7XG4gICAgICAgIGlmIChob2xlLl9pc01hcmtlckluUG9seWdvbih0aGlzLmdldExhdExuZygpKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2lzT3V0c2lkZU9mUG9seWdvbiAocG9seWdvbikge1xuICAgIHJldHVybiAhcG9seWdvbi5faXNNYXJrZXJJblBvbHlnb24odGhpcy5nZXRMYXRMbmcoKSk7XG4gIH0sXG4gIF9kZXRlY3RJbnRlcnNlY3Rpb24gKGUpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGxhdGxuZyA9IChlID09PSB1bmRlZmluZWQpID8gdGhpcy5nZXRMYXRMbmcoKSA6IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgdmFyIGlzT3V0c2lkZU9mUG9seWdvbiA9IGZhbHNlO1xuICAgIHZhciBpc0luc2lkZU9mSG9sZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgaXNPdXRzaWRlT2ZQb2x5Z29uID0gdGhpcy5faXNPdXRzaWRlT2ZQb2x5Z29uKG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgICAgaXNJbnNpZGVPZkhvbGUgPSB0aGlzLl9pc0luc2lkZUhvbGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNJbnNpZGVPZkhvbGUgPSB0aGlzLl9pc0luc2lkZUhvbGUoKTtcbiAgICB9XG5cbiAgICB2YXIgcnNsdCA9IGlzSW5zaWRlT2ZIb2xlIHx8IGlzT3V0c2lkZU9mUG9seWdvbiB8fCB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZykgfHwgdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzKGUpO1xuXG4gICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdCk7XG4gICAgaWYgKHJzbHQpIHtcbiAgICAgIHRoaXMuX21hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcC5lZGdlc0ludGVyc2VjdGVkKCk7XG4gIH0sXG4gIF9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMgKGUpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwLCBoYXNJbnRlcnNlY3Rpb24gPSBmYWxzZSwgaG9sZSwgbGF0bG5nID0gKGUgPT09IHVuZGVmaW5lZCkgPyB0aGlzLmdldExhdExuZygpIDogZS50YXJnZXQuX2xhdGxuZztcbiAgICB2YXIgaG9sZXMgPSBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgdmFyIHByZXZQb2ludCA9IHRoaXMucHJldigpO1xuICAgIHZhciBuZXh0UG9pbnQgPSB0aGlzLm5leHQoKTtcblxuICAgIGlmIChwcmV2UG9pbnQgPT0gbnVsbCAmJiBuZXh0UG9pbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWNvbmRQb2ludCA9IHByZXZQb2ludC5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbGFzdFBvaW50ID0gbmV4dFBvaW50LmdldExhdExuZygpO1xuICAgIHZhciBsYXllcnMsIHRtcEFycmF5ID0gW107XG5cbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaG9sZSA9IGhvbGVzW2ldO1xuICAgICAgICBpZiAoaG9sZSAhPT0gdGhpcy5fbUdyb3VwKSB7XG4gICAgICAgICAgaGFzSW50ZXJzZWN0aW9uID0gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBob2xlKTtcbiAgICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBjaGVjayB0aGF0IGhvbGUgaXMgaW5zaWRlIG9mIG90aGVyIGhvbGVcbiAgICAgICAgICB0bXBBcnJheSA9IFtdO1xuICAgICAgICAgIGxheWVycyA9IGhvbGUuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgICAgICBsYXllcnMuX2VhY2goKGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbUdyb3VwLl9pc01hcmtlckluUG9seWdvbihsYXllci5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICAgICAgdG1wQXJyYXkucHVzaChcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICh0bXBBcnJheS5sZW5ndGggPT09IGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgZU1hcmtlcnNHcm91cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFzSW50ZXJzZWN0aW9uID0gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBob2xlc1tpXSk7XG5cbiAgICAgICAgLy8gY2hlY2sgdGhhdCBob2xlIGlzIG91dHNpZGUgb2YgcG9seWdvblxuICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRtcEFycmF5ID0gW107XG4gICAgICAgIGxheWVycyA9IGhvbGVzW2ldLmdldExheWVycygpO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChsYXllcnNbal0uX2lzT3V0c2lkZU9mUG9seWdvbihlTWFya2Vyc0dyb3VwKSkge1xuICAgICAgICAgICAgdG1wQXJyYXkucHVzaChcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRtcEFycmF5Lmxlbmd0aCA9PT0gbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLk1hcmtlci5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgdGhpcy5vbignZHJhZ3N0YXJ0JywgKGUpID0+IHtcbiAgICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBudWxsOyAvL3Jlc2V0IHBvaW50XG5cbiAgICAgIHRoaXMuX21Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgIHRoaXMuX29sZExhdExuZ1N0YXRlID0gZS50YXJnZXQuX2xhdGxuZztcblxuICAgICAgaWYgKHRoaXMuX3ByZXYuaXNQbGFpbigpKSB7XG4gICAgICAgIHRoaXMuX21Hcm91cC5zZXRNaWRkbGVNYXJrZXJzKHRoaXMucG9zaXRpb24pO1xuICAgICAgfVxuXG4gICAgfSkub24oJ2RyYWcnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fb25EcmFnKGUpO1xuICAgIH0pLm9uKCdkcmFnZW5kJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX29uRHJhZ0VuZChlKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5fZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kQ29tbW9uRXZlbnRzKG1hcCk7XG4gIH0sXG4gIF9vbkRyYWcgKGUpIHtcbiAgICB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oZSk7XG4gIH0sXG4gIF9vbkRyYWdFbmQgKGUpIHtcbiAgICB2YXIgcnNsdCA9IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbihlKTtcbiAgICBpZiAocnNsdCAmJiAhdGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uKSB7XG4gICAgICB0aGlzLl9yZXN0b3JlT2xkUG9zaXRpb24oKTtcbiAgICB9XG4gIH0sXG4gIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgX3Jlc3RvcmVPbGRQb3NpdGlvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKSkge1xuICAgICAgbGV0IHN0YXRlTGF0TG5nID0gdGhpcy5fb2xkTGF0TG5nU3RhdGU7XG4gICAgICB0aGlzLnNldExhdExuZyhMLmxhdExuZyhzdGF0ZUxhdExuZy5sYXQsIHN0YXRlTGF0TG5nLmxuZykpO1xuXG4gICAgICB0aGlzLmNoYW5nZVByZXZOZXh0UG9zKCk7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICAvL1xuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkcmFnX21hcmtlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuXG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHRoaXMuZ2V0TGF0TG5nKCk7XG4gICAgfVxuICB9LFxuICBfYW5pbWF0ZVpvb20gKG9wdCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHZhciBwb3MgPSB0aGlzLl9tYXAuX2xhdExuZ1RvTmV3TGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcsIG9wdC56b29tLCBvcHQuY2VudGVyKS5yb3VuZCgpO1xuXG4gICAgICB0aGlzLl9zZXRQb3MocG9zKTtcbiAgICB9XG4gIH0sXG4gIHJlc2V0SWNvbiAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uLWRyYWcnKTtcbiAgfSxcbiAgdW5TZWxlY3RJY29uSW5Hcm91cCAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBfc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICghdGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9hZGRJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uJyk7XG4gICAgfVxuICAgIHRoaXMuX2FkZEljb25DbGFzcygnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2KSB7XG4gICAgICB0aGlzLl9wcmV2Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgICB0aGlzLl9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIGlmICh0aGlzLl9uZXh0KSB7XG4gICAgICB0aGlzLl9uZXh0Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgfSxcbiAgaXNTZWxlY3RlZEluR3JvdXAgKCkge1xuICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIEwuTWFya2VyLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gIH0sXG4gIF9lcnJvckxpbmVzOiBbXSxcbiAgX3ByZXZFcnJvckxpbmU6IG51bGwsXG4gIF9uZXh0RXJyb3JMaW5lOiBudWxsLFxuICBfZHJhd0Vycm9yTGluZXMgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG5cbiAgICB2YXIgY3VyclBvaW50ID0gdGhpcy5nZXRMYXRMbmcoKTtcbiAgICB2YXIgcHJldlBvaW50cyA9IFt0aGlzLnByZXYoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcbiAgICB2YXIgbmV4dFBvaW50cyA9IFt0aGlzLm5leHQoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcblxuICAgIHZhciBlcnJvckxpbmVTdHlsZSA9IHRoaXMuX21hcC5vcHRpb25zLmVycm9yTGluZVN0eWxlO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZSA9IG5ldyBMLlBvbHlsaW5lKHByZXZQb2ludHMsIGVycm9yTGluZVN0eWxlKTtcbiAgICB0aGlzLl9uZXh0RXJyb3JMaW5lID0gbmV3IEwuUG9seWxpbmUobmV4dFBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZS5hZGRUbyhtYXApO1xuICAgIHRoaXMuX25leHRFcnJvckxpbmUuYWRkVG8obWFwKTtcblxuICAgIHRoaXMuX2Vycm9yTGluZXMucHVzaCh0aGlzLl9wcmV2RXJyb3JMaW5lKTtcbiAgICB0aGlzLl9lcnJvckxpbmVzLnB1c2godGhpcy5fbmV4dEVycm9yTGluZSk7XG4gIH0sXG4gIF9jbGVhckVycm9yTGluZXMgKCkge1xuICAgIHRoaXMuX2Vycm9yTGluZXMuX2VhY2goKGxpbmUpID0+IHRoaXMuX21hcC5yZW1vdmVMYXllcihsaW5lKSk7XG4gIH0sXG4gIHNldEludGVyc2VjdGVkU3R5bGUgKCkge1xuICAgIHRoaXMuX3NldEludGVyc2VjdGlvbkljb24oKTtcblxuICAgIC8vc2hvdyBpbnRlcnNlY3RlZCBsaW5lc1xuICAgIHRoaXMuX2RyYXdFcnJvckxpbmVzKCk7XG4gIH0sXG4gIHJlc2V0U3R5bGUgKCkge1xuICAgIHRoaXMucmVzZXRJY29uKCk7XG4gICAgdGhpcy5zZWxlY3RJY29uSW5Hcm91cCgpO1xuXG4gICAgaWYgKHRoaXMuX3ByZXZJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25leHRJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkID0gbnVsbDtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQgPSBudWxsO1xuXG4gICAgLy9oaWRlIGludGVyc2VjdGVkIGxpbmVzXG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG4gIH0sXG4gIF9wcmV2aWV3RXJMaW5lOiBudWxsLFxuICBfcHQ6IG51bGwsXG4gIF9wcmV2aWV3RXJyb3JMaW5lICgpIHtcbiAgICBpZiAodGhpcy5fcHJldmlld0VyTGluZSkge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wdCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3B0KTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnRzID0gW3RoaXMubmV4dCgpLmdldExhdExuZygpLCB0aGlzLnByZXYoKS5nZXRMYXRMbmcoKV07XG5cbiAgICB2YXIgZXJyb3JMaW5lU3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5wcmV2aWV3RXJyb3JMaW5lU3R5bGU7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lID0gbmV3IEwuUG9seWxpbmUocG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lLmFkZFRvKHRoaXMuX21hcCk7XG5cbiAgICB0aGlzLl9wdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH0sIDkwMCk7XG4gIH1cbn0pOyIsImltcG9ydCBFeHRlbmRlZFBvbHlnb24gZnJvbSAnLi4vZXh0ZW5kZWQvUG9seWdvbic7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi9leHRlbmRlZC9Ub29sdGlwJztcblxuZXhwb3J0IGRlZmF1bHQgTC5FZGl0UGxveWdvbiA9IEV4dGVuZGVkUG9seWdvbi5leHRlbmQoe1xuICBfb2xkRTogdW5kZWZpbmVkLCAvLyB0byByZXVzZSBldmVudCBvYmplY3QgYWZ0ZXIgXCJiYWQgaG9sZVwiIHJlbW92aW5nIHRvIGJ1aWxkIG5ldyBob2xlXG4gIF9rOiAxLCAvLyB0byBkZWNyZWFzZSAnZGlmZicgdmFsdWUgd2hpY2ggaGVscHMgYnVpbGQgYSBob2xlXG4gIF9ob2xlczogW10sXG4gIGluaXRpYWxpemUgKGxhdGxuZ3MsIG9wdGlvbnMpIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5ncywgb3B0aW9ucyk7XG4gICAgdGhpcy5faW5pdFdpdGhIb2xlcyhsYXRsbmdzKTtcblxuICAgIHRoaXMub3B0aW9ucy5jbGFzc05hbWUgPSBcImxlYWZsZXQtY2xpY2thYmxlIHBvbHlnb25cIjtcbiAgfSxcbiAgX3VwZGF0ZSAoZSkge1xuICAgIHZhciBtYXJrZXIgPSBlLm1hcmtlcjtcblxuICAgIGlmIChtYXJrZXIuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICB2YXIgbWFya2VycyA9IG1hcmtlci5fbUdyb3VwLl9tYXJrZXJzO1xuICAgICAgbWFya2VycyA9IG1hcmtlcnMuZmlsdGVyKChtYXJrZXIpID0+ICFtYXJrZXIuaXNNaWRkbGUoKSk7XG4gICAgICB0aGlzLl9ob2xlc1ttYXJrZXIuX21Hcm91cC5wb3NpdGlvbl0gPSBtYXJrZXJzLm1hcCgobWFya2VyKSA9PiBtYXJrZXIuZ2V0TGF0TG5nKCkpO1xuXG4gICAgfVxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIF9yZW1vdmVIb2xlIChlKSB7XG4gICAgdmFyIGhvbGVQb3NpdGlvbiA9IGUubWFya2VyLl9tR3JvdXAucG9zaXRpb247XG4gICAgdGhpcy5faG9sZXMuc3BsaWNlKGhvbGVQb3NpdGlvbiwgMSk7XG5cbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZW1vdmVMYXllcihlLm1hcmtlci5fbUdyb3VwLl9sZWFmbGV0X2lkKTtcbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXBvcyhlLm1hcmtlci5fbUdyb3VwLnBvc2l0aW9uKTtcblxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6YWRkX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmFkZF9tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZHJhZ19tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkcmFnX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfaG9sZScpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9ob2xlJywgKGUpID0+IHRoaXMuX3JlbW92ZUhvbGUoZSkpO1xuXG4gICAgdGhpcy5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlbW92ZScsIHsgbGF5ZXJQb2ludDogZS5sYXllclBvaW50IH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiBtYXAuZmlyZSgnZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgbWFwLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuXG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBhZGRIb2xlIChob2xlKSB7XG4gICAgdGhpcy5faG9sZXMgPSB0aGlzLl9ob2xlcyB8fCBbXTtcbiAgICB0aGlzLl9ob2xlcy5wdXNoKGhvbGUpO1xuXG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgaGFzSG9sZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hvbGVzLmxlbmd0aCA+IDA7XG4gIH0sXG4gIF9yZXNldExhc3RIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgbWFwLmdldFNlbGVjdGVkTWFya2VyKCkucmVtb3ZlSG9sZSgpO1xuXG4gICAgaWYgKHRoaXMuX2sgPiAwLjAwMSkge1xuICAgICAgdGhpcy5fYWRkSG9sZSh0aGlzLl9vbGRFLCAwLjUpO1xuICAgIH1cbiAgfSxcbiAgY2hlY2tIb2xlSW50ZXJzZWN0aW9uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uIHx8IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGVITWFya2Vyc0dyb3VwTGF5ZXJzID0gdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhc3RIb2xlID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV07XG4gICAgdmFyIGxhc3RIb2xlTGF5ZXJzID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV0uZ2V0TGF5ZXJzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RIb2xlTGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGF5ZXIgPSBsYXN0SG9sZUxheWVyc1tpXTtcblxuICAgICAgaWYgKGxheWVyLl9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMoKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAobGF5ZXIuX2lzT3V0c2lkZU9mUG9seWdvbih0aGlzLl9tYXAuZ2V0RU1hcmtlcnNHcm91cCgpKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBlSG9sZU1hcmtlckdyb3VwTGF5ZXIgPSBlSE1hcmtlcnNHcm91cExheWVyc1tqXTtcblxuICAgICAgICBpZiAobGFzdEhvbGUgIT09IGVIb2xlTWFya2VyR3JvdXBMYXllciAmJiBlSG9sZU1hcmtlckdyb3VwTGF5ZXIuX2lzTWFya2VySW5Qb2x5Z29uKGxheWVyLmdldExhdExuZygpKSkge1xuICAgICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IE1hcmtlciBmcm9tICcuLi9lZGl0L21hcmtlcic7XG5pbXBvcnQgc29ydCBmcm9tICcuLi91dGlscy9zb3J0QnlQb3NpdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IEwuQ2xhc3MuZXh0ZW5kKHtcbiAgaW5jbHVkZXM6IEwuTWl4aW4uRXZlbnRzLFxuXG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0TWFya2VyOiB1bmRlZmluZWQsXG4gIF9maXJzdE1hcmtlcjogdW5kZWZpbmVkLFxuICBfcG9zaXRpb25IYXNoOiB1bmRlZmluZWQsXG4gIF9sYXN0UG9zaXRpb246IDAsXG4gIF9tYXJrZXJzOiBbXSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy9MLkxheWVyR3JvdXAucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIC8vTC5MYXllckdyb3VwLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuICB9LFxuICBjbGVhckxheWVycyAoKSB7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcihtYXJrZXIpO1xuICAgIH0pO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgfSxcbiAgYWRkVG8gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgfSxcbiAgYWRkTGF5ZXIgKG1hcmtlcikge1xuICAgIHRoaXMuX21hcC5hZGRMYXllcihtYXJrZXIpO1xuICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgIGlmIChtYXJrZXIucG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWFya2Vycy5tb3ZlKHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMSwgbWFya2VyLnBvc2l0aW9uKTtcbiAgICB9XG4gICAgbWFya2VyLnBvc2l0aW9uID0gKG1hcmtlci5wb3NpdGlvbiAhPSBudWxsKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMTtcbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgbWFya2Vycy5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICB3aGlsZSAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXIobWFya2VyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAodGhpcy5faXNIb2xlKSB7XG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOnBvbHlnb246aG9sZV9kZWxldGVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcC5nZXRWR3JvdXAoKS5yZW1vdmVMYXllcihtYXAuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOmRlbGV0ZWQnKTtcblxuICAgIH1cbiAgfSxcbiAgcmVtb3ZlTGF5ZXIgKG1hcmtlcikge1xuICAgIHZhciBwb3NpdGlvbiA9IG1hcmtlci5wb3NpdGlvbjtcbiAgICB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIobWFya2VyKTtcbiAgICB0aGlzLl9tYXJrZXJzLnNwbGljZShwb3NpdGlvbiwgMSk7XG4gIH0sXG4gIGdldExheWVycyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmtlcnM7XG4gIH0sXG4gIGVhY2hMYXllciAoY2IpIHtcbiAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2goY2IpO1xuICB9LFxuICBtYXJrZXJBdCAocG9zaXRpb24pIHtcbiAgICB2YXIgcnNsdCA9IHRoaXMuX21hcmtlcnNbcG9zaXRpb25dO1xuXG4gICAgaWYgKHBvc2l0aW9uIDwgMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlyc3RNYXJrZXIoKTtcbiAgICB9XG5cbiAgICBpZiAocnNsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByc2x0ID0gdGhpcy5sYXN0TWFya2VyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJzbHQ7XG4gIH0sXG4gIGZpcnN0TWFya2VyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2Vyc1swXTtcbiAgfSxcbiAgbGFzdE1hcmtlciAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuICAgIHJldHVybiBtYXJrZXJzW21hcmtlcnMubGVuZ3RoIC0gMV07XG4gIH0sXG4gIHJlbW92ZU1hcmtlciAobWFya2VyKSB7XG4gICAgdmFyIGIgPSAhbWFya2VyLmlzTWlkZGxlKCk7XG5cbiAgICB2YXIgcHJldk1hcmtlciA9IG1hcmtlci5fcHJldjtcbiAgICB2YXIgbmV4dE1hcmtlciA9IG1hcmtlci5fbmV4dDtcbiAgICB2YXIgbmV4dG5leHRNYXJrZXIgPSBtYXJrZXIuX25leHQuX25leHQ7XG4gICAgdGhpcy5yZW1vdmVNYXJrZXJBdChtYXJrZXIucG9zaXRpb24pO1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQocHJldk1hcmtlci5wb3NpdGlvbik7XG4gICAgdGhpcy5yZW1vdmVNYXJrZXJBdChuZXh0TWFya2VyLnBvc2l0aW9uKTtcblxuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnNldE1pZGRsZU1hcmtlcihuZXh0bmV4dE1hcmtlci5wb3NpdGlvbik7XG5cbiAgICAgIGlmIChiKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsIHsgbWFya2VyOiBtYXJrZXIgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKHRoaXMpO1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9ob2xlJywgeyBtYXJrZXI6IG1hcmtlciB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcC5yZW1vdmVQb2x5Z29uKG1hcC5nZXRFUG9seWdvbigpKTtcblxuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJyk7XG4gICAgICB9XG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlTWFya2VyQXQgKHBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hcmtlcjtcbiAgICBpZiAodHlwZW9mIHBvc2l0aW9uID09PSAnbnVtYmVyJykge1xuICAgICAgbWFya2VyID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgX2NoYW5nZVBvcyA9IGZhbHNlO1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcbiAgICBtYXJrZXJzLmZvckVhY2goKF9tYXJrZXIpID0+IHtcbiAgICAgIGlmIChfY2hhbmdlUG9zKSB7XG4gICAgICAgIF9tYXJrZXIucG9zaXRpb24gPSAoX21hcmtlci5wb3NpdGlvbiA9PT0gMCkgPyAwIDogX21hcmtlci5wb3NpdGlvbiAtIDE7XG4gICAgICB9XG4gICAgICBpZiAoX21hcmtlciA9PT0gbWFya2VyKSB7XG4gICAgICAgIG1hcmtlci5fcHJldi5fbmV4dCA9IG1hcmtlci5fbmV4dDtcbiAgICAgICAgbWFya2VyLl9uZXh0Ll9wcmV2ID0gbWFya2VyLl9wcmV2O1xuICAgICAgICBfY2hhbmdlUG9zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVtb3ZlTGF5ZXIobWFya2VyKTtcblxuICAgIGlmIChtYXJrZXJzLmxlbmd0aCA8IDUpIHtcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgICAgIG1hcC5nZXRWR3JvdXAoKS5yZW1vdmVMYXllcihtYXAuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYWRkTWFya2VyIChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKSB7XG4gICAgLy8gMS4gcmVjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgaWYgKHR5cGVvZiBsYXRsbmcgPT09ICdudW1iZXInKSB7XG4gICAgICBwb3NpdGlvbiA9IHRoaXMubWFya2VyQXQobGF0bG5nKS5wb3NpdGlvbjtcbiAgICAgIHRoaXMuX3JlY2FsY1Bvc2l0aW9ucyhwb3NpdGlvbik7XG5cbiAgICAgIHZhciBwcmV2TWFya2VyID0gKHBvc2l0aW9uIC0gMSkgPCAwID8gdGhpcy5sYXN0TWFya2VyKCkgOiB0aGlzLm1hcmtlckF0KHBvc2l0aW9uIC0gMSk7XG4gICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubWFya2VyQXQoKHBvc2l0aW9uID09IC0xKSA/IDEgOiBwb3NpdGlvbik7XG4gICAgICBsYXRsbmcgPSB0aGlzLl9nZXRNaWRkbGVMYXRMbmcocHJldk1hcmtlciwgbmV4dE1hcmtlcik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICBvcHRpb25zLmRyYWdnYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldEZpcnN0KCkpIHtcbiAgICAgIG9wdGlvbnMuZHJhZ2dhYmxlID0gIXRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCk7XG4gICAgfVxuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBNYXJrZXIodGhpcywgbGF0bG5nLCBvcHRpb25zKTtcbiAgICBpZiAoIXRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICB0aGlzLl9maXJzdE1hcmtlciA9IG1hcmtlcjtcbiAgICAgIHRoaXMuX2xhc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vaWYgKHRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAvLyAgbWFya2VyLmRyYWdnaW5nLmRpc2FibGUoKTtcbiAgICAvL30gZWxzZSB7XG4gICAgLy8gIG1hcmtlci5kcmFnZ2luZy5lbmFibGUoKTtcbiAgICAvL31cblxuICAgIHRoaXMuYWRkTGF5ZXIobWFya2VyKTtcblxuICAgIHtcbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IChtYXJrZXIucG9zaXRpb24gIT09IHVuZGVmaW5lZCApID8gbWFya2VyLnBvc2l0aW9uIDogdGhpcy5fbGFzdFBvc2l0aW9uKys7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9sYXN0TWFya2VyO1xuICAgICAgdGhpcy5fZmlyc3RNYXJrZXIuX3ByZXYgPSBtYXJrZXI7XG4gICAgICBpZiAobWFya2VyLl9wcmV2KSB7XG4gICAgICAgIHRoaXMuX2xhc3RNYXJrZXIuX25leHQgPSBtYXJrZXI7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2ZpcnN0TWFya2VyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9sYXN0TWFya2VyID0gbWFya2VyO1xuICAgIH1cblxuICAgIC8vIDIuIHJlY2FsY3VsYXRlIHJlbGF0aW9uc1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9yZWNhbGNSZWxhdGlvbnMobWFya2VyKTtcbiAgICB9XG4gICAgLy8gMy4gdHJpZ2dlciBldmVudFxuICAgIGlmICghbWFya2VyLmlzTWlkZGxlKCkpIHtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6YWRkX21hcmtlcicsIHsgbWFya2VyOiBtYXJrZXIgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHZhciBpZHMgPSB0aGlzLl9pZHMoKTtcblxuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcblxuICAgIGlkcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgdGhpcy5fZGVsZXRlRXZlbnRzKGlkKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2xhc3RQb3NpdGlvbiA9IDA7XG5cbiAgICB0aGlzLl9maXJzdE1hcmtlciA9IHVuZGVmaW5lZDtcbiAgfSxcbiAgX2RlbGV0ZUV2ZW50cyAoaWQpIHtcbiAgICBkZWxldGUgdGhpcy5fbWFwLl9sZWFmbGV0X2V2ZW50cy52aWV3cmVzZXRfaWR4W2lkXTtcbiAgICBkZWxldGUgdGhpcy5fbWFwLl9sZWFmbGV0X2V2ZW50cy56b29tYW5pbV9pZHhbaWRdO1xuICB9LFxuICBfZ2V0TWlkZGxlTGF0TG5nIChtYXJrZXIxLCBtYXJrZXIyKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcCxcbiAgICAgIHAxID0gbWFwLnByb2plY3QobWFya2VyMS5nZXRMYXRMbmcoKSksXG4gICAgICBwMiA9IG1hcC5wcm9qZWN0KG1hcmtlcjIuZ2V0TGF0TG5nKCkpO1xuXG4gICAgcmV0dXJuIG1hcC51bnByb2plY3QocDEuX2FkZChwMikuX2RpdmlkZUJ5KDIpKTtcbiAgfSxcbiAgX3JlY2FsY1Bvc2l0aW9ucyAocG9zaXRpb24pIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG5cbiAgICB2YXIgY2hhbmdlUG9zID0gZmFsc2U7XG4gICAgbWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIF9wb3NpdGlvbikgPT4ge1xuICAgICAgaWYgKHBvc2l0aW9uID09PSBfcG9zaXRpb24pIHtcbiAgICAgICAgY2hhbmdlUG9zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VQb3MpIHtcbiAgICAgICAgdGhpcy5fbWFya2Vyc1tfcG9zaXRpb25dLnBvc2l0aW9uICs9IDE7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9yZWNhbGNSZWxhdGlvbnMgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcblxuICAgIG1hcmtlcnMuZm9yRWFjaCgobWFya2VyLCBwb3NpdGlvbikgPT4ge1xuXG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLm1hcmtlckF0KHBvc2l0aW9uIC0gMSk7XG4gICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KHBvc2l0aW9uICsgMSk7XG5cbiAgICAgIC8vIGZpcnN0XG4gICAgICBpZiAocG9zaXRpb24gPT09IDApIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5sYXN0TWFya2VyKCk7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQoMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGxhc3RcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gbWFya2Vycy5sZW5ndGggLSAxKSB7XG4gICAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gLSAxKTtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdCgwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX2lkcyAoKSB7XG4gICAgdmFyIHJzbHQgPSBbXTtcblxuICAgIGZvciAobGV0IGlkIGluIHRoaXMuX2xheWVycykge1xuICAgICAgcnNsdC5wdXNoKGlkKTtcbiAgICB9XG5cbiAgICByc2x0LnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcblxuICAgIHJldHVybiByc2x0O1xuICB9LFxuICBzZWxlY3QgKCkge1xuICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fbWFwLl9zZWxlY3RlZE1Hcm91cCA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAodGhpcy5faXNIb2xlKSB7XG4gICAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldFNlbGVjdGlvbigpO1xuICAgICAgbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5yZXNldFNlbGVjdGlvbigpO1xuICAgICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuc2V0TGFzdEhvbGUodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldExhc3RIb2xlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICBtYXJrZXIuc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IHRydWU7XG5cbiAgICB0aGlzLl9tYXAuX3NlbGVjdGVkTUdyb3VwID0gdGhpcztcbiAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9zZWxlY3QnKTtcbiAgfSxcbiAgaXNFbXB0eSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwO1xuICB9LFxuICByZXNldFNlbGVjdGlvbiAoKSB7XG4gICAgdGhpcy5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gZmFsc2U7XG4gIH1cbn0pIiwiZXhwb3J0IGRlZmF1bHQgTC5Db250cm9sLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBwb3NpdGlvbjogJ3RvcGxlZnQnLFxuICAgIGJ0bnM6IFtcbiAgICAgIC8veyd0aXRsZSc6ICdyZW1vdmUnLCAnY2xhc3NOYW1lJzogJ2ZhIGZhLXRyYXNoJ31cbiAgICBdLFxuICAgIGV2ZW50TmFtZTogXCJjb250cm9sQWRkZWRcIixcbiAgICBwcmVzc0V2ZW50TmFtZTogXCJidG5QcmVzc2VkXCJcbiAgfSxcbiAgX2J0bjogbnVsbCxcbiAgc3RvcEV2ZW50OiBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbixcbiAgaW5pdGlhbGl6ZSAob3B0aW9ucykge1xuICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICB9LFxuICBfdGl0bGVDb250YWluZXI6IG51bGwsXG4gIG9uQWRkIChtYXApIHtcbiAgICBtYXAub24odGhpcy5vcHRpb25zLnByZXNzRXZlbnROYW1lLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fYnRuICYmICFMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKSkge1xuICAgICAgICB0aGlzLl9vblByZXNzQnRuKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYmFyIGxlYWZsZXQtZWRpdG9yLWJ1dHRvbnMnKTtcblxuICAgIG1hcC5fY29udHJvbENvbnRhaW5lci5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZWxmLl9zZXRCdG4ob3B0aW9ucy5idG5zLCBjb250YWluZXIpO1xuICAgICAgaWYgKG9wdGlvbnMuZXZlbnROYW1lKSB7XG4gICAgICAgIG1hcC5maXJlKG9wdGlvbnMuZXZlbnROYW1lLCB7Y29udHJvbDogc2VsZn0pO1xuICAgICAgfVxuXG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHNlbGYuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoc2VsZi5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcblxuICAgIH0sIDEwMDApO1xuXG4gICAgbWFwLmdldEJ0bkNvbnRyb2wgPSAoKSA9PiB0aGlzO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX29uUHJlc3NCdG4gKCkge30sXG4gIF9vbk1vdXNlT3ZlciAoKSB7fSxcbiAgX29uTW91c2VPdXQgKCkge30sXG4gIF9zZXRCdG4gKG9wdHMsIGNvbnRhaW5lcikge1xuICAgIHZhciBfYnRuO1xuICAgIG9wdHMuZm9yRWFjaCgoYnRuLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGluZGV4ID09PSBvcHRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgYnRuLmNsYXNzTmFtZSArPSBcIiBsYXN0XCI7XG4gICAgICB9XG4gICAgICAvL3ZhciBjaGlsZCA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJ0bicgKyAoYnRuLmNsYXNzTmFtZSA/ICcgJyArIGJ0bi5jbGFzc05hbWUgOiAnJykpO1xuXG4gICAgICB2YXIgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHdyYXBwZXIpO1xuICAgICAgdmFyIGxpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJ2xlYWZsZXQtYnRuJywgd3JhcHBlcik7XG4gICAgICBsaW5rLmhyZWYgPSAnIyc7XG5cbiAgICAgIHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XG4gICAgICBMLkRvbUV2ZW50XG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ21vdXNlZG93bicsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnZGJsY2xpY2snLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAgIGxpbmsuYXBwZW5kQ2hpbGQoTC5Eb21VdGlsLmNyZWF0ZSgnaScsICdmYScgKyAoYnRuLmNsYXNzTmFtZSA/ICcgJyArIGJ0bi5jbGFzc05hbWUgOiAnJykpKTtcblxuICAgICAgdmFyIGNhbGxiYWNrID0gKGZ1bmN0aW9uIChtYXAsIHByZXNzRXZlbnROYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbWFwLmZpcmUocHJlc3NFdmVudE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KHRoaXMuX21hcCwgYnRuLnByZXNzRXZlbnROYW1lIHx8IHRoaXMub3B0aW9ucy5wcmVzc0V2ZW50TmFtZSkpO1xuXG4gICAgICBMLkRvbUV2ZW50Lm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgY2FsbGJhY2spO1xuXG4gICAgICBfYnRuID0gbGluaztcbiAgICB9KTtcbiAgICB0aGlzLl9idG4gPSBfYnRuO1xuICB9LFxuICBnZXRCdG5Db250YWluZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuX2NvbnRyb2xDb3JuZXJzWyd0b3BsZWZ0J107XG4gIH0sXG4gIGdldEJ0bkF0IChwb3MpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdG5Db250YWluZXIoKS5jaGlsZFtwb3NdO1xuICB9LFxuICBkaXNhYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfSxcbiAgZW5hYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfVxufSk7IiwiaW1wb3J0IEJ0bkN0cmwgZnJvbSAnLi9CdG5Db250cm9sJztcblxuZXhwb3J0IGRlZmF1bHQgQnRuQ3RybC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgZXZlbnROYW1lOiAnbG9hZEJ0bkFkZGVkJyxcbiAgICBwcmVzc0V2ZW50TmFtZTogJ2xvYWRCdG5QcmVzc2VkJ1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IEJ0bkN0cmwucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIG1hcC5vbignbG9hZEJ0bkFkZGVkJywgKCkgPT4ge1xuICAgICAgdGhpcy5fbWFwLm9uKCdzZWFyY2hFbmFibGVkJywgdGhpcy5fY29sbGFwc2UsIHRoaXMpO1xuXG4gICAgICB0aGlzLl9yZW5kZXJGb3JtKGNvbnRhaW5lcik7XG4gICAgfSk7XG5cbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbG9hZC1qc29uLWNvbnRhaW5lcicpO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX29uUHJlc3NCdG4gKCkge1xuICAgIGlmICh0aGlzLl90aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gICAgfVxuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgIGlmICh0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgIT0gJ2Jsb2NrJykge1xuICAgICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgIHRoaXMuX3RleHRhcmVhLmZvY3VzKCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnbG9hZEJ0bk9wZW5lZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb2xsYXBzZSgpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5IaWRkZW4nKTtcbiAgICB9XG4gIH0sXG4gIF9jb2xsYXBzZSAoKSB7XG4gICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRoaXMuX3RleHRhcmVhLnZhbHVlID0gJyc7XG4gIH0sXG4gIF9yZW5kZXJGb3JtIChjb250YWluZXIpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXMuX2Zvcm0gPSBMLkRvbVV0aWwuY3JlYXRlKCdmb3JtJyk7XG5cbiAgICB2YXIgdGV4dGFyZWEgPSB0aGlzLl90ZXh0YXJlYSA9IEwuRG9tVXRpbC5jcmVhdGUoJ3RleHRhcmVhJyk7XG4gICAgdGV4dGFyZWEuc3R5bGUud2lkdGggPSAnMjAwcHgnO1xuICAgIHRleHRhcmVhLnN0eWxlLmhlaWdodCA9ICcxMDBweCc7XG4gICAgdGV4dGFyZWEuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCB3aGl0ZSc7XG4gICAgdGV4dGFyZWEuc3R5bGUucGFkZGluZyA9ICc1cHgnO1xuICAgIHRleHRhcmVhLnN0eWxlLmJvcmRlclJhZGl1cyA9ICc0cHgnO1xuXG4gICAgTC5Eb21FdmVudFxuICAgICAgLm9uKHRleHRhcmVhLCAnY2xpY2snLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ21vdXNlZG93bicsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHRleHRhcmVhLCAnZGJsY2xpY2snLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ21vdXNld2hlZWwnLCB0aGlzLnN0b3BFdmVudCk7XG5cbiAgICBmb3JtLmFwcGVuZENoaWxkKHRleHRhcmVhKTtcblxuICAgIHZhciBzdWJtaXRCdG4gPSB0aGlzLl9zdWJtaXRCdG4gPSBMLkRvbVV0aWwuY3JlYXRlKCdidXR0b24nLCAnbGVhZmxldC1zdWJtaXQtYnRuIGxvYWQtZ2VvanNvbicpO1xuICAgIHN1Ym1pdEJ0bi50eXBlID0gXCJzdWJtaXRcIjtcbiAgICBzdWJtaXRCdG4uaW5uZXJIVE1MID0gdGhpcy5fbWFwLm9wdGlvbnMudGV4dC5zdWJtaXRMb2FkQnRuO1xuXG4gICAgTC5Eb21FdmVudFxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ2NsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24oc3VibWl0QnRuLCAnbW91c2Vkb3duJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24oc3VibWl0QnRuLCAnY2xpY2snLCB0aGlzLl9zdWJtaXRGb3JtLCB0aGlzKTtcblxuICAgIGZvcm0uYXBwZW5kQ2hpbGQoc3VibWl0QnRuKTtcblxuICAgIEwuRG9tRXZlbnQub24oZm9ybSwgJ3N1Ym1pdCcsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2J0bi1sZWFmbGV0LW1zZy1jb250YWluZXIgdGl0bGUtaGlkZGVuJyk7XG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5fbWFwLm9wdGlvbnMudGV4dC5sb2FkSnNvbjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuICB9LFxuICBfdGltZW91dDogbnVsbCxcbiAgX3N1Ym1pdEZvcm0gKCkge1xuICAgIGlmICh0aGlzLl90aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gICAgfVxuXG4gICAgdmFyIGpzb247XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB0cnkge1xuICAgICAganNvbiA9IEpTT04ucGFyc2UodGhpcy5fdGV4dGFyZWEudmFsdWUpO1xuXG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQuanNvbldhc0xvYWRlZDtcblxuICAgICAgbWFwLmNyZWF0ZUVkaXRQb2x5Z29uKGpzb24pO1xuXG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgICAgfSwgMjAwMCk7XG5cbiAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnbG9hZEJ0bkhpZGRlbicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtZXJyb3InKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLXN1Y2Nlc3MnKTtcblxuICAgICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC5jaGVja0pzb247XG5cbiAgICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICB9LCAyMDAwKTtcbiAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnbG9hZEJ0bkhpZGRlbicpO1xuICAgICAgdGhpcy5fbWFwLm1vZGUoJ2RyYXcnKTtcbiAgICB9XG4gIH0sXG4gIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgaWYgKHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9PT0gJ2Jsb2NrJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1lcnJvcicpO1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLXN1Y2Nlc3MnKTtcbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLl9tYXAub3B0aW9ucy50ZXh0LmxvYWRKc29uO1xuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IEwuQ29udHJvbC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgcG9zaXRpb246ICdtc2djZW50ZXInLFxuICAgIGRlZmF1bHRNc2c6IG51bGxcbiAgfSxcbiAgaW5pdGlhbGl6ZSAob3B0aW9ucykge1xuICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICB9LFxuICBfdGl0bGVDb250YWluZXI6IG51bGwsXG4gIG9uQWRkIChtYXApIHtcbiAgICB2YXIgY29ybmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYm90dG9tJyk7XG4gICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LW1zZy1lZGl0b3InKTtcblxuICAgIG1hcC5fY29udHJvbENvcm5lcnNbJ21zZ2NlbnRlciddID0gY29ybmVyO1xuICAgIG1hcC5fY29udHJvbENvbnRhaW5lci5hcHBlbmRDaGlsZChjb3JuZXIpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9zZXRDb250YWluZXIoY29udGFpbmVyLCBtYXApO1xuICAgICAgbWFwLmZpcmUoJ21zZ0hlbHBlckFkZGVkJywgeyBjb250cm9sOiB0aGlzIH0pO1xuXG4gICAgICB0aGlzLl9jaGFuZ2VQb3MoKTtcbiAgICB9LCAxMDAwKTtcblxuICAgIG1hcC5nZXRCdG5Db250cm9sID0gKCkgPT4gdGhpcztcblxuICAgIHRoaXMuX2JpbmRFdmVudHMobWFwKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9jaGFuZ2VQb3MgKCkge1xuICAgIHZhciBjb250cm9sQ29ybmVyID0gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gICAgaWYgKGNvbnRyb2xDb3JuZXIgJiYgY29udHJvbENvcm5lci5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHZhciBjaGlsZCA9IGNvbnRyb2xDb3JuZXIuY2hpbGRyZW5bMF0uY2hpbGRyZW5bMF07XG5cbiAgICAgIGlmICghY2hpbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgd2lkdGggPSBjaGlsZC5jbGllbnRXaWR0aDtcbiAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICBjb250cm9sQ29ybmVyLnN0eWxlLmxlZnQgPSAodGhpcy5fbWFwLl9jb250YWluZXIuY2xpZW50V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4JztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9iaW5kRXZlbnRzICgpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NoYW5nZVBvcygpO1xuICAgICAgfSk7XG4gICAgfSwgMSk7XG4gIH0sXG4gIF9zZXRDb250YWluZXIgKGNvbnRhaW5lcikge1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICB0aGlzLl90aXRsZVBvc0NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LW1zZy1jb250YWluZXIgdGl0bGUtaGlkZGVuJyk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RpdGxlQ29udGFpbmVyKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdE1zZyAhPT0gbnVsbCkge1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuZGVmYXVsdE1zZztcbiAgICB9XG4gIH0sXG4gIGdldE9mZnNldCAoZWwpIHtcbiAgICB2YXIgX3ggPSAwO1xuICAgIHZhciBfeSA9IDA7XG4gICAgaWYgKCF0aGlzLl9tYXAuaXNGdWxsc2NyZWVuIHx8ICF0aGlzLl9tYXAuaXNGdWxsc2NyZWVuKCkpIHtcbiAgICAgIHdoaWxlIChlbCAmJiAhaXNOYU4oZWwub2Zmc2V0TGVmdCkgJiYgIWlzTmFOKGVsLm9mZnNldFRvcCkpIHtcbiAgICAgICAgX3ggKz0gZWwub2Zmc2V0TGVmdDtcbiAgICAgICAgX3kgKz0gZWwub2Zmc2V0VG9wO1xuICAgICAgICBlbCA9IGVsLm9mZnNldFBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgeTogX3ksIHg6IF94IH07XG4gIH0sXG4gIG1zZyAodGV4dCwgdHlwZSwgb2JqZWN0KSB7XG4gICAgaWYgKCF0ZXh0IHx8ICF0aGlzLl90aXRsZVBvc0NvbnRhaW5lcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvYmplY3QpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZVBvc0NvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLCAndGl0bGUtZXJyb3InKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZVBvc0NvbnRhaW5lciwgJ3RpdGxlLXN1Y2Nlc3MnKTtcblxuICAgICAgdGhpcy5fdGl0bGVQb3NDb250YWluZXIuaW5uZXJIVE1MID0gdGV4dDtcblxuICAgICAgdmFyIHBvaW50O1xuXG4gICAgICAvL3ZhciBvZmZzZXQgPSB0aGlzLmdldE9mZnNldChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLl9tYXAuX2NvbnRhaW5lci5nZXRBdHRyaWJ1dGUoJ2lkJykpKTtcbiAgICAgIHZhciBvZmZzZXQgPSB0aGlzLmdldE9mZnNldCh0aGlzLl9tYXAuX2NvbnRhaW5lcik7XG5cbiAgICAgIGlmIChvYmplY3QgaW5zdGFuY2VvZiBMLlBvaW50KSB7XG4gICAgICAgIHBvaW50ID0gb2JqZWN0O1xuICAgICAgICBwb2ludCA9IHRoaXMuX21hcC5sYXllclBvaW50VG9Db250YWluZXJQb2ludChwb2ludCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KG9iamVjdC5nZXRMYXRMbmcoKSk7XG4gICAgICB9XG5cbiAgICAgIHBvaW50LnggKz0gb2Zmc2V0Lng7XG4gICAgICBwb2ludC55ICs9IG9mZnNldC55O1xuXG4gICAgICB0aGlzLl90aXRsZVBvc0NvbnRhaW5lci5zdHlsZS50b3AgPSAocG9pbnQueSAtIDgpICsgXCJweFwiO1xuICAgICAgdGhpcy5fdGl0bGVQb3NDb250YWluZXIuc3R5bGUubGVmdCA9IChwb2ludC54ICsgMTApICsgXCJweFwiO1xuXG4gICAgICBpZiAodHlwZSkge1xuICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVQb3NDb250YWluZXIsICd0aXRsZS0nICsgdHlwZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtZXJyb3InKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLXN1Y2Nlc3MnKTtcblxuICAgICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gdGV4dDtcblxuICAgICAgaWYgKHR5cGUpIHtcbiAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtJyArIHR5cGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2hhbmdlUG9zKCk7XG4gICAgfVxuICB9LFxuICBoaWRlICgpIHtcbiAgICBpZiAodGhpcy5fdGl0bGVDb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90aXRsZVBvc0NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfVxuICB9LFxuICBnZXRCdG5Db250YWluZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXTtcbiAgfSxcbiAgZ2V0QnRuQXQgKHBvcykge1xuICAgIHJldHVybiB0aGlzLmdldEJ0bkNvbnRhaW5lcigpLmNoaWxkW3Bvc107XG4gIH0sXG4gIGRpc2FibGVCdG4gKHBvcykge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLmdldEJ0bkF0KHBvcyksICdkaXNhYmxlZCcpO1xuICB9LFxuICBlbmFibGVCdG4gKHBvcykge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLmdldEJ0bkF0KHBvcyksICdkaXNhYmxlZCcpO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLlBvbHlnb24uZXh0ZW5kKHtcbiAgaXNFbXB0eSAoKSB7XG4gICAgdmFyIGxhdExuZ3MgPSB0aGlzLmdldExhdExuZ3MoKTtcbiAgICByZXR1cm4gbGF0TG5ncyA9PT0gbnVsbCB8fCBsYXRMbmdzID09PSB1bmRlZmluZWQgfHwgKGxhdExuZ3MgJiYgbGF0TG5ncy5sZW5ndGggPT09IDApO1xuICB9LFxuICBnZXRIb2xlIChob2xlR3JvdXBOdW1iZXIpIHtcbiAgICBpZiAoISQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2hvbGVzW2hvbGVHcm91cE51bWJlcl07XG4gIH0sXG4gIGdldEhvbGVQb2ludCAoaG9sZUdyb3VwTnVtYmVyLCBob2xlTnVtYmVyKSB7XG4gICAgaWYgKCEkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICEkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdW2hvbGVOdW1iZXJdO1xuICB9LFxuICBnZXRIb2xlcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hvbGVzO1xuICB9LFxuICBjbGVhckhvbGVzICgpIHtcbiAgICB0aGlzLl9ob2xlcyA9IFtdO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIGNsZWFyICgpIHtcbiAgICB0aGlzLmNsZWFySG9sZXMoKTtcblxuICAgIGlmICgkLmlzQXJyYXkodGhpcy5fbGF0bG5ncykgJiYgdGhpcy5fbGF0bG5nc1swXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldExhdExuZ3MoW10pO1xuICAgIH1cbiAgfSxcbiAgdXBkYXRlSG9sZVBvaW50IChob2xlR3JvdXBOdW1iZXIsIGhvbGVOdW1iZXIsIGxhdGxuZykge1xuICAgIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdW2hvbGVOdW1iZXJdID0gbGF0bG5nO1xuICAgIH0gZWxzZSBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAhJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHRoaXMuX2hvbGVzW2hvbGVHcm91cE51bWJlcl0gPSBsYXRsbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2hvbGVzID0gbGF0bG5nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgc2V0SG9sZXMgKGxhdGxuZ3MpIHtcbiAgICB0aGlzLl9ob2xlcyA9IGxhdGxuZ3M7XG4gIH0sXG4gIHNldEhvbGVQb2ludCAoaG9sZUdyb3VwTnVtYmVyLCBob2xlTnVtYmVyLCBsYXRsbmcpIHtcbiAgICB2YXIgbGF5ZXIgPSB0aGlzLmdldExheWVycygpWzBdO1xuICAgIGlmIChsYXllcikge1xuICAgICAgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgICAgbGF5ZXIuX2hvbGVzW2hvbGVHcm91cE51bWJlcl1baG9sZU51bWJlcl0gPSBsYXRsbmc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG59KSIsImV4cG9ydCBkZWZhdWx0IEwuQ29udHJvbC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICBlbWFpbDogJydcbiAgfSxcblxuICBvbkFkZCAobWFwKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1iYXIgbGVhZmxldC1zZWFyY2gtYmFyJyk7XG4gICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgdmFyIGxpbmsgPSBMLkRvbVV0aWwuY3JlYXRlKCdhJywgJycsIHdyYXBwZXIpO1xuICAgIGxpbmsuaHJlZiA9ICcjJztcblxuICAgIHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XG4gICAgTC5Eb21FdmVudFxuICAgICAgLm9uKGxpbmssICdjbGljaycsIHN0b3ApXG4gICAgICAub24obGluaywgJ21vdXNlZG93bicsIHN0b3ApXG4gICAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcbiAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgLm9uKGxpbmssICdjbGljaycsIHRoaXMuX3RvZ2dsZSwgdGhpcyk7XG5cbiAgICBsaW5rLmFwcGVuZENoaWxkKEwuRG9tVXRpbC5jcmVhdGUoJ2knLCAnZmEgZmEtc2VhcmNoJykpO1xuXG4gICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuXG4gICAgTC5Eb21FdmVudC5vbihmb3JtLCAnbW91c2V3aGVlbCcsIHN0b3ApO1xuICAgIEwuRG9tRXZlbnQub24oZm9ybSwgJ0RPTU1vdXNlU2Nyb2xsJywgc3RvcCk7XG4gICAgTC5Eb21FdmVudC5vbihmb3JtLCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIHN0b3ApO1xuXG4gICAgdmFyIGlucHV0ID0gdGhpcy5faW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuXG4gICAgTC5Eb21FdmVudFxuICAgICAgLm9uKGlucHV0LCAnY2xpY2snLCBzdG9wKVxuICAgICAgLm9uKGlucHV0LCAnbW91c2Vkb3duJywgc3RvcCk7XG5cbiAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcblxuICAgIHZhciBzdWJtaXRCdG4gPSB0aGlzLl9zdWJtaXRCdG4gPSBMLkRvbVV0aWwuY3JlYXRlKCdidXR0b24nLCAnbGVhZmxldC1zdWJtaXQtYnRuIHNlYXJjaCcpO1xuICAgIHN1Ym1pdEJ0bi50eXBlID0gXCJzdWJtaXRcIjtcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHN0b3ApXG4gICAgICAub24oc3VibWl0QnRuLCAnbW91c2Vkb3duJywgc3RvcClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuX2RvU2VhcmNoLCB0aGlzKTtcblxuICAgIGZvcm0uYXBwZW5kQ2hpbGQoc3VibWl0QnRuKTtcblxuICAgIHRoaXMuX2J0blRleHRDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdzcGFuJywgJ3RleHQnKTtcbiAgICB0aGlzLl9idG5UZXh0Q29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMuX21hcC5vcHRpb25zLnRleHQuc3VibWl0TG9hZEJ0bjtcbiAgICBzdWJtaXRCdG4uYXBwZW5kQ2hpbGQodGhpcy5fYnRuVGV4dENvbnRhaW5lcik7XG5cbiAgICB0aGlzLl9zcGluSWNvbiA9IEwuRG9tVXRpbC5jcmVhdGUoJ2knLCAnZmEgZmEtcmVmcmVzaCBmYS1zcGluJyk7XG4gICAgc3VibWl0QnRuLmFwcGVuZENoaWxkKHRoaXMuX3NwaW5JY29uKTtcblxuICAgIEwuRG9tRXZlbnQub24oZm9ybSwgJ3N1Ym1pdCcsIHN0b3ApLm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cbiAgICB0aGlzLl9tYXAub24oJ2xvYWRCdG5PcGVuZWQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XG5cbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGNvbnRhaW5lciwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGNvbnRhaW5lciwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCwgdGhpcyk7XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdidG4tbGVhZmxldC1tc2ctY29udGFpbmVyIHRpdGxlLWhpZGRlbicpO1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMuX21hcC5vcHRpb25zLnRleHQuc2VhcmNoTG9jYXRpb247XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RpdGxlQ29udGFpbmVyKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG5cbiAgX3RvZ2dsZSAoKSB7XG4gICAgaWYgKHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSAhPSAnYmxvY2snKSB7XG4gICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgdGhpcy5faW5wdXQuZm9jdXMoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdzZWFyY2hFbmFibGVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnc2VhcmNoRGlzYWJsZWQnKTtcbiAgICB9XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH0sXG5cbiAgX2NvbGxhcHNlICgpIHtcbiAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGhpcy5faW5wdXQudmFsdWUgPSAnJztcbiAgfSxcblxuICBfbm9taW5hdGltQ2FsbGJhY2sgKHJlc3VsdHMpIHtcblxuICAgIGlmICh0aGlzLl9yZXN1bHRzICYmIHRoaXMuX3Jlc3VsdHMucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgIH1cblxuICAgIHZhciByZXN1bHRzQ29udGFpbmVyID0gdGhpcy5fcmVzdWx0cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJzgwcHgnO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUub3ZlcmZsb3dZID0gJ2F1dG8nO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUub3ZlcmZsb3dYID0gJ2hpZGRlbic7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUubWFyZ2luID0gJzNweCc7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5wYWRkaW5nID0gJzJweCc7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXIgPSAnMnB4IGdyZXkgc29saWQnO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzJweCc7XG5cbiAgICBMLkRvbUV2ZW50Lm9uKHJlc3VsdHNDb250YWluZXIsICdtb3VzZWRvd24nLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG4gICAgTC5Eb21FdmVudC5vbihyZXN1bHRzQ29udGFpbmVyLCAnbW91c2V3aGVlbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcbiAgICBMLkRvbUV2ZW50Lm9uKHJlc3VsdHNDb250YWluZXIsICdET01Nb3VzZVNjcm9sbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcbiAgICBMLkRvbUV2ZW50Lm9uKHJlc3VsdHNDb250YWluZXIsICdNb3pNb3VzZVBpeGVsU2Nyb2xsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xuXG4gICAgdmFyIGRpdlJlc3VsdHMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRpdiA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdzZWFyY2gtcmVzdWx0cy1lbCcpO1xuICAgICAgZGl2LmlubmVySFRNTCA9IHJlc3VsdHNbaV0uZGlzcGxheV9uYW1lO1xuICAgICAgZGl2LnRpdGxlID0gcmVzdWx0c1tpXS5kaXNwbGF5X25hbWU7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCByZXN1bHQsIGRpdkVsKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkaXZSZXN1bHRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoZGl2UmVzdWx0c1tqXSwgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhkaXZFbCwgJ3NlbGVjdGVkJyk7XG5cbiAgICAgICAgICB2YXIgYmJveCA9IHJlc3VsdC5ib3VuZGluZ2JveDtcbiAgICAgICAgICBtYXAuZml0Qm91bmRzKEwubGF0TG5nQm91bmRzKFtbYmJveFswXSwgYmJveFsyXV0sIFtiYm94WzFdLCBiYm94WzNdXV0pKTtcbiAgICAgICAgfVxuICAgICAgfSh0aGlzLl9tYXAsIHJlc3VsdHNbaV0sIGRpdikpO1xuXG4gICAgICBMLkRvbUV2ZW50Lm9uKGRpdiwgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xuICAgICAgTC5Eb21FdmVudC5vbihkaXYsICdtb3VzZXdoZWVsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xuICAgICAgTC5Eb21FdmVudC5vbihkaXYsICdNb3pNb3VzZVBpeGVsU2Nyb2xsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xuICAgICAgTC5Eb21FdmVudC5vbihkaXYsICdET01Nb3VzZVNjcm9sbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAub24oZGl2LCAnY2xpY2snLCBjYWxsYmFjayk7XG5cbiAgICAgIGRpdlJlc3VsdHMucHVzaChkaXYpO1xuICAgIH1cblxuICAgIHRoaXMuX2Zvcm0uYXBwZW5kQ2hpbGQocmVzdWx0c0NvbnRhaW5lcik7XG5cbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX3Jlc3VsdHMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9yZXN1bHRzKTtcbiAgICB9XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3N1Ym1pdEJ0biwgJ2xvYWRpbmcnKTtcbiAgfSxcblxuICBfY2FsbGJhY2tJZDogMCxcblxuICBfZG9TZWFyY2ggKCkge1xuXG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3N1Ym1pdEJ0biwgJ2xvYWRpbmcnKTtcblxuICAgIHZhciBjYWxsYmFjayA9ICdfbF9vc21nZW9jb2Rlcl8nICsgdGhpcy5fY2FsbGJhY2tJZCsrO1xuICAgIHdpbmRvd1tjYWxsYmFja10gPSBMLlV0aWwuYmluZCh0aGlzLl9ub21pbmF0aW1DYWxsYmFjaywgdGhpcyk7XG4gICAgdmFyIHF1ZXJ5UGFyYW1zID0ge1xuICAgICAgcTogdGhpcy5faW5wdXQudmFsdWUsXG4gICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgIGxpbWl0OiAxMCxcbiAgICAgICdqc29uX2NhbGxiYWNrJzogY2FsbGJhY2tcbiAgICB9O1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZW1haWwpXG4gICAgICBxdWVyeVBhcmFtcy5lbWFpbCA9IHRoaXMub3B0aW9ucy5lbWFpbDtcbiAgICBpZiAodGhpcy5fbWFwLmdldEJvdW5kcygpKVxuICAgICAgcXVlcnlQYXJhbXMudmlld2JveCA9IHRoaXMuX21hcC5nZXRCb3VuZHMoKS50b0JCb3hTdHJpbmcoKTtcbiAgICB2YXIgdXJsID0gJ2h0dHA6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoJyArIEwuVXRpbC5nZXRQYXJhbVN0cmluZyhxdWVyeVBhcmFtcyk7XG4gICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH0sXG4gIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgaWYgKHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9PT0gJ2Jsb2NrJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfSxcbiAgX29uTW91c2VPdXQgKCkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLkNsYXNzLmV4dGVuZCh7XG4gIF90aW1lOiAyMDAwLFxuICBpbml0aWFsaXplIChtYXAsIHRleHQsIHRpbWUpIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5fcG9wdXBQYW5lID0gbWFwLl9wYW5lcy5wb3B1cFBhbmU7XG4gICAgdGhpcy5fdGV4dCA9ICcnIHx8IHRleHQ7XG4gICAgdGhpcy5faXNTdGF0aWMgPSBmYWxzZTtcbiAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10b29sdGlwJywgdGhpcy5fcG9wdXBQYW5lKTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgdGhpcy5fdGltZSA9IHRpbWUgfHwgdGhpcy5fdGltZTtcbiAgfSxcblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9wb3B1cFBhbmUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICAgIHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gICdzdGF0aWMnIChpc1N0YXRpYykge1xuICAgIHRoaXMuX2lzU3RhdGljID0gaXNTdGF0aWMgfHwgdGhpcy5faXNTdGF0aWM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9yZW5kZXIgKCkge1xuICAgIHRoaXMuX2NvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxzcGFuPlwiICsgdGhpcy5fdGV4dCArIFwiPC9zcGFuPlwiO1xuICB9LFxuICBfdXBkYXRlUG9zaXRpb24gKGxhdGxuZykge1xuICAgIHZhciBwb3MgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyksXG4gICAgICB0b29sdGlwQ29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xuXG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgdG9vbHRpcENvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2luaGVyaXQnO1xuICAgICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRvb2x0aXBDb250YWluZXIsIHBvcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX3Nob3dFcnJvciAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihsYXRsbmcpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1N0YXRpYykge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9zaG93SW5mbyAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtaW5mby10b29sdGlwJyk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGxhdGxuZyk7XG5cbiAgICBpZiAoIXRoaXMuX2lzU3RhdGljKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX2hpZGUgKCkge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWluZm8tdG9vbHRpcCcpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgdGV4dCAodGV4dCkge1xuICAgIHRoaXMuX3RleHQgPSB0ZXh0IHx8IHRoaXMuX3RleHQ7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH0sXG4gIHNob3cgKGxhdGxuZywgdHlwZSA9ICdpbmZvJykge1xuXG4gICAgdGhpcy50ZXh0KCk7XG5cbiAgICBpZih0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihsYXRsbmcpO1xuICAgIH1cbiAgICBpZih0eXBlID09PSAnaW5mbycpIHtcbiAgICAgIHRoaXMuc2hvd0luZm8obGF0bG5nKTtcbiAgICB9XG4gIH0sXG4gIHNob3dJbmZvIChsYXRsbmcpIHtcbiAgICB0aGlzLl9zaG93SW5mbyhsYXRsbmcpO1xuXG4gICAgaWYgKHRoaXMuX2hpZGVJbmZvVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVJbmZvVGltZW91dCk7XG4gICAgICB0aGlzLl9oaWRlSW5mb1RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVJbmZvVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIHNob3dFcnJvciAobGF0bG5nKSB7XG4gICAgdGhpcy5fc2hvd0Vycm9yKGxhdGxuZyk7XG5cbiAgICBpZiAodGhpcy5faGlkZUVycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVFcnJvclRpbWVvdXQpO1xuICAgICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIGhpZGUgKCkge1xuICAgIHRoaXMuX2hpZGUoKTtcbiAgfSxcbiAgX29uTW91c2VNb3ZlIChlKSB7XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oZS5sYXRsbmcpO1xuICB9LFxuICBzZXRUaW1lICh0aW1lKSB7XG4gICAgaWYgKHRpbWUpIHtcbiAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IEJ0bkN0cmwgZnJvbSAnLi9CdG5Db250cm9sJztcblxuZXhwb3J0IGRlZmF1bHQgQnRuQ3RybC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgZXZlbnROYW1lOiAndHJhc2hBZGRlZCcsXG4gICAgcHJlc3NFdmVudE5hbWU6ICd0cmFzaEJ0blByZXNzZWQnXG4gIH0sXG4gIF9idG46IG51bGwsXG4gIG9uQWRkIChtYXApIHtcbiAgICBtYXAub24oJ3RyYXNoQWRkZWQnLCAoZGF0YSkgPT4ge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKGRhdGEuY29udHJvbC5fYnRuLCAnZGlzYWJsZWQnKTtcblxuICAgICAgbWFwLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsIHRoaXMuX2JpbmRFdmVudHMsIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6c3RhcnRfYWRkX25ld19wb2x5Z29uJywgdGhpcy5fYmluZEV2ZW50cywgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpzdGFydF9hZGRfbmV3X2hvbGUnLCB0aGlzLl9iaW5kRXZlbnRzLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX3BvbHlnb24nLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9ob2xlJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjptYXBfY2xlYXJlZCcsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuXG4gICAgICB0aGlzLl9kaXNhYmxlQnRuKCk7XG4gICAgfSk7XG5cbiAgICB2YXIgY29udGFpbmVyID0gQnRuQ3RybC5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnYnRuLWxlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLl9tYXAub3B0aW9ucy50ZXh0LmxvYWRKc29uO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl90aXRsZUNvbnRhaW5lcik7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfYmluZEV2ZW50cyAoKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG5cbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCwgdGhpcyk7XG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdjbGljaycsIHRoaXMuX29uUHJlc3NCdG4sIHRoaXMpO1xuICB9LFxuICBfZGlzYWJsZUJ0biAoKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG5cbiAgICBMLkRvbUV2ZW50LnJlbW92ZUxpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyKTtcbiAgICBMLkRvbUV2ZW50LnJlbW92ZUxpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCk7XG4gICAgTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLl9idG4sICdjbGljaycsIHRoaXMuX29uUHJlc3NCdG4sIHRoaXMpO1xuICB9LFxuICBfb25QcmVzc0J0biAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB2YXIgc2VsZWN0ZWRNR3JvdXAgPSBtYXAuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcblxuICAgIGlmIChzZWxlY3RlZE1Hcm91cCA9PT0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKSAmJiBzZWxlY3RlZE1Hcm91cC5nZXRMYXllcnMoKVswXS5faXNGaXJzdCkge1xuICAgICAgbWFwLmNsZWFyKCk7XG4gICAgICBtYXAubW9kZSgnZHJhdycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZE1Hcm91cC5yZW1vdmUoKTtcbiAgICAgIHNlbGVjdGVkTUdyb3VwLmdldERFTGluZSgpLmNsZWFyKCk7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKTtcbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6cG9seWdvbjpkZWxldGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX29uTW91c2VPdXQoKTtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfSxcbiAgX29uTW91c2VPdmVyICgpIHtcbiAgICBpZiAoIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpKSB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgdmFyIGxheWVyID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKVswXTtcbiAgICAgIGlmIChsYXllciAmJiBsYXllci5faXNGaXJzdCkge1xuICAgICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0LnJlamVjdENoYW5nZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0LmRlbGV0ZVNlbGVjdGVkRWRnZXM7XG4gICAgICB9XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICB9XG4gIH0sXG4gIF9vbk1vdXNlT3V0ICgpIHtcbiAgICBpZiAoIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpKSB7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICB9XG4gIH1cbn0pOyIsImltcG9ydCBTZWFyY2hCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvU2VhcmNoQnRuJztcbmltcG9ydCBUcmFzaEJ0biBmcm9tICcuLi9leHRlbmRlZC9UcmFzaEJ0bic7XG5pbXBvcnQgTG9hZEJ0biBmcm9tICcuLi9leHRlbmRlZC9Mb2FkQnRuJztcbmltcG9ydCBCdG5Db250cm9sIGZyb20gJy4uL2V4dGVuZGVkL0J0bkNvbnRyb2wnO1xuaW1wb3J0IE1zZ0hlbHBlciBmcm9tICcuLi9leHRlbmRlZC9Nc2dIZWxwZXInO1xuaW1wb3J0IG0gZnJvbSAnLi4vdXRpbHMvbW9iaWxlJztcblxuaW1wb3J0IHpvb21UaXRsZSBmcm9tICcuLi90aXRsZXMvem9vbVRpdGxlJztcbmltcG9ydCBmdWxsU2NyZWVuVGl0bGUgZnJvbSAnLi4vdGl0bGVzL2Z1bGxTY3JlZW5UaXRsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcblxuICB6b29tVGl0bGUodGhpcyk7XG4gIGZ1bGxTY3JlZW5UaXRsZSh0aGlzKTtcblxuICBpZiAodGhpcy5vcHRpb25zLmRlZmF1bHRDb250cm9sTGF5ZXJzKSB7XG4gICAgdmFyIE9TTSA9IEwudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3NtLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICBhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29zbS5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzJ1xuICAgIH0pO1xuICAgIC8vIE9TTS5hZGRUbyhtYXApO1xuICAgIHRoaXMuYWRkTGF5ZXIoT1NNKTtcblxuICAgIHRoaXMuX2NvbnRyb2xMYXllcnMgPSBuZXcgTC5Db250cm9sLkxheWVycyh7XG4gICAgICBHb29nbGU6IG5ldyBMLkdvb2dsZSgpLFxuICAgICAgT1NNXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbnRyb2wodGhpcy5fY29udHJvbExheWVycyk7XG4gIH1cblxuICB0aGlzLnRvdWNoWm9vbS5kaXNhYmxlKCk7XG4gIHRoaXMuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcblxuICAvL3RoaXMuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgdGhpcy5ib3hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5rZXlib2FyZC5kaXNhYmxlKCk7XG5cbiAgdmFyIGNvbnRyb2xzID0gdGhpcy5vcHRpb25zLmNvbnRyb2xzO1xuXG4gIGlmIChjb250cm9scykge1xuICAgIGlmIChjb250cm9scy5nZW9TZWFyY2gpIHtcbiAgICAgIHRoaXMuYWRkQ29udHJvbChuZXcgU2VhcmNoQnRuKCkpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX0J0bkNvbnRyb2wgPSBCdG5Db250cm9sO1xuXG4gIHZhciB0cmFzaEJ0biA9IG5ldyBUcmFzaEJ0bih7XG4gICAgYnRuczogW1xuICAgICAgeyBjbGFzc05hbWU6ICdmYSBmYS10cmFzaCcgfSxcbiAgICBdLFxuICB9KTtcblxuICBsZXQgbG9hZEJ0bjtcblxuICBpZiAoY29udHJvbHMgJiYgY29udHJvbHMubG9hZEJ0bikge1xuICAgIGxvYWRCdG4gPSBuZXcgTG9hZEJ0bih7XG4gICAgICBidG5zOiBbXG4gICAgICAgIHsgY2xhc3NOYW1lOiAnZmEgZmEtYXJyb3ctY2lyY2xlLW8tZG93biBsb2FkJyB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBtc2dIZWxwZXIgPSB0aGlzLm1zZ0hlbHBlciA9IG5ldyBNc2dIZWxwZXIoe1xuICAgIGRlZmF1bHRNc2c6IHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXAsXG4gIH0pO1xuXG4gIHRoaXMub24oJ21zZ0hlbHBlckFkZGVkJywgKCkgPT4ge1xuICAgIHZhciB0ZXh0ID0gdGhpcy5vcHRpb25zLnRleHQ7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsICgpID0+IHtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9TZWxlY3RFZGdlcywgbnVsbCwgZGF0YS5tYXJrZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnNlbGVjdGVkX21pZGRsZV9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzLCBudWxsLCBkYXRhLm1hcmtlcik7XG4gICAgICB9KTtcblxuICAgICAgLy8gb24gZWRpdCBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW1vdmUnKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2Vtb3ZlJywgKGRhdGEpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9EcmF3SW5uZXJFZGdlcywgbnVsbCwgZGF0YS5sYXllclBvaW50KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLmhpZGUoKTtcbiAgICAgICAgdGhpcy5fc3RvcmVkTGF5ZXJQb2ludCA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgLy8gb24gdmlldyBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW1vdmUnKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2Vtb3ZlJywgKGRhdGEpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9FZGl0LCBudWxsLCBkYXRhLmxheWVyUG9pbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIuaGlkZSgpO1xuICAgICAgICB0aGlzLl9zdG9yZWRMYXllclBvaW50ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gaGlkZSBtc2dcbiAgICB0aGlzLm9mZignZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcpO1xuICAgIHRoaXMub24oJ2VkaXRvcjptYXJrZXJfbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICBtc2dIZWxwZXIuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gb24gc3RhcnQgZHJhdyBwb2x5Z29uXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9Kb2luRWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICB9KTtcblxuICAgIC8vIGRibGNsaWNrIHRvIGpvaW5cbiAgICB0aGlzLm9mZignZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicpO1xuICAgIHRoaXMub24oJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmRibGNsaWNrVG9Kb2luRWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpfX2pvaW5fcGF0aCcsIChkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5tYXJrZXIpIHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcywgbnVsbCwgZGF0YS5tYXJrZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy90b2RvOiBjb250aW51ZSB3aXRoIG9wdGlvbiAnYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uJ1xuICAgIHRoaXMub24oJ2VkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWQnLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gbXNnXG4gICAgICBpZiAoZGF0YS5pbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5pbnRlcnNlY3Rpb24sICdlcnJvcicsICh0aGlzLl9zdG9yZWRMYXllclBvaW50IHx8IHRoaXMuZ2V0U2VsZWN0ZWRNYXJrZXIoKSkpO1xuICAgICAgICB0aGlzLl9zdG9yZWRMYXllclBvaW50ID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1zZ0hlbHBlci5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWxlY3RlZE1hcmtlciA9IHRoaXMuZ2V0U2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgaWYgKCF0aGlzLmhhc0xheWVyKHNlbGVjdGVkTWFya2VyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxlY3RlZE1hcmtlciAmJiAhc2VsZWN0ZWRNYXJrZXIuX21Hcm91cC5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICAgIC8vc2V0IG1hcmtlciBzdHlsZVxuICAgICAgICBpZiAoZGF0YS5pbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAvL3NldCAnZXJyb3InIHN0eWxlXG4gICAgICAgICAgc2VsZWN0ZWRNYXJrZXIuc2V0SW50ZXJzZWN0ZWRTdHlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vcmVzdG9yZSBzdHlsZVxuICAgICAgICAgIHNlbGVjdGVkTWFya2VyLnJlc2V0U3R5bGUoKTtcblxuICAgICAgICAgIC8vcmVzdG9yZSBvdGhlciBtYXJrZXJzIHdoaWNoIGFyZSBhbHNvIG5lZWQgdG8gcmVzZXQgc3R5bGVcbiAgICAgICAgICB2YXIgbWFya2Vyc1RvUmVzZXQgPSBzZWxlY3RlZE1hcmtlci5fbUdyb3VwLmdldExheWVycygpLmZpbHRlcigobGF5ZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3MobGF5ZXIuX2ljb24sICdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hcmtlcnNUb1Jlc2V0Lm1hcCgobWFya2VyKSA9PiBtYXJrZXIucmVzZXRTdHlsZSgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBpZiAoIW0uaXNNb2JpbGVCcm93c2VyKCkpIHtcbiAgICB0aGlzLmFkZENvbnRyb2wobXNnSGVscGVyKTtcblxuICAgIGlmIChjb250cm9scyAmJiBjb250cm9scy5sb2FkQnRuKSB7XG4gICAgICB0aGlzLmFkZENvbnRyb2wobG9hZEJ0bik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbnRyb2xzICYmIGNvbnRyb2xzLnRyYXNoQnRuKSB7XG4gICAgdGhpcy5hZGRDb250cm9sKHRyYXNoQnRuKTtcbiAgfVxufVxuIiwiaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5cbndpbmRvdy5MZWFmbGV0RWRpdG9yID0gbWFwKCk7IiwiaW1wb3J0IFZpZXdHcm91cCBmcm9tICcuL3ZpZXcvZ3JvdXAnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcbmltcG9ydCBIb2xlc0dyb3VwIGZyb20gJy4vZWRpdC9ob2xlc0dyb3VwJztcbmltcG9ydCBFZGl0TGluZUdyb3VwIGZyb20gJy4vZWRpdC9saW5lJztcbmltcG9ydCBEYXNoZWRFZGl0TGluZUdyb3VwIGZyb20gJy4vZHJhdy9kYXNoZWQtbGluZSc7XG5pbXBvcnQgRHJhd0dyb3VwIGZyb20gJy4vZHJhdy9ncm91cCc7XG5cbmltcG9ydCAnLi9lZGl0L21hcmtlci1ncm91cCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdmlld0dyb3VwOiBudWxsLFxuICBlZGl0R3JvdXA6IG51bGwsXG4gIGVkaXRQb2x5Z29uOiBudWxsLFxuICBlZGl0TWFya2Vyc0dyb3VwOiBudWxsLFxuICBlZGl0TGluZUdyb3VwOiBudWxsLFxuICBkYXNoZWRFZGl0TGluZUdyb3VwOiBudWxsLFxuICBlZGl0SG9sZU1hcmtlcnNHcm91cDogbnVsbCxcbiAgc2V0TGF5ZXJzICgpIHtcbiAgICB0aGlzLnZpZXdHcm91cCA9IG5ldyBWaWV3R3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdEdyb3VwID0gbmV3IERyYXdHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihbXSk7XG4gICAgdGhpcy5lZGl0TWFya2Vyc0dyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdExpbmVHcm91cCA9IG5ldyBFZGl0TGluZUdyb3VwKFtdKTtcbiAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAgPSBuZXcgRGFzaGVkRWRpdExpbmVHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0SG9sZU1hcmtlcnNHcm91cCA9IG5ldyBIb2xlc0dyb3VwKFtdKTtcbiAgfVxufSIsImltcG9ydCBCYXNlIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgQ29udHJvbHNIb29rIGZyb20gJy4vaG9va3MvY29udHJvbHMnO1xuXG5pbXBvcnQgKiBhcyBsYXllcnMgZnJvbSAnLi9sYXllcnMnO1xuaW1wb3J0ICogYXMgb3B0cyBmcm9tICcuL29wdGlvbnMnO1xuXG5pbXBvcnQgJy4vdXRpbHMvYXJyYXknO1xuXG5mdW5jdGlvbiBtYXAodHlwZSkge1xuICBsZXQgSW5zdGFuY2UgPSAodHlwZSA9PT0gJ21hcGJveCcpID8gTC5tYXBib3guTWFwIDogTC5NYXA7XG4gIHZhciBtYXAgPSBJbnN0YW5jZS5leHRlbmQoJC5leHRlbmQoQmFzZSwge1xuICAgICQ6IHVuZGVmaW5lZCxcbiAgICBpbml0aWFsaXplIChpZCwgb3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMudGV4dCkge1xuICAgICAgICAkLmV4dGVuZChvcHRzLm9wdGlvbnMudGV4dCwgb3B0aW9ucy50ZXh0KTtcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMudGV4dDtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRyb2xzID0gb3B0aW9ucy5jb250cm9scztcbiAgICAgIGlmIChjb250cm9scykge1xuICAgICAgICBpZiAoY29udHJvbHMuem9vbSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBvcHRpb25zLnpvb21Db250cm9sID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9pZiAob3B0aW9ucy5kcmF3TGluZVN0eWxlKSB7XG4gICAgICAvLyAgJC5leHRlbmQob3B0cy5vcHRpb25zLmRyYXdMaW5lU3R5bGUsIG9wdGlvbnMuZHJhd0xpbmVTdHlsZSk7XG4gICAgICAvLyAgZGVsZXRlIG9wdGlvbnMuZHJhd0xpbmVTdHlsZTtcbiAgICAgIC8vfVxuICAgICAgaWYgKG9wdGlvbnMuc3R5bGUpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuc3R5bGUuZHJhdykge1xuICAgICAgICAgICQuZXh0ZW5kKG9wdHMub3B0aW9ucy5zdHlsZS5kcmF3LCBvcHRpb25zLnN0eWxlLmRyYXcpO1xuICAgICAgICB9XG4gICAgICAgIC8vZGVsZXRlIG9wdGlvbnMuc3R5bGUuZHJhdztcbiAgICAgICAgaWYgKG9wdGlvbnMuc3R5bGUudmlldykge1xuICAgICAgICAgICQuZXh0ZW5kKG9wdHMub3B0aW9ucy5zdHlsZS52aWV3LCBvcHRpb25zLnN0eWxlLnZpZXcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnN0eWxlLnN0YXJ0RHJhdykge1xuICAgICAgICAgICQuZXh0ZW5kKG9wdHMub3B0aW9ucy5zdHlsZS5zdGFydERyYXcsIG9wdGlvbnMuc3R5bGUuc3RhcnREcmF3KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5zdHlsZS5kcmF3TGluZSkge1xuICAgICAgICAgICQuZXh0ZW5kKG9wdHMub3B0aW9ucy5zdHlsZS5kcmF3TGluZSwgb3B0aW9ucy5zdHlsZS5kcmF3TGluZSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIG9wdGlvbnMuc3R5bGU7XG4gICAgICB9XG5cbiAgICAgICQuZXh0ZW5kKHRoaXMub3B0aW9ucywgb3B0cy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgIC8vTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0cy5vcHRpb25zKTtcblxuICAgICAgaWYgKHR5cGUgPT09ICdtYXBib3gnKSB7XG4gICAgICAgIEwubWFwYm94Lk1hcC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGlkLCB0aGlzLm9wdGlvbnMubWFwYm94SWQsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBMLk1hcC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGlkLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiQgPSAkKHRoaXMuX2NvbnRhaW5lcik7XG5cbiAgICAgIGxheWVycy5zZXRMYXllcnMoKTtcblxuICAgICAgdGhpcy5fYWRkTGF5ZXJzKFtcbiAgICAgICAgbGF5ZXJzLnZpZXdHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0R3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdFBvbHlnb25cbiAgICAgICAgLCBsYXllcnMuZWRpdE1hcmtlcnNHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0TGluZUdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmRhc2hlZEVkaXRMaW5lR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdEhvbGVNYXJrZXJzR3JvdXBcbiAgICAgIF0pO1xuXG4gICAgICB0aGlzLl9zZXRPdmVybGF5cyhvcHRpb25zKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvRHJhdykge1xuICAgICAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9zZXRPdmVybGF5cyAob3B0cykge1xuICAgICAgdmFyIG92ZXJsYXlzID0gb3B0cy5vdmVybGF5cztcblxuICAgICAgZm9yICh2YXIgaSBpbiBvdmVybGF5cykge1xuICAgICAgICB2YXIgb2kgPSBvdmVybGF5c1tpXTtcbiAgICAgICAgdGhpcy5fY29udHJvbExheWVycy5hZGRPdmVybGF5KG9pLCBpKTtcbiAgICAgICAgb2kuYWRkVG8odGhpcyk7XG4gICAgICAgIG9pLmJyaW5nVG9CYWNrKCk7XG4gICAgICAgIG9pLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBvaS5vbignbW91c2V1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0Vkdyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMudmlld0dyb3VwO1xuICAgIH0sXG4gICAgZ2V0RUdyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdEdyb3VwO1xuICAgIH0sXG4gICAgZ2V0RVBvbHlnb24gKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0UG9seWdvbjtcbiAgICB9LFxuICAgIGdldEVNYXJrZXJzR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0TWFya2Vyc0dyb3VwO1xuICAgIH0sXG4gICAgZ2V0RUxpbmVHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRMaW5lR3JvdXA7XG4gICAgfSxcbiAgICBnZXRERUxpbmUgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5kYXNoZWRFZGl0TGluZUdyb3VwO1xuICAgIH0sXG4gICAgZ2V0RUhNYXJrZXJzR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0SG9sZU1hcmtlcnNHcm91cDtcbiAgICB9LFxuICAgIGdldFNlbGVjdGVkUG9seWdvbjogKCkgPT4gdGhpcy5fc2VsZWN0ZWRQb2x5Z29uLFxuICAgIGdldFNlbGVjdGVkTUdyb3VwICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZE1Hcm91cDtcbiAgICB9XG4gIH0pKTtcblxuICBtYXAuYWRkSW5pdEhvb2soQ29udHJvbHNIb29rKTtcblxuICByZXR1cm4gbWFwO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXA7IiwiaW1wb3J0IG0gZnJvbSAnLi91dGlscy9tb2JpbGUnO1xuXG52YXIgc2l6ZSA9IDE7XG52YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5pZiAobS5pc01vYmlsZUJyb3dzZXIoKSkge1xuICBzaXplID0gMjtcbn1cblxuZXhwb3J0IHZhciBmaXJzdEljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb24tZmlyc3RcIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUsIDEwICogc2l6ZV1cbn0pO1xuXG5leHBvcnQgdmFyIGljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUsIDEwICogc2l6ZV1cbn0pO1xuXG5leHBvcnQgdmFyIGRyYWdJY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uLWRyYWdcIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUgKiAzLCAxMCAqIHNpemUgKiAzXVxufSk7XG5cbmV4cG9ydCB2YXIgbWlkZGxlSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1taWRkbGUtZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUsIDEwICogc2l6ZV1cblxufSk7XG5cbi8vIGRpc2FibGUgaG92ZXIgaWNvbiB0byBzaW1wbGlmeVxuXG5leHBvcnQgdmFyIGhvdmVySWNvbiA9IGljb24gfHwgTC5kaXZJY29uKHtcbiAgICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb25cIixcbiAgICBpY29uU2l6ZTogWzIgKiA3ICogc2l6ZSwgMiAqIDcgKiBzaXplXVxuICB9KTtcblxuZXhwb3J0IHZhciBpbnRlcnNlY3Rpb25JY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvblwiLFxuICBpY29uU2l6ZTogWzIgKiA3ICogc2l6ZSwgMiAqIDcgKiBzaXplXVxufSk7IiwidmFyIHZpZXdDb2xvciA9ICcjMDBGRkZGJztcbnZhciBkcmF3Q29sb3IgPSAnIzAwRjgwMCc7XG52YXIgd2VpZ2h0ID0gMztcblxuZXhwb3J0IHZhciBvcHRpb25zID0ge1xuICBhbGxvd0ludGVyc2VjdGlvbjogZmFsc2UsXG4gIGFsbG93Q29ycmVjdEludGVyc2VjdGlvbjogZmFsc2UsIC8vdG9kbzogdW5maW5pc2hlZFxuICBmb3JjZVRvRHJhdzogdHJ1ZSxcbiAgdHJhbnNsYXRpb25zOiB7XG4gICAgcmVtb3ZlUG9seWdvbjogJ3JlbW92ZSBwb2x5Z29uJyxcbiAgICByZW1vdmVQb2ludDogJ3JlbW92ZSBwb2ludCdcbiAgfSxcbiAgb3ZlcmxheXM6IHt9LFxuICBkZWZhdWx0Q29udHJvbExheWVyczogdHJ1ZSxcbiAgc3R5bGU6IHtcbiAgICB2aWV3OiB7XG4gICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICBmaWxsT3BhY2l0eTogMC4yLFxuICAgICAgZGFzaEFycmF5OiBudWxsLFxuICAgICAgY2xpY2thYmxlOiBmYWxzZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBjb2xvcjogdmlld0NvbG9yLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRcbiAgICB9LFxuICAgIGRyYXc6IHtcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjIsXG4gICAgICBkYXNoQXJyYXk6ICc1LCAxMCcsXG4gICAgICBjbGlja2FibGU6IHRydWUsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgY29sb3I6IGRyYXdDb2xvcixcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfSxcbiAgICBzdGFydERyYXc6IHt9LFxuICAgIGRyYXdMaW5lOiB7XG4gICAgICBvcGFjaXR5OiAwLjcsXG4gICAgICBmaWxsOiBmYWxzZSxcbiAgICAgIGZpbGxDb2xvcjogZHJhd0NvbG9yLFxuICAgICAgY29sb3I6IGRyYXdDb2xvcixcbiAgICAgIHdlaWdodDogd2VpZ2h0LFxuICAgICAgZGFzaEFycmF5OiAnNSwgMTAnLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgY2xpY2thYmxlOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgbWFya2VySWNvbjogdW5kZWZpbmVkLFxuICBtYXJrZXJIb3Zlckljb246IHVuZGVmaW5lZCxcbiAgZXJyb3JMaW5lU3R5bGU6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgd2VpZ2h0OiAzLFxuICAgIG9wYWNpdHk6IDEsXG4gICAgc21vb3RoRmFjdG9yOiAxXG4gIH0sXG4gIHByZXZpZXdFcnJvckxpbmVTdHlsZToge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICB3ZWlnaHQ6IDMsXG4gICAgb3BhY2l0eTogMSxcbiAgICBzbW9vdGhGYWN0b3I6IDEsXG4gICAgZGFzaEFycmF5OiAnNSwgMTAnXG4gIH0sXG4gIHRleHQ6IHtcbiAgICBpbnRlcnNlY3Rpb246ICdTZWxmLWludGVyc2VjdGlvbiBpcyBwcm9oaWJpdGVkJyxcbiAgICBkZWxldGVQb2ludEludGVyc2VjdGlvbjogJ0RlbGV0aW9uIG9mIHBvaW50IGlzIG5vdCBwb3NzaWJsZS4gU2VsZi1pbnRlcnNlY3Rpb24gaXMgcHJvaGliaXRlZCcsXG4gICAgcmVtb3ZlUG9seWdvbjogJ1JlbW92ZSBwb2x5Z29uJyxcbiAgICBjbGlja1RvRWRpdDogJ2NsaWNrIHRvIGVkaXQnLFxuICAgIGNsaWNrVG9BZGROZXdFZGdlczogJzxkaXY+Y2xpY2smbmJzcDsmbmJzcDs8ZGl2IGNsYXNzPVxcJ20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbiBzdGF0aWMgZ3JvdXAtc2VsZWN0ZWRcXCc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gYWRkIG5ldyBlZGdlczwvZGl2PicsXG4gICAgY2xpY2tUb0RyYXdJbm5lckVkZ2VzOiAnY2xpY2sgdG8gZHJhdyBpbm5lciBlZGdlcycsXG4gICAgY2xpY2tUb0pvaW5FZGdlczogJ2NsaWNrIHRvIGpvaW4gZWRnZXMnLFxuICAgIGNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzOiAnPGRpdj5jbGljayZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9XFwnbS1lZGl0b3ItZGl2LWljb24gc3RhdGljIGdyb3VwLXNlbGVjdGVkXFwnPjwvZGl2PiZuYnNwOyZuYnNwO3RvIHJlbW92ZSBlZGdlJm5ic3A7Jm5ic3A7b3I8YnI+Y2xpY2smbmJzcDsmbmJzcDs8aSBjbGFzcz1cXCdmYSBmYS10cmFzaFxcJz48L2k+Jm5ic3A7Jm5ic3A7dG8gcmVtb3ZlIGFsbCBzZWxlY3RlZCBlZGdlczwvZGl2PicsXG4gICAgY2xpY2tUb1NlbGVjdEVkZ2VzOiAnPGRpdj5jbGljayZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9XFwnbS1lZGl0b3ItZGl2LWljb24gc3RhdGljXFwnPjwvZGl2PiZuYnNwOy8mbmJzcDs8ZGl2IGNsYXNzPVxcJ20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbiBzdGF0aWNcXCc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gc2VsZWN0IGVkZ2VzPC9kaXY+JyxcbiAgICBkYmxjbGlja1RvSm9pbkVkZ2VzOiAnZG91YmxlIGNsaWNrIHRvIGpvaW4gZWRnZXMnLFxuICAgIGNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXA6ICdjbGljayB0byBzdGFydCBkcmF3IHBvbHlnb24gb24gbWFwJyxcbiAgICBkZWxldGVTZWxlY3RlZEVkZ2VzOiAnZGVsZXRlZCBzZWxlY3RlZCBlZGdlcycsXG4gICAgcmVqZWN0Q2hhbmdlczogJ3JlamVjdCBjaGFuZ2VzJyxcbiAgICBqc29uV2FzTG9hZGVkOiAnSlNPTiB3YXMgbG9hZGVkJyxcbiAgICBjaGVja0pzb246ICdjaGVjayBKU09OJyxcbiAgICBsb2FkSnNvbjogJ2xvYWQgR2VvSlNPTicsXG4gICAgZm9yZ2V0VG9TYXZlOiAnU2F2ZSBjaGFuZ2VzIGJ5IHByZXNzaW5nIG91dHNpZGUgb2YgcG9seWdvbicsXG4gICAgc2VhcmNoTG9jYXRpb246ICdTZWFyY2ggbG9jYXRpb24nLFxuICAgIHN1Ym1pdExvYWRCdG46ICdzdWJtaXQnLFxuICAgIHpvb206ICdab29tJyxcbiAgICBoaWRlRnVsbFNjcmVlbjogJ0hpZGUgZnVsbCBzY3JlZW4nLFxuICAgIHNob3dGdWxsU2NyZWVuOiAnU2hvdyBmdWxsIHNjcmVlbidcbiAgfSxcbiAgd29ybGRDb3B5SnVtcDogdHJ1ZVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChtYXApIHtcbiAgaWYgKCFtYXAub3B0aW9ucy5mdWxsc2NyZWVuQ29udHJvbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBsaW5rID0gbWFwLmZ1bGxzY3JlZW5Db250cm9sLmxpbms7XG4gIGxpbmsudGl0bGUgPSBcIlwiO1xuICBMLkRvbVV0aWwuYWRkQ2xhc3MobGluaywgJ2Z1bGwtc2NyZWVuJyk7XG5cbiAgbWFwLm9mZignZnVsbHNjcmVlbmNoYW5nZScpO1xuICBtYXAub24oJ2Z1bGxzY3JlZW5jaGFuZ2UnLCAoKSA9PiB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG5cbiAgICBpZiAobWFwLmlzRnVsbHNjcmVlbigpKSB7XG4gICAgICBtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0LmhpZGVGdWxsU2NyZWVuO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0LnNob3dGdWxsU2NyZWVuO1xuICAgIH1cbiAgfSwgdGhpcyk7XG5cbiAgdmFyIGZ1bGxTY3JlZW5Db250YWluZXIgPSBtYXAuZnVsbHNjcmVlbkNvbnRyb2wuX2NvbnRhaW5lcjtcblxuICBtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdidG4tbGVhZmxldC1tc2ctY29udGFpbmVyIHRpdGxlLWhpZGRlbicpO1xuICBtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0LnNob3dGdWxsU2NyZWVuO1xuICBmdWxsU2NyZWVuQ29udGFpbmVyLmFwcGVuZENoaWxkKG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyKTtcblxuICB2YXIgX29uTW91c2VPdmVyID0gKCkgPT4ge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9O1xuICB2YXIgX29uTW91c2VPdXQgPSAoKSA9PiB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH07XG5cbiAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihmdWxsU2NyZWVuQ29udGFpbmVyLCAnbW91c2VvdmVyJywgX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihmdWxsU2NyZWVuQ29udGFpbmVyLCAnbW91c2VvdXQnLCBfb25Nb3VzZU91dCwgdGhpcyk7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG1hcCkge1xuICB2YXIgY29udHJvbHMgPSBtYXAub3B0aW9ucy5jb250cm9scztcbiAgaWYgKGNvbnRyb2xzICYmICFjb250cm9scy56b29tKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoIW1hcC56b29tQ29udHJvbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB6b29tQ29udGFpbmVyID0gbWFwLnpvb21Db250cm9sLl9jb250YWluZXI7XG4gIG1hcC5fdGl0bGVab29tQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2J0bi1sZWFmbGV0LW1zZy1jb250YWluZXIgem9vbSB0aXRsZS1oaWRkZW4nKTtcbiAgbWFwLl90aXRsZVpvb21Db250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC56b29tO1xuICB6b29tQ29udGFpbmVyLmFwcGVuZENoaWxkKG1hcC5fdGl0bGVab29tQ29udGFpbmVyKTtcblxuICB2YXIgX29uTW91c2VPdmVyWm9vbSA9ICgpID0+IHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MobWFwLl90aXRsZVpvb21Db250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfTtcbiAgdmFyIF9vbk1vdXNlT3V0Wm9vbSA9ICgpID0+IHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3MobWFwLl90aXRsZVpvb21Db250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfTtcblxuICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHpvb21Db250YWluZXIsICdtb3VzZW92ZXInLCBfb25Nb3VzZU92ZXJab29tLCB0aGlzKTtcbiAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih6b29tQ29udGFpbmVyLCAnbW91c2VvdXQnLCBfb25Nb3VzZU91dFpvb20sIHRoaXMpO1xuXG4gIG1hcC56b29tQ29udHJvbC5fem9vbUluQnV0dG9uLnRpdGxlID0gXCJcIjtcbiAgbWFwLnpvb21Db250cm9sLl96b29tT3V0QnV0dG9uLnRpdGxlID0gXCJcIjtcbn0iLCJBcnJheS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIHRoaXMuc3BsaWNlKHRvLCAwLCB0aGlzLnNwbGljZShmcm9tLCAxKVswXSk7XG59O1xuQXJyYXkucHJvdG90eXBlLl9lYWNoID0gZnVuY3Rpb24oZnVuYykge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGZ1bmMuY2FsbCh0aGlzLCB0aGlzW2ldLCBpKTtcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IEFycmF5O1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBpc01vYmlsZUJyb3dzZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2hlY2sgPSBmYWxzZTtcbiAgICAoZnVuY3Rpb24gKGEpIHtcbiAgICAgIGlmICgvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vfGFuZHJvaWR8aXBhZHxwbGF5Ym9va3xzaWxrL2kudGVzdChhKSB8fCAvMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298c1xcLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXxcXC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YndcXC0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbVxcLXxjZWxsfGNodG18Y2xkY3xjbWRcXC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGNcXC1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfFxcLWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseShcXC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2ZcXC01fGdcXC1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkXFwtKG18cHx0KXxoZWlcXC18aGkocHR8dGEpfGhwKCBpfGlwKXxoc1xcLWN8aHQoYyhcXC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpXFwtKDIwfGdvfG1hKXxpMjMwfGlhYyggfFxcLXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djXFwtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fFxcLVthLXddKXxsaWJ3fGx5bnh8bTFcXC13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bVxcLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KFxcLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pXFwtfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3xcXC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG5cXC0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHRcXC1nfHFhXFwtYXxxYygwN3wxMnwyMXwzMnw2MHxcXC1bMi03XXxpXFwtKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aFxcLXxvb3xwXFwtKXxzZGtcXC98c2UoYyhcXC18MHwxKXw0N3xtY3xuZHxyaSl8c2doXFwtfHNoYXJ8c2llKFxcLXxtKXxza1xcLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aFxcLXx2XFwtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsXFwtfHRkZ1xcLXx0ZWwoaXxtKXx0aW1cXC18dFxcLW1vfHRvKHBsfHNoKXx0cyg3MHxtXFwtfG0zfG01KXx0eFxcLTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfFxcLXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoXFwtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzXFwtfHlvdXJ8emV0b3x6dGVcXC0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKSkge1xuICAgICAgICBjaGVjayA9IHRydWU7XG4gICAgICB9XG4gICAgfSkobmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8IHdpbmRvdy5vcGVyYSk7XG4gICAgcmV0dXJuIGNoZWNrO1xuICB9XG59OyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvYmplY3QgPSB7fSwgYXJyYXkgPSBbXSkge1xuICB2YXIgcnNsdCA9IG9iamVjdDtcblxuICB2YXIgdG1wO1xuICB2YXIgX2Z1bmMgPSBmdW5jdGlvbiAoaWQsIGluZGV4KSB7XG4gICAgdmFyIHBvc2l0aW9uID0gcnNsdFtpZF0ucG9zaXRpb247XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChwb3NpdGlvbiAhPT0gaW5kZXgpIHtcbiAgICAgICAgdG1wID0gcnNsdFtpZF07XG4gICAgICAgIHJzbHRbaWRdID0gcnNsdFthcnJheVtwb3NpdGlvbl1dO1xuICAgICAgICByc2x0W2FycmF5W3Bvc2l0aW9uXV0gPSB0bXA7XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiAhPSBpbmRleCkge1xuICAgICAgICBfZnVuYy5jYWxsKG51bGwsIGlkLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBhcnJheS5mb3JFYWNoKF9mdW5jKTtcblxuICByZXR1cm4gcnNsdDtcbn07IiwiZXhwb3J0IGRlZmF1bHQgTC5NdWx0aVBvbHlnb24uZXh0ZW5kKHtcbiAgaW5pdGlhbGl6ZSAobGF0bG5ncywgb3B0aW9ucykge1xuICAgIEwuTXVsdGlQb2x5Z29uLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5ncywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm9uKCdsYXllcmFkZCcsIChlKSA9PiB7XG4gICAgICB2YXIgbVZpZXdTdHlsZSA9IHRoaXMuX21hcC5vcHRpb25zLnN0eWxlLnZpZXc7XG4gICAgICBlLnRhcmdldC5zZXRTdHlsZSgkLmV4dGVuZCh7XG4gICAgICAgIG9wYWNpdHk6IDAuNyxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDAuMzUsXG4gICAgICAgIGNvbG9yOiAnIzAwQUJGRidcbiAgICAgIH0sIG1WaWV3U3R5bGUpKTtcblxuICAgICAgdGhpcy5fbWFwLl9tb3ZlRVBvbHlnb25PblRvcCgpO1xuICAgIH0pO1xuICB9LFxuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMDtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIEwuTXVsdGlQb2x5Z29uLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlbW92ZScsIHsgbGF5ZXJQb2ludDogZS5sYXllclBvaW50IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2Vtb3ZlJywgeyBsYXllclBvaW50OiBlLmxheWVyUG9pbnQgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLm9uKCdtb3VzZW91dCcsICgpID0+IHtcbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBvbkNsaWNrIChlKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB2YXIgc2VsZWN0ZWRNR3JvdXAgPSBtYXAuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcbiAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgaWYgKChlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkgJiYgZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHx8XG4gICAgICAoc2VsZWN0ZWRNR3JvdXAgJiYgc2VsZWN0ZWRNR3JvdXAuZ2V0Rmlyc3QoKSAmJiBzZWxlY3RlZE1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhc2VsZWN0ZWRNR3JvdXAuaXNFbXB0eSgpKSkge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgZU1hcmtlcnNHcm91cC5zZXQoZS5sYXRsbmcpO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KGVNYXJrZXJzR3JvdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyByZXNldFxuICAgICAgaWYgKG1hcC5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSkge1xuICAgICAgICBtYXAuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH1cbiAgICAgIG1hcC5jbGVhcigpO1xuICAgICAgbWFwLm1vZGUoJ2RyYXcnKTtcblxuICAgICAgbWFwLl9oaWRlU2VsZWN0ZWRWTGF5ZXIoZS5sYXllcik7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAucmVzdG9yZShlLmxheWVyKTtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChlTWFya2Vyc0dyb3VwKTtcblxuICAgICAgZU1hcmtlcnNHcm91cC5zZWxlY3QoKTtcbiAgICB9XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlbW92ZScpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgfVxufSk7Il19
