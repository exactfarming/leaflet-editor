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
      this.fitBounds(ePolygon.getBounds());
      this._msgContainer.msg(this.options.text.forgetToSave);
    } else {
      this.clear();
      this.mode('draw');

      var geojson = this.getVGroup().toGeoJSON();
      if (geojson.geometry) {
        return geojson.geometry;
      }
      return {};
    }
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

    var layers = geoJson.getLayers ? geoJson.getLayers() : [layer];
    var vGroup = this.getVGroup();
    for (var i = 0; i < layers.length; i++) {
      var _l = layers[i];
      vGroup.addLayer(_l);
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

    this._map = map;

    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-editor-buttons');

    map._controlContainer.appendChild(container);

    setTimeout(function () {
      _this._setBtn(_this.options.btns, container);
      if (_this.options.eventName) {
        map.fire(_this.options.eventName, { control: _this });
      }
    }, 1000);

    map.getBtnControl = function () {
      return _this;
    };

    return container;
  },
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
      L.DomEvent.addListener(_this._btn, 'mouseover', _this._onMouseOver, _this);
      L.DomEvent.addListener(_this._btn, 'mouseout', _this._onMouseOut, _this);

      L.DomEvent.on(_this._btn, 'click', _this.stopEvent).on(_this._btn, 'click', _this._toggle, _this);

      _this._map.on('searchEnabled', _this._collapse, _this);

      _this._renderForm(container);
    });

    L.DomUtil.addClass(container, 'load-json-container');

    return container;
  },
  _toggle: function _toggle() {
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

    map.on('btnPressed', function () {
      if (_this._btn && !L.DomUtil.hasClass(_this._btn, 'disabled')) {
        _this._onPressBtn();
      }
    });

    map.on('trashAdded', function () {
      L.DomUtil.addClass(_this._btn, 'disabled');

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
    forgetToSave: "Save changes by pressing outside of polygon"
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
      title: 'search location',
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
      this._map._msgContainer.msg(this.options.title);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvYmFzZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9kcmF3L2Rhc2hlZC1saW5lLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZXZlbnRzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvaG9sZXNHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L2xpbmUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXItZ3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXIuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9wb2x5Z29uLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0Jhc2VNYXJrZXJHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9CdG5Db250cm9sLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0xvYWRCdG4uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTXNnSGVscGVyLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL1BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvVG9vbHRpcC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9UcmFzaEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9pbmRleC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9sYXllcnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvbWFwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL21hcmtlci1pY29ucy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9vcHRpb25zLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL2FycmF5LmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL21vYmlsZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy91dGlscy9zZWFyY2guanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdXRpbHMvc29ydEJ5UG9zaXRpb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdmlldy9ncm91cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzBCQ0F1QixlQUFlOzs7OzJCQUNkLGdCQUFnQjs7OztxQkFFekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN0QixpQkFB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RyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1NBQzFDO09BQ0Y7S0FDRixDQUFDLENBQUM7R0FDSjtBQUNELFVBQVEsRUFBQyxrQkFBQyxHQUFHLEVBQUU7QUFDYixRQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXJCLE9BQUcsQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUN6QyxPQUFHLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7R0FDekM7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEcmF3RXZlbnRzIGZyb20gJy4vZHJhdy9ldmVudHMnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcblxuZXhwb3J0IGRlZmF1bHQgJC5leHRlbmQoe1xuICBfc2VsZWN0ZWRNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX3NlbGVjdGVkVkxheWVyOiB1bmRlZmluZWQsXG4gIF9vbGRTZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkOiBmYWxzZSxcbiAgX21vZGVUeXBlOiAnZHJhdycsXG4gIF9jb250cm9sTGF5ZXJzOiB1bmRlZmluZWQsXG4gIF9nZXRTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkVkxheWVyO1xuICB9LFxuICBfc2V0U2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2NsZWFyU2VsZWN0ZWRWTGF5ZXIgKCkge1xuICAgIHRoaXMuX3NlbGVjdGVkVkxheWVyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfaGlkZVNlbGVjdGVkVkxheWVyIChsYXllcikge1xuICAgIGxheWVyLmJyaW5nVG9CYWNrKCk7XG5cbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vc2hvdyBsYXN0IGxheWVyXG4gICAgdGhpcy5fc2hvd1NlbGVjdGVkVkxheWVyKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgIC8vaGlkZVxuICAgIHRoaXMuX3NldFNlbGVjdGVkVkxheWVyKGxheWVyKTtcbiAgICBsYXllci5fcGF0aC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIH0sXG4gIF9zaG93U2VsZWN0ZWRWTGF5ZXIgKGxheWVyID0gdGhpcy5fc2VsZWN0ZWRWTGF5ZXIpIHtcbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcbiAgfSxcbiAgX2FkZEVHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgZUdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGlmICghbGF5ZXIuaXNFbXB0eSgpKSB7XG4gICAgICAgIHZhciBob2xlcyA9IGxheWVyLl9ob2xlcztcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgICAgICBsYXRsbmdzID0gW2xhdGxuZ3NdLmNvbmNhdChob2xlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZHcm91cC5hZGRMYXllcihMLnBvbHlnb24obGF0bG5ncykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfYWRkRVBvbHlnb25fVG9fVkdyb3VwICgpIHtcbiAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG5cbiAgICB2YXIgaG9sZXMgPSBlUG9seWdvbi5nZXRIb2xlcygpO1xuICAgIHZhciBsYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoIDw9IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gIH0sXG4gIF9zZXRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgc2VsZWN0ZWRWTGF5ZXIgPSB0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgaWYgKCFzZWxlY3RlZFZMYXllcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGVjdGVkVkxheWVyLl9sYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuICAgIHNlbGVjdGVkVkxheWVyLl9ob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIucmVkcmF3KCk7XG4gIH0sXG4gIF9jb252ZXJ0X0VHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLl9hZGRFR3JvdXBfVG9fVkdyb3VwKCk7XG4gIH0sXG4gIF9jb252ZXJ0VG9FZGl0IChncm91cCkge1xuICAgIGlmIChncm91cCBpbnN0YW5jZW9mIEwuTXVsdGlQb2x5Z29uKSB7XG4gICAgICB2YXIgZUdyb3VwID0gdGhpcy5nZXRFR3JvdXAoKTtcblxuICAgICAgZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAgIGdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG5cbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihsYXRsbmdzKTtcbiAgICAgICAgZWRpdFBvbHlnb24uYWRkVG8odGhpcyk7XG4gICAgICAgIGVHcm91cC5hZGRMYXllcihlZGl0UG9seWdvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBlR3JvdXA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NYXJrZXJHcm91cCkge1xuICAgICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgICAgdmFyIGxheWVycyA9IGdyb3VwLmdldExheWVycygpO1xuICAgICAgbGF5ZXJzID0gbGF5ZXJzLmZpbHRlcigobGF5ZXIpID0+ICFsYXllci5pc01pZGRsZSgpKTtcbiAgICAgIHZhciBwb2ludHNBcnJheSA9IGxheWVycy5tYXAoKGxheWVyKSA9PiBsYXllci5nZXRMYXRMbmcoKSk7XG5cbiAgICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG5cbiAgICAgIGlmIChob2xlcykge1xuICAgICAgICBwb2ludHNBcnJheSA9IFtwb2ludHNBcnJheV0uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cblxuICAgICAgZVBvbHlnb24uc2V0TGF0TG5ncyhwb2ludHNBcnJheSk7XG4gICAgICBlUG9seWdvbi5yZWRyYXcoKTtcblxuICAgICAgcmV0dXJuIGVQb2x5Z29uO1xuICAgIH1cbiAgfSxcbiAgX3NldE1vZGUgKHR5cGUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAvL3RoaXMuZ2V0Vkdyb3VwKCkuc2V0U3R5bGUob3B0aW9ucy5zdHlsZVt0eXBlXSk7XG4gICAgLy90aGlzLmdldEVHcm91cCgpLnNldFN0eWxlKG9wdGlvbnMuZWRpdEdyb3VwU3R5bGUubW9kZVt0eXBlXSk7XG5cbiAgICAvL2lmICghdGhpcy5pc01vZGUoJ2VkaXQnKSkge1xuICAgIHRoaXMuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZShvcHRpb25zLnN0eWxlW3R5cGVdKTtcbiAgICAvL31cblxuICAgIC8vdGhpcy5fc2V0TWFya2Vyc0dyb3VwSWNvbih0aGlzLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgLy90aGlzLiQudHJpZ2dlcih7dHlwZTogJ21vZGUnLCB2YWx1ZTogdHlwZX0pO1xuICAgIC8vdGhpcy4kLnRyaWdnZXIoe3R5cGU6ICdtb2RlOicgKyB0eXBlfSk7XG4gIH0sXG5cbiAgX2dldE1vZGVUeXBlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIF9zZXRNb2RlVHlwZSAodHlwZSkge1xuICAgIHRoaXMuJC5yZW1vdmVDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gICAgdGhpcy5fbW9kZVR5cGUgPSB0eXBlO1xuICAgIHRoaXMuJC5hZGRDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gIH0sXG4gIF9zZXRNYXJrZXJzR3JvdXBJY29uIChtYXJrZXJHcm91cCkge1xuICAgIHZhciBtSWNvbiA9IHRoaXMub3B0aW9ucy5tYXJrZXJJY29uO1xuICAgIHZhciBtSG92ZXJJY29uID0gdGhpcy5vcHRpb25zLm1hcmtlckhvdmVySWNvbjtcblxuICAgIHZhciBtb2RlID0gdGhpcy5fZ2V0TW9kZVR5cGUoKTtcbiAgICBpZiAobUljb24pIHtcbiAgICAgIGlmICghbUljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gbUljb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWNvbiA9IG1JY29uLm1vZGVbbW9kZV07XG4gICAgICAgIGlmIChpY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtSG92ZXJJY29uKSB7XG4gICAgICBpZiAoIW1Ib3Zlckljb24ubW9kZSkge1xuICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBtSG92ZXJJY29uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGljb24gPSBtSG92ZXJJY29uW21vZGVdO1xuICAgICAgICBpZiAoaWNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gaWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiB8fCBtYXJrZXJHcm91cC5vcHRpb25zLm1JY29uO1xuXG4gICAgaWYgKG1vZGUgPT09IFwiYWZ0ZXJEcmF3XCIpIHtcbiAgICAgIG1hcmtlckdyb3VwLnVwZGF0ZVN0eWxlKCk7XG4gICAgfVxuICB9LFxuICAvL21vZGVzOiAndmlldycsICdlZGl0JywgJ2RyYXcnLCAnbGlzdCdcbiAgbW9kZSAodHlwZSkge1xuICAgIHRoaXMuZmlyZSh0aGlzLl9tb2RlVHlwZSArICdfZXZlbnRzX2Rpc2FibGUnKTtcbiAgICB0aGlzLmZpcmUodHlwZSArICdfZXZlbnRzX2VuYWJsZScpO1xuXG4gICAgdGhpcy5fc2V0TW9kZVR5cGUodHlwZSk7XG5cbiAgICBpZiAodHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbW9kZVR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsZWFyRXZlbnRzKCk7XG4gICAgICB0eXBlID0gdGhpc1t0eXBlXSgpIHx8IHR5cGU7XG4gICAgICB0aGlzLl9zZXRNb2RlKHR5cGUpO1xuICAgIH1cbiAgfSxcbiAgaXNNb2RlICh0eXBlKSB7XG4gICAgcmV0dXJuIHR5cGUgPT09IHRoaXMuX21vZGVUeXBlO1xuICB9LFxuICAvL3ZpZWV3ICgpIHtcbiAgLy8gIGlmICh0aGlzLmlzTW9kZSgnZWRpdCcpIHx8IHRoaXMuaXNNb2RlKCdkcmF3JykgfHwgdGhpcy5pc01vZGUoJ2FmdGVyRHJhdycpKSB7XG4gIC8vICAgIHRoaXMuX2NsZWFyTWFwKCk7XG4gIC8vXG4gIC8vICB9XG4gIC8vICB0aGlzLl9maXRWQm91bmRzKCk7XG4gIC8vICB0aGlzLl9iaW5kVmlld0V2ZW50cygpO1xuICAvL30sXG4gIGRyYXcgKCkge1xuICAgIGlmICh0aGlzLmlzTW9kZSgnZWRpdCcpIHx8IHRoaXMuaXNNb2RlKCd2aWV3JykgfHwgdGhpcy5pc01vZGUoJ2FmdGVyRHJhdycpKSB7XG4gICAgICB0aGlzLl9jbGVhck1hcCgpO1xuXG4gICAgfVxuICAgIHRoaXMuX2JpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5fY2xlYXJNYXAoKTtcblxuICAgIHRoaXMubW9kZSgndmlldycpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICB0aGlzLl9jbGVhck1hcCgpO1xuICAgIHRoaXMuZmlyZSgnZWRpdG9yOm1hcF9jbGVhcmVkJyk7XG4gIH0sXG4gIGNsZWFyQWxsICgpIHtcbiAgICB0aGlzLm1vZGUoJ3ZpZXcnKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5jbGVhckxheWVycygpO1xuICB9LFxuICAvKipcbiAgICpcbiAgICogVGhlIG1haW4gaWRlYSBpcyB0byBzYXZlIEVQb2x5Z29uIHRvIFZHcm91cCB3aGVuOlxuICAgKiAxKSB1c2VyIGFkZCBuZXcgcG9seWdvblxuICAgKiAyKSB3aGVuIHVzZXIgZWRpdCBwb2x5Z29uXG4gICAqXG4gICAqICovXG4gICAgc2F2ZVN0YXRlICgpIHtcblxuICAgIHZhciBlUG9seWdvbiA9IF9tYXAuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmKCFlUG9seWdvbi5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMuZml0Qm91bmRzKGVQb2x5Z29uLmdldEJvdW5kcygpKTtcbiAgICAgIHRoaXMuX21zZ0NvbnRhaW5lci5tc2codGhpcy5vcHRpb25zLnRleHQuZm9yZ2V0VG9TYXZlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICAgIHZhciBnZW9qc29uID0gdGhpcy5nZXRWR3JvdXAoKS50b0dlb0pTT04oKTtcbiAgICAgIGlmIChnZW9qc29uLmdlb21ldHJ5KSB7XG4gICAgICAgIHJldHVybiBnZW9qc29uLmdlb21ldHJ5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSxcbiAgZ2V0U2VsZWN0ZWRNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZE1hcmtlcjtcbiAgfSxcbiAgY2xlYXJTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBudWxsO1xuICB9LFxuICByZW1vdmVTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgdmFyIHNlbGVjdGVkTWFya2VyID0gdGhpcy5fc2VsZWN0ZWRNYXJrZXI7XG4gICAgdmFyIHByZXZNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5wcmV2KCk7XG4gICAgdmFyIG5leHRNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5uZXh0KCk7XG4gICAgdmFyIG1pZGxlUHJldk1hcmtlciA9IHNlbGVjdGVkTWFya2VyLl9taWRkbGVQcmV2O1xuICAgIHZhciBtaWRkbGVOZXh0TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIuX21pZGRsZU5leHQ7XG4gICAgc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBtaWRsZVByZXZNYXJrZXI7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBtaWRkbGVOZXh0TWFya2VyO1xuICAgIHRoaXMuX3NlbGVjdGVkTWFya2VyLnJlbW92ZSgpO1xuICAgIHByZXZNYXJrZXIuX21pZGRsZU5leHQgPSBudWxsO1xuICAgIG5leHRNYXJrZXIuX21pZGRsZVByZXYgPSBudWxsO1xuICB9LFxuICByZW1vdmVQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgLy90aGlzLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHBvbHlnb24uY2xlYXIoKTtcblxuICAgIGlmICh0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJTZWxlY3RlZE1hcmtlcigpO1xuICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICB9LFxuICBjcmVhdGVFZGl0UG9seWdvbiAoanNvbikge1xuICAgIHZhciBnZW9Kc29uID0gTC5nZW9Kc29uKGpzb24pO1xuXG4gICAgdGhpcy5jbGVhcigpO1xuXG4gICAgdmFyIGxheWVycyA9IGdlb0pzb24uZ2V0TGF5ZXJzID8gZ2VvSnNvbi5nZXRMYXllcnMoKSA6IFtsYXllcl07XG4gICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBfbCA9IGxheWVyc1tpXTtcbiAgICAgIHZHcm91cC5hZGRMYXllcihfbCk7XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICB0aGlzLl9maXRWQm91bmRzKCk7XG4gIH0sXG4gIG1vdmVNYXJrZXIgKGxhdGxuZykge1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldFNlbGVjdGVkKCkuc2V0TGF0TG5nKGxhdGxuZyk7XG4gIH0sXG4gIF9maXRWQm91bmRzICgpIHtcbiAgICBpZiAodGhpcy5nZXRWR3JvdXAoKS5nZXRMYXllcnMoKS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMuZml0Qm91bmRzKHRoaXMuZ2V0Vkdyb3VwKCkuZ2V0Qm91bmRzKCksIHtwYWRkaW5nOiBbMzAsIDMwXX0pO1xuICAgICAgLy90aGlzLmludmFsaWRhdGVTaXplKCk7XG4gICAgfVxuICB9LFxuICBfY2xlYXJNYXAgKCkge1xuICAgIHRoaXMuZ2V0RUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5jbGVhcigpO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IHRoaXMuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcblxuICAgIGlmIChzZWxlY3RlZE1Hcm91cCkge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuX3Nob3dTZWxlY3RlZFZMYXllcigpO1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRWTGF5ZXIoKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcbiAgfSxcbiAgX2NsZWFyRXZlbnRzICgpIHtcbiAgICAvL3RoaXMuX3VuQmluZFZpZXdFdmVudHMoKTtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIF9hY3RpdmVFZGl0TGF5ZXI6IHVuZGVmaW5lZCxcbiAgX3NldEFjdGl2ZUVkaXRMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2dldEFjdGl2ZUVkaXRMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUVkaXRMYXllcjtcbiAgfSxcbiAgX2NsZWFyQWN0aXZlRWRpdExheWVyICgpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBudWxsO1xuICB9LFxuICBfc2V0RUhNYXJrZXJHcm91cCAoYXJyYXlMYXRMbmcpIHtcbiAgICB2YXIgaG9sZU1hcmtlckdyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuX2lzSG9sZSA9IHRydWU7XG5cbiAgICB0aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKGhvbGVNYXJrZXJHcm91cCk7XG5cbiAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgaG9sZU1hcmtlckdyb3VwLmFkZFRvKGVoTWFya2Vyc0dyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cExheWVycyA9IGVoTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgdmFyIGhHcm91cFBvcyA9IGVoTWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaG9sZU1hcmtlckdyb3VwLl9wb3NpdGlvbiA9IGhHcm91cFBvcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMYXRMbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHNldCBob2xlIG1hcmtlclxuICAgICAgaG9sZU1hcmtlckdyb3VwLnNldEhvbGVNYXJrZXIoYXJyYXlMYXRMbmdbaV0sIHVuZGVmaW5lZCwge30sIHtoR3JvdXA6IGhHcm91cFBvcywgaE1hcmtlcjogaX0pO1xuICAgIH1cblxuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgbGF5ZXJzLm1hcCgobGF5ZXIsIHBvc2l0aW9uKSA9PiB7XG4gICAgICBob2xlTWFya2VyR3JvdXAuX3NldE1pZGRsZU1hcmtlcnMobGF5ZXIsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgbGF5ZXJzID0gaG9sZU1hcmtlckdyb3VwLmdldExheWVycygpO1xuXG4gICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICBlUG9seWdvbi51cGRhdGVIb2xlUG9pbnQoaEdyb3VwUG9zLCBsYXllci5fX3Bvc2l0aW9uLCBsYXllci5fbGF0bG5nKTtcbiAgICB9KTtcblxuICAgIC8vZVBvbHlnb24uc2V0SG9sZSgpXG4gICAgcmV0dXJuIGhvbGVNYXJrZXJHcm91cDtcbiAgfSxcbiAgX21vdmVFUG9seWdvbk9uVG9wICgpIHtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgaWYgKGVQb2x5Z29uLl9jb250YWluZXIpIHtcbiAgICAgIHZhciBsYXN0Q2hpbGQgPSAkKGVQb2x5Z29uLl9jb250YWluZXIucGFyZW50RWxlbWVudCkuY2hpbGRyZW4oKS5sYXN0KCk7XG4gICAgICB2YXIgJGVQb2x5Z29uID0gJChlUG9seWdvbi5fY29udGFpbmVyKTtcbiAgICAgIGlmICgkZVBvbHlnb25bMF0gIT09IGxhc3RDaGlsZCkge1xuICAgICAgICAkZVBvbHlnb24uZGV0YWNoKCkuaW5zZXJ0QWZ0ZXIobGFzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc3RvcmVFUG9seWdvbiAocG9seWdvbikge1xuICAgIHBvbHlnb24gPSBwb2x5Z29uIHx8IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHNldCBtYXJrZXJzXG4gICAgdmFyIGxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcblxuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLnNldEFsbChsYXRsbmdzKTtcblxuICAgIC8vdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG5cbiAgICAvLyBzZXQgaG9sZSBtYXJrZXJzXG4gICAgdmFyIGhvbGVzID0gcG9seWdvbi5nZXRIb2xlcygpO1xuICAgIGlmIChob2xlcykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBob2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGdldENvbnRyb2xMYXllcnM6ICgpID0+IHRoaXMuX2NvbnRyb2xMYXllcnMsXG4gIGVkZ2VzSW50ZXJzZWN0ZWQgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCA9IHZhbHVlO1xuICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZmlyZShcImVkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWRcIiwge2ludGVyc2VjdGlvbjogdHJ1ZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7aW50ZXJzZWN0aW9uOiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2Vycm9yVGltZW91dDogbnVsbCxcbiAgX3Nob3dJbnRlcnNlY3Rpb25FcnJvciAodGV4dCkge1xuXG4gICAgaWYgKHRoaXMuX2Vycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Vycm9yVGltZW91dCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbXNnQ29udGFpbmVyLm1zZyh0ZXh0IHx8IHRoaXMub3B0aW9ucy50ZXh0LmludGVyc2VjdGlvbiwgJ2Vycm9yJyk7XG5cbiAgICB0aGlzLl9lcnJvclRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSwgMTAwMCk7XG4gIH1cbn0sIERyYXdFdmVudHMpO1xuIiwiaW1wb3J0ICogYXMgb3B0cyBmcm9tICcuLi9vcHRpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgTC5Qb2x5bGluZS5leHRlbmQoe1xuICBvcHRpb25zOiBvcHRzLmRyYXdMaW5lU3R5bGUsXG4gIF9sYXRsbmdUb01vdmU6IHVuZGVmaW5lZCxcbiAgYWRkTGF0TG5nIChsYXRsbmcpIHtcbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhdGxuZ3MubGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5fbGF0bG5ncy5zcGxpY2UoLTEpO1xuICAgIH1cblxuICAgIHRoaXMuX2xhdGxuZ3MucHVzaChMLmxhdExuZyhsYXRsbmcpKTtcblxuICAgIHJldHVybiB0aGlzLnJlZHJhdygpO1xuICB9LFxuICB1cGRhdGUgKHBvcykge1xuXG4gICAgaWYgKCF0aGlzLl9sYXRsbmdUb01vdmUgJiYgdGhpcy5fbGF0bG5ncy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IEwubGF0TG5nKHBvcyk7XG4gICAgICB0aGlzLl9sYXRsbmdzLnB1c2godGhpcy5fbGF0bG5nVG9Nb3ZlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xhdGxuZ1RvTW92ZSkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlLmxhdCA9IHBvcy5sYXQ7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubG5nID0gcG9zLmxuZztcblxuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9hZGRMaW5lIChsaW5lLCBncm91cCwgaXNMYXN0TWFya2VyKSB7XG4gICAgaWYgKCFpc0xhc3RNYXJrZXIpIHtcbiAgICAgIGxpbmUuYWRkVG8oZ3JvdXApO1xuICAgIH1cbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHRoaXMuc2V0TGF0TG5ncyhbXSk7XG4gIH1cbn0pOyIsImltcG9ydCB7Zmlyc3RJY29uLGljb24sZHJhZ0ljb24sbWlkZGxlSWNvbixob3Zlckljb24saW50ZXJzZWN0aW9uSWNvbn0gZnJvbSAnLi4vbWFya2VyLWljb25zJztcbmV4cG9ydCBkZWZhdWx0IHtcbiAgX2JpbmREcmF3RXZlbnRzICgpIHtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG5cbiAgICAvLyBjbGljayBvbiBtYXBcbiAgICB0aGlzLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAvLyBidWcgZml4XG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRYID09PSAwICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRZID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKChlLnRhcmdldCBpbnN0YW5jZW9mIEwuTWFya2VyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gZS50YXJnZXQuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgICAvLyBzdGFydCBhZGQgbmV3IHBvbHlnb25cbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZSk7XG5cbiAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19wb2x5Z29uJyk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkTUdyb3VwID0gZU1hcmtlcnNHcm91cDtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBjb250aW51ZSB3aXRoIG5ldyBwb2x5Z29uXG4gICAgICB2YXIgZmlyc3RNYXJrZXIgPSBlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCk7XG5cbiAgICAgIGlmIChmaXJzdE1hcmtlciAmJiBmaXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKCEoZS50YXJnZXQgaW5zdGFuY2VvZiBMLk1hcmtlcikpIHtcbiAgICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBzdGFydCBkcmF3IG5ldyBob2xlIHBvbHlnb25cbiAgICAgIHZhciBlaE1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChmaXJzdE1hcmtlciAmJiAhZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICgoZS50YXJnZXQuZ2V0RVBvbHlnb24oKS5fcGF0aCA9PSBlLm9yaWdpbmFsRXZlbnQudG9FbGVtZW50KSkge1xuICAgICAgICAgIGlmICghZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKSkge1xuICAgICAgICAgICAgdmFyIGxhc3RIR3JvdXAgPSBlaE1hcmtlcnNHcm91cC5hZGRIb2xlR3JvdXAoKTtcbiAgICAgICAgICAgIGxhc3RIR3JvdXAuc2V0KGUubGF0bG5nLCBudWxsLCB7aWNvbjogZmlyc3RJY29ufSk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWRNR3JvdXAgPSBsYXN0SEdyb3VwO1xuICAgICAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19ob2xlJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICBpZiAoZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKSkge1xuICAgICAgICBpZiAodGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2lzTWFya2VySW5Qb2x5Z29uKGUubGF0bG5nKSkge1xuICAgICAgICAgIHZhciBtYXJrZXIgPSBlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpLnNldChlLmxhdGxuZyk7XG4gICAgICAgICAgdmFyIHJzbHQgPSBtYXJrZXIuX2RldGVjdEludGVyc2VjdGlvbigpOyAvLyBpbiBjYXNlIG9mIGhvbGVcbiAgICAgICAgICBpZihyc2x0KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcblxuICAgICAgICAgICAgLy9tYXJrZXIuX21Hcm91cC5yZW1vdmVNYXJrZXIobWFya2VyKTsgLy90b2RvOiBkZXRlY3QgaW50ZXJzZWN0aW9uIGZvciBob2xlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVzZXRcblxuICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBlLm1Hcm91cDtcblxuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuX2lzSG9sZSkge1xuICAgICAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRMYXN0SG9sZSgpO1xuICAgICAgfVxuICAgICAgLy8xLiBzZXQgbWlkZGxlIG1hcmtlcnNcbiAgICAgIHZhciBsYXllcnMgPSBlTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgICB2YXIgcG9zaXRpb24gPSAtMTtcbiAgICAgIGxheWVycy5mb3JFYWNoKCgpID0+IHtcbiAgICAgICAgdmFyIG1hcmtlciA9IGVNYXJrZXJzR3JvdXAuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7aWNvbjogbWlkZGxlSWNvbn0pO1xuICAgICAgICBwb3NpdGlvbiA9IG1hcmtlci5wb3NpdGlvbiArIDI7XG4gICAgICB9KTtcblxuICAgICAgLy8yLiBjbGVhciBsaW5lXG4gICAgICBlTWFya2Vyc0dyb3VwLmdldERFTGluZSgpLmNsZWFyKCk7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIuZHJhZ2dpbmcuZW5hYmxlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5zZWxlY3QoKTtcblxuICAgICAgZU1hcmtlcnNHcm91cC5zZWxlY3QoKTtcblxuICAgICAgdGhpcy5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5nZXRWR3JvdXAoKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkgJiYgZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVzZXRcbiAgICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICAgIHRoaXMuX2hpZGVTZWxlY3RlZFZMYXllcihlLmxheWVyKTtcblxuICAgICAgICBlTWFya2Vyc0dyb3VwLnJlc3RvcmUoZS5sYXllcik7XG4gICAgICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQoZU1hcmtlcnNHcm91cCk7XG5cbiAgICAgICAgZU1hcmtlcnNHcm91cC5zZWxlY3QoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpkZWxldGVfbWFya2VyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY29udmVydFRvRWRpdCh0aGlzLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgfSk7XG4gICAgdGhpcy5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpLnJlbW92ZSgpO1xuICAgIH0pO1xuICB9LFxuICBfYWRkTWFya2VyIChlKSB7XG4gICAgdmFyIGxhdGxuZyA9IGUubGF0bG5nO1xuXG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHZhciBtYXJrZXIgPSBlTWFya2Vyc0dyb3VwLnNldChsYXRsbmcpO1xuXG4gICAgdGhpcy5fY29udmVydFRvRWRpdChlTWFya2Vyc0dyb3VwKTtcblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIF91cGRhdGVERUxpbmUgKGxhdGxuZykge1xuICAgIHJldHVybiB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRERUxpbmUoKS51cGRhdGUobGF0bG5nKTtcbiAgfSxcbiAgX3VuQmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMub2ZmKCdjbGljaycpO1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkub2ZmKCdjbGljaycpO1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuICAgIHRoaXMub2ZmKCdkYmxjbGljaycpO1xuXG4gICAgdGhpcy5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpqb2luX3BhdGgnKTtcblxuICAgIGlmICh0aGlzLl9vcGVuUG9wdXApIHtcbiAgICAgIHRoaXMub3BlblBvcHVwID0gdGhpcy5fb3BlblBvcHVwO1xuICAgICAgZGVsZXRlIHRoaXMuX29wZW5Qb3B1cDtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0SG9sZTogdW5kZWZpbmVkLFxuICBfbGFzdEhvbGVUb0RyYXc6IHVuZGVmaW5lZCxcbiAgYWRkSG9sZUdyb3VwICgpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IG5ldyBMLk1hcmtlckdyb3VwKCk7XG4gICAgdGhpcy5fbGFzdEhvbGUuX2lzSG9sZSA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEhvbGUuYWRkVG8odGhpcyk7XG5cbiAgICB0aGlzLl9sYXN0SG9sZS5wb3NpdGlvbiA9IHRoaXMuZ2V0TGVuZ3RoKCkgLSAxO1xuXG4gICAgdGhpcy5fbGFzdEhvbGVUb0RyYXcgPSB0aGlzLl9sYXN0SG9sZTtcblxuICAgIHJldHVybiB0aGlzLl9sYXN0SG9sZTtcbiAgfSxcbiAgZ2V0TGVuZ3RoICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGg7XG4gIH0sXG4gIHJlc2V0TGFzdEhvbGUgKCkge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gdW5kZWZpbmVkO1xuICB9LFxuICBnZXRMYXN0SG9sZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RIb2xlO1xuICB9LFxuICByZW1vdmUgKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChob2xlKSA9PiB7XG4gICAgICB3aGlsZSAoaG9sZS5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgaG9sZS5yZW1vdmVNYXJrZXJBdCgwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVwb3MgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBpZiAobGF5ZXIucG9zaXRpb24gPj0gcG9zaXRpb24pIHtcbiAgICAgICAgbGF5ZXIucG9zaXRpb24gLT0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVzZXRTZWxlY3Rpb24gKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgICB1cGRhdGUgKCkge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG4vLyAgICBtYXAuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZShtYXAuZWRpdFN0eWxlW21hcC5fZ2V0TW9kZVR5cGUoKV0pO1xuICAgIH1cbiAgfSk7IiwiaW1wb3J0IEJhc2VNR3JvdXAgZnJvbSAnLi4vZXh0ZW5kZWQvQmFzZU1hcmtlckdyb3VwJztcbmltcG9ydCBFZGl0TWFya2VyIGZyb20gJy4uL2VkaXQvbWFya2VyJztcbmltcG9ydCBFZGl0TGluZUdyb3VwIGZyb20gJy4uL2VkaXQvbGluZSc7XG5pbXBvcnQgRGFzaGVkRWRpdExpbmVHcm91cCBmcm9tICcuLi9kcmF3L2Rhc2hlZC1saW5lJztcblxuaW1wb3J0IHNvcnQgZnJvbSAnLi4vdXRpbHMvc29ydEJ5UG9zaXRpb24nO1xuaW1wb3J0ICogYXMgaWNvbnMgZnJvbSAnLi4vbWFya2VyLWljb25zJztcblxuTC5VdGlsLmV4dGVuZChMLkxpbmVVdGlsLCB7XG4gIC8vIENoZWNrcyB0byBzZWUgaWYgdHdvIGxpbmUgc2VnbWVudHMgaW50ZXJzZWN0LiBEb2VzIG5vdCBoYW5kbGUgZGVnZW5lcmF0ZSBjYXNlcy5cbiAgLy8gaHR0cDovL2NvbXBnZW9tLmNzLnVpdWMuZWR1L35qZWZmZS90ZWFjaGluZy8zNzMvbm90ZXMveDA2LXN3ZWVwbGluZS5wZGZcbiAgc2VnbWVudHNJbnRlcnNlY3QgKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMiwgLypQb2ludCovIHAzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMiwgcDMpICE9PVxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAxLCBwMiwgcDMpICYmXG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDEsIHAyKSAhPT1cbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMSwgcDMpO1xuICB9LFxuXG4gIC8vIGNoZWNrIHRvIHNlZSBpZiBwb2ludHMgYXJlIGluIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXJcbiAgX2NoZWNrQ291bnRlcmNsb2Nrd2lzZSAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyKSB7XG4gICAgcmV0dXJuIChwMi55IC0gcC55KSAqIChwMS54IC0gcC54KSA+IChwMS55IC0gcC55KSAqIChwMi54IC0gcC54KTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEwuTWFya2VyR3JvdXAgPSBCYXNlTUdyb3VwLmV4dGVuZCh7XG4gIF9pc0hvbGU6IGZhbHNlLFxuICBfZWRpdExpbmVHcm91cDogdW5kZWZpbmVkLFxuICBfcG9zaXRpb246IHVuZGVmaW5lZCxcbiAgZGFzaGVkRWRpdExpbmVHcm91cDogbmV3IERhc2hlZEVkaXRMaW5lR3JvdXAoW10pLFxuICBvcHRpb25zOiB7XG4gICAgbUljb246IHVuZGVmaW5lZCxcbiAgICBtSG92ZXJJY29uOiB1bmRlZmluZWRcbiAgfSxcbiAgaW5pdGlhbGl6ZSAobGF5ZXJzKSB7XG4gICAgTC5MYXllckdyb3VwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF5ZXJzKTtcblxuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgICAvL3RoaXMuX2JpbmRFdmVudHMoKTtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8obWFwKTtcbiAgfSxcbiAgX3VwZGF0ZURFTGluZSAobGF0bG5nKSB7XG4gICAgdmFyIGRlTGluZSA9IHRoaXMuZ2V0REVMaW5lKCk7XG4gICAgaWYgKHRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICBkZUxpbmUudXBkYXRlKGxhdGxuZyk7XG4gICAgfVxuICAgIHJldHVybiBkZUxpbmU7XG4gIH0sXG4gIF9hZGRNYXJrZXIgKGxhdGxuZykge1xuICAgIC8vdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHRoaXMuc2V0KGxhdGxuZyk7XG4gICAgdGhpcy5nZXRERUxpbmUoKS5hZGRMYXRMbmcobGF0bG5nKTtcblxuICAgIHRoaXMuX21hcC5fY29udmVydFRvRWRpdCh0aGlzKTtcbiAgfSxcbiAgZ2V0REVMaW5lICgpIHtcbiAgICBpZiAoIXRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5fbWFwKSB7XG4gICAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8odGhpcy5fbWFwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwO1xuICB9LFxuICBfc2V0SG92ZXJJY29uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuX29sZFNlbGVjdGVkTWFya2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIuX3Jlc2V0SWNvbih0aGlzLm9wdGlvbnMubUljb24pO1xuICAgIH1cbiAgICBtYXAuX3NlbGVjdGVkTWFya2VyLl9zZXRIb3Zlckljb24odGhpcy5vcHRpb25zLm1Ib3Zlckljb24pO1xuICB9LFxuICBfc29ydEJ5UG9zaXRpb24gKCkge1xuICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcblxuICAgICAgbGF5ZXJzID0gbGF5ZXJzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuX2xlYWZsZXRfaWQgLSBiLl9sZWFmbGV0X2lkO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBpZEFycmF5ID0gW107XG4gICAgICB2YXIgcG9zQXJyYXkgPSBbXTtcbiAgICAgIGxheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgICBpZEFycmF5LnB1c2gobGF5ZXIuX2xlYWZsZXRfaWQpO1xuICAgICAgICBwb3NBcnJheS5wdXNoKGxheWVyLl9fcG9zaXRpb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHNvcnQodGhpcy5fbGF5ZXJzLCBpZEFycmF5KTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZVN0eWxlICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBtYXJrZXIgPSBtYXJrZXJzW2ldO1xuICAgICAgbWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICAgIGlmIChtYXJrZXIgPT09IHRoaXMuX21hcC5fc2VsZWN0ZWRNYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fc2V0SG92ZXJJY29uKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXRTZWxlY3RlZCAobWFya2VyKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCAmJiB0aGlzLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLmdldExhc3QoKTtcbiAgICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIgPSBtYXAuX3NlbGVjdGVkTWFya2VyO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIgPSBtYXAuX3NlbGVjdGVkTWFya2VyO1xuICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSBtYXJrZXI7XG4gIH0sXG4gIHJlc2V0U2VsZWN0ZWQgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIpIHtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIuX3Jlc2V0SWNvbih0aGlzLm9wdGlvbnMubUljb24pO1xuICAgICAgbWFwLl9zZWxlY3RlZE1hcmtlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0sXG4gIGdldFNlbGVjdGVkICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgfSxcbiAgX3NldEZpcnN0IChtYXJrZXIpIHtcbiAgICB0aGlzLl9maXJzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB0aGlzLl9maXJzdE1hcmtlci5fc2V0Rmlyc3RJY29uKCk7XG4gIH0sXG4gIGdldEZpcnN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlyc3RNYXJrZXI7XG4gIH0sXG4gIGdldExhc3QgKCkge1xuICAgIGlmICh0aGlzLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuICAgICAgcmV0dXJuIGxheWVyc1tsYXllcnMubGVuZ3RoIC0gMV07XG4gICAgfVxuICB9LFxuICBoYXNGaXJzdE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3QoKSAmJiB0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpO1xuICB9LFxuICBjb252ZXJ0VG9MYXRMbmdzICgpIHtcbiAgICB2YXIgbGF0bG5ncyA9IFtdO1xuICAgIHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xuICAgICAgaWYgKCFsYXllci5pc01pZGRsZSgpKSB7XG4gICAgICAgIGxhdGxuZ3MucHVzaChsYXllci5nZXRMYXRMbmcoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxhdGxuZ3M7XG4gIH0sXG4gIHJlc3RvcmUgKGxheWVyKSB7XG4gICAgdGhpcy5zZXRBbGwobGF5ZXIuX2xhdGxuZ3MpO1xuICAgIHRoaXMuc2V0QWxsSG9sZXMobGF5ZXIuX2hvbGVzKTtcbiAgfSxcbiAgX2FkZCAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICBpZiAodGhpcy5fbWFwLmlzTW9kZSgnZHJhdycpKSB7XG4gICAgICBpZiAoIXRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICAgIG9wdGlvbnMuaWNvbiA9IGljb25zLmZpcnN0SWNvbjtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIHZhciBtYXJrZXIgPSB0aGlzLmFkZE1hcmtlcihsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKTtcblxuICAgIHRoaXMuZ2V0REVMaW5lKCkuYWRkTGF0TG5nKGxhdGxuZyk7XG5cbiAgICB0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVERUxpbmUoZS5sYXRsbmcpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBpZiAobWFya2VyLl9tR3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMikge1xuICAgICAgaWYgKG1hcmtlci5fbUdyb3VwLl9maXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkgJiYgbWFya2VyID09PSBtYXJrZXIuX21Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIF9jbG9zZXN0Tm90TWlkZGxlTWFya2VyIChsYXllcnMsIHBvc2l0aW9uLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gKGxheWVyc1twb3NpdGlvbl0uaXNNaWRkbGUoKSkgPyBsYXllcnNbcG9zaXRpb24gKyBkaXJlY3Rpb25dIDogbGF5ZXJzW3Bvc2l0aW9uXTtcbiAgfSxcbiAgX3NldFByZXZOZXh0IChtYXJrZXIsIHBvc2l0aW9uKSB7XG4gICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICB2YXIgbWF4TGVuZ3RoID0gbGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAxKSB7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgcG9zaXRpb24gLSAxLCAtMSk7XG4gICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgMiwgMSk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gbWF4TGVuZ3RoKSB7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgbWF4TGVuZ3RoIC0gMSwgLTEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIDAsIDEpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXJrZXIuX21pZGRsZVByZXYgPT0gbnVsbCkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSBsYXllcnNbcG9zaXRpb24gLSAxXTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXJrZXIuX21pZGRsZU5leHQgPT0gbnVsbCkge1xuICAgICAgICBtYXJrZXIuX25leHQgPSBsYXllcnNbcG9zaXRpb24gKyAxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBzZXRNaWRkbGVNYXJrZXIgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5hZGRNYXJrZXIocG9zaXRpb24sIG51bGwsIHtpY29uOiBpY29ucy5taWRkbGVJY29ufSk7XG4gIH0sXG4gIHNldE1pZGRsZU1hcmtlcnMgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5zZXRNaWRkbGVNYXJrZXIocG9zaXRpb24pO1xuICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKHBvc2l0aW9uICsgMik7XG4gIH0sXG4gIHNldCAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIGlmICghdGhpcy5oYXNJbnRlcnNlY3Rpb24obGF0bG5nKSkge1xuICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgdGhpcy5fbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH0sXG4gIHNldE1pZGRsZSAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIHBvc2l0aW9uID0gKHBvc2l0aW9uIDwgMCkgPyAwIDogcG9zaXRpb247XG5cbiAgICAvL3ZhciBmdW5jID0gKHRoaXMuX2lzSG9sZSkgPyAnc2V0JyA6ICdzZXRIb2xlTWFya2VyJztcbiAgICB2YXIgbWFya2VyID0gdGhpcy5zZXQobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG5cbiAgICBtYXJrZXIuX3NldE1pZGRsZUljb24oKTtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBzZXRBbGwgKGxhdGxuZ3MpIHtcbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgcG9zaXRpb24pID0+IHtcbiAgICAgIHRoaXMuc2V0KGxhdGxuZywgcG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gIH0sXG4gIHNldEFsbEhvbGVzIChob2xlcykge1xuICAgIGhvbGVzLmZvckVhY2goKGhvbGUpID0+IHtcbiAgICAgIC8vdGhpcy5zZXQoaG9sZSk7XG4gICAgICB2YXIgbGFzdEhHcm91cCA9IHRoaXMuX21hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmFkZEhvbGVHcm91cCgpO1xuXG4gICAgICBob2xlLl9lYWNoKChsYXRsbmcsIHBvc2l0aW9uKSA9PiB7XG4gICAgICAgIGxhc3RIR3JvdXAuc2V0KGxhdGxuZywgcG9zaXRpb24pO1xuICAgICAgfSk7XG4gICAgICAvL3ZhciBsZW5ndGggPSBob2xlLmxlbmd0aDtcbiAgICAgIC8vdmFyIGkgPSAwO1xuICAgICAgLy9mb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyAgbGFzdEhHcm91cC5zZXQoaG9sZVtpXSwgaSk7XG4gICAgICAvL31cblxuICAgICAgbGFzdEhHcm91cC5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gICAgfSk7XG4gIH0sXG4gIHNldEhvbGVNYXJrZXIgKGxhdGxuZywgb3B0aW9ucyA9IHtpc0hvbGVNYXJrZXI6IHRydWUsIGhvbGVQb3NpdGlvbjoge319KSB7XG4gICAgdmFyIG1hcmtlciA9IG5ldyBFZGl0TWFya2VyKHRoaXMsIGxhdGxuZywgb3B0aW9ucyB8fCB7fSk7XG4gICAgbWFya2VyLmFkZFRvKHRoaXMpO1xuXG4gICAgLy90aGlzLnNldFNlbGVjdGVkKG1hcmtlcik7XG5cbiAgICBpZiAodGhpcy5fbWFwLmlzTW9kZSgnZHJhdycpICYmIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLl9zZXRGaXJzdChtYXJrZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIHJlbW92ZUhvbGUgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgLy9yZW1vdmUgZWRpdCBsaW5lXG4gICAgLy90aGlzLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIC8vcmVtb3ZlIGVkaXQgbWFya2Vyc1xuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcblxuICAgIC8vcmVtb3ZlIGhvbGVcbiAgICBtYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlcygpLnNwbGljZSh0aGlzLl9wb3NpdGlvbiwgMSk7XG4gICAgbWFwLmdldEVQb2x5Z29uKCkucmVkcmF3KCk7XG5cbiAgICAvL3JlZHJhdyBob2xlc1xuICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZXMoKTtcblxuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXAuX3NldEVITWFya2VyR3JvdXAoaG9sZXNbaV0pO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlU2VsZWN0ZWQgKCkge1xuICAgIHZhciBzZWxlY3RlZEVNYXJrZXIgPSB0aGlzLmdldFNlbGVjdGVkKCk7XG4gICAgdmFyIG1hcmtlckxheWVyc0FycmF5ID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICB2YXIgbGF0bG5nID0gc2VsZWN0ZWRFTWFya2VyLmdldExhdExuZygpO1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFya2VyTGF5ZXJzQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW1vdmVMYXllcihzZWxlY3RlZEVNYXJrZXIpO1xuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCB7bGF0bG5nOiBsYXRsbmd9KTtcbiAgICB9XG5cbiAgICBtYXJrZXJMYXllcnNBcnJheSA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICBpZiAodGhpcy5faXNIb2xlKSB7XG4gICAgICBpZiAobWFwLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgLy8gbm8gbmVlZCB0byByZW1vdmUgbGFzdCBwb2ludFxuICAgICAgICBpZiAobWFya2VyTGF5ZXJzQXJyYXkubGVuZ3RoIDwgNCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlSG9sZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vc2VsZWN0ZWRFTWFya2VyID0gbWFwLmdldFNlbGVjdGVkTWFya2VyKCk7XG4gICAgICAgICAgdmFyIGhvbGVQb3NpdGlvbiA9IHNlbGVjdGVkRU1hcmtlci5vcHRpb25zLmhvbGVQb3NpdGlvbjtcblxuICAgICAgICAgIC8vcmVtb3ZlIGhvbGUgcG9pbnRcbiAgICAgICAgICAvL21hcC5nZXRFUG9seWdvbigpLmdldEhvbGUodGhpcy5fcG9zaXRpb24pLnNwbGljZShob2xlUG9zaXRpb24uaE1hcmtlciwgMSk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZSh0aGlzLl9wb3NpdGlvbikuc3BsaWNlKHNlbGVjdGVkRU1hcmtlci5fX3Bvc2l0aW9uLCAxKTtcbiAgICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5yZWRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgICBsYXllci5vcHRpb25zLmhvbGVQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIGhHcm91cDogdGhpcy5fcG9zaXRpb24sXG4gICAgICAgICAgICBoTWFya2VyOiBfcG9zaXRpb24rK1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFwLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gcmVtb3ZlIGxhc3QgcG9pbnRcbiAgICAgICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAvL3JlbW92ZSBlZGl0IG1hcmtlcnNcbiAgICAgICAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBsYXllci5vcHRpb25zLnRpdGxlID0gcG9zaXRpb247XG4gICAgICBsYXllci5fX3Bvc2l0aW9uID0gcG9zaXRpb24rKztcbiAgICB9KTtcbiAgfSxcbiAgZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uIChwb2x5Z29uKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IFtdO1xuICAgIHZhciBsYXllcnMgPSAoKHBvbHlnb24pID8gcG9seWdvbi5nZXRMYXllcnMoKSA6IHRoaXMuZ2V0TGF5ZXJzKCkpLmZpbHRlcigobCkgPT4gIWwuaXNNaWRkbGUoKSk7XG5cbiAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IFtdO1xuICAgIGxheWVycy5fZWFjaCgobGF5ZXIpID0+IHtcbiAgICAgIHZhciBsYXRsbmcgPSBsYXllci5nZXRMYXRMbmcoKTtcbiAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnB1c2godGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpKTtcbiAgICB9KTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT0gbGF5ZXJzWzBdKSB7IC8vIHBvaW50IGlzIGZpcnN0XG4gICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMuc2xpY2UoMSk7XG4gICAgICB9IGVsc2UgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT0gbGF5ZXJzW2xheWVycy5sZW5ndGggLSAxXSkgeyAvLyBwb2ludCBpcyBsYXN0XG4gICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnNwbGljZSgtMSk7XG4gICAgICB9IGVsc2UgeyAvLyBwb2ludCBpcyBub3QgZmlyc3QgLyBsYXN0XG4gICAgICAgIHZhciB0bXBBcnJQb2ludHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAobWFwLl9zZWxlY3RlZE1hcmtlciA9PT0gbGF5ZXJzW2ldKSB7XG4gICAgICAgICAgICB0bXBBcnJQb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoaSArIDEpO1xuICAgICAgICAgICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSB0bXBBcnJQb2ludHMuY29uY2F0KHRoaXMuX29yaWdpbmFsUG9pbnRzKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnNwbGljZSgtMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpbmFsUG9pbnRzO1xuICB9LFxuICBfYmluZExpbmVFdmVudHM6IHVuZGVmaW5lZCxcbiAgX2hhc0ludGVyc2VjdGlvbiAocG9pbnRzLCBuZXdQb2ludCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgICBsYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlKGxhc3RQb2ludCwgbmV3UG9pbnQsIG1heEluZGV4LCBpc0ZpbmlzaCk7XG4gIH0sXG5cbiAgX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlIChwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgLy9sYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZUhvbGVTZWdtZW50c0ludGVyc2VjdHNSYW5nZShsYXN0UG9pbnQsIG5ld1BvaW50KTtcbiAgfSxcblxuICBoYXNJbnRlcnNlY3Rpb24gKGxhdGxuZywgaXNGaW5pc2gpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBuZXdQb2ludCA9IG1hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpO1xuXG4gICAgdmFyIHJzbHQxID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB2YXIgcnNsdDIgPSBmYWxzZTtcblxuICAgIHZhciBmTWFya2VyID0gdGhpcy5nZXRGaXJzdCgpO1xuICAgIGlmIChmTWFya2VyICYmICFmTWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgLy8gY29kZSB3YXMgZHVibGljYXRlZCB0byBjaGVjayBpbnRlcnNlY3Rpb24gZnJvbSBib3RoIHNpZGVzXG4gICAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgICBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpLnJldmVyc2UoKTtcbiAgICAgIHJzbHQyID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB9XG5cbiAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChyc2x0MSB8fCByc2x0Mik7XG4gICAgdmFyIGVkZ2VzSW50ZXJzZWN0ZWQgPSBtYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBoYXNJbnRlcnNlY3Rpb25XaXRoSG9sZSAobEFycmF5LCBob2xlKSB7XG5cbiAgICBpZiAodGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVswXSk7XG4gICAgdmFyIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzFdKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbihob2xlKTtcblxuICAgIHZhciByc2x0MSA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlKHBvaW50cywgbmV3UG9pbnQsIGxhc3RQb2ludCk7XG5cbiAgICAvLyBjb2RlIHdhcyBkdWJsaWNhdGVkIHRvIGNoZWNrIGludGVyc2VjdGlvbiBmcm9tIGJvdGggc2lkZXNcbiAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oaG9sZSkucmV2ZXJzZSgpO1xuICAgIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzJdKTtcbiAgICB2YXIgcnNsdDIgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpO1xuXG4gICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdDEgfHwgcnNsdDIpO1xuICAgIHZhciBlZGdlc0ludGVyc2VjdGVkID0gdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcblxuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBfdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uIChleHRyYVBvaW50cykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cyxcbiAgICAgIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwO1xuICAgIC8vIEluY3JlbWVudCBsZW5ndGggYnkgZXh0cmFQb2ludHMgaWYgcHJlc2VudFxuICAgIGxlbiArPSBleHRyYVBvaW50cyB8fCAwO1xuXG4gICAgcmV0dXJuICF0aGlzLl9vcmlnaW5hbFBvaW50cyB8fCBsZW4gPD0gMztcbiAgfSxcbiAgX2xpbmVIb2xlU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLCBwMiwgcDM7XG5cbiAgICBmb3IgKHZhciBqID0gcG9pbnRzLmxlbmd0aCAtIDE7IGogPiAwOyBqLS0pIHtcbiAgICAgIHAyID0gcG9pbnRzW2ogLSAxXTtcbiAgICAgIHAzID0gcG9pbnRzW2pdO1xuXG4gICAgICBpZiAoTC5MaW5lVXRpbC5zZWdtZW50c0ludGVyc2VjdChwLCBwMSwgcDIsIHAzKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9saW5lU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxLCBtYXhJbmRleCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXG4gICAgICBwMiwgcDM7XG5cbiAgICB2YXIgbWluID0gaXNGaW5pc2ggPyAxIDogMDtcbiAgICAvLyBDaGVjayBhbGwgcHJldmlvdXMgbGluZSBzZWdtZW50cyAoYmVzaWRlIHRoZSBpbW1lZGlhdGVseSBwcmV2aW91cykgZm9yIGludGVyc2VjdGlvbnNcbiAgICBmb3IgKHZhciBqID0gbWF4SW5kZXg7IGogPiBtaW47IGotLSkge1xuICAgICAgcDIgPSBwb2ludHNbaiAtIDFdO1xuICAgICAgcDMgPSBwb2ludHNbal07XG5cbiAgICAgIGlmIChMLkxpbmVVdGlsLnNlZ21lbnRzSW50ZXJzZWN0KHAsIHAxLCBwMiwgcDMpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2lzTWFya2VySW5Qb2x5Z29uIChtYXJrZXIpIHtcbiAgICB2YXIgaiA9IDA7XG5cbiAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICB2YXIgc2lkZXMgPSBsYXllcnMubGVuZ3RoO1xuXG4gICAgdmFyIHggPSBtYXJrZXIubG5nO1xuICAgIHZhciB5ID0gbWFya2VyLmxhdDtcblxuICAgIHZhciBpblBvbHkgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lkZXM7IGkrKykge1xuICAgICAgaisrO1xuICAgICAgaWYgKGogPT0gc2lkZXMpIHtcbiAgICAgICAgaiA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgcG9pbnQxID0gbGF5ZXJzW2ldLmdldExhdExuZygpO1xuICAgICAgdmFyIHBvaW50MiA9IGxheWVyc1tqXS5nZXRMYXRMbmcoKTtcbiAgICAgIGlmICgoKHBvaW50MS5sYXQgPCB5KSAmJiAocG9pbnQyLmxhdCA+PSB5KSkgfHwgKChwb2ludDIubGF0IDwgeSkgJiYgKHBvaW50MS5sYXQgPj0geSkpKSB7XG4gICAgICAgIGlmIChwb2ludDEubG5nICsgKHkgLSBwb2ludDEubGF0KSAvIChwb2ludDIubGF0IC0gcG9pbnQxLmxhdCkgKiAocG9pbnQyLmxuZyAtIHBvaW50MS5sbmcpIDwgeCkge1xuICAgICAgICAgIGluUG9seSA9ICFpblBvbHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpblBvbHk7XG4gIH1cbn0pOyIsImltcG9ydCBUb29sdGlwIGZyb20gJy4uL2V4dGVuZGVkL1Rvb2x0aXAnO1xuaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuXG52YXIgc2l6ZSA9IDE7XG52YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5pZiAodXNlckFnZW50LmluZGV4T2YoXCJpcGFkXCIpICE9PSAtMSB8fCB1c2VyQWdlbnQuaW5kZXhPZihcImlwaG9uZVwiKSAhPT0gLTEpIHtcbiAgc2l6ZSA9IDI7XG59XG5cbnZhciB0b29sdGlwO1xudmFyIGRyYWdlbmQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgTC5NYXJrZXIuZXh0ZW5kKHtcbiAgX2RyYWdnYWJsZTogdW5kZWZpbmVkLCAvLyBhbiBpbnN0YW5jZSBvZiBMLkRyYWdnYWJsZVxuICBfb2xkTGF0TG5nU3RhdGU6IHVuZGVmaW5lZCxcbiAgaW5pdGlhbGl6ZSAoZ3JvdXAsIGxhdGxuZywgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICBvcHRpb25zID0gJC5leHRlbmQoe1xuICAgICAgaWNvbjogaWNvbixcbiAgICAgIGRyYWdnYWJsZTogZmFsc2VcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIEwuTWFya2VyLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5nLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX21Hcm91cCA9IGdyb3VwO1xuXG4gICAgdGhpcy5faXNGaXJzdCA9IGdyb3VwLmdldExheWVycygpLmxlbmd0aCA9PT0gMDtcbiAgfSxcbiAgcmVtb3ZlR3JvdXAgKCkge1xuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZUhvbGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZSgpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlU2VsZWN0ZWQoKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUhvbGUgKCkgeyAvLyBkZXByZWNhdGVkXG4gICAgdGhpcy5yZW1vdmVHcm91cCgpO1xuICB9LFxuICBuZXh0ICgpIHtcbiAgICB2YXIgbmV4dCA9IHRoaXMuX25leHQuX25leHQ7XG4gICAgaWYgKCF0aGlzLl9uZXh0LmlzTWlkZGxlKCkpIHtcbiAgICAgIG5leHQgPSB0aGlzLl9uZXh0O1xuICAgIH1cbiAgICByZXR1cm4gbmV4dDtcbiAgfSxcbiAgcHJldiAoKSB7XG4gICAgdmFyIHByZXYgPSB0aGlzLl9wcmV2Ll9wcmV2O1xuICAgIGlmICghdGhpcy5fcHJldi5pc01pZGRsZSgpKSB7XG4gICAgICBwcmV2ID0gdGhpcy5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sXG4gIGNoYW5nZVByZXZOZXh0UG9zICgpIHtcbiAgICBpZiAodGhpcy5fcHJldi5pc01pZGRsZSgpKSB7XG5cbiAgICAgIHZhciBwcmV2TGF0TG5nID0gdGhpcy5fbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcy5wcmV2KCksIHRoaXMpO1xuICAgICAgdmFyIG5leHRMYXRMbmcgPSB0aGlzLl9tR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLCB0aGlzLm5leHQoKSk7XG5cbiAgICAgIHRoaXMuX3ByZXYuc2V0TGF0TG5nKHByZXZMYXRMbmcpO1xuICAgICAgdGhpcy5fbmV4dC5zZXRMYXRMbmcobmV4dExhdExuZyk7XG4gICAgfVxuICB9LFxuICAvKipcbiAgICogY2hhbmdlIGV2ZW50cyBmb3IgbWFya2VyIChleGFtcGxlOiBob2xlKVxuICAgKi9cbiAgICByZXNldEV2ZW50cyAoY2FsbGJhY2spIHtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuICBfcG9zSGFzaCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXYucG9zaXRpb24gKyAnXycgKyB0aGlzLnBvc2l0aW9uICsgJ18nICsgdGhpcy5fbmV4dC5wb3NpdGlvbjtcbiAgfSxcbiAgX3Jlc2V0SWNvbiAoX2ljb24pIHtcbiAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGljID0gX2ljb24gfHwgaWNvbjtcblxuICAgIHRoaXMuc2V0SWNvbihpYyk7XG4gICAgdGhpcy5wcmV2KCkuc2V0SWNvbihpYyk7XG4gICAgdGhpcy5uZXh0KCkuc2V0SWNvbihpYyk7XG4gIH0sXG4gIF9zZXRIb3Zlckljb24gKF9oSWNvbikge1xuICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldEljb24oX2hJY29uIHx8IGhvdmVySWNvbik7XG4gIH0sXG4gIF9hZGRJY29uQ2xhc3MgKGNsYXNzTmFtZSkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9pY29uLCBjbGFzc05hbWUpO1xuICB9LFxuICBfcmVtb3ZlSWNvbkNsYXNzIChjbGFzc05hbWUpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5faWNvbiwgY2xhc3NOYW1lKTtcbiAgfSxcbiAgX3NldEludGVyc2VjdGlvbkljb24gKCkge1xuICAgIHZhciBpY29uQ2xhc3MgPSBpbnRlcnNlY3Rpb25JY29uLm9wdGlvbnMuY2xhc3NOYW1lO1xuICAgIHZhciBjbGFzc05hbWUgPSAnbS1lZGl0b3ItZGl2LWljb24nO1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuXG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkID0gdGhpcy5wcmV2KCk7XG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuXG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkID0gdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuICB9LFxuICBfc2V0Rmlyc3RJY29uICgpIHtcbiAgICB0aGlzLl9pc0ZpcnN0ID0gdHJ1ZTtcbiAgICB0aGlzLnNldEljb24oZmlyc3RJY29uKTtcbiAgfSxcbiAgX2hhc0ZpcnN0SWNvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ljb24gJiYgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1kaXYtaWNvbi1maXJzdCcpO1xuICB9LFxuICBfc2V0TWlkZGxlSWNvbiAoKSB7XG4gICAgdGhpcy5zZXRJY29uKG1pZGRsZUljb24pO1xuICB9LFxuICBpc01pZGRsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ljb24gJiYgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1taWRkbGUtZGl2LWljb24nKVxuICAgICAgJiYgIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbGVhZmxldC1kcmFnLXRhcmdldCcpO1xuICB9LFxuICBfc2V0RHJhZ0ljb24gKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnbS1lZGl0b3ItZGl2LWljb24nKTtcbiAgICB0aGlzLnNldEljb24oZHJhZ0ljb24pO1xuICB9LFxuICBpc1BsYWluICgpIHtcbiAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1kaXYtaWNvbicpIHx8IEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gIH0sXG4gIF9vbmNlQ2xpY2sgKCkge1xuICAgIGlmICh0aGlzLl9pc0ZpcnN0KSB7XG4gICAgICB0aGlzLm9uY2UoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICB2YXIgbUdyb3VwID0gdGhpcy5fbUdyb3VwO1xuXG4gICAgICAgIGlmIChtR3JvdXAuX21hcmtlcnMubGVuZ3RoIDwgMykge1xuICAgICAgICAgIHRoaXMuX29uY2VDbGljaygpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsYXRsbmcgPSBlLnRhcmdldC5fbGF0bG5nO1xuICAgICAgICB2YXIgaGFzSW50ZXJzZWN0aW9uID0gbUdyb3VwLmhhc0ludGVyc2VjdGlvbihsYXRsbmcpO1xuXG4gICAgICAgIGlmIChoYXNJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICBtYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICAgIHRoaXMuX29uY2VDbGljaygpOyAvLyBiaW5kICdvbmNlJyBhZ2FpbiB1bnRpbCBoYXMgaW50ZXJzZWN0aW9uXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5faXNGaXJzdCA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuc2V0SWNvbihpY29uKTtcbiAgICAgICAgICAvL21Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmpvaW5fcGF0aCcsIHttR3JvdXA6IG1Hcm91cH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIF9iaW5kQ29tbW9uRXZlbnRzICgpIHtcbiAgICB0aGlzLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG5cbiAgICAgIGlmIChtR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSAmJiB0aGlzICE9PSBtR3JvdXAuZ2V0Rmlyc3QoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkgJiYgdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbih0aGlzLmdldExhdExuZygpLCB0cnVlKSkge1xuICAgICAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChmYWxzZSk7XG4gICAgICAgIG1hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbUdyb3VwLnNldFNlbGVjdGVkKHRoaXMpO1xuICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuXG4gICAgICBpZiAobUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWRJbkdyb3VwKCkpIHtcbiAgICAgICAgbUdyb3VwLnNlbGVjdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzTWlkZGxlKCkpIHtcbiAgICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvQWRkTmV3RWRnZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkgeyAvL2FkZCBlZGdlXG4gICAgICAgIG1Hcm91cC5zZXRNaWRkbGVNYXJrZXJzKHRoaXMucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZXNldEljb24oaWNvbik7XG4gICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcbiAgICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMpO1xuICAgICAgfSBlbHNlIHsgLy9yZW1vdmUgZWRnZVxuICAgICAgICBpZiAoIW1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZHJhZ2VuZCkge1xuICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcblxuICAgICAgICAgIHZhciByc2x0SW50ZXJzZWN0aW9uID0gdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKHt0YXJnZXQ6IHtfbGF0bG5nOiBtR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLnByZXYoKSwgdGhpcy5uZXh0KCkpfX0pO1xuXG4gICAgICAgICAgaWYgKHJzbHRJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgICAgICAgICAgbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IobWFwLm9wdGlvbnMudGV4dC5kZWxldGVQb2ludEludGVyc2VjdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aWV3RXJyb3JMaW5lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9sZExhdExuZyA9IHRoaXMuZ2V0TGF0TG5nKCk7XG5cbiAgICAgICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgIG1Hcm91cC5yZW1vdmVNYXJrZXIodGhpcyk7XG5cbiAgICAgICAgICBpZiAoIW1Hcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXdMYXRMbmcgPSBuZXh0TWFya2VyLl9wcmV2LmdldExhdExuZygpO1xuXG4gICAgICAgICAgICBpZiAobmV3TGF0TG5nLmxhdCA9PT0gb2xkTGF0TG5nLmxhdCAmJiBuZXdMYXRMbmcubG5nID09PSBvbGRMYXRMbmcubG5nKSB7XG4gICAgICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9BZGROZXdFZGdlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1Hcm91cC5zZXRTZWxlY3RlZChuZXh0TWFya2VyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9tR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuX21Hcm91cC5nZXRMYXllcnMoKS5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMgPT09IHRoaXMuX21Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWRJbkdyb3VwKCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21pZGRsZV9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLm9uKCdtb3VzZW91dCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vbmNlQ2xpY2soKTtcblxuICAgIHRoaXMub24oJ2RibGNsaWNrJywgKCkgPT4ge1xuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcbiAgICAgIGlmIChtR3JvdXAgJiYgbUdyb3VwLmdldEZpcnN0KCkgJiYgbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzID09PSBtR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICBtR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnJywgKGUpID0+IHtcbiAgICAgIHZhciBtYXJrZXIgPSBlLnRhcmdldDtcblxuICAgICAgbWFya2VyLmNoYW5nZVByZXZOZXh0UG9zKCk7XG5cbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG5cbiAgICAgIHRoaXMuX3NldERyYWdJY29uKCk7XG5cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZHJhZ19tYXJrZXInLCB7bWFya2VyOiB0aGlzfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnZW5kJywgKCkgPT4ge1xuXG4gICAgICB0aGlzLl9tR3JvdXAuc2VsZWN0KCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmRyYWdlbmRfbWFya2VyJywge21hcmtlcjogdGhpc30pO1xuXG4gICAgICBkcmFnZW5kID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBkcmFnZW5kID0gZmFsc2U7XG4gICAgICB9LCAyMDApO1xuXG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICB9KTtcbiAgfSxcbiAgX2lzSW5zaWRlSG9sZSAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB2YXIgaG9sZXMgPSBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaG9sZSA9IGhvbGVzW2ldO1xuICAgICAgaWYgKHRoaXMuX21Hcm91cCAhPT0gaG9sZSkge1xuICAgICAgICBpZiAoaG9sZS5faXNNYXJrZXJJblBvbHlnb24odGhpcy5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9pc091dHNpZGVPZlBvbHlnb24gKHBvbHlnb24pIHtcbiAgICByZXR1cm4gIXBvbHlnb24uX2lzTWFya2VySW5Qb2x5Z29uKHRoaXMuZ2V0TGF0TG5nKCkpO1xuICB9LFxuICBfZGV0ZWN0SW50ZXJzZWN0aW9uIChlKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBsYXRsbmcgPSAoZSA9PT0gdW5kZWZpbmVkKSA/IHRoaXMuZ2V0TGF0TG5nKCkgOiBlLnRhcmdldC5fbGF0bG5nO1xuICAgIHZhciBpc091dHNpZGVPZlBvbHlnb24gPSBmYWxzZTtcbiAgICB2YXIgaXNJbnNpZGVPZkhvbGUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIGlzT3V0c2lkZU9mUG9seWdvbiA9IHRoaXMuX2lzT3V0c2lkZU9mUG9seWdvbihtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIGlzSW5zaWRlT2ZIb2xlID0gdGhpcy5faXNJbnNpZGVIb2xlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzSW5zaWRlT2ZIb2xlID0gdGhpcy5faXNJbnNpZGVIb2xlKCk7XG4gICAgfVxuXG4gICAgdmFyIHJzbHQgPSBpc0luc2lkZU9mSG9sZSB8fCBpc091dHNpZGVPZlBvbHlnb24gfHwgdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbihsYXRsbmcpIHx8IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbldpdGhIb2xlcyhlKTtcblxuICAgIG1hcC5lZGdlc0ludGVyc2VjdGVkKHJzbHQpO1xuICAgIGlmIChyc2x0KSB7XG4gICAgICB0aGlzLl9tYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuICB9LFxuICBfZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzIChlKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcCwgaGFzSW50ZXJzZWN0aW9uID0gZmFsc2UsIGhvbGUsIGxhdGxuZyA9IChlID09PSB1bmRlZmluZWQpID8gdGhpcy5nZXRMYXRMbmcoKSA6IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgIHZhciBwcmV2UG9pbnQgPSB0aGlzLnByZXYoKTtcbiAgICB2YXIgbmV4dFBvaW50ID0gdGhpcy5uZXh0KCk7XG5cbiAgICBpZiAocHJldlBvaW50ID09IG51bGwgJiYgbmV4dFBvaW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2Vjb25kUG9pbnQgPSBwcmV2UG9pbnQuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIGxhc3RQb2ludCA9IG5leHRQb2ludC5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbGF5ZXJzLCB0bXBBcnJheSA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhvbGUgPSBob2xlc1tpXTtcbiAgICAgICAgaWYgKGhvbGUgIT09IHRoaXMuX21Hcm91cCkge1xuICAgICAgICAgIGhhc0ludGVyc2VjdGlvbiA9IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgaG9sZSk7XG4gICAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY2hlY2sgdGhhdCBob2xlIGlzIGluc2lkZSBvZiBvdGhlciBob2xlXG4gICAgICAgICAgdG1wQXJyYXkgPSBbXTtcbiAgICAgICAgICBsYXllcnMgPSBob2xlLmdldExheWVycygpO1xuXG4gICAgICAgICAgbGF5ZXJzLl9lYWNoKChsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX21Hcm91cC5faXNNYXJrZXJJblBvbHlnb24obGF5ZXIuZ2V0TGF0TG5nKCkpKSB7XG4gICAgICAgICAgICAgIHRtcEFycmF5LnB1c2goXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodG1wQXJyYXkubGVuZ3RoID09PSBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUoW2xhdGxuZywgc2Vjb25kUG9pbnQsIGxhc3RQb2ludF0sIGVNYXJrZXJzR3JvdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhhc0ludGVyc2VjdGlvbiA9IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgaG9sZXNbaV0pO1xuXG4gICAgICAgIC8vIGNoZWNrIHRoYXQgaG9sZSBpcyBvdXRzaWRlIG9mIHBvbHlnb25cbiAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICB0bXBBcnJheSA9IFtdO1xuICAgICAgICBsYXllcnMgPSBob2xlc1tpXS5nZXRMYXllcnMoKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAobGF5ZXJzW2pdLl9pc091dHNpZGVPZlBvbHlnb24oZU1hcmtlcnNHcm91cCkpIHtcbiAgICAgICAgICAgIHRtcEFycmF5LnB1c2goXCJcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0bXBBcnJheS5sZW5ndGggPT09IGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5NYXJrZXIucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIHRoaXMub24oJ2RyYWdzdGFydCcsIChlKSA9PiB7XG4gICAgICB0aGlzLl9tR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IGUudGFyZ2V0Ll9sYXRsbmc7XG5cbiAgICAgIGlmICh0aGlzLl9wcmV2LmlzUGxhaW4oKSkge1xuICAgICAgICB0aGlzLl9tR3JvdXAuc2V0TWlkZGxlTWFya2Vycyh0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgLy90aGlzLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgICB9XG5cbiAgICB9KS5vbignZHJhZycsIChlKSA9PiB7XG4gICAgICB0aGlzLl9vbkRyYWcoZSk7XG4gICAgfSkub24oJ2RyYWdlbmQnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fb25EcmFnRW5kKGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignbW91c2Vkb3duJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nLl9lbmFibGVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2JpbmRDb21tb25FdmVudHMobWFwKTtcbiAgfSxcbiAgX29uRHJhZyAoZSkge1xuICAgIHRoaXMuX2RldGVjdEludGVyc2VjdGlvbihlKTtcbiAgfSxcbiAgX29uRHJhZ0VuZCAoZSkge1xuICAgIHZhciByc2x0ID0gdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKGUpO1xuICAgIGlmIChyc2x0ICYmICF0aGlzLl9tYXAub3B0aW9ucy5hbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHRoaXMuX3Jlc3RvcmVPbGRQb3NpdGlvbigpO1xuICAgIH1cbiAgfSxcbiAgLy90b2RvOiBjb250aW51ZSB3aXRoIG9wdGlvbiAnYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uJ1xuICBfcmVzdG9yZU9sZFBvc2l0aW9uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuZWRnZXNJbnRlcnNlY3RlZCgpKSB7XG4gICAgICBsZXQgc3RhdGVMYXRMbmcgPSB0aGlzLl9vbGRMYXRMbmdTdGF0ZTtcbiAgICAgIHRoaXMuc2V0TGF0TG5nKEwubGF0TG5nKHN0YXRlTGF0TG5nLmxhdCwgc3RhdGVMYXRMbmcubG5nKSk7XG5cbiAgICAgIHRoaXMuY2hhbmdlUHJldk5leHRQb3MoKTtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIC8vXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRyYWdfbWFya2VyJywge21hcmtlcjogdGhpc30pO1xuXG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHRoaXMuZ2V0TGF0TG5nKCk7XG4gICAgfVxuICB9LFxuICBfYW5pbWF0ZVpvb20gKG9wdCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHZhciBwb3MgPSB0aGlzLl9tYXAuX2xhdExuZ1RvTmV3TGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcsIG9wdC56b29tLCBvcHQuY2VudGVyKS5yb3VuZCgpO1xuXG4gICAgICB0aGlzLl9zZXRQb3MocG9zKTtcbiAgICB9XG4gIH0sXG4gIHJlc2V0SWNvbiAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uLWRyYWcnKTtcbiAgfSxcbiAgdW5TZWxlY3RJY29uSW5Hcm91cCAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBfc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICghdGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9hZGRJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uJyk7XG4gICAgfVxuICAgIHRoaXMuX2FkZEljb25DbGFzcygnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2KSB7XG4gICAgICB0aGlzLl9wcmV2Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgICB0aGlzLl9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIGlmICh0aGlzLl9uZXh0KSB7XG4gICAgICB0aGlzLl9uZXh0Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgfSxcbiAgaXNTZWxlY3RlZEluR3JvdXAgKCkge1xuICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIEwuTWFya2VyLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gIH0sXG4gIF9lcnJvckxpbmVzOiBbXSxcbiAgX3ByZXZFcnJvckxpbmU6IG51bGwsXG4gIF9uZXh0RXJyb3JMaW5lOiBudWxsLFxuICBfZHJhd0Vycm9yTGluZXMgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG5cbiAgICB2YXIgY3VyclBvaW50ID0gdGhpcy5nZXRMYXRMbmcoKTtcbiAgICB2YXIgcHJldlBvaW50cyA9IFt0aGlzLnByZXYoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcbiAgICB2YXIgbmV4dFBvaW50cyA9IFt0aGlzLm5leHQoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcblxuICAgIHZhciBlcnJvckxpbmVTdHlsZSA9IHRoaXMuX21hcC5vcHRpb25zLmVycm9yTGluZVN0eWxlO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZSA9IG5ldyBMLlBvbHlsaW5lKHByZXZQb2ludHMsIGVycm9yTGluZVN0eWxlKTtcbiAgICB0aGlzLl9uZXh0RXJyb3JMaW5lID0gbmV3IEwuUG9seWxpbmUobmV4dFBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZS5hZGRUbyhtYXApO1xuICAgIHRoaXMuX25leHRFcnJvckxpbmUuYWRkVG8obWFwKTtcblxuICAgIHRoaXMuX2Vycm9yTGluZXMucHVzaCh0aGlzLl9wcmV2RXJyb3JMaW5lKTtcbiAgICB0aGlzLl9lcnJvckxpbmVzLnB1c2godGhpcy5fbmV4dEVycm9yTGluZSk7XG4gIH0sXG4gIF9jbGVhckVycm9yTGluZXMgKCkge1xuICAgIHRoaXMuX2Vycm9yTGluZXMuX2VhY2goKGxpbmUpID0+IHRoaXMuX21hcC5yZW1vdmVMYXllcihsaW5lKSk7XG4gIH0sXG4gIHNldEludGVyc2VjdGVkU3R5bGUgKCkge1xuICAgIHRoaXMuX3NldEludGVyc2VjdGlvbkljb24oKTtcblxuICAgIC8vc2hvdyBpbnRlcnNlY3RlZCBsaW5lc1xuICAgIHRoaXMuX2RyYXdFcnJvckxpbmVzKCk7XG4gIH0sXG4gIHJlc2V0U3R5bGUgKCkge1xuICAgIHRoaXMucmVzZXRJY29uKCk7XG4gICAgdGhpcy5zZWxlY3RJY29uSW5Hcm91cCgpO1xuXG4gICAgaWYgKHRoaXMuX3ByZXZJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25leHRJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkID0gbnVsbDtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQgPSBudWxsO1xuXG4gICAgLy9oaWRlIGludGVyc2VjdGVkIGxpbmVzXG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG4gIH0sXG4gIF9wcmV2aWV3RXJMaW5lOiBudWxsLFxuICBfcHQ6IG51bGwsXG4gIF9wcmV2aWV3RXJyb3JMaW5lICgpIHtcbiAgICBpZiAodGhpcy5fcHJldmlld0VyTGluZSkge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wdCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3B0KTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnRzID0gW3RoaXMubmV4dCgpLmdldExhdExuZygpLCB0aGlzLnByZXYoKS5nZXRMYXRMbmcoKV07XG5cbiAgICB2YXIgZXJyb3JMaW5lU3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5wcmV2aWV3RXJyb3JMaW5lU3R5bGU7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lID0gbmV3IEwuUG9seWxpbmUocG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lLmFkZFRvKHRoaXMuX21hcCk7XG5cbiAgICB0aGlzLl9wdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH0sIDkwMCk7XG4gIH1cbn0pOyIsImltcG9ydCBFeHRlbmRlZFBvbHlnb24gZnJvbSAnLi4vZXh0ZW5kZWQvUG9seWdvbic7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi9leHRlbmRlZC9Ub29sdGlwJztcblxuZXhwb3J0IGRlZmF1bHQgTC5FZGl0UGxveWdvbiA9IEV4dGVuZGVkUG9seWdvbi5leHRlbmQoe1xuICBfb2xkRTogdW5kZWZpbmVkLCAvLyB0byByZXVzZSBldmVudCBvYmplY3QgYWZ0ZXIgXCJiYWQgaG9sZVwiIHJlbW92aW5nIHRvIGJ1aWxkIG5ldyBob2xlXG4gIF9rOiAxLCAvLyB0byBkZWNyZWFzZSAnZGlmZicgdmFsdWUgd2hpY2ggaGVscHMgYnVpbGQgYSBob2xlXG4gIF9ob2xlczogW10sXG4gIGluaXRpYWxpemUgKGxhdGxuZ3MsIG9wdGlvbnMpIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5ncywgb3B0aW9ucyk7XG4gICAgdGhpcy5faW5pdFdpdGhIb2xlcyhsYXRsbmdzKTtcblxuICAgIHRoaXMub3B0aW9ucy5jbGFzc05hbWUgPSBcImxlYWZsZXQtY2xpY2thYmxlIHBvbHlnb25cIjtcbiAgfSxcbiAgX3VwZGF0ZSAoZSkge1xuICAgIHZhciBtYXJrZXIgPSBlLm1hcmtlcjtcblxuICAgIGlmIChtYXJrZXIuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICB2YXIgbWFya2VycyA9IG1hcmtlci5fbUdyb3VwLl9tYXJrZXJzO1xuICAgICAgbWFya2VycyA9IG1hcmtlcnMuZmlsdGVyKChtYXJrZXIpID0+ICFtYXJrZXIuaXNNaWRkbGUoKSk7XG4gICAgICB0aGlzLl9ob2xlc1ttYXJrZXIuX21Hcm91cC5wb3NpdGlvbl0gPSBtYXJrZXJzLm1hcCgobWFya2VyKSA9PiBtYXJrZXIuZ2V0TGF0TG5nKCkpO1xuXG4gICAgfVxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIF9yZW1vdmVIb2xlIChlKSB7XG4gICAgdmFyIGhvbGVQb3NpdGlvbiA9IGUubWFya2VyLl9tR3JvdXAucG9zaXRpb247XG4gICAgdGhpcy5faG9sZXMuc3BsaWNlKGhvbGVQb3NpdGlvbiwgMSk7XG5cbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZW1vdmVMYXllcihlLm1hcmtlci5fbUdyb3VwLl9sZWFmbGV0X2lkKTtcbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXBvcyhlLm1hcmtlci5fbUdyb3VwLnBvc2l0aW9uKTtcblxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6YWRkX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmFkZF9tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZHJhZ19tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkcmFnX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfaG9sZScpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9ob2xlJywgKGUpID0+IHRoaXMuX3JlbW92ZUhvbGUoZSkpO1xuXG4gICAgdGhpcy5vbignbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgaWYgKG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgfSk7XG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiBtYXAuZmlyZSgnZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW92ZXInKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgbWFwLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuXG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBhZGRIb2xlIChob2xlKSB7XG4gICAgdGhpcy5faG9sZXMgPSB0aGlzLl9ob2xlcyB8fCBbXTtcbiAgICB0aGlzLl9ob2xlcy5wdXNoKGhvbGUpO1xuXG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgX3Jlc2V0TGFzdEhvbGUgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBtYXAuZ2V0U2VsZWN0ZWRNYXJrZXIoKS5yZW1vdmVIb2xlKCk7XG5cbiAgICBpZiAodGhpcy5fayA+IDAuMDAxKSB7XG4gICAgICB0aGlzLl9hZGRIb2xlKHRoaXMuX29sZEUsIDAuNSk7XG4gICAgfVxuICB9LFxuICBjaGVja0hvbGVJbnRlcnNlY3Rpb24gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24gfHwgbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZUhNYXJrZXJzR3JvdXBMYXllcnMgPSB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICB2YXIgbGFzdEhvbGUgPSBlSE1hcmtlcnNHcm91cExheWVyc1tlSE1hcmtlcnNHcm91cExheWVycy5sZW5ndGggLSAxXTtcbiAgICB2YXIgbGFzdEhvbGVMYXllcnMgPSBlSE1hcmtlcnNHcm91cExheWVyc1tlSE1hcmtlcnNHcm91cExheWVycy5sZW5ndGggLSAxXS5nZXRMYXllcnMoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdEhvbGVMYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsYXllciA9IGxhc3RIb2xlTGF5ZXJzW2ldO1xuXG4gICAgICBpZiAobGF5ZXIuX2RldGVjdEludGVyc2VjdGlvbldpdGhIb2xlcygpKSB7XG4gICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXllci5faXNPdXRzaWRlT2ZQb2x5Z29uKHRoaXMuX21hcC5nZXRFTWFya2Vyc0dyb3VwKCkpKSB7XG4gICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGVIb2xlTWFya2VyR3JvdXBMYXllciA9IGVITWFya2Vyc0dyb3VwTGF5ZXJzW2pdO1xuXG4gICAgICAgIGlmIChsYXN0SG9sZSAhPT0gZUhvbGVNYXJrZXJHcm91cExheWVyICYmIGVIb2xlTWFya2VyR3JvdXBMYXllci5faXNNYXJrZXJJblBvbHlnb24obGF5ZXIuZ2V0TGF0TG5nKCkpKSB7XG4gICAgICAgICAgdGhpcy5fcmVzZXRMYXN0SG9sZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KTsiLCJpbXBvcnQgTWFya2VyIGZyb20gJy4uL2VkaXQvbWFya2VyJztcbmltcG9ydCBzb3J0IGZyb20gJy4uL3V0aWxzL3NvcnRCeVBvc2l0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgTC5DbGFzcy5leHRlbmQoe1xuICBpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXG5cbiAgX3NlbGVjdGVkOiBmYWxzZSxcbiAgX2xhc3RNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX2ZpcnN0TWFya2VyOiB1bmRlZmluZWQsXG4gIF9wb3NpdGlvbkhhc2g6IHVuZGVmaW5lZCxcbiAgX2xhc3RQb3NpdGlvbjogMCxcbiAgX21hcmtlcnM6IFtdLFxuICBvbkFkZCAobWFwKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcbiAgICAvL0wuTGF5ZXJHcm91cC5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgLy9MLkxheWVyR3JvdXAucHJvdG90eXBlLm9uUmVtb3ZlLmNhbGwodGhpcywgbWFwKTtcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gIH0sXG4gIGNsZWFyTGF5ZXJzICgpIHtcbiAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2goKG1hcmtlcikgPT4ge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKG1hcmtlcik7XG4gICAgfSk7XG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICB9LFxuICBhZGRUbyAobWFwKSB7XG4gICAgbWFwLmFkZExheWVyKHRoaXMpO1xuICB9LFxuICBhZGRMYXllciAobWFya2VyKSB7XG4gICAgdGhpcy5fbWFwLmFkZExheWVyKG1hcmtlcik7XG4gICAgdGhpcy5fbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgaWYgKG1hcmtlci5wb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tYXJrZXJzLm1vdmUodGhpcy5fbWFya2Vycy5sZW5ndGggLSAxLCBtYXJrZXIucG9zaXRpb24pO1xuICAgIH1cbiAgICBtYXJrZXIucG9zaXRpb24gPSAobWFya2VyLnBvc2l0aW9uICE9IG51bGwpID8gbWFya2VyLnBvc2l0aW9uIDogdGhpcy5fbWFya2Vycy5sZW5ndGggLSAxO1xuICB9LFxuICByZW1vdmUgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICBtYXJrZXJzLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIHdoaWxlICh0aGlzLmdldExheWVycygpLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcihtYXJrZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCF0aGlzLl9pc0hvbGUpIHtcbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBtYXAuZ2V0Vkdyb3VwKCkucmVtb3ZlTGF5ZXIobWFwLl9nZXRTZWxlY3RlZFZMYXllcigpKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUxheWVyIChtYXJrZXIpIHtcbiAgICB2YXIgcG9zaXRpb24gPSBtYXJrZXIucG9zaXRpb247XG4gICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKG1hcmtlcik7XG4gICAgdGhpcy5fbWFya2Vycy5zcGxpY2UocG9zaXRpb24sIDEpO1xuICB9LFxuICBnZXRMYXllcnMgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrZXJzO1xuICB9LFxuICBlYWNoTGF5ZXIgKGNiKSB7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKGNiKTtcbiAgfSxcbiAgbWFya2VyQXQgKHBvc2l0aW9uKSB7XG4gICAgdmFyIHJzbHQgPSB0aGlzLl9tYXJrZXJzW3Bvc2l0aW9uXTtcblxuICAgIGlmIChwb3NpdGlvbiA8IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmZpcnN0TWFya2VyKCk7XG4gICAgfVxuXG4gICAgaWYgKHJzbHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnNsdCA9IHRoaXMubGFzdE1hcmtlcigpO1xuICAgIH1cblxuICAgIHJldHVybiByc2x0O1xuICB9LFxuICBmaXJzdE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmtlcnNbMF07XG4gIH0sXG4gIGxhc3RNYXJrZXIgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcbiAgICByZXR1cm4gbWFya2Vyc1ttYXJrZXJzLmxlbmd0aCAtIDFdO1xuICB9LFxuICByZW1vdmVNYXJrZXIgKG1hcmtlcikge1xuICAgIHZhciBiID0gIW1hcmtlci5pc01pZGRsZSgpO1xuXG4gICAgdmFyIHByZXZNYXJrZXIgPSBtYXJrZXIuX3ByZXY7XG4gICAgdmFyIG5leHRNYXJrZXIgPSBtYXJrZXIuX25leHQ7XG4gICAgdmFyIG5leHRuZXh0TWFya2VyID0gbWFya2VyLl9uZXh0Ll9uZXh0O1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQobWFya2VyLnBvc2l0aW9uKTtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KHByZXZNYXJrZXIucG9zaXRpb24pO1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQobmV4dE1hcmtlci5wb3NpdGlvbik7XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZXRNaWRkbGVNYXJrZXIobmV4dG5leHRNYXJrZXIucG9zaXRpb24pO1xuXG4gICAgICBpZiAoYikge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9ob2xlJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXAucmVtb3ZlUG9seWdvbihtYXAuZ2V0RVBvbHlnb24oKSk7XG5cbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfcG9seWdvbicpO1xuICAgICAgfVxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZU1hcmtlckF0IChwb3NpdGlvbikge1xuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXI7XG4gICAgaWYgKHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICAgIG1hcmtlciA9IHRoaXMubWFya2VyQXQocG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIF9jaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG4gICAgbWFya2Vycy5mb3JFYWNoKChfbWFya2VyKSA9PiB7XG4gICAgICBpZiAoX2NoYW5nZVBvcykge1xuICAgICAgICBfbWFya2VyLnBvc2l0aW9uID0gKF9tYXJrZXIucG9zaXRpb24gPT09IDApID8gMCA6IF9tYXJrZXIucG9zaXRpb24gLSAxO1xuICAgICAgfVxuICAgICAgaWYgKF9tYXJrZXIgPT09IG1hcmtlcikge1xuICAgICAgICBtYXJrZXIuX3ByZXYuX25leHQgPSBtYXJrZXIuX25leHQ7XG4gICAgICAgIG1hcmtlci5fbmV4dC5fcHJldiA9IG1hcmtlci5fcHJldjtcbiAgICAgICAgX2NoYW5nZVBvcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbW92ZUxheWVyKG1hcmtlcik7XG5cbiAgICBpZiAobWFya2Vycy5sZW5ndGggPCA1KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5jbGVhcigpO1xuICAgICAgICBtYXAuZ2V0Vkdyb3VwKCkucmVtb3ZlTGF5ZXIobWFwLl9nZXRTZWxlY3RlZFZMYXllcigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGFkZE1hcmtlciAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIC8vIDEuIHJlY2FsY3VsYXRlIHBvc2l0aW9uc1xuICAgIGlmICh0eXBlb2YgbGF0bG5nID09PSAnbnVtYmVyJykge1xuICAgICAgcG9zaXRpb24gPSB0aGlzLm1hcmtlckF0KGxhdGxuZykucG9zaXRpb247XG4gICAgICB0aGlzLl9yZWNhbGNQb3NpdGlvbnMocG9zaXRpb24pO1xuXG4gICAgICB2YXIgcHJldk1hcmtlciA9IChwb3NpdGlvbiAtIDEpIDwgMCA/IHRoaXMubGFzdE1hcmtlcigpIDogdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgdmFyIG5leHRNYXJrZXIgPSB0aGlzLm1hcmtlckF0KChwb3NpdGlvbiA9PSAtMSkgPyAxIDogcG9zaXRpb24pO1xuICAgICAgbGF0bG5nID0gdGhpcy5fZ2V0TWlkZGxlTGF0TG5nKHByZXZNYXJrZXIsIG5leHRNYXJrZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgb3B0aW9ucy5kcmFnZ2FibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpKSB7XG4gICAgICBvcHRpb25zLmRyYWdnYWJsZSA9ICF0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXIgPSBuZXcgTWFya2VyKHRoaXMsIGxhdGxuZywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgICB0aGlzLl9sYXN0TWFya2VyID0gbWFya2VyO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvL2lmICh0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgLy8gIG1hcmtlci5kcmFnZ2luZy5kaXNhYmxlKCk7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICBtYXJrZXIuZHJhZ2dpbmcuZW5hYmxlKCk7XG4gICAgLy99XG5cbiAgICB0aGlzLmFkZExheWVyKG1hcmtlcik7XG5cbiAgICB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSAobWFya2VyLnBvc2l0aW9uICE9PSB1bmRlZmluZWQgKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX2xhc3RQb3NpdGlvbisrO1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fbGFzdE1hcmtlcjtcbiAgICAgIHRoaXMuX2ZpcnN0TWFya2VyLl9wcmV2ID0gbWFya2VyO1xuICAgICAgaWYgKG1hcmtlci5fcHJldikge1xuICAgICAgICB0aGlzLl9sYXN0TWFya2VyLl9uZXh0ID0gbWFya2VyO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9maXJzdE1hcmtlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fbGFzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB9XG5cbiAgICAvLyAyLiByZWNhbGN1bGF0ZSByZWxhdGlvbnNcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVjYWxjUmVsYXRpb25zKG1hcmtlcik7XG4gICAgfVxuICAgIC8vIDMuIHRyaWdnZXIgZXZlbnRcbiAgICBpZiAoIW1hcmtlci5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmFkZF9tYXJrZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdmFyIGlkcyA9IHRoaXMuX2lkcygpO1xuXG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuXG4gICAgaWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICB0aGlzLl9kZWxldGVFdmVudHMoaWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gMDtcblxuICAgIHRoaXMuX2ZpcnN0TWFya2VyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfZGVsZXRlRXZlbnRzIChpZCkge1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnZpZXdyZXNldF9pZHhbaWRdO1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnpvb21hbmltX2lkeFtpZF07XG4gIH0sXG4gIF9nZXRNaWRkbGVMYXRMbmcgKG1hcmtlcjEsIG1hcmtlcjIpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwLFxuICAgICAgcDEgPSBtYXAucHJvamVjdChtYXJrZXIxLmdldExhdExuZygpKSxcbiAgICAgIHAyID0gbWFwLnByb2plY3QobWFya2VyMi5nZXRMYXRMbmcoKSk7XG5cbiAgICByZXR1cm4gbWFwLnVucHJvamVjdChwMS5fYWRkKHAyKS5fZGl2aWRlQnkoMikpO1xuICB9LFxuICBfcmVjYWxjUG9zaXRpb25zIChwb3NpdGlvbikge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcblxuICAgIHZhciBjaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICBtYXJrZXJzLmZvckVhY2goKG1hcmtlciwgX3Bvc2l0aW9uKSA9PiB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgICAgICBjaGFuZ2VQb3MgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZVBvcykge1xuICAgICAgICB0aGlzLl9tYXJrZXJzW19wb3NpdGlvbl0ucG9zaXRpb24gKz0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3JlY2FsY1JlbGF0aW9ucyAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuXG4gICAgbWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIHBvc2l0aW9uKSA9PiB7XG5cbiAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gLSAxKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gKyAxKTtcblxuICAgICAgLy8gZmlyc3RcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLmxhc3RNYXJrZXIoKTtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdCgxKTtcbiAgICAgIH1cblxuICAgICAgLy8gbGFzdFxuICAgICAgaWYgKHBvc2l0aW9uID09PSBtYXJrZXJzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfaWRzICgpIHtcbiAgICB2YXIgcnNsdCA9IFtdO1xuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5fbGF5ZXJzKSB7XG4gICAgICByc2x0LnB1c2goaWQpO1xuICAgIH1cblxuICAgIHJzbHQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuXG4gICAgcmV0dXJuIHJzbHQ7XG4gIH0sXG4gIHNlbGVjdCAoKSB7XG4gICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl9tYXAuX3NlbGVjdGVkTUdyb3VwID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgICBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICBtYXJrZXIuc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IHRydWU7XG5cbiAgICB0aGlzLl9tYXAuX3NlbGVjdGVkTUdyb3VwID0gdGhpcztcbiAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9zZWxlY3QnKTtcbiAgfSxcbiAgaXNFbXB0eSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwO1xuICB9LFxuICByZXNldFNlbGVjdGlvbiAoKSB7XG4gICAgdGhpcy5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gZmFsc2U7XG4gIH1cbn0pIiwiZXhwb3J0IGRlZmF1bHQgTC5Db250cm9sLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBwb3NpdGlvbjogJ3RvcGxlZnQnLFxuICAgIGJ0bnM6IFtcbiAgICAgIC8veyd0aXRsZSc6ICdyZW1vdmUnLCAnY2xhc3NOYW1lJzogJ2ZhIGZhLXRyYXNoJ31cbiAgICBdLFxuICAgIGV2ZW50TmFtZTogXCJjb250cm9sQWRkZWRcIlxuICB9LFxuICBfYnRuOiBudWxsLFxuICBzdG9wRXZlbnQ6IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uLFxuICBpbml0aWFsaXplIChvcHRpb25zKSB7XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gIH0sXG4gIF90aXRsZUNvbnRhaW5lcjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcblxuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1iYXIgbGVhZmxldC1lZGl0b3ItYnV0dG9ucycpO1xuXG4gICAgbWFwLl9jb250cm9sQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NldEJ0bih0aGlzLm9wdGlvbnMuYnRucywgY29udGFpbmVyKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXZlbnROYW1lKSB7XG4gICAgICAgIG1hcC5maXJlKHRoaXMub3B0aW9ucy5ldmVudE5hbWUsIHtjb250cm9sOiB0aGlzfSk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG5cbiAgICBtYXAuZ2V0QnRuQ29udHJvbCA9ICgpID0+IHRoaXM7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfc2V0QnRuIChvcHRzLCBjb250YWluZXIpIHtcbiAgICB2YXIgX2J0bjtcbiAgICBvcHRzLmZvckVhY2goKGJ0biwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gb3B0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGJ0bi5jbGFzc05hbWUgKz0gXCIgbGFzdFwiO1xuICAgICAgfVxuICAgICAgLy92YXIgY2hpbGQgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1idG4nICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKTtcblxuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICdsZWFmbGV0LWJ0bicsIHdyYXBwZXIpO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgICB2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xuICAgICAgTC5Eb21FdmVudFxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuXG4gICAgICBsaW5rLmFwcGVuZENoaWxkKEwuRG9tVXRpbC5jcmVhdGUoJ2knLCAnZmEnICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKSk7XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCBwcmVzc0V2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIG1hcC5maXJlKHByZXNzRXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSh0aGlzLl9tYXAsIGJ0bi5wcmVzc0V2ZW50TmFtZSB8fCAnYnRuUHJlc3NlZCcpKTtcblxuICAgICAgTC5Eb21FdmVudC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgX2J0biA9IGxpbms7XG4gICAgfSk7XG4gICAgdGhpcy5fYnRuID0gX2J0bjtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1sndG9wbGVmdCddO1xuICB9LFxuICBnZXRCdG5BdCAocG9zKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnRuQ29udGFpbmVyKCkuY2hpbGRbcG9zXTtcbiAgfSxcbiAgZGlzYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH0sXG4gIGVuYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH1cbn0pOyIsImltcG9ydCBCdG5DdHJsIGZyb20gJy4vQnRuQ29udHJvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEJ0bkN0cmwuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIGV2ZW50TmFtZTogJ2xvYWRCdG5BZGRlZCdcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb250YWluZXIgPSBCdG5DdHJsLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub24oJ2xvYWRCdG5BZGRlZCcsICgpID0+IHtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuXG4gICAgICBMLkRvbUV2ZW50XG4gICAgICAgIC5vbih0aGlzLl9idG4sICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgICAub24odGhpcy5fYnRuLCAnY2xpY2snLCB0aGlzLl90b2dnbGUsIHRoaXMpO1xuXG4gICAgICB0aGlzLl9tYXAub24oJ3NlYXJjaEVuYWJsZWQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuX3JlbmRlckZvcm0oY29udGFpbmVyKTtcbiAgICB9KTtcblxuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsb2FkLWpzb24tY29udGFpbmVyJyk7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfdG9nZ2xlICgpIHtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLl90ZXh0YXJlYS5mb2N1cygpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5PcGVuZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuSGlkZGVuJyk7XG4gICAgfVxuICB9LFxuICBfY29sbGFwc2UgKCkge1xuICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl90ZXh0YXJlYS52YWx1ZSA9ICcnO1xuICB9LFxuICBfcmVuZGVyRm9ybSAoY29udGFpbmVyKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gTC5Eb21VdGlsLmNyZWF0ZSgnZm9ybScpO1xuXG4gICAgdmFyIHRleHRhcmVhID0gdGhpcy5fdGV4dGFyZWEgPSBMLkRvbVV0aWwuY3JlYXRlKCd0ZXh0YXJlYScpO1xuICAgIHRleHRhcmVhLnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnO1xuICAgIHRleHRhcmVhLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgd2hpdGUnO1xuICAgIHRleHRhcmVhLnN0eWxlLnBhZGRpbmcgPSAnNXB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNHB4JztcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2NsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2RibGNsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZXdoZWVsJywgdGhpcy5zdG9wRXZlbnQpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cbiAgICB2YXIgc3VibWl0QnRuID0gdGhpcy5fc3VibWl0QnRuID0gTC5Eb21VdGlsLmNyZWF0ZSgnYnV0dG9uJywgJ2xlYWZsZXQtc3VibWl0LWJ0bicpO1xuICAgIHN1Ym1pdEJ0bi50eXBlID0gXCJzdWJtaXRcIjtcbiAgICBzdWJtaXRCdG4uaW5uZXJUZXh0ID0gXCJzdWJtaXRcIjtcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ21vdXNlZG93bicsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ2NsaWNrJywgdGhpcy5fc3VibWl0Rm9ybSwgdGhpcyk7XG5cbiAgICBmb3JtLmFwcGVuZENoaWxkKHN1Ym1pdEJ0bik7XG5cbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gIH0sXG4gIF90aW1lb3V0OiBudWxsLFxuICBfc3VibWl0Rm9ybSAoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KTtcbiAgICB9XG5cbiAgICB2YXIganNvbjtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5wYXJzZSh0aGlzLl90ZXh0YXJlYS52YWx1ZSk7XG5cbiAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0Lmpzb25XYXNMb2FkZWQsIFwic3VjY2Vzc1wiKTtcblxuICAgICAgbWFwLmNyZWF0ZUVkaXRQb2x5Z29uKGpzb24pO1xuXG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH0sIDIwMDApO1xuXG4gICAgICB0aGlzLl9jb2xsYXBzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNoZWNrSnNvbiwgXCJlcnJvclwiKTtcblxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9LCAyMDAwKTtcbiAgICB9XG4gIH0sXG4gIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIubXNnKHRoaXMuX21hcC5vcHRpb25zLnRleHQubG9hZEpzb24pO1xuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAnbXNnY2VudGVyJyxcbiAgICBkZWZhdWx0TXNnOiBudWxsXG4gIH0sXG4gIGluaXRpYWxpemUgKG9wdGlvbnMpIHtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgfSxcbiAgX3RpdGxlQ29udGFpbmVyOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgdmFyIGNvcm5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LXRvcCcpO1xuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1tc2ctZWRpdG9yJyk7XG5cbiAgICBtYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXSA9IGNvcm5lcjtcbiAgICBtYXAuX2NvbnRyb2xDb250YWluZXIuYXBwZW5kQ2hpbGQoY29ybmVyKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29udGFpbmVyKGNvbnRhaW5lciwgbWFwKTtcbiAgICAgIG1hcC5maXJlKCdtc2dIZWxwZXJBZGRlZCcsIHtjb250cm9sOiB0aGlzfSk7XG5cbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH0sIDEwMDApO1xuXG4gICAgbWFwLmdldEJ0bkNvbnRyb2wgPSAoKSA9PiB0aGlzO1xuXG4gICAgdGhpcy5fYmluZEV2ZW50cyhtYXApO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX2NoYW5nZVBvcyAobWFwKSB7XG4gICAgdmFyIGNvbnRyb2xDb3JuZXIgPSBtYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXTtcbiAgICBpZiAoY29udHJvbENvcm5lciAmJiBjb250cm9sQ29ybmVyLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgdmFyIGNoaWxkID0gY29udHJvbENvcm5lci5jaGlsZHJlbi5pdGVtKCkuY2hpbGRyZW5bMF07XG5cbiAgICAgIGlmKCFjaGlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB3aWR0aCA9IGNoaWxkLmNsaWVudFdpZHRoO1xuICAgICAgaWYod2lkdGgpIHtcbiAgICAgICAgY29udHJvbENvcm5lci5zdHlsZS5sZWZ0ID0gKG1hcC5fY29udGFpbmVyLmNsaWVudFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCc7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfYmluZEV2ZW50cyAobWFwKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLl9jaGFuZ2VQb3MobWFwKTtcbiAgICAgIH0pO1xuICAgIH0sIDEpO1xuICB9LFxuICBfc2V0Q29udGFpbmVyIChjb250YWluZXIsIG1hcCkge1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnICE9PSBudWxsKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnO1xuICAgIH1cblxuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLm1zZyA9ICh0ZXh0LCB0eXBlKSA9PiB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRleHQ7XG5cbiAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLScgKyB0eXBlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH07XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5oaWRlID0gKCkgPT4ge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfTtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gIH0sXG4gIGdldEJ0bkF0IChwb3MpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdG5Db250YWluZXIoKS5jaGlsZFtwb3NdO1xuICB9LFxuICBkaXNhYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfSxcbiAgZW5hYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Qb2x5Z29uLmV4dGVuZCh7XG4gIGlzRW1wdHkgKCkge1xuICAgIHZhciBsYXRMbmdzID0gdGhpcy5nZXRMYXRMbmdzKCk7XG4gICAgcmV0dXJuIGxhdExuZ3MgPT09IG51bGwgfHwgbGF0TG5ncyA9PT0gdW5kZWZpbmVkIHx8IChsYXRMbmdzICYmIGxhdExuZ3MubGVuZ3RoID09PSAwKTtcbiAgfSxcbiAgZ2V0SG9sZSAoaG9sZUdyb3VwTnVtYmVyKSB7XG4gICAgaWYgKCEkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdO1xuICB9LFxuICBnZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlcikge1xuICAgIGlmICghJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAhJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXTtcbiAgfSxcbiAgZ2V0SG9sZXMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ob2xlcztcbiAgfSxcbiAgY2xlYXJIb2xlcyAoKSB7XG4gICAgdGhpcy5faG9sZXMgPSBbXTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5jbGVhckhvbGVzKCk7XG5cbiAgICBpZiAoJC5pc0FycmF5KHRoaXMuX2xhdGxuZ3MpICYmIHRoaXMuX2xhdGxuZ3NbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZUhvbGVQb2ludCAoaG9sZUdyb3VwTnVtYmVyLCBob2xlTnVtYmVyLCBsYXRsbmcpIHtcbiAgICBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXSA9IGxhdGxuZztcbiAgICB9IGVsc2UgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgISQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdID0gbGF0bG5nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ob2xlcyA9IGxhdGxuZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHNldEhvbGVzIChsYXRsbmdzKSB7XG4gICAgdGhpcy5faG9sZXMgPSBsYXRsbmdzO1xuICB9LFxuICBzZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlciwgbGF0bG5nKSB7XG4gICAgdmFyIGxheWVyID0gdGhpcy5nZXRMYXllcnMoKVswXTtcbiAgICBpZiAobGF5ZXIpIHtcbiAgICAgIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICAgIGxheWVyLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdW2hvbGVOdW1iZXJdID0gbGF0bG5nO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNsYXNzLmV4dGVuZCh7XG4gIF90aW1lOiAyMDAwLFxuICBpbml0aWFsaXplIChtYXAsIHRleHQsIHRpbWUpIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5fcG9wdXBQYW5lID0gbWFwLl9wYW5lcy5wb3B1cFBhbmU7XG4gICAgdGhpcy5fdGV4dCA9ICcnIHx8IHRleHQ7XG4gICAgdGhpcy5faXNTdGF0aWMgPSBmYWxzZTtcbiAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10b29sdGlwJywgdGhpcy5fcG9wdXBQYW5lKTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgdGhpcy5fdGltZSA9IHRpbWUgfHwgdGhpcy5fdGltZTtcbiAgfSxcblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9wb3B1cFBhbmUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICAgIHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gICdzdGF0aWMnIChpc1N0YXRpYykge1xuICAgIHRoaXMuX2lzU3RhdGljID0gaXNTdGF0aWMgfHwgdGhpcy5faXNTdGF0aWM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9yZW5kZXIgKCkge1xuICAgIHRoaXMuX2NvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxzcGFuPlwiICsgdGhpcy5fdGV4dCArIFwiPC9zcGFuPlwiO1xuICB9LFxuICBfdXBkYXRlUG9zaXRpb24gKGxhdGxuZykge1xuICAgIHZhciBwb3MgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyksXG4gICAgICB0b29sdGlwQ29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xuXG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgdG9vbHRpcENvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2luaGVyaXQnO1xuICAgICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRvb2x0aXBDb250YWluZXIsIHBvcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX3Nob3dFcnJvciAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihsYXRsbmcpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1N0YXRpYykge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9zaG93SW5mbyAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtaW5mby10b29sdGlwJyk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGxhdGxuZyk7XG5cbiAgICBpZiAoIXRoaXMuX2lzU3RhdGljKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX2hpZGUgKCkge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWluZm8tdG9vbHRpcCcpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgdGV4dCAodGV4dCkge1xuICAgIHRoaXMuX3RleHQgPSB0ZXh0IHx8IHRoaXMuX3RleHQ7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH0sXG4gIHNob3cgKGxhdGxuZywgdHlwZSA9ICdpbmZvJykge1xuXG4gICAgdGhpcy50ZXh0KCk7XG5cbiAgICBpZih0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihsYXRsbmcpO1xuICAgIH1cbiAgICBpZih0eXBlID09PSAnaW5mbycpIHtcbiAgICAgIHRoaXMuc2hvd0luZm8obGF0bG5nKTtcbiAgICB9XG4gIH0sXG4gIHNob3dJbmZvIChsYXRsbmcpIHtcbiAgICB0aGlzLl9zaG93SW5mbyhsYXRsbmcpO1xuXG4gICAgaWYgKHRoaXMuX2hpZGVJbmZvVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVJbmZvVGltZW91dCk7XG4gICAgICB0aGlzLl9oaWRlSW5mb1RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVJbmZvVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIHNob3dFcnJvciAobGF0bG5nKSB7XG4gICAgdGhpcy5fc2hvd0Vycm9yKGxhdGxuZyk7XG5cbiAgICBpZiAodGhpcy5faGlkZUVycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVFcnJvclRpbWVvdXQpO1xuICAgICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIGhpZGUgKCkge1xuICAgIHRoaXMuX2hpZGUoKTtcbiAgfSxcbiAgX29uTW91c2VNb3ZlIChlKSB7XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oZS5sYXRsbmcpO1xuICB9LFxuICBzZXRUaW1lICh0aW1lKSB7XG4gICAgaWYgKHRpbWUpIHtcbiAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IEJ0bkN0cmwgZnJvbSAnLi9CdG5Db250cm9sJztcblxuZXhwb3J0IGRlZmF1bHQgQnRuQ3RybC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgZXZlbnROYW1lOiAndHJhc2hBZGRlZCdcbiAgfSxcbiAgX2J0bjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIG1hcC5vbignYnRuUHJlc3NlZCcsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9idG4gJiYgIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpKSB7XG4gICAgICAgIHRoaXMuX29uUHJlc3NCdG4oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG1hcC5vbigndHJhc2hBZGRlZCcsICgpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgICBtYXAub24oJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0JywgdGhpcy5fYmluZEV2ZW50cywgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpzdGFydF9hZGRfbmV3X3BvbHlnb24nLCB0aGlzLl9iaW5kRXZlbnRzLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOnN0YXJ0X2FkZF9uZXdfaG9sZScsIHRoaXMuX2JpbmRFdmVudHMsIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX2NsZWFyJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfcG9seWdvbicsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICAgIG1hcC5vbignZWRpdG9yOm1hcF9jbGVhcmVkJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQnRuQ3RybC5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBfYmluZEV2ZW50cyAoKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG5cbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCwgdGhpcyk7XG4gIH0sXG4gIF9kaXNhYmxlQnRuICgpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5fYnRuLCAnZGlzYWJsZWQnKTtcblxuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIpO1xuICAgIEwuRG9tRXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0KTtcbiAgfSxcbiAgX29uUHJlc3NCdG4gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdmFyIHNlbGVjdGVkTUdyb3VwID0gbWFwLmdldFNlbGVjdGVkTUdyb3VwKCk7XG5cbiAgICBpZiAoc2VsZWN0ZWRNR3JvdXAgPT09IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkgJiYgc2VsZWN0ZWRNR3JvdXAuZ2V0TGF5ZXJzKClbMF0uX2lzRmlyc3QpIHtcbiAgICAgIG1hcC5jbGVhcigpO1xuICAgICAgbWFwLm1vZGUoJ2RyYXcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAucmVtb3ZlKCk7XG4gICAgICBzZWxlY3RlZE1Hcm91cC5nZXRERUxpbmUoKS5jbGVhcigpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX29uTW91c2VPdXQoKTtcbiAgfSxcbiAgX29uTW91c2VPdmVyICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmdldExheWVycygpWzBdLl9pc0ZpcnN0KSB7XG4gICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5yZWplY3RDaGFuZ2VzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuZGVsZXRlU2VsZWN0ZWRFZGdlcyk7XG4gICAgfVxuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICB9XG59KTsiLCJpbXBvcnQgc2VhcmNoIGZyb20gJy4uL3V0aWxzL3NlYXJjaCc7XG5pbXBvcnQgVHJhc2hCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvVHJhc2hCdG4nO1xuaW1wb3J0IExvYWRCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvTG9hZEJ0bic7XG5pbXBvcnQgQnRuQ29udHJvbCBmcm9tICcuLi9leHRlbmRlZC9CdG5Db250cm9sJztcbmltcG9ydCBNc2dIZWxwZXIgZnJvbSAnLi4vZXh0ZW5kZWQvTXNnSGVscGVyJztcbmltcG9ydCBtIGZyb20gJy4uL3V0aWxzL21vYmlsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcbiAgc2VhcmNoKCk7XG5cbiAgdmFyIGdnbCA9IG5ldyBMLkdvb2dsZSgpO1xuXG4gIHRoaXMuYWRkTGF5ZXIoZ2dsKTtcblxuICB0aGlzLl9jb250cm9sTGF5ZXJzID0gbmV3IEwuQ29udHJvbC5MYXllcnMoe1xuICAgICdHb29nbGUnOiBnZ2xcbiAgfSk7XG5cbiAgdGhpcy5hZGRDb250cm9sKHRoaXMuX2NvbnRyb2xMYXllcnMpO1xuXG4gIHRoaXMudG91Y2hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5kb3VibGVDbGlja1pvb20uZGlzYWJsZSgpO1xuICAvL3RoaXMuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgdGhpcy5ib3hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5rZXlib2FyZC5kaXNhYmxlKCk7XG5cbiAgdGhpcy5hZGRDb250cm9sKEwuY29udHJvbC5zZWFyY2goKSk7XG5cbiAgdmFyIHRyYXNoQnRuID0gbmV3IFRyYXNoQnRuKHtcbiAgICBidG5zOiBbXG4gICAgICB7J2NsYXNzTmFtZSc6ICdmYSBmYS10cmFzaCd9XG4gICAgXVxuICB9KTtcblxuICB2YXIgbG9hZEJ0biA9IG5ldyBMb2FkQnRuKHtcbiAgICBidG5zOiBbXG4gICAgICB7J2NsYXNzTmFtZSc6ICdmYSBmYS1hcnJvdy1jaXJjbGUtby1kb3duIGxvYWQnfVxuICAgIF1cbiAgfSk7XG5cbiAgdmFyIG1zZ0hlbHBlciA9IG5ldyBNc2dIZWxwZXIoe1xuICAgIGRlZmF1bHRNc2c6IHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXBcbiAgfSk7XG5cbiAgdGhpcy5vbignbXNnSGVscGVyQWRkZWQnLCAoZGF0YSkgPT4ge1xuICAgIHZhciBtc2dDb250YWluZXIgPSBkYXRhLmNvbnRyb2wuX3RpdGxlQ29udGFpbmVyO1xuXG4gICAgdGhpcy5fbXNnQ29udGFpbmVyID0gbXNnQ29udGFpbmVyO1xuICAgIHZhciB0ZXh0ID0gdGhpcy5vcHRpb25zLnRleHQ7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsICgpID0+IHtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb1NlbGVjdEVkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9BZGROZXdFZGdlcyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gb24gZWRpdCBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0RyYXdJbm5lckVkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH0pO1xuICAgICAgLy8gb24gdmlldyBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0VkaXQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBoaWRlIG1zZ1xuICAgIHRoaXMub2ZmKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgdGhpcy5vbignZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSk7XG4gICAgLy8gb24gc3RhcnQgZHJhdyBwb2x5Z29uXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0pvaW5FZGdlcyk7XG4gICAgfSk7XG4gICAgLy8gZGJsY2xpY2sgdG8gam9pblxuICAgIHRoaXMub2ZmKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5kYmxjbGlja1RvSm9pbkVkZ2VzKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICB9KTtcblxuICAgIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgICB0aGlzLm9uKCdlZGl0b3I6aW50ZXJzZWN0aW9uX2RldGVjdGVkJywgKGRhdGEpID0+IHtcbiAgICAgIC8vIG1zZ1xuICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWxlY3RlZE1hcmtlciA9IHRoaXMuZ2V0U2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgaWYoIXRoaXMuaGFzTGF5ZXIoc2VsZWN0ZWRNYXJrZXIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoc2VsZWN0ZWRNYXJrZXIgJiYgIXNlbGVjdGVkTWFya2VyLl9tR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgICAvL3NldCBtYXJrZXIgc3R5bGVcbiAgICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgLy9zZXQgJ2Vycm9yJyBzdHlsZVxuICAgICAgICAgIHNlbGVjdGVkTWFya2VyLnNldEludGVyc2VjdGVkU3R5bGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3Jlc3RvcmUgc3R5bGVcbiAgICAgICAgICBzZWxlY3RlZE1hcmtlci5yZXNldFN0eWxlKCk7XG4gICAgICAgICAgLy9yZXN0b3JlIG90aGVyIG1hcmtlcnMgd2hpY2ggYXJlIGFsc28gbmVlZCB0byByZXNldCBzdHlsZVxuICAgICAgICAgIHZhciBtYXJrZXJzVG9SZXNldCA9IHNlbGVjdGVkTWFya2VyLl9tR3JvdXAuZ2V0TGF5ZXJzKCkuZmlsdGVyKChsYXllcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIEwuRG9tVXRpbC5oYXNDbGFzcyhsYXllci5faWNvbiwgJ20tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvbicpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWFya2Vyc1RvUmVzZXQubWFwKChtYXJrZXIpID0+IG1hcmtlci5yZXNldFN0eWxlKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGlmICghbS5pc01vYmlsZUJyb3dzZXIoKSkge1xuICAgIHRoaXMuYWRkQ29udHJvbChtc2dIZWxwZXIpO1xuICAgIHRoaXMuYWRkQ29udHJvbChsb2FkQnRuKTtcbiAgfVxuXG4gIHRoaXMuYWRkQ29udHJvbCh0cmFzaEJ0bik7XG59IiwiaW1wb3J0IE1hcEVkaXRvciBmcm9tICcuLi9qcy9tYXAnO1xuXG53aW5kb3cuTWFwRWRpdG9yID0gTWFwRWRpdG9yOyIsImltcG9ydCBWaWV3R3JvdXAgZnJvbSAnLi92aWV3L2dyb3VwJztcbmltcG9ydCBFZGl0UG9seWdvbiBmcm9tICcuL2VkaXQvcG9seWdvbic7XG5pbXBvcnQgSG9sZXNHcm91cCBmcm9tICcuL2VkaXQvaG9sZXNHcm91cCc7XG5pbXBvcnQgRWRpdExpbmVHcm91cCBmcm9tICcuL2VkaXQvbGluZSc7XG5pbXBvcnQgRGFzaGVkRWRpdExpbmVHcm91cCBmcm9tICcuL2RyYXcvZGFzaGVkLWxpbmUnO1xuXG5pbXBvcnQgJy4vZWRpdC9tYXJrZXItZ3JvdXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHZpZXdHcm91cDogbnVsbCxcbiAgZWRpdEdyb3VwOiBudWxsLFxuICBlZGl0UG9seWdvbjogbnVsbCxcbiAgZWRpdE1hcmtlcnNHcm91cDogbnVsbCxcbiAgZWRpdExpbmVHcm91cDogbnVsbCxcbiAgZGFzaGVkRWRpdExpbmVHcm91cDogbnVsbCxcbiAgZWRpdEhvbGVNYXJrZXJzR3JvdXA6IG51bGwsXG4gIHNldExheWVycyAoKSB7XG4gICAgdGhpcy52aWV3R3JvdXAgPSBuZXcgVmlld0dyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRHcm91cCA9IG5ldyBMLkZlYXR1cmVHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihbXSk7XG4gICAgdGhpcy5lZGl0TWFya2Vyc0dyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdExpbmVHcm91cCA9IG5ldyBFZGl0TGluZUdyb3VwKFtdKTtcbiAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAgPSBuZXcgRGFzaGVkRWRpdExpbmVHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0SG9sZU1hcmtlcnNHcm91cCA9IG5ldyBIb2xlc0dyb3VwKFtdKTtcbiAgfVxufSIsImltcG9ydCBCYXNlIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgQ29udHJvbHNIb29rIGZyb20gJy4vaG9va3MvY29udHJvbHMnO1xuXG5pbXBvcnQgKiBhcyBsYXllcnMgZnJvbSAnLi9sYXllcnMnO1xuaW1wb3J0ICogYXMgb3B0cyBmcm9tICcuL29wdGlvbnMnO1xuXG5pbXBvcnQgJy4vdXRpbHMvYXJyYXknO1xuXG5mdW5jdGlvbiBtYXAoKSB7XG4gIHZhciBtYXAgPSBMLk1hcC5leHRlbmQoJC5leHRlbmQoQmFzZSwge1xuICAgICQ6IHVuZGVmaW5lZCxcbiAgICBpbml0aWFsaXplIChpZCwgb3B0aW9ucykge1xuICAgICAgJC5leHRlbmQob3B0cy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdHMub3B0aW9ucyk7XG4gICAgICBMLk1hcC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGlkLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuJCA9ICQodGhpcy5fY29udGFpbmVyKTtcblxuICAgICAgbGF5ZXJzLnNldExheWVycygpO1xuXG4gICAgICB0aGlzLl9hZGRMYXllcnMoW1xuICAgICAgICBsYXllcnMudmlld0dyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0UG9seWdvblxuICAgICAgICAsIGxheWVycy5lZGl0TWFya2Vyc0dyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRMaW5lR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZGFzaGVkRWRpdExpbmVHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0SG9sZU1hcmtlcnNHcm91cFxuICAgICAgXSk7XG5cbiAgICAgIHRoaXMuX3NldE92ZXJsYXlzKG9wdGlvbnMpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG9EcmF3KSB7XG4gICAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX3NldE92ZXJsYXlzIChvcHRzKSB7XG4gICAgICB2YXIgb3ZlcmxheXMgPSBvcHRzLm92ZXJsYXlzO1xuXG4gICAgICBmb3IgKHZhciBpIGluIG92ZXJsYXlzKSB7XG4gICAgICAgIHZhciBvaSA9IG92ZXJsYXlzW2ldO1xuICAgICAgICB0aGlzLl9jb250cm9sTGF5ZXJzLmFkZE92ZXJsYXkob2ksIGkpO1xuICAgICAgICBvaS5hZGRUbyh0aGlzKTtcbiAgICAgICAgb2kuYnJpbmdUb0JhY2soKTtcbiAgICAgICAgb2kub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9pLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRWR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy52aWV3R3JvdXA7XG4gICAgfSxcbiAgICBnZXRFR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0R3JvdXA7XG4gICAgfSxcbiAgICBnZXRFUG9seWdvbiAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRQb2x5Z29uO1xuICAgIH0sXG4gICAgZ2V0RU1hcmtlcnNHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRNYXJrZXJzR3JvdXA7XG4gICAgfSxcbiAgICBnZXRFTGluZUdyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdExpbmVHcm91cDtcbiAgICB9LFxuICAgIGdldERFTGluZSAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmRhc2hlZEVkaXRMaW5lR3JvdXA7XG4gICAgfSxcbiAgICBnZXRFSE1hcmtlcnNHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRIb2xlTWFya2Vyc0dyb3VwO1xuICAgIH0sXG4gICAgZ2V0U2VsZWN0ZWRQb2x5Z29uOiAoKSA9PiB0aGlzLl9zZWxlY3RlZFBvbHlnb24sXG4gICAgZ2V0U2VsZWN0ZWRNR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTUdyb3VwO1xuICAgIH1cbiAgfSkpO1xuXG4gIG1hcC5hZGRJbml0SG9vayhDb250cm9sc0hvb2spO1xuXG4gIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1hcCgpO1xuIiwiaW1wb3J0IG0gZnJvbSAnLi91dGlscy9tb2JpbGUnO1xuXG52YXIgc2l6ZSA9IDE7XG52YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5pZiAobS5pc01vYmlsZUJyb3dzZXIoKSkge1xuICBzaXplID0gMjtcbn1cblxuZXhwb3J0IHZhciBmaXJzdEljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb24tZmlyc3RcIixcbiAgaWNvblNpemU6IFs4ICogc2l6ZSwgOCAqIHNpemVdXG59KTtcblxuZXhwb3J0IHZhciBpY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplLCAxMCAqIHNpemVdXG59KTtcblxuZXhwb3J0IHZhciBkcmFnSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvbi1kcmFnXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplICogMywgMTAgKiBzaXplICogM11cbn0pO1xuXG5leHBvcnQgdmFyIG1pZGRsZUljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMTAgKiBzaXplLCAxMCAqIHNpemVdXG5cbn0pO1xuXG4vLyBkaXNhYmxlIGhvdmVyIGljb24gdG8gc2ltcGxpZnlcblxuZXhwb3J0IHZhciBob3Zlckljb24gPSBpY29uIHx8IEwuZGl2SWNvbih7XG4gICAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uXCIsXG4gICAgaWNvblNpemU6IFsyICogNyAqIHNpemUsIDIgKiA3ICogc2l6ZV1cbiAgfSk7XG5cbmV4cG9ydCB2YXIgaW50ZXJzZWN0aW9uSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsyICogNyAqIHNpemUsIDIgKiA3ICogc2l6ZV1cbn0pOyIsInZhciB2aWV3Q29sb3IgPSAnIzAwRkZGRic7XG52YXIgZHJhd0NvbG9yID0gJyMwMEY4MDAnO1xudmFyIGVkaXRDb2xvciA9ICcjMDBGODAwJztcbnZhciB3ZWlnaHQgPSAzO1xuXG5leHBvcnQgdmFyIG9wdGlvbnMgPSB7XG4gIGFsbG93SW50ZXJzZWN0aW9uOiBmYWxzZSxcbiAgYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uOiBmYWxzZSwgLy90b2RvOiB1bmZpbmlzaGVkXG4gIGZvcmNlVG9EcmF3OiB0cnVlLFxuICB0cmFuc2xhdGlvbnM6IHtcbiAgICByZW1vdmVQb2x5Z29uOiBcInJlbW92ZSBwb2x5Z29uXCIsXG4gICAgcmVtb3ZlUG9pbnQ6IFwicmVtb3ZlIHBvaW50XCJcbiAgfSxcbiAgb3ZlcmxheXM6IHt9LFxuICBzdHlsZToge1xuICAgIHZpZXc6IHtcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjIsXG4gICAgICBkYXNoQXJyYXk6IG51bGwsXG4gICAgICBjbGlja2FibGU6IGZhbHNlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiB2aWV3Q29sb3IsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH0sXG4gICAgZHJhdzoge1xuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMixcbiAgICAgIGRhc2hBcnJheTogJzUsIDEwJyxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBjb2xvcjogZHJhd0NvbG9yLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRcbiAgICB9XG4gIH0sXG4gIG1hcmtlckljb246IHVuZGVmaW5lZCxcbiAgbWFya2VySG92ZXJJY29uOiB1bmRlZmluZWQsXG4gIGVycm9yTGluZVN0eWxlOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHdlaWdodDogMyxcbiAgICBvcGFjaXR5OiAxLFxuICAgIHNtb290aEZhY3RvcjogMVxuICB9LFxuICBwcmV2aWV3RXJyb3JMaW5lU3R5bGU6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgd2VpZ2h0OiAzLFxuICAgIG9wYWNpdHk6IDEsXG4gICAgc21vb3RoRmFjdG9yOiAxLFxuICAgIGRhc2hBcnJheTogJzUsIDEwJ1xuICB9LFxuICB0ZXh0OiB7XG4gICAgaW50ZXJzZWN0aW9uOiBcIlNlbGYtaW50ZXJzZWN0aW9uIGlzIHByb2hpYml0ZWRcIixcbiAgICBkZWxldGVQb2ludEludGVyc2VjdGlvbjogXCJEZWxldGlvbiBvZiBwb2ludCBpcyBub3QgcG9zc2libGUuIFNlbGYtaW50ZXJzZWN0aW9uIGlzIHByb2hpYml0ZWRcIixcbiAgICByZW1vdmVQb2x5Z29uOiBcIlJlbW92ZSBwb2x5Z29uXCIsXG4gICAgY2xpY2tUb0VkaXQ6IFwiY2xpY2sgdG8gZWRpdFwiLFxuICAgIGNsaWNrVG9BZGROZXdFZGdlczogXCI8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uIHN0YXRpYyBncm91cC1zZWxlY3RlZCc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gYWRkIG5ldyBlZGdlczwvZGl2PlwiLFxuICAgIGNsaWNrVG9EcmF3SW5uZXJFZGdlczogXCJjbGljayB0byBkcmF3IGlubmVyIGVkZ2VzXCIsXG4gICAgY2xpY2tUb0pvaW5FZGdlczogXCJjbGljayB0byBqb2luIGVkZ2VzXCIsXG4gICAgY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXM6IFwiPGRpdj5jbGljayZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9J20tZWRpdG9yLWRpdi1pY29uIHN0YXRpYyBncm91cC1zZWxlY3RlZCc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gcmVtb3ZlIGVkZ2UmbmJzcDsmbmJzcDtvciZuYnNwOyZuYnNwOzxpIGNsYXNzPSdmYSBmYS10cmFzaCc+PC9pPiZuYnNwOyZuYnNwO3RvIHJlbW92ZSBhbGwgc2VsZWN0ZWQgZWRnZXM8L2Rpdj5cIixcbiAgICBjbGlja1RvU2VsZWN0RWRnZXM6IFwiPGRpdj5jbGljayZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9J20tZWRpdG9yLWRpdi1pY29uIHN0YXRpYyc+PC9kaXY+Jm5ic3A7LyZuYnNwOzxkaXYgY2xhc3M9J20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbiBzdGF0aWMnPjwvZGl2PiZuYnNwOyZuYnNwO3RvIHNlbGVjdCBlZGdlczwvZGl2PlwiLFxuICAgIGRibGNsaWNrVG9Kb2luRWRnZXM6IFwiZG91YmxlIGNsaWNrIHRvIGpvaW4gZWRnZXNcIixcbiAgICBjbGlja1RvU3RhcnREcmF3UG9seWdvbk9uTWFwOiBcImNsaWNrIHRvIHN0YXJ0IGRyYXcgcG9seWdvbiBvbiBtYXBcIixcbiAgICBkZWxldGVTZWxlY3RlZEVkZ2VzOiBcImRlbGV0ZWQgc2VsZWN0ZWQgZWRnZXNcIixcbiAgICByZWplY3RDaGFuZ2VzOiBcInJlamVjdCBjaGFuZ2VzXCIsXG4gICAganNvbldhc0xvYWRlZDogXCJKU09OIHdhcyBsb2FkZWRcIixcbiAgICBjaGVja0pzb246IFwiY2hlY2sgSlNPTlwiLFxuICAgIGxvYWRKc29uOiBcImxvYWQgR2VvSlNPTlwiLFxuICAgIGZvcmdldFRvU2F2ZTogXCJTYXZlIGNoYW5nZXMgYnkgcHJlc3Npbmcgb3V0c2lkZSBvZiBwb2x5Z29uXCJcbiAgfSxcbiAgd29ybGRDb3B5SnVtcDogdHJ1ZVxufTtcblxuZXhwb3J0IHZhciBkcmF3TGluZVN0eWxlID0ge1xuICBvcGFjaXR5OiAwLjcsXG4gIGZpbGw6IGZhbHNlLFxuICBmaWxsQ29sb3I6IGRyYXdDb2xvcixcbiAgY29sb3I6IGRyYXdDb2xvcixcbiAgd2VpZ2h0OiB3ZWlnaHQsXG4gIGRhc2hBcnJheTogJzUsIDEwJyxcbiAgc3Ryb2tlOiB0cnVlLFxuICBjbGlja2FibGU6IGZhbHNlXG59OyIsIkFycmF5LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdGhpcy5zcGxpY2UodG8sIDAsIHRoaXMuc3BsaWNlKGZyb20sIDEpWzBdKTtcbn07XG5BcnJheS5wcm90b3R5cGUuX2VhY2ggPSBmdW5jdGlvbihmdW5jKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgZnVuYy5jYWxsKHRoaXMsIHRoaXNbaV0sIGkpO1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgQXJyYXk7XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGlzTW9iaWxlQnJvd3NlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjaGVjayA9IGZhbHNlO1xuICAgIChmdW5jdGlvbiAoYSkge1xuICAgICAgaWYgKC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm98YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsvaS50ZXN0KGEpIHx8IC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzXFwtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfFxcLW18ciB8cyApfGF2YW58YmUoY2t8bGx8bnEpfGJpKGxifHJkKXxibChhY3xheil8YnIoZXx2KXd8YnVtYnxid1xcLShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtXFwtfGNlbGx8Y2h0bXxjbGRjfGNtZFxcLXxjbyhtcHxuZCl8Y3Jhd3xkYShpdHxsbHxuZyl8ZGJ0ZXxkY1xcLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8XFwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KFxcLXxfKXxnMSB1fGc1NjB8Z2VuZXxnZlxcLTV8Z1xcLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGRcXC0obXxwfHQpfGhlaVxcLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzXFwtY3xodChjKFxcLXwgfF98YXxnfHB8c3x0KXx0cCl8aHUoYXd8dGMpfGlcXC0oMjB8Z298bWEpfGkyMzB8aWFjKCB8XFwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2NcXC18a3lvKGN8ayl8bGUobm98eGkpfGxnKCBnfFxcLyhrfGx8dSl8NTB8NTR8XFwtW2Etd10pfGxpYnd8bHlueHxtMVxcLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtXFwtY3J8bWUocmN8cmkpfG1pKG84fG9hfHRzKXxtbWVmfG1vKDAxfDAyfGJpfGRlfGRvfHQoXFwtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSlcXC18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfFxcLShbMS04XXxjKSl8cGhpbHxwaXJlfHBsKGF5fHVjKXxwblxcLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdFxcLWd8cWFcXC1hfHFjKDA3fDEyfDIxfDMyfDYwfFxcLVsyLTddfGlcXC0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoXFwtfG9vfHBcXC0pfHNka1xcL3xzZShjKFxcLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2hcXC18c2hhcnxzaWUoXFwtfG0pfHNrXFwtMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoXFwtfHZcXC18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2xcXC18dGRnXFwtfHRlbChpfG0pfHRpbVxcLXx0XFwtbW98dG8ocGx8c2gpfHRzKDcwfG1cXC18bTN8bTUpfHR4XFwtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118XFwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYyhcXC18ICl8d2ViY3x3aGl0fHdpKGcgfG5jfG53KXx3bWxifHdvbnV8eDcwMHx5YXNcXC18eW91cnx6ZXRvfHp0ZVxcLS9pLnRlc3QoYS5zdWJzdHIoMCwgNCkpKSB7XG4gICAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKTtcbiAgICByZXR1cm4gY2hlY2s7XG4gIH1cbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICBMLkNvbnRyb2wuU2VhcmNoID0gTC5Db250cm9sLmV4dGVuZCh7XG4gICAgb3B0aW9uczoge1xuICAgICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICAgIHRpdGxlOiAnc2VhcmNoIGxvY2F0aW9uJyxcbiAgICAgIGVtYWlsOiAnJ1xuICAgIH0sXG5cbiAgICBvbkFkZCAobWFwKSB7XG4gICAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYmFyIGxlYWZsZXQtc2VhcmNoLWJhcicpO1xuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICcnLCB3cmFwcGVyKTtcbiAgICAgIGxpbmsuaHJlZiA9ICcjJztcblxuICAgICAgdmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcbiAgICAgIEwuRG9tRXZlbnRcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdkYmxjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgdGhpcy5fdG9nZ2xlLCB0aGlzKTtcblxuICAgICAgbGluay5hcHBlbmRDaGlsZChMLkRvbVV0aWwuY3JlYXRlKCdpJywgJ2ZhIGZhLXNlYXJjaCcpKTtcblxuICAgICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuXG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLl9pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24oaW5wdXQsICdjbGljaycsIHN0b3ApO1xuXG4gICAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcblxuICAgICAgTC5Eb21FdmVudC5vbihmb3JtLCAnc3VibWl0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9kb1NlYXJjaChpbnB1dC52YWx1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIHRoaXMpLm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcblxuXG4gICAgICB0aGlzLl9tYXAub24oJ2xvYWRCdG5PcGVuZWQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XG5cbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoY29udGFpbmVyLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihjb250YWluZXIsICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuXG4gICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG5cbiAgICBfdG9nZ2xlICgpIHtcbiAgICAgIGlmICh0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgIT0gJ2Jsb2NrJykge1xuICAgICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB0aGlzLl9pbnB1dC5mb2N1cygpO1xuICAgICAgICB0aGlzLl9tYXAuZmlyZSgnc2VhcmNoRW5hYmxlZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ3NlYXJjaERpc2FibGVkJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9jb2xsYXBzZSAoKSB7XG4gICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB0aGlzLl9pbnB1dC52YWx1ZSA9ICcnO1xuICAgIH0sXG5cbiAgICBfbm9taW5hdGltQ2FsbGJhY2sgKHJlc3VsdHMpIHtcblxuICAgICAgaWYgKHRoaXMuX3Jlc3VsdHMpIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzdWx0c0NvbnRhaW5lciA9IHRoaXMuX3Jlc3VsdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJzgwcHgnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1kgPSAnYXV0byc7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLm92ZXJmbG93WCA9ICdoaWRkZW4nO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5tYXJnaW4gPSAnM3B4JztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUucGFkZGluZyA9ICcycHgnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXIgPSAnMnB4IGdyZXkgc29saWQnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnMnB4JztcblxuICAgICAgdmFyIGRpdlJlc3VsdHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkaXYgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnc2VhcmNoLXJlc3VsdHMtZWwnKTtcbiAgICAgICAgZGl2LmlubmVyVGV4dCA9IHJlc3VsdHNbaV0uZGlzcGxheV9uYW1lO1xuICAgICAgICBkaXYudGl0bGUgPSByZXN1bHRzW2ldLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgcmVzdWx0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCByZXN1bHQsIGRpdkVsKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGl2UmVzdWx0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoZGl2UmVzdWx0c1tqXSwgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoZGl2RWwsICdzZWxlY3RlZCcpO1xuXG4gICAgICAgICAgICB2YXIgYmJveCA9IHJlc3VsdC5ib3VuZGluZ2JveDtcbiAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoTC5sYXRMbmdCb3VuZHMoW1tiYm94WzBdLCBiYm94WzJdXSwgW2Jib3hbMV0sIGJib3hbM11dXSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSh0aGlzLl9tYXAsIHJlc3VsdHNbaV0sIGRpdikpO1xuXG4gICAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgTC5Eb21FdmVudC5vbihkaXYsICdtb3VzZXdoZWVsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgICAgLm9uKGRpdiwgJ2NsaWNrJywgY2FsbGJhY2spO1xuXG4gICAgICAgIGRpdlJlc3VsdHMucHVzaChkaXYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9mb3JtLmFwcGVuZENoaWxkKHJlc3VsdHNDb250YWluZXIpO1xuXG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2FsbGJhY2tJZDogMCxcblxuICAgIF9kb1NlYXJjaCAocXVlcnkpIHtcbiAgICAgIHZhciBjYWxsYmFjayA9ICdfbF9vc21nZW9jb2Rlcl8nICsgdGhpcy5fY2FsbGJhY2tJZCsrO1xuICAgICAgd2luZG93W2NhbGxiYWNrXSA9IEwuVXRpbC5iaW5kKHRoaXMuX25vbWluYXRpbUNhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHtcbiAgICAgICAgcTogcXVlcnksXG4gICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICdqc29uX2NhbGxiYWNrJzogY2FsbGJhY2tcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVtYWlsKVxuICAgICAgICBxdWVyeVBhcmFtcy5lbWFpbCA9IHRoaXMub3B0aW9ucy5lbWFpbDtcbiAgICAgIGlmICh0aGlzLl9tYXAuZ2V0Qm91bmRzKCkpXG4gICAgICAgIHF1ZXJ5UGFyYW1zLnZpZXdib3ggPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCkudG9CQm94U3RyaW5nKCk7XG4gICAgICB2YXIgdXJsID0gJ2h0dHA6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoJyArIEwuVXRpbC5nZXRQYXJhbVN0cmluZyhxdWVyeVBhcmFtcyk7XG4gICAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9LFxuICAgIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5tc2codGhpcy5vcHRpb25zLnRpdGxlKTtcbiAgICB9LFxuICAgIF9vbk1vdXNlT3V0ICgpIHtcbiAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIEwuY29udHJvbC5zZWFyY2ggPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgTC5Db250cm9sLlNlYXJjaChvcHRpb25zKTtcbiAgfTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob2JqZWN0ID0ge30sIGFycmF5ID0gW10pIHtcbiAgdmFyIHJzbHQgPSBvYmplY3Q7XG5cbiAgdmFyIHRtcDtcbiAgdmFyIF9mdW5jID0gZnVuY3Rpb24gKGlkLCBpbmRleCkge1xuICAgIHZhciBwb3NpdGlvbiA9IHJzbHRbaWRdLnBvc2l0aW9uO1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocG9zaXRpb24gIT09IGluZGV4KSB7XG4gICAgICAgIHRtcCA9IHJzbHRbaWRdO1xuICAgICAgICByc2x0W2lkXSA9IHJzbHRbYXJyYXlbcG9zaXRpb25dXTtcbiAgICAgICAgcnNsdFthcnJheVtwb3NpdGlvbl1dID0gdG1wO1xuICAgICAgfVxuXG4gICAgICBpZiAocG9zaXRpb24gIT0gaW5kZXgpIHtcbiAgICAgICAgX2Z1bmMuY2FsbChudWxsLCBpZCwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgYXJyYXkuZm9yRWFjaChfZnVuYyk7XG5cbiAgcmV0dXJuIHJzbHQ7XG59OyIsImV4cG9ydCBkZWZhdWx0IEwuTXVsdGlQb2x5Z29uLmV4dGVuZCh7XG4gIGluaXRpYWxpemUgKGxhdGxuZ3MsIG9wdGlvbnMpIHtcbiAgICBMLk11bHRpUG9seWdvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZ3MsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5vbignbGF5ZXJhZGQnLCAoZSkgPT4ge1xuICAgICAgdmFyIG1WaWV3U3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5zdHlsZS52aWV3O1xuICAgICAgZS50YXJnZXQuc2V0U3R5bGUoJC5leHRlbmQoe1xuICAgICAgICBvcGFjaXR5OiAwLjcsXG4gICAgICAgIGZpbGxPcGFjaXR5OiAwLjM1LFxuICAgICAgICBjb2xvcjogJyMwMEFCRkYnXG4gICAgICB9LCBtVmlld1N0eWxlKSk7XG5cbiAgICAgIHRoaXMuX21hcC5fbW92ZUVQb2x5Z29uT25Ub3AoKTtcbiAgICB9KTtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIEwuTXVsdGlQb2x5Z29uLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZighZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKCFlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3ZlcicpO1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuXG4gICAgbWFwLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gIH1cbn0pOyJdfQ==
