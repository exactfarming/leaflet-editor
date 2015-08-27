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
    //this.getVGroup().setStyle(options.style[type]);
    //this.getEGroup().setStyle(options.editGroupStyle.mode[type]);

    //if (!this.isMode('edit')) {
    this.getEPolygon().setStyle(options.style[type]);
    //}

    //this._setMarkersGroupIcon(this.getEMarkersGroup());
    //this.$.trigger({type: 'mode', value: type});
    //this.$.trigger({type: 'mode:' + type});
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
  //modes: 'view', 'edit', 'draw', 'list'
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
  //vieew () {
  //  if (this.isMode('edit') || this.isMode('draw') || this.isMode('afterDraw')) {
  //    this._clearMap();
  //
  //  }
  //  this._fitVBounds();
  //  this._bindViewEvents();
  //},
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
      //this._msgContainer.msg(this.options.text.forgetToSave);

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
      var lastChild = $(ePolygon._container.parentElement).children().last();
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

    this._msgContainer.msg(text || this.options.text.intersection, 'error');

    this._errorTimeout = setTimeout(function () {
      _this2._msgContainer.hide();
    }, 1000);
  }
}, _drawEvents2['default']);
module.exports = exports['default'];

},{"./draw/events":3,"./edit/polygon":8}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _options = require('../options');

var opts = _interopRequireWildcard(_options);

