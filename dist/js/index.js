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
        if (e.target.getEPolygon()._path == e.originalEvent.target) {
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

    this.on('editor:join_path', function (e) {
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

      _this.fire('editor:polygon:created');
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

    this.off('editor:join_path');

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
            map.fire('editor:join_path', { mGroup: mGroup });
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
            map.fire('editor:polygon:deleted');
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
          //this._map.fire('editor:join_path', {marker: this});
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

    if (!this._isHole) {
      map.getVGroup().removeLayer(map._getSelectedVLayer());
    }
    map.fire('editor:polygon:deleted');
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
    var ggl = new L.Google();

    this.addLayer(ggl);

    this._controlLayers = new L.Control.Layers({
      Google: ggl
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

    _this.on('editor:join_path', function (data) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvYmFzZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9kcmF3L2Rhc2hlZC1saW5lLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZXZlbnRzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZ3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9ob2xlc0dyb3VwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvbGluZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L21hcmtlci1ncm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L21hcmtlci5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L3BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvQmFzZU1hcmtlckdyb3VwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0J0bkNvbnRyb2wuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTG9hZEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9Nc2dIZWxwZXIuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvUG9seWdvbi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9TZWFyY2hCdG4uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvVG9vbHRpcC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9UcmFzaEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9pbmRleC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9sYXllcnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvbWFwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL21hcmtlci1pY29ucy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9vcHRpb25zLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3RpdGxlcy9mdWxsU2NyZWVuVGl0bGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdGl0bGVzL3pvb21UaXRsZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy91dGlscy9hcnJheS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy91dGlscy9tb2JpbGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdXRpbHMvc29ydEJ5UG9zaXRpb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdmlldy9ncm91cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzBCQ0F1QixlQUFlOzs7OzJCQUNkLGdCQUFnQjs7OztxQkFFekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN0QixpQkFBZSxFQUFFLFNBQVM7QUFDMUIsaUJBQWUsRUFBRSxTQUFTO0FBQzFCLG9CQUFrQixFQUFFLFNBQVM7QUFDN0IsMkJBQXlCLEVBQUUsS0FBSztBQUNoQyxXQUFTLEVBQUUsTUFBTTtBQUNqQixnQkFBYyxFQUFFLFNBQVM7QUFDekIsb0JBQWtCLEVBQUMsOEJBQUc7QUFDcEIsV0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0dBQzdCO0FBQ0Qsb0JBQWtCLEVBQUMsNEJBQUMsS0FBSyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0dBQzlCO0FBQ0Qsc0JBQW9CLEVBQUMsZ0NBQUc7QUFDdEIsUUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7R0FDbEM7QUFDRCxxQkFBbUIsRUFBQyw2QkFBQyxLQUFLLEVBQUU7QUFDMUIsU0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVwQixRQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDOztBQUVwRCxRQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0IsU0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztHQUN6QztBQUNELHFCQUFtQixFQUFDLCtCQUErQjtRQUE5QixLQUFLLHlEQUFHLElBQUksQ0FBQyxlQUFlOztBQUMvQyxRQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsYUFBTztLQUNSO0FBQ0Qs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O0FBQy9CLFNBQUcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRWxDLG1CQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDeEI7R0FDRjtBQUNELFVBQVEsRUFBQyxrQkFBQyxHQUFHLEVBQUU7QUFDYixRQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXJCLE9BQUcsQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUN6QyxPQUFHLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7R0FDekM7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEcmF3RXZlbnRzIGZyb20gJy4vZHJhdy9ldmVudHMnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcblxuZXhwb3J0IGRlZmF1bHQgJC5leHRlbmQoe1xuICBfc2VsZWN0ZWRNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX3NlbGVjdGVkVkxheWVyOiB1bmRlZmluZWQsXG4gIF9vbGRTZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkOiBmYWxzZSxcbiAgX21vZGVUeXBlOiAnZHJhdycsXG4gIF9jb250cm9sTGF5ZXJzOiB1bmRlZmluZWQsXG4gIF9nZXRTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkVkxheWVyO1xuICB9LFxuICBfc2V0U2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2NsZWFyU2VsZWN0ZWRWTGF5ZXIgKCkge1xuICAgIHRoaXMuX3NlbGVjdGVkVkxheWVyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfaGlkZVNlbGVjdGVkVkxheWVyIChsYXllcikge1xuICAgIGxheWVyLmJyaW5nVG9CYWNrKCk7XG5cbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vc2hvdyBsYXN0IGxheWVyXG4gICAgdGhpcy5fc2hvd1NlbGVjdGVkVkxheWVyKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgIC8vaGlkZVxuICAgIHRoaXMuX3NldFNlbGVjdGVkVkxheWVyKGxheWVyKTtcbiAgICBsYXllci5fcGF0aC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIH0sXG4gIF9zaG93U2VsZWN0ZWRWTGF5ZXIgKGxheWVyID0gdGhpcy5fc2VsZWN0ZWRWTGF5ZXIpIHtcbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcbiAgfSxcbiAgX2FkZEVHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgZUdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGlmICghbGF5ZXIuaXNFbXB0eSgpKSB7XG4gICAgICAgIHZhciBob2xlcyA9IGxheWVyLl9ob2xlcztcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgICAgICBsYXRsbmdzID0gW2xhdGxuZ3NdLmNvbmNhdChob2xlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZHcm91cC5hZGRMYXllcihMLnBvbHlnb24obGF0bG5ncykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfYWRkRVBvbHlnb25fVG9fVkdyb3VwICgpIHtcbiAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG5cbiAgICB2YXIgaG9sZXMgPSBlUG9seWdvbi5nZXRIb2xlcygpO1xuICAgIHZhciBsYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoIDw9IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gIH0sXG4gIF9zZXRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgc2VsZWN0ZWRWTGF5ZXIgPSB0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgaWYgKCFzZWxlY3RlZFZMYXllcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGVjdGVkVkxheWVyLl9sYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuICAgIHNlbGVjdGVkVkxheWVyLl9ob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIucmVkcmF3KCk7XG4gIH0sXG4gIF9jb252ZXJ0X0VHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLl9hZGRFR3JvdXBfVG9fVkdyb3VwKCk7XG4gIH0sXG4gIF9jb252ZXJ0VG9FZGl0IChncm91cCkge1xuICAgIGlmIChncm91cCBpbnN0YW5jZW9mIEwuTXVsdGlQb2x5Z29uKSB7XG4gICAgICB2YXIgZUdyb3VwID0gdGhpcy5nZXRFR3JvdXAoKTtcblxuICAgICAgZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAgIGdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG5cbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihsYXRsbmdzKTtcbiAgICAgICAgZWRpdFBvbHlnb24uYWRkVG8odGhpcyk7XG4gICAgICAgIGVHcm91cC5hZGRMYXllcihlZGl0UG9seWdvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBlR3JvdXA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NYXJrZXJHcm91cCkge1xuICAgICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgICAgdmFyIGxheWVycyA9IGdyb3VwLmdldExheWVycygpO1xuICAgICAgbGF5ZXJzID0gbGF5ZXJzLmZpbHRlcigobGF5ZXIpID0+ICFsYXllci5pc01pZGRsZSgpKTtcbiAgICAgIHZhciBwb2ludHNBcnJheSA9IGxheWVycy5tYXAoKGxheWVyKSA9PiBsYXllci5nZXRMYXRMbmcoKSk7XG5cbiAgICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG5cbiAgICAgIGlmIChob2xlcykge1xuICAgICAgICBwb2ludHNBcnJheSA9IFtwb2ludHNBcnJheV0uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cblxuICAgICAgZVBvbHlnb24uc2V0TGF0TG5ncyhwb2ludHNBcnJheSk7XG4gICAgICBlUG9seWdvbi5yZWRyYXcoKTtcblxuICAgICAgcmV0dXJuIGVQb2x5Z29uO1xuICAgIH1cbiAgfSxcbiAgX3NldE1vZGUgKHR5cGUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuc2V0U3R5bGUob3B0aW9ucy5zdHlsZVt0eXBlXSk7XG4gIH0sXG5cbiAgX2dldE1vZGVUeXBlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIF9zZXRNb2RlVHlwZSAodHlwZSkge1xuICAgIHRoaXMuJC5yZW1vdmVDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gICAgdGhpcy5fbW9kZVR5cGUgPSB0eXBlO1xuICAgIHRoaXMuJC5hZGRDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gIH0sXG4gIF9zZXRNYXJrZXJzR3JvdXBJY29uIChtYXJrZXJHcm91cCkge1xuICAgIHZhciBtSWNvbiA9IHRoaXMub3B0aW9ucy5tYXJrZXJJY29uO1xuICAgIHZhciBtSG92ZXJJY29uID0gdGhpcy5vcHRpb25zLm1hcmtlckhvdmVySWNvbjtcblxuICAgIHZhciBtb2RlID0gdGhpcy5fZ2V0TW9kZVR5cGUoKTtcbiAgICBpZiAobUljb24pIHtcbiAgICAgIGlmICghbUljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gbUljb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWNvbiA9IG1JY29uLm1vZGVbbW9kZV07XG4gICAgICAgIGlmIChpY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtSG92ZXJJY29uKSB7XG4gICAgICBpZiAoIW1Ib3Zlckljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBtSG92ZXJJY29uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGljb24gPSBtSG92ZXJJY29uW21vZGVdO1xuICAgICAgICBpZiAoaWNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiB8fCBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uO1xuXG4gICAgaWYgKG1vZGUgPT09IFwiYWZ0ZXJEcmF3XCIpIHtcbiAgICAgIG1hcmtlckdyb3VwLnVwZGF0ZVN0eWxlKCk7XG4gICAgfVxuICB9LFxuICBtb2RlICh0eXBlKSB7XG4gICAgdGhpcy5maXJlKHRoaXMuX21vZGVUeXBlICsgJ19ldmVudHNfZGlzYWJsZScpO1xuICAgIHRoaXMuZmlyZSh0eXBlICsgJ19ldmVudHNfZW5hYmxlJyk7XG5cbiAgICB0aGlzLl9zZXRNb2RlVHlwZSh0eXBlKTtcblxuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICAgIHR5cGUgPSB0aGlzW3R5cGVdKCkgfHwgdHlwZTtcbiAgICAgIHRoaXMuX3NldE1vZGUodHlwZSk7XG4gICAgfVxuICB9LFxuICBpc01vZGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIGRyYXcgKCkge1xuICAgIGlmICh0aGlzLmlzTW9kZSgnZWRpdCcpIHx8IHRoaXMuaXNNb2RlKCd2aWV3JykgfHwgdGhpcy5pc01vZGUoJ2FmdGVyRHJhdycpKSB7XG4gICAgICB0aGlzLl9jbGVhck1hcCgpO1xuXG4gICAgfVxuICAgIHRoaXMuX2JpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5fY2xlYXJNYXAoKTtcblxuICAgIHRoaXMubW9kZSgndmlldycpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICB0aGlzLl9jbGVhck1hcCgpO1xuICAgIHRoaXMuZmlyZSgnZWRpdG9yOm1hcF9jbGVhcmVkJyk7XG4gIH0sXG4gIGNsZWFyQWxsICgpIHtcbiAgICB0aGlzLm1vZGUoJ3ZpZXcnKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5jbGVhckxheWVycygpO1xuICB9LFxuICAvKipcbiAgICpcbiAgICogVGhlIG1haW4gaWRlYSBpcyB0byBzYXZlIEVQb2x5Z29uIHRvIFZHcm91cCB3aGVuOlxuICAgKiAxKSB1c2VyIGFkZCBuZXcgcG9seWdvblxuICAgKiAyKSB3aGVuIHVzZXIgZWRpdCBwb2x5Z29uXG4gICAqXG4gICAqICovXG4gICAgc2F2ZVN0YXRlICgpIHtcblxuICAgIHZhciBlUG9seWdvbiA9IF9tYXAuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmICghZVBvbHlnb24uaXNFbXB0eSgpKSB7XG4gICAgICAvL3RoaXMuZml0Qm91bmRzKGVQb2x5Z29uLmdldEJvdW5kcygpKTtcbiAgICAgIC8vdGhpcy5tc2dIZWxwZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmZvcmdldFRvU2F2ZSk7XG5cbiAgICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgdmFyIGdlb2pzb24gPSB0aGlzLmdldFZHcm91cCgpLnRvR2VvSlNPTigpO1xuICAgIGlmIChnZW9qc29uLmdlb21ldHJ5KSB7XG4gICAgICByZXR1cm4gZ2VvanNvbi5nZW9tZXRyeTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBnZXRTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTWFya2VyO1xuICB9LFxuICBjbGVhclNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLl9zZWxlY3RlZE1hcmtlcjtcbiAgICB2YXIgcHJldk1hcmtlciA9IHNlbGVjdGVkTWFya2VyLnByZXYoKTtcbiAgICB2YXIgbmV4dE1hcmtlciA9IHNlbGVjdGVkTWFya2VyLm5leHQoKTtcbiAgICB2YXIgbWlkbGVQcmV2TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIuX21pZGRsZVByZXY7XG4gICAgdmFyIG1pZGRsZU5leHRNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5fbWlkZGxlTmV4dDtcbiAgICBzZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGxlUHJldk1hcmtlcjtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGRsZU5leHRNYXJrZXI7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgcHJldk1hcmtlci5fbWlkZGxlTmV4dCA9IG51bGw7XG4gICAgbmV4dE1hcmtlci5fbWlkZGxlUHJldiA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVBvbHlnb24gKHBvbHlnb24pIHtcbiAgICAvL3RoaXMuZ2V0RUxpbmVHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3RoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuXG4gICAgcG9seWdvbi5jbGVhcigpO1xuXG4gICAgaWYgKHRoaXMuaXNNb2RlKCdhZnRlckRyYXcnKSkge1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhclNlbGVjdGVkTWFya2VyKCk7XG4gICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gIH0sXG4gIGNyZWF0ZUVkaXRQb2x5Z29uIChqc29uKSB7XG4gICAgdmFyIGdlb0pzb24gPSBMLmdlb0pzb24oanNvbik7XG5cbiAgICAvL2F2b2lkIHRvIGxvc2UgY2hhbmdlc1xuICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuXG4gICAgdmFyIGxheWVyID0gZ2VvSnNvbi5nZXRMYXllcnMoKVswXTtcblxuICAgIGlmIChsYXllcikge1xuICAgICAgdmFyIGxheWVycyA9IGxheWVyLmdldExheWVycygpO1xuICAgICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgX2wgPSBsYXllcnNbaV07XG4gICAgICAgIHZHcm91cC5hZGRMYXllcihfbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICB0aGlzLl9maXRWQm91bmRzKCk7XG4gIH0sXG4gIG1vdmVNYXJrZXIgKGxhdGxuZykge1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldFNlbGVjdGVkKCkuc2V0TGF0TG5nKGxhdGxuZyk7XG4gIH0sXG4gIF9maXRWQm91bmRzICgpIHtcbiAgICBpZiAodGhpcy5nZXRWR3JvdXAoKS5nZXRMYXllcnMoKS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMuZml0Qm91bmRzKHRoaXMuZ2V0Vkdyb3VwKCkuZ2V0Qm91bmRzKCksIHtwYWRkaW5nOiBbMzAsIDMwXX0pO1xuICAgICAgLy90aGlzLmludmFsaWRhdGVTaXplKCk7XG4gICAgfVxuICB9LFxuICBfY2xlYXJNYXAgKCkge1xuICAgIHRoaXMuZ2V0RUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5jbGVhcigpO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IHRoaXMuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcblxuICAgIGlmIChzZWxlY3RlZE1Hcm91cCkge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuX3Nob3dTZWxlY3RlZFZMYXllcigpO1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRWTGF5ZXIoKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcbiAgfSxcbiAgX2NsZWFyRXZlbnRzICgpIHtcbiAgICAvL3RoaXMuX3VuQmluZFZpZXdFdmVudHMoKTtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIF9hY3RpdmVFZGl0TGF5ZXI6IHVuZGVmaW5lZCxcbiAgX3NldEFjdGl2ZUVkaXRMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2dldEFjdGl2ZUVkaXRMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUVkaXRMYXllcjtcbiAgfSxcbiAgX2NsZWFyQWN0aXZlRWRpdExheWVyICgpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBudWxsO1xuICB9LFxuICBfc2V0RUhNYXJrZXJHcm91cCAoYXJyYXlMYXRMbmcpIHtcbiAgICB2YXIgaG9sZU1hcmtlckdyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuX2lzSG9sZSA9IHRydWU7XG5cbiAgICB0aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKGhvbGVNYXJrZXJHcm91cCk7XG5cbiAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgaG9sZU1hcmtlckdyb3VwLmFkZFRvKGVoTWFya2Vyc0dyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cExheWVycyA9IGVoTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgdmFyIGhHcm91cFBvcyA9IGVoTWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaG9sZU1hcmtlckdyb3VwLl9wb3NpdGlvbiA9IGhHcm91cFBvcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMYXRMbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHNldCBob2xlIG1hcmtlclxuICAgICAgaG9sZU1hcmtlckdyb3VwLnNldEhvbGVNYXJrZXIoYXJyYXlMYXRMbmdbaV0sIHVuZGVmaW5lZCwge30sIHtoR3JvdXA6IGhHcm91cFBvcywgaE1hcmtlcjogaX0pO1xuICAgIH1cblxuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgbGF5ZXJzLm1hcCgobGF5ZXIsIHBvc2l0aW9uKSA9PiB7XG4gICAgICBob2xlTWFya2VyR3JvdXAuX3NldE1pZGRsZU1hcmtlcnMobGF5ZXIsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgbGF5ZXJzID0gaG9sZU1hcmtlckdyb3VwLmdldExheWVycygpO1xuXG4gICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICBlUG9seWdvbi51cGRhdGVIb2xlUG9pbnQoaEdyb3VwUG9zLCBsYXllci5fX3Bvc2l0aW9uLCBsYXllci5fbGF0bG5nKTtcbiAgICB9KTtcblxuICAgIC8vZVBvbHlnb24uc2V0SG9sZSgpXG4gICAgcmV0dXJuIGhvbGVNYXJrZXJHcm91cDtcbiAgfSxcbiAgX21vdmVFUG9seWdvbk9uVG9wICgpIHtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgaWYgKGVQb2x5Z29uLl9jb250YWluZXIpIHtcbiAgICAgIHZhciBsYXN0Q2hpbGQgPSAkKGVQb2x5Z29uLl9jb250YWluZXIucGFyZW50Tm9kZSkuY2hpbGRyZW4oKS5sYXN0KCk7XG4gICAgICB2YXIgJGVQb2x5Z29uID0gJChlUG9seWdvbi5fY29udGFpbmVyKTtcbiAgICAgIGlmICgkZVBvbHlnb25bMF0gIT09IGxhc3RDaGlsZCkge1xuICAgICAgICAkZVBvbHlnb24uZGV0YWNoKCkuaW5zZXJ0QWZ0ZXIobGFzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc3RvcmVFUG9seWdvbiAocG9seWdvbikge1xuICAgIHBvbHlnb24gPSBwb2x5Z29uIHx8IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHNldCBtYXJrZXJzXG4gICAgdmFyIGxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcblxuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLnNldEFsbChsYXRsbmdzKTtcblxuICAgIC8vdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG5cbiAgICAvLyBzZXQgaG9sZSBtYXJrZXJzXG4gICAgdmFyIGhvbGVzID0gcG9seWdvbi5nZXRIb2xlcygpO1xuICAgIGlmIChob2xlcykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBob2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGdldENvbnRyb2xMYXllcnM6ICgpID0+IHRoaXMuX2NvbnRyb2xMYXllcnMsXG4gIGVkZ2VzSW50ZXJzZWN0ZWQgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCA9IHZhbHVlO1xuICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZmlyZShcImVkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWRcIiwge2ludGVyc2VjdGlvbjogdHJ1ZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7aW50ZXJzZWN0aW9uOiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2Vycm9yVGltZW91dDogbnVsbCxcbiAgX3Nob3dJbnRlcnNlY3Rpb25FcnJvciAodGV4dCkge1xuXG4gICAgaWYgKHRoaXMuX2Vycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Vycm9yVGltZW91dCk7XG4gICAgfVxuXG4gICAgdGhpcy5tc2dIZWxwZXIubXNnKHRleHQgfHwgdGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uLCAnZXJyb3InLCAodGhpcy5fc3RvcmVkTGF5ZXJQb2ludCB8fCB0aGlzLmdldFNlbGVjdGVkTWFya2VyKCkpKTtcblxuICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBudWxsO1xuXG4gICAgdGhpcy5fZXJyb3JUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm1zZ0hlbHBlci5oaWRlKCk7XG4gICAgfSwgMTAwMDApO1xuICB9XG59LCBEcmF3RXZlbnRzKTtcbiIsImltcG9ydCAqIGFzIG9wdHMgZnJvbSAnLi4vb3B0aW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IEwuUG9seWxpbmUuZXh0ZW5kKHtcbiAgb3B0aW9uczogb3B0cy5vcHRpb25zLnN0eWxlLmRyYXdMaW5lLFxuICBfbGF0bG5nVG9Nb3ZlOiB1bmRlZmluZWQsXG4gIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICAgIHRoaXMuc2V0U3R5bGUobWFwLm9wdGlvbnMuc3R5bGUuZHJhd0xpbmUpO1xuICB9LFxuICBhZGRMYXRMbmcgKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9sYXRsbmdUb01vdmUpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGF0bG5ncy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9sYXRsbmdzLnNwbGljZSgtMSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGF0bG5ncy5wdXNoKEwubGF0TG5nKGxhdGxuZykpO1xuXG4gICAgcmV0dXJuIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIHVwZGF0ZSAocG9zKSB7XG5cbiAgICBpZiAoIXRoaXMuX2xhdGxuZ1RvTW92ZSAmJiB0aGlzLl9sYXRsbmdzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlID0gTC5sYXRMbmcocG9zKTtcbiAgICAgIHRoaXMuX2xhdGxuZ3MucHVzaCh0aGlzLl9sYXRsbmdUb01vdmUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubGF0ID0gcG9zLmxhdDtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZS5sbmcgPSBwb3MubG5nO1xuXG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgX2FkZExpbmUgKGxpbmUsIGdyb3VwLCBpc0xhc3RNYXJrZXIpIHtcbiAgICBpZiAoIWlzTGFzdE1hcmtlcikge1xuICAgICAgbGluZS5hZGRUbyhncm91cCk7XG4gICAgfVxuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgfVxufSk7IiwiaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuZXhwb3J0IGRlZmF1bHQge1xuICBfYmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMuX3VuQmluZERyYXdFdmVudHMoKTtcblxuICAgIC8vIGNsaWNrIG9uIG1hcFxuICAgIHRoaXMub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBlLmxheWVyUG9pbnQ7XG4gICAgICAvLyBidWcgZml4XG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRYID09PSAwICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRZID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgTC5NYXJrZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IGUudGFyZ2V0LmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgICAgLy8gc3RhcnQgYWRkIG5ldyBwb2x5Z29uXG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuXG4gICAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOnN0YXJ0X2FkZF9uZXdfcG9seWdvbicpO1xuICAgICAgICB2YXIgc3RhcnREcmF3U3R5bGUgPSB0aGlzLm9wdGlvbnMuc3R5bGVbJ3N0YXJ0RHJhdyddO1xuXG4gICAgICAgIGlmIChzdGFydERyYXdTdHlsZSkge1xuICAgICAgICAgIHRoaXMuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZShzdGFydERyYXdTdHlsZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jbGVhclNlbGVjdGVkVkxheWVyKCk7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRNR3JvdXAgPSBlTWFya2Vyc0dyb3VwO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbnRpbnVlIHdpdGggbmV3IHBvbHlnb25cbiAgICAgIHZhciBmaXJzdE1hcmtlciA9IGVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKTtcblxuICAgICAgaWYgKGZpcnN0TWFya2VyICYmIGZpcnN0TWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICBpZiAoIShlLnRhcmdldCBpbnN0YW5jZW9mIEwuTWFya2VyKSkge1xuICAgICAgICAgIHRoaXMuX2FkZE1hcmtlcihlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHN0YXJ0IGRyYXcgbmV3IGhvbGUgcG9seWdvblxuICAgICAgdmFyIGVoTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpO1xuICAgICAgdmFyIGxhc3RIb2xlID0gZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKTtcbiAgICAgIGlmIChmaXJzdE1hcmtlciAmJiAhZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICgoZS50YXJnZXQuZ2V0RVBvbHlnb24oKS5fcGF0aCA9PSBlLm9yaWdpbmFsRXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgIGlmICghbGFzdEhvbGUgfHwgIWxhc3RIb2xlLmdldEZpcnN0KCkgfHwgIWxhc3RIb2xlLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgICAgICAgdmFyIGxhc3RIR3JvdXAgPSBlaE1hcmtlcnNHcm91cC5hZGRIb2xlR3JvdXAoKTtcbiAgICAgICAgICAgIGxhc3RIR3JvdXAuc2V0KGUubGF0bG5nLCBudWxsLCB7IGljb246IGZpcnN0SWNvbiB9KTtcblxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWRNR3JvdXAgPSBsYXN0SEdyb3VwO1xuICAgICAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19ob2xlJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICBpZiAobGFzdEhvbGUgJiYgIWxhc3RIb2xlLmlzRW1wdHkoKSAmJiBsYXN0SG9sZS5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5faXNNYXJrZXJJblBvbHlnb24oZS5sYXRsbmcpKSB7XG4gICAgICAgICAgdmFyIG1hcmtlciA9IGVoTWFya2Vyc0dyb3VwLmdldExhc3RIb2xlKCkuc2V0KGUubGF0bG5nKTtcbiAgICAgICAgICB2YXIgcnNsdCA9IG1hcmtlci5fZGV0ZWN0SW50ZXJzZWN0aW9uKCk7IC8vIGluIGNhc2Ugb2YgaG9sZVxuICAgICAgICAgIGlmIChyc2x0KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcblxuICAgICAgICAgICAgLy9tYXJrZXIuX21Hcm91cC5yZW1vdmVNYXJrZXIobWFya2VyKTsgLy90b2RvOiBkZXRlY3QgaW50ZXJzZWN0aW9uIGZvciBob2xlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVzZXRcblxuICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBlLm1Hcm91cDtcblxuICAgICAgaWYgKCFlTWFya2Vyc0dyb3VwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuX2lzSG9sZSkge1xuICAgICAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRMYXN0SG9sZSgpO1xuICAgICAgfVxuICAgICAgLy8xLiBzZXQgbWlkZGxlIG1hcmtlcnNcbiAgICAgIHZhciBsYXllcnMgPSBlTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgICB2YXIgcG9zaXRpb24gPSAtMTtcbiAgICAgIGxheWVycy5mb3JFYWNoKCgpID0+IHtcbiAgICAgICAgdmFyIG1hcmtlciA9IGVNYXJrZXJzR3JvdXAuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7IGljb246IG1pZGRsZUljb24gfSk7XG4gICAgICAgIHBvc2l0aW9uID0gbWFya2VyLnBvc2l0aW9uICsgMjtcbiAgICAgIH0pO1xuXG4gICAgICAvLzIuIGNsZWFyIGxpbmVcbiAgICAgIGVNYXJrZXJzR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcblxuICAgICAgZU1hcmtlcnNHcm91cC5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICAgIG1hcmtlci5kcmFnZ2luZy5lbmFibGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICBlTWFya2Vyc0dyb3VwLnNlbGVjdCgpO1xuXG4gICAgICAvL3Jlc2V0IHN0eWxlIGlmICdzdGFydERyYXcnIHdhcyB1c2VkXG4gICAgICB0aGlzLmdldEVQb2x5Z29uKCkuc2V0U3R5bGUodGhpcy5vcHRpb25zLnN0eWxlLmRyYXcpO1xuXG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOmNyZWF0ZWQnKTtcbiAgICB9KTtcblxuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuXG4gICAgdkdyb3VwLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICB2R3JvdXAub25DbGljayhlKTtcblxuICAgICAgdGhpcy5tc2dIZWxwZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9EcmF3SW5uZXJFZGdlcywgbnVsbCwgZS5sYXllclBvaW50KTtcbiAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOnBvbHlnb246c2VsZWN0ZWQnKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpkZWxldGVfbWFya2VyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY29udmVydFRvRWRpdCh0aGlzLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgfSk7XG4gICAgdGhpcy5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpLnJlbW92ZSgpO1xuICAgIH0pO1xuICB9LFxuICBfYWRkTWFya2VyIChlKSB7XG4gICAgdmFyIGxhdGxuZyA9IGUubGF0bG5nO1xuXG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHZhciBtYXJrZXIgPSBlTWFya2Vyc0dyb3VwLnNldChsYXRsbmcpO1xuXG4gICAgdGhpcy5fY29udmVydFRvRWRpdChlTWFya2Vyc0dyb3VwKTtcblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIF91cGRhdGVERUxpbmUgKGxhdGxuZykge1xuICAgIHJldHVybiB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRERUxpbmUoKS51cGRhdGUobGF0bG5nKTtcbiAgfSxcbiAgX3VuQmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMub2ZmKCdjbGljaycpO1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkub2ZmKCdjbGljaycpO1xuICAgIC8vdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG4gICAgdGhpcy5vZmYoJ2RibGNsaWNrJyk7XG5cbiAgICB0aGlzLmdldERFTGluZSgpLmNsZWFyKCk7XG5cbiAgICB0aGlzLm9mZignZWRpdG9yOmpvaW5fcGF0aCcpO1xuXG4gICAgaWYgKHRoaXMuX29wZW5Qb3B1cCkge1xuICAgICAgdGhpcy5vcGVuUG9wdXAgPSB0aGlzLl9vcGVuUG9wdXA7XG4gICAgICBkZWxldGUgdGhpcy5fb3BlblBvcHVwO1xuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0SG9sZTogdW5kZWZpbmVkLFxuICBfbGFzdEhvbGVUb0RyYXc6IHVuZGVmaW5lZCxcbiAgYWRkSG9sZUdyb3VwICgpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IG5ldyBMLk1hcmtlckdyb3VwKCk7XG4gICAgdGhpcy5fbGFzdEhvbGUuX2lzSG9sZSA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEhvbGUuYWRkVG8odGhpcyk7XG5cbiAgICB0aGlzLl9sYXN0SG9sZS5wb3NpdGlvbiA9IHRoaXMuZ2V0TGVuZ3RoKCkgLSAxO1xuXG4gICAgdGhpcy5fbGFzdEhvbGVUb0RyYXcgPSB0aGlzLl9sYXN0SG9sZTtcblxuICAgIHJldHVybiB0aGlzLl9sYXN0SG9sZTtcbiAgfSxcbiAgZ2V0TGVuZ3RoICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGg7XG4gIH0sXG4gIHJlc2V0TGFzdEhvbGUgKCkge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gdW5kZWZpbmVkO1xuICB9LFxuICBzZXRMYXN0SG9sZSAobGF5ZXIpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IGxheWVyO1xuICB9LFxuICBnZXRMYXN0SG9sZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RIb2xlO1xuICB9LFxuICByZW1vdmUgKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChob2xlKSA9PiB7XG4gICAgICB3aGlsZSAoaG9sZS5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgaG9sZS5yZW1vdmVNYXJrZXJBdCgwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVwb3MgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBpZiAobGF5ZXIucG9zaXRpb24gPj0gcG9zaXRpb24pIHtcbiAgICAgICAgbGF5ZXIucG9zaXRpb24gLT0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVzZXRTZWxlY3Rpb24gKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgICB1cGRhdGUgKCkge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG4vLyAgICBtYXAuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZShtYXAuZWRpdFN0eWxlW21hcC5fZ2V0TW9kZVR5cGUoKV0pO1xuICAgIH1cbiAgfSk7IiwiaW1wb3J0IEJhc2VNR3JvdXAgZnJvbSAnLi4vZXh0ZW5kZWQvQmFzZU1hcmtlckdyb3VwJztcbmltcG9ydCBFZGl0TWFya2VyIGZyb20gJy4uL2VkaXQvbWFya2VyJztcbmltcG9ydCBFZGl0TGluZUdyb3VwIGZyb20gJy4uL2VkaXQvbGluZSc7XG5pbXBvcnQgRGFzaGVkRWRpdExpbmVHcm91cCBmcm9tICcuLi9kcmF3L2Rhc2hlZC1saW5lJztcblxuaW1wb3J0IHNvcnQgZnJvbSAnLi4vdXRpbHMvc29ydEJ5UG9zaXRpb24nO1xuaW1wb3J0ICogYXMgaWNvbnMgZnJvbSAnLi4vbWFya2VyLWljb25zJztcblxuTC5VdGlsLmV4dGVuZChMLkxpbmVVdGlsLCB7XG4gIC8vIENoZWNrcyB0byBzZWUgaWYgdHdvIGxpbmUgc2VnbWVudHMgaW50ZXJzZWN0LiBEb2VzIG5vdCBoYW5kbGUgZGVnZW5lcmF0ZSBjYXNlcy5cbiAgLy8gaHR0cDovL2NvbXBnZW9tLmNzLnVpdWMuZWR1L35qZWZmZS90ZWFjaGluZy8zNzMvbm90ZXMveDA2LXN3ZWVwbGluZS5wZGZcbiAgc2VnbWVudHNJbnRlcnNlY3QgKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMiwgLypQb2ludCovIHAzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMiwgcDMpICE9PVxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAxLCBwMiwgcDMpICYmXG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDEsIHAyKSAhPT1cbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMSwgcDMpO1xuICB9LFxuXG4gIC8vIGNoZWNrIHRvIHNlZSBpZiBwb2ludHMgYXJlIGluIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXJcbiAgX2NoZWNrQ291bnRlcmNsb2Nrd2lzZSAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyKSB7XG4gICAgcmV0dXJuIChwMi55IC0gcC55KSAqIChwMS54IC0gcC54KSA+IChwMS55IC0gcC55KSAqIChwMi54IC0gcC54KTtcbiAgfVxufSk7XG5cbmxldCB0dXJuT2ZmTW91c2VNb3ZlID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IEwuTWFya2VyR3JvdXAgPSBCYXNlTUdyb3VwLmV4dGVuZCh7XG4gIF9pc0hvbGU6IGZhbHNlLFxuICBfZWRpdExpbmVHcm91cDogdW5kZWZpbmVkLFxuICBfcG9zaXRpb246IHVuZGVmaW5lZCxcbiAgZGFzaGVkRWRpdExpbmVHcm91cDogbmV3IERhc2hlZEVkaXRMaW5lR3JvdXAoW10pLFxuICBvcHRpb25zOiB7XG4gICAgbUljb246IHVuZGVmaW5lZCxcbiAgICBtSG92ZXJJY29uOiB1bmRlZmluZWRcbiAgfSxcbiAgaW5pdGlhbGl6ZSAobGF5ZXJzKSB7XG4gICAgTC5MYXllckdyb3VwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF5ZXJzKTtcblxuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgICAvL3RoaXMuX2JpbmRFdmVudHMoKTtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8obWFwKTtcbiAgfSxcbiAgX3VwZGF0ZURFTGluZSAobGF0bG5nKSB7XG4gICAgdmFyIGRlTGluZSA9IHRoaXMuZ2V0REVMaW5lKCk7XG4gICAgaWYgKHRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICBkZUxpbmUudXBkYXRlKGxhdGxuZyk7XG4gICAgfVxuICAgIHJldHVybiBkZUxpbmU7XG4gIH0sXG4gIF9hZGRNYXJrZXIgKGxhdGxuZykge1xuICAgIC8vdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHRoaXMuc2V0KGxhdGxuZyk7XG4gICAgdGhpcy5nZXRERUxpbmUoKS5hZGRMYXRMbmcobGF0bG5nKTtcblxuICAgIHRoaXMuX21hcC5fY29udmVydFRvRWRpdCh0aGlzKTtcbiAgfSxcbiAgZ2V0REVMaW5lICgpIHtcbiAgICBpZiAoIXRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5fbWFwKSB7XG4gICAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8odGhpcy5fbWFwKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cDtcbiAgfSxcbiAgX3NldEhvdmVySWNvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLl9vbGRTZWxlY3RlZE1hcmtlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICB9XG4gICAgbWFwLl9zZWxlY3RlZE1hcmtlci5fc2V0SG92ZXJJY29uKHRoaXMub3B0aW9ucy5tSG92ZXJJY29uKTtcbiAgfSxcbiAgX3NvcnRCeVBvc2l0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgIGxheWVycyA9IGxheWVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLl9sZWFmbGV0X2lkIC0gYi5fbGVhZmxldF9pZDtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaWRBcnJheSA9IFtdO1xuICAgICAgdmFyIHBvc0FycmF5ID0gW107XG4gICAgICBsYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgICAgaWRBcnJheS5wdXNoKGxheWVyLl9sZWFmbGV0X2lkKTtcbiAgICAgICAgcG9zQXJyYXkucHVzaChsYXllci5fX3Bvc2l0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICBzb3J0KHRoaXMuX2xheWVycywgaWRBcnJheSk7XG4gICAgfVxuICB9LFxuICB1cGRhdGVTdHlsZSAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgIG1hcmtlci5fcmVzZXRJY29uKHRoaXMub3B0aW9ucy5tSWNvbik7XG4gICAgICBpZiAobWFya2VyID09PSB0aGlzLl9tYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICAgIHRoaXMuX3NldEhvdmVySWNvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2V0U2VsZWN0ZWQgKG1hcmtlcikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQgJiYgdGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gdGhpcy5nZXRMYXN0KCk7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gbWFya2VyO1xuICB9LFxuICByZXNldFNlbGVjdGVkICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9LFxuICBnZXRTZWxlY3RlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fc2VsZWN0ZWRNYXJrZXI7XG4gIH0sXG4gIF9zZXRGaXJzdCAobWFya2VyKSB7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIuX3NldEZpcnN0SWNvbigpO1xuICB9LFxuICBnZXRGaXJzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpcnN0TWFya2VyO1xuICB9LFxuICBnZXRMYXN0ICgpIHtcbiAgICBpZiAodGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICAgIHJldHVybiBsYXllcnNbbGF5ZXJzLmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgfSxcbiAgaGFzRmlyc3RNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpcnN0KCkgJiYgdGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKTtcbiAgfSxcbiAgY29udmVydFRvTGF0TG5ncyAoKSB7XG4gICAgdmFyIGxhdGxuZ3MgPSBbXTtcbiAgICB0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICAgIGlmICghbGF5ZXIuaXNNaWRkbGUoKSkge1xuICAgICAgICBsYXRsbmdzLnB1c2gobGF5ZXIuZ2V0TGF0TG5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsYXRsbmdzO1xuICB9LFxuICByZXN0b3JlIChsYXllcikge1xuICAgIHRoaXMuc2V0QWxsKGxheWVyLl9sYXRsbmdzKTtcbiAgICB0aGlzLnNldEFsbEhvbGVzKGxheWVyLl9ob2xlcyk7XG4gIH0sXG4gIF9hZGQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSkge1xuICAgICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgICBvcHRpb25zLmljb24gPSBpY29ucy5maXJzdEljb247XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5hZGRNYXJrZXIobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmdldERFTGluZSgpLmFkZExhdExuZyhsYXRsbmcpO1xuXG4gICAgLy90aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICB0dXJuT2ZmTW91c2VNb3ZlID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICBpZighdHVybk9mZk1vdXNlTW92ZSkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURFTGluZShlLmxhdGxuZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdHVybk9mZk1vdXNlTW92ZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldERFTGluZSgpLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKG1hcmtlci5fbUdyb3VwLmdldExheWVycygpLmxlbmd0aCA+IDIpIHtcbiAgICAgIGlmIChtYXJrZXIuX21Hcm91cC5fZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpICYmIG1hcmtlciA9PT0gbWFya2VyLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBfY2xvc2VzdE5vdE1pZGRsZU1hcmtlciAobGF5ZXJzLCBwb3NpdGlvbiwgZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIChsYXllcnNbcG9zaXRpb25dLmlzTWlkZGxlKCkpID8gbGF5ZXJzW3Bvc2l0aW9uICsgZGlyZWN0aW9uXSA6IGxheWVyc1twb3NpdGlvbl07XG4gIH0sXG4gIF9zZXRQcmV2TmV4dCAobWFya2VyLCBwb3NpdGlvbikge1xuICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgdmFyIG1heExlbmd0aCA9IGxheWVycy5sZW5ndGggLSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gMSkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIHBvc2l0aW9uIC0gMSwgLTEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIDIsIDEpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09IG1heExlbmd0aCkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIG1heExlbmd0aCAtIDEsIC0xKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIobGF5ZXJzLCAwLCAxKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVQcmV2ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gbGF5ZXJzW3Bvc2l0aW9uIC0gMV07XG4gICAgICB9XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVOZXh0ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gbGF5ZXJzW3Bvc2l0aW9uICsgMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0TWlkZGxlTWFya2VyIChwb3NpdGlvbikge1xuICAgIHRoaXMuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7aWNvbjogaWNvbnMubWlkZGxlSWNvbn0pO1xuICB9LFxuICBzZXRNaWRkbGVNYXJrZXJzIChwb3NpdGlvbikge1xuICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKHBvc2l0aW9uKTtcbiAgICB0aGlzLnNldE1pZGRsZU1hcmtlcihwb3NpdGlvbiArIDIpO1xuICB9LFxuICBzZXQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZykpIHtcbiAgICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZGQobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG4gICAgfVxuICB9LFxuICBzZXRNaWRkbGUgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiA8IDApID8gMCA6IHBvc2l0aW9uO1xuXG4gICAgLy92YXIgZnVuYyA9ICh0aGlzLl9pc0hvbGUpID8gJ3NldCcgOiAnc2V0SG9sZU1hcmtlcic7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuc2V0KGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpO1xuXG4gICAgbWFya2VyLl9zZXRNaWRkbGVJY29uKCk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0QWxsIChsYXRsbmdzKSB7XG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIHBvc2l0aW9uKSA9PiB7XG4gICAgICB0aGlzLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICB9LFxuICBzZXRBbGxIb2xlcyAoaG9sZXMpIHtcbiAgICBob2xlcy5mb3JFYWNoKChob2xlKSA9PiB7XG4gICAgICAvL3RoaXMuc2V0KGhvbGUpO1xuICAgICAgdmFyIGxhc3RIR3JvdXAgPSB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5hZGRIb2xlR3JvdXAoKTtcblxuICAgICAgaG9sZS5fZWFjaCgobGF0bG5nLCBwb3NpdGlvbikgPT4ge1xuICAgICAgICBsYXN0SEdyb3VwLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgLy92YXIgbGVuZ3RoID0gaG9sZS5sZW5ndGg7XG4gICAgICAvL3ZhciBpID0gMDtcbiAgICAgIC8vZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgLy8gIGxhc3RIR3JvdXAuc2V0KGhvbGVbaV0sIGkpO1xuICAgICAgLy99XG5cbiAgICAgIGxhc3RIR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgIH0pO1xuICB9LFxuICBzZXRIb2xlTWFya2VyIChsYXRsbmcsIG9wdGlvbnMgPSB7aXNIb2xlTWFya2VyOiB0cnVlLCBob2xlUG9zaXRpb246IHt9fSkge1xuICAgIHZhciBtYXJrZXIgPSBuZXcgRWRpdE1hcmtlcih0aGlzLCBsYXRsbmcsIG9wdGlvbnMgfHwge30pO1xuICAgIG1hcmtlci5hZGRUbyh0aGlzKTtcblxuICAgIC8vdGhpcy5zZXRTZWxlY3RlZChtYXJrZXIpO1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSAmJiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5fc2V0Rmlyc3QobWFya2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICByZW1vdmVIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIC8vcmVtb3ZlIGVkaXQgbGluZVxuICAgIC8vdGhpcy5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3JlbW92ZSBlZGl0IG1hcmtlcnNcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAvL3JlbW92ZSBob2xlXG4gICAgbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZXMoKS5zcGxpY2UodGhpcy5fcG9zaXRpb24sIDEpO1xuICAgIG1hcC5nZXRFUG9seWdvbigpLnJlZHJhdygpO1xuXG4gICAgLy9yZWRyYXcgaG9sZXNcbiAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGVzKCk7XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbWFwLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2ldKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRFTWFya2VyID0gdGhpcy5nZXRTZWxlY3RlZCgpO1xuICAgIHZhciBtYXJrZXJMYXllcnNBcnJheSA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhdGxuZyA9IHNlbGVjdGVkRU1hcmtlci5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVtb3ZlTGF5ZXIoc2VsZWN0ZWRFTWFya2VyKTtcblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfbWFya2VyJywge2xhdGxuZzogbGF0bG5nfSk7XG4gICAgfVxuXG4gICAgbWFya2VyTGF5ZXJzQXJyYXkgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gcmVtb3ZlIGxhc3QgcG9pbnRcbiAgICAgICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUhvbGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3NlbGVjdGVkRU1hcmtlciA9IG1hcC5nZXRTZWxlY3RlZE1hcmtlcigpO1xuICAgICAgICAgIHZhciBob2xlUG9zaXRpb24gPSBzZWxlY3RlZEVNYXJrZXIub3B0aW9ucy5ob2xlUG9zaXRpb247XG5cbiAgICAgICAgICAvL3JlbW92ZSBob2xlIHBvaW50XG4gICAgICAgICAgLy9tYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlKHRoaXMuX3Bvc2l0aW9uKS5zcGxpY2UoaG9sZVBvc2l0aW9uLmhNYXJrZXIsIDEpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGUodGhpcy5fcG9zaXRpb24pLnNwbGljZShzZWxlY3RlZEVNYXJrZXIuX19wb3NpdGlvbiwgMSk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkucmVkcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICAgICAgbGF5ZXIub3B0aW9ucy5ob2xlUG9zaXRpb24gPSB7XG4gICAgICAgICAgICBoR3JvdXA6IHRoaXMuX3Bvc2l0aW9uLFxuICAgICAgICAgICAgaE1hcmtlcjogX3Bvc2l0aW9uKytcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICAvLyBubyBuZWVkIHRvIHJlbW92ZSBsYXN0IHBvaW50XG4gICAgICAgIGlmIChtYXJrZXJMYXllcnNBcnJheS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgLy9yZW1vdmUgZWRpdCBtYXJrZXJzXG4gICAgICAgICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIub3B0aW9ucy50aXRsZSA9IHBvc2l0aW9uO1xuICAgICAgbGF5ZXIuX19wb3NpdGlvbiA9IHBvc2l0aW9uKys7XG4gICAgfSk7XG4gIH0sXG4gIGdldFBvaW50c0ZvckludGVyc2VjdGlvbiAocG9seWdvbikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICB2YXIgbGF5ZXJzID0gKChwb2x5Z29uKSA/IHBvbHlnb24uZ2V0TGF5ZXJzKCkgOiB0aGlzLmdldExheWVycygpKS5maWx0ZXIoKGwpID0+ICFsLmlzTWlkZGxlKCkpO1xuXG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICBsYXllcnMuX2VhY2goKGxheWVyKSA9PiB7XG4gICAgICB2YXIgbGF0bG5nID0gbGF5ZXIuZ2V0TGF0TG5nKCk7XG4gICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5wdXNoKHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIXBvbHlnb24pIHtcbiAgICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1swXSkgeyAvLyBwb2ludCBpcyBmaXJzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLnNsaWNlKDEpO1xuICAgICAgfSBlbHNlIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1tsYXllcnMubGVuZ3RoIC0gMV0pIHsgLy8gcG9pbnQgaXMgbGFzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgfSBlbHNlIHsgLy8gcG9pbnQgaXMgbm90IGZpcnN0IC8gbGFzdFxuICAgICAgICB2YXIgdG1wQXJyUG9pbnRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT09IGxheWVyc1tpXSkge1xuICAgICAgICAgICAgdG1wQXJyUG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMuc3BsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gdG1wQXJyUG9pbnRzLmNvbmNhdCh0aGlzLl9vcmlnaW5hbFBvaW50cyk7XG4gICAgICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vcmlnaW5hbFBvaW50cztcbiAgfSxcbiAgX2JpbmRMaW5lRXZlbnRzOiB1bmRlZmluZWQsXG4gIF9oYXNJbnRlcnNlY3Rpb24gKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKSB7XG4gICAgdmFyIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwLFxuICAgICAgbGFzdFBvaW50ID0gcG9pbnRzID8gcG9pbnRzW2xlbiAtIDFdIDogbnVsbCxcbiAgICAvLyBUaGUgcHJldmlvdXMgcHJldmlvdXMgbGluZSBzZWdtZW50LiBQcmV2aW91cyBsaW5lIHNlZ21lbnQgZG9lc24ndCBuZWVkIHRlc3RpbmcuXG4gICAgICBtYXhJbmRleCA9IGxlbiAtIDI7XG5cbiAgICBpZiAodGhpcy5fdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uKDEpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpbmVTZWdtZW50c0ludGVyc2VjdHNSYW5nZShsYXN0UG9pbnQsIG5ld1BvaW50LCBtYXhJbmRleCwgaXNGaW5pc2gpO1xuICB9LFxuXG4gIF9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZSAocG9pbnRzLCBuZXdQb2ludCwgbGFzdFBvaW50KSB7XG4gICAgdmFyIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwLFxuICAgIC8vbGFzdFBvaW50ID0gcG9pbnRzID8gcG9pbnRzW2xlbiAtIDFdIDogbnVsbCxcbiAgICAvLyBUaGUgcHJldmlvdXMgcHJldmlvdXMgbGluZSBzZWdtZW50LiBQcmV2aW91cyBsaW5lIHNlZ21lbnQgZG9lc24ndCBuZWVkIHRlc3RpbmcuXG4gICAgICBtYXhJbmRleCA9IGxlbiAtIDI7XG5cbiAgICBpZiAodGhpcy5fdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uKDEpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpbmVIb2xlU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UobGFzdFBvaW50LCBuZXdQb2ludCk7XG4gIH0sXG5cbiAgaGFzSW50ZXJzZWN0aW9uIChsYXRsbmcsIGlzRmluaXNoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3UG9pbnQgPSBtYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyk7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oKTtcblxuICAgIHZhciByc2x0MSA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbihwb2ludHMsIG5ld1BvaW50LCBpc0ZpbmlzaCk7XG4gICAgdmFyIHJzbHQyID0gZmFsc2U7XG5cbiAgICB2YXIgZk1hcmtlciA9IHRoaXMuZ2V0Rmlyc3QoKTtcbiAgICBpZiAoZk1hcmtlciAmJiAhZk1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIC8vIGNvZGUgd2FzIGR1YmxpY2F0ZWQgdG8gY2hlY2sgaW50ZXJzZWN0aW9uIGZyb20gYm90aCBzaWRlc1xuICAgICAgLy8gKHRoZSBtYWluIGlkZWEgdG8gcmV2ZXJzZSBhcnJheSBvZiBwb2ludHMgYW5kIGNoZWNrIGludGVyc2VjdGlvbiBhZ2FpbilcblxuICAgICAgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oKS5yZXZlcnNlKCk7XG4gICAgICByc2x0MiA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbihwb2ludHMsIG5ld1BvaW50LCBpc0ZpbmlzaCk7XG4gICAgfVxuXG4gICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdDEgfHwgcnNsdDIpO1xuICAgIHZhciBlZGdlc0ludGVyc2VjdGVkID0gbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcbiAgICByZXR1cm4gZWRnZXNJbnRlcnNlY3RlZDtcbiAgfSxcbiAgaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUgKGxBcnJheSwgaG9sZSkge1xuXG4gICAgaWYgKHRoaXMuX21hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5ld1BvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsQXJyYXlbMF0pO1xuICAgIHZhciBsYXN0UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVsxXSk7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oaG9sZSk7XG5cbiAgICB2YXIgcnNsdDEgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpO1xuXG4gICAgLy8gY29kZSB3YXMgZHVibGljYXRlZCB0byBjaGVjayBpbnRlcnNlY3Rpb24gZnJvbSBib3RoIHNpZGVzXG4gICAgLy8gKHRoZSBtYWluIGlkZWEgdG8gcmV2ZXJzZSBhcnJheSBvZiBwb2ludHMgYW5kIGNoZWNrIGludGVyc2VjdGlvbiBhZ2FpbilcblxuICAgIHBvaW50cyA9IHRoaXMuZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uKGhvbGUpLnJldmVyc2UoKTtcbiAgICBsYXN0UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVsyXSk7XG4gICAgdmFyIHJzbHQyID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUocG9pbnRzLCBuZXdQb2ludCwgbGFzdFBvaW50KTtcblxuICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKHJzbHQxIHx8IHJzbHQyKTtcbiAgICB2YXIgZWRnZXNJbnRlcnNlY3RlZCA9IHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKCk7XG5cbiAgICByZXR1cm4gZWRnZXNJbnRlcnNlY3RlZDtcbiAgfSxcbiAgX3Rvb0Zld1BvaW50c0ZvckludGVyc2VjdGlvbiAoZXh0cmFQb2ludHMpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXG4gICAgICBsZW4gPSBwb2ludHMgPyBwb2ludHMubGVuZ3RoIDogMDtcbiAgICAvLyBJbmNyZW1lbnQgbGVuZ3RoIGJ5IGV4dHJhUG9pbnRzIGlmIHByZXNlbnRcbiAgICBsZW4gKz0gZXh0cmFQb2ludHMgfHwgMDtcblxuICAgIHJldHVybiAhdGhpcy5fb3JpZ2luYWxQb2ludHMgfHwgbGVuIDw9IDM7XG4gIH0sXG4gIF9saW5lSG9sZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlIChwLCBwMSkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cywgcDIsIHAzO1xuXG4gICAgZm9yICh2YXIgaiA9IHBvaW50cy5sZW5ndGggLSAxOyBqID4gMDsgai0tKSB7XG4gICAgICBwMiA9IHBvaW50c1tqIC0gMV07XG4gICAgICBwMyA9IHBvaW50c1tqXTtcblxuICAgICAgaWYgKEwuTGluZVV0aWwuc2VnbWVudHNJbnRlcnNlY3QocCwgcDEsIHAyLCBwMykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBfbGluZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlIChwLCBwMSwgbWF4SW5kZXgsIGlzRmluaXNoKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLFxuICAgICAgcDIsIHAzO1xuXG4gICAgdmFyIG1pbiA9IGlzRmluaXNoID8gMSA6IDA7XG4gICAgLy8gQ2hlY2sgYWxsIHByZXZpb3VzIGxpbmUgc2VnbWVudHMgKGJlc2lkZSB0aGUgaW1tZWRpYXRlbHkgcHJldmlvdXMpIGZvciBpbnRlcnNlY3Rpb25zXG4gICAgZm9yICh2YXIgaiA9IG1heEluZGV4OyBqID4gbWluOyBqLS0pIHtcbiAgICAgIHAyID0gcG9pbnRzW2ogLSAxXTtcbiAgICAgIHAzID0gcG9pbnRzW2pdO1xuXG4gICAgICBpZiAoTC5MaW5lVXRpbC5zZWdtZW50c0ludGVyc2VjdChwLCBwMSwgcDIsIHAzKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9pc01hcmtlckluUG9seWdvbiAobWFya2VyKSB7XG4gICAgdmFyIGogPSAwO1xuXG4gICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIHNpZGVzID0gbGF5ZXJzLmxlbmd0aDtcblxuICAgIHZhciB4ID0gbWFya2VyLmxuZztcbiAgICB2YXIgeSA9IG1hcmtlci5sYXQ7XG5cbiAgICB2YXIgaW5Qb2x5ID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZGVzOyBpKyspIHtcbiAgICAgIGorKztcbiAgICAgIGlmIChqID09IHNpZGVzKSB7XG4gICAgICAgIGogPSAwO1xuICAgICAgfVxuICAgICAgdmFyIHBvaW50MSA9IGxheWVyc1tpXS5nZXRMYXRMbmcoKTtcbiAgICAgIHZhciBwb2ludDIgPSBsYXllcnNbal0uZ2V0TGF0TG5nKCk7XG4gICAgICBpZiAoKChwb2ludDEubGF0IDwgeSkgJiYgKHBvaW50Mi5sYXQgPj0geSkpIHx8ICgocG9pbnQyLmxhdCA8IHkpICYmIChwb2ludDEubGF0ID49IHkpKSkge1xuICAgICAgICBpZiAocG9pbnQxLmxuZyArICh5IC0gcG9pbnQxLmxhdCkgLyAocG9pbnQyLmxhdCAtIHBvaW50MS5sYXQpICogKHBvaW50Mi5sbmcgLSBwb2ludDEubG5nKSA8IHgpIHtcbiAgICAgICAgICBpblBvbHkgPSAhaW5Qb2x5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5Qb2x5O1xuICB9XG59KTsiLCJpbXBvcnQgVG9vbHRpcCBmcm9tICcuLi9leHRlbmRlZC9Ub29sdGlwJztcbmltcG9ydCB7Zmlyc3RJY29uLGljb24sZHJhZ0ljb24sbWlkZGxlSWNvbixob3Zlckljb24saW50ZXJzZWN0aW9uSWNvbn0gZnJvbSAnLi4vbWFya2VyLWljb25zJztcblxudmFyIHNpemUgPSAxO1xudmFyIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuaWYgKHVzZXJBZ2VudC5pbmRleE9mKFwiaXBhZFwiKSAhPT0gLTEgfHwgdXNlckFnZW50LmluZGV4T2YoXCJpcGhvbmVcIikgIT09IC0xKSB7XG4gIHNpemUgPSAyO1xufVxuXG52YXIgdG9vbHRpcDtcbnZhciBkcmFnZW5kID0gZmFsc2U7XG52YXIgX21hcmtlclRvRGVsZXRlR3JvdXAgPSBudWxsO1xuXG5leHBvcnQgZGVmYXVsdCBMLk1hcmtlci5leHRlbmQoe1xuICBfZHJhZ2dhYmxlOiB1bmRlZmluZWQsIC8vIGFuIGluc3RhbmNlIG9mIEwuRHJhZ2dhYmxlXG4gIF9vbGRMYXRMbmdTdGF0ZTogdW5kZWZpbmVkLFxuICBpbml0aWFsaXplIChncm91cCwgbGF0bG5nLCBvcHRpb25zID0ge30pIHtcblxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7XG4gICAgICBpY29uOiBpY29uLFxuICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgTC5NYXJrZXIucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmcsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fbUdyb3VwID0gZ3JvdXA7XG5cbiAgICB0aGlzLl9pc0ZpcnN0ID0gZ3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwO1xuICB9LFxuICByZW1vdmVHcm91cCAoKSB7XG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlSG9sZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlKCk7XG4gICAgfVxuICB9LFxuICByZW1vdmUgKCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHRoaXMuX21Hcm91cC5yZW1vdmVTZWxlY3RlZCgpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlSG9sZSAoKSB7IC8vIGRlcHJlY2F0ZWRcbiAgICB0aGlzLnJlbW92ZUdyb3VwKCk7XG4gIH0sXG4gIG5leHQgKCkge1xuICAgIHZhciBuZXh0ID0gdGhpcy5fbmV4dC5fbmV4dDtcbiAgICBpZiAoIXRoaXMuX25leHQuaXNNaWRkbGUoKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX25leHQ7XG4gICAgfVxuICAgIHJldHVybiBuZXh0O1xuICB9LFxuICBwcmV2ICgpIHtcbiAgICB2YXIgcHJldiA9IHRoaXMuX3ByZXYuX3ByZXY7XG4gICAgaWYgKCF0aGlzLl9wcmV2LmlzTWlkZGxlKCkpIHtcbiAgICAgIHByZXYgPSB0aGlzLl9wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gcHJldjtcbiAgfSxcbiAgY2hhbmdlUHJldk5leHRQb3MgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2LmlzTWlkZGxlKCkpIHtcblxuICAgICAgdmFyIHByZXZMYXRMbmcgPSB0aGlzLl9tR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLnByZXYoKSwgdGhpcyk7XG4gICAgICB2YXIgbmV4dExhdExuZyA9IHRoaXMuX21Hcm91cC5fZ2V0TWlkZGxlTGF0TG5nKHRoaXMsIHRoaXMubmV4dCgpKTtcblxuICAgICAgdGhpcy5fcHJldi5zZXRMYXRMbmcocHJldkxhdExuZyk7XG4gICAgICB0aGlzLl9uZXh0LnNldExhdExuZyhuZXh0TGF0TG5nKTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBjaGFuZ2UgZXZlbnRzIGZvciBtYXJrZXIgKGV4YW1wbGU6IGhvbGUpXG4gICAqL1xuICAgIHJlc2V0RXZlbnRzIChjYWxsYmFjaykge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0sXG4gIF9wb3NIYXNoICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJldi5wb3NpdGlvbiArICdfJyArIHRoaXMucG9zaXRpb24gKyAnXycgKyB0aGlzLl9uZXh0LnBvc2l0aW9uO1xuICB9LFxuICBfcmVzZXRJY29uIChfaWNvbikge1xuICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaWMgPSBfaWNvbiB8fCBpY29uO1xuXG4gICAgdGhpcy5zZXRJY29uKGljKTtcbiAgICB0aGlzLnByZXYoKS5zZXRJY29uKGljKTtcbiAgICB0aGlzLm5leHQoKS5zZXRJY29uKGljKTtcbiAgfSxcbiAgX3NldEhvdmVySWNvbiAoX2hJY29uKSB7XG4gICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0SWNvbihfaEljb24gfHwgaG92ZXJJY29uKTtcbiAgfSxcbiAgX2FkZEljb25DbGFzcyAoY2xhc3NOYW1lKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2ljb24sIGNsYXNzTmFtZSk7XG4gIH0sXG4gIF9yZW1vdmVJY29uQ2xhc3MgKGNsYXNzTmFtZSkge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9pY29uLCBjbGFzc05hbWUpO1xuICB9LFxuICBfc2V0SW50ZXJzZWN0aW9uSWNvbiAoKSB7XG4gICAgdmFyIGljb25DbGFzcyA9IGludGVyc2VjdGlvbkljb24ub3B0aW9ucy5jbGFzc05hbWU7XG4gICAgdmFyIGNsYXNzTmFtZSA9ICdtLWVkaXRvci1kaXYtaWNvbic7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKGNsYXNzTmFtZSk7XG4gICAgdGhpcy5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG5cbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQgPSB0aGlzLnByZXYoKTtcbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG5cbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQgPSB0aGlzLm5leHQoKTtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG4gIH0sXG4gIF9zZXRGaXJzdEljb24gKCkge1xuICAgIHRoaXMuX2lzRmlyc3QgPSB0cnVlO1xuICAgIHRoaXMuc2V0SWNvbihmaXJzdEljb24pO1xuICB9LFxuICBfaGFzRmlyc3RJY29uICgpIHtcbiAgICByZXR1cm4gdGhpcy5faWNvbiAmJiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWRpdi1pY29uLWZpcnN0Jyk7XG4gIH0sXG4gIF9zZXRNaWRkbGVJY29uICgpIHtcbiAgICB0aGlzLnNldEljb24obWlkZGxlSWNvbik7XG4gIH0sXG4gIGlzTWlkZGxlICgpIHtcbiAgICByZXR1cm4gdGhpcy5faWNvbiAmJiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbicpXG4gICAgICAmJiAhTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdsZWFmbGV0LWRyYWctdGFyZ2V0Jyk7XG4gIH0sXG4gIF9zZXREcmFnSWNvbiAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbicpO1xuICAgIHRoaXMuc2V0SWNvbihkcmFnSWNvbik7XG4gIH0sXG4gIGlzUGxhaW4gKCkge1xuICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWRpdi1pY29uJykgfHwgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgfSxcbiAgX29uY2VDbGljayAoKSB7XG4gICAgaWYgKHRoaXMuX2lzRmlyc3QpIHtcbiAgICAgIHRoaXMub25jZSgnY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG5cbiAgICAgICAgaWYgKG1Hcm91cC5fbWFya2Vycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgdGhpcy5fb25jZUNsaWNrKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhdGxuZyA9IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgICAgIHRoaXMuX21hcC5fc3RvcmVkTGF5ZXJQb2ludCA9IGUudGFyZ2V0O1xuXG4gICAgICAgIHZhciBoYXNJbnRlcnNlY3Rpb24gPSBtR3JvdXAuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZyk7XG5cbiAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgIC8vbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICAgICAgICB0aGlzLl9vbmNlQ2xpY2soKTsgLy8gYmluZCAnb25jZScgYWdhaW4gdW50aWwgaGFzIGludGVyc2VjdGlvblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2lzRmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnNldEljb24oaWNvbik7XG4gICAgICAgICAgLy9tR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpqb2luX3BhdGgnLCB7IG1Hcm91cDogbUdyb3VwIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIF9kZXRlY3RHcm91cERlbGV0ZSgpIHtcbiAgICBsZXQgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gbWFwLmdldFNlbGVjdGVkTUdyb3VwKCk7XG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlIHx8ICF0aGlzLmlzUGxhaW4oKSB8fCAoc2VsZWN0ZWRNR3JvdXAgJiYgc2VsZWN0ZWRNR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZEluR3JvdXAoKSkge1xuICAgICAgX21hcmtlclRvRGVsZXRlR3JvdXAgPSBudWxsO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChfbWFya2VyVG9EZWxldGVHcm91cCAmJiB0aGlzLl9sZWFmbGV0X2lkID09PSBfbWFya2VyVG9EZWxldGVHcm91cC5fbGVhZmxldF9pZCkge1xuICAgICAgaWYgKHRoaXMuX2xhdGxuZy5sYXQgIT09IF9tYXJrZXJUb0RlbGV0ZUdyb3VwLl9sYXRsbmcubGF0IHx8IHRoaXMuX2xhdGxuZy5sbmcgIT09IF9tYXJrZXJUb0RlbGV0ZUdyb3VwLl9sYXRsbmcubG5nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWFwLm9wdGlvbnMubm90aWZ5Q2xpY2tNYXJrZXJEZWxldGVQb2x5Z29uKSB7XG4gICAgICBpZiAoc2VsZWN0ZWRNR3JvdXAgJiYgIXNlbGVjdGVkTUdyb3VwLl9pc0hvbGUpIHtcblxuICAgICAgICAvKiB0b2RvOiByZWZhY3RvcmluZyAqL1xuICAgICAgICBsZXQgcGxhaW5NYXJrZXJzTGVuID0gc2VsZWN0ZWRNR3JvdXAuZ2V0TGF5ZXJzKCkuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICQoaXRlbS5faWNvbikuaGFzQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uJyk7XG4gICAgICAgIH0pLmxlbmd0aDtcblxuICAgICAgICBpZiAocGxhaW5NYXJrZXJzTGVuID09PSAzKSB7XG4gICAgICAgICAgaWYgKF9tYXJrZXJUb0RlbGV0ZUdyb3VwICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBfbWFya2VyVG9EZWxldGVHcm91cCA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX21hcmtlclRvRGVsZXRlR3JvdXAgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGlzQWNjZXB0ZWRUb0RlbGV0ZSgpIHtcbiAgICByZXR1cm4gX21hcmtlclRvRGVsZXRlR3JvdXAgPT09IHRoaXMgJiYgdGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpO1xuICB9LFxuICBfYmluZENvbW1vbkV2ZW50cyAoKSB7XG4gICAgdGhpcy5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgICAgaWYgKHRoaXMuX2RldGVjdEdyb3VwRGVsZXRlKCkpIHtcbiAgICAgICAgbWFwLm1zZ0hlbHBlci5tc2cobWFwLm9wdGlvbnMudGV4dC5hY2NlcHREZWxldGlvbiwgJ2Vycm9yJywgdGhpcyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbWFwLl9zdG9yZWRMYXllclBvaW50ID0gZS50YXJnZXQ7XG5cbiAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG5cbiAgICAgIGlmIChtR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSAmJiB0aGlzICE9PSBtR3JvdXAuZ2V0Rmlyc3QoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSAmJiB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uKHRoaXMuZ2V0TGF0TG5nKCksIHRydWUpKSB7XG4gICAgICAgIG1hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBtR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG5cbiAgICAgIGlmIChtR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZEluR3JvdXAoKSkge1xuICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgICAgIG1hcC5tc2dIZWxwZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzLCBudWxsLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzLCBudWxsLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkgeyAvL2FkZCBlZGdlXG4gICAgICAgIG1Hcm91cC5zZXRNaWRkbGVNYXJrZXJzKHRoaXMucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZXNldEljb24oaWNvbik7XG4gICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcbiAgICAgICAgbWFwLm1zZ0hlbHBlci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcywgbnVsbCwgdGhpcyk7XG4gICAgICAgIF9tYXJrZXJUb0RlbGV0ZUdyb3VwID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7IC8vcmVtb3ZlIGVkZ2VcbiAgICAgICAgaWYgKCFtR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkgJiYgIWRyYWdlbmQpIHtcbiAgICAgICAgICBtYXAubXNnSGVscGVyLmhpZGUoKTtcblxuICAgICAgICAgIHZhciByc2x0SW50ZXJzZWN0aW9uID0gdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKHsgdGFyZ2V0OiB7IF9sYXRsbmc6IG1Hcm91cC5fZ2V0TWlkZGxlTGF0TG5nKHRoaXMucHJldigpLCB0aGlzLm5leHQoKSkgfSB9KTtcblxuICAgICAgICAgIGlmIChyc2x0SW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0U3R5bGUoKTtcbiAgICAgICAgICAgIG1hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKG1hcC5vcHRpb25zLnRleHQuZGVsZXRlUG9pbnRJbnRlcnNlY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5fcHJldmlld0Vycm9yTGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBvbGRMYXRMbmcgPSB0aGlzLmdldExhdExuZygpO1xuXG4gICAgICAgICAgdmFyIG5leHRNYXJrZXIgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgICBtR3JvdXAucmVtb3ZlTWFya2VyKHRoaXMpO1xuXG4gICAgICAgICAgaWYgKCFtR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICB2YXIgbmV3TGF0TG5nID0gbmV4dE1hcmtlci5fcHJldi5nZXRMYXRMbmcoKTtcblxuICAgICAgICAgICAgaWYgKG5ld0xhdExuZy5sYXQgPT09IG9sZExhdExuZy5sYXQgJiYgbmV3TGF0TG5nLmxuZyA9PT0gb2xkTGF0TG5nLmxuZykge1xuICAgICAgICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9BZGROZXdFZGdlcywgbnVsbCwgbmV4dE1hcmtlci5fcHJldik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1Hcm91cC5zZXRTZWxlY3RlZChuZXh0TWFya2VyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOmRlbGV0ZWQnKTtcbiAgICAgICAgICAgIG1hcC5tc2dIZWxwZXIuaGlkZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBpZiAodGhpcy5fbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzLl9tR3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMikge1xuICAgICAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzID09PSB0aGlzLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCB7IG1hcmtlcjogdGhpcyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pc0FjY2VwdGVkVG9EZWxldGUoKSkge1xuICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmFjY2VwdERlbGV0aW9uLCAnZXJyb3InLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLm9uKCdtb3VzZW91dCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vbmNlQ2xpY2soKTtcblxuICAgIHRoaXMub24oJ2RibGNsaWNrJywgKCkgPT4ge1xuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcbiAgICAgIGlmIChtR3JvdXAgJiYgbUdyb3VwLmdldEZpcnN0KCkgJiYgbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzID09PSBtR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICBtR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgICAgICAgIC8vdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpqb2luX3BhdGgnLCB7bWFya2VyOiB0aGlzfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2RyYWcnLCAoZSkgPT4ge1xuICAgICAgdmFyIG1hcmtlciA9IGUudGFyZ2V0O1xuXG4gICAgICBtYXJrZXIuY2hhbmdlUHJldk5leHRQb3MoKTtcblxuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcblxuICAgICAgdGhpcy5fc2V0RHJhZ0ljb24oKTtcblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkcmFnX21hcmtlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZ2VuZCcsICgpID0+IHtcblxuICAgICAgdGhpcy5fbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpkcmFnZW5kX21hcmtlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuXG4gICAgICBkcmFnZW5kID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBkcmFnZW5kID0gZmFsc2U7XG4gICAgICB9LCAyMDApO1xuXG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCB7IG1hcmtlcjogdGhpcyB9KTtcbiAgICB9KTtcbiAgfSxcbiAgX2lzSW5zaWRlSG9sZSAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB2YXIgaG9sZXMgPSBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaG9sZSA9IGhvbGVzW2ldO1xuICAgICAgaWYgKHRoaXMuX21Hcm91cCAhPT0gaG9sZSkge1xuICAgICAgICBpZiAoaG9sZS5faXNNYXJrZXJJblBvbHlnb24odGhpcy5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9pc091dHNpZGVPZlBvbHlnb24gKHBvbHlnb24pIHtcbiAgICByZXR1cm4gIXBvbHlnb24uX2lzTWFya2VySW5Qb2x5Z29uKHRoaXMuZ2V0TGF0TG5nKCkpO1xuICB9LFxuICBfZGV0ZWN0SW50ZXJzZWN0aW9uIChlKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBsYXRsbmcgPSAoZSA9PT0gdW5kZWZpbmVkKSA/IHRoaXMuZ2V0TGF0TG5nKCkgOiBlLnRhcmdldC5fbGF0bG5nO1xuICAgIHZhciBpc091dHNpZGVPZlBvbHlnb24gPSBmYWxzZTtcbiAgICB2YXIgaXNJbnNpZGVPZkhvbGUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIGlzT3V0c2lkZU9mUG9seWdvbiA9IHRoaXMuX2lzT3V0c2lkZU9mUG9seWdvbihtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIGlzSW5zaWRlT2ZIb2xlID0gdGhpcy5faXNJbnNpZGVIb2xlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzSW5zaWRlT2ZIb2xlID0gdGhpcy5faXNJbnNpZGVIb2xlKCk7XG4gICAgfVxuXG4gICAgdmFyIHJzbHQgPSBpc0luc2lkZU9mSG9sZSB8fCBpc091dHNpZGVPZlBvbHlnb24gfHwgdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbihsYXRsbmcpIHx8IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbldpdGhIb2xlcyhlKTtcblxuICAgIG1hcC5lZGdlc0ludGVyc2VjdGVkKHJzbHQpO1xuICAgIGlmIChyc2x0KSB7XG4gICAgICB0aGlzLl9tYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuICB9LFxuICBfZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzIChlKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcCwgaGFzSW50ZXJzZWN0aW9uID0gZmFsc2UsIGhvbGUsIGxhdGxuZyA9IChlID09PSB1bmRlZmluZWQpID8gdGhpcy5nZXRMYXRMbmcoKSA6IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgIHZhciBwcmV2UG9pbnQgPSB0aGlzLnByZXYoKTtcbiAgICB2YXIgbmV4dFBvaW50ID0gdGhpcy5uZXh0KCk7XG5cbiAgICBpZiAocHJldlBvaW50ID09IG51bGwgJiYgbmV4dFBvaW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2Vjb25kUG9pbnQgPSBwcmV2UG9pbnQuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIGxhc3RQb2ludCA9IG5leHRQb2ludC5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbGF5ZXJzLCB0bXBBcnJheSA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhvbGUgPSBob2xlc1tpXTtcbiAgICAgICAgaWYgKGhvbGUgIT09IHRoaXMuX21Hcm91cCkge1xuICAgICAgICAgIGhhc0ludGVyc2VjdGlvbiA9IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgaG9sZSk7XG4gICAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY2hlY2sgdGhhdCBob2xlIGlzIGluc2lkZSBvZiBvdGhlciBob2xlXG4gICAgICAgICAgdG1wQXJyYXkgPSBbXTtcbiAgICAgICAgICBsYXllcnMgPSBob2xlLmdldExheWVycygpO1xuXG4gICAgICAgICAgbGF5ZXJzLl9lYWNoKChsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX21Hcm91cC5faXNNYXJrZXJJblBvbHlnb24obGF5ZXIuZ2V0TGF0TG5nKCkpKSB7XG4gICAgICAgICAgICAgIHRtcEFycmF5LnB1c2goXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodG1wQXJyYXkubGVuZ3RoID09PSBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUoW2xhdGxuZywgc2Vjb25kUG9pbnQsIGxhc3RQb2ludF0sIGVNYXJrZXJzR3JvdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhhc0ludGVyc2VjdGlvbiA9IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgaG9sZXNbaV0pO1xuXG4gICAgICAgIC8vIGNoZWNrIHRoYXQgaG9sZSBpcyBvdXRzaWRlIG9mIHBvbHlnb25cbiAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICB0bXBBcnJheSA9IFtdO1xuICAgICAgICBsYXllcnMgPSBob2xlc1tpXS5nZXRMYXllcnMoKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAobGF5ZXJzW2pdLl9pc091dHNpZGVPZlBvbHlnb24oZU1hcmtlcnNHcm91cCkpIHtcbiAgICAgICAgICAgIHRtcEFycmF5LnB1c2goXCJcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0bXBBcnJheS5sZW5ndGggPT09IGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5NYXJrZXIucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIHRoaXMub24oJ2RyYWdzdGFydCcsIChlKSA9PiB7XG4gICAgICB0aGlzLl9zdG9yZWRMYXllclBvaW50ID0gbnVsbDsgLy9yZXNldCBwb2ludFxuXG4gICAgICB0aGlzLl9tR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IGUudGFyZ2V0Ll9sYXRsbmc7XG5cbiAgICAgIGlmICh0aGlzLl9wcmV2LmlzUGxhaW4oKSkge1xuICAgICAgICB0aGlzLl9tR3JvdXAuc2V0TWlkZGxlTWFya2Vycyh0aGlzLnBvc2l0aW9uKTtcbiAgICAgIH1cblxuICAgIH0pLm9uKCdkcmFnJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX29uRHJhZyhlKTtcbiAgICB9KS5vbignZHJhZ2VuZCcsIChlKSA9PiB7XG4gICAgICB0aGlzLl9vbkRyYWdFbmQoZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZWRvd24nLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZHJhZ2dpbmcuX2VuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fYmluZENvbW1vbkV2ZW50cyhtYXApO1xuICB9LFxuICBfb25EcmFnIChlKSB7XG4gICAgdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKGUpO1xuICB9LFxuICBfb25EcmFnRW5kIChlKSB7XG4gICAgdmFyIHJzbHQgPSB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oZSk7XG4gICAgaWYgKHJzbHQgJiYgIXRoaXMuX21hcC5vcHRpb25zLmFsbG93Q29ycmVjdEludGVyc2VjdGlvbikge1xuICAgICAgdGhpcy5fcmVzdG9yZU9sZFBvc2l0aW9uKCk7XG4gICAgfVxuICB9LFxuICAvL3RvZG86IGNvbnRpbnVlIHdpdGggb3B0aW9uICdhbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb24nXG4gIF9yZXN0b3JlT2xkUG9zaXRpb24gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKG1hcC5lZGdlc0ludGVyc2VjdGVkKCkpIHtcbiAgICAgIGxldCBzdGF0ZUxhdExuZyA9IHRoaXMuX29sZExhdExuZ1N0YXRlO1xuICAgICAgdGhpcy5zZXRMYXRMbmcoTC5sYXRMbmcoc3RhdGVMYXRMbmcubGF0LCBzdGF0ZUxhdExuZy5sbmcpKTtcblxuICAgICAgdGhpcy5jaGFuZ2VQcmV2TmV4dFBvcygpO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgICAgLy9cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZHJhZ19tYXJrZXInLCB7IG1hcmtlcjogdGhpcyB9KTtcblxuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnJlc2V0U3R5bGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSB0aGlzLmdldExhdExuZygpO1xuICAgIH1cbiAgfSxcbiAgX2FuaW1hdGVab29tIChvcHQpIHtcbiAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICB2YXIgcG9zID0gdGhpcy5fbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQodGhpcy5fbGF0bG5nLCBvcHQuem9vbSwgb3B0LmNlbnRlcikucm91bmQoKTtcblxuICAgICAgdGhpcy5fc2V0UG9zKHBvcyk7XG4gICAgfVxuICB9LFxuICByZXNldEljb24gKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbi1kcmFnJyk7XG4gIH0sXG4gIHVuU2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgX3NlbGVjdEljb25Jbkdyb3VwICgpIHtcbiAgICBpZiAoIXRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgdGhpcy5fYWRkSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbicpO1xuICAgIH1cbiAgICB0aGlzLl9hZGRJY29uQ2xhc3MoJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIHNlbGVjdEljb25Jbkdyb3VwICgpIHtcbiAgICBpZiAodGhpcy5fcHJldikge1xuICAgICAgdGhpcy5fcHJldi5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG4gICAgdGhpcy5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICBpZiAodGhpcy5fbmV4dCkge1xuICAgICAgdGhpcy5fbmV4dC5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG4gIH0sXG4gIGlzU2VsZWN0ZWRJbkdyb3VwICgpIHtcbiAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBMLk1hcmtlci5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBfZXJyb3JMaW5lczogW10sXG4gIF9wcmV2RXJyb3JMaW5lOiBudWxsLFxuICBfbmV4dEVycm9yTGluZTogbnVsbCxcbiAgX2RyYXdFcnJvckxpbmVzICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRoaXMuX2NsZWFyRXJyb3JMaW5lcygpO1xuXG4gICAgdmFyIGN1cnJQb2ludCA9IHRoaXMuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIHByZXZQb2ludHMgPSBbdGhpcy5wcmV2KCkuZ2V0TGF0TG5nKCksIGN1cnJQb2ludF07XG4gICAgdmFyIG5leHRQb2ludHMgPSBbdGhpcy5uZXh0KCkuZ2V0TGF0TG5nKCksIGN1cnJQb2ludF07XG5cbiAgICB2YXIgZXJyb3JMaW5lU3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5lcnJvckxpbmVTdHlsZTtcblxuICAgIHRoaXMuX3ByZXZFcnJvckxpbmUgPSBuZXcgTC5Qb2x5bGluZShwcmV2UG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG4gICAgdGhpcy5fbmV4dEVycm9yTGluZSA9IG5ldyBMLlBvbHlsaW5lKG5leHRQb2ludHMsIGVycm9yTGluZVN0eWxlKTtcblxuICAgIHRoaXMuX3ByZXZFcnJvckxpbmUuYWRkVG8obWFwKTtcbiAgICB0aGlzLl9uZXh0RXJyb3JMaW5lLmFkZFRvKG1hcCk7XG5cbiAgICB0aGlzLl9lcnJvckxpbmVzLnB1c2godGhpcy5fcHJldkVycm9yTGluZSk7XG4gICAgdGhpcy5fZXJyb3JMaW5lcy5wdXNoKHRoaXMuX25leHRFcnJvckxpbmUpO1xuICB9LFxuICBfY2xlYXJFcnJvckxpbmVzICgpIHtcbiAgICB0aGlzLl9lcnJvckxpbmVzLl9lYWNoKChsaW5lKSA9PiB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIobGluZSkpO1xuICB9LFxuICBzZXRJbnRlcnNlY3RlZFN0eWxlICgpIHtcbiAgICB0aGlzLl9zZXRJbnRlcnNlY3Rpb25JY29uKCk7XG5cbiAgICAvL3Nob3cgaW50ZXJzZWN0ZWQgbGluZXNcbiAgICB0aGlzLl9kcmF3RXJyb3JMaW5lcygpO1xuICB9LFxuICByZXNldFN0eWxlICgpIHtcbiAgICB0aGlzLnJlc2V0SWNvbigpO1xuICAgIHRoaXMuc2VsZWN0SWNvbkluR3JvdXAoKTtcblxuICAgIGlmICh0aGlzLl9wcmV2SW50ZXJzZWN0ZWQpIHtcbiAgICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5yZXNldEljb24oKTtcbiAgICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9uZXh0SW50ZXJzZWN0ZWQpIHtcbiAgICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5yZXNldEljb24oKTtcbiAgICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cblxuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZCA9IG51bGw7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkID0gbnVsbDtcblxuICAgIC8vaGlkZSBpbnRlcnNlY3RlZCBsaW5lc1xuICAgIHRoaXMuX2NsZWFyRXJyb3JMaW5lcygpO1xuICB9LFxuICBfcHJldmlld0VyTGluZTogbnVsbCxcbiAgX3B0OiBudWxsLFxuICBfcHJldmlld0Vycm9yTGluZSAoKSB7XG4gICAgaWYgKHRoaXMuX3ByZXZpZXdFckxpbmUpIHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9wcmV2aWV3RXJMaW5lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcHQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wdCk7XG4gICAgfVxuXG4gICAgdmFyIHBvaW50cyA9IFt0aGlzLm5leHQoKS5nZXRMYXRMbmcoKSwgdGhpcy5wcmV2KCkuZ2V0TGF0TG5nKCldO1xuXG4gICAgdmFyIGVycm9yTGluZVN0eWxlID0gdGhpcy5fbWFwLm9wdGlvbnMucHJldmlld0Vycm9yTGluZVN0eWxlO1xuXG4gICAgdGhpcy5fcHJldmlld0VyTGluZSA9IG5ldyBMLlBvbHlsaW5lKHBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuXG4gICAgdGhpcy5fcHJldmlld0VyTGluZS5hZGRUbyh0aGlzLl9tYXApO1xuXG4gICAgdGhpcy5fcHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9wcmV2aWV3RXJMaW5lKTtcbiAgICB9LCA5MDApO1xuICB9XG59KTsiLCJpbXBvcnQgRXh0ZW5kZWRQb2x5Z29uIGZyb20gJy4uL2V4dGVuZGVkL1BvbHlnb24nO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vZXh0ZW5kZWQvVG9vbHRpcCc7XG5cbmV4cG9ydCBkZWZhdWx0IEwuRWRpdFBsb3lnb24gPSBFeHRlbmRlZFBvbHlnb24uZXh0ZW5kKHtcbiAgX29sZEU6IHVuZGVmaW5lZCwgLy8gdG8gcmV1c2UgZXZlbnQgb2JqZWN0IGFmdGVyIFwiYmFkIGhvbGVcIiByZW1vdmluZyB0byBidWlsZCBuZXcgaG9sZVxuICBfazogMSwgLy8gdG8gZGVjcmVhc2UgJ2RpZmYnIHZhbHVlIHdoaWNoIGhlbHBzIGJ1aWxkIGEgaG9sZVxuICBfaG9sZXM6IFtdLFxuICBpbml0aWFsaXplIChsYXRsbmdzLCBvcHRpb25zKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZ3MsIG9wdGlvbnMpO1xuICAgIHRoaXMuX2luaXRXaXRoSG9sZXMobGF0bG5ncyk7XG5cbiAgICB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lID0gXCJsZWFmbGV0LWNsaWNrYWJsZSBwb2x5Z29uXCI7XG4gIH0sXG4gIF91cGRhdGUgKGUpIHtcbiAgICB2YXIgbWFya2VyID0gZS5tYXJrZXI7XG5cbiAgICBpZiAobWFya2VyLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgdmFyIG1hcmtlcnMgPSBtYXJrZXIuX21Hcm91cC5fbWFya2VycztcbiAgICAgIG1hcmtlcnMgPSBtYXJrZXJzLmZpbHRlcigobWFya2VyKSA9PiAhbWFya2VyLmlzTWlkZGxlKCkpO1xuICAgICAgdGhpcy5faG9sZXNbbWFya2VyLl9tR3JvdXAucG9zaXRpb25dID0gbWFya2Vycy5tYXAoKG1hcmtlcikgPT4gbWFya2VyLmdldExhdExuZygpKTtcblxuICAgIH1cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBfcmVtb3ZlSG9sZSAoZSkge1xuICAgIHZhciBob2xlUG9zaXRpb24gPSBlLm1hcmtlci5fbUdyb3VwLnBvc2l0aW9uO1xuICAgIHRoaXMuX2hvbGVzLnNwbGljZShob2xlUG9zaXRpb24sIDEpO1xuXG4gICAgdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVtb3ZlTGF5ZXIoZS5tYXJrZXIuX21Hcm91cC5fbGVhZmxldF9pZCk7XG4gICAgdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVwb3MoZS5tYXJrZXIuX21Hcm91cC5wb3NpdGlvbik7XG5cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgbWFwLm9mZignZWRpdG9yOmFkZF9tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjphZGRfbWFya2VyJywgKGUpID0+IHRoaXMuX3VwZGF0ZShlKSk7XG4gICAgbWFwLm9mZignZWRpdG9yOmRyYWdfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZHJhZ19tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZGVsZXRlX2hvbGUnKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfaG9sZScsIChlKSA9PiB0aGlzLl9yZW1vdmVIb2xlKGUpKTtcblxuICAgIHRoaXMub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW1vdmUnLCB7IGxheWVyUG9pbnQ6IGUubGF5ZXJQb2ludCB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4gbWFwLmZpcmUoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnKSk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2Vtb3ZlJyk7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnKTtcblxuICAgIEwuUG9seWxpbmUucHJvdG90eXBlLm9uUmVtb3ZlLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgYWRkSG9sZSAoaG9sZSkge1xuICAgIHRoaXMuX2hvbGVzID0gdGhpcy5faG9sZXMgfHwgW107XG4gICAgdGhpcy5faG9sZXMucHVzaChob2xlKTtcblxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIGhhc0hvbGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9ob2xlcy5sZW5ndGggPiAwO1xuICB9LFxuICBfcmVzZXRMYXN0SG9sZSAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIG1hcC5nZXRTZWxlY3RlZE1hcmtlcigpLnJlbW92ZUhvbGUoKTtcblxuICAgIGlmICh0aGlzLl9rID4gMC4wMDEpIHtcbiAgICAgIHRoaXMuX2FkZEhvbGUodGhpcy5fb2xkRSwgMC41KTtcbiAgICB9XG4gIH0sXG4gIGNoZWNrSG9sZUludGVyc2VjdGlvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbiB8fCBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBlSE1hcmtlcnNHcm91cExheWVycyA9IHRoaXMuX21hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmdldExheWVycygpO1xuICAgIHZhciBsYXN0SG9sZSA9IGVITWFya2Vyc0dyb3VwTGF5ZXJzW2VITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDFdO1xuICAgIHZhciBsYXN0SG9sZUxheWVycyA9IGVITWFya2Vyc0dyb3VwTGF5ZXJzW2VITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDFdLmdldExheWVycygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SG9sZUxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGxheWVyID0gbGFzdEhvbGVMYXllcnNbaV07XG5cbiAgICAgIGlmIChsYXllci5fZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzKCkpIHtcbiAgICAgICAgdGhpcy5fcmVzZXRMYXN0SG9sZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGxheWVyLl9pc091dHNpZGVPZlBvbHlnb24odGhpcy5fbWFwLmdldEVNYXJrZXJzR3JvdXAoKSkpIHtcbiAgICAgICAgdGhpcy5fcmVzZXRMYXN0SG9sZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlSE1hcmtlcnNHcm91cExheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgZUhvbGVNYXJrZXJHcm91cExheWVyID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbal07XG5cbiAgICAgICAgaWYgKGxhc3RIb2xlICE9PSBlSG9sZU1hcmtlckdyb3VwTGF5ZXIgJiYgZUhvbGVNYXJrZXJHcm91cExheWVyLl9pc01hcmtlckluUG9seWdvbihsYXllci5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pOyIsImltcG9ydCBNYXJrZXIgZnJvbSAnLi4vZWRpdC9tYXJrZXInO1xuaW1wb3J0IHNvcnQgZnJvbSAnLi4vdXRpbHMvc29ydEJ5UG9zaXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBMLkNsYXNzLmV4dGVuZCh7XG4gIGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcblxuICBfc2VsZWN0ZWQ6IGZhbHNlLFxuICBfbGFzdE1hcmtlcjogdW5kZWZpbmVkLFxuICBfZmlyc3RNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX3Bvc2l0aW9uSGFzaDogdW5kZWZpbmVkLFxuICBfbGFzdFBvc2l0aW9uOiAwLFxuICBfbWFya2VyczogW10sXG4gIG9uQWRkIChtYXApIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgIC8vTC5MYXllckdyb3VwLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICAvL0wuTGF5ZXJHcm91cC5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcbiAgfSxcbiAgY2xlYXJMYXllcnMgKCkge1xuICAgIHRoaXMuX21hcmtlcnMuZm9yRWFjaCgobWFya2VyKSA9PiB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIobWFya2VyKTtcbiAgICB9KTtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gIH0sXG4gIGFkZFRvIChtYXApIHtcbiAgICBtYXAuYWRkTGF5ZXIodGhpcyk7XG4gIH0sXG4gIGFkZExheWVyIChtYXJrZXIpIHtcbiAgICB0aGlzLl9tYXAuYWRkTGF5ZXIobWFya2VyKTtcbiAgICB0aGlzLl9tYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgICBpZiAobWFya2VyLnBvc2l0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX21hcmtlcnMubW92ZSh0aGlzLl9tYXJrZXJzLmxlbmd0aCAtIDEsIG1hcmtlci5wb3NpdGlvbik7XG4gICAgfVxuICAgIG1hcmtlci5wb3NpdGlvbiA9IChtYXJrZXIucG9zaXRpb24gIT0gbnVsbCkgPyBtYXJrZXIucG9zaXRpb24gOiB0aGlzLl9tYXJrZXJzLmxlbmd0aCAtIDE7XG4gIH0sXG4gIHJlbW92ZSAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLmdldExheWVycygpO1xuICAgIG1hcmtlcnMuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgd2hpbGUgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VyKG1hcmtlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKCF0aGlzLl9pc0hvbGUpIHtcbiAgICAgIG1hcC5nZXRWR3JvdXAoKS5yZW1vdmVMYXllcihtYXAuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgIH1cbiAgICBtYXAuZmlyZSgnZWRpdG9yOnBvbHlnb246ZGVsZXRlZCcpO1xuICB9LFxuICByZW1vdmVMYXllciAobWFya2VyKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gbWFya2VyLnBvc2l0aW9uO1xuICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcihtYXJrZXIpO1xuICAgIHRoaXMuX21hcmtlcnMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgfSxcbiAgZ2V0TGF5ZXJzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2VycztcbiAgfSxcbiAgZWFjaExheWVyIChjYikge1xuICAgIHRoaXMuX21hcmtlcnMuZm9yRWFjaChjYik7XG4gIH0sXG4gIG1hcmtlckF0IChwb3NpdGlvbikge1xuICAgIHZhciByc2x0ID0gdGhpcy5fbWFya2Vyc1twb3NpdGlvbl07XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdE1hcmtlcigpO1xuICAgIH1cblxuICAgIGlmIChyc2x0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJzbHQgPSB0aGlzLmxhc3RNYXJrZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcnNsdDtcbiAgfSxcbiAgZmlyc3RNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrZXJzWzBdO1xuICB9LFxuICBsYXN0TWFya2VyICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG4gICAgcmV0dXJuIG1hcmtlcnNbbWFya2Vycy5sZW5ndGggLSAxXTtcbiAgfSxcbiAgcmVtb3ZlTWFya2VyIChtYXJrZXIpIHtcbiAgICB2YXIgYiA9ICFtYXJrZXIuaXNNaWRkbGUoKTtcblxuICAgIHZhciBwcmV2TWFya2VyID0gbWFya2VyLl9wcmV2O1xuICAgIHZhciBuZXh0TWFya2VyID0gbWFya2VyLl9uZXh0O1xuICAgIHZhciBuZXh0bmV4dE1hcmtlciA9IG1hcmtlci5fbmV4dC5fbmV4dDtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KG1hcmtlci5wb3NpdGlvbik7XG4gICAgdGhpcy5yZW1vdmVNYXJrZXJBdChwcmV2TWFya2VyLnBvc2l0aW9uKTtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KG5leHRNYXJrZXIucG9zaXRpb24pO1xuXG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKG5leHRuZXh0TWFya2VyLnBvc2l0aW9uKTtcblxuICAgICAgaWYgKGIpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfbWFya2VyJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKHRoaXMpO1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9ob2xlJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXAucmVtb3ZlUG9seWdvbihtYXAuZ2V0RVBvbHlnb24oKSk7XG5cbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfcG9seWdvbicpO1xuICAgICAgfVxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZU1hcmtlckF0IChwb3NpdGlvbikge1xuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXI7XG4gICAgaWYgKHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICAgIG1hcmtlciA9IHRoaXMubWFya2VyQXQocG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIF9jaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG4gICAgbWFya2Vycy5mb3JFYWNoKChfbWFya2VyKSA9PiB7XG4gICAgICBpZiAoX2NoYW5nZVBvcykge1xuICAgICAgICBfbWFya2VyLnBvc2l0aW9uID0gKF9tYXJrZXIucG9zaXRpb24gPT09IDApID8gMCA6IF9tYXJrZXIucG9zaXRpb24gLSAxO1xuICAgICAgfVxuICAgICAgaWYgKF9tYXJrZXIgPT09IG1hcmtlcikge1xuICAgICAgICBtYXJrZXIuX3ByZXYuX25leHQgPSBtYXJrZXIuX25leHQ7XG4gICAgICAgIG1hcmtlci5fbmV4dC5fcHJldiA9IG1hcmtlci5fcHJldjtcbiAgICAgICAgX2NoYW5nZVBvcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbW92ZUxheWVyKG1hcmtlcik7XG5cbiAgICBpZiAobWFya2Vycy5sZW5ndGggPCA1KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5jbGVhcigpO1xuICAgICAgICBtYXAuZ2V0Vkdyb3VwKCkucmVtb3ZlTGF5ZXIobWFwLl9nZXRTZWxlY3RlZFZMYXllcigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGFkZE1hcmtlciAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIC8vIDEuIHJlY2FsY3VsYXRlIHBvc2l0aW9uc1xuICAgIGlmICh0eXBlb2YgbGF0bG5nID09PSAnbnVtYmVyJykge1xuICAgICAgcG9zaXRpb24gPSB0aGlzLm1hcmtlckF0KGxhdGxuZykucG9zaXRpb247XG4gICAgICB0aGlzLl9yZWNhbGNQb3NpdGlvbnMocG9zaXRpb24pO1xuXG4gICAgICB2YXIgcHJldk1hcmtlciA9IChwb3NpdGlvbiAtIDEpIDwgMCA/IHRoaXMubGFzdE1hcmtlcigpIDogdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgdmFyIG5leHRNYXJrZXIgPSB0aGlzLm1hcmtlckF0KChwb3NpdGlvbiA9PSAtMSkgPyAxIDogcG9zaXRpb24pO1xuICAgICAgbGF0bG5nID0gdGhpcy5fZ2V0TWlkZGxlTGF0TG5nKHByZXZNYXJrZXIsIG5leHRNYXJrZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgb3B0aW9ucy5kcmFnZ2FibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpKSB7XG4gICAgICBvcHRpb25zLmRyYWdnYWJsZSA9ICF0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXIgPSBuZXcgTWFya2VyKHRoaXMsIGxhdGxuZywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgICB0aGlzLl9sYXN0TWFya2VyID0gbWFya2VyO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvL2lmICh0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgLy8gIG1hcmtlci5kcmFnZ2luZy5kaXNhYmxlKCk7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICBtYXJrZXIuZHJhZ2dpbmcuZW5hYmxlKCk7XG4gICAgLy99XG5cbiAgICB0aGlzLmFkZExheWVyKG1hcmtlcik7XG5cbiAgICB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSAobWFya2VyLnBvc2l0aW9uICE9PSB1bmRlZmluZWQgKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX2xhc3RQb3NpdGlvbisrO1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fbGFzdE1hcmtlcjtcbiAgICAgIHRoaXMuX2ZpcnN0TWFya2VyLl9wcmV2ID0gbWFya2VyO1xuICAgICAgaWYgKG1hcmtlci5fcHJldikge1xuICAgICAgICB0aGlzLl9sYXN0TWFya2VyLl9uZXh0ID0gbWFya2VyO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9maXJzdE1hcmtlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fbGFzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB9XG5cbiAgICAvLyAyLiByZWNhbGN1bGF0ZSByZWxhdGlvbnNcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVjYWxjUmVsYXRpb25zKG1hcmtlcik7XG4gICAgfVxuICAgIC8vIDMuIHRyaWdnZXIgZXZlbnRcbiAgICBpZiAoIW1hcmtlci5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmFkZF9tYXJrZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdmFyIGlkcyA9IHRoaXMuX2lkcygpO1xuXG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuXG4gICAgaWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICB0aGlzLl9kZWxldGVFdmVudHMoaWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gMDtcblxuICAgIHRoaXMuX2ZpcnN0TWFya2VyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfZGVsZXRlRXZlbnRzIChpZCkge1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnZpZXdyZXNldF9pZHhbaWRdO1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnpvb21hbmltX2lkeFtpZF07XG4gIH0sXG4gIF9nZXRNaWRkbGVMYXRMbmcgKG1hcmtlcjEsIG1hcmtlcjIpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwLFxuICAgICAgcDEgPSBtYXAucHJvamVjdChtYXJrZXIxLmdldExhdExuZygpKSxcbiAgICAgIHAyID0gbWFwLnByb2plY3QobWFya2VyMi5nZXRMYXRMbmcoKSk7XG5cbiAgICByZXR1cm4gbWFwLnVucHJvamVjdChwMS5fYWRkKHAyKS5fZGl2aWRlQnkoMikpO1xuICB9LFxuICBfcmVjYWxjUG9zaXRpb25zIChwb3NpdGlvbikge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcblxuICAgIHZhciBjaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICBtYXJrZXJzLmZvckVhY2goKG1hcmtlciwgX3Bvc2l0aW9uKSA9PiB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgICAgICBjaGFuZ2VQb3MgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZVBvcykge1xuICAgICAgICB0aGlzLl9tYXJrZXJzW19wb3NpdGlvbl0ucG9zaXRpb24gKz0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3JlY2FsY1JlbGF0aW9ucyAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuXG4gICAgbWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIHBvc2l0aW9uKSA9PiB7XG5cbiAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gLSAxKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gKyAxKTtcblxuICAgICAgLy8gZmlyc3RcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLmxhc3RNYXJrZXIoKTtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdCgxKTtcbiAgICAgIH1cblxuICAgICAgLy8gbGFzdFxuICAgICAgaWYgKHBvc2l0aW9uID09PSBtYXJrZXJzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfaWRzICgpIHtcbiAgICB2YXIgcnNsdCA9IFtdO1xuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5fbGF5ZXJzKSB7XG4gICAgICByc2x0LnB1c2goaWQpO1xuICAgIH1cblxuICAgIHJzbHQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuXG4gICAgcmV0dXJuIHJzbHQ7XG4gIH0sXG4gIHNlbGVjdCAoKSB7XG4gICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl9tYXAuX3NlbGVjdGVkTUdyb3VwID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgICBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5zZXRMYXN0SG9sZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRTZWxlY3Rpb24oKTtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0TGFzdEhvbGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIG1hcmtlci5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gdHJ1ZTtcblxuICAgIHRoaXMuX21hcC5fc2VsZWN0ZWRNR3JvdXAgPSB0aGlzO1xuICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcpO1xuICB9LFxuICBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH0sXG4gIHJlc2V0U2VsZWN0aW9uICgpIHtcbiAgICB0aGlzLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIG1hcmtlci51blNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgYnRuczogW1xuICAgICAgLy97J3RpdGxlJzogJ3JlbW92ZScsICdjbGFzc05hbWUnOiAnZmEgZmEtdHJhc2gnfVxuICAgIF0sXG4gICAgZXZlbnROYW1lOiBcImNvbnRyb2xBZGRlZFwiLFxuICAgIHByZXNzRXZlbnROYW1lOiBcImJ0blByZXNzZWRcIlxuICB9LFxuICBfYnRuOiBudWxsLFxuICBzdG9wRXZlbnQ6IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uLFxuICBpbml0aWFsaXplIChvcHRpb25zKSB7XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gIH0sXG4gIF90aXRsZUNvbnRhaW5lcjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIG1hcC5vbih0aGlzLm9wdGlvbnMucHJlc3NFdmVudE5hbWUsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9idG4gJiYgIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpKSB7XG4gICAgICAgIHRoaXMuX29uUHJlc3NCdG4oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1iYXIgbGVhZmxldC1lZGl0b3ItYnV0dG9ucycpO1xuXG4gICAgbWFwLl9jb250cm9sQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3NldEJ0bihvcHRpb25zLmJ0bnMsIGNvbnRhaW5lcik7XG4gICAgICBpZiAob3B0aW9ucy5ldmVudE5hbWUpIHtcbiAgICAgICAgbWFwLmZpcmUob3B0aW9ucy5ldmVudE5hbWUsIHtjb250cm9sOiBzZWxmfSk7XG4gICAgICB9XG5cbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoc2VsZi5fYnRuLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihzZWxmLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuXG4gICAgfSwgMTAwMCk7XG5cbiAgICBtYXAuZ2V0QnRuQ29udHJvbCA9ICgpID0+IHRoaXM7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfb25QcmVzc0J0biAoKSB7fSxcbiAgX29uTW91c2VPdmVyICgpIHt9LFxuICBfb25Nb3VzZU91dCAoKSB7fSxcbiAgX3NldEJ0biAob3B0cywgY29udGFpbmVyKSB7XG4gICAgdmFyIF9idG47XG4gICAgb3B0cy5mb3JFYWNoKChidG4sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggPT09IG9wdHMubGVuZ3RoIC0gMSkge1xuICAgICAgICBidG4uY2xhc3NOYW1lICs9IFwiIGxhc3RcIjtcbiAgICAgIH1cbiAgICAgIC8vdmFyIGNoaWxkID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYnRuJyArIChidG4uY2xhc3NOYW1lID8gJyAnICsgYnRuLmNsYXNzTmFtZSA6ICcnKSk7XG5cbiAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICB2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnbGVhZmxldC1idG4nLCB3cmFwcGVyKTtcbiAgICAgIGxpbmsuaHJlZiA9ICcjJztcblxuICAgICAgdmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcbiAgICAgIEwuRG9tRXZlbnRcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdkYmxjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcblxuICAgICAgbGluay5hcHBlbmRDaGlsZChMLkRvbVV0aWwuY3JlYXRlKCdpJywgJ2ZhJyArIChidG4uY2xhc3NOYW1lID8gJyAnICsgYnRuLmNsYXNzTmFtZSA6ICcnKSkpO1xuXG4gICAgICB2YXIgY2FsbGJhY2sgPSAoZnVuY3Rpb24gKG1hcCwgcHJlc3NFdmVudE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBtYXAuZmlyZShwcmVzc0V2ZW50TmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0odGhpcy5fbWFwLCBidG4ucHJlc3NFdmVudE5hbWUgfHwgdGhpcy5vcHRpb25zLnByZXNzRXZlbnROYW1lKSk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBjYWxsYmFjayk7XG5cbiAgICAgIF9idG4gPSBsaW5rO1xuICAgIH0pO1xuICAgIHRoaXMuX2J0biA9IF9idG47XG4gIH0sXG4gIGdldEJ0bkNvbnRhaW5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fY29udHJvbENvcm5lcnNbJ3RvcGxlZnQnXTtcbiAgfSxcbiAgZ2V0QnRuQXQgKHBvcykge1xuICAgIHJldHVybiB0aGlzLmdldEJ0bkNvbnRhaW5lcigpLmNoaWxkW3Bvc107XG4gIH0sXG4gIGRpc2FibGVCdG4gKHBvcykge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLmdldEJ0bkF0KHBvcyksICdkaXNhYmxlZCcpO1xuICB9LFxuICBlbmFibGVCdG4gKHBvcykge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLmdldEJ0bkF0KHBvcyksICdkaXNhYmxlZCcpO1xuICB9XG59KTsiLCJpbXBvcnQgQnRuQ3RybCBmcm9tICcuL0J0bkNvbnRyb2wnO1xuXG5leHBvcnQgZGVmYXVsdCBCdG5DdHJsLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBldmVudE5hbWU6ICdsb2FkQnRuQWRkZWQnLFxuICAgIHByZXNzRXZlbnROYW1lOiAnbG9hZEJ0blByZXNzZWQnXG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICB2YXIgY29udGFpbmVyID0gQnRuQ3RybC5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgbWFwLm9uKCdsb2FkQnRuQWRkZWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9tYXAub24oJ3NlYXJjaEVuYWJsZWQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuX3JlbmRlckZvcm0oY29udGFpbmVyKTtcbiAgICB9KTtcblxuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsb2FkLWpzb24tY29udGFpbmVyJyk7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfb25QcmVzc0J0biAoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KTtcbiAgICB9XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgaWYgKHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSAhPSAnYmxvY2snKSB7XG4gICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgdGhpcy5fdGV4dGFyZWEuZm9jdXMoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuT3BlbmVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnbG9hZEJ0bkhpZGRlbicpO1xuICAgIH1cbiAgfSxcbiAgX2NvbGxhcHNlICgpIHtcbiAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGhpcy5fdGV4dGFyZWEudmFsdWUgPSAnJztcbiAgfSxcbiAgX3JlbmRlckZvcm0gKGNvbnRhaW5lcikge1xuICAgIHZhciBmb3JtID0gdGhpcy5fZm9ybSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2Zvcm0nKTtcblxuICAgIHZhciB0ZXh0YXJlYSA9IHRoaXMuX3RleHRhcmVhID0gTC5Eb21VdGlsLmNyZWF0ZSgndGV4dGFyZWEnKTtcbiAgICB0ZXh0YXJlYS5zdHlsZS53aWR0aCA9ICcyMDBweCc7XG4gICAgdGV4dGFyZWEuc3R5bGUuaGVpZ2h0ID0gJzEwMHB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkIHdoaXRlJztcbiAgICB0ZXh0YXJlYS5zdHlsZS5wYWRkaW5nID0gJzVweCc7XG4gICAgdGV4dGFyZWEuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG5cbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24odGV4dGFyZWEsICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHRleHRhcmVhLCAnbW91c2Vkb3duJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdkYmxjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHRleHRhcmVhLCAnbW91c2V3aGVlbCcsIHRoaXMuc3RvcEV2ZW50KTtcblxuICAgIGZvcm0uYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuXG4gICAgdmFyIHN1Ym1pdEJ0biA9IHRoaXMuX3N1Ym1pdEJ0biA9IEwuRG9tVXRpbC5jcmVhdGUoJ2J1dHRvbicsICdsZWFmbGV0LXN1Ym1pdC1idG4gbG9hZC1nZW9qc29uJyk7XG4gICAgc3VibWl0QnRuLnR5cGUgPSBcInN1Ym1pdFwiO1xuICAgIHN1Ym1pdEJ0bi5pbm5lckhUTUwgPSB0aGlzLl9tYXAub3B0aW9ucy50ZXh0LnN1Ym1pdExvYWRCdG47XG5cbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24oc3VibWl0QnRuLCAnY2xpY2snLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuX3N1Ym1pdEZvcm0sIHRoaXMpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZChzdWJtaXRCdG4pO1xuXG4gICAgTC5Eb21FdmVudC5vbihmb3JtLCAnc3VibWl0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnYnRuLWxlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLl9tYXAub3B0aW9ucy50ZXh0LmxvYWRKc29uO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl90aXRsZUNvbnRhaW5lcik7XG4gIH0sXG4gIF90aW1lb3V0OiBudWxsLFxuICBfc3VibWl0Rm9ybSAoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KTtcbiAgICB9XG5cbiAgICB2YXIganNvbjtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5wYXJzZSh0aGlzLl90ZXh0YXJlYS52YWx1ZSk7XG5cbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtZXJyb3InKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLXN1Y2Nlc3MnKTtcblxuICAgICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC5qc29uV2FzTG9hZGVkO1xuXG4gICAgICBtYXAuY3JlYXRlRWRpdFBvbHlnb24oanNvbik7XG5cbiAgICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICB9LCAyMDAwKTtcblxuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuSGlkZGVuJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1lcnJvcicpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtc3VjY2VzcycpO1xuXG4gICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0LmNoZWNrSnNvbjtcblxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIH0sIDIwMDApO1xuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuSGlkZGVuJyk7XG4gICAgICB0aGlzLl9tYXAubW9kZSgnZHJhdycpO1xuICAgIH1cbiAgfSxcbiAgX29uTW91c2VPdmVyICgpIHtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID09PSAnYmxvY2snKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtc3VjY2VzcycpO1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMuX21hcC5vcHRpb25zLnRleHQubG9hZEpzb247XG4gIH0sXG4gIF9vbk1vdXNlT3V0ICgpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Db250cm9sLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBwb3NpdGlvbjogJ21zZ2NlbnRlcicsXG4gICAgZGVmYXVsdE1zZzogbnVsbFxuICB9LFxuICBpbml0aWFsaXplIChvcHRpb25zKSB7XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gIH0sXG4gIF90aXRsZUNvbnRhaW5lcjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb3JuZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1ib3R0b20nKTtcbiAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWVkaXRvcicpO1xuXG4gICAgbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ10gPSBjb3JuZXI7XG4gICAgbWFwLl9jb250cm9sQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvcm5lcik7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NldENvbnRhaW5lcihjb250YWluZXIsIG1hcCk7XG4gICAgICBtYXAuZmlyZSgnbXNnSGVscGVyQWRkZWQnLCB7IGNvbnRyb2w6IHRoaXMgfSk7XG5cbiAgICAgIHRoaXMuX2NoYW5nZVBvcygpO1xuICAgIH0sIDEwMDApO1xuXG4gICAgbWFwLmdldEJ0bkNvbnRyb2wgPSAoKSA9PiB0aGlzO1xuXG4gICAgdGhpcy5fYmluZEV2ZW50cyhtYXApO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX2NoYW5nZVBvcyAoKSB7XG4gICAgdmFyIGNvbnRyb2xDb3JuZXIgPSB0aGlzLl9tYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXTtcbiAgICBpZiAoY29udHJvbENvcm5lciAmJiBjb250cm9sQ29ybmVyLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgdmFyIGNoaWxkID0gY29udHJvbENvcm5lci5jaGlsZHJlblswXS5jaGlsZHJlblswXTtcblxuICAgICAgaWYgKCFjaGlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB3aWR0aCA9IGNoaWxkLmNsaWVudFdpZHRoO1xuICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgIGNvbnRyb2xDb3JuZXIuc3R5bGUubGVmdCA9ICh0aGlzLl9tYXAuX2NvbnRhaW5lci5jbGllbnRXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2JpbmRFdmVudHMgKCkge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5fY2hhbmdlUG9zKCk7XG4gICAgICB9KTtcbiAgICB9LCAxKTtcbiAgfSxcbiAgX3NldENvbnRhaW5lciAoY29udGFpbmVyKSB7XG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1tc2ctY29udGFpbmVyIHRpdGxlLWhpZGRlbicpO1xuICAgIHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVQb3NDb250YWluZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnICE9PSBudWxsKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnO1xuICAgIH1cbiAgfSxcbiAgZ2V0T2Zmc2V0IChlbCkge1xuICAgIHZhciBfeCA9IDA7XG4gICAgdmFyIF95ID0gMDtcbiAgICBpZiAoIXRoaXMuX21hcC5pc0Z1bGxzY3JlZW4gfHwgIXRoaXMuX21hcC5pc0Z1bGxzY3JlZW4oKSkge1xuICAgICAgd2hpbGUgKGVsICYmICFpc05hTihlbC5vZmZzZXRMZWZ0KSAmJiAhaXNOYU4oZWwub2Zmc2V0VG9wKSkge1xuICAgICAgICBfeCArPSBlbC5vZmZzZXRMZWZ0O1xuICAgICAgICBfeSArPSBlbC5vZmZzZXRUb3A7XG4gICAgICAgIGVsID0gZWwub2Zmc2V0UGFyZW50O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB5OiBfeSwgeDogX3ggfTtcbiAgfSxcbiAgbXNnICh0ZXh0LCB0eXBlLCBvYmplY3QpIHtcbiAgICBpZiAoIXRleHQgfHwgIXRoaXMuX3RpdGxlUG9zQ29udGFpbmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG9iamVjdCkge1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVQb3NDb250YWluZXIsICd0aXRsZS1lcnJvcicpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLCAndGl0bGUtc3VjY2VzcycpO1xuXG4gICAgICB0aGlzLl90aXRsZVBvc0NvbnRhaW5lci5pbm5lckhUTUwgPSB0ZXh0O1xuXG4gICAgICB2YXIgcG9pbnQ7XG5cbiAgICAgIC8vdmFyIG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuX21hcC5fY29udGFpbmVyLmdldEF0dHJpYnV0ZSgnaWQnKSkpO1xuICAgICAgdmFyIG9mZnNldCA9IHRoaXMuZ2V0T2Zmc2V0KHRoaXMuX21hcC5fY29udGFpbmVyKTtcblxuICAgICAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIEwuUG9pbnQpIHtcbiAgICAgICAgcG9pbnQgPSBvYmplY3Q7XG4gICAgICAgIHBvaW50ID0gdGhpcy5fbWFwLmxheWVyUG9pbnRUb0NvbnRhaW5lclBvaW50KHBvaW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQob2JqZWN0LmdldExhdExuZygpKTtcbiAgICAgIH1cblxuICAgICAgcG9pbnQueCArPSBvZmZzZXQueDtcbiAgICAgIHBvaW50LnkgKz0gb2Zmc2V0Lnk7XG5cbiAgICAgIHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLnN0eWxlLnRvcCA9IChwb2ludC55IC0gOCkgKyBcInB4XCI7XG4gICAgICB0aGlzLl90aXRsZVBvc0NvbnRhaW5lci5zdHlsZS5sZWZ0ID0gKHBvaW50LnggKyAxMCkgKyBcInB4XCI7XG5cbiAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZVBvc0NvbnRhaW5lciwgJ3RpdGxlLScgKyB0eXBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1lcnJvcicpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtc3VjY2VzcycpO1xuXG4gICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0ZXh0O1xuXG4gICAgICBpZiAodHlwZSkge1xuICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS0nICsgdHlwZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jaGFuZ2VQb3MoKTtcbiAgICB9XG4gIH0sXG4gIGhpZGUgKCkge1xuICAgIGlmICh0aGlzLl90aXRsZUNvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyKSB7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVQb3NDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICB9XG4gIH0sXG4gIGdldEJ0bkNvbnRhaW5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fY29udHJvbENvcm5lcnNbJ21zZ2NlbnRlciddO1xuICB9LFxuICBnZXRCdG5BdCAocG9zKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnRuQ29udGFpbmVyKCkuY2hpbGRbcG9zXTtcbiAgfSxcbiAgZGlzYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH0sXG4gIGVuYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IEwuUG9seWdvbi5leHRlbmQoe1xuICBpc0VtcHR5ICgpIHtcbiAgICB2YXIgbGF0TG5ncyA9IHRoaXMuZ2V0TGF0TG5ncygpO1xuICAgIHJldHVybiBsYXRMbmdzID09PSBudWxsIHx8IGxhdExuZ3MgPT09IHVuZGVmaW5lZCB8fCAobGF0TG5ncyAmJiBsYXRMbmdzLmxlbmd0aCA9PT0gMCk7XG4gIH0sXG4gIGdldEhvbGUgKGhvbGVHcm91cE51bWJlcikge1xuICAgIGlmICghJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXTtcbiAgfSxcbiAgZ2V0SG9sZVBvaW50IChob2xlR3JvdXBOdW1iZXIsIGhvbGVOdW1iZXIpIHtcbiAgICBpZiAoISQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgISQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2hvbGVzW2hvbGVHcm91cE51bWJlcl1baG9sZU51bWJlcl07XG4gIH0sXG4gIGdldEhvbGVzICgpIHtcbiAgICByZXR1cm4gdGhpcy5faG9sZXM7XG4gIH0sXG4gIGNsZWFySG9sZXMgKCkge1xuICAgIHRoaXMuX2hvbGVzID0gW107XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHRoaXMuY2xlYXJIb2xlcygpO1xuXG4gICAgaWYgKCQuaXNBcnJheSh0aGlzLl9sYXRsbmdzKSAmJiB0aGlzLl9sYXRsbmdzWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2V0TGF0TG5ncyhbXSk7XG4gICAgfVxuICB9LFxuICB1cGRhdGVIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlciwgbGF0bG5nKSB7XG4gICAgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHRoaXMuX2hvbGVzW2hvbGVHcm91cE51bWJlcl1baG9sZU51bWJlcl0gPSBsYXRsbmc7XG4gICAgfSBlbHNlIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICEkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXSA9IGxhdGxuZztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faG9sZXMgPSBsYXRsbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBzZXRIb2xlcyAobGF0bG5ncykge1xuICAgIHRoaXMuX2hvbGVzID0gbGF0bG5ncztcbiAgfSxcbiAgc2V0SG9sZVBvaW50IChob2xlR3JvdXBOdW1iZXIsIGhvbGVOdW1iZXIsIGxhdGxuZykge1xuICAgIHZhciBsYXllciA9IHRoaXMuZ2V0TGF5ZXJzKClbMF07XG4gICAgaWYgKGxheWVyKSB7XG4gICAgICBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgICBsYXllci5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXSA9IGxhdGxuZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0pIiwiZXhwb3J0IGRlZmF1bHQgTC5Db250cm9sLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBwb3NpdGlvbjogJ3RvcGxlZnQnLFxuICAgIGVtYWlsOiAnJ1xuICB9LFxuXG4gIG9uQWRkIChtYXApIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJhciBsZWFmbGV0LXNlYXJjaC1iYXInKTtcbiAgICB2YXIgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICB2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnJywgd3JhcHBlcik7XG4gICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgdmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24obGluaywgJ2NsaWNrJywgc3RvcClcbiAgICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcbiAgICAgIC5vbihsaW5rLCAnZGJsY2xpY2snLCBzdG9wKVxuICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpXG4gICAgICAub24obGluaywgJ2NsaWNrJywgdGhpcy5fdG9nZ2xlLCB0aGlzKTtcblxuICAgIGxpbmsuYXBwZW5kQ2hpbGQoTC5Eb21VdGlsLmNyZWF0ZSgnaScsICdmYSBmYS1zZWFyY2gnKSk7XG5cbiAgICB2YXIgZm9ybSA9IHRoaXMuX2Zvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG5cbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdtb3VzZXdoZWVsJywgc3RvcCk7XG4gICAgTC5Eb21FdmVudC5vbihmb3JtLCAnRE9NTW91c2VTY3JvbGwnLCBzdG9wKTtcbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdNb3pNb3VzZVBpeGVsU2Nyb2xsJywgc3RvcCk7XG5cbiAgICB2YXIgaW5wdXQgPSB0aGlzLl9pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24oaW5wdXQsICdjbGljaycsIHN0b3ApXG4gICAgICAub24oaW5wdXQsICdtb3VzZWRvd24nLCBzdG9wKTtcblxuICAgIGZvcm0uYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG4gICAgdmFyIHN1Ym1pdEJ0biA9IHRoaXMuX3N1Ym1pdEJ0biA9IEwuRG9tVXRpbC5jcmVhdGUoJ2J1dHRvbicsICdsZWFmbGV0LXN1Ym1pdC1idG4gc2VhcmNoJyk7XG4gICAgc3VibWl0QnRuLnR5cGUgPSBcInN1Ym1pdFwiO1xuXG4gICAgTC5Eb21FdmVudFxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ2NsaWNrJywgc3RvcClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdtb3VzZWRvd24nLCBzdG9wKVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ2NsaWNrJywgdGhpcy5fZG9TZWFyY2gsIHRoaXMpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZChzdWJtaXRCdG4pO1xuXG4gICAgdGhpcy5fYnRuVGV4dENvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ3NwYW4nLCAndGV4dCcpO1xuICAgIHRoaXMuX2J0blRleHRDb250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5fbWFwLm9wdGlvbnMudGV4dC5zdWJtaXRMb2FkQnRuO1xuICAgIHN1Ym1pdEJ0bi5hcHBlbmRDaGlsZCh0aGlzLl9idG5UZXh0Q29udGFpbmVyKTtcblxuICAgIHRoaXMuX3NwaW5JY29uID0gTC5Eb21VdGlsLmNyZWF0ZSgnaScsICdmYSBmYS1yZWZyZXNoIGZhLXNwaW4nKTtcbiAgICBzdWJtaXRCdG4uYXBwZW5kQ2hpbGQodGhpcy5fc3Bpbkljb24pO1xuXG4gICAgTC5Eb21FdmVudC5vbihmb3JtLCAnc3VibWl0Jywgc3RvcCkub24oZm9ybSwgJ3N1Ym1pdCcsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgIHRoaXMuX21hcC5vbignbG9hZEJ0bk9wZW5lZCcsIHRoaXMuX2NvbGxhcHNlLCB0aGlzKTtcblxuICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoY29udGFpbmVyLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoY29udGFpbmVyLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcblxuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2J0bi1sZWFmbGV0LW1zZy1jb250YWluZXIgdGl0bGUtaGlkZGVuJyk7XG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5fbWFwLm9wdGlvbnMudGV4dC5zZWFyY2hMb2NhdGlvbjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcblxuICBfdG9nZ2xlICgpIHtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLl9pbnB1dC5mb2N1cygpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ3NlYXJjaEVuYWJsZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdzZWFyY2hEaXNhYmxlZCcpO1xuICAgIH1cbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfSxcblxuICBfY29sbGFwc2UgKCkge1xuICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl9pbnB1dC52YWx1ZSA9ICcnO1xuICB9LFxuXG4gIF9ub21pbmF0aW1DYWxsYmFjayAocmVzdWx0cykge1xuXG4gICAgaWYgKHRoaXMuX3Jlc3VsdHMgJiYgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLl9yZXN1bHRzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fcmVzdWx0cyk7XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdHNDb250YWluZXIgPSB0aGlzLl9yZXN1bHRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAnODBweCc7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1kgPSAnYXV0byc7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1ggPSAnaGlkZGVuJztcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd3aGl0ZSc7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5tYXJnaW4gPSAnM3B4JztcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLnBhZGRpbmcgPSAnMnB4JztcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLmJvcmRlciA9ICcycHggZ3JleSBzb2xpZCc7XG4gICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnMnB4JztcblxuICAgIEwuRG9tRXZlbnQub24ocmVzdWx0c0NvbnRhaW5lciwgJ21vdXNlZG93bicsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcbiAgICBMLkRvbUV2ZW50Lm9uKHJlc3VsdHNDb250YWluZXIsICdtb3VzZXdoZWVsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xuICAgIEwuRG9tRXZlbnQub24ocmVzdWx0c0NvbnRhaW5lciwgJ0RPTU1vdXNlU2Nyb2xsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xuICAgIEwuRG9tRXZlbnQub24ocmVzdWx0c0NvbnRhaW5lciwgJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG5cbiAgICB2YXIgZGl2UmVzdWx0cyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGl2ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ3NlYXJjaC1yZXN1bHRzLWVsJyk7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gcmVzdWx0c1tpXS5kaXNwbGF5X25hbWU7XG4gICAgICBkaXYudGl0bGUgPSByZXN1bHRzW2ldLmRpc3BsYXlfbmFtZTtcbiAgICAgIHJlc3VsdHNDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgdmFyIGNhbGxiYWNrID0gKGZ1bmN0aW9uIChtYXAsIHJlc3VsdCwgZGl2RWwpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRpdlJlc3VsdHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhkaXZSZXN1bHRzW2pdLCAnc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKGRpdkVsLCAnc2VsZWN0ZWQnKTtcblxuICAgICAgICAgIHZhciBiYm94ID0gcmVzdWx0LmJvdW5kaW5nYm94O1xuICAgICAgICAgIG1hcC5maXRCb3VuZHMoTC5sYXRMbmdCb3VuZHMoW1tiYm94WzBdLCBiYm94WzJdXSwgW2Jib3hbMV0sIGJib3hbM11dXSkpO1xuICAgICAgICB9XG4gICAgICB9KHRoaXMuX21hcCwgcmVzdWx0c1tpXSwgZGl2KSk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG4gICAgICBMLkRvbUV2ZW50Lm9uKGRpdiwgJ21vdXNld2hlZWwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG4gICAgICBMLkRvbUV2ZW50Lm9uKGRpdiwgJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG4gICAgICBMLkRvbUV2ZW50Lm9uKGRpdiwgJ0RPTU1vdXNlU2Nyb2xsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIC5vbihkaXYsICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgZGl2UmVzdWx0cy5wdXNoKGRpdik7XG4gICAgfVxuXG4gICAgdGhpcy5fZm9ybS5hcHBlbmRDaGlsZChyZXN1bHRzQ29udGFpbmVyKTtcblxuICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgIH1cbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fc3VibWl0QnRuLCAnbG9hZGluZycpO1xuICB9LFxuXG4gIF9jYWxsYmFja0lkOiAwLFxuXG4gIF9kb1NlYXJjaCAoKSB7XG5cbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fc3VibWl0QnRuLCAnbG9hZGluZycpO1xuXG4gICAgdmFyIGNhbGxiYWNrID0gJ19sX29zbWdlb2NvZGVyXycgKyB0aGlzLl9jYWxsYmFja0lkKys7XG4gICAgd2luZG93W2NhbGxiYWNrXSA9IEwuVXRpbC5iaW5kKHRoaXMuX25vbWluYXRpbUNhbGxiYWNrLCB0aGlzKTtcbiAgICB2YXIgcXVlcnlQYXJhbXMgPSB7XG4gICAgICBxOiB0aGlzLl9pbnB1dC52YWx1ZSxcbiAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgbGltaXQ6IDEwLFxuICAgICAgJ2pzb25fY2FsbGJhY2snOiBjYWxsYmFja1xuICAgIH07XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lbWFpbClcbiAgICAgIHF1ZXJ5UGFyYW1zLmVtYWlsID0gdGhpcy5vcHRpb25zLmVtYWlsO1xuICAgIGlmICh0aGlzLl9tYXAuZ2V0Qm91bmRzKCkpXG4gICAgICBxdWVyeVBhcmFtcy52aWV3Ym94ID0gdGhpcy5fbWFwLmdldEJvdW5kcygpLnRvQkJveFN0cmluZygpO1xuICAgIHZhciB1cmwgPSAnaHR0cDovL25vbWluYXRpbS5vcGVuc3RyZWV0bWFwLm9yZy9zZWFyY2gnICsgTC5VdGlsLmdldFBhcmFtU3RyaW5nKHF1ZXJ5UGFyYW1zKTtcbiAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICBzY3JpcHQuc3JjID0gdXJsO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgfSxcbiAgX29uTW91c2VPdmVyICgpIHtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID09PSAnYmxvY2snKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IEwuQ2xhc3MuZXh0ZW5kKHtcbiAgX3RpbWU6IDIwMDAsXG4gIGluaXRpYWxpemUgKG1hcCwgdGV4dCwgdGltZSkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLl9wb3B1cFBhbmUgPSBtYXAuX3BhbmVzLnBvcHVwUGFuZTtcbiAgICB0aGlzLl90ZXh0ID0gJycgfHwgdGV4dDtcbiAgICB0aGlzLl9pc1N0YXRpYyA9IGZhbHNlO1xuICAgIHRoaXMuX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LXRvb2x0aXAnLCB0aGlzLl9wb3B1cFBhbmUpO1xuXG4gICAgdGhpcy5fcmVuZGVyKCk7XG5cbiAgICB0aGlzLl90aW1lID0gdGltZSB8fCB0aGlzLl90aW1lO1xuICB9LFxuXG4gIGRpc3Bvc2UgKCkge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIHRoaXMuX3BvcHVwUGFuZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgdGhpcy5fY29udGFpbmVyID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgJ3N0YXRpYycgKGlzU3RhdGljKSB7XG4gICAgdGhpcy5faXNTdGF0aWMgPSBpc1N0YXRpYyB8fCB0aGlzLl9pc1N0YXRpYztcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgX3JlbmRlciAoKSB7XG4gICAgdGhpcy5fY29udGFpbmVyLmlubmVySFRNTCA9IFwiPHNwYW4+XCIgKyB0aGlzLl90ZXh0ICsgXCI8L3NwYW4+XCI7XG4gIH0sXG4gIF91cGRhdGVQb3NpdGlvbiAobGF0bG5nKSB7XG4gICAgdmFyIHBvcyA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKSxcbiAgICAgIHRvb2x0aXBDb250YWluZXIgPSB0aGlzLl9jb250YWluZXI7XG5cbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICB0b29sdGlwQ29udGFpbmVyLnN0eWxlLnZpc2liaWxpdHkgPSAnaW5oZXJpdCc7XG4gICAgICBMLkRvbVV0aWwuc2V0UG9zaXRpb24odG9vbHRpcENvbnRhaW5lciwgcG9zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfc2hvd0Vycm9yIChsYXRsbmcpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1zaG93Jyk7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1lcnJvci10b29sdGlwJyk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGxhdGxuZyk7XG5cbiAgICBpZiAoIXRoaXMuX2lzU3RhdGljKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX3Nob3dJbmZvIChsYXRsbmcpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1zaG93Jyk7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1pbmZvLXRvb2x0aXAnKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24obGF0bG5nKTtcblxuICAgIGlmICghdGhpcy5faXNTdGF0aWMpIHtcbiAgICAgIHRoaXMuX21hcC5vbignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfaGlkZSAoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtaW5mby10b29sdGlwJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1lcnJvci10b29sdGlwJyk7XG4gICAgfVxuICAgIHRoaXMuX21hcC5vZmYoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICB0ZXh0ICh0ZXh0KSB7XG4gICAgdGhpcy5fdGV4dCA9IHRleHQgfHwgdGhpcy5fdGV4dDtcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfSxcbiAgc2hvdyAobGF0bG5nLCB0eXBlID0gJ2luZm8nKSB7XG5cbiAgICB0aGlzLnRleHQoKTtcblxuICAgIGlmKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGxhdGxuZyk7XG4gICAgfVxuICAgIGlmKHR5cGUgPT09ICdpbmZvJykge1xuICAgICAgdGhpcy5zaG93SW5mbyhsYXRsbmcpO1xuICAgIH1cbiAgfSxcbiAgc2hvd0luZm8gKGxhdGxuZykge1xuICAgIHRoaXMuX3Nob3dJbmZvKGxhdGxuZyk7XG5cbiAgICBpZiAodGhpcy5faGlkZUluZm9UaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5faGlkZUluZm9UaW1lb3V0KTtcbiAgICAgIHRoaXMuX2hpZGVJbmZvVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5faGlkZUluZm9UaW1lb3V0ID0gc2V0VGltZW91dChMLlV0aWwuYmluZCh0aGlzLmhpZGUsIHRoaXMpLCB0aGlzLl90aW1lKTtcbiAgfSxcbiAgc2hvd0Vycm9yIChsYXRsbmcpIHtcbiAgICB0aGlzLl9zaG93RXJyb3IobGF0bG5nKTtcblxuICAgIGlmICh0aGlzLl9oaWRlRXJyb3JUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5faGlkZUVycm9yVGltZW91dCk7XG4gICAgICB0aGlzLl9oaWRlRXJyb3JUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9oaWRlRXJyb3JUaW1lb3V0ID0gc2V0VGltZW91dChMLlV0aWwuYmluZCh0aGlzLmhpZGUsIHRoaXMpLCB0aGlzLl90aW1lKTtcbiAgfSxcbiAgaGlkZSAoKSB7XG4gICAgdGhpcy5faGlkZSgpO1xuICB9LFxuICBfb25Nb3VzZU1vdmUgKGUpIHtcbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihlLmxhdGxuZyk7XG4gIH0sXG4gIHNldFRpbWUgKHRpbWUpIHtcbiAgICBpZiAodGltZSkge1xuICAgICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgfVxuICB9XG59KTsiLCJpbXBvcnQgQnRuQ3RybCBmcm9tICcuL0J0bkNvbnRyb2wnO1xuXG5leHBvcnQgZGVmYXVsdCBCdG5DdHJsLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBldmVudE5hbWU6ICd0cmFzaEFkZGVkJyxcbiAgICBwcmVzc0V2ZW50TmFtZTogJ3RyYXNoQnRuUHJlc3NlZCdcbiAgfSxcbiAgX2J0bjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIG1hcC5vbigndHJhc2hBZGRlZCcsIChkYXRhKSA9PiB7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoZGF0YS5jb250cm9sLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgICBtYXAub24oJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0JywgdGhpcy5fYmluZEV2ZW50cywgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpzdGFydF9hZGRfbmV3X3BvbHlnb24nLCB0aGlzLl9iaW5kRXZlbnRzLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOnN0YXJ0X2FkZF9uZXdfaG9sZScsIHRoaXMuX2JpbmRFdmVudHMsIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX2NsZWFyJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfcG9seWdvbicsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOm1hcF9jbGVhcmVkJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG5cbiAgICAgIHRoaXMuX2Rpc2FibGVCdG4oKTtcbiAgICB9KTtcblxuICAgIHZhciBjb250YWluZXIgPSBCdG5DdHJsLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdidG4tbGVhZmxldC1tc2ctY29udGFpbmVyIHRpdGxlLWhpZGRlbicpO1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMuX21hcC5vcHRpb25zLnRleHQubG9hZEpzb247XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RpdGxlQ29udGFpbmVyKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9iaW5kRXZlbnRzICgpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKTtcblxuICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ2NsaWNrJywgdGhpcy5fb25QcmVzc0J0biwgdGhpcyk7XG4gIH0sXG4gIF9kaXNhYmxlQnRuICgpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKTtcblxuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIpO1xuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0KTtcbiAgICBMLkRvbUV2ZW50LnJlbW92ZUxpc3RlbmVyKHRoaXMuX2J0biwgJ2NsaWNrJywgdGhpcy5fb25QcmVzc0J0biwgdGhpcyk7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IG1hcC5nZXRTZWxlY3RlZE1Hcm91cCgpO1xuXG4gICAgaWYgKHNlbGVjdGVkTUdyb3VwID09PSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpICYmIHNlbGVjdGVkTUdyb3VwLmdldExheWVycygpWzBdLl9pc0ZpcnN0KSB7XG4gICAgICBtYXAuY2xlYXIoKTtcbiAgICAgIG1hcC5tb2RlKCdkcmF3Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkTUdyb3VwLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0ZWRNR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpwb2x5Z29uOmRlbGV0ZWQnKTtcbiAgICB9XG4gICAgdGhpcy5fb25Nb3VzZU91dCgpO1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9LFxuICBfb25Nb3VzZU92ZXIgKCkge1xuICAgIGlmICghTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJykpIHtcbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICB2YXIgbGF5ZXIgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmdldExheWVycygpWzBdO1xuICAgICAgaWYgKGxheWVyICYmIGxheWVyLl9pc0ZpcnN0KSB7XG4gICAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQucmVqZWN0Q2hhbmdlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQuZGVsZXRlU2VsZWN0ZWRFZGdlcztcbiAgICAgIH1cbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgIH1cbiAgfSxcbiAgX29uTW91c2VPdXQgKCkge1xuICAgIGlmICghTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJykpIHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IFNlYXJjaEJ0biBmcm9tICcuLi9leHRlbmRlZC9TZWFyY2hCdG4nO1xuaW1wb3J0IFRyYXNoQnRuIGZyb20gJy4uL2V4dGVuZGVkL1RyYXNoQnRuJztcbmltcG9ydCBMb2FkQnRuIGZyb20gJy4uL2V4dGVuZGVkL0xvYWRCdG4nO1xuaW1wb3J0IEJ0bkNvbnRyb2wgZnJvbSAnLi4vZXh0ZW5kZWQvQnRuQ29udHJvbCc7XG5pbXBvcnQgTXNnSGVscGVyIGZyb20gJy4uL2V4dGVuZGVkL01zZ0hlbHBlcic7XG5pbXBvcnQgbSBmcm9tICcuLi91dGlscy9tb2JpbGUnO1xuXG5pbXBvcnQgem9vbVRpdGxlIGZyb20gJy4uL3RpdGxlcy96b29tVGl0bGUnO1xuaW1wb3J0IGZ1bGxTY3JlZW5UaXRsZSBmcm9tICcuLi90aXRsZXMvZnVsbFNjcmVlblRpdGxlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuXG4gIHpvb21UaXRsZSh0aGlzKTtcbiAgZnVsbFNjcmVlblRpdGxlKHRoaXMpO1xuXG4gIGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdENvbnRyb2xMYXllcnMpIHtcbiAgICB2YXIgZ2dsID0gbmV3IEwuR29vZ2xlKCk7XG5cbiAgICB0aGlzLmFkZExheWVyKGdnbCk7XG5cbiAgICB0aGlzLl9jb250cm9sTGF5ZXJzID0gbmV3IEwuQ29udHJvbC5MYXllcnMoe1xuICAgICAgR29vZ2xlOiBnZ2wsXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbnRyb2wodGhpcy5fY29udHJvbExheWVycyk7XG4gIH1cblxuICB0aGlzLnRvdWNoWm9vbS5kaXNhYmxlKCk7XG4gIHRoaXMuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcblxuICAvL3RoaXMuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgdGhpcy5ib3hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5rZXlib2FyZC5kaXNhYmxlKCk7XG5cbiAgdmFyIGNvbnRyb2xzID0gdGhpcy5vcHRpb25zLmNvbnRyb2xzO1xuXG4gIGlmIChjb250cm9scykge1xuICAgIGlmIChjb250cm9scy5nZW9TZWFyY2gpIHtcbiAgICAgIHRoaXMuYWRkQ29udHJvbChuZXcgU2VhcmNoQnRuKCkpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX0J0bkNvbnRyb2wgPSBCdG5Db250cm9sO1xuXG4gIHZhciB0cmFzaEJ0biA9IG5ldyBUcmFzaEJ0bih7XG4gICAgYnRuczogW1xuICAgICAgeyBjbGFzc05hbWU6ICdmYSBmYS10cmFzaCcgfSxcbiAgICBdLFxuICB9KTtcblxuICBsZXQgbG9hZEJ0bjtcblxuICBpZiAoY29udHJvbHMgJiYgY29udHJvbHMubG9hZEJ0bikge1xuICAgIGxvYWRCdG4gPSBuZXcgTG9hZEJ0bih7XG4gICAgICBidG5zOiBbXG4gICAgICAgIHsgY2xhc3NOYW1lOiAnZmEgZmEtYXJyb3ctY2lyY2xlLW8tZG93biBsb2FkJyB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBtc2dIZWxwZXIgPSB0aGlzLm1zZ0hlbHBlciA9IG5ldyBNc2dIZWxwZXIoe1xuICAgIGRlZmF1bHRNc2c6IHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXAsXG4gIH0pO1xuXG4gIHRoaXMub24oJ21zZ0hlbHBlckFkZGVkJywgKCkgPT4ge1xuICAgIHZhciB0ZXh0ID0gdGhpcy5vcHRpb25zLnRleHQ7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsICgpID0+IHtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9TZWxlY3RFZGdlcywgbnVsbCwgZGF0YS5tYXJrZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnNlbGVjdGVkX21pZGRsZV9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzLCBudWxsLCBkYXRhLm1hcmtlcik7XG4gICAgICB9KTtcblxuICAgICAgLy8gb24gZWRpdCBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW1vdmUnKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2Vtb3ZlJywgKGRhdGEpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9EcmF3SW5uZXJFZGdlcywgbnVsbCwgZGF0YS5sYXllclBvaW50KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLmhpZGUoKTtcbiAgICAgICAgdGhpcy5fc3RvcmVkTGF5ZXJQb2ludCA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgLy8gb24gdmlldyBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW1vdmUnKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2Vtb3ZlJywgKGRhdGEpID0+IHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9FZGl0LCBudWxsLCBkYXRhLmxheWVyUG9pbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIuaGlkZSgpO1xuICAgICAgICB0aGlzLl9zdG9yZWRMYXllclBvaW50ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gaGlkZSBtc2dcbiAgICB0aGlzLm9mZignZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcpO1xuICAgIHRoaXMub24oJ2VkaXRvcjptYXJrZXJfbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICBtc2dIZWxwZXIuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gb24gc3RhcnQgZHJhdyBwb2x5Z29uXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmNsaWNrVG9Kb2luRWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICB9KTtcblxuICAgIC8vIGRibGNsaWNrIHRvIGpvaW5cbiAgICB0aGlzLm9mZignZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicpO1xuICAgIHRoaXMub24oJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgbXNnSGVscGVyLm1zZyh0ZXh0LmRibGNsaWNrVG9Kb2luRWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoZGF0YSkgPT4ge1xuICAgICAgaWYgKGRhdGEubWFya2VyKSB7XG4gICAgICAgIG1zZ0hlbHBlci5tc2codGhpcy5vcHRpb25zLnRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgICB0aGlzLm9uKCdlZGl0b3I6aW50ZXJzZWN0aW9uX2RldGVjdGVkJywgKGRhdGEpID0+IHtcbiAgICAgIC8vIG1zZ1xuICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgIG1zZ0hlbHBlci5tc2codGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uLCAnZXJyb3InLCAodGhpcy5fc3RvcmVkTGF5ZXJQb2ludCB8fCB0aGlzLmdldFNlbGVjdGVkTWFya2VyKCkpKTtcbiAgICAgICAgdGhpcy5fc3RvcmVkTGF5ZXJQb2ludCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtc2dIZWxwZXIuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLmdldFNlbGVjdGVkTWFya2VyKCk7XG5cbiAgICAgIGlmICghdGhpcy5oYXNMYXllcihzZWxlY3RlZE1hcmtlcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZWN0ZWRNYXJrZXIgJiYgIXNlbGVjdGVkTWFya2VyLl9tR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgICAvL3NldCBtYXJrZXIgc3R5bGVcbiAgICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgLy9zZXQgJ2Vycm9yJyBzdHlsZVxuICAgICAgICAgIHNlbGVjdGVkTWFya2VyLnNldEludGVyc2VjdGVkU3R5bGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3Jlc3RvcmUgc3R5bGVcbiAgICAgICAgICBzZWxlY3RlZE1hcmtlci5yZXNldFN0eWxlKCk7XG5cbiAgICAgICAgICAvL3Jlc3RvcmUgb3RoZXIgbWFya2VycyB3aGljaCBhcmUgYWxzbyBuZWVkIHRvIHJlc2V0IHN0eWxlXG4gICAgICAgICAgdmFyIG1hcmtlcnNUb1Jlc2V0ID0gc2VsZWN0ZWRNYXJrZXIuX21Hcm91cC5nZXRMYXllcnMoKS5maWx0ZXIoKGxheWVyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKGxheWVyLl9pY29uLCAnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBtYXJrZXJzVG9SZXNldC5tYXAoKG1hcmtlcikgPT4gbWFya2VyLnJlc2V0U3R5bGUoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgaWYgKCFtLmlzTW9iaWxlQnJvd3NlcigpKSB7XG4gICAgdGhpcy5hZGRDb250cm9sKG1zZ0hlbHBlcik7XG5cbiAgICBpZiAoY29udHJvbHMgJiYgY29udHJvbHMubG9hZEJ0bikge1xuICAgICAgdGhpcy5hZGRDb250cm9sKGxvYWRCdG4pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb250cm9scyAmJiBjb250cm9scy50cmFzaEJ0bikge1xuICAgIHRoaXMuYWRkQ29udHJvbCh0cmFzaEJ0bik7XG4gIH1cbn1cbiIsImltcG9ydCBtYXAgZnJvbSAnLi9tYXAnO1xuXG53aW5kb3cuTGVhZmxldEVkaXRvciA9IG1hcCgpOyIsImltcG9ydCBWaWV3R3JvdXAgZnJvbSAnLi92aWV3L2dyb3VwJztcbmltcG9ydCBFZGl0UG9seWdvbiBmcm9tICcuL2VkaXQvcG9seWdvbic7XG5pbXBvcnQgSG9sZXNHcm91cCBmcm9tICcuL2VkaXQvaG9sZXNHcm91cCc7XG5pbXBvcnQgRWRpdExpbmVHcm91cCBmcm9tICcuL2VkaXQvbGluZSc7XG5pbXBvcnQgRGFzaGVkRWRpdExpbmVHcm91cCBmcm9tICcuL2RyYXcvZGFzaGVkLWxpbmUnO1xuaW1wb3J0IERyYXdHcm91cCBmcm9tICcuL2RyYXcvZ3JvdXAnO1xuXG5pbXBvcnQgJy4vZWRpdC9tYXJrZXItZ3JvdXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHZpZXdHcm91cDogbnVsbCxcbiAgZWRpdEdyb3VwOiBudWxsLFxuICBlZGl0UG9seWdvbjogbnVsbCxcbiAgZWRpdE1hcmtlcnNHcm91cDogbnVsbCxcbiAgZWRpdExpbmVHcm91cDogbnVsbCxcbiAgZGFzaGVkRWRpdExpbmVHcm91cDogbnVsbCxcbiAgZWRpdEhvbGVNYXJrZXJzR3JvdXA6IG51bGwsXG4gIHNldExheWVycyAoKSB7XG4gICAgdGhpcy52aWV3R3JvdXAgPSBuZXcgVmlld0dyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRHcm91cCA9IG5ldyBEcmF3R3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdFBvbHlnb24gPSBuZXcgRWRpdFBvbHlnb24oW10pO1xuICAgIHRoaXMuZWRpdE1hcmtlcnNHcm91cCA9IG5ldyBMLk1hcmtlckdyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRMaW5lR3JvdXAgPSBuZXcgRWRpdExpbmVHcm91cChbXSk7XG4gICAgdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwID0gbmV3IERhc2hlZEVkaXRMaW5lR3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdEhvbGVNYXJrZXJzR3JvdXAgPSBuZXcgSG9sZXNHcm91cChbXSk7XG4gIH1cbn0iLCJpbXBvcnQgQmFzZSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IENvbnRyb2xzSG9vayBmcm9tICcuL2hvb2tzL2NvbnRyb2xzJztcblxuaW1wb3J0ICogYXMgbGF5ZXJzIGZyb20gJy4vbGF5ZXJzJztcbmltcG9ydCAqIGFzIG9wdHMgZnJvbSAnLi9vcHRpb25zJztcblxuaW1wb3J0ICcuL3V0aWxzL2FycmF5JztcblxuZnVuY3Rpb24gbWFwKHR5cGUpIHtcbiAgbGV0IEluc3RhbmNlID0gKHR5cGUgPT09ICdtYXBib3gnKSA/IEwubWFwYm94Lk1hcCA6IEwuTWFwO1xuICB2YXIgbWFwID0gSW5zdGFuY2UuZXh0ZW5kKCQuZXh0ZW5kKEJhc2UsIHtcbiAgICAkOiB1bmRlZmluZWQsXG4gICAgaW5pdGlhbGl6ZSAoaWQsIG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zLnRleHQpIHtcbiAgICAgICAgJC5leHRlbmQob3B0cy5vcHRpb25zLnRleHQsIG9wdGlvbnMudGV4dCk7XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLnRleHQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250cm9scyA9IG9wdGlvbnMuY29udHJvbHM7XG4gICAgICBpZiAoY29udHJvbHMpIHtcbiAgICAgICAgaWYgKGNvbnRyb2xzLnpvb20gPT09IGZhbHNlKSB7XG4gICAgICAgICAgb3B0aW9ucy56b29tQ29udHJvbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vaWYgKG9wdGlvbnMuZHJhd0xpbmVTdHlsZSkge1xuICAgICAgLy8gICQuZXh0ZW5kKG9wdHMub3B0aW9ucy5kcmF3TGluZVN0eWxlLCBvcHRpb25zLmRyYXdMaW5lU3R5bGUpO1xuICAgICAgLy8gIGRlbGV0ZSBvcHRpb25zLmRyYXdMaW5lU3R5bGU7XG4gICAgICAvL31cbiAgICAgIGlmIChvcHRpb25zLnN0eWxlKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnN0eWxlLmRyYXcpIHtcbiAgICAgICAgICAkLmV4dGVuZChvcHRzLm9wdGlvbnMuc3R5bGUuZHJhdywgb3B0aW9ucy5zdHlsZS5kcmF3KTtcbiAgICAgICAgfVxuICAgICAgICAvL2RlbGV0ZSBvcHRpb25zLnN0eWxlLmRyYXc7XG4gICAgICAgIGlmIChvcHRpb25zLnN0eWxlLnZpZXcpIHtcbiAgICAgICAgICAkLmV4dGVuZChvcHRzLm9wdGlvbnMuc3R5bGUudmlldywgb3B0aW9ucy5zdHlsZS52aWV3KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5zdHlsZS5zdGFydERyYXcpIHtcbiAgICAgICAgICAkLmV4dGVuZChvcHRzLm9wdGlvbnMuc3R5bGUuc3RhcnREcmF3LCBvcHRpb25zLnN0eWxlLnN0YXJ0RHJhdyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuc3R5bGUuZHJhd0xpbmUpIHtcbiAgICAgICAgICAkLmV4dGVuZChvcHRzLm9wdGlvbnMuc3R5bGUuZHJhd0xpbmUsIG9wdGlvbnMuc3R5bGUuZHJhd0xpbmUpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLnN0eWxlO1xuICAgICAgfVxuXG4gICAgICAkLmV4dGVuZCh0aGlzLm9wdGlvbnMsIG9wdHMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAvL0wuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdHMub3B0aW9ucyk7XG5cbiAgICAgIGlmICh0eXBlID09PSAnbWFwYm94Jykge1xuICAgICAgICBMLm1hcGJveC5NYXAucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBpZCwgdGhpcy5vcHRpb25zLm1hcGJveElkLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgTC5NYXAucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBpZCwgdGhpcy5vcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kID0gJCh0aGlzLl9jb250YWluZXIpO1xuXG4gICAgICBsYXllcnMuc2V0TGF5ZXJzKCk7XG5cbiAgICAgIHRoaXMuX2FkZExheWVycyhbXG4gICAgICAgIGxheWVycy52aWV3R3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdEdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRQb2x5Z29uXG4gICAgICAgICwgbGF5ZXJzLmVkaXRNYXJrZXJzR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdExpbmVHcm91cFxuICAgICAgICAsIGxheWVycy5kYXNoZWRFZGl0TGluZUdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRIb2xlTWFya2Vyc0dyb3VwXG4gICAgICBdKTtcblxuICAgICAgdGhpcy5fc2V0T3ZlcmxheXMob3B0aW9ucyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUb0RyYXcpIHtcbiAgICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBfc2V0T3ZlcmxheXMgKG9wdHMpIHtcbiAgICAgIHZhciBvdmVybGF5cyA9IG9wdHMub3ZlcmxheXM7XG5cbiAgICAgIGZvciAodmFyIGkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgdmFyIG9pID0gb3ZlcmxheXNbaV07XG4gICAgICAgIHRoaXMuX2NvbnRyb2xMYXllcnMuYWRkT3ZlcmxheShvaSwgaSk7XG4gICAgICAgIG9pLmFkZFRvKHRoaXMpO1xuICAgICAgICBvaS5icmluZ1RvQmFjaygpO1xuICAgICAgICBvaS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgb2kub24oJ21vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFZHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLnZpZXdHcm91cDtcbiAgICB9LFxuICAgIGdldEVHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRHcm91cDtcbiAgICB9LFxuICAgIGdldEVQb2x5Z29uICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdFBvbHlnb247XG4gICAgfSxcbiAgICBnZXRFTWFya2Vyc0dyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdE1hcmtlcnNHcm91cDtcbiAgICB9LFxuICAgIGdldEVMaW5lR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0TGluZUdyb3VwO1xuICAgIH0sXG4gICAgZ2V0REVMaW5lICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZGFzaGVkRWRpdExpbmVHcm91cDtcbiAgICB9LFxuICAgIGdldEVITWFya2Vyc0dyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdEhvbGVNYXJrZXJzR3JvdXA7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFBvbHlnb246ICgpID0+IHRoaXMuX3NlbGVjdGVkUG9seWdvbixcbiAgICBnZXRTZWxlY3RlZE1Hcm91cCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNR3JvdXA7XG4gICAgfVxuICB9KSk7XG5cbiAgbWFwLmFkZEluaXRIb29rKENvbnRyb2xzSG9vayk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFwOyIsImltcG9ydCBtIGZyb20gJy4vdXRpbHMvbW9iaWxlJztcblxudmFyIHNpemUgPSAxO1xudmFyIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuaWYgKG0uaXNNb2JpbGVCcm93c2VyKCkpIHtcbiAgc2l6ZSA9IDI7XG59XG5cbmV4cG9ydCB2YXIgZmlyc3RJY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uLWZpcnN0XCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplLCAxMCAqIHNpemVdXG59KTtcblxuZXhwb3J0IHZhciBpY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplLCAxMCAqIHNpemVdXG59KTtcblxuZXhwb3J0IHZhciBkcmFnSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvbi1kcmFnXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplICogMywgMTAgKiBzaXplICogM11cbn0pO1xuXG5leHBvcnQgdmFyIG1pZGRsZUljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplLCAxMCAqIHNpemVdXG5cbn0pO1xuXG4vLyBkaXNhYmxlIGhvdmVyIGljb24gdG8gc2ltcGxpZnlcblxuZXhwb3J0IHZhciBob3Zlckljb24gPSBpY29uIHx8IEwuZGl2SWNvbih7XG4gICAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uXCIsXG4gICAgaWNvblNpemU6IFsyICogNyAqIHNpemUsIDIgKiA3ICogc2l6ZV1cbiAgfSk7XG5cbmV4cG9ydCB2YXIgaW50ZXJzZWN0aW9uSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsyICogNyAqIHNpemUsIDIgKiA3ICogc2l6ZV1cbn0pOyIsInZhciB2aWV3Q29sb3IgPSAnIzAwRkZGRic7XG52YXIgZHJhd0NvbG9yID0gJyMwMEY4MDAnO1xudmFyIHdlaWdodCA9IDM7XG5cbmV4cG9ydCB2YXIgb3B0aW9ucyA9IHtcbiAgYWxsb3dJbnRlcnNlY3Rpb246IGZhbHNlLFxuICBhbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb246IGZhbHNlLCAvL3RvZG86IHVuZmluaXNoZWRcbiAgZm9yY2VUb0RyYXc6IHRydWUsXG4gIHRyYW5zbGF0aW9uczoge1xuICAgIHJlbW92ZVBvbHlnb246ICdyZW1vdmUgcG9seWdvbicsXG4gICAgcmVtb3ZlUG9pbnQ6ICdyZW1vdmUgcG9pbnQnXG4gIH0sXG4gIG92ZXJsYXlzOiB7fSxcbiAgZGVmYXVsdENvbnRyb2xMYXllcnM6IHRydWUsXG4gIHN0eWxlOiB7XG4gICAgdmlldzoge1xuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMixcbiAgICAgIGRhc2hBcnJheTogbnVsbCxcbiAgICAgIGNsaWNrYWJsZTogZmFsc2UsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgY29sb3I6IHZpZXdDb2xvcixcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfSxcbiAgICBkcmF3OiB7XG4gICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICBmaWxsT3BhY2l0eTogMC4yLFxuICAgICAgZGFzaEFycmF5OiAnNSwgMTAnLFxuICAgICAgY2xpY2thYmxlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiBkcmF3Q29sb3IsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH0sXG4gICAgc3RhcnREcmF3OiB7fSxcbiAgICBkcmF3TGluZToge1xuICAgICAgb3BhY2l0eTogMC43LFxuICAgICAgZmlsbDogZmFsc2UsXG4gICAgICBmaWxsQ29sb3I6IGRyYXdDb2xvcixcbiAgICAgIGNvbG9yOiBkcmF3Q29sb3IsXG4gICAgICB3ZWlnaHQ6IHdlaWdodCxcbiAgICAgIGRhc2hBcnJheTogJzUsIDEwJyxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGNsaWNrYWJsZTogZmFsc2VcbiAgICB9XG4gIH0sXG4gIG1hcmtlckljb246IHVuZGVmaW5lZCxcbiAgbWFya2VySG92ZXJJY29uOiB1bmRlZmluZWQsXG4gIGVycm9yTGluZVN0eWxlOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHdlaWdodDogMyxcbiAgICBvcGFjaXR5OiAxLFxuICAgIHNtb290aEZhY3RvcjogMVxuICB9LFxuICBwcmV2aWV3RXJyb3JMaW5lU3R5bGU6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgd2VpZ2h0OiAzLFxuICAgIG9wYWNpdHk6IDEsXG4gICAgc21vb3RoRmFjdG9yOiAxLFxuICAgIGRhc2hBcnJheTogJzUsIDEwJ1xuICB9LFxuICB0ZXh0OiB7XG4gICAgaW50ZXJzZWN0aW9uOiAnU2VsZi1pbnRlcnNlY3Rpb24gaXMgcHJvaGliaXRlZCcsXG4gICAgZGVsZXRlUG9pbnRJbnRlcnNlY3Rpb246ICdEZWxldGlvbiBvZiBwb2ludCBpcyBub3QgcG9zc2libGUuIFNlbGYtaW50ZXJzZWN0aW9uIGlzIHByb2hpYml0ZWQnLFxuICAgIHJlbW92ZVBvbHlnb246ICdSZW1vdmUgcG9seWdvbicsXG4gICAgY2xpY2tUb0VkaXQ6ICdjbGljayB0byBlZGl0JyxcbiAgICBjbGlja1RvQWRkTmV3RWRnZXM6ICc8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz1cXCdtLWVkaXRvci1taWRkbGUtZGl2LWljb24gc3RhdGljIGdyb3VwLXNlbGVjdGVkXFwnPjwvZGl2PiZuYnNwOyZuYnNwO3RvIGFkZCBuZXcgZWRnZXM8L2Rpdj4nLFxuICAgIGNsaWNrVG9EcmF3SW5uZXJFZGdlczogJ2NsaWNrIHRvIGRyYXcgaW5uZXIgZWRnZXMnLFxuICAgIGNsaWNrVG9Kb2luRWRnZXM6ICdjbGljayB0byBqb2luIGVkZ2VzJyxcbiAgICBjbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlczogJzxkaXY+Y2xpY2smbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDs8ZGl2IGNsYXNzPVxcJ20tZWRpdG9yLWRpdi1pY29uIHN0YXRpYyBncm91cC1zZWxlY3RlZFxcJz48L2Rpdj4mbmJzcDsmbmJzcDt0byByZW1vdmUgZWRnZSZuYnNwOyZuYnNwO29yPGJyPmNsaWNrJm5ic3A7Jm5ic3A7PGkgY2xhc3M9XFwnZmEgZmEtdHJhc2hcXCc+PC9pPiZuYnNwOyZuYnNwO3RvIHJlbW92ZSBhbGwgc2VsZWN0ZWQgZWRnZXM8L2Rpdj4nLFxuICAgIGNsaWNrVG9TZWxlY3RFZGdlczogJzxkaXY+Y2xpY2smbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDs8ZGl2IGNsYXNzPVxcJ20tZWRpdG9yLWRpdi1pY29uIHN0YXRpY1xcJz48L2Rpdj4mbmJzcDsvJm5ic3A7PGRpdiBjbGFzcz1cXCdtLWVkaXRvci1taWRkbGUtZGl2LWljb24gc3RhdGljXFwnPjwvZGl2PiZuYnNwOyZuYnNwO3RvIHNlbGVjdCBlZGdlczwvZGl2PicsXG4gICAgZGJsY2xpY2tUb0pvaW5FZGdlczogJ2RvdWJsZSBjbGljayB0byBqb2luIGVkZ2VzJyxcbiAgICBjbGlja1RvU3RhcnREcmF3UG9seWdvbk9uTWFwOiAnY2xpY2sgdG8gc3RhcnQgZHJhdyBwb2x5Z29uIG9uIG1hcCcsXG4gICAgZGVsZXRlU2VsZWN0ZWRFZGdlczogJ2RlbGV0ZWQgc2VsZWN0ZWQgZWRnZXMnLFxuICAgIHJlamVjdENoYW5nZXM6ICdyZWplY3QgY2hhbmdlcycsXG4gICAganNvbldhc0xvYWRlZDogJ0pTT04gd2FzIGxvYWRlZCcsXG4gICAgY2hlY2tKc29uOiAnY2hlY2sgSlNPTicsXG4gICAgbG9hZEpzb246ICdsb2FkIEdlb0pTT04nLFxuICAgIGZvcmdldFRvU2F2ZTogJ1NhdmUgY2hhbmdlcyBieSBwcmVzc2luZyBvdXRzaWRlIG9mIHBvbHlnb24nLFxuICAgIHNlYXJjaExvY2F0aW9uOiAnU2VhcmNoIGxvY2F0aW9uJyxcbiAgICBzdWJtaXRMb2FkQnRuOiAnc3VibWl0JyxcbiAgICB6b29tOiAnWm9vbScsXG4gICAgaGlkZUZ1bGxTY3JlZW46ICdIaWRlIGZ1bGwgc2NyZWVuJyxcbiAgICBzaG93RnVsbFNjcmVlbjogJ1Nob3cgZnVsbCBzY3JlZW4nXG4gIH0sXG4gIHdvcmxkQ29weUp1bXA6IHRydWVcbn07XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAobWFwKSB7XG4gIGlmICghbWFwLm9wdGlvbnMuZnVsbHNjcmVlbkNvbnRyb2wpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbGluayA9IG1hcC5mdWxsc2NyZWVuQ29udHJvbC5saW5rO1xuICBsaW5rLnRpdGxlID0gXCJcIjtcbiAgTC5Eb21VdGlsLmFkZENsYXNzKGxpbmssICdmdWxsLXNjcmVlbicpO1xuXG4gIG1hcC5vZmYoJ2Z1bGxzY3JlZW5jaGFuZ2UnKTtcbiAgbWFwLm9uKCdmdWxsc2NyZWVuY2hhbmdlJywgKCkgPT4ge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuXG4gICAgaWYgKG1hcC5pc0Z1bGxzY3JlZW4oKSkge1xuICAgICAgbWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC5oaWRlRnVsbFNjcmVlbjtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC5zaG93RnVsbFNjcmVlbjtcbiAgICB9XG4gIH0sIHRoaXMpO1xuXG4gIHZhciBmdWxsU2NyZWVuQ29udGFpbmVyID0gbWFwLmZ1bGxzY3JlZW5Db250cm9sLl9jb250YWluZXI7XG5cbiAgbWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnYnRuLWxlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgbWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC5zaG93RnVsbFNjcmVlbjtcbiAgZnVsbFNjcmVlbkNvbnRhaW5lci5hcHBlbmRDaGlsZChtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lcik7XG5cbiAgdmFyIF9vbk1vdXNlT3ZlciA9ICgpID0+IHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MobWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfTtcbiAgdmFyIF9vbk1vdXNlT3V0ID0gKCkgPT4ge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhtYXAuX3RpdGxlRnVsbFNjcmVlbkNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9O1xuXG4gIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoZnVsbFNjcmVlbkNvbnRhaW5lciwgJ21vdXNlb3ZlcicsIF9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoZnVsbFNjcmVlbkNvbnRhaW5lciwgJ21vdXNlb3V0JywgX29uTW91c2VPdXQsIHRoaXMpO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChtYXApIHtcbiAgdmFyIGNvbnRyb2xzID0gbWFwLm9wdGlvbnMuY29udHJvbHM7XG4gIGlmIChjb250cm9scyAmJiAhY29udHJvbHMuem9vbSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKCFtYXAuem9vbUNvbnRyb2wpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgem9vbUNvbnRhaW5lciA9IG1hcC56b29tQ29udHJvbC5fY29udGFpbmVyO1xuICBtYXAuX3RpdGxlWm9vbUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdidG4tbGVhZmxldC1tc2ctY29udGFpbmVyIHpvb20gdGl0bGUtaGlkZGVuJyk7XG4gIG1hcC5fdGl0bGVab29tQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQuem9vbTtcbiAgem9vbUNvbnRhaW5lci5hcHBlbmRDaGlsZChtYXAuX3RpdGxlWm9vbUNvbnRhaW5lcik7XG5cbiAgdmFyIF9vbk1vdXNlT3Zlclpvb20gPSAoKSA9PiB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKG1hcC5fdGl0bGVab29tQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH07XG4gIHZhciBfb25Nb3VzZU91dFpvb20gPSAoKSA9PiB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKG1hcC5fdGl0bGVab29tQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH07XG5cbiAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih6b29tQ29udGFpbmVyLCAnbW91c2VvdmVyJywgX29uTW91c2VPdmVyWm9vbSwgdGhpcyk7XG4gIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoem9vbUNvbnRhaW5lciwgJ21vdXNlb3V0JywgX29uTW91c2VPdXRab29tLCB0aGlzKTtcblxuICBtYXAuem9vbUNvbnRyb2wuX3pvb21JbkJ1dHRvbi50aXRsZSA9IFwiXCI7XG4gIG1hcC56b29tQ29udHJvbC5fem9vbU91dEJ1dHRvbi50aXRsZSA9IFwiXCI7XG59IiwiQXJyYXkucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICB0aGlzLnNwbGljZSh0bywgMCwgdGhpcy5zcGxpY2UoZnJvbSwgMSlbMF0pO1xufTtcbkFycmF5LnByb3RvdHlwZS5fZWFjaCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBmdW5jLmNhbGwodGhpcywgdGhpc1tpXSwgaSk7XG4gIH1cbn07XG5leHBvcnQgZGVmYXVsdCBBcnJheTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgaXNNb2JpbGVCcm93c2VyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNoZWNrID0gZmFsc2U7XG4gICAgKGZ1bmN0aW9uIChhKSB7XG4gICAgICBpZiAoLyhhbmRyb2lkfGJiXFxkK3xtZWVnbykuK21vYmlsZXxhdmFudGdvfGJhZGFcXC98YmxhY2tiZXJyeXxibGF6ZXJ8Y29tcGFsfGVsYWluZXxmZW5uZWN8aGlwdG9wfGllbW9iaWxlfGlwKGhvbmV8b2QpfGlyaXN8a2luZGxlfGxnZSB8bWFlbW98bWlkcHxtbXB8bW9iaWxlLitmaXJlZm94fG5ldGZyb250fG9wZXJhIG0ob2J8aW4paXxwYWxtKCBvcyk/fHBob25lfHAoaXhpfHJlKVxcL3xwbHVja2VyfHBvY2tldHxwc3B8c2VyaWVzKDR8NikwfHN5bWJpYW58dHJlb3x1cFxcLihicm93c2VyfGxpbmspfHZvZGFmb25lfHdhcHx3aW5kb3dzIGNlfHhkYXx4aWlub3xhbmRyb2lkfGlwYWR8cGxheWJvb2t8c2lsay9pLnRlc3QoYSkgfHwgLzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHNcXC0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8XFwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3XFwtKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG1cXC18Y2VsbHxjaHRtfGNsZGN8Y21kXFwtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjXFwtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnxcXC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoXFwtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmXFwtNXxnXFwtbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZFxcLShtfHB8dCl8aGVpXFwtfGhpKHB0fHRhKXxocCggaXxpcCl8aHNcXC1jfGh0KGMoXFwtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aVxcLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHxcXC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Y1xcLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHxcXC1bYS13XSl8bGlid3xseW54fG0xXFwtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG1cXC1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dChcXC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKVxcLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8XFwtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuXFwtMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0XFwtZ3xxYVxcLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8XFwtWzItN118aVxcLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGhcXC18b298cFxcLSl8c2RrXFwvfHNlKGMoXFwtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaFxcLXxzaGFyfHNpZShcXC18bSl8c2tcXC0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGhcXC18dlxcLXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbFxcLXx0ZGdcXC18dGVsKGl8bSl8dGltXFwtfHRcXC1tb3x0byhwbHxzaCl8dHMoNzB8bVxcLXxtM3xtNSl8dHhcXC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXxcXC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKFxcLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhc1xcLXx5b3VyfHpldG98enRlXFwtL2kudGVzdChhLnN1YnN0cigwLCA0KSkpIHtcbiAgICAgICAgY2hlY2sgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pKG5hdmlnYXRvci51c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnZlbmRvciB8fCB3aW5kb3cub3BlcmEpO1xuICAgIHJldHVybiBjaGVjaztcbiAgfVxufTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob2JqZWN0ID0ge30sIGFycmF5ID0gW10pIHtcbiAgdmFyIHJzbHQgPSBvYmplY3Q7XG5cbiAgdmFyIHRtcDtcbiAgdmFyIF9mdW5jID0gZnVuY3Rpb24gKGlkLCBpbmRleCkge1xuICAgIHZhciBwb3NpdGlvbiA9IHJzbHRbaWRdLnBvc2l0aW9uO1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocG9zaXRpb24gIT09IGluZGV4KSB7XG4gICAgICAgIHRtcCA9IHJzbHRbaWRdO1xuICAgICAgICByc2x0W2lkXSA9IHJzbHRbYXJyYXlbcG9zaXRpb25dXTtcbiAgICAgICAgcnNsdFthcnJheVtwb3NpdGlvbl1dID0gdG1wO1xuICAgICAgfVxuXG4gICAgICBpZiAocG9zaXRpb24gIT0gaW5kZXgpIHtcbiAgICAgICAgX2Z1bmMuY2FsbChudWxsLCBpZCwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgYXJyYXkuZm9yRWFjaChfZnVuYyk7XG5cbiAgcmV0dXJuIHJzbHQ7XG59OyIsImV4cG9ydCBkZWZhdWx0IEwuTXVsdGlQb2x5Z29uLmV4dGVuZCh7XG4gIGluaXRpYWxpemUgKGxhdGxuZ3MsIG9wdGlvbnMpIHtcbiAgICBMLk11bHRpUG9seWdvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZ3MsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5vbignbGF5ZXJhZGQnLCAoZSkgPT4ge1xuICAgICAgdmFyIG1WaWV3U3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5zdHlsZS52aWV3O1xuICAgICAgZS50YXJnZXQuc2V0U3R5bGUoJC5leHRlbmQoe1xuICAgICAgICBvcGFjaXR5OiAwLjcsXG4gICAgICAgIGZpbGxPcGFjaXR5OiAwLjM1LFxuICAgICAgICBjb2xvcjogJyMwMEFCRkYnXG4gICAgICB9LCBtVmlld1N0eWxlKSk7XG5cbiAgICAgIHRoaXMuX21hcC5fbW92ZUVQb2x5Z29uT25Ub3AoKTtcbiAgICB9KTtcbiAgfSxcbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLk11bHRpUG9seWdvbi5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgdGhpcy5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW1vdmUnLCB7IGxheWVyUG9pbnQ6IGUubGF5ZXJQb2ludCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlbW92ZScsIHsgbGF5ZXJQb2ludDogZS5sYXllclBvaW50IH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgb25DbGljayAoZSkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gbWFwLmdldFNlbGVjdGVkTUdyb3VwKCk7XG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgIGlmICgoZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpICYmIGVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkgJiYgIWVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB8fFxuICAgICAgKHNlbGVjdGVkTUdyb3VwICYmIHNlbGVjdGVkTUdyb3VwLmdldEZpcnN0KCkgJiYgc2VsZWN0ZWRNR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkgJiYgIXNlbGVjdGVkTUdyb3VwLmlzRW1wdHkoKSkpIHtcbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGVNYXJrZXJzR3JvdXAuc2V0KGUubGF0bG5nKTtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChlTWFya2Vyc0dyb3VwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcmVzZXRcbiAgICAgIGlmIChtYXAuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgbWFwLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcC5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9XG4gICAgICBtYXAuY2xlYXIoKTtcbiAgICAgIG1hcC5tb2RlKCdkcmF3Jyk7XG5cbiAgICAgIG1hcC5faGlkZVNlbGVjdGVkVkxheWVyKGUubGF5ZXIpO1xuXG4gICAgICBlTWFya2Vyc0dyb3VwLnJlc3RvcmUoZS5sYXllcik7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQoZU1hcmtlcnNHcm91cCk7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAuc2VsZWN0KCk7XG4gICAgfVxuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3ZlcicpO1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuXG4gICAgbWFwLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW1vdmUnKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gIH1cbn0pOyJdfQ==
