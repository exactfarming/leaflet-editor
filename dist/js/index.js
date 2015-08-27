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
      var lastHole = ehMarkersGroup.getLastHole();
      if (firstMarker && !firstMarker._hasFirstIcon()) {
        if (e.target.getEPolygon()._path == e.originalEvent.toElement) {
          if (!(lastHole && !lastHole.isEmpty())) {
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
      })(_this2._map, btn.pressEventName || _this2.options.pressEventName || 'btnPressed');

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
    submitBtn.innerText = this._map.options.text.submitLoadBtn;

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

    return _BtnControl2['default'].prototype.onAdd.call(this, map);
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
    }
    this._onMouseOut();
  },
  _onMouseOver: function _onMouseOver() {
    if (!L.DomUtil.hasClass(this._btn, 'disabled')) {
      var map = this._map;
      var layer = map.getEMarkersGroup().getLayers()[0];
      if (layer && layer._isFirst) {
        map._msgContainer.msg(map.options.text.rejectChanges);
      } else {
        map._msgContainer.msg(map.options.text.deleteSelectedEdges);
      }
    }
  },
  _onMouseOut: function _onMouseOut() {
    if (!L.DomUtil.hasClass(this._btn, 'disabled')) {
      this._map._msgContainer.hide();
    }
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
    searchLocation: "Search location",
    submitLoadBtn: "submit"
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvYmFzZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9kcmF3L2Rhc2hlZC1saW5lLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZXZlbnRzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvaG9sZXNHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L2xpbmUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXItZ3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXIuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9wb2x5Z29uLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0Jhc2VNYXJrZXJHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9CdG5Db250cm9sLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0xvYWRCdG4uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTXNnSGVscGVyLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL1BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvVG9vbHRpcC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9UcmFzaEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9pbmRleC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9sYXllcnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvbWFwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL21hcmtlci1pY29ucy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9vcHRpb25zLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL2FycmF5LmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL21vYmlsZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy91dGlscy9zZWFyY2guanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdXRpbHMvc29ydEJ5UG9zaXRpb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdmlldy9ncm91cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzBCQ0F1QixlQUFlOzs7OzJCQUNkLGdCQUFnQjs7OztxQkFFekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN0QixpQkFB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QyxNQUFNO0FBQ0wsWUFBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUM1QyxhQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDMUM7T0FDRjtLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLEdBQUcsRUFBRTtBQUNiLFFBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckIsT0FBRyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3pDLE9BQUcsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztHQUN6QztDQUNGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERyYXdFdmVudHMgZnJvbSAnLi9kcmF3L2V2ZW50cyc7XG5pbXBvcnQgRWRpdFBvbHlnb24gZnJvbSAnLi9lZGl0L3BvbHlnb24nO1xuXG5leHBvcnQgZGVmYXVsdCAkLmV4dGVuZCh7XG4gIF9zZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfc2VsZWN0ZWRWTGF5ZXI6IHVuZGVmaW5lZCxcbiAgX29sZFNlbGVjdGVkTWFya2VyOiB1bmRlZmluZWQsXG4gIF9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ6IGZhbHNlLFxuICBfbW9kZVR5cGU6ICdkcmF3JyxcbiAgX2NvbnRyb2xMYXllcnM6IHVuZGVmaW5lZCxcbiAgX2dldFNlbGVjdGVkVkxheWVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRWTGF5ZXI7XG4gIH0sXG4gIF9zZXRTZWxlY3RlZFZMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9zZWxlY3RlZFZMYXllciA9IGxheWVyO1xuICB9LFxuICBfY2xlYXJTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIF9oaWRlU2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgbGF5ZXIuYnJpbmdUb0JhY2soKTtcblxuICAgIGlmICghbGF5ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy9zaG93IGxhc3QgbGF5ZXJcbiAgICB0aGlzLl9zaG93U2VsZWN0ZWRWTGF5ZXIodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSk7XG4gICAgLy9oaWRlXG4gICAgdGhpcy5fc2V0U2VsZWN0ZWRWTGF5ZXIobGF5ZXIpO1xuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgfSxcbiAgX3Nob3dTZWxlY3RlZFZMYXllciAobGF5ZXIgPSB0aGlzLl9zZWxlY3RlZFZMYXllcikge1xuICAgIGlmICghbGF5ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGF5ZXIuX3BhdGguc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICB9LFxuICBfYWRkRUdyb3VwX1RvX1ZHcm91cCAoKSB7XG4gICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG4gICAgdmFyIGVHcm91cCA9IHRoaXMuZ2V0RUdyb3VwKCk7XG5cbiAgICBlR3JvdXAuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgaWYgKCFsYXllci5pc0VtcHR5KCkpIHtcbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICB2YXIgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcbiAgICAgICAgaWYgKCQuaXNBcnJheShob2xlcykpIHtcbiAgICAgICAgICBpZiAoaG9sZXMpIHtcbiAgICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9hZGRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgdmFyIGxhdGxuZ3MgPSBlUG9seWdvbi5nZXRMYXRMbmdzKCk7XG5cbiAgICBpZiAobGF0bG5ncy5sZW5ndGggPD0gMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICBpZiAoaG9sZXMpIHtcbiAgICAgICAgbGF0bG5ncyA9IFtsYXRsbmdzXS5jb25jYXQoaG9sZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICB2R3JvdXAuYWRkTGF5ZXIoTC5wb2x5Z29uKGxhdGxuZ3MpKTtcbiAgfSxcbiAgX3NldEVQb2x5Z29uX1RvX1ZHcm91cCAoKSB7XG4gICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgIHZhciBzZWxlY3RlZFZMYXllciA9IHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCk7XG5cbiAgICBpZiAoIXNlbGVjdGVkVkxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZWN0ZWRWTGF5ZXIuX2xhdGxuZ3MgPSBlUG9seWdvbi5nZXRMYXRMbmdzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIuX2hvbGVzID0gZVBvbHlnb24uZ2V0SG9sZXMoKTtcbiAgICBzZWxlY3RlZFZMYXllci5yZWRyYXcoKTtcbiAgfSxcbiAgX2NvbnZlcnRfRUdyb3VwX1RvX1ZHcm91cCAoKSB7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuX2FkZEVHcm91cF9Ub19WR3JvdXAoKTtcbiAgfSxcbiAgX2NvbnZlcnRUb0VkaXQgKGdyb3VwKSB7XG4gICAgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NdWx0aVBvbHlnb24pIHtcbiAgICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgICBlR3JvdXAuY2xlYXJMYXllcnMoKTtcblxuICAgICAgZ3JvdXAuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgICB2YXIgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcblxuICAgICAgICB2YXIgaG9sZXMgPSBsYXllci5faG9sZXM7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgbGF0bG5ncyA9IFtsYXRsbmdzXS5jb25jYXQoaG9sZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVkaXRQb2x5Z29uID0gbmV3IEVkaXRQb2x5Z29uKGxhdGxuZ3MpO1xuICAgICAgICBlZGl0UG9seWdvbi5hZGRUbyh0aGlzKTtcbiAgICAgICAgZUdyb3VwLmFkZExheWVyKGVkaXRQb2x5Z29uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVHcm91cDtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ3JvdXAgaW5zdGFuY2VvZiBMLk1hcmtlckdyb3VwKSB7XG4gICAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgICB2YXIgbGF5ZXJzID0gZ3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgICBsYXllcnMgPSBsYXllcnMuZmlsdGVyKChsYXllcikgPT4gIWxheWVyLmlzTWlkZGxlKCkpO1xuICAgICAgdmFyIHBvaW50c0FycmF5ID0gbGF5ZXJzLm1hcCgobGF5ZXIpID0+IGxheWVyLmdldExhdExuZygpKTtcblxuICAgICAgdmFyIGhvbGVzID0gZVBvbHlnb24uZ2V0SG9sZXMoKTtcblxuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIHBvaW50c0FycmF5ID0gW3BvaW50c0FycmF5XS5jb25jYXQoaG9sZXMpO1xuICAgICAgfVxuXG4gICAgICBlUG9seWdvbi5zZXRMYXRMbmdzKHBvaW50c0FycmF5KTtcbiAgICAgIGVQb2x5Z29uLnJlZHJhdygpO1xuXG4gICAgICByZXR1cm4gZVBvbHlnb247XG4gICAgfVxuICB9LFxuICBfc2V0TW9kZSAodHlwZSkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIC8vdGhpcy5nZXRWR3JvdXAoKS5zZXRTdHlsZShvcHRpb25zLnN0eWxlW3R5cGVdKTtcbiAgICAvL3RoaXMuZ2V0RUdyb3VwKCkuc2V0U3R5bGUob3B0aW9ucy5lZGl0R3JvdXBTdHlsZS5tb2RlW3R5cGVdKTtcblxuICAgIC8vaWYgKCF0aGlzLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgdGhpcy5nZXRFUG9seWdvbigpLnNldFN0eWxlKG9wdGlvbnMuc3R5bGVbdHlwZV0pO1xuICAgIC8vfVxuXG4gICAgLy90aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAvL3RoaXMuJC50cmlnZ2VyKHt0eXBlOiAnbW9kZScsIHZhbHVlOiB0eXBlfSk7XG4gICAgLy90aGlzLiQudHJpZ2dlcih7dHlwZTogJ21vZGU6JyArIHR5cGV9KTtcbiAgfSxcblxuICBfZ2V0TW9kZVR5cGUgKCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgfSxcbiAgX3NldE1vZGVUeXBlICh0eXBlKSB7XG4gICAgdGhpcy4kLnJlbW92ZUNsYXNzKCdtYXAtJyArIHRoaXMuX21vZGVUeXBlKTtcbiAgICB0aGlzLl9tb2RlVHlwZSA9IHR5cGU7XG4gICAgdGhpcy4kLmFkZENsYXNzKCdtYXAtJyArIHRoaXMuX21vZGVUeXBlKTtcbiAgfSxcbiAgX3NldE1hcmtlcnNHcm91cEljb24gKG1hcmtlckdyb3VwKSB7XG4gICAgdmFyIG1JY29uID0gdGhpcy5vcHRpb25zLm1hcmtlckljb247XG4gICAgdmFyIG1Ib3Zlckljb24gPSB0aGlzLm9wdGlvbnMubWFya2VySG92ZXJJY29uO1xuXG4gICAgdmFyIG1vZGUgPSB0aGlzLl9nZXRNb2RlVHlwZSgpO1xuICAgIGlmIChtSWNvbikge1xuICAgICAgaWYgKCFtSWNvbi5tb2RlKSB7XG4gICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUljb24gPSBtSWNvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpY29uID0gbUljb24ubW9kZVttb2RlXTtcbiAgICAgICAgaWYgKGljb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUljb24gPSBpY29uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1Ib3Zlckljb24pIHtcbiAgICAgIGlmICghbUhvdmVySWNvbi5tb2RlKSB7XG4gICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IG1Ib3Zlckljb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWNvbiA9IG1Ib3Zlckljb25bbW9kZV07XG4gICAgICAgIGlmIChpY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBpY29uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uIHx8IG1hcmtlckdyb3VwLm9wdGlvbnMubUljb247XG5cbiAgICBpZiAobW9kZSA9PT0gXCJhZnRlckRyYXdcIikge1xuICAgICAgbWFya2VyR3JvdXAudXBkYXRlU3R5bGUoKTtcbiAgICB9XG4gIH0sXG4gIC8vbW9kZXM6ICd2aWV3JywgJ2VkaXQnLCAnZHJhdycsICdsaXN0J1xuICBtb2RlICh0eXBlKSB7XG4gICAgdGhpcy5maXJlKHRoaXMuX21vZGVUeXBlICsgJ19ldmVudHNfZGlzYWJsZScpO1xuICAgIHRoaXMuZmlyZSh0eXBlICsgJ19ldmVudHNfZW5hYmxlJyk7XG5cbiAgICB0aGlzLl9zZXRNb2RlVHlwZSh0eXBlKTtcblxuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICAgIHR5cGUgPSB0aGlzW3R5cGVdKCkgfHwgdHlwZTtcbiAgICAgIHRoaXMuX3NldE1vZGUodHlwZSk7XG4gICAgfVxuICB9LFxuICBpc01vZGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIC8vdmllZXcgKCkge1xuICAvLyAgaWYgKHRoaXMuaXNNb2RlKCdlZGl0JykgfHwgdGhpcy5pc01vZGUoJ2RyYXcnKSB8fCB0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgLy8gICAgdGhpcy5fY2xlYXJNYXAoKTtcbiAgLy9cbiAgLy8gIH1cbiAgLy8gIHRoaXMuX2ZpdFZCb3VuZHMoKTtcbiAgLy8gIHRoaXMuX2JpbmRWaWV3RXZlbnRzKCk7XG4gIC8vfSxcbiAgZHJhdyAoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKCdlZGl0JykgfHwgdGhpcy5pc01vZGUoJ3ZpZXcnKSB8fCB0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgICAgIHRoaXMuX2NsZWFyTWFwKCk7XG5cbiAgICB9XG4gICAgdGhpcy5fYmluZERyYXdFdmVudHMoKTtcbiAgfSxcbiAgY2FuY2VsICgpIHtcbiAgICB0aGlzLl9jbGVhck1hcCgpO1xuXG4gICAgdGhpcy5tb2RlKCd2aWV3Jyk7XG4gIH0sXG4gIGNsZWFyICgpIHtcbiAgICB0aGlzLl9jbGVhckV2ZW50cygpO1xuICAgIHRoaXMuX2NsZWFyTWFwKCk7XG4gICAgdGhpcy5maXJlKCdlZGl0b3I6bWFwX2NsZWFyZWQnKTtcbiAgfSxcbiAgY2xlYXJBbGwgKCkge1xuICAgIHRoaXMubW9kZSgndmlldycpO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmdldFZHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gIH0sXG4gIC8qKlxuICAgKlxuICAgKiBUaGUgbWFpbiBpZGVhIGlzIHRvIHNhdmUgRVBvbHlnb24gdG8gVkdyb3VwIHdoZW46XG4gICAqIDEpIHVzZXIgYWRkIG5ldyBwb2x5Z29uXG4gICAqIDIpIHdoZW4gdXNlciBlZGl0IHBvbHlnb25cbiAgICpcbiAgICogKi9cbiAgICBzYXZlU3RhdGUgKCkge1xuXG4gICAgdmFyIGVQb2x5Z29uID0gX21hcC5nZXRFUG9seWdvbigpO1xuXG4gICAgaWYgKCFlUG9seWdvbi5pc0VtcHR5KCkpIHtcbiAgICAgIC8vdGhpcy5maXRCb3VuZHMoZVBvbHlnb24uZ2V0Qm91bmRzKCkpO1xuICAgICAgLy90aGlzLl9tc2dDb250YWluZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmZvcmdldFRvU2F2ZSk7XG5cbiAgICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgdmFyIGdlb2pzb24gPSB0aGlzLmdldFZHcm91cCgpLnRvR2VvSlNPTigpO1xuICAgIGlmIChnZW9qc29uLmdlb21ldHJ5KSB7XG4gICAgICByZXR1cm4gZ2VvanNvbi5nZW9tZXRyeTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBnZXRTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTWFya2VyO1xuICB9LFxuICBjbGVhclNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkTWFya2VyICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLl9zZWxlY3RlZE1hcmtlcjtcbiAgICB2YXIgcHJldk1hcmtlciA9IHNlbGVjdGVkTWFya2VyLnByZXYoKTtcbiAgICB2YXIgbmV4dE1hcmtlciA9IHNlbGVjdGVkTWFya2VyLm5leHQoKTtcbiAgICB2YXIgbWlkbGVQcmV2TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIuX21pZGRsZVByZXY7XG4gICAgdmFyIG1pZGRsZU5leHRNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5fbWlkZGxlTmV4dDtcbiAgICBzZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGxlUHJldk1hcmtlcjtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlciA9IG1pZGRsZU5leHRNYXJrZXI7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgcHJldk1hcmtlci5fbWlkZGxlTmV4dCA9IG51bGw7XG4gICAgbmV4dE1hcmtlci5fbWlkZGxlUHJldiA9IG51bGw7XG4gIH0sXG4gIHJlbW92ZVBvbHlnb24gKHBvbHlnb24pIHtcbiAgICAvL3RoaXMuZ2V0RUxpbmVHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3RoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuXG4gICAgcG9seWdvbi5jbGVhcigpO1xuXG4gICAgaWYgKHRoaXMuaXNNb2RlKCdhZnRlckRyYXcnKSkge1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhclNlbGVjdGVkTWFya2VyKCk7XG4gICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gIH0sXG4gIGNyZWF0ZUVkaXRQb2x5Z29uIChqc29uKSB7XG4gICAgdmFyIGdlb0pzb24gPSBMLmdlb0pzb24oanNvbik7XG5cbiAgICB0aGlzLmNsZWFyKCk7XG5cbiAgICB2YXIgbGF5ZXIgPSBnZW9Kc29uLmdldExheWVycygpWzBdO1xuXG4gICAgaWYgKGxheWVyKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gbGF5ZXIuZ2V0TGF5ZXJzKCk7XG4gICAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBfbCA9IGxheWVyc1tpXTtcbiAgICAgICAgdkdyb3VwLmFkZExheWVyKF9sKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcblxuICAgIHRoaXMuX2ZpdFZCb3VuZHMoKTtcbiAgfSxcbiAgbW92ZU1hcmtlciAobGF0bG5nKSB7XG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuZ2V0U2VsZWN0ZWQoKS5zZXRMYXRMbmcobGF0bG5nKTtcbiAgfSxcbiAgX2ZpdFZCb3VuZHMgKCkge1xuICAgIGlmICh0aGlzLmdldFZHcm91cCgpLmdldExheWVycygpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhpcy5maXRCb3VuZHModGhpcy5nZXRWR3JvdXAoKS5nZXRCb3VuZHMoKSwge3BhZGRpbmc6IFszMCwgMzBdfSk7XG4gICAgICAvL3RoaXMuaW52YWxpZGF0ZVNpemUoKTtcbiAgICB9XG4gIH0sXG4gIF9jbGVhck1hcCAoKSB7XG4gICAgdGhpcy5nZXRFR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RVBvbHlnb24oKS5jbGVhcigpO1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmNsZWFyKCk7XG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gdGhpcy5nZXRTZWxlY3RlZE1Hcm91cCgpO1xuXG4gICAgaWYgKHNlbGVjdGVkTUdyb3VwKSB7XG4gICAgICBzZWxlY3RlZE1Hcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuXG4gICAgdGhpcy5fYWN0aXZlRWRpdExheWVyID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5fc2hvd1NlbGVjdGVkVkxheWVyKCk7XG4gICAgdGhpcy5fY2xlYXJTZWxlY3RlZFZMYXllcigpO1xuICAgIHRoaXMuY2xlYXJTZWxlY3RlZE1hcmtlcigpO1xuICB9LFxuICBfY2xlYXJFdmVudHMgKCkge1xuICAgIC8vdGhpcy5fdW5CaW5kVmlld0V2ZW50cygpO1xuICAgIHRoaXMuX3VuQmluZERyYXdFdmVudHMoKTtcbiAgfSxcbiAgX2FjdGl2ZUVkaXRMYXllcjogdW5kZWZpbmVkLFxuICBfc2V0QWN0aXZlRWRpdExheWVyIChsYXllcikge1xuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IGxheWVyO1xuICB9LFxuICBfZ2V0QWN0aXZlRWRpdExheWVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRWRpdExheWVyO1xuICB9LFxuICBfY2xlYXJBY3RpdmVFZGl0TGF5ZXIgKCkge1xuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IG51bGw7XG4gIH0sXG4gIF9zZXRFSE1hcmtlckdyb3VwIChhcnJheUxhdExuZykge1xuICAgIHZhciBob2xlTWFya2VyR3JvdXAgPSBuZXcgTC5NYXJrZXJHcm91cCgpO1xuICAgIGhvbGVNYXJrZXJHcm91cC5faXNIb2xlID0gdHJ1ZTtcblxuICAgIHRoaXMuX3NldE1hcmtlcnNHcm91cEljb24oaG9sZU1hcmtlckdyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuYWRkVG8oZWhNYXJrZXJzR3JvdXApO1xuXG4gICAgdmFyIGVoTWFya2Vyc0dyb3VwTGF5ZXJzID0gZWhNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICB2YXIgaEdyb3VwUG9zID0gZWhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMTtcbiAgICBob2xlTWFya2VyR3JvdXAuX3Bvc2l0aW9uID0gaEdyb3VwUG9zO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheUxhdExuZy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gc2V0IGhvbGUgbWFya2VyXG4gICAgICBob2xlTWFya2VyR3JvdXAuc2V0SG9sZU1hcmtlcihhcnJheUxhdExuZ1tpXSwgdW5kZWZpbmVkLCB7fSwge2hHcm91cDogaEdyb3VwUG9zLCBoTWFya2VyOiBpfSk7XG4gICAgfVxuXG4gICAgdmFyIGxheWVycyA9IGhvbGVNYXJrZXJHcm91cC5nZXRMYXllcnMoKTtcbiAgICBsYXllcnMubWFwKChsYXllciwgcG9zaXRpb24pID0+IHtcbiAgICAgIGhvbGVNYXJrZXJHcm91cC5fc2V0TWlkZGxlTWFya2VycyhsYXllciwgcG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG5cbiAgICBsYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgIGVQb2x5Z29uLnVwZGF0ZUhvbGVQb2ludChoR3JvdXBQb3MsIGxheWVyLl9fcG9zaXRpb24sIGxheWVyLl9sYXRsbmcpO1xuICAgIH0pO1xuXG4gICAgLy9lUG9seWdvbi5zZXRIb2xlKClcbiAgICByZXR1cm4gaG9sZU1hcmtlckdyb3VwO1xuICB9LFxuICBfbW92ZUVQb2x5Z29uT25Ub3AgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICBpZiAoZVBvbHlnb24uX2NvbnRhaW5lcikge1xuICAgICAgdmFyIGxhc3RDaGlsZCA9ICQoZVBvbHlnb24uX2NvbnRhaW5lci5wYXJlbnRFbGVtZW50KS5jaGlsZHJlbigpLmxhc3QoKTtcbiAgICAgIHZhciAkZVBvbHlnb24gPSAkKGVQb2x5Z29uLl9jb250YWluZXIpO1xuICAgICAgaWYgKCRlUG9seWdvblswXSAhPT0gbGFzdENoaWxkKSB7XG4gICAgICAgICRlUG9seWdvbi5kZXRhY2goKS5pbnNlcnRBZnRlcihsYXN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVzdG9yZUVQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgcG9seWdvbiA9IHBvbHlnb24gfHwgdGhpcy5nZXRFUG9seWdvbigpO1xuXG4gICAgaWYgKCFwb2x5Z29uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gc2V0IG1hcmtlcnNcbiAgICB2YXIgbGF0bG5ncyA9IHBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuc2V0QWxsKGxhdGxuZ3MpO1xuXG4gICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5fY29ubmVjdE1hcmtlcnMoKTtcblxuICAgIC8vIHNldCBob2xlIG1hcmtlcnNcbiAgICB2YXIgaG9sZXMgPSBwb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgaWYgKGhvbGVzKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGhvbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHRoaXMuX3NldEVITWFya2VyR3JvdXAoaG9sZXNbal0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZ2V0Q29udHJvbExheWVyczogKCkgPT4gdGhpcy5fY29udHJvbExheWVycyxcbiAgZWRnZXNJbnRlcnNlY3RlZCAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkID0gdmFsdWU7XG4gICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7aW50ZXJzZWN0aW9uOiB0cnVlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZpcmUoXCJlZGl0b3I6aW50ZXJzZWN0aW9uX2RldGVjdGVkXCIsIHtpbnRlcnNlY3Rpb246IGZhbHNlfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfZXJyb3JUaW1lb3V0OiBudWxsLFxuICBfc2hvd0ludGVyc2VjdGlvbkVycm9yICh0ZXh0KSB7XG5cbiAgICBpZiAodGhpcy5fZXJyb3JUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fZXJyb3JUaW1lb3V0KTtcbiAgICB9XG5cbiAgICB0aGlzLl9tc2dDb250YWluZXIubXNnKHRleHQgfHwgdGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uLCAnZXJyb3InKTtcblxuICAgIHRoaXMuX2Vycm9yVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9LCAxMDAwKTtcbiAgfVxufSwgRHJhd0V2ZW50cyk7XG4iLCJpbXBvcnQgKiBhcyBvcHRzIGZyb20gJy4uL29wdGlvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCBMLlBvbHlsaW5lLmV4dGVuZCh7XG4gIG9wdGlvbnM6IG9wdHMuZHJhd0xpbmVTdHlsZSxcbiAgX2xhdGxuZ1RvTW92ZTogdW5kZWZpbmVkLFxuICBhZGRMYXRMbmcgKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9sYXRsbmdUb01vdmUpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGF0bG5ncy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9sYXRsbmdzLnNwbGljZSgtMSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGF0bG5ncy5wdXNoKEwubGF0TG5nKGxhdGxuZykpO1xuXG4gICAgcmV0dXJuIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIHVwZGF0ZSAocG9zKSB7XG5cbiAgICBpZiAoIXRoaXMuX2xhdGxuZ1RvTW92ZSAmJiB0aGlzLl9sYXRsbmdzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlID0gTC5sYXRMbmcocG9zKTtcbiAgICAgIHRoaXMuX2xhdGxuZ3MucHVzaCh0aGlzLl9sYXRsbmdUb01vdmUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubGF0ID0gcG9zLmxhdDtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZS5sbmcgPSBwb3MubG5nO1xuXG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgX2FkZExpbmUgKGxpbmUsIGdyb3VwLCBpc0xhc3RNYXJrZXIpIHtcbiAgICBpZiAoIWlzTGFzdE1hcmtlcikge1xuICAgICAgbGluZS5hZGRUbyhncm91cCk7XG4gICAgfVxuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgfVxufSk7IiwiaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuZXhwb3J0IGRlZmF1bHQge1xuICBfYmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMuX3VuQmluZERyYXdFdmVudHMoKTtcblxuICAgIC8vIGNsaWNrIG9uIG1hcFxuICAgIHRoaXMub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIC8vIGJ1ZyBmaXhcbiAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaWVudFggPT09IDAgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaWVudFkgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoKGUudGFyZ2V0IGluc3RhbmNlb2YgTC5NYXJrZXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBlLnRhcmdldC5nZXRFTWFya2Vyc0dyb3VwKCk7XG5cbiAgICAgIC8vIHN0YXJ0IGFkZCBuZXcgcG9seWdvblxuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuX2FkZE1hcmtlcihlKTtcblxuICAgICAgICB0aGlzLmZpcmUoJ2VkaXRvcjpzdGFydF9hZGRfbmV3X3BvbHlnb24nKTtcblxuICAgICAgICB0aGlzLl9jbGVhclNlbGVjdGVkVkxheWVyKCk7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRNR3JvdXAgPSBlTWFya2Vyc0dyb3VwO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbnRpbnVlIHdpdGggbmV3IHBvbHlnb25cbiAgICAgIHZhciBmaXJzdE1hcmtlciA9IGVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKTtcblxuICAgICAgaWYgKGZpcnN0TWFya2VyICYmIGZpcnN0TWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICBpZiAoIShlLnRhcmdldCBpbnN0YW5jZW9mIEwuTWFya2VyKSkge1xuICAgICAgICAgIHRoaXMuX2FkZE1hcmtlcihlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHN0YXJ0IGRyYXcgbmV3IGhvbGUgcG9seWdvblxuICAgICAgdmFyIGVoTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpO1xuICAgICAgdmFyIGxhc3RIb2xlID0gZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKTtcbiAgICAgIGlmIChmaXJzdE1hcmtlciAmJiAhZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICgoZS50YXJnZXQuZ2V0RVBvbHlnb24oKS5fcGF0aCA9PSBlLm9yaWdpbmFsRXZlbnQudG9FbGVtZW50KSkge1xuICAgICAgICAgIGlmICghKGxhc3RIb2xlICYmICFsYXN0SG9sZS5pc0VtcHR5KCkpKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgICAgICAgdmFyIGxhc3RIR3JvdXAgPSBlaE1hcmtlcnNHcm91cC5hZGRIb2xlR3JvdXAoKTtcbiAgICAgICAgICAgIGxhc3RIR3JvdXAuc2V0KGUubGF0bG5nLCBudWxsLCB7aWNvbjogZmlyc3RJY29ufSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkTUdyb3VwID0gbGFzdEhHcm91cDtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOnN0YXJ0X2FkZF9uZXdfaG9sZScpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbnRpbnVlIHdpdGggbmV3IGhvbGUgcG9seWdvblxuICAgICAgaWYgKGxhc3RIb2xlICYmICFsYXN0SG9sZS5pc0VtcHR5KCkgJiYgbGFzdEhvbGUuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgICBpZiAodGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2lzTWFya2VySW5Qb2x5Z29uKGUubGF0bG5nKSkge1xuICAgICAgICAgIHZhciBtYXJrZXIgPSBlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpLnNldChlLmxhdGxuZyk7XG4gICAgICAgICAgdmFyIHJzbHQgPSBtYXJrZXIuX2RldGVjdEludGVyc2VjdGlvbigpOyAvLyBpbiBjYXNlIG9mIGhvbGVcbiAgICAgICAgICBpZiAocnNsdCkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG5cbiAgICAgICAgICAgIC8vbWFya2VyLl9tR3JvdXAucmVtb3ZlTWFya2VyKG1hcmtlcik7IC8vdG9kbzogZGV0ZWN0IGludGVyc2VjdGlvbiBmb3IgaG9sZVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlc2V0XG5cbiAgICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcblxuICAgICAgdGhpcy5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX2NsZWFyJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6am9pbl9wYXRoJywgKGUpID0+IHtcbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gZS5tR3JvdXA7XG5cbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLl9pc0hvbGUpIHtcbiAgICAgICAgdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0TGFzdEhvbGUoKTtcbiAgICAgIH1cbiAgICAgIC8vMS4gc2V0IG1pZGRsZSBtYXJrZXJzXG4gICAgICB2YXIgbGF5ZXJzID0gZU1hcmtlcnNHcm91cC5nZXRMYXllcnMoKTtcblxuICAgICAgdmFyIHBvc2l0aW9uID0gLTE7XG4gICAgICBsYXllcnMuZm9yRWFjaCgoKSA9PiB7XG4gICAgICAgIHZhciBtYXJrZXIgPSBlTWFya2Vyc0dyb3VwLmFkZE1hcmtlcihwb3NpdGlvbiwgbnVsbCwge2ljb246IG1pZGRsZUljb259KTtcbiAgICAgICAgcG9zaXRpb24gPSBtYXJrZXIucG9zaXRpb24gKyAyO1xuICAgICAgfSk7XG5cbiAgICAgIC8vMi4gY2xlYXIgbGluZVxuICAgICAgZU1hcmtlcnNHcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgICBlTWFya2Vyc0dyb3VwLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgICAgbWFya2VyLmRyYWdnaW5nLmVuYWJsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuc2VsZWN0KCk7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAuc2VsZWN0KCk7XG5cbiAgICAgIHRoaXMuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9zZWxlY3QnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZ2V0Vkdyb3VwKCkub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpICYmIGVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkgJiYgIWVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuX2FkZE1hcmtlcihlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJlc2V0XG4gICAgICAgIGlmICh0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpKSB7XG4gICAgICAgICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYWRkRVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcblxuICAgICAgICB0aGlzLl9oaWRlU2VsZWN0ZWRWTGF5ZXIoZS5sYXllcik7XG5cbiAgICAgICAgZU1hcmtlcnNHcm91cC5yZXN0b3JlKGUubGF5ZXIpO1xuICAgICAgICB0aGlzLl9jb252ZXJ0VG9FZGl0KGVNYXJrZXJzR3JvdXApO1xuXG4gICAgICAgIGVNYXJrZXJzR3JvdXAuc2VsZWN0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQodGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuICAgIH0pO1xuICAgIHRoaXMub24oJ2VkaXRvcjpkZWxldGVfcG9seWdvbicsICgpID0+IHtcbiAgICAgIHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZW1vdmUoKTtcbiAgICB9KTtcbiAgfSxcbiAgX2FkZE1hcmtlciAoZSkge1xuICAgIHZhciBsYXRsbmcgPSBlLmxhdGxuZztcblxuICAgIHZhciBlTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCk7XG5cbiAgICB2YXIgbWFya2VyID0gZU1hcmtlcnNHcm91cC5zZXQobGF0bG5nKTtcblxuICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQoZU1hcmtlcnNHcm91cCk7XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBfdXBkYXRlREVMaW5lIChsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuZ2V0REVMaW5lKCkudXBkYXRlKGxhdGxuZyk7XG4gIH0sXG4gIF91bkJpbmREcmF3RXZlbnRzICgpIHtcbiAgICB0aGlzLm9mZignY2xpY2snKTtcbiAgICB0aGlzLmdldFZHcm91cCgpLm9mZignY2xpY2snKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcbiAgICB0aGlzLm9mZignZGJsY2xpY2snKTtcblxuICAgIHRoaXMuZ2V0REVMaW5lKCkuY2xlYXIoKTtcblxuICAgIHRoaXMub2ZmKCdlZGl0b3I6am9pbl9wYXRoJyk7XG5cbiAgICBpZiAodGhpcy5fb3BlblBvcHVwKSB7XG4gICAgICB0aGlzLm9wZW5Qb3B1cCA9IHRoaXMuX29wZW5Qb3B1cDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9vcGVuUG9wdXA7XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBMLkZlYXR1cmVHcm91cC5leHRlbmQoe1xuICBfc2VsZWN0ZWQ6IGZhbHNlLFxuICBfbGFzdEhvbGU6IHVuZGVmaW5lZCxcbiAgX2xhc3RIb2xlVG9EcmF3OiB1bmRlZmluZWQsXG4gIGFkZEhvbGVHcm91cCAoKSB7XG4gICAgdGhpcy5fbGFzdEhvbGUgPSBuZXcgTC5NYXJrZXJHcm91cCgpO1xuICAgIHRoaXMuX2xhc3RIb2xlLl9pc0hvbGUgPSB0cnVlO1xuICAgIHRoaXMuX2xhc3RIb2xlLmFkZFRvKHRoaXMpO1xuXG4gICAgdGhpcy5fbGFzdEhvbGUucG9zaXRpb24gPSB0aGlzLmdldExlbmd0aCgpIC0gMTtcblxuICAgIHRoaXMuX2xhc3RIb2xlVG9EcmF3ID0gdGhpcy5fbGFzdEhvbGU7XG5cbiAgICByZXR1cm4gdGhpcy5fbGFzdEhvbGU7XG4gIH0sXG4gIGdldExlbmd0aCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoO1xuICB9LFxuICByZXNldExhc3RIb2xlICgpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IHVuZGVmaW5lZDtcbiAgfSxcbiAgc2V0TGFzdEhvbGUgKGxheWVyKSB7XG4gICAgdGhpcy5fbGFzdEhvbGUgPSBsYXllcjtcbiAgfSxcbiAgZ2V0TGFzdEhvbGUgKCkge1xuICAgIHJldHVybiB0aGlzLl9sYXN0SG9sZTtcbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICB0aGlzLmVhY2hMYXllcigoaG9sZSkgPT4ge1xuICAgICAgd2hpbGUgKGhvbGUuZ2V0TGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgIGhvbGUucmVtb3ZlTWFya2VyQXQoMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIHJlcG9zIChwb3NpdGlvbikge1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgaWYgKGxheWVyLnBvc2l0aW9uID49IHBvc2l0aW9uKSB7XG4gICAgICAgIGxheWVyLnBvc2l0aW9uIC09IDE7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIHJlc2V0U2VsZWN0aW9uICgpIHtcbiAgICB0aGlzLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGxheWVyLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgICAgbWFya2VyLnVuU2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gZmFsc2U7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XG4gICAgdXBkYXRlICgpIHtcbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLl9jb25uZWN0TWFya2VycygpO1xuLy8gICAgbWFwLmdldEVQb2x5Z29uKCkuc2V0U3R5bGUobWFwLmVkaXRTdHlsZVttYXAuX2dldE1vZGVUeXBlKCldKTtcbiAgICB9XG4gIH0pOyIsImltcG9ydCBCYXNlTUdyb3VwIGZyb20gJy4uL2V4dGVuZGVkL0Jhc2VNYXJrZXJHcm91cCc7XG5pbXBvcnQgRWRpdE1hcmtlciBmcm9tICcuLi9lZGl0L21hcmtlcic7XG5pbXBvcnQgRWRpdExpbmVHcm91cCBmcm9tICcuLi9lZGl0L2xpbmUnO1xuaW1wb3J0IERhc2hlZEVkaXRMaW5lR3JvdXAgZnJvbSAnLi4vZHJhdy9kYXNoZWQtbGluZSc7XG5cbmltcG9ydCBzb3J0IGZyb20gJy4uL3V0aWxzL3NvcnRCeVBvc2l0aW9uJztcbmltcG9ydCAqIGFzIGljb25zIGZyb20gJy4uL21hcmtlci1pY29ucyc7XG5cbkwuVXRpbC5leHRlbmQoTC5MaW5lVXRpbCwge1xuICAvLyBDaGVja3MgdG8gc2VlIGlmIHR3byBsaW5lIHNlZ21lbnRzIGludGVyc2VjdC4gRG9lcyBub3QgaGFuZGxlIGRlZ2VuZXJhdGUgY2FzZXMuXG4gIC8vIGh0dHA6Ly9jb21wZ2VvbS5jcy51aXVjLmVkdS9+amVmZmUvdGVhY2hpbmcvMzczL25vdGVzL3gwNi1zd2VlcGxpbmUucGRmXG4gIHNlZ21lbnRzSW50ZXJzZWN0ICgvKlBvaW50Ki8gcCwgLypQb2ludCovIHAxLCAvKlBvaW50Ki8gcDIsIC8qUG9pbnQqLyBwMykge1xuICAgIHJldHVybiB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDIsIHAzKSAhPT1cbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwMSwgcDIsIHAzKSAmJlxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAsIHAxLCBwMikgIT09XG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDEsIHAzKTtcbiAgfSxcblxuICAvLyBjaGVjayB0byBzZWUgaWYgcG9pbnRzIGFyZSBpbiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyXG4gIF9jaGVja0NvdW50ZXJjbG9ja3dpc2UgKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMikge1xuICAgIHJldHVybiAocDIueSAtIHAueSkgKiAocDEueCAtIHAueCkgPiAocDEueSAtIHAueSkgKiAocDIueCAtIHAueCk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBMLk1hcmtlckdyb3VwID0gQmFzZU1Hcm91cC5leHRlbmQoe1xuICBfaXNIb2xlOiBmYWxzZSxcbiAgX2VkaXRMaW5lR3JvdXA6IHVuZGVmaW5lZCxcbiAgX3Bvc2l0aW9uOiB1bmRlZmluZWQsXG4gIGRhc2hlZEVkaXRMaW5lR3JvdXA6IG5ldyBEYXNoZWRFZGl0TGluZUdyb3VwKFtdKSxcbiAgb3B0aW9uczoge1xuICAgIG1JY29uOiB1bmRlZmluZWQsXG4gICAgbUhvdmVySWNvbjogdW5kZWZpbmVkXG4gIH0sXG4gIGluaXRpYWxpemUgKGxheWVycykge1xuICAgIEwuTGF5ZXJHcm91cC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxheWVycyk7XG5cbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgLy90aGlzLl9iaW5kRXZlbnRzKCk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwLmFkZFRvKG1hcCk7XG4gIH0sXG4gIF91cGRhdGVERUxpbmUgKGxhdGxuZykge1xuICAgIHZhciBkZUxpbmUgPSB0aGlzLmdldERFTGluZSgpO1xuICAgIGlmICh0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgZGVMaW5lLnVwZGF0ZShsYXRsbmcpO1xuICAgIH1cbiAgICByZXR1cm4gZGVMaW5lO1xuICB9LFxuICBfYWRkTWFya2VyIChsYXRsbmcpIHtcbiAgICAvL3ZhciBlTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCk7XG5cbiAgICB0aGlzLnNldChsYXRsbmcpO1xuICAgIHRoaXMuZ2V0REVMaW5lKCkuYWRkTGF0TG5nKGxhdGxuZyk7XG5cbiAgICB0aGlzLl9tYXAuX2NvbnZlcnRUb0VkaXQodGhpcyk7XG4gIH0sXG4gIGdldERFTGluZSAoKSB7XG4gICAgaWYgKCF0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuX21hcCkge1xuICAgICAgdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwLmFkZFRvKHRoaXMuX21hcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cDtcbiAgfSxcbiAgX3NldEhvdmVySWNvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLl9vbGRTZWxlY3RlZE1hcmtlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICB9XG4gICAgbWFwLl9zZWxlY3RlZE1hcmtlci5fc2V0SG92ZXJJY29uKHRoaXMub3B0aW9ucy5tSG92ZXJJY29uKTtcbiAgfSxcbiAgX3NvcnRCeVBvc2l0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgIGxheWVycyA9IGxheWVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLl9sZWFmbGV0X2lkIC0gYi5fbGVhZmxldF9pZDtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaWRBcnJheSA9IFtdO1xuICAgICAgdmFyIHBvc0FycmF5ID0gW107XG4gICAgICBsYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgICAgaWRBcnJheS5wdXNoKGxheWVyLl9sZWFmbGV0X2lkKTtcbiAgICAgICAgcG9zQXJyYXkucHVzaChsYXllci5fX3Bvc2l0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICBzb3J0KHRoaXMuX2xheWVycywgaWRBcnJheSk7XG4gICAgfVxuICB9LFxuICB1cGRhdGVTdHlsZSAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgIG1hcmtlci5fcmVzZXRJY29uKHRoaXMub3B0aW9ucy5tSWNvbik7XG4gICAgICBpZiAobWFya2VyID09PSB0aGlzLl9tYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICAgIHRoaXMuX3NldEhvdmVySWNvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2V0U2VsZWN0ZWQgKG1hcmtlcikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQgJiYgdGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gdGhpcy5nZXRMYXN0KCk7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gbWFya2VyO1xuICB9LFxuICByZXNldFNlbGVjdGVkICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9LFxuICBnZXRTZWxlY3RlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fc2VsZWN0ZWRNYXJrZXI7XG4gIH0sXG4gIF9zZXRGaXJzdCAobWFya2VyKSB7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIuX3NldEZpcnN0SWNvbigpO1xuICB9LFxuICBnZXRGaXJzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpcnN0TWFya2VyO1xuICB9LFxuICBnZXRMYXN0ICgpIHtcbiAgICBpZiAodGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICAgIHJldHVybiBsYXllcnNbbGF5ZXJzLmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgfSxcbiAgaGFzRmlyc3RNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpcnN0KCkgJiYgdGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKTtcbiAgfSxcbiAgY29udmVydFRvTGF0TG5ncyAoKSB7XG4gICAgdmFyIGxhdGxuZ3MgPSBbXTtcbiAgICB0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICAgIGlmICghbGF5ZXIuaXNNaWRkbGUoKSkge1xuICAgICAgICBsYXRsbmdzLnB1c2gobGF5ZXIuZ2V0TGF0TG5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsYXRsbmdzO1xuICB9LFxuICByZXN0b3JlIChsYXllcikge1xuICAgIHRoaXMuc2V0QWxsKGxheWVyLl9sYXRsbmdzKTtcbiAgICB0aGlzLnNldEFsbEhvbGVzKGxheWVyLl9ob2xlcyk7XG4gIH0sXG4gIF9hZGQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSkge1xuICAgICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgICBvcHRpb25zLmljb24gPSBpY29ucy5maXJzdEljb247XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5hZGRNYXJrZXIobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmdldERFTGluZSgpLmFkZExhdExuZyhsYXRsbmcpO1xuXG4gICAgdGhpcy5fbWFwLm9mZignbW91c2Vtb3ZlJyk7XG4gICAgaWYgKHRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIHRoaXMuX21hcC5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlREVMaW5lKGUubGF0bG5nKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldERFTGluZSgpLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKG1hcmtlci5fbUdyb3VwLmdldExheWVycygpLmxlbmd0aCA+IDIpIHtcbiAgICAgIGlmIChtYXJrZXIuX21Hcm91cC5fZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpICYmIG1hcmtlciA9PT0gbWFya2VyLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBfY2xvc2VzdE5vdE1pZGRsZU1hcmtlciAobGF5ZXJzLCBwb3NpdGlvbiwgZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIChsYXllcnNbcG9zaXRpb25dLmlzTWlkZGxlKCkpID8gbGF5ZXJzW3Bvc2l0aW9uICsgZGlyZWN0aW9uXSA6IGxheWVyc1twb3NpdGlvbl07XG4gIH0sXG4gIF9zZXRQcmV2TmV4dCAobWFya2VyLCBwb3NpdGlvbikge1xuICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgdmFyIG1heExlbmd0aCA9IGxheWVycy5sZW5ndGggLSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gMSkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIHBvc2l0aW9uIC0gMSwgLTEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIDIsIDEpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09IG1heExlbmd0aCkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIG1heExlbmd0aCAtIDEsIC0xKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIobGF5ZXJzLCAwLCAxKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVQcmV2ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gbGF5ZXJzW3Bvc2l0aW9uIC0gMV07XG4gICAgICB9XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVOZXh0ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gbGF5ZXJzW3Bvc2l0aW9uICsgMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0TWlkZGxlTWFya2VyIChwb3NpdGlvbikge1xuICAgIHRoaXMuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7aWNvbjogaWNvbnMubWlkZGxlSWNvbn0pO1xuICB9LFxuICBzZXRNaWRkbGVNYXJrZXJzIChwb3NpdGlvbikge1xuICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKHBvc2l0aW9uKTtcbiAgICB0aGlzLnNldE1pZGRsZU1hcmtlcihwb3NpdGlvbiArIDIpO1xuICB9LFxuICBzZXQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZykpIHtcbiAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZGQobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgIHRoaXMuX21hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9LFxuICBzZXRNaWRkbGUgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiA8IDApID8gMCA6IHBvc2l0aW9uO1xuXG4gICAgLy92YXIgZnVuYyA9ICh0aGlzLl9pc0hvbGUpID8gJ3NldCcgOiAnc2V0SG9sZU1hcmtlcic7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuc2V0KGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpO1xuXG4gICAgbWFya2VyLl9zZXRNaWRkbGVJY29uKCk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0QWxsIChsYXRsbmdzKSB7XG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIHBvc2l0aW9uKSA9PiB7XG4gICAgICB0aGlzLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICB9LFxuICBzZXRBbGxIb2xlcyAoaG9sZXMpIHtcbiAgICBob2xlcy5mb3JFYWNoKChob2xlKSA9PiB7XG4gICAgICAvL3RoaXMuc2V0KGhvbGUpO1xuICAgICAgdmFyIGxhc3RIR3JvdXAgPSB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5hZGRIb2xlR3JvdXAoKTtcblxuICAgICAgaG9sZS5fZWFjaCgobGF0bG5nLCBwb3NpdGlvbikgPT4ge1xuICAgICAgICBsYXN0SEdyb3VwLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgLy92YXIgbGVuZ3RoID0gaG9sZS5sZW5ndGg7XG4gICAgICAvL3ZhciBpID0gMDtcbiAgICAgIC8vZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgLy8gIGxhc3RIR3JvdXAuc2V0KGhvbGVbaV0sIGkpO1xuICAgICAgLy99XG5cbiAgICAgIGxhc3RIR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgIH0pO1xuICB9LFxuICBzZXRIb2xlTWFya2VyIChsYXRsbmcsIG9wdGlvbnMgPSB7aXNIb2xlTWFya2VyOiB0cnVlLCBob2xlUG9zaXRpb246IHt9fSkge1xuICAgIHZhciBtYXJrZXIgPSBuZXcgRWRpdE1hcmtlcih0aGlzLCBsYXRsbmcsIG9wdGlvbnMgfHwge30pO1xuICAgIG1hcmtlci5hZGRUbyh0aGlzKTtcblxuICAgIC8vdGhpcy5zZXRTZWxlY3RlZChtYXJrZXIpO1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSAmJiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5fc2V0Rmlyc3QobWFya2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICByZW1vdmVIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIC8vcmVtb3ZlIGVkaXQgbGluZVxuICAgIC8vdGhpcy5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3JlbW92ZSBlZGl0IG1hcmtlcnNcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAvL3JlbW92ZSBob2xlXG4gICAgbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZXMoKS5zcGxpY2UodGhpcy5fcG9zaXRpb24sIDEpO1xuICAgIG1hcC5nZXRFUG9seWdvbigpLnJlZHJhdygpO1xuXG4gICAgLy9yZWRyYXcgaG9sZXNcbiAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGVzKCk7XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbWFwLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2ldKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRFTWFya2VyID0gdGhpcy5nZXRTZWxlY3RlZCgpO1xuICAgIHZhciBtYXJrZXJMYXllcnNBcnJheSA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhdGxuZyA9IHNlbGVjdGVkRU1hcmtlci5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVtb3ZlTGF5ZXIoc2VsZWN0ZWRFTWFya2VyKTtcblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfbWFya2VyJywge2xhdGxuZzogbGF0bG5nfSk7XG4gICAgfVxuXG4gICAgbWFya2VyTGF5ZXJzQXJyYXkgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gcmVtb3ZlIGxhc3QgcG9pbnRcbiAgICAgICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUhvbGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3NlbGVjdGVkRU1hcmtlciA9IG1hcC5nZXRTZWxlY3RlZE1hcmtlcigpO1xuICAgICAgICAgIHZhciBob2xlUG9zaXRpb24gPSBzZWxlY3RlZEVNYXJrZXIub3B0aW9ucy5ob2xlUG9zaXRpb247XG5cbiAgICAgICAgICAvL3JlbW92ZSBob2xlIHBvaW50XG4gICAgICAgICAgLy9tYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlKHRoaXMuX3Bvc2l0aW9uKS5zcGxpY2UoaG9sZVBvc2l0aW9uLmhNYXJrZXIsIDEpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGUodGhpcy5fcG9zaXRpb24pLnNwbGljZShzZWxlY3RlZEVNYXJrZXIuX19wb3NpdGlvbiwgMSk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkucmVkcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICAgICAgbGF5ZXIub3B0aW9ucy5ob2xlUG9zaXRpb24gPSB7XG4gICAgICAgICAgICBoR3JvdXA6IHRoaXMuX3Bvc2l0aW9uLFxuICAgICAgICAgICAgaE1hcmtlcjogX3Bvc2l0aW9uKytcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICAvLyBubyBuZWVkIHRvIHJlbW92ZSBsYXN0IHBvaW50XG4gICAgICAgIGlmIChtYXJrZXJMYXllcnNBcnJheS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgLy9yZW1vdmUgZWRpdCBtYXJrZXJzXG4gICAgICAgICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIub3B0aW9ucy50aXRsZSA9IHBvc2l0aW9uO1xuICAgICAgbGF5ZXIuX19wb3NpdGlvbiA9IHBvc2l0aW9uKys7XG4gICAgfSk7XG4gIH0sXG4gIGdldFBvaW50c0ZvckludGVyc2VjdGlvbiAocG9seWdvbikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICB2YXIgbGF5ZXJzID0gKChwb2x5Z29uKSA/IHBvbHlnb24uZ2V0TGF5ZXJzKCkgOiB0aGlzLmdldExheWVycygpKS5maWx0ZXIoKGwpID0+ICFsLmlzTWlkZGxlKCkpO1xuXG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICBsYXllcnMuX2VhY2goKGxheWVyKSA9PiB7XG4gICAgICB2YXIgbGF0bG5nID0gbGF5ZXIuZ2V0TGF0TG5nKCk7XG4gICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5wdXNoKHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIXBvbHlnb24pIHtcbiAgICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1swXSkgeyAvLyBwb2ludCBpcyBmaXJzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLnNsaWNlKDEpO1xuICAgICAgfSBlbHNlIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1tsYXllcnMubGVuZ3RoIC0gMV0pIHsgLy8gcG9pbnQgaXMgbGFzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgfSBlbHNlIHsgLy8gcG9pbnQgaXMgbm90IGZpcnN0IC8gbGFzdFxuICAgICAgICB2YXIgdG1wQXJyUG9pbnRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT09IGxheWVyc1tpXSkge1xuICAgICAgICAgICAgdG1wQXJyUG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMuc3BsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gdG1wQXJyUG9pbnRzLmNvbmNhdCh0aGlzLl9vcmlnaW5hbFBvaW50cyk7XG4gICAgICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vcmlnaW5hbFBvaW50cztcbiAgfSxcbiAgX2JpbmRMaW5lRXZlbnRzOiB1bmRlZmluZWQsXG4gIF9oYXNJbnRlcnNlY3Rpb24gKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKSB7XG4gICAgdmFyIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwLFxuICAgICAgbGFzdFBvaW50ID0gcG9pbnRzID8gcG9pbnRzW2xlbiAtIDFdIDogbnVsbCxcbiAgICAvLyBUaGUgcHJldmlvdXMgcHJldmlvdXMgbGluZSBzZWdtZW50LiBQcmV2aW91cyBsaW5lIHNlZ21lbnQgZG9lc24ndCBuZWVkIHRlc3RpbmcuXG4gICAgICBtYXhJbmRleCA9IGxlbiAtIDI7XG5cbiAgICBpZiAodGhpcy5fdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uKDEpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpbmVTZWdtZW50c0ludGVyc2VjdHNSYW5nZShsYXN0UG9pbnQsIG5ld1BvaW50LCBtYXhJbmRleCwgaXNGaW5pc2gpO1xuICB9LFxuXG4gIF9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZSAocG9pbnRzLCBuZXdQb2ludCwgbGFzdFBvaW50KSB7XG4gICAgdmFyIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwLFxuICAgIC8vbGFzdFBvaW50ID0gcG9pbnRzID8gcG9pbnRzW2xlbiAtIDFdIDogbnVsbCxcbiAgICAvLyBUaGUgcHJldmlvdXMgcHJldmlvdXMgbGluZSBzZWdtZW50LiBQcmV2aW91cyBsaW5lIHNlZ21lbnQgZG9lc24ndCBuZWVkIHRlc3RpbmcuXG4gICAgICBtYXhJbmRleCA9IGxlbiAtIDI7XG5cbiAgICBpZiAodGhpcy5fdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uKDEpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpbmVIb2xlU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UobGFzdFBvaW50LCBuZXdQb2ludCk7XG4gIH0sXG5cbiAgaGFzSW50ZXJzZWN0aW9uIChsYXRsbmcsIGlzRmluaXNoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3UG9pbnQgPSBtYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyk7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oKTtcblxuICAgIHZhciByc2x0MSA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbihwb2ludHMsIG5ld1BvaW50LCBpc0ZpbmlzaCk7XG4gICAgdmFyIHJzbHQyID0gZmFsc2U7XG5cbiAgICB2YXIgZk1hcmtlciA9IHRoaXMuZ2V0Rmlyc3QoKTtcbiAgICBpZiAoZk1hcmtlciAmJiAhZk1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIC8vIGNvZGUgd2FzIGR1YmxpY2F0ZWQgdG8gY2hlY2sgaW50ZXJzZWN0aW9uIGZyb20gYm90aCBzaWRlc1xuICAgICAgLy8gKHRoZSBtYWluIGlkZWEgdG8gcmV2ZXJzZSBhcnJheSBvZiBwb2ludHMgYW5kIGNoZWNrIGludGVyc2VjdGlvbiBhZ2FpbilcblxuICAgICAgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oKS5yZXZlcnNlKCk7XG4gICAgICByc2x0MiA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbihwb2ludHMsIG5ld1BvaW50LCBpc0ZpbmlzaCk7XG4gICAgfVxuXG4gICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdDEgfHwgcnNsdDIpO1xuICAgIHZhciBlZGdlc0ludGVyc2VjdGVkID0gbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcbiAgICByZXR1cm4gZWRnZXNJbnRlcnNlY3RlZDtcbiAgfSxcbiAgaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUgKGxBcnJheSwgaG9sZSkge1xuXG4gICAgaWYgKHRoaXMuX21hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5ld1BvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsQXJyYXlbMF0pO1xuICAgIHZhciBsYXN0UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVsxXSk7XG5cbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oaG9sZSk7XG5cbiAgICB2YXIgcnNsdDEgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpO1xuXG4gICAgLy8gY29kZSB3YXMgZHVibGljYXRlZCB0byBjaGVjayBpbnRlcnNlY3Rpb24gZnJvbSBib3RoIHNpZGVzXG4gICAgLy8gKHRoZSBtYWluIGlkZWEgdG8gcmV2ZXJzZSBhcnJheSBvZiBwb2ludHMgYW5kIGNoZWNrIGludGVyc2VjdGlvbiBhZ2FpbilcblxuICAgIHBvaW50cyA9IHRoaXMuZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uKGhvbGUpLnJldmVyc2UoKTtcbiAgICBsYXN0UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVsyXSk7XG4gICAgdmFyIHJzbHQyID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUocG9pbnRzLCBuZXdQb2ludCwgbGFzdFBvaW50KTtcblxuICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKHJzbHQxIHx8IHJzbHQyKTtcbiAgICB2YXIgZWRnZXNJbnRlcnNlY3RlZCA9IHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKCk7XG5cbiAgICByZXR1cm4gZWRnZXNJbnRlcnNlY3RlZDtcbiAgfSxcbiAgX3Rvb0Zld1BvaW50c0ZvckludGVyc2VjdGlvbiAoZXh0cmFQb2ludHMpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXG4gICAgICBsZW4gPSBwb2ludHMgPyBwb2ludHMubGVuZ3RoIDogMDtcbiAgICAvLyBJbmNyZW1lbnQgbGVuZ3RoIGJ5IGV4dHJhUG9pbnRzIGlmIHByZXNlbnRcbiAgICBsZW4gKz0gZXh0cmFQb2ludHMgfHwgMDtcblxuICAgIHJldHVybiAhdGhpcy5fb3JpZ2luYWxQb2ludHMgfHwgbGVuIDw9IDM7XG4gIH0sXG4gIF9saW5lSG9sZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlIChwLCBwMSkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cywgcDIsIHAzO1xuXG4gICAgZm9yICh2YXIgaiA9IHBvaW50cy5sZW5ndGggLSAxOyBqID4gMDsgai0tKSB7XG4gICAgICBwMiA9IHBvaW50c1tqIC0gMV07XG4gICAgICBwMyA9IHBvaW50c1tqXTtcblxuICAgICAgaWYgKEwuTGluZVV0aWwuc2VnbWVudHNJbnRlcnNlY3QocCwgcDEsIHAyLCBwMykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBfbGluZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlIChwLCBwMSwgbWF4SW5kZXgsIGlzRmluaXNoKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLFxuICAgICAgcDIsIHAzO1xuXG4gICAgdmFyIG1pbiA9IGlzRmluaXNoID8gMSA6IDA7XG4gICAgLy8gQ2hlY2sgYWxsIHByZXZpb3VzIGxpbmUgc2VnbWVudHMgKGJlc2lkZSB0aGUgaW1tZWRpYXRlbHkgcHJldmlvdXMpIGZvciBpbnRlcnNlY3Rpb25zXG4gICAgZm9yICh2YXIgaiA9IG1heEluZGV4OyBqID4gbWluOyBqLS0pIHtcbiAgICAgIHAyID0gcG9pbnRzW2ogLSAxXTtcbiAgICAgIHAzID0gcG9pbnRzW2pdO1xuXG4gICAgICBpZiAoTC5MaW5lVXRpbC5zZWdtZW50c0ludGVyc2VjdChwLCBwMSwgcDIsIHAzKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9pc01hcmtlckluUG9seWdvbiAobWFya2VyKSB7XG4gICAgdmFyIGogPSAwO1xuXG4gICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIHNpZGVzID0gbGF5ZXJzLmxlbmd0aDtcblxuICAgIHZhciB4ID0gbWFya2VyLmxuZztcbiAgICB2YXIgeSA9IG1hcmtlci5sYXQ7XG5cbiAgICB2YXIgaW5Qb2x5ID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZGVzOyBpKyspIHtcbiAgICAgIGorKztcbiAgICAgIGlmIChqID09IHNpZGVzKSB7XG4gICAgICAgIGogPSAwO1xuICAgICAgfVxuICAgICAgdmFyIHBvaW50MSA9IGxheWVyc1tpXS5nZXRMYXRMbmcoKTtcbiAgICAgIHZhciBwb2ludDIgPSBsYXllcnNbal0uZ2V0TGF0TG5nKCk7XG4gICAgICBpZiAoKChwb2ludDEubGF0IDwgeSkgJiYgKHBvaW50Mi5sYXQgPj0geSkpIHx8ICgocG9pbnQyLmxhdCA8IHkpICYmIChwb2ludDEubGF0ID49IHkpKSkge1xuICAgICAgICBpZiAocG9pbnQxLmxuZyArICh5IC0gcG9pbnQxLmxhdCkgLyAocG9pbnQyLmxhdCAtIHBvaW50MS5sYXQpICogKHBvaW50Mi5sbmcgLSBwb2ludDEubG5nKSA8IHgpIHtcbiAgICAgICAgICBpblBvbHkgPSAhaW5Qb2x5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5Qb2x5O1xuICB9XG59KTsiLCJpbXBvcnQgVG9vbHRpcCBmcm9tICcuLi9leHRlbmRlZC9Ub29sdGlwJztcbmltcG9ydCB7Zmlyc3RJY29uLGljb24sZHJhZ0ljb24sbWlkZGxlSWNvbixob3Zlckljb24saW50ZXJzZWN0aW9uSWNvbn0gZnJvbSAnLi4vbWFya2VyLWljb25zJztcblxudmFyIHNpemUgPSAxO1xudmFyIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuaWYgKHVzZXJBZ2VudC5pbmRleE9mKFwiaXBhZFwiKSAhPT0gLTEgfHwgdXNlckFnZW50LmluZGV4T2YoXCJpcGhvbmVcIikgIT09IC0xKSB7XG4gIHNpemUgPSAyO1xufVxuXG52YXIgdG9vbHRpcDtcbnZhciBkcmFnZW5kID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IEwuTWFya2VyLmV4dGVuZCh7XG4gIF9kcmFnZ2FibGU6IHVuZGVmaW5lZCwgLy8gYW4gaW5zdGFuY2Ugb2YgTC5EcmFnZ2FibGVcbiAgX29sZExhdExuZ1N0YXRlOiB1bmRlZmluZWQsXG4gIGluaXRpYWxpemUgKGdyb3VwLCBsYXRsbmcsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHtcbiAgICAgIGljb246IGljb24sXG4gICAgICBkcmFnZ2FibGU6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICBMLk1hcmtlci5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9tR3JvdXAgPSBncm91cDtcblxuICAgIHRoaXMuX2lzRmlyc3QgPSBncm91cC5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH0sXG4gIHJlbW92ZUdyb3VwICgpIHtcbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIHRoaXMuX21Hcm91cC5yZW1vdmVIb2xlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21Hcm91cC5yZW1vdmUoKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZSAoKSB7XG4gICAgaWYgKHRoaXMuX21hcCkge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZVNlbGVjdGVkKCk7XG4gICAgfVxuICB9LFxuICByZW1vdmVIb2xlICgpIHsgLy8gZGVwcmVjYXRlZFxuICAgIHRoaXMucmVtb3ZlR3JvdXAoKTtcbiAgfSxcbiAgbmV4dCAoKSB7XG4gICAgdmFyIG5leHQgPSB0aGlzLl9uZXh0Ll9uZXh0O1xuICAgIGlmICghdGhpcy5fbmV4dC5pc01pZGRsZSgpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fbmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQ7XG4gIH0sXG4gIHByZXYgKCkge1xuICAgIHZhciBwcmV2ID0gdGhpcy5fcHJldi5fcHJldjtcbiAgICBpZiAoIXRoaXMuX3ByZXYuaXNNaWRkbGUoKSkge1xuICAgICAgcHJldiA9IHRoaXMuX3ByZXY7XG4gICAgfVxuICAgIHJldHVybiBwcmV2O1xuICB9LFxuICBjaGFuZ2VQcmV2TmV4dFBvcyAoKSB7XG4gICAgaWYgKHRoaXMuX3ByZXYuaXNNaWRkbGUoKSkge1xuXG4gICAgICB2YXIgcHJldkxhdExuZyA9IHRoaXMuX21Hcm91cC5fZ2V0TWlkZGxlTGF0TG5nKHRoaXMucHJldigpLCB0aGlzKTtcbiAgICAgIHZhciBuZXh0TGF0TG5nID0gdGhpcy5fbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcywgdGhpcy5uZXh0KCkpO1xuXG4gICAgICB0aGlzLl9wcmV2LnNldExhdExuZyhwcmV2TGF0TG5nKTtcbiAgICAgIHRoaXMuX25leHQuc2V0TGF0TG5nKG5leHRMYXRMbmcpO1xuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqIGNoYW5nZSBldmVudHMgZm9yIG1hcmtlciAoZXhhbXBsZTogaG9sZSlcbiAgICovXG4gICAgcmVzZXRFdmVudHMgKGNhbGxiYWNrKSB7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSxcbiAgX3Bvc0hhc2ggKCkge1xuICAgIHJldHVybiB0aGlzLl9wcmV2LnBvc2l0aW9uICsgJ18nICsgdGhpcy5wb3NpdGlvbiArICdfJyArIHRoaXMuX25leHQucG9zaXRpb247XG4gIH0sXG4gIF9yZXNldEljb24gKF9pY29uKSB7XG4gICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpYyA9IF9pY29uIHx8IGljb247XG5cbiAgICB0aGlzLnNldEljb24oaWMpO1xuICAgIHRoaXMucHJldigpLnNldEljb24oaWMpO1xuICAgIHRoaXMubmV4dCgpLnNldEljb24oaWMpO1xuICB9LFxuICBfc2V0SG92ZXJJY29uIChfaEljb24pIHtcbiAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRJY29uKF9oSWNvbiB8fCBob3Zlckljb24pO1xuICB9LFxuICBfYWRkSWNvbkNsYXNzIChjbGFzc05hbWUpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5faWNvbiwgY2xhc3NOYW1lKTtcbiAgfSxcbiAgX3JlbW92ZUljb25DbGFzcyAoY2xhc3NOYW1lKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2ljb24sIGNsYXNzTmFtZSk7XG4gIH0sXG4gIF9zZXRJbnRlcnNlY3Rpb25JY29uICgpIHtcbiAgICB2YXIgaWNvbkNsYXNzID0gaW50ZXJzZWN0aW9uSWNvbi5vcHRpb25zLmNsYXNzTmFtZTtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ20tZWRpdG9yLWRpdi1pY29uJztcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9hZGRJY29uQ2xhc3MoaWNvbkNsYXNzKTtcblxuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZCA9IHRoaXMucHJldigpO1xuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5fcmVtb3ZlSWNvbkNsYXNzKGNsYXNzTmFtZSk7XG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkLl9hZGRJY29uQ2xhc3MoaWNvbkNsYXNzKTtcblxuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZCA9IHRoaXMubmV4dCgpO1xuICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5fcmVtb3ZlSWNvbkNsYXNzKGNsYXNzTmFtZSk7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLl9hZGRJY29uQ2xhc3MoaWNvbkNsYXNzKTtcbiAgfSxcbiAgX3NldEZpcnN0SWNvbiAoKSB7XG4gICAgdGhpcy5faXNGaXJzdCA9IHRydWU7XG4gICAgdGhpcy5zZXRJY29uKGZpcnN0SWNvbik7XG4gIH0sXG4gIF9oYXNGaXJzdEljb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9pY29uICYmIEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItZGl2LWljb24tZmlyc3QnKTtcbiAgfSxcbiAgX3NldE1pZGRsZUljb24gKCkge1xuICAgIHRoaXMuc2V0SWNvbihtaWRkbGVJY29uKTtcbiAgfSxcbiAgaXNNaWRkbGUgKCkge1xuICAgIHJldHVybiB0aGlzLl9pY29uICYmIEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uJylcbiAgICAgICYmICFMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ2xlYWZsZXQtZHJhZy10YXJnZXQnKTtcbiAgfSxcbiAgX3NldERyYWdJY29uICgpIHtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uJyk7XG4gICAgdGhpcy5zZXRJY29uKGRyYWdJY29uKTtcbiAgfSxcbiAgaXNQbGFpbiAoKSB7XG4gICAgcmV0dXJuIEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItZGl2LWljb24nKSB8fCBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ20tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvbicpO1xuICB9LFxuICBfb25jZUNsaWNrICgpIHtcbiAgICBpZiAodGhpcy5faXNGaXJzdCkge1xuICAgICAgdGhpcy5vbmNlKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcblxuICAgICAgICBpZiAobUdyb3VwLl9tYXJrZXJzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICB0aGlzLl9vbmNlQ2xpY2soKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGF0bG5nID0gZS50YXJnZXQuX2xhdGxuZztcbiAgICAgICAgdmFyIGhhc0ludGVyc2VjdGlvbiA9IG1Hcm91cC5oYXNJbnRlcnNlY3Rpb24obGF0bG5nKTtcblxuICAgICAgICBpZiAoaGFzSW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICAgICAgICB0aGlzLl9vbmNlQ2xpY2soKTsgLy8gYmluZCAnb25jZScgYWdhaW4gdW50aWwgaGFzIGludGVyc2VjdGlvblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2lzRmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnNldEljb24oaWNvbik7XG4gICAgICAgICAgLy9tR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpqb2luX3BhdGgnLCB7bUdyb3VwOiBtR3JvdXB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBfYmluZENvbW1vbkV2ZW50cyAoKSB7XG4gICAgdGhpcy5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICB2YXIgbUdyb3VwID0gdGhpcy5fbUdyb3VwO1xuXG4gICAgICBpZiAobUdyb3VwLmhhc0ZpcnN0TWFya2VyKCkgJiYgdGhpcyAhPT0gbUdyb3VwLmdldEZpcnN0KCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpICYmIHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb24odGhpcy5nZXRMYXRMbmcoKSwgdHJ1ZSkpIHtcbiAgICAgICAgbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgICBtYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cblxuICAgICAgaWYgKG1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcblxuICAgICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzTWlkZGxlKCkpIHsgLy9hZGQgZWRnZVxuICAgICAgICBtR3JvdXAuc2V0TWlkZGxlTWFya2Vycyh0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVzZXRJY29uKGljb24pO1xuICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG4gICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICAgIH0gZWxzZSB7IC8vcmVtb3ZlIGVkZ2VcbiAgICAgICAgaWYgKCFtR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkgJiYgIWRyYWdlbmQpIHtcbiAgICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG5cbiAgICAgICAgICB2YXIgcnNsdEludGVyc2VjdGlvbiA9IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbih7dGFyZ2V0OiB7X2xhdGxuZzogbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcy5wcmV2KCksIHRoaXMubmV4dCgpKX19KTtcblxuICAgICAgICAgIGlmIChyc2x0SW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0U3R5bGUoKTtcbiAgICAgICAgICAgIG1hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKG1hcC5vcHRpb25zLnRleHQuZGVsZXRlUG9pbnRJbnRlcnNlY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5fcHJldmlld0Vycm9yTGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBvbGRMYXRMbmcgPSB0aGlzLmdldExhdExuZygpO1xuXG4gICAgICAgICAgdmFyIG5leHRNYXJrZXIgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgICBtR3JvdXAucmVtb3ZlTWFya2VyKHRoaXMpO1xuXG4gICAgICAgICAgaWYgKCFtR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICB2YXIgbmV3TGF0TG5nID0gbmV4dE1hcmtlci5fcHJldi5nZXRMYXRMbmcoKTtcblxuICAgICAgICAgICAgaWYgKG5ld0xhdExuZy5sYXQgPT09IG9sZExhdExuZy5sYXQgJiYgbmV3TGF0TG5nLmxuZyA9PT0gb2xkTGF0TG5nLmxuZykge1xuICAgICAgICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvQWRkTmV3RWRnZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtR3JvdXAuc2V0U2VsZWN0ZWQobmV4dE1hcmtlcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzLl9tR3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMikge1xuICAgICAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzID09PSB0aGlzLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb25jZUNsaWNrKCk7XG5cbiAgICB0aGlzLm9uKCdkYmxjbGljaycsICgpID0+IHtcbiAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG4gICAgICBpZiAobUdyb3VwICYmIG1Hcm91cC5nZXRGaXJzdCgpICYmIG1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICBpZiAodGhpcyA9PT0gbUdyb3VwLl9sYXN0TWFya2VyKSB7XG4gICAgICAgICAgbUdyb3VwLmdldEZpcnN0KCkuZmlyZSgnY2xpY2snKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZycsIChlKSA9PiB7XG4gICAgICB2YXIgbWFya2VyID0gZS50YXJnZXQ7XG5cbiAgICAgIG1hcmtlci5jaGFuZ2VQcmV2TmV4dFBvcygpO1xuXG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuXG4gICAgICB0aGlzLl9zZXREcmFnSWNvbigpO1xuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRyYWdfbWFya2VyJywge21hcmtlcjogdGhpc30pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZ2VuZCcsICgpID0+IHtcblxuICAgICAgdGhpcy5fbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpkcmFnZW5kX21hcmtlcicsIHttYXJrZXI6IHRoaXN9KTtcblxuICAgICAgZHJhZ2VuZCA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZHJhZ2VuZCA9IGZhbHNlO1xuICAgICAgfSwgMjAwKTtcblxuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgfSk7XG4gIH0sXG4gIF9pc0luc2lkZUhvbGUgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhvbGUgPSBob2xlc1tpXTtcbiAgICAgIGlmICh0aGlzLl9tR3JvdXAgIT09IGhvbGUpIHtcbiAgICAgICAgaWYgKGhvbGUuX2lzTWFya2VySW5Qb2x5Z29uKHRoaXMuZ2V0TGF0TG5nKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBfaXNPdXRzaWRlT2ZQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgcmV0dXJuICFwb2x5Z29uLl9pc01hcmtlckluUG9seWdvbih0aGlzLmdldExhdExuZygpKTtcbiAgfSxcbiAgX2RldGVjdEludGVyc2VjdGlvbiAoZSkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbGF0bG5nID0gKGUgPT09IHVuZGVmaW5lZCkgPyB0aGlzLmdldExhdExuZygpIDogZS50YXJnZXQuX2xhdGxuZztcbiAgICB2YXIgaXNPdXRzaWRlT2ZQb2x5Z29uID0gZmFsc2U7XG4gICAgdmFyIGlzSW5zaWRlT2ZIb2xlID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICBpc091dHNpZGVPZlBvbHlnb24gPSB0aGlzLl9pc091dHNpZGVPZlBvbHlnb24obWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICBpc0luc2lkZU9mSG9sZSA9IHRoaXMuX2lzSW5zaWRlSG9sZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc0luc2lkZU9mSG9sZSA9IHRoaXMuX2lzSW5zaWRlSG9sZSgpO1xuICAgIH1cblxuICAgIHZhciByc2x0ID0gaXNJbnNpZGVPZkhvbGUgfHwgaXNPdXRzaWRlT2ZQb2x5Z29uIHx8IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb24obGF0bG5nKSB8fCB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMoZSk7XG5cbiAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChyc2x0KTtcbiAgICBpZiAocnNsdCkge1xuICAgICAgdGhpcy5fbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcbiAgfSxcbiAgX2RldGVjdEludGVyc2VjdGlvbldpdGhIb2xlcyAoZSkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXAsIGhhc0ludGVyc2VjdGlvbiA9IGZhbHNlLCBob2xlLCBsYXRsbmcgPSAoZSA9PT0gdW5kZWZpbmVkKSA/IHRoaXMuZ2V0TGF0TG5nKCkgOiBlLnRhcmdldC5fbGF0bG5nO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmdldExheWVycygpO1xuICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICB2YXIgcHJldlBvaW50ID0gdGhpcy5wcmV2KCk7XG4gICAgdmFyIG5leHRQb2ludCA9IHRoaXMubmV4dCgpO1xuXG4gICAgaWYgKHByZXZQb2ludCA9PSBudWxsICYmIG5leHRQb2ludCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlY29uZFBvaW50ID0gcHJldlBvaW50LmdldExhdExuZygpO1xuICAgIHZhciBsYXN0UG9pbnQgPSBuZXh0UG9pbnQuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIGxheWVycywgdG1wQXJyYXkgPSBbXTtcblxuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBob2xlID0gaG9sZXNbaV07XG4gICAgICAgIGlmIChob2xlICE9PSB0aGlzLl9tR3JvdXApIHtcbiAgICAgICAgICBoYXNJbnRlcnNlY3Rpb24gPSB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUoW2xhdGxuZywgc2Vjb25kUG9pbnQsIGxhc3RQb2ludF0sIGhvbGUpO1xuICAgICAgICAgIGlmIChoYXNJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGNoZWNrIHRoYXQgaG9sZSBpcyBpbnNpZGUgb2Ygb3RoZXIgaG9sZVxuICAgICAgICAgIHRtcEFycmF5ID0gW107XG4gICAgICAgICAgbGF5ZXJzID0gaG9sZS5nZXRMYXllcnMoKTtcblxuICAgICAgICAgIGxheWVycy5fZWFjaCgobGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzTWFya2VySW5Qb2x5Z29uKGxheWVyLmdldExhdExuZygpKSkge1xuICAgICAgICAgICAgICB0bXBBcnJheS5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHRtcEFycmF5Lmxlbmd0aCA9PT0gbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBlTWFya2Vyc0dyb3VwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBoYXNJbnRlcnNlY3Rpb24gPSB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUoW2xhdGxuZywgc2Vjb25kUG9pbnQsIGxhc3RQb2ludF0sIGhvbGVzW2ldKTtcblxuICAgICAgICAvLyBjaGVjayB0aGF0IGhvbGUgaXMgb3V0c2lkZSBvZiBwb2x5Z29uXG4gICAgICAgIGlmIChoYXNJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdG1wQXJyYXkgPSBbXTtcbiAgICAgICAgbGF5ZXJzID0gaG9sZXNbaV0uZ2V0TGF5ZXJzKCk7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGxheWVyc1tqXS5faXNPdXRzaWRlT2ZQb2x5Z29uKGVNYXJrZXJzR3JvdXApKSB7XG4gICAgICAgICAgICB0bXBBcnJheS5wdXNoKFwiXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodG1wQXJyYXkubGVuZ3RoID09PSBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIEwuTWFya2VyLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICB0aGlzLm9uKCdkcmFnc3RhcnQnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fbUdyb3VwLnNldFNlbGVjdGVkKHRoaXMpO1xuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSBlLnRhcmdldC5fbGF0bG5nO1xuXG4gICAgICBpZiAodGhpcy5fcHJldi5pc1BsYWluKCkpIHtcbiAgICAgICAgdGhpcy5fbUdyb3VwLnNldE1pZGRsZU1hcmtlcnModGhpcy5wb3NpdGlvbik7XG4gICAgICAgIC8vdGhpcy5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgICAgfVxuXG4gICAgfSkub24oJ2RyYWcnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fb25EcmFnKGUpO1xuICAgIH0pLm9uKCdkcmFnZW5kJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX29uRHJhZ0VuZChlKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5fZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kQ29tbW9uRXZlbnRzKG1hcCk7XG4gIH0sXG4gIF9vbkRyYWcgKGUpIHtcbiAgICB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oZSk7XG4gIH0sXG4gIF9vbkRyYWdFbmQgKGUpIHtcbiAgICB2YXIgcnNsdCA9IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbihlKTtcbiAgICBpZiAocnNsdCAmJiAhdGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uKSB7XG4gICAgICB0aGlzLl9yZXN0b3JlT2xkUG9zaXRpb24oKTtcbiAgICB9XG4gIH0sXG4gIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgX3Jlc3RvcmVPbGRQb3NpdGlvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKSkge1xuICAgICAgbGV0IHN0YXRlTGF0TG5nID0gdGhpcy5fb2xkTGF0TG5nU3RhdGU7XG4gICAgICB0aGlzLnNldExhdExuZyhMLmxhdExuZyhzdGF0ZUxhdExuZy5sYXQsIHN0YXRlTGF0TG5nLmxuZykpO1xuXG4gICAgICB0aGlzLmNoYW5nZVByZXZOZXh0UG9zKCk7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICAvL1xuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkcmFnX21hcmtlcicsIHttYXJrZXI6IHRoaXN9KTtcblxuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnJlc2V0U3R5bGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSB0aGlzLmdldExhdExuZygpO1xuICAgIH1cbiAgfSxcbiAgX2FuaW1hdGVab29tIChvcHQpIHtcbiAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICB2YXIgcG9zID0gdGhpcy5fbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQodGhpcy5fbGF0bG5nLCBvcHQuem9vbSwgb3B0LmNlbnRlcikucm91bmQoKTtcblxuICAgICAgdGhpcy5fc2V0UG9zKHBvcyk7XG4gICAgfVxuICB9LFxuICByZXNldEljb24gKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbi1kcmFnJyk7XG4gIH0sXG4gIHVuU2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgX3NlbGVjdEljb25Jbkdyb3VwICgpIHtcbiAgICBpZiAoIXRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgdGhpcy5fYWRkSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbicpO1xuICAgIH1cbiAgICB0aGlzLl9hZGRJY29uQ2xhc3MoJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIHNlbGVjdEljb25Jbkdyb3VwICgpIHtcbiAgICBpZiAodGhpcy5fcHJldikge1xuICAgICAgdGhpcy5fcHJldi5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG4gICAgdGhpcy5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICBpZiAodGhpcy5fbmV4dCkge1xuICAgICAgdGhpcy5fbmV4dC5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG4gIH0sXG4gIGlzU2VsZWN0ZWRJbkdyb3VwICgpIHtcbiAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBMLk1hcmtlci5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBfZXJyb3JMaW5lczogW10sXG4gIF9wcmV2RXJyb3JMaW5lOiBudWxsLFxuICBfbmV4dEVycm9yTGluZTogbnVsbCxcbiAgX2RyYXdFcnJvckxpbmVzICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRoaXMuX2NsZWFyRXJyb3JMaW5lcygpO1xuXG4gICAgdmFyIGN1cnJQb2ludCA9IHRoaXMuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIHByZXZQb2ludHMgPSBbdGhpcy5wcmV2KCkuZ2V0TGF0TG5nKCksIGN1cnJQb2ludF07XG4gICAgdmFyIG5leHRQb2ludHMgPSBbdGhpcy5uZXh0KCkuZ2V0TGF0TG5nKCksIGN1cnJQb2ludF07XG5cbiAgICB2YXIgZXJyb3JMaW5lU3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5lcnJvckxpbmVTdHlsZTtcblxuICAgIHRoaXMuX3ByZXZFcnJvckxpbmUgPSBuZXcgTC5Qb2x5bGluZShwcmV2UG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG4gICAgdGhpcy5fbmV4dEVycm9yTGluZSA9IG5ldyBMLlBvbHlsaW5lKG5leHRQb2ludHMsIGVycm9yTGluZVN0eWxlKTtcblxuICAgIHRoaXMuX3ByZXZFcnJvckxpbmUuYWRkVG8obWFwKTtcbiAgICB0aGlzLl9uZXh0RXJyb3JMaW5lLmFkZFRvKG1hcCk7XG5cbiAgICB0aGlzLl9lcnJvckxpbmVzLnB1c2godGhpcy5fcHJldkVycm9yTGluZSk7XG4gICAgdGhpcy5fZXJyb3JMaW5lcy5wdXNoKHRoaXMuX25leHRFcnJvckxpbmUpO1xuICB9LFxuICBfY2xlYXJFcnJvckxpbmVzICgpIHtcbiAgICB0aGlzLl9lcnJvckxpbmVzLl9lYWNoKChsaW5lKSA9PiB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIobGluZSkpO1xuICB9LFxuICBzZXRJbnRlcnNlY3RlZFN0eWxlICgpIHtcbiAgICB0aGlzLl9zZXRJbnRlcnNlY3Rpb25JY29uKCk7XG5cbiAgICAvL3Nob3cgaW50ZXJzZWN0ZWQgbGluZXNcbiAgICB0aGlzLl9kcmF3RXJyb3JMaW5lcygpO1xuICB9LFxuICByZXNldFN0eWxlICgpIHtcbiAgICB0aGlzLnJlc2V0SWNvbigpO1xuICAgIHRoaXMuc2VsZWN0SWNvbkluR3JvdXAoKTtcblxuICAgIGlmICh0aGlzLl9wcmV2SW50ZXJzZWN0ZWQpIHtcbiAgICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5yZXNldEljb24oKTtcbiAgICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9uZXh0SW50ZXJzZWN0ZWQpIHtcbiAgICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5yZXNldEljb24oKTtcbiAgICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cblxuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZCA9IG51bGw7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkID0gbnVsbDtcblxuICAgIC8vaGlkZSBpbnRlcnNlY3RlZCBsaW5lc1xuICAgIHRoaXMuX2NsZWFyRXJyb3JMaW5lcygpO1xuICB9LFxuICBfcHJldmlld0VyTGluZTogbnVsbCxcbiAgX3B0OiBudWxsLFxuICBfcHJldmlld0Vycm9yTGluZSAoKSB7XG4gICAgaWYgKHRoaXMuX3ByZXZpZXdFckxpbmUpIHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9wcmV2aWV3RXJMaW5lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcHQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wdCk7XG4gICAgfVxuXG4gICAgdmFyIHBvaW50cyA9IFt0aGlzLm5leHQoKS5nZXRMYXRMbmcoKSwgdGhpcy5wcmV2KCkuZ2V0TGF0TG5nKCldO1xuXG4gICAgdmFyIGVycm9yTGluZVN0eWxlID0gdGhpcy5fbWFwLm9wdGlvbnMucHJldmlld0Vycm9yTGluZVN0eWxlO1xuXG4gICAgdGhpcy5fcHJldmlld0VyTGluZSA9IG5ldyBMLlBvbHlsaW5lKHBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuXG4gICAgdGhpcy5fcHJldmlld0VyTGluZS5hZGRUbyh0aGlzLl9tYXApO1xuXG4gICAgdGhpcy5fcHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9wcmV2aWV3RXJMaW5lKTtcbiAgICB9LCA5MDApO1xuICB9XG59KTsiLCJpbXBvcnQgRXh0ZW5kZWRQb2x5Z29uIGZyb20gJy4uL2V4dGVuZGVkL1BvbHlnb24nO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vZXh0ZW5kZWQvVG9vbHRpcCc7XG5cbmV4cG9ydCBkZWZhdWx0IEwuRWRpdFBsb3lnb24gPSBFeHRlbmRlZFBvbHlnb24uZXh0ZW5kKHtcbiAgX29sZEU6IHVuZGVmaW5lZCwgLy8gdG8gcmV1c2UgZXZlbnQgb2JqZWN0IGFmdGVyIFwiYmFkIGhvbGVcIiByZW1vdmluZyB0byBidWlsZCBuZXcgaG9sZVxuICBfazogMSwgLy8gdG8gZGVjcmVhc2UgJ2RpZmYnIHZhbHVlIHdoaWNoIGhlbHBzIGJ1aWxkIGEgaG9sZVxuICBfaG9sZXM6IFtdLFxuICBpbml0aWFsaXplIChsYXRsbmdzLCBvcHRpb25zKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZ3MsIG9wdGlvbnMpO1xuICAgIHRoaXMuX2luaXRXaXRoSG9sZXMobGF0bG5ncyk7XG5cbiAgICB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lID0gXCJsZWFmbGV0LWNsaWNrYWJsZSBwb2x5Z29uXCI7XG4gIH0sXG4gIF91cGRhdGUgKGUpIHtcbiAgICB2YXIgbWFya2VyID0gZS5tYXJrZXI7XG5cbiAgICBpZiAobWFya2VyLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgdmFyIG1hcmtlcnMgPSBtYXJrZXIuX21Hcm91cC5fbWFya2VycztcbiAgICAgIG1hcmtlcnMgPSBtYXJrZXJzLmZpbHRlcigobWFya2VyKSA9PiAhbWFya2VyLmlzTWlkZGxlKCkpO1xuICAgICAgdGhpcy5faG9sZXNbbWFya2VyLl9tR3JvdXAucG9zaXRpb25dID0gbWFya2Vycy5tYXAoKG1hcmtlcikgPT4gbWFya2VyLmdldExhdExuZygpKTtcblxuICAgIH1cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBfcmVtb3ZlSG9sZSAoZSkge1xuICAgIHZhciBob2xlUG9zaXRpb24gPSBlLm1hcmtlci5fbUdyb3VwLnBvc2l0aW9uO1xuICAgIHRoaXMuX2hvbGVzLnNwbGljZShob2xlUG9zaXRpb24sIDEpO1xuXG4gICAgdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVtb3ZlTGF5ZXIoZS5tYXJrZXIuX21Hcm91cC5fbGVhZmxldF9pZCk7XG4gICAgdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVwb3MoZS5tYXJrZXIuX21Hcm91cC5wb3NpdGlvbik7XG5cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgbWFwLm9mZignZWRpdG9yOmFkZF9tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjphZGRfbWFya2VyJywgKGUpID0+IHRoaXMuX3VwZGF0ZShlKSk7XG4gICAgbWFwLm9mZignZWRpdG9yOmRyYWdfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZHJhZ19tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZGVsZXRlX2hvbGUnKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfaG9sZScsIChlKSA9PiB0aGlzLl9yZW1vdmVIb2xlKGUpKTtcblxuICAgIHRoaXMub24oJ21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIGlmIChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgIH0pO1xuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4gbWFwLmZpcmUoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnKSk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnKTtcblxuICAgIEwuUG9seWxpbmUucHJvdG90eXBlLm9uUmVtb3ZlLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgYWRkSG9sZSAoaG9sZSkge1xuICAgIHRoaXMuX2hvbGVzID0gdGhpcy5faG9sZXMgfHwgW107XG4gICAgdGhpcy5faG9sZXMucHVzaChob2xlKTtcblxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIF9yZXNldExhc3RIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgbWFwLmdldFNlbGVjdGVkTWFya2VyKCkucmVtb3ZlSG9sZSgpO1xuXG4gICAgaWYgKHRoaXMuX2sgPiAwLjAwMSkge1xuICAgICAgdGhpcy5fYWRkSG9sZSh0aGlzLl9vbGRFLCAwLjUpO1xuICAgIH1cbiAgfSxcbiAgY2hlY2tIb2xlSW50ZXJzZWN0aW9uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uIHx8IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGVITWFya2Vyc0dyb3VwTGF5ZXJzID0gdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhc3RIb2xlID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV07XG4gICAgdmFyIGxhc3RIb2xlTGF5ZXJzID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV0uZ2V0TGF5ZXJzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RIb2xlTGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGF5ZXIgPSBsYXN0SG9sZUxheWVyc1tpXTtcblxuICAgICAgaWYgKGxheWVyLl9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMoKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAobGF5ZXIuX2lzT3V0c2lkZU9mUG9seWdvbih0aGlzLl9tYXAuZ2V0RU1hcmtlcnNHcm91cCgpKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBlSG9sZU1hcmtlckdyb3VwTGF5ZXIgPSBlSE1hcmtlcnNHcm91cExheWVyc1tqXTtcblxuICAgICAgICBpZiAobGFzdEhvbGUgIT09IGVIb2xlTWFya2VyR3JvdXBMYXllciAmJiBlSG9sZU1hcmtlckdyb3VwTGF5ZXIuX2lzTWFya2VySW5Qb2x5Z29uKGxheWVyLmdldExhdExuZygpKSkge1xuICAgICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IE1hcmtlciBmcm9tICcuLi9lZGl0L21hcmtlcic7XG5pbXBvcnQgc29ydCBmcm9tICcuLi91dGlscy9zb3J0QnlQb3NpdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IEwuQ2xhc3MuZXh0ZW5kKHtcbiAgaW5jbHVkZXM6IEwuTWl4aW4uRXZlbnRzLFxuXG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0TWFya2VyOiB1bmRlZmluZWQsXG4gIF9maXJzdE1hcmtlcjogdW5kZWZpbmVkLFxuICBfcG9zaXRpb25IYXNoOiB1bmRlZmluZWQsXG4gIF9sYXN0UG9zaXRpb246IDAsXG4gIF9tYXJrZXJzOiBbXSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy9MLkxheWVyR3JvdXAucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIC8vTC5MYXllckdyb3VwLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuICB9LFxuICBjbGVhckxheWVycyAoKSB7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcihtYXJrZXIpO1xuICAgIH0pO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgfSxcbiAgYWRkVG8gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgfSxcbiAgYWRkTGF5ZXIgKG1hcmtlcikge1xuICAgIHRoaXMuX21hcC5hZGRMYXllcihtYXJrZXIpO1xuICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgIGlmIChtYXJrZXIucG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWFya2Vycy5tb3ZlKHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMSwgbWFya2VyLnBvc2l0aW9uKTtcbiAgICB9XG4gICAgbWFya2VyLnBvc2l0aW9uID0gKG1hcmtlci5wb3NpdGlvbiAhPSBudWxsKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMTtcbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgbWFya2Vycy5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICB3aGlsZSAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXIobWFya2VyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLmdldFZHcm91cCgpLnJlbW92ZUxheWVyKG1hcC5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmVMYXllciAobWFya2VyKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gbWFya2VyLnBvc2l0aW9uO1xuICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcihtYXJrZXIpO1xuICAgIHRoaXMuX21hcmtlcnMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgfSxcbiAgZ2V0TGF5ZXJzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2VycztcbiAgfSxcbiAgZWFjaExheWVyIChjYikge1xuICAgIHRoaXMuX21hcmtlcnMuZm9yRWFjaChjYik7XG4gIH0sXG4gIG1hcmtlckF0IChwb3NpdGlvbikge1xuICAgIHZhciByc2x0ID0gdGhpcy5fbWFya2Vyc1twb3NpdGlvbl07XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdE1hcmtlcigpO1xuICAgIH1cblxuICAgIGlmIChyc2x0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJzbHQgPSB0aGlzLmxhc3RNYXJrZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcnNsdDtcbiAgfSxcbiAgZmlyc3RNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrZXJzWzBdO1xuICB9LFxuICBsYXN0TWFya2VyICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG4gICAgcmV0dXJuIG1hcmtlcnNbbWFya2Vycy5sZW5ndGggLSAxXTtcbiAgfSxcbiAgcmVtb3ZlTWFya2VyIChtYXJrZXIpIHtcbiAgICB2YXIgYiA9ICFtYXJrZXIuaXNNaWRkbGUoKTtcblxuICAgIHZhciBwcmV2TWFya2VyID0gbWFya2VyLl9wcmV2O1xuICAgIHZhciBuZXh0TWFya2VyID0gbWFya2VyLl9uZXh0O1xuICAgIHZhciBuZXh0bmV4dE1hcmtlciA9IG1hcmtlci5fbmV4dC5fbmV4dDtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KG1hcmtlci5wb3NpdGlvbik7XG4gICAgdGhpcy5yZW1vdmVNYXJrZXJBdChwcmV2TWFya2VyLnBvc2l0aW9uKTtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KG5leHRNYXJrZXIucG9zaXRpb24pO1xuXG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKG5leHRuZXh0TWFya2VyLnBvc2l0aW9uKTtcblxuICAgICAgaWYgKGIpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfbWFya2VyJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKHRoaXMpO1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9ob2xlJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXAucmVtb3ZlUG9seWdvbihtYXAuZ2V0RVBvbHlnb24oKSk7XG5cbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfcG9seWdvbicpO1xuICAgICAgfVxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZU1hcmtlckF0IChwb3NpdGlvbikge1xuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXI7XG4gICAgaWYgKHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICAgIG1hcmtlciA9IHRoaXMubWFya2VyQXQocG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIF9jaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG4gICAgbWFya2Vycy5mb3JFYWNoKChfbWFya2VyKSA9PiB7XG4gICAgICBpZiAoX2NoYW5nZVBvcykge1xuICAgICAgICBfbWFya2VyLnBvc2l0aW9uID0gKF9tYXJrZXIucG9zaXRpb24gPT09IDApID8gMCA6IF9tYXJrZXIucG9zaXRpb24gLSAxO1xuICAgICAgfVxuICAgICAgaWYgKF9tYXJrZXIgPT09IG1hcmtlcikge1xuICAgICAgICBtYXJrZXIuX3ByZXYuX25leHQgPSBtYXJrZXIuX25leHQ7XG4gICAgICAgIG1hcmtlci5fbmV4dC5fcHJldiA9IG1hcmtlci5fcHJldjtcbiAgICAgICAgX2NoYW5nZVBvcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbW92ZUxheWVyKG1hcmtlcik7XG5cbiAgICBpZiAobWFya2Vycy5sZW5ndGggPCA1KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5jbGVhcigpO1xuICAgICAgICBtYXAuZ2V0Vkdyb3VwKCkucmVtb3ZlTGF5ZXIobWFwLl9nZXRTZWxlY3RlZFZMYXllcigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGFkZE1hcmtlciAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIC8vIDEuIHJlY2FsY3VsYXRlIHBvc2l0aW9uc1xuICAgIGlmICh0eXBlb2YgbGF0bG5nID09PSAnbnVtYmVyJykge1xuICAgICAgcG9zaXRpb24gPSB0aGlzLm1hcmtlckF0KGxhdGxuZykucG9zaXRpb247XG4gICAgICB0aGlzLl9yZWNhbGNQb3NpdGlvbnMocG9zaXRpb24pO1xuXG4gICAgICB2YXIgcHJldk1hcmtlciA9IChwb3NpdGlvbiAtIDEpIDwgMCA/IHRoaXMubGFzdE1hcmtlcigpIDogdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgdmFyIG5leHRNYXJrZXIgPSB0aGlzLm1hcmtlckF0KChwb3NpdGlvbiA9PSAtMSkgPyAxIDogcG9zaXRpb24pO1xuICAgICAgbGF0bG5nID0gdGhpcy5fZ2V0TWlkZGxlTGF0TG5nKHByZXZNYXJrZXIsIG5leHRNYXJrZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgb3B0aW9ucy5kcmFnZ2FibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpKSB7XG4gICAgICBvcHRpb25zLmRyYWdnYWJsZSA9ICF0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXIgPSBuZXcgTWFya2VyKHRoaXMsIGxhdGxuZywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgICB0aGlzLl9sYXN0TWFya2VyID0gbWFya2VyO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvL2lmICh0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgLy8gIG1hcmtlci5kcmFnZ2luZy5kaXNhYmxlKCk7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICBtYXJrZXIuZHJhZ2dpbmcuZW5hYmxlKCk7XG4gICAgLy99XG5cbiAgICB0aGlzLmFkZExheWVyKG1hcmtlcik7XG5cbiAgICB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSAobWFya2VyLnBvc2l0aW9uICE9PSB1bmRlZmluZWQgKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX2xhc3RQb3NpdGlvbisrO1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fbGFzdE1hcmtlcjtcbiAgICAgIHRoaXMuX2ZpcnN0TWFya2VyLl9wcmV2ID0gbWFya2VyO1xuICAgICAgaWYgKG1hcmtlci5fcHJldikge1xuICAgICAgICB0aGlzLl9sYXN0TWFya2VyLl9uZXh0ID0gbWFya2VyO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9maXJzdE1hcmtlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fbGFzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB9XG5cbiAgICAvLyAyLiByZWNhbGN1bGF0ZSByZWxhdGlvbnNcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVjYWxjUmVsYXRpb25zKG1hcmtlcik7XG4gICAgfVxuICAgIC8vIDMuIHRyaWdnZXIgZXZlbnRcbiAgICBpZiAoIW1hcmtlci5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmFkZF9tYXJrZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdmFyIGlkcyA9IHRoaXMuX2lkcygpO1xuXG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuXG4gICAgaWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICB0aGlzLl9kZWxldGVFdmVudHMoaWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gMDtcblxuICAgIHRoaXMuX2ZpcnN0TWFya2VyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfZGVsZXRlRXZlbnRzIChpZCkge1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnZpZXdyZXNldF9pZHhbaWRdO1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnpvb21hbmltX2lkeFtpZF07XG4gIH0sXG4gIF9nZXRNaWRkbGVMYXRMbmcgKG1hcmtlcjEsIG1hcmtlcjIpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwLFxuICAgICAgcDEgPSBtYXAucHJvamVjdChtYXJrZXIxLmdldExhdExuZygpKSxcbiAgICAgIHAyID0gbWFwLnByb2plY3QobWFya2VyMi5nZXRMYXRMbmcoKSk7XG5cbiAgICByZXR1cm4gbWFwLnVucHJvamVjdChwMS5fYWRkKHAyKS5fZGl2aWRlQnkoMikpO1xuICB9LFxuICBfcmVjYWxjUG9zaXRpb25zIChwb3NpdGlvbikge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcblxuICAgIHZhciBjaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICBtYXJrZXJzLmZvckVhY2goKG1hcmtlciwgX3Bvc2l0aW9uKSA9PiB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgICAgICBjaGFuZ2VQb3MgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZVBvcykge1xuICAgICAgICB0aGlzLl9tYXJrZXJzW19wb3NpdGlvbl0ucG9zaXRpb24gKz0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3JlY2FsY1JlbGF0aW9ucyAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuXG4gICAgbWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIHBvc2l0aW9uKSA9PiB7XG5cbiAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gLSAxKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gKyAxKTtcblxuICAgICAgLy8gZmlyc3RcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLmxhc3RNYXJrZXIoKTtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdCgxKTtcbiAgICAgIH1cblxuICAgICAgLy8gbGFzdFxuICAgICAgaWYgKHBvc2l0aW9uID09PSBtYXJrZXJzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfaWRzICgpIHtcbiAgICB2YXIgcnNsdCA9IFtdO1xuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5fbGF5ZXJzKSB7XG4gICAgICByc2x0LnB1c2goaWQpO1xuICAgIH1cblxuICAgIHJzbHQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuXG4gICAgcmV0dXJuIHJzbHQ7XG4gIH0sXG4gIHNlbGVjdCAoKSB7XG4gICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl9tYXAuX3NlbGVjdGVkTUdyb3VwID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgICBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5zZXRMYXN0SG9sZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRTZWxlY3Rpb24oKTtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0TGFzdEhvbGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIG1hcmtlci5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gdHJ1ZTtcblxuICAgIHRoaXMuX21hcC5fc2VsZWN0ZWRNR3JvdXAgPSB0aGlzO1xuICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcpO1xuICB9LFxuICBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDA7XG4gIH0sXG4gIHJlc2V0U2VsZWN0aW9uICgpIHtcbiAgICB0aGlzLmdldExheWVycygpLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIG1hcmtlci51blNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgYnRuczogW1xuICAgICAgLy97J3RpdGxlJzogJ3JlbW92ZScsICdjbGFzc05hbWUnOiAnZmEgZmEtdHJhc2gnfVxuICAgIF0sXG4gICAgZXZlbnROYW1lOiBcImNvbnRyb2xBZGRlZFwiXG4gIH0sXG4gIF9idG46IG51bGwsXG4gIHN0b3BFdmVudDogTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24sXG4gIGluaXRpYWxpemUgKG9wdGlvbnMpIHtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgfSxcbiAgX3RpdGxlQ29udGFpbmVyOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgbWFwLm9uKCdidG5QcmVzc2VkJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2J0biAmJiAhTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgdGhpcy5fb25QcmVzc0J0bigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJhciBsZWFmbGV0LWVkaXRvci1idXR0b25zJyk7XG5cbiAgICBtYXAuX2NvbnRyb2xDb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2VsZi5fc2V0QnRuKG9wdGlvbnMuYnRucywgY29udGFpbmVyKTtcbiAgICAgIGlmIChvcHRpb25zLmV2ZW50TmFtZSkge1xuICAgICAgICBtYXAuZmlyZShvcHRpb25zLmV2ZW50TmFtZSwge2NvbnRyb2w6IHNlbGZ9KTtcbiAgICAgIH1cblxuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihzZWxmLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHNlbGYuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCwgdGhpcyk7XG5cbiAgICB9LCAxMDAwKTtcblxuICAgIG1hcC5nZXRCdG5Db250cm9sID0gKCkgPT4gdGhpcztcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHt9LFxuICBfb25Nb3VzZU92ZXIgKCkge30sXG4gIF9vbk1vdXNlT3V0ICgpIHt9LFxuICBfc2V0QnRuIChvcHRzLCBjb250YWluZXIpIHtcbiAgICB2YXIgX2J0bjtcbiAgICBvcHRzLmZvckVhY2goKGJ0biwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gb3B0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGJ0bi5jbGFzc05hbWUgKz0gXCIgbGFzdFwiO1xuICAgICAgfVxuICAgICAgLy92YXIgY2hpbGQgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1idG4nICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKTtcblxuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICdsZWFmbGV0LWJ0bicsIHdyYXBwZXIpO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgICB2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xuICAgICAgTC5Eb21FdmVudFxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuXG4gICAgICBsaW5rLmFwcGVuZENoaWxkKEwuRG9tVXRpbC5jcmVhdGUoJ2knLCAnZmEnICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKSk7XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCBwcmVzc0V2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIG1hcC5maXJlKHByZXNzRXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSh0aGlzLl9tYXAsIGJ0bi5wcmVzc0V2ZW50TmFtZSB8fCB0aGlzLm9wdGlvbnMucHJlc3NFdmVudE5hbWV8fCAnYnRuUHJlc3NlZCcpKTtcblxuICAgICAgTC5Eb21FdmVudC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgX2J0biA9IGxpbms7XG4gICAgfSk7XG4gICAgdGhpcy5fYnRuID0gX2J0bjtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1sndG9wbGVmdCddO1xuICB9LFxuICBnZXRCdG5BdCAocG9zKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnRuQ29udGFpbmVyKCkuY2hpbGRbcG9zXTtcbiAgfSxcbiAgZGlzYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH0sXG4gIGVuYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH1cbn0pOyIsImltcG9ydCBCdG5DdHJsIGZyb20gJy4vQnRuQ29udHJvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEJ0bkN0cmwuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIGV2ZW50TmFtZTogJ2xvYWRCdG5BZGRlZCdcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb250YWluZXIgPSBCdG5DdHJsLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub24oJ2xvYWRCdG5BZGRlZCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5vbignc2VhcmNoRW5hYmxlZCcsIHRoaXMuX2NvbGxhcHNlLCB0aGlzKTtcblxuICAgICAgdGhpcy5fcmVuZGVyRm9ybShjb250YWluZXIpO1xuICAgIH0pO1xuXG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKGNvbnRhaW5lciwgJ2xvYWQtanNvbi1jb250YWluZXInKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLl90ZXh0YXJlYS5mb2N1cygpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5PcGVuZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuSGlkZGVuJyk7XG4gICAgfVxuICB9LFxuICBfY29sbGFwc2UgKCkge1xuICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl90ZXh0YXJlYS52YWx1ZSA9ICcnO1xuICB9LFxuICBfcmVuZGVyRm9ybSAoY29udGFpbmVyKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gTC5Eb21VdGlsLmNyZWF0ZSgnZm9ybScpO1xuXG4gICAgdmFyIHRleHRhcmVhID0gdGhpcy5fdGV4dGFyZWEgPSBMLkRvbVV0aWwuY3JlYXRlKCd0ZXh0YXJlYScpO1xuICAgIHRleHRhcmVhLnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnO1xuICAgIHRleHRhcmVhLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgd2hpdGUnO1xuICAgIHRleHRhcmVhLnN0eWxlLnBhZGRpbmcgPSAnNXB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNHB4JztcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2NsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2RibGNsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZXdoZWVsJywgdGhpcy5zdG9wRXZlbnQpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cbiAgICB2YXIgc3VibWl0QnRuID0gdGhpcy5fc3VibWl0QnRuID0gTC5Eb21VdGlsLmNyZWF0ZSgnYnV0dG9uJywgJ2xlYWZsZXQtc3VibWl0LWJ0bicpO1xuICAgIHN1Ym1pdEJ0bi50eXBlID0gXCJzdWJtaXRcIjtcbiAgICBzdWJtaXRCdG4uaW5uZXJUZXh0ID10aGlzLl9tYXAub3B0aW9ucy50ZXh0LnN1Ym1pdExvYWRCdG47XG5cbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24oc3VibWl0QnRuLCAnY2xpY2snLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuX3N1Ym1pdEZvcm0sIHRoaXMpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZChzdWJtaXRCdG4pO1xuXG4gICAgTC5Eb21FdmVudC5vbihmb3JtLCAnc3VibWl0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuICB9LFxuICBfdGltZW91dDogbnVsbCxcbiAgX3N1Ym1pdEZvcm0gKCkge1xuICAgIGlmICh0aGlzLl90aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gICAgfVxuXG4gICAgdmFyIGpzb247XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB0cnkge1xuICAgICAganNvbiA9IEpTT04ucGFyc2UodGhpcy5fdGV4dGFyZWEudmFsdWUpO1xuXG4gICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5qc29uV2FzTG9hZGVkLCBcInN1Y2Nlc3NcIik7XG5cbiAgICAgIG1hcC5jcmVhdGVFZGl0UG9seWdvbihqc29uKTtcblxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9LCAyMDAwKTtcblxuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5jaGVja0pzb24sIFwiZXJyb3JcIik7XG5cbiAgICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuICB9LFxuICBfb25Nb3VzZU92ZXIgKCkge1xuICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLm1zZyh0aGlzLl9tYXAub3B0aW9ucy50ZXh0LmxvYWRKc29uKTtcbiAgfSxcbiAgX29uTW91c2VPdXQgKCkge1xuICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Db250cm9sLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBwb3NpdGlvbjogJ21zZ2NlbnRlcicsXG4gICAgZGVmYXVsdE1zZzogbnVsbFxuICB9LFxuICBpbml0aWFsaXplIChvcHRpb25zKSB7XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gIH0sXG4gIF90aXRsZUNvbnRhaW5lcjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb3JuZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10b3AnKTtcbiAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWVkaXRvcicpO1xuXG4gICAgbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ10gPSBjb3JuZXI7XG4gICAgbWFwLl9jb250cm9sQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvcm5lcik7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NldENvbnRhaW5lcihjb250YWluZXIsIG1hcCk7XG4gICAgICBtYXAuZmlyZSgnbXNnSGVscGVyQWRkZWQnLCB7Y29udHJvbDogdGhpc30pO1xuXG4gICAgICB0aGlzLl9jaGFuZ2VQb3MobWFwKTtcbiAgICB9LCAxMDAwKTtcblxuICAgIG1hcC5nZXRCdG5Db250cm9sID0gKCkgPT4gdGhpcztcblxuICAgIHRoaXMuX2JpbmRFdmVudHMobWFwKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9jaGFuZ2VQb3MgKG1hcCkge1xuICAgIHZhciBjb250cm9sQ29ybmVyID0gbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gICAgaWYgKGNvbnRyb2xDb3JuZXIgJiYgY29udHJvbENvcm5lci5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHZhciBjaGlsZCA9IGNvbnRyb2xDb3JuZXIuY2hpbGRyZW4uaXRlbSgpLmNoaWxkcmVuWzBdO1xuXG4gICAgICBpZighY2hpbGQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgd2lkdGggPSBjaGlsZC5jbGllbnRXaWR0aDtcbiAgICAgIGlmKHdpZHRoKSB7XG4gICAgICAgIGNvbnRyb2xDb3JuZXIuc3R5bGUubGVmdCA9IChtYXAuX2NvbnRhaW5lci5jbGllbnRXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2JpbmRFdmVudHMgKG1hcCkge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5fY2hhbmdlUG9zKG1hcCk7XG4gICAgICB9KTtcbiAgICB9LCAxKTtcbiAgfSxcbiAgX3NldENvbnRhaW5lciAoY29udGFpbmVyLCBtYXApIHtcbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LW1zZy1jb250YWluZXIgdGl0bGUtaGlkZGVuJyk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3RpdGxlQ29udGFpbmVyKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdE1zZyAhPT0gbnVsbCkge1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbnMuZGVmYXVsdE1zZztcbiAgICB9XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5tc2cgPSAodGV4dCwgdHlwZSkgPT4ge1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1lcnJvcicpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtc3VjY2VzcycpO1xuXG4gICAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5pbm5lckhUTUwgPSB0ZXh0O1xuXG4gICAgICBpZiAodHlwZSkge1xuICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS0nICsgdHlwZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jaGFuZ2VQb3MobWFwKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdGl0bGVDb250YWluZXIuaGlkZSA9ICgpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWhpZGRlbicpO1xuICAgIH07XG4gIH0sXG4gIGdldEJ0bkNvbnRhaW5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fY29udHJvbENvcm5lcnNbJ21zZ2NlbnRlciddO1xuICB9LFxuICBnZXRCdG5BdCAocG9zKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnRuQ29udGFpbmVyKCkuY2hpbGRbcG9zXTtcbiAgfSxcbiAgZGlzYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH0sXG4gIGVuYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH1cbn0pOyIsImV4cG9ydCBkZWZhdWx0IEwuUG9seWdvbi5leHRlbmQoe1xuICBpc0VtcHR5ICgpIHtcbiAgICB2YXIgbGF0TG5ncyA9IHRoaXMuZ2V0TGF0TG5ncygpO1xuICAgIHJldHVybiBsYXRMbmdzID09PSBudWxsIHx8IGxhdExuZ3MgPT09IHVuZGVmaW5lZCB8fCAobGF0TG5ncyAmJiBsYXRMbmdzLmxlbmd0aCA9PT0gMCk7XG4gIH0sXG4gIGdldEhvbGUgKGhvbGVHcm91cE51bWJlcikge1xuICAgIGlmICghJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXTtcbiAgfSxcbiAgZ2V0SG9sZVBvaW50IChob2xlR3JvdXBOdW1iZXIsIGhvbGVOdW1iZXIpIHtcbiAgICBpZiAoISQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgISQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2hvbGVzW2hvbGVHcm91cE51bWJlcl1baG9sZU51bWJlcl07XG4gIH0sXG4gIGdldEhvbGVzICgpIHtcbiAgICByZXR1cm4gdGhpcy5faG9sZXM7XG4gIH0sXG4gIGNsZWFySG9sZXMgKCkge1xuICAgIHRoaXMuX2hvbGVzID0gW107XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHRoaXMuY2xlYXJIb2xlcygpO1xuXG4gICAgaWYgKCQuaXNBcnJheSh0aGlzLl9sYXRsbmdzKSAmJiB0aGlzLl9sYXRsbmdzWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2V0TGF0TG5ncyhbXSk7XG4gICAgfVxuICB9LFxuICB1cGRhdGVIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlciwgbGF0bG5nKSB7XG4gICAgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHRoaXMuX2hvbGVzW2hvbGVHcm91cE51bWJlcl1baG9sZU51bWJlcl0gPSBsYXRsbmc7XG4gICAgfSBlbHNlIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICEkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXSA9IGxhdGxuZztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faG9sZXMgPSBsYXRsbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBzZXRIb2xlcyAobGF0bG5ncykge1xuICAgIHRoaXMuX2hvbGVzID0gbGF0bG5ncztcbiAgfSxcbiAgc2V0SG9sZVBvaW50IChob2xlR3JvdXBOdW1iZXIsIGhvbGVOdW1iZXIsIGxhdGxuZykge1xuICAgIHZhciBsYXllciA9IHRoaXMuZ2V0TGF5ZXJzKClbMF07XG4gICAgaWYgKGxheWVyKSB7XG4gICAgICBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgICBsYXllci5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXSA9IGxhdGxuZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0pIiwiZXhwb3J0IGRlZmF1bHQgTC5DbGFzcy5leHRlbmQoe1xuICBfdGltZTogMjAwMCxcbiAgaW5pdGlhbGl6ZSAobWFwLCB0ZXh0LCB0aW1lKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHRoaXMuX3BvcHVwUGFuZSA9IG1hcC5fcGFuZXMucG9wdXBQYW5lO1xuICAgIHRoaXMuX3RleHQgPSAnJyB8fCB0ZXh0O1xuICAgIHRoaXMuX2lzU3RhdGljID0gZmFsc2U7XG4gICAgdGhpcy5fY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtdG9vbHRpcCcsIHRoaXMuX3BvcHVwUGFuZSk7XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcblxuICAgIHRoaXMuX3RpbWUgPSB0aW1lIHx8IHRoaXMuX3RpbWU7XG4gIH0sXG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgdGhpcy5fcG9wdXBQYW5lLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgICB0aGlzLl9jb250YWluZXIgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICAnc3RhdGljJyAoaXNTdGF0aWMpIHtcbiAgICB0aGlzLl9pc1N0YXRpYyA9IGlzU3RhdGljIHx8IHRoaXMuX2lzU3RhdGljO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBfcmVuZGVyICgpIHtcbiAgICB0aGlzLl9jb250YWluZXIuaW5uZXJIVE1MID0gXCI8c3Bhbj5cIiArIHRoaXMuX3RleHQgKyBcIjwvc3Bhbj5cIjtcbiAgfSxcbiAgX3VwZGF0ZVBvc2l0aW9uIChsYXRsbmcpIHtcbiAgICB2YXIgcG9zID0gdGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpLFxuICAgICAgdG9vbHRpcENvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lcjtcblxuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIHRvb2x0aXBDb250YWluZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdpbmhlcml0JztcbiAgICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0b29sdGlwQ29udGFpbmVyLCBwb3MpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9zaG93RXJyb3IgKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWVycm9yLXRvb2x0aXAnKTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24obGF0bG5nKTtcblxuICAgIGlmICghdGhpcy5faXNTdGF0aWMpIHtcbiAgICAgIHRoaXMuX21hcC5vbignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfc2hvd0luZm8gKGxhdGxuZykge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWluZm8tdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihsYXRsbmcpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1N0YXRpYykge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9oaWRlICgpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1zaG93Jyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fY29udGFpbmVyLCAnbGVhZmxldC1pbmZvLXRvb2x0aXAnKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWVycm9yLXRvb2x0aXAnKTtcbiAgICB9XG4gICAgdGhpcy5fbWFwLm9mZignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHRleHQgKHRleHQpIHtcbiAgICB0aGlzLl90ZXh0ID0gdGV4dCB8fCB0aGlzLl90ZXh0O1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9LFxuICBzaG93IChsYXRsbmcsIHR5cGUgPSAnaW5mbycpIHtcblxuICAgIHRoaXMudGV4dCgpO1xuXG4gICAgaWYodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgdGhpcy5zaG93RXJyb3IobGF0bG5nKTtcbiAgICB9XG4gICAgaWYodHlwZSA9PT0gJ2luZm8nKSB7XG4gICAgICB0aGlzLnNob3dJbmZvKGxhdGxuZyk7XG4gICAgfVxuICB9LFxuICBzaG93SW5mbyAobGF0bG5nKSB7XG4gICAgdGhpcy5fc2hvd0luZm8obGF0bG5nKTtcblxuICAgIGlmICh0aGlzLl9oaWRlSW5mb1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlSW5mb1RpbWVvdXQpO1xuICAgICAgdGhpcy5faGlkZUluZm9UaW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9oaWRlSW5mb1RpbWVvdXQgPSBzZXRUaW1lb3V0KEwuVXRpbC5iaW5kKHRoaXMuaGlkZSwgdGhpcyksIHRoaXMuX3RpbWUpO1xuICB9LFxuICBzaG93RXJyb3IgKGxhdGxuZykge1xuICAgIHRoaXMuX3Nob3dFcnJvcihsYXRsbmcpO1xuXG4gICAgaWYgKHRoaXMuX2hpZGVFcnJvclRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9oaWRlRXJyb3JUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2hpZGVFcnJvclRpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVFcnJvclRpbWVvdXQgPSBzZXRUaW1lb3V0KEwuVXRpbC5iaW5kKHRoaXMuaGlkZSwgdGhpcyksIHRoaXMuX3RpbWUpO1xuICB9LFxuICBoaWRlICgpIHtcbiAgICB0aGlzLl9oaWRlKCk7XG4gIH0sXG4gIF9vbk1vdXNlTW92ZSAoZSkge1xuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGUubGF0bG5nKTtcbiAgfSxcbiAgc2V0VGltZSAodGltZSkge1xuICAgIGlmICh0aW1lKSB7XG4gICAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICB9XG4gIH1cbn0pOyIsImltcG9ydCBCdG5DdHJsIGZyb20gJy4vQnRuQ29udHJvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEJ0bkN0cmwuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIGV2ZW50TmFtZTogJ3RyYXNoQWRkZWQnLFxuICAgIHByZXNzRXZlbnROYW1lOiAndHJhc2hCdG5QcmVzc2VkJ1xuICB9LFxuICBfYnRuOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgbWFwLm9uKCd0cmFzaEFkZGVkJywgKGRhdGEpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhkYXRhLmNvbnRyb2wuX2J0biwgJ2Rpc2FibGVkJyk7XG5cbiAgICAgIG1hcC5vbignZWRpdG9yOm1hcmtlcl9ncm91cF9zZWxlY3QnLCB0aGlzLl9iaW5kRXZlbnRzLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOnN0YXJ0X2FkZF9uZXdfcG9seWdvbicsIHRoaXMuX2JpbmRFdmVudHMsIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6c3RhcnRfYWRkX25ld19ob2xlJywgdGhpcy5fYmluZEV2ZW50cywgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfaG9sZScsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6bWFwX2NsZWFyZWQnLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcblxuICAgICAgdGhpcy5fZGlzYWJsZUJ0bigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIEJ0bkN0cmwucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgX2JpbmRFdmVudHMgKCkge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnY2xpY2snLCB0aGlzLl9vblByZXNzQnRuLCB0aGlzKTtcbiAgfSxcbiAgX2Rpc2FibGVCdG4gKCkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3Zlcik7XG4gICAgTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQpO1xuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnY2xpY2snLCB0aGlzLl9vblByZXNzQnRuLCB0aGlzKTtcbiAgfSxcbiAgX29uUHJlc3NCdG4gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gbWFwLmdldFNlbGVjdGVkTUdyb3VwKCk7XG5cbiAgICBpZiAoc2VsZWN0ZWRNR3JvdXAgPT09IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkgJiYgc2VsZWN0ZWRNR3JvdXAuZ2V0TGF5ZXJzKClbMF0uX2lzRmlyc3QpIHtcbiAgICAgIG1hcC5jbGVhcigpO1xuICAgICAgbWFwLm1vZGUoJ2RyYXcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RlZE1Hcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX29uTW91c2VPdXQoKTtcbiAgfSxcbiAgX29uTW91c2VPdmVyICgpIHtcbiAgICBpZiAoIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpKSB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgdmFyIGxheWVyID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKVswXTtcbiAgICAgIGlmIChsYXllciAmJiBsYXllci5faXNGaXJzdCkge1xuICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5yZWplY3RDaGFuZ2VzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmRlbGV0ZVNlbGVjdGVkRWRnZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX29uTW91c2VPdXQgKCkge1xuICAgIGlmICghTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJykpIHtcbiAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9XG4gIH1cbn0pOyIsImltcG9ydCBzZWFyY2ggZnJvbSAnLi4vdXRpbHMvc2VhcmNoJztcbmltcG9ydCBUcmFzaEJ0biBmcm9tICcuLi9leHRlbmRlZC9UcmFzaEJ0bic7XG5pbXBvcnQgTG9hZEJ0biBmcm9tICcuLi9leHRlbmRlZC9Mb2FkQnRuJztcbmltcG9ydCBCdG5Db250cm9sIGZyb20gJy4uL2V4dGVuZGVkL0J0bkNvbnRyb2wnO1xuaW1wb3J0IE1zZ0hlbHBlciBmcm9tICcuLi9leHRlbmRlZC9Nc2dIZWxwZXInO1xuaW1wb3J0IG0gZnJvbSAnLi4vdXRpbHMvbW9iaWxlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICBzZWFyY2goKTtcblxuICB2YXIgZ2dsID0gbmV3IEwuR29vZ2xlKCk7XG5cbiAgdGhpcy5hZGRMYXllcihnZ2wpO1xuXG4gIHRoaXMuX2NvbnRyb2xMYXllcnMgPSBuZXcgTC5Db250cm9sLkxheWVycyh7XG4gICAgJ0dvb2dsZSc6IGdnbFxuICB9KTtcblxuICB0aGlzLmFkZENvbnRyb2wodGhpcy5fY29udHJvbExheWVycyk7XG5cbiAgdGhpcy50b3VjaFpvb20uZGlzYWJsZSgpO1xuICB0aGlzLmRvdWJsZUNsaWNrWm9vbS5kaXNhYmxlKCk7XG4gIC8vdGhpcy5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICB0aGlzLmJveFpvb20uZGlzYWJsZSgpO1xuICB0aGlzLmtleWJvYXJkLmRpc2FibGUoKTtcblxuICB0aGlzLmFkZENvbnRyb2woTC5jb250cm9sLnNlYXJjaCgpKTtcblxuICB0aGlzLl9CdG5Db250cm9sID0gQnRuQ29udHJvbDtcblxuICB2YXIgdHJhc2hCdG4gPSBuZXcgVHJhc2hCdG4oe1xuICAgIGJ0bnM6IFtcbiAgICAgIHsnY2xhc3NOYW1lJzogJ2ZhIGZhLXRyYXNoJ31cbiAgICBdXG4gIH0pO1xuXG4gIHZhciBsb2FkQnRuID0gbmV3IExvYWRCdG4oe1xuICAgIGJ0bnM6IFtcbiAgICAgIHsnY2xhc3NOYW1lJzogJ2ZhIGZhLWFycm93LWNpcmNsZS1vLWRvd24gbG9hZCd9XG4gICAgXVxuICB9KTtcblxuICB2YXIgbXNnSGVscGVyID0gbmV3IE1zZ0hlbHBlcih7XG4gICAgZGVmYXVsdE1zZzogdGhpcy5vcHRpb25zLnRleHQuY2xpY2tUb1N0YXJ0RHJhd1BvbHlnb25Pbk1hcFxuICB9KTtcblxuICB0aGlzLm9uKCdtc2dIZWxwZXJBZGRlZCcsIChkYXRhKSA9PiB7XG4gICAgdmFyIG1zZ0NvbnRhaW5lciA9IGRhdGEuY29udHJvbC5fdGl0bGVDb250YWluZXI7XG5cbiAgICB0aGlzLl9tc2dDb250YWluZXIgPSBtc2dDb250YWluZXI7XG4gICAgdmFyIHRleHQgPSB0aGlzLm9wdGlvbnMudGV4dDtcblxuICAgIHRoaXMub24oJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0JywgKCkgPT4ge1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6bm90X3NlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5jbGlja1RvU2VsZWN0RWRnZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOnNlbGVjdGVkX21pZGRsZV9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBvbiBlZGl0IHBvbHlnb25cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5jbGlja1RvRHJhd0lubmVyRWRnZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgfSk7XG4gICAgICAvLyBvbiB2aWV3IHBvbHlnb25cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5jbGlja1RvRWRpdCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGhpZGUgbXNnXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjptYXJrZXJfbW91c2VvdXQnKTtcbiAgICB0aGlzLm9uKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9KTtcbiAgICAvLyBvbiBzdGFydCBkcmF3IHBvbHlnb25cbiAgICB0aGlzLm9mZignZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICB0aGlzLm9uKCdlZGl0b3I6Zmlyc3RfbWFya2VyX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5jbGlja1RvSm9pbkVkZ2VzKTtcbiAgICB9KTtcbiAgICAvLyBkYmxjbGljayB0byBqb2luXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInKTtcbiAgICB0aGlzLm9uKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmRibGNsaWNrVG9Kb2luRWRnZXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZWRpdG9yOmpvaW5fcGF0aCcsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5tc2codGhpcy5vcHRpb25zLnRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMpO1xuICAgIH0pO1xuXG4gICAgLy90b2RvOiBjb250aW51ZSB3aXRoIG9wdGlvbiAnYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uJ1xuICAgIHRoaXMub24oJ2VkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWQnLCAoZGF0YSkgPT4ge1xuICAgICAgLy8gbXNnXG4gICAgICBpZiAoZGF0YS5pbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5pbnRlcnNlY3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlbGVjdGVkTWFya2VyID0gdGhpcy5nZXRTZWxlY3RlZE1hcmtlcigpO1xuXG4gICAgICBpZighdGhpcy5oYXNMYXllcihzZWxlY3RlZE1hcmtlcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZihzZWxlY3RlZE1hcmtlciAmJiAhc2VsZWN0ZWRNYXJrZXIuX21Hcm91cC5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICAgIC8vc2V0IG1hcmtlciBzdHlsZVxuICAgICAgICBpZiAoZGF0YS5pbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAvL3NldCAnZXJyb3InIHN0eWxlXG4gICAgICAgICAgc2VsZWN0ZWRNYXJrZXIuc2V0SW50ZXJzZWN0ZWRTdHlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vcmVzdG9yZSBzdHlsZVxuICAgICAgICAgIHNlbGVjdGVkTWFya2VyLnJlc2V0U3R5bGUoKTtcbiAgICAgICAgICAvL3Jlc3RvcmUgb3RoZXIgbWFya2VycyB3aGljaCBhcmUgYWxzbyBuZWVkIHRvIHJlc2V0IHN0eWxlXG4gICAgICAgICAgdmFyIG1hcmtlcnNUb1Jlc2V0ID0gc2VsZWN0ZWRNYXJrZXIuX21Hcm91cC5nZXRMYXllcnMoKS5maWx0ZXIoKGxheWVyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKGxheWVyLl9pY29uLCAnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBtYXJrZXJzVG9SZXNldC5tYXAoKG1hcmtlcikgPT4gbWFya2VyLnJlc2V0U3R5bGUoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgaWYgKCFtLmlzTW9iaWxlQnJvd3NlcigpKSB7XG4gICAgdGhpcy5hZGRDb250cm9sKG1zZ0hlbHBlcik7XG4gICAgdGhpcy5hZGRDb250cm9sKGxvYWRCdG4pO1xuICB9XG5cbiAgdGhpcy5hZGRDb250cm9sKHRyYXNoQnRuKTtcbn0iLCJpbXBvcnQgTWFwRWRpdG9yIGZyb20gJy4uL2pzL21hcCc7XG5cbndpbmRvdy5NYXBFZGl0b3IgPSBNYXBFZGl0b3I7IiwiaW1wb3J0IFZpZXdHcm91cCBmcm9tICcuL3ZpZXcvZ3JvdXAnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcbmltcG9ydCBIb2xlc0dyb3VwIGZyb20gJy4vZWRpdC9ob2xlc0dyb3VwJztcbmltcG9ydCBFZGl0TGluZUdyb3VwIGZyb20gJy4vZWRpdC9saW5lJztcbmltcG9ydCBEYXNoZWRFZGl0TGluZUdyb3VwIGZyb20gJy4vZHJhdy9kYXNoZWQtbGluZSc7XG5cbmltcG9ydCAnLi9lZGl0L21hcmtlci1ncm91cCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdmlld0dyb3VwOiBudWxsLFxuICBlZGl0R3JvdXA6IG51bGwsXG4gIGVkaXRQb2x5Z29uOiBudWxsLFxuICBlZGl0TWFya2Vyc0dyb3VwOiBudWxsLFxuICBlZGl0TGluZUdyb3VwOiBudWxsLFxuICBkYXNoZWRFZGl0TGluZUdyb3VwOiBudWxsLFxuICBlZGl0SG9sZU1hcmtlcnNHcm91cDogbnVsbCxcbiAgc2V0TGF5ZXJzICgpIHtcbiAgICB0aGlzLnZpZXdHcm91cCA9IG5ldyBWaWV3R3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdEdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRQb2x5Z29uID0gbmV3IEVkaXRQb2x5Z29uKFtdKTtcbiAgICB0aGlzLmVkaXRNYXJrZXJzR3JvdXAgPSBuZXcgTC5NYXJrZXJHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0TGluZUdyb3VwID0gbmV3IEVkaXRMaW5lR3JvdXAoW10pO1xuICAgIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cCA9IG5ldyBEYXNoZWRFZGl0TGluZUdyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRIb2xlTWFya2Vyc0dyb3VwID0gbmV3IEhvbGVzR3JvdXAoW10pO1xuICB9XG59IiwiaW1wb3J0IEJhc2UgZnJvbSAnLi9iYXNlJztcbmltcG9ydCBDb250cm9sc0hvb2sgZnJvbSAnLi9ob29rcy9jb250cm9scyc7XG5cbmltcG9ydCAqIGFzIGxheWVycyBmcm9tICcuL2xheWVycyc7XG5pbXBvcnQgKiBhcyBvcHRzIGZyb20gJy4vb3B0aW9ucyc7XG5cbmltcG9ydCAnLi91dGlscy9hcnJheSc7XG5cbmZ1bmN0aW9uIG1hcCgpIHtcbiAgdmFyIG1hcCA9IEwuTWFwLmV4dGVuZCgkLmV4dGVuZChCYXNlLCB7XG4gICAgJDogdW5kZWZpbmVkLFxuICAgIGluaXRpYWxpemUgKGlkLCBvcHRpb25zKSB7XG4gICAgICAkLmV4dGVuZChvcHRzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0cy5vcHRpb25zKTtcbiAgICAgIEwuTWFwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgaWQsIG9wdGlvbnMpO1xuICAgICAgdGhpcy4kID0gJCh0aGlzLl9jb250YWluZXIpO1xuXG4gICAgICBsYXllcnMuc2V0TGF5ZXJzKCk7XG5cbiAgICAgIHRoaXMuX2FkZExheWVycyhbXG4gICAgICAgIGxheWVycy52aWV3R3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdEdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRQb2x5Z29uXG4gICAgICAgICwgbGF5ZXJzLmVkaXRNYXJrZXJzR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdExpbmVHcm91cFxuICAgICAgICAsIGxheWVycy5kYXNoZWRFZGl0TGluZUdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRIb2xlTWFya2Vyc0dyb3VwXG4gICAgICBdKTtcblxuICAgICAgdGhpcy5fc2V0T3ZlcmxheXMob3B0aW9ucyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUb0RyYXcpIHtcbiAgICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBfc2V0T3ZlcmxheXMgKG9wdHMpIHtcbiAgICAgIHZhciBvdmVybGF5cyA9IG9wdHMub3ZlcmxheXM7XG5cbiAgICAgIGZvciAodmFyIGkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgdmFyIG9pID0gb3ZlcmxheXNbaV07XG4gICAgICAgIHRoaXMuX2NvbnRyb2xMYXllcnMuYWRkT3ZlcmxheShvaSwgaSk7XG4gICAgICAgIG9pLmFkZFRvKHRoaXMpO1xuICAgICAgICBvaS5icmluZ1RvQmFjaygpO1xuICAgICAgICBvaS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgb2kub24oJ21vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFZHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLnZpZXdHcm91cDtcbiAgICB9LFxuICAgIGdldEVHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRHcm91cDtcbiAgICB9LFxuICAgIGdldEVQb2x5Z29uICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdFBvbHlnb247XG4gICAgfSxcbiAgICBnZXRFTWFya2Vyc0dyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdE1hcmtlcnNHcm91cDtcbiAgICB9LFxuICAgIGdldEVMaW5lR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0TGluZUdyb3VwO1xuICAgIH0sXG4gICAgZ2V0REVMaW5lICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZGFzaGVkRWRpdExpbmVHcm91cDtcbiAgICB9LFxuICAgIGdldEVITWFya2Vyc0dyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdEhvbGVNYXJrZXJzR3JvdXA7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFBvbHlnb246ICgpID0+IHRoaXMuX3NlbGVjdGVkUG9seWdvbixcbiAgICBnZXRTZWxlY3RlZE1Hcm91cCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNR3JvdXA7XG4gICAgfVxuICB9KSk7XG5cbiAgbWFwLmFkZEluaXRIb29rKENvbnRyb2xzSG9vayk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFwKCk7XG4iLCJpbXBvcnQgbSBmcm9tICcuL3V0aWxzL21vYmlsZSc7XG5cbnZhciBzaXplID0gMTtcbnZhciB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbmlmIChtLmlzTW9iaWxlQnJvd3NlcigpKSB7XG4gIHNpemUgPSAyO1xufVxuXG5leHBvcnQgdmFyIGZpcnN0SWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvbi1maXJzdFwiLFxuICBpY29uU2l6ZTogWzggKiBzaXplLCA4ICogc2l6ZV1cbn0pO1xuXG5leHBvcnQgdmFyIGljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUsIDEwICogc2l6ZV1cbn0pO1xuXG5leHBvcnQgdmFyIGRyYWdJY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uLWRyYWdcIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUgKiAzLCAxMCAqIHNpemUgKiAzXVxufSk7XG5cbmV4cG9ydCB2YXIgbWlkZGxlSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1taWRkbGUtZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUsIDEwICogc2l6ZV1cblxufSk7XG5cbi8vIGRpc2FibGUgaG92ZXIgaWNvbiB0byBzaW1wbGlmeVxuXG5leHBvcnQgdmFyIGhvdmVySWNvbiA9IGljb24gfHwgTC5kaXZJY29uKHtcbiAgICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb25cIixcbiAgICBpY29uU2l6ZTogWzIgKiA3ICogc2l6ZSwgMiAqIDcgKiBzaXplXVxuICB9KTtcblxuZXhwb3J0IHZhciBpbnRlcnNlY3Rpb25JY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvblwiLFxuICBpY29uU2l6ZTogWzIgKiA3ICogc2l6ZSwgMiAqIDcgKiBzaXplXVxufSk7IiwidmFyIHZpZXdDb2xvciA9ICcjMDBGRkZGJztcbnZhciBkcmF3Q29sb3IgPSAnIzAwRjgwMCc7XG52YXIgZWRpdENvbG9yID0gJyMwMEY4MDAnO1xudmFyIHdlaWdodCA9IDM7XG5cbmV4cG9ydCB2YXIgb3B0aW9ucyA9IHtcbiAgYWxsb3dJbnRlcnNlY3Rpb246IGZhbHNlLFxuICBhbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb246IGZhbHNlLCAvL3RvZG86IHVuZmluaXNoZWRcbiAgZm9yY2VUb0RyYXc6IHRydWUsXG4gIHRyYW5zbGF0aW9uczoge1xuICAgIHJlbW92ZVBvbHlnb246IFwicmVtb3ZlIHBvbHlnb25cIixcbiAgICByZW1vdmVQb2ludDogXCJyZW1vdmUgcG9pbnRcIlxuICB9LFxuICBvdmVybGF5czoge30sXG4gIHN0eWxlOiB7XG4gICAgdmlldzoge1xuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMixcbiAgICAgIGRhc2hBcnJheTogbnVsbCxcbiAgICAgIGNsaWNrYWJsZTogZmFsc2UsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgY29sb3I6IHZpZXdDb2xvcixcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfSxcbiAgICBkcmF3OiB7XG4gICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICBmaWxsT3BhY2l0eTogMC4yLFxuICAgICAgZGFzaEFycmF5OiAnNSwgMTAnLFxuICAgICAgY2xpY2thYmxlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiBkcmF3Q29sb3IsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH1cbiAgfSxcbiAgbWFya2VySWNvbjogdW5kZWZpbmVkLFxuICBtYXJrZXJIb3Zlckljb246IHVuZGVmaW5lZCxcbiAgZXJyb3JMaW5lU3R5bGU6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgd2VpZ2h0OiAzLFxuICAgIG9wYWNpdHk6IDEsXG4gICAgc21vb3RoRmFjdG9yOiAxXG4gIH0sXG4gIHByZXZpZXdFcnJvckxpbmVTdHlsZToge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICB3ZWlnaHQ6IDMsXG4gICAgb3BhY2l0eTogMSxcbiAgICBzbW9vdGhGYWN0b3I6IDEsXG4gICAgZGFzaEFycmF5OiAnNSwgMTAnXG4gIH0sXG4gIHRleHQ6IHtcbiAgICBpbnRlcnNlY3Rpb246IFwiU2VsZi1pbnRlcnNlY3Rpb24gaXMgcHJvaGliaXRlZFwiLFxuICAgIGRlbGV0ZVBvaW50SW50ZXJzZWN0aW9uOiBcIkRlbGV0aW9uIG9mIHBvaW50IGlzIG5vdCBwb3NzaWJsZS4gU2VsZi1pbnRlcnNlY3Rpb24gaXMgcHJvaGliaXRlZFwiLFxuICAgIHJlbW92ZVBvbHlnb246IFwiUmVtb3ZlIHBvbHlnb25cIixcbiAgICBjbGlja1RvRWRpdDogXCJjbGljayB0byBlZGl0XCIsXG4gICAgY2xpY2tUb0FkZE5ld0VkZ2VzOiBcIjxkaXY+Y2xpY2smbmJzcDsmbmJzcDs8ZGl2IGNsYXNzPSdtLWVkaXRvci1taWRkbGUtZGl2LWljb24gc3RhdGljIGdyb3VwLXNlbGVjdGVkJz48L2Rpdj4mbmJzcDsmbmJzcDt0byBhZGQgbmV3IGVkZ2VzPC9kaXY+XCIsXG4gICAgY2xpY2tUb0RyYXdJbm5lckVkZ2VzOiBcImNsaWNrIHRvIGRyYXcgaW5uZXIgZWRnZXNcIixcbiAgICBjbGlja1RvSm9pbkVkZ2VzOiBcImNsaWNrIHRvIGpvaW4gZWRnZXNcIixcbiAgICBjbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlczogXCI8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItZGl2LWljb24gc3RhdGljIGdyb3VwLXNlbGVjdGVkJz48L2Rpdj4mbmJzcDsmbmJzcDt0byByZW1vdmUgZWRnZSZuYnNwOyZuYnNwO29yJm5ic3A7Jm5ic3A7PGkgY2xhc3M9J2ZhIGZhLXRyYXNoJz48L2k+Jm5ic3A7Jm5ic3A7dG8gcmVtb3ZlIGFsbCBzZWxlY3RlZCBlZGdlczwvZGl2PlwiLFxuICAgIGNsaWNrVG9TZWxlY3RFZGdlczogXCI8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItZGl2LWljb24gc3RhdGljJz48L2Rpdj4mbmJzcDsvJm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uIHN0YXRpYyc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gc2VsZWN0IGVkZ2VzPC9kaXY+XCIsXG4gICAgZGJsY2xpY2tUb0pvaW5FZGdlczogXCJkb3VibGUgY2xpY2sgdG8gam9pbiBlZGdlc1wiLFxuICAgIGNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXA6IFwiY2xpY2sgdG8gc3RhcnQgZHJhdyBwb2x5Z29uIG9uIG1hcFwiLFxuICAgIGRlbGV0ZVNlbGVjdGVkRWRnZXM6IFwiZGVsZXRlZCBzZWxlY3RlZCBlZGdlc1wiLFxuICAgIHJlamVjdENoYW5nZXM6IFwicmVqZWN0IGNoYW5nZXNcIixcbiAgICBqc29uV2FzTG9hZGVkOiBcIkpTT04gd2FzIGxvYWRlZFwiLFxuICAgIGNoZWNrSnNvbjogXCJjaGVjayBKU09OXCIsXG4gICAgbG9hZEpzb246IFwibG9hZCBHZW9KU09OXCIsXG4gICAgZm9yZ2V0VG9TYXZlOiBcIlNhdmUgY2hhbmdlcyBieSBwcmVzc2luZyBvdXRzaWRlIG9mIHBvbHlnb25cIixcbiAgICBzZWFyY2hMb2NhdGlvbjogXCJTZWFyY2ggbG9jYXRpb25cIixcbiAgICBzdWJtaXRMb2FkQnRuOiBcInN1Ym1pdFwiXG4gIH0sXG4gIHdvcmxkQ29weUp1bXA6IHRydWVcbn07XG5cbmV4cG9ydCB2YXIgZHJhd0xpbmVTdHlsZSA9IHtcbiAgb3BhY2l0eTogMC43LFxuICBmaWxsOiBmYWxzZSxcbiAgZmlsbENvbG9yOiBkcmF3Q29sb3IsXG4gIGNvbG9yOiBkcmF3Q29sb3IsXG4gIHdlaWdodDogd2VpZ2h0LFxuICBkYXNoQXJyYXk6ICc1LCAxMCcsXG4gIHN0cm9rZTogdHJ1ZSxcbiAgY2xpY2thYmxlOiBmYWxzZVxufTsiLCJBcnJheS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIHRoaXMuc3BsaWNlKHRvLCAwLCB0aGlzLnNwbGljZShmcm9tLCAxKVswXSk7XG59O1xuQXJyYXkucHJvdG90eXBlLl9lYWNoID0gZnVuY3Rpb24oZnVuYykge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGZ1bmMuY2FsbCh0aGlzLCB0aGlzW2ldLCBpKTtcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IEFycmF5O1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBpc01vYmlsZUJyb3dzZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2hlY2sgPSBmYWxzZTtcbiAgICAoZnVuY3Rpb24gKGEpIHtcbiAgICAgIGlmICgvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vfGFuZHJvaWR8aXBhZHxwbGF5Ym9va3xzaWxrL2kudGVzdChhKSB8fCAvMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298c1xcLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXxcXC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YndcXC0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbVxcLXxjZWxsfGNodG18Y2xkY3xjbWRcXC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGNcXC1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfFxcLWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseShcXC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2ZcXC01fGdcXC1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkXFwtKG18cHx0KXxoZWlcXC18aGkocHR8dGEpfGhwKCBpfGlwKXxoc1xcLWN8aHQoYyhcXC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpXFwtKDIwfGdvfG1hKXxpMjMwfGlhYyggfFxcLXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djXFwtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fFxcLVthLXddKXxsaWJ3fGx5bnh8bTFcXC13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bVxcLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KFxcLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pXFwtfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3xcXC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG5cXC0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHRcXC1nfHFhXFwtYXxxYygwN3wxMnwyMXwzMnw2MHxcXC1bMi03XXxpXFwtKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aFxcLXxvb3xwXFwtKXxzZGtcXC98c2UoYyhcXC18MHwxKXw0N3xtY3xuZHxyaSl8c2doXFwtfHNoYXJ8c2llKFxcLXxtKXxza1xcLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aFxcLXx2XFwtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsXFwtfHRkZ1xcLXx0ZWwoaXxtKXx0aW1cXC18dFxcLW1vfHRvKHBsfHNoKXx0cyg3MHxtXFwtfG0zfG01KXx0eFxcLTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfFxcLXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoXFwtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzXFwtfHlvdXJ8emV0b3x6dGVcXC0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKSkge1xuICAgICAgICBjaGVjayA9IHRydWU7XG4gICAgICB9XG4gICAgfSkobmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8IHdpbmRvdy5vcGVyYSk7XG4gICAgcmV0dXJuIGNoZWNrO1xuICB9XG59OyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcbiAgTC5Db250cm9sLlNlYXJjaCA9IEwuQ29udHJvbC5leHRlbmQoe1xuICAgIG9wdGlvbnM6IHtcbiAgICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgICBlbWFpbDogJydcbiAgICB9LFxuXG4gICAgb25BZGQgKG1hcCkge1xuICAgICAgdGhpcy5fbWFwID0gbWFwO1xuICAgICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJhciBsZWFmbGV0LXNlYXJjaC1iYXInKTtcbiAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICB2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnJywgd3JhcHBlcik7XG4gICAgICBsaW5rLmhyZWYgPSAnIyc7XG5cbiAgICAgIHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XG4gICAgICBMLkRvbUV2ZW50XG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ21vdXNlZG93bicsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnZGJsY2xpY2snLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdClcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIHRoaXMuX3RvZ2dsZSwgdGhpcyk7XG5cbiAgICAgIGxpbmsuYXBwZW5kQ2hpbGQoTC5Eb21VdGlsLmNyZWF0ZSgnaScsICdmYSBmYS1zZWFyY2gnKSk7XG5cbiAgICAgIHZhciBmb3JtID0gdGhpcy5fZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcblxuICAgICAgdmFyIGlucHV0ID0gdGhpcy5faW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuXG4gICAgICBMLkRvbUV2ZW50Lm9uKGlucHV0LCAnY2xpY2snLCBzdG9wKTtcblxuICAgICAgZm9ybS5hcHBlbmRDaGlsZChpbnB1dCk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24oZm9ybSwgJ3N1Ym1pdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fZG9TZWFyY2goaW5wdXQudmFsdWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCB0aGlzKS5vbihmb3JtLCAnc3VibWl0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cblxuICAgICAgdGhpcy5fbWFwLm9uKCdsb2FkQnRuT3BlbmVkJywgdGhpcy5fY29sbGFwc2UsIHRoaXMpO1xuXG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGNvbnRhaW5lciwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoY29udGFpbmVyLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcblxuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9LFxuXG4gICAgX3RvZ2dsZSAoKSB7XG4gICAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgdGhpcy5faW5wdXQuZm9jdXMoKTtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ3NlYXJjaEVuYWJsZWQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgICAgIHRoaXMuX21hcC5maXJlKCdzZWFyY2hEaXNhYmxlZCcpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY29sbGFwc2UgKCkge1xuICAgICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgdGhpcy5faW5wdXQudmFsdWUgPSAnJztcbiAgICB9LFxuXG4gICAgX25vbWluYXRpbUNhbGxiYWNrIChyZXN1bHRzKSB7XG5cbiAgICAgIGlmICh0aGlzLl9yZXN1bHRzKSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdHMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9yZXN1bHRzKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3VsdHNDb250YWluZXIgPSB0aGlzLl9yZXN1bHRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9ICc4MHB4JztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUub3ZlcmZsb3dZID0gJ2F1dG8nO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1ggPSAnaGlkZGVuJztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUubWFyZ2luID0gJzNweCc7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLnBhZGRpbmcgPSAnMnB4JztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYm9yZGVyID0gJzJweCBncmV5IHNvbGlkJztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzJweCc7XG5cbiAgICAgIHZhciBkaXZSZXN1bHRzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGl2ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ3NlYXJjaC1yZXN1bHRzLWVsJyk7XG4gICAgICAgIGRpdi5pbm5lclRleHQgPSByZXN1bHRzW2ldLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgZGl2LnRpdGxlID0gcmVzdWx0c1tpXS5kaXNwbGF5X25hbWU7XG4gICAgICAgIHJlc3VsdHNDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgICB2YXIgY2FsbGJhY2sgPSAoZnVuY3Rpb24gKG1hcCwgcmVzdWx0LCBkaXZFbCkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRpdlJlc3VsdHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKGRpdlJlc3VsdHNbal0sICdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKGRpdkVsLCAnc2VsZWN0ZWQnKTtcblxuICAgICAgICAgICAgdmFyIGJib3ggPSByZXN1bHQuYm91bmRpbmdib3g7XG4gICAgICAgICAgICBtYXAuZml0Qm91bmRzKEwubGF0TG5nQm91bmRzKFtbYmJveFswXSwgYmJveFsyXV0sIFtiYm94WzFdLCBiYm94WzNdXV0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0odGhpcy5fbWFwLCByZXN1bHRzW2ldLCBkaXYpKTtcblxuICAgICAgICBMLkRvbUV2ZW50Lm9uKGRpdiwgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnbW91c2V3aGVlbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAgIC5vbihkaXYsICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgICBkaXZSZXN1bHRzLnB1c2goZGl2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZm9ybS5hcHBlbmRDaGlsZChyZXN1bHRzQ29udGFpbmVyKTtcblxuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdHMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9yZXN1bHRzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2NhbGxiYWNrSWQ6IDAsXG5cbiAgICBfZG9TZWFyY2ggKHF1ZXJ5KSB7XG4gICAgICB2YXIgY2FsbGJhY2sgPSAnX2xfb3NtZ2VvY29kZXJfJyArIHRoaXMuX2NhbGxiYWNrSWQrKztcbiAgICAgIHdpbmRvd1tjYWxsYmFja10gPSBMLlV0aWwuYmluZCh0aGlzLl9ub21pbmF0aW1DYWxsYmFjaywgdGhpcyk7XG4gICAgICB2YXIgcXVlcnlQYXJhbXMgPSB7XG4gICAgICAgIHE6IHF1ZXJ5LFxuICAgICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAnanNvbl9jYWxsYmFjayc6IGNhbGxiYWNrXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lbWFpbClcbiAgICAgICAgcXVlcnlQYXJhbXMuZW1haWwgPSB0aGlzLm9wdGlvbnMuZW1haWw7XG4gICAgICBpZiAodGhpcy5fbWFwLmdldEJvdW5kcygpKVxuICAgICAgICBxdWVyeVBhcmFtcy52aWV3Ym94ID0gdGhpcy5fbWFwLmdldEJvdW5kcygpLnRvQkJveFN0cmluZygpO1xuICAgICAgdmFyIHVybCA9ICdodHRwOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaCcgKyBMLlV0aWwuZ2V0UGFyYW1TdHJpbmcocXVlcnlQYXJhbXMpO1xuICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgfSxcbiAgICBfb25Nb3VzZU92ZXIgKCkge1xuICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIubXNnKHRoaXMuX21hcC5vcHRpb25zLnRleHQuc2VhcmNoTG9jYXRpb24pO1xuICAgIH0sXG4gICAgX29uTW91c2VPdXQgKCkge1xuICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgTC5jb250cm9sLnNlYXJjaCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMLkNvbnRyb2wuU2VhcmNoKG9wdGlvbnMpO1xuICB9O1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvYmplY3QgPSB7fSwgYXJyYXkgPSBbXSkge1xuICB2YXIgcnNsdCA9IG9iamVjdDtcblxuICB2YXIgdG1wO1xuICB2YXIgX2Z1bmMgPSBmdW5jdGlvbiAoaWQsIGluZGV4KSB7XG4gICAgdmFyIHBvc2l0aW9uID0gcnNsdFtpZF0ucG9zaXRpb247XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChwb3NpdGlvbiAhPT0gaW5kZXgpIHtcbiAgICAgICAgdG1wID0gcnNsdFtpZF07XG4gICAgICAgIHJzbHRbaWRdID0gcnNsdFthcnJheVtwb3NpdGlvbl1dO1xuICAgICAgICByc2x0W2FycmF5W3Bvc2l0aW9uXV0gPSB0bXA7XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiAhPSBpbmRleCkge1xuICAgICAgICBfZnVuYy5jYWxsKG51bGwsIGlkLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBhcnJheS5mb3JFYWNoKF9mdW5jKTtcblxuICByZXR1cm4gcnNsdDtcbn07IiwiZXhwb3J0IGRlZmF1bHQgTC5NdWx0aVBvbHlnb24uZXh0ZW5kKHtcbiAgaW5pdGlhbGl6ZSAobGF0bG5ncywgb3B0aW9ucykge1xuICAgIEwuTXVsdGlQb2x5Z29uLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5ncywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm9uKCdsYXllcmFkZCcsIChlKSA9PiB7XG4gICAgICB2YXIgbVZpZXdTdHlsZSA9IHRoaXMuX21hcC5vcHRpb25zLnN0eWxlLnZpZXc7XG4gICAgICBlLnRhcmdldC5zZXRTdHlsZSgkLmV4dGVuZCh7XG4gICAgICAgIG9wYWNpdHk6IDAuNyxcbiAgICAgICAgZmlsbE9wYWNpdHk6IDAuMzUsXG4gICAgICAgIGNvbG9yOiAnIzAwQUJGRidcbiAgICAgIH0sIG1WaWV3U3R5bGUpKTtcblxuICAgICAgdGhpcy5fbWFwLl9tb3ZlRVBvbHlnb25PblRvcCgpO1xuICAgIH0pO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5NdWx0aVBvbHlnb24ucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIHRoaXMub24oJ21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKCFlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLm9uKCdtb3VzZW91dCcsICgpID0+IHtcbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoIWVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgfVxufSk7Il19
