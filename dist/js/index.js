(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jsMap = require('../js/map');

var _jsMap2 = _interopRequireDefault(_jsMap);

window.MapEditor = _jsMap2['default'];

},{"../js/map":20}],2:[function(require,module,exports){
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
    var layer = arguments[0] === undefined ? this._selectedVLayer : arguments[0];

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
    console.log('mode: ', this._modeType);
    console.log('eLen - ' + this.getEGroup().getLayers().length);
    console.log('vLen - ' + this.getVGroup().getLayers().length);
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

    if (mode === 'afterDraw') {
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
    if (this.isMode('draw')) {
      this._convertToEdit(this.getEMarkersGroup()); // set 'edit' polygon
      this._addEPolygon_To_VGroup();
    }
    this.clear();
    //this._setMode('view');

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
    this.getEMarkersGroup().getDELine().clear();

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
  /**
   * Used in 'edit/hooks/events'
   * @private
   */
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
        this.fire('editor:intersection_detected', { intersection: true });
      } else {
        this.fire('editor:intersection_detected', { intersection: false });
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

},{"./draw/events":4,"./edit/polygon":10}],3:[function(require,module,exports){
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

},{"../options":22}],4:[function(require,module,exports){
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

},{"../marker-icons":21}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (_this) {};

module.exports = exports["default"];

//  return () => {
//  var group = this.getEGroup();
//
//  var self = this;
//  group.on('layeradd', function (e) {
//    e.layer.on('mousedown', function (e) {
//      if (this._map.isMode('edit') && e.target._path) {
//        console.log('diff from actual active layer', self._getActiveEditLayer() !== e.target);
//        if (self._getActiveEditLayer() !== e.target) {
//          var layer = self._getActiveEditLayer() && $(self._getActiveEditLayer()._container);
//
//          if (layer) {
//            L.DomUtil.removeClass(self._getActiveEditLayer()._path, 'edit-polygon');
//          }
//
//          var selectedPath = e.target._path;
//          if(!L.DomUtil.hasClass(selectedPath, 'edit-polygon')) {
//            L.DomUtil.addClass(selectedPath, 'edit-polygon');
//          }
//
//          self._setActiveEditLayer(e.target);
//
//          //self.getELineGroup().clearLayers();
//          self.getEMarkersGroup().clearLayers();
//          //self.getEMarkersGroup().getELineGroup().clearLayers();
//          self.getEHMarkersGroup().clearLayers();
//
//          if (!layer) {
//            layer = $(e.target._container.parentElement).children().last();
//          }
//          if (e.target._container !== layer[0]) {
//            $(e.target._container).detach().insertAfter(layer);
//          }
//
//          self.restoreEPolygon(e.target);
//
//          self._fitEBounds();
//        }
//        // reset marker selection
//        self.getEMarkersGroup().resetSelected();
//
//        self.$.trigger('change_edited_polygon');
//      }
//    });
//  });
//}

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

      _utilsSortByPosition2['default'](this._layers, idArray);
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

    var options = arguments[2] === undefined ? {} : arguments[2];

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
    var options = arguments[1] === undefined ? { isHoleMarker: true, holePosition: {} } : arguments[1];

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
    console.log('layers - ', layers);

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

},{"../draw/dashed-line":3,"../edit/line":7,"../edit/marker":9,"../extended/BaseMarkerGroup":11,"../marker-icons":21,"../utils/sortByPosition":26}],9:[function(require,module,exports){
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

if (userAgent.indexOf('ipad') !== -1 || userAgent.indexOf('iphone') !== -1) {
  size = 2;
}

var tooltip;
var dragend = false;

exports['default'] = L.Marker.extend({
  _draggable: undefined, // an instance of L.Draggable
  _oldLatLngState: undefined,
  initialize: function initialize(group, latlng) {
    var options = arguments[2] === undefined ? {} : arguments[2];

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
        console.log(e.target);
        var hasIntersection = mGroup.hasIntersection(latlng);

        if (hasIntersection) {
          map._showIntersectionError(latlng);
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

      if (_this2._hasFirstIcon() && _this2._mGroup.hasIntersection(_this2.getLatLng(), true)) {
        _this2._map.edgesIntersected(false);
        _this2._map._showIntersectionError();
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
          _this2._map._msgContainer.msg(_this2._map.options.text.clickToAddNewEdges);
        } else {
          _this2._map._msgContainer.msg(_this2._map.options.text.clickToRemoveAllSelectedEdges);
        }

        return;
      }

      if (_this2.isMiddle()) {
        //add edge
        mGroup.setMiddleMarkers(_this2.position);
        _this2._resetIcon(_markerIcons.icon);
        mGroup.select();
        _this2._map._msgContainer.msg(_this2._map.options.text.clickToRemoveAllSelectedEdges);
      } else {
        //remove edge
        if (!mGroup.getFirst()._hasFirstIcon() && !dragend) {
          mGroup._map._msgContainer.hide();

          var rsltIntersection = _this2._detectIntersection({ target: { _latlng: mGroup._getMiddleLatLng(_this2.prev(), _this2.next()) } });

          if (rsltIntersection) {
            _this2.resetStyle();
            _this2._map._showIntersectionError(_this2._map.options.text.deletePointIntersection);
            _this2._previewErrorLine();
            return;
          }

          var oldLatLng = _this2.getLatLng();

          var nextMarker = _this2.next();
          mGroup.removeMarker(_this2);

          if (!mGroup.isEmpty()) {
            var newLatLng = nextMarker._prev.getLatLng();

            if (newLatLng.lat === oldLatLng.lat && newLatLng.lng === oldLatLng.lng) {
              mGroup._map._msgContainer.msg(_this2._map.options.text.clickToAddNewEdges);
            }

            mGroup.setSelected(nextMarker);
          } else {
            mGroup._map._msgContainer.hide();
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
              tmpArray.push('');
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
            tmpArray.push('');
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

},{"../extended/Tooltip":16,"../marker-icons":21}],10:[function(require,module,exports){
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

    this.options.className = 'leaflet-clickable polygon';
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

},{"../extended/Polygon":15,"../extended/Tooltip":16}],11:[function(require,module,exports){
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

},{"../edit/marker":9,"../utils/sortByPosition":26}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = L.Control.extend({
  options: {
    position: 'topleft',
    btns: [],
    eventName: 'controlAdded'
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
        btn.className += ' last';
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

//{'title': 'remove', 'className': 'fa fa-trash'}

},{}],13:[function(require,module,exports){
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
    submitBtn.type = 'submit';
    submitBtn.innerText = 'submit';

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

      map._msgContainer.msg(map.options.text.jsonWasLoaded, 'success');

      map.createEditPolygon(json);

      this._timeout = setTimeout(function () {
        _this2._map._msgContainer.hide();
      }, 2000);

      this._collapse();
    } catch (e) {
      map._msgContainer.msg(map.options.text.checkJson, 'error');

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

},{"./BtnControl":12}],14:[function(require,module,exports){
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
      var width = controlCorner.children.item().children[0].clientWidth;
      if (width) {
        controlCorner.style.left = (map._container.clientWidth - width) / 2 + 'px';
      }
    }
  },
  _bindEvents: function _bindEvents(map) {
    var _this2 = this;

    window.addEventListener('resize', function () {
      _this2._changePos(map);
    });
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

},{}],15:[function(require,module,exports){
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
    this._container.innerHTML = '<span>' + this._text + '</span>';
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
    var type = arguments[1] === undefined ? 'info' : arguments[1];

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

    map.on('editor:marker_group_select', function () {
      L.DomUtil.removeClass(_this._btn, 'disabled');

      L.DomEvent.addListener(_this._btn, 'mouseover', _this._onMouseOver, _this);
      L.DomEvent.addListener(_this._btn, 'mouseout', _this._onMouseOut, _this);
    });

    map.on('editor:start_add_new_polygon', function () {
      L.DomUtil.removeClass(_this._btn, 'disabled');

      L.DomEvent.addListener(_this._btn, 'mouseover', _this._onMouseOver, _this);
      L.DomEvent.addListener(_this._btn, 'mouseout', _this._onMouseOut, _this);
    });

    map.on('editor:marker_group_clear', this._disableBtn, this);
    map.on('editor:delete_polygon', this._disableBtn, this);
    map.on('editor:delete_hole', this._disableBtn, this);
    map.on('editor:map_cleared', this._disableBtn, this);

    return _BtnControl2['default'].prototype.onAdd.call(this, map);
  },
  _disableBtn: function _disableBtn() {
    L.DomUtil.addClass(this._btn, 'disabled');

    L.DomEvent.removeListener(this._btn, 'mouseover', this._onMouseOver);
    L.DomEvent.removeListener(this._btn, 'mouseout', this._onMouseOut);
  },
  _onPressBtn: function _onPressBtn() {
    var map = this._map;
    if (map.getEMarkersGroup().getLayers()[0]._isFirst) {
      map.clear();
      map.mode('draw');
    } else {
      var selectedMGroup = map.getSelectedMGroup();
      selectedMGroup.remove();
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

},{"./BtnControl":12}],18:[function(require,module,exports){
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

  _utilsSearch2['default']();

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

},{"../extended/BtnControl":12,"../extended/LoadBtn":13,"../extended/MsgHelper":14,"../extended/TrashBtn":17,"../utils/mobile":24,"../utils/search":25}],19:[function(require,module,exports){
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

},{"./draw/dashed-line":3,"./edit/holesGroup":5,"./edit/line":7,"./edit/marker-group":8,"./edit/polygon":10,"./view/group":27}],20:[function(require,module,exports){
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

var _editHooksEvents = require('./edit/hooks/events');

var _editHooksEvents2 = _interopRequireDefault(_editHooksEvents);

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
  map.addInitHook(_editHooksEvents2['default']);

  return map;
}

exports['default'] = map();
module.exports = exports['default'];

},{"./base":2,"./edit/hooks/events":6,"./hooks/controls":18,"./layers":19,"./options":22,"./utils/array":23}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _utilsMobile = require("./utils/mobile");

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

},{"./utils/mobile":24}],22:[function(require,module,exports){
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
    removePolygon: 'remove polygon',
    removePoint: 'remove point'
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
    intersection: 'Self-intersection is prohibited',
    deletePointIntersection: 'Deletion of point is not possible. Self-intersection is prohibited',
    removePolygon: 'Remove polygon',
    clickToEdit: 'click to edit',
    clickToAddNewEdges: '<div>click&nbsp;&nbsp;<div class=\'m-editor-middle-div-icon static group-selected\'></div>&nbsp;&nbsp;to add new edges</div>',
    clickToDrawInnerEdges: 'click to draw inner edges',
    clickToJoinEdges: 'click to join edges',
    clickToRemoveAllSelectedEdges: '<div>click&nbsp;&nbsp;&nbsp;&nbsp;<div class=\'m-editor-div-icon static group-selected\'></div>&nbsp;&nbsp;to remove edge&nbsp;&nbsp;or&nbsp;&nbsp;<i class=\'fa fa-trash\'></i>&nbsp;&nbsp;to remove all selected edges</div>',
    clickToSelectEdges: '<div>click&nbsp;&nbsp;&nbsp;&nbsp;<div class=\'m-editor-div-icon static\'></div>&nbsp;/&nbsp;<div class=\'m-editor-middle-div-icon static\'></div>&nbsp;&nbsp;to select edges</div>',
    dblclickToJoinEdges: 'double click to join edges',
    clickToStartDrawPolygonOnMap: 'click to start draw polygon on map',
    deleteSelectedEdges: 'deleted selected edges',
    rejectChanges: 'reject changes',
    jsonWasLoaded: 'JSON was loaded',
    checkJson: 'check JSON',
    loadJson: 'load GeoJSON'
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function () {
  var object = arguments[0] === undefined ? {} : arguments[0];
  var array = arguments[1] === undefined ? [] : arguments[1];

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

},{}],27:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvb2xlZy9XZWJzdG9ybVByb2plY3RzL21hcC1lZGl0b3ItbmV3LXZlcnNpb24vc3JjL2pzL2luZGV4LmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9iYXNlLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9kcmF3L2Rhc2hlZC1saW5lLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9kcmF3L2V2ZW50cy5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvZWRpdC9ob2xlc0dyb3VwLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9lZGl0L2hvb2tzL2V2ZW50cy5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvZWRpdC9saW5lLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9lZGl0L21hcmtlci1ncm91cC5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvZWRpdC9tYXJrZXIuanMiLCIvVXNlcnMvb2xlZy9XZWJzdG9ybVByb2plY3RzL21hcC1lZGl0b3ItbmV3LXZlcnNpb24vc3JjL2pzL2VkaXQvcG9seWdvbi5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvZXh0ZW5kZWQvQmFzZU1hcmtlckdyb3VwLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9leHRlbmRlZC9CdG5Db250cm9sLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9leHRlbmRlZC9Mb2FkQnRuLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9leHRlbmRlZC9Nc2dIZWxwZXIuanMiLCIvVXNlcnMvb2xlZy9XZWJzdG9ybVByb2plY3RzL21hcC1lZGl0b3ItbmV3LXZlcnNpb24vc3JjL2pzL2V4dGVuZGVkL1BvbHlnb24uanMiLCIvVXNlcnMvb2xlZy9XZWJzdG9ybVByb2plY3RzL21hcC1lZGl0b3ItbmV3LXZlcnNpb24vc3JjL2pzL2V4dGVuZGVkL1Rvb2x0aXAuanMiLCIvVXNlcnMvb2xlZy9XZWJzdG9ybVByb2plY3RzL21hcC1lZGl0b3ItbmV3LXZlcnNpb24vc3JjL2pzL2V4dGVuZGVkL1RyYXNoQnRuLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9ob29rcy9jb250cm9scy5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvbGF5ZXJzLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy9tYXAuanMiLCIvVXNlcnMvb2xlZy9XZWJzdG9ybVByb2plY3RzL21hcC1lZGl0b3ItbmV3LXZlcnNpb24vc3JjL2pzL21hcmtlci1pY29ucy5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvb3B0aW9ucy5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvdXRpbHMvYXJyYXkuanMiLCIvVXNlcnMvb2xlZy9XZWJzdG9ybVByb2plY3RzL21hcC1lZGl0b3ItbmV3LXZlcnNpb24vc3JjL2pzL3V0aWxzL21vYmlsZS5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvdXRpbHMvc2VhcmNoLmpzIiwiL1VzZXJzL29sZWcvV2Vic3Rvcm1Qcm9qZWN0cy9tYXAtZWRpdG9yLW5ldy12ZXJzaW9uL3NyYy9qcy91dGlscy9zb3J0QnlQb3NpdGlvbi5qcyIsIi9Vc2Vycy9vbGVnL1dlYnN0b3JtUHJvamVjdHMvbWFwLWVkaXRvci1uZXctdmVyc2lvbi9zcmMvanMvdmlldy9ncm91cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7cUJDQXNCLFdBQVc7Ozs7QUFFakMsTUFBTSxDQUFDLFNBQVMscUJBQVksQ0FBQzs7Ozs7Ozs7Ozs7MEJDRk4sZUFBZTs7OzsyQkFDZCxnQkFBZ0I7Ozs7cUJBRXpCLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDdEIsaUJBQWUsRUFBRSxTQUFTO0FBQzFCLGlCQUFlLEVBQUUsU0FBUztBQUMxQixvQkFBa0IsRUFBRSxTQUFTO0FBQzdCLDJCQUF5QixFQUFFLEtBQUs7QUFDaEMsV0FBUyxFQUFFLE1BQU07QUFDakIsZ0JBQWMsRUFBRSxTQUFTO0FBQ3pCLG9CQUFrQixFQUFDLDhCQUFHO0FBQ3BCLFdBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztHQUM3QjtBQUNELG9CQUFrQixFQUFDLDRCQUFDLEtBQUssRUFBRTtBQUN6QixRQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztHQUM5QjtBQUNELHNCQUFvQixFQUFDLGdDQUFHO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO0dBQ2xDO0FBQ0QscUJBQW1CLEVBQUMsNkJBQUMsS0FB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QUUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUM1QyxhQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDMUM7T0FDRjtLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0QsVUFBUSxFQUFDLGtCQUFDLEdBQUcsRUFBRTtBQUNiLFFBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckIsT0FBRyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3pDLE9BQUcsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztHQUN6QztDQUNGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1hcEVkaXRvciBmcm9tICcuLi9qcy9tYXAnO1xuXG53aW5kb3cuTWFwRWRpdG9yID0gTWFwRWRpdG9yOyIsImltcG9ydCBEcmF3RXZlbnRzIGZyb20gJy4vZHJhdy9ldmVudHMnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcblxuZXhwb3J0IGRlZmF1bHQgJC5leHRlbmQoe1xuICBfc2VsZWN0ZWRNYXJrZXI6IHVuZGVmaW5lZCxcbiAgX3NlbGVjdGVkVkxheWVyOiB1bmRlZmluZWQsXG4gIF9vbGRTZWxlY3RlZE1hcmtlcjogdW5kZWZpbmVkLFxuICBfX3BvbHlnb25FZGdlc0ludGVyc2VjdGVkOiBmYWxzZSxcbiAgX21vZGVUeXBlOiAnZHJhdycsXG4gIF9jb250cm9sTGF5ZXJzOiB1bmRlZmluZWQsXG4gIF9nZXRTZWxlY3RlZFZMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkVkxheWVyO1xuICB9LFxuICBfc2V0U2VsZWN0ZWRWTGF5ZXIgKGxheWVyKSB7XG4gICAgdGhpcy5fc2VsZWN0ZWRWTGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2NsZWFyU2VsZWN0ZWRWTGF5ZXIgKCkge1xuICAgIHRoaXMuX3NlbGVjdGVkVkxheWVyID0gdW5kZWZpbmVkO1xuICB9LFxuICBfaGlkZVNlbGVjdGVkVkxheWVyIChsYXllcikge1xuICAgIGxheWVyLmJyaW5nVG9CYWNrKCk7XG5cbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vc2hvdyBsYXN0IGxheWVyXG4gICAgdGhpcy5fc2hvd1NlbGVjdGVkVkxheWVyKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpO1xuICAgIC8vaGlkZVxuICAgIHRoaXMuX3NldFNlbGVjdGVkVkxheWVyKGxheWVyKTtcbiAgICBsYXllci5fcGF0aC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIH0sXG4gIF9zaG93U2VsZWN0ZWRWTGF5ZXIgKGxheWVyID0gdGhpcy5fc2VsZWN0ZWRWTGF5ZXIpIHtcbiAgICBpZiAoIWxheWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxheWVyLl9wYXRoLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcbiAgfSxcbiAgX2FkZEVHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIHZhciBlR3JvdXAgPSB0aGlzLmdldEVHcm91cCgpO1xuXG4gICAgZUdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgIGlmICghbGF5ZXIuaXNFbXB0eSgpKSB7XG4gICAgICAgIHZhciBob2xlcyA9IGxheWVyLl9ob2xlcztcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG4gICAgICAgIGlmICgkLmlzQXJyYXkoaG9sZXMpKSB7XG4gICAgICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgICAgICBsYXRsbmdzID0gW2xhdGxuZ3NdLmNvbmNhdChob2xlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZHcm91cC5hZGRMYXllcihMLnBvbHlnb24obGF0bG5ncykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfYWRkRVBvbHlnb25fVG9fVkdyb3VwICgpIHtcbiAgICB2YXIgdkdyb3VwID0gdGhpcy5nZXRWR3JvdXAoKTtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG5cbiAgICB2YXIgaG9sZXMgPSBlUG9seWdvbi5nZXRIb2xlcygpO1xuICAgIHZhciBsYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuXG4gICAgaWYgKGxhdGxuZ3MubGVuZ3RoIDw9IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgaWYgKGhvbGVzKSB7XG4gICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdkdyb3VwLmFkZExheWVyKEwucG9seWdvbihsYXRsbmdzKSk7XG4gIH0sXG4gIF9zZXRFUG9seWdvbl9Ub19WR3JvdXAgKCkge1xuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgc2VsZWN0ZWRWTGF5ZXIgPSB0aGlzLl9nZXRTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgaWYgKCFzZWxlY3RlZFZMYXllcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGVjdGVkVkxheWVyLl9sYXRsbmdzID0gZVBvbHlnb24uZ2V0TGF0TG5ncygpO1xuICAgIHNlbGVjdGVkVkxheWVyLl9ob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG4gICAgc2VsZWN0ZWRWTGF5ZXIucmVkcmF3KCk7XG4gIH0sXG4gIF9jb252ZXJ0X0VHcm91cF9Ub19WR3JvdXAgKCkge1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLl9hZGRFR3JvdXBfVG9fVkdyb3VwKCk7XG4gIH0sXG4gIF9jb252ZXJ0VG9FZGl0IChncm91cCkge1xuICAgIGlmIChncm91cCBpbnN0YW5jZW9mIEwuTXVsdGlQb2x5Z29uKSB7XG4gICAgICB2YXIgZUdyb3VwID0gdGhpcy5nZXRFR3JvdXAoKTtcblxuICAgICAgZUdyb3VwLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAgIGdyb3VwLmVhY2hMYXllcigobGF5ZXIpID0+IHtcbiAgICAgICAgdmFyIGxhdGxuZ3MgPSBsYXllci5nZXRMYXRMbmdzKCk7XG5cbiAgICAgICAgdmFyIGhvbGVzID0gbGF5ZXIuX2hvbGVzO1xuICAgICAgICBpZiAoJC5pc0FycmF5KGhvbGVzKSkge1xuICAgICAgICAgIGxhdGxuZ3MgPSBbbGF0bG5nc10uY29uY2F0KGhvbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGl0UG9seWdvbiA9IG5ldyBFZGl0UG9seWdvbihsYXRsbmdzKTtcbiAgICAgICAgZWRpdFBvbHlnb24uYWRkVG8odGhpcyk7XG4gICAgICAgIGVHcm91cC5hZGRMYXllcihlZGl0UG9seWdvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBlR3JvdXA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdyb3VwIGluc3RhbmNlb2YgTC5NYXJrZXJHcm91cCkge1xuICAgICAgdmFyIGVQb2x5Z29uID0gdGhpcy5nZXRFUG9seWdvbigpO1xuICAgICAgdmFyIGxheWVycyA9IGdyb3VwLmdldExheWVycygpO1xuICAgICAgbGF5ZXJzID0gbGF5ZXJzLmZpbHRlcigobGF5ZXIpID0+ICFsYXllci5pc01pZGRsZSgpKTtcbiAgICAgIHZhciBwb2ludHNBcnJheSA9IGxheWVycy5tYXAoKGxheWVyKSA9PiBsYXllci5nZXRMYXRMbmcoKSk7XG5cbiAgICAgIHZhciBob2xlcyA9IGVQb2x5Z29uLmdldEhvbGVzKCk7XG5cbiAgICAgIGlmIChob2xlcykge1xuICAgICAgICBwb2ludHNBcnJheSA9IFtwb2ludHNBcnJheV0uY29uY2F0KGhvbGVzKTtcbiAgICAgIH1cblxuICAgICAgZVBvbHlnb24uc2V0TGF0TG5ncyhwb2ludHNBcnJheSk7XG4gICAgICBlUG9seWdvbi5yZWRyYXcoKTtcblxuICAgICAgcmV0dXJuIGVQb2x5Z29uO1xuICAgIH1cbiAgfSxcbiAgX3NldE1vZGUgKHR5cGUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAvL3RoaXMuZ2V0Vkdyb3VwKCkuc2V0U3R5bGUob3B0aW9ucy5zdHlsZVt0eXBlXSk7XG4gICAgLy90aGlzLmdldEVHcm91cCgpLnNldFN0eWxlKG9wdGlvbnMuZWRpdEdyb3VwU3R5bGUubW9kZVt0eXBlXSk7XG5cbiAgICAvL2lmICghdGhpcy5pc01vZGUoJ2VkaXQnKSkge1xuICAgIHRoaXMuZ2V0RVBvbHlnb24oKS5zZXRTdHlsZShvcHRpb25zLnN0eWxlW3R5cGVdKTtcbiAgICAvL31cblxuICAgIC8vdGhpcy5fc2V0TWFya2Vyc0dyb3VwSWNvbih0aGlzLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgLy90aGlzLiQudHJpZ2dlcih7dHlwZTogJ21vZGUnLCB2YWx1ZTogdHlwZX0pO1xuICAgIC8vdGhpcy4kLnRyaWdnZXIoe3R5cGU6ICdtb2RlOicgKyB0eXBlfSk7XG4gIH0sXG5cbiAgX2dldE1vZGVUeXBlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZVR5cGU7XG4gIH0sXG4gIF9zZXRNb2RlVHlwZSAodHlwZSkge1xuICAgIHRoaXMuJC5yZW1vdmVDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gICAgdGhpcy5fbW9kZVR5cGUgPSB0eXBlO1xuICAgIHRoaXMuJC5hZGRDbGFzcygnbWFwLScgKyB0aGlzLl9tb2RlVHlwZSk7XG4gICAgY29uc29sZS5sb2coJ21vZGU6ICcsIHRoaXMuX21vZGVUeXBlKTtcbiAgICBjb25zb2xlLmxvZygnZUxlbiAtICcgKyB0aGlzLmdldEVHcm91cCgpLmdldExheWVycygpLmxlbmd0aCk7XG4gICAgY29uc29sZS5sb2coJ3ZMZW4gLSAnICsgdGhpcy5nZXRWR3JvdXAoKS5nZXRMYXllcnMoKS5sZW5ndGgpO1xuICB9LFxuICBfc2V0TWFya2Vyc0dyb3VwSWNvbiAobWFya2VyR3JvdXApIHtcbiAgICB2YXIgbUljb24gPSB0aGlzLm9wdGlvbnMubWFya2VySWNvbjtcbiAgICB2YXIgbUhvdmVySWNvbiA9IHRoaXMub3B0aW9ucy5tYXJrZXJIb3Zlckljb247XG5cbiAgICB2YXIgbW9kZSA9IHRoaXMuX2dldE1vZGVUeXBlKCk7XG4gICAgaWYgKG1JY29uKSB7XG4gICAgICBpZiAoIW1JY29uLm1vZGUpIHtcbiAgICAgICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSWNvbiA9IG1JY29uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGljb24gPSBtSWNvbi5tb2RlW21vZGVdO1xuICAgICAgICBpZiAoaWNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSWNvbiA9IGljb247XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobUhvdmVySWNvbikge1xuICAgICAgaWYgKCFtSG92ZXJJY29uLm1vZGUpIHtcbiAgICAgICAgbWFya2VyR3JvdXAub3B0aW9ucy5tSG92ZXJJY29uID0gbUhvdmVySWNvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpY29uID0gbUhvdmVySWNvblttb2RlXTtcbiAgICAgICAgaWYgKGljb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG1hcmtlckdyb3VwLm9wdGlvbnMubUhvdmVySWNvbiA9IGljb247XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gPSBtYXJrZXJHcm91cC5vcHRpb25zLm1Ib3Zlckljb24gfHwgbWFya2VyR3JvdXAub3B0aW9ucy5tSWNvbjtcblxuICAgIGlmIChtb2RlID09PSBcImFmdGVyRHJhd1wiKSB7XG4gICAgICBtYXJrZXJHcm91cC51cGRhdGVTdHlsZSgpO1xuICAgIH1cbiAgfSxcbiAgLy9tb2RlczogJ3ZpZXcnLCAnZWRpdCcsICdkcmF3JywgJ2xpc3QnXG4gIG1vZGUgKHR5cGUpIHtcbiAgICB0aGlzLmZpcmUodGhpcy5fbW9kZVR5cGUgKyAnX2V2ZW50c19kaXNhYmxlJyk7XG4gICAgdGhpcy5maXJlKHR5cGUgKyAnX2V2ZW50c19lbmFibGUnKTtcblxuICAgIHRoaXMuX3NldE1vZGVUeXBlKHR5cGUpO1xuXG4gICAgaWYgKHR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX21vZGVUeXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jbGVhckV2ZW50cygpO1xuICAgICAgdHlwZSA9IHRoaXNbdHlwZV0oKSB8fCB0eXBlO1xuICAgICAgdGhpcy5fc2V0TW9kZSh0eXBlKTtcbiAgICB9XG4gIH0sXG4gIGlzTW9kZSAodHlwZSkge1xuICAgIHJldHVybiB0eXBlID09PSB0aGlzLl9tb2RlVHlwZTtcbiAgfSxcbiAgLy92aWVldyAoKSB7XG4gIC8vICBpZiAodGhpcy5pc01vZGUoJ2VkaXQnKSB8fCB0aGlzLmlzTW9kZSgnZHJhdycpIHx8IHRoaXMuaXNNb2RlKCdhZnRlckRyYXcnKSkge1xuICAvLyAgICB0aGlzLl9jbGVhck1hcCgpO1xuICAvL1xuICAvLyAgfVxuICAvLyAgdGhpcy5fZml0VkJvdW5kcygpO1xuICAvLyAgdGhpcy5fYmluZFZpZXdFdmVudHMoKTtcbiAgLy99LFxuICBkcmF3ICgpIHtcbiAgICBpZiAodGhpcy5pc01vZGUoJ2VkaXQnKSB8fCB0aGlzLmlzTW9kZSgndmlldycpIHx8IHRoaXMuaXNNb2RlKCdhZnRlckRyYXcnKSkge1xuICAgICAgdGhpcy5fY2xlYXJNYXAoKTtcblxuICAgIH1cbiAgICB0aGlzLl9iaW5kRHJhd0V2ZW50cygpO1xuICB9LFxuICBjYW5jZWwgKCkge1xuICAgIHRoaXMuX2NsZWFyTWFwKCk7XG5cbiAgICB0aGlzLm1vZGUoJ3ZpZXcnKTtcbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHRoaXMuX2NsZWFyRXZlbnRzKCk7XG4gICAgdGhpcy5fY2xlYXJNYXAoKTtcbiAgICB0aGlzLmZpcmUoJ2VkaXRvcjptYXBfY2xlYXJlZCcpO1xuICB9LFxuICBjbGVhckFsbCAoKSB7XG4gICAgdGhpcy5tb2RlKCd2aWV3Jyk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgfSxcbiAgLyoqXG4gICAqXG4gICAqIFRoZSBtYWluIGlkZWEgaXMgdG8gc2F2ZSBFUG9seWdvbiB0byBWR3JvdXAgd2hlbjpcbiAgICogMSkgdXNlciBhZGQgbmV3IHBvbHlnb25cbiAgICogMikgd2hlbiB1c2VyIGVkaXQgcG9seWdvblxuICAgKlxuICAgKiAqL1xuICAgIHNhdmVTdGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKCdkcmF3JykpIHtcbiAgICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQodGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkpOyAvLyBzZXQgJ2VkaXQnIHBvbHlnb25cbiAgICAgIHRoaXMuX2FkZEVQb2x5Z29uX1RvX1ZHcm91cCgpO1xuICAgIH1cbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgLy90aGlzLl9zZXRNb2RlKCd2aWV3Jyk7XG5cbiAgICB2YXIgZ2VvanNvbiA9IHRoaXMuZ2V0Vkdyb3VwKCkudG9HZW9KU09OKCk7XG4gICAgaWYgKGdlb2pzb24uZ2VvbWV0cnkpIHtcbiAgICAgIHJldHVybiBnZW9qc29uLmdlb21ldHJ5O1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGdldFNlbGVjdGVkTWFya2VyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNYXJrZXI7XG4gIH0sXG4gIGNsZWFyU2VsZWN0ZWRNYXJrZXIgKCkge1xuICAgIHRoaXMuX3NlbGVjdGVkTWFya2VyID0gbnVsbDtcbiAgfSxcbiAgcmVtb3ZlU2VsZWN0ZWRNYXJrZXIgKCkge1xuICAgIHZhciBzZWxlY3RlZE1hcmtlciA9IHRoaXMuX3NlbGVjdGVkTWFya2VyO1xuICAgIHZhciBwcmV2TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIucHJldigpO1xuICAgIHZhciBuZXh0TWFya2VyID0gc2VsZWN0ZWRNYXJrZXIubmV4dCgpO1xuICAgIHZhciBtaWRsZVByZXZNYXJrZXIgPSBzZWxlY3RlZE1hcmtlci5fbWlkZGxlUHJldjtcbiAgICB2YXIgbWlkZGxlTmV4dE1hcmtlciA9IHNlbGVjdGVkTWFya2VyLl9taWRkbGVOZXh0O1xuICAgIHNlbGVjdGVkTWFya2VyLnJlbW92ZSgpO1xuICAgIHRoaXMuX3NlbGVjdGVkTWFya2VyID0gbWlkbGVQcmV2TWFya2VyO1xuICAgIHRoaXMuX3NlbGVjdGVkTWFya2VyLnJlbW92ZSgpO1xuICAgIHRoaXMuX3NlbGVjdGVkTWFya2VyID0gbWlkZGxlTmV4dE1hcmtlcjtcbiAgICB0aGlzLl9zZWxlY3RlZE1hcmtlci5yZW1vdmUoKTtcbiAgICBwcmV2TWFya2VyLl9taWRkbGVOZXh0ID0gbnVsbDtcbiAgICBuZXh0TWFya2VyLl9taWRkbGVQcmV2ID0gbnVsbDtcbiAgfSxcbiAgcmVtb3ZlUG9seWdvbiAocG9seWdvbikge1xuICAgIC8vdGhpcy5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIC8vdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuZ2V0RUxpbmVHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICBwb2x5Z29uLmNsZWFyKCk7XG5cbiAgICBpZiAodGhpcy5pc01vZGUoJ2FmdGVyRHJhdycpKSB7XG4gICAgICB0aGlzLm1vZGUoJ2RyYXcnKTtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWRNYXJrZXIoKTtcbiAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgfSxcbiAgY3JlYXRlRWRpdFBvbHlnb24gKGpzb24pIHtcbiAgICB2YXIgZ2VvSnNvbiA9IEwuZ2VvSnNvbihqc29uKTtcblxuICAgIHRoaXMuY2xlYXIoKTtcblxuICAgIHZhciBsYXllcnMgPSBnZW9Kc29uLmdldExheWVycyA/IGdlb0pzb24uZ2V0TGF5ZXJzKCkgOiBbbGF5ZXJdO1xuICAgIHZhciB2R3JvdXAgPSB0aGlzLmdldFZHcm91cCgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgX2wgPSBsYXllcnNbaV07XG4gICAgICB2R3JvdXAuYWRkTGF5ZXIoX2wpO1xuICAgIH1cblxuICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgdGhpcy5fZml0VkJvdW5kcygpO1xuICB9LFxuICBtb3ZlTWFya2VyIChsYXRsbmcpIHtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRTZWxlY3RlZCgpLnNldExhdExuZyhsYXRsbmcpO1xuICB9LFxuICBfZml0VkJvdW5kcyAoKSB7XG4gICAgaWYgKHRoaXMuZ2V0Vkdyb3VwKCkuZ2V0TGF5ZXJzKCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aGlzLmZpdEJvdW5kcyh0aGlzLmdldFZHcm91cCgpLmdldEJvdW5kcygpLCB7cGFkZGluZzogWzMwLCAzMF19KTtcbiAgICAgIC8vdGhpcy5pbnZhbGlkYXRlU2l6ZSgpO1xuICAgIH1cbiAgfSxcbiAgX2NsZWFyTWFwICgpIHtcbiAgICB0aGlzLmdldEVHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gICAgdGhpcy5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuY2xlYXIoKTtcbiAgICB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLl9zaG93U2VsZWN0ZWRWTGF5ZXIoKTtcbiAgICB0aGlzLl9jbGVhclNlbGVjdGVkVkxheWVyKCk7XG4gICAgdGhpcy5jbGVhclNlbGVjdGVkTWFya2VyKCk7XG4gIH0sXG4gIF9jbGVhckV2ZW50cyAoKSB7XG4gICAgLy90aGlzLl91bkJpbmRWaWV3RXZlbnRzKCk7XG4gICAgdGhpcy5fdW5CaW5kRHJhd0V2ZW50cygpO1xuICB9LFxuICBfYWN0aXZlRWRpdExheWVyOiB1bmRlZmluZWQsXG4gIC8qKlxuICAgKiBVc2VkIGluICdlZGl0L2hvb2tzL2V2ZW50cydcbiAgICogQHByaXZhdGVcbiAgICovXG4gICAgX3NldEFjdGl2ZUVkaXRMYXllciAobGF5ZXIpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBsYXllcjtcbiAgfSxcbiAgX2dldEFjdGl2ZUVkaXRMYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUVkaXRMYXllcjtcbiAgfSxcbiAgX2NsZWFyQWN0aXZlRWRpdExheWVyICgpIHtcbiAgICB0aGlzLl9hY3RpdmVFZGl0TGF5ZXIgPSBudWxsO1xuICB9LFxuICBfc2V0RUhNYXJrZXJHcm91cCAoYXJyYXlMYXRMbmcpIHtcbiAgICB2YXIgaG9sZU1hcmtlckdyb3VwID0gbmV3IEwuTWFya2VyR3JvdXAoKTtcbiAgICBob2xlTWFya2VyR3JvdXAuX2lzSG9sZSA9IHRydWU7XG5cbiAgICB0aGlzLl9zZXRNYXJrZXJzR3JvdXBJY29uKGhvbGVNYXJrZXJHcm91cCk7XG5cbiAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgaG9sZU1hcmtlckdyb3VwLmFkZFRvKGVoTWFya2Vyc0dyb3VwKTtcblxuICAgIHZhciBlaE1hcmtlcnNHcm91cExheWVycyA9IGVoTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgdmFyIGhHcm91cFBvcyA9IGVoTWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aCAtIDE7XG4gICAgaG9sZU1hcmtlckdyb3VwLl9wb3NpdGlvbiA9IGhHcm91cFBvcztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMYXRMbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHNldCBob2xlIG1hcmtlclxuICAgICAgaG9sZU1hcmtlckdyb3VwLnNldEhvbGVNYXJrZXIoYXJyYXlMYXRMbmdbaV0sIHVuZGVmaW5lZCwge30sIHtoR3JvdXA6IGhHcm91cFBvcywgaE1hcmtlcjogaX0pO1xuICAgIH1cblxuICAgIHZhciBsYXllcnMgPSBob2xlTWFya2VyR3JvdXAuZ2V0TGF5ZXJzKCk7XG4gICAgbGF5ZXJzLm1hcCgobGF5ZXIsIHBvc2l0aW9uKSA9PiB7XG4gICAgICBob2xlTWFya2VyR3JvdXAuX3NldE1pZGRsZU1hcmtlcnMobGF5ZXIsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHZhciBlUG9seWdvbiA9IHRoaXMuZ2V0RVBvbHlnb24oKTtcbiAgICB2YXIgbGF5ZXJzID0gaG9sZU1hcmtlckdyb3VwLmdldExheWVycygpO1xuXG4gICAgbGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICBlUG9seWdvbi51cGRhdGVIb2xlUG9pbnQoaEdyb3VwUG9zLCBsYXllci5fX3Bvc2l0aW9uLCBsYXllci5fbGF0bG5nKTtcbiAgICB9KTtcblxuICAgIC8vZVBvbHlnb24uc2V0SG9sZSgpXG4gICAgcmV0dXJuIGhvbGVNYXJrZXJHcm91cDtcbiAgfSxcbiAgX21vdmVFUG9seWdvbk9uVG9wICgpIHtcbiAgICB2YXIgZVBvbHlnb24gPSB0aGlzLmdldEVQb2x5Z29uKCk7XG4gICAgaWYgKGVQb2x5Z29uLl9jb250YWluZXIpIHtcbiAgICAgIHZhciBsYXN0Q2hpbGQgPSAkKGVQb2x5Z29uLl9jb250YWluZXIucGFyZW50RWxlbWVudCkuY2hpbGRyZW4oKS5sYXN0KCk7XG4gICAgICB2YXIgJGVQb2x5Z29uID0gJChlUG9seWdvbi5fY29udGFpbmVyKTtcbiAgICAgIGlmICgkZVBvbHlnb25bMF0gIT09IGxhc3RDaGlsZCkge1xuICAgICAgICAkZVBvbHlnb24uZGV0YWNoKCkuaW5zZXJ0QWZ0ZXIobGFzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc3RvcmVFUG9seWdvbiAocG9seWdvbikge1xuICAgIHBvbHlnb24gPSBwb2x5Z29uIHx8IHRoaXMuZ2V0RVBvbHlnb24oKTtcblxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHNldCBtYXJrZXJzXG4gICAgdmFyIGxhdGxuZ3MgPSBwb2x5Z29uLmdldExhdExuZ3MoKTtcblxuICAgIHRoaXMuZ2V0RU1hcmtlcnNHcm91cCgpLnNldEFsbChsYXRsbmdzKTtcblxuICAgIC8vdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2Nvbm5lY3RNYXJrZXJzKCk7XG5cbiAgICAvLyBzZXQgaG9sZSBtYXJrZXJzXG4gICAgdmFyIGhvbGVzID0gcG9seWdvbi5nZXRIb2xlcygpO1xuICAgIGlmIChob2xlcykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBob2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGdldENvbnRyb2xMYXllcnM6ICgpID0+IHRoaXMuX2NvbnRyb2xMYXllcnMsXG4gIGVkZ2VzSW50ZXJzZWN0ZWQgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19wb2x5Z29uRWRnZXNJbnRlcnNlY3RlZCA9IHZhbHVlO1xuICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZmlyZShcImVkaXRvcjppbnRlcnNlY3Rpb25fZGV0ZWN0ZWRcIiwge2ludGVyc2VjdGlvbjogdHJ1ZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5maXJlKFwiZWRpdG9yOmludGVyc2VjdGlvbl9kZXRlY3RlZFwiLCB7aW50ZXJzZWN0aW9uOiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX2Vycm9yVGltZW91dDogbnVsbCxcbiAgX3Nob3dJbnRlcnNlY3Rpb25FcnJvciAodGV4dCkge1xuXG4gICAgaWYgKHRoaXMuX2Vycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Vycm9yVGltZW91dCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbXNnQ29udGFpbmVyLm1zZyh0ZXh0IHx8IHRoaXMub3B0aW9ucy50ZXh0LmludGVyc2VjdGlvbiwgJ2Vycm9yJyk7XG5cbiAgICB0aGlzLl9lcnJvclRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSwgMTAwMCk7XG4gIH1cbn0sIERyYXdFdmVudHMpO1xuIiwiaW1wb3J0ICogYXMgb3B0cyBmcm9tICcuLi9vcHRpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgTC5Qb2x5bGluZS5leHRlbmQoe1xuICBvcHRpb25zOiBvcHRzLmRyYXdMaW5lU3R5bGUsXG4gIF9sYXRsbmdUb01vdmU6IHVuZGVmaW5lZCxcbiAgYWRkTGF0TG5nIChsYXRsbmcpIHtcbiAgICBpZiAodGhpcy5fbGF0bG5nVG9Nb3ZlKSB7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhdGxuZ3MubGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5fbGF0bG5ncy5zcGxpY2UoLTEpO1xuICAgIH1cblxuICAgIHRoaXMuX2xhdGxuZ3MucHVzaChMLmxhdExuZyhsYXRsbmcpKTtcblxuICAgIHJldHVybiB0aGlzLnJlZHJhdygpO1xuICB9LFxuICB1cGRhdGUgKHBvcykge1xuXG4gICAgaWYgKCF0aGlzLl9sYXRsbmdUb01vdmUgJiYgdGhpcy5fbGF0bG5ncy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2xhdGxuZ1RvTW92ZSA9IEwubGF0TG5nKHBvcyk7XG4gICAgICB0aGlzLl9sYXRsbmdzLnB1c2godGhpcy5fbGF0bG5nVG9Nb3ZlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xhdGxuZ1RvTW92ZSkge1xuICAgICAgdGhpcy5fbGF0bG5nVG9Nb3ZlLmxhdCA9IHBvcy5sYXQ7XG4gICAgICB0aGlzLl9sYXRsbmdUb01vdmUubG5nID0gcG9zLmxuZztcblxuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9hZGRMaW5lIChsaW5lLCBncm91cCwgaXNMYXN0TWFya2VyKSB7XG4gICAgaWYgKCFpc0xhc3RNYXJrZXIpIHtcbiAgICAgIGxpbmUuYWRkVG8oZ3JvdXApO1xuICAgIH1cbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHRoaXMuc2V0TGF0TG5ncyhbXSk7XG4gIH1cbn0pOyIsImltcG9ydCB7Zmlyc3RJY29uLGljb24sZHJhZ0ljb24sbWlkZGxlSWNvbixob3Zlckljb24saW50ZXJzZWN0aW9uSWNvbn0gZnJvbSAnLi4vbWFya2VyLWljb25zJztcbmV4cG9ydCBkZWZhdWx0IHtcbiAgX2JpbmREcmF3RXZlbnRzICgpIHtcbiAgICB0aGlzLl91bkJpbmREcmF3RXZlbnRzKCk7XG5cbiAgICAvLyBjbGljayBvbiBtYXBcbiAgICB0aGlzLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAvLyBidWcgZml4XG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50ICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRYID09PSAwICYmIGUub3JpZ2luYWxFdmVudC5jbGllbnRZID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKChlLnRhcmdldCBpbnN0YW5jZW9mIEwuTWFya2VyKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBlTWFya2Vyc0dyb3VwID0gZS50YXJnZXQuZ2V0RU1hcmtlcnNHcm91cCgpO1xuXG4gICAgICAvLyBzdGFydCBhZGQgbmV3IHBvbHlnb25cbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmlzRW1wdHkoKSkge1xuICAgICAgICB0aGlzLl9hZGRNYXJrZXIoZSk7XG5cbiAgICAgICAgdGhpcy5maXJlKCdlZGl0b3I6c3RhcnRfYWRkX25ld19wb2x5Z29uJyk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJTZWxlY3RlZFZMYXllcigpO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgcG9seWdvblxuICAgICAgdmFyIGZpcnN0TWFya2VyID0gZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpO1xuXG4gICAgICBpZiAoZmlyc3RNYXJrZXIgJiYgZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICghKGUudGFyZ2V0IGluc3RhbmNlb2YgTC5NYXJrZXIpKSB7XG4gICAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gc3RhcnQgZHJhdyBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICB2YXIgZWhNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZmlyc3RNYXJrZXIgJiYgIWZpcnN0TWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICBpZiAoKGUudGFyZ2V0LmdldEVQb2x5Z29uKCkuX3BhdGggPT0gZS5vcmlnaW5hbEV2ZW50LnRvRWxlbWVudCkpIHtcbiAgICAgICAgICBpZiAoIWVoTWFya2Vyc0dyb3VwLmdldExhc3RIb2xlKCkpIHtcbiAgICAgICAgICAgIHZhciBsYXN0SEdyb3VwID0gZWhNYXJrZXJzR3JvdXAuYWRkSG9sZUdyb3VwKCk7XG4gICAgICAgICAgICBsYXN0SEdyb3VwLnNldChlLmxhdGxuZywgbnVsbCwge2ljb246IGZpcnN0SWNvbn0pO1xuICAgICAgICAgICAgdGhpcy5jbGVhclNlbGVjdGVkTWFya2VyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29udGludWUgd2l0aCBuZXcgaG9sZSBwb2x5Z29uXG4gICAgICBpZiAoZWhNYXJrZXJzR3JvdXAuZ2V0TGFzdEhvbGUoKSkge1xuICAgICAgICBpZiAodGhpcy5nZXRFTWFya2Vyc0dyb3VwKCkuX2lzTWFya2VySW5Qb2x5Z29uKGUubGF0bG5nKSkge1xuICAgICAgICAgIHZhciBtYXJrZXIgPSBlaE1hcmtlcnNHcm91cC5nZXRMYXN0SG9sZSgpLnNldChlLmxhdGxuZyk7XG4gICAgICAgICAgdmFyIHJzbHQgPSBtYXJrZXIuX2RldGVjdEludGVyc2VjdGlvbigpOyAvLyBpbiBjYXNlIG9mIGhvbGVcbiAgICAgICAgICBpZihyc2x0KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcblxuICAgICAgICAgICAgLy9tYXJrZXIuX21Hcm91cC5yZW1vdmVNYXJrZXIobWFya2VyKTsgLy90b2RvOiBkZXRlY3QgaW50ZXJzZWN0aW9uIGZvciBob2xlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVzZXRcblxuICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgdGhpcy5fc2V0RVBvbHlnb25fVG9fVkdyb3VwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICB0aGlzLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfY2xlYXInKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSBlLm1Hcm91cDtcblxuICAgICAgaWYgKGVNYXJrZXJzR3JvdXAuX2lzSG9sZSkge1xuICAgICAgICB0aGlzLmdldEVITWFya2Vyc0dyb3VwKCkucmVzZXRMYXN0SG9sZSgpO1xuICAgICAgfVxuICAgICAgLy8xLiBzZXQgbWlkZGxlIG1hcmtlcnNcbiAgICAgIHZhciBsYXllcnMgPSBlTWFya2Vyc0dyb3VwLmdldExheWVycygpO1xuXG4gICAgICB2YXIgcG9zaXRpb24gPSAtMTtcbiAgICAgIGxheWVycy5mb3JFYWNoKCgpID0+IHtcbiAgICAgICAgdmFyIG1hcmtlciA9IGVNYXJrZXJzR3JvdXAuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7aWNvbjogbWlkZGxlSWNvbn0pO1xuICAgICAgICBwb3NpdGlvbiA9IG1hcmtlci5wb3NpdGlvbiArIDI7XG4gICAgICB9KTtcblxuICAgICAgLy8yLiBjbGVhciBsaW5lXG4gICAgICBlTWFya2Vyc0dyb3VwLmdldERFTGluZSgpLmNsZWFyKCk7XG5cbiAgICAgIGVNYXJrZXJzR3JvdXAuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIuZHJhZ2dpbmcuZW5hYmxlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy90aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5zZWxlY3QoKTtcblxuICAgICAgZU1hcmtlcnNHcm91cC5zZWxlY3QoKTtcblxuICAgICAgdGhpcy5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5nZXRWR3JvdXAoKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICAgIGlmIChlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkgJiYgZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSAmJiAhZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fYWRkTWFya2VyKGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVzZXRcbiAgICAgICAgaWYgKHRoaXMuX2dldFNlbGVjdGVkVkxheWVyKCkpIHtcbiAgICAgICAgICB0aGlzLl9zZXRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hZGRFUG9seWdvbl9Ub19WR3JvdXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMubW9kZSgnZHJhdycpO1xuXG4gICAgICAgIHRoaXMuX2hpZGVTZWxlY3RlZFZMYXllcihlLmxheWVyKTtcblxuICAgICAgICBlTWFya2Vyc0dyb3VwLnJlc3RvcmUoZS5sYXllcik7XG4gICAgICAgIHRoaXMuX2NvbnZlcnRUb0VkaXQoZU1hcmtlcnNHcm91cCk7XG5cbiAgICAgICAgZU1hcmtlcnNHcm91cC5zZWxlY3QoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpkZWxldGVfbWFya2VyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY29udmVydFRvRWRpdCh0aGlzLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgfSk7XG4gICAgdGhpcy5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgKCkgPT4ge1xuICAgICAgdGhpcy5nZXRFSE1hcmtlcnNHcm91cCgpLnJlbW92ZSgpO1xuICAgIH0pO1xuICB9LFxuICBfYWRkTWFya2VyIChlKSB7XG4gICAgdmFyIGxhdGxuZyA9IGUubGF0bG5nO1xuXG4gICAgdmFyIGVNYXJrZXJzR3JvdXAgPSB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKTtcblxuICAgIHZhciBtYXJrZXIgPSBlTWFya2Vyc0dyb3VwLnNldChsYXRsbmcpO1xuXG4gICAgdGhpcy5fY29udmVydFRvRWRpdChlTWFya2Vyc0dyb3VwKTtcblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH0sXG4gIF91cGRhdGVERUxpbmUgKGxhdGxuZykge1xuICAgIHJldHVybiB0aGlzLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRERUxpbmUoKS51cGRhdGUobGF0bG5nKTtcbiAgfSxcbiAgX3VuQmluZERyYXdFdmVudHMgKCkge1xuICAgIHRoaXMub2ZmKCdjbGljaycpO1xuICAgIHRoaXMuZ2V0Vkdyb3VwKCkub2ZmKCdjbGljaycpO1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuICAgIHRoaXMub2ZmKCdkYmxjbGljaycpO1xuXG4gICAgdGhpcy5nZXRERUxpbmUoKS5jbGVhcigpO1xuXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpqb2luX3BhdGgnKTtcblxuICAgIGlmICh0aGlzLl9vcGVuUG9wdXApIHtcbiAgICAgIHRoaXMub3BlblBvcHVwID0gdGhpcy5fb3BlblBvcHVwO1xuICAgICAgZGVsZXRlIHRoaXMuX29wZW5Qb3B1cDtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0SG9sZTogdW5kZWZpbmVkLFxuICBfbGFzdEhvbGVUb0RyYXc6IHVuZGVmaW5lZCxcbiAgYWRkSG9sZUdyb3VwICgpIHtcbiAgICB0aGlzLl9sYXN0SG9sZSA9IG5ldyBMLk1hcmtlckdyb3VwKCk7XG4gICAgdGhpcy5fbGFzdEhvbGUuX2lzSG9sZSA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEhvbGUuYWRkVG8odGhpcyk7XG5cbiAgICB0aGlzLl9sYXN0SG9sZS5wb3NpdGlvbiA9IHRoaXMuZ2V0TGVuZ3RoKCkgLSAxO1xuXG4gICAgdGhpcy5fbGFzdEhvbGVUb0RyYXcgPSB0aGlzLl9sYXN0SG9sZTtcblxuICAgIHJldHVybiB0aGlzLl9sYXN0SG9sZTtcbiAgfSxcbiAgZ2V0TGVuZ3RoICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXllcnMoKS5sZW5ndGg7XG4gIH0sXG4gIHJlc2V0TGFzdEhvbGUgKCkge1xuICAgIHRoaXMuX2xhc3RIb2xlID0gdW5kZWZpbmVkO1xuICB9LFxuICBnZXRMYXN0SG9sZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RIb2xlO1xuICB9LFxuICByZW1vdmUgKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChob2xlKSA9PiB7XG4gICAgICB3aGlsZSAoaG9sZS5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgaG9sZS5yZW1vdmVNYXJrZXJBdCgwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVwb3MgKHBvc2l0aW9uKSB7XG4gICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICBpZiAobGF5ZXIucG9zaXRpb24gPj0gcG9zaXRpb24pIHtcbiAgICAgICAgbGF5ZXIucG9zaXRpb24gLT0gMTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVzZXRTZWxlY3Rpb24gKCkge1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgICBtYXJrZXIudW5TZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgKF90aGlzKSA9PiB7XG4gIC8vICByZXR1cm4gKCkgPT4ge1xuICAvLyAgdmFyIGdyb3VwID0gdGhpcy5nZXRFR3JvdXAoKTtcbiAgLy9cbiAgLy8gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gIGdyb3VwLm9uKCdsYXllcmFkZCcsIGZ1bmN0aW9uIChlKSB7XG4gIC8vICAgIGUubGF5ZXIub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gIC8vICAgICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2VkaXQnKSAmJiBlLnRhcmdldC5fcGF0aCkge1xuICAvLyAgICAgICAgY29uc29sZS5sb2coJ2RpZmYgZnJvbSBhY3R1YWwgYWN0aXZlIGxheWVyJywgc2VsZi5fZ2V0QWN0aXZlRWRpdExheWVyKCkgIT09IGUudGFyZ2V0KTtcbiAgLy8gICAgICAgIGlmIChzZWxmLl9nZXRBY3RpdmVFZGl0TGF5ZXIoKSAhPT0gZS50YXJnZXQpIHtcbiAgLy8gICAgICAgICAgdmFyIGxheWVyID0gc2VsZi5fZ2V0QWN0aXZlRWRpdExheWVyKCkgJiYgJChzZWxmLl9nZXRBY3RpdmVFZGl0TGF5ZXIoKS5fY29udGFpbmVyKTtcbiAgLy9cbiAgLy8gICAgICAgICAgaWYgKGxheWVyKSB7XG4gIC8vICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHNlbGYuX2dldEFjdGl2ZUVkaXRMYXllcigpLl9wYXRoLCAnZWRpdC1wb2x5Z29uJyk7XG4gIC8vICAgICAgICAgIH1cbiAgLy9cbiAgLy8gICAgICAgICAgdmFyIHNlbGVjdGVkUGF0aCA9IGUudGFyZ2V0Ll9wYXRoO1xuICAvLyAgICAgICAgICBpZighTC5Eb21VdGlsLmhhc0NsYXNzKHNlbGVjdGVkUGF0aCwgJ2VkaXQtcG9seWdvbicpKSB7XG4gIC8vICAgICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHNlbGVjdGVkUGF0aCwgJ2VkaXQtcG9seWdvbicpO1xuICAvLyAgICAgICAgICB9XG4gIC8vXG4gIC8vICAgICAgICAgIHNlbGYuX3NldEFjdGl2ZUVkaXRMYXllcihlLnRhcmdldCk7XG4gIC8vXG4gIC8vICAgICAgICAgIC8vc2VsZi5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgLy8gICAgICAgICAgc2VsZi5nZXRFTWFya2Vyc0dyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgLy8gICAgICAgICAgLy9zZWxmLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgLy8gICAgICAgICAgc2VsZi5nZXRFSE1hcmtlcnNHcm91cCgpLmNsZWFyTGF5ZXJzKCk7XG4gIC8vXG4gIC8vICAgICAgICAgIGlmICghbGF5ZXIpIHtcbiAgLy8gICAgICAgICAgICBsYXllciA9ICQoZS50YXJnZXQuX2NvbnRhaW5lci5wYXJlbnRFbGVtZW50KS5jaGlsZHJlbigpLmxhc3QoKTtcbiAgLy8gICAgICAgICAgfVxuICAvLyAgICAgICAgICBpZiAoZS50YXJnZXQuX2NvbnRhaW5lciAhPT0gbGF5ZXJbMF0pIHtcbiAgLy8gICAgICAgICAgICAkKGUudGFyZ2V0Ll9jb250YWluZXIpLmRldGFjaCgpLmluc2VydEFmdGVyKGxheWVyKTtcbiAgLy8gICAgICAgICAgfVxuICAvL1xuICAvLyAgICAgICAgICBzZWxmLnJlc3RvcmVFUG9seWdvbihlLnRhcmdldCk7XG4gIC8vXG4gIC8vICAgICAgICAgIHNlbGYuX2ZpdEVCb3VuZHMoKTtcbiAgLy8gICAgICAgIH1cbiAgLy8gICAgICAgIC8vIHJlc2V0IG1hcmtlciBzZWxlY3Rpb25cbiAgLy8gICAgICAgIHNlbGYuZ2V0RU1hcmtlcnNHcm91cCgpLnJlc2V0U2VsZWN0ZWQoKTtcbiAgLy9cbiAgLy8gICAgICAgIHNlbGYuJC50cmlnZ2VyKCdjaGFuZ2VfZWRpdGVkX3BvbHlnb24nKTtcbiAgLy8gICAgICB9XG4gIC8vICAgIH0pO1xuICAvLyAgfSk7XG4gIC8vfVxufSIsImV4cG9ydCBkZWZhdWx0IEwuRmVhdHVyZUdyb3VwLmV4dGVuZCh7XG4gICAgdXBkYXRlICgpIHtcbiAgICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICBtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLl9jb25uZWN0TWFya2VycygpO1xuLy8gICAgbWFwLmdldEVQb2x5Z29uKCkuc2V0U3R5bGUobWFwLmVkaXRTdHlsZVttYXAuX2dldE1vZGVUeXBlKCldKTtcbiAgICB9XG4gIH0pOyIsImltcG9ydCBCYXNlTUdyb3VwIGZyb20gJy4uL2V4dGVuZGVkL0Jhc2VNYXJrZXJHcm91cCc7XG5pbXBvcnQgRWRpdE1hcmtlciBmcm9tICcuLi9lZGl0L21hcmtlcic7XG5pbXBvcnQgRWRpdExpbmVHcm91cCBmcm9tICcuLi9lZGl0L2xpbmUnO1xuaW1wb3J0IERhc2hlZEVkaXRMaW5lR3JvdXAgZnJvbSAnLi4vZHJhdy9kYXNoZWQtbGluZSc7XG5cbmltcG9ydCBzb3J0IGZyb20gJy4uL3V0aWxzL3NvcnRCeVBvc2l0aW9uJztcbmltcG9ydCAqIGFzIGljb25zIGZyb20gJy4uL21hcmtlci1pY29ucyc7XG5cbkwuVXRpbC5leHRlbmQoTC5MaW5lVXRpbCwge1xuICAvLyBDaGVja3MgdG8gc2VlIGlmIHR3byBsaW5lIHNlZ21lbnRzIGludGVyc2VjdC4gRG9lcyBub3QgaGFuZGxlIGRlZ2VuZXJhdGUgY2FzZXMuXG4gIC8vIGh0dHA6Ly9jb21wZ2VvbS5jcy51aXVjLmVkdS9+amVmZmUvdGVhY2hpbmcvMzczL25vdGVzL3gwNi1zd2VlcGxpbmUucGRmXG4gIHNlZ21lbnRzSW50ZXJzZWN0ICgvKlBvaW50Ki8gcCwgLypQb2ludCovIHAxLCAvKlBvaW50Ki8gcDIsIC8qUG9pbnQqLyBwMykge1xuICAgIHJldHVybiB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDIsIHAzKSAhPT1cbiAgICAgIHRoaXMuX2NoZWNrQ291bnRlcmNsb2Nrd2lzZShwMSwgcDIsIHAzKSAmJlxuICAgICAgdGhpcy5fY2hlY2tDb3VudGVyY2xvY2t3aXNlKHAsIHAxLCBwMikgIT09XG4gICAgICB0aGlzLl9jaGVja0NvdW50ZXJjbG9ja3dpc2UocCwgcDEsIHAzKTtcbiAgfSxcblxuICAvLyBjaGVjayB0byBzZWUgaWYgcG9pbnRzIGFyZSBpbiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyXG4gIF9jaGVja0NvdW50ZXJjbG9ja3dpc2UgKC8qUG9pbnQqLyBwLCAvKlBvaW50Ki8gcDEsIC8qUG9pbnQqLyBwMikge1xuICAgIHJldHVybiAocDIueSAtIHAueSkgKiAocDEueCAtIHAueCkgPiAocDEueSAtIHAueSkgKiAocDIueCAtIHAueCk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBMLk1hcmtlckdyb3VwID0gQmFzZU1Hcm91cC5leHRlbmQoe1xuICBfaXNIb2xlOiBmYWxzZSxcbiAgX2VkaXRMaW5lR3JvdXA6IHVuZGVmaW5lZCxcbiAgX3Bvc2l0aW9uOiB1bmRlZmluZWQsXG4gIGRhc2hlZEVkaXRMaW5lR3JvdXA6IG5ldyBEYXNoZWRFZGl0TGluZUdyb3VwKFtdKSxcbiAgb3B0aW9uczoge1xuICAgIG1JY29uOiB1bmRlZmluZWQsXG4gICAgbUhvdmVySWNvbjogdW5kZWZpbmVkXG4gIH0sXG4gIGluaXRpYWxpemUgKGxheWVycykge1xuICAgIEwuTGF5ZXJHcm91cC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxheWVycyk7XG5cbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgLy90aGlzLl9iaW5kRXZlbnRzKCk7XG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwLmFkZFRvKG1hcCk7XG4gIH0sXG4gIF91cGRhdGVERUxpbmUgKGxhdGxuZykge1xuICAgIHZhciBkZUxpbmUgPSB0aGlzLmdldERFTGluZSgpO1xuICAgIGlmICh0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgZGVMaW5lLnVwZGF0ZShsYXRsbmcpO1xuICAgIH1cbiAgICByZXR1cm4gZGVMaW5lO1xuICB9LFxuICBfYWRkTWFya2VyIChsYXRsbmcpIHtcbiAgICAvL3ZhciBlTWFya2Vyc0dyb3VwID0gdGhpcy5nZXRFTWFya2Vyc0dyb3VwKCk7XG5cbiAgICB0aGlzLnNldChsYXRsbmcpO1xuICAgIHRoaXMuZ2V0REVMaW5lKCkuYWRkTGF0TG5nKGxhdGxuZyk7XG5cbiAgICB0aGlzLl9tYXAuX2NvbnZlcnRUb0VkaXQodGhpcyk7XG4gIH0sXG4gIGdldERFTGluZSAoKSB7XG4gICAgaWYgKCF0aGlzLmRhc2hlZEVkaXRMaW5lR3JvdXAuX21hcCkge1xuICAgICAgdGhpcy5kYXNoZWRFZGl0TGluZUdyb3VwLmFkZFRvKHRoaXMuX21hcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cDtcbiAgfSxcbiAgX3NldEhvdmVySWNvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLl9vbGRTZWxlY3RlZE1hcmtlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICB9XG4gICAgbWFwLl9zZWxlY3RlZE1hcmtlci5fc2V0SG92ZXJJY29uKHRoaXMub3B0aW9ucy5tSG92ZXJJY29uKTtcbiAgfSxcbiAgX3NvcnRCeVBvc2l0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSG9sZSkge1xuICAgICAgdmFyIGxheWVycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG5cbiAgICAgIGxheWVycyA9IGxheWVycy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLl9sZWFmbGV0X2lkIC0gYi5fbGVhZmxldF9pZDtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaWRBcnJheSA9IFtdO1xuICAgICAgdmFyIHBvc0FycmF5ID0gW107XG4gICAgICBsYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgICAgaWRBcnJheS5wdXNoKGxheWVyLl9sZWFmbGV0X2lkKTtcbiAgICAgICAgcG9zQXJyYXkucHVzaChsYXllci5fX3Bvc2l0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICBzb3J0KHRoaXMuX2xheWVycywgaWRBcnJheSk7XG4gICAgfVxuICB9LFxuICB1cGRhdGVTdHlsZSAoKSB7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgIG1hcmtlci5fcmVzZXRJY29uKHRoaXMub3B0aW9ucy5tSWNvbik7XG4gICAgICBpZiAobWFya2VyID09PSB0aGlzLl9tYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICAgIHRoaXMuX3NldEhvdmVySWNvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2V0U2VsZWN0ZWQgKG1hcmtlcikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLl9fcG9seWdvbkVkZ2VzSW50ZXJzZWN0ZWQgJiYgdGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gdGhpcy5nZXRMYXN0KCk7XG4gICAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtYXAuX29sZFNlbGVjdGVkTWFya2VyID0gbWFwLl9zZWxlY3RlZE1hcmtlcjtcbiAgICBtYXAuX3NlbGVjdGVkTWFya2VyID0gbWFya2VyO1xuICB9LFxuICByZXNldFNlbGVjdGVkICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyKSB7XG4gICAgICBtYXAuX3NlbGVjdGVkTWFya2VyLl9yZXNldEljb24odGhpcy5vcHRpb25zLm1JY29uKTtcbiAgICAgIG1hcC5fc2VsZWN0ZWRNYXJrZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9LFxuICBnZXRTZWxlY3RlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fc2VsZWN0ZWRNYXJrZXI7XG4gIH0sXG4gIF9zZXRGaXJzdCAobWFya2VyKSB7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgdGhpcy5fZmlyc3RNYXJrZXIuX3NldEZpcnN0SWNvbigpO1xuICB9LFxuICBnZXRGaXJzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpcnN0TWFya2VyO1xuICB9LFxuICBnZXRMYXN0ICgpIHtcbiAgICBpZiAodGhpcy5oYXNGaXJzdE1hcmtlcigpKSB7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICAgIHJldHVybiBsYXllcnNbbGF5ZXJzLmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgfSxcbiAgaGFzRmlyc3RNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpcnN0KCkgJiYgdGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKTtcbiAgfSxcbiAgY29udmVydFRvTGF0TG5ncyAoKSB7XG4gICAgdmFyIGxhdGxuZ3MgPSBbXTtcbiAgICB0aGlzLmVhY2hMYXllcihmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICAgIGlmICghbGF5ZXIuaXNNaWRkbGUoKSkge1xuICAgICAgICBsYXRsbmdzLnB1c2gobGF5ZXIuZ2V0TGF0TG5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsYXRsbmdzO1xuICB9LFxuICByZXN0b3JlIChsYXllcikge1xuICAgIHRoaXMuc2V0QWxsKGxheWVyLl9sYXRsbmdzKTtcbiAgICB0aGlzLnNldEFsbEhvbGVzKGxheWVyLl9ob2xlcyk7XG4gIH0sXG4gIF9hZGQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSkge1xuICAgICAgaWYgKCF0aGlzLl9maXJzdE1hcmtlcikge1xuICAgICAgICBvcHRpb25zLmljb24gPSBpY29ucy5maXJzdEljb247XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5hZGRNYXJrZXIobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmdldERFTGluZSgpLmFkZExhdExuZyhsYXRsbmcpO1xuXG4gICAgdGhpcy5fbWFwLm9mZignbW91c2Vtb3ZlJyk7XG4gICAgaWYgKHRoaXMuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIHRoaXMuX21hcC5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlREVMaW5lKGUubGF0bG5nKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldERFTGluZSgpLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKG1hcmtlci5fbUdyb3VwLmdldExheWVycygpLmxlbmd0aCA+IDIpIHtcbiAgICAgIGlmIChtYXJrZXIuX21Hcm91cC5fZmlyc3RNYXJrZXIuX2hhc0ZpcnN0SWNvbigpICYmIG1hcmtlciA9PT0gbWFya2VyLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpsYXN0X21hcmtlcl9kYmxjbGlja19tb3VzZW92ZXInKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICBfY2xvc2VzdE5vdE1pZGRsZU1hcmtlciAobGF5ZXJzLCBwb3NpdGlvbiwgZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIChsYXllcnNbcG9zaXRpb25dLmlzTWlkZGxlKCkpID8gbGF5ZXJzW3Bvc2l0aW9uICsgZGlyZWN0aW9uXSA6IGxheWVyc1twb3NpdGlvbl07XG4gIH0sXG4gIF9zZXRQcmV2TmV4dCAobWFya2VyLCBwb3NpdGlvbikge1xuICAgIHZhciBsYXllcnMgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgdmFyIG1heExlbmd0aCA9IGxheWVycy5sZW5ndGggLSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gMSkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIHBvc2l0aW9uIC0gMSwgLTEpO1xuICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIDIsIDEpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09IG1heExlbmd0aCkge1xuICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5fY2xvc2VzdE5vdE1pZGRsZU1hcmtlcihsYXllcnMsIG1heExlbmd0aCAtIDEsIC0xKTtcbiAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMuX2Nsb3Nlc3ROb3RNaWRkbGVNYXJrZXIobGF5ZXJzLCAwLCAxKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVQcmV2ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gbGF5ZXJzW3Bvc2l0aW9uIC0gMV07XG4gICAgICB9XG4gICAgICBpZiAobWFya2VyLl9taWRkbGVOZXh0ID09IG51bGwpIHtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gbGF5ZXJzW3Bvc2l0aW9uICsgMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0TWlkZGxlTWFya2VyIChwb3NpdGlvbikge1xuICAgIHRoaXMuYWRkTWFya2VyKHBvc2l0aW9uLCBudWxsLCB7aWNvbjogaWNvbnMubWlkZGxlSWNvbn0pO1xuICB9LFxuICBzZXRNaWRkbGVNYXJrZXJzIChwb3NpdGlvbikge1xuICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKHBvc2l0aW9uKTtcbiAgICB0aGlzLnNldE1pZGRsZU1hcmtlcihwb3NpdGlvbiArIDIpO1xuICB9LFxuICBzZXQgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZykpIHtcbiAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZGQobGF0bG5nLCBwb3NpdGlvbiwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21hcC5lZGdlc0ludGVyc2VjdGVkKGZhbHNlKTtcbiAgICAgIHRoaXMuX21hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9LFxuICBzZXRNaWRkbGUgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiA8IDApID8gMCA6IHBvc2l0aW9uO1xuXG4gICAgLy92YXIgZnVuYyA9ICh0aGlzLl9pc0hvbGUpID8gJ3NldCcgOiAnc2V0SG9sZU1hcmtlcic7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuc2V0KGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpO1xuXG4gICAgbWFya2VyLl9zZXRNaWRkbGVJY29uKCk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgc2V0QWxsIChsYXRsbmdzKSB7XG4gICAgbGF0bG5ncy5mb3JFYWNoKChsYXRsbmcsIHBvc2l0aW9uKSA9PiB7XG4gICAgICB0aGlzLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICB9LFxuICBzZXRBbGxIb2xlcyAoaG9sZXMpIHtcbiAgICBob2xlcy5mb3JFYWNoKChob2xlKSA9PiB7XG4gICAgICAvL3RoaXMuc2V0KGhvbGUpO1xuICAgICAgdmFyIGxhc3RIR3JvdXAgPSB0aGlzLl9tYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5hZGRIb2xlR3JvdXAoKTtcblxuICAgICAgaG9sZS5fZWFjaCgobGF0bG5nLCBwb3NpdGlvbikgPT4ge1xuICAgICAgICBsYXN0SEdyb3VwLnNldChsYXRsbmcsIHBvc2l0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgLy92YXIgbGVuZ3RoID0gaG9sZS5sZW5ndGg7XG4gICAgICAvL3ZhciBpID0gMDtcbiAgICAgIC8vZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgLy8gIGxhc3RIR3JvdXAuc2V0KGhvbGVbaV0sIGkpO1xuICAgICAgLy99XG5cbiAgICAgIGxhc3RIR3JvdXAuZ2V0Rmlyc3QoKS5maXJlKCdjbGljaycpO1xuICAgIH0pO1xuICB9LFxuICBzZXRIb2xlTWFya2VyIChsYXRsbmcsIG9wdGlvbnMgPSB7aXNIb2xlTWFya2VyOiB0cnVlLCBob2xlUG9zaXRpb246IHt9fSkge1xuICAgIHZhciBtYXJrZXIgPSBuZXcgRWRpdE1hcmtlcih0aGlzLCBsYXRsbmcsIG9wdGlvbnMgfHwge30pO1xuICAgIG1hcmtlci5hZGRUbyh0aGlzKTtcblxuICAgIC8vdGhpcy5zZXRTZWxlY3RlZChtYXJrZXIpO1xuXG4gICAgaWYgKHRoaXMuX21hcC5pc01vZGUoJ2RyYXcnKSAmJiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5fc2V0Rmlyc3QobWFya2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9LFxuICByZW1vdmVIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIC8vcmVtb3ZlIGVkaXQgbGluZVxuICAgIC8vdGhpcy5nZXRFTGluZUdyb3VwKCkuY2xlYXJMYXllcnMoKTtcbiAgICAvL3JlbW92ZSBlZGl0IG1hcmtlcnNcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG5cbiAgICAvL3JlbW92ZSBob2xlXG4gICAgbWFwLmdldEVQb2x5Z29uKCkuZ2V0SG9sZXMoKS5zcGxpY2UodGhpcy5fcG9zaXRpb24sIDEpO1xuICAgIG1hcC5nZXRFUG9seWdvbigpLnJlZHJhdygpO1xuXG4gICAgLy9yZWRyYXcgaG9sZXNcbiAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5jbGVhckxheWVycygpO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGVzKCk7XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbWFwLl9zZXRFSE1hcmtlckdyb3VwKGhvbGVzW2ldKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZVNlbGVjdGVkICgpIHtcbiAgICB2YXIgc2VsZWN0ZWRFTWFya2VyID0gdGhpcy5nZXRTZWxlY3RlZCgpO1xuICAgIHZhciBtYXJrZXJMYXllcnNBcnJheSA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhdGxuZyA9IHNlbGVjdGVkRU1hcmtlci5nZXRMYXRMbmcoKTtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVtb3ZlTGF5ZXIoc2VsZWN0ZWRFTWFya2VyKTtcblxuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfbWFya2VyJywge2xhdGxuZzogbGF0bG5nfSk7XG4gICAgfVxuXG4gICAgbWFya2VyTGF5ZXJzQXJyYXkgPSB0aGlzLmdldExheWVycygpO1xuXG4gICAgaWYgKHRoaXMuX2lzSG9sZSkge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gcmVtb3ZlIGxhc3QgcG9pbnRcbiAgICAgICAgaWYgKG1hcmtlckxheWVyc0FycmF5Lmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUhvbGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3NlbGVjdGVkRU1hcmtlciA9IG1hcC5nZXRTZWxlY3RlZE1hcmtlcigpO1xuICAgICAgICAgIHZhciBob2xlUG9zaXRpb24gPSBzZWxlY3RlZEVNYXJrZXIub3B0aW9ucy5ob2xlUG9zaXRpb247XG5cbiAgICAgICAgICAvL3JlbW92ZSBob2xlIHBvaW50XG4gICAgICAgICAgLy9tYXAuZ2V0RVBvbHlnb24oKS5nZXRIb2xlKHRoaXMuX3Bvc2l0aW9uKS5zcGxpY2UoaG9sZVBvc2l0aW9uLmhNYXJrZXIsIDEpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmdldEhvbGUodGhpcy5fcG9zaXRpb24pLnNwbGljZShzZWxlY3RlZEVNYXJrZXIuX19wb3NpdGlvbiwgMSk7XG4gICAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkucmVkcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3Bvc2l0aW9uID0gMDtcbiAgICAgICAgdGhpcy5lYWNoTGF5ZXIoKGxheWVyKSA9PiB7XG4gICAgICAgICAgbGF5ZXIub3B0aW9ucy5ob2xlUG9zaXRpb24gPSB7XG4gICAgICAgICAgICBoR3JvdXA6IHRoaXMuX3Bvc2l0aW9uLFxuICAgICAgICAgICAgaE1hcmtlcjogX3Bvc2l0aW9uKytcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hcC5pc01vZGUoJ2VkaXQnKSkge1xuICAgICAgICAvLyBubyBuZWVkIHRvIHJlbW92ZSBsYXN0IHBvaW50XG4gICAgICAgIGlmIChtYXJrZXJMYXllcnNBcnJheS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgLy9yZW1vdmUgZWRpdCBtYXJrZXJzXG4gICAgICAgICAgdGhpcy5jbGVhckxheWVycygpO1xuICAgICAgICAgIG1hcC5nZXRFUG9seWdvbigpLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuZWFjaExheWVyKChsYXllcikgPT4ge1xuICAgICAgbGF5ZXIub3B0aW9ucy50aXRsZSA9IHBvc2l0aW9uO1xuICAgICAgbGF5ZXIuX19wb3NpdGlvbiA9IHBvc2l0aW9uKys7XG4gICAgfSk7XG4gIH0sXG4gIGdldFBvaW50c0ZvckludGVyc2VjdGlvbiAocG9seWdvbikge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICB2YXIgbGF5ZXJzID0gKChwb2x5Z29uKSA/IHBvbHlnb24uZ2V0TGF5ZXJzKCkgOiB0aGlzLmdldExheWVycygpKS5maWx0ZXIoKGwpID0+ICFsLmlzTWlkZGxlKCkpO1xuXG4gICAgdGhpcy5fb3JpZ2luYWxQb2ludHMgPSBbXTtcbiAgICBsYXllcnMuX2VhY2goKGxheWVyKSA9PiB7XG4gICAgICB2YXIgbGF0bG5nID0gbGF5ZXIuZ2V0TGF0TG5nKCk7XG4gICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5wdXNoKHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIXBvbHlnb24pIHtcbiAgICAgIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1swXSkgeyAvLyBwb2ludCBpcyBmaXJzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLnNsaWNlKDEpO1xuICAgICAgfSBlbHNlIGlmIChtYXAuX3NlbGVjdGVkTWFya2VyID09IGxheWVyc1tsYXllcnMubGVuZ3RoIC0gMV0pIHsgLy8gcG9pbnQgaXMgbGFzdFxuICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgfSBlbHNlIHsgLy8gcG9pbnQgaXMgbm90IGZpcnN0IC8gbGFzdFxuICAgICAgICB2YXIgdG1wQXJyUG9pbnRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKG1hcC5fc2VsZWN0ZWRNYXJrZXIgPT09IGxheWVyc1tpXSkge1xuICAgICAgICAgICAgdG1wQXJyUG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMuc3BsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsUG9pbnRzID0gdG1wQXJyUG9pbnRzLmNvbmNhdCh0aGlzLl9vcmlnaW5hbFBvaW50cyk7XG4gICAgICAgICAgICB0aGlzLl9vcmlnaW5hbFBvaW50cy5zcGxpY2UoLTEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdsYXllcnMgLSAnLCBsYXllcnMpO1xuXG4gICAgcmV0dXJuIHRoaXMuX29yaWdpbmFsUG9pbnRzO1xuICB9LFxuICBfYmluZExpbmVFdmVudHM6IHVuZGVmaW5lZCxcbiAgX2hhc0ludGVyc2VjdGlvbiAocG9pbnRzLCBuZXdQb2ludCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgICBsYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZVNlZ21lbnRzSW50ZXJzZWN0c1JhbmdlKGxhc3RQb2ludCwgbmV3UG9pbnQsIG1heEluZGV4LCBpc0ZpbmlzaCk7XG4gIH0sXG5cbiAgX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlIChwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpIHtcbiAgICB2YXIgbGVuID0gcG9pbnRzID8gcG9pbnRzLmxlbmd0aCA6IDAsXG4gICAgLy9sYXN0UG9pbnQgPSBwb2ludHMgPyBwb2ludHNbbGVuIC0gMV0gOiBudWxsLFxuICAgIC8vIFRoZSBwcmV2aW91cyBwcmV2aW91cyBsaW5lIHNlZ21lbnQuIFByZXZpb3VzIGxpbmUgc2VnbWVudCBkb2Vzbid0IG5lZWQgdGVzdGluZy5cbiAgICAgIG1heEluZGV4ID0gbGVuIC0gMjtcblxuICAgIGlmICh0aGlzLl90b29GZXdQb2ludHNGb3JJbnRlcnNlY3Rpb24oMSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGluZUhvbGVTZWdtZW50c0ludGVyc2VjdHNSYW5nZShsYXN0UG9pbnQsIG5ld1BvaW50KTtcbiAgfSxcblxuICBoYXNJbnRlcnNlY3Rpb24gKGxhdGxuZywgaXNGaW5pc2gpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAub3B0aW9ucy5hbGxvd0ludGVyc2VjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBuZXdQb2ludCA9IG1hcC5sYXRMbmdUb0xheWVyUG9pbnQobGF0bG5nKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpO1xuXG4gICAgdmFyIHJzbHQxID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB2YXIgcnNsdDIgPSBmYWxzZTtcblxuICAgIHZhciBmTWFya2VyID0gdGhpcy5nZXRGaXJzdCgpO1xuICAgIGlmIChmTWFya2VyICYmICFmTWFya2VyLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgLy8gY29kZSB3YXMgZHVibGljYXRlZCB0byBjaGVjayBpbnRlcnNlY3Rpb24gZnJvbSBib3RoIHNpZGVzXG4gICAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgICBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbigpLnJldmVyc2UoKTtcbiAgICAgIHJzbHQyID0gdGhpcy5faGFzSW50ZXJzZWN0aW9uKHBvaW50cywgbmV3UG9pbnQsIGlzRmluaXNoKTtcbiAgICB9XG5cbiAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChyc2x0MSB8fCByc2x0Mik7XG4gICAgdmFyIGVkZ2VzSW50ZXJzZWN0ZWQgPSBtYXAuZWRnZXNJbnRlcnNlY3RlZCgpO1xuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBoYXNJbnRlcnNlY3Rpb25XaXRoSG9sZSAobEFycmF5LCBob2xlKSB7XG5cbiAgICBpZiAodGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3UG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxBcnJheVswXSk7XG4gICAgdmFyIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzFdKTtcblxuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldFBvaW50c0ZvckludGVyc2VjdGlvbihob2xlKTtcblxuICAgIHZhciByc2x0MSA9IHRoaXMuX2hhc0ludGVyc2VjdGlvbldpdGhIb2xlKHBvaW50cywgbmV3UG9pbnQsIGxhc3RQb2ludCk7XG5cbiAgICAvLyBjb2RlIHdhcyBkdWJsaWNhdGVkIHRvIGNoZWNrIGludGVyc2VjdGlvbiBmcm9tIGJvdGggc2lkZXNcbiAgICAvLyAodGhlIG1haW4gaWRlYSB0byByZXZlcnNlIGFycmF5IG9mIHBvaW50cyBhbmQgY2hlY2sgaW50ZXJzZWN0aW9uIGFnYWluKVxuXG4gICAgcG9pbnRzID0gdGhpcy5nZXRQb2ludHNGb3JJbnRlcnNlY3Rpb24oaG9sZSkucmV2ZXJzZSgpO1xuICAgIGxhc3RQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0xheWVyUG9pbnQobEFycmF5WzJdKTtcbiAgICB2YXIgcnNsdDIgPSB0aGlzLl9oYXNJbnRlcnNlY3Rpb25XaXRoSG9sZShwb2ludHMsIG5ld1BvaW50LCBsYXN0UG9pbnQpO1xuXG4gICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQocnNsdDEgfHwgcnNsdDIpO1xuICAgIHZhciBlZGdlc0ludGVyc2VjdGVkID0gdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcblxuICAgIHJldHVybiBlZGdlc0ludGVyc2VjdGVkO1xuICB9LFxuICBfdG9vRmV3UG9pbnRzRm9ySW50ZXJzZWN0aW9uIChleHRyYVBvaW50cykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLl9vcmlnaW5hbFBvaW50cyxcbiAgICAgIGxlbiA9IHBvaW50cyA/IHBvaW50cy5sZW5ndGggOiAwO1xuICAgIC8vIEluY3JlbWVudCBsZW5ndGggYnkgZXh0cmFQb2ludHMgaWYgcHJlc2VudFxuICAgIGxlbiArPSBleHRyYVBvaW50cyB8fCAwO1xuXG4gICAgcmV0dXJuICF0aGlzLl9vcmlnaW5hbFBvaW50cyB8fCBsZW4gPD0gMztcbiAgfSxcbiAgX2xpbmVIb2xlU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX29yaWdpbmFsUG9pbnRzLCBwMiwgcDM7XG5cbiAgICBmb3IgKHZhciBqID0gcG9pbnRzLmxlbmd0aCAtIDE7IGogPiAwOyBqLS0pIHtcbiAgICAgIHAyID0gcG9pbnRzW2ogLSAxXTtcbiAgICAgIHAzID0gcG9pbnRzW2pdO1xuXG4gICAgICBpZiAoTC5MaW5lVXRpbC5zZWdtZW50c0ludGVyc2VjdChwLCBwMSwgcDIsIHAzKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIF9saW5lU2VnbWVudHNJbnRlcnNlY3RzUmFuZ2UgKHAsIHAxLCBtYXhJbmRleCwgaXNGaW5pc2gpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fb3JpZ2luYWxQb2ludHMsXG4gICAgICBwMiwgcDM7XG5cbiAgICB2YXIgbWluID0gaXNGaW5pc2ggPyAxIDogMDtcbiAgICAvLyBDaGVjayBhbGwgcHJldmlvdXMgbGluZSBzZWdtZW50cyAoYmVzaWRlIHRoZSBpbW1lZGlhdGVseSBwcmV2aW91cykgZm9yIGludGVyc2VjdGlvbnNcbiAgICBmb3IgKHZhciBqID0gbWF4SW5kZXg7IGogPiBtaW47IGotLSkge1xuICAgICAgcDIgPSBwb2ludHNbaiAtIDFdO1xuICAgICAgcDMgPSBwb2ludHNbal07XG5cbiAgICAgIGlmIChMLkxpbmVVdGlsLnNlZ21lbnRzSW50ZXJzZWN0KHAsIHAxLCBwMiwgcDMpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgX2lzTWFya2VySW5Qb2x5Z29uIChtYXJrZXIpIHtcbiAgICB2YXIgaiA9IDA7XG5cbiAgICB2YXIgbGF5ZXJzID0gdGhpcy5nZXRMYXllcnMoKTtcbiAgICB2YXIgc2lkZXMgPSBsYXllcnMubGVuZ3RoO1xuXG4gICAgdmFyIHggPSBtYXJrZXIubG5nO1xuICAgIHZhciB5ID0gbWFya2VyLmxhdDtcblxuICAgIHZhciBpblBvbHkgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lkZXM7IGkrKykge1xuICAgICAgaisrO1xuICAgICAgaWYgKGogPT0gc2lkZXMpIHtcbiAgICAgICAgaiA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgcG9pbnQxID0gbGF5ZXJzW2ldLmdldExhdExuZygpO1xuICAgICAgdmFyIHBvaW50MiA9IGxheWVyc1tqXS5nZXRMYXRMbmcoKTtcbiAgICAgIGlmICgoKHBvaW50MS5sYXQgPCB5KSAmJiAocG9pbnQyLmxhdCA+PSB5KSkgfHwgKChwb2ludDIubGF0IDwgeSkgJiYgKHBvaW50MS5sYXQgPj0geSkpKSB7XG4gICAgICAgIGlmIChwb2ludDEubG5nICsgKHkgLSBwb2ludDEubGF0KSAvIChwb2ludDIubGF0IC0gcG9pbnQxLmxhdCkgKiAocG9pbnQyLmxuZyAtIHBvaW50MS5sbmcpIDwgeCkge1xuICAgICAgICAgIGluUG9seSA9ICFpblBvbHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpblBvbHk7XG4gIH1cbn0pOyIsImltcG9ydCBUb29sdGlwIGZyb20gJy4uL2V4dGVuZGVkL1Rvb2x0aXAnO1xuaW1wb3J0IHtmaXJzdEljb24saWNvbixkcmFnSWNvbixtaWRkbGVJY29uLGhvdmVySWNvbixpbnRlcnNlY3Rpb25JY29ufSBmcm9tICcuLi9tYXJrZXItaWNvbnMnO1xuXG52YXIgc2l6ZSA9IDE7XG52YXIgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5pZiAodXNlckFnZW50LmluZGV4T2YoXCJpcGFkXCIpICE9PSAtMSB8fCB1c2VyQWdlbnQuaW5kZXhPZihcImlwaG9uZVwiKSAhPT0gLTEpIHtcbiAgc2l6ZSA9IDI7XG59XG5cbnZhciB0b29sdGlwO1xudmFyIGRyYWdlbmQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQgTC5NYXJrZXIuZXh0ZW5kKHtcbiAgX2RyYWdnYWJsZTogdW5kZWZpbmVkLCAvLyBhbiBpbnN0YW5jZSBvZiBMLkRyYWdnYWJsZVxuICBfb2xkTGF0TG5nU3RhdGU6IHVuZGVmaW5lZCxcbiAgaW5pdGlhbGl6ZSAoZ3JvdXAsIGxhdGxuZywgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICBvcHRpb25zID0gJC5leHRlbmQoe1xuICAgICAgaWNvbjogaWNvbixcbiAgICAgIGRyYWdnYWJsZTogZmFsc2VcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIEwuTWFya2VyLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgbGF0bG5nLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX21Hcm91cCA9IGdyb3VwO1xuXG4gICAgdGhpcy5faXNGaXJzdCA9IGdyb3VwLmdldExheWVycygpLmxlbmd0aCA9PT0gMDtcbiAgfSxcbiAgcmVtb3ZlR3JvdXAgKCkge1xuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZUhvbGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbUdyb3VwLnJlbW92ZSgpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICB0aGlzLl9tR3JvdXAucmVtb3ZlU2VsZWN0ZWQoKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUhvbGUgKCkgeyAvLyBkZXByZWNhdGVkXG4gICAgdGhpcy5yZW1vdmVHcm91cCgpO1xuICB9LFxuICBuZXh0ICgpIHtcbiAgICB2YXIgbmV4dCA9IHRoaXMuX25leHQuX25leHQ7XG4gICAgaWYgKCF0aGlzLl9uZXh0LmlzTWlkZGxlKCkpIHtcbiAgICAgIG5leHQgPSB0aGlzLl9uZXh0O1xuICAgIH1cbiAgICByZXR1cm4gbmV4dDtcbiAgfSxcbiAgcHJldiAoKSB7XG4gICAgdmFyIHByZXYgPSB0aGlzLl9wcmV2Ll9wcmV2O1xuICAgIGlmICghdGhpcy5fcHJldi5pc01pZGRsZSgpKSB7XG4gICAgICBwcmV2ID0gdGhpcy5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sXG4gIGNoYW5nZVByZXZOZXh0UG9zICgpIHtcbiAgICBpZiAodGhpcy5fcHJldi5pc01pZGRsZSgpKSB7XG5cbiAgICAgIHZhciBwcmV2TGF0TG5nID0gdGhpcy5fbUdyb3VwLl9nZXRNaWRkbGVMYXRMbmcodGhpcy5wcmV2KCksIHRoaXMpO1xuICAgICAgdmFyIG5leHRMYXRMbmcgPSB0aGlzLl9tR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLCB0aGlzLm5leHQoKSk7XG5cbiAgICAgIHRoaXMuX3ByZXYuc2V0TGF0TG5nKHByZXZMYXRMbmcpO1xuICAgICAgdGhpcy5fbmV4dC5zZXRMYXRMbmcobmV4dExhdExuZyk7XG4gICAgfVxuICB9LFxuICAvKipcbiAgICogY2hhbmdlIGV2ZW50cyBmb3IgbWFya2VyIChleGFtcGxlOiBob2xlKVxuICAgKi9cbiAgICByZXNldEV2ZW50cyAoY2FsbGJhY2spIHtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuICBfcG9zSGFzaCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZXYucG9zaXRpb24gKyAnXycgKyB0aGlzLnBvc2l0aW9uICsgJ18nICsgdGhpcy5fbmV4dC5wb3NpdGlvbjtcbiAgfSxcbiAgX3Jlc2V0SWNvbiAoX2ljb24pIHtcbiAgICBpZiAodGhpcy5faGFzRmlyc3RJY29uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGljID0gX2ljb24gfHwgaWNvbjtcblxuICAgIHRoaXMuc2V0SWNvbihpYyk7XG4gICAgdGhpcy5wcmV2KCkuc2V0SWNvbihpYyk7XG4gICAgdGhpcy5uZXh0KCkuc2V0SWNvbihpYyk7XG4gIH0sXG4gIF9zZXRIb3Zlckljb24gKF9oSWNvbikge1xuICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldEljb24oX2hJY29uIHx8IGhvdmVySWNvbik7XG4gIH0sXG4gIF9hZGRJY29uQ2xhc3MgKGNsYXNzTmFtZSkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9pY29uLCBjbGFzc05hbWUpO1xuICB9LFxuICBfcmVtb3ZlSWNvbkNsYXNzIChjbGFzc05hbWUpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5faWNvbiwgY2xhc3NOYW1lKTtcbiAgfSxcbiAgX3NldEludGVyc2VjdGlvbkljb24gKCkge1xuICAgIHZhciBpY29uQ2xhc3MgPSBpbnRlcnNlY3Rpb25JY29uLm9wdGlvbnMuY2xhc3NOYW1lO1xuICAgIHZhciBjbGFzc05hbWUgPSAnbS1lZGl0b3ItZGl2LWljb24nO1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcyhjbGFzc05hbWUpO1xuICAgIHRoaXMuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuXG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkID0gdGhpcy5wcmV2KCk7XG4gICAgdGhpcy5fcHJldkludGVyc2VjdGVkLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9wcmV2SW50ZXJzZWN0ZWQuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuXG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkID0gdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkLl9yZW1vdmVJY29uQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB0aGlzLl9uZXh0SW50ZXJzZWN0ZWQuX2FkZEljb25DbGFzcyhpY29uQ2xhc3MpO1xuICB9LFxuICBfc2V0Rmlyc3RJY29uICgpIHtcbiAgICB0aGlzLl9pc0ZpcnN0ID0gdHJ1ZTtcbiAgICB0aGlzLnNldEljb24oZmlyc3RJY29uKTtcbiAgfSxcbiAgX2hhc0ZpcnN0SWNvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ljb24gJiYgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1kaXYtaWNvbi1maXJzdCcpO1xuICB9LFxuICBfc2V0TWlkZGxlSWNvbiAoKSB7XG4gICAgdGhpcy5zZXRJY29uKG1pZGRsZUljb24pO1xuICB9LFxuICBpc01pZGRsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ljb24gJiYgTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1taWRkbGUtZGl2LWljb24nKVxuICAgICAgJiYgIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbGVhZmxldC1kcmFnLXRhcmdldCcpO1xuICB9LFxuICBfc2V0RHJhZ0ljb24gKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnbS1lZGl0b3ItZGl2LWljb24nKTtcbiAgICB0aGlzLnNldEljb24oZHJhZ0ljb24pO1xuICB9LFxuICBpc1BsYWluICgpIHtcbiAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdtLWVkaXRvci1kaXYtaWNvbicpIHx8IEwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9pY29uLCAnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gIH0sXG4gIF9vbmNlQ2xpY2sgKCkge1xuICAgIGlmICh0aGlzLl9pc0ZpcnN0KSB7XG4gICAgICB0aGlzLm9uY2UoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgICB2YXIgbUdyb3VwID0gdGhpcy5fbUdyb3VwO1xuXG4gICAgICAgIGlmIChtR3JvdXAuX21hcmtlcnMubGVuZ3RoIDwgMykge1xuICAgICAgICAgIHRoaXMuX29uY2VDbGljaygpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsYXRsbmcgPSBlLnRhcmdldC5fbGF0bG5nO1xuICAgICAgICBjb25zb2xlLmxvZyhlLnRhcmdldCk7XG4gICAgICAgIHZhciBoYXNJbnRlcnNlY3Rpb24gPSBtR3JvdXAuaGFzSW50ZXJzZWN0aW9uKGxhdGxuZyk7XG5cbiAgICAgICAgaWYgKGhhc0ludGVyc2VjdGlvbikge1xuICAgICAgICAgIG1hcC5fc2hvd0ludGVyc2VjdGlvbkVycm9yKGxhdGxuZyk7XG4gICAgICAgICAgdGhpcy5fb25jZUNsaWNrKCk7IC8vIGJpbmQgJ29uY2UnIGFnYWluIHVudGlsIGhhcyBpbnRlcnNlY3Rpb25cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9pc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5zZXRJY29uKGljb24pO1xuICAgICAgICAgIC8vbUdyb3VwLnNldFNlbGVjdGVkKHRoaXMpO1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6am9pbl9wYXRoJywge21Hcm91cDogbUdyb3VwfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgX2JpbmRDb21tb25FdmVudHMgKCkge1xuICAgIHRoaXMub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdmFyIG1Hcm91cCA9IHRoaXMuX21Hcm91cDtcblxuICAgICAgaWYgKG1Hcm91cC5oYXNGaXJzdE1hcmtlcigpICYmIHRoaXMgIT09IG1Hcm91cC5nZXRGaXJzdCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2hhc0ZpcnN0SWNvbigpICYmIHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb24odGhpcy5nZXRMYXRMbmcoKSwgdHJ1ZSkpIHtcbiAgICAgICAgdGhpcy5fbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoZmFsc2UpO1xuICAgICAgICB0aGlzLl9tYXAuX3Nob3dJbnRlcnNlY3Rpb25FcnJvcigpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1Hcm91cC5zZXRTZWxlY3RlZCh0aGlzKTtcbiAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cblxuICAgICAgaWYgKG1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgIG1Hcm91cC5zZWxlY3QoKTtcblxuICAgICAgICBpZiAodGhpcy5pc01pZGRsZSgpKSB7XG4gICAgICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIubXNnKHRoaXMuX21hcC5vcHRpb25zLnRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5tc2codGhpcy5fbWFwLm9wdGlvbnMudGV4dC5jbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzTWlkZGxlKCkpIHsgLy9hZGQgZWRnZVxuICAgICAgICBtR3JvdXAuc2V0TWlkZGxlTWFya2Vycyh0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fcmVzZXRJY29uKGljb24pO1xuICAgICAgICBtR3JvdXAuc2VsZWN0KCk7XG4gICAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLm1zZyh0aGlzLl9tYXAub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICAgIH0gZWxzZSB7IC8vcmVtb3ZlIGVkZ2VcbiAgICAgICAgaWYgKCFtR3JvdXAuZ2V0Rmlyc3QoKS5faGFzRmlyc3RJY29uKCkgJiYgIWRyYWdlbmQpIHtcbiAgICAgICAgICBtR3JvdXAuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcblxuICAgICAgICAgIHZhciByc2x0SW50ZXJzZWN0aW9uID0gdGhpcy5fZGV0ZWN0SW50ZXJzZWN0aW9uKHt0YXJnZXQ6IHtfbGF0bG5nOiBtR3JvdXAuX2dldE1pZGRsZUxhdExuZyh0aGlzLnByZXYoKSwgdGhpcy5uZXh0KCkpfX0pO1xuXG4gICAgICAgICAgaWYgKHJzbHRJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgICAgICAgICAgdGhpcy5fbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IodGhpcy5fbWFwLm9wdGlvbnMudGV4dC5kZWxldGVQb2ludEludGVyc2VjdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aWV3RXJyb3JMaW5lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9sZExhdExuZyA9IHRoaXMuZ2V0TGF0TG5nKCk7XG5cbiAgICAgICAgICB2YXIgbmV4dE1hcmtlciA9IHRoaXMubmV4dCgpO1xuICAgICAgICAgIG1Hcm91cC5yZW1vdmVNYXJrZXIodGhpcyk7XG5cbiAgICAgICAgICBpZiAoIW1Hcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXdMYXRMbmcgPSBuZXh0TWFya2VyLl9wcmV2LmdldExhdExuZygpO1xuXG4gICAgICAgICAgICBpZiAobmV3TGF0TG5nLmxhdCA9PT0gb2xkTGF0TG5nLmxhdCAmJiBuZXdMYXRMbmcubG5nID09PSBvbGRMYXRMbmcubG5nKSB7XG4gICAgICAgICAgICAgIG1Hcm91cC5fbWFwLl9tc2dDb250YWluZXIubXNnKHRoaXMuX21hcC5vcHRpb25zLnRleHQuY2xpY2tUb0FkZE5ld0VkZ2VzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbUdyb3VwLnNldFNlbGVjdGVkKG5leHRNYXJrZXIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtR3JvdXAuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fbUdyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgIGlmICh0aGlzLl9tR3JvdXAuZ2V0TGF5ZXJzKCkubGVuZ3RoID4gMikge1xuICAgICAgICAgIGlmICh0aGlzLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzID09PSB0aGlzLl9tR3JvdXAuX2xhc3RNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcC5maXJlKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkSW5Hcm91cCgpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb25jZUNsaWNrKCk7XG5cbiAgICB0aGlzLm9uKCdkYmxjbGljaycsICgpID0+IHtcbiAgICAgIHZhciBtR3JvdXAgPSB0aGlzLl9tR3JvdXA7XG4gICAgICBpZiAobUdyb3VwICYmIG1Hcm91cC5nZXRGaXJzdCgpICYmIG1Hcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICBpZiAodGhpcyA9PT0gbUdyb3VwLl9sYXN0TWFya2VyKSB7XG4gICAgICAgICAgbUdyb3VwLmdldEZpcnN0KCkuZmlyZSgnY2xpY2snKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZycsIChlKSA9PiB7XG4gICAgICB2YXIgbWFya2VyID0gZS50YXJnZXQ7XG5cbiAgICAgIG1hcmtlci5jaGFuZ2VQcmV2TmV4dFBvcygpO1xuXG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLl9jb252ZXJ0VG9FZGl0KG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkpO1xuXG4gICAgICB0aGlzLl9zZXREcmFnSWNvbigpO1xuXG4gICAgICBtYXAuZmlyZSgnZWRpdG9yOmRyYWdfbWFya2VyJywge21hcmtlcjogdGhpc30pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZ2VuZCcsICgpID0+IHtcblxuICAgICAgdGhpcy5fbUdyb3VwLnNlbGVjdCgpO1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpkcmFnZW5kX21hcmtlcicsIHttYXJrZXI6IHRoaXN9KTtcblxuICAgICAgZHJhZ2VuZCA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZHJhZ2VuZCA9IGZhbHNlO1xuICAgICAgfSwgMjAwKTtcblxuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgfSk7XG4gIH0sXG4gIF9pc0luc2lkZUhvbGUgKCkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG4gICAgdmFyIGhvbGVzID0gbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhvbGUgPSBob2xlc1tpXTtcbiAgICAgIGlmICh0aGlzLl9tR3JvdXAgIT09IGhvbGUpIHtcbiAgICAgICAgaWYgKGhvbGUuX2lzTWFya2VySW5Qb2x5Z29uKHRoaXMuZ2V0TGF0TG5nKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBfaXNPdXRzaWRlT2ZQb2x5Z29uIChwb2x5Z29uKSB7XG4gICAgcmV0dXJuICFwb2x5Z29uLl9pc01hcmtlckluUG9seWdvbih0aGlzLmdldExhdExuZygpKTtcbiAgfSxcbiAgX2RldGVjdEludGVyc2VjdGlvbiAoZSkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXA7XG5cbiAgICBpZiAobWFwLm9wdGlvbnMuYWxsb3dJbnRlcnNlY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbGF0bG5nID0gKGUgPT09IHVuZGVmaW5lZCkgPyB0aGlzLmdldExhdExuZygpIDogZS50YXJnZXQuX2xhdGxuZztcbiAgICB2YXIgaXNPdXRzaWRlT2ZQb2x5Z29uID0gZmFsc2U7XG4gICAgdmFyIGlzSW5zaWRlT2ZIb2xlID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX21Hcm91cC5faXNIb2xlKSB7XG4gICAgICBpc091dHNpZGVPZlBvbHlnb24gPSB0aGlzLl9pc091dHNpZGVPZlBvbHlnb24obWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICBpc0luc2lkZU9mSG9sZSA9IHRoaXMuX2lzSW5zaWRlSG9sZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc0luc2lkZU9mSG9sZSA9IHRoaXMuX2lzSW5zaWRlSG9sZSgpO1xuICAgIH1cblxuICAgIHZhciByc2x0ID0gaXNJbnNpZGVPZkhvbGUgfHwgaXNPdXRzaWRlT2ZQb2x5Z29uIHx8IHRoaXMuX21Hcm91cC5oYXNJbnRlcnNlY3Rpb24obGF0bG5nKSB8fCB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMoZSk7XG5cbiAgICBtYXAuZWRnZXNJbnRlcnNlY3RlZChyc2x0KTtcbiAgICBpZiAocnNsdCkge1xuICAgICAgdGhpcy5fbWFwLl9zaG93SW50ZXJzZWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKTtcbiAgfSxcbiAgX2RldGVjdEludGVyc2VjdGlvbldpdGhIb2xlcyAoZSkge1xuICAgIHZhciBtYXAgPSB0aGlzLl9tYXAsIGhhc0ludGVyc2VjdGlvbiA9IGZhbHNlLCBob2xlLCBsYXRsbmcgPSAoZSA9PT0gdW5kZWZpbmVkKSA/IHRoaXMuZ2V0TGF0TG5nKCkgOiBlLnRhcmdldC5fbGF0bG5nO1xuICAgIHZhciBob2xlcyA9IG1hcC5nZXRFSE1hcmtlcnNHcm91cCgpLmdldExheWVycygpO1xuICAgIHZhciBlTWFya2Vyc0dyb3VwID0gbWFwLmdldEVNYXJrZXJzR3JvdXAoKTtcbiAgICB2YXIgcHJldlBvaW50ID0gdGhpcy5wcmV2KCk7XG4gICAgdmFyIG5leHRQb2ludCA9IHRoaXMubmV4dCgpO1xuXG4gICAgaWYgKHByZXZQb2ludCA9PSBudWxsICYmIG5leHRQb2ludCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlY29uZFBvaW50ID0gcHJldlBvaW50LmdldExhdExuZygpO1xuICAgIHZhciBsYXN0UG9pbnQgPSBuZXh0UG9pbnQuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIGxheWVycywgdG1wQXJyYXkgPSBbXTtcblxuICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBob2xlID0gaG9sZXNbaV07XG4gICAgICAgIGlmIChob2xlICE9PSB0aGlzLl9tR3JvdXApIHtcbiAgICAgICAgICBoYXNJbnRlcnNlY3Rpb24gPSB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUoW2xhdGxuZywgc2Vjb25kUG9pbnQsIGxhc3RQb2ludF0sIGhvbGUpO1xuICAgICAgICAgIGlmIChoYXNJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBoYXNJbnRlcnNlY3Rpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGNoZWNrIHRoYXQgaG9sZSBpcyBpbnNpZGUgb2Ygb3RoZXIgaG9sZVxuICAgICAgICAgIHRtcEFycmF5ID0gW107XG4gICAgICAgICAgbGF5ZXJzID0gaG9sZS5nZXRMYXllcnMoKTtcblxuICAgICAgICAgIGxheWVycy5fZWFjaCgobGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9tR3JvdXAuX2lzTWFya2VySW5Qb2x5Z29uKGxheWVyLmdldExhdExuZygpKSkge1xuICAgICAgICAgICAgICB0bXBBcnJheS5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHRtcEFycmF5Lmxlbmd0aCA9PT0gbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbUdyb3VwLmhhc0ludGVyc2VjdGlvbldpdGhIb2xlKFtsYXRsbmcsIHNlY29uZFBvaW50LCBsYXN0UG9pbnRdLCBlTWFya2Vyc0dyb3VwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBoYXNJbnRlcnNlY3Rpb24gPSB0aGlzLl9tR3JvdXAuaGFzSW50ZXJzZWN0aW9uV2l0aEhvbGUoW2xhdGxuZywgc2Vjb25kUG9pbnQsIGxhc3RQb2ludF0sIGhvbGVzW2ldKTtcblxuICAgICAgICAvLyBjaGVjayB0aGF0IGhvbGUgaXMgb3V0c2lkZSBvZiBwb2x5Z29uXG4gICAgICAgIGlmIChoYXNJbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gaGFzSW50ZXJzZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdG1wQXJyYXkgPSBbXTtcbiAgICAgICAgbGF5ZXJzID0gaG9sZXNbaV0uZ2V0TGF5ZXJzKCk7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGxheWVyc1tqXS5faXNPdXRzaWRlT2ZQb2x5Z29uKGVNYXJrZXJzR3JvdXApKSB7XG4gICAgICAgICAgICB0bXBBcnJheS5wdXNoKFwiXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodG1wQXJyYXkubGVuZ3RoID09PSBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhhc0ludGVyc2VjdGlvbjtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIEwuTWFya2VyLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICB0aGlzLm9uKCdkcmFnc3RhcnQnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fbUdyb3VwLnNldFNlbGVjdGVkKHRoaXMpO1xuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSBlLnRhcmdldC5fbGF0bG5nO1xuXG4gICAgICBpZiAodGhpcy5fcHJldi5pc1BsYWluKCkpIHtcbiAgICAgICAgdGhpcy5fbUdyb3VwLnNldE1pZGRsZU1hcmtlcnModGhpcy5wb3NpdGlvbik7XG4gICAgICAgIC8vdGhpcy5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgICAgfVxuXG4gICAgfSkub24oJ2RyYWcnLCAoZSkgPT4ge1xuICAgICAgdGhpcy5fb25EcmFnKGUpO1xuICAgIH0pLm9uKCdkcmFnZW5kJywgKGUpID0+IHtcbiAgICAgIHRoaXMuX29uRHJhZ0VuZChlKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5fZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kQ29tbW9uRXZlbnRzKG1hcCk7XG4gIH0sXG4gIF9vbkRyYWcgKGUpIHtcbiAgICB0aGlzLl9kZXRlY3RJbnRlcnNlY3Rpb24oZSk7XG4gIH0sXG4gIF9vbkRyYWdFbmQgKGUpIHtcbiAgICB2YXIgcnNsdCA9IHRoaXMuX2RldGVjdEludGVyc2VjdGlvbihlKTtcbiAgICBpZiAocnNsdCAmJiAhdGhpcy5fbWFwLm9wdGlvbnMuYWxsb3dDb3JyZWN0SW50ZXJzZWN0aW9uKSB7XG4gICAgICB0aGlzLl9yZXN0b3JlT2xkUG9zaXRpb24oKTtcbiAgICB9XG4gIH0sXG4gIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgX3Jlc3RvcmVPbGRQb3NpdGlvbiAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLmVkZ2VzSW50ZXJzZWN0ZWQoKSkge1xuICAgICAgbGV0IHN0YXRlTGF0TG5nID0gdGhpcy5fb2xkTGF0TG5nU3RhdGU7XG4gICAgICB0aGlzLnNldExhdExuZyhMLmxhdExuZyhzdGF0ZUxhdExuZy5sYXQsIHN0YXRlTGF0TG5nLmxuZykpO1xuXG4gICAgICB0aGlzLmNoYW5nZVByZXZOZXh0UG9zKCk7XG4gICAgICBtYXAuX2NvbnZlcnRUb0VkaXQobWFwLmdldEVNYXJrZXJzR3JvdXAoKSk7XG4gICAgICAvL1xuICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkcmFnX21hcmtlcicsIHttYXJrZXI6IHRoaXN9KTtcblxuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnJlc2V0U3R5bGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fb2xkTGF0TG5nU3RhdGUgPSB0aGlzLmdldExhdExuZygpO1xuICAgIH1cbiAgfSxcbiAgX2FuaW1hdGVab29tIChvcHQpIHtcbiAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICB2YXIgcG9zID0gdGhpcy5fbWFwLl9sYXRMbmdUb05ld0xheWVyUG9pbnQodGhpcy5fbGF0bG5nLCBvcHQuem9vbSwgb3B0LmNlbnRlcikucm91bmQoKTtcblxuICAgICAgdGhpcy5fc2V0UG9zKHBvcyk7XG4gICAgfVxuICB9LFxuICByZXNldEljb24gKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnbS1lZGl0b3ItaW50ZXJzZWN0aW9uLWRpdi1pY29uJyk7XG4gICAgdGhpcy5fcmVtb3ZlSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbi1kcmFnJyk7XG4gIH0sXG4gIHVuU2VsZWN0SWNvbkluR3JvdXAgKCkge1xuICAgIHRoaXMuX3JlbW92ZUljb25DbGFzcygnZ3JvdXAtc2VsZWN0ZWQnKTtcbiAgfSxcbiAgX3NlbGVjdEljb25Jbkdyb3VwICgpIHtcbiAgICBpZiAoIXRoaXMuaXNNaWRkbGUoKSkge1xuICAgICAgdGhpcy5fYWRkSWNvbkNsYXNzKCdtLWVkaXRvci1kaXYtaWNvbicpO1xuICAgIH1cbiAgICB0aGlzLl9hZGRJY29uQ2xhc3MoJ2dyb3VwLXNlbGVjdGVkJyk7XG4gIH0sXG4gIHNlbGVjdEljb25Jbkdyb3VwICgpIHtcbiAgICBpZiAodGhpcy5fcHJldikge1xuICAgICAgdGhpcy5fcHJldi5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG4gICAgdGhpcy5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICBpZiAodGhpcy5fbmV4dCkge1xuICAgICAgdGhpcy5fbmV4dC5fc2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9XG4gIH0sXG4gIGlzU2VsZWN0ZWRJbkdyb3VwICgpIHtcbiAgICByZXR1cm4gTC5Eb21VdGlsLmhhc0NsYXNzKHRoaXMuX2ljb24sICdncm91cC1zZWxlY3RlZCcpO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBMLk1hcmtlci5wcm90b3R5cGUub25SZW1vdmUuY2FsbCh0aGlzLCBtYXApO1xuICB9LFxuICBfZXJyb3JMaW5lczogW10sXG4gIF9wcmV2RXJyb3JMaW5lOiBudWxsLFxuICBfbmV4dEVycm9yTGluZTogbnVsbCxcbiAgX2RyYXdFcnJvckxpbmVzICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIHRoaXMuX2NsZWFyRXJyb3JMaW5lcygpO1xuXG4gICAgdmFyIGN1cnJQb2ludCA9IHRoaXMuZ2V0TGF0TG5nKCk7XG4gICAgdmFyIHByZXZQb2ludHMgPSBbdGhpcy5wcmV2KCkuZ2V0TGF0TG5nKCksIGN1cnJQb2ludF07XG4gICAgdmFyIG5leHRQb2ludHMgPSBbdGhpcy5uZXh0KCkuZ2V0TGF0TG5nKCksIGN1cnJQb2ludF07XG5cbiAgICB2YXIgZXJyb3JMaW5lU3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5lcnJvckxpbmVTdHlsZTtcblxuICAgIHRoaXMuX3ByZXZFcnJvckxpbmUgPSBuZXcgTC5Qb2x5bGluZShwcmV2UG9pbnRzLCBlcnJvckxpbmVTdHlsZSk7XG4gICAgdGhpcy5fbmV4dEVycm9yTGluZSA9IG5ldyBMLlBvbHlsaW5lKG5leHRQb2ludHMsIGVycm9yTGluZVN0eWxlKTtcblxuICAgIHRoaXMuX3ByZXZFcnJvckxpbmUuYWRkVG8obWFwKTtcbiAgICB0aGlzLl9uZXh0RXJyb3JMaW5lLmFkZFRvKG1hcCk7XG5cbiAgICB0aGlzLl9lcnJvckxpbmVzLnB1c2godGhpcy5fcHJldkVycm9yTGluZSk7XG4gICAgdGhpcy5fZXJyb3JMaW5lcy5wdXNoKHRoaXMuX25leHRFcnJvckxpbmUpO1xuICB9LFxuICBfY2xlYXJFcnJvckxpbmVzICgpIHtcbiAgICB0aGlzLl9lcnJvckxpbmVzLl9lYWNoKChsaW5lKSA9PiB0aGlzLl9tYXAucmVtb3ZlTGF5ZXIobGluZSkpO1xuICB9LFxuICBzZXRJbnRlcnNlY3RlZFN0eWxlICgpIHtcbiAgICB0aGlzLl9zZXRJbnRlcnNlY3Rpb25JY29uKCk7XG5cbiAgICAvL3Nob3cgaW50ZXJzZWN0ZWQgbGluZXNcbiAgICB0aGlzLl9kcmF3RXJyb3JMaW5lcygpO1xuICB9LFxuICByZXNldFN0eWxlICgpIHtcbiAgICB0aGlzLnJlc2V0SWNvbigpO1xuICAgIHRoaXMuc2VsZWN0SWNvbkluR3JvdXAoKTtcblxuICAgIGlmICh0aGlzLl9wcmV2SW50ZXJzZWN0ZWQpIHtcbiAgICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5yZXNldEljb24oKTtcbiAgICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZC5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9uZXh0SW50ZXJzZWN0ZWQpIHtcbiAgICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5yZXNldEljb24oKTtcbiAgICAgIHRoaXMuX25leHRJbnRlcnNlY3RlZC5zZWxlY3RJY29uSW5Hcm91cCgpO1xuICAgIH1cblxuICAgIHRoaXMuX3ByZXZJbnRlcnNlY3RlZCA9IG51bGw7XG4gICAgdGhpcy5fbmV4dEludGVyc2VjdGVkID0gbnVsbDtcblxuICAgIC8vaGlkZSBpbnRlcnNlY3RlZCBsaW5lc1xuICAgIHRoaXMuX2NsZWFyRXJyb3JMaW5lcygpO1xuICB9LFxuICBfcHJldmlld0VyTGluZTogbnVsbCxcbiAgX3B0OiBudWxsLFxuICBfcHJldmlld0Vycm9yTGluZSAoKSB7XG4gICAgaWYgKHRoaXMuX3ByZXZpZXdFckxpbmUpIHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9wcmV2aWV3RXJMaW5lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcHQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wdCk7XG4gICAgfVxuXG4gICAgdmFyIHBvaW50cyA9IFt0aGlzLm5leHQoKS5nZXRMYXRMbmcoKSwgdGhpcy5wcmV2KCkuZ2V0TGF0TG5nKCldO1xuXG4gICAgdmFyIGVycm9yTGluZVN0eWxlID0gdGhpcy5fbWFwLm9wdGlvbnMucHJldmlld0Vycm9yTGluZVN0eWxlO1xuXG4gICAgdGhpcy5fcHJldmlld0VyTGluZSA9IG5ldyBMLlBvbHlsaW5lKHBvaW50cywgZXJyb3JMaW5lU3R5bGUpO1xuXG4gICAgdGhpcy5fcHJldmlld0VyTGluZS5hZGRUbyh0aGlzLl9tYXApO1xuXG4gICAgdGhpcy5fcHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcih0aGlzLl9wcmV2aWV3RXJMaW5lKTtcbiAgICB9LCA5MDApO1xuICB9XG59KTsiLCJpbXBvcnQgRXh0ZW5kZWRQb2x5Z29uIGZyb20gJy4uL2V4dGVuZGVkL1BvbHlnb24nO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vZXh0ZW5kZWQvVG9vbHRpcCc7XG5cbmV4cG9ydCBkZWZhdWx0IEwuRWRpdFBsb3lnb24gPSBFeHRlbmRlZFBvbHlnb24uZXh0ZW5kKHtcbiAgX29sZEU6IHVuZGVmaW5lZCwgLy8gdG8gcmV1c2UgZXZlbnQgb2JqZWN0IGFmdGVyIFwiYmFkIGhvbGVcIiByZW1vdmluZyB0byBidWlsZCBuZXcgaG9sZVxuICBfazogMSwgLy8gdG8gZGVjcmVhc2UgJ2RpZmYnIHZhbHVlIHdoaWNoIGhlbHBzIGJ1aWxkIGEgaG9sZVxuICBfaG9sZXM6IFtdLFxuICBpbml0aWFsaXplIChsYXRsbmdzLCBvcHRpb25zKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZ3MsIG9wdGlvbnMpO1xuICAgIHRoaXMuX2luaXRXaXRoSG9sZXMobGF0bG5ncyk7XG5cbiAgICB0aGlzLm9wdGlvbnMuY2xhc3NOYW1lID0gXCJsZWFmbGV0LWNsaWNrYWJsZSBwb2x5Z29uXCI7XG4gIH0sXG4gIF91cGRhdGUgKGUpIHtcbiAgICB2YXIgbWFya2VyID0gZS5tYXJrZXI7XG5cbiAgICBpZiAobWFya2VyLl9tR3JvdXAuX2lzSG9sZSkge1xuICAgICAgdmFyIG1hcmtlcnMgPSBtYXJrZXIuX21Hcm91cC5fbWFya2VycztcbiAgICAgIG1hcmtlcnMgPSBtYXJrZXJzLmZpbHRlcigobWFya2VyKSA9PiAhbWFya2VyLmlzTWlkZGxlKCkpO1xuICAgICAgdGhpcy5faG9sZXNbbWFya2VyLl9tR3JvdXAucG9zaXRpb25dID0gbWFya2Vycy5tYXAoKG1hcmtlcikgPT4gbWFya2VyLmdldExhdExuZygpKTtcblxuICAgIH1cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBfcmVtb3ZlSG9sZSAoZSkge1xuICAgIHZhciBob2xlUG9zaXRpb24gPSBlLm1hcmtlci5fbUdyb3VwLnBvc2l0aW9uO1xuICAgIHRoaXMuX2hvbGVzLnNwbGljZShob2xlUG9zaXRpb24sIDEpO1xuXG4gICAgdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVtb3ZlTGF5ZXIoZS5tYXJrZXIuX21Hcm91cC5fbGVhZmxldF9pZCk7XG4gICAgdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkucmVwb3MoZS5tYXJrZXIuX21Hcm91cC5wb3NpdGlvbik7XG5cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBvbkFkZCAobWFwKSB7XG4gICAgTC5Qb2x5bGluZS5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgbWFwLm9mZignZWRpdG9yOmFkZF9tYXJrZXInKTtcbiAgICBtYXAub24oJ2VkaXRvcjphZGRfbWFya2VyJywgKGUpID0+IHRoaXMuX3VwZGF0ZShlKSk7XG4gICAgbWFwLm9mZignZWRpdG9yOmRyYWdfbWFya2VyJyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZHJhZ19tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZGVsZXRlX21hcmtlcicpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9tYXJrZXInLCAoZSkgPT4gdGhpcy5fdXBkYXRlKGUpKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6ZGVsZXRlX2hvbGUnKTtcbiAgICBtYXAub24oJ2VkaXRvcjpkZWxldGVfaG9sZScsIChlKSA9PiB0aGlzLl9yZW1vdmVIb2xlKGUpKTtcblxuICAgIHRoaXMub24oJ21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIGlmIChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmhhc0ZpcnN0TWFya2VyKCkpIHtcbiAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgIH0pO1xuICAgIHRoaXMub24oJ21vdXNlb3V0JywgKCkgPT4gbWFwLmZpcmUoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnKSk7XG4gIH0sXG4gIG9uUmVtb3ZlIChtYXApIHtcbiAgICB0aGlzLm9mZignbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3V0Jyk7XG5cbiAgICBtYXAub2ZmKCdlZGl0b3I6ZWRpdF9wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgIG1hcC5vZmYoJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdXQnKTtcblxuICAgIEwuUG9seWxpbmUucHJvdG90eXBlLm9uUmVtb3ZlLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgYWRkSG9sZSAoaG9sZSkge1xuICAgIHRoaXMuX2hvbGVzID0gdGhpcy5faG9sZXMgfHwgW107XG4gICAgdGhpcy5faG9sZXMucHVzaChob2xlKTtcblxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH0sXG4gIF9yZXNldExhc3RIb2xlICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgbWFwLmdldFNlbGVjdGVkTWFya2VyKCkucmVtb3ZlSG9sZSgpO1xuXG4gICAgaWYgKHRoaXMuX2sgPiAwLjAwMSkge1xuICAgICAgdGhpcy5fYWRkSG9sZSh0aGlzLl9vbGRFLCAwLjUpO1xuICAgIH1cbiAgfSxcbiAgY2hlY2tIb2xlSW50ZXJzZWN0aW9uICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG4gICAgaWYgKG1hcC5vcHRpb25zLmFsbG93SW50ZXJzZWN0aW9uIHx8IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCkuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGVITWFya2Vyc0dyb3VwTGF5ZXJzID0gdGhpcy5fbWFwLmdldEVITWFya2Vyc0dyb3VwKCkuZ2V0TGF5ZXJzKCk7XG4gICAgdmFyIGxhc3RIb2xlID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV07XG4gICAgdmFyIGxhc3RIb2xlTGF5ZXJzID0gZUhNYXJrZXJzR3JvdXBMYXllcnNbZUhNYXJrZXJzR3JvdXBMYXllcnMubGVuZ3RoIC0gMV0uZ2V0TGF5ZXJzKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RIb2xlTGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGF5ZXIgPSBsYXN0SG9sZUxheWVyc1tpXTtcblxuICAgICAgaWYgKGxheWVyLl9kZXRlY3RJbnRlcnNlY3Rpb25XaXRoSG9sZXMoKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAobGF5ZXIuX2lzT3V0c2lkZU9mUG9seWdvbih0aGlzLl9tYXAuZ2V0RU1hcmtlcnNHcm91cCgpKSkge1xuICAgICAgICB0aGlzLl9yZXNldExhc3RIb2xlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGVITWFya2Vyc0dyb3VwTGF5ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBlSG9sZU1hcmtlckdyb3VwTGF5ZXIgPSBlSE1hcmtlcnNHcm91cExheWVyc1tqXTtcblxuICAgICAgICBpZiAobGFzdEhvbGUgIT09IGVIb2xlTWFya2VyR3JvdXBMYXllciAmJiBlSG9sZU1hcmtlckdyb3VwTGF5ZXIuX2lzTWFya2VySW5Qb2x5Z29uKGxheWVyLmdldExhdExuZygpKSkge1xuICAgICAgICAgIHRoaXMuX3Jlc2V0TGFzdEhvbGUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IE1hcmtlciBmcm9tICcuLi9lZGl0L21hcmtlcic7XG5pbXBvcnQgc29ydCBmcm9tICcuLi91dGlscy9zb3J0QnlQb3NpdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IEwuQ2xhc3MuZXh0ZW5kKHtcbiAgaW5jbHVkZXM6IEwuTWl4aW4uRXZlbnRzLFxuXG4gIF9zZWxlY3RlZDogZmFsc2UsXG4gIF9sYXN0TWFya2VyOiB1bmRlZmluZWQsXG4gIF9maXJzdE1hcmtlcjogdW5kZWZpbmVkLFxuICBfcG9zaXRpb25IYXNoOiB1bmRlZmluZWQsXG4gIF9sYXN0UG9zaXRpb246IDAsXG4gIF9tYXJrZXJzOiBbXSxcbiAgb25BZGQgKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLmNsZWFyTGF5ZXJzKCk7XG4gICAgLy9MLkxheWVyR3JvdXAucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgb25SZW1vdmUgKG1hcCkge1xuICAgIC8vTC5MYXllckdyb3VwLnByb3RvdHlwZS5vblJlbW92ZS5jYWxsKHRoaXMsIG1hcCk7XG4gICAgdGhpcy5jbGVhckxheWVycygpO1xuICB9LFxuICBjbGVhckxheWVycyAoKSB7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKChtYXJrZXIpID0+IHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcihtYXJrZXIpO1xuICAgIH0pO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgfSxcbiAgYWRkVG8gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgfSxcbiAgYWRkTGF5ZXIgKG1hcmtlcikge1xuICAgIHRoaXMuX21hcC5hZGRMYXllcihtYXJrZXIpO1xuICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgIGlmIChtYXJrZXIucG9zaXRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWFya2Vycy5tb3ZlKHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMSwgbWFya2VyLnBvc2l0aW9uKTtcbiAgICB9XG4gICAgbWFya2VyLnBvc2l0aW9uID0gKG1hcmtlci5wb3NpdGlvbiAhPSBudWxsKSA/IG1hcmtlci5wb3NpdGlvbiA6IHRoaXMuX21hcmtlcnMubGVuZ3RoIC0gMTtcbiAgfSxcbiAgcmVtb3ZlICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuZ2V0TGF5ZXJzKCk7XG4gICAgbWFya2Vycy5fZWFjaCgobWFya2VyKSA9PiB7XG4gICAgICB3aGlsZSAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXIobWFya2VyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5faXNIb2xlKSB7XG4gICAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgICAgbWFwLmdldFZHcm91cCgpLnJlbW92ZUxheWVyKG1hcC5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmVMYXllciAobWFya2VyKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gbWFya2VyLnBvc2l0aW9uO1xuICAgIHRoaXMuX21hcC5yZW1vdmVMYXllcihtYXJrZXIpO1xuICAgIHRoaXMuX21hcmtlcnMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgfSxcbiAgZ2V0TGF5ZXJzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2VycztcbiAgfSxcbiAgZWFjaExheWVyIChjYikge1xuICAgIHRoaXMuX21hcmtlcnMuZm9yRWFjaChjYik7XG4gIH0sXG4gIG1hcmtlckF0IChwb3NpdGlvbikge1xuICAgIHZhciByc2x0ID0gdGhpcy5fbWFya2Vyc1twb3NpdGlvbl07XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdE1hcmtlcigpO1xuICAgIH1cblxuICAgIGlmIChyc2x0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJzbHQgPSB0aGlzLmxhc3RNYXJrZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcnNsdDtcbiAgfSxcbiAgZmlyc3RNYXJrZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrZXJzWzBdO1xuICB9LFxuICBsYXN0TWFya2VyICgpIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG4gICAgcmV0dXJuIG1hcmtlcnNbbWFya2Vycy5sZW5ndGggLSAxXTtcbiAgfSxcbiAgcmVtb3ZlTWFya2VyIChtYXJrZXIpIHtcbiAgICB2YXIgYiA9ICFtYXJrZXIuaXNNaWRkbGUoKTtcblxuICAgIHZhciBwcmV2TWFya2VyID0gbWFya2VyLl9wcmV2O1xuICAgIHZhciBuZXh0TWFya2VyID0gbWFya2VyLl9uZXh0O1xuICAgIHZhciBuZXh0bmV4dE1hcmtlciA9IG1hcmtlci5fbmV4dC5fbmV4dDtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KG1hcmtlci5wb3NpdGlvbik7XG4gICAgdGhpcy5yZW1vdmVNYXJrZXJBdChwcmV2TWFya2VyLnBvc2l0aW9uKTtcbiAgICB0aGlzLnJlbW92ZU1hcmtlckF0KG5leHRNYXJrZXIucG9zaXRpb24pO1xuXG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcblxuICAgIGlmICh0aGlzLmdldExheWVycygpLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2V0TWlkZGxlTWFya2VyKG5leHRuZXh0TWFya2VyLnBvc2l0aW9uKTtcblxuICAgICAgaWYgKGIpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfbWFya2VyJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9pc0hvbGUpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjpkZWxldGVfaG9sZScsIHttYXJrZXI6IG1hcmtlcn0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwLnJlbW92ZVBvbHlnb24obWFwLmdldEVQb2x5Z29uKCkpO1xuXG4gICAgICAgIG1hcC5maXJlKCdlZGl0b3I6ZGVsZXRlX3BvbHlnb24nKTtcbiAgICAgIH1cbiAgICAgIG1hcC5maXJlKCdlZGl0b3I6bWFya2VyX2dyb3VwX2NsZWFyJyk7XG4gICAgfVxuICB9LFxuICByZW1vdmVNYXJrZXJBdCAocG9zaXRpb24pIHtcbiAgICBpZiAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWFya2VyO1xuICAgIGlmICh0eXBlb2YgcG9zaXRpb24gPT09ICdudW1iZXInKSB7XG4gICAgICBtYXJrZXIgPSB0aGlzLm1hcmtlckF0KHBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBfY2hhbmdlUG9zID0gZmFsc2U7XG4gICAgdmFyIG1hcmtlcnMgPSB0aGlzLl9tYXJrZXJzO1xuICAgIG1hcmtlcnMuZm9yRWFjaCgoX21hcmtlcikgPT4ge1xuICAgICAgaWYgKF9jaGFuZ2VQb3MpIHtcbiAgICAgICAgX21hcmtlci5wb3NpdGlvbiA9IChfbWFya2VyLnBvc2l0aW9uID09PSAwKSA/IDAgOiBfbWFya2VyLnBvc2l0aW9uIC0gMTtcbiAgICAgIH1cbiAgICAgIGlmIChfbWFya2VyID09PSBtYXJrZXIpIHtcbiAgICAgICAgbWFya2VyLl9wcmV2Ll9uZXh0ID0gbWFya2VyLl9uZXh0O1xuICAgICAgICBtYXJrZXIuX25leHQuX3ByZXYgPSBtYXJrZXIuX3ByZXY7XG4gICAgICAgIF9jaGFuZ2VQb3MgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW1vdmVMYXllcihtYXJrZXIpO1xuXG4gICAgaWYgKG1hcmtlcnMubGVuZ3RoIDwgNSkge1xuICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgaWYgKCF0aGlzLl9pc0hvbGUpIHtcbiAgICAgICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICAgICAgbWFwLmdldEVQb2x5Z29uKCkuY2xlYXIoKTtcbiAgICAgICAgbWFwLmdldFZHcm91cCgpLnJlbW92ZUxheWVyKG1hcC5fZ2V0U2VsZWN0ZWRWTGF5ZXIoKSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBhZGRNYXJrZXIgKGxhdGxuZywgcG9zaXRpb24sIG9wdGlvbnMpIHtcbiAgICAvLyAxLiByZWNhbGN1bGF0ZSBwb3NpdGlvbnNcbiAgICBpZiAodHlwZW9mIGxhdGxuZyA9PT0gJ251bWJlcicpIHtcbiAgICAgIHBvc2l0aW9uID0gdGhpcy5tYXJrZXJBdChsYXRsbmcpLnBvc2l0aW9uO1xuICAgICAgdGhpcy5fcmVjYWxjUG9zaXRpb25zKHBvc2l0aW9uKTtcblxuICAgICAgdmFyIHByZXZNYXJrZXIgPSAocG9zaXRpb24gLSAxKSA8IDAgPyB0aGlzLmxhc3RNYXJrZXIoKSA6IHRoaXMubWFya2VyQXQocG9zaXRpb24gLSAxKTtcbiAgICAgIHZhciBuZXh0TWFya2VyID0gdGhpcy5tYXJrZXJBdCgocG9zaXRpb24gPT0gLTEpID8gMSA6IHBvc2l0aW9uKTtcbiAgICAgIGxhdGxuZyA9IHRoaXMuX2dldE1pZGRsZUxhdExuZyhwcmV2TWFya2VyLCBuZXh0TWFya2VyKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRMYXllcnMoKS5sZW5ndGggPT09IDApIHtcbiAgICAgIG9wdGlvbnMuZHJhZ2dhYmxlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Rmlyc3QoKSkge1xuICAgICAgb3B0aW9ucy5kcmFnZ2FibGUgPSAhdGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKTtcbiAgICB9XG5cbiAgICB2YXIgbWFya2VyID0gbmV3IE1hcmtlcih0aGlzLCBsYXRsbmcsIG9wdGlvbnMpO1xuICAgIGlmICghdGhpcy5fZmlyc3RNYXJrZXIpIHtcbiAgICAgIHRoaXMuX2ZpcnN0TWFya2VyID0gbWFya2VyO1xuICAgICAgdGhpcy5fbGFzdE1hcmtlciA9IG1hcmtlcjtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgbWFya2VyLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgfVxuXG4gICAgLy9pZiAodGhpcy5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgIC8vICBtYXJrZXIuZHJhZ2dpbmcuZGlzYWJsZSgpO1xuICAgIC8vfSBlbHNlIHtcbiAgICAvLyAgbWFya2VyLmRyYWdnaW5nLmVuYWJsZSgpO1xuICAgIC8vfVxuXG4gICAgdGhpcy5hZGRMYXllcihtYXJrZXIpO1xuXG4gICAge1xuICAgICAgbWFya2VyLnBvc2l0aW9uID0gKG1hcmtlci5wb3NpdGlvbiAhPT0gdW5kZWZpbmVkICkgPyBtYXJrZXIucG9zaXRpb24gOiB0aGlzLl9sYXN0UG9zaXRpb24rKztcbiAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMuX2xhc3RNYXJrZXI7XG4gICAgICB0aGlzLl9maXJzdE1hcmtlci5fcHJldiA9IG1hcmtlcjtcbiAgICAgIGlmIChtYXJrZXIuX3ByZXYpIHtcbiAgICAgICAgdGhpcy5fbGFzdE1hcmtlci5fbmV4dCA9IG1hcmtlcjtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5fZmlyc3RNYXJrZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2xhc3RNYXJrZXIgPSBtYXJrZXI7XG4gICAgfVxuXG4gICAgLy8gMi4gcmVjYWxjdWxhdGUgcmVsYXRpb25zXG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3JlY2FsY1JlbGF0aW9ucyhtYXJrZXIpO1xuICAgIH1cbiAgICAvLyAzLiB0cmlnZ2VyIGV2ZW50XG4gICAgaWYgKCFtYXJrZXIuaXNNaWRkbGUoKSkge1xuICAgICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjphZGRfbWFya2VyJywge21hcmtlcjogbWFya2VyfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfSxcbiAgY2xlYXIgKCkge1xuICAgIHZhciBpZHMgPSB0aGlzLl9pZHMoKTtcblxuICAgIHRoaXMuY2xlYXJMYXllcnMoKTtcblxuICAgIGlkcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgdGhpcy5fZGVsZXRlRXZlbnRzKGlkKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2xhc3RQb3NpdGlvbiA9IDA7XG5cbiAgICB0aGlzLl9maXJzdE1hcmtlciA9IHVuZGVmaW5lZDtcbiAgfSxcbiAgX2RlbGV0ZUV2ZW50cyAoaWQpIHtcbiAgICBkZWxldGUgdGhpcy5fbWFwLl9sZWFmbGV0X2V2ZW50cy52aWV3cmVzZXRfaWR4W2lkXTtcbiAgICBkZWxldGUgdGhpcy5fbWFwLl9sZWFmbGV0X2V2ZW50cy56b29tYW5pbV9pZHhbaWRdO1xuICB9LFxuICBfZ2V0TWlkZGxlTGF0TG5nIChtYXJrZXIxLCBtYXJrZXIyKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcCxcbiAgICAgIHAxID0gbWFwLnByb2plY3QobWFya2VyMS5nZXRMYXRMbmcoKSksXG4gICAgICBwMiA9IG1hcC5wcm9qZWN0KG1hcmtlcjIuZ2V0TGF0TG5nKCkpO1xuXG4gICAgcmV0dXJuIG1hcC51bnByb2plY3QocDEuX2FkZChwMikuX2RpdmlkZUJ5KDIpKTtcbiAgfSxcbiAgX3JlY2FsY1Bvc2l0aW9ucyAocG9zaXRpb24pIHtcbiAgICB2YXIgbWFya2VycyA9IHRoaXMuX21hcmtlcnM7XG5cbiAgICB2YXIgY2hhbmdlUG9zID0gZmFsc2U7XG4gICAgbWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIF9wb3NpdGlvbikgPT4ge1xuICAgICAgaWYgKHBvc2l0aW9uID09PSBfcG9zaXRpb24pIHtcbiAgICAgICAgY2hhbmdlUG9zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VQb3MpIHtcbiAgICAgICAgdGhpcy5fbWFya2Vyc1tfcG9zaXRpb25dLnBvc2l0aW9uICs9IDE7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9yZWNhbGNSZWxhdGlvbnMgKCkge1xuICAgIHZhciBtYXJrZXJzID0gdGhpcy5fbWFya2VycztcblxuICAgIG1hcmtlcnMuZm9yRWFjaCgobWFya2VyLCBwb3NpdGlvbikgPT4ge1xuXG4gICAgICBtYXJrZXIuX3ByZXYgPSB0aGlzLm1hcmtlckF0KHBvc2l0aW9uIC0gMSk7XG4gICAgICBtYXJrZXIuX25leHQgPSB0aGlzLm1hcmtlckF0KHBvc2l0aW9uICsgMSk7XG5cbiAgICAgIC8vIGZpcnN0XG4gICAgICBpZiAocG9zaXRpb24gPT09IDApIHtcbiAgICAgICAgbWFya2VyLl9wcmV2ID0gdGhpcy5sYXN0TWFya2VyKCk7XG4gICAgICAgIG1hcmtlci5fbmV4dCA9IHRoaXMubWFya2VyQXQoMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGxhc3RcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gbWFya2Vycy5sZW5ndGggLSAxKSB7XG4gICAgICAgIG1hcmtlci5fcHJldiA9IHRoaXMubWFya2VyQXQocG9zaXRpb24gLSAxKTtcbiAgICAgICAgbWFya2VyLl9uZXh0ID0gdGhpcy5tYXJrZXJBdCgwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX2lkcyAoKSB7XG4gICAgdmFyIHJzbHQgPSBbXTtcblxuICAgIGZvciAobGV0IGlkIGluIHRoaXMuX2xheWVycykge1xuICAgICAgcnNsdC5wdXNoKGlkKTtcbiAgICB9XG5cbiAgICByc2x0LnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcblxuICAgIHJldHVybiByc2x0O1xuICB9LFxuICBzZWxlY3QgKCkge1xuICAgIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fbWFwLl9zZWxlY3RlZE1Hcm91cCA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAodGhpcy5faXNIb2xlKSB7XG4gICAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldFNlbGVjdGlvbigpO1xuICAgICAgbWFwLmdldEVNYXJrZXJzR3JvdXAoKS5yZXNldFNlbGVjdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXAuZ2V0RUhNYXJrZXJzR3JvdXAoKS5yZXNldFNlbGVjdGlvbigpO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgbWFya2VyLnNlbGVjdEljb25Jbkdyb3VwKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgdGhpcy5fbWFwLl9zZWxlY3RlZE1Hcm91cCA9IHRoaXM7XG4gICAgdGhpcy5fbWFwLmZpcmUoJ2VkaXRvcjptYXJrZXJfZ3JvdXBfc2VsZWN0Jyk7XG4gIH0sXG4gIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiB0aGlzLmdldExheWVycygpLmxlbmd0aCA9PT0gMDtcbiAgfSxcbiAgcmVzZXRTZWxlY3Rpb24gKCkge1xuICAgIHRoaXMuZ2V0TGF5ZXJzKCkuX2VhY2goKG1hcmtlcikgPT4ge1xuICAgICAgbWFya2VyLnVuU2VsZWN0SWNvbkluR3JvdXAoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZCA9IGZhbHNlO1xuICB9XG59KSIsImV4cG9ydCBkZWZhdWx0IEwuQ29udHJvbC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICBidG5zOiBbXG4gICAgICAvL3sndGl0bGUnOiAncmVtb3ZlJywgJ2NsYXNzTmFtZSc6ICdmYSBmYS10cmFzaCd9XG4gICAgXSxcbiAgICBldmVudE5hbWU6IFwiY29udHJvbEFkZGVkXCJcbiAgfSxcbiAgX2J0bjogbnVsbCxcbiAgc3RvcEV2ZW50OiBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbixcbiAgaW5pdGlhbGl6ZSAob3B0aW9ucykge1xuICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICB9LFxuICBfdGl0bGVDb250YWluZXI6IG51bGwsXG4gIG9uQWRkIChtYXApIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG5cbiAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYmFyIGxlYWZsZXQtZWRpdG9yLWJ1dHRvbnMnKTtcblxuICAgIG1hcC5fY29udHJvbENvbnRhaW5lci5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9zZXRCdG4odGhpcy5vcHRpb25zLmJ0bnMsIGNvbnRhaW5lcik7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV2ZW50TmFtZSkge1xuICAgICAgICBtYXAuZmlyZSh0aGlzLm9wdGlvbnMuZXZlbnROYW1lLCB7Y29udHJvbDogdGhpc30pO1xuICAgICAgfVxuICAgIH0sIDEwMDApO1xuXG4gICAgbWFwLmdldEJ0bkNvbnRyb2wgPSAoKSA9PiB0aGlzO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX3NldEJ0biAob3B0cywgY29udGFpbmVyKSB7XG4gICAgdmFyIF9idG47XG4gICAgb3B0cy5mb3JFYWNoKChidG4sIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggPT09IG9wdHMubGVuZ3RoIC0gMSkge1xuICAgICAgICBidG4uY2xhc3NOYW1lICs9IFwiIGxhc3RcIjtcbiAgICAgIH1cbiAgICAgIC8vdmFyIGNoaWxkID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYnRuJyArIChidG4uY2xhc3NOYW1lID8gJyAnICsgYnRuLmNsYXNzTmFtZSA6ICcnKSk7XG5cbiAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICB2YXIgbGluayA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCAnbGVhZmxldC1idG4nLCB3cmFwcGVyKTtcbiAgICAgIGxpbmsuaHJlZiA9ICcjJztcblxuICAgICAgdmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcbiAgICAgIEwuRG9tRXZlbnRcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdkYmxjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcblxuICAgICAgbGluay5hcHBlbmRDaGlsZChMLkRvbVV0aWwuY3JlYXRlKCdpJywgJ2ZhJyArIChidG4uY2xhc3NOYW1lID8gJyAnICsgYnRuLmNsYXNzTmFtZSA6ICcnKSkpO1xuXG4gICAgICB2YXIgY2FsbGJhY2sgPSAoZnVuY3Rpb24gKG1hcCwgcHJlc3NFdmVudE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBtYXAuZmlyZShwcmVzc0V2ZW50TmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0odGhpcy5fbWFwLCBidG4ucHJlc3NFdmVudE5hbWUgfHwgJ2J0blByZXNzZWQnKSk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24obGluaywgJ2NsaWNrJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBjYWxsYmFjayk7XG5cbiAgICAgIF9idG4gPSBsaW5rO1xuICAgIH0pO1xuICAgIHRoaXMuX2J0biA9IF9idG47XG4gIH0sXG4gIGdldEJ0bkNvbnRhaW5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5fY29udHJvbENvcm5lcnNbJ3RvcGxlZnQnXTtcbiAgfSxcbiAgZ2V0QnRuQXQgKHBvcykge1xuICAgIHJldHVybiB0aGlzLmdldEJ0bkNvbnRhaW5lcigpLmNoaWxkW3Bvc107XG4gIH0sXG4gIGRpc2FibGVCdG4gKHBvcykge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLmdldEJ0bkF0KHBvcyksICdkaXNhYmxlZCcpO1xuICB9LFxuICBlbmFibGVCdG4gKHBvcykge1xuICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLmdldEJ0bkF0KHBvcyksICdkaXNhYmxlZCcpO1xuICB9XG59KTsiLCJpbXBvcnQgQnRuQ3RybCBmcm9tICcuL0J0bkNvbnRyb2wnO1xuXG5leHBvcnQgZGVmYXVsdCBCdG5DdHJsLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBldmVudE5hbWU6ICdsb2FkQnRuQWRkZWQnXG4gIH0sXG4gIG9uQWRkIChtYXApIHtcbiAgICB2YXIgY29udGFpbmVyID0gQnRuQ3RybC5wcm90b3R5cGUub25BZGQuY2FsbCh0aGlzLCBtYXApO1xuXG4gICAgbWFwLm9uKCdsb2FkQnRuQWRkZWQnLCAoKSA9PiB7XG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcblxuICAgICAgTC5Eb21FdmVudFxuICAgICAgICAub24odGhpcy5fYnRuLCAnY2xpY2snLCB0aGlzLnN0b3BFdmVudClcbiAgICAgICAgLm9uKHRoaXMuX2J0biwgJ2NsaWNrJywgdGhpcy5fdG9nZ2xlLCB0aGlzKTtcblxuICAgICAgdGhpcy5fbWFwLm9uKCdzZWFyY2hFbmFibGVkJywgdGhpcy5fY29sbGFwc2UsIHRoaXMpO1xuXG4gICAgICB0aGlzLl9yZW5kZXJGb3JtKGNvbnRhaW5lcik7XG4gICAgfSk7XG5cbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoY29udGFpbmVyLCAnbG9hZC1qc29uLWNvbnRhaW5lcicpO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfSxcbiAgX3RvZ2dsZSAoKSB7XG4gICAgaWYgKHRoaXMuX2Zvcm0uc3R5bGUuZGlzcGxheSAhPSAnYmxvY2snKSB7XG4gICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgdGhpcy5fdGV4dGFyZWEuZm9jdXMoKTtcbiAgICAgIHRoaXMuX21hcC5maXJlKCdsb2FkQnRuT3BlbmVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NvbGxhcHNlKCk7XG4gICAgICB0aGlzLl9tYXAuZmlyZSgnbG9hZEJ0bkhpZGRlbicpO1xuICAgIH1cbiAgfSxcbiAgX2NvbGxhcHNlICgpIHtcbiAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGhpcy5fdGV4dGFyZWEudmFsdWUgPSAnJztcbiAgfSxcbiAgX3JlbmRlckZvcm0gKGNvbnRhaW5lcikge1xuICAgIHZhciBmb3JtID0gdGhpcy5fZm9ybSA9IEwuRG9tVXRpbC5jcmVhdGUoJ2Zvcm0nKTtcblxuICAgIHZhciB0ZXh0YXJlYSA9IHRoaXMuX3RleHRhcmVhID0gTC5Eb21VdGlsLmNyZWF0ZSgndGV4dGFyZWEnKTtcbiAgICB0ZXh0YXJlYS5zdHlsZS53aWR0aCA9ICcyMDBweCc7XG4gICAgdGV4dGFyZWEuc3R5bGUuaGVpZ2h0ID0gJzEwMHB4JztcbiAgICB0ZXh0YXJlYS5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkIHdoaXRlJztcbiAgICB0ZXh0YXJlYS5zdHlsZS5wYWRkaW5nID0gJzVweCc7XG4gICAgdGV4dGFyZWEuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzRweCc7XG5cbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24odGV4dGFyZWEsICdjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHRleHRhcmVhLCAnbW91c2Vkb3duJywgdGhpcy5zdG9wRXZlbnQpXG4gICAgICAub24odGV4dGFyZWEsICdkYmxjbGljaycsIHRoaXMuc3RvcEV2ZW50KVxuICAgICAgLm9uKHRleHRhcmVhLCAnbW91c2V3aGVlbCcsIHRoaXMuc3RvcEV2ZW50KTtcblxuICAgIGZvcm0uYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuXG4gICAgdmFyIHN1Ym1pdEJ0biA9IHRoaXMuX3N1Ym1pdEJ0biA9IEwuRG9tVXRpbC5jcmVhdGUoJ2J1dHRvbicsICdsZWFmbGV0LXN1Ym1pdC1idG4nKTtcbiAgICBzdWJtaXRCdG4udHlwZSA9IFwic3VibWl0XCI7XG4gICAgc3VibWl0QnRuLmlubmVyVGV4dCA9IFwic3VibWl0XCI7XG5cbiAgICBMLkRvbUV2ZW50XG4gICAgICAub24oc3VibWl0QnRuLCAnY2xpY2snLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdtb3VzZWRvd24nLCB0aGlzLnN0b3BFdmVudClcbiAgICAgIC5vbihzdWJtaXRCdG4sICdjbGljaycsIHRoaXMuX3N1Ym1pdEZvcm0sIHRoaXMpO1xuXG4gICAgZm9ybS5hcHBlbmRDaGlsZChzdWJtaXRCdG4pO1xuXG4gICAgTC5Eb21FdmVudC5vbihmb3JtLCAnc3VibWl0JywgTC5Eb21FdmVudC5wcmV2ZW50RGVmYXVsdCk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuICB9LFxuICBfdGltZW91dDogbnVsbCxcbiAgX3N1Ym1pdEZvcm0gKCkge1xuICAgIGlmICh0aGlzLl90aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gICAgfVxuXG4gICAgdmFyIGpzb247XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICB0cnkge1xuICAgICAganNvbiA9IEpTT04ucGFyc2UodGhpcy5fdGV4dGFyZWEudmFsdWUpO1xuXG4gICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5qc29uV2FzTG9hZGVkLCBcInN1Y2Nlc3NcIik7XG5cbiAgICAgIG1hcC5jcmVhdGVFZGl0UG9seWdvbihqc29uKTtcblxuICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9LCAyMDAwKTtcblxuICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5jaGVja0pzb24sIFwiZXJyb3JcIik7XG5cbiAgICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuICB9LFxuICBfb25Nb3VzZU92ZXIgKCkge1xuICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLm1zZyh0aGlzLl9tYXAub3B0aW9ucy50ZXh0LmxvYWRKc29uKTtcbiAgfSxcbiAgX29uTW91c2VPdXQgKCkge1xuICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Db250cm9sLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHtcbiAgICBwb3NpdGlvbjogJ21zZ2NlbnRlcicsXG4gICAgZGVmYXVsdE1zZzogbnVsbFxuICB9LFxuICBpbml0aWFsaXplIChvcHRpb25zKSB7XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gIH0sXG4gIF90aXRsZUNvbnRhaW5lcjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIHZhciBjb3JuZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10b3AnKTtcbiAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWVkaXRvcicpO1xuXG4gICAgbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ10gPSBjb3JuZXI7XG4gICAgbWFwLl9jb250cm9sQ29udGFpbmVyLmFwcGVuZENoaWxkKGNvcm5lcik7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3NldENvbnRhaW5lcihjb250YWluZXIsIG1hcCk7XG4gICAgICBtYXAuZmlyZSgnbXNnSGVscGVyQWRkZWQnLCB7Y29udHJvbDogdGhpc30pO1xuXG4gICAgICB0aGlzLl9jaGFuZ2VQb3MobWFwKTtcbiAgICB9LCAxMDAwKTtcblxuICAgIG1hcC5nZXRCdG5Db250cm9sID0gKCkgPT4gdGhpcztcblxuICAgIHRoaXMuX2JpbmRFdmVudHMobWFwKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG4gIH0sXG4gIF9jaGFuZ2VQb3MgKG1hcCkge1xuICAgIHZhciBjb250cm9sQ29ybmVyID0gbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gICAgaWYgKGNvbnRyb2xDb3JuZXIgJiYgY29udHJvbENvcm5lci5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHZhciB3aWR0aCA9IGNvbnRyb2xDb3JuZXIuY2hpbGRyZW4uaXRlbSgpLmNoaWxkcmVuWzBdLmNsaWVudFdpZHRoO1xuICAgICAgaWYod2lkdGgpIHtcbiAgICAgICAgY29udHJvbENvcm5lci5zdHlsZS5sZWZ0ID0gKG1hcC5fY29udGFpbmVyLmNsaWVudFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCc7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfYmluZEV2ZW50cyAobWFwKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH0pO1xuICB9LFxuICBfc2V0Q29udGFpbmVyIChjb250YWluZXIsIG1hcCkge1xuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbXNnLWNvbnRhaW5lciB0aXRsZS1oaWRkZW4nKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fdGl0bGVDb250YWluZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnICE9PSBudWxsKSB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0TXNnO1xuICAgIH1cblxuICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLm1zZyA9ICh0ZXh0LCB0eXBlKSA9PiB7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1oaWRkZW4nKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLWVycm9yJyk7XG4gICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5fdGl0bGVDb250YWluZXIsICd0aXRsZS1zdWNjZXNzJyk7XG5cbiAgICAgIHRoaXMuX3RpdGxlQ29udGFpbmVyLmlubmVySFRNTCA9IHRleHQ7XG5cbiAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl90aXRsZUNvbnRhaW5lciwgJ3RpdGxlLScgKyB0eXBlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NoYW5nZVBvcyhtYXApO1xuICAgIH07XG5cbiAgICB0aGlzLl90aXRsZUNvbnRhaW5lci5oaWRlID0gKCkgPT4ge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX3RpdGxlQ29udGFpbmVyLCAndGl0bGUtaGlkZGVuJyk7XG4gICAgfTtcbiAgfSxcbiAgZ2V0QnRuQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLl9jb250cm9sQ29ybmVyc1snbXNnY2VudGVyJ107XG4gIH0sXG4gIGdldEJ0bkF0IChwb3MpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCdG5Db250YWluZXIoKS5jaGlsZFtwb3NdO1xuICB9LFxuICBkaXNhYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfSxcbiAgZW5hYmxlQnRuIChwb3MpIHtcbiAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5nZXRCdG5BdChwb3MpLCAnZGlzYWJsZWQnKTtcbiAgfVxufSk7IiwiZXhwb3J0IGRlZmF1bHQgTC5Qb2x5Z29uLmV4dGVuZCh7XG4gIGlzRW1wdHkgKCkge1xuICAgIHZhciBsYXRMbmdzID0gdGhpcy5nZXRMYXRMbmdzKCk7XG4gICAgcmV0dXJuIGxhdExuZ3MgPT09IG51bGwgfHwgbGF0TG5ncyA9PT0gdW5kZWZpbmVkIHx8IChsYXRMbmdzICYmIGxhdExuZ3MubGVuZ3RoID09PSAwKTtcbiAgfSxcbiAgZ2V0SG9sZSAoaG9sZUdyb3VwTnVtYmVyKSB7XG4gICAgaWYgKCEkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdO1xuICB9LFxuICBnZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlcikge1xuICAgIGlmICghJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAhJC5pc051bWVyaWMoaG9sZU51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXTtcbiAgfSxcbiAgZ2V0SG9sZXMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ob2xlcztcbiAgfSxcbiAgY2xlYXJIb2xlcyAoKSB7XG4gICAgdGhpcy5faG9sZXMgPSBbXTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9LFxuICBjbGVhciAoKSB7XG4gICAgdGhpcy5jbGVhckhvbGVzKCk7XG5cbiAgICBpZiAoJC5pc0FycmF5KHRoaXMuX2xhdGxuZ3MpICYmIHRoaXMuX2xhdGxuZ3NbMF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRMYXRMbmdzKFtdKTtcbiAgICB9XG4gIH0sXG4gIHVwZGF0ZUhvbGVQb2ludCAoaG9sZUdyb3VwTnVtYmVyLCBob2xlTnVtYmVyLCBsYXRsbmcpIHtcbiAgICBpZiAoJC5pc051bWVyaWMoaG9sZUdyb3VwTnVtYmVyKSAmJiAkLmlzTnVtZXJpYyhob2xlTnVtYmVyKSkge1xuICAgICAgdGhpcy5faG9sZXNbaG9sZUdyb3VwTnVtYmVyXVtob2xlTnVtYmVyXSA9IGxhdGxuZztcbiAgICB9IGVsc2UgaWYgKCQuaXNOdW1lcmljKGhvbGVHcm91cE51bWJlcikgJiYgISQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICB0aGlzLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdID0gbGF0bG5nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ob2xlcyA9IGxhdGxuZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHNldEhvbGVzIChsYXRsbmdzKSB7XG4gICAgdGhpcy5faG9sZXMgPSBsYXRsbmdzO1xuICB9LFxuICBzZXRIb2xlUG9pbnQgKGhvbGVHcm91cE51bWJlciwgaG9sZU51bWJlciwgbGF0bG5nKSB7XG4gICAgdmFyIGxheWVyID0gdGhpcy5nZXRMYXllcnMoKVswXTtcbiAgICBpZiAobGF5ZXIpIHtcbiAgICAgIGlmICgkLmlzTnVtZXJpYyhob2xlR3JvdXBOdW1iZXIpICYmICQuaXNOdW1lcmljKGhvbGVOdW1iZXIpKSB7XG4gICAgICAgIGxheWVyLl9ob2xlc1tob2xlR3JvdXBOdW1iZXJdW2hvbGVOdW1iZXJdID0gbGF0bG5nO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSkiLCJleHBvcnQgZGVmYXVsdCBMLkNsYXNzLmV4dGVuZCh7XG4gIF90aW1lOiAyMDAwLFxuICBpbml0aWFsaXplIChtYXAsIHRleHQsIHRpbWUpIHtcbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5fcG9wdXBQYW5lID0gbWFwLl9wYW5lcy5wb3B1cFBhbmU7XG4gICAgdGhpcy5fdGV4dCA9ICcnIHx8IHRleHQ7XG4gICAgdGhpcy5faXNTdGF0aWMgPSBmYWxzZTtcbiAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC10b29sdGlwJywgdGhpcy5fcG9wdXBQYW5lKTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuXG4gICAgdGhpcy5fdGltZSA9IHRpbWUgfHwgdGhpcy5fdGltZTtcbiAgfSxcblxuICBkaXNwb3NlICgpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbmVyKSB7XG4gICAgICB0aGlzLl9wb3B1cFBhbmUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICAgIHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gICdzdGF0aWMnIChpc1N0YXRpYykge1xuICAgIHRoaXMuX2lzU3RhdGljID0gaXNTdGF0aWMgfHwgdGhpcy5faXNTdGF0aWM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIF9yZW5kZXIgKCkge1xuICAgIHRoaXMuX2NvbnRhaW5lci5pbm5lckhUTUwgPSBcIjxzcGFuPlwiICsgdGhpcy5fdGV4dCArIFwiPC9zcGFuPlwiO1xuICB9LFxuICBfdXBkYXRlUG9zaXRpb24gKGxhdGxuZykge1xuICAgIHZhciBwb3MgPSB0aGlzLl9tYXAubGF0TG5nVG9MYXllclBvaW50KGxhdGxuZyksXG4gICAgICB0b29sdGlwQ29udGFpbmVyID0gdGhpcy5fY29udGFpbmVyO1xuXG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgdG9vbHRpcENvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2luaGVyaXQnO1xuICAgICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRvb2x0aXBDb250YWluZXIsIHBvcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX3Nob3dFcnJvciAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihsYXRsbmcpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1N0YXRpYykge1xuICAgICAgdGhpcy5fbWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9zaG93SW5mbyAobGF0bG5nKSB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5lcikge1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtc2hvdycpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtaW5mby10b29sdGlwJyk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGxhdGxuZyk7XG5cbiAgICBpZiAoIXRoaXMuX2lzU3RhdGljKSB7XG4gICAgICB0aGlzLl9tYXAub24oJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX2hpZGUgKCkge1xuICAgIGlmICh0aGlzLl9jb250YWluZXIpIHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LXNob3cnKTtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9jb250YWluZXIsICdsZWFmbGV0LWluZm8tdG9vbHRpcCcpO1xuICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuX2NvbnRhaW5lciwgJ2xlYWZsZXQtZXJyb3ItdG9vbHRpcCcpO1xuICAgIH1cbiAgICB0aGlzLl9tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgdGV4dCAodGV4dCkge1xuICAgIHRoaXMuX3RleHQgPSB0ZXh0IHx8IHRoaXMuX3RleHQ7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH0sXG4gIHNob3cgKGxhdGxuZywgdHlwZSA9ICdpbmZvJykge1xuXG4gICAgdGhpcy50ZXh0KCk7XG5cbiAgICBpZih0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihsYXRsbmcpO1xuICAgIH1cbiAgICBpZih0eXBlID09PSAnaW5mbycpIHtcbiAgICAgIHRoaXMuc2hvd0luZm8obGF0bG5nKTtcbiAgICB9XG4gIH0sXG4gIHNob3dJbmZvIChsYXRsbmcpIHtcbiAgICB0aGlzLl9zaG93SW5mbyhsYXRsbmcpO1xuXG4gICAgaWYgKHRoaXMuX2hpZGVJbmZvVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVJbmZvVGltZW91dCk7XG4gICAgICB0aGlzLl9oaWRlSW5mb1RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVJbmZvVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIHNob3dFcnJvciAobGF0bG5nKSB7XG4gICAgdGhpcy5fc2hvd0Vycm9yKGxhdGxuZyk7XG5cbiAgICBpZiAodGhpcy5faGlkZUVycm9yVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVFcnJvclRpbWVvdXQpO1xuICAgICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5faGlkZUVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoTC5VdGlsLmJpbmQodGhpcy5oaWRlLCB0aGlzKSwgdGhpcy5fdGltZSk7XG4gIH0sXG4gIGhpZGUgKCkge1xuICAgIHRoaXMuX2hpZGUoKTtcbiAgfSxcbiAgX29uTW91c2VNb3ZlIChlKSB7XG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oZS5sYXRsbmcpO1xuICB9LFxuICBzZXRUaW1lICh0aW1lKSB7XG4gICAgaWYgKHRpbWUpIHtcbiAgICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxufSk7IiwiaW1wb3J0IEJ0bkN0cmwgZnJvbSAnLi9CdG5Db250cm9sJztcblxuZXhwb3J0IGRlZmF1bHQgQnRuQ3RybC5leHRlbmQoe1xuICBvcHRpb25zOiB7XG4gICAgZXZlbnROYW1lOiAndHJhc2hBZGRlZCdcbiAgfSxcbiAgX2J0bjogbnVsbCxcbiAgb25BZGQgKG1hcCkge1xuICAgIG1hcC5vbignYnRuUHJlc3NlZCcsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9idG4gJiYgIUwuRG9tVXRpbC5oYXNDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpKSB7XG4gICAgICAgIHRoaXMuX29uUHJlc3NCdG4oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG1hcC5vbigndHJhc2hBZGRlZCcsICgpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuICAgIH0pO1xuXG4gICAgbWFwLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsICgpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcbiAgICB9KTtcblxuICAgIG1hcC5vbignZWRpdG9yOnN0YXJ0X2FkZF9uZXdfcG9seWdvbicsICgpID0+IHtcbiAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgICBMLkRvbUV2ZW50LmFkZExpc3RlbmVyKHRoaXMuX2J0biwgJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLCB0aGlzKTtcbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIodGhpcy5fYnRuLCAnbW91c2VvdXQnLCB0aGlzLl9vbk1vdXNlT3V0LCB0aGlzKTtcbiAgICB9KTtcblxuICAgIG1hcC5vbignZWRpdG9yOm1hcmtlcl9ncm91cF9jbGVhcicsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuICAgIG1hcC5vbignZWRpdG9yOmRlbGV0ZV9wb2x5Z29uJywgdGhpcy5fZGlzYWJsZUJ0biwgdGhpcyk7XG4gICAgbWFwLm9uKCdlZGl0b3I6ZGVsZXRlX2hvbGUnLCB0aGlzLl9kaXNhYmxlQnRuLCB0aGlzKTtcbiAgICBtYXAub24oJ2VkaXRvcjptYXBfY2xlYXJlZCcsIHRoaXMuX2Rpc2FibGVCdG4sIHRoaXMpO1xuXG4gICAgcmV0dXJuIEJ0bkN0cmwucHJvdG90eXBlLm9uQWRkLmNhbGwodGhpcywgbWFwKTtcbiAgfSxcbiAgX2Rpc2FibGVCdG4gKCkge1xuICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLl9idG4sICdkaXNhYmxlZCcpO1xuXG4gICAgTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3Zlcik7XG4gICAgTC5Eb21FdmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLl9idG4sICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQpO1xuICB9LFxuICBfb25QcmVzc0J0biAoKSB7XG4gICAgdmFyIG1hcCA9IHRoaXMuX21hcDtcbiAgICBpZiAobWFwLmdldEVNYXJrZXJzR3JvdXAoKS5nZXRMYXllcnMoKVswXS5faXNGaXJzdCkge1xuICAgICAgbWFwLmNsZWFyKCk7XG4gICAgICBtYXAubW9kZSgnZHJhdycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2VsZWN0ZWRNR3JvdXAgPSBtYXAuZ2V0U2VsZWN0ZWRNR3JvdXAoKTtcbiAgICAgIHNlbGVjdGVkTUdyb3VwLnJlbW92ZSgpO1xuICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuX2J0biwgJ2Rpc2FibGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX29uTW91c2VPdXQoKTtcbiAgfSxcbiAgX29uTW91c2VPdmVyICgpIHtcbiAgICB2YXIgbWFwID0gdGhpcy5fbWFwO1xuICAgIGlmIChtYXAuZ2V0RU1hcmtlcnNHcm91cCgpLmdldExheWVycygpWzBdLl9pc0ZpcnN0KSB7XG4gICAgICBtYXAuX21zZ0NvbnRhaW5lci5tc2cobWFwLm9wdGlvbnMudGV4dC5yZWplY3RDaGFuZ2VzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFwLl9tc2dDb250YWluZXIubXNnKG1hcC5vcHRpb25zLnRleHQuZGVsZXRlU2VsZWN0ZWRFZGdlcyk7XG4gICAgfVxuICB9LFxuICBfb25Nb3VzZU91dCAoKSB7XG4gICAgdGhpcy5fbWFwLl9tc2dDb250YWluZXIuaGlkZSgpO1xuICB9XG59KTsiLCJpbXBvcnQgc2VhcmNoIGZyb20gJy4uL3V0aWxzL3NlYXJjaCc7XG5pbXBvcnQgVHJhc2hCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvVHJhc2hCdG4nO1xuaW1wb3J0IExvYWRCdG4gZnJvbSAnLi4vZXh0ZW5kZWQvTG9hZEJ0bic7XG5pbXBvcnQgQnRuQ29udHJvbCBmcm9tICcuLi9leHRlbmRlZC9CdG5Db250cm9sJztcbmltcG9ydCBNc2dIZWxwZXIgZnJvbSAnLi4vZXh0ZW5kZWQvTXNnSGVscGVyJztcbmltcG9ydCBtIGZyb20gJy4uL3V0aWxzL21vYmlsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcbiAgc2VhcmNoKCk7XG5cbiAgdmFyIGdnbCA9IG5ldyBMLkdvb2dsZSgpO1xuXG4gIHRoaXMuYWRkTGF5ZXIoZ2dsKTtcblxuICB0aGlzLl9jb250cm9sTGF5ZXJzID0gbmV3IEwuQ29udHJvbC5MYXllcnMoe1xuICAgICdHb29nbGUnOiBnZ2xcbiAgfSk7XG5cbiAgdGhpcy5hZGRDb250cm9sKHRoaXMuX2NvbnRyb2xMYXllcnMpO1xuXG4gIHRoaXMudG91Y2hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5kb3VibGVDbGlja1pvb20uZGlzYWJsZSgpO1xuICAvL3RoaXMuc2Nyb2xsV2hlZWxab29tLmRpc2FibGUoKTtcbiAgdGhpcy5ib3hab29tLmRpc2FibGUoKTtcbiAgdGhpcy5rZXlib2FyZC5kaXNhYmxlKCk7XG5cbiAgdGhpcy5hZGRDb250cm9sKEwuY29udHJvbC5zZWFyY2goKSk7XG5cbiAgdmFyIHRyYXNoQnRuID0gbmV3IFRyYXNoQnRuKHtcbiAgICBidG5zOiBbXG4gICAgICB7J2NsYXNzTmFtZSc6ICdmYSBmYS10cmFzaCd9XG4gICAgXVxuICB9KTtcblxuICB2YXIgbG9hZEJ0biA9IG5ldyBMb2FkQnRuKHtcbiAgICBidG5zOiBbXG4gICAgICB7J2NsYXNzTmFtZSc6ICdmYSBmYS1hcnJvdy1jaXJjbGUtby1kb3duIGxvYWQnfVxuICAgIF1cbiAgfSk7XG5cbiAgdmFyIG1zZ0hlbHBlciA9IG5ldyBNc2dIZWxwZXIoe1xuICAgIGRlZmF1bHRNc2c6IHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXBcbiAgfSk7XG5cbiAgdGhpcy5vbignbXNnSGVscGVyQWRkZWQnLCAoZGF0YSkgPT4ge1xuICAgIHZhciBtc2dDb250YWluZXIgPSBkYXRhLmNvbnRyb2wuX3RpdGxlQ29udGFpbmVyO1xuXG4gICAgdGhpcy5fbXNnQ29udGFpbmVyID0gbXNnQ29udGFpbmVyO1xuICAgIHZhciB0ZXh0ID0gdGhpcy5vcHRpb25zLnRleHQ7XG5cbiAgICB0aGlzLm9uKCdlZGl0b3I6bWFya2VyX2dyb3VwX3NlbGVjdCcsICgpID0+IHtcblxuICAgICAgdGhpcy5vZmYoJ2VkaXRvcjpub3Rfc2VsZWN0ZWRfbWFya2VyX21vdXNlb3ZlcicpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOm5vdF9zZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb1NlbGVjdEVkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnNlbGVjdGVkX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpzZWxlY3RlZF9tYXJrZXJfbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb1JlbW92ZUFsbFNlbGVjdGVkRWRnZXMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6c2VsZWN0ZWRfbWlkZGxlX21hcmtlcl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjpzZWxlY3RlZF9taWRkbGVfbWFya2VyX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLm1zZyh0ZXh0LmNsaWNrVG9BZGROZXdFZGdlcyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gb24gZWRpdCBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjplZGl0X3BvbHlnb25fbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0RyYXdJbm5lckVkZ2VzKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm9mZignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcpO1xuICAgICAgdGhpcy5vbignZWRpdG9yOmVkaXRfcG9seWdvbl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgICAgbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgIH0pO1xuICAgICAgLy8gb24gdmlldyBwb2x5Z29uXG4gICAgICB0aGlzLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICAgIHRoaXMub24oJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0VkaXQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gICAgICB0aGlzLm9uKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0JywgKCkgPT4ge1xuICAgICAgICBtc2dDb250YWluZXIuaGlkZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBoaWRlIG1zZ1xuICAgIHRoaXMub2ZmKCdlZGl0b3I6bWFya2VyX21vdXNlb3V0Jyk7XG4gICAgdGhpcy5vbignZWRpdG9yOm1hcmtlcl9tb3VzZW91dCcsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgfSk7XG4gICAgLy8gb24gc3RhcnQgZHJhdyBwb2x5Z29uXG4gICAgdGhpcy5vZmYoJ2VkaXRvcjpmaXJzdF9tYXJrZXJfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmZpcnN0X21hcmtlcl9tb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIubXNnKHRleHQuY2xpY2tUb0pvaW5FZGdlcyk7XG4gICAgfSk7XG4gICAgLy8gZGJsY2xpY2sgdG8gam9pblxuICAgIHRoaXMub2ZmKCdlZGl0b3I6bGFzdF9tYXJrZXJfZGJsY2xpY2tfbW91c2VvdmVyJyk7XG4gICAgdGhpcy5vbignZWRpdG9yOmxhc3RfbWFya2VyX2RibGNsaWNrX21vdXNlb3ZlcicsICgpID0+IHtcbiAgICAgIG1zZ0NvbnRhaW5lci5tc2codGV4dC5kYmxjbGlja1RvSm9pbkVkZ2VzKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2VkaXRvcjpqb2luX3BhdGgnLCAoKSA9PiB7XG4gICAgICBtc2dDb250YWluZXIubXNnKHRoaXMub3B0aW9ucy50ZXh0LmNsaWNrVG9SZW1vdmVBbGxTZWxlY3RlZEVkZ2VzKTtcbiAgICB9KTtcblxuICAgIC8vdG9kbzogY29udGludWUgd2l0aCBvcHRpb24gJ2FsbG93Q29ycmVjdEludGVyc2VjdGlvbidcbiAgICB0aGlzLm9uKCdlZGl0b3I6aW50ZXJzZWN0aW9uX2RldGVjdGVkJywgKGRhdGEpID0+IHtcbiAgICAgIC8vIG1zZ1xuICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5tc2codGhpcy5vcHRpb25zLnRleHQuaW50ZXJzZWN0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1zZ0NvbnRhaW5lci5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWxlY3RlZE1hcmtlciA9IHRoaXMuZ2V0U2VsZWN0ZWRNYXJrZXIoKTtcblxuICAgICAgaWYoc2VsZWN0ZWRNYXJrZXIgJiYgIXNlbGVjdGVkTWFya2VyLl9tR3JvdXAuaGFzRmlyc3RNYXJrZXIoKSkge1xuICAgICAgICAvL3NldCBtYXJrZXIgc3R5bGVcbiAgICAgICAgaWYgKGRhdGEuaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgICAgLy9zZXQgJ2Vycm9yJyBzdHlsZVxuICAgICAgICAgIHNlbGVjdGVkTWFya2VyLnNldEludGVyc2VjdGVkU3R5bGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3Jlc3RvcmUgc3R5bGVcbiAgICAgICAgICBzZWxlY3RlZE1hcmtlci5yZXNldFN0eWxlKCk7XG4gICAgICAgICAgLy9yZXN0b3JlIG90aGVyIG1hcmtlcnMgd2hpY2ggYXJlIGFsc28gbmVlZCB0byByZXNldCBzdHlsZVxuICAgICAgICAgIHZhciBtYXJrZXJzVG9SZXNldCA9IHNlbGVjdGVkTWFya2VyLl9tR3JvdXAuZ2V0TGF5ZXJzKCkuZmlsdGVyKChsYXllcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIEwuRG9tVXRpbC5oYXNDbGFzcyhsYXllci5faWNvbiwgJ20tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvbicpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWFya2Vyc1RvUmVzZXQubWFwKChtYXJrZXIpID0+IG1hcmtlci5yZXNldFN0eWxlKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGlmICghbS5pc01vYmlsZUJyb3dzZXIoKSkge1xuICAgIHRoaXMuYWRkQ29udHJvbChtc2dIZWxwZXIpO1xuICAgIHRoaXMuYWRkQ29udHJvbChsb2FkQnRuKTtcbiAgfVxuXG4gIHRoaXMuYWRkQ29udHJvbCh0cmFzaEJ0bik7XG59IiwiaW1wb3J0IFZpZXdHcm91cCBmcm9tICcuL3ZpZXcvZ3JvdXAnO1xuaW1wb3J0IEVkaXRQb2x5Z29uIGZyb20gJy4vZWRpdC9wb2x5Z29uJztcbmltcG9ydCBIb2xlc0dyb3VwIGZyb20gJy4vZWRpdC9ob2xlc0dyb3VwJztcbmltcG9ydCBFZGl0TGluZUdyb3VwIGZyb20gJy4vZWRpdC9saW5lJztcbmltcG9ydCBEYXNoZWRFZGl0TGluZUdyb3VwIGZyb20gJy4vZHJhdy9kYXNoZWQtbGluZSc7XG5cbmltcG9ydCAnLi9lZGl0L21hcmtlci1ncm91cCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdmlld0dyb3VwOiBudWxsLFxuICBlZGl0R3JvdXA6IG51bGwsXG4gIGVkaXRQb2x5Z29uOiBudWxsLFxuICBlZGl0TWFya2Vyc0dyb3VwOiBudWxsLFxuICBlZGl0TGluZUdyb3VwOiBudWxsLFxuICBkYXNoZWRFZGl0TGluZUdyb3VwOiBudWxsLFxuICBlZGl0SG9sZU1hcmtlcnNHcm91cDogbnVsbCxcbiAgc2V0TGF5ZXJzICgpIHtcbiAgICB0aGlzLnZpZXdHcm91cCA9IG5ldyBWaWV3R3JvdXAoW10pO1xuICAgIHRoaXMuZWRpdEdyb3VwID0gbmV3IEwuRmVhdHVyZUdyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRQb2x5Z29uID0gbmV3IEVkaXRQb2x5Z29uKFtdKTtcbiAgICB0aGlzLmVkaXRNYXJrZXJzR3JvdXAgPSBuZXcgTC5NYXJrZXJHcm91cChbXSk7XG4gICAgdGhpcy5lZGl0TGluZUdyb3VwID0gbmV3IEVkaXRMaW5lR3JvdXAoW10pO1xuICAgIHRoaXMuZGFzaGVkRWRpdExpbmVHcm91cCA9IG5ldyBEYXNoZWRFZGl0TGluZUdyb3VwKFtdKTtcbiAgICB0aGlzLmVkaXRIb2xlTWFya2Vyc0dyb3VwID0gbmV3IEhvbGVzR3JvdXAoW10pO1xuICB9XG59IiwiaW1wb3J0IEJhc2UgZnJvbSAnLi9iYXNlJztcbmltcG9ydCBDb250cm9sc0hvb2sgZnJvbSAnLi9ob29rcy9jb250cm9scyc7XG5pbXBvcnQgRWRpdEV2ZW50c0hvb2sgZnJvbSAnLi9lZGl0L2hvb2tzL2V2ZW50cyc7XG5cbmltcG9ydCAqIGFzIGxheWVycyBmcm9tICcuL2xheWVycyc7XG5pbXBvcnQgKiBhcyBvcHRzIGZyb20gJy4vb3B0aW9ucyc7XG5cbmltcG9ydCAnLi91dGlscy9hcnJheSc7XG5cbmZ1bmN0aW9uIG1hcCgpIHtcbiAgdmFyIG1hcCA9IEwuTWFwLmV4dGVuZCgkLmV4dGVuZChCYXNlLCB7XG4gICAgJDogdW5kZWZpbmVkLFxuICAgIGluaXRpYWxpemUgKGlkLCBvcHRpb25zKSB7XG4gICAgICAkLmV4dGVuZChvcHRzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0cy5vcHRpb25zKTtcbiAgICAgIEwuTWFwLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwodGhpcywgaWQsIG9wdGlvbnMpO1xuICAgICAgdGhpcy4kID0gJCh0aGlzLl9jb250YWluZXIpO1xuXG4gICAgICBsYXllcnMuc2V0TGF5ZXJzKCk7XG5cbiAgICAgIHRoaXMuX2FkZExheWVycyhbXG4gICAgICAgIGxheWVycy52aWV3R3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdEdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRQb2x5Z29uXG4gICAgICAgICwgbGF5ZXJzLmVkaXRNYXJrZXJzR3JvdXBcbiAgICAgICAgLCBsYXllcnMuZWRpdExpbmVHcm91cFxuICAgICAgICAsIGxheWVycy5kYXNoZWRFZGl0TGluZUdyb3VwXG4gICAgICAgICwgbGF5ZXJzLmVkaXRIb2xlTWFya2Vyc0dyb3VwXG4gICAgICBdKTtcblxuICAgICAgdGhpcy5fc2V0T3ZlcmxheXMob3B0aW9ucyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUb0RyYXcpIHtcbiAgICAgICAgdGhpcy5tb2RlKCdkcmF3Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBfc2V0T3ZlcmxheXMgKG9wdHMpIHtcbiAgICAgIHZhciBvdmVybGF5cyA9IG9wdHMub3ZlcmxheXM7XG5cbiAgICAgIGZvciAodmFyIGkgaW4gb3ZlcmxheXMpIHtcbiAgICAgICAgdmFyIG9pID0gb3ZlcmxheXNbaV07XG4gICAgICAgIHRoaXMuX2NvbnRyb2xMYXllcnMuYWRkT3ZlcmxheShvaSwgaSk7XG4gICAgICAgIG9pLmFkZFRvKHRoaXMpO1xuICAgICAgICBvaS5icmluZ1RvQmFjaygpO1xuICAgICAgICBvaS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgb2kub24oJ21vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFZHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLnZpZXdHcm91cDtcbiAgICB9LFxuICAgIGdldEVHcm91cCAoKSB7XG4gICAgICByZXR1cm4gbGF5ZXJzLmVkaXRHcm91cDtcbiAgICB9LFxuICAgIGdldEVQb2x5Z29uICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdFBvbHlnb247XG4gICAgfSxcbiAgICBnZXRFTWFya2Vyc0dyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdE1hcmtlcnNHcm91cDtcbiAgICB9LFxuICAgIGdldEVMaW5lR3JvdXAgKCkge1xuICAgICAgcmV0dXJuIGxheWVycy5lZGl0TGluZUdyb3VwO1xuICAgIH0sXG4gICAgZ2V0REVMaW5lICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZGFzaGVkRWRpdExpbmVHcm91cDtcbiAgICB9LFxuICAgIGdldEVITWFya2Vyc0dyb3VwICgpIHtcbiAgICAgIHJldHVybiBsYXllcnMuZWRpdEhvbGVNYXJrZXJzR3JvdXA7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFBvbHlnb246ICgpID0+IHRoaXMuX3NlbGVjdGVkUG9seWdvbixcbiAgICBnZXRTZWxlY3RlZE1Hcm91cCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNR3JvdXA7XG4gICAgfVxuICB9KSk7XG5cbiAgbWFwLmFkZEluaXRIb29rKENvbnRyb2xzSG9vayk7XG4gIG1hcC5hZGRJbml0SG9vayhFZGl0RXZlbnRzSG9vayk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFwKCk7XG4iLCJpbXBvcnQgbSBmcm9tICcuL3V0aWxzL21vYmlsZSc7XG5cbnZhciBzaXplID0gMTtcbnZhciB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbmlmIChtLmlzTW9iaWxlQnJvd3NlcigpKSB7XG4gIHNpemUgPSAyO1xufVxuXG5leHBvcnQgdmFyIGZpcnN0SWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1kaXYtaWNvbi1maXJzdFwiLFxuICBpY29uU2l6ZTogWzggKiBzaXplLCA4ICogc2l6ZV1cbn0pO1xuXG5leHBvcnQgdmFyIGljb24gPSBMLmRpdkljb24oe1xuICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUsIDEwICogc2l6ZV1cbn0pO1xuXG5leHBvcnQgdmFyIGRyYWdJY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWRpdi1pY29uLWRyYWdcIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUgKiAzLCAxMCAqIHNpemUgKiAzXVxufSk7XG5cbmV4cG9ydCB2YXIgbWlkZGxlSWNvbiA9IEwuZGl2SWNvbih7XG4gIGNsYXNzTmFtZTogXCJtLWVkaXRvci1taWRkbGUtZGl2LWljb25cIixcbiAgaWNvblNpemU6IFsxMCAqIHNpemUsIDEwICogc2l6ZV1cblxufSk7XG5cbi8vIGRpc2FibGUgaG92ZXIgaWNvbiB0byBzaW1wbGlmeVxuXG5leHBvcnQgdmFyIGhvdmVySWNvbiA9IGljb24gfHwgTC5kaXZJY29uKHtcbiAgICBjbGFzc05hbWU6IFwibS1lZGl0b3ItZGl2LWljb25cIixcbiAgICBpY29uU2l6ZTogWzIgKiA3ICogc2l6ZSwgMiAqIDcgKiBzaXplXVxuICB9KTtcblxuZXhwb3J0IHZhciBpbnRlcnNlY3Rpb25JY29uID0gTC5kaXZJY29uKHtcbiAgY2xhc3NOYW1lOiBcIm0tZWRpdG9yLWludGVyc2VjdGlvbi1kaXYtaWNvblwiLFxuICBpY29uU2l6ZTogWzIgKiA3ICogc2l6ZSwgMiAqIDcgKiBzaXplXVxufSk7IiwidmFyIHZpZXdDb2xvciA9ICcjMDBGRkZGJztcbnZhciBkcmF3Q29sb3IgPSAnIzAwRjgwMCc7XG52YXIgZWRpdENvbG9yID0gJyMwMEY4MDAnO1xudmFyIHdlaWdodCA9IDM7XG5cbmV4cG9ydCB2YXIgb3B0aW9ucyA9IHtcbiAgYWxsb3dJbnRlcnNlY3Rpb246IGZhbHNlLFxuICBhbGxvd0NvcnJlY3RJbnRlcnNlY3Rpb246IGZhbHNlLCAvL3RvZG86IHVuZmluaXNoZWRcbiAgZm9yY2VUb0RyYXc6IHRydWUsXG4gIHRyYW5zbGF0aW9uczoge1xuICAgIHJlbW92ZVBvbHlnb246IFwicmVtb3ZlIHBvbHlnb25cIixcbiAgICByZW1vdmVQb2ludDogXCJyZW1vdmUgcG9pbnRcIlxuICB9LFxuICBvdmVybGF5czoge30sXG4gIHN0eWxlOiB7XG4gICAgdmlldzoge1xuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgZmlsbE9wYWNpdHk6IDAuMixcbiAgICAgIGRhc2hBcnJheTogbnVsbCxcbiAgICAgIGNsaWNrYWJsZTogZmFsc2UsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgY29sb3I6IHZpZXdDb2xvcixcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfSxcbiAgICBkcmF3OiB7XG4gICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICBmaWxsT3BhY2l0eTogMC4yLFxuICAgICAgZGFzaEFycmF5OiAnNSwgMTAnLFxuICAgICAgY2xpY2thYmxlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiBkcmF3Q29sb3IsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH1cbiAgfSxcbiAgbWFya2VySWNvbjogdW5kZWZpbmVkLFxuICBtYXJrZXJIb3Zlckljb246IHVuZGVmaW5lZCxcbiAgZXJyb3JMaW5lU3R5bGU6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgd2VpZ2h0OiAzLFxuICAgIG9wYWNpdHk6IDEsXG4gICAgc21vb3RoRmFjdG9yOiAxXG4gIH0sXG4gIHByZXZpZXdFcnJvckxpbmVTdHlsZToge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICB3ZWlnaHQ6IDMsXG4gICAgb3BhY2l0eTogMSxcbiAgICBzbW9vdGhGYWN0b3I6IDEsXG4gICAgZGFzaEFycmF5OiAnNSwgMTAnXG4gIH0sXG4gIHRleHQ6IHtcbiAgICBpbnRlcnNlY3Rpb246IFwiU2VsZi1pbnRlcnNlY3Rpb24gaXMgcHJvaGliaXRlZFwiLFxuICAgIGRlbGV0ZVBvaW50SW50ZXJzZWN0aW9uOiBcIkRlbGV0aW9uIG9mIHBvaW50IGlzIG5vdCBwb3NzaWJsZS4gU2VsZi1pbnRlcnNlY3Rpb24gaXMgcHJvaGliaXRlZFwiLFxuICAgIHJlbW92ZVBvbHlnb246IFwiUmVtb3ZlIHBvbHlnb25cIixcbiAgICBjbGlja1RvRWRpdDogXCJjbGljayB0byBlZGl0XCIsXG4gICAgY2xpY2tUb0FkZE5ld0VkZ2VzOiBcIjxkaXY+Y2xpY2smbmJzcDsmbmJzcDs8ZGl2IGNsYXNzPSdtLWVkaXRvci1taWRkbGUtZGl2LWljb24gc3RhdGljIGdyb3VwLXNlbGVjdGVkJz48L2Rpdj4mbmJzcDsmbmJzcDt0byBhZGQgbmV3IGVkZ2VzPC9kaXY+XCIsXG4gICAgY2xpY2tUb0RyYXdJbm5lckVkZ2VzOiBcImNsaWNrIHRvIGRyYXcgaW5uZXIgZWRnZXNcIixcbiAgICBjbGlja1RvSm9pbkVkZ2VzOiBcImNsaWNrIHRvIGpvaW4gZWRnZXNcIixcbiAgICBjbGlja1RvUmVtb3ZlQWxsU2VsZWN0ZWRFZGdlczogXCI8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItZGl2LWljb24gc3RhdGljIGdyb3VwLXNlbGVjdGVkJz48L2Rpdj4mbmJzcDsmbmJzcDt0byByZW1vdmUgZWRnZSZuYnNwOyZuYnNwO29yJm5ic3A7Jm5ic3A7PGkgY2xhc3M9J2ZhIGZhLXRyYXNoJz48L2k+Jm5ic3A7Jm5ic3A7dG8gcmVtb3ZlIGFsbCBzZWxlY3RlZCBlZGdlczwvZGl2PlwiLFxuICAgIGNsaWNrVG9TZWxlY3RFZGdlczogXCI8ZGl2PmNsaWNrJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItZGl2LWljb24gc3RhdGljJz48L2Rpdj4mbmJzcDsvJm5ic3A7PGRpdiBjbGFzcz0nbS1lZGl0b3ItbWlkZGxlLWRpdi1pY29uIHN0YXRpYyc+PC9kaXY+Jm5ic3A7Jm5ic3A7dG8gc2VsZWN0IGVkZ2VzPC9kaXY+XCIsXG4gICAgZGJsY2xpY2tUb0pvaW5FZGdlczogXCJkb3VibGUgY2xpY2sgdG8gam9pbiBlZGdlc1wiLFxuICAgIGNsaWNrVG9TdGFydERyYXdQb2x5Z29uT25NYXA6IFwiY2xpY2sgdG8gc3RhcnQgZHJhdyBwb2x5Z29uIG9uIG1hcFwiLFxuICAgIGRlbGV0ZVNlbGVjdGVkRWRnZXM6IFwiZGVsZXRlZCBzZWxlY3RlZCBlZGdlc1wiLFxuICAgIHJlamVjdENoYW5nZXM6IFwicmVqZWN0IGNoYW5nZXNcIixcbiAgICBqc29uV2FzTG9hZGVkOiBcIkpTT04gd2FzIGxvYWRlZFwiLFxuICAgIGNoZWNrSnNvbjogXCJjaGVjayBKU09OXCIsXG4gICAgbG9hZEpzb246IFwibG9hZCBHZW9KU09OXCJcbiAgfSxcbiAgd29ybGRDb3B5SnVtcDogdHJ1ZVxufTtcblxuZXhwb3J0IHZhciBkcmF3TGluZVN0eWxlID0ge1xuICBvcGFjaXR5OiAwLjcsXG4gIGZpbGw6IGZhbHNlLFxuICBmaWxsQ29sb3I6IGRyYXdDb2xvcixcbiAgY29sb3I6IGRyYXdDb2xvcixcbiAgd2VpZ2h0OiB3ZWlnaHQsXG4gIGRhc2hBcnJheTogJzUsIDEwJyxcbiAgc3Ryb2tlOiB0cnVlLFxuICBjbGlja2FibGU6IGZhbHNlXG59OyIsIkFycmF5LnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdGhpcy5zcGxpY2UodG8sIDAsIHRoaXMuc3BsaWNlKGZyb20sIDEpWzBdKTtcbn07XG5BcnJheS5wcm90b3R5cGUuX2VhY2ggPSBmdW5jdGlvbihmdW5jKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgZnVuYy5jYWxsKHRoaXMsIHRoaXNbaV0sIGkpO1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgQXJyYXk7XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGlzTW9iaWxlQnJvd3NlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjaGVjayA9IGZhbHNlO1xuICAgIChmdW5jdGlvbiAoYSkge1xuICAgICAgaWYgKC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm98YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsvaS50ZXN0KGEpIHx8IC8xMjA3fDYzMTB8NjU5MHwzZ3NvfDR0aHB8NTBbMS02XWl8Nzcwc3w4MDJzfGEgd2F8YWJhY3xhYyhlcnxvb3xzXFwtKXxhaShrb3xybil8YWwoYXZ8Y2F8Y28pfGFtb2l8YW4oZXh8bnl8eXcpfGFwdHV8YXIoY2h8Z28pfGFzKHRlfHVzKXxhdHR3fGF1KGRpfFxcLW18ciB8cyApfGF2YW58YmUoY2t8bGx8bnEpfGJpKGxifHJkKXxibChhY3xheil8YnIoZXx2KXd8YnVtYnxid1xcLShufHUpfGM1NVxcL3xjYXBpfGNjd2F8Y2RtXFwtfGNlbGx8Y2h0bXxjbGRjfGNtZFxcLXxjbyhtcHxuZCl8Y3Jhd3xkYShpdHxsbHxuZyl8ZGJ0ZXxkY1xcLXN8ZGV2aXxkaWNhfGRtb2J8ZG8oY3xwKW98ZHMoMTJ8XFwtZCl8ZWwoNDl8YWkpfGVtKGwyfHVsKXxlcihpY3xrMCl8ZXNsOHxleihbNC03XTB8b3N8d2F8emUpfGZldGN8Zmx5KFxcLXxfKXxnMSB1fGc1NjB8Z2VuZXxnZlxcLTV8Z1xcLW1vfGdvKFxcLnd8b2QpfGdyKGFkfHVuKXxoYWllfGhjaXR8aGRcXC0obXxwfHQpfGhlaVxcLXxoaShwdHx0YSl8aHAoIGl8aXApfGhzXFwtY3xodChjKFxcLXwgfF98YXxnfHB8c3x0KXx0cCl8aHUoYXd8dGMpfGlcXC0oMjB8Z298bWEpfGkyMzB8aWFjKCB8XFwtfFxcLyl8aWJyb3xpZGVhfGlnMDF8aWtvbXxpbTFrfGlubm98aXBhcXxpcmlzfGphKHR8dilhfGpicm98amVtdXxqaWdzfGtkZGl8a2VqaXxrZ3QoIHxcXC8pfGtsb258a3B0IHxrd2NcXC18a3lvKGN8ayl8bGUobm98eGkpfGxnKCBnfFxcLyhrfGx8dSl8NTB8NTR8XFwtW2Etd10pfGxpYnd8bHlueHxtMVxcLXd8bTNnYXxtNTBcXC98bWEodGV8dWl8eG8pfG1jKDAxfDIxfGNhKXxtXFwtY3J8bWUocmN8cmkpfG1pKG84fG9hfHRzKXxtbWVmfG1vKDAxfDAyfGJpfGRlfGRvfHQoXFwtfCB8b3x2KXx6eil8bXQoNTB8cDF8diApfG13YnB8bXl3YXxuMTBbMC0yXXxuMjBbMi0zXXxuMzAoMHwyKXxuNTAoMHwyfDUpfG43KDAoMHwxKXwxMCl8bmUoKGN8bSlcXC18b258dGZ8d2Z8d2d8d3QpfG5vayg2fGkpfG56cGh8bzJpbXxvcCh0aXx3dil8b3Jhbnxvd2cxfHA4MDB8cGFuKGF8ZHx0KXxwZHhnfHBnKDEzfFxcLShbMS04XXxjKSl8cGhpbHxwaXJlfHBsKGF5fHVjKXxwblxcLTJ8cG8oY2t8cnR8c2UpfHByb3h8cHNpb3xwdFxcLWd8cWFcXC1hfHFjKDA3fDEyfDIxfDMyfDYwfFxcLVsyLTddfGlcXC0pfHF0ZWt8cjM4MHxyNjAwfHJha3N8cmltOXxybyh2ZXx6byl8czU1XFwvfHNhKGdlfG1hfG1tfG1zfG55fHZhKXxzYygwMXxoXFwtfG9vfHBcXC0pfHNka1xcL3xzZShjKFxcLXwwfDEpfDQ3fG1jfG5kfHJpKXxzZ2hcXC18c2hhcnxzaWUoXFwtfG0pfHNrXFwtMHxzbCg0NXxpZCl8c20oYWx8YXJ8YjN8aXR8dDUpfHNvKGZ0fG55KXxzcCgwMXxoXFwtfHZcXC18diApfHN5KDAxfG1iKXx0MigxOHw1MCl8dDYoMDB8MTB8MTgpfHRhKGd0fGxrKXx0Y2xcXC18dGRnXFwtfHRlbChpfG0pfHRpbVxcLXx0XFwtbW98dG8ocGx8c2gpfHRzKDcwfG1cXC18bTN8bTUpfHR4XFwtOXx1cChcXC5ifGcxfHNpKXx1dHN0fHY0MDB8djc1MHx2ZXJpfHZpKHJnfHRlKXx2ayg0MHw1WzAtM118XFwtdil8dm00MHx2b2RhfHZ1bGN8dngoNTJ8NTN8NjB8NjF8NzB8ODB8ODF8ODN8ODV8OTgpfHczYyhcXC18ICl8d2ViY3x3aGl0fHdpKGcgfG5jfG53KXx3bWxifHdvbnV8eDcwMHx5YXNcXC18eW91cnx6ZXRvfHp0ZVxcLS9pLnRlc3QoYS5zdWJzdHIoMCwgNCkpKSB7XG4gICAgICAgIGNoZWNrID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KShuYXZpZ2F0b3IudXNlckFnZW50IHx8IG5hdmlnYXRvci52ZW5kb3IgfHwgd2luZG93Lm9wZXJhKTtcbiAgICByZXR1cm4gY2hlY2s7XG4gIH1cbn07IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICBMLkNvbnRyb2wuU2VhcmNoID0gTC5Db250cm9sLmV4dGVuZCh7XG4gICAgb3B0aW9uczoge1xuICAgICAgcG9zaXRpb246ICd0b3BsZWZ0JyxcbiAgICAgIHRpdGxlOiAnc2VhcmNoIGxvY2F0aW9uJyxcbiAgICAgIGVtYWlsOiAnJ1xuICAgIH0sXG5cbiAgICBvbkFkZCAobWFwKSB7XG4gICAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgICB2YXIgY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtYmFyIGxlYWZsZXQtc2VhcmNoLWJhcicpO1xuICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgIHZhciBsaW5rID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsICcnLCB3cmFwcGVyKTtcbiAgICAgIGxpbmsuaHJlZiA9ICcjJztcblxuICAgICAgdmFyIHN0b3AgPSBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbjtcbiAgICAgIEwuRG9tRXZlbnRcbiAgICAgICAgLm9uKGxpbmssICdjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnbW91c2Vkb3duJywgc3RvcClcbiAgICAgICAgLm9uKGxpbmssICdkYmxjbGljaycsIHN0b3ApXG4gICAgICAgIC5vbihsaW5rLCAnY2xpY2snLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgICAub24obGluaywgJ2NsaWNrJywgdGhpcy5fdG9nZ2xlLCB0aGlzKTtcblxuICAgICAgbGluay5hcHBlbmRDaGlsZChMLkRvbVV0aWwuY3JlYXRlKCdpJywgJ2ZhIGZhLXNlYXJjaCcpKTtcblxuICAgICAgdmFyIGZvcm0gPSB0aGlzLl9mb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO1xuXG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLl9pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICAgIEwuRG9tRXZlbnQub24oaW5wdXQsICdjbGljaycsIHN0b3ApO1xuXG4gICAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcblxuICAgICAgTC5Eb21FdmVudC5vbihmb3JtLCAnc3VibWl0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9kb1NlYXJjaChpbnB1dC52YWx1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIHRoaXMpLm9uKGZvcm0sICdzdWJtaXQnLCBMLkRvbUV2ZW50LnByZXZlbnREZWZhdWx0KTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcblxuXG4gICAgICB0aGlzLl9tYXAub24oJ2xvYWRCdG5PcGVuZWQnLCB0aGlzLl9jb2xsYXBzZSwgdGhpcyk7XG5cbiAgICAgIEwuRG9tRXZlbnQuYWRkTGlzdGVuZXIoY29udGFpbmVyLCAnbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIsIHRoaXMpO1xuICAgICAgTC5Eb21FdmVudC5hZGRMaXN0ZW5lcihjb250YWluZXIsICdtb3VzZW91dCcsIHRoaXMuX29uTW91c2VPdXQsIHRoaXMpO1xuXG4gICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG5cbiAgICBfdG9nZ2xlICgpIHtcbiAgICAgIGlmICh0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgIT0gJ2Jsb2NrJykge1xuICAgICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB0aGlzLl9pbnB1dC5mb2N1cygpO1xuICAgICAgICB0aGlzLl9tYXAuZmlyZSgnc2VhcmNoRW5hYmxlZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29sbGFwc2UoKTtcbiAgICAgICAgdGhpcy5fbWFwLmZpcmUoJ3NlYXJjaERpc2FibGVkJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9jb2xsYXBzZSAoKSB7XG4gICAgICB0aGlzLl9mb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB0aGlzLl9pbnB1dC52YWx1ZSA9ICcnO1xuICAgIH0sXG5cbiAgICBfbm9taW5hdGltQ2FsbGJhY2sgKHJlc3VsdHMpIHtcblxuICAgICAgaWYgKHRoaXMuX3Jlc3VsdHMpIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzdWx0c0NvbnRhaW5lciA9IHRoaXMuX3Jlc3VsdHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJzgwcHgnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1kgPSAnYXV0byc7XG4gICAgICByZXN1bHRzQ29udGFpbmVyLnN0eWxlLm92ZXJmbG93WCA9ICdoaWRkZW4nO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnd2hpdGUnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5tYXJnaW4gPSAnM3B4JztcbiAgICAgIHJlc3VsdHNDb250YWluZXIuc3R5bGUucGFkZGluZyA9ICcycHgnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXIgPSAnMnB4IGdyZXkgc29saWQnO1xuICAgICAgcmVzdWx0c0NvbnRhaW5lci5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnMnB4JztcblxuICAgICAgdmFyIGRpdlJlc3VsdHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkaXYgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnc2VhcmNoLXJlc3VsdHMtZWwnKTtcbiAgICAgICAgZGl2LmlubmVyVGV4dCA9IHJlc3VsdHNbaV0uZGlzcGxheV9uYW1lO1xuICAgICAgICBkaXYudGl0bGUgPSByZXN1bHRzW2ldLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgcmVzdWx0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAobWFwLCByZXN1bHQsIGRpdkVsKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGl2UmVzdWx0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3MoZGl2UmVzdWx0c1tqXSwgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3MoZGl2RWwsICdzZWxlY3RlZCcpO1xuXG4gICAgICAgICAgICB2YXIgYmJveCA9IHJlc3VsdC5ib3VuZGluZ2JveDtcbiAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoTC5sYXRMbmdCb3VuZHMoW1tiYm94WzBdLCBiYm94WzJdXSwgW2Jib3hbMV0sIGJib3hbM11dXSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSh0aGlzLl9tYXAsIHJlc3VsdHNbaV0sIGRpdikpO1xuXG4gICAgICAgIEwuRG9tRXZlbnQub24oZGl2LCAnY2xpY2snLCBMLkRvbUV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgTC5Eb21FdmVudC5vbihkaXYsICdtb3VzZXdoZWVsJywgTC5Eb21FdmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgICAgLm9uKGRpdiwgJ2NsaWNrJywgY2FsbGJhY2spO1xuXG4gICAgICAgIGRpdlJlc3VsdHMucHVzaChkaXYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9mb3JtLmFwcGVuZENoaWxkKHJlc3VsdHNDb250YWluZXIpO1xuXG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0cy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Jlc3VsdHMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2FsbGJhY2tJZDogMCxcblxuICAgIF9kb1NlYXJjaCAocXVlcnkpIHtcbiAgICAgIHZhciBjYWxsYmFjayA9ICdfbF9vc21nZW9jb2Rlcl8nICsgdGhpcy5fY2FsbGJhY2tJZCsrO1xuICAgICAgd2luZG93W2NhbGxiYWNrXSA9IEwuVXRpbC5iaW5kKHRoaXMuX25vbWluYXRpbUNhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHtcbiAgICAgICAgcTogcXVlcnksXG4gICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICdqc29uX2NhbGxiYWNrJzogY2FsbGJhY2tcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVtYWlsKVxuICAgICAgICBxdWVyeVBhcmFtcy5lbWFpbCA9IHRoaXMub3B0aW9ucy5lbWFpbDtcbiAgICAgIGlmICh0aGlzLl9tYXAuZ2V0Qm91bmRzKCkpXG4gICAgICAgIHF1ZXJ5UGFyYW1zLnZpZXdib3ggPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCkudG9CQm94U3RyaW5nKCk7XG4gICAgICB2YXIgdXJsID0gJ2h0dHA6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoJyArIEwuVXRpbC5nZXRQYXJhbVN0cmluZyhxdWVyeVBhcmFtcyk7XG4gICAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9LFxuICAgIF9vbk1vdXNlT3ZlciAoKSB7XG4gICAgICB0aGlzLl9tYXAuX21zZ0NvbnRhaW5lci5tc2codGhpcy5vcHRpb25zLnRpdGxlKTtcbiAgICB9LFxuICAgIF9vbk1vdXNlT3V0ICgpIHtcbiAgICAgIHRoaXMuX21hcC5fbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIEwuY29udHJvbC5zZWFyY2ggPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgTC5Db250cm9sLlNlYXJjaChvcHRpb25zKTtcbiAgfTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob2JqZWN0ID0ge30sIGFycmF5ID0gW10pIHtcbiAgdmFyIHJzbHQgPSBvYmplY3Q7XG5cbiAgdmFyIHRtcDtcbiAgdmFyIF9mdW5jID0gZnVuY3Rpb24gKGlkLCBpbmRleCkge1xuICAgIHZhciBwb3NpdGlvbiA9IHJzbHRbaWRdLnBvc2l0aW9uO1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocG9zaXRpb24gIT09IGluZGV4KSB7XG4gICAgICAgIHRtcCA9IHJzbHRbaWRdO1xuICAgICAgICByc2x0W2lkXSA9IHJzbHRbYXJyYXlbcG9zaXRpb25dXTtcbiAgICAgICAgcnNsdFthcnJheVtwb3NpdGlvbl1dID0gdG1wO1xuICAgICAgfVxuXG4gICAgICBpZiAocG9zaXRpb24gIT0gaW5kZXgpIHtcbiAgICAgICAgX2Z1bmMuY2FsbChudWxsLCBpZCwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgYXJyYXkuZm9yRWFjaChfZnVuYyk7XG5cbiAgcmV0dXJuIHJzbHQ7XG59OyIsImV4cG9ydCBkZWZhdWx0IEwuTXVsdGlQb2x5Z29uLmV4dGVuZCh7XG4gIGluaXRpYWxpemUgKGxhdGxuZ3MsIG9wdGlvbnMpIHtcbiAgICBMLk11bHRpUG9seWdvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIGxhdGxuZ3MsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5vbignbGF5ZXJhZGQnLCAoZSkgPT4ge1xuICAgICAgdmFyIG1WaWV3U3R5bGUgPSB0aGlzLl9tYXAub3B0aW9ucy5zdHlsZS52aWV3O1xuICAgICAgZS50YXJnZXQuc2V0U3R5bGUoJC5leHRlbmQoe1xuICAgICAgICBvcGFjaXR5OiAwLjcsXG4gICAgICAgIGZpbGxPcGFjaXR5OiAwLjM1LFxuICAgICAgICBjb2xvcjogJyMwMEFCRkYnXG4gICAgICB9LCBtVmlld1N0eWxlKSk7XG5cbiAgICAgIHRoaXMuX21hcC5fbW92ZUVQb2x5Z29uT25Ub3AoKTtcbiAgICB9KTtcbiAgfSxcbiAgb25BZGQgKG1hcCkge1xuICAgIEwuTXVsdGlQb2x5Z29uLnByb3RvdHlwZS5vbkFkZC5jYWxsKHRoaXMsIG1hcCk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZW92ZXInLCAoKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdmVyJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZighZU1hcmtlcnNHcm91cC5nZXRGaXJzdCgpLl9oYXNGaXJzdEljb24oKSkge1xuICAgICAgICAgIG1hcC5maXJlKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3ZlcicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5vbignbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICB2YXIgZU1hcmtlcnNHcm91cCA9IG1hcC5nZXRFTWFya2Vyc0dyb3VwKCk7XG4gICAgICBpZiAoZU1hcmtlcnNHcm91cC5pc0VtcHR5KCkpIHtcbiAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKCFlTWFya2Vyc0dyb3VwLmdldEZpcnN0KCkuX2hhc0ZpcnN0SWNvbigpKSB7XG4gICAgICAgICAgbWFwLmZpcmUoJ2VkaXRvcjp2aWV3X3BvbHlnb25fbW91c2VvdXQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBvblJlbW92ZSAobWFwKSB7XG4gICAgdGhpcy5vZmYoJ21vdXNlb3ZlcicpO1xuICAgIHRoaXMub2ZmKCdtb3VzZW91dCcpO1xuXG4gICAgbWFwLm9mZignZWRpdG9yOnZpZXdfcG9seWdvbl9tb3VzZW92ZXInKTtcbiAgICBtYXAub2ZmKCdlZGl0b3I6dmlld19wb2x5Z29uX21vdXNlb3V0Jyk7XG4gIH1cbn0pOyJdfQ==