exports['default'] = L.Polyline.extend({
  options: opts.drawLineStyle,
  _latlngToMove: undefined,
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

},{"../options":21}],3:[function(require,module,exports){
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
      if (firstMarker && !firstMarker._hasFirstIcon()) {
        if (e.target.getEPolygon()._path == e.originalEvent.toElement) {
          if (!ehMarkersGroup.getLastHole()) {
            var lastHGroup = ehMarkersGroup.addHoleGroup();
            lastHGroup.set(e.latlng, null, { icon: _markerIcons.firstIcon });
            _this.clearSelectedMarker();

            _this._selectedMGroup = lastHGroup;
            _this.fire('editor:start_add_new_hole');

            return false;
          }
        }
      }

      // continue with new hole polygon
      if (ehMarkersGroup.getLastHole()) {
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

      //this.getEMarkersGroup().select();

      eMarkersGroup.select();

      _this.fire('editor:marker_group_select');
    });

    this.getVGroup().on('click', function (e) {
      var eMarkersGroup = _this.getEMarkersGroup();
      if (eMarkersGroup.getFirst() && eMarkersGroup.getFirst()._hasFirstIcon() && !eMarkersGroup.isEmpty()) {
        _this._addMarker(e);
      } else {
        // reset
        if (_this._getSelectedVLayer()) {
          _this._setEPolygon_To_VGroup();
        } else {
          _this._addEPolygon_To_VGroup();
        }
        _this.clear();
        _this.mode('draw');

        _this._hideSelectedVLayer(e.layer);

        eMarkersGroup.restore(e.layer);
        _this._convertToEdit(eMarkersGroup);

        eMarkersGroup.select();
      }
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
    this.off('mouseout');
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

},{"../marker-icons":20}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

    this._map.off('mousemove');
    if (this.getFirst()._hasFirstIcon()) {
      this._map.on('mousemove', function (e) {
        _this._updateDELine(e.latlng);
      });
    } else {
      this.getDELine().clear();
    }

    if (marker._mGroup.getLayers().length > 2) {
      if (marker._mGroup._firstMarker._hasFirstIcon() && marker === marker._mGroup._lastMarker) {
        this._map.fire('editor:last_marker_dblclick_mouseover');
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
      this._map._msgContainer.hide();
      this._map.edgesIntersected(false);
      return this._add(latlng, position, options);
    } else {
      this._map.edgesIntersected(false);
      this._map._showIntersectionError();
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

},{"../draw/dashed-line":2,"../edit/line":5,"../edit/marker":7,"../extended/BaseMarkerGroup":9,"../marker-icons":20,"../utils/sortByPosition":25}],7:[function(require,module,exports){
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
        var hasIntersection = mGroup.hasIntersection(latlng);

        if (hasIntersection) {
          map._showIntersectionError();
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
  _bindCommonEvents: function _bindCommonEvents() {
    var _this2 = this;

    this.on('click', function () {
      var mGroup = _this2._mGroup;

      if (mGroup.hasFirstMarker() && _this2 !== mGroup.getFirst()) {
        return;
      }

      var map = _this2._map;
      if (_this2._hasFirstIcon() && _this2._mGroup.hasIntersection(_this2.getLatLng(), true)) {
        map.edgesIntersected(false);
        map._showIntersectionError();
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
          map._msgContainer.msg(map.options.text.clickToAddNewEdges);
        } else {
          map._msgContainer.msg(map.options.text.clickToRemoveAllSelectedEdges);
        }

        return;
      }

      if (_this2.isMiddle()) {
        //add edge
        mGroup.setMiddleMarkers(_this2.position);
        _this2._resetIcon(_markerIcons.icon);
        mGroup.select();
        map._msgContainer.msg(map.options.text.clickToRemoveAllSelectedEdges);
      } else {
        //remove edge
        if (!mGroup.getFirst()._hasFirstIcon() && !dragend) {
          map._msgContainer.hide();

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
              map._msgContainer.msg(map.options.text.clickToAddNewEdges);
            }

            mGroup.setSelected(nextMarker);
          } else {
            map._msgContainer.hide();
          }
          mGroup.select();
        }
      }
    });

    this.on('mouseover', function () {
      if (_this2._mGroup.getFirst()._hasFirstIcon()) {
        if (_this2._mGroup.getLayers().length > 2) {
          if (_this2._hasFirstIcon()) {
            _this2._map.fire('editor:first_marker_mouseover');
          } else if (_this2 === _this2._mGroup._lastMarker) {
            _this2._map.fire('editor:last_marker_dblclick_mouseover');
          }
        }
      } else {
        if (_this2.isSelectedInGroup()) {
          if (_this2.isMiddle()) {
            _this2._map.fire('editor:selected_middle_marker_mouseover');
          } else {
            _this2._map.fire('editor:selected_marker_mouseover');
          }
        } else {
          _this2._map.fire('editor:not_selected_marker_mouseover');
        }
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

      _this2._map.fire('editor:selected_marker_mouseover');
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
      _this4._mGroup.setSelected(_this4);
      _this4._oldLatLngState = e.target._latlng;

      if (_this4._prev.isPlain()) {
        _this4._mGroup.setMiddleMarkers(_this4.position);
        //this.selectIconInGroup();
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

},{"../extended/Tooltip":14,"../marker-icons":20}],8:[function(require,module,exports){
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

    this.on('mouseover', function () {
      if (map.getEMarkersGroup().hasFirstMarker()) {
        return;
      }

      map.fire('editor:edit_polygon_mouseover');
    });
    this.on('mouseout', function () {
      return map.fire('editor:edit_polygon_mouseout');
    });
  },
  onRemove: function onRemove(map) {
    this.off('mouseover');
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

},{"../extended/Polygon":13,"../extended/Tooltip":14}],9:[function(require,module,exports){
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

    if (!this._isHole) {
      var map = this._map;
      map.getVGroup().removeLayer(map._getSelectedVLayer());
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
    } else {
      map.getEHMarkersGroup().resetSelection();
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

},{"../edit/marker":7,"../utils/sortByPosition":25}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = L.Control.extend({
  options: {
    position: 'topleft',
    btns: [
      //{'title': 'remove', 'className': 'fa fa-trash'}
    ],
    eventName: "controlAdded"
  },
  _btn: null,
  stopEvent: L.DomEvent.stopPropagation,
  initialize: function initialize(options) {
    L.Util.setOptions(this, options);
  },
  _titleContainer: null,
  onAdd: function onAdd(map) {
    var _this = this;

    map.on('btnPressed', function () {
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
      })(_this2._map, btn.pressEventName || 'btnPressed');

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
module.exports = exports['default'];

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BtnControl = require('./BtnControl');

var _BtnControl2 = _interopRequireDefault(_BtnControl);

exports['default'] = _BtnControl2['default'].extend({
  options: {
    eventName: 'loadBtnAdded'
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

    var submitBtn = this._submitBtn = L.DomUtil.create('button', 'leaflet-submit-btn');
    submitBtn.type = "submit";
    submitBtn.innerText = "submit";

    L.DomEvent.on(submitBtn, 'click', this.stopEvent).on(submitBtn, 'mousedown', this.stopEvent).on(submitBtn, 'click', this._submitForm, this);

    form.appendChild(submitBtn);

    L.DomEvent.on(form, 'submit', L.DomEvent.preventDefault);
    container.appendChild(form);
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

      map._msgContainer.msg(map.options.text.jsonWasLoaded, "success");

      map.createEditPolygon(json);

      this._timeout = setTimeout(function () {
        _this2._map._msgContainer.hide();
      }, 2000);

      this._collapse();
    } catch (e) {
      map._msgContainer.msg(map.options.text.checkJson, "error");

      this._timeout = setTimeout(function () {
        _this2._map._msgContainer.hide();
      }, 2000);
    }
  },
  _onMouseOver: function _onMouseOver() {
    this._map._msgContainer.msg(this._map.options.text.loadJson);
  },
  _onMouseOut: function _onMouseOut() {
    this._map._msgContainer.hide();
  }
});
module.exports = exports['default'];

},{"./BtnControl":10}],12:[function(require,module,exports){
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

    var corner = L.DomUtil.create('div', 'leaflet-top');
    var container = L.DomUtil.create('div', 'leaflet-msg-editor');

    map._controlCorners['msgcenter'] = corner;
    map._controlContainer.appendChild(corner);

    setTimeout(function () {
      _this._setContainer(container, map);
      map.fire('msgHelperAdded', { control: _this });

      _this._changePos(map);
    }, 1000);

    map.getBtnControl = function () {
      return _this;
    };

    this._bindEvents(map);

    return container;
  },
  _changePos: function _changePos(map) {
    var controlCorner = map._controlCorners['msgcenter'];
    if (controlCorner && controlCorner.children.length) {
      var child = controlCorner.children.item().children[0];

      if (!child) {
        return;
      }

      var width = child.clientWidth;
      if (width) {
        controlCorner.style.left = (map._container.clientWidth - width) / 2 + 'px';
      }
    }
  },
  _bindEvents: function _bindEvents(map) {
    var _this2 = this;

    setTimeout(function () {
      window.addEventListener('resize', function () {
        _this2._changePos(map);
      });
    }, 1);
  },
  _setContainer: function _setContainer(container, map) {
    var _this3 = this;

    this._titleContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    container.appendChild(this._titleContainer);

    if (this.options.defaultMsg !== null) {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      this._titleContainer.innerHTML = this.options.defaultMsg;
    }

    this._titleContainer.msg = function (text, type) {
      L.DomUtil.removeClass(_this3._titleContainer, 'title-hidden');
      L.DomUtil.removeClass(_this3._titleContainer, 'title-error');
      L.DomUtil.removeClass(_this3._titleContainer, 'title-success');

      _this3._titleContainer.innerHTML = text;

      if (type) {
        L.DomUtil.addClass(_this3._titleContainer, 'title-' + type);
      }
      _this3._changePos(map);
    };

    this._titleContainer.hide = function () {
      L.DomUtil.addClass(_this3._titleContainer, 'title-hidden');
    };
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BtnControl = require('./BtnControl');

var _BtnControl2 = _interopRequireDefault(_BtnControl);

exports['default'] = _BtnControl2['default'].extend({
  options: {
    eventName: 'trashAdded'
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
    });

    return _BtnControl2['default'].prototype.onAdd.call(this, map);
  },
  _bindEvents: function _bindEvents() {
    L.DomUtil.removeClass(this._btn, 'disabled');

    L.DomEvent.addListener(this._btn, 'mouseover', this._onMouseOver, this);
    L.DomEvent.addListener(this._btn, 'mouseout', this._onMouseOut, this);
  },
  _disableBtn: function _disableBtn() {
    L.DomUtil.addClass(this._btn, 'disabled');

    L.DomEvent.removeListener(this._btn, 'mouseover', this._onMouseOver);
    L.DomEvent.removeListener(this._btn, 'mouseout', this._onMouseOut);
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
    }
    this._onMouseOut();
  },
  _onMouseOver: function _onMouseOver() {
    var map = this._map;
    if (map.getEMarkersGroup().getLayers()[0]._isFirst) {
      map._msgContainer.msg(map.options.text.rejectChanges);
    } else {
      map._msgContainer.msg(map.options.text.deleteSelectedEdges);
    }
  },
  _onMouseOut: function _onMouseOut() {
    this._map._msgContainer.hide();
  }
});
module.exports = exports['default'];

},{"./BtnControl":10}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsSearch = require('../utils/search');

var _utilsSearch2 = _interopRequireDefault(_utilsSearch);

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

exports['default'] = function () {
  var _this = this;

  (0, _utilsSearch2['default'])();

  var ggl = new L.Google();

  this.addLayer(ggl);

  this._controlLayers = new L.Control.Layers({
    'Google': ggl
  });

  this.addControl(this._controlLayers);

  this.touchZoom.disable();
  this.doubleClickZoom.disable();
  //this.scrollWheelZoom.disable();
  this.boxZoom.disable();
  this.keyboard.disable();

  this.addControl(L.control.search());

  this._BtnControl = _extendedBtnControl2['default'];

  var trashBtn = new _extendedTrashBtn2['default']({
    btns: [{ 'className': 'fa fa-trash' }]
  });

  var loadBtn = new _extendedLoadBtn2['default']({
    btns: [{ 'className': 'fa fa-arrow-circle-o-down load' }]
  });

  var msgHelper = new _extendedMsgHelper2['default']({
    defaultMsg: this.options.text.clickToStartDrawPolygonOnMap
  });

  this.on('msgHelperAdded', function (data) {
    var msgContainer = data.control._titleContainer;

    _this._msgContainer = msgContainer;
    var text = _this.options.text;

    _this.on('editor:marker_group_select', function () {

      _this.off('editor:not_selected_marker_mouseover');
      _this.on('editor:not_selected_marker_mouseover', function () {
        msgContainer.msg(text.clickToSelectEdges);
      });

      _this.off('editor:selected_marker_mouseover');
      _this.on('editor:selected_marker_mouseover', function () {
        msgContainer.msg(text.clickToRemoveAllSelectedEdges);
      });

      _this.off('editor:selected_middle_marker_mouseover');
      _this.on('editor:selected_middle_marker_mouseover', function () {
        msgContainer.msg(text.clickToAddNewEdges);
      });

      // on edit polygon
      _this.off('editor:edit_polygon_mouseover');
      _this.on('editor:edit_polygon_mouseover', function () {
        msgContainer.msg(text.clickToDrawInnerEdges);
      });

      _this.off('editor:edit_polygon_mouseout');
      _this.on('editor:edit_polygon_mouseout', function () {
        msgContainer.hide();
      });
      // on view polygon
      _this.off('editor:view_polygon_mouseover');
      _this.on('editor:view_polygon_mouseover', function () {
        msgContainer.msg(text.clickToEdit);
      });

      _this.off('editor:view_polygon_mouseout');
      _this.on('editor:view_polygon_mouseout', function () {
        msgContainer.hide();
      });
    });

    // hide msg
    _this.off('editor:marker_mouseout');
    _this.on('editor:marker_mouseout', function () {
      msgContainer.hide();
    });
    // on start draw polygon
    _this.off('editor:first_marker_mouseover');
    _this.on('editor:first_marker_mouseover', function () {
      msgContainer.msg(text.clickToJoinEdges);
    });
    // dblclick to join
    _this.off('editor:last_marker_dblclick_mouseover');
    _this.on('editor:last_marker_dblclick_mouseover', function () {
      msgContainer.msg(text.dblclickToJoinEdges);
    });

    _this.on('editor:join_path', function () {
      msgContainer.msg(_this.options.text.clickToRemoveAllSelectedEdges);
    });

    //todo: continue with option 'allowCorrectIntersection'
    _this.on('editor:intersection_detected', function (data) {
      // msg
      if (data.intersection) {
        msgContainer.msg(_this.options.text.intersection);
      } else {
        msgContainer.hide();
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
    this.addControl(loadBtn);
  }

  this.addControl(trashBtn);
};

module.exports = exports['default'];

},{"../extended/BtnControl":10,"../extended/LoadBtn":11,"../extended/MsgHelper":12,"../extended/TrashBtn":15,"../utils/mobile":23,"../utils/search":24}],17:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jsMap = require('../js/map');

var _jsMap2 = _interopRequireDefault(_jsMap);

window.MapEditor = _jsMap2['default'];

},{"../js/map":19}],18:[function(require,module,exports){
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
    this.editGroup = new L.FeatureGroup([]);
    this.editPolygon = new _editPolygon2['default']([]);
    this.editMarkersGroup = new L.MarkerGroup([]);
    this.editLineGroup = new _editLine2['default']([]);
    this.dashedEditLineGroup = new _drawDashedLine2['default']([]);
    this.editHoleMarkersGroup = new _editHolesGroup2['default']([]);
  }
};
module.exports = exports['default'];

},{"./draw/dashed-line":2,"./edit/holesGroup":4,"./edit/line":5,"./edit/marker-group":6,"./edit/polygon":8,"./view/group":26}],19:[function(require,module,exports){
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

function map() {
  var _this = this;

  var map = L.Map.extend($.extend(_base2['default'], {
    $: undefined,
    initialize: function initialize(id, options) {
      $.extend(opts.options, options);
      L.Util.setOptions(this, opts.options);
      L.Map.prototype.initialize.call(this, id, options);
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

exports['default'] = map();
module.exports = exports['default'];

},{"./base":1,"./hooks/controls":16,"./layers":18,"./options":21,"./utils/array":22}],20:[function(require,module,exports){
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
  iconSize: [8 * size, 8 * size]
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

},{"./utils/mobile":23}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var viewColor = '#00FFFF';
var drawColor = '#00F800';
var editColor = '#00F800';
var weight = 3;

var options = {
  allowIntersection: false,
  allowCorrectIntersection: false, //todo: unfinished
  forceToDraw: true,
  translations: {
    removePolygon: "remove polygon",
    removePoint: "remove point"
  },
  overlays: {},
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
    intersection: "Self-intersection is prohibited",
    deletePointIntersection: "Deletion of point is not possible. Self-intersection is prohibited",
    removePolygon: "Remove polygon",
    clickToEdit: "click to edit",
    clickToAddNewEdges: "<div>click&nbsp;&nbsp;<div class='m-editor-middle-div-icon static group-selected'></div>&nbsp;&nbsp;to add new edges</div>",
    clickToDrawInnerEdges: "click to draw inner edges",
    clickToJoinEdges: "click to join edges",
    clickToRemoveAllSelectedEdges: "<div>click&nbsp;&nbsp;&nbsp;&nbsp;<div class='m-editor-div-icon static group-selected'></div>&nbsp;&nbsp;to remove edge&nbsp;&nbsp;or&nbsp;&nbsp;<i class='fa fa-trash'></i>&nbsp;&nbsp;to remove all selected edges</div>",
    clickToSelectEdges: "<div>click&nbsp;&nbsp;&nbsp;&nbsp;<div class='m-editor-div-icon static'></div>&nbsp;/&nbsp;<div class='m-editor-middle-div-icon static'></div>&nbsp;&nbsp;to select edges</div>",
    dblclickToJoinEdges: "double click to join edges",
    clickToStartDrawPolygonOnMap: "click to start draw polygon on map",
    deleteSelectedEdges: "deleted selected edges",
    rejectChanges: "reject changes",
    jsonWasLoaded: "JSON was loaded",
    checkJson: "check JSON",
    loadJson: "load GeoJSON",
    forgetToSave: "Save changes by pressing outside of polygon",
    searchLocation: "Search location"
  },
  worldCopyJump: true
};

exports.options = options;
var drawLineStyle = {
  opacity: 0.7,
  fill: false,
  fillColor: drawColor,
  color: drawColor,
  weight: weight,
  dashArray: '5, 10',
  stroke: true,
  clickable: false
};
exports.drawLineStyle = drawLineStyle;

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function () {
  L.Control.Search = L.Control.extend({
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

      var input = this._input = document.createElement('input');

      L.DomEvent.on(input, 'click', stop);

      form.appendChild(input);

      L.DomEvent.on(form, 'submit', function () {
        this._doSearch(input.value);
        return false;
      }, this).on(form, 'submit', L.DomEvent.preventDefault);
      container.appendChild(form);

      this._map.on('loadBtnOpened', this._collapse, this);

      L.DomEvent.addListener(container, 'mouseover', this._onMouseOver, this);
      L.DomEvent.addListener(container, 'mouseout', this._onMouseOut, this);

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
    },

    _collapse: function _collapse() {
      this._form.style.display = 'none';
      this._input.value = '';
    },

    _nominatimCallback: function _nominatimCallback(results) {

      if (this._results) {
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

      var divResults = [];

      for (var i = 0; i < results.length; i++) {
        var div = L.DomUtil.create('div', 'search-results-el');
        div.innerText = results[i].display_name;
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
        L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation).on(div, 'click', callback);

        divResults.push(div);
      }

      this._form.appendChild(resultsContainer);

      if (results.length === 0) {
        this._results.parentNode.removeChild(this._results);
      }
    },

    _callbackId: 0,

    _doSearch: function _doSearch(query) {
      var callback = '_l_osmgeocoder_' + this._callbackId++;
      window[callback] = L.Util.bind(this._nominatimCallback, this);
      var queryParams = {
        q: query,
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
      this._map._msgContainer.msg(this._map.options.text.searchLocation);
    },
    _onMouseOut: function _onMouseOut() {
      this._map._msgContainer.hide();
    }
  });

  L.control.search = function (options) {
    return new L.Control.Search(options);
  };
};

module.exports = exports['default'];

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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
  onAdd: function onAdd(map) {
    L.MultiPolygon.prototype.onAdd.call(this, map);

    this.on('mouseover', function () {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mouseover');
      } else {
        if (!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mouseover');
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
  onRemove: function onRemove(map) {
    this.off('mouseover');
    this.off('mouseout');

    map.off('editor:view_polygon_mouseover');
    map.off('editor:view_polygon_mouseout');
  }
});
module.exports = exports['default'];

},{}]},{},[17])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvYmFzZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9kcmF3L2Rhc2hlZC1saW5lLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZXZlbnRzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvaG9sZXNHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L2xpbmUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXItZ3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXIuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9wb2x5Z29uLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0Jhc2VNYXJrZXJHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9CdG5Db250cm9sLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0xvYWRCdG4uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTXNnSGVscGVyLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL1BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvVG9vbHRpcC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9UcmFzaEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9pbmRleC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9sYXllcnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvbWFwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL21hcmtlci1pY29ucy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9vcHRpb25zLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL2FycmF5LmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL21vYmlsZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy91dGlscy9zZWFyY2guanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdXRpbHMvc29ydEJ5UG9zaXRpb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdmlldy9ncm91cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzBCQ0F1QixlQUFlOzs7OzJCQUNkLGdCQUFnQjs7OztxQkFFekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN0QixpQkFBZSxFQUFFLFNBQVM7QUFDMUIsaUJBQWUsRUFBRSxTQUFTO0FBQzFCLG9CQUFrQixFQUFFLFNBQVM7QUFDN0IsMkJBQXlCLEVBQUUsS0FBSztBQUNoQyxXQUFTLEVBQUUsTUFBTTtBQUNqQixnQkFBYyxFQUFFLFNBQVM7QUFDekIsb0JBQWtCLEVBQUMsOEJBQUc7QUFDcEIsV0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0dBQzdCO0FBQ0Qsb0JBQWtCLEVBQUMsNEJBQUMsS0FBSyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0dBQzlCO0FBQ0Qsc0JBQW9CLEVBQUMsZ0NBQUc7QUFDdEIsUUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7R0FDbEM7QUFDRCxxQkFBbUIsRUFBQyw2QkFBQyxLQUFLLEVBQUU7QUFDMUIsU0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVwQixRQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDOztBQUVwRCxRQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0IsU0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztHQUN6QztBQUNELHFCQUFtQixFQUFDLCtCQUErQjtRQUE5QixLQUFLLHlEQUFHLElBQUksQ0FBQyxlQUFlOztBQUMvQyxRQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsYUFBTztLQUNSO0FBQ0QsU0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztHQUNuQztBQUNELHNCQUFvQixFQUFDLGdDQUFHO0FBQ3RCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM5QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTlCLFVBQU0sQ0FBQyxTQUFTLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDMUIsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwQixZQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3pCLFlBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNqQyxZQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDcEIsY0FBSSxLQUFLLEVBQUU7QUFDVCxtQkFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1dBQ25DO1NBQ0Y7QUFDRCxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztPQUNyQztLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0Qsd0JBQXNCLEVBQUMsa0NBQUc7QUFDeEIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzlCLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFbEMsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2hDLFFBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFcEMsUUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUN2QixhQUFPO0tBQ1I7O0FBRUQsUUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3BCLFVBQUksS0FBSyxFQUFFO0FBQ1QsZUFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ25DO0tBQ0Y7QUFDRCxVQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztHQUNyQztBQUNELHdCQUFzQixFQUFDLGtDQUFHO0FBQ3hCLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsQyxRQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7QUFFL0MsUUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixhQUFPO0tBQ1I7O0FBRUQsa0JBQWMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2hELGtCQUFjLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM1QyxrQkFBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQ3pCO0FBQ0QsMkJBQXlCLEVBQUMscUNBQUc7QUFDM0IsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0dBQzdCO0FBQ0QsZ0JBQWMsRUFBQyx3QkFBQyxLQUFLLEVBQUU7OztBQUNyQixRQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsWUFBWSxFQUFFO0FBQ25DLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFOUIsWUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVyQixXQUFLLENBQUMsU0FBUyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ3pCLFlBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFakMsWUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUN6QixZQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDcEIsaUJBQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuQzs7QUFFRCxZQUFJLFdBQVcsR0FBRyw2QkFBZ0IsT0FBTyxDQUFDLENBQUM7QUFDM0MsbUJBQVcsQ0FBQyxLQUFLLE9BQU0sQ0FBQztBQUN4QixjQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQzlCLENBQUMsQ0FBQztBQUNILGFBQU8sTUFBTSxDQUFDO0tBQ2YsTUFDSSxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFO0FBQ3ZDLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsQyxVQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDL0IsWUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLO2VBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3JELFVBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLO2VBQUssS0FBSyxDQUFDLFNBQVMsRUFBRTtPQUFBLENBQUMsQ0FBQzs7QUFFM0QsVUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDOztBQUVoQyxVQUFJLEtBQUssRUFBRTtBQUNULG1CQUFXLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDM0M7O0FBRUQsY0FBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNqQyxjQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRWxCLGFBQU8sUUFBUSxDQUFDO0tBQ2pCO0dBQ0Y7QUFDRCxVQUFRLEVBQUMsa0JBQUMsSUFBSSxFQUFFO0FBQ2QsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7Ozs7QUFLM0IsUUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7OztHQU1sRDs7QUFFRCxjQUFZLEVBQUMsd0JBQUc7QUFDZCxXQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7R0FDdkI7QUFDRCxjQUFZLEVBQUMsc0JBQUMsSUFBSSxFQUFFO0FBQ2xCLFFBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUMxQztBQUNELHNCQUFvQixFQUFDLDhCQUFDLFdBQVcsRUFBRTtBQUNqQyxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUNwQyxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQzs7QUFFOUMsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQy9CLFFBQUksS0FBSyxFQUFFO0FBQ1QsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7QUFDZixtQkFBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO09BQ25DLE1BQU07QUFDTCxZQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFlBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN0QixxQkFBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ2xDO09BQ0Y7S0FDRjs7QUFFRCxRQUFJLFVBQVUsRUFBRTtBQUNkLFVBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO0FBQ3BCLG1CQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7T0FDN0MsTUFBTTtBQUNMLFlBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixZQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDdEIscUJBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN2QztPQUNGO0tBQ0Y7O0FBRUQsZUFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7O0FBRTdGLFFBQUksSUFBSSxLQUFLLFdBQVcsRUFBRTtBQUN4QixpQkFBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQzNCO0dBQ0Y7O0FBRUQsTUFBSSxFQUFDLGNBQUMsSUFBSSxFQUFFO0FBQ1YsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDLENBQUM7QUFDOUMsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFbkMsUUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFeEIsUUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN2QixNQUFNO0FBQ0wsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLFVBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUM7QUFDNUIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNyQjtHQUNGO0FBQ0QsUUFBTSxFQUFDLGdCQUFDLElBQUksRUFBRTtBQUNaLFdBQU8sSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUM7R0FDaEM7Ozs7Ozs7OztBQVNELE1BQUksRUFBQyxnQkFBRztBQUNOLFFBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDMUUsVUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBRWxCO0FBQ0QsUUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0dBQ3hCO0FBQ0QsUUFBTSxFQUFDLGtCQUFHO0FBQ1IsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUVqQixRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ25CO0FBQ0QsT0FBSyxFQUFDLGlCQUFHO0FBQ1AsUUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQixRQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7R0FDakM7QUFDRCxVQUFRLEVBQUMsb0JBQUc7QUFDVixRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNiLFFBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztHQUNoQzs7Ozs7Ozs7QUFRQyxXQUFTLEVBQUMscUJBQUc7O0FBRWIsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVsQyxRQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFOzs7O0FBSXZCLFVBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7QUFDN0IsWUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7T0FDL0IsTUFBTTtBQUNMLFlBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO09BQy9CO0tBQ0Y7O0FBRUQsUUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2IsUUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFbEIsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzNDLFFBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUNwQixhQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUM7S0FDekI7QUFDRCxXQUFPLEVBQUUsQ0FBQztHQUNYO0FBQ0QsbUJBQWlCLEVBQUMsNkJBQUc7QUFDbkIsV0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0dBQzdCO0FBQ0QscUJBQW1CLEVBQUMsK0JBQUc7QUFDckIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7R0FDN0I7QUFDRCxzQkFBb0IsRUFBQyxnQ0FBRztBQUN0QixRQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO0FBQzFDLFFBQUksVUFBVSxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2QyxRQUFJLFVBQVUsR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkMsUUFBSSxlQUFlLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQztBQUNqRCxRQUFJLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUM7QUFDbEQsa0JBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN4QixRQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztBQUN2QyxRQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7QUFDeEMsUUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM5QixjQUFVLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUM5QixjQUFVLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztHQUMvQjtBQUNELGVBQWEsRUFBQyx1QkFBQyxPQUFPLEVBQUU7O0FBRXRCLFFBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUV0QyxRQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFdkMsV0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVoQixRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDNUIsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuQjs7QUFFRCxRQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzQixRQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztHQUMvQjtBQUNELG1CQUFpQixFQUFDLDJCQUFDLElBQUksRUFBRTtBQUN2QixRQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU5QixRQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWIsUUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVuQyxRQUFJLEtBQUssRUFBRTtBQUNULFVBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMvQixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDOUIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEMsWUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLGNBQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDckI7S0FDRjs7QUFFRCxRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVsQixRQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7R0FDcEI7QUFDRCxZQUFVLEVBQUMsb0JBQUMsTUFBTSxFQUFFO0FBQ2xCLFFBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUN6RDtBQUNELGFBQVcsRUFBQyx1QkFBRztBQUNiLFFBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDN0MsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDOztLQUVuRTtHQUNGO0FBQ0QsV0FBUyxFQUFDLHFCQUFHO0FBQ1gsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMzQixRQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQyxRQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzs7QUFFOUMsUUFBSSxjQUFjLEVBQUU7QUFDbEIsb0JBQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNwQzs7QUFFRCxRQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFdkMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQzs7QUFFbEMsUUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0IsUUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7QUFDNUIsUUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7R0FDNUI7QUFDRCxjQUFZLEVBQUMsd0JBQUc7O0FBRWQsUUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7R0FDMUI7QUFDRCxrQkFBZ0IsRUFBRSxTQUFTO0FBQzNCLHFCQUFtQixFQUFDLDZCQUFDLEtBQUssRUFBRTtBQUMxQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0dBQy9CO0FBQ0QscUJBQW1CLEVBQUMsK0JBQUc7QUFDckIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7R0FDOUI7QUFDRCx1QkFBcUIsRUFBQyxpQ0FBRztBQUN2QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0dBQzlCO0FBQ0QsbUJBQWlCLEVBQUMsMkJBQUMsV0FBVyxFQUFFO0FBQzlCLFFBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzFDLG1CQUFlLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUUzQyxRQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUM5QyxtQkFBZSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFdEMsUUFBSSxvQkFBb0IsR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRXRELFFBQUksU0FBUyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEQsbUJBQWUsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDOztBQUV0QyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7QUFFM0MscUJBQWUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQy9GOztBQUVELFFBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN6QyxVQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBSztBQUM5QixxQkFBZSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNwRCxDQUFDLENBQUM7O0FBRUgsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xDLFFBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFekMsVUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUN4QixjQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN0RSxDQUFDLENBQUM7OztBQUdILFdBQU8sZUFBZSxDQUFDO0dBQ3hCO0FBQ0Qsb0JBQWtCLEVBQUMsOEJBQUc7QUFDcEIsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xDLFFBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtBQUN2QixVQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2RSxVQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZDLFVBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUM5QixpQkFBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUMzQztLQUNGO0dBQ0Y7QUFDRCxpQkFBZSxFQUFDLHlCQUFDLE9BQU8sRUFBRTtBQUN4QixXQUFPLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFeEMsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGFBQU87S0FDUjs7O0FBR0QsUUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDOztBQUVuQyxRQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Ozs7O0FBS3hDLFFBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUMvQixRQUFJLEtBQUssRUFBRTtBQUNULFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JDLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNsQztLQUNGO0dBQ0Y7QUFDRCxrQkFBZ0IsRUFBRTtXQUFNLFVBQUssY0FBYztHQUFBO0FBQzNDLGtCQUFnQixFQUFDLDBCQUFDLEtBQUssRUFBRTtBQUN2QixRQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDdkIsYUFBTyxJQUFJLENBQUMseUJBQXlCLENBQUM7S0FDdkMsTUFBTTtBQUNMLFVBQUksQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUM7QUFDdkMsVUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ2xCLFlBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztPQUNqRSxNQUFNO0FBQ0wsWUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxFQUFDLFlBQVksRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO09BQ2xFO0tBQ0Y7R0FDRjtBQUNELGVBQWEsRUFBRSxJQUFJO0FBQ25CLHdCQUFzQixFQUFDLGdDQUFDLElBQUksRUFBRTs7O0FBRTVCLFFBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixrQkFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNsQzs7QUFFRCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUV4RSxRQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxZQUFNO0FBQ3BDLGFBQUssYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQzNCLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDVjtDQUNGLDBCQUFhOzs7Ozs7Ozs7Ozs7dUJDaGNRLFlBQVk7O0lBQXRCLElBQUk7O3FCQUVELENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQy9CLFNBQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtBQUMzQixlQUFhLEVBQUUsU0FBUztBQUN4QixXQUFTLEVBQUMsbUJBQUMsTUFBTSxFQUFFO0FBQ2pCLFFBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixVQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztLQUNoQzs7QUFFRCxRQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUM1QixVQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFCOztBQUVELFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7QUFFckMsV0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDdEI7QUFDRCxRQUFNLEVBQUMsZ0JBQUMsR0FBRyxFQUFFOztBQUVYLFFBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQy9DLFVBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDeEM7QUFDRCxRQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUNqQyxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDOztBQUVqQyxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxVQUFRLEVBQUMsa0JBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUU7QUFDbkMsUUFBSSxDQUFDLFlBQVksRUFBRTtBQUNqQixVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ25CO0dBQ0Y7QUFDRCxPQUFLLEVBQUMsaUJBQUc7QUFDUCxRQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQ3JCO0NBQ0YsQ0FBQzs7Ozs7Ozs7OzsyQkN4QzBFLGlCQUFpQjs7cUJBQzlFO0FBQ2IsaUJBQWUsRUFBQywyQkFBRzs7O0FBQ2pCLFFBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOzs7QUFHekIsUUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLEVBQUs7O0FBRXRCLFVBQUksQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUFFO0FBQ3JGLGVBQU87T0FDUjs7QUFFRCxVQUFLLENBQUMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRztBQUNsQyxlQUFPO09BQ1I7O0FBRUQsVUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOzs7QUFHaEQsVUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDM0IsY0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRW5CLGNBQUssSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7O0FBRTFDLGNBQUssb0JBQW9CLEVBQUUsQ0FBQzs7QUFFNUIsY0FBSyxlQUFlLEdBQUcsYUFBYSxDQUFDO0FBQ3JDLGVBQU8sS0FBSyxDQUFDO09BQ2Q7OztBQUdELFVBQUksV0FBVyxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFM0MsVUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLGFBQWEsRUFBRSxFQUFFO0FBQzlDLFlBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUEsQUFBQyxFQUFFO0FBQ25DLGdCQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQjtBQUNELGVBQU8sS0FBSyxDQUFDO09BQ2Q7OztBQUdELFVBQUksY0FBYyxHQUFHLE1BQUssaUJBQWlCLEVBQUUsQ0FBQztBQUM5QyxVQUFJLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUMvQyxZQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFHO0FBQy9ELGNBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDakMsZ0JBQUksVUFBVSxHQUFHLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUMvQyxzQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksd0JBQVcsRUFBQyxDQUFDLENBQUM7QUFDbEQsa0JBQUssbUJBQW1CLEVBQUUsQ0FBQzs7QUFFM0Isa0JBQUssZUFBZSxHQUFHLFVBQVUsQ0FBQztBQUNsQyxrQkFBSyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQzs7QUFFdkMsbUJBQU8sS0FBSyxDQUFDO1dBQ2Q7U0FDRjtPQUNGOzs7QUFHRCxVQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUNoQyxZQUFJLE1BQUssZ0JBQWdCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDeEQsY0FBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEQsY0FBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEMsY0FBRyxJQUFJLEVBQUU7QUFDUCxrQkFBSyxzQkFBc0IsRUFBRSxDQUFDOzs7V0FHL0I7U0FDRixNQUFNO0FBQ0wsa0JBQUssc0JBQXNCLEVBQUUsQ0FBQztXQUMvQjtBQUNELGVBQU8sS0FBSyxDQUFDO09BQ2Q7Ozs7QUFJRCxVQUFJLE1BQUssa0JBQWtCLEVBQUUsRUFBRTtBQUM3QixjQUFLLHNCQUFzQixFQUFFLENBQUM7T0FDL0IsTUFBTTtBQUNMLGNBQUssc0JBQXNCLEVBQUUsQ0FBQztPQUMvQjtBQUNELFlBQUssS0FBSyxFQUFFLENBQUM7QUFDYixZQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFbEIsWUFBSyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUN4QyxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLENBQUMsRUFBSztBQUNqQyxVQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDOztBQUU3QixVQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7QUFDekIsY0FBSyxpQkFBaUIsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO09BQzFDOztBQUVELFVBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFdkMsVUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEIsWUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFNO0FBQ25CLFlBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFDLElBQUkseUJBQVksRUFBQyxDQUFDLENBQUM7QUFDekUsZ0JBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztPQUNoQyxDQUFDLENBQUM7OztBQUdILG1CQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWxDLG1CQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQzFDLGNBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDMUIsQ0FBQyxDQUFDOzs7O0FBSUgsbUJBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFdkIsWUFBSyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUN6QyxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDbEMsVUFBSSxhQUFhLEdBQUcsTUFBSyxnQkFBZ0IsRUFBRSxDQUFDO0FBQzVDLFVBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwRyxjQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNwQixNQUFNOztBQUVMLFlBQUksTUFBSyxrQkFBa0IsRUFBRSxFQUFFO0FBQzdCLGdCQUFLLHNCQUFzQixFQUFFLENBQUM7U0FDL0IsTUFBTTtBQUNMLGdCQUFLLHNCQUFzQixFQUFFLENBQUM7U0FDL0I7QUFDRCxjQUFLLEtBQUssRUFBRSxDQUFDO0FBQ2IsY0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRWxCLGNBQUssbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVsQyxxQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0IsY0FBSyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRW5DLHFCQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDeEI7S0FDRixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxZQUFNO0FBQ3BDLFlBQUssY0FBYyxDQUFDLE1BQUssZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0tBQzlDLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsWUFBTTtBQUNyQyxZQUFLLGlCQUFpQixFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDbkMsQ0FBQyxDQUFDO0dBQ0o7QUFDRCxZQUFVLEVBQUMsb0JBQUMsQ0FBQyxFQUFFO0FBQ2IsUUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs7QUFFdEIsUUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0FBRTVDLFFBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXZDLFFBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRW5DLFdBQU8sTUFBTSxDQUFDO0dBQ2Y7QUFDRCxlQUFhLEVBQUMsdUJBQUMsTUFBTSxFQUFFO0FBQ3JCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQzNEO0FBQ0QsbUJBQWlCLEVBQUMsNkJBQUc7QUFDbkIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsQixRQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLFFBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckIsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV6QixRQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRTdCLFFBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDakMsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0tBQ3hCO0dBQ0Y7Q0FDRjs7Ozs7Ozs7O3FCQzlLYyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztBQUNuQyxXQUFTLEVBQUUsS0FBSztBQUNoQixXQUFTLEVBQUUsU0FBUztBQUNwQixpQkFBZSxFQUFFLFNBQVM7QUFDMUIsY0FBWSxFQUFDLHdCQUFHO0FBQ2QsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDOUIsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNCLFFBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQzs7QUFFdEMsV0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0dBQ3ZCO0FBQ0QsV0FBUyxFQUFDLHFCQUFHO0FBQ1gsV0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDO0dBQ2hDO0FBQ0QsZUFBYSxFQUFDLHlCQUFHO0FBQ2YsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7R0FDNUI7QUFDRCxhQUFXLEVBQUMsdUJBQUc7QUFDYixXQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7R0FDdkI7QUFDRCxRQUFNLEVBQUMsa0JBQUc7QUFDUixRQUFJLENBQUMsU0FBUyxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sRUFBRTtBQUM5QixZQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3hCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7QUFDRCxPQUFLLEVBQUMsZUFBQyxRQUFRLEVBQUU7QUFDZixRQUFJLENBQUMsU0FBUyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ3hCLFVBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxRQUFRLEVBQUU7QUFDOUIsYUFBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUM7T0FDckI7S0FDRixDQUFDLENBQUM7R0FDSjtBQUNELGdCQUFjLEVBQUMsMEJBQUc7QUFDaEIsUUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFDLEtBQUssRUFBSztBQUN4QixXQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ2xDLGNBQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO09BQzlCLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0dBQ3hCO0NBQ0YsQ0FBQzs7Ozs7Ozs7O3FCQzlDYSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztBQUNqQyxRQUFNLEVBQUMsa0JBQUc7QUFDUixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3BCLE9BQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUMzQyxPQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7R0FFMUM7Q0FDRixDQUFDOzs7Ozs7Ozs7Ozs7Ozt1Q0NQbUIsNkJBQTZCOzs7OzBCQUM3QixnQkFBZ0I7Ozs7d0JBQ2IsY0FBYzs7Ozs4QkFDUixxQkFBcUI7Ozs7bUNBRXBDLHlCQUF5Qjs7OzsyQkFDbkIsaUJBQWlCOztJQUE1QixLQUFLOztBQUVqQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFOzs7QUFHeEIsbUJBQWlCLEVBQUMscUNBQVcsQ0FBQyxXQUFZLEVBQUUsV0FBWSxFQUFFLFdBQVksRUFBRSxFQUFFO0FBQ3hFLFdBQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEtBQzNDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUN2QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FDdEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDMUM7OztBQUdELHdCQUFzQixFQUFDLDBDQUFXLENBQUMsV0FBWSxFQUFFLFdBQVksRUFBRSxFQUFFO0FBQy9ELFdBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUEsSUFBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBLElBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztHQUNsRTtDQUNGLENBQUMsQ0FBQzs7cUJBRVksQ0FBQyxDQUFDLFdBQVcsR0FBRyxxQ0FBVyxNQUFNLENBQUM7QUFDL0MsU0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBYyxFQUFFLFNBQVM7QUFDekIsV0FBUyxFQUFFLFNBQVM7QUFDcEIscUJBQW1CLEVBQUUsZ0NBQXdCLEVBQUUsQ0FBQztBQUNoRCxTQUFPLEVBQUU7QUFDUCxTQUFLLEVBQUUsU0FBUztBQUNoQixjQUFVLEVBQUUsU0FBUztHQUN0QjtBQUNELFlBQVUsRUFBQyxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsS0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRXJELFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOztHQUVwQjtBQUNELE9BQUssRUFBQyxlQUFDLEdBQUcsRUFBRTtBQUNWLFFBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDckM7QUFDRCxlQUFhLEVBQUMsdUJBQUMsTUFBTSxFQUFFO0FBQ3JCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM5QixRQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDckIsWUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2QjtBQUNELFdBQU8sTUFBTSxDQUFDO0dBQ2Y7QUFDRCxZQUFVLEVBQUMsb0JBQUMsTUFBTSxFQUFFOzs7QUFHbEIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQixRQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVuQyxRQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNoQztBQUNELFdBQVMsRUFBQyxxQkFBRztBQUNYLFFBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFO0FBQ2xDLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzNDOztBQUVELFdBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0dBQ2pDO0FBQ0QsZUFBYSxFQUFDLHlCQUFHO0FBQ2YsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixRQUFJLEdBQUcsQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLEVBQUU7QUFDeEMsU0FBRyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3ZEO0FBQ0QsT0FBRyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM1RDtBQUNELGlCQUFlLEVBQUMsMkJBQUc7QUFDakIsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDakIsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUU5QixZQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbkMsZUFBTyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUM7T0FDdEMsQ0FBQyxDQUFDOztBQUVILFVBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNqQixVQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsWUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUN4QixlQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNoQyxnQkFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDakMsQ0FBQyxDQUFDOztBQUVILDRDQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDN0I7R0FDRjtBQUNELGFBQVcsRUFBQyx1QkFBRztBQUNiLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFL0IsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdkMsVUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLFlBQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QyxVQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN4QyxZQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7T0FDdEI7S0FDRjtHQUNGO0FBQ0QsYUFBVyxFQUFDLHFCQUFDLE1BQU0sRUFBRTtBQUNuQixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUVwQixRQUFJLEdBQUcsQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDMUQsU0FBRyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckMsU0FBRyxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7QUFDN0MsYUFBTztLQUNSOztBQUVELE9BQUcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO0FBQzdDLE9BQUcsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO0dBQzlCO0FBQ0QsZUFBYSxFQUFDLHlCQUFHO0FBQ2YsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixRQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUU7QUFDdkIsU0FBRyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxTQUFHLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztLQUNqQztHQUNGO0FBQ0QsYUFBVyxFQUFDLHVCQUFHO0FBQ2IsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztHQUNsQztBQUNELFdBQVMsRUFBQyxtQkFBQyxNQUFNLEVBQUU7QUFDakIsUUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDM0IsUUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUNuQztBQUNELFVBQVEsRUFBQyxvQkFBRztBQUNWLFdBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztHQUMxQjtBQUNELFNBQU8sRUFBQyxtQkFBRztBQUNULFFBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFO0FBQ3pCLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM5QixhQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ2xDO0dBQ0Y7QUFDRCxnQkFBYyxFQUFDLDBCQUFHO0FBQ2hCLFdBQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztHQUMzRDtBQUNELGtCQUFnQixFQUFDLDRCQUFHO0FBQ2xCLFFBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNqQixRQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsS0FBSyxFQUFFO0FBQzlCLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7QUFDckIsZUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztPQUNqQztLQUNGLENBQUMsQ0FBQztBQUNILFdBQU8sT0FBTyxDQUFDO0dBQ2hCO0FBQ0QsU0FBTyxFQUFDLGlCQUFDLEtBQUssRUFBRTtBQUNkLFFBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ2hDO0FBQ0QsTUFBSSxFQUFDLGNBQUMsTUFBTSxFQUFFLFFBQVEsRUFBZ0I7OztRQUFkLE9BQU8seURBQUcsRUFBRTs7QUFFbEMsUUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM1QixVQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtBQUN0QixlQUFPLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7T0FDaEM7S0FDRjs7QUFHRCxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRXZELFFBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRW5DLFFBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzNCLFFBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFO0FBQ25DLFVBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsRUFBSztBQUMvQixjQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDOUIsQ0FBQyxDQUFDO0tBQ0osTUFBTTtBQUNMLFVBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUMxQjs7QUFFRCxRQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN6QyxVQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxJQUFJLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtBQUN4RixZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO09BQ3pEO0tBQ0Y7O0FBRUQsV0FBTyxNQUFNLENBQUM7R0FDZjtBQUNELHlCQUF1QixFQUFDLGlDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFO0FBQ3BELFdBQU8sQUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUksTUFBTSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDeEY7QUFDRCxjQUFZLEVBQUMsc0JBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUM5QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTlCLFFBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFFBQUksUUFBUSxLQUFLLENBQUMsRUFBRTtBQUNsQixZQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLFlBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0QsTUFBTSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDakMsWUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RSxZQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBRTNELE1BQU07QUFDTCxVQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFO0FBQzlCLGNBQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztPQUNyQztBQUNELFVBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDOUIsY0FBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQ3JDO0tBQ0Y7O0FBRUQsV0FBTyxNQUFNLENBQUM7R0FDZjtBQUNELGlCQUFlLEVBQUMseUJBQUMsUUFBUSxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQztHQUMxRDtBQUNELGtCQUFnQixFQUFDLDBCQUFDLFFBQVEsRUFBRTtBQUMxQixRQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ3BDO0FBQ0QsS0FBRyxFQUFDLGFBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDOUIsUUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDakMsVUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0IsVUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM3QyxNQUFNO0FBQ0wsVUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxVQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDcEM7R0FDRjtBQUNELFdBQVMsRUFBQyxtQkFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUNwQyxZQUFRLEdBQUcsQUFBQyxRQUFRLEdBQUcsQ0FBQyxHQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7OztBQUd6QyxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRWpELFVBQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN4QixXQUFPLE1BQU0sQ0FBQztHQUNmO0FBQ0QsUUFBTSxFQUFDLGdCQUFDLE9BQU8sRUFBRTs7O0FBQ2YsV0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUs7QUFDcEMsYUFBSyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzVCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQy9CO0FBQ0QsYUFBVyxFQUFDLHFCQUFDLEtBQUssRUFBRTs7O0FBQ2xCLFNBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7O0FBRXRCLFVBQUksVUFBVSxHQUFHLE9BQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7O0FBRTlELFVBQUksQ0FBQyxLQUFLLENBQUMsVUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFLO0FBQy9CLGtCQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztPQUNsQyxDQUFDLENBQUM7Ozs7Ozs7QUFPSCxnQkFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyQyxDQUFDLENBQUM7R0FDSjtBQUNELGVBQWEsRUFBQyx1QkFBQyxNQUFNLEVBQW9EO1FBQWxELE9BQU8seURBQUcsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUM7O0FBQ3JFLFFBQUksTUFBTSxHQUFHLDRCQUFlLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELFVBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7QUFJbkIsUUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM3RCxVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCOztBQUVELFdBQU8sTUFBTSxDQUFDO0dBQ2Y7QUFDRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O0FBSXBCLFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7O0FBR25CLE9BQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2RCxPQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7OztBQUczQixPQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN0QyxRQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRXpDLFFBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLFdBQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUIsU0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pDO0dBQ0Y7QUFDRCxnQkFBYyxFQUFDLDBCQUFHOzs7QUFDaEIsUUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3pDLFFBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3pDLFFBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN6QyxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUVwQixRQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDaEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFbEMsU0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQ3BEOztBQUVELHFCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFckMsUUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFVBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUN0QixZQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRVYsWUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2hDLGNBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNuQixNQUFNOztBQUVMLGNBQUksWUFBWSxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDOzs7O0FBSXhELGFBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hGLGFBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUM1Qjs7QUFFRCxZQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFDLEtBQUssRUFBSztBQUN4QixlQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRztBQUMzQixrQkFBTSxFQUFFLE9BQUssU0FBUztBQUN0QixtQkFBTyxFQUFFLFNBQVMsRUFBRTtXQUNyQixDQUFDO1NBQ0gsQ0FBQyxDQUFDO09BQ0o7S0FDRixNQUFNO0FBQ0wsVUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFOztBQUV0QixZQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7O0FBRWhDLGNBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixhQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDM0I7T0FDRjtLQUNGOztBQUVELFFBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztBQUNqQixRQUFJLENBQUMsU0FBUyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ3hCLFdBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztBQUMvQixXQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsRUFBRSxDQUFDO0tBQy9CLENBQUMsQ0FBQztHQUNKO0FBQ0QsMEJBQXdCLEVBQUMsa0NBQUMsT0FBTyxFQUFFOzs7QUFDakMsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixRQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMxQixRQUFJLE1BQU0sR0FBRyxDQUFDLEFBQUMsT0FBTyxHQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUEsQ0FBRSxNQUFNLENBQUMsVUFBQyxDQUFDO2FBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0tBQUEsQ0FBQyxDQUFDOztBQUUvRixRQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUMxQixVQUFNLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ3RCLFVBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMvQixhQUFLLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBSyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUNqRSxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLFVBQUksR0FBRyxDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7O0FBQ3BDLFlBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDdEQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxlQUFlLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7O0FBQzNELFlBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDakMsTUFBTTs7QUFDTCxZQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdEIsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEMsY0FBSSxHQUFHLENBQUMsZUFBZSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyQyx3QkFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsRCxnQkFBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNqRSxnQkFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxrQkFBTTtXQUNQO1NBQ0Y7T0FDRjtLQUNGO0FBQ0QsV0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0dBQzdCO0FBQ0QsaUJBQWUsRUFBRSxTQUFTO0FBQzFCLGtCQUFnQixFQUFDLDBCQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQzVDLFFBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDbEMsU0FBUyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUk7OztBQUUzQyxZQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFckIsUUFBSSxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDeEMsYUFBTyxLQUFLLENBQUM7S0FDZDs7QUFFRCxXQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUNuRjs7QUFFRCwwQkFBd0IsRUFBQyxrQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRTtBQUNyRCxRQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDOzs7O0FBR2xDLFlBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUVyQixRQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN4QyxhQUFPLEtBQUssQ0FBQztLQUNkOztBQUVELFdBQU8sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUNuRTs7QUFFRCxpQkFBZSxFQUFDLHlCQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDakMsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixRQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUU7QUFDakMsYUFBTyxLQUFLLENBQUM7S0FDZDs7QUFFRCxRQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTlDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDOztBQUU3QyxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5RCxRQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRWxCLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM5QixRQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRTs7OztBQUl2QyxZQUFNLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbkQsV0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNEOztBQUVELE9BQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUM7QUFDckMsUUFBSSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUM5QyxXQUFPLGdCQUFnQixDQUFDO0dBQ3pCO0FBQ0QseUJBQXVCLEVBQUMsaUNBQUMsTUFBTSxFQUFFLElBQUksRUFBRTs7QUFFckMsUUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtBQUN2QyxhQUFPLEtBQUssQ0FBQztLQUNkOztBQUVELFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkQsUUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFeEQsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVqRCxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQzs7Ozs7QUFLdkUsVUFBTSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2RCxhQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQzs7QUFFdkUsUUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUM7QUFDM0MsUUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0FBRXBELFdBQU8sZ0JBQWdCLENBQUM7R0FDekI7QUFDRCw4QkFBNEIsRUFBQyxzQ0FBQyxXQUFXLEVBQUU7QUFDekMsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWU7UUFDL0IsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFbkMsT0FBRyxJQUFJLFdBQVcsSUFBSSxDQUFDLENBQUM7O0FBRXhCLFdBQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7R0FDMUM7QUFDRCxrQ0FBZ0MsRUFBQywwQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO0FBQ3ZDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlO1FBQUUsRUFBRTtRQUFFLEVBQUUsQ0FBQzs7QUFFMUMsU0FBSyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFDLFFBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25CLFFBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWYsVUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQy9DLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7QUFFRCxXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsOEJBQTRCLEVBQUMsc0NBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQ3ZELFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlO1FBQy9CLEVBQUU7UUFBRSxFQUFFLENBQUM7O0FBRVQsUUFBSSxHQUFHLEdBQUcsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTNCLFNBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkMsUUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkIsUUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFZixVQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDL0MsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOztBQUVELFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxvQkFBa0IsRUFBQyw0QkFBQyxNQUFNLEVBQUU7QUFDMUIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVWLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM5QixRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDOztBQUUxQixRQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7O0FBRW5CLFFBQUksTUFBTSxHQUFHLEtBQUssQ0FBQzs7QUFFbkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5QixPQUFDLEVBQUUsQ0FBQztBQUNKLFVBQUksQ0FBQyxJQUFJLEtBQUssRUFBRTtBQUNkLFNBQUMsR0FBRyxDQUFDLENBQUM7T0FDUDtBQUNELFVBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNuQyxVQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbkMsVUFBSSxBQUFDLEFBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQU0sTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEFBQUMsSUFBTSxBQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFNLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxBQUFDLEFBQUMsRUFBRTtBQUN0RixZQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQSxJQUFLLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQSxBQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFBLEFBQUMsR0FBRyxDQUFDLEVBQUU7QUFDN0YsZ0JBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQTtTQUNqQjtPQUNGO0tBQ0Y7O0FBRUQsV0FBTyxNQUFNLENBQUM7R0FDZjtDQUNGLENBQUM7Ozs7Ozs7Ozs7OzsrQkN0Z0JrQixxQkFBcUI7Ozs7MkJBQ21DLGlCQUFpQjs7QUFFN0YsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2IsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFbEQsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDMUUsTUFBSSxHQUFHLENBQUMsQ0FBQztDQUNWOztBQUVELElBQUksT0FBTyxDQUFDO0FBQ1osSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDOztxQkFFTCxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM3QixZQUFVLEVBQUUsU0FBUztBQUNyQixpQkFBZSxFQUFFLFNBQVM7QUFDMUIsWUFBVSxFQUFDLG9CQUFDLEtBQUssRUFBRSxNQUFNLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUVyQyxXQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUNqQixVQUFJLG1CQUFNO0FBQ1YsZUFBUyxFQUFFLEtBQUs7S0FDakIsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFWixLQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRTFELFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDOztBQUVyQixRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0dBQ2hEO0FBQ0QsYUFBVyxFQUFDLHVCQUFHO0FBQ2IsUUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUN4QixVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzNCLE1BQU07QUFDTCxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3ZCO0dBQ0Y7QUFDRCxRQUFNLEVBQUMsa0JBQUc7QUFDUixRQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDYixVQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQy9CO0dBQ0Y7QUFDRCxZQUFVLEVBQUMsc0JBQUc7O0FBQ1osUUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0dBQ3BCO0FBQ0QsTUFBSSxFQUFDLGdCQUFHO0FBQ04sUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDNUIsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7QUFDMUIsVUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDbkI7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsTUFBSSxFQUFDLGdCQUFHO0FBQ04sUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDNUIsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7QUFDMUIsVUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDbkI7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsbUJBQWlCLEVBQUMsNkJBQUc7QUFDbkIsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFOztBQUV6QixVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRSxVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzs7QUFFbEUsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDbEM7R0FDRjs7OztBQUlDLGFBQVcsRUFBQyxxQkFBQyxRQUFRLEVBQUU7QUFDdkIsUUFBSSxRQUFRLEVBQUU7QUFDWixjQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JCO0dBQ0Y7QUFDRCxVQUFRLEVBQUMsb0JBQUc7QUFDVixXQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztHQUM5RTtBQUNELFlBQVUsRUFBQyxvQkFBQyxLQUFLLEVBQUU7QUFDakIsUUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7QUFDeEIsYUFBTztLQUNSO0FBQ0QsUUFBSSxFQUFFLEdBQUcsS0FBSyxxQkFBUSxDQUFDOztBQUV2QixRQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsUUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUN6QjtBQUNELGVBQWEsRUFBQyx1QkFBQyxNQUFNLEVBQUU7QUFDckIsUUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7QUFDeEIsYUFBTztLQUNSO0FBQ0QsUUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLDBCQUFhLENBQUMsQ0FBQztHQUNuQztBQUNELGVBQWEsRUFBQyx1QkFBQyxTQUFTLEVBQUU7QUFDeEIsS0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztHQUMzQztBQUNELGtCQUFnQixFQUFDLDBCQUFDLFNBQVMsRUFBRTtBQUMzQixLQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQzlDO0FBQ0Qsc0JBQW9CLEVBQUMsZ0NBQUc7QUFDdEIsUUFBSSxTQUFTLEdBQUcsOEJBQWlCLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDbkQsUUFBSSxTQUFTLEdBQUcsbUJBQW1CLENBQUM7QUFDcEMsUUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTlCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEMsUUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEMsUUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDaEQ7QUFDRCxlQUFhLEVBQUMseUJBQUc7QUFDZixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyQixRQUFJLENBQUMsT0FBTyx3QkFBVyxDQUFDO0dBQ3pCO0FBQ0QsZUFBYSxFQUFDLHlCQUFHO0FBQ2YsV0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUseUJBQXlCLENBQUMsQ0FBQztHQUNoRjtBQUNELGdCQUFjLEVBQUMsMEJBQUc7QUFDaEIsUUFBSSxDQUFDLE9BQU8seUJBQVksQ0FBQztHQUMxQjtBQUNELFVBQVEsRUFBQyxvQkFBRztBQUNWLFdBQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLDBCQUEwQixDQUFDLElBQzFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0dBQzdEO0FBQ0QsY0FBWSxFQUFDLHdCQUFHO0FBQ2QsUUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDM0MsUUFBSSxDQUFDLE9BQU8sdUJBQVUsQ0FBQztHQUN4QjtBQUNELFNBQU8sRUFBQyxtQkFBRztBQUNULFdBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztHQUNoSTtBQUNELFlBQVUsRUFBQyxzQkFBRzs7O0FBQ1osUUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ3hCLFlBQUksQ0FBQyxNQUFLLGFBQWEsRUFBRSxFQUFFO0FBQ3pCLGlCQUFPO1NBQ1I7QUFDRCxZQUFJLEdBQUcsR0FBRyxNQUFLLElBQUksQ0FBQztBQUNwQixZQUFJLE1BQU0sR0FBRyxNQUFLLE9BQU8sQ0FBQzs7QUFFMUIsWUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDOUIsZ0JBQUssVUFBVSxFQUFFLENBQUM7QUFDbEIsaUJBQU87U0FDUjs7QUFFRCxZQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUM5QixZQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVyRCxZQUFJLGVBQWUsRUFBRTtBQUNuQixhQUFHLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztBQUM3QixnQkFBSyxVQUFVLEVBQUUsQ0FBQztTQUNuQixNQUFNO0FBQ0wsa0JBQUssUUFBUSxHQUFHLEtBQUssQ0FBQztBQUN0QixrQkFBSyxPQUFPLG1CQUFNLENBQUM7O0FBRW5CLGVBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztXQUNoRDtPQUNGLENBQUMsQ0FBQztLQUNKO0dBQ0Y7QUFDRCxtQkFBaUIsRUFBQyw2QkFBRzs7O0FBQ25CLFFBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDckIsVUFBSSxNQUFNLEdBQUcsT0FBSyxPQUFPLENBQUM7O0FBRTFCLFVBQUksTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLFdBQVMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO0FBQ3pELGVBQU87T0FDUjs7QUFFRCxVQUFJLEdBQUcsR0FBRyxPQUFLLElBQUksQ0FBQztBQUNwQixVQUFJLE9BQUssYUFBYSxFQUFFLElBQUksT0FBSyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQUssU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDaEYsV0FBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQzdCLGVBQU87T0FDUjs7QUFFRCxZQUFNLENBQUMsV0FBVyxRQUFNLENBQUM7QUFDekIsVUFBSSxPQUFLLGFBQWEsRUFBRSxFQUFFO0FBQ3hCLGVBQU87T0FDUjs7QUFHRCxVQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUNyQyxlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLE9BQUssaUJBQWlCLEVBQUUsRUFBRTtBQUM3QixjQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRWhCLFlBQUksT0FBSyxRQUFRLEVBQUUsRUFBRTtBQUNuQixhQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQzVELE1BQU07QUFDTCxhQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1NBQ3ZFOztBQUVELGVBQU87T0FDUjs7QUFFRCxVQUFJLE9BQUssUUFBUSxFQUFFLEVBQUU7O0FBQ25CLGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFLLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLGVBQUssVUFBVSxtQkFBTSxDQUFDO0FBQ3RCLGNBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNoQixXQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO09BQ3ZFLE1BQU07O0FBQ0wsWUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNsRCxhQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUV6QixjQUFJLGdCQUFnQixHQUFHLE9BQUssbUJBQW1CLENBQUMsRUFBQyxNQUFNLEVBQUUsRUFBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQUssSUFBSSxFQUFFLEVBQUUsT0FBSyxJQUFJLEVBQUUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDOztBQUV4SCxjQUFJLGdCQUFnQixFQUFFO0FBQ3BCLG1CQUFLLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLGVBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3JFLG1CQUFLLGlCQUFpQixFQUFFLENBQUM7QUFDekIsbUJBQU87V0FDUjs7QUFFRCxjQUFJLFNBQVMsR0FBRyxPQUFLLFNBQVMsRUFBRSxDQUFDOztBQUVqQyxjQUFJLFVBQVUsR0FBRyxPQUFLLElBQUksRUFBRSxDQUFDO0FBQzdCLGdCQUFNLENBQUMsWUFBWSxRQUFNLENBQUM7O0FBRTFCLGNBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDckIsZ0JBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTdDLGdCQUFJLFNBQVMsQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQyxHQUFHLEVBQUU7QUFDdEUsaUJBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDNUQ7O0FBRUQsa0JBQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7V0FDaEMsTUFBTTtBQUNMLGVBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7V0FDMUI7QUFDRCxnQkFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pCO09BQ0Y7S0FDRixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBTTtBQUN6QixVQUFJLE9BQUssT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFO0FBQzNDLFlBQUksT0FBSyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN2QyxjQUFJLE9BQUssYUFBYSxFQUFFLEVBQUU7QUFDeEIsbUJBQUssSUFBSSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1dBQ2pELE1BQU0sSUFBSSxXQUFTLE9BQUssT0FBTyxDQUFDLFdBQVcsRUFBRTtBQUM1QyxtQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7V0FDekQ7U0FDRjtPQUNGLE1BQU07QUFDTCxZQUFJLE9BQUssaUJBQWlCLEVBQUUsRUFBRTtBQUM1QixjQUFJLE9BQUssUUFBUSxFQUFFLEVBQUU7QUFDbkIsbUJBQUssSUFBSSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1dBQzNELE1BQU07QUFDTCxtQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7V0FDcEQ7U0FDRixNQUFNO0FBQ0wsaUJBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1NBQ3hEO09BQ0Y7S0FDRixDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFNO0FBQ3hCLGFBQUssSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0tBQzFDLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7O0FBRWxCLFFBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFlBQU07QUFDeEIsVUFBSSxNQUFNLEdBQUcsT0FBSyxPQUFPLENBQUM7QUFDMUIsVUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUNwRSxZQUFJLFdBQVMsTUFBTSxDQUFDLFdBQVcsRUFBRTtBQUMvQixnQkFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqQztPQUNGO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ3JCLFVBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7O0FBRXRCLFlBQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOztBQUUzQixVQUFJLEdBQUcsR0FBRyxPQUFLLElBQUksQ0FBQztBQUNwQixTQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7O0FBRTNDLGFBQUssWUFBWSxFQUFFLENBQUM7O0FBRXBCLFNBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBQyxNQUFNLFFBQU0sRUFBQyxDQUFDLENBQUM7S0FDaEQsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFlBQU07O0FBRXZCLGFBQUssT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCLGFBQUssSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFDLE1BQU0sUUFBTSxFQUFDLENBQUMsQ0FBQzs7QUFFeEQsYUFBTyxHQUFHLElBQUksQ0FBQztBQUNmLGdCQUFVLENBQUMsWUFBTTtBQUNmLGVBQU8sR0FBRyxLQUFLLENBQUM7T0FDakIsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFUixhQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztLQUNwRCxDQUFDLENBQUM7R0FDSjtBQUNELGVBQWEsRUFBQyx5QkFBRztBQUNmLFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDcEIsUUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEQsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsVUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFVBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxJQUFJLEVBQUU7QUFDekIsWUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUU7QUFDN0MsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7T0FDRjtLQUNGO0FBQ0QsV0FBTyxLQUFLLENBQUM7R0FDZDtBQUNELHFCQUFtQixFQUFDLDZCQUFDLE9BQU8sRUFBRTtBQUM1QixXQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0dBQ3REO0FBQ0QscUJBQW1CLEVBQUMsNkJBQUMsQ0FBQyxFQUFFO0FBQ3RCLFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7O0FBRXBCLFFBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtBQUNqQyxhQUFPO0tBQ1I7O0FBRUQsUUFBSSxNQUFNLEdBQUcsQUFBQyxDQUFDLEtBQUssU0FBUyxHQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNyRSxRQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUMvQixRQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDM0IsUUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUN4Qix3QkFBa0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUN0RSxvQkFBYyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN2QyxNQUFNO0FBQ0wsb0JBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDdkM7O0FBRUQsUUFBSSxJQUFJLEdBQUcsY0FBYyxJQUFJLGtCQUFrQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFaEksT0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFFBQUksSUFBSSxFQUFFO0FBQ1IsVUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0tBQ3BDOztBQUVELFdBQU8sR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDL0I7QUFDRCw4QkFBNEIsRUFBQyxzQ0FBQyxDQUFDLEVBQUU7OztBQUMvQixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSTtRQUFFLGVBQWUsR0FBRyxLQUFLO1FBQUUsSUFBSTtRQUFFLE1BQU0sR0FBRyxBQUFDLENBQUMsS0FBSyxTQUFTLEdBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQ3JILFFBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hELFFBQUksYUFBYSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQzNDLFFBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM1QixRQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRTVCLFFBQUksU0FBUyxJQUFJLElBQUksSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQzFDLGFBQU87S0FDUjs7QUFFRCxRQUFJLFdBQVcsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEMsUUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3RDLFFBQUksTUFBTTtRQUFFLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRTFCLFFBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDeEIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsWUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixZQUFJLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ3pCLHlCQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0YsY0FBSSxlQUFlLEVBQUU7QUFDbkIsbUJBQU8sZUFBZSxDQUFDO1dBQ3hCOztBQUVELGtCQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2QsZ0JBQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTFCLGdCQUFNLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ3RCLGdCQUFJLE9BQUssT0FBTyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFO0FBQ3RELHNCQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ25CO1dBQ0YsQ0FBQyxDQUFDOztBQUVILGNBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ3JDLG1CQUFPLElBQUksQ0FBQztXQUNiO1NBQ0Y7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7S0FDOUYsTUFBTTtBQUNMLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JDLHVCQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OztBQUduRyxZQUFJLGVBQWUsRUFBRTtBQUNuQixpQkFBTyxlQUFlLENBQUM7U0FDeEI7O0FBRUQsZ0JBQVEsR0FBRyxFQUFFLENBQUM7QUFDZCxjQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzlCLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RDLGNBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQ2hELG9CQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1dBQ25CO1NBQ0Y7QUFDRCxZQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUNyQyxpQkFBTyxJQUFJLENBQUM7U0FDYjtPQUNGO0tBQ0Y7QUFDRCxXQUFPLGVBQWUsQ0FBQztHQUN4QjtBQUNELE9BQUssRUFBQyxlQUFDLEdBQUcsRUFBRTs7O0FBQ1YsS0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRXpDLFFBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQzFCLGFBQUssT0FBTyxDQUFDLFdBQVcsUUFBTSxDQUFDO0FBQy9CLGFBQUssZUFBZSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDOztBQUV4QyxVQUFJLE9BQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3hCLGVBQUssT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQUssUUFBUSxDQUFDLENBQUM7O09BRTlDO0tBRUYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDbkIsYUFBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDdEIsYUFBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEIsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQU07QUFDekIsVUFBSSxDQUFDLE9BQUssUUFBUSxDQUFDLFFBQVEsRUFBRTtBQUMzQixlQUFPLEtBQUssQ0FBQztPQUNkO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUM3QjtBQUNELFNBQU8sRUFBQyxpQkFBQyxDQUFDLEVBQUU7QUFDVixRQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDN0I7QUFDRCxZQUFVLEVBQUMsb0JBQUMsQ0FBQyxFQUFFO0FBQ2IsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUU7QUFDdkQsVUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7S0FDNUI7R0FDRjs7QUFFRCxxQkFBbUIsRUFBQywrQkFBRztBQUNyQixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3BCLFFBQUksR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUU7QUFDMUIsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztBQUN2QyxVQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFM0QsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDekIsU0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDOztBQUUzQyxTQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7O0FBRS9DLFVBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNuQixNQUFNO0FBQ0wsVUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDekM7R0FDRjtBQUNELGNBQVksRUFBQyxzQkFBQyxHQUFHLEVBQUU7QUFDakIsUUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2IsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV2RixVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ25CO0dBQ0Y7QUFDRCxXQUFTLEVBQUMscUJBQUc7QUFDWCxRQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUN4RCxRQUFJLENBQUMsZ0JBQWdCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztHQUNqRDtBQUNELHFCQUFtQixFQUFDLCtCQUFHO0FBQ3JCLFFBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0dBQ3pDO0FBQ0Qsb0JBQWtCLEVBQUMsOEJBQUc7QUFDcEIsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUNwQixVQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7S0FDekM7QUFDRCxRQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7R0FDdEM7QUFDRCxtQkFBaUIsRUFBQyw2QkFBRztBQUNuQixRQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxVQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7S0FDakM7QUFDRCxRQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUMxQixRQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxVQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7S0FDakM7R0FDRjtBQUNELG1CQUFpQixFQUFDLDZCQUFHO0FBQ25CLFdBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0dBQ3pEO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLEdBQUcsRUFBRTtBQUNiLFFBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXJCLEtBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQzdDO0FBQ0QsYUFBVyxFQUFFLEVBQUU7QUFDZixnQkFBYyxFQUFFLElBQUk7QUFDcEIsZ0JBQWMsRUFBRSxJQUFJO0FBQ3BCLGlCQUFlLEVBQUMsMkJBQUc7QUFDakIsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixRQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFeEIsUUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2pDLFFBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3RELFFBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztBQUV0RCxRQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7O0FBRXRELFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNqRSxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7O0FBRWpFLFFBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUUvQixRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDM0MsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0dBQzVDO0FBQ0Qsa0JBQWdCLEVBQUMsNEJBQUc7OztBQUNsQixRQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFDLElBQUk7YUFBSyxPQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQy9EO0FBQ0QscUJBQW1CLEVBQUMsK0JBQUc7QUFDckIsUUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7OztBQUc1QixRQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7R0FDeEI7QUFDRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDakIsUUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRXpCLFFBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3pCLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNsQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMzQzs7QUFFRCxRQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDM0M7O0FBRUQsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDOzs7QUFHN0IsUUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDekI7QUFDRCxnQkFBYyxFQUFFLElBQUk7QUFDcEIsS0FBRyxFQUFFLElBQUk7QUFDVCxtQkFBaUIsRUFBQyw2QkFBRzs7O0FBQ25CLFFBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixVQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDNUM7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1osa0JBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDeEI7O0FBRUQsUUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7O0FBRWhFLFFBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDOztBQUU3RCxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7O0FBRTdELFFBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFckMsUUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsWUFBTTtBQUMxQixhQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBSyxjQUFjLENBQUMsQ0FBQztLQUM1QyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQ1Q7Q0FDRixDQUFDOzs7Ozs7Ozs7Ozs7K0JDM2pCMEIscUJBQXFCOzs7OytCQUM3QixxQkFBcUI7Ozs7cUJBRTFCLENBQUMsQ0FBQyxXQUFXLEdBQUcsNkJBQWdCLE1BQU0sQ0FBQztBQUNwRCxPQUFLLEVBQUUsU0FBUztBQUNoQixJQUFFLEVBQUUsQ0FBQztBQUNMLFFBQU0sRUFBRSxFQUFFO0FBQ1YsWUFBVSxFQUFDLG9CQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDNUIsS0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdELFFBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLDJCQUEyQixDQUFDO0dBQ3REO0FBQ0QsU0FBTyxFQUFDLGlCQUFDLENBQUMsRUFBRTtBQUNWLFFBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7O0FBRXRCLFFBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDMUIsVUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDdEMsYUFBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFNO2VBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3pELFVBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTTtlQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUU7T0FBQSxDQUFDLENBQUM7S0FFcEY7QUFDRCxRQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDZjtBQUNELGFBQVcsRUFBQyxxQkFBQyxDQUFDLEVBQUU7QUFDZCxRQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDN0MsUUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVwQyxRQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3hFLFFBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRS9ELFFBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNmO0FBQ0QsT0FBSyxFQUFDLGVBQUMsR0FBRyxFQUFFOzs7QUFDVixLQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFM0MsT0FBRyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzdCLE9BQUcsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBQyxDQUFDO2FBQUssTUFBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0FBQ3BELE9BQUcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUM5QixPQUFHLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFVBQUMsQ0FBQzthQUFLLE1BQUssT0FBTyxDQUFDLENBQUMsQ0FBQztLQUFBLENBQUMsQ0FBQztBQUNyRCxPQUFHLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDaEMsT0FBRyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLENBQUM7YUFBSyxNQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FBQSxDQUFDLENBQUM7QUFDdkQsT0FBRyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQzlCLE9BQUcsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsVUFBQyxDQUFDO2FBQUssTUFBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO0tBQUEsQ0FBQyxDQUFDOztBQUV6RCxRQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFNO0FBQ3pCLFVBQUksR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDNUMsZUFBTztPQUNQOztBQUVELFNBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztLQUMzQyxDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRTthQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDckU7QUFDRCxVQUFRLEVBQUMsa0JBQUMsR0FBRyxFQUFFO0FBQ2IsUUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN0QixRQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVyQixPQUFHLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDekMsT0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDOztBQUV4QyxLQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztHQUMvQztBQUNELFNBQU8sRUFBQyxpQkFBQyxJQUFJLEVBQUU7QUFDYixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV2QixRQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDZjtBQUNELGdCQUFjLEVBQUMsMEJBQUc7QUFDaEIsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs7QUFFcEIsT0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7O0FBRXJDLFFBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUU7QUFDbkIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ2hDO0dBQ0Y7QUFDRCx1QkFBcUIsRUFBQyxpQ0FBRztBQUN2QixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUVwQixRQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLElBQUksR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDckUsYUFBTztLQUNSOztBQUVELFFBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JFLFFBQUksUUFBUSxHQUFHLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRSxRQUFJLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRXZGLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlDLFVBQUksS0FBSyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsVUFBSSxLQUFLLENBQUMsNEJBQTRCLEVBQUUsRUFBRTtBQUN4QyxZQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdEIsY0FBTTtPQUNQOztBQUVELFVBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFO0FBQzNELFlBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN0QixjQUFNO09BQ1A7O0FBRUQsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNwRCxZQUFJLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVwRCxZQUFJLFFBQVEsS0FBSyxxQkFBcUIsSUFBSSxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtBQUNyRyxjQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdEIsZ0JBQU07U0FDUDtPQUNGO0tBQ0Y7R0FDRjtDQUNGLENBQUM7Ozs7Ozs7Ozs7OzswQkNoSGlCLGdCQUFnQjs7OzttQ0FDbEIseUJBQXlCOzs7O3FCQUUzQixDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUM1QixVQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNOztBQUV4QixXQUFTLEVBQUUsS0FBSztBQUNoQixhQUFXLEVBQUUsU0FBUztBQUN0QixjQUFZLEVBQUUsU0FBUztBQUN2QixlQUFhLEVBQUUsU0FBUztBQUN4QixlQUFhLEVBQUUsQ0FBQztBQUNoQixVQUFRLEVBQUUsRUFBRTtBQUNaLE9BQUssRUFBQyxlQUFDLEdBQUcsRUFBRTtBQUNWLFFBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7R0FFcEI7QUFDRCxVQUFRLEVBQUMsa0JBQUMsR0FBRyxFQUFFOztBQUViLFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztHQUNwQjtBQUNELGFBQVcsRUFBQyx1QkFBRzs7O0FBQ2IsUUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDaEMsWUFBSyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQy9CLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0dBQ3BCO0FBQ0QsT0FBSyxFQUFDLGVBQUMsR0FBRyxFQUFFO0FBQ1YsT0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNwQjtBQUNELFVBQVEsRUFBQyxrQkFBQyxNQUFNLEVBQUU7QUFDaEIsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsUUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUMzQixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQy9EO0FBQ0QsVUFBTSxDQUFDLFFBQVEsR0FBRyxBQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxHQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0dBQzFGO0FBQ0QsUUFBTSxFQUFDLGtCQUFHOzs7QUFDUixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDL0IsV0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUN4QixhQUFPLE9BQUssU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFO0FBQzlCLGVBQUssWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzNCO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2pCLFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDcEIsU0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZEO0dBQ0Y7QUFDRCxhQUFXLEVBQUMscUJBQUMsTUFBTSxFQUFFO0FBQ25CLFFBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDL0IsUUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQ25DO0FBQ0QsV0FBUyxFQUFDLHFCQUFHO0FBQ1gsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0dBQ3RCO0FBQ0QsV0FBUyxFQUFDLG1CQUFDLEVBQUUsRUFBRTtBQUNiLFFBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQzNCO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLFFBQVEsRUFBRTtBQUNsQixRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVuQyxRQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7QUFDaEIsYUFBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDM0I7O0FBRUQsUUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQ3RCLFVBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDMUI7O0FBRUQsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELGFBQVcsRUFBQyx1QkFBRztBQUNiLFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN6QjtBQUNELFlBQVUsRUFBQyxzQkFBRztBQUNaLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDNUIsV0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNwQztBQUNELGNBQVksRUFBQyxzQkFBQyxNQUFNLEVBQUU7QUFDcEIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRTNCLFFBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDOUIsUUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM5QixRQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUN4QyxRQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxRQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFekMsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs7QUFFcEIsUUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUMvQixVQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFOUMsVUFBSSxDQUFDLEVBQUU7QUFDTCxXQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7T0FDcEQ7S0FDRixNQUFNO0FBQ0wsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztPQUNsRCxNQUFNO0FBQ0wsV0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzs7QUFFckMsV0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO09BQ25DO0FBQ0QsU0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQ3ZDO0dBQ0Y7QUFDRCxnQkFBYyxFQUFDLHdCQUFDLFFBQVEsRUFBRTtBQUN4QixRQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ2pDLGFBQU87S0FDUjs7QUFFRCxRQUFJLE1BQU0sQ0FBQztBQUNYLFFBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO0FBQ2hDLFlBQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2xDLE1BQU07QUFDTCxhQUFPO0tBQ1I7O0FBRUQsUUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDNUIsV0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUMzQixVQUFJLFVBQVUsRUFBRTtBQUNkLGVBQU8sQ0FBQyxRQUFRLEdBQUcsQUFBQyxPQUFPLENBQUMsUUFBUSxLQUFLLENBQUMsR0FBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7T0FDeEU7QUFDRCxVQUFJLE9BQU8sS0FBSyxNQUFNLEVBQUU7QUFDdEIsY0FBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNsQyxjQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2xDLGtCQUFVLEdBQUcsSUFBSSxDQUFDO09BQ25CO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXpCLFFBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdEIsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2IsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDakIsWUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixXQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDMUIsV0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO09BQ3ZEO0tBQ0Y7R0FDRjtBQUNELFdBQVMsRUFBQyxtQkFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTs7QUFFcEMsUUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsY0FBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQzFDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFaEMsVUFBSSxVQUFVLEdBQUcsQUFBQyxRQUFRLEdBQUcsQ0FBQyxHQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEYsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxBQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7QUFDaEUsWUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDeEQ7O0FBRUQsUUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNqQyxhQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztLQUMzQjs7QUFFRCxRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUNuQixhQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3REOztBQUVELFFBQUksTUFBTSxHQUFHLDRCQUFXLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDL0MsUUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDdEIsVUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDM0IsVUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7S0FDM0I7O0FBRUQsUUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQzFCLFlBQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0tBQzVCOzs7Ozs7OztBQVFELFFBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXRCO0FBQ0UsWUFBTSxDQUFDLFFBQVEsR0FBRyxBQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssU0FBUyxHQUFLLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQzVGLFlBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNoQyxVQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDakMsVUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUNoQyxjQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7T0FDbEM7S0FDRjs7QUFFRCxRQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDMUIsVUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7S0FDM0I7OztBQUdELFFBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQixVQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDL0I7O0FBRUQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUN0QixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQ3ZEOztBQUVELFdBQU8sTUFBTSxDQUFDO0dBQ2Y7QUFDRCxPQUFLLEVBQUMsaUJBQUc7OztBQUNQLFFBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVuQixPQUFHLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBRSxFQUFLO0FBQ2xCLGFBQUssYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3hCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQzs7QUFFdkIsUUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7R0FDL0I7QUFDRCxlQUFhLEVBQUMsdUJBQUMsRUFBRSxFQUFFO0FBQ2pCLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQ25EO0FBQ0Qsa0JBQWdCLEVBQUMsMEJBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUNsQyxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSTtRQUNqQixFQUFFLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7O0FBRXhDLFdBQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2hEO0FBQ0Qsa0JBQWdCLEVBQUMsMEJBQUMsUUFBUSxFQUFFOzs7QUFDMUIsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7QUFFNUIsUUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFLO0FBQ3JDLFVBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUMxQixpQkFBUyxHQUFHLElBQUksQ0FBQztPQUNsQjtBQUNELFVBQUksU0FBUyxFQUFFO0FBQ2IsZUFBSyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztPQUN4QztLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0Qsa0JBQWdCLEVBQUMsNEJBQUc7OztBQUNsQixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDOztBQUU1QixXQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBSzs7QUFFcEMsWUFBTSxDQUFDLEtBQUssR0FBRyxPQUFLLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBTSxDQUFDLEtBQUssR0FBRyxPQUFLLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7OztBQUczQyxVQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7QUFDbEIsY0FBTSxDQUFDLEtBQUssR0FBRyxPQUFLLFVBQVUsRUFBRSxDQUFDO0FBQ2pDLGNBQU0sQ0FBQyxLQUFLLEdBQUcsT0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDakM7OztBQUdELFVBQUksUUFBUSxLQUFLLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ25DLGNBQU0sQ0FBQyxLQUFLLEdBQUcsT0FBSyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzNDLGNBQU0sQ0FBQyxLQUFLLEdBQUcsT0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDakM7S0FDRixDQUFDLENBQUM7R0FDSjtBQUNELE1BQUksRUFBQyxnQkFBRztBQUNOLFFBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFZCxTQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDM0IsVUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNmOztBQUVELFFBQUksQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQzthQUFLLENBQUMsR0FBRyxDQUFDO0tBQUEsQ0FBQyxDQUFDOztBQUUzQixXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsUUFBTSxFQUFDLGtCQUFHO0FBQ1IsUUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLGFBQU87S0FDUjs7QUFFRCxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3BCLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixTQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN6QyxTQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN6QyxNQUFNO0FBQ0wsU0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDMUM7O0FBRUQsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUNqQyxZQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUM1QixDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7R0FDOUM7QUFDRCxTQUFPLEVBQUMsbUJBQUc7QUFDVCxXQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0dBQ3RDO0FBQ0QsZ0JBQWMsRUFBQywwQkFBRztBQUNoQixRQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ2pDLFlBQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0tBQzlCLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0dBQ3hCO0NBQ0YsQ0FBQzs7Ozs7Ozs7O3FCQ3JUYSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM5QixTQUFPLEVBQUU7QUFDUCxZQUFRLEVBQUUsU0FBUztBQUNuQixRQUFJLEVBQUU7O0tBRUw7QUFDRCxhQUFTLEVBQUUsY0FBYztHQUMxQjtBQUNELE1BQUksRUFBRSxJQUFJO0FBQ1YsV0FBUyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZTtBQUNyQyxZQUFVLEVBQUMsb0JBQUMsT0FBTyxFQUFFO0FBQ25CLEtBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNsQztBQUNELGlCQUFlLEVBQUUsSUFBSTtBQUNyQixPQUFLLEVBQUMsZUFBQyxHQUFHLEVBQUU7OztBQUNWLE9BQUcsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFlBQU07QUFDekIsVUFBSSxNQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQUssSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzNELGNBQUssV0FBVyxFQUFFLENBQUM7T0FDcEI7S0FDRixDQUFDLENBQUM7O0FBRUgsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7O0FBRTlFLE9BQUcsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTdDLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7O0FBRTNCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixjQUFVLENBQUMsWUFBTTtBQUNmLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN0QyxVQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDckIsV0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7T0FDOUM7O0FBRUQsT0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBSyxZQUFZLFFBQU8sQ0FBQztBQUN4RSxPQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFLLFdBQVcsUUFBTyxDQUFDO0tBRXZFLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRVQsT0FBRyxDQUFDLGFBQWEsR0FBRzs7S0FBVSxDQUFDOztBQUUvQixXQUFPLFNBQVMsQ0FBQztHQUNsQjtBQUNELGFBQVcsRUFBQyx1QkFBRyxFQUFFO0FBQ2pCLGNBQVksRUFBQyx3QkFBRyxFQUFFO0FBQ2xCLGFBQVcsRUFBQyx1QkFBRyxFQUFFO0FBQ2pCLFNBQU8sRUFBQyxpQkFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFOzs7QUFDeEIsUUFBSSxJQUFJLENBQUM7QUFDVCxRQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEtBQUssRUFBSztBQUMzQixVQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUM3QixXQUFHLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQztPQUMxQjs7O0FBR0QsVUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxlQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLFVBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDekQsVUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7O0FBRWhCLFVBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO0FBQ3RDLE9BQUMsQ0FBQyxRQUFRLENBQ1AsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQ3ZCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUMzQixFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FDMUIsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFaEQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTNGLFVBQUksUUFBUSxHQUFJLENBQUEsVUFBVSxHQUFHLEVBQUUsY0FBYyxFQUFFO0FBQzdDLGVBQU8sWUFBWTtBQUNqQixhQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzFCLENBQUE7T0FDRixDQUFBLENBQUMsT0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLGNBQWMsSUFBSSxZQUFZLENBQUMsQUFBQyxDQUFDOztBQUVsRCxPQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQ3JELEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUUvQixVQUFJLEdBQUcsSUFBSSxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7R0FDbEI7QUFDRCxpQkFBZSxFQUFDLDJCQUFHO0FBQ2pCLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDN0M7QUFDRCxVQUFRLEVBQUMsa0JBQUMsR0FBRyxFQUFFO0FBQ2IsV0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQzFDO0FBQ0QsWUFBVSxFQUFDLG9CQUFDLEdBQUcsRUFBRTtBQUNmLEtBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7R0FDcEQ7QUFDRCxXQUFTLEVBQUMsbUJBQUMsR0FBRyxFQUFFO0FBQ2QsS0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztHQUN2RDtDQUNGLENBQUM7Ozs7Ozs7Ozs7OzswQkM3RmtCLGNBQWM7Ozs7cUJBRW5CLHdCQUFRLE1BQU0sQ0FBQztBQUM1QixTQUFPLEVBQUU7QUFDUCxhQUFTLEVBQUUsY0FBYztHQUMxQjtBQUNELE9BQUssRUFBQyxlQUFDLEdBQUcsRUFBRTs7O0FBQ1YsUUFBSSxTQUFTLEdBQUcsd0JBQVEsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUV4RCxPQUFHLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxZQUFNO0FBQzNCLFlBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsTUFBSyxTQUFTLFFBQU8sQ0FBQzs7QUFFcEQsWUFBSyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDN0IsQ0FBQyxDQUFDOztBQUVILEtBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDOztBQUVyRCxXQUFPLFNBQVMsQ0FBQztHQUNsQjtBQUNELGFBQVcsRUFBQyx1QkFBRztBQUNiLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRTtBQUN2QyxVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ25DLFVBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdkIsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDakMsTUFBTTtBQUNMLFVBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNqQztHQUNGO0FBQ0QsV0FBUyxFQUFDLHFCQUFHO0FBQ1gsUUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUNsQyxRQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7R0FDM0I7QUFDRCxhQUFXLEVBQUMscUJBQUMsU0FBUyxFQUFFO0FBQ3RCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRWpELFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0QsWUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQy9CLFlBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztBQUNoQyxZQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztBQUMxQyxZQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDL0IsWUFBUSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDOztBQUVwQyxLQUFDLENBQUMsUUFBUSxDQUNQLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDckMsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUN6QyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQ3hDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFM0IsUUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztBQUNuRixhQUFTLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztBQUMxQixhQUFTLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQzs7QUFFL0IsS0FBQyxDQUFDLFFBQVEsQ0FDUCxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQ3RDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDMUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFbEQsUUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFNUIsS0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3pELGFBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDN0I7QUFDRCxVQUFRLEVBQUUsSUFBSTtBQUNkLGFBQVcsRUFBQyx1QkFBRzs7O0FBQ2IsUUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLGtCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzdCOztBQUVELFFBQUksSUFBSSxDQUFDO0FBQ1QsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixRQUFJO0FBQ0YsVUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFeEMsU0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztBQUVqRSxTQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTVCLFVBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDL0IsZUFBSyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2hDLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRVQsVUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ2xCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixTQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRTNELFVBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDL0IsZUFBSyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2hDLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDVjtHQUNGO0FBQ0QsY0FBWSxFQUFDLHdCQUFHO0FBQ2QsUUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUM5RDtBQUNELGFBQVcsRUFBQyx1QkFBRztBQUNiLFFBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ2hDO0NBQ0YsQ0FBQzs7Ozs7Ozs7O3FCQ25HYSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM5QixTQUFPLEVBQUU7QUFDUCxZQUFRLEVBQUUsV0FBVztBQUNyQixjQUFVLEVBQUUsSUFBSTtHQUNqQjtBQUNELFlBQVUsRUFBQyxvQkFBQyxPQUFPLEVBQUU7QUFDbkIsS0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ2xDO0FBQ0QsaUJBQWUsRUFBRSxJQUFJO0FBQ3JCLE9BQUssRUFBQyxlQUFDLEdBQUcsRUFBRTs7O0FBQ1YsUUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3BELFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQyxDQUFDOztBQUU5RCxPQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUMxQyxPQUFHLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUxQyxjQUFVLENBQUMsWUFBTTtBQUNmLFlBQUssYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNuQyxTQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUMsT0FBTyxPQUFNLEVBQUMsQ0FBQyxDQUFDOztBQUU1QyxZQUFLLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN0QixFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVULE9BQUcsQ0FBQyxhQUFhLEdBQUc7O0tBQVUsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFdEIsV0FBTyxTQUFTLENBQUM7R0FDbEI7QUFDRCxZQUFVLEVBQUMsb0JBQUMsR0FBRyxFQUFFO0FBQ2YsUUFBSSxhQUFhLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyRCxRQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUNsRCxVQUFJLEtBQUssR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdEQsVUFBRyxDQUFDLEtBQUssRUFBRTtBQUNULGVBQU87T0FDUjs7QUFFRCxVQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQzlCLFVBQUcsS0FBSyxFQUFFO0FBQ1IscUJBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFBLEdBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztPQUM1RTtLQUNGO0dBQ0Y7QUFDRCxhQUFXLEVBQUMscUJBQUMsR0FBRyxFQUFFOzs7QUFDaEIsY0FBVSxDQUFDLFlBQU07QUFDZixZQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFlBQU07QUFDdEMsZUFBSyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDdEIsQ0FBQyxDQUFDO0tBQ0osRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNQO0FBQ0QsZUFBYSxFQUFDLHVCQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7OztBQUM3QixRQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3JGLGFBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUU1QyxRQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtBQUNwQyxPQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzVELFVBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO0tBQzFEOztBQUVELFFBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLFVBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUN6QyxPQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFLLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM1RCxPQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFLLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUMzRCxPQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFLLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQzs7QUFFN0QsYUFBSyxlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7QUFFdEMsVUFBSSxJQUFJLEVBQUU7QUFDUixTQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFLLGVBQWUsRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7T0FDM0Q7QUFDRCxhQUFLLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN0QixDQUFDOztBQUVGLFFBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLFlBQU07QUFDaEMsT0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBSyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDMUQsQ0FBQztHQUNIO0FBQ0QsaUJBQWUsRUFBQywyQkFBRztBQUNqQixXQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQy9DO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLEdBQUcsRUFBRTtBQUNiLFdBQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUMxQztBQUNELFlBQVUsRUFBQyxvQkFBQyxHQUFHLEVBQUU7QUFDZixLQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0dBQ3BEO0FBQ0QsV0FBUyxFQUFDLG1CQUFDLEdBQUcsRUFBRTtBQUNkLEtBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7R0FDdkQ7Q0FDRixDQUFDOzs7Ozs7Ozs7cUJDekZhLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQzlCLFNBQU8sRUFBQyxtQkFBRztBQUNULFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNoQyxXQUFPLE9BQU8sS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEFBQUMsQ0FBQztHQUN2RjtBQUNELFNBQU8sRUFBQyxpQkFBQyxlQUFlLEVBQUU7QUFDeEIsUUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUU7QUFDakMsYUFBTztLQUNSO0FBQ0QsV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0dBQ3JDO0FBQ0QsY0FBWSxFQUFDLHNCQUFDLGVBQWUsRUFBRSxVQUFVLEVBQUU7QUFDekMsUUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzdELGFBQU87S0FDUjs7QUFFRCxXQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDakQ7QUFDRCxVQUFRLEVBQUMsb0JBQUc7QUFDVixXQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7R0FDcEI7QUFDRCxZQUFVLEVBQUMsc0JBQUc7QUFDWixRQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqQixRQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDZjtBQUNELE9BQUssRUFBQyxpQkFBRztBQUNQLFFBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFbEIsUUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUM5RCxVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0dBQ0Y7QUFDRCxpQkFBZSxFQUFDLHlCQUFDLGVBQWUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFO0FBQ3BELFFBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzNELFVBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsTUFBTSxDQUFDO0tBQ25ELE1BQU0sSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNuRSxVQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztLQUN2QyxNQUFNO0FBQ0wsVUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7S0FDdEI7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLE9BQU8sRUFBRTtBQUNqQixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztHQUN2QjtBQUNELGNBQVksRUFBQyxzQkFBQyxlQUFlLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTtBQUNqRCxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsUUFBSSxLQUFLLEVBQUU7QUFDVCxVQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUMzRCxhQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLE1BQU0sQ0FBQztPQUNwRDtLQUNGO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGLENBQUM7Ozs7Ozs7OztxQkN0RGEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDNUIsT0FBSyxFQUFFLElBQUk7QUFDWCxZQUFVLEVBQUMsb0JBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDM0IsUUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7QUFDaEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUN2QyxRQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUM7QUFDeEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDdkIsUUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUU5RSxRQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWYsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztHQUNqQzs7QUFFRCxTQUFPLEVBQUMsbUJBQUc7QUFDVCxRQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdDLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO0dBQ0Y7O0FBRUQsVUFBUSxFQUFDLGlCQUFDLFFBQVEsRUFBRTtBQUNsQixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzVDLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxTQUFPLEVBQUMsbUJBQUc7QUFDVCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7R0FDL0Q7QUFDRCxpQkFBZSxFQUFDLHlCQUFDLE1BQU0sRUFBRTtBQUN2QixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztRQUM1QyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDOztBQUVyQyxRQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkIsc0JBQWdCLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDOUMsT0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDOUM7O0FBRUQsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxZQUFVLEVBQUMsb0JBQUMsTUFBTSxFQUFFO0FBQ2xCLFFBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixPQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3BELE9BQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztLQUM5RDtBQUNELFFBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ25CLFVBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3BEO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxXQUFTLEVBQUMsbUJBQUMsTUFBTSxFQUFFO0FBQ2pCLFFBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixPQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3BELE9BQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztLQUM3RDtBQUNELFFBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ25CLFVBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3BEO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxPQUFLLEVBQUMsaUJBQUc7QUFDUCxRQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkIsT0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN2RCxPQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDL0QsT0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0tBQ2pFO0FBQ0QsUUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEQsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxNQUFJLEVBQUMsY0FBQyxLQUFJLEVBQUU7QUFDVixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNoQjtBQUNELE1BQUksRUFBQyxjQUFDLE1BQU0sRUFBaUI7UUFBZixJQUFJLHlEQUFHLE1BQU07O0FBRXpCLFFBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFWixRQUFHLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4QjtBQUNELFFBQUcsSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUNsQixVQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZCO0dBQ0Y7QUFDRCxVQUFRLEVBQUMsa0JBQUMsTUFBTSxFQUFFO0FBQ2hCLFFBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXZCLFFBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3pCLGtCQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztLQUM5Qjs7QUFFRCxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQzlFO0FBQ0QsV0FBUyxFQUFDLG1CQUFDLE1BQU0sRUFBRTtBQUNqQixRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV4QixRQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixrQkFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7S0FDL0I7O0FBRUQsUUFBSSxDQUFDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUMvRTtBQUNELE1BQUksRUFBQyxnQkFBRztBQUNOLFFBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNkO0FBQ0QsY0FBWSxFQUFDLHNCQUFDLENBQUMsRUFBRTtBQUNmLFFBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ2hDO0FBQ0QsU0FBTyxFQUFDLGlCQUFDLElBQUksRUFBRTtBQUNiLFFBQUksSUFBSSxFQUFFO0FBQ1IsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7S0FDbkI7R0FDRjtDQUNGLENBQUM7Ozs7Ozs7Ozs7OzswQkMxSGtCLGNBQWM7Ozs7cUJBRW5CLHdCQUFRLE1BQU0sQ0FBQztBQUM1QixTQUFPLEVBQUU7QUFDUCxhQUFTLEVBQUUsWUFBWTtHQUN4QjtBQUNELE1BQUksRUFBRSxJQUFJO0FBQ1YsT0FBSyxFQUFDLGVBQUMsR0FBRyxFQUFFOzs7QUFDVixPQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxVQUFDLElBQUksRUFBSztBQUM3QixPQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFbEQsU0FBRyxDQUFDLEVBQUUsQ0FBQyw0QkFBNEIsRUFBRSxNQUFLLFdBQVcsUUFBTyxDQUFDO0FBQzdELFNBQUcsQ0FBQyxFQUFFLENBQUMsOEJBQThCLEVBQUUsTUFBSyxXQUFXLFFBQU8sQ0FBQztBQUMvRCxTQUFHLENBQUMsRUFBRSxDQUFDLDJCQUEyQixFQUFFLE1BQUssV0FBVyxRQUFPLENBQUM7QUFDNUQsU0FBRyxDQUFDLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxNQUFLLFdBQVcsUUFBTyxDQUFDO0FBQzVELFNBQUcsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsTUFBSyxXQUFXLFFBQU8sQ0FBQztBQUN4RCxTQUFHLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLE1BQUssV0FBVyxRQUFPLENBQUM7QUFDckQsU0FBRyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxNQUFLLFdBQVcsUUFBTyxDQUFDO0tBQ3RELENBQUMsQ0FBQzs7QUFFSCxXQUFPLHdCQUFRLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztHQUNoRDtBQUNELGFBQVcsRUFBQyx1QkFBRztBQUNiLEtBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7O0FBRTdDLEtBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEUsS0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUN2RTtBQUNELGFBQVcsRUFBQyx1QkFBRztBQUNiLEtBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7O0FBRTFDLEtBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNyRSxLQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDcEU7QUFDRCxhQUFXLEVBQUMsdUJBQUc7QUFDYixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3BCLFFBQUksY0FBYyxHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOztBQUU3QyxRQUFJLGNBQWMsS0FBSyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0FBQ3ZGLFNBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNaLFNBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbEIsTUFBTTtBQUNMLG9CQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEIsb0JBQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQyxPQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQzNDO0FBQ0QsUUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0dBQ3BCO0FBQ0QsY0FBWSxFQUFDLHdCQUFHO0FBQ2QsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwQixRQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUNsRCxTQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUN2RCxNQUFNO0FBQ0wsU0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUM3RDtHQUNGO0FBQ0QsYUFBVyxFQUFDLHVCQUFHO0FBQ2IsUUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDaEM7Q0FDRixDQUFDOzs7Ozs7Ozs7Ozs7MkJDM0RpQixpQkFBaUI7Ozs7Z0NBQ2Ysc0JBQXNCOzs7OytCQUN2QixxQkFBcUI7Ozs7a0NBQ2xCLHdCQUF3Qjs7OztpQ0FDekIsdUJBQXVCOzs7OzJCQUMvQixpQkFBaUI7Ozs7cUJBRWhCLFlBQVk7OztBQUN6QixpQ0FBUSxDQUFDOztBQUVULE1BQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUV6QixNQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVuQixNQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDekMsWUFBUSxFQUFFLEdBQUc7R0FDZCxDQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRXJDLE1BQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekIsTUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFL0IsTUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QixNQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUV4QixNQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs7QUFFcEMsTUFBSSxDQUFDLFdBQVcsa0NBQWEsQ0FBQzs7QUFFOUIsTUFBSSxRQUFRLEdBQUcsa0NBQWE7QUFDMUIsUUFBSSxFQUFFLENBQ0osRUFBQyxXQUFXLEVBQUUsYUFBYSxFQUFDLENBQzdCO0dBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQUksT0FBTyxHQUFHLGlDQUFZO0FBQ3hCLFFBQUksRUFBRSxDQUNKLEVBQUMsV0FBVyxFQUFFLGdDQUFnQyxFQUFDLENBQ2hEO0dBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQUksU0FBUyxHQUFHLG1DQUFjO0FBQzVCLGNBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEI7R0FDM0QsQ0FBQyxDQUFDOztBQUVILE1BQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDbEMsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0FBRWhELFVBQUssYUFBYSxHQUFHLFlBQVksQ0FBQztBQUNsQyxRQUFJLElBQUksR0FBRyxNQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUM7O0FBRTdCLFVBQUssRUFBRSxDQUFDLDRCQUE0QixFQUFFLFlBQU07O0FBRTFDLFlBQUssR0FBRyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDakQsWUFBSyxFQUFFLENBQUMsc0NBQXNDLEVBQUUsWUFBTTtBQUNwRCxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztPQUMzQyxDQUFDLENBQUM7O0FBRUgsWUFBSyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztBQUM3QyxZQUFLLEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRSxZQUFNO0FBQ2hELG9CQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO09BQ3RELENBQUMsQ0FBQzs7QUFFSCxZQUFLLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0FBQ3BELFlBQUssRUFBRSxDQUFDLHlDQUF5QyxFQUFFLFlBQU07QUFDdkQsb0JBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7T0FDM0MsQ0FBQyxDQUFDOzs7QUFHSCxZQUFLLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQzFDLFlBQUssRUFBRSxDQUFDLCtCQUErQixFQUFFLFlBQU07QUFDN0Msb0JBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7T0FDOUMsQ0FBQyxDQUFDOztBQUVILFlBQUssR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDekMsWUFBSyxFQUFFLENBQUMsOEJBQThCLEVBQUUsWUFBTTtBQUM1QyxvQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ3JCLENBQUMsQ0FBQzs7QUFFSCxZQUFLLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQzFDLFlBQUssRUFBRSxDQUFDLCtCQUErQixFQUFFLFlBQU07QUFDN0Msb0JBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ3BDLENBQUMsQ0FBQzs7QUFFSCxZQUFLLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pDLFlBQUssRUFBRSxDQUFDLDhCQUE4QixFQUFFLFlBQU07QUFDNUMsb0JBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNyQixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7OztBQUdILFVBQUssR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDbkMsVUFBSyxFQUFFLENBQUMsd0JBQXdCLEVBQUUsWUFBTTtBQUN0QyxrQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ3JCLENBQUMsQ0FBQzs7QUFFSCxVQUFLLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQzFDLFVBQUssRUFBRSxDQUFDLCtCQUErQixFQUFFLFlBQU07QUFDN0Msa0JBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDekMsQ0FBQyxDQUFDOztBQUVILFVBQUssR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDbEQsVUFBSyxFQUFFLENBQUMsdUNBQXVDLEVBQUUsWUFBTTtBQUNyRCxrQkFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUM1QyxDQUFDLENBQUM7O0FBRUgsVUFBSyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsWUFBTTtBQUNoQyxrQkFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztLQUNuRSxDQUFDLENBQUM7OztBQUdILFVBQUssRUFBRSxDQUFDLDhCQUE4QixFQUFFLFVBQUMsSUFBSSxFQUFLOztBQUVoRCxVQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDckIsb0JBQVksQ0FBQyxHQUFHLENBQUMsTUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ2xELE1BQU07QUFDTCxvQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ3JCOztBQUVELFVBQUksY0FBYyxHQUFHLE1BQUssaUJBQWlCLEVBQUUsQ0FBQzs7QUFFOUMsVUFBRyxDQUFDLE1BQUssUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO0FBQ2pDLGVBQU87T0FDUjs7QUFFRCxVQUFHLGNBQWMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUU7O0FBRTdELFlBQUksSUFBSSxDQUFDLFlBQVksRUFBRTs7QUFFckIsd0JBQWMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1NBQ3RDLE1BQU07O0FBRUwsd0JBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFNUIsY0FBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDeEUsbUJBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1dBQzFFLENBQUMsQ0FBQzs7QUFFSCx3QkFBYyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU07bUJBQUssTUFBTSxDQUFDLFVBQVUsRUFBRTtXQUFBLENBQUMsQ0FBQztTQUNyRDtPQUNGO0tBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDOztBQUVILE1BQUksQ0FBQyx5QkFBRSxlQUFlLEVBQUUsRUFBRTtBQUN4QixRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDMUI7O0FBRUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUMzQjs7Ozs7Ozs7O3FCQ3ZKcUIsV0FBVzs7OztBQUVqQyxNQUFNLENBQUMsU0FBUyxxQkFBWSxDQUFDOzs7Ozs7Ozs7Ozt5QkNGUCxjQUFjOzs7OzJCQUNaLGdCQUFnQjs7Ozs4QkFDakIsbUJBQW1COzs7O3dCQUNoQixhQUFhOzs7OzhCQUNQLG9CQUFvQjs7OztRQUU3QyxxQkFBcUI7O3FCQUViO0FBQ2IsV0FBUyxFQUFFLElBQUk7QUFDZixXQUFTLEVBQUUsSUFBSTtBQUNmLGFBQVcsRUFBRSxJQUFJO0FBQ2pCLGtCQUFnQixFQUFFLElBQUk7QUFDdEIsZUFBYSxFQUFFLElBQUk7QUFDbkIscUJBQW1CLEVBQUUsSUFBSTtBQUN6QixzQkFBb0IsRUFBRSxJQUFJO0FBQzFCLFdBQVMsRUFBQyxxQkFBRztBQUNYLFFBQUksQ0FBQyxTQUFTLEdBQUcsMkJBQWMsRUFBRSxDQUFDLENBQUM7QUFDbkMsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEMsUUFBSSxDQUFDLFdBQVcsR0FBRyw2QkFBZ0IsRUFBRSxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QyxRQUFJLENBQUMsYUFBYSxHQUFHLDBCQUFrQixFQUFFLENBQUMsQ0FBQztBQUMzQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsZ0NBQXdCLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxnQ0FBZSxFQUFFLENBQUMsQ0FBQztHQUNoRDtDQUNGOzs7Ozs7Ozs7Ozs7OztvQkN6QmdCLFFBQVE7Ozs7NkJBQ0Esa0JBQWtCOzs7O3NCQUVuQixVQUFVOztJQUF0QixNQUFNOzt1QkFDSSxXQUFXOztJQUFyQixJQUFJOztRQUVULGVBQWU7O0FBRXRCLFNBQVMsR0FBRyxHQUFHOzs7QUFDYixNQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxvQkFBTztBQUNwQyxLQUFDLEVBQUUsU0FBUztBQUNaLGNBQVUsRUFBQyxvQkFBQyxFQUFFLEVBQUUsT0FBTyxFQUFFO0FBQ3ZCLE9BQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQyxPQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLE9BQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNuRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRTVCLFlBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFbkIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUNkLE1BQU0sQ0FBQyxTQUFTLEVBQ2QsTUFBTSxDQUFDLFNBQVMsRUFDaEIsTUFBTSxDQUFDLFdBQVcsRUFDbEIsTUFBTSxDQUFDLGdCQUFnQixFQUN2QixNQUFNLENBQUMsYUFBYSxFQUNwQixNQUFNLENBQUMsbUJBQW1CLEVBQzFCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FDOUIsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTNCLFVBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDNUIsWUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNuQjtLQUNGO0FBQ0QsZ0JBQVksRUFBQyxzQkFBQyxJQUFJLEVBQUU7QUFDbEIsVUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7QUFFN0IsV0FBSyxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7QUFDdEIsWUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0QyxVQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YsVUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pCLFVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVk7QUFDekIsaUJBQU8sS0FBSyxDQUFDO1NBQ2QsQ0FBQyxDQUFDO0FBQ0gsVUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsWUFBWTtBQUMzQixpQkFBTyxLQUFLLENBQUM7U0FDZCxDQUFDLENBQUM7T0FDSjtLQUNGO0FBQ0QsYUFBUyxFQUFDLHFCQUFHO0FBQ1gsYUFBTyxNQUFNLENBQUMsU0FBUyxDQUFDO0tBQ3pCO0FBQ0QsYUFBUyxFQUFDLHFCQUFHO0FBQ1gsYUFBTyxNQUFNLENBQUMsU0FBUyxDQUFDO0tBQ3pCO0FBQ0QsZUFBVyxFQUFDLHVCQUFHO0FBQ2IsYUFBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0tBQzNCO0FBQ0Qsb0JBQWdCLEVBQUMsNEJBQUc7QUFDbEIsYUFBTyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7S0FDaEM7QUFDRCxpQkFBYSxFQUFDLHlCQUFHO0FBQ2YsYUFBTyxNQUFNLENBQUMsYUFBYSxDQUFDO0tBQzdCO0FBQ0QsYUFBUyxFQUFDLHFCQUFHO0FBQ1gsYUFBTyxNQUFNLENBQUMsbUJBQW1CLENBQUM7S0FDbkM7QUFDRCxxQkFBaUIsRUFBQyw2QkFBRztBQUNuQixhQUFPLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztLQUNwQztBQUNELHNCQUFrQixFQUFFO2FBQU0sTUFBSyxnQkFBZ0I7S0FBQTtBQUMvQyxxQkFBaUIsRUFBQyw2QkFBRztBQUNuQixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7S0FDN0I7R0FDRixDQUFDLENBQUMsQ0FBQzs7QUFFSixLQUFHLENBQUMsV0FBVyw0QkFBYyxDQUFDOztBQUU5QixTQUFPLEdBQUcsQ0FBQztDQUNaOztxQkFFYyxHQUFHLEVBQUU7Ozs7Ozs7Ozs7OzsyQkNuRk4sZ0JBQWdCOzs7O0FBRTlCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNiLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRWxELElBQUkseUJBQUUsZUFBZSxFQUFFLEVBQUU7QUFDdkIsTUFBSSxHQUFHLENBQUMsQ0FBQztDQUNWOztBQUVNLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDL0IsV0FBUyxFQUFFLHlCQUF5QjtBQUNwQyxVQUFRLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDL0IsQ0FBQyxDQUFDOzs7QUFFSSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzFCLFdBQVMsRUFBRSxtQkFBbUI7QUFDOUIsVUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDO0NBQ2pDLENBQUMsQ0FBQzs7O0FBRUksSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUM5QixXQUFTLEVBQUUsd0JBQXdCO0FBQ25DLFVBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0NBQ3pDLENBQUMsQ0FBQzs7O0FBRUksSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNoQyxXQUFTLEVBQUUsMEJBQTBCO0FBQ3JDLFVBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQzs7Q0FFakMsQ0FBQyxDQUFDOzs7OztBQUlJLElBQUksU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ3JDLFdBQVMsRUFBRSxtQkFBbUI7QUFDOUIsVUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDdkMsQ0FBQyxDQUFDOzs7QUFFRSxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDdEMsV0FBUyxFQUFFLGdDQUFnQztBQUMzQyxVQUFRLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUN2QyxDQUFDLENBQUM7Ozs7Ozs7OztBQ3hDSCxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDMUIsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzFCLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMxQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRVIsSUFBSSxPQUFPLEdBQUc7QUFDbkIsbUJBQWlCLEVBQUUsS0FBSztBQUN4QiwwQkFBd0IsRUFBRSxLQUFLO0FBQy9CLGFBQVcsRUFBRSxJQUFJO0FBQ2pCLGNBQVksRUFBRTtBQUNaLGlCQUFhLEVBQUUsZ0JBQWdCO0FBQy9CLGVBQVcsRUFBRSxjQUFjO0dBQzVCO0FBQ0QsVUFBUSxFQUFFLEVBQUU7QUFDWixPQUFLLEVBQUU7QUFDTCxRQUFJLEVBQUU7QUFDSixhQUFPLEVBQUUsR0FBRztBQUNaLGlCQUFXLEVBQUUsR0FBRztBQUNoQixlQUFTLEVBQUUsSUFBSTtBQUNmLGVBQVMsRUFBRSxLQUFLO0FBQ2hCLFVBQUksRUFBRSxJQUFJO0FBQ1YsWUFBTSxFQUFFLElBQUk7QUFDWixXQUFLLEVBQUUsU0FBUztBQUNoQixZQUFNLEVBQUUsTUFBTTtLQUNmO0FBQ0QsUUFBSSxFQUFFO0FBQ0osYUFBTyxFQUFFLEdBQUc7QUFDWixpQkFBVyxFQUFFLEdBQUc7QUFDaEIsZUFBUyxFQUFFLE9BQU87QUFDbEIsZUFBUyxFQUFFLElBQUk7QUFDZixVQUFJLEVBQUUsSUFBSTtBQUNWLFlBQU0sRUFBRSxJQUFJO0FBQ1osV0FBSyxFQUFFLFNBQVM7QUFDaEIsWUFBTSxFQUFFLE1BQU07S0FDZjtHQUNGO0FBQ0QsWUFBVSxFQUFFLFNBQVM7QUFDckIsaUJBQWUsRUFBRSxTQUFTO0FBQzFCLGdCQUFjLEVBQUU7QUFDZCxTQUFLLEVBQUUsS0FBSztBQUNaLFVBQU0sRUFBRSxDQUFDO0FBQ1QsV0FBTyxFQUFFLENBQUM7QUFDVixnQkFBWSxFQUFFLENBQUM7R0FDaEI7QUFDRCx1QkFBcUIsRUFBRTtBQUNyQixTQUFLLEVBQUUsS0FBSztBQUNaLFVBQU0sRUFBRSxDQUFDO0FBQ1QsV0FBTyxFQUFFLENBQUM7QUFDVixnQkFBWSxFQUFFLENBQUM7QUFDZixhQUFTLEVBQUUsT0FBTztHQUNuQjtBQUNELE1BQUksRUFBRTtBQUNKLGdCQUFZLEVBQUUsaUNBQWlDO0FBQy9DLDJCQUF1QixFQUFFLG9FQUFvRTtBQUM3RixpQkFBYSxFQUFFLGdCQUFnQjtBQUMvQixlQUFXLEVBQUUsZUFBZTtBQUM1QixzQkFBa0IsRUFBRSw0SEFBNEg7QUFDaEoseUJBQXFCLEVBQUUsMkJBQTJCO0FBQ2xELG9CQUFnQixFQUFFLHFCQUFxQjtBQUN2QyxpQ0FBNkIsRUFBRSw0TkFBNE47QUFDM1Asc0JBQWtCLEVBQUUsaUxBQWlMO0FBQ3JNLHVCQUFtQixFQUFFLDRCQUE0QjtBQUNqRCxnQ0FBNEIsRUFBRSxvQ0FBb0M7QUFDbEUsdUJBQW1CLEVBQUUsd0JBQXdCO0FBQzdDLGlCQUFhLEVBQUUsZ0JBQWdCO0FBQy9CLGlCQUFhLEVBQUUsaUJBQWlCO0FBQ2hDLGFBQVMsRUFBRSxZQUFZO0FBQ3ZCLFlBQVEsRUFBRSxjQUFjO0FBQ3hCLGdCQUFZLEVBQUUsNkNBQTZDO0FBQzNELGtCQUFjLEVBQUUsaUJBQWlCO0dBQ2xDO0FBQ0QsZUFBYSxFQUFFLElBQUk7Q0FDcEIsQ0FBQzs7O0FBRUssSUFBSSxhQUFhLEdBQUc7QUFDekIsU0FBTyxFQUFFLEdBQUc7QUFDWixNQUFJLEVBQUUsS0FBSztBQUNYLFdBQVMsRUFBRSxTQUFTO0FBQ3BCLE9BQUssRUFBRSxTQUFTO0FBQ2hCLFFBQU0sRUFBRSxNQUFNO0FBQ2QsV0FBUyxFQUFFLE9BQU87QUFDbEIsUUFBTSxFQUFFLElBQUk7QUFDWixXQUFTLEVBQUUsS0FBSztDQUNqQixDQUFDOzs7Ozs7Ozs7QUNuRkYsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBUyxJQUFJLEVBQUUsRUFBRSxFQUFFO0FBQ3hDLE1BQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdDLENBQUM7QUFDRixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFTLElBQUksRUFBRTtBQUNyQyxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLFNBQU8sQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0QixRQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDN0I7Q0FDRixDQUFDO3FCQUNhLEtBQUs7Ozs7Ozs7OztxQkNWTDtBQUNiLGlCQUFlLEVBQUUsMkJBQVk7QUFDM0IsUUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLEtBQUMsVUFBVSxDQUFDLEVBQUU7QUFDWixVQUFJLHFWQUFxVixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSx5a0RBQXlrRCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ244RCxhQUFLLEdBQUcsSUFBSSxDQUFDO09BQ2Q7S0FDRixDQUFBLENBQUUsU0FBUyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1RCxXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0Y7Ozs7Ozs7Ozs7cUJDVmMsWUFBWTtBQUN6QixHQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUNsQyxXQUFPLEVBQUU7QUFDUCxjQUFRLEVBQUUsU0FBUztBQUNuQixXQUFLLEVBQUUsRUFBRTtLQUNWOztBQUVELFNBQUssRUFBQyxlQUFDLEdBQUcsRUFBRTtBQUNWLFVBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFVBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQzFFLFVBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsZUFBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixVQUFJLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLFVBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDOztBQUVoQixVQUFJLElBQUksR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQztBQUN0QyxPQUFDLENBQUMsUUFBUSxDQUNQLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUN2QixFQUFFLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FDM0IsRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQzFCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQzVDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXpDLFVBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7O0FBRXhELFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdkQsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxPQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwQyxVQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV4QixPQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVk7QUFDeEMsWUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUIsZUFBTyxLQUFLLENBQUM7T0FDZCxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdkQsZUFBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFHNUIsVUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBELE9BQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4RSxPQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXRFLGFBQU8sU0FBUyxDQUFDO0tBQ2xCOztBQUVELFdBQU8sRUFBQyxtQkFBRztBQUNULFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRTtBQUN2QyxZQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ25DLFlBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEIsWUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7T0FDakMsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQixZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO09BQ2xDO0tBQ0Y7O0FBRUQsYUFBUyxFQUFDLHFCQUFHO0FBQ1gsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUNsQyxVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7S0FDeEI7O0FBRUQsc0JBQWtCLEVBQUMsNEJBQUMsT0FBTyxFQUFFOztBQUUzQixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNyRDs7QUFFRCxVQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyRSxzQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN2QyxzQkFBZ0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUMxQyxzQkFBZ0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUM1QyxzQkFBZ0IsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztBQUNqRCxzQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN0QyxzQkFBZ0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUN2QyxzQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLGdCQUFnQixDQUFDO0FBQ2pELHNCQUFnQixDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDOztBQUU1QyxVQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3ZDLFlBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3ZELFdBQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUN4QyxXQUFHLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFDcEMsd0JBQWdCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVsQyxZQUFJLFFBQVEsR0FBSSxDQUFBLFVBQVUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDNUMsaUJBQU8sWUFBWTtBQUNqQixpQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsZUFBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ2xEO0FBQ0QsYUFBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUV0QyxnQkFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUM5QixlQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUN6RSxDQUFBO1NBQ0YsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxBQUFDLENBQUM7O0FBRS9CLFNBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN2RCxTQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQ3pELEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUU5QixrQkFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN0Qjs7QUFFRCxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUV6QyxVQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDckQ7S0FDRjs7QUFFRCxlQUFXLEVBQUUsQ0FBQzs7QUFFZCxhQUFTLEVBQUMsbUJBQUMsS0FBSyxFQUFFO0FBQ2hCLFVBQUksUUFBUSxHQUFHLGlCQUFpQixHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN0RCxZQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzlELFVBQUksV0FBVyxHQUFHO0FBQ2hCLFNBQUMsRUFBRSxLQUFLO0FBQ1IsY0FBTSxFQUFFLE1BQU07QUFDZCxhQUFLLEVBQUUsRUFBRTtBQUNULHVCQUFlLEVBQUUsUUFBUTtPQUMxQixDQUFDO0FBQ0YsVUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFDcEIsV0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUN6QyxVQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQ3ZCLFdBQVcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUM3RCxVQUFJLEdBQUcsR0FBRywyQ0FBMkMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMzRixVQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlDLFlBQU0sQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7QUFDaEMsWUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDakIsY0FBUSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM5RDtBQUNELGdCQUFZLEVBQUMsd0JBQUc7QUFDZCxVQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3BFO0FBQ0QsZUFBVyxFQUFDLHVCQUFHO0FBQ2IsVUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDaEM7R0FDRixDQUFDLENBQUM7O0FBRUgsR0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDcEMsV0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3RDLENBQUM7Q0FDSDs7Ozs7Ozs7Ozs7cUJDbEpjLFlBQW1DO01BQXpCLE1BQU0seURBQUcsRUFBRTtNQUFFLEtBQUsseURBQUcsRUFBRTs7QUFDOUMsTUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDOztBQUVsQixNQUFJLEdBQUcsQ0FBQztBQUNSLE1BQUksS0FBSyxHQUFHLFNBQVIsS0FBSyxDQUFhLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDL0IsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUNqQyxRQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDMUIsVUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO0FBQ3RCLFdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixZQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLFlBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7T0FDN0I7O0FBRUQsVUFBSSxRQUFRLElBQUksS0FBSyxFQUFFO0FBQ3JCLGFBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUM3QjtLQUNGO0dBQ0YsQ0FBQztBQUNGLE9BQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXJCLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBQUEsQ0FBQzs7Ozs7Ozs7O3FCQ3JCYSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztBQUNuQyxZQUFVLEVBQUMsb0JBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTs7O0FBQzVCLEtBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFakUsUUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDekIsVUFBSSxVQUFVLEdBQUcsTUFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDOUMsT0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN6QixlQUFPLEVBQUUsR0FBRztBQUNaLG1CQUFXLEVBQUUsSUFBSTtBQUNqQixhQUFLLEVBQUUsU0FBUztPQUNqQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7O0FBRWhCLFlBQUssSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7S0FDaEMsQ0FBQyxDQUFDO0dBQ0o7QUFDRCxPQUFLLEVBQUMsZUFBQyxHQUFHLEVBQUU7QUFDVixLQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFL0MsUUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBTTtBQUN6QixVQUFJLGFBQWEsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUMzQyxVQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUMzQixXQUFHLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7T0FDM0MsTUFBTTtBQUNMLFlBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUU7QUFDNUMsYUFBRyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1NBQzNDO09BQ0Y7S0FDRixDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFNO0FBQ3hCLFVBQUksYUFBYSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQzNDLFVBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQzNCLFdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztPQUMxQyxNQUFNO0FBQ0wsWUFBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUM1QyxhQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDMUM7T0FDRjtLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLEdBQUcsRUFBRTtBQUNiLFFBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckIsT0FBRyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3pDLE9BQUcsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztHQUN6QztDQUNGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERyYXdFdmVudHMgZnJvbSAnLi9kcmF3L2V2ZW50cyc7XG5pbXBvcnQgRWRpdFBvbHlnb24gZnJvbSAnLi9lZGl0L3BvbHlnb24nO1xuXG5leHBvcnQgZGVmYXVsdCAkLmV4dGVuZCh7XG4gIF9zZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfc2VsZWN0ZWRWTGF5ZXI6IHVuZGVmaW5lZCxcbiAgX29sZFNlbGVjdGVkTWFya2VyOiB1bmRlZmluZWQsXG4gIF9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ6IGZhbHNlLFxuICBfbW9kZVR5cGU6ICdkcmF3JyxcbiAgX2NvbnRyb2xMYXllcnM6IHVuZGVmaW5lZCxcbiAgX2dldFNlbGVjdGVkVkxheWVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRWTGF5ZXI7XG4gIH0sXG4gIF9zZXRTZWxlY3RlZFZMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9zZWxlY3RlZFZMYXllciA9IGxheWVyO1xuICB9LFxuICBfY2xlYXJTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIF9oaWRlU2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgbGF5ZXIuYnJpbmdUb0JhY2soKTtcblxuICAgIGlmICghbGF5ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy9zaG93IGxhc3QgbGF5ZXJcbiAgICB0aGlzLl9zaG93U2VsZWN0ZWRWTGF5ZXIodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSk7XG4gICAgLy9oaWRlXG4gICAgdGhpcy5fc2V0U2VsZWN0ZWRWTGF5ZXIobGF5ZXIpO1xuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgfSxcbiAgX3Nob3dTZWxlY3RlZFZMYXllciAobGF5ZXIgPSB0aGlzLl9zZWxlY3RlZFZMYXllcikge1xuICAgIGlmICghbGF5ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGF5ZXIuX3BhdGguc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICB9LFxuICBfYWRkRUdyb3VwX1RvX1ZHcm91cCAoKSB7XG4gICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG4gICAgdmFyIGVHcm91cCA9IHRoaXMuZ2V0RUdyb3VwKCk7XG5cbiAgICBlR3JvdXAuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgaWYgKCFsYXllci5pc0VtcHR5KCkpIHtcbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICB2YXIgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcbiAgICAgICAgaWYgKCQuaXNBcnJheShob2xlcykpIHtcbiAgICAgICAgICBpZiAoaG9sZXMpIHtcbiAgICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9hZGRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgdmFyIGxhdGxuZ3MgPSBlUG9seWdvbi5nZXRMYXRMbmdzKCk7XG5cbiAgICBpZiAobGF0bG5ncy5sZW5ndGggPD0gMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICBpZiAoaG9sZXMpIHtcbiAgICAgICAgbGF0bG5ncyA9IFtsYXRsbmdzXS5jb25jYXQoaG9sZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICB2R3JvdXAuYWRkTGF5ZXIoTC5wb2x5Z29uKGxhdGxuZ3MpKTtcbiAgfSxcbiAgX3NldEVQb2x5Z29uX1RvX1ZHcm91cCAoKSB7XG4gICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgIHZhciBzZWxlY3RlZFZMYXllciA9IHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCk7XG5cbiAgICBpZiAoIXNlbGVjdGVkVkxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZWN0ZWRWTGF5ZXIuX2xhdGxuZ3MgPSBlUG9seWdvbi5nZXRMYXRMbmdzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIuX2hvbGVzID0gZVBvbHlnb24uZ2V0SG9sZXMoKTtcbiAgICBzZWxlY3RlZFZMYXllci5yZWRyYXcoKTtcbiAgfSxcbiAgX2NvbnZlcnRfRUdyb3VwX1RvX1ZHcm91cCAoKSB7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuX2FkZEVHcm91cF9Ub19WR3JvdXAoKTtcbiAgfSxcbiAgX2NvbnZlcnRUb0VkaXQgKGdyb3VwKSB7XG4gICAgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NdWx0aVBvbHlnb24pIHtcbiAgICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgICBlR3JvdXAuY2xlYXJMYXllcnMoKTtcblxuICAgICAgZ3JvdXAuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgICB2YXIgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcblxuICAgICAgICB2YXIgaG9sZXMgPSBsYXllci5faG9sZXM7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgbGF0bG5ncyA9IFtsYXRsbmdzXS5jb25jYXQoaG9sZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVkaXRQb2x5Z29uID0gbmV3IEVkaXRQb2x5Z29uKGxhdGxuZ3MpO1xuICAgICAgICBlZGl0UG9seWdvbi5hZGRUbyh0aGlzKTtcbiAgICAgICAgZUdyb3VwLmFkZExheWVyKGVkaXRQb2x5Z29uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVHcm91cDtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ3JvdXAgaW5zdGFuY2VvZiBMLk1hcmtlckdyb3VwKSB7XG4gICAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgICB2YXIgbGF5ZXJzID0gZ3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgICBsYXllcnMgPSBsYXllcnMuZmlsdGVyKChsYXllcikgPT4gIWxheWVyLmlzTWlkZGxlKCkpO1xuICAgICAgdmFyIHBvaW50c0FycmF5ID0gbGF5ZXJzLm1hcCgobGF5ZXIpID0+IGxheWVyLmdldExhdExuZygpKTtcblxuICAgICAgdmFyIGhvbGVzID0gZVBvbHlnb24uZ2V0SG9sZXMoKTtcblxuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIHBvaW50c0FycmF5ID0gW3BvaW50c0FycmF5XS5jb25jYXQoaG9sZXMpO1xuICAgICAgfVxuXG4gICAgICBlUG9seWdvbi5zZXRMYXRMbmdzKHBvaW50c0FycmF5KTtcbiAgICAgIGVQb2x5Z29uLnJlZHJhdygpO1xuXG4gICAgICByZXR1cm4gZVBvbHlnb247XG4gICAgfVxuICB9LFxuICBfc2V0TW9kZSAodHlwZSkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIC8vdGhpcy5nZXRWR3JvdXAoKS5zZXRTdHlsZShvcHRpb25zLnN0eWxlW3R5cGVdKTtcbiAgICAvL3RoaXMuZ2V0RUdyb3VwKCkuc2V0U3R5bGUob3B0aW9ucy5lZGl0R3JvdXBTdHlsZS5tb2RlW3R5cGVdKTtcblxuICAgIC8vaWYgKCF0aGlzLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgdGhpcy5nZXRFUG9seWdvbigpLnNldFN0eWxlKG9wdGlvbnMuc3R5bGVbdHlwZV0pO1xuICAgIC8vfVxuXG4gICAgLy90aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAvL3RoaXMuJC50cmlnZ2VyKHt0eXBlOiAnbW9kZScsIHZhbHVlOiB0eXBlfSk7XG4gICAgLy90aGlzLiQudHJpZ2dlcih7dHlwZTogJ21vZGU6JyArIHR5cGV9KTtcbiAgfSxcblxuICBfZ2V0TW9kZVR5cGUgKCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgfSxcbiAgX3NldE1vZGVUeXBlICh0eXBlKSB7XG4gICAgdGhpcy4kLnJlbW92ZUNsYXNzKCdtYXAtJyArIHRoaXMuX21vZGVUeXBlKTtcbiAgICB0aGlzLl9tb2RlVHlwZSA9IHR5cGU7XG4gICAgdGhpcy4kLmFkZENsYXNzKCdtYXAtJyArIHRoaXMuX21vZGVUeXBlKTtcbiAgfSxcbiAgX3NldE1hcmtlcnNHcm91cEljb24gKG1hcmtlckdyb3VwKSB7XG4gICAgdmFyIG1JY29uID0gdGhpcy5vcHRpb25zLm1hcmtlckljb247XG4gICAgdmFyIG1Ib3Zlckljb24gPSB0aGlzLm9wdGlvbnMubWFya2VySG92ZXJJY29uO1xuXG4gICAgdmFyIG1vZGUgPSB0aGlzLl9nZXRNb2RlVHlwZSgpO1xuICAgIGlmIChtSWNvbikge1xuICAgICAgaWYgKCFtSWNvbi5tb2RlKSB7XG4gICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUljb24gPSBtSWNvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpY29uID0gbUljb24ubW9kZVttb2RlXTtcbiAgICAgICAgaWYgKGljb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUljb24gPSBpY29uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1Ib3Zlckljb24pIHtcbiAgICAgIGlmICghbUhvdmVySWNvbi5tb2RlKSB7XG4gICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IG1Ib3Zlckljb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWNvbiA9IG1Ib3Zlckljb25bbW9kZV07XG4gICAgICAgIGlmIChpY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBpY29uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uIHx8IG1hcmtlckdyb3VwLm9wdGlvbnMubUljb247XG5cbiAgICBpZiAobW9kZSA9PT0gXCJhZnRlckRyYXdcIikge1xuICAgICAgbWFya2VyR3JvdXAudXBkYXRlU3R5bGUoKTtcbiAgICB9XG4gIH0sXG4gIC8vbW9kZXM6ICd2aWV3JywgJ2VkaXQnLCAnZHJhdycsICdsaXN0J1xuICBtb2RlICh0eXBlKSB7XG4gICAgdGhpcy5maXJlKHRoaXMuX21vZGVUeXBlICsgJ19ldmVudHNfZGlzYWJsZScpO1xuICAgIHRoaXMuZmlyZSh0eXBlICsgJ19ldmVudHNfZW5hYmxlJyk7XG5cbiAgICB0aGlzLl9zZXRNb2RlVHlwZSh0eXBlKTtcblxuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICAgIHR5cGUgPSB0aGlzW3R5cGVdKCkgfHwgdHlwZTtcbiAgICAgIHRoaXMuX3NldE1vZGUodHlwZSk7XG4gICAgfVxuICB9LFxuICBpc01vZGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIC8vdmllZXcgKCkge1xuICAvLyAgaWYgKHRoaXMuaXNNb2RlKCdlZGl0JykgfHwgdGhpcy5pc01vZGUoJ2RyYXcnKSB8fCB0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgLy8gICAgdGhpcy5fY2xlYXJNYXAoKTtcbiAgLy9cbiAgLy8gIH1cbiAgLy8gIHRoaXMuX2ZpdFZCb3VuZHMoKTtcbiAgLy8gIHRoaXMuX2JpbmRWaWV3RXZlbnRzKCk7XG4gIC8vfSxcbiAgZHJhdyAoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKCdlZGl0JykgfHwgdGhpcy5pc01vZGUoJ3ZpZXcnKSB8fCB0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgICAgIHRoaXMuX2NsZWFyTWFwKCk7XG5cbiAgICB9XG4gICAgdGhpcy5fYmluZERyYXdFdmVudHMoKTtcbiAgfSxcbiAgY2FuY2VsICgpIHtcbiAgICB0aGlzLl9jbGVhck1hcCgpO1xuXG4gICAgdGhpcy5tb2RlKCd2aWV3Jyk7XG4gIH0sXG4gIGNsZWFyICgpIHtcbiAgICB0aGlzLl9jbGVhckV2ZW50cygpO1xuICAgIHRoaXMuX2NsZWFyTWFwKCk7XG4gICAgdGhpcy5maXJlKCdlZGl0b3I6bWFwX2NsZWFyZWQnKTtcbiAgfSxcbiAgY2xlYXJBbGwgKCkge1xuICAgIHRoaXMubW9kZSgndmlldycpO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmdldFZHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gIH0sXG4gIC8qKlxuICAgKlxuICAgKiBUaGUgbWFpbiBpZGVhIGlzIHRvIHNhdmUgRVBvbHlnb24gdG8gVkdyb3VwIHdoZW46XG4gICAqIDEpIHVzZXIgYWRkIG5ldyBwb2x5Z29uXG4gICAqIDIpIHdoZW4gdXNlciBlZGl0IHBvbHlnb25cbiAgICpcbiAgICogKi9cbiAgICBzYXZlU3RhdGUgKCkge1xuXG4gICAgdmFyIGVQb2x5Z29uID0gX21hcC5nZXRFUG9seWdvbigpO1xuXG4gICAgaWYgKCFlUG9seWdvbi5pc0VtcHR5KCkpIHtcbiAgICAgIC8vdGhpcy5maXRCb3VuZHMoZVBvbHlnb24uZ2V0Qm91bmRzKCkpO1xuICAgICAgLy90aGlzLl9tc2dDb250YWluZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmZvcmdldFRvU2F2ZSk7XG5cbiAgICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgdmFyIGdlb2pzb24gPSB0aGlzLmdldFZHcm91cCgpLnRvR2VvSlNPTigpO1xuICAgIGlmIChnZW9qc29uLmdlb21ldHJ5KSB7XG4gICAgICByZXR1cm4gZ2VvanNvbi5nZW9tZXRyeTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBnZXRTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTWFya2VyO1xuICB9LFxuICBjbGVhclNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLl9zZWxlY3RlZE1hcmtlcjtcbiAgICB2YXIgcHJldk1hcmtlciA9IHNlbGVjdGVkTWFya2VyLnByZXYoKTtcbiAgICB2YXIgbmV4dE1hcmtlciA9IHNlbGVjdGVkTWFya2VyLm5leHQoKTtcbiAgICB2YXIgbWlkbGVQcmV2TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIuX21pZGRsZVByZXY7XG4gICAgdmFyIG1pZGRsZU5leHRNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5fbWlkZGxlTmV4dDtcbiAgICBzZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGxlUHJldk1hcmtlcjtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGRsZU5leHRNYXJrZXI7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgcHJldk1hcmtlci5fbWlkZGxlTmV4dCA9IG51bGw7XG4gICAgbmV4dE1hcmtlci5fbWlkZGxlUHJldiA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVBvbHlnb24gKHBvbHlnb24pIHtcbiAgICAvL3RoaXMuZ2V0RUxpbmVHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3RoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuXG4gICAgcG9seWdvbi5jbGVhcigpO1xuXG4gICAgaWYgKHRoaXMuaXNNb2RlKCdhZnRlckRyYXcnKSkge1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhclNlbGVjdGVkTWFya2VyKCk7XG4gICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gIH0sXG4gIGNyZWF0ZUVkaXRQb2x5Z29uIChqc29uKSB7XG4gICAgdmFyIGdlb0pzb24gPSBMLmdlb0pzb24oanNvbik7XG5cbiAgICB0aGlzLmNsZWFyKCk7XG5cbiAgICB2YXIgbGF5ZXIgPSBnZW9Kc29uLmdldExheWVycygpWzBdO1xuXG4gICAgaWYgKGxheWVyKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gbGF5ZXIuZ2V0TGF5ZXJzKCk7XG4gICAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBfbCA9IGxheWVyc1tpXTtcbiAgICAgICAgdkdyb3VwLmFkZExheWVyKF9sKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcblxuICAgIHRoaXMuX2ZpdFZCb3VuZHMoKTtcbiAgfSxcbiAgbW92ZU1hcmtlciAobGF0bG5nKSB7XG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuZ2V0U2VsZWN0ZWQoKS5zZXRMYXRMbmcobGF0bG5nKTtcbiAgfSxcbiAgX2ZpdFZCb3VuZHMgKCkge1xuICAgIGlmICh0aGlzLmdldFZHcm91cCgpLmdldExheWVycygpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhpcy5maXRCb3VuZHModGhpcy5nZXRWR3JvdXAoKS5nZXRCb3VuZHMoKSwge3BhZGRpbmc6IFszMCwgMzBdfSk7XG4gICAgICAvL3RoaXMuaW52YWxpZGF0ZVNpemUoKTtcbiAgICB9XG4gIH0sXG4gIF9jbGVhck1hcCAoKSB7XG4gICAgdGhpcy5nZXRFR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RVBvbHlnb24oKS5jbGVhcigpO1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmNsZWFyKCk7XG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gdGhpcy5nZXRTZWxlY3RlZE1Hcm91cCgpO1xuXG4gICAgaWYgKHNlbGVjdGVkTUdyb3VwKSB7XG4gICAgICBzZWxlY3RlZE1Hcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuXG4gICAgdGhpcy5fYWN0aXZlRWRpdExheWVyID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5fc2hvd1NlbGVjdGVkVkxheWVyKCk7XG4gICAgdGhpcy5fY2xlYXJTZWxlY3RlZFZMYXllcigpO1xuICAgIHRoaXMuY2xlYXJTZWxlY3RlZE1hcmtlcigpO1xuICB9LFxuICBfY2xlYXJFdmVudHMgKCkge1xuICAgIC8vdGhpcy5fdW5CaW5kVmlld0V2ZW50cygpO1xuICAgIHRoaXMuX3VuQmluZERyYXdFdmVudHMoKTtcbiAgfSxcbiAgX2FjdGl2ZUVkaXRMYXllcjogdW5kZWZpbmVkLFxuICBfc2V0QWN0aXZlRWRpdExheWVyIChsYXllcikge1xuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IGxheWVyO1xuICB9LFxuICBfZ2V0QWN0aXZlRWRpdExheWVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRWRpdExheWVyO1xuICB9LFxuICBfY2xlYXJBY3RpdmVFZGl0TGF5ZXIgKCkge1xuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IG51bGw7XG4gIH0sXG4gIF9zZXRFSE1hcmtlckdyb3VwIChhcnJheUxhdExuZykge1xuICAgIHZhciBob2xlTWFya2VyR3JvdXAgPSBuZXcgTC5NYXJrZXJHcm91cCgpO1xuICAgIGhvbGVNYXJrZXJHcm91cC5faXNIb2xlID0gdHJ1ZTtcblxuICAgIHRoaXMuX3NldE1hcmtlcnNHcm91cEljb24oaG9sZU1hcmtlckdyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuYWRkVG8oZWhNYXJrZXJzR3JvdXApO1xuXG4gICAgdmFyIGVoTWFya2Vyc0dyb3VwTGF5ZXJzID0gZWhNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICB2YXIgaEdyb3VwUG9zID0gZWhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMTtcbiAgICBob2xlTWFya2VyR3JvdXAuX3Bvc2l0aW9uID0gaEdyb3VwUG9zO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheUxhdExuZy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gc2V0IGhvbGUgbWFya2VyXG4gICAgICBob2xlTWFya2VyR3JvdXAuc2V0SG9sZU1hcmtlcihhcnJheUxhdExuZ1tpXSwgdW5kZWZpbmVkLCB7fSwge2hHcm91cDogaEdyb3VwUG9zLCBoTWFya2VyOiBpfSk7XG4gICAgfVxuXG4gICAgdmFyIGxheWVycyA9IGhvbGVNYXJrZXJHcm91cC5nZXRMYXllcnMoKTtcbiAgICBsYXllcnMubWFwKChsYXllciwgcG9zaXRpb24pID0+IHtcbiAgICAgIGhvbGVNYXJrZXJHcm91cC5fc2V0TWlkZGxlTWFya2VycyhsYXllciwgcG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICBsYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgIGVQb2x5Z29uLnVwZGF0ZUhvbGVQb2ludChoR3JvdXBQb3MsIGxheWVyLl9fcG9zaXRpb24sIGxheWVyLl9sYXRsbmcpO1xuICAgIH0pO1xuXG4gICAgLy9lUG9seWdvbi5zZXRIb2xlKClcbiAgICByZXR1cm4gaG9sZU1hcmtlckdyb3VwO1xuICB9LFxuICBfbW92ZUVQb2x5Z29uT25Ub3AgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICBpZiAoZVBvbHlnb24uX2NvbnRhaW5lcikge1xuICAgICAgdmFyIGxhc3RDaGlsZCA9ICQoZVBvbHlnb24uX2NvbnRhaW5lci5wYXJlbnRFbGVtZW50KS5jaGlsZHJlbigpLmxhc3QoKTtcbiAgICAgIHZhciAkZVBvbHlnb24gPSAkKGVQb2x5Z29uLl9jb250YWluZXIpO1xuICAgICAgaWYgKCRlUG9seWdvblswXSAhPT0gbGFzdENoaWxkKSB7XG4gICAgICAgICRlUG9seWdvbi5kZXRhY2goKS5pbnNlcnRBZnRlcihsYXN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVzdG9yZUVQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgcG9seWdvbiA9IHBvbHlnb24gfHwgdGhpcy5nZXRFUG9seWdvbigpO1xuXG4gICAgaWYgKCFwb2x5Z29uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gc2V0IG1hcmtlcnNcbiAgICB2YXIgbGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuc2V0QWxsKGxhdGxuZ3MpO1xuXG4gICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5fY29ubmVjdE1hcmtlcnMoKTtcblxuICAgIC8vIHNldCBob2xlIG1hcmtlcnNcbiAgICB2YXIgaG9sZXMgPSBwb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgaWYgKGhvbGVzKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGhvbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHRoaXMuX3NldEVITWFya2VyR3JvdXAoaG9sZXNbal0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZ2V0Q29udHJvbExheWVyczogKCkgPT4gdGhpcy5fY29udHJvbExheWVycyxcbiAgZWRnZXNJbnRlcnNlY3RlZCAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkID0gdmFsdWU7XG4gICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7aW50ZXJzZWN0aW9uOiB0cnVlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZpcmUoXCJlZGl0b3I6aW50ZXJzZWN0aW9uX2RldGVjdGVkXCIsIHtpbnRlcnNlY3Rpb246IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfZXJyb3JUaW1lb3V0OiBudWxsLFxuICBfc2hvd0ludGVyc2VjdGlvbkVycm9yICh0ZXh0KSB7XG5cbiAgICBpZiAodGhpcy5fZXJyb3JUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fZXJyb3JUaW1lb3V0KTtcbiAgICB9XG5cbiAgICB0aGlzLl9tc2dDb250YWluZXIubXNnKHRleHQgfHwgdGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uLCAnZXJyb3InKTtcblxuICAgIHRoaXMuX2Vycm9yVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9LCAxMDAwKTtcbiAgfVxufSwgRHJhd0V2ZW50cyk7XG4iLCJpbXBvcnQgKiBhcyBvcHRzIGZyb20gJy4uL29wdGlvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCBMLlBvbHlsaW5lLmV4dGVuZCh7XG4gIG9wdGlvbnM6IG9wdHMuZHJhd0xpbmVTdHlsZSxcbiAgX2xhdGxuZ1RvTW92ZTogdW5kZWZpbmVkLFxuICBhZGRMYXRMbmcgKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9sYXRsbmdUb01vdmUpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGF0bG5ncy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9sYXRsbmdzLnNwbGljZSgtMSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGF0bG5ncy5wdXNoKEwubGF0TG5nKGxhdGxuZykpO1xuXG4gICAgcmV0dXJuIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIHVwZGF0ZSAocG9zKSB7XG5cbiAgICBpZiAoIXRoaXMuX2xhdGxuZ1RvTW92ZSAmJiB0aGlzLl9sYXRsbmdzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlID0gTC5sYXRMbmcocG9zKTtcbiAgICAgIHRoaXMuX2xhdGxuZ3MucHVzaCh0aGlzLl9sYXRsbmdUb01vdmUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubGF0ID0gcG9zLmxhdDtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZS5sbmcgPSBwb3MubG5nO1xuXG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgX2FkZExpbmUgKGxpbmUsIGdyb3VwLCBpc0xhc3RNYXJrZXIpIHtcbiAgICBpZiAoIWlzTGFzdE1hcmtlcikge1xuICAgICAgbGluZS5hZGRUbyhncm91cCk7XG4gICAgfVxuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgfVxufSk7IiwiaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuZXhwb3J0IGRlZmF1bHQge1xuICBfYmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMuX3VuQmluZERyYXdFdmVudHMoKTtcblxuICAgIC8vIGNsaWNrIG9uIG1hcFxuICAgIHRoaXMub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIC8vIGJ1ZyBmaXhcbiAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaWVudFggPT09IDAgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaWVudFkgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoKGUudGFyZ2V0IGluc3RhbmNlb2YgTC5NYXJrZXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBlLnRhcmdldC5nZXRFTWFya2Vyc0dyb3VwKCk7XG5cbiAgICAgIC8vIHN0YXJ0IGFkZCBuZXcgcG9seWdvblxuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuX2FkZE1hcmtlcihlKTtcblxuICAgICAgICB0aGlzLmZpcmUoJ2VkaXRvcjpzdGFydF9hZGRfbmV3X3BvbHlnb24nKTtcblxuICAgICAgICB0aGlzLl9jbGVhclNlbGVjdGVkVkxheWVyKCk7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRNR3JvdXAgPSBlTWFya2Vyc0dyb3VwO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbnRpbnVlIHdpdGggbmV3IHBvbHlnb25cbiAgICAgIHZhciBmaXJzdE1hcmtlciA9IGVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKTtcblxuICAgICAgaWYgKGZpcnN0TWFya2VyICYmIGZpcnN0TWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICBpZiAoIShlLnRhcmdldCBpbnN0YW5jZW9mIEwuTWFya2VyKSkge1xuICAgICAgICAgIHRoaXMuX2FkZE1hcmtlcihlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHN0YXJ0IGRyYXcgbmV3IGhvbGUgcG9seWdvblxuICAgICAgdmFyIGVoTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGZpcnN0TWFya2VyICYmICFmaXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKChlLnRhcmdldC5nZXRFUG9seWdvbigpLl9wYXRoID09IGUub3JpZ2luYWxFdmVudC50b0VsZW1lbnQpKSB7XG4gICAgICAgICAgaWYgKCFlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpKSB7XG4gICAgICAgICAgICB2YXIgbGFzdEhHcm91cCA9IGVoTWFya2Vyc0dyb3VwLmFkZEhvbGVHcm91cCgpO1xuICAgICAgICAgICAgbGFzdEhHcm91cC5zZXQoZS5sYXRsbmcsIG51bGwsIHtpY29uOiBmaXJzdEljb259KTtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTZWxlY3RlZE1hcmtlcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZE1Hcm91cCA9IGxhc3RIR3JvdXA7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2VkaXRvcjpzdGFydF9hZGRfbmV3X2hvbGUnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBjb250aW51ZSB3aXRoIG5ldyBob2xlIHBvbHlnb25cbiAgICAgIGlmIChlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5faXNNYXJrZXJJblBvbHlnb24oZS5sYXRsbmcpKSB7XG4gICAgICAgICAgdmFyIG1hcmtlciA9IGVoTWFya2Vyc0dyb3VwLmdldExhc3RIb2xlKCkuc2V0KGUubGF0bG5nKTtcbiAgICAgICAgICB2YXIgcnNsdCA9IG1hcmtlci5fZGV0ZWN0SW50ZXJzZWN0aW9uKCk7IC8vIGluIGNhc2Ugb2YgaG9sZVxuICAgICAgICAgIGlmKHJzbHQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuXG4gICAgICAgICAgICAvL21hcmtlci5fbUdyb3VwLnJlbW92ZU1hcmtlcihtYXJrZXIpOyAvL3RvZG86IGRldGVjdCBpbnRlcnNlY3Rpb24gZm9yIGhvbGVcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyByZXNldFxuXG4gICAgICBpZiAodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSkge1xuICAgICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZWRpdG9yOmpvaW5fcGF0aCcsIChlKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IGUubUdyb3VwO1xuXG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5faXNIb2xlKSB7XG4gICAgICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldExhc3RIb2xlKCk7XG4gICAgICB9XG4gICAgICAvLzEuIHNldCBtaWRkbGUgbWFya2Vyc1xuICAgICAgdmFyIGxheWVycyA9IGVNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IC0xO1xuICAgICAgbGF5ZXJzLmZvckVhY2goKCkgPT4ge1xuICAgICAgICB2YXIgbWFya2VyID0gZU1hcmtlcnNHcm91cC5hZGRNYXJrZXIocG9zaXRpb24sIG51bGwsIHtpY29uOiBtaWRkbGVJY29ufSk7XG4gICAgICAgIHBvc2l0aW9uID0gbWFya2VyLnBvc2l0aW9uICsgMjtcbiAgICAgIH0pO1xuXG4gICAgICAvLzIuIGNsZWFyIGxpbmVcbiAgICAgIGVNYXJrZXJzR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcblxuICAgICAgZU1hcmtlcnNHcm91cC5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICAgIG1hcmtlci5kcmFnZ2luZy5lbmFibGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL3RoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLnNlbGVjdCgpO1xuXG4gICAgICBlTWFya2Vyc0dyb3VwLnNlbGVjdCgpO1xuXG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0Jyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmdldFZHcm91cCgpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKSAmJiBlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpICYmICFlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXNldFxuICAgICAgICBpZiAodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSkge1xuICAgICAgICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICAgICAgdGhpcy5faGlkZVNlbGVjdGVkVkxheWVyKGUubGF5ZXIpO1xuXG4gICAgICAgIGVNYXJrZXJzR3JvdXAucmVzdG9yZShlLmxheWVyKTtcbiAgICAgICAgdGhpcy5fY29udmVydFRvRWRpdChlTWFya2Vyc0dyb3VwKTtcblxuICAgICAgICBlTWFya2Vyc0dyb3VwLnNlbGVjdCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jb252ZXJ0VG9FZGl0KHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICB9KTtcbiAgICB0aGlzLm9uKCdlZGl0b3I6ZGVsZXRlX3BvbHlnb24nLCAoKSA9PiB7XG4gICAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH0sXG4gIF9hZGRNYXJrZXIgKGUpIHtcbiAgICB2YXIgbGF0bG5nID0gZS5sYXRsbmc7XG5cbiAgICB2YXIgZU1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgdmFyIG1hcmtlciA9IGVNYXJrZXJzR3JvdXAuc2V0KGxhdGxuZyk7XG5cbiAgICB0aGlzLl9jb252ZXJ0VG9FZGl0KGVNYXJrZXJzR3JvdXApO1xuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgX3VwZGF0ZURFTGluZSAobGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldERFTGluZSgpLnVwZGF0ZShsYXRsbmcpO1xuICB9LFxuICBfdW5CaW5kRHJhd0V2ZW50cyAoKSB7XG4gICAgdGhpcy5vZmYoJ2NsaWNrJyk7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5vZmYoJ2NsaWNrJyk7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG4gICAgdGhpcy5vZmYoJ2RibGNsaWNrJyk7XG5cbiAgICB0aGlzLmdldERFTGluZSgpLmNsZWFyKCk7XG5cbiAgICB0aGlzLm9mZignZWRpdG9yOmpvaW5fcGF0aCcpO1xuXG4gICAgaWYgKHRoaXMuX29wZW5Qb3B1cCkge1xuICAgICAgdGhpcy5vcGVuUG9wdXAgPSB0aGlzLl9vcGVuUG9wdXA7XG4gICAgICBkZWxldGUgdGhpcy5fb3BlblBvcHVwO1xuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgX3NlbGVjdGVkOiBmYWxzZSxcbiAgX2xhc3RIb2xlOiB1bmRlZmluZWQsXG4gIF9sYXN0SG9sZVRvRHJhdzogdW5kZWZpbmVkLFxuICBhZGRIb2xlR3JvdXAgKCkge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICB0aGlzLl9sYXN0SG9sZS5faXNIb2xlID0gdHJ1ZTtcbiAgICB0aGlzLl9sYXN0SG9sZS5hZGRUbyh0aGlzKTtcblxuICAgIHRoaXMuX2xhc3RIb2xlLnBvc2l0aW9uID0gdGhpcy5nZXRMZW5ndGgoKSAtIDE7XG5cbiAgICB0aGlzLl9sYXN0SG9sZVRvRHJhdyA9IHRoaXMuX2xhc3RIb2xlO1xuXG4gICAgcmV0dXJuIHRoaXMuX2xhc3RIb2xlO1xuICB9LFxuICBnZXRMZW5ndGggKCkge1xuICAgIHJldHVybiB0aGlzLmdldExheWVycygpLmxlbmd0aDtcbiAgfSxcbiAgcmVzZXRMYXN0SG9sZSAoKSB7XG4gICAgdGhpcy5fbGFzdEhvbGUgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIGdldExhc3RIb2xlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdEhvbGU7XG4gIH0sXG4gIHJlbW92ZSAoKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGhvbGUpID0+IHtcbiAgICAgIHdoaWxlIChob2xlLmdldExheWVycygpLmxlbmd0aCkge1xuICAgICAgICBob2xlLnJlbW92ZU1hcmtlckF0KDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICByZXBvcyAocG9zaXRpb24pIHtcbiAgICB0aGlzLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGlmIChsYXllci5wb3NpdGlvbiA+PSBwb3NpdGlvbikge1xuICAgICAgICBsYXllci5wb3NpdGlvbiAtPSAxO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICByZXNldFNlbGVjdGlvbiAoKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBsYXllci5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICAgIG1hcmtlci51blNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IGZhbHNlO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xuICAgIHVwZGF0ZSAoKSB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgICAgbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5fY29ubmVjdE1hcmtlcnMoKTtcbi8vICAgIG1hcC5nZXRFUG9seWdvbigpLnNldFN0eWxlKG1hcC5lZGl0U3R5bGVbbWFwLl9nZXRNb2RlVHlwZSgpXSk7XG4gICAgfVxuICB9KTsiLCJpbXBvcnQgQmFzZU1Hcm91cCBmcm9tICcuLi9leHRlbmRlZC9CYXNlTWFya2VyR3JvdXAnO1xuaW1wb3J0IEVkaXRNYXJrZXIgZnJvbSAnLi4vZWRpdC9tYXJrZXInO1xuaW1wb3J0IEVkaXRMaW5lR3JvdXAgZnJvbSAnLi4vZWRpdC9saW5lJztcbmltcG9ydCBEYXNoZWRFZGl0TGluZUdyb3VwIGZyb20gJy4uL2RyYXcvZGFzaGVkLWxpbmUnO1xuXG5pbXBvcnQgc29ydCBmcm9tICcuLi91dGlscy9zb3J0QnlQb3NpdGlvbic7XG5pbXBvcnQgKiBhcyBpY29ucyBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuXG5MLlV0aWwuZXh0ZW5kKEwuTGluZVV0aWwsIHtcbiAgLy8gQ2hlY2tzIHRvIHNlZSBpZiB0d28gbGluZSBzZWdtZW50cyBpbnRlcnNlY3QuIERvZXMgbm90IGhhbmRsZSBkZWdlbmVyYXRlIGNhc2VzLlxuICAvLyBodHRwOi8vY29tcGdlb20uY3MudWl1Yy5lZHUvfmplZmZlL3RlYWNoaW5nLzM3My9ub3Rlcy94MDYtc3dlZXBsaW5lLnBkZlxuICBzZWdtZW50c0ludGVyc2VjdCAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyLCAvKlBvaW50Ki8gcDMpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAsIHAyLCBwMykgIT09XG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocDEsIHAyLCBwMykgJiZcbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMSwgcDIpICE9PVxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAsIHAxLCBwMyk7XG4gIH0sXG5cbiAgLy8gY2hlY2sgdG8gc2VlIGlmIHBvaW50cyBhcmUgaW4gY291bnRlcmNsb2Nrd2lzZSBvcmRlclxuICBfY2hlY2tDb3VudGVyY2xvY2t3aXNlICgvKlBvaW50Ki8gcCwgLypQb2ludCovIHAxLCAvKlBvaW50Ki8gcDIpIHtcbiAgICByZXR1cm4gKHAyLnkgLSBwLnkpICogKHAxLnggLSBwLngpID4gKHAxLnkgLSBwLnkpICogKHAyLnggLSBwLngpO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgTC5NYXJrZXJHcm91cCA9IEJhc2VNR3JvdXAuZXh0ZW5kKHtcbiAgX2lzSG9sZTogZmFsc2UsXG4gIF9lZGl0TGluZUdyb3VwOiB1bmRlZmluZWQsXG4gIF9wb3NpdGlvbjogdW5kZWZpbmVkLFxuICBkYXNoZWRFZGl0TGluZUdyb3VwOiBuZXcgRGFzaGVkRWRpdExpbmVHcm91cChbXSksXG4gIG9wdGlvbnM6IHtcbiAgICBtSWNvbjogdW5kZWZpbmVkLFxuICAgIG1Ib3Zlckljb246IHVuZGVmaW5lZFxuICB9LFxuICBpbml0aWFsaXplIChsYXllcnMpIHtcbiAgICBMLkxheWVyR3JvdXAucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXllcnMpO1xuXG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICAgIC8vdGhpcy5fYmluZEV2ZW50cygpO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5hZGRUbyhtYXApO1xuICB9LFxuICBfdXBkYXRlREVMaW5lIChsYXRsbmcpIHtcbiAgICB2YXIgZGVMaW5lID0gdGhpcy5nZXRERUxpbmUoKTtcbiAgICBpZiAodGhpcy5fZmlyc3RNYXJrZXIpIHtcbiAgICAgIGRlTGluZS51cGRhdGUobGF0bG5nKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlTGluZTtcbiAgfSxcbiAgX2FkZE1hcmtlciAobGF0bG5nKSB7XG4gICAgLy92YXIgZU1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgdGhpcy5zZXQobGF0bG5nKTtcbiAgICB0aGlzLmdldERFTGluZSgpLmFkZExhdExuZyhsYXRsbmcpO1xuXG4gICAgdGhpcy5fbWFwLl9jb252ZXJ0VG9FZGl0KHRoaXMpO1xuICB9LFxuICBnZXRERUxpbmUgKCkge1xuICAgIGlmICghdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwLl9tYXApIHtcbiAgICAgIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5hZGRUbyh0aGlzLl9tYXApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXA7XG4gIH0sXG4gIF9zZXRIb3Zlckljb24gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbWFwLl9vbGRTZWxlY3RlZE1hcmtlci5fcmVzZXRJY29uKHRoaXMub3B0aW9ucy5tSWNvbik7XG4gICAgfVxuICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIuX3NldEhvdmVySWNvbih0aGlzLm9wdGlvbnMubUhvdmVySWNvbik7XG4gIH0sXG4gIF9zb3J0QnlQb3NpdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0hvbGUpIHtcbiAgICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgICBsYXllcnMgPSBsYXllcnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYS5fbGVhZmxldF9pZCAtIGIuX2xlYWZsZXRfaWQ7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGlkQXJyYXkgPSBbXTtcbiAgICAgIHZhciBwb3NBcnJheSA9IFtdO1xuICAgICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICAgIGlkQXJyYXkucHVzaChsYXllci5fbGVhZmxldF9pZCk7XG4gICAgICAgIHBvc0FycmF5LnB1c2gobGF5ZXIuX19wb3NpdGlvbik7XG4gICAgICB9KTtcblxuICAgICAgc29ydCh0aGlzLl9sYXllcnMsIGlkQXJyYXkpO1xuICAgIH1cbiAgfSxcbiAgdXBkYXRlU3R5bGUgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG1hcmtlciA9IG1hcmtlcnNbaV07XG4gICAgICBtYXJrZXIuX3Jlc2V0SWNvbih0aGlzLm9wdGlvbnMubUljb24pO1xuICAgICAgaWYgKG1hcmtlciA9PT0gdGhpcy5fbWFwLl9zZWxlY3RlZE1hcmtlcikge1xuICAgICAgICB0aGlzLl9zZXRIb3Zlckljb24oKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHNldFNlbGVjdGVkIChtYXJrZXIpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5fX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkICYmIHRoaXMuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgbWFwLl9zZWxlY3RlZE1hcmtlciA9IHRoaXMuZ2V0TGFzdCgpO1xuICAgICAgbWFwLl9vbGRTZWxlY3RlZE1hcmtlciA9IG1hcC5fc2VsZWN0ZWRNYXJrZXI7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWFwLl9vbGRTZWxlY3RlZE1hcmtlciA9IG1hcC5fc2VsZWN0ZWRNYXJrZXI7XG4gICAgbWFwLl9zZWxlY3RlZE1hcmtlciA9IG1hcmtlcjtcbiAgfSxcbiAgcmVzZXRTZWxlY3RlZCAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLl9zZWxlY3RlZE1hcmtlcikge1xuICAgICAgbWFwLl9zZWxlY3RlZE1hcmtlci5fcmVzZXRJY29uKHRoaXMub3B0aW9ucy5tSWNvbik7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSxcbiAgZ2V0U2VsZWN0ZWQgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuX3NlbGVjdGVkTWFya2VyO1xuICB9LFxuICBfc2V0Rmlyc3QgKG1hcmtlcikge1xuICAgIHRoaXMuX2ZpcnN0TWFya2VyID0gbWFya2VyO1xuICAgIHRoaXMuX2ZpcnN0TWFya2VyLl9zZXRGaXJzdEljb24oKTtcbiAgfSxcbiAgZ2V0Rmlyc3QgKCkge1xuICAgIHJldHVybiB0aGlzLl9maXJzdE1hcmtlcjtcbiAgfSxcbiAgZ2V0TGFzdCAoKSB7XG4gICAgaWYgKHRoaXMuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgICByZXR1cm4gbGF5ZXJzW2xheWVycy5sZW5ndGggLSAxXTtcbiAgICB9XG4gIH0sXG4gIGhhc0ZpcnN0TWFya2VyICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGaXJzdCgpICYmIHRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCk7XG4gIH0sXG4gIGNvbnZlcnRUb0xhdExuZ3MgKCkge1xuICAgIHZhciBsYXRsbmdzID0gW107XG4gICAgdGhpcy5lYWNoTGF5ZXIoZnVuY3Rpb24gKGxheWVyKSB7XG4gICAgICBpZiAoIWxheWVyLmlzTWlkZGxlKCkpIHtcbiAgICAgICAgbGF0bG5ncy5wdXNoKGxheWVyLmdldExhdExuZygpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGF0bG5ncztcbiAgfSxcbiAgcmVzdG9yZSAobGF5ZXIpIHtcbiAgICB0aGlzLnNldEFsbChsYXllci5fbGF0bG5ncyk7XG4gICAgdGhpcy5zZXRBbGxIb2xlcyhsYXllci5faG9sZXMpO1xuICB9LFxuICBfYWRkIChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zID0ge30pIHtcblxuICAgIGlmICh0aGlzLl9tYXAuaXNNb2RlKCdkcmF3JykpIHtcbiAgICAgIGlmICghdGhpcy5fZmlyc3RNYXJrZXIpIHtcbiAgICAgICAgb3B0aW9ucy5pY29uID0gaWNvbnMuZmlyc3RJY29uO1xuICAgICAgfVxuICAgIH1cblxuXG4gICAgdmFyIG1hcmtlciA9IHRoaXMuYWRkTWFya2VyKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5nZXRERUxpbmUoKS5hZGRMYXRMbmcobGF0bG5nKTtcblxuICAgIHRoaXMuX21hcC5vZmYoJ21vdXNlbW92ZScpO1xuICAgIGlmICh0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURFTGluZShlLmxhdGxuZyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZXRERUxpbmUoKS5jbGVhcigpO1xuICAgIH1cblxuICAgIGlmIChtYXJrZXIuX21Hcm91cC5nZXRMYXllcnMoKS5sZW5ndGggPiAyKSB7XG4gICAgICBpZiAobWFya2VyLl9tR3JvdXAuX2ZpcnN0TWFya2VyLl9oYXNGaXJzdEljb24oKSAmJiBtYXJrZXIgPT09IG1hcmtlci5fbUdyb3VwLl9sYXN0TWFya2VyKSB7XG4gICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIgKGxheWVycywgcG9zaXRpb24sIGRpcmVjdGlvbikge1xuICAgIHJldHVybiAobGF5ZXJzW3Bvc2l0aW9uXS5pc01pZGRsZSgpKSA/IGxheWVyc1twb3NpdGlvbiArIGRpcmVjdGlvbl0gOiBsYXllcnNbcG9zaXRpb25dO1xuICB9LFxuICBfc2V0UHJldk5leHQgKG1hcmtlciwgcG9zaXRpb24pIHtcbiAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcblxuICAgIHZhciBtYXhMZW5ndGggPSBsYXllcnMubGVuZ3RoIC0gMTtcbiAgICBpZiAocG9zaXRpb24gPT09IDEpIHtcbiAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMuX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIobGF5ZXJzLCBwb3NpdGlvbiAtIDEsIC0xKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIobGF5ZXJzLCAyLCAxKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSBtYXhMZW5ndGgpIHtcbiAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMuX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIobGF5ZXJzLCBtYXhMZW5ndGggLSAxLCAtMSk7XG4gICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgMCwgMSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hcmtlci5fbWlkZGxlUHJldiA9PSBudWxsKSB7XG4gICAgICAgIG1hcmtlci5fcHJldiA9IGxheWVyc1twb3NpdGlvbiAtIDFdO1xuICAgICAgfVxuICAgICAgaWYgKG1hcmtlci5fbWlkZGxlTmV4dCA9PSBudWxsKSB7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IGxheWVyc1twb3NpdGlvbiArIDFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIHNldE1pZGRsZU1hcmtlciAocG9zaXRpb24pIHtcbiAgICB0aGlzLmFkZE1hcmtlcihwb3NpdGlvbiwgbnVsbCwge2ljb246IGljb25zLm1pZGRsZUljb259KTtcbiAgfSxcbiAgc2V0TWlkZGxlTWFya2VycyAocG9zaXRpb24pIHtcbiAgICB0aGlzLnNldE1pZGRsZU1hcmtlcihwb3NpdGlvbik7XG4gICAgdGhpcy5zZXRNaWRkbGVNYXJrZXIocG9zaXRpb24gKyAyKTtcbiAgfSxcbiAgc2V0IChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ludGVyc2VjdGlvbihsYXRsbmcpKSB7XG4gICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB0aGlzLl9tYXAuZWRnZXNJbnRlcnNlY3RlZChmYWxzZSk7XG4gICAgICByZXR1cm4gdGhpcy5fYWRkKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAuZWRnZXNJbnRlcnNlY3RlZChmYWxzZSk7XG4gICAgICB0aGlzLl9tYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfSxcbiAgc2V0TWlkZGxlIChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKSB7XG4gICAgcG9zaXRpb24gPSAocG9zaXRpb24gPCAwKSA/IDAgOiBwb3NpdGlvbjtcblxuICAgIC8vdmFyIGZ1bmMgPSAodGhpcy5faXNIb2xlKSA/ICdzZXQnIDogJ3NldEhvbGVNYXJrZXInO1xuICAgIHZhciBtYXJrZXIgPSB0aGlzLnNldChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKTtcblxuICAgIG1hcmtlci5fc2V0TWlkZGxlSWNvbigpO1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIHNldEFsbCAobGF0bG5ncykge1xuICAgIGxhdGxuZ3MuZm9yRWFjaCgobGF0bG5nLCBwb3NpdGlvbikgPT4ge1xuICAgICAgdGhpcy5zZXQobGF0bG5nLCBwb3NpdGlvbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmdldEZpcnN0KCkuZmlyZSgnY2xpY2snKTtcbiAgfSxcbiAgc2V0QWxsSG9sZXMgKGhvbGVzKSB7XG4gICAgaG9sZXMuZm9yRWFjaCgoaG9sZSkgPT4ge1xuICAgICAgLy90aGlzLnNldChob2xlKTtcbiAgICAgIHZhciBsYXN0SEdyb3VwID0gdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuYWRkSG9sZUdyb3VwKCk7XG5cbiAgICAgIGhvbGUuX2VhY2goKGxhdGxuZywgcG9zaXRpb24pID0+IHtcbiAgICAgICAgbGFzdEhHcm91cC5zZXQobGF0bG5nLCBwb3NpdGlvbik7XG4gICAgICB9KTtcbiAgICAgIC8vdmFyIGxlbmd0aCA9IGhvbGUubGVuZ3RoO1xuICAgICAgLy92YXIgaSA9IDA7XG4gICAgICAvL2ZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vICBsYXN0SEdyb3VwLnNldChob2xlW2ldLCBpKTtcbiAgICAgIC8vfVxuXG4gICAgICBsYXN0SEdyb3VwLmdldEZpcnN0KCkuZmlyZSgnY2xpY2snKTtcbiAgICB9KTtcbiAgfSxcbiAgc2V0SG9sZU1hcmtlciAobGF0bG5nLCBvcHRpb25zID0ge2lzSG9sZU1hcmtlcjogdHJ1ZSwgaG9sZVBvc2l0aW9uOiB7fX0pIHtcbiAgICB2YXIgbWFya2VyID0gbmV3IEVkaXRNYXJrZXIodGhpcywgbGF0bG5nLCBvcHRpb25zIHx8IHt9KTtcbiAgICBtYXJrZXIuYWRkVG8odGhpcyk7XG5cbiAgICAvL3RoaXMuc2V0U2VsZWN0ZWQobWFya2VyKTtcblxuICAgIGlmICh0aGlzLl9tYXAuaXNNb2RlKCdkcmF3JykgJiYgdGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDEpIHtcbiAgICAgIHRoaXMuX3NldEZpcnN0KG1hcmtlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgcmVtb3ZlSG9sZSAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAvL3JlbW92ZSBlZGl0IGxpbmVcbiAgICAvL3RoaXMuZ2V0RUxpbmVHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy9yZW1vdmUgZWRpdCBtYXJrZXJzXG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuXG4gICAgLy9yZW1vdmUgaG9sZVxuICAgIG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGVzKCkuc3BsaWNlKHRoaXMuX3Bvc2l0aW9uLCAxKTtcbiAgICBtYXAuZ2V0RVBvbHlnb24oKS5yZWRyYXcoKTtcblxuICAgIC8vcmVkcmF3IGhvbGVzXG4gICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB2YXIgaG9sZXMgPSBtYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlcygpO1xuXG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAoOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG1hcC5fc2V0RUhNYXJrZXJHcm91cChob2xlc1tpXSk7XG4gICAgfVxuICB9LFxuICByZW1vdmVTZWxlY3RlZCAoKSB7XG4gICAgdmFyIHNlbGVjdGVkRU1hcmtlciA9IHRoaXMuZ2V0U2VsZWN0ZWQoKTtcbiAgICB2YXIgbWFya2VyTGF5ZXJzQXJyYXkgPSB0aGlzLmdldExheWVycygpO1xuICAgIHZhciBsYXRsbmcgPSBzZWxlY3RlZEVNYXJrZXIuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXJrZXJMYXllcnNBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlbW92ZUxheWVyKHNlbGVjdGVkRU1hcmtlcik7XG5cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsIHtsYXRsbmc6IGxhdGxuZ30pO1xuICAgIH1cblxuICAgIG1hcmtlckxheWVyc0FycmF5ID0gdGhpcy5nZXRMYXllcnMoKTtcblxuICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgIGlmIChtYXAuaXNNb2RlKCdlZGl0JykpIHtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAvLyBubyBuZWVkIHRvIHJlbW92ZSBsYXN0IHBvaW50XG4gICAgICAgIGlmIChtYXJrZXJMYXllcnNBcnJheS5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVIb2xlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9zZWxlY3RlZEVNYXJrZXIgPSBtYXAuZ2V0U2VsZWN0ZWRNYXJrZXIoKTtcbiAgICAgICAgICB2YXIgaG9sZVBvc2l0aW9uID0gc2VsZWN0ZWRFTWFya2VyLm9wdGlvbnMuaG9sZVBvc2l0aW9uO1xuXG4gICAgICAgICAgLy9yZW1vdmUgaG9sZSBwb2ludFxuICAgICAgICAgIC8vbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZSh0aGlzLl9wb3NpdGlvbikuc3BsaWNlKGhvbGVQb3NpdGlvbi5oTWFya2VyLCAxKTtcbiAgICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlKHRoaXMuX3Bvc2l0aW9uKS5zcGxpY2Uoc2VsZWN0ZWRFTWFya2VyLl9fcG9zaXRpb24sIDEpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLnJlZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF9wb3NpdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgICAgIGxheWVyLm9wdGlvbnMuaG9sZVBvc2l0aW9uID0ge1xuICAgICAgICAgICAgaEdyb3VwOiB0aGlzLl9wb3NpdGlvbixcbiAgICAgICAgICAgIGhNYXJrZXI6IF9wb3NpdGlvbisrXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXAuaXNNb2RlKCdlZGl0JykpIHtcbiAgICAgICAgLy8gbm8gbmVlZCB0byByZW1vdmUgbGFzdCBwb2ludFxuICAgICAgICBpZiAobWFya2VyTGF5ZXJzQXJyYXkubGVuZ3RoIDwgMykge1xuICAgICAgICAgIC8vcmVtb3ZlIGVkaXQgbWFya2Vyc1xuICAgICAgICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcbiAgICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5jbGVhcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHBvc2l0aW9uID0gMDtcbiAgICB0aGlzLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGxheWVyLm9wdGlvbnMudGl0bGUgPSBwb3NpdGlvbjtcbiAgICAgIGxheWVyLl9fcG9zaXRpb24gPSBwb3NpdGlvbisrO1xuICAgIH0pO1xuICB9LFxuICBnZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24gKHBvbHlnb24pIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gW107XG4gICAgdmFyIGxheWVycyA9ICgocG9seWdvbikgPyBwb2x5Z29uLmdldExheWVycygpIDogdGhpcy5nZXRMYXllcnMoKSkuZmlsdGVyKChsKSA9PiAhbC5pc01pZGRsZSgpKTtcblxuICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gW107XG4gICAgbGF5ZXJzLl9lYWNoKChsYXllcikgPT4ge1xuICAgICAgdmFyIGxhdGxuZyA9IGxheWVyLmdldExhdExuZygpO1xuICAgICAgdGhpcy5fb3JpZ2luYWxQb2ludHMucHVzaCh0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZykpO1xuICAgIH0pO1xuXG4gICAgaWYgKCFwb2x5Z29uKSB7XG4gICAgICBpZiAobWFwLl9zZWxlY3RlZE1hcmtlciA9PSBsYXllcnNbMF0pIHsgLy8gcG9pbnQgaXMgZmlyc3RcbiAgICAgICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cy5zbGljZSgxKTtcbiAgICAgIH0gZWxzZSBpZiAobWFwLl9zZWxlY3RlZE1hcmtlciA9PSBsYXllcnNbbGF5ZXJzLmxlbmd0aCAtIDFdKSB7IC8vIHBvaW50IGlzIGxhc3RcbiAgICAgICAgdGhpcy5fb3JpZ2luYWxQb2ludHMuc3BsaWNlKC0xKTtcbiAgICAgIH0gZWxzZSB7IC8vIHBvaW50IGlzIG5vdCBmaXJzdCAvIGxhc3RcbiAgICAgICAgdmFyIHRtcEFyclBvaW50cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09PSBsYXllcnNbaV0pIHtcbiAgICAgICAgICAgIHRtcEFyclBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLnNwbGljZShpICsgMSk7XG4gICAgICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IHRtcEFyclBvaW50cy5jb25jYXQodGhpcy5fb3JpZ2luYWxQb2ludHMpO1xuICAgICAgICAgICAgdGhpcy5fb3JpZ2luYWxQb2ludHMuc3BsaWNlKC0xKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb3JpZ2luYWxQb2ludHM7XG4gIH0sXG4gIF9iaW5kTGluZUV2ZW50czogdW5kZWZpbmVkLFxuICBfaGFzSW50ZXJzZWN0aW9uIChwb2ludHMsIG5ld1BvaW50LCBpc0ZpbmlzaCkge1xuICAgIHZhciBsZW4gPSBwb2ludHMgPyBwb2ludHMubGVuZ3RoIDogMCxcbiAgICAgIGxhc3RQb2ludCA9IHBvaW50cyA/IHBvaW50c1tsZW4gLSAxXSA6IG51bGwsXG4gICAgLy8gVGhlIHByZXZpb3VzIHByZXZpb3VzIGxpbmUgc2VnbWVudC4gUHJldmlvdXMgbGluZSBzZWdtZW50IGRvZXNuJ3QgbmVlZCB0ZXN0aW5nLlxuICAgICAgbWF4SW5kZXggPSBsZW4gLSAyO1xuXG4gICAgaWYgKHRoaXMuX3Rvb0Zld1BvaW50c0ZvckludGVyc2VjdGlvbigxKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9saW5lU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UobGFzdFBvaW50LCBuZXdQb2ludCwgbWF4SW5kZXgsIGlzRmluaXNoKTtcbiAgfSxcblxuICBfaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUgKHBvaW50cywgbmV3UG9pbnQsIGxhc3RQb2ludCkge1xuICAgIHZhciBsZW4gPSBwb2ludHMgPyBwb2ludHMubGVuZ3RoIDogMCxcbiAgICAvL2xhc3RQb2ludCA9IHBvaW50cyA/IHBvaW50c1tsZW4gLSAxXSA6IG51bGwsXG4gICAgLy8gVGhlIHByZXZpb3VzIHByZXZpb3VzIGxpbmUgc2VnbWVudC4gUHJldmlvdXMgbGluZSBzZWdtZW50IGRvZXNuJ3QgbmVlZCB0ZXN0aW5nLlxuICAgICAgbWF4SW5kZXggPSBsZW4gLSAyO1xuXG4gICAgaWYgKHRoaXMuX3Rvb0Zld1BvaW50c0ZvckludGVyc2VjdGlvbigxKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9saW5lSG9sZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlKGxhc3RQb2ludCwgbmV3UG9pbnQpO1xuICB9LFxuXG4gIGhhc0ludGVyc2VjdGlvbiAobGF0bG5nLCBpc0ZpbmlzaCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5ld1BvaW50ID0gbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpO1xuXG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uKCk7XG5cbiAgICB2YXIgcnNsdDEgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb24ocG9pbnRzLCBuZXdQb2ludCwgaXNGaW5pc2gpO1xuICAgIHZhciByc2x0MiA9IGZhbHNlO1xuXG4gICAgdmFyIGZNYXJrZXIgPSB0aGlzLmdldEZpcnN0KCk7XG4gICAgaWYgKGZNYXJrZXIgJiYgIWZNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAvLyBjb2RlIHdhcyBkdWJsaWNhdGVkIHRvIGNoZWNrIGludGVyc2VjdGlvbiBmcm9tIGJvdGggc2lkZXNcbiAgICAgIC8vICh0aGUgbWFpbiBpZGVhIHRvIHJldmVyc2UgYXJyYXkgb2YgcG9pbnRzIGFuZCBjaGVjayBpbnRlcnNlY3Rpb24gYWdhaW4pXG5cbiAgICAgIHBvaW50cyA9IHRoaXMuZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uKCkucmV2ZXJzZSgpO1xuICAgICAgcnNsdDIgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb24ocG9pbnRzLCBuZXdQb2ludCwgaXNGaW5pc2gpO1xuICAgIH1cblxuICAgIG1hcC5lZGdlc0ludGVyc2VjdGVkKHJzbHQxIHx8IHJzbHQyKTtcbiAgICB2YXIgZWRnZXNJbnRlcnNlY3RlZCA9IG1hcC5lZGdlc0ludGVyc2VjdGVkKCk7XG4gICAgcmV0dXJuIGVkZ2VzSW50ZXJzZWN0ZWQ7XG4gIH0sXG4gIGhhc0ludGVyc2VjdGlvbldpdGhIb2xlIChsQXJyYXksIGhvbGUpIHtcblxuICAgIGlmICh0aGlzLl9tYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBuZXdQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzBdKTtcbiAgICB2YXIgbGFzdFBvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsQXJyYXlbMV0pO1xuXG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uKGhvbGUpO1xuXG4gICAgdmFyIHJzbHQxID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUocG9pbnRzLCBuZXdQb2ludCwgbGFzdFBvaW50KTtcblxuICAgIC8vIGNvZGUgd2FzIGR1YmxpY2F0ZWQgdG8gY2hlY2sgaW50ZXJzZWN0aW9uIGZyb20gYm90aCBzaWRlc1xuICAgIC8vICh0aGUgbWFpbiBpZGVhIHRvIHJldmVyc2UgYXJyYXkgb2YgcG9pbnRzIGFuZCBjaGVjayBpbnRlcnNlY3Rpb24gYWdhaW4pXG5cbiAgICBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbihob2xlKS5yZXZlcnNlKCk7XG4gICAgbGFzdFBvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsQXJyYXlbMl0pO1xuICAgIHZhciByc2x0MiA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlKHBvaW50cywgbmV3UG9pbnQsIGxhc3RQb2ludCk7XG5cbiAgICB0aGlzLl9tYXAuZWRnZXNJbnRlcnNlY3RlZChyc2x0MSB8fCByc2x0Mik7XG4gICAgdmFyIGVkZ2VzSW50ZXJzZWN0ZWQgPSB0aGlzLl9tYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuXG4gICAgcmV0dXJuIGVkZ2VzSW50ZXJzZWN0ZWQ7XG4gIH0sXG4gIF90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24gKGV4dHJhUG9pbnRzKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLFxuICAgICAgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDA7XG4gICAgLy8gSW5jcmVtZW50IGxlbmd0aCBieSBleHRyYVBvaW50cyBpZiBwcmVzZW50XG4gICAgbGVuICs9IGV4dHJhUG9pbnRzIHx8IDA7XG5cbiAgICByZXR1cm4gIXRoaXMuX29yaWdpbmFsUG9pbnRzIHx8IGxlbiA8PSAzO1xuICB9LFxuICBfbGluZUhvbGVTZWdtZW50c0ludGVyc2VjdHNSYW5nZSAocCwgcDEpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsIHAyLCBwMztcblxuICAgIGZvciAodmFyIGogPSBwb2ludHMubGVuZ3RoIC0gMTsgaiA+IDA7IGotLSkge1xuICAgICAgcDIgPSBwb2ludHNbaiAtIDFdO1xuICAgICAgcDMgPSBwb2ludHNbal07XG5cbiAgICAgIGlmIChMLkxpbmVVdGlsLnNlZ21lbnRzSW50ZXJzZWN0KHAsIHAxLCBwMiwgcDMpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2xpbmVTZWdtZW50c0ludGVyc2VjdHNSYW5nZSAocCwgcDEsIG1heEluZGV4LCBpc0ZpbmlzaCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cyxcbiAgICAgIHAyLCBwMztcblxuICAgIHZhciBtaW4gPSBpc0ZpbmlzaCA/IDEgOiAwO1xuICAgIC8vIENoZWNrIGFsbCBwcmV2aW91cyBsaW5lIHNlZ21lbnRzIChiZXNpZGUgdGhlIGltbWVkaWF0ZWx5IHByZXZpb3VzKSBmb3IgaW50ZXJzZWN0aW9uc1xuICAgIGZvciAodmFyIGogPSBtYXhJbmRleDsgaiA+IG1pbjsgai0tKSB7XG4gICAgICBwMiA9IHBvaW50c1tqIC0gMV07XG4gICAgICBwMyA9IHBvaW50c1tqXTtcblxuICAgICAgaWYgKEwuTGluZVV0aWwuc2VnbWVudHNJbnRlcnNlY3QocCwgcDEsIHAyLCBwMykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBfaXNNYXJrZXJJblBvbHlnb24gKG1hcmtlcikge1xuICAgIHZhciBqID0gMDtcblxuICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuICAgIHZhciBzaWRlcyA9IGxheWVycy5sZW5ndGg7XG5cbiAgICB2YXIgeCA9IG1hcmtlci5sbmc7XG4gICAgdmFyIHkgPSBtYXJrZXIubGF0O1xuXG4gICAgdmFyIGluUG9seSA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWRlczsgaSsrKSB7XG4gICAgICBqKys7XG4gICAgICBpZiAoaiA9PSBzaWRlcykge1xuICAgICAgICBqID0gMDtcbiAgICAgIH1cbiAgICAgIHZhciBwb2ludDEgPSBsYXllcnNbaV0uZ2V0TGF0TG5nKCk7XG4gICAgICB2YXIgcG9pbnQyID0gbGF5ZXJzW2pdLmdldExhdExuZygpO1xuICAgICAgaWYgKCgocG9pbnQxLmxhdCA8IHkpICYmIChwb2ludDIubGF0ID49IHkpKSB8fCAoKHBvaW50Mi5sYXQgPCB5KSAmJiAocG9pbnQxLmxhdCA+PSB5KSkpIHtcbiAgICAgICAgaWYgKHBvaW50MS5sbmcgKyAoeSAtIHBvaW50MS5sYXQpIC8gKHBvaW50Mi5sYXQgLSBwb2ludDEubGF0KSAqIChwb2ludDIubG5nIC0gcG9pbnQxLmxuZykgPCB4KSB7XG4gICAgICAgICAgaW5Qb2x5ID0gIWluUG9seVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGluUG9seTtcbiAgfVxufSk7IiwiaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vZXh0ZW5kZWQvVG9vbHRpcCc7XG5pbXBvcnQge2ZpcnN0SWNvbixpY29uLGRyYWdJY29uLG1pZGRsZUljb24saG92ZXJJY29uLGludGVyc2VjdGlvbkljb259IGZyb20gJy4uL21hcmtlci1pY29ucyc7XG5cbnZhciBzaXplID0gMTtcbnZhciB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbmlmICh1c2VyQWdlbnQuaW5kZXhPZihcImlwYWRcIikgIT09IC0xIHx8IHVzZXJBZ2VudC5pbmRleE9mKFwiaXBob25lXCIpICE9PSAtMSkge1xuICBzaXplID0gMjtcbn1cblxudmFyIHRvb2x0aXA7XG52YXIgZHJhZ2VuZCA9IGZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCBMLk1hcmtlci5leHRlbmQoe1xuICBfZHJhZ2dhYmxlOiB1bmRlZmluZWQsIC8vIGFuIGluc3RhbmNlIG9mIEwuRHJhZ2dhYmxlXG4gIF9vbGRMYXRMbmdTdGF0ZTogdW5kZWZpbmVkLFxuICBpbml0aWFsaXplIChncm91cCwgbGF0bG5nLCBvcHRpb25zID0ge30pIHtcblxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7XG4gICAgICBpY29uOiBpY29uLFxuICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgTC5NYXJrZXIucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmcsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fbUdyb3VwID0gZ3JvdXA7XG5cbiAgICB0aGlzLl9pc0ZpcnN0ID0gZ3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwO1xuICB9LFxuICByZW1vdmVHcm91cCAoKSB7XG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlSG9sZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlKCk7XG4gICAgfVxuICB9LFxuICByZW1vdmUgKCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHRoaXMuX21Hcm91cC5yZW1vdmVTZWxlY3RlZCgpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlSG9sZSAoKSB7IC8vIGRlcHJlY2F0ZWRcbiAgICB0aGlzLnJlbW92ZUdyb3VwKCk7XG4gIH0sXG4gIG5leHQgKCkge1xuICAgIHZhciBuZXh0ID0gdGhpcy5fbmV4dC5fbmV4dDtcbiAgICBpZiAoIXRoaXMuX25leHQuaXNNaWRkbGUoKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX25leHQ7XG4gICAgfVxuICAgIHJldHVybiBuZXh0O1xuICB9LFxuICBwcmV2ICgpIHtcbiAgICB2YXIgcHJldiA9IHRoaXMuX3ByZXYuX3ByZXY7XG4gICAgaWYgKCF0aGlzLl9wcmV2LmlzTWlkZGxlKCkpIHtcbiAgICAgIHByZXYgPSB0aGlzLl9wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gcHJldjtcbiAgfSxcbiAgY2hhbmdlUHJldk5leHRQb3MgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2LmlzTWlkZGxlKCkpIHtcblxuICAgICAgdmFyIHByZXZMYXRMbmcgPSB0aGlzLl9tR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLnByZXYoKSwgdGhpcyk7XG4gICAgICB2YXIgbmV4dExhdExuZyA9IHRoaXMuX21Hcm91cC5fZ2V0TWlkZGxlTGF0TG5nKHRoaXMsIHRoaXMubmV4dCgpKTtcblxuICAgICAgdGhpcy5fcHJldi5zZXRMYXRMbmcocHJldkxhdExuZyk7XG4gICAgICB0aGlzLl9uZXh0LnNldExhdExuZyhuZXh0TGF0TG5nKTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBjaGFuZ2UgZXZlbnRzIGZvciBtYXJrZXIgKGV4YW1wbGU6IGhvbGUpXG4gICAqL1xuICAgIHJlc2V0RXZlbnRzIChjYWxsYmFjaykge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0sXG4gIF9wb3NIYXNoICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJldi5wb3NpdGlvbiArICdfJyArIHRoaXMucG9zaXRpb24gKyAnXycgKyB0aGlzLl9uZXh0LnBvc2l0aW9uO1xuICB9LFxuICBfcmVzZXRJY29uIChfaWNvbikge1xuICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaWMgPSBfaWNvbiB8fCBpY29uO1xuXG4gICAgdGhpcy5zZXRJY29uKGljKTtcbiAgICB0aGlzLnByZXYoKS5zZXRJY29uKGljKTtcbiAgICB0aGlzLm5leHQoKS5zZXRJY29uKGljKTtcbiAgfSxcbiAgX3NldEhvdmVySWNvbiAoX2hJY29uKSB7XG4gICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0SWNvbihfaEljb24gfHwgaG92ZXJJY29uKTtcbiAgfSxcbiAgX2FkZEljb25DbGFzcyAoY2xhc3NOYW1lKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2ljb24sIGNsYXNzTmFtZSk7XG4gIH0sXG4gIF9yZW1vdmVJY29uQ2xhc3MgKGNsYXNzTmFtZSkge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9pY29uLCBjbGFzc05hbWUpO1xuICB9LFxuICBfc2V0SW50ZXJzZWN0aW9uSWNvbiAoKSB7XG4gICAgdmFyIGljb25DbGFzcyA9IGludGVyc2VjdGlvbkljb24ub3B0aW9ucy5jbGFzc05hbWU7XG4gICAgdmFyIGNsYXNzTmFtZSA9ICdtLWVkaXRvci1kaXYtaWNvbic7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKGNsYXNzTmFtZSk7XG4gICAgdGhpcy5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG5cbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQgPSB0aGlzLnByZXYoKTtcbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG5cbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQgPSB0aGlzLm5leHQoKTtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5fYWRkSWNvbkNsYXNzKGljb25DbGFzcyk7XG4gIH0sXG4gIF9zZXRGaXJzdEljb24gKCkge1xuICAgIHRoaXMuX2lzRmlyc3QgPSB0cnVlO1xuICAgIHRoaXMuc2V0SWNvbihmaXJzdEljb24pO1xuICB9LFxuICBfaGFzRmlyc3RJY29uICgpIHtcbiAgICByZXR1cm4gdGhpcy5faWNvbiAmJiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWRpdi1pY29uLWZpcnN0Jyk7XG4gIH0sXG4gIF9zZXRNaWRkbGVJY29uICgpIHtcbiAgICB0aGlzLnNldEljb24obWlkZGxlSWNvbik7XG4gIH0sXG4gIGlzTWlkZGxlICgpIHtcbiAgICByZXR1cm4gdGhpcy5faWNvbiAmJiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbicpXG4gICAgICAmJiAhTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdsZWFmbGV0LWRyYWctdGFyZ2V0Jyk7XG4gIH0sXG4gIF9zZXREcmFnSWNvbiAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbicpO1xuICAgIHRoaXMuc2V0SWNvbihkcmFnSWNvbik7XG4gIH0sXG4gIGlzUGxhaW4gKCkge1xuICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWRpdi1pY29uJykgfHwgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgfSxcbiAgX29uY2VDbGljayAoKSB7XG4gICAgaWYgKHRoaXMuX2lzRmlyc3QpIHtcbiAgICAgIHRoaXMub25jZSgnY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG5cbiAgICAgICAgaWYgKG1Hcm91cC5fbWFya2Vycy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgdGhpcy5fb25jZUNsaWNrKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhdGxuZyA9IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgICAgIHZhciBoYXNJbnRlcnNlY3Rpb24gPSBtR3JvdXAuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZyk7XG5cbiAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgIG1hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgICAgICAgdGhpcy5fb25jZUNsaWNrKCk7IC8vIGJpbmQgJ29uY2UnIGFnYWluIHVudGlsIGhhcyBpbnRlcnNlY3Rpb25cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9pc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5zZXRJY29uKGljb24pO1xuICAgICAgICAgIC8vbUdyb3VwLnNldFNlbGVjdGVkKHRoaXMpO1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6am9pbl9wYXRoJywge21Hcm91cDogbUdyb3VwfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgX2JpbmRDb21tb25FdmVudHMgKCkge1xuICAgIHRoaXMub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcblxuICAgICAgaWYgKG1Hcm91cC5oYXNGaXJzdE1hcmtlcigpICYmIHRoaXMgIT09IG1Hcm91cC5nZXRGaXJzdCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSAmJiB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uKHRoaXMuZ2V0TGF0TG5nKCksIHRydWUpKSB7XG4gICAgICAgIG1hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgICAgbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBtR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG5cbiAgICAgIGlmIChtR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZEluR3JvdXAoKSkge1xuICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9BZGROZXdFZGdlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7IC8vYWRkIGVkZ2VcbiAgICAgICAgbUdyb3VwLnNldE1pZGRsZU1hcmtlcnModGhpcy5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX3Jlc2V0SWNvbihpY29uKTtcbiAgICAgICAgbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcyk7XG4gICAgICB9IGVsc2UgeyAvL3JlbW92ZSBlZGdlXG4gICAgICAgIGlmICghbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpICYmICFkcmFnZW5kKSB7XG4gICAgICAgICAgbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuXG4gICAgICAgICAgdmFyIHJzbHRJbnRlcnNlY3Rpb24gPSB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oe3RhcmdldDoge19sYXRsbmc6IG1Hcm91cC5fZ2V0TWlkZGxlTGF0TG5nKHRoaXMucHJldigpLCB0aGlzLm5leHQoKSl9fSk7XG5cbiAgICAgICAgICBpZiAocnNsdEludGVyc2VjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5yZXNldFN0eWxlKCk7XG4gICAgICAgICAgICBtYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcihtYXAub3B0aW9ucy50ZXh0LmRlbGV0ZVBvaW50SW50ZXJzZWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZpZXdFcnJvckxpbmUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgb2xkTGF0TG5nID0gdGhpcy5nZXRMYXRMbmcoKTtcblxuICAgICAgICAgIHZhciBuZXh0TWFya2VyID0gdGhpcy5uZXh0KCk7XG4gICAgICAgICAgbUdyb3VwLnJlbW92ZU1hcmtlcih0aGlzKTtcblxuICAgICAgICAgIGlmICghbUdyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgdmFyIG5ld0xhdExuZyA9IG5leHRNYXJrZXIuX3ByZXYuZ2V0TGF0TG5nKCk7XG5cbiAgICAgICAgICAgIGlmIChuZXdMYXRMbmcubGF0ID09PSBvbGRMYXRMbmcubGF0ICYmIG5ld0xhdExuZy5sbmcgPT09IG9sZExhdExuZy5sbmcpIHtcbiAgICAgICAgICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbUdyb3VwLnNldFNlbGVjdGVkKG5leHRNYXJrZXIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX21Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICBpZiAodGhpcy5fbUdyb3VwLmdldExheWVycygpLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6Zmlyc3RfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcyA9PT0gdGhpcy5fbUdyb3VwLl9sYXN0TWFya2VyKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZEluR3JvdXAoKSkge1xuICAgICAgICAgIGlmICh0aGlzLmlzTWlkZGxlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bm90X3NlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfbW91c2VvdXQnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX29uY2VDbGljaygpO1xuXG4gICAgdGhpcy5vbignZGJsY2xpY2snLCAoKSA9PiB7XG4gICAgICB2YXIgbUdyb3VwID0gdGhpcy5fbUdyb3VwO1xuICAgICAgaWYgKG1Hcm91cCAmJiBtR3JvdXAuZ2V0Rmlyc3QoKSAmJiBtR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IG1Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICAgIG1Hcm91cC5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2RyYWcnLCAoZSkgPT4ge1xuICAgICAgdmFyIG1hcmtlciA9IGUudGFyZ2V0O1xuXG4gICAgICBtYXJrZXIuY2hhbmdlUHJldk5leHRQb3MoKTtcblxuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcblxuICAgICAgdGhpcy5fc2V0RHJhZ0ljb24oKTtcblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkcmFnX21hcmtlcicsIHttYXJrZXI6IHRoaXN9KTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2RyYWdlbmQnLCAoKSA9PiB7XG5cbiAgICAgIHRoaXMuX21Hcm91cC5zZWxlY3QoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6ZHJhZ2VuZF9tYXJrZXInLCB7bWFya2VyOiB0aGlzfSk7XG5cbiAgICAgIGRyYWdlbmQgPSB0cnVlO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGRyYWdlbmQgPSBmYWxzZTtcbiAgICAgIH0sIDIwMCk7XG5cbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgIH0pO1xuICB9LFxuICBfaXNJbnNpZGVIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmdldExheWVycygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBob2xlID0gaG9sZXNbaV07XG4gICAgICBpZiAodGhpcy5fbUdyb3VwICE9PSBob2xlKSB7XG4gICAgICAgIGlmIChob2xlLl9pc01hcmtlckluUG9seWdvbih0aGlzLmdldExhdExuZygpKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2lzT3V0c2lkZU9mUG9seWdvbiAocG9seWdvbikge1xuICAgIHJldHVybiAhcG9seWdvbi5faXNNYXJrZXJJblBvbHlnb24odGhpcy5nZXRMYXRMbmcoKSk7XG4gIH0sXG4gIF9kZXRlY3RJbnRlcnNlY3Rpb24gKGUpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGxhdGxuZyA9IChlID09PSB1bmRlZmluZWQpID8gdGhpcy5nZXRMYXRMbmcoKSA6IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgdmFyIGlzT3V0c2lkZU9mUG9seWdvbiA9IGZhbHNlO1xuICAgIHZhciBpc0luc2lkZU9mSG9sZSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgaXNPdXRzaWRlT2ZQb2x5Z29uID0gdGhpcy5faXNPdXRzaWRlT2ZQb2x5Z29uKG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgICAgaXNJbnNpZGVPZkhvbGUgPSB0aGlzLl9pc0luc2lkZUhvbGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNJbnNpZGVPZkhvbGUgPSB0aGlzLl9pc0luc2lkZUhvbGUoKTtcbiAgICB9XG5cbiAgICB2YXIgcnNsdCA9IGlzSW5zaWRlT2ZIb2xlIHx8IGlzT3V0c2lkZU9mUG9seWdvbiB8fCB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZykgfHwgdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzKGUpO1xuXG4gICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdCk7XG4gICAgaWYgKHJzbHQpIHtcbiAgICAgIHRoaXMuX21hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcC5lZGdlc0ludGVyc2VjdGVkKCk7XG4gIH0sXG4gIF9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMgKGUpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwLCBoYXNJbnRlcnNlY3Rpb24gPSBmYWxzZSwgaG9sZSwgbGF0bG5nID0gKGUgPT09IHVuZGVmaW5lZCkgPyB0aGlzLmdldExhdExuZygpIDogZS50YXJnZXQuX2xhdGxuZztcbiAgICB2YXIgaG9sZXMgPSBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgdmFyIHByZXZQb2ludCA9IHRoaXMucHJldigpO1xuICAgIHZhciBuZXh0UG9pbnQgPSB0aGlzLm5leHQoKTtcblxuICAgIGlmIChwcmV2UG9pbnQgPT0gbnVsbCAmJiBuZXh0UG9pbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWNvbmRQb2ludCA9IHByZXZQb2ludC5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbGFzdFBvaW50ID0gbmV4dFBvaW50LmdldExhdExuZygpO1xuICAgIHZhciBsYXllcnMsIHRtcEFycmF5ID0gW107XG5cbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaG9sZSA9IGhvbGVzW2ldO1xuICAgICAgICBpZiAoaG9sZSAhPT0gdGhpcy5fbUdyb3VwKSB7XG4gICAgICAgICAgaGFzSW50ZXJzZWN0aW9uID0gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBob2xlKTtcbiAgICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBjaGVjayB0aGF0IGhvbGUgaXMgaW5zaWRlIG9mIG90aGVyIGhvbGVcbiAgICAgICAgICB0bXBBcnJheSA9IFtdO1xuICAgICAgICAgIGxheWVycyA9IGhvbGUuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgICAgICBsYXllcnMuX2VhY2goKGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbUdyb3VwLl9pc01hcmtlckluUG9seWdvbihsYXllci5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICAgICAgdG1wQXJyYXkucHVzaChcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICh0bXBBcnJheS5sZW5ndGggPT09IGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgZU1hcmtlcnNHcm91cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9sZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFzSW50ZXJzZWN0aW9uID0gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBob2xlc1tpXSk7XG5cbiAgICAgICAgLy8gY2hlY2sgdGhhdCBob2xlIGlzIG91dHNpZGUgb2YgcG9seWdvblxuICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRtcEFycmF5ID0gW107XG4gICAgICAgIGxheWVycyA9IGhvbGVzW2ldLmdldExheWVycygpO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChsYXllcnNbal0uX2lzT3V0c2lkZU9mUG9seWdvbihlTWFya2Vyc0dyb3VwKSkge1xuICAgICAgICAgICAgdG1wQXJyYXkucHVzaChcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRtcEFycmF5Lmxlbmd0aCA9PT0gbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLk1hcmtlci5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgdGhpcy5vbignZHJhZ3N0YXJ0JywgKGUpID0+IHtcbiAgICAgIHRoaXMuX21Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgIHRoaXMuX29sZExhdExuZ1N0YXRlID0gZS50YXJnZXQuX2xhdGxuZztcblxuICAgICAgaWYgKHRoaXMuX3ByZXYuaXNQbGFpbigpKSB7XG4gICAgICAgIHRoaXMuX21Hcm91cC5zZXRNaWRkbGVNYXJrZXJzKHRoaXMucG9zaXRpb24pO1xuICAgICAgICAvL3RoaXMuc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICAgIH1cblxuICAgIH0pLm9uKCdkcmFnJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX29uRHJhZyhlKTtcbiAgICB9KS5vbignZHJhZ2VuZCcsIChlKSA9PiB7XG4gICAgICB0aGlzLl9vbkRyYWdFbmQoZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZWRvd24nLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZHJhZ2dpbmcuX2VuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fYmluZENvbW1vbkV2ZW50cyhtYXApO1xuICB9LFxuICBfb25EcmFnIChlKSB7XG4gICAgdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKGUpO1xuICB9LFxuICBfb25EcmFnRW5kIChlKSB7XG4gICAgdmFyIHJzbHQgPSB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oZSk7XG4gICAgaWYgKHJzbHQgJiYgIXRoaXMuX21hcC5vcHRpb25zLmFsbG93Q29ycmVjdEludGVyc2VjdGlvbikge1xuICAgICAgdGhpcy5fcmVzdG9yZU9sZFBvc2l0aW9uKCk7XG4gICAgfVxuICB9LFxuICAvL3RvZG86IGNvbnRpbnVlIHdpdGggb3B0aW9uICdhbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb24nXG4gIF9yZXN0b3JlT2xkUG9zaXRpb24gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKG1hcC5lZGdlc0ludGVyc2VjdGVkKCkpIHtcbiAgICAgIGxldCBzdGF0ZUxhdExuZyA9IHRoaXMuX29sZExhdExuZ1N0YXRlO1xuICAgICAgdGhpcy5zZXRMYXRMbmcoTC5sYXRMbmcoc3RhdGVMYXRMbmcubGF0LCBzdGF0ZUxhdExuZy5sbmcpKTtcblxuICAgICAgdGhpcy5jaGFuZ2VQcmV2TmV4dFBvcygpO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgICAgLy9cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZHJhZ19tYXJrZXInLCB7bWFya2VyOiB0aGlzfSk7XG5cbiAgICAgIHRoaXMuX29sZExhdExuZ1N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5yZXNldFN0eWxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX29sZExhdExuZ1N0YXRlID0gdGhpcy5nZXRMYXRMbmcoKTtcbiAgICB9XG4gIH0sXG4gIF9hbmltYXRlWm9vbSAob3B0KSB7XG4gICAgaWYgKHRoaXMuX21hcCkge1xuICAgICAgdmFyIHBvcyA9IHRoaXMuX21hcC5fbGF0TG5nVG9OZXdMYXllclBvaW50KHRoaXMuX2xhdGxuZywgb3B0Lnpvb20sIG9wdC5jZW50ZXIpLnJvdW5kKCk7XG5cbiAgICAgIHRoaXMuX3NldFBvcyhwb3MpO1xuICAgIH1cbiAgfSxcbiAgcmVzZXRJY29uICgpIHtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ20tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvbicpO1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnbS1lZGl0b3ItZGl2LWljb24tZHJhZycpO1xuICB9LFxuICB1blNlbGVjdEljb25Jbkdyb3VwICgpIHtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIF9zZWxlY3RJY29uSW5Hcm91cCAoKSB7XG4gICAgaWYgKCF0aGlzLmlzTWlkZGxlKCkpIHtcbiAgICAgIHRoaXMuX2FkZEljb25DbGFzcygnbS1lZGl0b3ItZGl2LWljb24nKTtcbiAgICB9XG4gICAgdGhpcy5fYWRkSWNvbkNsYXNzKCdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBzZWxlY3RJY29uSW5Hcm91cCAoKSB7XG4gICAgaWYgKHRoaXMuX3ByZXYpIHtcbiAgICAgIHRoaXMuX3ByZXYuX3NlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuICAgIHRoaXMuX3NlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgaWYgKHRoaXMuX25leHQpIHtcbiAgICAgIHRoaXMuX25leHQuX3NlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuICB9LFxuICBpc1NlbGVjdGVkSW5Hcm91cCAoKSB7XG4gICAgcmV0dXJuIEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuXG4gICAgTC5NYXJrZXIucHJvdG90eXBlLm9uUmVtb3ZlLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgX2Vycm9yTGluZXM6IFtdLFxuICBfcHJldkVycm9yTGluZTogbnVsbCxcbiAgX25leHRFcnJvckxpbmU6IG51bGwsXG4gIF9kcmF3RXJyb3JMaW5lcyAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB0aGlzLl9jbGVhckVycm9yTGluZXMoKTtcblxuICAgIHZhciBjdXJyUG9pbnQgPSB0aGlzLmdldExhdExuZygpO1xuICAgIHZhciBwcmV2UG9pbnRzID0gW3RoaXMucHJldigpLmdldExhdExuZygpLCBjdXJyUG9pbnRdO1xuICAgIHZhciBuZXh0UG9pbnRzID0gW3RoaXMubmV4dCgpLmdldExhdExuZygpLCBjdXJyUG9pbnRdO1xuXG4gICAgdmFyIGVycm9yTGluZVN0eWxlID0gdGhpcy5fbWFwLm9wdGlvbnMuZXJyb3JMaW5lU3R5bGU7XG5cbiAgICB0aGlzLl9wcmV2RXJyb3JMaW5lID0gbmV3IEwuUG9seWxpbmUocHJldlBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuICAgIHRoaXMuX25leHRFcnJvckxpbmUgPSBuZXcgTC5Qb2x5bGluZShuZXh0UG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG5cbiAgICB0aGlzLl9wcmV2RXJyb3JMaW5lLmFkZFRvKG1hcCk7XG4gICAgdGhpcy5fbmV4dEVycm9yTGluZS5hZGRUbyhtYXApO1xuXG4gICAgdGhpcy5fZXJyb3JMaW5lcy5wdXNoKHRoaXMuX3ByZXZFcnJvckxpbmUpO1xuICAgIHRoaXMuX2Vycm9yTGluZXMucHVzaCh0aGlzLl9uZXh0RXJyb3JMaW5lKTtcbiAgfSxcbiAgX2NsZWFyRXJyb3JMaW5lcyAoKSB7XG4gICAgdGhpcy5fZXJyb3JMaW5lcy5fZWFjaCgobGluZSkgPT4gdGhpcy5fbWFwLnJlbW92ZUxheWVyKGxpbmUpKTtcbiAgfSxcbiAgc2V0SW50ZXJzZWN0ZWRTdHlsZSAoKSB7XG4gICAgdGhpcy5fc2V0SW50ZXJzZWN0aW9uSWNvbigpO1xuXG4gICAgLy9zaG93IGludGVyc2VjdGVkIGxpbmVzXG4gICAgdGhpcy5fZHJhd0Vycm9yTGluZXMoKTtcbiAgfSxcbiAgcmVzZXRTdHlsZSAoKSB7XG4gICAgdGhpcy5yZXNldEljb24oKTtcbiAgICB0aGlzLnNlbGVjdEljb25Jbkdyb3VwKCk7XG5cbiAgICBpZiAodGhpcy5fcHJldkludGVyc2VjdGVkKSB7XG4gICAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQucmVzZXRJY29uKCk7XG4gICAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQuc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbmV4dEludGVyc2VjdGVkKSB7XG4gICAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQucmVzZXRJY29uKCk7XG4gICAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQuc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQgPSBudWxsO1xuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZCA9IG51bGw7XG5cbiAgICAvL2hpZGUgaW50ZXJzZWN0ZWQgbGluZXNcbiAgICB0aGlzLl9jbGVhckVycm9yTGluZXMoKTtcbiAgfSxcbiAgX3ByZXZpZXdFckxpbmU6IG51bGwsXG4gIF9wdDogbnVsbCxcbiAgX3ByZXZpZXdFcnJvckxpbmUgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2aWV3RXJMaW5lKSB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIodGhpcy5fcHJldmlld0VyTGluZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3B0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcHQpO1xuICAgIH1cblxuICAgIHZhciBwb2ludHMgPSBbdGhpcy5uZXh0KCkuZ2V0TGF0TG5nKCksIHRoaXMucHJldigpLmdldExhdExuZygpXTtcblxuICAgIHZhciBlcnJvckxpbmVTdHlsZSA9IHRoaXMuX21hcC5vcHRpb25zLnByZXZpZXdFcnJvckxpbmVTdHlsZTtcblxuICAgIHRoaXMuX3ByZXZpZXdFckxpbmUgPSBuZXcgTC5Qb2x5bGluZShwb2ludHMsIGVycm9yTGluZVN0eWxlKTtcblxuICAgIHRoaXMuX3ByZXZpZXdFckxpbmUuYWRkVG8odGhpcy5fbWFwKTtcblxuICAgIHRoaXMuX3B0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIodGhpcy5fcHJldmlld0VyTGluZSk7XG4gICAgfSwgOTAwKTtcbiAgfVxufSk7IiwiaW1wb3J0IEV4dGVuZGVkUG9seWdvbiBmcm9tICcuLi9leHRlbmRlZC9Qb2x5Z29uJztcbmltcG9ydCBUb29sdGlwIGZyb20gJy4uL2V4dGVuZGVkL1Rvb2x0aXAnO1xuXG5leHBvcnQgZGVmYXVsdCBMLkVkaXRQbG95Z29uID0gRXh0ZW5kZWRQb2x5Z29uLmV4dGVuZCh7XG4gIF9vbGRFOiB1bmRlZmluZWQsIC8vIHRvIHJldXNlIGV2ZW50IG9iamVjdCBhZnRlciBcImJhZCBob2xlXCIgcmVtb3ZpbmcgdG8gYnVpbGQgbmV3IGhvbGVcbiAgX2s6IDEsIC8vIHRvIGRlY3JlYXNlICdkaWZmJyB2YWx1ZSB3aGljaCBoZWxwcyBidWlsZCBhIGhvbGVcbiAgX2hvbGVzOiBbXSxcbiAgaW5pdGlhbGl6ZSAobGF0bG5ncywgb3B0aW9ucykge1xuICAgIEwuUG9seWxpbmUucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmdzLCBvcHRpb25zKTtcbiAgICB0aGlzLl9pbml0V2l0aEhvbGVzKGxhdGxuZ3MpO1xuXG4gICAgdGhpcy5vcHRpb25zLmNsYXNzTmFtZSA9IFwibGVhZmxldC1jbGlja2FibGUgcG9seWdvblwiO1xuICB9LFxuICBfdXBkYXRlIChlKSB7XG4gICAgdmFyIG1hcmtlciA9IGUubWFya2VyO1xuXG4gICAgaWYgKG1hcmtlci5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIHZhciBtYXJrZXJzID0gbWFya2VyLl9tR3JvdXAuX21hcmtlcnM7XG4gICAgICBtYXJrZXJzID0gbWFya2Vycy5maWx0ZXIoKG1hcmtlcikgPT4gIW1hcmtlci5pc01pZGRsZSgpKTtcbiAgICAgIHRoaXMuX2hvbGVzW21hcmtlci5fbUdyb3VwLnBvc2l0aW9uXSA9IG1hcmtlcnMubWFwKChtYXJrZXIpID0+IG1hcmtlci5nZXRMYXRMbmcoKSk7XG5cbiAgICB9XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgX3JlbW92ZUhvbGUgKGUpIHtcbiAgICB2YXIgaG9sZVBvc2l0aW9uID0gZS5tYXJrZXIuX21Hcm91cC5wb3NpdGlvbjtcbiAgICB0aGlzLl9ob2xlcy5zcGxpY2UoaG9sZVBvc2l0aW9uLCAxKTtcblxuICAgIHRoaXMuX21hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlbW92ZUxheWVyKGUubWFya2VyLl9tR3JvdXAuX2xlYWZsZXRfaWQpO1xuICAgIHRoaXMuX21hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlcG9zKGUubWFya2VyLl9tR3JvdXAucG9zaXRpb24pO1xuXG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIEwuUG9seWxpbmUucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjphZGRfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6YWRkX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkcmFnX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmRyYWdfbWFya2VyJywgKGUpID0+IHRoaXMuX3VwZGF0ZShlKSk7XG4gICAgbWFwLm9mZignZWRpdG9yOmRlbGV0ZV9tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfbWFya2VyJywgKGUpID0+IHRoaXMuX3VwZGF0ZShlKSk7XG4gICAgbWFwLm9mZignZWRpdG9yOmRlbGV0ZV9ob2xlJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCAoZSkgPT4gdGhpcy5fcmVtb3ZlSG9sZShlKSk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICBpZiAobWFwLmdldEVNYXJrZXJzR3JvdXAoKS5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICB9KTtcbiAgICB0aGlzLm9uKCdtb3VzZW91dCcsICgpID0+IG1hcC5maXJlKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3V0JykpO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3ZlcicpO1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuXG4gICAgbWFwLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3V0Jyk7XG5cbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gIH0sXG4gIGFkZEhvbGUgKGhvbGUpIHtcbiAgICB0aGlzLl9ob2xlcyA9IHRoaXMuX2hvbGVzIHx8IFtdO1xuICAgIHRoaXMuX2hvbGVzLnB1c2goaG9sZSk7XG5cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBfcmVzZXRMYXN0SG9sZSAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIG1hcC5nZXRTZWxlY3RlZE1hcmtlcigpLnJlbW92ZUhvbGUoKTtcblxuICAgIGlmICh0aGlzLl9rID4gMC4wMDEpIHtcbiAgICAgIHRoaXMuX2FkZEhvbGUodGhpcy5fb2xkRSwgMC41KTtcbiAgICB9XG4gIH0sXG4gIGNoZWNrSG9sZUludGVyc2VjdGlvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbiB8fCBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBlSE1hcmtlcnNHcm91cExheWVycyA9IHRoaXMuX21hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmdldExheWVycygpO1xuICAgIHZhciBsYXN0SG9sZSA9IGVITWFya2Vyc0dyb3VwTGF5ZXJzW2VITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDFdO1xuICAgIHZhciBsYXN0SG9sZUxheWVycyA9IGVITWFya2Vyc0dyb3VwTGF5ZXJzW2VITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDFdLmdldExheWVycygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SG9sZUxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGxheWVyID0gbGFzdEhvbGVMYXllcnNbaV07XG5cbiAgICAgIGlmIChsYXllci5fZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzKCkpIHtcbiAgICAgICAgdGhpcy5fcmVzZXRMYXN0SG9sZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGxheWVyLl9pc091dHNpZGVPZlBvbHlnb24odGhpcy5fbWFwLmdldEVNYXJrZXJzR3JvdXAoKSkpIHtcbiAgICAgICAgdGhpcy5fcmVzZXRMYXN0SG9sZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlSE1hcmtlcnNHcm91cExheWVycy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgZUhvbGVNYXJrZXJHcm91cExheWVyID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbal07XG5cbiAgICAgICAgaWYgKGxhc3RIb2xlICE9PSBlSG9sZU1hcmtlckdyb3VwTGF5ZXIgJiYgZUhvbGVNYXJrZXJHcm91cExheWVyLl9pc01hcmtlckluUG9seWdvbihsYXllci5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pOyIsImltcG9ydCBNYXJrZXIgZnJvbSAnLi4vZWRpdC9tYXJrZXInO1xuaW1wb3J0IHNvcnQgZnJvbSAnLi4vdXRpbHMvc29ydEJ5UG9zaXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBMLkNsYXNzLmV4dGVuZCh7XG4gIGluY2x1ZGVzOiBMLk1peGluLkV2ZW50cyxcblxuICBfc2VsZWN0ZWQ6IGZhbHNlLFxuICBfbGFzdE1hcmtlcjogdW5kZWZpbmVkLFxuICBfZmlyc3RNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX3Bvc2l0aW9uSGFzaDogdW5kZWZpbmVkLFxuICBfbGFzdFBvc2l0aW9uOiAwLFxuICBfbWFya2VyczogW10sXG4gIG9uQWRkIChtYXApIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgIC8vTC5MYXllckdyb3VwLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICAvL0wuTGF5ZXJHcm91cC5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcbiAgfSxcbiAgY2xlYXJMYXllcnMgKCkge1xuICAgIHRoaXMuX21hcmtlcnMuZm9yRWFjaCgobWFya2VyKSA9PiB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIobWFya2VyKTtcbiAgICB9KTtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gIH0sXG4gIGFkZFRvIChtYXApIHtcbiAgICBtYXAuYWRkTGF5ZXIodGhpcyk7XG4gIH0sXG4gIGFkZExheWVyIChtYXJrZXIpIHtcbiAgICB0aGlzLl9tYXAuYWRkTGF5ZXIobWFya2VyKTtcbiAgICB0aGlzLl9tYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgICBpZiAobWFya2VyLnBvc2l0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX21hcmtlcnMubW92ZSh0aGlzLl9tYXJrZXJzLmxlbmd0aCAtIDEsIG1hcmtlci5wb3NpdGlvbik7XG4gICAgfVxuICAgIG1hcmtlci5wb3NpdGlvbiA9IChtYXJrZXIucG9zaXRpb24gIT0gbnVsbCkgPyBtYXJrZXIucG9zaXRpb24gOiB0aGlzLl9tYXJrZXJzLmxlbmd0aCAtIDE7XG4gIH0sXG4gIHJlbW92ZSAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLmdldExheWVycygpO1xuICAgIG1hcmtlcnMuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgd2hpbGUgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VyKG1hcmtlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIG1hcC5nZXRWR3JvdXAoKS5yZW1vdmVMYXllcihtYXAuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlTGF5ZXIgKG1hcmtlcikge1xuICAgIHZhciBwb3NpdGlvbiA9IG1hcmtlci5wb3NpdGlvbjtcbiAgICB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIobWFya2VyKTtcbiAgICB0aGlzLl9tYXJrZXJzLnNwbGljZShwb3NpdGlvbiwgMSk7XG4gIH0sXG4gIGdldExheWVycyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmtlcnM7XG4gIH0sXG4gIGVhY2hMYXllciAoY2IpIHtcbiAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2goY2IpO1xuICB9LFxuICBtYXJrZXJBdCAocG9zaXRpb24pIHtcbiAgICB2YXIgcnNsdCA9IHRoaXMuX21hcmtlcnNbcG9zaXRpb25dO1xuXG4gICAgaWYgKHBvc2l0aW9uIDwgMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlyc3RNYXJrZXIoKTtcbiAgICB9XG5cbiAgICBpZiAocnNsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByc2x0ID0gdGhpcy5sYXN0TWFya2VyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJzbHQ7XG4gIH0sXG4gIGZpcnN0TWFya2VyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2Vyc1swXTtcbiAgfSxcbiAgbGFzdE1hcmtlciAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuICAgIHJldHVybiBtYXJrZXJzW21hcmtlcnMubGVuZ3RoIC0gMV07XG4gIH0sXG4gIHJlbW92ZU1hcmtlciAobWFya2VyKSB7XG4gICAgdmFyIGIgPSAhbWFya2VyLmlzTWlkZGxlKCk7XG5cbiAgICB2YXIgcHJldk1hcmtlciA9IG1hcmtlci5fcHJldjtcbiAgICB2YXIgbmV4dE1hcmtlciA9IG1hcmtlci5fbmV4dDtcbiAgICB2YXIgbmV4dG5leHRNYXJrZXIgPSBtYXJrZXIuX25leHQuX25leHQ7XG4gICAgdGhpcy5yZW1vdmVNYXJrZXJBdChtYXJrZXIucG9zaXRpb24pO1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQocHJldk1hcmtlci5wb3NpdGlvbik7XG4gICAgdGhpcy5yZW1vdmVNYXJrZXJBdChuZXh0TWFya2VyLnBvc2l0aW9uKTtcblxuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnNldE1pZGRsZU1hcmtlcihuZXh0bmV4dE1hcmtlci5wb3NpdGlvbik7XG5cbiAgICAgIGlmIChiKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsIHttYXJrZXI6IG1hcmtlcn0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5faXNIb2xlKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcC5yZW1vdmVQb2x5Z29uKG1hcC5nZXRFUG9seWdvbigpKTtcblxuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJyk7XG4gICAgICB9XG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlTWFya2VyQXQgKHBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hcmtlcjtcbiAgICBpZiAodHlwZW9mIHBvc2l0aW9uID09PSAnbnVtYmVyJykge1xuICAgICAgbWFya2VyID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgX2NoYW5nZVBvcyA9IGZhbHNlO1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcbiAgICBtYXJrZXJzLmZvckVhY2goKF9tYXJrZXIpID0+IHtcbiAgICAgIGlmIChfY2hhbmdlUG9zKSB7XG4gICAgICAgIF9tYXJrZXIucG9zaXRpb24gPSAoX21hcmtlci5wb3NpdGlvbiA9PT0gMCkgPyAwIDogX21hcmtlci5wb3NpdGlvbiAtIDE7XG4gICAgICB9XG4gICAgICBpZiAoX21hcmtlciA9PT0gbWFya2VyKSB7XG4gICAgICAgIG1hcmtlci5fcHJldi5fbmV4dCA9IG1hcmtlci5fbmV4dDtcbiAgICAgICAgbWFya2VyLl9uZXh0Ll9wcmV2ID0gbWFya2VyLl9wcmV2O1xuICAgICAgICBfY2hhbmdlUG9zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVtb3ZlTGF5ZXIobWFya2VyKTtcblxuICAgIGlmIChtYXJrZXJzLmxlbmd0aCA8IDUpIHtcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgICAgIG1hcC5nZXRWR3JvdXAoKS5yZW1vdmVMYXllcihtYXAuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYWRkTWFya2VyIChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKSB7XG4gICAgLy8gMS4gcmVjYWxjdWxhdGUgcG9zaXRpb25zXG4gICAgaWYgKHR5cGVvZiBsYXRsbmcgPT09ICdudW1iZXInKSB7XG4gICAgICBwb3NpdGlvbiA9IHRoaXMubWFya2VyQXQobGF0bG5nKS5wb3NpdGlvbjtcbiAgICAgIHRoaXMuX3JlY2FsY1Bvc2l0aW9ucyhwb3NpdGlvbik7XG5cbiAgICAgIHZhciBwcmV2TWFya2VyID0gKHBvc2l0aW9uIC0gMSkgPCAwID8gdGhpcy5sYXN0TWFya2VyKCkgOiB0aGlzLm1hcmtlckF0KHBvc2l0aW9uIC0gMSk7XG4gICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubWFya2VyQXQoKHBvc2l0aW9uID09IC0xKSA/IDEgOiBwb3NpdGlvbik7XG4gICAgICBsYXRsbmcgPSB0aGlzLl9nZXRNaWRkbGVMYXRMbmcocHJldk1hcmtlciwgbmV4dE1hcmtlcik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICBvcHRpb25zLmRyYWdnYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldEZpcnN0KCkpIHtcbiAgICAgIG9wdGlvbnMuZHJhZ2dhYmxlID0gIXRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCk7XG4gICAgfVxuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBNYXJrZXIodGhpcywgbGF0bG5nLCBvcHRpb25zKTtcbiAgICBpZiAoIXRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICB0aGlzLl9maXJzdE1hcmtlciA9IG1hcmtlcjtcbiAgICAgIHRoaXMuX2xhc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vaWYgKHRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAvLyAgbWFya2VyLmRyYWdnaW5nLmRpc2FibGUoKTtcbiAgICAvL30gZWxzZSB7XG4gICAgLy8gIG1hcmtlci5kcmFnZ2luZy5lbmFibGUoKTtcbiAgICAvL31cblxuICAgIHRoaXMuYWRkTGF5ZXIobWFya2VyKTtcblxuICAgIHtcbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IChtYXJrZXIucG9zaXRpb24gIT09IHVuZGVmaW5lZCApID8gbWFya2VyLnBvc2l0aW9uIDogdGhpcy5fbGFzdFBvc2l0aW9uKys7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9sYXN0TWFya2VyO1xuICAgICAgdGhpcy5fZmlyc3RNYXJrZXIuX3ByZXYgPSBtYXJrZXI7XG4gICAgICBpZiAobWFya2VyLl9wcmV2KSB7XG4gICAgICAgIHRoaXMuX2xhc3RNYXJrZXIuX25leHQgPSBtYXJrZXI7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2ZpcnN0TWFya2VyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9sYXN0TWFya2VyID0gbWFya2VyO1xuICAgIH1cblxuICAgIC8vIDIuIHJlY2FsY3VsYXRlIHJlbGF0aW9uc1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9yZWNhbGNSZWxhdGlvbnMobWFya2VyKTtcbiAgICB9XG4gICAgLy8gMy4gdHJpZ2dlciBldmVudFxuICAgIGlmICghbWFya2VyLmlzTWlkZGxlKCkpIHtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6YWRkX21hcmtlcicsIHttYXJrZXI6IG1hcmtlcn0pO1xuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIGNsZWFyICgpIHtcbiAgICB2YXIgaWRzID0gdGhpcy5faWRzKCk7XG5cbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICBpZHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIHRoaXMuX2RlbGV0ZUV2ZW50cyhpZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSAwO1xuXG4gICAgdGhpcy5fZmlyc3RNYXJrZXIgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIF9kZWxldGVFdmVudHMgKGlkKSB7XG4gICAgZGVsZXRlIHRoaXMuX21hcC5fbGVhZmxldF9ldmVudHMudmlld3Jlc2V0X2lkeFtpZF07XG4gICAgZGVsZXRlIHRoaXMuX21hcC5fbGVhZmxldF9ldmVudHMuem9vbWFuaW1faWR4W2lkXTtcbiAgfSxcbiAgX2dldE1pZGRsZUxhdExuZyAobWFya2VyMSwgbWFya2VyMikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXAsXG4gICAgICBwMSA9IG1hcC5wcm9qZWN0KG1hcmtlcjEuZ2V0TGF0TG5nKCkpLFxuICAgICAgcDIgPSBtYXAucHJvamVjdChtYXJrZXIyLmdldExhdExuZygpKTtcblxuICAgIHJldHVybiBtYXAudW5wcm9qZWN0KHAxLl9hZGQocDIpLl9kaXZpZGVCeSgyKSk7XG4gIH0sXG4gIF9yZWNhbGNQb3NpdGlvbnMgKHBvc2l0aW9uKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuXG4gICAgdmFyIGNoYW5nZVBvcyA9IGZhbHNlO1xuICAgIG1hcmtlcnMuZm9yRWFjaCgobWFya2VyLCBfcG9zaXRpb24pID0+IHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gX3Bvc2l0aW9uKSB7XG4gICAgICAgIGNoYW5nZVBvcyA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlUG9zKSB7XG4gICAgICAgIHRoaXMuX21hcmtlcnNbX3Bvc2l0aW9uXS5wb3NpdGlvbiArPSAxO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfcmVjYWxjUmVsYXRpb25zICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG5cbiAgICBtYXJrZXJzLmZvckVhY2goKG1hcmtlciwgcG9zaXRpb24pID0+IHtcblxuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiArIDEpO1xuXG4gICAgICAvLyBmaXJzdFxuICAgICAgaWYgKHBvc2l0aW9uID09PSAwKSB7XG4gICAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubGFzdE1hcmtlcigpO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBsYXN0XG4gICAgICBpZiAocG9zaXRpb24gPT09IG1hcmtlcnMubGVuZ3RoIC0gMSkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLm1hcmtlckF0KHBvc2l0aW9uIC0gMSk7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQoMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9pZHMgKCkge1xuICAgIHZhciByc2x0ID0gW107XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLl9sYXllcnMpIHtcbiAgICAgIHJzbHQucHVzaChpZCk7XG4gICAgfVxuXG4gICAgcnNsdC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG5cbiAgICByZXR1cm4gcnNsdDtcbiAgfSxcbiAgc2VsZWN0ICgpIHtcbiAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuX21hcC5fc2VsZWN0ZWRNR3JvdXAgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRTZWxlY3Rpb24oKTtcbiAgICAgIG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkucmVzZXRTZWxlY3Rpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRTZWxlY3Rpb24oKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIG1hcmtlci5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gdHJ1ZTtcblxuICAgIHRoaXMuX21hcC5fc2VsZWN0ZWRNR3JvdXAgPSB0aGlzO1xuICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcpO1xuICB9LFxuICBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH0sXG4gIHJlc2V0U2VsZWN0aW9uICgpIHtcbiAgICB0aGlzLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIG1hcmtlci51blNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgYnRuczogW1xuICAgICAgLy97J3RpdGxlJzogJ3JlbW92ZScsICdjbGFzc05hbWUnOiAnZmEgZmEtdHJhc2gnfVxuICAgIF0sXG4gICAgZXZlbnROYW1lOiBcImNvbnRyb2xBZGRlZFwiXG4gIH0sXG4gIF9idG46IG51bGwsXG4gIHN0b3BFdmVudDogTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24sXG4gIGluaXRpYWxpemUgKG9wdGlvbnMpIHtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgfSxcbiAgX3RpdGxlQ29udGFpbmVyOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgbWFwLm9uKCdidG5QcmVzc2VkJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2J0biAmJiAhTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgdGhpcy5fb25QcmVzc0J0bigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJhciBsZWFmbGV0LWVkaXRvci1idXR0b25zJyk7XG5cbiAgICBtYXAuX2NvbnRyb2xDb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2VsZi5fc2V0QnRuKG9wdGlvbnMuYnRucywgY29udGFpbmVyKTtcbiAgICAgIGlmIChvcHRpb25zLmV2ZW50TmFtZSkge1xuICAgICAgICBtYXAuZmlyZShvcHRpb25zLmV2ZW50TmFtZSwge2NvbnRyb2w6IHNlbGZ9KTtcbiAgICAgIH1cblxuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihzZWxmLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHNlbGYuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCwgdGhpcyk7XG5cbiAgICB9LCAxMDAwKTtcblxuICAgIG1hcC5nZXRCdG5Db250cm9sID0gKCkgPT4gdGhpcztcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHt9LFxuICBfb25Nb3VzZU92ZXIgKCkge30sXG4gIF9vbk1vdXNlT3V0ICgpIHt9LFxuICBfc2V0QnRuIChvcHRzLCBjb250YWluZXIpIHtcbiAgICB2YXIgX2J0bjtcbiAgICBvcHRzLmZvckVhY2goKGJ0biwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gb3B0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGJ0bi5jbGFzc05hbWUgKz0gXCIgbGFzdFwiO1xuICAgICAgfVxuICAgICAgLy92YXIgY2hpbGQgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1idG4nICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKTtcblxuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICdsZWFmbGV0LWJ0bicsIHdyYXBwZXIpO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgICB2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xuICAgICAgTC5Eb21FdmVudFxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuXG4gICAgICBsaW5rLmFwcGVuZENoaWxkKEwuRG9tVXRpbC5jcmVhdGUoJ2knLCAnZmEnICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKSk7XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCBwcmVzc0V2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIG1hcC5maXJlKHByZXNzRXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSh0aGlzLl9tYXAsIGJ0bi5wcmVzc0V2ZW50TmFtZSB8fCAnYnRuUHJlc3NlZCcpKTtcblxuICAgICAgTC5Eb21FdmVudC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgX2J0biA9IGxpbms7XG4gICAgfSk7XG4gICAgdGhpcy5fYnRuID0gX2J0bjtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1sndG9wbGVmdCddO1xuICB9LFxuICBnZXRCdG5BdCAocG9zKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnRuQ29udGFpbmVyKCkuY2hpbGRbcG9zXTtcbiAgfSxcbiAgZGlzYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH0sXG4gIGVuYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH1cbn0pOyIsImltcG9ydCBCdG5DdHJsIGZyb20gJy4vQnRuQ29udHJvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEJ0bkN0cmwuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIGV2ZW50TmFtZTogJ2xvYWRCdG5BZGRlZCdcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb250YWluZXIgPSBCdG5DdHJsLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub24oJ2xvYWRCdG5BZGRlZCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5vbignc2VhcmNoRW5hYmxlZCcsIHRoaXMuX2NvbGxhcHNlLCB0aGlzKTtcblxuICAgICAgdGhpcy5fcmVuZGVyRm9ybShjb250YWluZXIpO1xuICAgIH0pO1xuXG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKGNvbnRhaW5lciwgJ2xvYWQtanNvbi1jb250YWluZXInKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLl90ZXh0YXJlYS5mb2N1cygpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5PcGVuZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuSGlkZGVuJyk7XG4gICAgfVxuICB9LFxuICBfY29sbGFwc2UgKCkge1xuICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl90ZXh0YXJlYS52YWx1ZSA9ICcnO1xuICB9LFxuICBfcmVuZGVyRm9ybSAoY29udGFpbmVyKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gTC5Eb21VdGlsLmNyZWF0ZSgnZm9ybScpO1xuXG4gICAgdmFyIHRleHRhcmVhID0gdGhpcy5fdGV4dGFyZWEgPSBMLkRvbVV0aWwuY3JlYXRlKCd0ZXh0YXJlYScpO1xuICAgIHRleHRhcmVhLnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnO1xuICAgIHRleHRhcmVhLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgd2hpdGUnO1xuICAgIHRleHRhcmVhLnN0eWxlLnBhZGRpbmcgPSAnNXB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNHB4JztcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2NsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2RibGNsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZXdoZWVsJywgdGhpcy5zdG9wRXZlbnQpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cbiAgICB2YXIgc3VibWl0QnRuID0gdGhpcy5fc3VibWl0QnRuID0gTC5Eb21VdGlsLmNyZWF0ZSgnYnV0dG9uJywgJ2xlYWZsZXQtc3VibWl0LWJ0bicpO1xuICAgIHN1Ym1pdEJ0bi50eXBlID0gXCJzdWJtaXRcIjtcbiAgICBzdWJtaXRCdG4uaW5uZXJUZXh0ID0gXCJzdWJtaXRcIjtcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ21vdXNlZG93bicsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ2NsaWNrJywgdGhpcy5fc3VibWl0Rm9ybSwgdGhpcyk7XG5cbiAgICBmb3JtLmFwcGVuZENoaWxkKHN1Ym1pdEJ0bik7XG5cbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gIH0sXG4gIF90aW1lb3V0OiBudWxsLFxuICBfc3VibWl0Rm9ybSAoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KTtcbiAgICB9XG5cbiAgICB2YXIganNvbjtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5wYXJzZSh0aGlzLl90ZXh0YXJlYS52YWx1ZSk7XG5cbiAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0Lmpzb25XYXNMb2FkZWQsIFwic3VjY2Vzc1wiKTtcblxuICAgICAgbWFwLmNyZWF0ZUVkaXRQb2x5Z29uKGpzb24pO1xuXG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH0sIDIwMDApO1xuXG4gICAgICB0aGlzLl9jb2xsYXBzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNoZWNrSnNvbiwgXCJlcnJvclwiKTtcblxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9LCAyMDAwKTtcbiAgICB9XG4gIH0sXG4gIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIubXNnKHRoaXMuX21hcC5vcHRpb25zLnRleHQubG9hZEpzb24pO1xuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAnbXNnY2VudGVyJyxcbiAgICBkZWZhdWx0TXNnOiBudWxsXG4gIH0sXG4gIGluaXRpYWxpemUgKG9wdGlvbnMpIHtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgfSxcbiAgX3RpdGxlQ29udGFpbmVyOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgdmFyIGNvcm5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LXRvcCcpO1xuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1tc2ctZWRpdG9yJyk7XG5cbiAgICBtYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXSA9IGNvcm5lcjtcbiAgICBtYXAuX2NvbnRyb2xDb250YWluZXIuYXBwZW5kQ2hpbGQoY29ybmVyKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29udGFpbmVyKGNvbnRhaW5lciwgbWFwKTtcbiAgICAgIG1hcC5maXJlKCdtc2dIZWxwZXJBZGRlZCcsIHtjb250cm9sOiB0aGlzfSk7XG5cbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH0sIDEwMDApO1xuXG4gICAgbWFwLmdldEJ0bkNvbnRyb2wgPSAoKSA9PiB0aGlzO1xuXG4gICAgdGhpcy5fYmluZEV2ZW50cyhtYXApO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX2NoYW5nZVBvcyAobWFwKSB7XG4gICAgdmFyIGNvbnRyb2xDb3JuZXIgPSBtYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXTtcbiAgICBpZiAoY29udHJvbENvcm5lciAmJiBjb250cm9sQ29ybmVyLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgdmFyIGNoaWxkID0gY29udHJvbENvcm5lci5jaGlsZHJlbi5pdGVtKCkuY2hpbGRyZW5bMF07XG5cbiAgICAgIGlmKCFjaGlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB3aWR0aCA9IGNoaWxkLmNsaWVudFdpZHRoO1xuICAgICAgaWYod2lkdGgpIHtcbiAgICAgICAgY29udHJvbENvcm5lci5zdHlsZS5sZWZ0ID0gKG1hcC5fY29udGFpbmVyLmNsaWVudFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCc7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfYmluZEV2ZW50cyAobWFwKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLl9jaGFuZ2VQb3MobWFwKTtcbiAgICAgIH0pO1xuICAgIH0sIDEpO1xuICB9LFxuICBfc2V0Q29udGFpbmVyIChjb250YWluZXIsIG1hcCkge1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnICE9PSBudWxsKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnO1xuICAgIH1cblxuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLm1zZyA9ICh0ZXh0LCB0eXBlKSA9PiB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRleHQ7XG5cbiAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLScgKyB0eXBlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH07XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5oaWRlID0gKCkgPT4ge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfTtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gIH0sXG4gIGdldEJ0bkF0IChwb3MpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdG5Db250YWluZXIoKS5jaGlsZFtwb3NdO1xuICB9LFxuICBkaXNhYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfSxcbiAgZW5hYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Qb2x5Z29uLmV4dGVuZCh7XG4gIGlzRW1wdHkgKCkge1xuICAgIHZhciBsYXRMbmdzID0gdGhpcy5nZXRMYXRMbmdzKCk7XG4gICAgcmV0dXJuIGxhdExuZ3MgPT09IG51bGwgfHwgbGF0TG5ncyA9PT0gdW5kZWZpbmVkIHx8IChsYXRMbmdzICYmIGxhdExuZ3MubGVuZ3RoID09PSAwKTtcbiAgfSxcbiAgZ2V0SG9sZSAoaG9sZUdyb3VwTnVtYmVyKSB7XG4gICAgaWYgKCEkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdO1xuICB9LFxuICBnZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlcikge1xuICAgIGlmICghJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAhJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXTtcbiAgfSxcbiAgZ2V0SG9sZXMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ob2xlcztcbiAgfSxcbiAgY2xlYXJIb2xlcyAoKSB7XG4gICAgdGhpcy5faG9sZXMgPSBbXTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5jbGVhckhvbGVzKCk7XG5cbiAgICBpZiAoJC5pc0FycmF5KHRoaXMuX2xhdGxuZ3MpICYmIHRoaXMuX2xhdGxuZ3NbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZUhvbGVQb2ludCAoaG9sZUdyb3VwTnVtYmVyLCBob2xlTnVtYmVyLCBsYXRsbmcpIHtcbiAgICBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXSA9IGxhdGxuZztcbiAgICB9IGVsc2UgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgISQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdID0gbGF0bG5nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ob2xlcyA9IGxhdGxuZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHNldEhvbGVzIChsYXRsbmdzKSB7XG4gICAgdGhpcy5faG9sZXMgPSBsYXRsbmdzO1xuICB9LFxuICBzZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlciwgbGF0bG5nKSB7XG4gICAgdmFyIGxheWVyID0gdGhpcy5nZXRMYXllcnMoKVswXTtcbiAgICBpZiAobGF5ZXIpIHtcbiAgICAgIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICAgIGxheWVyLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdW2hvbGVOdW1iZXJdID0gbGF0bG5nO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNsYXNzLmV4dGVuZCh7XG4gIF90aW1lOiAyMDAwLFxuICBpbml0aWFsaXplIChtYXAsIHRleHQsIHRpbWUpIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5fcG9wdXBQYW5lID0gbWFwLl9wYW5lcy5wb3B1cFBhbmU7XG4gICAgdGhpcy5fdGV4dCA9ICcnIHx8IHRleHQ7XG4gICAgdGhpcy5faXNTdGF0aWMgPSBmYWxzZTtcbiAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10b29sdGlwJywgdGhpcy5fcG9wdXBQYW5lKTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgdGhpcy5fdGltZSA9IHRpbWUgfHwgdGhpcy5fdGltZTtcbiAgfSxcblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9wb3B1cFBhbmUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICAgIHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gICdzdGF0aWMnIChpc1N0YXRpYykge1xuICAgIHRoaXMuX2lzU3RhdGljID0gaXNTdGF0aWMgfHwgdGhpcy5faXNTdGF0aWM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9yZW5kZXIgKCkge1xuICAgIHRoaXMuX2NvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxzcGFuPlwiICsgdGhpcy5fdGV4dCArIFwiPC9zcGFuPlwiO1xuICB9LFxuICBfdXBkYXRlUG9zaXRpb24gKGxhdGxuZykge1xuICAgIHZhciBwb3MgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyksXG4gICAgICB0b29sdGlwQ29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xuXG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgdG9vbHRpcENvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2luaGVyaXQnO1xuICAgICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRvb2x0aXBDb250YWluZXIsIHBvcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX3Nob3dFcnJvciAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihsYXRsbmcpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1N0YXRpYykge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9zaG93SW5mbyAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtaW5mby10b29sdGlwJyk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGxhdGxuZyk7XG5cbiAgICBpZiAoIXRoaXMuX2lzU3RhdGljKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX2hpZGUgKCkge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWluZm8tdG9vbHRpcCcpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgdGV4dCAodGV4dCkge1xuICAgIHRoaXMuX3RleHQgPSB0ZXh0IHx8IHRoaXMuX3RleHQ7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH0sXG4gIHNob3cgKGxhdGxuZywgdHlwZSA9ICdpbmZvJykge1xuXG4gICAgdGhpcy50ZXh0KCk7XG5cbiAgICBpZih0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihsYXRsbmcpO1xuICAgIH1cbiAgICBpZih0eXBlID09PSAnaW5mbycpIHtcbiAgICAgIHRoaXMuc2hvd0luZm8obGF0bG5nKTtcbiAgICB9XG4gIH0sXG4gIHNob3dJbmZvIChsYXRsbmcpIHtcbiAgICB0aGlzLl9zaG93SW5mbyhsYXRsbmcpO1xuXG4gICAgaWYgKHRoaXMuX2hpZGVJbmZvVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVJbmZvVGltZW91dCk7XG4gICAgICB0aGlzLl9oaWRlSW5mb1RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVJbmZvVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIHNob3dFcnJvciAobGF0bG5nKSB7XG4gICAgdGhpcy5fc2hvd0Vycm9yKGxhdGxuZyk7XG5cbiAgICBpZiAodGhpcy5faGlkZUVycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVFcnJvclRpbWVvdXQpO1xuICAgICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIGhpZGUgKCkge1xuICAgIHRoaXMuX2hpZGUoKTtcbiAgfSxcbiAgX29uTW91c2VNb3ZlIChlKSB7XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oZS5sYXRsbmcpO1xuICB9LFxuICBzZXRUaW1lICh0aW1lKSB7XG4gICAgaWYgKHRpbWUpIHtcbiAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IEJ0bkN0cmwgZnJvbSAnLi9CdG5Db250cm9sJztcblxuZXhwb3J0IGRlZmF1bHQgQnRuQ3RybC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgZXZlbnROYW1lOiAndHJhc2hBZGRlZCdcbiAgfSxcbiAgX2J0bjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIG1hcC5vbigndHJhc2hBZGRlZCcsIChkYXRhKSA9PiB7XG4gICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoZGF0YS5jb250cm9sLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgICBtYXAub24oJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0JywgdGhpcy5fYmluZEV2ZW50cywgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpzdGFydF9hZGRfbmV3X3BvbHlnb24nLCB0aGlzLl9iaW5kRXZlbnRzLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOnN0YXJ0X2FkZF9uZXdfaG9sZScsIHRoaXMuX2JpbmRFdmVudHMsIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX2NsZWFyJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfcG9seWdvbicsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOm1hcF9jbGVhcmVkJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQnRuQ3RybC5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBfYmluZEV2ZW50cyAoKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG5cbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCwgdGhpcyk7XG4gIH0sXG4gIF9kaXNhYmxlQnRuICgpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKTtcblxuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIpO1xuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0KTtcbiAgfSxcbiAgX29uUHJlc3NCdG4gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gbWFwLmdldFNlbGVjdGVkTUdyb3VwKCk7XG5cbiAgICBpZiAoc2VsZWN0ZWRNR3JvdXAgPT09IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkgJiYgc2VsZWN0ZWRNR3JvdXAuZ2V0TGF5ZXJzKClbMF0uX2lzRmlyc3QpIHtcbiAgICAgIG1hcC5jbGVhcigpO1xuICAgICAgbWFwLm1vZGUoJ2RyYXcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RlZE1Hcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX29uTW91c2VPdXQoKTtcbiAgfSxcbiAgX29uTW91c2VPdmVyICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmdldExheWVycygpWzBdLl9pc0ZpcnN0KSB7XG4gICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5yZWplY3RDaGFuZ2VzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuZGVsZXRlU2VsZWN0ZWRFZGdlcyk7XG4gICAgfVxuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICB9XG59KTsiLCJpbXBvcnQgc2VhcmNoIGZyb20gJy4uL3V0aWxzL3NlYXJjaCc7XG5pbXBvcnQgVHJhc2hCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvVHJhc2hCdG4nO1xuaW1wb3J0IExvYWRCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvTG9hZEJ0bic7XG5pbXBvcnQgQnRuQ29udHJvbCBmcm9tICcuLi9leHRlbmRlZC9CdG5Db250cm9sJztcbmltcG9ydCBNc2dIZWxwZXIgZnJvbSAnLi4vZXh0ZW5kZWQvTXNnSGVscGVyJztcbmltcG9ydCBtIGZyb20gJy4uL3V0aWxzL21vYmlsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcbiAgc2VhcmNoKCk7XG5cbiAgdmFyIGdnbCA9IG5ldyBMLkdvb2dsZSgpO1xuXG4gIHRoaXMuYWRkTGF5ZXIoZ2dsKTtcblxuICB0aGlzLl9jb250cm9sTGF5ZXJzID0gbmV3IEwuQ29udHJvbC5MYXllcnMoe1xuICAgICdHb29nbGUnOiBnZ2xcbiAgfSk7XG5cbiAgdGhpcy5hZGRDb250cm9sKHRoaXMuX2NvbnRyb2xMYXllcnMpO1xuXG4gIHRoaXMudG91Y2hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5kb3VibGVDbGlja1pvb20uZGlzYWJsZSgpO1xuICAvL3RoaXMuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgdGhpcy5ib3hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5rZXlib2FyZC5kaXNhYmxlKCk7XG5cbiAgdGhpcy5hZGRDb250cm9sKEwuY29udHJvbC5zZWFyY2goKSk7XG5cbiAgdGhpcy5fQnRuQ29udHJvbCA9IEJ0bkNvbnRyb2w7XG5cbiAgdmFyIHRyYXNoQnRuID0gbmV3IFRyYXNoQnRuKHtcbiAgICBidG5zOiBbXG4gICAgICB7J2NsYXNzTmFtZSc6ICdmYSBmYS10cmFzaCd9XG4gICAgXVxuICB9KTtcblxuICB2YXIgbG9hZEJ0biA9IG5ldyBMb2FkQnRuKHtcbiAgICBidG5zOiBbXG4gICAgICB7J2NsYXNzTmFtZSc6ICdmYSBmYS1hcnJvdy1jaXJjbGUtby1kb3duIGxvYWQnfVxuICAgIF1cbiAgfSk7XG5cbiAgdmFyIG1zZ0hlbHBlciA9IG5ldyBNc2dIZWxwZXIoe1xuICAgIGRlZmF1bHRNc2c6IHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXBcbiAgfSk7XG5cbiAgdGhpcy5vbignbXNnSGVscGVyQWRkZWQnLCAoZGF0YSkgPT4ge1xuICAgIHZhciBtc2dDb250YWluZXIgPSBkYXRhLmNvbnRyb2wuX3RpdGxlQ29udGFpbmVyO1xuXG4gICAgdGhpcy5fbXNnQ29udGFpbmVyID0gbXNnQ29udGFpbmVyO1xuICAgIHZhciB0ZXh0ID0gdGhpcy5vcHRpb25zLnRleHQ7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsICgpID0+IHtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb1NlbGVjdEVkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9BZGROZXdFZGdlcyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gb24gZWRpdCBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0RyYXdJbm5lckVkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH0pO1xuICAgICAgLy8gb24gdmlldyBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0VkaXQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBoaWRlIG1zZ1xuICAgIHRoaXMub2ZmKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgdGhpcy5vbignZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSk7XG4gICAgLy8gb24gc3RhcnQgZHJhdyBwb2x5Z29uXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0pvaW5FZGdlcyk7XG4gICAgfSk7XG4gICAgLy8gZGJsY2xpY2sgdG8gam9pblxuICAgIHRoaXMub2ZmKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5kYmxjbGlja1RvSm9pbkVkZ2VzKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICB9KTtcblxuICAgIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgICB0aGlzLm9uKCdlZGl0b3I6aW50ZXJzZWN0aW9uX2RldGVjdGVkJywgKGRhdGEpID0+IHtcbiAgICAgIC8vIG1zZ1xuICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWxlY3RlZE1hcmtlciA9IHRoaXMuZ2V0U2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgaWYoIXRoaXMuaGFzTGF5ZXIoc2VsZWN0ZWRNYXJrZXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoc2VsZWN0ZWRNYXJrZXIgJiYgIXNlbGVjdGVkTWFya2VyLl9tR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgICAvL3NldCBtYXJrZXIgc3R5bGVcbiAgICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgLy9zZXQgJ2Vycm9yJyBzdHlsZVxuICAgICAgICAgIHNlbGVjdGVkTWFya2VyLnNldEludGVyc2VjdGVkU3R5bGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3Jlc3RvcmUgc3R5bGVcbiAgICAgICAgICBzZWxlY3RlZE1hcmtlci5yZXNldFN0eWxlKCk7XG4gICAgICAgICAgLy9yZXN0b3JlIG90aGVyIG1hcmtlcnMgd2hpY2ggYXJlIGFsc28gbmVlZCB0byByZXNldCBzdHlsZVxuICAgICAgICAgIHZhciBtYXJrZXJzVG9SZXNldCA9IHNlbGVjdGVkTWFya2VyLl9tR3JvdXAuZ2V0TGF5ZXJzKCkuZmlsdGVyKChsYXllcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIEwuRG9tVXRpbC5oYXNDbGFzcyhsYXllci5faWNvbiwgJ20tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvbicpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWFya2Vyc1RvUmVzZXQubWFwKChtYXJrZXIpID0+IG1hcmtlci5yZXNldFN0eWxlKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGlmICghbS5pc01vYmlsZUJyb3dzZXIoKSkge1xuICAgIHRoaXMuYWRkQ29udHJvbChtc2dIZWxwZXIpO1xuICAgIHRoaXMuYWRkQ29udHJvbChsb2FkQnRuKTtcbiAgfVxuXG4gIHRoaXMuYWRkQ29udHJvbCh0cmFzaEJ0bik7XG59IiwiaW1wb3J0IE1hcEVkaXRvciBmcm9tICcuLi9qcy9tYXAnO1xuXG53aW5kb3cuTWFwRWRpdG9yID0gTWFwRWRpdG9yOyIsImltcG9ydCBWaWV3R3JvdXAgZnJvbSAnLi92aWV3L2dyb3VwJztcbmltcG9ydCBFZGl0UG9seWdvbiBmcm9tICcuL2VkaXQvcG9seWdvbic7XG5pbXBvcnQgSG9sZXNHcm91cCBmcm9tICcuL2VkaXQvaG9sZXNHcm91cCc7XG5pbXBvcnQgRWRpdExpbmVHcm91cCBmcm9tICcuL2VkaXQvbGluZSc7XG5pbXBvcnQgRGFzaGVkRWRpdExpbmVHcm91cCBmcm9tICcuL2RyYXcvZGFzaGVkLWxpbmUnO1xuXG5pbXBvcnQgJy4vZWRpdC9tYXJrZXItZ3JvdXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHZpZXdHcm91cDogbnVsbCxcbiAgZWRpdEdyb3VwOiBudWxsLFxuICBlZGl0UG9seWdvbjogbnVsbCxcbiAgZWRpdE1hcmtlcnNHcm91cDogbnVsbCxcbiAgZWRpdExpbmVHcm91cDogbnVsbCxcbiAgZGFzaGVkRWRpdExpbmVHcm91cDogbnVsbCxcbiAgZWRpdEhvbGVNYXJrZXJzR3JvdXA6IG51bGwsXG4gIHNldExheWVycyAoKSB7XG4gICAgdGhpcy52aWV3R3JvdXAgPSBuZXcgVmlld0dyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihbXSk7XG4gICAgdGhpcy5lZGl0TWFya2Vyc0dyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdExpbmVHcm91cCA9IG5ldyBFZGl0TGluZUdyb3VwKFtdKTtcbiAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAgPSBuZXcgRGFzaGVkRWRpdExpbmVHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0SG9sZU1hcmtlcnNHcm91cCA9IG5ldyBIb2xlc0dyb3VwKFtdKTtcbiAgfVxufSIsImltcG9ydCBCYXNlIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgQ29udHJvbHNIb29rIGZyb20gJy4vaG9va3MvY29udHJvbHMnO1xuXG5pbXBvcnQgKiBhcyBsYXllcnMgZnJvbSAnLi9sYXllcnMnO1xuaW1wb3J0ICogYXMgb3B0cyBmcm9tICcuL29wdGlvbnMnO1xuXG5pbXBvcnQgJy4vdXRpbHMvYXJyYXknO1xuXG5mdW5jdGlvbiBtYXAoKSB7XG4gIHZhciBtYXAgPSBMLk1hcC5leHRlbmQoJC5leHRlbmQoQmFzZSwge1xuICAgICQ6IHVuZGVmaW5lZCxcbiAgICBpbml0aWFsaXplIChpZCwgb3B0aW9ucykge1xuICAgICAgJC5leHRlbmQob3B0cy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdHMub3B0aW9ucyk7XG4gICAgICBMLk1hcC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGlkLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuJCA9ICQodGhpcy5fY29udGFpbmVyKTtcblxuICAgICAgbGF5ZXJzLnNldExheWVycygpO1xuXG4gICAgICB0aGlzLl9hZGRMYXllcnMoW1xuICAgICAgICBsYXllcnMudmlld0dyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0UG9seWdvblxuICAgICAgICAsIGxheWVycy5lZGl0TWFya2Vyc0dyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRMaW5lR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZGFzaGVkRWRpdExpbmVHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0SG9sZU1hcmtlcnNHcm91cFxuICAgICAgXSk7XG5cbiAgICAgIHRoaXMuX3NldE92ZXJsYXlzKG9wdGlvbnMpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG9EcmF3KSB7XG4gICAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX3NldE92ZXJsYXlzIChvcHRzKSB7XG4gICAgICB2YXIgb3ZlcmxheXMgPSBvcHRzLm92ZXJsYXlzO1xuXG4gICAgICBmb3IgKHZhciBpIGluIG92ZXJsYXlzKSB7XG4gICAgICAgIHZhciBvaSA9IG92ZXJsYXlzW2ldO1xuICAgICAgICB0aGlzLl9jb250cm9sTGF5ZXJzLmFkZE92ZXJsYXkob2ksIGkpO1xuICAgICAgICBvaS5hZGRUbyh0aGlzKTtcbiAgICAgICAgb2kuYnJpbmdUb0JhY2soKTtcbiAgICAgICAgb2kub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9pLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRWR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy52aWV3R3JvdXA7XG4gICAgfSxcbiAgICBnZXRFR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0R3JvdXA7XG4gICAgfSxcbiAgICBnZXRFUG9seWdvbiAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRQb2x5Z29uO1xuICAgIH0sXG4gICAgZ2V0RU1hcmtlcnNHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRNYXJrZXJzR3JvdXA7XG4gICAgfSxcbiAgICBnZXRFTGluZUdyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdExpbmVHcm91cDtcbiAgICB9LFxuICAgIGdldERFTGluZSAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmRhc2hlZEVkaXRMaW5lR3JvdXA7XG4gICAgfSxcbiAgICBnZXRFSE1hcmtlcnNHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRIb2xlTWFya2Vyc0dyb3VwO1xuICAgIH0sXG4gICAgZ2V0U2VsZWN0ZWRQb2x5Z29uOiAoKSA9PiB0aGlzLl9zZWxlY3RlZFBvbHlnb24sXG4gICAgZ2V0U2VsZWN0ZWRNR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTUdyb3VwO1xuICAgIH1cbiAgfSkpO1xuXG4gIG1hcC5hZGRJbml0SG9vayhDb250cm9sc0hvb2spO1xuXG4gIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1hcCgpO1xuIiwiaW1wb3J0IG0gZnJvbSAnLi91dGlscy9tb2JpbGUnO1xuXG52YXIgc2l6ZSA9IDE7XG52YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5pZiAobS5pc01vYmlsZUJyb3dzZXIoKSkge1xuICBzaXplID0gMjtcbn1cblxuZXhwb3J0IHZhciBmaXJzdEljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb24tZmlyc3RcIixcbiAgaWNvblNpemU6IFs4ICogc2l6ZSwgOCAqIHNpemVdXG59KTtcblxuZXhwb3J0IHZhciBpY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplLCAxMCAqIHNpemVdXG59KTtcblxuZXhwb3J0IHZhciBkcmFnSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvbi1kcmFnXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplICogMywgMTAgKiBzaXplICogM11cbn0pO1xuXG5leHBvcnQgdmFyIG1pZGRsZUljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplLCAxMCAqIHNpemVdXG5cbn0pO1xuXG4vLyBkaXNhYmxlIGhvdmVyIGljb24gdG8gc2ltcGxpZnlcblxuZXhwb3J0IHZhciBob3Zlckljb24gPSBpY29uIHx8IEwuZGl2SWNvbih7XG4gICAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uXCIsXG4gICAgaWNvblNpemU6IFsyICogNyAqIHNpemUsIDIgKiA3ICogc2l6ZV1cbiAgfSk7XG5cbmV4cG9ydCB2YXIgaW50ZXJzZWN0aW9uSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsyICogNyAqIHNpemUsIDIgKiA3ICogc2l6ZV1cbn0pOyIsInZhciB2aWV3Q29sb3IgPSAnIzAwRkZGRic7XG52YXIgZHJhd0NvbG9yID0gJyMwMEY4MDAnO1xudmFyIGVkaXRDb2xvciA9ICcjMDBGODAwJztcbnZhciB3ZWlnaHQgPSAzO1xuXG5leHBvcnQgdmFyIG9wdGlvbnMgPSB7XG4gIGFsbG93SW50ZXJzZWN0aW9uOiBmYWxzZSxcbiAgYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uOiBmYWxzZSwgLy90b2RvOiB1bmZpbmlzaGVkXG4gIGZvcmNlVG9EcmF3OiB0cnVlLFxuICB0cmFuc2xhdGlvbnM6IHtcbiAgICByZW1vdmVQb2x5Z29uOiBcInJlbW92ZSBwb2x5Z29uXCIsXG4gICAgcmVtb3ZlUG9pbnQ6IFwicmVtb3ZlIHBvaW50XCJcbiAgfSxcbiAgb3ZlcmxheXM6IHt9LFxuICBzdHlsZToge1xuICAgIHZpZXc6IHtcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjIsXG4gICAgICBkYXNoQXJyYXk6IG51bGwsXG4gICAgICBjbGlja2FibGU6IGZhbHNlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiB2aWV3Q29sb3IsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH0sXG4gICAgZHJhdzoge1xuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMixcbiAgICAgIGRhc2hBcnJheTogJzUsIDEwJyxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBjb2xvcjogZHJhd0NvbG9yLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRcbiAgICB9XG4gIH0sXG4gIG1hcmtlckljb246IHVuZGVmaW5lZCxcbiAgbWFya2VySG92ZXJJY29uOiB1bmRlZmluZWQsXG4gIGVycm9yTGluZVN0eWxlOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHdlaWdodDogMyxcbiAgICBvcGFjaXR5OiAxLFxuICAgIHNtb290aEZhY3RvcjogMVxuICB9LFxuICBwcmV2aWV3RXJyb3JMaW5lU3R5bGU6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgd2VpZ2h0OiAzLFxuICAgIG9wYWNpdHk6IDEsXG4gICAgc21vb3RoRmFjdG9yOiAxLFxuICAgIGRhc2hBcnJheTogJzUsIDEwJ1xuICB9LFxuICB0ZXh0OiB7XG4gICAgaW50ZXJzZWN0aW9uOiBcIlNlbGYtaW50ZXJzZWN0aW9uIGlzIHByb2hpYml0ZWRcIixcbiAgICBkZWxldGVQb2ludEludGVyc2VjdGlvbjogXCJEZWxldGlvbiBvZiBwb2ludCBpcyBub3QgcG9zc2libGUuIFNlbGYtaW50ZXJzZWN0aW9uIGlzIHByb2hpYml0ZWRcIixcbiAgICByZW1vdmVQb2x5Z29uOiBcIlJlbW92ZSBwb2x5Z29uXCIsXG4gICAgY2xpY2tUb0VkaXQ6IFwiY2xpY2sgdG8gZWRpdFwiLFxuICAgIGNsaWNrVG9BZGROZXdFZGdlczogXCI8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uIHN0YXRpYyBncm91cC1zZWxlY3RlZCc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gYWRkIG5ldyBlZGdlczwvZGl2PlwiLFxuICAgIGNsaWNrVG9EcmF3SW5uZXJFZGdlczogXCJjbGljayB0byBkcmF3IGlubmVyIGVkZ2VzXCIsXG4gICAgY2xpY2tUb0pvaW5FZGdlczogXCJjbGljayB0byBqb2luIGVkZ2VzXCIsXG4gICAgY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXM6IFwiPGRpdj5jbGljayZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9J20tZWRpdG9yLWRpdi1pY29uIHN0YXRpYyBncm91cC1zZWxlY3RlZCc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gcmVtb3ZlIGVkZ2UmbmJzcDsmbmJzcDtvciZuYnNwOyZuYnNwOzxpIGNsYXNzPSdmYSBmYS10cmFzaCc+PC9pPiZuYnNwOyZuYnNwO3RvIHJlbW92ZSBhbGwgc2VsZWN0ZWQgZWRnZXM8L2Rpdj5cIixcbiAgICBjbGlja1RvU2VsZWN0RWRnZXM6IFwiPGRpdj5jbGljayZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9J20tZWRpdG9yLWRpdi1pY29uIHN0YXRpYyc+PC9kaXY+Jm5ic3A7LyZuYnNwOzxkaXYgY2xhc3M9J20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbiBzdGF0aWMnPjwvZGl2PiZuYnNwOyZuYnNwO3RvIHNlbGVjdCBlZGdlczwvZGl2PlwiLFxuICAgIGRibGNsaWNrVG9Kb2luRWRnZXM6IFwiZG91YmxlIGNsaWNrIHRvIGpvaW4gZWRnZXNcIixcbiAgICBjbGlja1RvU3RhcnREcmF3UG9seWdvbk9uTWFwOiBcImNsaWNrIHRvIHN0YXJ0IGRyYXcgcG9seWdvbiBvbiBtYXBcIixcbiAgICBkZWxldGVTZWxlY3RlZEVkZ2VzOiBcImRlbGV0ZWQgc2VsZWN0ZWQgZWRnZXNcIixcbiAgICByZWplY3RDaGFuZ2VzOiBcInJlamVjdCBjaGFuZ2VzXCIsXG4gICAganNvbldhc0xvYWRlZDogXCJKU09OIHdhcyBsb2FkZWRcIixcbiAgICBjaGVja0pzb246IFwiY2hlY2sgSlNPTlwiLFxuICAgIGxvYWRKc29uOiBcImxvYWQgR2VvSlNPTlwiLFxuICAgIGZvcmdldFRvU2F2ZTogXCJTYXZlIGNoYW5nZXMgYnkgcHJlc3Npbmcgb3V0c2lkZSBvZiBwb2x5Z29uXCIsXG4gICAgc2VhcmNoTG9jYXRpb246IFwiU2VhcmNoIGxvY2F0aW9uXCJcbiAgfSxcbiAgd29ybGRDb3B5SnVtcDogdHJ1ZVxufTtcblxuZXhwb3J0IHZhciBkcmF3TGluZVN0eWxlID0ge1xuICBvcGFjaXR5OiAwLjcsXG4gIGZpbGw6IGZhbHNlLFxuICBmaWxsQ29sb3I6IGRyYXdDb2xvcixcbiAgY29sb3I6IGRyYXdDb2xvcixcbiAgd2VpZ2h0OiB3ZWlnaHQsXG4gIGRhc2hBcnJheTogJzUsIDEwJyxcbiAgc3Ryb2tlOiB0cnVlLFxuICBjbGlja2FibGU6IGZhbHNlXG59OyIsIkFycmF5LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdGhpcy5zcGxpY2UodG8sIDAsIHRoaXMuc3BsaWNlKGZyb20sIDEpWzBdKTtcbn07XG5BcnJheS5wcm90b3R5cGUuX2VhY2ggPSBmdW5jdGlvbihmdW5jKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgZnVuYy5jYWxsKHRoaXMsIHRoaXNbaV0sIGkpO1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgQXJyYXk7XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGlzTW9iaWxlQnJvd3NlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjaGVjayA9IGZhbHNlO1xuICAgIChmdW5jdGlvbiAoYSkge1xuICAgICAgaWYgKC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm98YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsvaS50ZXN0KGEpIHx8IC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzXFwtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfFxcLW18ciB8cyApfGF2YW58YmUoY2t8bGx8bnEpfGJpKGxifHJkKXxibChhY3xheil8YnIoZXx2KXd8YnVtYnxid1xcLShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtXFwtfGNlbGx8Y2h0bXxjbGRjfGNtZFxcLXxjbyhtcHxuZCl8Y3Jhd3xkYShpdHxsbHxuZyl8ZGJ0ZXxkY1xcLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8XFwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KFxcLXxfKXxnMSB1fGc1NjB8Z2VuZXxnZlxcLTV8Z1xcLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGRcXC0obXxwfHQpfGhlaVxcLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzXFwtY3xodChjKFxcLXwgfF98YXxnfHB8c3x0KXx0cCl8aHUoYXd8dGMpfGlcXC0oMjB8Z298bWEpfGkyMzB8aWFjKCB8XFwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2NcXC18a3lvKGN8ayl8bGUobm98eGkpfGxnKCBnfFxcLyhrfGx8dSl8NTB8NTR8XFwtW2Etd10pfGxpYnd8bHlueHxtMVxcLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtXFwtY3J8bWUocmN8cmkpfG1pKG84fG9hfHRzKXxtbWVmfG1vKDAxfDAyfGJpfGRlfGRvfHQoXFwtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSlcXC18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfFxcLShbMS04XXxjKSl8cGhpbHxwaXJlfHBsKGF5fHVjKXxwblxcLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdFxcLWd8cWFcXC1hfHFjKDA3fDEyfDIxfDMyfDYwfFxcLVsyLTddfGlcXC0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoXFwtfG9vfHBcXC0pfHNka1xcL3xzZShjKFxcLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2hcXC18c2hhcnxzaWUoXFwtfG0pfHNrXFwtMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoXFwtfHZcXC18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2xcXC18dGRnXFwtfHRlbChpfG0pfHRpbVxcLXx0XFwtbW98dG8ocGx8c2gpfHRzKDcwfG1cXC18bTN8bTUpfHR4XFwtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118XFwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYyhcXC18ICl8d2ViY3x3aGl0fHdpKGcgfG5jfG53KXx3bWxifHdvbnV8eDcwMHx5YXNcXC18eW91cnx6ZXRvfHp0ZVxcLS9pLnRlc3QoYS5zdWJzdHIoMCwgNCkpKSB7XG4gICAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKTtcbiAgICByZXR1cm4gY2hlY2s7XG4gIH1cbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICBMLkNvbnRyb2wuU2VhcmNoID0gTC5Db250cm9sLmV4dGVuZCh7XG4gICAgb3B0aW9uczoge1xuICAgICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICAgIGVtYWlsOiAnJ1xuICAgIH0sXG5cbiAgICBvbkFkZCAobWFwKSB7XG4gICAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYmFyIGxlYWZsZXQtc2VhcmNoLWJhcicpO1xuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICcnLCB3cmFwcGVyKTtcbiAgICAgIGxpbmsuaHJlZiA9ICcjJztcblxuICAgICAgdmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcbiAgICAgIEwuRG9tRXZlbnRcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdkYmxjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgdGhpcy5fdG9nZ2xlLCB0aGlzKTtcblxuICAgICAgbGluay5hcHBlbmRDaGlsZChMLkRvbVV0aWwuY3JlYXRlKCdpJywgJ2ZhIGZhLXNlYXJjaCcpKTtcblxuICAgICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuXG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLl9pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24oaW5wdXQsICdjbGljaycsIHN0b3ApO1xuXG4gICAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcblxuICAgICAgTC5Eb21FdmVudC5vbihmb3JtLCAnc3VibWl0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9kb1NlYXJjaChpbnB1dC52YWx1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIHRoaXMpLm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcblxuXG4gICAgICB0aGlzLl9tYXAub24oJ2xvYWRCdG5PcGVuZWQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XG5cbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoY29udGFpbmVyLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihjb250YWluZXIsICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuXG4gICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG5cbiAgICBfdG9nZ2xlICgpIHtcbiAgICAgIGlmICh0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgIT0gJ2Jsb2NrJykge1xuICAgICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB0aGlzLl9pbnB1dC5mb2N1cygpO1xuICAgICAgICB0aGlzLl9tYXAuZmlyZSgnc2VhcmNoRW5hYmxlZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ3NlYXJjaERpc2FibGVkJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9jb2xsYXBzZSAoKSB7XG4gICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB0aGlzLl9pbnB1dC52YWx1ZSA9ICcnO1xuICAgIH0sXG5cbiAgICBfbm9taW5hdGltQ2FsbGJhY2sgKHJlc3VsdHMpIHtcblxuICAgICAgaWYgKHRoaXMuX3Jlc3VsdHMpIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzdWx0c0NvbnRhaW5lciA9IHRoaXMuX3Jlc3VsdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJzgwcHgnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1kgPSAnYXV0byc7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLm92ZXJmbG93WCA9ICdoaWRkZW4nO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5tYXJnaW4gPSAnM3B4JztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUucGFkZGluZyA9ICcycHgnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXIgPSAnMnB4IGdyZXkgc29saWQnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnMnB4JztcblxuICAgICAgdmFyIGRpdlJlc3VsdHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkaXYgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnc2VhcmNoLXJlc3VsdHMtZWwnKTtcbiAgICAgICAgZGl2LmlubmVyVGV4dCA9IHJlc3VsdHNbaV0uZGlzcGxheV9uYW1lO1xuICAgICAgICBkaXYudGl0bGUgPSByZXN1bHRzW2ldLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgcmVzdWx0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCByZXN1bHQsIGRpdkVsKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGl2UmVzdWx0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoZGl2UmVzdWx0c1tqXSwgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoZGl2RWwsICdzZWxlY3RlZCcpO1xuXG4gICAgICAgICAgICB2YXIgYmJveCA9IHJlc3VsdC5ib3VuZGluZ2JveDtcbiAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoTC5sYXRMbmdCb3VuZHMoW1tiYm94WzBdLCBiYm94WzJdXSwgW2Jib3hbMV0sIGJib3hbM11dXSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSh0aGlzLl9tYXAsIHJlc3VsdHNbaV0sIGRpdikpO1xuXG4gICAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgTC5Eb21FdmVudC5vbihkaXYsICdtb3VzZXdoZWVsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgICAgLm9uKGRpdiwgJ2NsaWNrJywgY2FsbGJhY2spO1xuXG4gICAgICAgIGRpdlJlc3VsdHMucHVzaChkaXYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9mb3JtLmFwcGVuZENoaWxkKHJlc3VsdHNDb250YWluZXIpO1xuXG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2FsbGJhY2tJZDogMCxcblxuICAgIF9kb1NlYXJjaCAocXVlcnkpIHtcbiAgICAgIHZhciBjYWxsYmFjayA9ICdfbF9vc21nZW9jb2Rlcl8nICsgdGhpcy5fY2FsbGJhY2tJZCsrO1xuICAgICAgd2luZG93W2NhbGxiYWNrXSA9IEwuVXRpbC5iaW5kKHRoaXMuX25vbWluYXRpbUNhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHtcbiAgICAgICAgcTogcXVlcnksXG4gICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICdqc29uX2NhbGxiYWNrJzogY2FsbGJhY2tcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVtYWlsKVxuICAgICAgICBxdWVyeVBhcmFtcy5lbWFpbCA9IHRoaXMub3B0aW9ucy5lbWFpbDtcbiAgICAgIGlmICh0aGlzLl9tYXAuZ2V0Qm91bmRzKCkpXG4gICAgICAgIHF1ZXJ5UGFyYW1zLnZpZXdib3ggPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCkudG9CQm94U3RyaW5nKCk7XG4gICAgICB2YXIgdXJsID0gJ2h0dHA6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoJyArIEwuVXRpbC5nZXRQYXJhbVN0cmluZyhxdWVyeVBhcmFtcyk7XG4gICAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9LFxuICAgIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5tc2codGhpcy5fbWFwLm9wdGlvbnMudGV4dC5zZWFyY2hMb2NhdGlvbik7XG4gICAgfSxcbiAgICBfb25Nb3VzZU91dCAoKSB7XG4gICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfVxuICB9KTtcblxuICBMLmNvbnRyb2wuc2VhcmNoID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEwuQ29udHJvbC5TZWFyY2gob3B0aW9ucyk7XG4gIH07XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9iamVjdCA9IHt9LCBhcnJheSA9IFtdKSB7XG4gIHZhciByc2x0ID0gb2JqZWN0O1xuXG4gIHZhciB0bXA7XG4gIHZhciBfZnVuYyA9IGZ1bmN0aW9uIChpZCwgaW5kZXgpIHtcbiAgICB2YXIgcG9zaXRpb24gPSByc2x0W2lkXS5wb3NpdGlvbjtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHBvc2l0aW9uICE9PSBpbmRleCkge1xuICAgICAgICB0bXAgPSByc2x0W2lkXTtcbiAgICAgICAgcnNsdFtpZF0gPSByc2x0W2FycmF5W3Bvc2l0aW9uXV07XG4gICAgICAgIHJzbHRbYXJyYXlbcG9zaXRpb25dXSA9IHRtcDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uICE9IGluZGV4KSB7XG4gICAgICAgIF9mdW5jLmNhbGwobnVsbCwgaWQsIGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGFycmF5LmZvckVhY2goX2Z1bmMpO1xuXG4gIHJldHVybiByc2x0O1xufTsiLCJleHBvcnQgZGVmYXVsdCBMLk11bHRpUG9seWdvbi5leHRlbmQoe1xuICBpbml0aWFsaXplIChsYXRsbmdzLCBvcHRpb25zKSB7XG4gICAgTC5NdWx0aVBvbHlnb24ucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmdzLCBvcHRpb25zKTtcblxuICAgIHRoaXMub24oJ2xheWVyYWRkJywgKGUpID0+IHtcbiAgICAgIHZhciBtVmlld1N0eWxlID0gdGhpcy5fbWFwLm9wdGlvbnMuc3R5bGUudmlldztcbiAgICAgIGUudGFyZ2V0LnNldFN0eWxlKCQuZXh0ZW5kKHtcbiAgICAgICAgb3BhY2l0eTogMC43LFxuICAgICAgICBmaWxsT3BhY2l0eTogMC4zNSxcbiAgICAgICAgY29sb3I6ICcjMDBBQkZGJ1xuICAgICAgfSwgbVZpZXdTdHlsZSkpO1xuXG4gICAgICB0aGlzLl9tYXAuX21vdmVFUG9seWdvbk9uVG9wKCk7XG4gICAgfSk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLk11bHRpUG9seWdvbi5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgdGhpcy5vbignbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoIWVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZighZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW92ZXInKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgbWFwLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICB9XG59KTsiXX0=
