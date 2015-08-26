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
      if (this._getSelectedVLayer()) {
        this._setEPolygon_To_VGroup();
      } else {
        this._addEPolygon_To_VGroup();
      }
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
    });

    map.on('editor:marker_group_select', this._bindEvents, this);

    map.on('editor:start_add_new_polygon', this._bindEvents, this);

    map.on('editor:start_add_new_hole', this._bindEvents, this);

    map.on('editor:marker_group_clear', this._disableBtn, this);
    map.on('editor:delete_polygon', this._disableBtn, this);
    map.on('editor:delete_hole', this._disableBtn, this);
    map.on('editor:map_cleared', this._disableBtn, this);

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvYmFzZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9kcmF3L2Rhc2hlZC1saW5lLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2RyYXcvZXZlbnRzLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2VkaXQvaG9sZXNHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9lZGl0L2xpbmUuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXItZ3JvdXAuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9tYXJrZXIuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZWRpdC9wb2x5Z29uLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0Jhc2VNYXJrZXJHcm91cC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9CdG5Db250cm9sLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL0xvYWRCdG4uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvTXNnSGVscGVyLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL2V4dGVuZGVkL1BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvZXh0ZW5kZWQvVG9vbHRpcC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9leHRlbmRlZC9UcmFzaEJ0bi5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9pbmRleC5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9sYXllcnMuanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvbWFwLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL21hcmtlci1pY29ucy5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy9vcHRpb25zLmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL2FycmF5LmpzIiwiL1VzZXJzL29sZWcvcHJvamVjdHMvbGVhZmxldC1lZGl0b3Ivc3JjL2pzL3V0aWxzL21vYmlsZS5qcyIsIi9Vc2Vycy9vbGVnL3Byb2plY3RzL2xlYWZsZXQtZWRpdG9yL3NyYy9qcy91dGlscy9zZWFyY2guanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdXRpbHMvc29ydEJ5UG9zaXRpb24uanMiLCIvVXNlcnMvb2xlZy9wcm9qZWN0cy9sZWFmbGV0LWVkaXRvci9zcmMvanMvdmlldy9ncm91cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzBCQ0F1QixlQUFlOzs7OzJCQUNkLGdCQUFnQjs7OztxQkFFekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN0QixpQkFB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RUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFNO0FBQ3hCLFVBQUksYUFBYSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQzNDLFVBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQzNCLFdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztPQUMxQyxNQUFNO0FBQ0wsWUFBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUM1QyxhQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDMUM7T0FDRjtLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLEdBQUcsRUFBRTtBQUNiLFFBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckIsT0FBRyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3pDLE9BQUcsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztHQUN6QztDQUNGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERyYXdFdmVudHMgZnJvbSAnLi9kcmF3L2V2ZW50cyc7XG5pbXBvcnQgRWRpdFBvbHlnb24gZnJvbSAnLi9lZGl0L3BvbHlnb24nO1xuXG5leHBvcnQgZGVmYXVsdCAkLmV4dGVuZCh7XG4gIF9zZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfc2VsZWN0ZWRWTGF5ZXI6IHVuZGVmaW5lZCxcbiAgX29sZFNlbGVjdGVkTWFya2VyOiB1bmRlZmluZWQsXG4gIF9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ6IGZhbHNlLFxuICBfbW9kZVR5cGU6ICdkcmF3JyxcbiAgX2NvbnRyb2xMYXllcnM6IHVuZGVmaW5lZCxcbiAgX2dldFNlbGVjdGVkVkxheWVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRWTGF5ZXI7XG4gIH0sXG4gIF9zZXRTZWxlY3RlZFZMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9zZWxlY3RlZFZMYXllciA9IGxheWVyO1xuICB9LFxuICBfY2xlYXJTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSB1bmRlZmluZWQ7XG4gIH0sXG4gIF9oaWRlU2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgbGF5ZXIuYnJpbmdUb0JhY2soKTtcblxuICAgIGlmICghbGF5ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy9zaG93IGxhc3QgbGF5ZXJcbiAgICB0aGlzLl9zaG93U2VsZWN0ZWRWTGF5ZXIodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSk7XG4gICAgLy9oaWRlXG4gICAgdGhpcy5fc2V0U2VsZWN0ZWRWTGF5ZXIobGF5ZXIpO1xuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgfSxcbiAgX3Nob3dTZWxlY3RlZFZMYXllciAobGF5ZXIgPSB0aGlzLl9zZWxlY3RlZFZMYXllcikge1xuICAgIGlmICghbGF5ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGF5ZXIuX3BhdGguc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICB9LFxuICBfYWRkRUdyb3VwX1RvX1ZHcm91cCAoKSB7XG4gICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG4gICAgdmFyIGVHcm91cCA9IHRoaXMuZ2V0RUdyb3VwKCk7XG5cbiAgICBlR3JvdXAuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgaWYgKCFsYXllci5pc0VtcHR5KCkpIHtcbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICB2YXIgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcbiAgICAgICAgaWYgKCQuaXNBcnJheShob2xlcykpIHtcbiAgICAgICAgICBpZiAoaG9sZXMpIHtcbiAgICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9hZGRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgdmFyIGxhdGxuZ3MgPSBlUG9seWdvbi5nZXRMYXRMbmdzKCk7XG5cbiAgICBpZiAobGF0bG5ncy5sZW5ndGggPD0gMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICBpZiAoaG9sZXMpIHtcbiAgICAgICAgbGF0bG5ncyA9IFtsYXRsbmdzXS5jb25jYXQoaG9sZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICB2R3JvdXAuYWRkTGF5ZXIoTC5wb2x5Z29uKGxhdGxuZ3MpKTtcbiAgfSxcbiAgX3NldEVQb2x5Z29uX1RvX1ZHcm91cCAoKSB7XG4gICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgIHZhciBzZWxlY3RlZFZMYXllciA9IHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCk7XG5cbiAgICBpZiAoIXNlbGVjdGVkVkxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZWN0ZWRWTGF5ZXIuX2xhdGxuZ3MgPSBlUG9seWdvbi5nZXRMYXRMbmdzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIuX2hvbGVzID0gZVBvbHlnb24uZ2V0SG9sZXMoKTtcbiAgICBzZWxlY3RlZFZMYXllci5yZWRyYXcoKTtcbiAgfSxcbiAgX2NvbnZlcnRfRUdyb3VwX1RvX1ZHcm91cCAoKSB7XG4gICAgdGhpcy5nZXRWR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuX2FkZEVHcm91cF9Ub19WR3JvdXAoKTtcbiAgfSxcbiAgX2NvbnZlcnRUb0VkaXQgKGdyb3VwKSB7XG4gICAgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NdWx0aVBvbHlnb24pIHtcbiAgICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgICBlR3JvdXAuY2xlYXJMYXllcnMoKTtcblxuICAgICAgZ3JvdXAuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgICB2YXIgbGF0bG5ncyA9IGxheWVyLmdldExhdExuZ3MoKTtcblxuICAgICAgICB2YXIgaG9sZXMgPSBsYXllci5faG9sZXM7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgbGF0bG5ncyA9IFtsYXRsbmdzXS5jb25jYXQoaG9sZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVkaXRQb2x5Z29uID0gbmV3IEVkaXRQb2x5Z29uKGxhdGxuZ3MpO1xuICAgICAgICBlZGl0UG9seWdvbi5hZGRUbyh0aGlzKTtcbiAgICAgICAgZUdyb3VwLmFkZExheWVyKGVkaXRQb2x5Z29uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVHcm91cDtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ3JvdXAgaW5zdGFuY2VvZiBMLk1hcmtlckdyb3VwKSB7XG4gICAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgICB2YXIgbGF5ZXJzID0gZ3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgICBsYXllcnMgPSBsYXllcnMuZmlsdGVyKChsYXllcikgPT4gIWxheWVyLmlzTWlkZGxlKCkpO1xuICAgICAgdmFyIHBvaW50c0FycmF5ID0gbGF5ZXJzLm1hcCgobGF5ZXIpID0+IGxheWVyLmdldExhdExuZygpKTtcblxuICAgICAgdmFyIGhvbGVzID0gZVBvbHlnb24uZ2V0SG9sZXMoKTtcblxuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIHBvaW50c0FycmF5ID0gW3BvaW50c0FycmF5XS5jb25jYXQoaG9sZXMpO1xuICAgICAgfVxuXG4gICAgICBlUG9seWdvbi5zZXRMYXRMbmdzKHBvaW50c0FycmF5KTtcbiAgICAgIGVQb2x5Z29uLnJlZHJhdygpO1xuXG4gICAgICByZXR1cm4gZVBvbHlnb247XG4gICAgfVxuICB9LFxuICBfc2V0TW9kZSAodHlwZSkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIC8vdGhpcy5nZXRWR3JvdXAoKS5zZXRTdHlsZShvcHRpb25zLnN0eWxlW3R5cGVdKTtcbiAgICAvL3RoaXMuZ2V0RUdyb3VwKCkuc2V0U3R5bGUob3B0aW9ucy5lZGl0R3JvdXBTdHlsZS5tb2RlW3R5cGVdKTtcblxuICAgIC8vaWYgKCF0aGlzLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgdGhpcy5nZXRFUG9seWdvbigpLnNldFN0eWxlKG9wdGlvbnMuc3R5bGVbdHlwZV0pO1xuICAgIC8vfVxuXG4gICAgLy90aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAvL3RoaXMuJC50cmlnZ2VyKHt0eXBlOiAnbW9kZScsIHZhbHVlOiB0eXBlfSk7XG4gICAgLy90aGlzLiQudHJpZ2dlcih7dHlwZTogJ21vZGU6JyArIHR5cGV9KTtcbiAgfSxcblxuICBfZ2V0TW9kZVR5cGUgKCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgfSxcbiAgX3NldE1vZGVUeXBlICh0eXBlKSB7XG4gICAgdGhpcy4kLnJlbW92ZUNsYXNzKCdtYXAtJyArIHRoaXMuX21vZGVUeXBlKTtcbiAgICB0aGlzLl9tb2RlVHlwZSA9IHR5cGU7XG4gICAgdGhpcy4kLmFkZENsYXNzKCdtYXAtJyArIHRoaXMuX21vZGVUeXBlKTtcbiAgfSxcbiAgX3NldE1hcmtlcnNHcm91cEljb24gKG1hcmtlckdyb3VwKSB7XG4gICAgdmFyIG1JY29uID0gdGhpcy5vcHRpb25zLm1hcmtlckljb247XG4gICAgdmFyIG1Ib3Zlckljb24gPSB0aGlzLm9wdGlvbnMubWFya2VySG92ZXJJY29uO1xuXG4gICAgdmFyIG1vZGUgPSB0aGlzLl9nZXRNb2RlVHlwZSgpO1xuICAgIGlmIChtSWNvbikge1xuICAgICAgaWYgKCFtSWNvbi5tb2RlKSB7XG4gICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUljb24gPSBtSWNvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpY29uID0gbUljb24ubW9kZVttb2RlXTtcbiAgICAgICAgaWYgKGljb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUljb24gPSBpY29uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1Ib3Zlckljb24pIHtcbiAgICAgIGlmICghbUhvdmVySWNvbi5tb2RlKSB7XG4gICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IG1Ib3Zlckljb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWNvbiA9IG1Ib3Zlckljb25bbW9kZV07XG4gICAgICAgIGlmIChpY29uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBpY29uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uIHx8IG1hcmtlckdyb3VwLm9wdGlvbnMubUljb247XG5cbiAgICBpZiAobW9kZSA9PT0gXCJhZnRlckRyYXdcIikge1xuICAgICAgbWFya2VyR3JvdXAudXBkYXRlU3R5bGUoKTtcbiAgICB9XG4gIH0sXG4gIC8vbW9kZXM6ICd2aWV3JywgJ2VkaXQnLCAnZHJhdycsICdsaXN0J1xuICBtb2RlICh0eXBlKSB7XG4gICAgdGhpcy5maXJlKHRoaXMuX21vZGVUeXBlICsgJ19ldmVudHNfZGlzYWJsZScpO1xuICAgIHRoaXMuZmlyZSh0eXBlICsgJ19ldmVudHNfZW5hYmxlJyk7XG5cbiAgICB0aGlzLl9zZXRNb2RlVHlwZSh0eXBlKTtcblxuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tb2RlVHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJFdmVudHMoKTtcbiAgICAgIHR5cGUgPSB0aGlzW3R5cGVdKCkgfHwgdHlwZTtcbiAgICAgIHRoaXMuX3NldE1vZGUodHlwZSk7XG4gICAgfVxuICB9LFxuICBpc01vZGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIC8vdmllZXcgKCkge1xuICAvLyAgaWYgKHRoaXMuaXNNb2RlKCdlZGl0JykgfHwgdGhpcy5pc01vZGUoJ2RyYXcnKSB8fCB0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgLy8gICAgdGhpcy5fY2xlYXJNYXAoKTtcbiAgLy9cbiAgLy8gIH1cbiAgLy8gIHRoaXMuX2ZpdFZCb3VuZHMoKTtcbiAgLy8gIHRoaXMuX2JpbmRWaWV3RXZlbnRzKCk7XG4gIC8vfSxcbiAgZHJhdyAoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKCdlZGl0JykgfHwgdGhpcy5pc01vZGUoJ3ZpZXcnKSB8fCB0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgICAgIHRoaXMuX2NsZWFyTWFwKCk7XG5cbiAgICB9XG4gICAgdGhpcy5fYmluZERyYXdFdmVudHMoKTtcbiAgfSxcbiAgY2FuY2VsICgpIHtcbiAgICB0aGlzLl9jbGVhck1hcCgpO1xuXG4gICAgdGhpcy5tb2RlKCd2aWV3Jyk7XG4gIH0sXG4gIGNsZWFyICgpIHtcbiAgICB0aGlzLl9jbGVhckV2ZW50cygpO1xuICAgIHRoaXMuX2NsZWFyTWFwKCk7XG4gICAgdGhpcy5maXJlKCdlZGl0b3I6bWFwX2NsZWFyZWQnKTtcbiAgfSxcbiAgY2xlYXJBbGwgKCkge1xuICAgIHRoaXMubW9kZSgndmlldycpO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmdldFZHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gIH0sXG4gIC8qKlxuICAgKlxuICAgKiBUaGUgbWFpbiBpZGVhIGlzIHRvIHNhdmUgRVBvbHlnb24gdG8gVkdyb3VwIHdoZW46XG4gICAqIDEpIHVzZXIgYWRkIG5ldyBwb2x5Z29uXG4gICAqIDIpIHdoZW4gdXNlciBlZGl0IHBvbHlnb25cbiAgICpcbiAgICogKi9cbiAgICBzYXZlU3RhdGUgKCkge1xuXG4gICAgdmFyIGVQb2x5Z29uID0gX21hcC5nZXRFUG9seWdvbigpO1xuXG4gICAgaWYoIWVQb2x5Z29uLmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5maXRCb3VuZHMoZVBvbHlnb24uZ2V0Qm91bmRzKCkpO1xuICAgICAgdGhpcy5fbXNnQ29udGFpbmVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5mb3JnZXRUb1NhdmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSkge1xuICAgICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICAgIHZhciBnZW9qc29uID0gdGhpcy5nZXRWR3JvdXAoKS50b0dlb0pTT04oKTtcbiAgICAgIGlmIChnZW9qc29uLmdlb21ldHJ5KSB7XG4gICAgICAgIHJldHVybiBnZW9qc29uLmdlb21ldHJ5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSxcbiAgZ2V0U2VsZWN0ZWRNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZE1hcmtlcjtcbiAgfSxcbiAgY2xlYXJTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBudWxsO1xuICB9LFxuICByZW1vdmVTZWxlY3RlZE1hcmtlciAoKSB7XG4gICAgdmFyIHNlbGVjdGVkTWFya2VyID0gdGhpcy5fc2VsZWN0ZWRNYXJrZXI7XG4gICAgdmFyIHByZXZNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5wcmV2KCk7XG4gICAgdmFyIG5leHRNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5uZXh0KCk7XG4gICAgdmFyIG1pZGxlUHJldk1hcmtlciA9IHNlbGVjdGVkTWFya2VyLl9taWRkbGVQcmV2O1xuICAgIHZhciBtaWRkbGVOZXh0TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIuX21pZGRsZU5leHQ7XG4gICAgc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBtaWRsZVByZXZNYXJrZXI7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIucmVtb3ZlKCk7XG4gICAgdGhpcy5fc2VsZWN0ZWRNYXJrZXIgPSBtaWRkbGVOZXh0TWFya2VyO1xuICAgIHRoaXMuX3NlbGVjdGVkTWFya2VyLnJlbW92ZSgpO1xuICAgIHByZXZNYXJrZXIuX21pZGRsZU5leHQgPSBudWxsO1xuICAgIG5leHRNYXJrZXIuX21pZGRsZVByZXYgPSBudWxsO1xuICB9LFxuICByZW1vdmVQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgLy90aGlzLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHBvbHlnb24uY2xlYXIoKTtcblxuICAgIGlmICh0aGlzLmlzTW9kZSgnYWZ0ZXJEcmF3JykpIHtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJTZWxlY3RlZE1hcmtlcigpO1xuICAgIHRoaXMuX3NldEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICB9LFxuICBjcmVhdGVFZGl0UG9seWdvbiAoanNvbikge1xuICAgIHZhciBnZW9Kc29uID0gTC5nZW9Kc29uKGpzb24pO1xuXG4gICAgdGhpcy5jbGVhcigpO1xuXG4gICAgdmFyIGxheWVycyA9IGdlb0pzb24uZ2V0TGF5ZXJzID8gZ2VvSnNvbi5nZXRMYXllcnMoKSA6IFtsYXllcl07XG4gICAgdmFyIHZHcm91cCA9IHRoaXMuZ2V0Vkdyb3VwKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBfbCA9IGxheWVyc1tpXTtcbiAgICAgIHZHcm91cC5hZGRMYXllcihfbCk7XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG5cbiAgICB0aGlzLl9maXRWQm91bmRzKCk7XG4gIH0sXG4gIG1vdmVNYXJrZXIgKGxhdGxuZykge1xuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLmdldFNlbGVjdGVkKCkuc2V0TGF0TG5nKGxhdGxuZyk7XG4gIH0sXG4gIF9maXRWQm91bmRzICgpIHtcbiAgICBpZiAodGhpcy5nZXRWR3JvdXAoKS5nZXRMYXllcnMoKS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRoaXMuZml0Qm91bmRzKHRoaXMuZ2V0Vkdyb3VwKCkuZ2V0Qm91bmRzKCksIHtwYWRkaW5nOiBbMzAsIDMwXX0pO1xuICAgICAgLy90aGlzLmludmFsaWRhdGVTaXplKCk7XG4gICAgfVxuICB9LFxuICBfY2xlYXJNYXAgKCkge1xuICAgIHRoaXMuZ2V0RUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5jbGVhcigpO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IHRoaXMuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcblxuICAgIGlmIChzZWxlY3RlZE1Hcm91cCkge1xuICAgICAgc2VsZWN0ZWRNR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcblxuICAgIHRoaXMuX2FjdGl2ZUVkaXRMYXllciA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuX3Nob3dTZWxlY3RlZFZMYXllcigpO1xuICAgIHRoaXMuX2NsZWFyU2VsZWN0ZWRWTGF5ZXIoKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcbiAgfSxcbiAgX2NsZWFyRXZlbnRzICgpIHtcbiAgICAvL3RoaXMuX3VuQmluZFZpZXdFdmVudHMoKTtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG4gIH0sXG4gIF9hY3RpdmVFZGl0TGF5ZXI6IHVuZGVmaW5lZCxcbiAgX3NldEFjdGl2ZUVkaXRMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2dldEFjdGl2ZUVkaXRMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUVkaXRMYXllcjtcbiAgfSxcbiAgX2NsZWFyQWN0aXZlRWRpdExheWVyICgpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBudWxsO1xuICB9LFxuICBfc2V0RUhNYXJrZXJHcm91cCAoYXJyYXlMYXRMbmcpIHtcbiAgICB2YXIgaG9sZU1hcmtlckdyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuX2lzSG9sZSA9IHRydWU7XG5cbiAgICB0aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKGhvbGVNYXJrZXJHcm91cCk7XG5cbiAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgaG9sZU1hcmtlckdyb3VwLmFkZFRvKGVoTWFya2Vyc0dyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cExheWVycyA9IGVoTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgdmFyIGhHcm91cFBvcyA9IGVoTWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaG9sZU1hcmtlckdyb3VwLl9wb3NpdGlvbiA9IGhHcm91cFBvcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMYXRMbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHNldCBob2xlIG1hcmtlclxuICAgICAgaG9sZU1hcmtlckdyb3VwLnNldEhvbGVNYXJrZXIoYXJyYXlMYXRMbmdbaV0sIHVuZGVmaW5lZCwge30sIHtoR3JvdXA6IGhHcm91cFBvcywgaE1hcmtlcjogaX0pO1xuICAgIH1cblxuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgbGF5ZXJzLm1hcCgobGF5ZXIsIHBvc2l0aW9uKSA9PiB7XG4gICAgICBob2xlTWFya2VyR3JvdXAuX3NldE1pZGRsZU1hcmtlcnMobGF5ZXIsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgbGF5ZXJzID0gaG9sZU1hcmtlckdyb3VwLmdldExheWVycygpO1xuXG4gICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICBlUG9seWdvbi51cGRhdGVIb2xlUG9pbnQoaEdyb3VwUG9zLCBsYXllci5fX3Bvc2l0aW9uLCBsYXllci5fbGF0bG5nKTtcbiAgICB9KTtcblxuICAgIC8vZVBvbHlnb24uc2V0SG9sZSgpXG4gICAgcmV0dXJuIGhvbGVNYXJrZXJHcm91cDtcbiAgfSxcbiAgX21vdmVFUG9seWdvbk9uVG9wICgpIHtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgaWYgKGVQb2x5Z29uLl9jb250YWluZXIpIHtcbiAgICAgIHZhciBsYXN0Q2hpbGQgPSAkKGVQb2x5Z29uLl9jb250YWluZXIucGFyZW50RWxlbWVudCkuY2hpbGRyZW4oKS5sYXN0KCk7XG4gICAgICB2YXIgJGVQb2x5Z29uID0gJChlUG9seWdvbi5fY29udGFpbmVyKTtcbiAgICAgIGlmICgkZVBvbHlnb25bMF0gIT09IGxhc3RDaGlsZCkge1xuICAgICAgICAkZVBvbHlnb24uZGV0YWNoKCkuaW5zZXJ0QWZ0ZXIobGFzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc3RvcmVFUG9seWdvbiAocG9seWdvbikge1xuICAgIHBvbHlnb24gPSBwb2x5Z29uIHx8IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHNldCBtYXJrZXJzXG4gICAgdmFyIGxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcblxuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLnNldEFsbChsYXRsbmdzKTtcblxuICAgIC8vdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG5cbiAgICAvLyBzZXQgaG9sZSBtYXJrZXJzXG4gICAgdmFyIGhvbGVzID0gcG9seWdvbi5nZXRIb2xlcygpO1xuICAgIGlmIChob2xlcykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBob2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGdldENvbnRyb2xMYXllcnM6ICgpID0+IHRoaXMuX2NvbnRyb2xMYXllcnMsXG4gIGVkZ2VzSW50ZXJzZWN0ZWQgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCA9IHZhbHVlO1xuICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZmlyZShcImVkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWRcIiwge2ludGVyc2VjdGlvbjogdHJ1ZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7aW50ZXJzZWN0aW9uOiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2Vycm9yVGltZW91dDogbnVsbCxcbiAgX3Nob3dJbnRlcnNlY3Rpb25FcnJvciAodGV4dCkge1xuXG4gICAgaWYgKHRoaXMuX2Vycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Vycm9yVGltZW91dCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbXNnQ29udGFpbmVyLm1zZyh0ZXh0IHx8IHRoaXMub3B0aW9ucy50ZXh0LmludGVyc2VjdGlvbiwgJ2Vycm9yJyk7XG5cbiAgICB0aGlzLl9lcnJvclRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSwgMTAwMCk7XG4gIH1cbn0sIERyYXdFdmVudHMpO1xuIiwiaW1wb3J0ICogYXMgb3B0cyBmcm9tICcuLi9vcHRpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgTC5Qb2x5bGluZS5leHRlbmQoe1xuICBvcHRpb25zOiBvcHRzLmRyYXdMaW5lU3R5bGUsXG4gIF9sYXRsbmdUb01vdmU6IHVuZGVmaW5lZCxcbiAgYWRkTGF0TG5nIChsYXRsbmcpIHtcbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhdGxuZ3MubGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5fbGF0bG5ncy5zcGxpY2UoLTEpO1xuICAgIH1cblxuICAgIHRoaXMuX2xhdGxuZ3MucHVzaChMLmxhdExuZyhsYXRsbmcpKTtcblxuICAgIHJldHVybiB0aGlzLnJlZHJhdygpO1xuICB9LFxuICB1cGRhdGUgKHBvcykge1xuXG4gICAgaWYgKCF0aGlzLl9sYXRsbmdUb01vdmUgJiYgdGhpcy5fbGF0bG5ncy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IEwubGF0TG5nKHBvcyk7XG4gICAgICB0aGlzLl9sYXRsbmdzLnB1c2godGhpcy5fbGF0bG5nVG9Nb3ZlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xhdGxuZ1RvTW92ZSkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlLmxhdCA9IHBvcy5sYXQ7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubG5nID0gcG9zLmxuZztcblxuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9hZGRMaW5lIChsaW5lLCBncm91cCwgaXNMYXN0TWFya2VyKSB7XG4gICAgaWYgKCFpc0xhc3RNYXJrZXIpIHtcbiAgICAgIGxpbmUuYWRkVG8oZ3JvdXApO1xuICAgIH1cbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHRoaXMuc2V0TGF0TG5ncyhbXSk7XG4gIH1cbn0pOyIsImltcG9ydCB7Zmlyc3RJY29uLGljb24sZHJhZ0ljb24sbWlkZGxlSWNvbixob3Zlckljb24saW50ZXJzZWN0aW9uSWNvbn0gZnJvbSAnLi4vbWFya2VyLWljb25zJztcbmV4cG9ydCBkZWZhdWx0IHtcbiAgX2JpbmREcmF3RXZlbnRzICgpIHtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG5cbiAgICAvLyBjbGljayBvbiBtYXBcbiAgICB0aGlzLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAvLyBidWcgZml4XG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRYID09PSAwICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRZID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKChlLnRhcmdldCBpbnN0YW5jZW9mIEwuTWFya2VyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gZS50YXJnZXQuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgICAvLyBzdGFydCBhZGQgbmV3IHBvbHlnb25cbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZSk7XG5cbiAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19wb2x5Z29uJyk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkTUdyb3VwID0gZU1hcmtlcnNHcm91cDtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBjb250aW51ZSB3aXRoIG5ldyBwb2x5Z29uXG4gICAgICB2YXIgZmlyc3RNYXJrZXIgPSBlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCk7XG5cbiAgICAgIGlmIChmaXJzdE1hcmtlciAmJiBmaXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKCEoZS50YXJnZXQgaW5zdGFuY2VvZiBMLk1hcmtlcikpIHtcbiAgICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBzdGFydCBkcmF3IG5ldyBob2xlIHBvbHlnb25cbiAgICAgIHZhciBlaE1hcmtlcnNHcm91cCA9IHRoaXMuZ2V0RUhNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChmaXJzdE1hcmtlciAmJiAhZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICgoZS50YXJnZXQuZ2V0RVBvbHlnb24oKS5fcGF0aCA9PSBlLm9yaWdpbmFsRXZlbnQudG9FbGVtZW50KSkge1xuICAgICAgICAgIGlmICghZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKSkge1xuICAgICAgICAgICAgdmFyIGxhc3RIR3JvdXAgPSBlaE1hcmtlcnNHcm91cC5hZGRIb2xlR3JvdXAoKTtcbiAgICAgICAgICAgIGxhc3RIR3JvdXAuc2V0KGUubGF0bG5nLCBudWxsLCB7aWNvbjogZmlyc3RJY29ufSk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWRNR3JvdXAgPSBsYXN0SEdyb3VwO1xuICAgICAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19ob2xlJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICBpZiAoZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKSkge1xuICAgICAgICBpZiAodGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2lzTWFya2VySW5Qb2x5Z29uKGUubGF0bG5nKSkge1xuICAgICAgICAgIHZhciBtYXJrZXIgPSBlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpLnNldChlLmxhdGxuZyk7XG4gICAgICAgICAgdmFyIHJzbHQgPSBtYXJrZXIuX2RldGVjdEludGVyc2VjdGlvbigpOyAvLyBpbiBjYXNlIG9mIGhvbGVcbiAgICAgICAgICBpZihyc2x0KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcblxuICAgICAgICAgICAgLy9tYXJrZXIuX21Hcm91cC5yZW1vdmVNYXJrZXIobWFya2VyKTsgLy90b2RvOiBkZXRlY3QgaW50ZXJzZWN0aW9uIGZvciBob2xlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVzZXRcblxuICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBlLm1Hcm91cDtcblxuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuX2lzSG9sZSkge1xuICAgICAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRMYXN0SG9sZSgpO1xuICAgICAgfVxuICAgICAgLy8xLiBzZXQgbWlkZGxlIG1hcmtlcnNcbiAgICAgIHZhciBsYXllcnMgPSBlTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgICB2YXIgcG9zaXRpb24gPSAtMTtcbiAgICAgIGxheWVycy5mb3JFYWNoKCgpID0+IHtcbiAgICAgICAgdmFyIG1hcmtlciA9IGVNYXJrZXJzR3JvdXAuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7aWNvbjogbWlkZGxlSWNvbn0pO1xuICAgICAgICBwb3NpdGlvbiA9IG1hcmtlci5wb3NpdGlvbiArIDI7XG4gICAgICB9KTtcblxuICAgICAgLy8yLiBjbGVhciBsaW5lXG4gICAgICBlTWFya2Vyc0dyb3VwLmdldERFTGluZSgpLmNsZWFyKCk7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIuZHJhZ2dpbmcuZW5hYmxlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5zZWxlY3QoKTtcblxuICAgICAgZU1hcmtlcnNHcm91cC5zZWxlY3QoKTtcblxuICAgICAgdGhpcy5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5nZXRWR3JvdXAoKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkgJiYgZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVzZXRcbiAgICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICAgIHRoaXMuX2hpZGVTZWxlY3RlZFZMYXllcihlLmxheWVyKTtcblxuICAgICAgICBlTWFya2Vyc0dyb3VwLnJlc3RvcmUoZS5sYXllcik7XG4gICAgICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQoZU1hcmtlcnNHcm91cCk7XG5cbiAgICAgICAgZU1hcmtlcnNHcm91cC5zZWxlY3QoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpkZWxldGVfbWFya2VyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY29udmVydFRvRWRpdCh0aGlzLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgfSk7XG4gICAgdGhpcy5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpLnJlbW92ZSgpO1xuICAgIH0pO1xuICB9LFxuICBfYWRkTWFya2VyIChlKSB7XG4gICAgdmFyIGxhdGxuZyA9IGUubGF0bG5nO1xuXG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHZhciBtYXJrZXIgPSBlTWFya2Vyc0dyb3VwLnNldChsYXRsbmcpO1xuXG4gICAgdGhpcy5fY29udmVydFRvRWRpdChlTWFya2Vyc0dyb3VwKTtcblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIF91cGRhdGVERUxpbmUgKGxhdGxuZykge1xuICAgIHJldHVybiB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRERUxpbmUoKS51cGRhdGUobGF0bG5nKTtcbiAgfSxcbiAgX3VuQmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMub2ZmKCdjbGljaycpO1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkub2ZmKCdjbGljaycpO1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuICAgIHRoaXMub2ZmKCdkYmxjbGljaycpO1xuXG4gICAgdGhpcy5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpqb2luX3BhdGgnKTtcblxuICAgIGlmICh0aGlzLl9vcGVuUG9wdXApIHtcbiAgICAgIHRoaXMub3BlblBvcHVwID0gdGhpcy5fb3BlblBvcHVwO1xuICAgICAgZGVsZXRlIHRoaXMuX29wZW5Qb3B1cDtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0SG9sZTogdW5kZWZpbmVkLFxuICBfbGFzdEhvbGVUb0RyYXc6IHVuZGVmaW5lZCxcbiAgYWRkSG9sZUdyb3VwICgpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IG5ldyBMLk1hcmtlckdyb3VwKCk7XG4gICAgdGhpcy5fbGFzdEhvbGUuX2lzSG9sZSA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEhvbGUuYWRkVG8odGhpcyk7XG5cbiAgICB0aGlzLl9sYXN0SG9sZS5wb3NpdGlvbiA9IHRoaXMuZ2V0TGVuZ3RoKCkgLSAxO1xuXG4gICAgdGhpcy5fbGFzdEhvbGVUb0RyYXcgPSB0aGlzLl9sYXN0SG9sZTtcblxuICAgIHJldHVybiB0aGlzLl9sYXN0SG9sZTtcbiAgfSxcbiAgZ2V0TGVuZ3RoICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGg7XG4gIH0sXG4gIHJlc2V0TGFzdEhvbGUgKCkge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gdW5kZWZpbmVkO1xuICB9LFxuICBnZXRMYXN0SG9sZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RIb2xlO1xuICB9LFxuICByZW1vdmUgKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChob2xlKSA9PiB7XG4gICAgICB3aGlsZSAoaG9sZS5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgaG9sZS5yZW1vdmVNYXJrZXJBdCgwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVwb3MgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBpZiAobGF5ZXIucG9zaXRpb24gPj0gcG9zaXRpb24pIHtcbiAgICAgICAgbGF5ZXIucG9zaXRpb24gLT0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVzZXRTZWxlY3Rpb24gKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5GZWF0dXJlR3JvdXAuZXh0ZW5kKHtcbiAgICB1cGRhdGUgKCkge1xuICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG4vLyAgICBtYXAuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZShtYXAuZWRpdFN0eWxlW21hcC5fZ2V0TW9kZVR5cGUoKV0pO1xuICAgIH1cbiAgfSk7IiwiaW1wb3J0IEJhc2VNR3JvdXAgZnJvbSAnLi4vZXh0ZW5kZWQvQmFzZU1hcmtlckdyb3VwJztcbmltcG9ydCBFZGl0TWFya2VyIGZyb20gJy4uL2VkaXQvbWFya2VyJztcbmltcG9ydCBFZGl0TGluZUdyb3VwIGZyb20gJy4uL2VkaXQvbGluZSc7XG5pbXBvcnQgRGFzaGVkRWRpdExpbmVHcm91cCBmcm9tICcuLi9kcmF3L2Rhc2hlZC1saW5lJztcblxuaW1wb3J0IHNvcnQgZnJvbSAnLi4vdXRpbHMvc29ydEJ5UG9zaXRpb24nO1xuaW1wb3J0ICogYXMgaWNvbnMgZnJvbSAnLi4vbWFya2VyLWljb25zJztcblxuTC5VdGlsLmV4dGVuZChMLkxpbmVVdGlsLCB7XG4gIC8vIENoZWNrcyB0byBzZWUgaWYgdHdvIGxpbmUgc2VnbWVudHMgaW50ZXJzZWN0LiBEb2VzIG5vdCBoYW5kbGUgZGVnZW5lcmF0ZSBjYXNlcy5cbiAgLy8gaHR0cDovL2NvbXBnZW9tLmNzLnVpdWMuZWR1L35qZWZmZS90ZWFjaGluZy8zNzMvbm90ZXMveDA2LXN3ZWVwbGluZS5wZGZcbiAgc2VnbWVudHNJbnRlcnNlY3QgKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMiwgLypQb2ludCovIHAzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMiwgcDMpICE9PVxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAxLCBwMiwgcDMpICYmXG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDEsIHAyKSAhPT1cbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwLCBwMSwgcDMpO1xuICB9LFxuXG4gIC8vIGNoZWNrIHRvIHNlZSBpZiBwb2ludHMgYXJlIGluIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXJcbiAgX2NoZWNrQ291bnRlcmNsb2Nrd2lzZSAoLypQb2ludCovIHAsIC8qUG9pbnQqLyBwMSwgLypQb2ludCovIHAyKSB7XG4gICAgcmV0dXJuIChwMi55IC0gcC55KSAqIChwMS54IC0gcC54KSA+IChwMS55IC0gcC55KSAqIChwMi54IC0gcC54KTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEwuTWFya2VyR3JvdXAgPSBCYXNlTUdyb3VwLmV4dGVuZCh7XG4gIF9pc0hvbGU6IGZhbHNlLFxuICBfZWRpdExpbmVHcm91cDogdW5kZWZpbmVkLFxuICBfcG9zaXRpb246IHVuZGVmaW5lZCxcbiAgZGFzaGVkRWRpdExpbmVHcm91cDogbmV3IERhc2hlZEVkaXRMaW5lR3JvdXAoW10pLFxuICBvcHRpb25zOiB7XG4gICAgbUljb246IHVuZGVmaW5lZCxcbiAgICBtSG92ZXJJY29uOiB1bmRlZmluZWRcbiAgfSxcbiAgaW5pdGlhbGl6ZSAobGF5ZXJzKSB7XG4gICAgTC5MYXllckdyb3VwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF5ZXJzKTtcblxuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgICAvL3RoaXMuX2JpbmRFdmVudHMoKTtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8obWFwKTtcbiAgfSxcbiAgX3VwZGF0ZURFTGluZSAobGF0bG5nKSB7XG4gICAgdmFyIGRlTGluZSA9IHRoaXMuZ2V0REVMaW5lKCk7XG4gICAgaWYgKHRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICBkZUxpbmUudXBkYXRlKGxhdGxuZyk7XG4gICAgfVxuICAgIHJldHVybiBkZUxpbmU7XG4gIH0sXG4gIF9hZGRNYXJrZXIgKGxhdGxuZykge1xuICAgIC8vdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHRoaXMuc2V0KGxhdGxuZyk7XG4gICAgdGhpcy5nZXRERUxpbmUoKS5hZGRMYXRMbmcobGF0bG5nKTtcblxuICAgIHRoaXMuX21hcC5fY29udmVydFRvRWRpdCh0aGlzKTtcbiAgfSxcbiAgZ2V0REVMaW5lICgpIHtcbiAgICBpZiAoIXRoaXMuZGFzaGVkRWRpdExpbmVHcm91cC5fbWFwKSB7XG4gICAgICB0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuYWRkVG8odGhpcy5fbWFwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwO1xuICB9LFxuICBfc2V0SG92ZXJJY29uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuX29sZFNlbGVjdGVkTWFya2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIuX3Jlc2V0SWNvbih0aGlzLm9wdGlvbnMubUljb24pO1xuICAgIH1cbiAgICBtYXAuX3NlbGVjdGVkTWFya2VyLl9zZXRIb3Zlckljb24odGhpcy5vcHRpb25zLm1Ib3Zlckljb24pO1xuICB9LFxuICBfc29ydEJ5UG9zaXRpb24gKCkge1xuICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcblxuICAgICAgbGF5ZXJzID0gbGF5ZXJzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuX2xlYWZsZXRfaWQgLSBiLl9sZWFmbGV0X2lkO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBpZEFycmF5ID0gW107XG4gICAgICB2YXIgcG9zQXJyYXkgPSBbXTtcbiAgICAgIGxheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgICBpZEFycmF5LnB1c2gobGF5ZXIuX2xlYWZsZXRfaWQpO1xuICAgICAgICBwb3NBcnJheS5wdXNoKGxheWVyLl9fcG9zaXRpb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHNvcnQodGhpcy5fbGF5ZXJzLCBpZEFycmF5KTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZVN0eWxlICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBtYXJrZXIgPSBtYXJrZXJzW2ldO1xuICAgICAgbWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICAgIGlmIChtYXJrZXIgPT09IHRoaXMuX21hcC5fc2VsZWN0ZWRNYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fc2V0SG92ZXJJY29uKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXRTZWxlY3RlZCAobWFya2VyKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCAmJiB0aGlzLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLmdldExhc3QoKTtcbiAgICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIgPSBtYXAuX3NlbGVjdGVkTWFya2VyO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1hcC5fb2xkU2VsZWN0ZWRNYXJrZXIgPSBtYXAuX3NlbGVjdGVkTWFya2VyO1xuICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSBtYXJrZXI7XG4gIH0sXG4gIHJlc2V0U2VsZWN0ZWQgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIpIHtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIuX3Jlc2V0SWNvbih0aGlzLm9wdGlvbnMubUljb24pO1xuICAgICAgbWFwLl9zZWxlY3RlZE1hcmtlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0sXG4gIGdldFNlbGVjdGVkICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgfSxcbiAgX3NldEZpcnN0IChtYXJrZXIpIHtcbiAgICB0aGlzLl9maXJzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB0aGlzLl9maXJzdE1hcmtlci5fc2V0Rmlyc3RJY29uKCk7XG4gIH0sXG4gIGdldEZpcnN0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlyc3RNYXJrZXI7XG4gIH0sXG4gIGdldExhc3QgKCkge1xuICAgIGlmICh0aGlzLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuICAgICAgcmV0dXJuIGxheWVyc1tsYXllcnMubGVuZ3RoIC0gMV07XG4gICAgfVxuICB9LFxuICBoYXNGaXJzdE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3QoKSAmJiB0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpO1xuICB9LFxuICBjb252ZXJ0VG9MYXRMbmdzICgpIHtcbiAgICB2YXIgbGF0bG5ncyA9IFtdO1xuICAgIHRoaXMuZWFjaExheWVyKGZ1bmN0aW9uIChsYXllcikge1xuICAgICAgaWYgKCFsYXllci5pc01pZGRsZSgpKSB7XG4gICAgICAgIGxhdGxuZ3MucHVzaChsYXllci5nZXRMYXRMbmcoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxhdGxuZ3M7XG4gIH0sXG4gIHJlc3RvcmUgKGxheWVyKSB7XG4gICAgdGhpcy5zZXRBbGwobGF5ZXIuX2xhdGxuZ3MpO1xuICAgIHRoaXMuc2V0QWxsSG9sZXMobGF5ZXIuX2hvbGVzKTtcbiAgfSxcbiAgX2FkZCAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICBpZiAodGhpcy5fbWFwLmlzTW9kZSgnZHJhdycpKSB7XG4gICAgICBpZiAoIXRoaXMuX2ZpcnN0TWFya2VyKSB7XG4gICAgICAgIG9wdGlvbnMuaWNvbiA9IGljb25zLmZpcnN0SWNvbjtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIHZhciBtYXJrZXIgPSB0aGlzLmFkZE1hcmtlcihsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKTtcblxuICAgIHRoaXMuZ2V0REVMaW5lKCkuYWRkTGF0TG5nKGxhdGxuZyk7XG5cbiAgICB0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVERUxpbmUoZS5sYXRsbmcpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBpZiAobWFya2VyLl9tR3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMikge1xuICAgICAgaWYgKG1hcmtlci5fbUdyb3VwLl9maXJzdE1hcmtlci5faGFzRmlyc3RJY29uKCkgJiYgbWFya2VyID09PSBtYXJrZXIuX21Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIF9jbG9zZXN0Tm90TWlkZGxlTWFya2VyIChsYXllcnMsIHBvc2l0aW9uLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gKGxheWVyc1twb3NpdGlvbl0uaXNNaWRkbGUoKSkgPyBsYXllcnNbcG9zaXRpb24gKyBkaXJlY3Rpb25dIDogbGF5ZXJzW3Bvc2l0aW9uXTtcbiAgfSxcbiAgX3NldFByZXZOZXh0IChtYXJrZXIsIHBvc2l0aW9uKSB7XG4gICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICB2YXIgbWF4TGVuZ3RoID0gbGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAxKSB7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgcG9zaXRpb24gLSAxLCAtMSk7XG4gICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgMiwgMSk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gbWF4TGVuZ3RoKSB7XG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLl9jbG9zZXN0Tm90TWlkZGxlTWFya2VyKGxheWVycywgbWF4TGVuZ3RoIC0gMSwgLTEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIDAsIDEpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXJrZXIuX21pZGRsZVByZXYgPT0gbnVsbCkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSBsYXllcnNbcG9zaXRpb24gLSAxXTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXJrZXIuX21pZGRsZU5leHQgPT0gbnVsbCkge1xuICAgICAgICBtYXJrZXIuX25leHQgPSBsYXllcnNbcG9zaXRpb24gKyAxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBzZXRNaWRkbGVNYXJrZXIgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5hZGRNYXJrZXIocG9zaXRpb24sIG51bGwsIHtpY29uOiBpY29ucy5taWRkbGVJY29ufSk7XG4gIH0sXG4gIHNldE1pZGRsZU1hcmtlcnMgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5zZXRNaWRkbGVNYXJrZXIocG9zaXRpb24pO1xuICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKHBvc2l0aW9uICsgMik7XG4gIH0sXG4gIHNldCAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIGlmICghdGhpcy5oYXNJbnRlcnNlY3Rpb24obGF0bG5nKSkge1xuICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZChsYXRsbmcsIHBvc2l0aW9uLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgdGhpcy5fbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH0sXG4gIHNldE1pZGRsZSAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIHBvc2l0aW9uID0gKHBvc2l0aW9uIDwgMCkgPyAwIDogcG9zaXRpb247XG5cbiAgICAvL3ZhciBmdW5jID0gKHRoaXMuX2lzSG9sZSkgPyAnc2V0JyA6ICdzZXRIb2xlTWFya2VyJztcbiAgICB2YXIgbWFya2VyID0gdGhpcy5zZXQobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG5cbiAgICBtYXJrZXIuX3NldE1pZGRsZUljb24oKTtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBzZXRBbGwgKGxhdGxuZ3MpIHtcbiAgICBsYXRsbmdzLmZvckVhY2goKGxhdGxuZywgcG9zaXRpb24pID0+IHtcbiAgICAgIHRoaXMuc2V0KGxhdGxuZywgcG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gIH0sXG4gIHNldEFsbEhvbGVzIChob2xlcykge1xuICAgIGhvbGVzLmZvckVhY2goKGhvbGUpID0+IHtcbiAgICAgIC8vdGhpcy5zZXQoaG9sZSk7XG4gICAgICB2YXIgbGFzdEhHcm91cCA9IHRoaXMuX21hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmFkZEhvbGVHcm91cCgpO1xuXG4gICAgICBob2xlLl9lYWNoKChsYXRsbmcsIHBvc2l0aW9uKSA9PiB7XG4gICAgICAgIGxhc3RIR3JvdXAuc2V0KGxhdGxuZywgcG9zaXRpb24pO1xuICAgICAgfSk7XG4gICAgICAvL3ZhciBsZW5ndGggPSBob2xlLmxlbmd0aDtcbiAgICAgIC8vdmFyIGkgPSAwO1xuICAgICAgLy9mb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyAgbGFzdEhHcm91cC5zZXQoaG9sZVtpXSwgaSk7XG4gICAgICAvL31cblxuICAgICAgbGFzdEhHcm91cC5nZXRGaXJzdCgpLmZpcmUoJ2NsaWNrJyk7XG4gICAgfSk7XG4gIH0sXG4gIHNldEhvbGVNYXJrZXIgKGxhdGxuZywgb3B0aW9ucyA9IHtpc0hvbGVNYXJrZXI6IHRydWUsIGhvbGVQb3NpdGlvbjoge319KSB7XG4gICAgdmFyIG1hcmtlciA9IG5ldyBFZGl0TWFya2VyKHRoaXMsIGxhdGxuZywgb3B0aW9ucyB8fCB7fSk7XG4gICAgbWFya2VyLmFkZFRvKHRoaXMpO1xuXG4gICAgLy90aGlzLnNldFNlbGVjdGVkKG1hcmtlcik7XG5cbiAgICBpZiAodGhpcy5fbWFwLmlzTW9kZSgnZHJhdycpICYmIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLl9zZXRGaXJzdChtYXJrZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIHJlbW92ZUhvbGUgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgLy9yZW1vdmUgZWRpdCBsaW5lXG4gICAgLy90aGlzLmdldEVMaW5lR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIC8vcmVtb3ZlIGVkaXQgbWFya2Vyc1xuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcblxuICAgIC8vcmVtb3ZlIGhvbGVcbiAgICBtYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlcygpLnNwbGljZSh0aGlzLl9wb3NpdGlvbiwgMSk7XG4gICAgbWFwLmdldEVQb2x5Z29uKCkucmVkcmF3KCk7XG5cbiAgICAvL3JlZHJhdyBob2xlc1xuICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZXMoKTtcblxuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXAuX3NldEVITWFya2VyR3JvdXAoaG9sZXNbaV0pO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlU2VsZWN0ZWQgKCkge1xuICAgIHZhciBzZWxlY3RlZEVNYXJrZXIgPSB0aGlzLmdldFNlbGVjdGVkKCk7XG4gICAgdmFyIG1hcmtlckxheWVyc0FycmF5ID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICB2YXIgbGF0bG5nID0gc2VsZWN0ZWRFTWFya2VyLmdldExhdExuZygpO1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFya2VyTGF5ZXJzQXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZW1vdmVMYXllcihzZWxlY3RlZEVNYXJrZXIpO1xuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCB7bGF0bG5nOiBsYXRsbmd9KTtcbiAgICB9XG5cbiAgICBtYXJrZXJMYXllcnNBcnJheSA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICBpZiAodGhpcy5faXNIb2xlKSB7XG4gICAgICBpZiAobWFwLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgLy8gbm8gbmVlZCB0byByZW1vdmUgbGFzdCBwb2ludFxuICAgICAgICBpZiAobWFya2VyTGF5ZXJzQXJyYXkubGVuZ3RoIDwgNCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlSG9sZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vc2VsZWN0ZWRFTWFya2VyID0gbWFwLmdldFNlbGVjdGVkTWFya2VyKCk7XG4gICAgICAgICAgdmFyIGhvbGVQb3NpdGlvbiA9IHNlbGVjdGVkRU1hcmtlci5vcHRpb25zLmhvbGVQb3NpdGlvbjtcblxuICAgICAgICAgIC8vcmVtb3ZlIGhvbGUgcG9pbnRcbiAgICAgICAgICAvL21hcC5nZXRFUG9seWdvbigpLmdldEhvbGUodGhpcy5fcG9zaXRpb24pLnNwbGljZShob2xlUG9zaXRpb24uaE1hcmtlciwgMSk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZSh0aGlzLl9wb3NpdGlvbikuc3BsaWNlKHNlbGVjdGVkRU1hcmtlci5fX3Bvc2l0aW9uLCAxKTtcbiAgICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5yZWRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfcG9zaXRpb24gPSAwO1xuICAgICAgICB0aGlzLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgICBsYXllci5vcHRpb25zLmhvbGVQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIGhHcm91cDogdGhpcy5fcG9zaXRpb24sXG4gICAgICAgICAgICBoTWFya2VyOiBfcG9zaXRpb24rK1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFwLmlzTW9kZSgnZWRpdCcpKSB7XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gcmVtb3ZlIGxhc3QgcG9pbnRcbiAgICAgICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAvL3JlbW92ZSBlZGl0IG1hcmtlcnNcbiAgICAgICAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBsYXllci5vcHRpb25zLnRpdGxlID0gcG9zaXRpb247XG4gICAgICBsYXllci5fX3Bvc2l0aW9uID0gcG9zaXRpb24rKztcbiAgICB9KTtcbiAgfSxcbiAgZ2V0UG9pbnRzRm9ySW50ZXJzZWN0aW9uIChwb2x5Z29uKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IFtdO1xuICAgIHZhciBsYXllcnMgPSAoKHBvbHlnb24pID8gcG9seWdvbi5nZXRMYXllcnMoKSA6IHRoaXMuZ2V0TGF5ZXJzKCkpLmZpbHRlcigobCkgPT4gIWwuaXNNaWRkbGUoKSk7XG5cbiAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IFtdO1xuICAgIGxheWVycy5fZWFjaCgobGF5ZXIpID0+IHtcbiAgICAgIHZhciBsYXRsbmcgPSBsYXllci5nZXRMYXRMbmcoKTtcbiAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnB1c2godGhpcy5fbWFwLmxhdExuZ1RvTGF5ZXJQb2ludChsYXRsbmcpKTtcbiAgICB9KTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT0gbGF5ZXJzWzBdKSB7IC8vIHBvaW50IGlzIGZpcnN0XG4gICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMuc2xpY2UoMSk7XG4gICAgICB9IGVsc2UgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT0gbGF5ZXJzW2xheWVycy5sZW5ndGggLSAxXSkgeyAvLyBwb2ludCBpcyBsYXN0XG4gICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnNwbGljZSgtMSk7XG4gICAgICB9IGVsc2UgeyAvLyBwb2ludCBpcyBub3QgZmlyc3QgLyBsYXN0XG4gICAgICAgIHZhciB0bXBBcnJQb2ludHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAobWFwLl9zZWxlY3RlZE1hcmtlciA9PT0gbGF5ZXJzW2ldKSB7XG4gICAgICAgICAgICB0bXBBcnJQb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoaSArIDEpO1xuICAgICAgICAgICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSB0bXBBcnJQb2ludHMuY29uY2F0KHRoaXMuX29yaWdpbmFsUG9pbnRzKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzLnNwbGljZSgtMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpbmFsUG9pbnRzO1xuICB9LFxuICBfYmluZExpbmVFdmVudHM6IHVuZGVmaW5lZCxcbiAgX2hhc0ludGVyc2VjdGlvbiAocG9pbnRzLCBuZXdQb2ludCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgICBsYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlKGxhc3RQb2ludCwgbmV3UG9pbnQsIG1heEluZGV4LCBpc0ZpbmlzaCk7XG4gIH0sXG5cbiAgX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlIChwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgLy9sYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZUhvbGVTZWdtZW50c0ludGVyc2VjdHNSYW5nZShsYXN0UG9pbnQsIG5ld1BvaW50KTtcbiAgfSxcblxuICBoYXNJbnRlcnNlY3Rpb24gKGxhdGxuZywgaXNGaW5pc2gpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBuZXdQb2ludCA9IG1hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpO1xuXG4gICAgdmFyIHJzbHQxID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB2YXIgcnNsdDIgPSBmYWxzZTtcblxuICAgIHZhciBmTWFya2VyID0gdGhpcy5nZXRGaXJzdCgpO1xuICAgIGlmIChmTWFya2VyICYmICFmTWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgLy8gY29kZSB3YXMgZHVibGljYXRlZCB0byBjaGVjayBpbnRlcnNlY3Rpb24gZnJvbSBib3RoIHNpZGVzXG4gICAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgICBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpLnJldmVyc2UoKTtcbiAgICAgIHJzbHQyID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB9XG5cbiAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChyc2x0MSB8fCByc2x0Mik7XG4gICAgdmFyIGVkZ2VzSW50ZXJzZWN0ZWQgPSBtYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBoYXNJbnRlcnNlY3Rpb25XaXRoSG9sZSAobEFycmF5LCBob2xlKSB7XG5cbiAgICBpZiAodGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVswXSk7XG4gICAgdmFyIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzFdKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbihob2xlKTtcblxuICAgIHZhciByc2x0MSA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlKHBvaW50cywgbmV3UG9pbnQsIGxhc3RQb2ludCk7XG5cbiAgICAvLyBjb2RlIHdhcyBkdWJsaWNhdGVkIHRvIGNoZWNrIGludGVyc2VjdGlvbiBmcm9tIGJvdGggc2lkZXNcbiAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oaG9sZSkucmV2ZXJzZSgpO1xuICAgIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzJdKTtcbiAgICB2YXIgcnNsdDIgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpO1xuXG4gICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdDEgfHwgcnNsdDIpO1xuICAgIHZhciBlZGdlc0ludGVyc2VjdGVkID0gdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcblxuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBfdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uIChleHRyYVBvaW50cykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cyxcbiAgICAgIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwO1xuICAgIC8vIEluY3JlbWVudCBsZW5ndGggYnkgZXh0cmFQb2ludHMgaWYgcHJlc2VudFxuICAgIGxlbiArPSBleHRyYVBvaW50cyB8fCAwO1xuXG4gICAgcmV0dXJuICF0aGlzLl9vcmlnaW5hbFBvaW50cyB8fCBsZW4gPD0gMztcbiAgfSxcbiAgX2xpbmVIb2xlU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLCBwMiwgcDM7XG5cbiAgICBmb3IgKHZhciBqID0gcG9pbnRzLmxlbmd0aCAtIDE7IGogPiAwOyBqLS0pIHtcbiAgICAgIHAyID0gcG9pbnRzW2ogLSAxXTtcbiAgICAgIHAzID0gcG9pbnRzW2pdO1xuXG4gICAgICBpZiAoTC5MaW5lVXRpbC5zZWdtZW50c0ludGVyc2VjdChwLCBwMSwgcDIsIHAzKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9saW5lU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxLCBtYXhJbmRleCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXG4gICAgICBwMiwgcDM7XG5cbiAgICB2YXIgbWluID0gaXNGaW5pc2ggPyAxIDogMDtcbiAgICAvLyBDaGVjayBhbGwgcHJldmlvdXMgbGluZSBzZWdtZW50cyAoYmVzaWRlIHRoZSBpbW1lZGlhdGVseSBwcmV2aW91cykgZm9yIGludGVyc2VjdGlvbnNcbiAgICBmb3IgKHZhciBqID0gbWF4SW5kZXg7IGogPiBtaW47IGotLSkge1xuICAgICAgcDIgPSBwb2ludHNbaiAtIDFdO1xuICAgICAgcDMgPSBwb2ludHNbal07XG5cbiAgICAgIGlmIChMLkxpbmVVdGlsLnNlZ21lbnRzSW50ZXJzZWN0KHAsIHAxLCBwMiwgcDMpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2lzTWFya2VySW5Qb2x5Z29uIChtYXJrZXIpIHtcbiAgICB2YXIgaiA9IDA7XG5cbiAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICB2YXIgc2lkZXMgPSBsYXllcnMubGVuZ3RoO1xuXG4gICAgdmFyIHggPSBtYXJrZXIubG5nO1xuICAgIHZhciB5ID0gbWFya2VyLmxhdDtcblxuICAgIHZhciBpblBvbHkgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lkZXM7IGkrKykge1xuICAgICAgaisrO1xuICAgICAgaWYgKGogPT0gc2lkZXMpIHtcbiAgICAgICAgaiA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgcG9pbnQxID0gbGF5ZXJzW2ldLmdldExhdExuZygpO1xuICAgICAgdmFyIHBvaW50MiA9IGxheWVyc1tqXS5nZXRMYXRMbmcoKTtcbiAgICAgIGlmICgoKHBvaW50MS5sYXQgPCB5KSAmJiAocG9pbnQyLmxhdCA+PSB5KSkgfHwgKChwb2ludDIubGF0IDwgeSkgJiYgKHBvaW50MS5sYXQgPj0geSkpKSB7XG4gICAgICAgIGlmIChwb2ludDEubG5nICsgKHkgLSBwb2ludDEubGF0KSAvIChwb2ludDIubGF0IC0gcG9pbnQxLmxhdCkgKiAocG9pbnQyLmxuZyAtIHBvaW50MS5sbmcpIDwgeCkge1xuICAgICAgICAgIGluUG9seSA9ICFpblBvbHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpblBvbHk7XG4gIH1cbn0pOyIsImltcG9ydCBUb29sdGlwIGZyb20gJy4uL2V4dGVuZGVkL1Rvb2x0aXAnO1xuaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuXG52YXIgc2l6ZSA9IDE7XG52YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5pZiAodXNlckFnZW50LmluZGV4T2YoXCJpcGFkXCIpICE9PSAtMSB8fCB1c2VyQWdlbnQuaW5kZXhPZihcImlwaG9uZVwiKSAhPT0gLTEpIHtcbiAgc2l6ZSA9IDI7XG59XG5cbnZhciB0b29sdGlwO1xudmFyIGRyYWdlbmQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgTC5NYXJrZXIuZXh0ZW5kKHtcbiAgX2RyYWdnYWJsZTogdW5kZWZpbmVkLCAvLyBhbiBpbnN0YW5jZSBvZiBMLkRyYWdnYWJsZVxuICBfb2xkTGF0TG5nU3RhdGU6IHVuZGVmaW5lZCxcbiAgaW5pdGlhbGl6ZSAoZ3JvdXAsIGxhdGxuZywgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICBvcHRpb25zID0gJC5leHRlbmQoe1xuICAgICAgaWNvbjogaWNvbixcbiAgICAgIGRyYWdnYWJsZTogZmFsc2VcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIEwuTWFya2VyLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5nLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX21Hcm91cCA9IGdyb3VwO1xuXG4gICAgdGhpcy5faXNGaXJzdCA9IGdyb3VwLmdldExheWVycygpLmxlbmd0aCA9PT0gMDtcbiAgfSxcbiAgcmVtb3ZlR3JvdXAgKCkge1xuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZUhvbGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZSgpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlU2VsZWN0ZWQoKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUhvbGUgKCkgeyAvLyBkZXByZWNhdGVkXG4gICAgdGhpcy5yZW1vdmVHcm91cCgpO1xuICB9LFxuICBuZXh0ICgpIHtcbiAgICB2YXIgbmV4dCA9IHRoaXMuX25leHQuX25leHQ7XG4gICAgaWYgKCF0aGlzLl9uZXh0LmlzTWlkZGxlKCkpIHtcbiAgICAgIG5leHQgPSB0aGlzLl9uZXh0O1xuICAgIH1cbiAgICByZXR1cm4gbmV4dDtcbiAgfSxcbiAgcHJldiAoKSB7XG4gICAgdmFyIHByZXYgPSB0aGlzLl9wcmV2Ll9wcmV2O1xuICAgIGlmICghdGhpcy5fcHJldi5pc01pZGRsZSgpKSB7XG4gICAgICBwcmV2ID0gdGhpcy5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sXG4gIGNoYW5nZVByZXZOZXh0UG9zICgpIHtcbiAgICBpZiAodGhpcy5fcHJldi5pc01pZGRsZSgpKSB7XG5cbiAgICAgIHZhciBwcmV2TGF0TG5nID0gdGhpcy5fbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcy5wcmV2KCksIHRoaXMpO1xuICAgICAgdmFyIG5leHRMYXRMbmcgPSB0aGlzLl9tR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLCB0aGlzLm5leHQoKSk7XG5cbiAgICAgIHRoaXMuX3ByZXYuc2V0TGF0TG5nKHByZXZMYXRMbmcpO1xuICAgICAgdGhpcy5fbmV4dC5zZXRMYXRMbmcobmV4dExhdExuZyk7XG4gICAgfVxuICB9LFxuICAvKipcbiAgICogY2hhbmdlIGV2ZW50cyBmb3IgbWFya2VyIChleGFtcGxlOiBob2xlKVxuICAgKi9cbiAgICByZXNldEV2ZW50cyAoY2FsbGJhY2spIHtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuICBfcG9zSGFzaCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXYucG9zaXRpb24gKyAnXycgKyB0aGlzLnBvc2l0aW9uICsgJ18nICsgdGhpcy5fbmV4dC5wb3NpdGlvbjtcbiAgfSxcbiAgX3Jlc2V0SWNvbiAoX2ljb24pIHtcbiAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGljID0gX2ljb24gfHwgaWNvbjtcblxuICAgIHRoaXMuc2V0SWNvbihpYyk7XG4gICAgdGhpcy5wcmV2KCkuc2V0SWNvbihpYyk7XG4gICAgdGhpcy5uZXh0KCkuc2V0SWNvbihpYyk7XG4gIH0sXG4gIF9zZXRIb3Zlckljb24gKF9oSWNvbikge1xuICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldEljb24oX2hJY29uIHx8IGhvdmVySWNvbik7XG4gIH0sXG4gIF9hZGRJY29uQ2xhc3MgKGNsYXNzTmFtZSkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9pY29uLCBjbGFzc05hbWUpO1xuICB9LFxuICBfcmVtb3ZlSWNvbkNsYXNzIChjbGFzc05hbWUpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5faWNvbiwgY2xhc3NOYW1lKTtcbiAgfSxcbiAgX3NldEludGVyc2VjdGlvbkljb24gKCkge1xuICAgIHZhciBpY29uQ2xhc3MgPSBpbnRlcnNlY3Rpb25JY29uLm9wdGlvbnMuY2xhc3NOYW1lO1xuICAgIHZhciBjbGFzc05hbWUgPSAnbS1lZGl0b3ItZGl2LWljb24nO1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuXG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkID0gdGhpcy5wcmV2KCk7XG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuXG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkID0gdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuICB9LFxuICBfc2V0Rmlyc3RJY29uICgpIHtcbiAgICB0aGlzLl9pc0ZpcnN0ID0gdHJ1ZTtcbiAgICB0aGlzLnNldEljb24oZmlyc3RJY29uKTtcbiAgfSxcbiAgX2hhc0ZpcnN0SWNvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ljb24gJiYgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1kaXYtaWNvbi1maXJzdCcpO1xuICB9LFxuICBfc2V0TWlkZGxlSWNvbiAoKSB7XG4gICAgdGhpcy5zZXRJY29uKG1pZGRsZUljb24pO1xuICB9LFxuICBpc01pZGRsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ljb24gJiYgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1taWRkbGUtZGl2LWljb24nKVxuICAgICAgJiYgIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbGVhZmxldC1kcmFnLXRhcmdldCcpO1xuICB9LFxuICBfc2V0RHJhZ0ljb24gKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnbS1lZGl0b3ItZGl2LWljb24nKTtcbiAgICB0aGlzLnNldEljb24oZHJhZ0ljb24pO1xuICB9LFxuICBpc1BsYWluICgpIHtcbiAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1kaXYtaWNvbicpIHx8IEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gIH0sXG4gIF9vbmNlQ2xpY2sgKCkge1xuICAgIGlmICh0aGlzLl9pc0ZpcnN0KSB7XG4gICAgICB0aGlzLm9uY2UoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICB2YXIgbUdyb3VwID0gdGhpcy5fbUdyb3VwO1xuXG4gICAgICAgIGlmIChtR3JvdXAuX21hcmtlcnMubGVuZ3RoIDwgMykge1xuICAgICAgICAgIHRoaXMuX29uY2VDbGljaygpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsYXRsbmcgPSBlLnRhcmdldC5fbGF0bG5nO1xuICAgICAgICB2YXIgaGFzSW50ZXJzZWN0aW9uID0gbUdyb3VwLmhhc0ludGVyc2VjdGlvbihsYXRsbmcpO1xuXG4gICAgICAgIGlmIChoYXNJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICBtYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICAgIHRoaXMuX29uY2VDbGljaygpOyAvLyBiaW5kICdvbmNlJyBhZ2FpbiB1bnRpbCBoYXMgaW50ZXJzZWN0aW9uXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5faXNGaXJzdCA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuc2V0SWNvbihpY29uKTtcbiAgICAgICAgICAvL21Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmpvaW5fcGF0aCcsIHttR3JvdXA6IG1Hcm91cH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIF9iaW5kQ29tbW9uRXZlbnRzICgpIHtcbiAgICB0aGlzLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG5cbiAgICAgIGlmIChtR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSAmJiB0aGlzICE9PSBtR3JvdXAuZ2V0Rmlyc3QoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkgJiYgdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbih0aGlzLmdldExhdExuZygpLCB0cnVlKSkge1xuICAgICAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChmYWxzZSk7XG4gICAgICAgIG1hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbUdyb3VwLnNldFNlbGVjdGVkKHRoaXMpO1xuICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuXG4gICAgICBpZiAobUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWRJbkdyb3VwKCkpIHtcbiAgICAgICAgbUdyb3VwLnNlbGVjdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzTWlkZGxlKCkpIHtcbiAgICAgICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5jbGlja1RvQWRkTmV3RWRnZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkgeyAvL2FkZCBlZGdlXG4gICAgICAgIG1Hcm91cC5zZXRNaWRkbGVNYXJrZXJzKHRoaXMucG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9yZXNldEljb24oaWNvbik7XG4gICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcbiAgICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMpO1xuICAgICAgfSBlbHNlIHsgLy9yZW1vdmUgZWRnZVxuICAgICAgICBpZiAoIW1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZHJhZ2VuZCkge1xuICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcblxuICAgICAgICAgIHZhciByc2x0SW50ZXJzZWN0aW9uID0gdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKHt0YXJnZXQ6IHtfbGF0bG5nOiBtR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLnByZXYoKSwgdGhpcy5uZXh0KCkpfX0pO1xuXG4gICAgICAgICAgaWYgKHJzbHRJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgICAgICAgICAgbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IobWFwLm9wdGlvbnMudGV4dC5kZWxldGVQb2ludEludGVyc2VjdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aWV3RXJyb3JMaW5lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9sZExhdExuZyA9IHRoaXMuZ2V0TGF0TG5nKCk7XG5cbiAgICAgICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgIG1Hcm91cC5yZW1vdmVNYXJrZXIodGhpcyk7XG5cbiAgICAgICAgICBpZiAoIW1Hcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXdMYXRMbmcgPSBuZXh0TWFya2VyLl9wcmV2LmdldExhdExuZygpO1xuXG4gICAgICAgICAgICBpZiAobmV3TGF0TG5nLmxhdCA9PT0gb2xkTGF0TG5nLmxhdCAmJiBuZXdMYXRMbmcubG5nID09PSBvbGRMYXRMbmcubG5nKSB7XG4gICAgICAgICAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9BZGROZXdFZGdlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1Hcm91cC5zZXRTZWxlY3RlZChuZXh0TWFya2VyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9tR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuX21Hcm91cC5nZXRMYXllcnMoKS5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMgPT09IHRoaXMuX21Hcm91cC5fbGFzdE1hcmtlcikge1xuICAgICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWRJbkdyb3VwKCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21pZGRsZV9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLm9uKCdtb3VzZW91dCcsICgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vbmNlQ2xpY2soKTtcblxuICAgIHRoaXMub24oJ2RibGNsaWNrJywgKCkgPT4ge1xuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcbiAgICAgIGlmIChtR3JvdXAgJiYgbUdyb3VwLmdldEZpcnN0KCkgJiYgbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzID09PSBtR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICBtR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnJywgKGUpID0+IHtcbiAgICAgIHZhciBtYXJrZXIgPSBlLnRhcmdldDtcblxuICAgICAgbWFya2VyLmNoYW5nZVByZXZOZXh0UG9zKCk7XG5cbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG5cbiAgICAgIHRoaXMuX3NldERyYWdJY29uKCk7XG5cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZHJhZ19tYXJrZXInLCB7bWFya2VyOiB0aGlzfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnZW5kJywgKCkgPT4ge1xuXG4gICAgICB0aGlzLl9tR3JvdXAuc2VsZWN0KCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmRyYWdlbmRfbWFya2VyJywge21hcmtlcjogdGhpc30pO1xuXG4gICAgICBkcmFnZW5kID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBkcmFnZW5kID0gZmFsc2U7XG4gICAgICB9LCAyMDApO1xuXG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICB9KTtcbiAgfSxcbiAgX2lzSW5zaWRlSG9sZSAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB2YXIgaG9sZXMgPSBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaG9sZSA9IGhvbGVzW2ldO1xuICAgICAgaWYgKHRoaXMuX21Hcm91cCAhPT0gaG9sZSkge1xuICAgICAgICBpZiAoaG9sZS5faXNNYXJrZXJJblBvbHlnb24odGhpcy5nZXRMYXRMbmcoKSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9pc091dHNpZGVPZlBvbHlnb24gKHBvbHlnb24pIHtcbiAgICByZXR1cm4gIXBvbHlnb24uX2lzTWFya2VySW5Qb2x5Z29uKHRoaXMuZ2V0TGF0TG5nKCkpO1xuICB9LFxuICBfZGV0ZWN0SW50ZXJzZWN0aW9uIChlKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBsYXRsbmcgPSAoZSA9PT0gdW5kZWZpbmVkKSA/IHRoaXMuZ2V0TGF0TG5nKCkgOiBlLnRhcmdldC5fbGF0bG5nO1xuICAgIHZhciBpc091dHNpZGVPZlBvbHlnb24gPSBmYWxzZTtcbiAgICB2YXIgaXNJbnNpZGVPZkhvbGUgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5fbUdyb3VwLl9pc0hvbGUpIHtcbiAgICAgIGlzT3V0c2lkZU9mUG9seWdvbiA9IHRoaXMuX2lzT3V0c2lkZU9mUG9seWdvbihtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIGlzSW5zaWRlT2ZIb2xlID0gdGhpcy5faXNJbnNpZGVIb2xlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzSW5zaWRlT2ZIb2xlID0gdGhpcy5faXNJbnNpZGVIb2xlKCk7XG4gICAgfVxuXG4gICAgdmFyIHJzbHQgPSBpc0luc2lkZU9mSG9sZSB8fCBpc091dHNpZGVPZlBvbHlnb24gfHwgdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbihsYXRsbmcpIHx8IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbldpdGhIb2xlcyhlKTtcblxuICAgIG1hcC5lZGdlc0ludGVyc2VjdGVkKHJzbHQpO1xuICAgIGlmIChyc2x0KSB7XG4gICAgICB0aGlzLl9tYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuICB9LFxuICBfZGV0ZWN0SW50ZXJzZWN0aW9uV2l0aEhvbGVzIChlKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcCwgaGFzSW50ZXJzZWN0aW9uID0gZmFsc2UsIGhvbGUsIGxhdGxuZyA9IChlID09PSB1bmRlZmluZWQpID8gdGhpcy5nZXRMYXRMbmcoKSA6IGUudGFyZ2V0Ll9sYXRsbmc7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgIHZhciBwcmV2UG9pbnQgPSB0aGlzLnByZXYoKTtcbiAgICB2YXIgbmV4dFBvaW50ID0gdGhpcy5uZXh0KCk7XG5cbiAgICBpZiAocHJldlBvaW50ID09IG51bGwgJiYgbmV4dFBvaW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2Vjb25kUG9pbnQgPSBwcmV2UG9pbnQuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIGxhc3RQb2ludCA9IG5leHRQb2ludC5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbGF5ZXJzLCB0bXBBcnJheSA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhvbGUgPSBob2xlc1tpXTtcbiAgICAgICAgaWYgKGhvbGUgIT09IHRoaXMuX21Hcm91cCkge1xuICAgICAgICAgIGhhc0ludGVyc2VjdGlvbiA9IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgaG9sZSk7XG4gICAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY2hlY2sgdGhhdCBob2xlIGlzIGluc2lkZSBvZiBvdGhlciBob2xlXG4gICAgICAgICAgdG1wQXJyYXkgPSBbXTtcbiAgICAgICAgICBsYXllcnMgPSBob2xlLmdldExheWVycygpO1xuXG4gICAgICAgICAgbGF5ZXJzLl9lYWNoKChsYXllcikgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX21Hcm91cC5faXNNYXJrZXJJblBvbHlnb24obGF5ZXIuZ2V0TGF0TG5nKCkpKSB7XG4gICAgICAgICAgICAgIHRtcEFycmF5LnB1c2goXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodG1wQXJyYXkubGVuZ3RoID09PSBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUoW2xhdGxuZywgc2Vjb25kUG9pbnQsIGxhc3RQb2ludF0sIGVNYXJrZXJzR3JvdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhhc0ludGVyc2VjdGlvbiA9IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShbbGF0bG5nLCBzZWNvbmRQb2ludCwgbGFzdFBvaW50XSwgaG9sZXNbaV0pO1xuXG4gICAgICAgIC8vIGNoZWNrIHRoYXQgaG9sZSBpcyBvdXRzaWRlIG9mIHBvbHlnb25cbiAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICB0bXBBcnJheSA9IFtdO1xuICAgICAgICBsYXllcnMgPSBob2xlc1tpXS5nZXRMYXllcnMoKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAobGF5ZXJzW2pdLl9pc091dHNpZGVPZlBvbHlnb24oZU1hcmtlcnNHcm91cCkpIHtcbiAgICAgICAgICAgIHRtcEFycmF5LnB1c2goXCJcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0bXBBcnJheS5sZW5ndGggPT09IGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5NYXJrZXIucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcblxuICAgIHRoaXMub24oJ2RyYWdzdGFydCcsIChlKSA9PiB7XG4gICAgICB0aGlzLl9tR3JvdXAuc2V0U2VsZWN0ZWQodGhpcyk7XG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IGUudGFyZ2V0Ll9sYXRsbmc7XG5cbiAgICAgIGlmICh0aGlzLl9wcmV2LmlzUGxhaW4oKSkge1xuICAgICAgICB0aGlzLl9tR3JvdXAuc2V0TWlkZGxlTWFya2Vycyh0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgLy90aGlzLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgICB9XG5cbiAgICB9KS5vbignZHJhZycsIChlKSA9PiB7XG4gICAgICB0aGlzLl9vbkRyYWcoZSk7XG4gICAgfSkub24oJ2RyYWdlbmQnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fb25EcmFnRW5kKGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignbW91c2Vkb3duJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nLl9lbmFibGVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2JpbmRDb21tb25FdmVudHMobWFwKTtcbiAgfSxcbiAgX29uRHJhZyAoZSkge1xuICAgIHRoaXMuX2RldGVjdEludGVyc2VjdGlvbihlKTtcbiAgfSxcbiAgX29uRHJhZ0VuZCAoZSkge1xuICAgIHZhciByc2x0ID0gdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKGUpO1xuICAgIGlmIChyc2x0ICYmICF0aGlzLl9tYXAub3B0aW9ucy5hbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHRoaXMuX3Jlc3RvcmVPbGRQb3NpdGlvbigpO1xuICAgIH1cbiAgfSxcbiAgLy90b2RvOiBjb250aW51ZSB3aXRoIG9wdGlvbiAnYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uJ1xuICBfcmVzdG9yZU9sZFBvc2l0aW9uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuZWRnZXNJbnRlcnNlY3RlZCgpKSB7XG4gICAgICBsZXQgc3RhdGVMYXRMbmcgPSB0aGlzLl9vbGRMYXRMbmdTdGF0ZTtcbiAgICAgIHRoaXMuc2V0TGF0TG5nKEwubGF0TG5nKHN0YXRlTGF0TG5nLmxhdCwgc3RhdGVMYXRMbmcubG5nKSk7XG5cbiAgICAgIHRoaXMuY2hhbmdlUHJldk5leHRQb3MoKTtcbiAgICAgIG1hcC5fY29udmVydFRvRWRpdChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpKTtcbiAgICAgIC8vXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRyYWdfbWFya2VyJywge21hcmtlcjogdGhpc30pO1xuXG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vbGRMYXRMbmdTdGF0ZSA9IHRoaXMuZ2V0TGF0TG5nKCk7XG4gICAgfVxuICB9LFxuICBfYW5pbWF0ZVpvb20gKG9wdCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHZhciBwb3MgPSB0aGlzLl9tYXAuX2xhdExuZ1RvTmV3TGF5ZXJQb2ludCh0aGlzLl9sYXRsbmcsIG9wdC56b29tLCBvcHQuY2VudGVyKS5yb3VuZCgpO1xuXG4gICAgICB0aGlzLl9zZXRQb3MocG9zKTtcbiAgICB9XG4gIH0sXG4gIHJlc2V0SWNvbiAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgICB0aGlzLl9yZW1vdmVJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uLWRyYWcnKTtcbiAgfSxcbiAgdW5TZWxlY3RJY29uSW5Hcm91cCAoKSB7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBfc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICghdGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9hZGRJY29uQ2xhc3MoJ20tZWRpdG9yLWRpdi1pY29uJyk7XG4gICAgfVxuICAgIHRoaXMuX2FkZEljb25DbGFzcygnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgc2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIGlmICh0aGlzLl9wcmV2KSB7XG4gICAgICB0aGlzLl9wcmV2Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgICB0aGlzLl9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIGlmICh0aGlzLl9uZXh0KSB7XG4gICAgICB0aGlzLl9uZXh0Ll9zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cbiAgfSxcbiAgaXNTZWxlY3RlZEluR3JvdXAgKCkge1xuICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3ModGhpcy5faWNvbiwgJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIEwuTWFya2VyLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gIH0sXG4gIF9lcnJvckxpbmVzOiBbXSxcbiAgX3ByZXZFcnJvckxpbmU6IG51bGwsXG4gIF9uZXh0RXJyb3JMaW5lOiBudWxsLFxuICBfZHJhd0Vycm9yTGluZXMgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG5cbiAgICB2YXIgY3VyclBvaW50ID0gdGhpcy5nZXRMYXRMbmcoKTtcbiAgICB2YXIgcHJldlBvaW50cyA9IFt0aGlzLnByZXYoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcbiAgICB2YXIgbmV4dFBvaW50cyA9IFt0aGlzLm5leHQoKS5nZXRMYXRMbmcoKSwgY3VyclBvaW50XTtcblxuICAgIHZhciBlcnJvckxpbmVTdHlsZSA9IHRoaXMuX21hcC5vcHRpb25zLmVycm9yTGluZVN0eWxlO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZSA9IG5ldyBMLlBvbHlsaW5lKHByZXZQb2ludHMsIGVycm9yTGluZVN0eWxlKTtcbiAgICB0aGlzLl9uZXh0RXJyb3JMaW5lID0gbmV3IEwuUG9seWxpbmUobmV4dFBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuXG4gICAgdGhpcy5fcHJldkVycm9yTGluZS5hZGRUbyhtYXApO1xuICAgIHRoaXMuX25leHRFcnJvckxpbmUuYWRkVG8obWFwKTtcblxuICAgIHRoaXMuX2Vycm9yTGluZXMucHVzaCh0aGlzLl9wcmV2RXJyb3JMaW5lKTtcbiAgICB0aGlzLl9lcnJvckxpbmVzLnB1c2godGhpcy5fbmV4dEVycm9yTGluZSk7XG4gIH0sXG4gIF9jbGVhckVycm9yTGluZXMgKCkge1xuICAgIHRoaXMuX2Vycm9yTGluZXMuX2VhY2goKGxpbmUpID0+IHRoaXMuX21hcC5yZW1vdmVMYXllcihsaW5lKSk7XG4gIH0sXG4gIHNldEludGVyc2VjdGVkU3R5bGUgKCkge1xuICAgIHRoaXMuX3NldEludGVyc2VjdGlvbkljb24oKTtcblxuICAgIC8vc2hvdyBpbnRlcnNlY3RlZCBsaW5lc1xuICAgIHRoaXMuX2RyYXdFcnJvckxpbmVzKCk7XG4gIH0sXG4gIHJlc2V0U3R5bGUgKCkge1xuICAgIHRoaXMucmVzZXRJY29uKCk7XG4gICAgdGhpcy5zZWxlY3RJY29uSW5Hcm91cCgpO1xuXG4gICAgaWYgKHRoaXMuX3ByZXZJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fcHJldkludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX25leHRJbnRlcnNlY3RlZCkge1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnJlc2V0SWNvbigpO1xuICAgICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkID0gbnVsbDtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQgPSBudWxsO1xuXG4gICAgLy9oaWRlIGludGVyc2VjdGVkIGxpbmVzXG4gICAgdGhpcy5fY2xlYXJFcnJvckxpbmVzKCk7XG4gIH0sXG4gIF9wcmV2aWV3RXJMaW5lOiBudWxsLFxuICBfcHQ6IG51bGwsXG4gIF9wcmV2aWV3RXJyb3JMaW5lICgpIHtcbiAgICBpZiAodGhpcy5fcHJldmlld0VyTGluZSkge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wdCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3B0KTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnRzID0gW3RoaXMubmV4dCgpLmdldExhdExuZygpLCB0aGlzLnByZXYoKS5nZXRMYXRMbmcoKV07XG5cbiAgICB2YXIgZXJyb3JMaW5lU3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5wcmV2aWV3RXJyb3JMaW5lU3R5bGU7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lID0gbmV3IEwuUG9seWxpbmUocG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG5cbiAgICB0aGlzLl9wcmV2aWV3RXJMaW5lLmFkZFRvKHRoaXMuX21hcCk7XG5cbiAgICB0aGlzLl9wdCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKHRoaXMuX3ByZXZpZXdFckxpbmUpO1xuICAgIH0sIDkwMCk7XG4gIH1cbn0pOyIsImltcG9ydCBFeHRlbmRlZFBvbHlnb24gZnJvbSAnLi4vZXh0ZW5kZWQvUG9seWdvbic7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi9leHRlbmRlZC9Ub29sdGlwJztcblxuZXhwb3J0IGRlZmF1bHQgTC5FZGl0UGxveWdvbiA9IEV4dGVuZGVkUG9seWdvbi5leHRlbmQoe1xuICBfb2xkRTogdW5kZWZpbmVkLCAvLyB0byByZXVzZSBldmVudCBvYmplY3QgYWZ0ZXIgXCJiYWQgaG9sZVwiIHJlbW92aW5nIHRvIGJ1aWxkIG5ldyBob2xlXG4gIF9rOiAxLCAvLyB0byBkZWNyZWFzZSAnZGlmZicgdmFsdWUgd2hpY2ggaGVscHMgYnVpbGQgYSBob2xlXG4gIF9ob2xlczogW10sXG4gIGluaXRpYWxpemUgKGxhdGxuZ3MsIG9wdGlvbnMpIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5ncywgb3B0aW9ucyk7XG4gICAgdGhpcy5faW5pdFdpdGhIb2xlcyhsYXRsbmdzKTtcblxuICAgIHRoaXMub3B0aW9ucy5jbGFzc05hbWUgPSBcImxlYWZsZXQtY2xpY2thYmxlIHBvbHlnb25cIjtcbiAgfSxcbiAgX3VwZGF0ZSAoZSkge1xuICAgIHZhciBtYXJrZXIgPSBlLm1hcmtlcjtcblxuICAgIGlmIChtYXJrZXIuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICB2YXIgbWFya2VycyA9IG1hcmtlci5fbUdyb3VwLl9tYXJrZXJzO1xuICAgICAgbWFya2VycyA9IG1hcmtlcnMuZmlsdGVyKChtYXJrZXIpID0+ICFtYXJrZXIuaXNNaWRkbGUoKSk7XG4gICAgICB0aGlzLl9ob2xlc1ttYXJrZXIuX21Hcm91cC5wb3NpdGlvbl0gPSBtYXJrZXJzLm1hcCgobWFya2VyKSA9PiBtYXJrZXIuZ2V0TGF0TG5nKCkpO1xuXG4gICAgfVxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIF9yZW1vdmVIb2xlIChlKSB7XG4gICAgdmFyIGhvbGVQb3NpdGlvbiA9IGUubWFya2VyLl9tR3JvdXAucG9zaXRpb247XG4gICAgdGhpcy5faG9sZXMuc3BsaWNlKGhvbGVQb3NpdGlvbiwgMSk7XG5cbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZW1vdmVMYXllcihlLm1hcmtlci5fbUdyb3VwLl9sZWFmbGV0X2lkKTtcbiAgICB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXBvcyhlLm1hcmtlci5fbUdyb3VwLnBvc2l0aW9uKTtcblxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLlBvbHlsaW5lLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6YWRkX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmFkZF9tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZHJhZ19tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkcmFnX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicsIChlKSA9PiB0aGlzLl91cGRhdGUoZSkpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjpkZWxldGVfaG9sZScpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9ob2xlJywgKGUpID0+IHRoaXMuX3JlbW92ZUhvbGUoZSkpO1xuXG4gICAgdGhpcy5vbignbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgaWYgKG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgfSk7XG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiBtYXAuZmlyZSgnZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW92ZXInKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgbWFwLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuXG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBhZGRIb2xlIChob2xlKSB7XG4gICAgdGhpcy5faG9sZXMgPSB0aGlzLl9ob2xlcyB8fCBbXTtcbiAgICB0aGlzLl9ob2xlcy5wdXNoKGhvbGUpO1xuXG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgX3Jlc2V0TGFzdEhvbGUgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBtYXAuZ2V0U2VsZWN0ZWRNYXJrZXIoKS5yZW1vdmVIb2xlKCk7XG5cbiAgICBpZiAodGhpcy5fayA+IDAuMDAxKSB7XG4gICAgICB0aGlzLl9hZGRIb2xlKHRoaXMuX29sZEUsIDAuNSk7XG4gICAgfVxuICB9LFxuICBjaGVja0hvbGVJbnRlcnNlY3Rpb24gKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24gfHwgbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZUhNYXJrZXJzR3JvdXBMYXllcnMgPSB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKTtcbiAgICB2YXIgbGFzdEhvbGUgPSBlSE1hcmtlcnNHcm91cExheWVyc1tlSE1hcmtlcnNHcm91cExheWVycy5sZW5ndGggLSAxXTtcbiAgICB2YXIgbGFzdEhvbGVMYXllcnMgPSBlSE1hcmtlcnNHcm91cExheWVyc1tlSE1hcmtlcnNHcm91cExheWVycy5sZW5ndGggLSAxXS5nZXRMYXllcnMoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdEhvbGVMYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsYXllciA9IGxhc3RIb2xlTGF5ZXJzW2ldO1xuXG4gICAgICBpZiAobGF5ZXIuX2RldGVjdEludGVyc2VjdGlvbldpdGhIb2xlcygpKSB7XG4gICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXllci5faXNPdXRzaWRlT2ZQb2x5Z29uKHRoaXMuX21hcC5nZXRFTWFya2Vyc0dyb3VwKCkpKSB7XG4gICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGVIb2xlTWFya2VyR3JvdXBMYXllciA9IGVITWFya2Vyc0dyb3VwTGF5ZXJzW2pdO1xuXG4gICAgICAgIGlmIChsYXN0SG9sZSAhPT0gZUhvbGVNYXJrZXJHcm91cExheWVyICYmIGVIb2xlTWFya2VyR3JvdXBMYXllci5faXNNYXJrZXJJblBvbHlnb24obGF5ZXIuZ2V0TGF0TG5nKCkpKSB7XG4gICAgICAgICAgdGhpcy5fcmVzZXRMYXN0SG9sZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KTsiLCJpbXBvcnQgTWFya2VyIGZyb20gJy4uL2VkaXQvbWFya2VyJztcbmltcG9ydCBzb3J0IGZyb20gJy4uL3V0aWxzL3NvcnRCeVBvc2l0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgTC5DbGFzcy5leHRlbmQoe1xuICBpbmNsdWRlczogTC5NaXhpbi5FdmVudHMsXG5cbiAgX3NlbGVjdGVkOiBmYWxzZSxcbiAgX2xhc3RNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX2ZpcnN0TWFya2VyOiB1bmRlZmluZWQsXG4gIF9wb3NpdGlvbkhhc2g6IHVuZGVmaW5lZCxcbiAgX2xhc3RQb3NpdGlvbjogMCxcbiAgX21hcmtlcnM6IFtdLFxuICBvbkFkZCAobWFwKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcbiAgICAvL0wuTGF5ZXJHcm91cC5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgLy9MLkxheWVyR3JvdXAucHJvdG90eXBlLm9uUmVtb3ZlLmNhbGwodGhpcywgbWFwKTtcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gIH0sXG4gIGNsZWFyTGF5ZXJzICgpIHtcbiAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2goKG1hcmtlcikgPT4ge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKG1hcmtlcik7XG4gICAgfSk7XG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICB9LFxuICBhZGRUbyAobWFwKSB7XG4gICAgbWFwLmFkZExheWVyKHRoaXMpO1xuICB9LFxuICBhZGRMYXllciAobWFya2VyKSB7XG4gICAgdGhpcy5fbWFwLmFkZExheWVyKG1hcmtlcik7XG4gICAgdGhpcy5fbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgaWYgKG1hcmtlci5wb3NpdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tYXJrZXJzLm1vdmUodGhpcy5fbWFya2Vycy5sZW5ndGggLSAxLCBtYXJrZXIucG9zaXRpb24pO1xuICAgIH1cbiAgICBtYXJrZXIucG9zaXRpb24gPSAobWFya2VyLnBvc2l0aW9uICE9IG51bGwpID8gbWFya2VyLnBvc2l0aW9uIDogdGhpcy5fbWFya2Vycy5sZW5ndGggLSAxO1xuICB9LFxuICByZW1vdmUgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICBtYXJrZXJzLl9lYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIHdoaWxlICh0aGlzLmdldExheWVycygpLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcihtYXJrZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCF0aGlzLl9pc0hvbGUpIHtcbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBtYXAuZ2V0Vkdyb3VwKCkucmVtb3ZlTGF5ZXIobWFwLl9nZXRTZWxlY3RlZFZMYXllcigpKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUxheWVyIChtYXJrZXIpIHtcbiAgICB2YXIgcG9zaXRpb24gPSBtYXJrZXIucG9zaXRpb247XG4gICAgdGhpcy5fbWFwLnJlbW92ZUxheWVyKG1hcmtlcik7XG4gICAgdGhpcy5fbWFya2Vycy5zcGxpY2UocG9zaXRpb24sIDEpO1xuICB9LFxuICBnZXRMYXllcnMgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrZXJzO1xuICB9LFxuICBlYWNoTGF5ZXIgKGNiKSB7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKGNiKTtcbiAgfSxcbiAgbWFya2VyQXQgKHBvc2l0aW9uKSB7XG4gICAgdmFyIHJzbHQgPSB0aGlzLl9tYXJrZXJzW3Bvc2l0aW9uXTtcblxuICAgIGlmIChwb3NpdGlvbiA8IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmZpcnN0TWFya2VyKCk7XG4gICAgfVxuXG4gICAgaWYgKHJzbHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnNsdCA9IHRoaXMubGFzdE1hcmtlcigpO1xuICAgIH1cblxuICAgIHJldHVybiByc2x0O1xuICB9LFxuICBmaXJzdE1hcmtlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmtlcnNbMF07XG4gIH0sXG4gIGxhc3RNYXJrZXIgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcbiAgICByZXR1cm4gbWFya2Vyc1ttYXJrZXJzLmxlbmd0aCAtIDFdO1xuICB9LFxuICByZW1vdmVNYXJrZXIgKG1hcmtlcikge1xuICAgIHZhciBiID0gIW1hcmtlci5pc01pZGRsZSgpO1xuXG4gICAgdmFyIHByZXZNYXJrZXIgPSBtYXJrZXIuX3ByZXY7XG4gICAgdmFyIG5leHRNYXJrZXIgPSBtYXJrZXIuX25leHQ7XG4gICAgdmFyIG5leHRuZXh0TWFya2VyID0gbWFya2VyLl9uZXh0Ll9uZXh0O1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQobWFya2VyLnBvc2l0aW9uKTtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KHByZXZNYXJrZXIucG9zaXRpb24pO1xuICAgIHRoaXMucmVtb3ZlTWFya2VyQXQobmV4dE1hcmtlci5wb3NpdGlvbik7XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zZXRNaWRkbGVNYXJrZXIobmV4dG5leHRNYXJrZXIucG9zaXRpb24pO1xuXG4gICAgICBpZiAoYikge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOmRlbGV0ZV9ob2xlJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXAucmVtb3ZlUG9seWdvbihtYXAuZ2V0RVBvbHlnb24oKSk7XG5cbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfcG9seWdvbicpO1xuICAgICAgfVxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZU1hcmtlckF0IChwb3NpdGlvbikge1xuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXI7XG4gICAgaWYgKHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICAgIG1hcmtlciA9IHRoaXMubWFya2VyQXQocG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIF9jaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG4gICAgbWFya2Vycy5mb3JFYWNoKChfbWFya2VyKSA9PiB7XG4gICAgICBpZiAoX2NoYW5nZVBvcykge1xuICAgICAgICBfbWFya2VyLnBvc2l0aW9uID0gKF9tYXJrZXIucG9zaXRpb24gPT09IDApID8gMCA6IF9tYXJrZXIucG9zaXRpb24gLSAxO1xuICAgICAgfVxuICAgICAgaWYgKF9tYXJrZXIgPT09IG1hcmtlcikge1xuICAgICAgICBtYXJrZXIuX3ByZXYuX25leHQgPSBtYXJrZXIuX25leHQ7XG4gICAgICAgIG1hcmtlci5fbmV4dC5fcHJldiA9IG1hcmtlci5fcHJldjtcbiAgICAgICAgX2NoYW5nZVBvcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbW92ZUxheWVyKG1hcmtlcik7XG5cbiAgICBpZiAobWFya2Vycy5sZW5ndGggPCA1KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICBtYXAuZ2V0RVBvbHlnb24oKS5jbGVhcigpO1xuICAgICAgICBtYXAuZ2V0Vkdyb3VwKCkucmVtb3ZlTGF5ZXIobWFwLl9nZXRTZWxlY3RlZFZMYXllcigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGFkZE1hcmtlciAobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucykge1xuICAgIC8vIDEuIHJlY2FsY3VsYXRlIHBvc2l0aW9uc1xuICAgIGlmICh0eXBlb2YgbGF0bG5nID09PSAnbnVtYmVyJykge1xuICAgICAgcG9zaXRpb24gPSB0aGlzLm1hcmtlckF0KGxhdGxuZykucG9zaXRpb247XG4gICAgICB0aGlzLl9yZWNhbGNQb3NpdGlvbnMocG9zaXRpb24pO1xuXG4gICAgICB2YXIgcHJldk1hcmtlciA9IChwb3NpdGlvbiAtIDEpIDwgMCA/IHRoaXMubGFzdE1hcmtlcigpIDogdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgdmFyIG5leHRNYXJrZXIgPSB0aGlzLm1hcmtlckF0KChwb3NpdGlvbiA9PSAtMSkgPyAxIDogcG9zaXRpb24pO1xuICAgICAgbGF0bG5nID0gdGhpcy5fZ2V0TWlkZGxlTGF0TG5nKHByZXZNYXJrZXIsIG5leHRNYXJrZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgb3B0aW9ucy5kcmFnZ2FibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRGaXJzdCgpKSB7XG4gICAgICBvcHRpb25zLmRyYWdnYWJsZSA9ICF0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpO1xuICAgIH1cblxuICAgIHZhciBtYXJrZXIgPSBuZXcgTWFya2VyKHRoaXMsIGxhdGxuZywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgICB0aGlzLl9sYXN0TWFya2VyID0gbWFya2VyO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvL2lmICh0aGlzLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgLy8gIG1hcmtlci5kcmFnZ2luZy5kaXNhYmxlKCk7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICBtYXJrZXIuZHJhZ2dpbmcuZW5hYmxlKCk7XG4gICAgLy99XG5cbiAgICB0aGlzLmFkZExheWVyKG1hcmtlcik7XG5cbiAgICB7XG4gICAgICBtYXJrZXIucG9zaXRpb24gPSAobWFya2VyLnBvc2l0aW9uICE9PSB1bmRlZmluZWQgKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX2xhc3RQb3NpdGlvbisrO1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fbGFzdE1hcmtlcjtcbiAgICAgIHRoaXMuX2ZpcnN0TWFya2VyLl9wcmV2ID0gbWFya2VyO1xuICAgICAgaWYgKG1hcmtlci5fcHJldikge1xuICAgICAgICB0aGlzLl9sYXN0TWFya2VyLl9uZXh0ID0gbWFya2VyO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLl9maXJzdE1hcmtlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fbGFzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB9XG5cbiAgICAvLyAyLiByZWNhbGN1bGF0ZSByZWxhdGlvbnNcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVjYWxjUmVsYXRpb25zKG1hcmtlcik7XG4gICAgfVxuICAgIC8vIDMuIHRyaWdnZXIgZXZlbnRcbiAgICBpZiAoIW1hcmtlci5pc01pZGRsZSgpKSB7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOmFkZF9tYXJrZXInLCB7bWFya2VyOiBtYXJrZXJ9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdmFyIGlkcyA9IHRoaXMuX2lkcygpO1xuXG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuXG4gICAgaWRzLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICB0aGlzLl9kZWxldGVFdmVudHMoaWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gMDtcblxuICAgIHRoaXMuX2ZpcnN0TWFya2VyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfZGVsZXRlRXZlbnRzIChpZCkge1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnZpZXdyZXNldF9pZHhbaWRdO1xuICAgIGRlbGV0ZSB0aGlzLl9tYXAuX2xlYWZsZXRfZXZlbnRzLnpvb21hbmltX2lkeFtpZF07XG4gIH0sXG4gIF9nZXRNaWRkbGVMYXRMbmcgKG1hcmtlcjEsIG1hcmtlcjIpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwLFxuICAgICAgcDEgPSBtYXAucHJvamVjdChtYXJrZXIxLmdldExhdExuZygpKSxcbiAgICAgIHAyID0gbWFwLnByb2plY3QobWFya2VyMi5nZXRMYXRMbmcoKSk7XG5cbiAgICByZXR1cm4gbWFwLnVucHJvamVjdChwMS5fYWRkKHAyKS5fZGl2aWRlQnkoMikpO1xuICB9LFxuICBfcmVjYWxjUG9zaXRpb25zIChwb3NpdGlvbikge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcblxuICAgIHZhciBjaGFuZ2VQb3MgPSBmYWxzZTtcbiAgICBtYXJrZXJzLmZvckVhY2goKG1hcmtlciwgX3Bvc2l0aW9uKSA9PiB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgICAgICBjaGFuZ2VQb3MgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZVBvcykge1xuICAgICAgICB0aGlzLl9tYXJrZXJzW19wb3NpdGlvbl0ucG9zaXRpb24gKz0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX3JlY2FsY1JlbGF0aW9ucyAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuXG4gICAgbWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIHBvc2l0aW9uKSA9PiB7XG5cbiAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gLSAxKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gKyAxKTtcblxuICAgICAgLy8gZmlyc3RcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLmxhc3RNYXJrZXIoKTtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdCgxKTtcbiAgICAgIH1cblxuICAgICAgLy8gbGFzdFxuICAgICAgaWYgKHBvc2l0aW9uID09PSBtYXJrZXJzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5tYXJrZXJBdChwb3NpdGlvbiAtIDEpO1xuICAgICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfaWRzICgpIHtcbiAgICB2YXIgcnNsdCA9IFtdO1xuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5fbGF5ZXJzKSB7XG4gICAgICByc2x0LnB1c2goaWQpO1xuICAgIH1cblxuICAgIHJzbHQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuXG4gICAgcmV0dXJuIHJzbHQ7XG4gIH0sXG4gIHNlbGVjdCAoKSB7XG4gICAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl9tYXAuX3NlbGVjdGVkTUdyb3VwID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgICBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICBtYXJrZXIuc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IHRydWU7XG5cbiAgICB0aGlzLl9tYXAuX3NlbGVjdGVkTUdyb3VwID0gdGhpcztcbiAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9ncm91cF9zZWxlY3QnKTtcbiAgfSxcbiAgaXNFbXB0eSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF5ZXJzKCkubGVuZ3RoID09PSAwO1xuICB9LFxuICByZXNldFNlbGVjdGlvbiAoKSB7XG4gICAgdGhpcy5nZXRMYXllcnMoKS5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkID0gZmFsc2U7XG4gIH1cbn0pIiwiZXhwb3J0IGRlZmF1bHQgTC5Db250cm9sLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBwb3NpdGlvbjogJ3RvcGxlZnQnLFxuICAgIGJ0bnM6IFtcbiAgICAgIC8veyd0aXRsZSc6ICdyZW1vdmUnLCAnY2xhc3NOYW1lJzogJ2ZhIGZhLXRyYXNoJ31cbiAgICBdLFxuICAgIGV2ZW50TmFtZTogXCJjb250cm9sQWRkZWRcIlxuICB9LFxuICBfYnRuOiBudWxsLFxuICBzdG9wRXZlbnQ6IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uLFxuICBpbml0aWFsaXplIChvcHRpb25zKSB7XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gIH0sXG4gIF90aXRsZUNvbnRhaW5lcjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcblxuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1iYXIgbGVhZmxldC1lZGl0b3ItYnV0dG9ucycpO1xuXG4gICAgbWFwLl9jb250cm9sQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NldEJ0bih0aGlzLm9wdGlvbnMuYnRucywgY29udGFpbmVyKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXZlbnROYW1lKSB7XG4gICAgICAgIG1hcC5maXJlKHRoaXMub3B0aW9ucy5ldmVudE5hbWUsIHtjb250cm9sOiB0aGlzfSk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG5cbiAgICBtYXAuZ2V0QnRuQ29udHJvbCA9ICgpID0+IHRoaXM7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfc2V0QnRuIChvcHRzLCBjb250YWluZXIpIHtcbiAgICB2YXIgX2J0bjtcbiAgICBvcHRzLmZvckVhY2goKGJ0biwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gb3B0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGJ0bi5jbGFzc05hbWUgKz0gXCIgbGFzdFwiO1xuICAgICAgfVxuICAgICAgLy92YXIgY2hpbGQgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1idG4nICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKTtcblxuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICdsZWFmbGV0LWJ0bicsIHdyYXBwZXIpO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuXG4gICAgICB2YXIgc3RvcCA9IEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uO1xuICAgICAgTC5Eb21FdmVudFxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdtb3VzZWRvd24nLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2RibGNsaWNrJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIEwuRG9tRXZlbnQucHJldmVudERlZmF1bHQpO1xuXG4gICAgICBsaW5rLmFwcGVuZENoaWxkKEwuRG9tVXRpbC5jcmVhdGUoJ2knLCAnZmEnICsgKGJ0bi5jbGFzc05hbWUgPyAnICcgKyBidG4uY2xhc3NOYW1lIDogJycpKSk7XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCBwcmVzc0V2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIG1hcC5maXJlKHByZXNzRXZlbnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSh0aGlzLl9tYXAsIGJ0bi5wcmVzc0V2ZW50TmFtZSB8fCAnYnRuUHJlc3NlZCcpKTtcblxuICAgICAgTC5Eb21FdmVudC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgX2J0biA9IGxpbms7XG4gICAgfSk7XG4gICAgdGhpcy5fYnRuID0gX2J0bjtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1sndG9wbGVmdCddO1xuICB9LFxuICBnZXRCdG5BdCAocG9zKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnRuQ29udGFpbmVyKCkuY2hpbGRbcG9zXTtcbiAgfSxcbiAgZGlzYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH0sXG4gIGVuYWJsZUJ0biAocG9zKSB7XG4gICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuZ2V0QnRuQXQocG9zKSwgJ2Rpc2FibGVkJyk7XG4gIH1cbn0pOyIsImltcG9ydCBCdG5DdHJsIGZyb20gJy4vQnRuQ29udHJvbCc7XG5cbmV4cG9ydCBkZWZhdWx0IEJ0bkN0cmwuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIGV2ZW50TmFtZTogJ2xvYWRCdG5BZGRlZCdcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb250YWluZXIgPSBCdG5DdHJsLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICBtYXAub24oJ2xvYWRCdG5BZGRlZCcsICgpID0+IHtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuXG4gICAgICBMLkRvbUV2ZW50XG4gICAgICAgIC5vbih0aGlzLl9idG4sICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgICAub24odGhpcy5fYnRuLCAnY2xpY2snLCB0aGlzLl90b2dnbGUsIHRoaXMpO1xuXG4gICAgICB0aGlzLl9tYXAub24oJ3NlYXJjaEVuYWJsZWQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XG5cbiAgICAgIHRoaXMuX3JlbmRlckZvcm0oY29udGFpbmVyKTtcbiAgICB9KTtcblxuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyhjb250YWluZXIsICdsb2FkLWpzb24tY29udGFpbmVyJyk7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9LFxuICBfdG9nZ2xlICgpIHtcbiAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLl90ZXh0YXJlYS5mb2N1cygpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2xvYWRCdG5PcGVuZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuSGlkZGVuJyk7XG4gICAgfVxuICB9LFxuICBfY29sbGFwc2UgKCkge1xuICAgIHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl90ZXh0YXJlYS52YWx1ZSA9ICcnO1xuICB9LFxuICBfcmVuZGVyRm9ybSAoY29udGFpbmVyKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gTC5Eb21VdGlsLmNyZWF0ZSgnZm9ybScpO1xuXG4gICAgdmFyIHRleHRhcmVhID0gdGhpcy5fdGV4dGFyZWEgPSBMLkRvbVV0aWwuY3JlYXRlKCd0ZXh0YXJlYScpO1xuICAgIHRleHRhcmVhLnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnO1xuICAgIHRleHRhcmVhLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgd2hpdGUnO1xuICAgIHRleHRhcmVhLnN0eWxlLnBhZGRpbmcgPSAnNXB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNHB4JztcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2NsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbih0ZXh0YXJlYSwgJ2RibGNsaWNrJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdtb3VzZXdoZWVsJywgdGhpcy5zdG9wRXZlbnQpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG5cbiAgICB2YXIgc3VibWl0QnRuID0gdGhpcy5fc3VibWl0QnRuID0gTC5Eb21VdGlsLmNyZWF0ZSgnYnV0dG9uJywgJ2xlYWZsZXQtc3VibWl0LWJ0bicpO1xuICAgIHN1Ym1pdEJ0bi50eXBlID0gXCJzdWJtaXRcIjtcbiAgICBzdWJtaXRCdG4uaW5uZXJUZXh0ID0gXCJzdWJtaXRcIjtcblxuICAgIEwuRG9tRXZlbnRcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ21vdXNlZG93bicsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHN1Ym1pdEJ0biwgJ2NsaWNrJywgdGhpcy5fc3VibWl0Rm9ybSwgdGhpcyk7XG5cbiAgICBmb3JtLmFwcGVuZENoaWxkKHN1Ym1pdEJ0bik7XG5cbiAgICBMLkRvbUV2ZW50Lm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gIH0sXG4gIF90aW1lb3V0OiBudWxsLFxuICBfc3VibWl0Rm9ybSAoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KTtcbiAgICB9XG5cbiAgICB2YXIganNvbjtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5wYXJzZSh0aGlzLl90ZXh0YXJlYS52YWx1ZSk7XG5cbiAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0Lmpzb25XYXNMb2FkZWQsIFwic3VjY2Vzc1wiKTtcblxuICAgICAgbWFwLmNyZWF0ZUVkaXRQb2x5Z29uKGpzb24pO1xuXG4gICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH0sIDIwMDApO1xuXG4gICAgICB0aGlzLl9jb2xsYXBzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmNoZWNrSnNvbiwgXCJlcnJvclwiKTtcblxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9LCAyMDAwKTtcbiAgICB9XG4gIH0sXG4gIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIubXNnKHRoaXMuX21hcC5vcHRpb25zLnRleHQubG9hZEpzb24pO1xuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICB9XG59KTsiLCJleHBvcnQgZGVmYXVsdCBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgb3B0aW9uczoge1xuICAgIHBvc2l0aW9uOiAnbXNnY2VudGVyJyxcbiAgICBkZWZhdWx0TXNnOiBudWxsXG4gIH0sXG4gIGluaXRpYWxpemUgKG9wdGlvbnMpIHtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgfSxcbiAgX3RpdGxlQ29udGFpbmVyOiBudWxsLFxuICBvbkFkZCAobWFwKSB7XG4gICAgdmFyIGNvcm5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LXRvcCcpO1xuICAgIHZhciBjb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1tc2ctZWRpdG9yJyk7XG5cbiAgICBtYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXSA9IGNvcm5lcjtcbiAgICBtYXAuX2NvbnRyb2xDb250YWluZXIuYXBwZW5kQ2hpbGQoY29ybmVyKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fc2V0Q29udGFpbmVyKGNvbnRhaW5lciwgbWFwKTtcbiAgICAgIG1hcC5maXJlKCdtc2dIZWxwZXJBZGRlZCcsIHtjb250cm9sOiB0aGlzfSk7XG5cbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH0sIDEwMDApO1xuXG4gICAgbWFwLmdldEJ0bkNvbnRyb2wgPSAoKSA9PiB0aGlzO1xuXG4gICAgdGhpcy5fYmluZEV2ZW50cyhtYXApO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX2NoYW5nZVBvcyAobWFwKSB7XG4gICAgdmFyIGNvbnRyb2xDb3JuZXIgPSBtYXAuX2NvbnRyb2xDb3JuZXJzWydtc2djZW50ZXInXTtcbiAgICBpZiAoY29udHJvbENvcm5lciAmJiBjb250cm9sQ29ybmVyLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgdmFyIGNoaWxkID0gY29udHJvbENvcm5lci5jaGlsZHJlbi5pdGVtKCkuY2hpbGRyZW5bMF07XG5cbiAgICAgIGlmKCFjaGlsZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB3aWR0aCA9IGNoaWxkLmNsaWVudFdpZHRoO1xuICAgICAgaWYod2lkdGgpIHtcbiAgICAgICAgY29udHJvbENvcm5lci5zdHlsZS5sZWZ0ID0gKG1hcC5fY29udGFpbmVyLmNsaWVudFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCc7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfYmluZEV2ZW50cyAobWFwKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICB0aGlzLl9jaGFuZ2VQb3MobWFwKTtcbiAgICAgIH0pO1xuICAgIH0sIDEpO1xuICB9LFxuICBfc2V0Q29udGFpbmVyIChjb250YWluZXIsIG1hcCkge1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnICE9PSBudWxsKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnO1xuICAgIH1cblxuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLm1zZyA9ICh0ZXh0LCB0eXBlKSA9PiB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRleHQ7XG5cbiAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLScgKyB0eXBlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH07XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5oaWRlID0gKCkgPT4ge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfTtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gIH0sXG4gIGdldEJ0bkF0IChwb3MpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdG5Db250YWluZXIoKS5jaGlsZFtwb3NdO1xuICB9LFxuICBkaXNhYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfSxcbiAgZW5hYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Qb2x5Z29uLmV4dGVuZCh7XG4gIGlzRW1wdHkgKCkge1xuICAgIHZhciBsYXRMbmdzID0gdGhpcy5nZXRMYXRMbmdzKCk7XG4gICAgcmV0dXJuIGxhdExuZ3MgPT09IG51bGwgfHwgbGF0TG5ncyA9PT0gdW5kZWZpbmVkIHx8IChsYXRMbmdzICYmIGxhdExuZ3MubGVuZ3RoID09PSAwKTtcbiAgfSxcbiAgZ2V0SG9sZSAoaG9sZUdyb3VwTnVtYmVyKSB7XG4gICAgaWYgKCEkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdO1xuICB9LFxuICBnZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlcikge1xuICAgIGlmICghJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAhJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXTtcbiAgfSxcbiAgZ2V0SG9sZXMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ob2xlcztcbiAgfSxcbiAgY2xlYXJIb2xlcyAoKSB7XG4gICAgdGhpcy5faG9sZXMgPSBbXTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5jbGVhckhvbGVzKCk7XG5cbiAgICBpZiAoJC5pc0FycmF5KHRoaXMuX2xhdGxuZ3MpICYmIHRoaXMuX2xhdGxuZ3NbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZUhvbGVQb2ludCAoaG9sZUdyb3VwTnVtYmVyLCBob2xlTnVtYmVyLCBsYXRsbmcpIHtcbiAgICBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXSA9IGxhdGxuZztcbiAgICB9IGVsc2UgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgISQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdID0gbGF0bG5nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ob2xlcyA9IGxhdGxuZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHNldEhvbGVzIChsYXRsbmdzKSB7XG4gICAgdGhpcy5faG9sZXMgPSBsYXRsbmdzO1xuICB9LFxuICBzZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlciwgbGF0bG5nKSB7XG4gICAgdmFyIGxheWVyID0gdGhpcy5nZXRMYXllcnMoKVswXTtcbiAgICBpZiAobGF5ZXIpIHtcbiAgICAgIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICAgIGxheWVyLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdW2hvbGVOdW1iZXJdID0gbGF0bG5nO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNsYXNzLmV4dGVuZCh7XG4gIF90aW1lOiAyMDAwLFxuICBpbml0aWFsaXplIChtYXAsIHRleHQsIHRpbWUpIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5fcG9wdXBQYW5lID0gbWFwLl9wYW5lcy5wb3B1cFBhbmU7XG4gICAgdGhpcy5fdGV4dCA9ICcnIHx8IHRleHQ7XG4gICAgdGhpcy5faXNTdGF0aWMgPSBmYWxzZTtcbiAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10b29sdGlwJywgdGhpcy5fcG9wdXBQYW5lKTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgdGhpcy5fdGltZSA9IHRpbWUgfHwgdGhpcy5fdGltZTtcbiAgfSxcblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9wb3B1cFBhbmUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICAgIHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gICdzdGF0aWMnIChpc1N0YXRpYykge1xuICAgIHRoaXMuX2lzU3RhdGljID0gaXNTdGF0aWMgfHwgdGhpcy5faXNTdGF0aWM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9yZW5kZXIgKCkge1xuICAgIHRoaXMuX2NvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxzcGFuPlwiICsgdGhpcy5fdGV4dCArIFwiPC9zcGFuPlwiO1xuICB9LFxuICBfdXBkYXRlUG9zaXRpb24gKGxhdGxuZykge1xuICAgIHZhciBwb3MgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyksXG4gICAgICB0b29sdGlwQ29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xuXG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgdG9vbHRpcENvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2luaGVyaXQnO1xuICAgICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRvb2x0aXBDb250YWluZXIsIHBvcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX3Nob3dFcnJvciAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihsYXRsbmcpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1N0YXRpYykge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9zaG93SW5mbyAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtaW5mby10b29sdGlwJyk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGxhdGxuZyk7XG5cbiAgICBpZiAoIXRoaXMuX2lzU3RhdGljKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX2hpZGUgKCkge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWluZm8tdG9vbHRpcCcpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgdGV4dCAodGV4dCkge1xuICAgIHRoaXMuX3RleHQgPSB0ZXh0IHx8IHRoaXMuX3RleHQ7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH0sXG4gIHNob3cgKGxhdGxuZywgdHlwZSA9ICdpbmZvJykge1xuXG4gICAgdGhpcy50ZXh0KCk7XG5cbiAgICBpZih0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihsYXRsbmcpO1xuICAgIH1cbiAgICBpZih0eXBlID09PSAnaW5mbycpIHtcbiAgICAgIHRoaXMuc2hvd0luZm8obGF0bG5nKTtcbiAgICB9XG4gIH0sXG4gIHNob3dJbmZvIChsYXRsbmcpIHtcbiAgICB0aGlzLl9zaG93SW5mbyhsYXRsbmcpO1xuXG4gICAgaWYgKHRoaXMuX2hpZGVJbmZvVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVJbmZvVGltZW91dCk7XG4gICAgICB0aGlzLl9oaWRlSW5mb1RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVJbmZvVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIHNob3dFcnJvciAobGF0bG5nKSB7XG4gICAgdGhpcy5fc2hvd0Vycm9yKGxhdGxuZyk7XG5cbiAgICBpZiAodGhpcy5faGlkZUVycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVFcnJvclRpbWVvdXQpO1xuICAgICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIGhpZGUgKCkge1xuICAgIHRoaXMuX2hpZGUoKTtcbiAgfSxcbiAgX29uTW91c2VNb3ZlIChlKSB7XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oZS5sYXRsbmcpO1xuICB9LFxuICBzZXRUaW1lICh0aW1lKSB7XG4gICAgaWYgKHRpbWUpIHtcbiAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IEJ0bkN0cmwgZnJvbSAnLi9CdG5Db250cm9sJztcblxuZXhwb3J0IGRlZmF1bHQgQnRuQ3RybC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgZXZlbnROYW1lOiAndHJhc2hBZGRlZCdcbiAgfSxcbiAgX2J0bjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIG1hcC5vbignYnRuUHJlc3NlZCcsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9idG4gJiYgIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpKSB7XG4gICAgICAgIHRoaXMuX29uUHJlc3NCdG4oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG1hcC5vbigndHJhc2hBZGRlZCcsICgpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuICAgIH0pO1xuXG4gICAgbWFwLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsIHRoaXMuX2JpbmRFdmVudHMsIHRoaXMpO1xuXG4gICAgbWFwLm9uKCdlZGl0b3I6c3RhcnRfYWRkX25ld19wb2x5Z29uJywgdGhpcy5fYmluZEV2ZW50cywgdGhpcyk7XG5cbiAgICBtYXAub24oJ2VkaXRvcjpzdGFydF9hZGRfbmV3X2hvbGUnLCB0aGlzLl9iaW5kRXZlbnRzLCB0aGlzKTtcblxuICAgIG1hcC5vbignZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICBtYXAub24oJ2VkaXRvcjptYXBfY2xlYXJlZCcsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuXG4gICAgcmV0dXJuIEJ0bkN0cmwucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgX2JpbmRFdmVudHMgKCkge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3ZlciwgdGhpcyk7XG4gICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuICB9LFxuICBfZGlzYWJsZUJ0biAoKSB7XG4gICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG5cbiAgICBMLkRvbUV2ZW50LnJlbW92ZUxpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyKTtcbiAgICBMLkRvbUV2ZW50LnJlbW92ZUxpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3V0JywgdGhpcy5fb25Nb3VzZU91dCk7XG4gIH0sXG4gIF9vblByZXNzQnRuICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHZhciBzZWxlY3RlZE1Hcm91cCA9IG1hcC5nZXRTZWxlY3RlZE1Hcm91cCgpO1xuXG4gICAgaWYgKHNlbGVjdGVkTUdyb3VwID09PSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpICYmIHNlbGVjdGVkTUdyb3VwLmdldExheWVycygpWzBdLl9pc0ZpcnN0KSB7XG4gICAgICBtYXAuY2xlYXIoKTtcbiAgICAgIG1hcC5tb2RlKCdkcmF3Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkTUdyb3VwLnJlbW92ZSgpO1xuICAgICAgc2VsZWN0ZWRNR3JvdXAuZ2V0REVMaW5lKCkuY2xlYXIoKTtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuICAgIH1cbiAgICB0aGlzLl9vbk1vdXNlT3V0KCk7XG4gIH0sXG4gIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKVswXS5faXNGaXJzdCkge1xuICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQucmVqZWN0Q2hhbmdlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcC5fbXNnQ29udGFpbmVyLm1zZyhtYXAub3B0aW9ucy50ZXh0LmRlbGV0ZVNlbGVjdGVkRWRnZXMpO1xuICAgIH1cbiAgfSxcbiAgX29uTW91c2VPdXQgKCkge1xuICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgfVxufSk7IiwiaW1wb3J0IHNlYXJjaCBmcm9tICcuLi91dGlscy9zZWFyY2gnO1xuaW1wb3J0IFRyYXNoQnRuIGZyb20gJy4uL2V4dGVuZGVkL1RyYXNoQnRuJztcbmltcG9ydCBMb2FkQnRuIGZyb20gJy4uL2V4dGVuZGVkL0xvYWRCdG4nO1xuaW1wb3J0IEJ0bkNvbnRyb2wgZnJvbSAnLi4vZXh0ZW5kZWQvQnRuQ29udHJvbCc7XG5pbXBvcnQgTXNnSGVscGVyIGZyb20gJy4uL2V4dGVuZGVkL01zZ0hlbHBlcic7XG5pbXBvcnQgbSBmcm9tICcuLi91dGlscy9tb2JpbGUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG4gIHNlYXJjaCgpO1xuXG4gIHZhciBnZ2wgPSBuZXcgTC5Hb29nbGUoKTtcblxuICB0aGlzLmFkZExheWVyKGdnbCk7XG5cbiAgdGhpcy5fY29udHJvbExheWVycyA9IG5ldyBMLkNvbnRyb2wuTGF5ZXJzKHtcbiAgICAnR29vZ2xlJzogZ2dsXG4gIH0pO1xuXG4gIHRoaXMuYWRkQ29udHJvbCh0aGlzLl9jb250cm9sTGF5ZXJzKTtcblxuICB0aGlzLnRvdWNoWm9vbS5kaXNhYmxlKCk7XG4gIHRoaXMuZG91YmxlQ2xpY2tab29tLmRpc2FibGUoKTtcbiAgLy90aGlzLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gIHRoaXMuYm94Wm9vbS5kaXNhYmxlKCk7XG4gIHRoaXMua2V5Ym9hcmQuZGlzYWJsZSgpO1xuXG4gIHRoaXMuYWRkQ29udHJvbChMLmNvbnRyb2wuc2VhcmNoKCkpO1xuXG4gIHZhciB0cmFzaEJ0biA9IG5ldyBUcmFzaEJ0bih7XG4gICAgYnRuczogW1xuICAgICAgeydjbGFzc05hbWUnOiAnZmEgZmEtdHJhc2gnfVxuICAgIF1cbiAgfSk7XG5cbiAgdmFyIGxvYWRCdG4gPSBuZXcgTG9hZEJ0bih7XG4gICAgYnRuczogW1xuICAgICAgeydjbGFzc05hbWUnOiAnZmEgZmEtYXJyb3ctY2lyY2xlLW8tZG93biBsb2FkJ31cbiAgICBdXG4gIH0pO1xuXG4gIHZhciBtc2dIZWxwZXIgPSBuZXcgTXNnSGVscGVyKHtcbiAgICBkZWZhdWx0TXNnOiB0aGlzLm9wdGlvbnMudGV4dC5jbGlja1RvU3RhcnREcmF3UG9seWdvbk9uTWFwXG4gIH0pO1xuXG4gIHRoaXMub24oJ21zZ0hlbHBlckFkZGVkJywgKGRhdGEpID0+IHtcbiAgICB2YXIgbXNnQ29udGFpbmVyID0gZGF0YS5jb250cm9sLl90aXRsZUNvbnRhaW5lcjtcblxuICAgIHRoaXMuX21zZ0NvbnRhaW5lciA9IG1zZ0NvbnRhaW5lcjtcbiAgICB2YXIgdGV4dCA9IHRoaXMub3B0aW9ucy50ZXh0O1xuXG4gICAgdGhpcy5vbignZWRpdG9yOm1hcmtlcl9ncm91cF9zZWxlY3QnLCAoKSA9PiB7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6bm90X3NlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9TZWxlY3RFZGdlcyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6c2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnNlbGVjdGVkX21pZGRsZV9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5jbGlja1RvQWRkTmV3RWRnZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIG9uIGVkaXQgcG9seWdvblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9EcmF3SW5uZXJFZGdlcyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9KTtcbiAgICAgIC8vIG9uIHZpZXcgcG9seWdvblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9FZGl0KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gaGlkZSBtc2dcbiAgICB0aGlzLm9mZignZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcpO1xuICAgIHRoaXMub24oJ2VkaXRvcjptYXJrZXJfbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIuaGlkZSgpO1xuICAgIH0pO1xuICAgIC8vIG9uIHN0YXJ0IGRyYXcgcG9seWdvblxuICAgIHRoaXMub2ZmKCdlZGl0b3I6Zmlyc3RfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgIHRoaXMub24oJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9Kb2luRWRnZXMpO1xuICAgIH0pO1xuICAgIC8vIGRibGNsaWNrIHRvIGpvaW5cbiAgICB0aGlzLm9mZignZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicpO1xuICAgIHRoaXMub24oJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIubXNnKHRleHQuZGJsY2xpY2tUb0pvaW5FZGdlcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6am9pbl9wYXRoJywgKCkgPT4ge1xuICAgICAgbXNnQ29udGFpbmVyLm1zZyh0aGlzLm9wdGlvbnMudGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcyk7XG4gICAgfSk7XG5cbiAgICAvL3RvZG86IGNvbnRpbnVlIHdpdGggb3B0aW9uICdhbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb24nXG4gICAgdGhpcy5vbignZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZCcsIChkYXRhKSA9PiB7XG4gICAgICAvLyBtc2dcbiAgICAgIGlmIChkYXRhLmludGVyc2VjdGlvbikge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmludGVyc2VjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VsZWN0ZWRNYXJrZXIgPSB0aGlzLmdldFNlbGVjdGVkTWFya2VyKCk7XG5cbiAgICAgIGlmKCF0aGlzLmhhc0xheWVyKHNlbGVjdGVkTWFya2VyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKHNlbGVjdGVkTWFya2VyICYmICFzZWxlY3RlZE1hcmtlci5fbUdyb3VwLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgICAgLy9zZXQgbWFya2VyIHN0eWxlXG4gICAgICAgIGlmIChkYXRhLmludGVyc2VjdGlvbikge1xuICAgICAgICAgIC8vc2V0ICdlcnJvcicgc3R5bGVcbiAgICAgICAgICBzZWxlY3RlZE1hcmtlci5zZXRJbnRlcnNlY3RlZFN0eWxlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9yZXN0b3JlIHN0eWxlXG4gICAgICAgICAgc2VsZWN0ZWRNYXJrZXIucmVzZXRTdHlsZSgpO1xuICAgICAgICAgIC8vcmVzdG9yZSBvdGhlciBtYXJrZXJzIHdoaWNoIGFyZSBhbHNvIG5lZWQgdG8gcmVzZXQgc3R5bGVcbiAgICAgICAgICB2YXIgbWFya2Vyc1RvUmVzZXQgPSBzZWxlY3RlZE1hcmtlci5fbUdyb3VwLmdldExheWVycygpLmZpbHRlcigobGF5ZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBMLkRvbVV0aWwuaGFzQ2xhc3MobGF5ZXIuX2ljb24sICdtLWVkaXRvci1pbnRlcnNlY3Rpb24tZGl2LWljb24nKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hcmtlcnNUb1Jlc2V0Lm1hcCgobWFya2VyKSA9PiBtYXJrZXIucmVzZXRTdHlsZSgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBpZiAoIW0uaXNNb2JpbGVCcm93c2VyKCkpIHtcbiAgICB0aGlzLmFkZENvbnRyb2wobXNnSGVscGVyKTtcbiAgICB0aGlzLmFkZENvbnRyb2wobG9hZEJ0bik7XG4gIH1cblxuICB0aGlzLmFkZENvbnRyb2wodHJhc2hCdG4pO1xufSIsImltcG9ydCBNYXBFZGl0b3IgZnJvbSAnLi4vanMvbWFwJztcblxud2luZG93Lk1hcEVkaXRvciA9IE1hcEVkaXRvcjsiLCJpbXBvcnQgVmlld0dyb3VwIGZyb20gJy4vdmlldy9ncm91cCc7XG5pbXBvcnQgRWRpdFBvbHlnb24gZnJvbSAnLi9lZGl0L3BvbHlnb24nO1xuaW1wb3J0IEhvbGVzR3JvdXAgZnJvbSAnLi9lZGl0L2hvbGVzR3JvdXAnO1xuaW1wb3J0IEVkaXRMaW5lR3JvdXAgZnJvbSAnLi9lZGl0L2xpbmUnO1xuaW1wb3J0IERhc2hlZEVkaXRMaW5lR3JvdXAgZnJvbSAnLi9kcmF3L2Rhc2hlZC1saW5lJztcblxuaW1wb3J0ICcuL2VkaXQvbWFya2VyLWdyb3VwJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICB2aWV3R3JvdXA6IG51bGwsXG4gIGVkaXRHcm91cDogbnVsbCxcbiAgZWRpdFBvbHlnb246IG51bGwsXG4gIGVkaXRNYXJrZXJzR3JvdXA6IG51bGwsXG4gIGVkaXRMaW5lR3JvdXA6IG51bGwsXG4gIGRhc2hlZEVkaXRMaW5lR3JvdXA6IG51bGwsXG4gIGVkaXRIb2xlTWFya2Vyc0dyb3VwOiBudWxsLFxuICBzZXRMYXllcnMgKCkge1xuICAgIHRoaXMudmlld0dyb3VwID0gbmV3IFZpZXdHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0R3JvdXAgPSBuZXcgTC5GZWF0dXJlR3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdFBvbHlnb24gPSBuZXcgRWRpdFBvbHlnb24oW10pO1xuICAgIHRoaXMuZWRpdE1hcmtlcnNHcm91cCA9IG5ldyBMLk1hcmtlckdyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRMaW5lR3JvdXAgPSBuZXcgRWRpdExpbmVHcm91cChbXSk7XG4gICAgdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwID0gbmV3IERhc2hlZEVkaXRMaW5lR3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdEhvbGVNYXJrZXJzR3JvdXAgPSBuZXcgSG9sZXNHcm91cChbXSk7XG4gIH1cbn0iLCJpbXBvcnQgQmFzZSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IENvbnRyb2xzSG9vayBmcm9tICcuL2hvb2tzL2NvbnRyb2xzJztcblxuaW1wb3J0ICogYXMgbGF5ZXJzIGZyb20gJy4vbGF5ZXJzJztcbmltcG9ydCAqIGFzIG9wdHMgZnJvbSAnLi9vcHRpb25zJztcblxuaW1wb3J0ICcuL3V0aWxzL2FycmF5JztcblxuZnVuY3Rpb24gbWFwKCkge1xuICB2YXIgbWFwID0gTC5NYXAuZXh0ZW5kKCQuZXh0ZW5kKEJhc2UsIHtcbiAgICAkOiB1bmRlZmluZWQsXG4gICAgaW5pdGlhbGl6ZSAoaWQsIG9wdGlvbnMpIHtcbiAgICAgICQuZXh0ZW5kKG9wdHMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRzLm9wdGlvbnMpO1xuICAgICAgTC5NYXAucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBpZCwgb3B0aW9ucyk7XG4gICAgICB0aGlzLiQgPSAkKHRoaXMuX2NvbnRhaW5lcik7XG5cbiAgICAgIGxheWVycy5zZXRMYXllcnMoKTtcblxuICAgICAgdGhpcy5fYWRkTGF5ZXJzKFtcbiAgICAgICAgbGF5ZXJzLnZpZXdHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0R3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdFBvbHlnb25cbiAgICAgICAgLCBsYXllcnMuZWRpdE1hcmtlcnNHcm91cFxuICAgICAgICAsIGxheWVycy5lZGl0TGluZUdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmRhc2hlZEVkaXRMaW5lR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdEhvbGVNYXJrZXJzR3JvdXBcbiAgICAgIF0pO1xuXG4gICAgICB0aGlzLl9zZXRPdmVybGF5cyhvcHRpb25zKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvRHJhdykge1xuICAgICAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9zZXRPdmVybGF5cyAob3B0cykge1xuICAgICAgdmFyIG92ZXJsYXlzID0gb3B0cy5vdmVybGF5cztcblxuICAgICAgZm9yICh2YXIgaSBpbiBvdmVybGF5cykge1xuICAgICAgICB2YXIgb2kgPSBvdmVybGF5c1tpXTtcbiAgICAgICAgdGhpcy5fY29udHJvbExheWVycy5hZGRPdmVybGF5KG9pLCBpKTtcbiAgICAgICAgb2kuYWRkVG8odGhpcyk7XG4gICAgICAgIG9pLmJyaW5nVG9CYWNrKCk7XG4gICAgICAgIG9pLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBvaS5vbignbW91c2V1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0Vkdyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMudmlld0dyb3VwO1xuICAgIH0sXG4gICAgZ2V0RUdyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdEdyb3VwO1xuICAgIH0sXG4gICAgZ2V0RVBvbHlnb24gKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0UG9seWdvbjtcbiAgICB9LFxuICAgIGdldEVNYXJrZXJzR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0TWFya2Vyc0dyb3VwO1xuICAgIH0sXG4gICAgZ2V0RUxpbmVHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRMaW5lR3JvdXA7XG4gICAgfSxcbiAgICBnZXRERUxpbmUgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5kYXNoZWRFZGl0TGluZUdyb3VwO1xuICAgIH0sXG4gICAgZ2V0RUhNYXJrZXJzR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0SG9sZU1hcmtlcnNHcm91cDtcbiAgICB9LFxuICAgIGdldFNlbGVjdGVkUG9seWdvbjogKCkgPT4gdGhpcy5fc2VsZWN0ZWRQb2x5Z29uLFxuICAgIGdldFNlbGVjdGVkTUdyb3VwICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZE1Hcm91cDtcbiAgICB9XG4gIH0pKTtcblxuICBtYXAuYWRkSW5pdEhvb2soQ29udHJvbHNIb29rKTtcblxuICByZXR1cm4gbWFwO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXAoKTtcbiIsImltcG9ydCBtIGZyb20gJy4vdXRpbHMvbW9iaWxlJztcblxudmFyIHNpemUgPSAxO1xudmFyIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuaWYgKG0uaXNNb2JpbGVCcm93c2VyKCkpIHtcbiAgc2l6ZSA9IDI7XG59XG5cbmV4cG9ydCB2YXIgZmlyc3RJY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uLWZpcnN0XCIsXG4gIGljb25TaXplOiBbOCAqIHNpemUsIDggKiBzaXplXVxufSk7XG5cbmV4cG9ydCB2YXIgaWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvblwiLFxuICBpY29uU2l6ZTogWzEwICogc2l6ZSwgMTAgKiBzaXplXVxufSk7XG5cbmV4cG9ydCB2YXIgZHJhZ0ljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb24tZHJhZ1wiLFxuICBpY29uU2l6ZTogWzEwICogc2l6ZSAqIDMsIDEwICogc2l6ZSAqIDNdXG59KTtcblxuZXhwb3J0IHZhciBtaWRkbGVJY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLW1pZGRsZS1kaXYtaWNvblwiLFxuICBpY29uU2l6ZTogWzEwICogc2l6ZSwgMTAgKiBzaXplXVxuXG59KTtcblxuLy8gZGlzYWJsZSBob3ZlciBpY29uIHRvIHNpbXBsaWZ5XG5cbmV4cG9ydCB2YXIgaG92ZXJJY29uID0gaWNvbiB8fCBMLmRpdkljb24oe1xuICAgIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvblwiLFxuICAgIGljb25TaXplOiBbMiAqIDcgKiBzaXplLCAyICogNyAqIHNpemVdXG4gIH0pO1xuXG5leHBvcnQgdmFyIGludGVyc2VjdGlvbkljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uXCIsXG4gIGljb25TaXplOiBbMiAqIDcgKiBzaXplLCAyICogNyAqIHNpemVdXG59KTsiLCJ2YXIgdmlld0NvbG9yID0gJyMwMEZGRkYnO1xudmFyIGRyYXdDb2xvciA9ICcjMDBGODAwJztcbnZhciBlZGl0Q29sb3IgPSAnIzAwRjgwMCc7XG52YXIgd2VpZ2h0ID0gMztcblxuZXhwb3J0IHZhciBvcHRpb25zID0ge1xuICBhbGxvd0ludGVyc2VjdGlvbjogZmFsc2UsXG4gIGFsbG93Q29ycmVjdEludGVyc2VjdGlvbjogZmFsc2UsIC8vdG9kbzogdW5maW5pc2hlZFxuICBmb3JjZVRvRHJhdzogdHJ1ZSxcbiAgdHJhbnNsYXRpb25zOiB7XG4gICAgcmVtb3ZlUG9seWdvbjogXCJyZW1vdmUgcG9seWdvblwiLFxuICAgIHJlbW92ZVBvaW50OiBcInJlbW92ZSBwb2ludFwiXG4gIH0sXG4gIG92ZXJsYXlzOiB7fSxcbiAgc3R5bGU6IHtcbiAgICB2aWV3OiB7XG4gICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICBmaWxsT3BhY2l0eTogMC4yLFxuICAgICAgZGFzaEFycmF5OiBudWxsLFxuICAgICAgY2xpY2thYmxlOiBmYWxzZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBjb2xvcjogdmlld0NvbG9yLFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRcbiAgICB9LFxuICAgIGRyYXc6IHtcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIGZpbGxPcGFjaXR5OiAwLjIsXG4gICAgICBkYXNoQXJyYXk6ICc1LCAxMCcsXG4gICAgICBjbGlja2FibGU6IHRydWUsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgY29sb3I6IGRyYXdDb2xvcixcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfVxuICB9LFxuICBtYXJrZXJJY29uOiB1bmRlZmluZWQsXG4gIG1hcmtlckhvdmVySWNvbjogdW5kZWZpbmVkLFxuICBlcnJvckxpbmVTdHlsZToge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICB3ZWlnaHQ6IDMsXG4gICAgb3BhY2l0eTogMSxcbiAgICBzbW9vdGhGYWN0b3I6IDFcbiAgfSxcbiAgcHJldmlld0Vycm9yTGluZVN0eWxlOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHdlaWdodDogMyxcbiAgICBvcGFjaXR5OiAxLFxuICAgIHNtb290aEZhY3RvcjogMSxcbiAgICBkYXNoQXJyYXk6ICc1LCAxMCdcbiAgfSxcbiAgdGV4dDoge1xuICAgIGludGVyc2VjdGlvbjogXCJTZWxmLWludGVyc2VjdGlvbiBpcyBwcm9oaWJpdGVkXCIsXG4gICAgZGVsZXRlUG9pbnRJbnRlcnNlY3Rpb246IFwiRGVsZXRpb24gb2YgcG9pbnQgaXMgbm90IHBvc3NpYmxlLiBTZWxmLWludGVyc2VjdGlvbiBpcyBwcm9oaWJpdGVkXCIsXG4gICAgcmVtb3ZlUG9seWdvbjogXCJSZW1vdmUgcG9seWdvblwiLFxuICAgIGNsaWNrVG9FZGl0OiBcImNsaWNrIHRvIGVkaXRcIixcbiAgICBjbGlja1RvQWRkTmV3RWRnZXM6IFwiPGRpdj5jbGljayZuYnNwOyZuYnNwOzxkaXYgY2xhc3M9J20tZWRpdG9yLW1pZGRsZS1kaXYtaWNvbiBzdGF0aWMgZ3JvdXAtc2VsZWN0ZWQnPjwvZGl2PiZuYnNwOyZuYnNwO3RvIGFkZCBuZXcgZWRnZXM8L2Rpdj5cIixcbiAgICBjbGlja1RvRHJhd0lubmVyRWRnZXM6IFwiY2xpY2sgdG8gZHJhdyBpbm5lciBlZGdlc1wiLFxuICAgIGNsaWNrVG9Kb2luRWRnZXM6IFwiY2xpY2sgdG8gam9pbiBlZGdlc1wiLFxuICAgIGNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzOiBcIjxkaXY+Y2xpY2smbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDs8ZGl2IGNsYXNzPSdtLWVkaXRvci1kaXYtaWNvbiBzdGF0aWMgZ3JvdXAtc2VsZWN0ZWQnPjwvZGl2PiZuYnNwOyZuYnNwO3RvIHJlbW92ZSBlZGdlJm5ic3A7Jm5ic3A7b3ImbmJzcDsmbmJzcDs8aSBjbGFzcz0nZmEgZmEtdHJhc2gnPjwvaT4mbmJzcDsmbmJzcDt0byByZW1vdmUgYWxsIHNlbGVjdGVkIGVkZ2VzPC9kaXY+XCIsXG4gICAgY2xpY2tUb1NlbGVjdEVkZ2VzOiBcIjxkaXY+Y2xpY2smbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDs8ZGl2IGNsYXNzPSdtLWVkaXRvci1kaXYtaWNvbiBzdGF0aWMnPjwvZGl2PiZuYnNwOy8mbmJzcDs8ZGl2IGNsYXNzPSdtLWVkaXRvci1taWRkbGUtZGl2LWljb24gc3RhdGljJz48L2Rpdj4mbmJzcDsmbmJzcDt0byBzZWxlY3QgZWRnZXM8L2Rpdj5cIixcbiAgICBkYmxjbGlja1RvSm9pbkVkZ2VzOiBcImRvdWJsZSBjbGljayB0byBqb2luIGVkZ2VzXCIsXG4gICAgY2xpY2tUb1N0YXJ0RHJhd1BvbHlnb25Pbk1hcDogXCJjbGljayB0byBzdGFydCBkcmF3IHBvbHlnb24gb24gbWFwXCIsXG4gICAgZGVsZXRlU2VsZWN0ZWRFZGdlczogXCJkZWxldGVkIHNlbGVjdGVkIGVkZ2VzXCIsXG4gICAgcmVqZWN0Q2hhbmdlczogXCJyZWplY3QgY2hhbmdlc1wiLFxuICAgIGpzb25XYXNMb2FkZWQ6IFwiSlNPTiB3YXMgbG9hZGVkXCIsXG4gICAgY2hlY2tKc29uOiBcImNoZWNrIEpTT05cIixcbiAgICBsb2FkSnNvbjogXCJsb2FkIEdlb0pTT05cIixcbiAgICBmb3JnZXRUb1NhdmU6IFwiU2F2ZSBjaGFuZ2VzIGJ5IHByZXNzaW5nIG91dHNpZGUgb2YgcG9seWdvblwiXG4gIH0sXG4gIHdvcmxkQ29weUp1bXA6IHRydWVcbn07XG5cbmV4cG9ydCB2YXIgZHJhd0xpbmVTdHlsZSA9IHtcbiAgb3BhY2l0eTogMC43LFxuICBmaWxsOiBmYWxzZSxcbiAgZmlsbENvbG9yOiBkcmF3Q29sb3IsXG4gIGNvbG9yOiBkcmF3Q29sb3IsXG4gIHdlaWdodDogd2VpZ2h0LFxuICBkYXNoQXJyYXk6ICc1LCAxMCcsXG4gIHN0cm9rZTogdHJ1ZSxcbiAgY2xpY2thYmxlOiBmYWxzZVxufTsiLCJBcnJheS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIHRoaXMuc3BsaWNlKHRvLCAwLCB0aGlzLnNwbGljZShmcm9tLCAxKVswXSk7XG59O1xuQXJyYXkucHJvdG90eXBlLl9lYWNoID0gZnVuY3Rpb24oZnVuYykge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGZ1bmMuY2FsbCh0aGlzLCB0aGlzW2ldLCBpKTtcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IEFycmF5O1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBpc01vYmlsZUJyb3dzZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2hlY2sgPSBmYWxzZTtcbiAgICAoZnVuY3Rpb24gKGEpIHtcbiAgICAgIGlmICgvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vfGFuZHJvaWR8aXBhZHxwbGF5Ym9va3xzaWxrL2kudGVzdChhKSB8fCAvMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298c1xcLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXxcXC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YndcXC0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbVxcLXxjZWxsfGNodG18Y2xkY3xjbWRcXC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGNcXC1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfFxcLWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseShcXC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2ZcXC01fGdcXC1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkXFwtKG18cHx0KXxoZWlcXC18aGkocHR8dGEpfGhwKCBpfGlwKXxoc1xcLWN8aHQoYyhcXC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpXFwtKDIwfGdvfG1hKXxpMjMwfGlhYyggfFxcLXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djXFwtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fFxcLVthLXddKXxsaWJ3fGx5bnh8bTFcXC13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bVxcLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KFxcLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pXFwtfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3xcXC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG5cXC0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHRcXC1nfHFhXFwtYXxxYygwN3wxMnwyMXwzMnw2MHxcXC1bMi03XXxpXFwtKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aFxcLXxvb3xwXFwtKXxzZGtcXC98c2UoYyhcXC18MHwxKXw0N3xtY3xuZHxyaSl8c2doXFwtfHNoYXJ8c2llKFxcLXxtKXxza1xcLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aFxcLXx2XFwtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsXFwtfHRkZ1xcLXx0ZWwoaXxtKXx0aW1cXC18dFxcLW1vfHRvKHBsfHNoKXx0cyg3MHxtXFwtfG0zfG01KXx0eFxcLTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfFxcLXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoXFwtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzXFwtfHlvdXJ8emV0b3x6dGVcXC0vaS50ZXN0KGEuc3Vic3RyKDAsIDQpKSkge1xuICAgICAgICBjaGVjayA9IHRydWU7XG4gICAgICB9XG4gICAgfSkobmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8IHdpbmRvdy5vcGVyYSk7XG4gICAgcmV0dXJuIGNoZWNrO1xuICB9XG59OyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcbiAgTC5Db250cm9sLlNlYXJjaCA9IEwuQ29udHJvbC5leHRlbmQoe1xuICAgIG9wdGlvbnM6IHtcbiAgICAgIHBvc2l0aW9uOiAndG9wbGVmdCcsXG4gICAgICB0aXRsZTogJ3NlYXJjaCBsb2NhdGlvbicsXG4gICAgICBlbWFpbDogJydcbiAgICB9LFxuXG4gICAgb25BZGQgKG1hcCkge1xuICAgICAgdGhpcy5fbWFwID0gbWFwO1xuICAgICAgdmFyIGNvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWJhciBsZWFmbGV0LXNlYXJjaC1iYXInKTtcbiAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICB2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnJywgd3JhcHBlcik7XG4gICAgICBsaW5rLmhyZWYgPSAnIyc7XG5cbiAgICAgIHZhciBzdG9wID0gTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb247XG4gICAgICBMLkRvbUV2ZW50XG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ21vdXNlZG93bicsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnZGJsY2xpY2snLCBzdG9wKVxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdClcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIHRoaXMuX3RvZ2dsZSwgdGhpcyk7XG5cbiAgICAgIGxpbmsuYXBwZW5kQ2hpbGQoTC5Eb21VdGlsLmNyZWF0ZSgnaScsICdmYSBmYS1zZWFyY2gnKSk7XG5cbiAgICAgIHZhciBmb3JtID0gdGhpcy5fZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcblxuICAgICAgdmFyIGlucHV0ID0gdGhpcy5faW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuXG4gICAgICBMLkRvbUV2ZW50Lm9uKGlucHV0LCAnY2xpY2snLCBzdG9wKTtcblxuICAgICAgZm9ybS5hcHBlbmRDaGlsZChpbnB1dCk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24oZm9ybSwgJ3N1Ym1pdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fZG9TZWFyY2goaW5wdXQudmFsdWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCB0aGlzKS5vbihmb3JtLCAnc3VibWl0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cblxuICAgICAgdGhpcy5fbWFwLm9uKCdsb2FkQnRuT3BlbmVkJywgdGhpcy5fY29sbGFwc2UsIHRoaXMpO1xuXG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKGNvbnRhaW5lciwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoY29udGFpbmVyLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcblxuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9LFxuXG4gICAgX3RvZ2dsZSAoKSB7XG4gICAgICBpZiAodGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ICE9ICdibG9jaycpIHtcbiAgICAgICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgdGhpcy5faW5wdXQuZm9jdXMoKTtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ3NlYXJjaEVuYWJsZWQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgICAgIHRoaXMuX21hcC5maXJlKCdzZWFyY2hEaXNhYmxlZCcpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY29sbGFwc2UgKCkge1xuICAgICAgdGhpcy5fZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgdGhpcy5faW5wdXQudmFsdWUgPSAnJztcbiAgICB9LFxuXG4gICAgX25vbWluYXRpbUNhbGxiYWNrIChyZXN1bHRzKSB7XG5cbiAgICAgIGlmICh0aGlzLl9yZXN1bHRzKSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdHMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9yZXN1bHRzKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3VsdHNDb250YWluZXIgPSB0aGlzLl9yZXN1bHRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9ICc4MHB4JztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUub3ZlcmZsb3dZID0gJ2F1dG8nO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1ggPSAnaGlkZGVuJztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUubWFyZ2luID0gJzNweCc7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLnBhZGRpbmcgPSAnMnB4JztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYm9yZGVyID0gJzJweCBncmV5IHNvbGlkJztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzJweCc7XG5cbiAgICAgIHZhciBkaXZSZXN1bHRzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGl2ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ3NlYXJjaC1yZXN1bHRzLWVsJyk7XG4gICAgICAgIGRpdi5pbm5lclRleHQgPSByZXN1bHRzW2ldLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgZGl2LnRpdGxlID0gcmVzdWx0c1tpXS5kaXNwbGF5X25hbWU7XG4gICAgICAgIHJlc3VsdHNDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgICB2YXIgY2FsbGJhY2sgPSAoZnVuY3Rpb24gKG1hcCwgcmVzdWx0LCBkaXZFbCkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRpdlJlc3VsdHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKGRpdlJlc3VsdHNbal0sICdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKGRpdkVsLCAnc2VsZWN0ZWQnKTtcblxuICAgICAgICAgICAgdmFyIGJib3ggPSByZXN1bHQuYm91bmRpbmdib3g7XG4gICAgICAgICAgICBtYXAuZml0Qm91bmRzKEwubGF0TG5nQm91bmRzKFtbYmJveFswXSwgYmJveFsyXV0sIFtiYm94WzFdLCBiYm94WzNdXV0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0odGhpcy5fbWFwLCByZXN1bHRzW2ldLCBkaXYpKTtcblxuICAgICAgICBMLkRvbUV2ZW50Lm9uKGRpdiwgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnbW91c2V3aGVlbCcsIEwuRG9tRXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAgIC5vbihkaXYsICdjbGljaycsIGNhbGxiYWNrKTtcblxuICAgICAgICBkaXZSZXN1bHRzLnB1c2goZGl2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZm9ybS5hcHBlbmRDaGlsZChyZXN1bHRzQ29udGFpbmVyKTtcblxuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdHMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9yZXN1bHRzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2NhbGxiYWNrSWQ6IDAsXG5cbiAgICBfZG9TZWFyY2ggKHF1ZXJ5KSB7XG4gICAgICB2YXIgY2FsbGJhY2sgPSAnX2xfb3NtZ2VvY29kZXJfJyArIHRoaXMuX2NhbGxiYWNrSWQrKztcbiAgICAgIHdpbmRvd1tjYWxsYmFja10gPSBMLlV0aWwuYmluZCh0aGlzLl9ub21pbmF0aW1DYWxsYmFjaywgdGhpcyk7XG4gICAgICB2YXIgcXVlcnlQYXJhbXMgPSB7XG4gICAgICAgIHE6IHF1ZXJ5LFxuICAgICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAnanNvbl9jYWxsYmFjayc6IGNhbGxiYWNrXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lbWFpbClcbiAgICAgICAgcXVlcnlQYXJhbXMuZW1haWwgPSB0aGlzLm9wdGlvbnMuZW1haWw7XG4gICAgICBpZiAodGhpcy5fbWFwLmdldEJvdW5kcygpKVxuICAgICAgICBxdWVyeVBhcmFtcy52aWV3Ym94ID0gdGhpcy5fbWFwLmdldEJvdW5kcygpLnRvQkJveFN0cmluZygpO1xuICAgICAgdmFyIHVybCA9ICdodHRwOi8vbm9taW5hdGltLm9wZW5zdHJlZXRtYXAub3JnL3NlYXJjaCcgKyBMLlV0aWwuZ2V0UGFyYW1TdHJpbmcocXVlcnlQYXJhbXMpO1xuICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgfSxcbiAgICBfb25Nb3VzZU92ZXIgKCkge1xuICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIubXNnKHRoaXMub3B0aW9ucy50aXRsZSk7XG4gICAgfSxcbiAgICBfb25Nb3VzZU91dCAoKSB7XG4gICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfVxuICB9KTtcblxuICBMLmNvbnRyb2wuc2VhcmNoID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEwuQ29udHJvbC5TZWFyY2gob3B0aW9ucyk7XG4gIH07XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9iamVjdCA9IHt9LCBhcnJheSA9IFtdKSB7XG4gIHZhciByc2x0ID0gb2JqZWN0O1xuXG4gIHZhciB0bXA7XG4gIHZhciBfZnVuYyA9IGZ1bmN0aW9uIChpZCwgaW5kZXgpIHtcbiAgICB2YXIgcG9zaXRpb24gPSByc2x0W2lkXS5wb3NpdGlvbjtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHBvc2l0aW9uICE9PSBpbmRleCkge1xuICAgICAgICB0bXAgPSByc2x0W2lkXTtcbiAgICAgICAgcnNsdFtpZF0gPSByc2x0W2FycmF5W3Bvc2l0aW9uXV07XG4gICAgICAgIHJzbHRbYXJyYXlbcG9zaXRpb25dXSA9IHRtcDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uICE9IGluZGV4KSB7XG4gICAgICAgIF9mdW5jLmNhbGwobnVsbCwgaWQsIGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGFycmF5LmZvckVhY2goX2Z1bmMpO1xuXG4gIHJldHVybiByc2x0O1xufTsiLCJleHBvcnQgZGVmYXVsdCBMLk11bHRpUG9seWdvbi5leHRlbmQoe1xuICBpbml0aWFsaXplIChsYXRsbmdzLCBvcHRpb25zKSB7XG4gICAgTC5NdWx0aVBvbHlnb24ucHJvdG90eXBlLmluaXRpYWxpemUuY2FsbCh0aGlzLCBsYXRsbmdzLCBvcHRpb25zKTtcblxuICAgIHRoaXMub24oJ2xheWVyYWRkJywgKGUpID0+IHtcbiAgICAgIHZhciBtVmlld1N0eWxlID0gdGhpcy5fbWFwLm9wdGlvbnMuc3R5bGUudmlldztcbiAgICAgIGUudGFyZ2V0LnNldFN0eWxlKCQuZXh0ZW5kKHtcbiAgICAgICAgb3BhY2l0eTogMC43LFxuICAgICAgICBmaWxsT3BhY2l0eTogMC4zNSxcbiAgICAgICAgY29sb3I6ICcjMDBBQkZGJ1xuICAgICAgfSwgbVZpZXdTdHlsZSkpO1xuXG4gICAgICB0aGlzLl9tYXAuX21vdmVFUG9seWdvbk9uVG9wKCk7XG4gICAgfSk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICBMLk11bHRpUG9seWdvbi5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgdGhpcy5vbignbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoIWVNYXJrZXJzR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgICAgICBtYXAuZmlyZSgnZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpO1xuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuaXNFbXB0eSgpKSB7XG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZighZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIHRoaXMub2ZmKCdtb3VzZW92ZXInKTtcbiAgICB0aGlzLm9mZignbW91c2VvdXQnKTtcblxuICAgIG1hcC5vZmYoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgbWFwLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW91dCcpO1xuICB9XG59KTsiXX0=
