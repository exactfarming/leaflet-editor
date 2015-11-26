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
        debugger;
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

window.LeafletEditor = (0, _map2['default'])('mapbox');

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvYmFzZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9kcmF3L2Rhc2hlZC1saW5lLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZXZlbnRzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZ3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9ob2xlc0dyb3VwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvbGluZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L21hcmtlci1ncm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L21hcmtlci5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L3BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvQmFzZU1hcmtlckdyb3VwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0J0bkNvbnRyb2wuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTG9hZEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9Nc2dIZWxwZXIuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvUG9seWdvbi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9TZWFyY2hCdG4uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvVG9vbHRpcC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9UcmFzaEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9pbmRleC5tYXBib3guanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvbGF5ZXJzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL21hcC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9tYXJrZXItaWNvbnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvb3B0aW9ucy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy90aXRsZXMvZnVsbFNjcmVlblRpdGxlLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3RpdGxlcy96b29tVGl0bGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdXRpbHMvYXJyYXkuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdXRpbHMvbW9iaWxlLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL3NvcnRCeVBvc2l0aW9uLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3ZpZXcvZ3JvdXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OzswQkNBdUIsZUFBZTs7OzsyQkFDZCxnQkFBZ0I7Ozs7cUJBRXpCLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDdEIsaUJBQWUsRUFBRSxTQUFTO0FBQzFCLGlCQUFlLEVBQUUsU0FBUztBQUMxQixvQkFBa0IsRUFBRSxTQUFTO0FBQzdCLDJCQUF5QixFQUFFLEtBQUs7QUFDaEMsV0FBUyxFQUFFLE1BQU07QUFDakIsZ0JBQWMsRUFBRSxTQUFTO0FBQ3pCLG9CQUFrQixFQUFDLDhCQUFHO0FBQ3BCLFdBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztHQUM3QjtBQUNELG9CQUFrQixFQUFDLDRCQUFDLEtBQUssRUFBRTtBQUN6QixRQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztHQUM5QjtBQUNELHNCQUFvQixFQUFDLGdDQUFHO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO0dBQ2xDO0FBQ0QscUJBQW1CLEVBQUMsNkJBQUMsS0FBSyxFQUFFO0FBQzFCLFNBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFcEIsUUFBSSxDQUFDLEtBQUssRUFBRTtBQUNWLGFBQU87S0FDUjs7QUFFRCxRQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQzs7QUFFcEQsUUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLFNBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7R0FDekM7QUFDRCxxQkFBbUIsRUFBQywrQkFBK0I7UUFBOUIsS0FBSyx5REFBRyxJQUFJLENBQUMsZUFBZTs7QUFDL0MsUUFBSSxDQUFDLEtBQUssRUFBRTtBQUNWLGFBQU87S0FD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QUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLFNBQUcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRWxDLG1CQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDeEI7R0FDRjtBQUNELFVBQVEsRUFBQyxrQkFBQyxHQUFHLEVBQUU7QUFDYixRQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXJCLE9BQUcsQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUN6QyxPQUFHLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7R0FDekM7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEcmF3RXZlbnRzIGZyb20gJy4vZHJhdy9ldmVudHMnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcblxuZXhwb3J0IGRlZmF1bHQgJC5leHRlbmQoe1xuICBfc2VsZWN0ZWRNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX3NlbGVjdGVkVkxheWVyOiB1bmRlZmluZWQsXG4gIF9vbGRTZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkOiBmYWxzZSxcbiAgX21vZGVUeXBlOiAnZHJhdycsXG4gIF9jb250cm9sTGF5ZXJzOiB1bmRlZmluZWQsXG4gIF9nZXRTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkVkxheWVyO1xuICB9LFxuICBfc2V0U2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2NsZWFyU2VsZWN0ZWRWTGF5ZXIgKCkge1xuICAgIHRoaXMuX3NlbGVjdGVkVkxheWVyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfaGlkZVNlbGVjdGVkVkxheWVyIChsYXllcikge1xuICAgIGxheWVyLmJyaW5nVG9CYWNrKCk7XG5cbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vc2hvdyBsYXN0IGxheWVyXG4gICAgdGhpcy5fc2hvd1NlbGVjdGVkVkxheWVyKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgIC8vaGlkZVxuICAgIHRoaXMuX3NldFNlbGVjdGVkVkxheWVyKGxheWVyKTtcbiAgICBsYXllci5fcGF0aC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIH0sXG4gIF9zaG93U2VsZWN0ZWRWTGF5ZXIgKGxheWVyID0gdGhpcy5fc2VsZWN0ZWRWTGF5ZXIpIHtcbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcbiAgfSxcbiAgX2FkZEVHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgZUdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGlmICghbGF5ZXIuaXNFbXB0eSgpKSB7XG4gICAgICAgIHZhciBob2xlcyA9IGxheWVyLl9ob2xlcztcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgICAgICBsYXRsbmdzID0gW2xhdGxuZ3NdLmNvbmNhdChob2xlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZHcm91cC5hZGRMYXllcihMLnBvbHlnb24obGF0bG5ncykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfYWRkRVBvbHlnb25fVG9fVkdyb3VwICgpIHtcbiAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG5cbiAgICB2YXIgaG9sZXMgPSBlUG9seWdvbi5nZXRIb2xlcygpO1xuICAgIHZhciBsYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoIDw9IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gIH0sXG4gIF9zZXRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgc2VsZWN0ZWRWTGF5ZXIgPSB0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgaWYgKCFzZWxlY3RlZFZMYXllcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGVjdGVkVkxheWVyLl9sYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuICAgIHNlbGVjdGVkVkxheWVyLl9ob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIucmVkcmF3KCk7XG4gIH0sXG4gIF9jb252ZXJ0X0VHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLl9hZGRFR3JvdXBfVG9fVkdyb3VwKCk7XG4gIH0sXG4gIF9jb252ZXJ0VG9FZGl0IChncm91cCkge1xuICAgIGlmIChncm91cCBpbnN0YW5jZW9mIEwuTXVsdGlQb2x5Z29uKSB7XG4gICAgICB2YXIgZUdyb3VwID0gdGhpcy5nZXRFR3JvdXAoKTtcblxuICAgICAgZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAgIGdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG5cbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihsYXRsbmdzKTtcbiAgICAgICAgZWRpdFBvbHlnb24uYWRkVG8odGhpcyk7XG4gICAgICAgIGVHcm91cC5hZGRMYXllcihlZGl0UG9seWdvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBlR3JvdXA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NYXJrZXJHcm91cCkge1xuICAgICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgICAgdmFyIGxheWVycyA9IGdyb3VwLmdldExheWVycygpO1xuICAgICAgbGF5ZXJzID0gbGF5ZXJzLmZpbHRlcigobGF5ZXIpID0+ICFsYXllci5pc01pZGRsZSgpKTtcbiAgICAgIHZhciBwb2ludHNBcnJheSA9IGxheWVycy5tYXAoKGxheWVyKSA9PiBsYXllci5nZXRMYXRMbmcoKSk7XG5cbiAgICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG5cbiAgICAgIGlmIChob2xlcykge1xuICAgICAgICBwb2ludHNBcnJheSA9IFtwb2ludHNBcnJheV0uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cblxuICAgICAgZVBvbHlnb24uc2V0TGF0TG5ncyhwb2ludHNBcnJheSk7XG4gICAgICBlUG9seWdvbi5yZWRyYXcoKTtcblxuICAgICAgcmV0dXJuIGVQb2x5Z29uO1xuICAgIH1cbiAgfSxcbiAgX3NldE1vZGUgKHR5cGUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuc2V0U3R5bGUob3B0aW9ucy5zdHlsZVt0eXBlXSk7XG4gIH0sXG5cbiAgX2dldE1vZGVUeXBlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIF9zZXRNb2RlVHlwZSAodHlwZSkge1xuICAgIHRoaXMuJC5yZW1vdmVDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gICAgdGhpcy5fbW9kZVR5cGUgPSB0eXBlO1xuICAgIHRoaXMuJC5hZGRDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gIH0sXG4gIF9zZXRNYXJrZXJzR3JvdXBJY29uIChtYXJrZXJHcm91cCkge1xuICAgIHZhciBtSWNvbiA9IHRoaXMub3B0aW9ucy5tYXJrZXJJY29uO1xuICAgIHZhciBtSG92ZXJJY29uID0gdGhpcy5vcHRpb25zLm1hcmtlckhvdmVySWNvbjtcblxuICAgIHZhciBtb2RlID0gdGhpcy5fZ2V0TW9kZVR5cGUoKTtcbiAgICBpZiAobUljb24pIHtcbiAgICAgIGlmICghbUljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gbUljb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWNvbiA9IG1JY29uLm1vZGVbbW9kZV07XG4gICAgICAgIGlmIChpY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtSG92ZXJJY29uKSB7XG4gICAgICBpZiAoIW1Ib3Zlckljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBtSG92ZXJJY29uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGljb24gPSBtSG92ZXJJY29uW21vZGVdO1xuICAgICAgICBpZiAoaWNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiB8fCBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uO1xuXG4gICAgaWYgKG1vZGUgPT09IFwiYWZ0ZXJEcmF3XCIpIHtcbiAgICAgIG1hcmtlckdyb3VwLnVwZGF0ZVN0eWxlKCk7XG4gICAgfVxuICB9LFxuICBtb2RlICh0eXBlKSB7XG4gICAgdGhpcy5maXJlKHRoaXMuX21vZGVUeXBlICsgJ19ldmVudHNfZGlzYWJsZScpO1xuICAgIHRoaXMuZmlyZSh0eXBlICsgJ19ldmVudHNfZW5hYmxlJyk7XG5cbiAgICB0aGlzLl9zZXRNb2RlVHlwZSh0eXBlKTtcblxuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICAgIHR5cGUgPSB0aGlzW3R5cGVdKCkgfHwgdHlwZTtcbiAgICAgIHRoaXMuX3NldE1vZGUodHlwZSk7XG4gICAgfVxuICB9LFxuICBpc01vZGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIGRyYXcgKCkge1xuICAgIGlmICh0aGlzLmlzTW9kZSgnZWRpdCcpIHx8IHRoaXMuaXNNb2RlKCd2aWV3JykgfHwgdGhpcy5pc01vZGUoJ2FmdGVyRHJhdycpKSB7XG4gICAgICB0aGlzLl9jbGVhck1hcCgpO1xuXG4gICAgfVxuICAgIHRoaXMuX2JpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5fY2xlYXJNYXAoKTtcblxuICAgIHRoaXMubW9kZSgndmlldycpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICB0aGlzLl9jbGVhck1hcCgpO1xuICAgIHRoaXMuZmlyZSgnZWRpdG9yOm1hcF9jbGVhcmVkJyk7XG4gIH0sXG4gIGNsZWFyQWxsICgpIHtcbiAgICB0aGlzLm1vZGUoJ3ZpZXcnKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5jbGVhckxheWVycygpO1xuICB9LFxuICAvKipcbiAgICpcbiAgICogVGhlIG1haW4gaWRlYSBpcyB0byBzYXZlIEVQb2x5Z29uIHRvIFZHcm91cCB3aGVuOlxuICAgKiAxKSB1c2VyIGFkZCBuZXcgcG9seWdvblxuICAgKiAyKSB3aGVuIHVzZXIgZWRpdCBwb2x5Z29uXG4gICAqXG4gICAqICovXG4gICAgc2F2ZVN0YXRlICgpIHtcblxuICAgIHZhciBlUG9seWdvbiA9IF9tYXAuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmICghZVBvbHlnb24uaXNFbXB0eSgpKSB7XG4gICAgICAvL3RoaXMuZml0Qm91bmRzKGVQb2x5Z29uLmdldEJvdW5kcygpKTtcbiAgICAgIC8vdGhpcy5tc2dIZWxwZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmZvcmdldFRvU2F2ZSk7XG5cbiAgICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgdmFyIGdlb2pzb24gPSB0aGlzLmdldFZHcm91cCgpLnRvR2VvSlNPTigpO1xuICAgIGlmIChnZW9qc29uLmdlb21ldHJ5KSB7XG4gICAgICByZXR1cm4gZ2VvanNvbi5nZW9tZXRyeTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBnZXRTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTWFya2VyO1xuICB9LFxuICBjbGVhclNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLl9zZWxlY3RlZE1hcmtlcjtcbiAgICB2YXIgcHJldk1hcmtlciA9IHNlbGVjdGVkTWFya2VyLnByZXYoKTtcbiAgICB2YXIgbmV4dE1hcmtlciA9IHNlbGVjdGVkTWFya2VyLm5leHQoKTtcbiAgICB2YXIgbWlkbGVQcmV2TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIuX21pZGRsZVByZXY7XG4gICAgdmFyIG1pZGRsZU5leHRNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5fbWlkZGxlTmV4dDtcbiAgICBzZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGxlUHJldk1hcmtlcjtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGRsZU5leHRNYXJrZXI7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgcHJldk1hcmtlci5fbWlkZGxlTmV4dCA9IG51bGw7XG4gICAgbmV4dE1hcmtlci5fbWlkZGxlUHJldiA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVBvbHlnb24gKHBvbHlnb24pIHtcbiAgICAvL3RoaXMuZ2V0RUxpbmVHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3RoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuXG4gICAgcG9seWdvbi5jbGVhcigpO1xuXG4gICAgaWYgKHRoaXMuaXNNb2RlKCdhZnRlckRyYXcnKSkge1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhclNlbGVjdGVkTWFya2VyKCk7XG4gICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gIH0sXG4gIGNyZWF0ZUVkaXRQb2x5Z29uIChqc29uKSB7XG4gICAgdmFyIGdlb0pzb24gPSBMLmdlb0pzb24oanNvbik7XG5cbiAgICAvL2F2b2lkIHRvIGxvc2UgY2hhbmdlc1xuICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuXG4gICAgdmFyIGxheWVyID0gZ2VvSnNvbi5nZXRMYXllcnMoKVswXTtcblxuICAgIGlmIChsYXllcikge1xuICAgICAgdmFyIGxheWVycyA9IGxheWVyLmdldExheWVycygpO1xuICAgICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgX2wgPSBsYXllcnNbaV07XG4gICAgICAgIHZHcm91cC5hZGRMYXllcihfbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICB0aGlzLl9maXRWQm91bmRzKCk7XG4gIH0sXG4gIG1vdmVNYXJrZXIgKGxhdGxuZykge1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldFNlbGVjdGVkKCkuc2V0TGF0TG5nKGxhdGxuZyk7XG4gIH0sXG4gIF9maXRWQm91bmRzICgpIHtcbiAgICBpZiAodGhpcy5nZXRWR3JvdXAoKS5nZXRMYXllcnMoKS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMuZml0Qm91bmRzKHRoaXMuZ2V0Vkdyb3VwKCkuZ2V0Qm91bmRzKCksIHtwYWRkaW5nOiBbMzAsIDMwXX0pO1xuICAgICAgLy90aGlzLmludmFsaWRhdGVTaXplKCk7XG4gICAgfVxuICB9LFxuICBfY2xlYXJNYXAgKCkge1xuICAgIHRoaXMuZ2V0RUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5jbGVhcigpO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IHRoaXMuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcblxuICAgIGlmIChzZWxlY3RlZE1Hcm91cCkge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuX3Nob3dTZWxlY3RlZFZMYXllcigpO1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRWTGF5ZXIoKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcbiAgfSxcbiAgX2NsZWFyRXZlbnRzICgpIHtcbiAgICAvL3RoaXMuX3VuQmluZFZpZXdFdmVudHMoKTtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIF9hY3RpdmVFZGl0TGF5ZXI6IHVuZGVmaW5lZCxcbiAgX3NldEFjdGl2ZUVkaXRMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2dldEFjdGl2ZUVkaXRMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUVkaXRMYXllcjtcbiAgfSxcbiAgX2NsZWFyQWN0aXZlRWRpdExheWVyICgpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBudWxsO1xuICB9LFxuICBfc2V0RUhNYXJrZXJHcm91cCAoYXJyYXlMYXRMbmcpIHtcbiAgICB2YXIgaG9sZU1hcmtlckdyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuX2lzSG9sZSA9IHRydWU7XG5cbiAgICB0aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKGhvbGVNYXJrZXJHcm91cCk7XG5cbiAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgaG9sZU1hcmtlckdyb3VwLmFkZFRvKGVoTWFya2Vyc0dyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cExheWVycyA9IGVoTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgdmFyIGhHcm91cFBvcyA9IGVoTWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaG9sZU1hcmtlckdyb3VwLl9wb3NpdGlvbiA9IGhHcm91cFBvcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMYXRMbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHNldCBob2xlIG1hcmtlclxuICAgICAgaG9sZU1hcmtlckdyb3VwLnNldEhvbGVNYXJrZXIoYXJyYXlMYXRMbmdbaV0sIHVuZGVmaW5lZCwge30sIHtoR3JvdXA6IGhHcm91cFBvcywgaE1hcmtlcjogaX0pO1xuICAgIH1cblxuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgbGF5ZXJzLm1hcCgobGF5ZXIsIHBvc2l0aW9uKSA9PiB7XG4gICAgICBob2xlTWFya2VyR3JvdXAuX3NldE1pZGRsZU1hcmtlcnMobGF5ZXIsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgbGF5ZXJzID0gaG9sZU1hcmtlckdyb3VwLmdldExheWVycygpO1xuXG4gICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICBlUG9seWdvbi51cGRhdGVIb2xlUG9pbnQoaEdyb3VwUG9zLCBsYXllci5fX3Bvc2l0aW9uLCBsYXllci5fbGF0bG5nKTtcbiAgICB9KTtcblxuICAgIC8vZVBvbHlnb24uc2V0SG9sZSgpXG4gICAgcmV0dXJuIGhvbGVNYXJrZXJHcm91cDtcbiAgfSxcbiAgX21vdmVFUG9seWdvbk9uVG9wICgpIHtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgaWYgKGVQb2x5Z29uLl9jb250YWluZXIpIHtcbiAgICAgIHZhciBsYXN0Q2hpbGQgPSAkKGVQb2x5Z29uLl9jb250YWluZXIucGFyZW50Tm9kZSkuY2hpbGRyZW4oKS5sYXN0KCk7XG4gICAgICB2YXIgJGVQb2x5Z29uID0gJChlUG9seWdvbi5fY29udGFpbmVyKTtcbiAgICAgIGlmICgkZVBvbHlnb25bMF0gIT09IGxhc3RDaGlsZCkge1xuICAgICAgICAkZVBvbHlnb24uZGV0YWNoKCkuaW5zZXJ0QWZ0ZXIobGFzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc3RvcmVFUG9seWdvbiAocG9seWdvbikge1xuICAgIHBvbHlnb24gPSBwb2x5Z29uIHx8IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHNldCBtYXJrZXJzXG4gICAgdmFyIGxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcblxuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLnNldEFsbChsYXRsbmdzKTtcblxuICAgIC8vdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG5cbiAgICAvLyBzZXQgaG9sZSBtYXJrZXJzXG4gICAgdmFyIGhvbGVzID0gcG9seWdvbi5nZXRIb2xlcygpO1xuICAgIGlmIChob2xlcykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBob2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGdldENvbnRyb2xMYXllcnM6ICgpID0+IHRoaXMuX2NvbnRyb2xMYXllcnMsXG4gIGVkZ2VzSW50ZXJzZWN0ZWQgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCA9IHZhbHVlO1xuICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZmlyZShcImVkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWRcIiwge2ludGVyc2VjdGlvbjogdHJ1ZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7aW50ZXJzZWN0aW9uOiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2Vycm9yVGltZW91dDogbnVsbCxcbiAgX3Nob3dJbnRlcnNlY3Rpb25FcnJvciAodGV4dCkge1xuXG4gICAgaWYgKHRoaXMuX2Vycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Vycm9yVGltZW91dCk7XG4gICAgfVxuXG4gICAgdGhpcy5tc2dIZWxwZXIubXNnKHRleHQgfHwgdGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uLCAnZXJyb3InLCAodGhpcy5fc3RvcmVkTGF5ZXJQb2ludCB8fCB0aGlzLmdldFNlbGVjdGVkTWFya2VyKCkpKTtcblxuICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBudWxsO1xuXG4gICAgdGhpcy5fZXJyb3JUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm1zZ0hlbHBlci5oaWRlKCk7XG4gICAgfSwgMTAwMDApO1xuICB9XG59LCBEcmF3RXZlbnRzKTtcbiIsImltcG9ydCAqIGFzIG9wdHMgZnJvbSAnLi4vb3B0aW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IEwuUG9seWxpbmUuZXh0ZW5kKHtcbiAgb3B0aW9uczogb3B0cy5vcHRpb25zLnN0eWxlLmRyYXdMaW5lLFxuICBfbGF0bG5nVG9Nb3ZlOiB1bmRlZmluZWQsXG4gIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICAgIHRoaXMuc2V0U3R5bGUobWFwLm9wdGlvbnMuc3R5bGUuZHJhd0xpbmUpO1xuICB9LFxuICBhZGRMYXRMbmcgKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9sYXRsbmdUb01vdmUpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGF0bG5ncy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9sYXRsbmdzLnNwbGljZSgtMSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGF0bG5ncy5wdXNoKEwubGF0TG5nKGxhdGxuZykpO1xuXG4gICAgcmV0dXJuIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIHVwZGF0ZSAocG9zKSB7XG5cbiAgICBpZiAoIXRoaXMuX2xhdGxuZ1RvTW92ZSAmJiB0aGlzLl9sYXRsbmdzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlID0gTC5sYXRMbmcocG9zKTtcbiAgICAgIHRoaXMuX2xhdGxuZ3MucHVzaCh0aGlzLl9sYXRsbmdUb01vdmUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubGF0ID0gcG9zLmxhdDtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZS5sbmcgPSBwb3MubG5nO1xuXG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgX2FkZExpbmUgKGxpbmUsIGdyb3VwLCBpc0xhc3RNYXJrZXIpIHtcbiAgICBpZiAoIWlzTGFzdE1hcmtlcikge1xuICAgICAgbGluZS5hZGRUbyhncm91cCk7XG4gICAgfVxuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgfVxufSk7IiwiaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuZXhwb3J0IGRlZmF1bHQge1xuICBfYmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMuX3VuQmluZERyYXdFdmVudHMoKTtcblxuICAgIC8vIGNsaWNrIG9uIG1hcFxuICAgIHRoaXMub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBlLmxheWVyUG9pbnQ7XG4gICAgICAvLyBidWcgZml4XG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRYID09PSAwICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRZID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgTC5NYXJrZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IGUudGFyZ2V0LmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgICAgLy8gc3RhcnQgYWRkIG5ldyBwb2x5Z29uXG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuXG4gICAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOnN0YXJ0X2FkZF9uZXdfcG9seWdvbicpO1xuICAgICAgICB2YXIgc3RhcnREcmF3U3R5bGUgPSB0aGlzLm9wdGlvbnMuc3R5bGVbJ3N0YXJ0RHJhdyddO1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgaWYgKHN0YXJ0RHJhd1N0eWxlKSB7XG4gICAgICAgICAgdGhpcy5nZXRFUG9seWdvbigpLnNldFN0eWxlKHN0YXJ0RHJhd1N0eWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRWTGF5ZXIoKTtcblxuICAgICAgICB0aGlzLl9zZWxlY3RlZE1Hcm91cCA9IGVNYXJrZXJzR3JvdXA7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgcG9seWdvblxuICAgICAgdmFyIGZpcnN0TWFya2VyID0gZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpO1xuXG4gICAgICBpZiAoZmlyc3RNYXJrZXIgJiYgZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICghKGUudGFyZ2V0IGluc3RhbmNlb2YgTC5NYXJrZXIpKSB7XG4gICAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gc3RhcnQgZHJhdyBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgICB2YXIgbGFzdEhvbGUgPSBlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpO1xuICAgICAgaWYgKGZpcnN0TWFya2VyICYmICFmaXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKChlLnRhcmdldC5nZXRFUG9seWdvbigpLl9wYXRoID09IGUub3JpZ2luYWxFdmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgaWYgKCFsYXN0SG9sZSB8fCAhbGFzdEhvbGUuZ2V0Rmlyc3QoKSB8fCAhbGFzdEhvbGUuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTZWxlY3RlZE1hcmtlcigpO1xuXG4gICAgICAgICAgICB2YXIgbGFzdEhHcm91cCA9IGVoTWFya2Vyc0dyb3VwLmFkZEhvbGVHcm91cCgpO1xuICAgICAgICAgICAgbGFzdEhHcm91cC5zZXQoZS5sYXRsbmcsIG51bGwsIHsgaWNvbjogZmlyc3RJY29uIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZE1Hcm91cCA9IGxhc3RIR3JvdXA7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2VkaXRvcjpzdGFydF9hZGRfbmV3X2hvbGUnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBjb250aW51ZSB3aXRoIG5ldyBob2xlIHBvbHlnb25cbiAgICAgIGlmIChsYXN0SG9sZSAmJiAhbGFzdEhvbGUuaXNFbXB0eSgpICYmIGxhc3RIb2xlLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLl9pc01hcmtlckluUG9seWdvbihlLmxhdGxuZykpIHtcbiAgICAgICAgICB2YXIgbWFya2VyID0gZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKS5zZXQoZS5sYXRsbmcpO1xuICAgICAgICAgIHZhciByc2x0ID0gbWFya2VyLl9kZXRlY3RJbnRlcnNlY3Rpb24oKTsgLy8gaW4gY2FzZSBvZiBob2xlXG4gICAgICAgICAgaWYgKHJzbHQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuXG4gICAgICAgICAgICAvL21hcmtlci5fbUdyb3VwLnJlbW92ZU1hcmtlcihtYXJrZXIpOyAvL3RvZG86IGRldGVjdCBpbnRlcnNlY3Rpb24gZm9yIGhvbGVcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyByZXNldFxuXG4gICAgICBpZiAodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSkge1xuICAgICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZWRpdG9yOmpvaW5fcGF0aCcsIChlKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IGUubUdyb3VwO1xuXG4gICAgICBpZiAoIWVNYXJrZXJzR3JvdXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5faXNIb2xlKSB7XG4gICAgICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldExhc3RIb2xlKCk7XG4gICAgICB9XG4gICAgICAvLzEuIHNldCBtaWRkbGUgbWFya2Vyc1xuICAgICAgdmFyIGxheWVycyA9IGVNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IC0xO1xuICAgICAgbGF5ZXJzLmZvckVhY2goKCkgPT4ge1xuICAgICAgICB2YXIgbWFya2VyID0gZU1hcmtlcnNHcm91cC5hZGRNYXJrZXIocG9zaXRpb24sIG51bGwsIHsgaWNvbjogbWlkZGxlSWNvbiB9KTtcbiAgICAgICAgcG9zaXRpb24gPSBtYXJrZXIucG9zaXRpb24gKyAyO1xuICAgICAgfSk7XG5cbiAgICAgIC8vMi4gY2xlYXIgbGluZVxuICAgICAgZU1hcmtlcnNHcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgICBlTWFya2Vyc0dyb3VwLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgICAgbWFya2VyLmRyYWdnaW5nLmVuYWJsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAuc2VsZWN0KCk7XG5cbiAgICAgIC8vcmVzZXQgc3R5bGUgaWYgJ3N0YXJ0RHJhdycgd2FzIHVzZWRcbiAgICAgIHRoaXMuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZSh0aGlzLm9wdGlvbnMuc3R5bGUuZHJhdyk7XG5cbiAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOnBvbHlnb246Y3JlYXRlZCcpO1xuICAgIH0pO1xuXG4gICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG5cbiAgICB2R3JvdXAub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIHZHcm91cC5vbkNsaWNrKGUpO1xuXG4gICAgICB0aGlzLm1zZ0hlbHBlci5tc2codGhpcy5vcHRpb25zLnRleHQuY2xpY2tUb0RyYXdJbm5lckVkZ2VzLCBudWxsLCBlLmxheWVyUG9pbnQpO1xuICAgICAgdGhpcy5maXJlKCdlZGl0b3I6cG9seWdvbjpzZWxlY3RlZCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jb252ZXJ0VG9FZGl0KHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICB9KTtcbiAgICB0aGlzLm9uKCdlZGl0b3I6ZGVsZXRlX3BvbHlnb24nLCAoKSA9PiB7XG4gICAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH0sXG4gIF9hZGRNYXJrZXIgKGUpIHtcbiAgICB2YXIgbGF0bG5nID0gZS5sYXRsbmc7XG5cbiAgICB2YXIgZU1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgdmFyIG1hcmtlciA9IGVNYXJrZXJzR3JvdXAuc2V0KGxhdGxuZyk7XG5cbiAgICB0aGlzLl9jb252ZXJ0VG9FZGl0KGVNYXJrZXJzR3JvdXApO1xuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgX3VwZGF0ZURFTGluZSAobGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldERFTGluZSgpLnVwZGF0ZShsYXRsbmcpO1xuICB9LFxuICBfdW5CaW5kRHJhd0V2ZW50cyAoKSB7XG4gICAgdGhpcy5vZmYoJ2NsaWNrJyk7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5vZmYoJ2NsaWNrJyk7XG4gICAgLy90aGlzLm9mZignbW91c2VvdXQnKTtcbiAgICB0aGlzLm9mZignZGJsY2xpY2snKTtcblxuICAgIHRoaXMuZ2V0REVMaW5lKCkuY2xlYXIoKTtcblxuICAgIHRoaXMub2ZmKCdlZGl0b3I6am9pbl9wYXRoJyk7XG5cbiAgICBpZiAodGhpcy5fb3BlblBvcHVwKSB7XG4gICAgICB0aGlzLm9wZW5Qb3B1cCA9IHRoaXMuX29wZW5Qb3B1cDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9vcGVuUG9wdXA7XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMDtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgX3NlbGVjdGVkOiBmYWxzZSxcbiAgX2xhc3RIb2xlOiB1bmRlZmluZWQsXG4gIF9sYXN0SG9sZVRvRHJhdzogdW5kZWZpbmVkLFxuICBhZGRIb2xlR3JvdXAgKCkge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICB0aGlzLl9sYXN0SG9sZS5faXNIb2xlID0gdHJ1ZTtcbiAgICB0aGlzLl9sYXN0SG9sZS5hZGRUbyh0aGlzKTtcblxuICAgIHRoaXMuX2xhc3RIb2xlLnBvc2l0aW9uID0gdGhpcy5nZXRMZW5ndGgoKSAtIDE7XG5cbiAgICB0aGlzLl9sYXN0SG9sZVRvRHJhdyA9IHRoaXMuX2xhc3RIb2xlO1xuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RIb2xlO1xuICB9LFxuICBnZXRMZW5ndGggKCkge1xuICAgIHJldHVybiB0aGlzLmdldExheWVycygpLmxlbmd0aDtcbiAgfSxcbiAgcmVzZXRMYXN0SG9sZSAoKSB7XG4gICAgdGhpcy5fbGFzdEhvbGUgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIHNldExhc3RIb2xlIChsYXllcikge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gbGF5ZXI7XG4gIH0sXG4gIGdldExhc3RIb2xlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdEhvbGU7XG4gIH0sXG4gIHJlbW92ZSAoKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGhvbGUpID0+IHtcbiAgICAgIHdoaWxlIChob2xlLmdldExheWVycygpLmxlbmd0aCkge1xuICAgICAgICBob2xlLnJlbW92ZU1hcmtlckF0KDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICByZXBvcyAocG9zaXRpb24pIHtcbiAgICB0aGlzLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGlmIChsYXllci5wb3NpdGlvbiA+PSBwb3NpdGlvbikge1xuICAgICAgICBsYXllci5wb3NpdGlvbiAtPSAxO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICByZXNldFNlbGVjdGlvbiAoKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBsYXllci5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICAgIG1hcmtlci51blNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IGZhbHNlO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xuICAgIHVwZGF0ZSAoKSB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgICAgbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5fY29ubmVjdE1hcmtlcnMoKTtcbi8vICAgIG1hcC5nZXRFUG9seWdvbigpLnNldFN0eWxlKG1hcC5lZGl0U3R5bGVbbWFwLl9nZXRNb2RlVHlwZSgpXSk7XG4gICAgfVxuICB9KTsiLCJpbXBvcnQgQmFzZU1Hcm91cCBmcm9tICcuLi9leHRlbmRlZC9CYXNlTWFya2VyR3JvdXAnO1xuaW1wb3J0IEVkaXRNYXJrZXIgZnJvbSAnLi4vZWRpdC9tYXJrZXInO1xuaW1wb3J0IEVkaXRMaW5lR3JvdXAgZnJvbSAnLi4vZWRpdC9saW5lJztcbmltcG9ydCBEYXNoZWRFZGl0TGluZUdyb3VwIGZyb20gJy4uL2RyYXcvZGFzaGVkLWxpbmUnO1xuXG5pbXBvcnQgc29ydCBmcm9tICcuLi91dGlscy9zb3J0QnlQb3NpdGlvbic7XG5pbXBvcnQgKiBhcyBpY29ucyBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuXG5MLlV0aWwuZXh0ZW5kKEwuTGluZVV0aWwsIHtcbiAgLy8gQ2hlY2tzIHRvIHNlZSBpZiB0d28gbGluZSBzZWdtZW50cyBpbnRlcnNlY3QuIERvZXMgbm90IGhhbmRsZSBkZWdlbmVyYXRlIGNhc2VzLlxuICAvLyBodHRwOi8vY29tcGdlb20uY3MudWl1Yy5lZHUvfmplZmZlL3RlYWNoaW5nLzM3My9ub3Rlcy94MDYtc3dlZXBsaW5lLnBkZlxuICBzZWdtZW50c0ludGVyc2VjdCAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyLCAvKlBvaW50Ki8gcDMpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAsIHAyLCBwMykgIT09XG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocDEsIHAyLCBwMykgJiZcbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMSwgcDIpICE9PVxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAsIHAxLCBwMyk7XG4gIH0sXG5cbiAgLy8gY2hlY2sgdG8gc2VlIGlmIHBvaW50cyBhcmUgaW4gY291bnRlcmNsb2Nrd2lzZSBvcmRlclxuICBfY2hlY2tDb3VudGVyY2xvY2t3aXNlICgvKlBvaW50Ki8gcCwgLypQb2ludCovIHAxLCAvKlBvaW50Ki8gcDIpIHtcbiAgICByZXR1cm4gKHAyLnkgLSBwLnkpICogKHAxLnggLSBwLngpID4gKHAxLnkgLSBwLnkpICogKHAyLnggLSBwLngpO1xuICB9XG59KTtcblxubGV0IHR1cm5PZmZNb3VzZU1vdmUgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgTC5NYXJrZXJHcm91cCA9IEJhc2VNR3JvdXAuZXh0ZW5kKHtcbiAgX2lzSG9sZTogZmFsc2UsXG4gIF9lZGl0TGluZUdyb3VwOiB1bmRlZmluZWQsXG4gIF9wb3NpdGlvbjogdW5kZWZpbmVkLFxuICBkYXNoZWRFZGl0TGluZUdyb3VwOiBuZXcgRGFzaGVkRWRpdExpbmVHcm91cChbXSksXG4gIG9wdGlvbnM6IHtcbiAgICBtSWNvbjogdW5kZWZpbmVkLFxuICAgIG1Ib3Zlckljb246IHVuZGVmaW5lZFxuICB9LFxuICBpbml0aWFsaXplIChsYXllcnMpIHtcbiAgICBMLkxheWVyR3JvdXAucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXllcnMpO1xuXG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICAgIC8vdGhpcy5fYmluZEV2ZW50cygpO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5hZGRUbyhtYXApO1xuICB9LFxuICBfdXBkYXRlREVMaW5lIChsYXRsbmcpIHtcbiAgICB2YXIgZGVMaW5lID0gdGhpcy5nZXRERUxpbmUoKTtcbiAgICBpZiAodGhpcy5fZmlyc3RNYXJrZXIpIHtcbiAgICAgIGRlTGluZS51cGRhdGUobGF0bG5nKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlTGluZTtcbiAgfSxcbiAgX2FkZE1hcmtlciAobGF0bG5nKSB7XG4gICAgLy92YXIgZU1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgdGhpcy5zZXQobGF0bG5nKTtcbiAgICB0aGlzLmdldERFTGluZSgpLmFkZExhdExuZyhsYXRsbmcpO1xuXG4gICAgdGhpcy5fbWFwLl9jb252ZXJ0VG9FZGl0KHRoaXMpO1xuICB9LFxuICBnZXRERUxpbmUgKCkge1xuICAgIGlmICghdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwLl9tYXApIHtcbiAgICAgIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5hZGRUbyh0aGlzLl9tYXApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwO1xuICB9LFxuICBfc2V0SG92ZXJJY29uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuX29sZFNlbGVjdGVkTWFya2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIuX3Jlc2V0SWNvbih0aGlzLm9wdGlvbnMubUljb24pO1xuICAgIH1cbiAgICBtYXAuX3NlbGVjdGVkTWFya2VyLl9zZXRIb3Zlckljb24odGhpcy5vcHRpb25zLm1Ib3Zlckljb24pO1xuICB9LFxuICBfc29ydEJ5UG9zaXRpb24gKCkge1xuICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcblxuICAgICAgbGF5ZXJzID0gbGF5ZXJzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuX2xlYWZsZXRfaWQgLSBiLl9sZWFmbGV0X2lkO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBpZEFycmF5ID0gW107XG4gICAgICB2YXIgcG9zQXJyYXkgPSBbXTtcbiAgICAgIGxheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgICBpZEFycmF5LnB1c2gobGF5ZXIuX2xlYWZsZXRfaWQpO1xuICAgICAgICBwb3NBcnJheS5wdXNoKGxheWVyLl9fcG9zaXRpb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHNvcnQodGhpcy5fbGF5ZXJzLCBpZEFycmF5KTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZVN0eWxlICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBtYXJrZXIgPSBtYXJrZXJzW2ldO1xuICAgICAgbWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICAgIGlmIChtYXJrZXIgPT09IHRoaXMuX21hcC5fc2VsZWN0ZWRNYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fc2V0SG92ZXJJY29uKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXRTZWxlY3RlZCAobWFya2VyKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCAmJiB0aGlzLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLmdldExhc3QoKTtcbiAgICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIgPSBtYXAuX3NlbGVjdGVkTWFya2VyO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIgPSBtYXAuX3NlbGVjdGVkTWFya2VyO1xuICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSBtYXJrZXI7XG4gIH0sXG4gIHJlc2V0U2VsZWN0ZWQgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIpIHtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIuX3Jlc2V0SWNvbih0aGlzLm9wdGlvbnMubUljb24pO1xuICAgICAgbWFwLl9zZWxlY3RlZE1hcmtlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0sXG4gIGdldFNlbGVjdGVkICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgfSxcbiAgX3NldEZpcnN0IChtYXJrZXIpIHtcbiAgICB0aGlzLl9maXJzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB0aGlzLl9maXJzdE1hcmtlci5fc2V0Rmlyc3RJY29uKCk7XG4gIH0sXG4gIGdldEZpcnN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlyc3RNYXJrZXI7XG4gIH0sXG4gIGdldExhc3QgKCkge1xuICAgIGlmICh0aGlzLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuICAgICAgcmV0dXJuIGxheWVyc1tsYXllcnMubGVuZ3RoIC0gMV07XG4gICAgfVxuICB9LFxuICBoYXNGaXJzdE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3QoKSAmJiB0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpO1xuICB9LFxuICBjb252ZXJ0VG9MYXRMbmdzICgpIHtcbiAgICB2YXIgbGF0bG5ncyA9IFtdO1xuICAgIHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xuICAgICAgaWYgKCFsYXllci5pc01pZGRsZSgpKSB7XG4gICAgICAgIGxhdGxuZ3MucHVzaChsYXllci5nZXRMYXRMbmcoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxhdGxuZ3M7XG4gIH0sXG4gIHJlc3RvcmUgKGxheWVyKSB7XG4gICAgdGhpcy5zZXRBbGwobGF5ZXIuX2xhdGxuZ3MpO1xuICAgIHRoaXMuc2V0QWxsSG9sZXMobGF5ZXIuX2hvbGVzKTtcbiAgfSxcbiAgX2FkZCAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICBpZiAodGhpcy5fbWFwLmlzTW9kZSgnZHJhdycpKSB7XG4gICAgICBpZiAoIXRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICAgIG9wdGlvbnMuaWNvbiA9IGljb25zLmZpcnN0SWNvbjtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIHZhciBtYXJrZXIgPSB0aGlzLmFkZE1hcmtlcihsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKTtcblxuICAgIHRoaXMuZ2V0REVMaW5lKCkuYWRkTGF0TG5nKGxhdGxuZyk7XG5cbiAgICAvL3RoaXMuX21hcC5vZmYoJ21vdXNlbW92ZScpO1xuICAgIHR1cm5PZmZNb3VzZU1vdmUgPSB0cnVlO1xuICAgIGlmICh0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgIGlmKCF0dXJuT2ZmTW91c2VNb3ZlKSB7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlREVMaW5lKGUubGF0bG5nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0dXJuT2ZmTW91c2VNb3ZlID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBpZiAobWFya2VyLl9tR3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMikge1xuICAgICAgaWYgKG1hcmtlci5fbUdyb3VwLl9maXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkgJiYgbWFya2VyID09PSBtYXJrZXIuX21Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicsIHttYXJrZXI6IG1hcmtlcn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIF9jbG9zZXN0Tm90TWlkZGxlTWFya2VyIChsYXllcnMsIHBvc2l0aW9uLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gKGxheWVyc1twb3NpdGlvbl0uaXNNaWRkbGUoKSkgPyBsYXllcnNbcG9zaXRpb24gKyBkaXJlY3Rpb25dIDogbGF5ZXJzW3Bvc2l0aW9uXTtcbiAgfSxcbiAgX3NldFByZXZOZXh0IChtYXJrZXIsIHBvc2l0aW9uKSB7XG4gICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICB2YXIgbWF4TGVuZ3RoID0gbGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAxKSB7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgcG9zaXRpb24gLSAxLCAtMSk7XG4gICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgMiwgMSk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gbWF4TGVuZ3RoKSB7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgbWF4TGVuZ3RoIC0gMSwgLTEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIDAsIDEpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXJrZXIuX21pZGRsZVByZXYgPT0gbnVsbCkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSBsYXllcnNbcG9zaXRpb24gLSAxXTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXJrZXIuX21pZGRsZU5leHQgPT0gbnVsbCkge1xuICAgICAgICBtYXJrZXIuX25leHQgPSBsYXllcnNbcG9zaXRpb24gKyAxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBzZXRNaWRkbGVNYXJrZXIgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5hZGRNYXJrZXIocG9zaXRpb24sIG51bGwsIHtpY29uOiBpY29ucy5taWRkbGVJY29ufSk7XG4gIH0sXG4gIHNldE1pZGRsZU1hcmtlcnMgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5zZXRNaWRkbGVNYXJrZXIocG9zaXRpb24pO1xuICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKHBvc2l0aW9uICsgMik7XG4gIH0sXG4gIHNldCAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIGlmICghdGhpcy5oYXNJbnRlcnNlY3Rpb24obGF0bG5nKSkge1xuICAgICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKTtcbiAgICB9XG4gIH0sXG4gIHNldE1pZGRsZSAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIHBvc2l0aW9uID0gKHBvc2l0aW9uIDwgMCkgPyAwIDogcG9zaXRpb247XG5cbiAgICAvL3ZhciBmdW5jID0gKHRoaXMuX2lzSG9sZSkgPyAnc2V0JyA6ICdzZXRIb2xlTWFya2VyJztcbiAgICB2YXIgbWFya2VyID0gdGhpcy5zZXQobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG5cbiAgICBtYXJrZXIuX3NldE1pZGRsZUljb24oKTtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBzZXRBbGwgKGxhdGxuZ3MpIHtcbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgcG9zaXRpb24pID0+IHtcbiAgICAgIHRoaXMuc2V0KGxhdGxuZywgcG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gIH0sXG4gIHNldEFsbEhvbGVzIChob2xlcykge1xuICAgIGhvbGVzLmZvckVhY2goKGhvbGUpID0+IHtcbiAgICAgIC8vdGhpcy5zZXQoaG9sZSk7XG4gICAgICB2YXIgbGFzdEhHcm91cCA9IHRoaXMuX21hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmFkZEhvbGVHcm91cCgpO1xuXG4gICAgICBob2xlLl9lYWNoKChsYXRsbmcsIHBvc2l0aW9uKSA9PiB7XG4gICAgICAgIGxhc3RIR3JvdXAuc2V0KGxhdGxuZywgcG9zaXRpb24pO1xuICAgICAgfSk7XG4gICAgICAvL3ZhciBsZW5ndGggPSBob2xlLmxlbmd0aDtcbiAgICAgIC8vdmFyIGkgPSAwO1xuICAgICAgLy9mb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyAgbGFzdEhHcm91cC5zZXQoaG9sZVtpXSwgaSk7XG4gICAgICAvL31cblxuICAgICAgbGFzdEhHcm91cC5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gICAgfSk7XG4gIH0sXG4gIHNldEhvbGVNYXJrZXIgKGxhdGxuZywgb3B0aW9ucyA9IHtpc0hvbGVNYXJrZXI6IHRydWUsIGhvbGVQb3NpdGlvbjoge319KSB7XG4gICAgdmFyIG1hcmtlciA9IG5ldyBFZGl0TWFya2VyKHRoaXMsIGxhdGxuZywgb3B0aW9ucyB8fCB7fSk7XG4gICAgbWFya2VyLmFkZFRvKHRoaXMpO1xuXG4gICAgLy90aGlzLnNldFNlbGVjdGVkKG1hcmtlcik7XG5cbiAgICBpZiAodGhpcy5fbWFwLmlzTW9kZSgnZHJhdycpICYmIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLl9zZXRGaXJzdChtYXJrZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIHJlbW92ZUhvbGUgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgLy9yZW1vdmUgZWRpdCBsaW5lXG4gICAgLy90aGlzLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIC8vcmVtb3ZlIGVkaXQgbWFya2Vyc1xuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcblxuICAgIC8vcmVtb3ZlIGhvbGVcbiAgICBtYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlcygpLnNwbGljZSh0aGlzLl9wb3NpdGlvbiwgMSk7XG4gICAgbWFwLmdldEVQb2x5Z29uKCkucmVkcmF3KCk7XG5cbiAgICAvL3JlZHJhdyBob2xlc1xuICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZXMoKTtcblxuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXAuX3NldEVITWFya2VyR3JvdXAoaG9sZXNbaV0pO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlU2VsZWN0ZWQgKCkge1xuICAgIHZhciBzZWxlY3RlZEVNYXJrZXIgPSB0aGlzLmdldFNlbGVjdGVkKCk7XG4gICAgdmFyIG1hcmtlckxheWVyc0FycmF5ID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICB2YXIgbGF0bG5nID0gc2VsZWN0ZWRFTWFya2VyLmdldExhdExuZygpO1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFya2VyTGF5ZXJzQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW1vdmVMYXllcihzZWxlY3RlZEVNYXJrZXIpO1xuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCB7bGF0bG5nOiBsYXRsbmd9KTtcbiAgICB9XG5cbiAgICBtYXJrZXJMYXllcnNBcnJheSA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICBpZiAodGhpcy5faXNIb2xlKSB7XG4gICAgICBpZiAobWFwLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgLy8gbm8gbmVlZCB0byByZW1vdmUgbGFzdCBwb2ludFxuICAgICAgICBpZiAobWFya2VyTGF5ZXJzQXJyYXkubGVuZ3RoIDwgNCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlSG9sZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vc2VsZWN0ZWRFTWFya2VyID0gbWFwLmdldFNlbGVjdGVkTWFya2VyKCk7XG4gICAgICAgICAgdmFyIGhvbGVQb3NpdGlvbiA9IHNlbGVjdGVkRU1hcmtlci5vcHRpb25zLmhvbGVQb3NpdGlvbjtcblxuICAgICAgICAgIC8vcmVtb3ZlIGhvbGUgcG9pbnRcbiAgICAgICAgICAvL21hcC5nZXRFUG9seWdvbigpLmdldEhvbGUodGhpcy5fcG9zaXRpb24pLnNwbGljZShob2xlUG9zaXRpb24uaE1hcmtlciwgMSk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZSh0aGlzLl9wb3NpdGlvbikuc3BsaWNlKHNlbGVjdGVkRU1hcmtlci5fX3Bvc2l0aW9uLCAxKTtcbiAgICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5yZWRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgICBsYXllci5vcHRpb25zLmhvbGVQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIGhHcm91cDogdGhpcy5fcG9zaXRpb24sXG4gICAgICAgICAgICBoTWFya2VyOiBfcG9zaXRpb24rK1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFwLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gcmVtb3ZlIGxhc3QgcG9pbnRcbiAgICAgICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAvL3JlbW92ZSBlZGl0IG1hcmtlcnNcbiAgICAgICAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBsYXllci5vcHRpb25zLnRpdGxlID0gcG9zaXRpb247XG4gICAgICBsYXllci5fX3Bvc2l0aW9uID0gcG9zaXRpb24rKztcbiAgICB9KTtcbiAgfSxcbiAgZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uIChwb2x5Z29uKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IFtdO1xuICAgIHZhciBsYXllcnMgPSAoKHBvbHlnb24pID8gcG9seWdvbi5nZXRMYXllcnMoKSA6IHRoaXMuZ2V0TGF5ZXJzKCkpLmZpbHRlcigobCkgPT4gIWwuaXNNaWRkbGUoKSk7XG5cbiAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IFtdO1xuICAgIGxheWVycy5fZWFjaCgobGF5ZXIpID0+IHtcbiAgICAgIHZhciBsYXRsbmcgPSBsYXllci5nZXRMYXRMbmcoKTtcbiAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnB1c2godGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpKTtcbiAgICB9KTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT0gbGF5ZXJzWzBdKSB7IC8vIHBvaW50IGlzIGZpcnN0XG4gICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMuc2xpY2UoMSk7XG4gICAgICB9IGVsc2UgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT0gbGF5ZXJzW2xheWVycy5sZW5ndGggLSAxXSkgeyAvLyBwb2ludCBpcyBsYXN0XG4gICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnNwbGljZSgtMSk7XG4gICAgICB9IGVsc2UgeyAvLyBwb2ludCBpcyBub3QgZmlyc3QgLyBsYXN0XG4gICAgICAgIHZhciB0bXBBcnJQb2ludHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAobWFwLl9zZWxlY3RlZE1hcmtlciA9PT0gbGF5ZXJzW2ldKSB7XG4gICAgICAgICAgICB0bXBBcnJQb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoaSArIDEpO1xuICAgICAgICAgICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSB0bXBBcnJQb2ludHMuY29uY2F0KHRoaXMuX29yaWdpbmFsUG9pbnRzKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnNwbGljZSgtMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpbmFsUG9pbnRzO1xuICB9LFxuICBfYmluZExpbmVFdmVudHM6IHVuZGVmaW5lZCxcbiAgX2hhc0ludGVyc2VjdGlvbiAocG9pbnRzLCBuZXdQb2ludCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgICBsYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlKGxhc3RQb2ludCwgbmV3UG9pbnQsIG1heEluZGV4LCBpc0ZpbmlzaCk7XG4gIH0sXG5cbiAgX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlIChwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgLy9sYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZUhvbGVTZWdtZW50c0ludGVyc2VjdHNSYW5nZShsYXN0UG9pbnQsIG5ld1BvaW50KTtcbiAgfSxcblxuICBoYXNJbnRlcnNlY3Rpb24gKGxhdGxuZywgaXNGaW5pc2gpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBuZXdQb2ludCA9IG1hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpO1xuXG4gICAgdmFyIHJzbHQxID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB2YXIgcnNsdDIgPSBmYWxzZTtcblxuICAgIHZhciBmTWFya2VyID0gdGhpcy5nZXRGaXJzdCgpO1xuICAgIGlmIChmTWFya2VyICYmICFmTWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgLy8gY29kZSB3YXMgZHVibGljYXRlZCB0byBjaGVjayBpbnRlcnNlY3Rpb24gZnJvbSBib3RoIHNpZGVzXG4gICAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgICBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpLnJldmVyc2UoKTtcbiAgICAgIHJzbHQyID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB9XG5cbiAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChyc2x0MSB8fCByc2x0Mik7XG4gICAgdmFyIGVkZ2VzSW50ZXJzZWN0ZWQgPSBtYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBoYXNJbnRlcnNlY3Rpb25XaXRoSG9sZSAobEFycmF5LCBob2xlKSB7XG5cbiAgICBpZiAodGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVswXSk7XG4gICAgdmFyIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzFdKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbihob2xlKTtcblxuICAgIHZhciByc2x0MSA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlKHBvaW50cywgbmV3UG9pbnQsIGxhc3RQb2ludCk7XG5cbiAgICAvLyBjb2RlIHdhcyBkdWJsaWNhdGVkIHRvIGNoZWNrIGludGVyc2VjdGlvbiBmcm9tIGJvdGggc2lkZXNcbiAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oaG9sZSkucmV2ZXJzZSgpO1xuICAgIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzJdKTtcbiAgICB2YXIgcnNsdDIgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpO1xuXG4gICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdDEgfHwgcnNsdDIpO1xuICAgIHZhciBlZGdlc0ludGVyc2VjdGVkID0gdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcblxuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBfdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uIChleHRyYVBvaW50cykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cyxcbiAgICAgIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwO1xuICAgIC8vIEluY3JlbWVudCBsZW5ndGggYnkgZXh0cmFQb2ludHMgaWYgcHJlc2VudFxuICAgIGxlbiArPSBleHRyYVBvaW50cyB8fCAwO1xuXG4gICAgcmV0dXJuICF0aGlzLl9vcmlnaW5hbFBvaW50cyB8fCBsZW4gPD0gMztcbiAgfSxcbiAgX2xpbmVIb2xlU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLCBwMiwgcDM7XG5cbiAgICBmb3IgKHZhciBqID0gcG9pbnRzLmxlbmd0aCAtIDE7IGogPiAwOyBqLS0pIHtcbiAgICAgIHAyID0gcG9pbnRzW2ogLSAxXTtcbiAgICAgIHAzID0gcG9pbnRzW2pdO1xuXG4gICAgICBpZiAoTC5MaW5lVXRpbC5zZWdtZW50c0ludGVyc2VjdChwLCBwMSwgcDIsIHAzKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9saW5lU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxLCBtYXhJbmRleCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXG4gICAgICBwMiwgcDM7XG5cbiAgICB2YXIgbWluID0gaXNGaW5pc2ggPyAxIDogMDtcbiAgICAvLyBDaGVjayBhbGwgcHJldmlvdXMgbGluZSBzZWdtZW50cyAoYmVzaWRlIHRoZSBpbW1lZGlhdGVseSBwcmV2aW91cykgZm9yIGludGVyc2VjdGlvbnNcbiAgICBmb3IgKHZhciBqID0gbWF4SW5kZXg7IGogPiBtaW47IGotLSkge1xuICAgICAgcDIgPSBwb2ludHNbaiAtIDFdO1xuICAgICAgcDMgPSBwb2ludHNbal07XG5cbiAgICAgIGlmIChMLkxpbmVVdGlsLnNlZ21lbnRzSW50ZXJzZWN0KHAsIHAxLCBwMiwgcDMpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2lzTWFya2VySW5Qb2x5Z29uIChtYXJrZXIpIHtcbiAgICB2YXIgaiA9IDA7XG5cbiAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICB2YXIgc2lkZXMgPSBsYXllcnMubGVuZ3RoO1xuXG4gICAgdmFyIHggPSBtYXJrZXIubG5nO1xuICAgIHZhciB5ID0gbWFya2VyLmxhdDtcblxuICAgIHZhciBpblBvbHkgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lkZXM7IGkrKykge1xuICAgICAgaisrO1xuICAgICAgaWYgKGogPT0gc2lkZXMpIHtcbiAgICAgICAgaiA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgcG9pbnQxID0gbGF5ZXJzW2ldLmdldExhdExuZygpO1xuICAgICAgdmFyIHBvaW50MiA9IGxheWVyc1tqXS5nZXRMYXRMbmcoKTtcbiAgICAgIGlmICgoKHBvaW50MS5sYXQgPCB5KSAmJiAocG9pbnQyLmxhdCA+PSB5KSkgfHwgKChwb2ludDIubGF0IDwgeSkgJiYgKHBvaW50MS5sYXQgPj0geSkpKSB7XG4gICAgICAgIGlmIChwb2ludDEubG5nICsgKHkgLSBwb2ludDEubGF0KSAvIChwb2ludDIubGF0IC0gcG9pbnQxLmxhdCkgKiAocG9pbnQyLmxuZyAtIHBvaW50MS5sbmcpIDwgeCkge1xuICAgICAgICAgIGluUG9seSA9ICFpblBvbHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpblBvbHk7XG4gIH1cbn0pOyIsImltcG9ydCBUb29sdGlwIGZyb20gJy4uL2V4dGVuZGVkL1Rvb2x0aXAnO1xuaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuXG52YXIgc2l6ZSA9IDE7XG52YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5pZiAodXNlckFnZW50LmluZGV4T2YoXCJpcGFkXCIpICE9PSAtMSB8fCB1c2VyQWdlbnQuaW5kZXhPZihcImlwaG9uZVwiKSAhPT0gLTEpIHtcbiAgc2l6ZSA9IDI7XG59XG5cbnZhciB0b29sdGlwO1xudmFyIGRyYWdlbmQgPSBmYWxzZTtcbnZhciBfbWFya2VyVG9EZWxldGVHcm91cCA9IG51bGw7XG5cbmV4cG9ydCBkZWZhdWx0IEwuTWFya2VyLmV4dGVuZCh7XG4gIF9kcmFnZ2FibGU6IHVuZGVmaW5lZCwgLy8gYW4gaW5zdGFuY2Ugb2YgTC5EcmFnZ2FibGVcbiAgX29sZExhdExuZ1N0YXRlOiB1bmRlZmluZWQsXG4gIGluaXRpYWxpemUgKGdyb3VwLCBsYXRsbmcsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHtcbiAgICAgIGljb246IGljb24sXG4gICAgICBkcmFnZ2FibGU6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICBMLk1hcmtlci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9tR3JvdXAgPSBncm91cDtcblxuICAgIHRoaXMuX2lzRmlyc3QgPSBncm91cC5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH0sXG4gIHJlbW92ZUdyb3VwICgpIHtcbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIHRoaXMuX21Hcm91cC5yZW1vdmVIb2xlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21Hcm91cC5yZW1vdmUoKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZSAoKSB7XG4gICAgaWYgKHRoaXMuX21hcCkge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZVNlbGVjdGVkKCk7XG4gICAgfVxuICB9LFxuICByZW1vdmVIb2xlICgpIHsgLy8gZGVwcmVjYXRlZFxuICAgIHRoaXMucmVtb3ZlR3JvdXAoKTtcbiAgfSxcbiAgbmV4dCAoKSB7XG4gICAgdmFyIG5leHQgPSB0aGlzLl9uZXh0Ll9uZXh0O1xuICAgIGlmICghdGhpcy5fbmV4dC5pc01pZGRsZSgpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fbmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQ7XG4gIH0sXG4gIHByZXYgKCkge1xuICAgIHZhciBwcmV2ID0gdGhpcy5fcHJldi5fcHJldjtcbiAgICBpZiAoIXRoaXMuX3ByZXYuaXNNaWRkbGUoKSkge1xuICAgICAgcHJldiA9IHRoaXMuX3ByZXY7XG4gICAgfVxuICAgIHJldHVybiBwcmV2O1xuICB9LFxuICBjaGFuZ2VQcmV2TmV4dFBvcyAoKSB7XG4gICAgaWYgKHRoaXMuX3ByZXYuaXNNaWRkbGUoKSkge1xuXG4gICAgICB2YXIgcHJldkxhdExuZyA9IHRoaXMuX21Hcm91cC5fZ2V0TWlkZGxlTGF0TG5nKHRoaXMucHJldigpLCB0aGlzKTtcbiAgICAgIHZhciBuZXh0TGF0TG5nID0gdGhpcy5fbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcywgdGhpcy5uZXh0KCkpO1xuXG4gICAgICB0aGlzLl9wcmV2LnNldExhdExuZyhwcmV2TGF0TG5nKTtcbiAgICAgIHRoaXMuX25leHQuc2V0TGF0TG5nKG5leHRMYXRMbmcpO1xuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqIGNoYW5nZSBldmVudHMgZm9yIG1hcmtlciAoZXhhbXBsZTogaG9sZSlcbiAgICovXG4gICAgcmVzZXRFdmVudHMgKGNhbGxiYWNrKSB7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSxcbiAgX3Bvc0hhc2ggKCkge1xuICAgIHJldHVybiB0aGlzLl9wcmV2LnBvc2l0aW9uICsgJ18nICsgdGhpcy5wb3NpdGlvbiArICdfJyArIHRoaXMuX25leHQucG9zaXRpb247XG4gIH0sXG4gIF9yZXNldEljb24gKF9pY29uKSB7XG4gICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpYyA9IF9pY29uIHx8IGljb247XG5cbiAgICB0aGlzLnNldEljb24oaWMpO1xuICAgIHRoaXMucHJldigpLnNldEljb24oaWMpO1xuICAgIHRoaXMubmV4dCgpLnNldEljb24oaWMpO1xuICB9LFxuICBfc2V0SG92ZXJJY29uIChfaEljb24pIHtcbiAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRJY29uKF9oSWNvbiB8fCBob3Zlckljb24pO1xuICB9LFxuICBfYWRkSWNvbkNsYXNzIChjbGFzc05hbWUpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5faWNvbiwgY2xhc3NOYW1lKTtcbiAgfSxcbiAgX3JlbW92ZUljb25DbGFzcyAoY2xhc3NOYW1lKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2ljb24sIGNsYXNzTmFtZSk7XG4gIH0sXG4gIF9zZXRJbnRlcnNlY3Rpb25JY29uICgpIHtcbiAgICB2YXIgaWNvbkNsYXNzID0gaW50ZXJzZWN0aW9uSWNvbi5vcHRpb25zLmNsYXNzTmFtZTtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ20tZWRpdG9yLWRpdi1pY29uJztcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9hZGRJY29uQ2xhc3MoaWNvbkNsYXNzKTtcblxuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZCA9IHRoaXMucHJldigpO1xuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5fcmVtb3ZlSWNvbkNsYXNzKGNsYXNzTmFtZSk7XG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkLl9hZGRJY29uQ2xhc3MoaWNvbkNsYXNzKTtcblxuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZCA9IHRoaXMubmV4dCgpO1xuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5fcmVtb3ZlSWNvbkNsYXNzKGNsYXNzTmFtZSk7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLl9hZGRJY29uQ2xhc3MoaWNvbkNsYXNzKTtcbiAgfSxcbiAgX3NldEZpcnN0SWNvbiAoKSB7XG4gICAgdGhpcy5faXNGaXJzdCA9IHRydWU7XG4gICAgdGhpcy5zZXRJY29uKGZpcnN0SWNvbik7XG4gIH0sXG4gIF9oYXNGaXJzdEljb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9pY29uICYmIEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItZGl2LWljb24tZmlyc3QnKTtcbiAgfSxcbiAgX3NldE1pZGRsZUljb24gKCkge1xuICAgIHRoaXMuc2V0SWNvbihtaWRkbGVJY29uKTtcbiAgfSxcbiAgaXNNaWRkbGUgKCkge1xuICAgIHJldHVybiB0aGlzLl9pY29uICYmIEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uJylcbiAgICAgICYmICFMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ2xlYWZsZXQtZHJhZy10YXJnZXQnKTtcbiAgfSxcbiAgX3NldERyYWdJY29uICgpIHtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uJyk7XG4gICAgdGhpcy5zZXRJY29uKGRyYWdJY29uKTtcbiAgfSxcbiAgaXNQbGFpbiAoKSB7XG4gICAgcmV0dXJuIEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItZGl2LWljb24nKSB8fCBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvbicpO1xuICB9LFxuICBfb25jZUNsaWNrICgpIHtcbiAgICBpZiAodGhpcy5faXNGaXJzdCkge1xuICAgICAgdGhpcy5vbmNlKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcblxuICAgICAgICBpZiAobUdyb3VwLl9tYXJrZXJzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICB0aGlzLl9vbmNlQ2xpY2soKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGF0bG5nID0gZS50YXJnZXQuX2xhdGxuZztcbiAgICAgICAgdGhpcy5fbWFwLl9zdG9yZWRMYXllclBvaW50ID0gZS50YXJnZXQ7XG5cbiAgICAgICAgdmFyIGhhc0ludGVyc2VjdGlvbiA9IG1Hcm91cC5oYXNJbnRlcnNlY3Rpb24obGF0bG5nKTtcblxuICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgLy9tYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICAgIHRoaXMuX29uY2VDbGljaygpOyAvLyBiaW5kICdvbmNlJyBhZ2FpbiB1bnRpbCBoYXMgaW50ZXJzZWN0aW9uXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5faXNGaXJzdCA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuc2V0SWNvbihpY29uKTtcbiAgICAgICAgICAvL21Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmpvaW5fcGF0aCcsIHsgbUdyb3VwOiBtR3JvdXAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgX2RldGVjdEdyb3VwRGVsZXRlKCkge1xuICAgIGxldCBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICB2YXIgc2VsZWN0ZWRNR3JvdXAgPSBtYXAuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUgfHwgIXRoaXMuaXNQbGFpbigpIHx8IChzZWxlY3RlZE1Hcm91cCAmJiBzZWxlY3RlZE1Hcm91cC5oYXNGaXJzdE1hcmtlcigpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICBfbWFya2VyVG9EZWxldGVHcm91cCA9IG51bGw7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKF9tYXJrZXJUb0RlbGV0ZUdyb3VwICYmIHRoaXMuX2xlYWZsZXRfaWQgPT09IF9tYXJrZXJUb0RlbGV0ZUdyb3VwLl9sZWFmbGV0X2lkKSB7XG4gICAgICBpZiAodGhpcy5fbGF0bG5nLmxhdCAhPT0gX21hcmtlclRvRGVsZXRlR3JvdXAuX2xhdGxuZy5sYXQgfHwgdGhpcy5fbGF0bG5nLmxuZyAhPT0gX21hcmtlclRvRGVsZXRlR3JvdXAuX2xhdGxuZy5sbmcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtYXAub3B0aW9ucy5ub3RpZnlDbGlja01hcmtlckRlbGV0ZVBvbHlnb24pIHtcbiAgICAgIGlmIChzZWxlY3RlZE1Hcm91cCAmJiAhc2VsZWN0ZWRNR3JvdXAuX2lzSG9sZSkge1xuXG4gICAgICAgIC8qIHRvZG86IHJlZmFjdG9yaW5nICovXG4gICAgICAgIGxldCBwbGFpbk1hcmtlcnNMZW4gPSBzZWxlY3RlZE1Hcm91cC5nZXRMYXllcnMoKS5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtLl9pY29uKS5oYXNDbGFzcygnbS1lZGl0b3ItZGl2LWljb24nKTtcbiAgICAgICAgfSkubGVuZ3RoO1xuXG4gICAgICAgIGlmIChwbGFpbk1hcmtlcnNMZW4gPT09IDMpIHtcbiAgICAgICAgICBpZiAoX21hcmtlclRvRGVsZXRlR3JvdXAgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIF9tYXJrZXJUb0RlbGV0ZUdyb3VwID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfbWFya2VyVG9EZWxldGVHcm91cCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgaXNBY2NlcHRlZFRvRGVsZXRlKCkge1xuICAgIHJldHVybiBfbWFya2VyVG9EZWxldGVHcm91cCA9PT0gdGhpcyAmJiB0aGlzLmlzU2VsZWN0ZWRJbkdyb3VwKCk7XG4gIH0sXG4gIF9iaW5kQ29tbW9uRXZlbnRzICgpIHtcbiAgICB0aGlzLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgICBpZiAodGhpcy5fZGV0ZWN0R3JvdXBEZWxldGUoKSkge1xuICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmFjY2VwdERlbGV0aW9uLCAnZXJyb3InLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9tYXAuX3N0b3JlZExheWVyUG9pbnQgPSBlLnRhcmdldDtcblxuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcblxuICAgICAgaWYgKG1Hcm91cC5oYXNGaXJzdE1hcmtlcigpICYmIHRoaXMgIT09IG1Hcm91cC5nZXRGaXJzdCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpICYmIHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb24odGhpcy5nZXRMYXRMbmcoKSwgdHJ1ZSkpIHtcbiAgICAgICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cblxuICAgICAgaWYgKG1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcblxuICAgICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICAgICAgbWFwLm1zZ0hlbHBlci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvQWRkTmV3RWRnZXMsIG51bGwsIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hcC5tc2dIZWxwZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMsIG51bGwsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7IC8vYWRkIGVkZ2VcbiAgICAgICAgbUdyb3VwLnNldE1pZGRsZU1hcmtlcnModGhpcy5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3Jlc2V0SWNvbihpY29uKTtcbiAgICAgICAgbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgICBtYXAubXNnSGVscGVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzLCBudWxsLCB0aGlzKTtcbiAgICAgICAgX21hcmtlclRvRGVsZXRlR3JvdXAgPSBudWxsO1xuICAgICAgfSBlbHNlIHsgLy9yZW1vdmUgZWRnZVxuICAgICAgICBpZiAoIW1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZHJhZ2VuZCkge1xuICAgICAgICAgIG1hcC5tc2dIZWxwZXIuaGlkZSgpO1xuXG4gICAgICAgICAgdmFyIHJzbHRJbnRlcnNlY3Rpb24gPSB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oeyB0YXJnZXQ6IHsgX2xhdGxuZzogbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcy5wcmV2KCksIHRoaXMubmV4dCgpKSB9IH0pO1xuXG4gICAgICAgICAgaWYgKHJzbHRJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgICAgICAgICAgbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IobWFwLm9wdGlvbnMudGV4dC5kZWxldGVQb2ludEludGVyc2VjdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aWV3RXJyb3JMaW5lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9sZExhdExuZyA9IHRoaXMuZ2V0TGF0TG5nKCk7XG5cbiAgICAgICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgIG1Hcm91cC5yZW1vdmVNYXJrZXIodGhpcyk7XG5cbiAgICAgICAgICBpZiAoIW1Hcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXdMYXRMbmcgPSBuZXh0TWFya2VyLl9wcmV2LmdldExhdExuZygpO1xuXG4gICAgICAgICAgICBpZiAobmV3TGF0TG5nLmxhdCA9PT0gb2xkTGF0TG5nLmxhdCAmJiBuZXdMYXRMbmcubG5nID09PSBvbGRMYXRMbmcubG5nKSB7XG4gICAgICAgICAgICAgIG1hcC5tc2dIZWxwZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzLCBudWxsLCBuZXh0TWFya2VyLl9wcmV2KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbUdyb3VwLnNldFNlbGVjdGVkKG5leHRNYXJrZXIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnBvbHlnb246ZGVsZXRlZCcpO1xuICAgICAgICAgICAgbWFwLm1zZ0hlbHBlci5oaWRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIGlmICh0aGlzLl9tR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuX21Hcm91cC5nZXRMYXllcnMoKS5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInLCB7IG1hcmtlcjogdGhpcyB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMgPT09IHRoaXMuX21Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInLCB7IG1hcmtlcjogdGhpcyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWRJbkdyb3VwKCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21pZGRsZV9tYXJrZXJfbW91c2VvdmVyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmlzQWNjZXB0ZWRUb0RlbGV0ZSgpKSB7XG4gICAgICAgIG1hcC5tc2dIZWxwZXIubXNnKG1hcC5vcHRpb25zLnRleHQuYWNjZXB0RGVsZXRpb24sICdlcnJvcicsIHRoaXMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfbW91c2VvdXQnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX29uY2VDbGljaygpO1xuXG4gICAgdGhpcy5vbignZGJsY2xpY2snLCAoKSA9PiB7XG4gICAgICB2YXIgbUdyb3VwID0gdGhpcy5fbUdyb3VwO1xuICAgICAgaWYgKG1Hcm91cCAmJiBtR3JvdXAuZ2V0Rmlyc3QoKSAmJiBtR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IG1Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICAgIG1Hcm91cC5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gICAgICAgICAgLy90aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmpvaW5fcGF0aCcsIHttYXJrZXI6IHRoaXN9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZycsIChlKSA9PiB7XG4gICAgICB2YXIgbWFya2VyID0gZS50YXJnZXQ7XG5cbiAgICAgIG1hcmtlci5jaGFuZ2VQcmV2TmV4dFBvcygpO1xuXG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuXG4gICAgICB0aGlzLl9zZXREcmFnSWNvbigpO1xuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRyYWdfbWFya2VyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnZW5kJywgKCkgPT4ge1xuXG4gICAgICB0aGlzLl9tR3JvdXAuc2VsZWN0KCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmRyYWdlbmRfbWFya2VyJywgeyBtYXJrZXI6IHRoaXMgfSk7XG5cbiAgICAgIGRyYWdlbmQgPSB0cnVlO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGRyYWdlbmQgPSBmYWxzZTtcbiAgICAgIH0sIDIwMCk7XG5cbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuICAgIH0pO1xuICB9LFxuICBfaXNJbnNpZGVIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmdldExheWVycygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBob2xlID0gaG9sZXNbaV07XG4gICAgICBpZiAodGhpcy5fbUdyb3VwICE9PSBob2xlKSB7XG4gICAgICAgIGlmIChob2xlLl9pc01hcmtlckluUG9seWdvbih0aGlzLmdldExhdExuZygpKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2lzT3V0c2lkZU9mUG9seWdvbiAocG9seWdvbikge1xuICAgIHJldHVybiAhcG9seWdvbi5faXNNYXJrZXJJblBvbHlnb24odGhpcy5nZXRMYXRMbmcoKSk7XG4gIH0sXG4gIF9kZXRlY3RJbnRlcnNlY3Rpb24gKGUpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGxhdGxuZyA9IChlID09PSB1bmRlZmluZWQpID8gdGhpcy5nZXRMYXRMbmcoKSA6IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgdmFyIGlzT3V0c2lkZU9mUG9seWdvbiA9IGZhbHNlO1xuICAgIHZhciBpc0luc2lkZU9mSG9sZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgaXNPdXRzaWRlT2ZQb2x5Z29uID0gdGhpcy5faXNPdXRzaWRlT2ZQb2x5Z29uKG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgICAgaXNJbnNpZGVPZkhvbGUgPSB0aGlzLl9pc0luc2lkZUhvbGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNJbnNpZGVPZkhvbGUgPSB0aGlzLl9pc0luc2lkZUhvbGUoKTtcbiAgICB9XG5cbiAgICB2YXIgcnNsdCA9IGlzSW5zaWRlT2ZIb2xlIHx8IGlzT3V0c2lkZU9mUG9seWdvbiB8fCB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZykgfHwgdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzKGUpO1xuXG4gICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdCk7XG4gICAgaWYgKHJzbHQpIHtcbiAgICAgIHRoaXMuX21hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcC5lZGdlc0ludGVyc2VjdGVkKCk7XG4gIH0sXG4gIF9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMgKGUpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwLCBoYXNJbnRlcnNlY3Rpb24gPSBmYWxzZSwgaG9sZSwgbGF0bG5nID0gKGUgPT09IHVuZGVmaW5lZCkgPyB0aGlzLmdldExhdExuZygpIDogZS50YXJnZXQuX2xhdGxuZztcbiAgICB2YXIgaG9sZXMgPSBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgdmFyIHByZXZQb2ludCA9IHRoaXMucHJldigpO1xuICAgIHZhciBuZXh0UG9pbnQgPSB0aGlzLm5leHQoKTtcblxuICAgIGlmIChwcmV2UG9pbnQgPT0gbnVsbCAmJiBuZXh0UG9pbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWNvbmRQb2ludCA9IHByZXZQb2ludC5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbGFzdFBvaW50ID0gbmV4dFBvaW50LmdldExhdExuZygpO1xuICAgIHZhciBsYXllcnMsIHRtcEFycmF5ID0gW107XG5cbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaG9sZSA9IGhvbGVzW2ldO1xuICAgICAgICBpZiAoaG9sZSAhPT0gdGhpcy5fbUdyb3VwKSB7XG4gICAgICAgICAgaGFzSW50ZXJzZWN0aW9uID0gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBob2xlKTtcbiAgICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBjaGVjayB0aGF0IGhvbGUgaXMgaW5zaWRlIG9mIG90aGVyIGhvbGVcbiAgICAgICAgICB0bXBBcnJheSA9IFtdO1xuICAgICAgICAgIGxheWVycyA9IGhvbGUuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgICAgICBsYXllcnMuX2VhY2goKGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbUdyb3VwLl9pc01hcmtlckluUG9seWdvbihsYXllci5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICAgICAgdG1wQXJyYXkucHVzaChcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICh0bXBBcnJheS5sZW5ndGggPT09IGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgZU1hcmtlcnNHcm91cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFzSW50ZXJzZWN0aW9uID0gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBob2xlc1tpXSk7XG5cbiAgICAgICAgLy8gY2hlY2sgdGhhdCBob2xlIGlzIG91dHNpZGUgb2YgcG9seWdvblxuICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRtcEFycmF5ID0gW107XG4gICAgICAgIGxheWVycyA9IGhvbGVzW2ldLmdldExheWVycygpO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChsYXllcnNbal0uX2lzT3V0c2lkZU9mUG9seWdvbihlTWFya2Vyc0dyb3VwKSkge1xuICAgICAgICAgICAgdG1wQXJyYXkucHVzaChcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRtcEFycmF5Lmxlbmd0aCA9PT0gbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLk1hcmtlci5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgdGhpcy5vbignZHJhZ3N0YXJ0JywgKGUpID0+IHtcbiAgICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBudWxsOyAvL3Jlc2V0IHBvaW50XG5cbiAgICAgIHRoaXMuX21Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgIHRoaXMuX29sZExhdExuZ1N0YXRlID0gZS50YXJnZXQuX2xhdGxuZztcblxuICAgICAgaWYgKHRoaXMuX3ByZXYuaXNQbGFpbigpKSB7XG4gICAgICAgIHRoaXMuX21Hcm91cC5zZXRNaWRkbGVNYXJrZXJzKHRoaXMucG9zaXRpb24pO1xuICAgICAgfVxuXG4gICAgfSkub24oJ2RyYWcnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fb25EcmFnKGUpO1xuICAgIH0pLm9uKCdkcmFnZW5kJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX29uRHJhZ0VuZChlKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5fZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kQ29tbW9uRXZlbnRzKG1hcCk7XG4gIH0sXG4gIF9vbkRyYWcgKGUpIHtcbiAgICB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oZSk7XG4gIH0sXG4gIF9vbkRyYWdFbmQgKGUpIHtcbiAgICB2YXIgcnNsdCA9IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbihlKTtcbiAgICBpZiAocnNsdCAmJiAhdGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uKSB7XG4gICAgICB0aGlzLl9yZXN0b3JlT2xkUG9zaXRpb24oKTtcbiAgICB9XG4gIH0sXG4gIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgX3Jlc3RvcmVPbGRQb3NpdGlvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKSkge1xuICAgICAgbGV0IHN0YXRlTGF0TG5nID0gdGhpcy5fb2xkTGF0TG5nU3RhdGU7XG4gICAgICB0aGlzLnNldExhdExuZyhMLmxhdExuZyhzdGF0ZUxhdExuZy5sYXQsIHN0YXRlTGF0TG5nLmxuZykpO1xuXG4gICAgICB0aGlzLmNoYW5nZVByZXZOZXh0UG9zKCk7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICAvL1xuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkcmFnX21hcmtlcicsIHsgbWFya2VyOiB0aGlzIH0pO1xuXG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHRoaXMuZ2V0TGF0TG5nKCk7XG4gICAgfVxuICB9LFxuICBfYW5pbWF0ZVpvb20gKG9wdCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHZhciBwb3MgPSB0aGlzLl9tYXAuX2xhdExuZ1RvTmV3TGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcsIG9wdC56b29tLCBvcHQuY2VudGVyKS5yb3VuZCgpO1xuXG4gICAgICB0aGlzLl9zZXRQb3MocG9zKTtcbiAgICB9XG4gIH0sXG4gIHJlc2V0SWNvbiAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uLWRyYWcnKTtcbiAgfSxcbiAgdW5TZWxlY3RJY29uSW5Hcm91cCAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBfc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICghdGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9hZGRJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uJyk7XG4gICAgfVxuICAgIHRoaXMuX2FkZEljb25DbGFzcygnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2KSB7XG4gICAgICB0aGlzLl9wcmV2Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgICB0aGlzLl9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIGlmICh0aGlzLl9uZXh0KSB7XG4gICAgICB0aGlzLl9uZXh0Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgfSxcbiAgaXNTZWxlY3RlZEluR3JvdXAgKCkge1xuICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIEwuTWFya2VyLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gIH0sXG4gIF9lcnJvckxpbmVzOiBbXSxcbiAgX3ByZXZFcnJvckxpbmU6IG51bGwsXG4gIF9uZXh0RXJyb3JMaW5lOiBudWxsLFxuICBfZHJhd0Vycm9yTGluZXMgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG5cbiAgICB2YXIgY3VyclBvaW50ID0gdGhpcy5nZXRMYXRMbmcoKTtcbiAgICB2YXIgcHJldlBvaW50cyA9IFt0aGlzLnByZXYoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcbiAgICB2YXIgbmV4dFBvaW50cyA9IFt0aGlzLm5leHQoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcblxuICAgIHZhciBlcnJvckxpbmVTdHlsZSA9IHRoaXMuX21hcC5vcHRpb25zLmVycm9yTGluZVN0eWxlO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZSA9IG5ldyBMLlBvbHlsaW5lKHByZXZQb2ludHMsIGVycm9yTGluZVN0eWxlKTtcbiAgICB0aGlzLl9uZXh0RXJyb3JMaW5lID0gbmV3IEwuUG9seWxpbmUobmV4dFBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZS5hZGRUbyhtYXApO1xuICAgIHRoaXMuX25leHRFcnJvckxpbmUuYWRkVG8obWFwKTtcblxuICAgIHRoaXMuX2Vycm9yTGluZXMucHVzaCh0aGlzLl9wcmV2RXJyb3JMaW5lKTtcbiAgICB0aGlzLl9lcnJvckxpbmVzLnB1c2godGhpcy5fbmV4dEVycm9yTGluZSk7XG4gIH0sXG4gIF9jbGVhckVycm9yTGluZXMgKCkge1xuICAgIHRoaXMuX2Vycm9yTGluZXMuX2VhY2goKGxpbmUpID0+IHRoaXMuX21hcC5yZW1vdmVMYXllcihsaW5lKSk7XG4gIH0sXG4gIHNldEludGVyc2VjdGVkU3R5bGUgKCkge1xuICAgIHRoaXMuX3NldEludGVyc2VjdGlvbkljb24oKTtcblxuICAgIC8vc2hvdyBpbnRlcnNlY3RlZCBsaW5lc1xuICAgIHRoaXMuX2RyYXdFcnJvckxpbmVzKCk7XG4gIH0sXG4gIHJlc2V0U3R5bGUgKCkge1xuICAgIHRoaXMucmVzZXRJY29uKCk7XG4gICAgdGhpcy5zZWxlY3RJY29uSW5Hcm91cCgpO1xuXG4gICAgaWYgKHRoaXMuX3ByZXZJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25leHRJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkID0gbnVsbDtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQgPSBudWxsO1xuXG4gICAgLy9oaWRlIGludGVyc2VjdGVkIGxpbmVzXG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG4gIH0sXG4gIF9wcmV2aWV3RXJMaW5lOiBudWxsLFxuICBfcHQ6IG51bGwsXG4gIF9wcmV2aWV3RXJyb3JMaW5lICgpIHtcbiAgICBpZiAodGhpcy5fcHJldmlld0VyTGluZSkge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wdCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3B0KTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnRzID0gW3RoaXMubmV4dCgpLmdldExhdExuZygpLCB0aGlzLnByZXYoKS5nZXRMYXRMbmcoKV07XG5cbiAgICB2YXIgZXJyb3JMaW5lU3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5wcmV2aWV3RXJyb3JMaW5lU3R5bGU7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lID0gbmV3IEwuUG9seWxpbmUocG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lLmFkZFRvKHRoaXMuX21hcCk7XG5cbiAgICB0aGlzLl9wdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH0sIDkwMCk7XG4gIH1cbn0pOyIsImltcG9ydCBFeHRlbmRlZFBvbHlnb24gZnJvbSAnLi4vZXh0ZW5kZWQvUG9seWdvbic7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi9leHRlbmRlZC9Ub29sdGlwJztcblxuZXhwb3J0IGRlZmF1bHQgTC5FZGl0UGxveWdvbiA9IEV4dGVuZGVkUG9seWdvbi5leHRlbmQoe1xuICBfb2xkRTogdW5kZWZpbmVkLCAvLyB0byByZXVzZSBldmVudCBvYmplY3QgYWZ0ZXIgXCJiYWQgaG9sZVwiIHJlbW92aW5nIHRvIGJ1aWxkIG5ldyBob2xlXG4gIF9rOiAxLCAvLyB0byBkZWNyZWFzZSAnZGlmZicgdmFsdWUgd2hpY2ggaGVscHMgYnVpbGQgYSBob2xlXG4gIF9ob2xlczogW10sXG4gIGluaXRpYWxpemUgKGxhdGxuZ3MsIG9wdGlvbnMpIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5ncywgb3B0aW9ucyk7XG4gICAgdGhpcy5faW5pdFdpdGhIb2xlcyhsYXRsbmdzKTtcblxuICAgIHRoaXMub3B0aW9ucy5jbGFzc05hbWUgPSBcImxlYWZsZXQtY2xpY2thYmxlIHBvbHlnb25cIjtcbiAgfSxcbiAgX3VwZGF0ZSAoZSkge1xuICAgIHZhciBtYXJrZXIgPSBlLm1hcmtlcjtcblxuICAgIGlmIChtYXJrZXIuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICB2YXIgbWFya2VycyA9IG1hcmtlci5fbUdyb3VwLl9tYXJrZXJzO1xuICAgICAgbWFya2VycyA9IG1hcmtlcnMuZmlsdGVyKChtYXJrZXIpID0+ICFtYXJrZXIuaXNNaWRkbGUoKSk7XG4gICAgICB0aGlzLl9ob2xlc1ttYXJrZXIuX21Hcm91cC5wb3NpdGlvbl0gPSBtYXJrZXJzLm1hcCgobWFya2VyKSA9PiBtYXJrZXIuZ2V0TGF0TG5nKCkpO1xuXG4gICAgfVxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIF9yZW1vdmVIb2xlIChlKSB7XG4gICAgdmFyIGhvbGVQb3NpdGlvbiA9IGUubWFya2VyLl9tR3JvdXAucG9zaXRpb247XG4gICAgdGhpcy5faG9sZXMuc3BsaWNlKGhvbGVQb3NpdGlvbiwgMSk7XG5cbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZW1vdmVMYXllcihlLm1hcmtlci5fbUdyb3VwLl9sZWFmbGV0X2lkKTtcbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXBvcyhlLm1hcmtlci5fbUdyb3VwLnBvc2l0aW9uKTtcblxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6YWRkX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmFkZF9tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZHJhZ19tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkcmFnX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfaG9sZScpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9ob2xlJywgKGUpID0+IHRoaXMuX3JlbW92ZUhvbGUoZSkpO1xuXG4gICAgdGhpcy5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlbW92ZScsIHsgbGF5ZXJQb2ludDogZS5sYXllclBvaW50IH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiBtYXAuZmlyZSgnZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgbWFwLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuXG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBhZGRIb2xlIChob2xlKSB7XG4gICAgdGhpcy5faG9sZXMgPSB0aGlzLl9ob2xlcyB8fCBbXTtcbiAgICB0aGlzLl9ob2xlcy5wdXNoKGhvbGUpO1xuXG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgaGFzSG9sZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hvbGVzLmxlbmd0aCA+IDA7XG4gIH0sXG4gIF9yZXNldExhc3RIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgbWFwLmdldFNlbGVjdGVkTWFya2VyKCkucmVtb3ZlSG9sZSgpO1xuXG4gICAgaWYgKHRoaXMuX2sgPiAwLjAwMSkge1xuICAgICAgdGhpcy5fYWRkSG9sZSh0aGlzLl9vbGRFLCAwLjUpO1xuICAgIH1cbiAgfSxcbiAgY2hlY2tIb2xlSW50ZXJzZWN0aW9uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uIHx8IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGVITWFya2Vyc0dyb3VwTGF5ZXJzID0gdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhc3RIb2xlID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV07XG4gICAgdmFyIGxhc3RIb2xlTGF5ZXJzID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV0uZ2V0TGF5ZXJzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RIb2xlTGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGF5ZXIgPSBsYXN0SG9sZUxheWVyc1tpXTtcblxuICAgICAgaWYgKGxheWVyLl9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMoKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAobGF5ZXIuX2lzT3V0c2lkZU9mUG9seWdvbih0aGlzLl9tYXAuZ2V0RU1hcmtlcnNHcm91cCgpKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBlSG9sZU1hcmtlckdyb3VwTGF5ZXIgPSBlSE1hcmtlcnNHcm91cExheWVyc1tqXTtcblxuICAgICAgICBpZiAobGFzdEhvbGUgIT09IGVIb2xlTWFya2VyR3JvdXBMYXllciAmJiBlSG9sZU1hcmtlckdyb3VwTGF5ZXIuX2lzTWFya2VySW5Qb2x5Z29uKGxheWVyLmdldExhdExuZygpKSkge1xuICAgICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IE1hcmtlciBmcm9tICcuLi9lZGl0L21hcmtlcic7XG5pbXBvcnQgc29ydCBmcm9tICcuLi91dGlscy9zb3J0QnlQb3NpdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IEwuQ2xhc3MuZXh0ZW5kKHtcbiAgaW5jbHVkZXM6IEwuTWl4aW4uRXZlbnRzLFxuXG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0TWFya2VyOiB1bmRlZmluZWQsXG4gIF9maXJzdE1hcmtlcjogdW5kZWZpbmVkLFxuICBfcG9zaXRpb25IYXNoOiB1bmRlZmluZWQsXG4gIF9sYXN0UG9zaXRpb246IDAsXG4gIF9tYXJrZXJzOiBbXSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy9MLkxheWVyR3JvdXAucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIC8vTC5MYXllckdyb3VwLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuICB9LFxuICBjbGVhckxheWVycyAoKSB7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcihtYXJrZXIpO1xuICAgIH0pO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgfSxcbiAgYWRkVG8gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgfSxcbiAgYWRkTGF5ZXIgKG1hcmtlcikge1xuICAgIHRoaXMuX21hcC5hZGRMYXllcihtYXJrZXIpO1xuICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgIGlmIChtYXJrZXIucG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWFya2Vycy5tb3ZlKHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMSwgbWFya2VyLnBvc2l0aW9uKTtcbiAgICB9XG4gICAgbWFya2VyLnBvc2l0aW9uID0gKG1hcmtlci5wb3NpdGlvbiAhPSBudWxsKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMTtcbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgbWFya2Vycy5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICB3aGlsZSAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXIobWFya2VyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgbWFwLmdldFZHcm91cCgpLnJlbW92ZUxheWVyKG1hcC5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSk7XG4gICAgfVxuICAgIG1hcC5maXJlKCdlZGl0b3I6cG9seWdvbjpkZWxldGVkJyk7XG4gIH0sXG4gIHJlbW92ZUxheWVyIChtYXJrZXIpIHtcbiAgICB2YXIgcG9zaXRpb24gPSBtYXJrZXIucG9zaXRpb247XG4gICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKG1hcmtlcik7XG4gICAgdGhpcy5fbWFya2Vycy5zcGxpY2UocG9zaXRpb24sIDEpO1xuICB9LFxuICBnZXRMYXllcnMgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrZXJzO1xuICB9LFxuICBlYWNoTGF5ZXIgKGNiKSB7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKGNiKTtcbiAgfSxcbiAgbWFya2VyQXQgKHBvc2l0aW9uKSB7XG4gICAgdmFyIHJzbHQgPSB0aGlzLl9tYXJrZXJzW3Bvc2l0aW9uXTtcblxuICAgIGlmIChwb3NpdGlvbiA8IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmZpcnN0TWFya2VyKCk7XG4gICAgfVxuXG4gICAgaWYgKHJzbHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnNsdCA9IHRoaXMubGFzdE1hcmtlcigpO1xuICAgIH1cblxuICAgIHJldHVybiByc2x0O1xuICB9LFxuICBmaXJzdE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmtlcnNbMF07XG4gIH0sXG4gIGxhc3RNYXJrZXIgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcbiAgICByZXR1cm4gbWFya2Vyc1ttYXJrZXJzLmxlbmd0aCAtIDFdO1xuICB9LFxuICByZW1vdmVNYXJrZXIgKG1hcmtlcikge1xuICAgIHZhciBiID0gIW1hcmtlci5pc01pZGRsZSgpO1xuXG4gICAgdmFyIHByZXZNYXJrZXIgPSBtYXJrZXIuX3ByZXY7XG4gICAgdmFyIG5leHRNYXJrZXIgPSBtYXJrZXIuX25leHQ7XG4gICAgdmFyIG5leHRuZXh0TWFya2VyID0gbWFya2VyLl9uZXh0Ll9uZXh0O1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQobWFya2VyLnBvc2l0aW9uKTtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KHByZXZNYXJrZXIucG9zaXRpb24pO1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQobmV4dE1hcmtlci5wb3NpdGlvbik7XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZXRNaWRkbGVNYXJrZXIobmV4dG5leHRNYXJrZXIucG9zaXRpb24pO1xuXG4gICAgICBpZiAoYikge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgICBtYXAucmVtb3ZlTGF5ZXIodGhpcyk7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcC5yZW1vdmVQb2x5Z29uKG1hcC5nZXRFUG9seWdvbigpKTtcblxuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJyk7XG4gICAgICB9XG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlTWFya2VyQXQgKHBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hcmtlcjtcbiAgICBpZiAodHlwZW9mIHBvc2l0aW9uID09PSAnbnVtYmVyJykge1xuICAgICAgbWFya2VyID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgX2NoYW5nZVBvcyA9IGZhbHNlO1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcbiAgICBtYXJrZXJzLmZvckVhY2goKF9tYXJrZXIpID0+IHtcbiAgICAgIGlmIChfY2hhbmdlUG9zKSB7XG4gICAgICAgIF9tYXJrZXIucG9zaXRpb24gPSAoX21hcmtlci5wb3NpdGlvbiA9PT0gMCkgPyAwIDogX21hcmtlci5wb3NpdGlvbiAtIDE7XG4gICAgICB9XG4gICAgICBpZiAoX21hcmtlciA9PT0gbWFya2VyKSB7XG4gICAgICAgIG1hcmtlci5fcHJldi5fbmV4dCA9IG1hcmtlci5fbmV4dDtcbiAgICAgICAgbWFya2VyLl9uZXh0Ll9wcmV2ID0gbWFya2VyLl9wcmV2O1xuICAgICAgICBfY2hhbmdlUG9zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVtb3ZlTGF5ZXIobWFya2VyKTtcblxuICAgIGlmIChtYXJrZXJzLmxlbmd0aCA8IDUpIHtcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgICAgIG1hcC5nZXRWR3JvdXAoKS5yZW1vdmVMYXllcihtYXAuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYWRkTWFya2VyIChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKSB7XG4gICAgLy8gMS4gcmVjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgaWYgKHR5cGVvZiBsYXRsbmcgPT09ICdudW1iZXInKSB7XG4gICAgICBwb3NpdGlvbiA9IHRoaXMubWFya2VyQXQobGF0bG5nKS5wb3NpdGlvbjtcbiAgICAgIHRoaXMuX3JlY2FsY1Bvc2l0aW9ucyhwb3NpdGlvbik7XG5cbiAgICAgIHZhciBwcmV2TWFya2VyID0gKHBvc2l0aW9uIC0gMSkgPCAwID8gdGhpcy5sYXN0TWFya2VyKCkgOiB0aGlzLm1hcmtlckF0KHBvc2l0aW9uIC0gMSk7XG4gICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubWFya2VyQXQoKHBvc2l0aW9uID09IC0xKSA/IDEgOiBwb3NpdGlvbik7XG4gICAgICBsYXRsbmcgPSB0aGlzLl9nZXRNaWRkbGVMYXRMbmcocHJldk1hcmtlciwgbmV4dE1hcmtlcik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICBvcHRpb25zLmRyYWdnYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldEZpcnN0KCkpIHtcbiAgICAgIG9wdGlvbnMuZHJhZ2dhYmxlID0gIXRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCk7XG4gICAgfVxuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBNYXJrZXIodGhpcywgbGF0bG5nLCBvcHRpb25zKTtcbiAgICBpZiAoIXRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICB0aGlzLl9maXJzdE1hcmtlciA9IG1hcmtlcjtcbiAgICAgIHRoaXMuX2xhc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vaWYgKHRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAvLyAgbWFya2VyLmRyYWdnaW5nLmRpc2FibGUoKTtcbiAgICAvL30gZWxzZSB7XG4gICAgLy8gIG1hcmtlci5kcmFnZ2luZy5lbmFibGUoKTtcbiAgICAvL31cblxuICAgIHRoaXMuYWRkTGF5ZXIobWFya2VyKTtcblxuICAgIHtcbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IChtYXJrZXIucG9zaXRpb24gIT09IHVuZGVmaW5lZCApID8gbWFya2VyLnBvc2l0aW9uIDogdGhpcy5fbGFzdFBvc2l0aW9uKys7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9sYXN0TWFya2VyO1xuICAgICAgdGhpcy5fZmlyc3RNYXJrZXIuX3ByZXYgPSBtYXJrZXI7XG4gICAgICBpZiAobWFya2VyLl9wcmV2KSB7XG4gICAgICAgIHRoaXMuX2xhc3RNYXJrZXIuX25leHQgPSBtYXJrZXI7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2ZpcnN0TWFya2VyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9sYXN0TWFya2VyID0gbWFya2VyO1xuICAgIH1cblxuICAgIC8vIDIuIHJlY2FsY3VsYXRlIHJlbGF0aW9uc1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9yZWNhbGNSZWxhdGlvbnMobWFya2VyKTtcbiAgICB9XG4gICAgLy8gMy4gdHJpZ2dlciBldmVudFxuICAgIGlmICghbWFya2VyLmlzTWlkZGxlKCkpIHtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6YWRkX21hcmtlcicsIHttYXJrZXI6IG1hcmtlcn0pO1xuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIGNsZWFyICgpIHtcbiAgICB2YXIgaWRzID0gdGhpcy5faWRzKCk7XG5cbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICBpZHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIHRoaXMuX2RlbGV0ZUV2ZW50cyhpZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSAwO1xuXG4gICAgdGhpcy5fZmlyc3RNYXJrZXIgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIF9kZWxldGVFdmVudHMgKGlkKSB7XG4gICAgZGVsZXRlIHRoaXMuX21hcC5fbGVhZmxldF9ldmVudHMudmlld3Jlc2V0X2lkeFtpZF07XG4gICAgZGVsZXRlIHRoaXMuX21hcC5fbGVhZmxldF9ldmVudHMuem9vbWFuaW1faWR4W2lkXTtcbiAgfSxcbiAgX2dldE1pZGRsZUxhdExuZyAobWFya2VyMSwgbWFya2VyMikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXAsXG4gICAgICBwMSA9IG1hcC5wcm9qZWN0KG1hcmtlcjEuZ2V0TGF0TG5nKCkpLFxuICAgICAgcDIgPSBtYXAucHJvamVjdChtYXJrZXIyLmdldExhdExuZygpKTtcblxuICAgIHJldHVybiBtYXAudW5wcm9qZWN0KHAxLl9hZGQocDIpLl9kaXZpZGVCeSgyKSk7XG4gIH0sXG4gIF9yZWNhbGNQb3NpdGlvbnMgKHBvc2l0aW9uKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuXG4gICAgdmFyIGNoYW5nZVBvcyA9IGZhbHNlO1xuICAgIG1hcmtlcnMuZm9yRWFjaCgobWFya2VyLCBfcG9zaXRpb24pID0+IHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gX3Bvc2l0aW9uKSB7XG4gICAgICAgIGNoYW5nZVBvcyA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlUG9zKSB7XG4gICAgICAgIHRoaXMuX21hcmtlcnNbX3Bvc2l0aW9uXS5wb3NpdGlvbiArPSAxO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfcmVjYWxjUmVsYXRpb25zICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG5cbiAgICBtYXJrZXJzLmZvckVhY2goKG1hcmtlciwgcG9zaXRpb24pID0+IHtcblxuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiArIDEpO1xuXG4gICAgICAvLyBmaXJzdFxuICAgICAgaWYgKHBvc2l0aW9uID09PSAwKSB7XG4gICAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubGFzdE1hcmtlcigpO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBsYXN0XG4gICAgICBpZiAocG9zaXRpb24gPT09IG1hcmtlcnMubGVuZ3RoIC0gMSkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLm1hcmtlckF0KHBvc2l0aW9uIC0gMSk7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQoMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9pZHMgKCkge1xuICAgIHZhciByc2x0ID0gW107XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLl9sYXllcnMpIHtcbiAgICAgIHJzbHQucHVzaChpZCk7XG4gICAgfVxuXG4gICAgcnNsdC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG5cbiAgICByZXR1cm4gcnNsdDtcbiAgfSxcbiAgc2VsZWN0ICgpIHtcbiAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX21hcC5fc2VsZWN0ZWRNR3JvdXAgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRTZWxlY3Rpb24oKTtcbiAgICAgIG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkucmVzZXRTZWxlY3Rpb24oKTtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnNldExhc3RIb2xlKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldFNlbGVjdGlvbigpO1xuICAgICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRMYXN0SG9sZSgpO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgbWFya2VyLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgdGhpcy5fbWFwLl9zZWxlY3RlZE1Hcm91cCA9IHRoaXM7XG4gICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0Jyk7XG4gIH0sXG4gIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMDtcbiAgfSxcbiAgcmVzZXRTZWxlY3Rpb24gKCkge1xuICAgIHRoaXMuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgbWFya2VyLnVuU2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IGZhbHNlO1xuICB9XG59KSIsImV4cG9ydCBkZWZhdWx0IEwuQ29udHJvbC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICBidG5zOiBbXG4gICAgICAvL3sndGl0bGUnOiAncmVtb3ZlJywgJ2NsYXNzTmFtZSc6ICdmYSBmYS10cmFzaCd9XG4gICAgXSxcbiAgICBldmVudE5hbWU6IFwiY29udHJvbEFkZGVkXCIsXG4gICAgcHJlc3NFdmVudE5hbWU6IFwiYnRuUHJlc3NlZFwiXG4gIH0sXG4gIF9idG46IG51bGwsXG4gIHN0b3BFdmVudDogTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24sXG4gIGluaXRpYWxpemUgKG9wdGlvbnMpIHtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgfSxcbiAgX3RpdGxlQ29udGFpbmVyOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgbWFwLm9uKHRoaXMub3B0aW9ucy5wcmVzc0V2ZW50TmFtZSwgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2J0biAmJiAhTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgdGhpcy5fb25QcmVzc0J0bigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJhciBsZWFmbGV0LWVkaXRvci1idXR0b25zJyk7XG5cbiAgICBtYXAuX2NvbnRyb2xDb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2VsZi5fc2V0QnRuKG9wdGlvbnMuYnRucywgY29udGFpbmVyKTtcbiAgICAgIGlmIChvcHRpb25zLmV2ZW50TmFtZSkge1xuICAgICAgICBtYXAuZmlyZShvcHRpb25zLmV2ZW50TmFtZSwge2NvbnRyb2w6IHNlbGZ9KTtcbiAgICAgIH1cblxuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihzZWxmLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHNlbGYuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCwgdGhpcyk7XG5cbiAgICB9LCAxMDAwKTtcblxuICAgIG1hcC5nZXRCdG5Db250cm9sID0gKCkgPT4gdGhpcztcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHt9LFxuICBfb25Nb3VzZU92ZXIgKCkge30sXG4gIF9vbk1vdXNlT3V0ICgpIHt9LFxuICBfc2V0QnRuIChvcHRzLCBjb250YWluZXIpIHtcbiAgICB2YXIgX2J0bjtcbiAgICBvcHRzLmZvckVhY2goKGJ0biwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gb3B0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGJ0bi5jbGFzc05hbWUgKz0gXCIgbGFzdFwiO1xuICAgICAgfVxuICAgICAgLy92YXIgY2hpbGQgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1idG4nICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKTtcblxuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICdsZWFmbGV0LWJ0bicsIHdyYXBwZXIpO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgICB2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xuICAgICAgTC5Eb21FdmVudFxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuXG4gICAgICBsaW5rLmFwcGVuZENoaWxkKEwuRG9tVXRpbC5jcmVhdGUoJ2knLCAnZmEnICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKSk7XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCBwcmVzc0V2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIG1hcC5maXJlKHByZXNzRXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSh0aGlzLl9tYXAsIGJ0bi5wcmVzc0V2ZW50TmFtZSB8fCB0aGlzLm9wdGlvbnMucHJlc3NFdmVudE5hbWUpKTtcblxuICAgICAgTC5Eb21FdmVudC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgX2J0biA9IGxpbms7XG4gICAgfSk7XG4gICAgdGhpcy5fYnRuID0gX2J0bjtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1sndG9wbGVmdCddO1xuICB9LFxuICBnZXRCdG5BdCAocG9zKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnRuQ29udGFpbmVyKCkuY2hpbGRbcG9zXTtcbiAgfSxcbiAgZGlzYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH0sXG4gIGVuYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH1cbn0pOyIsImltcG9ydCBCdG5DdHJsIGZyb20gJy4vQnRuQ29udHJvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEJ0bkN0cmwuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIGV2ZW50TmFtZTogJ2xvYWRCdG5BZGRlZCcsXG4gICAgcHJlc3NFdmVudE5hbWU6ICdsb2FkQnRuUHJlc3NlZCdcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb250YWluZXIgPSBCdG5DdHJsLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub24oJ2xvYWRCdG5BZGRlZCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5vbignc2VhcmNoRW5hYmxlZCcsIHRoaXMuX2NvbGxhcHNlLCB0aGlzKTtcblxuICAgICAgdGhpcy5fcmVuZGVyRm9ybShjb250YWluZXIpO1xuICAgIH0pO1xuXG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKGNvbnRhaW5lciwgJ2xvYWQtanNvbi1jb250YWluZXInKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHtcbiAgICBpZiAodGhpcy5fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpO1xuICAgIH1cbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLl90ZXh0YXJlYS5mb2N1cygpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5PcGVuZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuSGlkZGVuJyk7XG4gICAgfVxuICB9LFxuICBfY29sbGFwc2UgKCkge1xuICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl90ZXh0YXJlYS52YWx1ZSA9ICcnO1xuICB9LFxuICBfcmVuZGVyRm9ybSAoY29udGFpbmVyKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gTC5Eb21VdGlsLmNyZWF0ZSgnZm9ybScpO1xuXG4gICAgdmFyIHRleHRhcmVhID0gdGhpcy5fdGV4dGFyZWEgPSBMLkRvbVV0aWwuY3JlYXRlKCd0ZXh0YXJlYScpO1xuICAgIHRleHRhcmVhLnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnO1xuICAgIHRleHRhcmVhLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgd2hpdGUnO1xuICAgIHRleHRhcmVhLnN0eWxlLnBhZGRpbmcgPSAnNXB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNHB4JztcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2NsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2RibGNsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZXdoZWVsJywgdGhpcy5zdG9wRXZlbnQpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cbiAgICB2YXIgc3VibWl0QnRuID0gdGhpcy5fc3VibWl0QnRuID0gTC5Eb21VdGlsLmNyZWF0ZSgnYnV0dG9uJywgJ2xlYWZsZXQtc3VibWl0LWJ0biBsb2FkLWdlb2pzb24nKTtcbiAgICBzdWJtaXRCdG4udHlwZSA9IFwic3VibWl0XCI7XG4gICAgc3VibWl0QnRuLmlubmVySFRNTCA9IHRoaXMuX21hcC5vcHRpb25zLnRleHQuc3VibWl0TG9hZEJ0bjtcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ21vdXNlZG93bicsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ2NsaWNrJywgdGhpcy5fc3VibWl0Rm9ybSwgdGhpcyk7XG5cbiAgICBmb3JtLmFwcGVuZENoaWxkKHN1Ym1pdEJ0bik7XG5cbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdidG4tbGVhZmxldC1tc2ctY29udGFpbmVyIHRpdGxlLWhpZGRlbicpO1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMuX21hcC5vcHRpb25zLnRleHQubG9hZEpzb247XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RpdGxlQ29udGFpbmVyKTtcbiAgfSxcbiAgX3RpbWVvdXQ6IG51bGwsXG4gIF9zdWJtaXRGb3JtICgpIHtcbiAgICBpZiAodGhpcy5fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpO1xuICAgIH1cblxuICAgIHZhciBqc29uO1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBKU09OLnBhcnNlKHRoaXMuX3RleHRhcmVhLnZhbHVlKTtcblxuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1lcnJvcicpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtc3VjY2VzcycpO1xuXG4gICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0Lmpzb25XYXNMb2FkZWQ7XG5cbiAgICAgIG1hcC5jcmVhdGVFZGl0UG9seWdvbihqc29uKTtcblxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIH0sIDIwMDApO1xuXG4gICAgICB0aGlzLl9jb2xsYXBzZSgpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5IaWRkZW4nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQuY2hlY2tKc29uO1xuXG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgICAgfSwgMjAwMCk7XG4gICAgICB0aGlzLl9jb2xsYXBzZSgpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5IaWRkZW4nKTtcbiAgICAgIHRoaXMuX21hcC5tb2RlKCdkcmF3Jyk7XG4gICAgfVxuICB9LFxuICBfb25Nb3VzZU92ZXIgKCkge1xuICAgIGlmICh0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPT09ICdibG9jaycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtZXJyb3InKTtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5fbWFwLm9wdGlvbnMudGV4dC5sb2FkSnNvbjtcbiAgfSxcbiAgX29uTW91c2VPdXQgKCkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAnbXNnY2VudGVyJyxcbiAgICBkZWZhdWx0TXNnOiBudWxsXG4gIH0sXG4gIGluaXRpYWxpemUgKG9wdGlvbnMpIHtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgfSxcbiAgX3RpdGxlQ29udGFpbmVyOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgdmFyIGNvcm5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJvdHRvbScpO1xuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1tc2ctZWRpdG9yJyk7XG5cbiAgICBtYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXSA9IGNvcm5lcjtcbiAgICBtYXAuX2NvbnRyb2xDb250YWluZXIuYXBwZW5kQ2hpbGQoY29ybmVyKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29udGFpbmVyKGNvbnRhaW5lciwgbWFwKTtcbiAgICAgIG1hcC5maXJlKCdtc2dIZWxwZXJBZGRlZCcsIHsgY29udHJvbDogdGhpcyB9KTtcblxuICAgICAgdGhpcy5fY2hhbmdlUG9zKCk7XG4gICAgfSwgMTAwMCk7XG5cbiAgICBtYXAuZ2V0QnRuQ29udHJvbCA9ICgpID0+IHRoaXM7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKG1hcCk7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfY2hhbmdlUG9zICgpIHtcbiAgICB2YXIgY29udHJvbENvcm5lciA9IHRoaXMuX21hcC5fY29udHJvbENvcm5lcnNbJ21zZ2NlbnRlciddO1xuICAgIGlmIChjb250cm9sQ29ybmVyICYmIGNvbnRyb2xDb3JuZXIuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjb250cm9sQ29ybmVyLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzBdO1xuXG4gICAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHdpZHRoID0gY2hpbGQuY2xpZW50V2lkdGg7XG4gICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgY29udHJvbENvcm5lci5zdHlsZS5sZWZ0ID0gKHRoaXMuX21hcC5fY29udGFpbmVyLmNsaWVudFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCc7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfYmluZEV2ZW50cyAoKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLl9jaGFuZ2VQb3MoKTtcbiAgICAgIH0pO1xuICAgIH0sIDEpO1xuICB9LFxuICBfc2V0Q29udGFpbmVyIChjb250YWluZXIpIHtcbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LW1zZy1jb250YWluZXIgdGl0bGUtaGlkZGVuJyk7XG4gICAgdGhpcy5fdGl0bGVQb3NDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1tc2ctY29udGFpbmVyIHRpdGxlLWhpZGRlbicpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl90aXRsZUNvbnRhaW5lcik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLl90aXRsZVBvc0NvbnRhaW5lcik7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZmF1bHRNc2cgIT09IG51bGwpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLmRlZmF1bHRNc2c7XG4gICAgfVxuICB9LFxuICBnZXRPZmZzZXQgKGVsKSB7XG4gICAgdmFyIF94ID0gMDtcbiAgICB2YXIgX3kgPSAwO1xuICAgIGlmICghdGhpcy5fbWFwLmlzRnVsbHNjcmVlbiB8fCAhdGhpcy5fbWFwLmlzRnVsbHNjcmVlbigpKSB7XG4gICAgICB3aGlsZSAoZWwgJiYgIWlzTmFOKGVsLm9mZnNldExlZnQpICYmICFpc05hTihlbC5vZmZzZXRUb3ApKSB7XG4gICAgICAgIF94ICs9IGVsLm9mZnNldExlZnQ7XG4gICAgICAgIF95ICs9IGVsLm9mZnNldFRvcDtcbiAgICAgICAgZWwgPSBlbC5vZmZzZXRQYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHk6IF95LCB4OiBfeCB9O1xuICB9LFxuICBtc2cgKHRleHQsIHR5cGUsIG9iamVjdCkge1xuICAgIGlmICghdGV4dCB8fCAhdGhpcy5fdGl0bGVQb3NDb250YWluZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAob2JqZWN0KSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVQb3NDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZVBvc0NvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVQb3NDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLmlubmVySFRNTCA9IHRleHQ7XG5cbiAgICAgIHZhciBwb2ludDtcblxuICAgICAgLy92YXIgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5fbWFwLl9jb250YWluZXIuZ2V0QXR0cmlidXRlKCdpZCcpKSk7XG4gICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQodGhpcy5fbWFwLl9jb250YWluZXIpO1xuXG4gICAgICBpZiAob2JqZWN0IGluc3RhbmNlb2YgTC5Qb2ludCkge1xuICAgICAgICBwb2ludCA9IG9iamVjdDtcbiAgICAgICAgcG9pbnQgPSB0aGlzLl9tYXAubGF5ZXJQb2ludFRvQ29udGFpbmVyUG9pbnQocG9pbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChvYmplY3QuZ2V0TGF0TG5nKCkpO1xuICAgICAgfVxuXG4gICAgICBwb2ludC54ICs9IG9mZnNldC54O1xuICAgICAgcG9pbnQueSArPSBvZmZzZXQueTtcblxuICAgICAgdGhpcy5fdGl0bGVQb3NDb250YWluZXIuc3R5bGUudG9wID0gKHBvaW50LnkgLSA4KSArIFwicHhcIjtcbiAgICAgIHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLnN0eWxlLmxlZnQgPSAocG9pbnQueCArIDEwKSArIFwicHhcIjtcblxuICAgICAgaWYgKHR5cGUpIHtcbiAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlUG9zQ29udGFpbmVyLCAndGl0bGUtJyArIHR5cGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRleHQ7XG5cbiAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLScgKyB0eXBlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NoYW5nZVBvcygpO1xuICAgIH1cbiAgfSxcbiAgaGlkZSAoKSB7XG4gICAgaWYgKHRoaXMuX3RpdGxlQ29udGFpbmVyKSB7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGl0bGVQb3NDb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZVBvc0NvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgIH1cbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gIH0sXG4gIGdldEJ0bkF0IChwb3MpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdG5Db250YWluZXIoKS5jaGlsZFtwb3NdO1xuICB9LFxuICBkaXNhYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfSxcbiAgZW5hYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Qb2x5Z29uLmV4dGVuZCh7XG4gIGlzRW1wdHkgKCkge1xuICAgIHZhciBsYXRMbmdzID0gdGhpcy5nZXRMYXRMbmdzKCk7XG4gICAgcmV0dXJuIGxhdExuZ3MgPT09IG51bGwgfHwgbGF0TG5ncyA9PT0gdW5kZWZpbmVkIHx8IChsYXRMbmdzICYmIGxhdExuZ3MubGVuZ3RoID09PSAwKTtcbiAgfSxcbiAgZ2V0SG9sZSAoaG9sZUdyb3VwTnVtYmVyKSB7XG4gICAgaWYgKCEkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdO1xuICB9LFxuICBnZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlcikge1xuICAgIGlmICghJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAhJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXTtcbiAgfSxcbiAgZ2V0SG9sZXMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ob2xlcztcbiAgfSxcbiAgY2xlYXJIb2xlcyAoKSB7XG4gICAgdGhpcy5faG9sZXMgPSBbXTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5jbGVhckhvbGVzKCk7XG5cbiAgICBpZiAoJC5pc0FycmF5KHRoaXMuX2xhdGxuZ3MpICYmIHRoaXMuX2xhdGxuZ3NbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZUhvbGVQb2ludCAoaG9sZUdyb3VwTnVtYmVyLCBob2xlTnVtYmVyLCBsYXRsbmcpIHtcbiAgICBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXSA9IGxhdGxuZztcbiAgICB9IGVsc2UgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgISQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdID0gbGF0bG5nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ob2xlcyA9IGxhdGxuZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHNldEhvbGVzIChsYXRsbmdzKSB7XG4gICAgdGhpcy5faG9sZXMgPSBsYXRsbmdzO1xuICB9LFxuICBzZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlciwgbGF0bG5nKSB7XG4gICAgdmFyIGxheWVyID0gdGhpcy5nZXRMYXllcnMoKVswXTtcbiAgICBpZiAobGF5ZXIpIHtcbiAgICAgIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICAgIGxheWVyLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdW2hvbGVOdW1iZXJdID0gbGF0bG5nO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgZW1haWw6ICcnXG4gIH0sXG5cbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYmFyIGxlYWZsZXQtc2VhcmNoLWJhcicpO1xuICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHdyYXBwZXIpO1xuICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICcnLCB3cmFwcGVyKTtcbiAgICBsaW5rLmhyZWYgPSAnIyc7XG5cbiAgICB2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBzdG9wKVxuICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBzdG9wKVxuICAgICAgLm9uKGxpbmssICdkYmxjbGljaycsIHN0b3ApXG4gICAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdClcbiAgICAgIC5vbihsaW5rLCAnY2xpY2snLCB0aGlzLl90b2dnbGUsIHRoaXMpO1xuXG4gICAgbGluay5hcHBlbmRDaGlsZChMLkRvbVV0aWwuY3JlYXRlKCdpJywgJ2ZhIGZhLXNlYXJjaCcpKTtcblxuICAgIHZhciBmb3JtID0gdGhpcy5fZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcblxuICAgIEwuRG9tRXZlbnQub24oZm9ybSwgJ21vdXNld2hlZWwnLCBzdG9wKTtcbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdET01Nb3VzZVNjcm9sbCcsIHN0b3ApO1xuICAgIEwuRG9tRXZlbnQub24oZm9ybSwgJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCBzdG9wKTtcblxuICAgIHZhciBpbnB1dCA9IHRoaXMuX2lucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbihpbnB1dCwgJ2NsaWNrJywgc3RvcClcbiAgICAgIC5vbihpbnB1dCwgJ21vdXNlZG93bicsIHN0b3ApO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZChpbnB1dCk7XG5cbiAgICB2YXIgc3VibWl0QnRuID0gdGhpcy5fc3VibWl0QnRuID0gTC5Eb21VdGlsLmNyZWF0ZSgnYnV0dG9uJywgJ2xlYWZsZXQtc3VibWl0LWJ0biBzZWFyY2gnKTtcbiAgICBzdWJtaXRCdG4udHlwZSA9IFwic3VibWl0XCI7XG5cbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24oc3VibWl0QnRuLCAnY2xpY2snLCBzdG9wKVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ21vdXNlZG93bicsIHN0b3ApXG4gICAgICAub24oc3VibWl0QnRuLCAnY2xpY2snLCB0aGlzLl9kb1NlYXJjaCwgdGhpcyk7XG5cbiAgICBmb3JtLmFwcGVuZENoaWxkKHN1Ym1pdEJ0bik7XG5cbiAgICB0aGlzLl9idG5UZXh0Q29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnc3BhbicsICd0ZXh0Jyk7XG4gICAgdGhpcy5fYnRuVGV4dENvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLl9tYXAub3B0aW9ucy50ZXh0LnN1Ym1pdExvYWRCdG47XG4gICAgc3VibWl0QnRuLmFwcGVuZENoaWxkKHRoaXMuX2J0blRleHRDb250YWluZXIpO1xuXG4gICAgdGhpcy5fc3Bpbkljb24gPSBMLkRvbVV0aWwuY3JlYXRlKCdpJywgJ2ZhIGZhLXJlZnJlc2ggZmEtc3BpbicpO1xuICAgIHN1Ym1pdEJ0bi5hcHBlbmRDaGlsZCh0aGlzLl9zcGluSWNvbik7XG5cbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdzdWJtaXQnLCBzdG9wKS5vbihmb3JtLCAnc3VibWl0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgdGhpcy5fbWFwLm9uKCdsb2FkQnRuT3BlbmVkJywgdGhpcy5fY29sbGFwc2UsIHRoaXMpO1xuXG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihjb250YWluZXIsICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihjb250YWluZXIsICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuXG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnYnRuLWxlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLl9tYXAub3B0aW9ucy50ZXh0LnNlYXJjaExvY2F0aW9uO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl90aXRsZUNvbnRhaW5lcik7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuXG4gIF90b2dnbGUgKCkge1xuICAgIGlmICh0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgIT0gJ2Jsb2NrJykge1xuICAgICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgIHRoaXMuX2lucHV0LmZvY3VzKCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnc2VhcmNoRW5hYmxlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb2xsYXBzZSgpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ3NlYXJjaERpc2FibGVkJyk7XG4gICAgfVxuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9LFxuXG4gIF9jb2xsYXBzZSAoKSB7XG4gICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRoaXMuX2lucHV0LnZhbHVlID0gJyc7XG4gIH0sXG5cbiAgX25vbWluYXRpbUNhbGxiYWNrIChyZXN1bHRzKSB7XG5cbiAgICBpZiAodGhpcy5fcmVzdWx0cyAmJiB0aGlzLl9yZXN1bHRzLnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdHMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9yZXN1bHRzKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0c0NvbnRhaW5lciA9IHRoaXMuX3Jlc3VsdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9ICc4MHB4JztcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLm92ZXJmbG93WSA9ICdhdXRvJztcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLm92ZXJmbG93WCA9ICdoaWRkZW4nO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLm1hcmdpbiA9ICczcHgnO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUucGFkZGluZyA9ICcycHgnO1xuICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYm9yZGVyID0gJzJweCBncmV5IHNvbGlkJztcbiAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLmJvcmRlclJhZGl1cyA9ICcycHgnO1xuXG4gICAgTC5Eb21FdmVudC5vbihyZXN1bHRzQ29udGFpbmVyLCAnbW91c2Vkb3duJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pO1xuICAgIEwuRG9tRXZlbnQub24ocmVzdWx0c0NvbnRhaW5lciwgJ21vdXNld2hlZWwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG4gICAgTC5Eb21FdmVudC5vbihyZXN1bHRzQ29udGFpbmVyLCAnRE9NTW91c2VTY3JvbGwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbik7XG4gICAgTC5Eb21FdmVudC5vbihyZXN1bHRzQ29udGFpbmVyLCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcblxuICAgIHZhciBkaXZSZXN1bHRzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkaXYgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnc2VhcmNoLXJlc3VsdHMtZWwnKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSByZXN1bHRzW2ldLmRpc3BsYXlfbmFtZTtcbiAgICAgIGRpdi50aXRsZSA9IHJlc3VsdHNbaV0uZGlzcGxheV9uYW1lO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICB2YXIgY2FsbGJhY2sgPSAoZnVuY3Rpb24gKG1hcCwgcmVzdWx0LCBkaXZFbCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGl2UmVzdWx0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKGRpdlJlc3VsdHNbal0sICdzZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoZGl2RWwsICdzZWxlY3RlZCcpO1xuXG4gICAgICAgICAgdmFyIGJib3ggPSByZXN1bHQuYm91bmRpbmdib3g7XG4gICAgICAgICAgbWFwLmZpdEJvdW5kcyhMLmxhdExuZ0JvdW5kcyhbW2Jib3hbMF0sIGJib3hbMl1dLCBbYmJveFsxXSwgYmJveFszXV1dKSk7XG4gICAgICAgIH1cbiAgICAgIH0odGhpcy5fbWFwLCByZXN1bHRzW2ldLCBkaXYpKTtcblxuICAgICAgTC5Eb21FdmVudC5vbihkaXYsICdjbGljaycsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcbiAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnbW91c2V3aGVlbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcbiAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnTW96TW91c2VQaXhlbFNjcm9sbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKTtcbiAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnRE9NTW91c2VTY3JvbGwnLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgLm9uKGRpdiwgJ2NsaWNrJywgY2FsbGJhY2spO1xuXG4gICAgICBkaXZSZXN1bHRzLnB1c2goZGl2KTtcbiAgICB9XG5cbiAgICB0aGlzLl9mb3JtLmFwcGVuZENoaWxkKHJlc3VsdHNDb250YWluZXIpO1xuXG4gICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9yZXN1bHRzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fcmVzdWx0cyk7XG4gICAgfVxuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9zdWJtaXRCdG4sICdsb2FkaW5nJyk7XG4gIH0sXG5cbiAgX2NhbGxiYWNrSWQ6IDAsXG5cbiAgX2RvU2VhcmNoICgpIHtcblxuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9zdWJtaXRCdG4sICdsb2FkaW5nJyk7XG5cbiAgICB2YXIgY2FsbGJhY2sgPSAnX2xfb3NtZ2VvY29kZXJfJyArIHRoaXMuX2NhbGxiYWNrSWQrKztcbiAgICB3aW5kb3dbY2FsbGJhY2tdID0gTC5VdGlsLmJpbmQodGhpcy5fbm9taW5hdGltQ2FsbGJhY2ssIHRoaXMpO1xuICAgIHZhciBxdWVyeVBhcmFtcyA9IHtcbiAgICAgIHE6IHRoaXMuX2lucHV0LnZhbHVlLFxuICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICBsaW1pdDogMTAsXG4gICAgICAnanNvbl9jYWxsYmFjayc6IGNhbGxiYWNrXG4gICAgfTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVtYWlsKVxuICAgICAgcXVlcnlQYXJhbXMuZW1haWwgPSB0aGlzLm9wdGlvbnMuZW1haWw7XG4gICAgaWYgKHRoaXMuX21hcC5nZXRCb3VuZHMoKSlcbiAgICAgIHF1ZXJ5UGFyYW1zLnZpZXdib3ggPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCkudG9CQm94U3RyaW5nKCk7XG4gICAgdmFyIHVybCA9ICdodHRwOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaCcgKyBMLlV0aWwuZ2V0UGFyYW1TdHJpbmcocXVlcnlQYXJhbXMpO1xuICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICB9LFxuICBfb25Nb3VzZU92ZXIgKCkge1xuICAgIGlmICh0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPT09ICdibG9jaycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH0sXG4gIF9vbk1vdXNlT3V0ICgpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5DbGFzcy5leHRlbmQoe1xuICBfdGltZTogMjAwMCxcbiAgaW5pdGlhbGl6ZSAobWFwLCB0ZXh0LCB0aW1lKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHRoaXMuX3BvcHVwUGFuZSA9IG1hcC5fcGFuZXMucG9wdXBQYW5lO1xuICAgIHRoaXMuX3RleHQgPSAnJyB8fCB0ZXh0O1xuICAgIHRoaXMuX2lzU3RhdGljID0gZmFsc2U7XG4gICAgdGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtdG9vbHRpcCcsIHRoaXMuX3BvcHVwUGFuZSk7XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcblxuICAgIHRoaXMuX3RpbWUgPSB0aW1lIHx8IHRoaXMuX3RpbWU7XG4gIH0sXG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgdGhpcy5fcG9wdXBQYW5lLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgICB0aGlzLl9jb250YWluZXIgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICAnc3RhdGljJyAoaXNTdGF0aWMpIHtcbiAgICB0aGlzLl9pc1N0YXRpYyA9IGlzU3RhdGljIHx8IHRoaXMuX2lzU3RhdGljO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBfcmVuZGVyICgpIHtcbiAgICB0aGlzLl9jb250YWluZXIuaW5uZXJIVE1MID0gXCI8c3Bhbj5cIiArIHRoaXMuX3RleHQgKyBcIjwvc3Bhbj5cIjtcbiAgfSxcbiAgX3VwZGF0ZVBvc2l0aW9uIChsYXRsbmcpIHtcbiAgICB2YXIgcG9zID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpLFxuICAgICAgdG9vbHRpcENvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lcjtcblxuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIHRvb2x0aXBDb250YWluZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdpbmhlcml0JztcbiAgICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0b29sdGlwQ29udGFpbmVyLCBwb3MpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9zaG93RXJyb3IgKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWVycm9yLXRvb2x0aXAnKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24obGF0bG5nKTtcblxuICAgIGlmICghdGhpcy5faXNTdGF0aWMpIHtcbiAgICAgIHRoaXMuX21hcC5vbignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfc2hvd0luZm8gKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWluZm8tdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihsYXRsbmcpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1N0YXRpYykge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9oaWRlICgpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1zaG93Jyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1pbmZvLXRvb2x0aXAnKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWVycm9yLXRvb2x0aXAnKTtcbiAgICB9XG4gICAgdGhpcy5fbWFwLm9mZignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHRleHQgKHRleHQpIHtcbiAgICB0aGlzLl90ZXh0ID0gdGV4dCB8fCB0aGlzLl90ZXh0O1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9LFxuICBzaG93IChsYXRsbmcsIHR5cGUgPSAnaW5mbycpIHtcblxuICAgIHRoaXMudGV4dCgpO1xuXG4gICAgaWYodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgdGhpcy5zaG93RXJyb3IobGF0bG5nKTtcbiAgICB9XG4gICAgaWYodHlwZSA9PT0gJ2luZm8nKSB7XG4gICAgICB0aGlzLnNob3dJbmZvKGxhdGxuZyk7XG4gICAgfVxuICB9LFxuICBzaG93SW5mbyAobGF0bG5nKSB7XG4gICAgdGhpcy5fc2hvd0luZm8obGF0bG5nKTtcblxuICAgIGlmICh0aGlzLl9oaWRlSW5mb1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlSW5mb1RpbWVvdXQpO1xuICAgICAgdGhpcy5faGlkZUluZm9UaW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9oaWRlSW5mb1RpbWVvdXQgPSBzZXRUaW1lb3V0KEwuVXRpbC5iaW5kKHRoaXMuaGlkZSwgdGhpcyksIHRoaXMuX3RpbWUpO1xuICB9LFxuICBzaG93RXJyb3IgKGxhdGxuZykge1xuICAgIHRoaXMuX3Nob3dFcnJvcihsYXRsbmcpO1xuXG4gICAgaWYgKHRoaXMuX2hpZGVFcnJvclRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlRXJyb3JUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2hpZGVFcnJvclRpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVFcnJvclRpbWVvdXQgPSBzZXRUaW1lb3V0KEwuVXRpbC5iaW5kKHRoaXMuaGlkZSwgdGhpcyksIHRoaXMuX3RpbWUpO1xuICB9LFxuICBoaWRlICgpIHtcbiAgICB0aGlzLl9oaWRlKCk7XG4gIH0sXG4gIF9vbk1vdXNlTW92ZSAoZSkge1xuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGUubGF0bG5nKTtcbiAgfSxcbiAgc2V0VGltZSAodGltZSkge1xuICAgIGlmICh0aW1lKSB7XG4gICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICB9XG4gIH1cbn0pOyIsImltcG9ydCBCdG5DdHJsIGZyb20gJy4vQnRuQ29udHJvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEJ0bkN0cmwuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIGV2ZW50TmFtZTogJ3RyYXNoQWRkZWQnLFxuICAgIHByZXNzRXZlbnROYW1lOiAndHJhc2hCdG5QcmVzc2VkJ1xuICB9LFxuICBfYnRuOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgbWFwLm9uKCd0cmFzaEFkZGVkJywgKGRhdGEpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhkYXRhLmNvbnRyb2wuX2J0biwgJ2Rpc2FibGVkJyk7XG5cbiAgICAgIG1hcC5vbignZWRpdG9yOm1hcmtlcl9ncm91cF9zZWxlY3QnLCB0aGlzLl9iaW5kRXZlbnRzLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOnN0YXJ0X2FkZF9uZXdfcG9seWdvbicsIHRoaXMuX2JpbmRFdmVudHMsIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6c3RhcnRfYWRkX25ld19ob2xlJywgdGhpcy5fYmluZEV2ZW50cywgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfaG9sZScsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6bWFwX2NsZWFyZWQnLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcblxuICAgICAgdGhpcy5fZGlzYWJsZUJ0bigpO1xuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IEJ0bkN0cmwucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2J0bi1sZWFmbGV0LW1zZy1jb250YWluZXIgdGl0bGUtaGlkZGVuJyk7XG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5fbWFwLm9wdGlvbnMudGV4dC5sb2FkSnNvbjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX2JpbmRFdmVudHMgKCkge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnY2xpY2snLCB0aGlzLl9vblByZXNzQnRuLCB0aGlzKTtcbiAgfSxcbiAgX2Rpc2FibGVCdG4gKCkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3Zlcik7XG4gICAgTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQpO1xuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnY2xpY2snLCB0aGlzLl9vblByZXNzQnRuLCB0aGlzKTtcbiAgfSxcbiAgX29uUHJlc3NCdG4gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gbWFwLmdldFNlbGVjdGVkTUdyb3VwKCk7XG5cbiAgICBpZiAoc2VsZWN0ZWRNR3JvdXAgPT09IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkgJiYgc2VsZWN0ZWRNR3JvdXAuZ2V0TGF5ZXJzKClbMF0uX2lzRmlyc3QpIHtcbiAgICAgIG1hcC5jbGVhcigpO1xuICAgICAgbWFwLm1vZGUoJ2RyYXcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RlZE1Hcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOnBvbHlnb246ZGVsZXRlZCcpO1xuICAgIH1cbiAgICB0aGlzLl9vbk1vdXNlT3V0KCk7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH0sXG4gIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgaWYgKCFMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKSkge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIHZhciBsYXllciA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKClbMF07XG4gICAgICBpZiAobGF5ZXIgJiYgbGF5ZXIuX2lzRmlyc3QpIHtcbiAgICAgICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC5yZWplY3RDaGFuZ2VzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fdGl0bGVDb250YWluZXIuaW5uZXJIVE1MID0gbWFwLm9wdGlvbnMudGV4dC5kZWxldGVTZWxlY3RlZEVkZ2VzO1xuICAgICAgfVxuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfVxuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgaWYgKCFMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKSkge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfVxuICB9XG59KTsiLCJpbXBvcnQgU2VhcmNoQnRuIGZyb20gJy4uL2V4dGVuZGVkL1NlYXJjaEJ0bic7XG5pbXBvcnQgVHJhc2hCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvVHJhc2hCdG4nO1xuaW1wb3J0IExvYWRCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvTG9hZEJ0bic7XG5pbXBvcnQgQnRuQ29udHJvbCBmcm9tICcuLi9leHRlbmRlZC9CdG5Db250cm9sJztcbmltcG9ydCBNc2dIZWxwZXIgZnJvbSAnLi4vZXh0ZW5kZWQvTXNnSGVscGVyJztcbmltcG9ydCBtIGZyb20gJy4uL3V0aWxzL21vYmlsZSc7XG5cbmltcG9ydCB6b29tVGl0bGUgZnJvbSAnLi4vdGl0bGVzL3pvb21UaXRsZSc7XG5pbXBvcnQgZnVsbFNjcmVlblRpdGxlIGZyb20gJy4uL3RpdGxlcy9mdWxsU2NyZWVuVGl0bGUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG5cbiAgem9vbVRpdGxlKHRoaXMpO1xuICBmdWxsU2NyZWVuVGl0bGUodGhpcyk7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0Q29udHJvbExheWVycykge1xuICAgIHZhciBnZ2wgPSBuZXcgTC5Hb29nbGUoKTtcblxuICAgIHRoaXMuYWRkTGF5ZXIoZ2dsKTtcblxuICAgIHRoaXMuX2NvbnRyb2xMYXllcnMgPSBuZXcgTC5Db250cm9sLkxheWVycyh7XG4gICAgICBHb29nbGU6IGdnbCxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29udHJvbCh0aGlzLl9jb250cm9sTGF5ZXJzKTtcbiAgfVxuXG4gIHRoaXMudG91Y2hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5kb3VibGVDbGlja1pvb20uZGlzYWJsZSgpO1xuXG4gIC8vdGhpcy5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICB0aGlzLmJveFpvb20uZGlzYWJsZSgpO1xuICB0aGlzLmtleWJvYXJkLmRpc2FibGUoKTtcblxuICB2YXIgY29udHJvbHMgPSB0aGlzLm9wdGlvbnMuY29udHJvbHM7XG5cbiAgaWYgKGNvbnRyb2xzKSB7XG4gICAgaWYgKGNvbnRyb2xzLmdlb1NlYXJjaCkge1xuICAgICAgdGhpcy5hZGRDb250cm9sKG5ldyBTZWFyY2hCdG4oKSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5fQnRuQ29udHJvbCA9IEJ0bkNvbnRyb2w7XG5cbiAgdmFyIHRyYXNoQnRuID0gbmV3IFRyYXNoQnRuKHtcbiAgICBidG5zOiBbXG4gICAgICB7IGNsYXNzTmFtZTogJ2ZhIGZhLXRyYXNoJyB9LFxuICAgIF0sXG4gIH0pO1xuXG4gIGxldCBsb2FkQnRuO1xuXG4gIGlmIChjb250cm9scyAmJiBjb250cm9scy5sb2FkQnRuKSB7XG4gICAgbG9hZEJ0biA9IG5ldyBMb2FkQnRuKHtcbiAgICAgIGJ0bnM6IFtcbiAgICAgICAgeyBjbGFzc05hbWU6ICdmYSBmYS1hcnJvdy1jaXJjbGUtby1kb3duIGxvYWQnIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG5cbiAgdmFyIG1zZ0hlbHBlciA9IHRoaXMubXNnSGVscGVyID0gbmV3IE1zZ0hlbHBlcih7XG4gICAgZGVmYXVsdE1zZzogdGhpcy5vcHRpb25zLnRleHQuY2xpY2tUb1N0YXJ0RHJhd1BvbHlnb25Pbk1hcCxcbiAgfSk7XG5cbiAgdGhpcy5vbignbXNnSGVscGVyQWRkZWQnLCAoKSA9PiB7XG4gICAgdmFyIHRleHQgPSB0aGlzLm9wdGlvbnMudGV4dDtcblxuICAgIHRoaXMub24oJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0JywgKCkgPT4ge1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6bm90X3NlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb1NlbGVjdEVkZ2VzLCBudWxsLCBkYXRhLm1hcmtlcik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG1zZ0hlbHBlci5tc2codGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcywgbnVsbCwgZGF0YS5tYXJrZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG1zZ0hlbHBlci5tc2codGV4dC5jbGlja1RvQWRkTmV3RWRnZXMsIG51bGwsIGRhdGEubWFya2VyKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBvbiBlZGl0IHBvbHlnb25cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlbW92ZScpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW1vdmUnLCAoZGF0YSkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb0RyYXdJbm5lckVkZ2VzLCBudWxsLCBkYXRhLmxheWVyUG9pbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIuaGlkZSgpO1xuICAgICAgICB0aGlzLl9zdG9yZWRMYXllclBvaW50ID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBvbiB2aWV3IHBvbHlnb25cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlbW92ZScpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW1vdmUnLCAoZGF0YSkgPT4ge1xuICAgICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb0VkaXQsIG51bGwsIGRhdGEubGF5ZXJQb2ludCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICAgIG1zZ0hlbHBlci5oaWRlKCk7XG4gICAgICAgIHRoaXMuX3N0b3JlZExheWVyUG9pbnQgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBoaWRlIG1zZ1xuICAgIHRoaXMub2ZmKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgdGhpcy5vbignZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgIG1zZ0hlbHBlci5oaWRlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBvbiBzdGFydCBkcmF3IHBvbHlnb25cbiAgICB0aGlzLm9mZignZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICB0aGlzLm9uKCdlZGl0b3I6Zmlyc3RfbWFya2VyX21vdXNlb3ZlcicsIChkYXRhKSA9PiB7XG4gICAgICBtc2dIZWxwZXIubXNnKHRleHQuY2xpY2tUb0pvaW5FZGdlcywgbnVsbCwgZGF0YS5tYXJrZXIpO1xuICAgIH0pO1xuXG4gICAgLy8gZGJsY2xpY2sgdG8gam9pblxuICAgIHRoaXMub2ZmKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicsIChkYXRhKSA9PiB7XG4gICAgICBtc2dIZWxwZXIubXNnKHRleHQuZGJsY2xpY2tUb0pvaW5FZGdlcywgbnVsbCwgZGF0YS5tYXJrZXIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZWRpdG9yOmpvaW5fcGF0aCcsIChkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5tYXJrZXIpIHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcywgbnVsbCwgZGF0YS5tYXJrZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy90b2RvOiBjb250aW51ZSB3aXRoIG9wdGlvbiAnYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uJ1xuICAgIHRoaXMub24oJ2VkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWQnLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gbXNnXG4gICAgICBpZiAoZGF0YS5pbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgbXNnSGVscGVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5pbnRlcnNlY3Rpb24sICdlcnJvcicsICh0aGlzLl9zdG9yZWRMYXllclBvaW50IHx8IHRoaXMuZ2V0U2VsZWN0ZWRNYXJrZXIoKSkpO1xuICAgICAgICB0aGlzLl9zdG9yZWRMYXllclBvaW50ID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1zZ0hlbHBlci5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWxlY3RlZE1hcmtlciA9IHRoaXMuZ2V0U2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgaWYgKCF0aGlzLmhhc0xheWVyKHNlbGVjdGVkTWFya2VyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxlY3RlZE1hcmtlciAmJiAhc2VsZWN0ZWRNYXJrZXIuX21Hcm91cC5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICAgIC8vc2V0IG1hcmtlciBzdHlsZVxuICAgICAgICBpZiAoZGF0YS5pbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAvL3NldCAnZXJyb3InIHN0eWxlXG4gICAgICAgICAgc2VsZWN0ZWRNYXJrZXIuc2V0SW50ZXJzZWN0ZWRTdHlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vcmVzdG9yZSBzdHlsZVxuICAgICAgICAgIHNlbGVjdGVkTWFya2VyLnJlc2V0U3R5bGUoKTtcblxuICAgICAgICAgIC8vcmVzdG9yZSBvdGhlciBtYXJrZXJzIHdoaWNoIGFyZSBhbHNvIG5lZWQgdG8gcmVzZXQgc3R5bGVcbiAgICAgICAgICB2YXIgbWFya2Vyc1RvUmVzZXQgPSBzZWxlY3RlZE1hcmtlci5fbUdyb3VwLmdldExheWVycygpLmZpbHRlcigobGF5ZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3MobGF5ZXIuX2ljb24sICdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hcmtlcnNUb1Jlc2V0Lm1hcCgobWFya2VyKSA9PiBtYXJrZXIucmVzZXRTdHlsZSgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBpZiAoIW0uaXNNb2JpbGVCcm93c2VyKCkpIHtcbiAgICB0aGlzLmFkZENvbnRyb2wobXNnSGVscGVyKTtcblxuICAgIGlmIChjb250cm9scyAmJiBjb250cm9scy5sb2FkQnRuKSB7XG4gICAgICB0aGlzLmFkZENvbnRyb2wobG9hZEJ0bik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbnRyb2xzICYmIGNvbnRyb2xzLnRyYXNoQnRuKSB7XG4gICAgdGhpcy5hZGRDb250cm9sKHRyYXNoQnRuKTtcbiAgfVxufVxuIiwiaW1wb3J0IG1hcCBmcm9tICcuL21hcCc7XG5cbndpbmRvdy5MZWFmbGV0RWRpdG9yID0gbWFwKCdtYXBib3gnKTsiLCJpbXBvcnQgVmlld0dyb3VwIGZyb20gJy4vdmlldy9ncm91cCc7XG5pbXBvcnQgRWRpdFBvbHlnb24gZnJvbSAnLi9lZGl0L3BvbHlnb24nO1xuaW1wb3J0IEhvbGVzR3JvdXAgZnJvbSAnLi9lZGl0L2hvbGVzR3JvdXAnO1xuaW1wb3J0IEVkaXRMaW5lR3JvdXAgZnJvbSAnLi9lZGl0L2xpbmUnO1xuaW1wb3J0IERhc2hlZEVkaXRMaW5lR3JvdXAgZnJvbSAnLi9kcmF3L2Rhc2hlZC1saW5lJztcbmltcG9ydCBEcmF3R3JvdXAgZnJvbSAnLi9kcmF3L2dyb3VwJztcblxuaW1wb3J0ICcuL2VkaXQvbWFya2VyLWdyb3VwJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICB2aWV3R3JvdXA6IG51bGwsXG4gIGVkaXRHcm91cDogbnVsbCxcbiAgZWRpdFBvbHlnb246IG51bGwsXG4gIGVkaXRNYXJrZXJzR3JvdXA6IG51bGwsXG4gIGVkaXRMaW5lR3JvdXA6IG51bGwsXG4gIGRhc2hlZEVkaXRMaW5lR3JvdXA6IG51bGwsXG4gIGVkaXRIb2xlTWFya2Vyc0dyb3VwOiBudWxsLFxuICBzZXRMYXllcnMgKCkge1xuICAgIHRoaXMudmlld0dyb3VwID0gbmV3IFZpZXdHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0R3JvdXAgPSBuZXcgRHJhd0dyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRQb2x5Z29uID0gbmV3IEVkaXRQb2x5Z29uKFtdKTtcbiAgICB0aGlzLmVkaXRNYXJrZXJzR3JvdXAgPSBuZXcgTC5NYXJrZXJHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0TGluZUdyb3VwID0gbmV3IEVkaXRMaW5lR3JvdXAoW10pO1xuICAgIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cCA9IG5ldyBEYXNoZWRFZGl0TGluZUdyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRIb2xlTWFya2Vyc0dyb3VwID0gbmV3IEhvbGVzR3JvdXAoW10pO1xuICB9XG59IiwiaW1wb3J0IEJhc2UgZnJvbSAnLi9iYXNlJztcbmltcG9ydCBDb250cm9sc0hvb2sgZnJvbSAnLi9ob29rcy9jb250cm9scyc7XG5cbmltcG9ydCAqIGFzIGxheWVycyBmcm9tICcuL2xheWVycyc7XG5pbXBvcnQgKiBhcyBvcHRzIGZyb20gJy4vb3B0aW9ucyc7XG5cbmltcG9ydCAnLi91dGlscy9hcnJheSc7XG5cbmZ1bmN0aW9uIG1hcCh0eXBlKSB7XG4gIGxldCBJbnN0YW5jZSA9ICh0eXBlID09PSAnbWFwYm94JykgPyBMLm1hcGJveC5NYXAgOiBMLk1hcDtcbiAgdmFyIG1hcCA9IEluc3RhbmNlLmV4dGVuZCgkLmV4dGVuZChCYXNlLCB7XG4gICAgJDogdW5kZWZpbmVkLFxuICAgIGluaXRpYWxpemUgKGlkLCBvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucy50ZXh0KSB7XG4gICAgICAgICQuZXh0ZW5kKG9wdHMub3B0aW9ucy50ZXh0LCBvcHRpb25zLnRleHQpO1xuICAgICAgICBkZWxldGUgb3B0aW9ucy50ZXh0O1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udHJvbHMgPSBvcHRpb25zLmNvbnRyb2xzO1xuICAgICAgaWYgKGNvbnRyb2xzKSB7XG4gICAgICAgIGlmIChjb250cm9scy56b29tID09PSBmYWxzZSkge1xuICAgICAgICAgIG9wdGlvbnMuem9vbUNvbnRyb2wgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL2lmIChvcHRpb25zLmRyYXdMaW5lU3R5bGUpIHtcbiAgICAgIC8vICAkLmV4dGVuZChvcHRzLm9wdGlvbnMuZHJhd0xpbmVTdHlsZSwgb3B0aW9ucy5kcmF3TGluZVN0eWxlKTtcbiAgICAgIC8vICBkZWxldGUgb3B0aW9ucy5kcmF3TGluZVN0eWxlO1xuICAgICAgLy99XG4gICAgICBpZiAob3B0aW9ucy5zdHlsZSkge1xuICAgICAgICBpZiAob3B0aW9ucy5zdHlsZS5kcmF3KSB7XG4gICAgICAgICAgJC5leHRlbmQob3B0cy5vcHRpb25zLnN0eWxlLmRyYXcsIG9wdGlvbnMuc3R5bGUuZHJhdyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9kZWxldGUgb3B0aW9ucy5zdHlsZS5kcmF3O1xuICAgICAgICBpZiAob3B0aW9ucy5zdHlsZS52aWV3KSB7XG4gICAgICAgICAgJC5leHRlbmQob3B0cy5vcHRpb25zLnN0eWxlLnZpZXcsIG9wdGlvbnMuc3R5bGUudmlldyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuc3R5bGUuc3RhcnREcmF3KSB7XG4gICAgICAgICAgJC5leHRlbmQob3B0cy5vcHRpb25zLnN0eWxlLnN0YXJ0RHJhdywgb3B0aW9ucy5zdHlsZS5zdGFydERyYXcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnN0eWxlLmRyYXdMaW5lKSB7XG4gICAgICAgICAgJC5leHRlbmQob3B0cy5vcHRpb25zLnN0eWxlLmRyYXdMaW5lLCBvcHRpb25zLnN0eWxlLmRyYXdMaW5lKTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgb3B0aW9ucy5zdHlsZTtcbiAgICAgIH1cblxuICAgICAgJC5leHRlbmQodGhpcy5vcHRpb25zLCBvcHRzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgLy9MLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRzLm9wdGlvbnMpO1xuXG4gICAgICBpZiAodHlwZSA9PT0gJ21hcGJveCcpIHtcbiAgICAgICAgTC5tYXBib3guTWFwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgaWQsIHRoaXMub3B0aW9ucy5tYXBib3hJZCwgdGhpcy5vcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEwuTWFwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgaWQsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJCA9ICQodGhpcy5fY29udGFpbmVyKTtcblxuICAgICAgbGF5ZXJzLnNldExheWVycygpO1xuXG4gICAgICB0aGlzLl9hZGRMYXllcnMoW1xuICAgICAgICBsYXllcnMudmlld0dyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0UG9seWdvblxuICAgICAgICAsIGxheWVycy5lZGl0TWFya2Vyc0dyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRMaW5lR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZGFzaGVkRWRpdExpbmVHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0SG9sZU1hcmtlcnNHcm91cFxuICAgICAgXSk7XG5cbiAgICAgIHRoaXMuX3NldE92ZXJsYXlzKG9wdGlvbnMpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG9EcmF3KSB7XG4gICAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX3NldE92ZXJsYXlzIChvcHRzKSB7XG4gICAgICB2YXIgb3ZlcmxheXMgPSBvcHRzLm92ZXJsYXlzO1xuXG4gICAgICBmb3IgKHZhciBpIGluIG92ZXJsYXlzKSB7XG4gICAgICAgIHZhciBvaSA9IG92ZXJsYXlzW2ldO1xuICAgICAgICB0aGlzLl9jb250cm9sTGF5ZXJzLmFkZE92ZXJsYXkob2ksIGkpO1xuICAgICAgICBvaS5hZGRUbyh0aGlzKTtcbiAgICAgICAgb2kuYnJpbmdUb0JhY2soKTtcbiAgICAgICAgb2kub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9pLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRWR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy52aWV3R3JvdXA7XG4gICAgfSxcbiAgICBnZXRFR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0R3JvdXA7XG4gICAgfSxcbiAgICBnZXRFUG9seWdvbiAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRQb2x5Z29uO1xuICAgIH0sXG4gICAgZ2V0RU1hcmtlcnNHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRNYXJrZXJzR3JvdXA7XG4gICAgfSxcbiAgICBnZXRFTGluZUdyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdExpbmVHcm91cDtcbiAgICB9LFxuICAgIGdldERFTGluZSAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmRhc2hlZEVkaXRMaW5lR3JvdXA7XG4gICAgfSxcbiAgICBnZXRFSE1hcmtlcnNHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRIb2xlTWFya2Vyc0dyb3VwO1xuICAgIH0sXG4gICAgZ2V0U2VsZWN0ZWRQb2x5Z29uOiAoKSA9PiB0aGlzLl9zZWxlY3RlZFBvbHlnb24sXG4gICAgZ2V0U2VsZWN0ZWRNR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTUdyb3VwO1xuICAgIH1cbiAgfSkpO1xuXG4gIG1hcC5hZGRJbml0SG9vayhDb250cm9sc0hvb2spO1xuXG4gIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1hcDsiLCJpbXBvcnQgbSBmcm9tICcuL3V0aWxzL21vYmlsZSc7XG5cbnZhciBzaXplID0gMTtcbnZhciB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbmlmIChtLmlzTW9iaWxlQnJvd3NlcigpKSB7XG4gIHNpemUgPSAyO1xufVxuXG5leHBvcnQgdmFyIGZpcnN0SWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvbi1maXJzdFwiLFxuICBpY29uU2l6ZTogWzEwICogc2l6ZSwgMTAgKiBzaXplXVxufSk7XG5cbmV4cG9ydCB2YXIgaWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvblwiLFxuICBpY29uU2l6ZTogWzEwICogc2l6ZSwgMTAgKiBzaXplXVxufSk7XG5cbmV4cG9ydCB2YXIgZHJhZ0ljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb24tZHJhZ1wiLFxuICBpY29uU2l6ZTogWzEwICogc2l6ZSAqIDMsIDEwICogc2l6ZSAqIDNdXG59KTtcblxuZXhwb3J0IHZhciBtaWRkbGVJY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLW1pZGRsZS1kaXYtaWNvblwiLFxuICBpY29uU2l6ZTogWzEwICogc2l6ZSwgMTAgKiBzaXplXVxuXG59KTtcblxuLy8gZGlzYWJsZSBob3ZlciBpY29uIHRvIHNpbXBsaWZ5XG5cbmV4cG9ydCB2YXIgaG92ZXJJY29uID0gaWNvbiB8fCBMLmRpdkljb24oe1xuICAgIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvblwiLFxuICAgIGljb25TaXplOiBbMiAqIDcgKiBzaXplLCAyICogNyAqIHNpemVdXG4gIH0pO1xuXG5leHBvcnQgdmFyIGludGVyc2VjdGlvbkljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMiAqIDcgKiBzaXplLCAyICogNyAqIHNpemVdXG59KTsiLCJ2YXIgdmlld0NvbG9yID0gJyMwMEZGRkYnO1xudmFyIGRyYXdDb2xvciA9ICcjMDBGODAwJztcbnZhciB3ZWlnaHQgPSAzO1xuXG5leHBvcnQgdmFyIG9wdGlvbnMgPSB7XG4gIGFsbG93SW50ZXJzZWN0aW9uOiBmYWxzZSxcbiAgYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uOiBmYWxzZSwgLy90b2RvOiB1bmZpbmlzaGVkXG4gIGZvcmNlVG9EcmF3OiB0cnVlLFxuICB0cmFuc2xhdGlvbnM6IHtcbiAgICByZW1vdmVQb2x5Z29uOiAncmVtb3ZlIHBvbHlnb24nLFxuICAgIHJlbW92ZVBvaW50OiAncmVtb3ZlIHBvaW50J1xuICB9LFxuICBvdmVybGF5czoge30sXG4gIGRlZmF1bHRDb250cm9sTGF5ZXJzOiB0cnVlLFxuICBzdHlsZToge1xuICAgIHZpZXc6IHtcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjIsXG4gICAgICBkYXNoQXJyYXk6IG51bGwsXG4gICAgICBjbGlja2FibGU6IGZhbHNlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiB2aWV3Q29sb3IsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH0sXG4gICAgZHJhdzoge1xuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMixcbiAgICAgIGRhc2hBcnJheTogJzUsIDEwJyxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBjb2xvcjogZHJhd0NvbG9yLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRcbiAgICB9LFxuICAgIHN0YXJ0RHJhdzoge30sXG4gICAgZHJhd0xpbmU6IHtcbiAgICAgIG9wYWNpdHk6IDAuNyxcbiAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgZmlsbENvbG9yOiBkcmF3Q29sb3IsXG4gICAgICBjb2xvcjogZHJhd0NvbG9yLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHQsXG4gICAgICBkYXNoQXJyYXk6ICc1LCAxMCcsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBjbGlja2FibGU6IGZhbHNlXG4gICAgfVxuICB9LFxuICBtYXJrZXJJY29uOiB1bmRlZmluZWQsXG4gIG1hcmtlckhvdmVySWNvbjogdW5kZWZpbmVkLFxuICBlcnJvckxpbmVTdHlsZToge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICB3ZWlnaHQ6IDMsXG4gICAgb3BhY2l0eTogMSxcbiAgICBzbW9vdGhGYWN0b3I6IDFcbiAgfSxcbiAgcHJldmlld0Vycm9yTGluZVN0eWxlOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHdlaWdodDogMyxcbiAgICBvcGFjaXR5OiAxLFxuICAgIHNtb290aEZhY3RvcjogMSxcbiAgICBkYXNoQXJyYXk6ICc1LCAxMCdcbiAgfSxcbiAgdGV4dDoge1xuICAgIGludGVyc2VjdGlvbjogJ1NlbGYtaW50ZXJzZWN0aW9uIGlzIHByb2hpYml0ZWQnLFxuICAgIGRlbGV0ZVBvaW50SW50ZXJzZWN0aW9uOiAnRGVsZXRpb24gb2YgcG9pbnQgaXMgbm90IHBvc3NpYmxlLiBTZWxmLWludGVyc2VjdGlvbiBpcyBwcm9oaWJpdGVkJyxcbiAgICByZW1vdmVQb2x5Z29uOiAnUmVtb3ZlIHBvbHlnb24nLFxuICAgIGNsaWNrVG9FZGl0OiAnY2xpY2sgdG8gZWRpdCcsXG4gICAgY2xpY2tUb0FkZE5ld0VkZ2VzOiAnPGRpdj5jbGljayZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9XFwnbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uIHN0YXRpYyBncm91cC1zZWxlY3RlZFxcJz48L2Rpdj4mbmJzcDsmbmJzcDt0byBhZGQgbmV3IGVkZ2VzPC9kaXY+JyxcbiAgICBjbGlja1RvRHJhd0lubmVyRWRnZXM6ICdjbGljayB0byBkcmF3IGlubmVyIGVkZ2VzJyxcbiAgICBjbGlja1RvSm9pbkVkZ2VzOiAnY2xpY2sgdG8gam9pbiBlZGdlcycsXG4gICAgY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXM6ICc8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz1cXCdtLWVkaXRvci1kaXYtaWNvbiBzdGF0aWMgZ3JvdXAtc2VsZWN0ZWRcXCc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gcmVtb3ZlIGVkZ2UmbmJzcDsmbmJzcDtvcjxicj5jbGljayZuYnNwOyZuYnNwOzxpIGNsYXNzPVxcJ2ZhIGZhLXRyYXNoXFwnPjwvaT4mbmJzcDsmbmJzcDt0byByZW1vdmUgYWxsIHNlbGVjdGVkIGVkZ2VzPC9kaXY+JyxcbiAgICBjbGlja1RvU2VsZWN0RWRnZXM6ICc8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz1cXCdtLWVkaXRvci1kaXYtaWNvbiBzdGF0aWNcXCc+PC9kaXY+Jm5ic3A7LyZuYnNwOzxkaXYgY2xhc3M9XFwnbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uIHN0YXRpY1xcJz48L2Rpdj4mbmJzcDsmbmJzcDt0byBzZWxlY3QgZWRnZXM8L2Rpdj4nLFxuICAgIGRibGNsaWNrVG9Kb2luRWRnZXM6ICdkb3VibGUgY2xpY2sgdG8gam9pbiBlZGdlcycsXG4gICAgY2xpY2tUb1N0YXJ0RHJhd1BvbHlnb25Pbk1hcDogJ2NsaWNrIHRvIHN0YXJ0IGRyYXcgcG9seWdvbiBvbiBtYXAnLFxuICAgIGRlbGV0ZVNlbGVjdGVkRWRnZXM6ICdkZWxldGVkIHNlbGVjdGVkIGVkZ2VzJyxcbiAgICByZWplY3RDaGFuZ2VzOiAncmVqZWN0IGNoYW5nZXMnLFxuICAgIGpzb25XYXNMb2FkZWQ6ICdKU09OIHdhcyBsb2FkZWQnLFxuICAgIGNoZWNrSnNvbjogJ2NoZWNrIEpTT04nLFxuICAgIGxvYWRKc29uOiAnbG9hZCBHZW9KU09OJyxcbiAgICBmb3JnZXRUb1NhdmU6ICdTYXZlIGNoYW5nZXMgYnkgcHJlc3Npbmcgb3V0c2lkZSBvZiBwb2x5Z29uJyxcbiAgICBzZWFyY2hMb2NhdGlvbjogJ1NlYXJjaCBsb2NhdGlvbicsXG4gICAgc3VibWl0TG9hZEJ0bjogJ3N1Ym1pdCcsXG4gICAgem9vbTogJ1pvb20nLFxuICAgIGhpZGVGdWxsU2NyZWVuOiAnSGlkZSBmdWxsIHNjcmVlbicsXG4gICAgc2hvd0Z1bGxTY3JlZW46ICdTaG93IGZ1bGwgc2NyZWVuJ1xuICB9LFxuICB3b3JsZENvcHlKdW1wOiB0cnVlXG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG1hcCkge1xuICBpZiAoIW1hcC5vcHRpb25zLmZ1bGxzY3JlZW5Db250cm9sKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGxpbmsgPSBtYXAuZnVsbHNjcmVlbkNvbnRyb2wubGluaztcbiAgbGluay50aXRsZSA9IFwiXCI7XG4gIEwuRG9tVXRpbC5hZGRDbGFzcyhsaW5rLCAnZnVsbC1zY3JlZW4nKTtcblxuICBtYXAub2ZmKCdmdWxsc2NyZWVuY2hhbmdlJyk7XG4gIG1hcC5vbignZnVsbHNjcmVlbmNoYW5nZScsICgpID0+IHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3MobWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcblxuICAgIGlmIChtYXAuaXNGdWxsc2NyZWVuKCkpIHtcbiAgICAgIG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQuaGlkZUZ1bGxTY3JlZW47XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQuc2hvd0Z1bGxTY3JlZW47XG4gICAgfVxuICB9LCB0aGlzKTtcblxuICB2YXIgZnVsbFNjcmVlbkNvbnRhaW5lciA9IG1hcC5mdWxsc2NyZWVuQ29udHJvbC5fY29udGFpbmVyO1xuXG4gIG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2J0bi1sZWFmbGV0LW1zZy1jb250YWluZXIgdGl0bGUtaGlkZGVuJyk7XG4gIG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcC5vcHRpb25zLnRleHQuc2hvd0Z1bGxTY3JlZW47XG4gIGZ1bGxTY3JlZW5Db250YWluZXIuYXBwZW5kQ2hpbGQobWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIpO1xuXG4gIHZhciBfb25Nb3VzZU92ZXIgPSAoKSA9PiB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKG1hcC5fdGl0bGVGdWxsU2NyZWVuQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gIH07XG4gIHZhciBfb25Nb3VzZU91dCA9ICgpID0+IHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3MobWFwLl90aXRsZUZ1bGxTY3JlZW5Db250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgfTtcblxuICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGZ1bGxTY3JlZW5Db250YWluZXIsICdtb3VzZW92ZXInLCBfb25Nb3VzZU92ZXIsIHRoaXMpO1xuICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGZ1bGxTY3JlZW5Db250YWluZXIsICdtb3VzZW91dCcsIF9vbk1vdXNlT3V0LCB0aGlzKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAobWFwKSB7XG4gIHZhciBjb250cm9scyA9IG1hcC5vcHRpb25zLmNvbnRyb2xzO1xuICBpZiAoY29udHJvbHMgJiYgIWNvbnRyb2xzLnpvb20pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZighbWFwLnpvb21Db250cm9sKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHpvb21Db250YWluZXIgPSBtYXAuem9vbUNvbnRyb2wuX2NvbnRhaW5lcjtcbiAgbWFwLl90aXRsZVpvb21Db250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnYnRuLWxlYWZsZXQtbXNnLWNvbnRhaW5lciB6b29tIHRpdGxlLWhpZGRlbicpO1xuICBtYXAuX3RpdGxlWm9vbUNvbnRhaW5lci5pbm5lckhUTUwgPSBtYXAub3B0aW9ucy50ZXh0Lnpvb207XG4gIHpvb21Db250YWluZXIuYXBwZW5kQ2hpbGQobWFwLl90aXRsZVpvb21Db250YWluZXIpO1xuXG4gIHZhciBfb25Nb3VzZU92ZXJab29tID0gKCkgPT4ge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyhtYXAuX3RpdGxlWm9vbUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9O1xuICB2YXIgX29uTW91c2VPdXRab29tID0gKCkgPT4ge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhtYXAuX3RpdGxlWm9vbUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICB9O1xuXG4gIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoem9vbUNvbnRhaW5lciwgJ21vdXNlb3ZlcicsIF9vbk1vdXNlT3Zlclpvb20sIHRoaXMpO1xuICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHpvb21Db250YWluZXIsICdtb3VzZW91dCcsIF9vbk1vdXNlT3V0Wm9vbSwgdGhpcyk7XG5cbiAgbWFwLnpvb21Db250cm9sLl96b29tSW5CdXR0b24udGl0bGUgPSBcIlwiO1xuICBtYXAuem9vbUNvbnRyb2wuX3pvb21PdXRCdXR0b24udGl0bGUgPSBcIlwiO1xufSIsIkFycmF5LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdGhpcy5zcGxpY2UodG8sIDAsIHRoaXMuc3BsaWNlKGZyb20sIDEpWzBdKTtcbn07XG5BcnJheS5wcm90b3R5cGUuX2VhY2ggPSBmdW5jdGlvbihmdW5jKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgZnVuYy5jYWxsKHRoaXMsIHRoaXNbaV0sIGkpO1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgQXJyYXk7XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGlzTW9iaWxlQnJvd3NlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjaGVjayA9IGZhbHNlO1xuICAgIChmdW5jdGlvbiAoYSkge1xuICAgICAgaWYgKC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm98YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsvaS50ZXN0KGEpIHx8IC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzXFwtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfFxcLW18ciB8cyApfGF2YW58YmUoY2t8bGx8bnEpfGJpKGxifHJkKXxibChhY3xheil8YnIoZXx2KXd8YnVtYnxid1xcLShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtXFwtfGNlbGx8Y2h0bXxjbGRjfGNtZFxcLXxjbyhtcHxuZCl8Y3Jhd3xkYShpdHxsbHxuZyl8ZGJ0ZXxkY1xcLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8XFwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KFxcLXxfKXxnMSB1fGc1NjB8Z2VuZXxnZlxcLTV8Z1xcLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGRcXC0obXxwfHQpfGhlaVxcLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzXFwtY3xodChjKFxcLXwgfF98YXxnfHB8c3x0KXx0cCl8aHUoYXd8dGMpfGlcXC0oMjB8Z298bWEpfGkyMzB8aWFjKCB8XFwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2NcXC18a3lvKGN8ayl8bGUobm98eGkpfGxnKCBnfFxcLyhrfGx8dSl8NTB8NTR8XFwtW2Etd10pfGxpYnd8bHlueHxtMVxcLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtXFwtY3J8bWUocmN8cmkpfG1pKG84fG9hfHRzKXxtbWVmfG1vKDAxfDAyfGJpfGRlfGRvfHQoXFwtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSlcXC18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfFxcLShbMS04XXxjKSl8cGhpbHxwaXJlfHBsKGF5fHVjKXxwblxcLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdFxcLWd8cWFcXC1hfHFjKDA3fDEyfDIxfDMyfDYwfFxcLVsyLTddfGlcXC0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoXFwtfG9vfHBcXC0pfHNka1xcL3xzZShjKFxcLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2hcXC18c2hhcnxzaWUoXFwtfG0pfHNrXFwtMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoXFwtfHZcXC18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2xcXC18dGRnXFwtfHRlbChpfG0pfHRpbVxcLXx0XFwtbW98dG8ocGx8c2gpfHRzKDcwfG1cXC18bTN8bTUpfHR4XFwtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118XFwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYyhcXC18ICl8d2ViY3x3aGl0fHdpKGcgfG5jfG53KXx3bWxifHdvbnV8eDcwMHx5YXNcXC18eW91cnx6ZXRvfHp0ZVxcLS9pLnRlc3QoYS5zdWJzdHIoMCwgNCkpKSB7XG4gICAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKTtcbiAgICByZXR1cm4gY2hlY2s7XG4gIH1cbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9iamVjdCA9IHt9LCBhcnJheSA9IFtdKSB7XG4gIHZhciByc2x0ID0gb2JqZWN0O1xuXG4gIHZhciB0bXA7XG4gIHZhciBfZnVuYyA9IGZ1bmN0aW9uIChpZCwgaW5kZXgpIHtcbiAgICB2YXIgcG9zaXRpb24gPSByc2x0W2lkXS5wb3NpdGlvbjtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHBvc2l0aW9uICE9PSBpbmRleCkge1xuICAgICAgICB0bXAgPSByc2x0W2lkXTtcbiAgICAgICAgcnNsdFtpZF0gPSByc2x0W2FycmF5W3Bvc2l0aW9uXV07XG4gICAgICAgIHJzbHRbYXJyYXlbcG9zaXRpb25dXSA9IHRtcDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uICE9IGluZGV4KSB7XG4gICAgICAgIF9mdW5jLmNhbGwobnVsbCwgaWQsIGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGFycmF5LmZvckVhY2goX2Z1bmMpO1xuXG4gIHJldHVybiByc2x0O1xufTsiLCJleHBvcnQgZGVmYXVsdCBMLk11bHRpUG9seWdvbi5leHRlbmQoe1xuICBpbml0aWFsaXplIChsYXRsbmdzLCBvcHRpb25zKSB7XG4gICAgTC5NdWx0aVBvbHlnb24ucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmdzLCBvcHRpb25zKTtcblxuICAgIHRoaXMub24oJ2xheWVyYWRkJywgKGUpID0+IHtcbiAgICAgIHZhciBtVmlld1N0eWxlID0gdGhpcy5fbWFwLm9wdGlvbnMuc3R5bGUudmlldztcbiAgICAgIGUudGFyZ2V0LnNldFN0eWxlKCQuZXh0ZW5kKHtcbiAgICAgICAgb3BhY2l0eTogMC43LFxuICAgICAgICBmaWxsT3BhY2l0eTogMC4zNSxcbiAgICAgICAgY29sb3I6ICcjMDBBQkZGJ1xuICAgICAgfSwgbVZpZXdTdHlsZSkpO1xuXG4gICAgICB0aGlzLl9tYXAuX21vdmVFUG9seWdvbk9uVG9wKCk7XG4gICAgfSk7XG4gIH0sXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5NdWx0aVBvbHlnb24ucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIHRoaXMub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2Vtb3ZlJywgeyBsYXllclBvaW50OiBlLmxheWVyUG9pbnQgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW1vdmUnLCB7IGxheWVyUG9pbnQ6IGUubGF5ZXJQb2ludCB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIG9uQ2xpY2sgKGUpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IG1hcC5nZXRTZWxlY3RlZE1Hcm91cCgpO1xuICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICBpZiAoKGVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKSAmJiBlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpICYmICFlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkgfHxcbiAgICAgIChzZWxlY3RlZE1Hcm91cCAmJiBzZWxlY3RlZE1Hcm91cC5nZXRGaXJzdCgpICYmIHNlbGVjdGVkTUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpICYmICFzZWxlY3RlZE1Hcm91cC5pc0VtcHR5KCkpKSB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBlTWFya2Vyc0dyb3VwLnNldChlLmxhdGxuZyk7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQoZU1hcmtlcnNHcm91cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJlc2V0XG4gICAgICBpZiAobWFwLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICAgIG1hcC5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXAuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfVxuICAgICAgbWFwLmNsZWFyKCk7XG4gICAgICBtYXAubW9kZSgnZHJhdycpO1xuXG4gICAgICBtYXAuX2hpZGVTZWxlY3RlZFZMYXllcihlLmxheWVyKTtcblxuICAgICAgZU1hcmtlcnNHcm91cC5yZXN0b3JlKGUubGF5ZXIpO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KGVNYXJrZXJzR3JvdXApO1xuXG4gICAgICBlTWFya2Vyc0dyb3VwLnNlbGVjdCgpO1xuICAgIH1cbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW92ZXInKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2Vtb3ZlJyk7XG4gICAgbWFwLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICB9XG59KTsiXX0=
