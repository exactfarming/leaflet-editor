/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 30);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return firstIcon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return icon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return dragIcon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return middleIcon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return hoverIcon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return intersectionIcon; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_mobile__ = __webpack_require__(2);


var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (__WEBPACK_IMPORTED_MODULE_0__utils_mobile__["a" /* default */].isMobileBrowser()) {
  size = 2;
}

var firstIcon = L.divIcon({
  className: "m-editor-div-icon-first",
  iconSize: [10 * size, 10 * size]
});

var icon = L.divIcon({
  className: "m-editor-div-icon",
  iconSize: [10 * size, 10 * size]
});

var dragIcon = L.divIcon({
  className: "m-editor-div-icon-drag",
  iconSize: [10 * size * 3, 10 * size * 3]
});

var middleIcon = L.divIcon({
  className: "m-editor-middle-div-icon",
  iconSize: [10 * size, 10 * size]

});

// disable hover icon to simplify

var hoverIcon = icon || L.divIcon({
  className: "m-editor-div-icon",
  iconSize: [2 * 7 * size, 2 * 7 * size]
});

var intersectionIcon = L.divIcon({
  className: "m-editor-intersection-div-icon",
  iconSize: [2 * 7 * size, 2 * 7 * size]
});

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.Control.extend({
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
  initialize(options) {
    L.Util.setOptions(this, options);
  },
  _titleContainer: null,
  onAdd(map) {
    map.on(this.options.pressEventName, () => {
      if (this._btn && !L.DomUtil.hasClass(this._btn, 'disabled')) {
        this._onPressBtn();
      }
    });

    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-editor-buttons');

    map._controlContainer.appendChild(container);

    var options = this.options;

    var self = this;
    setTimeout(() => {
      self._setBtn(options.btns, container);
      if (options.eventName) {
        map.fire(options.eventName, { control: self });
      }

      L.DomEvent.addListener(self._btn, 'mouseover', this._onMouseOver, this);
      L.DomEvent.addListener(self._btn, 'mouseout', this._onMouseOut, this);
    }, 1000);

    map.getBtnControl = () => this;

    return container;
  },
  _onPressBtn() {},
  _onMouseOver() {},
  _onMouseOut() {},
  _setBtn(opts, container) {
    var _btn;
    opts.forEach((btn, index) => {
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

      var callback = function (map, pressEventName) {
        return function () {
          map.fire(pressEventName);
        };
      }(this._map, btn.pressEventName || this.options.pressEventName);

      L.DomEvent.on(link, 'click', L.DomEvent.stopPropagation).on(link, 'click', callback);

      _btn = link;
    });
    this._btn = _btn;
  },
  getBtnContainer() {
    return this._map._controlCorners['topleft'];
  },
  getBtnAt(pos) {
    return this.getBtnContainer().child[pos];
  },
  disableBtn(pos) {
    L.DomUtil.addClass(this.getBtnAt(pos), 'disabled');
  },
  enableBtn(pos) {
    L.DomUtil.removeClass(this.getBtnAt(pos), 'disabled');
  }
}));

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  isMobileBrowser: function () {
    var check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
        check = true;
      }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }
});

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__extended_Polygon__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__extended_Tooltip__ = __webpack_require__(4);



/* harmony default export */ __webpack_exports__["a"] = (L.EditPloygon = __WEBPACK_IMPORTED_MODULE_0__extended_Polygon__["a" /* default */].extend({
  _oldE: undefined, // to reuse event object after "bad hole" removing to build new hole
  _k: 1, // to decrease 'diff' value which helps build a hole
  _holes: [],
  initialize(latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    this._initWithHoles(latlngs);

    this.options.className = "leaflet-clickable polygon";
  },
  _update(e) {
    var marker = e.marker;

    if (marker._mGroup._isHole) {
      var markers = marker._mGroup._markers;
      markers = markers.filter(marker => !marker.isMiddle());
      this._holes[marker._mGroup.position] = markers.map(marker => marker.getLatLng());
    }
    this.redraw();
  },
  _removeHole(e) {
    var holePosition = e.marker._mGroup.position;
    this._holes.splice(holePosition, 1);

    this._map.getEHMarkersGroup().removeLayer(e.marker._mGroup._leaflet_id);
    this._map.getEHMarkersGroup().repos(e.marker._mGroup.position);

    this.redraw();
  },
  onAdd(map) {
    L.Polyline.prototype.onAdd.call(this, map);

    map.off('editor:add_marker');
    map.on('editor:add_marker', e => this._update(e));
    map.off('editor:drag_marker');
    map.on('editor:drag_marker', e => this._update(e));
    map.off('editor:delete_marker');
    map.on('editor:delete_marker', e => this._update(e));
    map.off('editor:delete_hole');
    map.on('editor:delete_hole', e => this._removeHole(e));

    this.on('mousemove', e => {
      map.fire('editor:edit_polygon_mousemove', { layerPoint: e.layerPoint });
    });

    this.on('mouseout', () => map.fire('editor:edit_polygon_mouseout'));
  },
  onRemove(map) {
    this.off('mousemove');
    this.off('mouseout');

    map.off('editor:edit_polygon_mouseover');
    map.off('editor:edit_polygon_mouseout');

    L.Polyline.prototype.onRemove.call(this, map);
  },
  addHole(hole) {
    this._holes = this._holes || [];
    this._holes.push(hole);

    this.redraw();
  },
  hasHoles() {
    return this._holes.length > 0;
  },
  _resetLastHole() {
    var map = this._map;

    map.getSelectedMarker().removeHole();

    if (this._k > 0.001) {
      this._addHole(this._oldE, 0.5);
    }
  },
  checkHoleIntersection() {
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
}));

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony default export */ var _unused_webpack_default_export = (L.Class.extend({
  _time: 2000,
  initialize(map, text, time) {
    this._map = map;
    this._popupPane = map._panes.popupPane;
    this._text = '' || text;
    this._isStatic = false;
    this._container = L.DomUtil.create('div', 'leaflet-tooltip', this._popupPane);

    this._render();

    this._time = time || this._time;
  },

  dispose() {
    if (this._container) {
      this._popupPane.removeChild(this._container);
      this._container = null;
    }
  },

  'static'(isStatic) {
    this._isStatic = isStatic || this._isStatic;
    return this;
  },
  _render() {
    this._container.innerHTML = "<span>" + this._text + "</span>";
  },
  _updatePosition(latlng) {
    var pos = this._map.latLngToLayerPoint(latlng),
        tooltipContainer = this._container;

    if (this._container) {
      tooltipContainer.style.visibility = 'inherit';
      L.DomUtil.setPosition(tooltipContainer, pos);
    }

    return this;
  },

  _showError(latlng) {
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

  _showInfo(latlng) {
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

  _hide() {
    if (this._container) {
      L.DomUtil.removeClass(this._container, 'leaflet-show');
      L.DomUtil.removeClass(this._container, 'leaflet-info-tooltip');
      L.DomUtil.removeClass(this._container, 'leaflet-error-tooltip');
    }
    this._map.off('mousemove', this._onMouseMove, this);
    return this;
  },

  text(text) {
    this._text = text || this._text;
    this._render();
  },
  show(latlng, type = 'info') {

    this.text();

    if (type === 'error') {
      this.showError(latlng);
    }
    if (type === 'info') {
      this.showInfo(latlng);
    }
  },
  showInfo(latlng) {
    this._showInfo(latlng);

    if (this._hideInfoTimeout) {
      clearTimeout(this._hideInfoTimeout);
      this._hideInfoTimeout = null;
    }

    this._hideInfoTimeout = setTimeout(L.Util.bind(this.hide, this), this._time);
  },
  showError(latlng) {
    this._showError(latlng);

    if (this._hideErrorTimeout) {
      clearTimeout(this._hideErrorTimeout);
      this._hideErrorTimeout = null;
    }

    this._hideErrorTimeout = setTimeout(L.Util.bind(this.hide, this), this._time);
  },
  hide() {
    this._hide();
  },
  _onMouseMove(e) {
    this._updatePosition(e.latlng);
  },
  setTime(time) {
    if (time) {
      this._time = time;
    }
  }
}));

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.FeatureGroup.extend({
  update() {
    var map = this._map;
    map._convertToEdit(map.getEMarkersGroup());
    map.getEMarkersGroup()._connectMarkers();
    //    map.getEPolygon().setStyle(map.editStyle[map._getModeType()]);
  }
}));

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__options__ = __webpack_require__(7);


/* harmony default export */ __webpack_exports__["a"] = (L.Polyline.extend({
  options: __WEBPACK_IMPORTED_MODULE_0__options__["a" /* default */].style.drawLine,
  _latlngToMove: undefined,
  onAdd: function (map) {
    L.Polyline.prototype.onAdd.call(this, map);
    this.setStyle(map.options.style.drawLine);
  },
  addLatLng(latlng) {
    if (this._latlngToMove) {
      this._latlngToMove = undefined;
    }

    if (this._latlngs.length > 1) {
      this._latlngs.splice(-1);
    }

    this._latlngs.push(L.latLng(latlng));

    return this.redraw();
  },
  update(pos) {

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
  _addLine(line, group, isLastMarker) {
    if (!isLastMarker) {
      line.addTo(group);
    }
  },
  clear() {
    this.setLatLngs([]);
  }
}));

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const viewColor = '#00FFFF';
const drawColor = '#00F800';
const weight = 3;

/* harmony default export */ __webpack_exports__["a"] = ({
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
  worldCopyJump: true,
  geoJSONArea: null
});

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__extended_Tooltip__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__marker_icons__ = __webpack_require__(0);



var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (userAgent.indexOf("ipad") !== -1 || userAgent.indexOf("iphone") !== -1) {
  size = 2;
}

var tooltip;
var dragend = false;
var _markerToDeleteGroup = null;

/* harmony default export */ __webpack_exports__["a"] = (L.Marker.extend({
  _draggable: undefined, // an instance of L.Draggable
  _oldLatLngState: undefined,
  initialize(group, latlng, options = {}) {

    options = $.extend({
      icon: __WEBPACK_IMPORTED_MODULE_1__marker_icons__["d" /* icon */],
      draggable: false
    }, options);

    L.Marker.prototype.initialize.call(this, latlng, options);

    this._mGroup = group;

    this._isFirst = group.getLayers().length === 0;
  },
  removeGroup() {
    if (this._mGroup._isHole) {
      this._mGroup.removeHole();
    } else {
      this._mGroup.remove();
    }
  },
  remove() {
    if (this._map) {
      this._mGroup.removeSelected();
    }
  },
  removeHole() {
    // deprecated
    this.removeGroup();
  },
  next() {
    var next = this._next._next;
    if (!this._next.isMiddle()) {
      next = this._next;
    }
    return next;
  },
  prev() {
    var prev = this._prev._prev;
    if (!this._prev.isMiddle()) {
      prev = this._prev;
    }
    return prev;
  },
  changePrevNextPos() {
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
  resetEvents(callback) {
    if (callback) {
      callback.call(this);
    }
  },
  _posHash() {
    return this._prev.position + '_' + this.position + '_' + this._next.position;
  },
  _resetIcon(_icon) {
    if (this._hasFirstIcon()) {
      return;
    }
    var ic = _icon || __WEBPACK_IMPORTED_MODULE_1__marker_icons__["d" /* icon */];

    this.setIcon(ic);
    this.prev().setIcon(ic);
    this.next().setIcon(ic);
  },
  _setHoverIcon(_hIcon) {
    if (this._hasFirstIcon()) {
      return;
    }
    this.setIcon(_hIcon || __WEBPACK_IMPORTED_MODULE_1__marker_icons__["c" /* hoverIcon */]);
  },
  _addIconClass(className) {
    L.DomUtil.addClass(this._icon, className);
  },
  _removeIconClass(className) {
    L.DomUtil.removeClass(this._icon, className);
  },
  _setIntersectionIcon() {
    var iconClass = __WEBPACK_IMPORTED_MODULE_1__marker_icons__["e" /* intersectionIcon */].options.className;
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
  _setFirstIcon() {
    this._isFirst = true;
    this.setIcon(__WEBPACK_IMPORTED_MODULE_1__marker_icons__["b" /* firstIcon */]);
  },
  _hasFirstIcon() {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-div-icon-first');
  },
  _setMiddleIcon() {
    this.setIcon(__WEBPACK_IMPORTED_MODULE_1__marker_icons__["f" /* middleIcon */]);
  },
  isMiddle() {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-middle-div-icon') && !L.DomUtil.hasClass(this._icon, 'leaflet-drag-target');
  },
  _setDragIcon() {
    this._removeIconClass('m-editor-div-icon');
    this.setIcon(__WEBPACK_IMPORTED_MODULE_1__marker_icons__["a" /* dragIcon */]);
  },
  isPlain() {
    return L.DomUtil.hasClass(this._icon, 'm-editor-div-icon') || L.DomUtil.hasClass(this._icon, 'm-editor-intersection-div-icon');
  },
  _onceClick() {
    if (this._isFirst) {
      this.once('click', e => {
        if (!this._hasFirstIcon()) {
          return;
        }
        var map = this._map;
        var mGroup = this._mGroup;

        if (mGroup._markers.length < 3) {
          this._onceClick();
          return;
        }

        var latlng = e.target._latlng;
        this._map._storedLayerPoint = e.target;

        var hasIntersection = mGroup.hasIntersection(latlng);

        if (hasIntersection) {
          //map._showIntersectionError();
          this._onceClick(); // bind 'once' again until has intersection
        } else {
          this._isFirst = false;
          this.setIcon(__WEBPACK_IMPORTED_MODULE_1__marker_icons__["d" /* icon */]);
          //mGroup.setSelected(this);
          map.fire('editor:__join_path', { mGroup: mGroup });
        }
      });
    }
  },
  _detectGroupDelete() {
    let map = this._map;

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
        let plainMarkersLen = selectedMGroup.getLayers().filter(item => {
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
  isAcceptedToDelete() {
    return _markerToDeleteGroup === this && this.isSelectedInGroup();
  },
  _bindCommonEvents() {
    this.on('click', e => {
      var map = this._map;

      if (this._detectGroupDelete()) {
        map.msgHelper.msg(map.options.text.acceptDeletion, 'error', this);
        return;
      }

      this._map._storedLayerPoint = e.target;

      var mGroup = this._mGroup;

      if (mGroup.hasFirstMarker() && this !== mGroup.getFirst()) {
        return;
      }

      if (this._hasFirstIcon() && this._mGroup.hasIntersection(this.getLatLng(), true)) {
        map.edgesIntersected(false);
        return;
      }

      mGroup.setSelected(this);
      if (this._hasFirstIcon()) {
        return;
      }

      if (mGroup.getFirst()._hasFirstIcon()) {
        return;
      }

      if (!this.isSelectedInGroup()) {
        mGroup.select();

        if (this.isMiddle()) {
          map.msgHelper.msg(map.options.text.clickToAddNewEdges, null, this);
        } else {
          map.msgHelper.msg(map.options.text.clickToRemoveAllSelectedEdges, null, this);
        }

        return;
      }

      if (this.isMiddle()) {
        //add edge
        mGroup.setMiddleMarkers(this.position);
        this._resetIcon(__WEBPACK_IMPORTED_MODULE_1__marker_icons__["d" /* icon */]);
        mGroup.select();
        map.msgHelper.msg(map.options.text.clickToRemoveAllSelectedEdges, null, this);
        _markerToDeleteGroup = null;
      } else {
        //remove edge
        if (!mGroup.getFirst()._hasFirstIcon() && !dragend) {
          map.msgHelper.hide();

          var rsltIntersection = this._detectIntersection({ target: { _latlng: mGroup._getMiddleLatLng(this.prev(), this.next()) } });

          if (rsltIntersection) {
            this.resetStyle();
            map._showIntersectionError(map.options.text.deletePointIntersection);
            this._previewErrorLine();
            return;
          }

          var oldLatLng = this.getLatLng();

          var nextMarker = this.next();
          mGroup.removeMarker(this);

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

    this.on('mouseover', () => {
      var map = this._map;
      if (this._mGroup.getFirst()._hasFirstIcon()) {
        if (this._mGroup.getLayers().length > 2) {
          if (this._hasFirstIcon()) {
            map.fire('editor:first_marker_mouseover', { marker: this });
          } else if (this === this._mGroup._lastMarker) {
            map.fire('editor:last_marker_dblclick_mouseover', { marker: this });
          }
        }
      } else {
        if (this.isSelectedInGroup()) {
          if (this.isMiddle()) {
            map.fire('editor:selected_middle_marker_mouseover', { marker: this });
          } else {
            map.fire('editor:selected_marker_mouseover', { marker: this });
          }
        } else {
          map.fire('editor:not_selected_marker_mouseover', { marker: this });
        }
      }
      if (this.isAcceptedToDelete()) {
        map.msgHelper.msg(map.options.text.acceptDeletion, 'error', this);
      }
    });
    this.on('mouseout', () => {
      this._map.fire('editor:marker_mouseout');
    });

    this._onceClick();

    this.on('dblclick', () => {
      var mGroup = this._mGroup;
      if (mGroup && mGroup.getFirst() && mGroup.getFirst()._hasFirstIcon()) {
        if (this === mGroup._lastMarker) {
          mGroup.getFirst().fire('click');
          //this._map.fire('editor:__join_path', {marker: this});
        }
      }
    });

    this.on('drag', e => {
      var marker = e.target;

      marker.changePrevNextPos();

      var map = this._map;
      map._convertToEdit(map.getEMarkersGroup());

      this._setDragIcon();

      map.fire('editor:drag_marker', { marker: this });
    });

    this.on('dragend', () => {

      this._mGroup.select();
      this._map.fire('editor:dragend_marker', { marker: this });

      dragend = true;
      setTimeout(() => {
        dragend = false;
      }, 200);

      this._map.fire('editor:selected_marker_mouseover', { marker: this });
    });
  },
  _isInsideHole() {
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
  _isOutsideOfPolygon(polygon) {
    return !polygon._isMarkerInPolygon(this.getLatLng());
  },
  _detectIntersection(e) {
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
  _detectIntersectionWithHoles(e) {
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

          layers._each(layer => {
            if (this._mGroup._isMarkerInPolygon(layer.getLatLng())) {
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
  onAdd(map) {
    L.Marker.prototype.onAdd.call(this, map);

    this.on('dragstart', e => {
      this._storedLayerPoint = null; //reset point

      this._mGroup.setSelected(this);
      this._oldLatLngState = e.target._latlng;

      if (this._prev.isPlain()) {
        this._mGroup.setMiddleMarkers(this.position);
      }
    }).on('drag', e => {
      this._onDrag(e);
    }).on('dragend', e => {
      this._onDragEnd(e);
    });

    this.on('mousedown', () => {
      if (!this.dragging._enabled) {
        return false;
      }
    });

    this._bindCommonEvents(map);
  },
  _onDrag(e) {
    this._detectIntersection(e);
  },
  _onDragEnd(e) {
    var rslt = this._detectIntersection(e);
    if (rslt && !this._map.options.allowCorrectIntersection) {
      this._restoreOldPosition();
    }
  },
  //todo: continue with option 'allowCorrectIntersection'
  _restoreOldPosition() {
    var map = this._map;
    if (map.edgesIntersected()) {
      let stateLatLng = this._oldLatLngState;
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
  _animateZoom(opt) {
    if (this._map) {
      var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

      this._setPos(pos);
    }
  },
  resetIcon() {
    this._removeIconClass('m-editor-intersection-div-icon');
    this._removeIconClass('m-editor-div-icon-drag');
  },
  unSelectIconInGroup() {
    this._removeIconClass('group-selected');
  },
  _selectIconInGroup() {
    if (!this.isMiddle()) {
      this._addIconClass('m-editor-div-icon');
    }
    this._addIconClass('group-selected');
  },
  selectIconInGroup() {
    if (this._prev) {
      this._prev._selectIconInGroup();
    }
    this._selectIconInGroup();
    if (this._next) {
      this._next._selectIconInGroup();
    }
  },
  isSelectedInGroup() {
    return L.DomUtil.hasClass(this._icon, 'group-selected');
  },
  onRemove(map) {
    this.off('mouseout');

    L.Marker.prototype.onRemove.call(this, map);
  },
  _errorLines: [],
  _prevErrorLine: null,
  _nextErrorLine: null,
  _drawErrorLines() {
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
  _clearErrorLines() {
    this._errorLines._each(line => this._map.removeLayer(line));
  },
  setIntersectedStyle() {
    this._setIntersectionIcon();

    //show intersected lines
    this._drawErrorLines();
  },
  resetStyle() {
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
  _previewErrorLine() {
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

    this._pt = setTimeout(() => {
      this._map.removeLayer(this._previewErLine);
    }, 900);
  }
}));

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function (object = {}, array = []) {
  var rslt = object;

  var tmp;
  var _func = function (id, index) {
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
});;

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__hooks_controls__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__layers__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__options__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_array__ = __webpack_require__(28);








function map(type) {
  let Instance = type === 'mapbox' ? L.mapbox.Map : L.Map;
  let map = Instance.extend(Object.assign(__WEBPACK_IMPORTED_MODULE_0__base__["a" /* default */], {
    $: undefined,
    initialize(id, options) {
      if (options.text) {
        Object.assign(__WEBPACK_IMPORTED_MODULE_3__options__["a" /* default */].text, options.text);
        delete options.text;
      }

      let controls = options.controls;
      if (controls) {
        if (controls.zoom === false) {
          options.zoomControl = false;
        }
      }

      //if (options.drawLineStyle) {
      //  Object.assign(opts.drawLineStyle, options.drawLineStyle);
      //  delete options.drawLineStyle;
      //}
      if (options.style) {
        if (options.style.draw) {
          Object.assign(__WEBPACK_IMPORTED_MODULE_3__options__["a" /* default */].style.draw, options.style.draw);
        }
        //delete options.style.draw;
        if (options.style.view) {
          Object.assign(__WEBPACK_IMPORTED_MODULE_3__options__["a" /* default */].style.view, options.style.view);
        }
        if (options.style.startDraw) {
          Object.assign(__WEBPACK_IMPORTED_MODULE_3__options__["a" /* default */].style.startDraw, options.style.startDraw);
        }
        if (options.style.drawLine) {
          Object.assign(__WEBPACK_IMPORTED_MODULE_3__options__["a" /* default */].style.drawLine, options.style.drawLine);
        }
        delete options.style;
      }

      Object.assign(this.options, __WEBPACK_IMPORTED_MODULE_3__options__["a" /* default */], options);
      //L.Util.setOptions(this, opts);

      if (type === 'mapbox') {
        L.mapbox.Map.prototype.initialize.call(this, id, this.options.mapboxId, this.options);
      } else {
        L.Map.prototype.initialize.call(this, id, this.options);
      }

      this.$ = $(this._container);

      __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].setLayers();

      this._addLayers([__WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].viewGroup, __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editGroup, __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editPolygon, __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editMarkersGroup, __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editLineGroup, __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].dashedEditLineGroup, __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editHoleMarkersGroup]);

      this._setOverlays(options);

      if (this.options.forceToDraw) {
        this.mode('draw');
      }
    },
    _setOverlays(opts) {
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
    getVGroup() {
      return __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].viewGroup;
    },
    getEGroup() {
      return __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editGroup;
    },
    getEPolygon() {
      return __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editPolygon;
    },
    getEMarkersGroup() {
      return __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editMarkersGroup;
    },
    getELineGroup() {
      return __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editLineGroup;
    },
    getDELine() {
      return __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].dashedEditLineGroup;
    },
    getEHMarkersGroup() {
      return __WEBPACK_IMPORTED_MODULE_2__layers__["a" /* default */].editHoleMarkersGroup;
    },
    getSelectedPolygon: () => this._selectedPolygon,
    getSelectedMGroup() {
      return this._selectedMGroup;
    }
  }));

  map.addInitHook(__WEBPACK_IMPORTED_MODULE_1__hooks_controls__["a" /* default */]);

  return map;
}

/* harmony default export */ __webpack_exports__["a"] = (map);

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__draw_events__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__edit_polygon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_precision__ = __webpack_require__(14);
var _this = this;





/* harmony default export */ __webpack_exports__["a"] = (Object.assign({
  _selectedMarker: undefined,
  _selectedVLayer: undefined,
  _oldSelectedMarker: undefined,
  __polygonEdgesIntersected: false,
  _modeType: 'draw',
  _controlLayers: undefined,
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
  hasSelectedVLayer() {
    return this._getSelectedVLayer() !== undefined;
  },
  _addEGroup_To_VGroup() {
    let vGroup = this.getVGroup();
    let eGroup = this.getEGroup();

    eGroup.eachLayer(layer => {
      if (!layer.isEmpty()) {
        let holes = layer._holes;
        let latlngs = layer.getLatLngs();
        if ($.isArray(holes)) {
          if (holes) {
            latlngs = [latlngs].concat(holes);
          }
        }
        vGroup.addLayer(L.polygon(latlngs));
      }
    });
  },
  _addEPolygon_To_VGroup() {
    let vGroup = this.getVGroup();
    let ePolygon = this.getEPolygon();

    let holes = ePolygon.getHoles();
    let latlngs = ePolygon.getLatLngs();

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
  _convert_EGroup_To_VGroup() {
    this.getVGroup().clearLayers();
    this._addEGroup_To_VGroup();
  },
  _convertToEdit(group) {
    if (group instanceof L.MultiPolygon) {
      let eGroup = this.getEGroup();

      eGroup.clearLayers();

      group.eachLayer(layer => {
        let latlngs = layer.getLatLngs();

        let holes = layer._holes;
        if ($.isArray(holes)) {
          latlngs = [latlngs].concat(holes);
        }

        let editPolygon = new __WEBPACK_IMPORTED_MODULE_1__edit_polygon__["a" /* default */](latlngs);
        editPolygon.addTo(this);
        eGroup.addLayer(editPolygon);
      });
      return eGroup;
    } else if (group instanceof L.MarkerGroup) {
      let ePolygon = this.getEPolygon();
      let layers = group.getLayers();
      layers = layers.filter(layer => !layer.isMiddle());
      let pointsArray = layers.map(layer => layer.getLatLng());

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

  _getModeType() {
    return this._modeType;
  },
  _setModeType(type) {
    this.$.removeClass('map-' + this._modeType);
    this._modeType = type;
    this.$.addClass('map-' + this._modeType);
  },
  _setMarkersGroupIcon(markerGroup) {
    let mIcon = this.options.markerIcon;
    let mHoverIcon = this.options.markerHoverIcon;

    let mode = this._getModeType();
    if (mIcon) {
      if (!mIcon.mode) {
        markerGroup.options.mIcon = mIcon;
      } else {
        let icon = mIcon.mode[mode];
        if (icon !== undefined) {
          markerGroup.options.mIcon = icon;
        }
      }
    }

    if (mHoverIcon) {
      if (!mHoverIcon.mode) {
        markerGroup.options.mHoverIcon = mHoverIcon;
      } else {
        let icon = mHoverIcon[mode];
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
  mode(type) {
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
  isMode(type) {
    return type === this._modeType;
  },
  draw() {
    if (this.isMode('edit') || this.isMode('view') || this.isMode('afterDraw')) {
      this._clearMap();
    }
    this._bindDrawEvents();
  },
  cancel() {
    this._clearMap();

    this.mode('view');
  },
  clear() {
    this._clearEvents();
    this._clearMap();
    this.fire('editor:map_cleared');
  },
  clearAll() {
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
  saveState() {

    let ePolygon = _map.getEPolygon();

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

    let geojson = this.getVGroup().toGeoJSON();
    if (geojson.geometry) {
      return geojson.geometry;
    }
    return {};
  },
  geoJSONArea(geoJSON) {
    let areaFunc = window.turf && window.turf.area || this.options.geoJSONArea;

    if (!areaFunc) {
      console.warn('Warning: Implement "geoJSONArea" function ( leaflet-editor )');
    }

    return areaFunc ? areaFunc(geoJSON) : 0;
  },
  area(props = {}) {

    let { precLatLng = 2 } = props;
    let vLayer = this.getVGroup();
    let ePolygonLayer = this.getEPolygon();
    let selectedLayer = this._getSelectedVLayer();

    let sum = 0;

    if (!ePolygonLayer.isEmpty()) {
      // if "eArea" < 0 than "ePolygonLayer" is hole layer
      let eArea = this.geoJSONArea(Object(__WEBPACK_IMPORTED_MODULE_2__utils_precision__["b" /* precisionGeoJSON */])(ePolygonLayer.toGeoJSON(), precLatLng));
      let vArea = this.geoJSONArea(Object(__WEBPACK_IMPORTED_MODULE_2__utils_precision__["b" /* precisionGeoJSON */])(vLayer.toGeoJSON(), precLatLng));

      let hArea = selectedLayer ? this.geoJSONArea(Object(__WEBPACK_IMPORTED_MODULE_2__utils_precision__["b" /* precisionGeoJSON */])(selectedLayer.toGeoJSON(), precLatLng)) : 0;

      if (this.hasSelectedVLayer() && eArea > 0) {
        vArea -= hArea;
      }
      sum = eArea > 0 ? vArea + eArea : vArea;
    }

    return Object(__WEBPACK_IMPORTED_MODULE_2__utils_precision__["a" /* precision */])(sum, precLatLng);
  },
  getSelectedMarker() {
    return this._selectedMarker;
  },
  clearSelectedMarker() {
    this._selectedMarker = null;
  },
  removeSelectedMarker() {
    let selectedMarker = this._selectedMarker;
    let prevMarker = selectedMarker.prev();
    let nextMarker = selectedMarker.next();
    let midlePrevMarker = selectedMarker._middlePrev;
    let middleNextMarker = selectedMarker._middleNext;
    selectedMarker.remove();
    this._selectedMarker = midlePrevMarker;
    this._selectedMarker.remove();
    this._selectedMarker = middleNextMarker;
    this._selectedMarker.remove();
    prevMarker._middleNext = null;
    nextMarker._middlePrev = null;
  },
  removePolygon(polygon) {
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
  },
  moveMarker(latlng) {
    this.getEMarkersGroup().getSelected().setLatLng(latlng);
  },
  _fitVBounds() {
    if (this.getVGroup().getLayers().length !== 0) {
      this.fitBounds(this.getVGroup().getBounds(), { padding: [30, 30] });
      //this.invalidateSize();
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
    //this._unBindViewEvents();
    this._unBindDrawEvents();
  },
  _activeEditLayer: undefined,
  _setActiveEditLayer(layer) {
    this._activeEditLayer = layer;
  },
  _getActiveEditLayer() {
    return this._activeEditLayer;
  },
  _clearActiveEditLayer() {
    this._activeEditLayer = null;
  },
  _setEHMarkerGroup(arrayLatLng) {
    let holeMarkerGroup = new L.MarkerGroup();
    holeMarkerGroup._isHole = true;

    this._setMarkersGroupIcon(holeMarkerGroup);

    let ehMarkersGroup = this.getEHMarkersGroup();
    holeMarkerGroup.addTo(ehMarkersGroup);

    let ehMarkersGroupLayers = ehMarkersGroup.getLayers();

    let hGroupPos = ehMarkersGroupLayers.length - 1;
    holeMarkerGroup._position = hGroupPos;

    for (let i = 0; i < arrayLatLng.length; i++) {
      // set hole marker
      holeMarkerGroup.setHoleMarker(arrayLatLng[i], undefined, {}, { hGroup: hGroupPos, hMarker: i });
    }

    let layers = holeMarkerGroup.getLayers();
    layers.map((layer, position) => {
      holeMarkerGroup._setMiddleMarkers(layer, position);
    });

    let ePolygon = this.getEPolygon();

    layers = holeMarkerGroup.getLayers();

    layers.forEach(layer => {
      ePolygon.updateHolePoint(hGroupPos, layer.__position, layer._latlng);
    });

    //ePolygon.setHole()
    return holeMarkerGroup;
  },
  _moveEPolygonOnTop() {
    let ePolygon = this.getEPolygon();
    if (ePolygon._container) {
      let lastChild = $(ePolygon._container.parentNode).children().last();
      let $ePolygon = $(ePolygon._container);
      if ($ePolygon[0] !== lastChild) {
        $ePolygon.detach().insertAfter(lastChild);
      }
    }
  },
  restoreEPolygon(polygon) {
    polygon = polygon || this.getEPolygon();

    if (!polygon) {
      return;
    }

    // set markers
    let latlngs = polygon.getLatLngs();

    this.getEMarkersGroup().setAll(latlngs);

    //this.getEMarkersGroup()._connectMarkers();

    // set hole markers
    let holes = polygon.getHoles();
    if (holes) {
      for (let j = 0; j < holes.length; j++) {
        this._setEHMarkerGroup(holes[j]);
      }
    }
  },
  getControlLayers: () => _this._controlLayers,
  edgesIntersected(value) {
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
  _showIntersectionError(text) {

    if (this._errorTimeout) {
      clearTimeout(this._errorTimeout);
    }

    this.msgHelper.msg(text || this.options.text.intersection, 'error', this._storedLayerPoint || this.getSelectedMarker());

    this._storedLayerPoint = null;

    this._errorTimeout = setTimeout(() => {
      this.msgHelper.hide();
    }, 10000);
  }
}, __WEBPACK_IMPORTED_MODULE_0__draw_events__["a" /* default */]));

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__marker_icons__ = __webpack_require__(0);

/* harmony default export */ __webpack_exports__["a"] = ({
  _bindDrawEvents() {
    this._unBindDrawEvents();

    // click on map
    this.on('click', e => {
      this._storedLayerPoint = e.layerPoint;
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
        this._addMarker(e);

        this.fire('editor:start_add_new_polygon');
        var startDrawStyle = this.options.style['startDraw'];

        if (startDrawStyle) {
          this.getEPolygon().setStyle(startDrawStyle);
        }

        this._clearSelectedVLayer();

        this._selectedMGroup = eMarkersGroup;
        return false;
      }

      // continue with new polygon
      var firstMarker = eMarkersGroup.getFirst();

      if (firstMarker && firstMarker._hasFirstIcon()) {
        if (!(e.target instanceof L.Marker)) {
          this._addMarker(e);
        }
        return false;
      }

      // start draw new hole polygon
      var ehMarkersGroup = this.getEHMarkersGroup();
      var lastHole = ehMarkersGroup.getLastHole();
      if (firstMarker && !firstMarker._hasFirstIcon()) {
        if (e.target.getEPolygon()._path === e.originalEvent.target) {
          if (!lastHole || !lastHole.getFirst() || !lastHole.getFirst()._hasFirstIcon()) {
            this.clearSelectedMarker();

            var lastHGroup = ehMarkersGroup.addHoleGroup();
            lastHGroup.set(e.latlng, null, { icon: __WEBPACK_IMPORTED_MODULE_0__marker_icons__["b" /* firstIcon */] });

            this._selectedMGroup = lastHGroup;
            this.fire('editor:start_add_new_hole');

            return false;
          }
        }
      }

      // continue with new hole polygon
      if (lastHole && !lastHole.isEmpty() && lastHole.hasFirstMarker()) {
        if (this.getEMarkersGroup()._isMarkerInPolygon(e.latlng)) {
          var marker = ehMarkersGroup.getLastHole().set(e.latlng);
          var rslt = marker._detectIntersection(); // in case of hole
          if (rslt) {
            this._showIntersectionError();

            //marker._mGroup.removeMarker(marker); //todo: detect intersection for hole
          }
        } else {
          this._showIntersectionError();
        }
        return false;
      }

      // reset

      if (this._getSelectedVLayer()) {
        this._setEPolygon_To_VGroup();
      } else {
        this._addEPolygon_To_VGroup();
      }
      this.clear();
      this.mode('draw');

      this.fire('editor:marker_group_clear');
    });

    this.on('editor:__join_path', e => {
      var eMarkersGroup = e.mGroup;

      if (!eMarkersGroup) {
        return;
      }

      if (eMarkersGroup._isHole) {
        this.getEHMarkersGroup().resetLastHole();
      }
      //1. set middle markers
      var layers = eMarkersGroup.getLayers();

      var position = -1;
      layers.forEach(() => {
        var marker = eMarkersGroup.addMarker(position, null, { icon: __WEBPACK_IMPORTED_MODULE_0__marker_icons__["f" /* middleIcon */] });
        position = marker.position + 2;
      });

      //2. clear line
      eMarkersGroup.getDELine().clear();

      eMarkersGroup.getLayers()._each(marker => {
        marker.dragging.enable();
      });

      eMarkersGroup.select();

      //reset style if 'startDraw' was used
      this.getEPolygon().setStyle(this.options.style.draw);

      if (eMarkersGroup._isHole) {
        this.fire('editor:polygon:hole_created');
      } else {
        this.fire('editor:polygon:created');
      }
    });

    var vGroup = this.getVGroup();

    vGroup.on('click', e => {
      vGroup.onClick(e);

      this.msgHelper.msg(this.options.text.clickToDrawInnerEdges, null, e.layerPoint);
      this.fire('editor:polygon:selected');
    });

    this.on('editor:delete_marker', () => {
      this._convertToEdit(this.getEMarkersGroup());
    });
    this.on('editor:delete_polygon', () => {
      this.getEHMarkersGroup().remove();
    });
  },
  _addMarker(e) {
    var latlng = e.latlng;

    var eMarkersGroup = this.getEMarkersGroup();

    var marker = eMarkersGroup.set(latlng);

    this._convertToEdit(eMarkersGroup);

    return marker;
  },
  _updateDELine(latlng) {
    return this.getEMarkersGroup().getDELine().update(latlng);
  },
  _unBindDrawEvents() {
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
});

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.Polygon.extend({
  isEmpty() {
    var latLngs = this.getLatLngs();
    return latLngs === null || latLngs === undefined || latLngs && latLngs.length === 0;
  },
  getHole(holeGroupNumber) {
    if (!$.isNumeric(holeGroupNumber)) {
      return;
    }
    return this._holes[holeGroupNumber];
  },
  getHolePoint(holeGroupNumber, holeNumber) {
    if (!$.isNumeric(holeGroupNumber) && !$.isNumeric(holeNumber)) {
      return;
    }

    return this._holes[holeGroupNumber][holeNumber];
  },
  getHoles() {
    return this._holes;
  },
  clearHoles() {
    this._holes = [];
    this.redraw();
  },
  clear() {
    this.clearHoles();

    if ($.isArray(this._latlngs) && this._latlngs[0] !== undefined) {
      this.setLatLngs([]);
    }
  },
  updateHolePoint(holeGroupNumber, holeNumber, latlng) {
    if ($.isNumeric(holeGroupNumber) && $.isNumeric(holeNumber)) {
      this._holes[holeGroupNumber][holeNumber] = latlng;
    } else if ($.isNumeric(holeGroupNumber) && !$.isNumeric(holeNumber)) {
      this._holes[holeGroupNumber] = latlng;
    } else {
      this._holes = latlng;
    }
    return this;
  },
  setHoles(latlngs) {
    this._holes = latlngs;
  },
  setHolePoint(holeGroupNumber, holeNumber, latlng) {
    var layer = this.getLayers()[0];
    if (layer) {
      if ($.isNumeric(holeGroupNumber) && $.isNumeric(holeNumber)) {
        layer._holes[holeGroupNumber][holeNumber] = latlng;
      }
    }
    return this;
  }
}));

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const precision = function (number, prec) {
  let arrayStrings = `${number}`.split('.');
  prec = prec || 0;

  if (!number || arrayStrings.length === 1) {
    return number;
  }

  let isFloat = arrayStrings[1].length > 0;

  let rslt = 0;

  if (isFloat) {
    let _prec = arrayStrings[1].length < prec ? arrayStrings[1].length : prec;
    rslt = number.toPrecision(arrayStrings[0].length + _prec);
  }

  return Number(rslt);
};
/* harmony export (immutable) */ __webpack_exports__["a"] = precision;


const precisionGeoJSON = function (geoJSON, prec = 0) {
  let json;
  if (geoJSON === null || geoJSON === undefined) {
    throw new Error('Please, make sure that first arguments is geoJSON');
  }

  json = JSON.parse(JSON.stringify(geoJSON));

  let { geometry: { type, coordinates } } = json;

  if (!Array.isArray(coordinates)) {
    throw new Error('Please, make sure that geoJSON has correct structure');
  }

  if (type === 'Polygon') {
    if (prec > 0) {
      coordinates.forEach(outlet => {
        outlet.forEach(edge => {
          edge[0] = precision(edge[0], prec);
          edge[1] = precision(edge[1], prec);
        });
      });
    }
  }

  if (type === 'MultiPolygon') {
    if (prec > 0) {
      coordinates.forEach(polygon => {
        polygon.forEach(outlet => {
          outlet.forEach(edge => {
            edge[0] = precision(edge[0], prec);
            edge[1] = precision(edge[1], prec);
          });
        });
      });
    }
  }

  return json;
};
/* harmony export (immutable) */ __webpack_exports__["b"] = precisionGeoJSON;


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__extended_SearchBtn__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__extended_TrashBtn__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__extended_LoadBtn__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__extended_BtnControl__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__extended_MsgHelper__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils_mobile__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__titles_zoomTitle__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__titles_fullScreenTitle__ = __webpack_require__(21);










/* harmony default export */ __webpack_exports__["a"] = (function () {

  Object(__WEBPACK_IMPORTED_MODULE_6__titles_zoomTitle__["a" /* default */])(this);
  Object(__WEBPACK_IMPORTED_MODULE_7__titles_fullScreenTitle__["a" /* default */])(this);

  if (this.options.defaultControlLayers) {
    var OSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });
    // OSM.addTo(map);
    this.addLayer(OSM);

    this._controlLayers = new L.Control.Layers({
      Google: new L.Google(),
      OSM
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
      this.addControl(new __WEBPACK_IMPORTED_MODULE_0__extended_SearchBtn__["a" /* default */]());
    }
  }

  this._BtnControl = __WEBPACK_IMPORTED_MODULE_3__extended_BtnControl__["a" /* default */];

  var trashBtn = new __WEBPACK_IMPORTED_MODULE_1__extended_TrashBtn__["a" /* default */]({
    btns: [{ className: 'fa fa-trash' }]
  });

  let loadBtn;

  if (controls && controls.loadBtn) {
    loadBtn = new __WEBPACK_IMPORTED_MODULE_2__extended_LoadBtn__["a" /* default */]({
      btns: [{ className: 'fa fa-arrow-circle-o-down load' }]
    });
  }

  var msgHelper = this.msgHelper = new __WEBPACK_IMPORTED_MODULE_4__extended_MsgHelper__["a" /* default */]({
    defaultMsg: this.options.text.clickToStartDrawPolygonOnMap
  });

  this.on('msgHelperAdded', () => {
    var text = this.options.text;

    this.on('editor:marker_group_select', () => {

      this.off('editor:not_selected_marker_mouseover');
      this.on('editor:not_selected_marker_mouseover', data => {
        msgHelper.msg(text.clickToSelectEdges, null, data.marker);
      });

      this.off('editor:selected_marker_mouseover');
      this.on('editor:selected_marker_mouseover', data => {
        msgHelper.msg(text.clickToRemoveAllSelectedEdges, null, data.marker);
      });

      this.off('editor:selected_middle_marker_mouseover');
      this.on('editor:selected_middle_marker_mouseover', data => {
        msgHelper.msg(text.clickToAddNewEdges, null, data.marker);
      });

      // on edit polygon
      this.off('editor:edit_polygon_mousemove');
      this.on('editor:edit_polygon_mousemove', data => {
        msgHelper.msg(text.clickToDrawInnerEdges, null, data.layerPoint);
      });

      this.off('editor:edit_polygon_mouseout');
      this.on('editor:edit_polygon_mouseout', () => {
        msgHelper.hide();
        this._storedLayerPoint = null;
      });

      // on view polygon
      this.off('editor:view_polygon_mousemove');
      this.on('editor:view_polygon_mousemove', data => {
        msgHelper.msg(text.clickToEdit, null, data.layerPoint);
      });

      this.off('editor:view_polygon_mouseout');
      this.on('editor:view_polygon_mouseout', () => {
        msgHelper.hide();
        this._storedLayerPoint = null;
      });
    });

    // hide msg
    this.off('editor:marker_mouseout');
    this.on('editor:marker_mouseout', () => {
      msgHelper.hide();
    });

    // on start draw polygon
    this.off('editor:first_marker_mouseover');
    this.on('editor:first_marker_mouseover', data => {
      msgHelper.msg(text.clickToJoinEdges, null, data.marker);
    });

    // dblclick to join
    this.off('editor:last_marker_dblclick_mouseover');
    this.on('editor:last_marker_dblclick_mouseover', data => {
      msgHelper.msg(text.dblclickToJoinEdges, null, data.marker);
    });

    this.on('editor:__join_path', data => {
      if (data.marker) {
        msgHelper.msg(this.options.text.clickToRemoveAllSelectedEdges, null, data.marker);
      }
    });

    //todo: continue with option 'allowCorrectIntersection'
    this.on('editor:intersection_detected', data => {
      // msg
      if (data.intersection) {
        msgHelper.msg(this.options.text.intersection, 'error', this._storedLayerPoint || this.getSelectedMarker());
        this._storedLayerPoint = null;
      } else {
        msgHelper.hide();
      }

      var selectedMarker = this.getSelectedMarker();

      if (!this.hasLayer(selectedMarker)) {
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
          var markersToReset = selectedMarker._mGroup.getLayers().filter(layer => {
            return L.DomUtil.hasClass(layer._icon, 'm-editor-intersection-div-icon');
          });

          markersToReset.map(marker => marker.resetStyle());
        }
      }
    });
  });

  if (!__WEBPACK_IMPORTED_MODULE_5__utils_mobile__["a" /* default */].isMobileBrowser()) {
    this.addControl(msgHelper);

    if (controls && controls.loadBtn) {
      this.addControl(loadBtn);
    }
  }

  if (controls && controls.trashBtn) {
    this.addControl(trashBtn);
  }
});

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.Control.extend({
  options: {
    position: 'topleft',
    email: ''
  },

  onAdd(map) {
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

  _toggle() {
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

  _collapse() {
    this._form.style.display = 'none';
    this._input.value = '';
  },

  _nominatimCallback(results) {

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

      var callback = function (map, result, divEl) {
        return function () {
          for (var j = 0; j < divResults.length; j++) {
            L.DomUtil.removeClass(divResults[j], 'selected');
          }
          L.DomUtil.addClass(divEl, 'selected');

          var bbox = result.boundingbox;
          map.fitBounds(L.latLngBounds([[bbox[0], bbox[2]], [bbox[1], bbox[3]]]));
        };
      }(this._map, results[i], div);

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

  _doSearch() {

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
  _onMouseOver() {
    if (this._form.style.display === 'block') {
      return;
    }
    L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
  },
  _onMouseOut() {
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
  }
}));

/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BtnControl__ = __webpack_require__(1);


/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_0__BtnControl__["a" /* default */].extend({
  options: {
    eventName: 'trashAdded',
    pressEventName: 'trashBtnPressed'
  },
  _btn: null,
  onAdd(map) {
    map.on('trashAdded', data => {
      L.DomUtil.addClass(data.control._btn, 'disabled');

      map.on('editor:marker_group_select', this._bindEvents, this);
      map.on('editor:start_add_new_polygon', this._bindEvents, this);
      map.on('editor:start_add_new_hole', this._bindEvents, this);
      map.on('editor:marker_group_clear', this._disableBtn, this);
      map.on('editor:delete_polygon', this._disableBtn, this);
      map.on('editor:delete_hole', this._disableBtn, this);
      map.on('editor:map_cleared', this._disableBtn, this);

      this._disableBtn();
    });

    var container = __WEBPACK_IMPORTED_MODULE_0__BtnControl__["a" /* default */].prototype.onAdd.call(this, map);

    this._titleContainer = L.DomUtil.create('div', 'btn-leaflet-msg-container title-hidden');
    this._titleContainer.innerHTML = this._map.options.text.loadJson;
    container.appendChild(this._titleContainer);

    return container;
  },
  _bindEvents() {
    L.DomUtil.removeClass(this._btn, 'disabled');

    L.DomEvent.addListener(this._btn, 'mouseover', this._onMouseOver, this);
    L.DomEvent.addListener(this._btn, 'mouseout', this._onMouseOut, this);
    L.DomEvent.addListener(this._btn, 'click', this._onPressBtn, this);
  },
  _disableBtn() {
    L.DomUtil.addClass(this._btn, 'disabled');

    L.DomEvent.removeListener(this._btn, 'mouseover', this._onMouseOver);
    L.DomEvent.removeListener(this._btn, 'mouseout', this._onMouseOut);
    L.DomEvent.removeListener(this._btn, 'click', this._onPressBtn, this);
  },
  _onPressBtn() {
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
  _onMouseOver() {
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
  _onMouseOut() {
    if (!L.DomUtil.hasClass(this._btn, 'disabled')) {
      L.DomUtil.addClass(this._titleContainer, 'title-hidden');
    }
  }
}));

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BtnControl__ = __webpack_require__(1);


/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_0__BtnControl__["a" /* default */].extend({
  options: {
    eventName: 'loadBtnAdded',
    pressEventName: 'loadBtnPressed'
  },
  onAdd(map) {
    var container = __WEBPACK_IMPORTED_MODULE_0__BtnControl__["a" /* default */].prototype.onAdd.call(this, map);

    map.on('loadBtnAdded', () => {
      this._map.on('searchEnabled', this._collapse, this);

      this._renderForm(container);
    });

    L.DomUtil.addClass(container, 'load-json-container');

    return container;
  },
  _onPressBtn() {
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
  _collapse() {
    this._form.style.display = 'none';
    this._textarea.value = '';
  },
  _renderForm(container) {
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
  _submitForm() {
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

      this._timeout = setTimeout(() => {
        L.DomUtil.addClass(this._titleContainer, 'title-hidden');
      }, 2000);

      this._collapse();
      this._map.fire('loadBtnHidden');
    } catch (e) {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      L.DomUtil.addClass(this._titleContainer, 'title-error');
      L.DomUtil.removeClass(this._titleContainer, 'title-success');

      this._titleContainer.innerHTML = map.options.text.checkJson;

      this._timeout = setTimeout(() => {
        L.DomUtil.addClass(this._titleContainer, 'title-hidden');
      }, 2000);
      this._collapse();
      this._map.fire('loadBtnHidden');
      this._map.mode('draw');
    }
  },
  _onMouseOver() {
    if (this._form.style.display === 'block') {
      return;
    }
    L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
    L.DomUtil.removeClass(this._titleContainer, 'title-error');
    L.DomUtil.removeClass(this._titleContainer, 'title-success');
    this._titleContainer.innerHTML = this._map.options.text.loadJson;
  },
  _onMouseOut() {
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
  }
}));

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.Control.extend({
  options: {
    position: 'msgcenter',
    defaultMsg: null
  },
  initialize(options) {
    L.Util.setOptions(this, options);
  },
  _titleContainer: null,
  onAdd(map) {
    var corner = L.DomUtil.create('div', 'leaflet-bottom');
    var container = L.DomUtil.create('div', 'leaflet-msg-editor');

    map._controlCorners['msgcenter'] = corner;
    map._controlContainer.appendChild(corner);

    setTimeout(() => {
      this._setContainer(container, map);
      map.fire('msgHelperAdded', { control: this });

      this._changePos();
    }, 1000);

    map.getBtnControl = () => this;

    this._bindEvents(map);

    return container;
  },
  _changePos() {
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
  _bindEvents() {
    setTimeout(() => {
      window.addEventListener('resize', () => {
        this._changePos();
      });
    }, 1);
  },
  _setContainer(container) {
    this._titleContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    this._titlePosContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    container.appendChild(this._titleContainer);
    document.body.appendChild(this._titlePosContainer);

    if (this.options.defaultMsg !== null) {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      this._titleContainer.innerHTML = this.options.defaultMsg;
    }
  },
  getOffset(el) {
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
  msg(text, type, object) {
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
  hide() {
    if (this._titleContainer) {
      L.DomUtil.addClass(this._titleContainer, 'title-hidden');
    }

    if (this._titlePosContainer) {
      L.DomUtil.addClass(this._titlePosContainer, 'title-hidden');
    }
  },
  getBtnContainer() {
    return this._map._controlCorners['msgcenter'];
  },
  getBtnAt(pos) {
    return this.getBtnContainer().child[pos];
  },
  disableBtn(pos) {
    L.DomUtil.addClass(this.getBtnAt(pos), 'disabled');
  },
  enableBtn(pos) {
    L.DomUtil.removeClass(this.getBtnAt(pos), 'disabled');
  }
}));

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function (map) {
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

  var _onMouseOverZoom = () => {
    L.DomUtil.removeClass(map._titleZoomContainer, 'title-hidden');
  };
  var _onMouseOutZoom = () => {
    L.DomUtil.addClass(map._titleZoomContainer, 'title-hidden');
  };

  L.DomEvent.addListener(zoomContainer, 'mouseover', _onMouseOverZoom, this);
  L.DomEvent.addListener(zoomContainer, 'mouseout', _onMouseOutZoom, this);

  map.zoomControl._zoomInButton.title = "";
  map.zoomControl._zoomOutButton.title = "";
});

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function (map) {
  if (!map.options.fullscreenControl) {
    return;
  }

  var link = map.fullscreenControl.link;
  link.title = "";
  L.DomUtil.addClass(link, 'full-screen');

  map.off('fullscreenchange');
  map.on('fullscreenchange', () => {
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

  var _onMouseOver = () => {
    L.DomUtil.removeClass(map._titleFullScreenContainer, 'title-hidden');
  };
  var _onMouseOut = () => {
    L.DomUtil.addClass(map._titleFullScreenContainer, 'title-hidden');
  };

  L.DomEvent.addListener(fullScreenContainer, 'mouseover', _onMouseOver, this);
  L.DomEvent.addListener(fullScreenContainer, 'mouseout', _onMouseOut, this);
});

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view_group__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__edit_polygon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__edit_holesGroup__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__edit_line__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__draw_dashed_line__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__draw_group__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__edit_marker_group__ = __webpack_require__(26);









/* harmony default export */ __webpack_exports__["a"] = ({
  viewGroup: null,
  editGroup: null,
  editPolygon: null,
  editMarkersGroup: null,
  editLineGroup: null,
  dashedEditLineGroup: null,
  editHoleMarkersGroup: null,
  setLayers() {
    this.viewGroup = new __WEBPACK_IMPORTED_MODULE_0__view_group__["a" /* default */]([]);
    this.editGroup = new __WEBPACK_IMPORTED_MODULE_5__draw_group__["a" /* default */]([]);
    this.editPolygon = new __WEBPACK_IMPORTED_MODULE_1__edit_polygon__["a" /* default */]([]);
    this.editMarkersGroup = new L.MarkerGroup([]);
    this.editLineGroup = new __WEBPACK_IMPORTED_MODULE_3__edit_line__["a" /* default */]([]);
    this.dashedEditLineGroup = new __WEBPACK_IMPORTED_MODULE_4__draw_dashed_line__["a" /* default */]([]);
    this.editHoleMarkersGroup = new __WEBPACK_IMPORTED_MODULE_2__edit_holesGroup__["a" /* default */]([]);
  }
});

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.MultiPolygon.extend({
  initialize(latlngs, options) {
    L.MultiPolygon.prototype.initialize.call(this, latlngs, options);

    this.on('layeradd', e => {
      var mViewStyle = this._map.options.style.view;
      e.target.setStyle($.extend({
        opacity: 0.7,
        fillOpacity: 0.35,
        color: '#00ABFF'
      }, mViewStyle));

      this._map._moveEPolygonOnTop();
    });
  },
  isEmpty() {
    return this.getLayers().length === 0;
  },
  onAdd(map) {
    L.MultiPolygon.prototype.onAdd.call(this, map);

    this.on('mousemove', e => {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mousemove', { layerPoint: e.layerPoint });
      } else {
        if (!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mousemove', { layerPoint: e.layerPoint });
        }
      }
    });
    this.on('mouseout', () => {
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
  onClick(e) {
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
  onRemove(map) {
    this.off('mouseover');
    this.off('mouseout');

    map.off('editor:view_polygon_mousemove');
    map.off('editor:view_polygon_mouseout');
  }
}));

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.FeatureGroup.extend({
  _selected: false,
  _lastHole: undefined,
  _lastHoleToDraw: undefined,
  addHoleGroup() {
    this._lastHole = new L.MarkerGroup();
    this._lastHole._isHole = true;
    this._lastHole.addTo(this);

    this._lastHole.position = this.getLength() - 1;

    this._lastHoleToDraw = this._lastHole;

    return this._lastHole;
  },
  getLength() {
    return this.getLayers().length;
  },
  resetLastHole() {
    this._lastHole = undefined;
  },
  setLastHole(layer) {
    this._lastHole = layer;
  },
  getLastHole() {
    return this._lastHole;
  },
  remove() {
    this.eachLayer(hole => {
      while (hole.getLayers().length) {
        hole.removeMarkerAt(0);
      }
    });
  },
  repos(position) {
    this.eachLayer(layer => {
      if (layer.position >= position) {
        layer.position -= 1;
      }
    });
  },
  resetSelection() {
    this.eachLayer(layer => {
      layer.getLayers()._each(marker => {
        marker.unSelectIconInGroup();
      });
    });
    this._selected = false;
  }
}));

/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (L.FeatureGroup.extend({
  isEmpty() {
    return this.getLayers().length === 0;
  }
}));

/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__extended_BaseMarkerGroup__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__edit_marker__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__edit_line__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__draw_dashed_line__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_sortByPosition__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__marker_icons__ = __webpack_require__(0);








L.Util.extend(L.LineUtil, {
  // Checks to see if two line segments intersect. Does not handle degenerate cases.
  // http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
  segmentsIntersect( /*Point*/p, /*Point*/p1, /*Point*/p2, /*Point*/p3) {
    return this._checkCounterclockwise(p, p2, p3) !== this._checkCounterclockwise(p1, p2, p3) && this._checkCounterclockwise(p, p1, p2) !== this._checkCounterclockwise(p, p1, p3);
  },

  // check to see if points are in counterclockwise order
  _checkCounterclockwise( /*Point*/p, /*Point*/p1, /*Point*/p2) {
    return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
  }
});

let turnOffMouseMove = false;

/* unused harmony default export */ var _unused_webpack_default_export = (L.MarkerGroup = __WEBPACK_IMPORTED_MODULE_0__extended_BaseMarkerGroup__["a" /* default */].extend({
  _isHole: false,
  _editLineGroup: undefined,
  _position: undefined,
  dashedEditLineGroup: new __WEBPACK_IMPORTED_MODULE_3__draw_dashed_line__["a" /* default */]([]),
  options: {
    mIcon: undefined,
    mHoverIcon: undefined
  },
  initialize(layers) {
    L.LayerGroup.prototype.initialize.call(this, layers);

    this._markers = [];
    //this._bindEvents();
  },
  onAdd(map) {
    this._map = map;
    this.dashedEditLineGroup.addTo(map);
  },
  _updateDELine(latlng) {
    var deLine = this.getDELine();
    if (this._firstMarker) {
      deLine.update(latlng);
    }
    return deLine;
  },
  _addMarker(latlng) {
    //var eMarkersGroup = this.getEMarkersGroup();

    this.set(latlng);
    this.getDELine().addLatLng(latlng);

    this._map._convertToEdit(this);
  },
  getDELine() {
    if (!this.dashedEditLineGroup._map) {
      this.dashedEditLineGroup.addTo(this._map);
    }
    return this.dashedEditLineGroup;
  },
  _setHoverIcon() {
    var map = this._map;
    if (map._oldSelectedMarker !== undefined) {
      map._oldSelectedMarker._resetIcon(this.options.mIcon);
    }
    map._selectedMarker._setHoverIcon(this.options.mHoverIcon);
  },
  _sortByPosition() {
    if (!this._isHole) {
      var layers = this.getLayers();

      layers = layers.sort(function (a, b) {
        return a._leaflet_id - b._leaflet_id;
      });

      var idArray = [];
      var posArray = [];
      layers.forEach(layer => {
        idArray.push(layer._leaflet_id);
        posArray.push(layer.__position);
      });

      Object(__WEBPACK_IMPORTED_MODULE_4__utils_sortByPosition__["a" /* default */])(this._layers, idArray);
    }
  },
  updateStyle() {
    var markers = this.getLayers();

    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      marker._resetIcon(this.options.mIcon);
      if (marker === this._map._selectedMarker) {
        this._setHoverIcon();
      }
    }
  },
  setSelected(marker) {
    var map = this._map;

    if (map.__polygonEdgesIntersected && this.hasFirstMarker()) {
      map._selectedMarker = this.getLast();
      map._oldSelectedMarker = map._selectedMarker;
      return;
    }

    map._oldSelectedMarker = map._selectedMarker;
    map._selectedMarker = marker;
  },
  resetSelected() {
    var map = this._map;
    if (map._selectedMarker) {
      map._selectedMarker._resetIcon(this.options.mIcon);
      map._selectedMarker = undefined;
    }
  },
  getSelected() {
    return this._map._selectedMarker;
  },
  _setFirst(marker) {
    this._firstMarker = marker;
    this._firstMarker._setFirstIcon();
  },
  getFirst() {
    return this._firstMarker;
  },
  getLast() {
    if (this.hasFirstMarker()) {
      var layers = this.getLayers();
      return layers[layers.length - 1];
    }
  },
  hasFirstMarker() {
    return this.getFirst() && this.getFirst()._hasFirstIcon();
  },
  convertToLatLngs() {
    var latlngs = [];
    this.eachLayer(function (layer) {
      if (!layer.isMiddle()) {
        latlngs.push(layer.getLatLng());
      }
    });
    return latlngs;
  },
  restore(layer) {
    this.setAll(layer._latlngs);
    this.setAllHoles(layer._holes);
  },
  _add(latlng, position, options = {}) {

    if (this._map.isMode('draw')) {
      if (!this._firstMarker) {
        options.icon = __WEBPACK_IMPORTED_MODULE_5__marker_icons__["b" /* firstIcon */];
      }
    }

    var marker = this.addMarker(latlng, position, options);

    this.getDELine().addLatLng(latlng);

    //this._map.off('mousemove');
    turnOffMouseMove = true;
    if (this.getFirst()._hasFirstIcon()) {
      this._map.on('mousemove', e => {
        if (!turnOffMouseMove) {
          this._updateDELine(e.latlng);
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
  _closestNotMiddleMarker(layers, position, direction) {
    return layers[position].isMiddle() ? layers[position + direction] : layers[position];
  },
  _setPrevNext(marker, position) {
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
  setMiddleMarker(position) {
    this.addMarker(position, null, { icon: __WEBPACK_IMPORTED_MODULE_5__marker_icons__["f" /* middleIcon */] });
  },
  setMiddleMarkers(position) {
    this.setMiddleMarker(position);
    this.setMiddleMarker(position + 2);
  },
  set(latlng, position, options) {
    if (!this.hasIntersection(latlng)) {
      this._map.edgesIntersected(false);
      return this._add(latlng, position, options);
    }
  },
  setMiddle(latlng, position, options) {
    position = position < 0 ? 0 : position;

    //var func = (this._isHole) ? 'set' : 'setHoleMarker';
    var marker = this.set(latlng, position, options);

    marker._setMiddleIcon();
    return marker;
  },
  setAll(latlngs) {
    latlngs.forEach((latlng, position) => {
      this.set(latlng, position);
    });

    this.getFirst().fire('click');
  },
  setAllHoles(holes) {
    holes.forEach(hole => {
      //this.set(hole);
      var lastHGroup = this._map.getEHMarkersGroup().addHoleGroup();

      hole._each((latlng, position) => {
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
  setHoleMarker(latlng, options = { isHoleMarker: true, holePosition: {} }) {
    var marker = new __WEBPACK_IMPORTED_MODULE_1__edit_marker__["a" /* default */](this, latlng, options || {});
    marker.addTo(this);

    //this.setSelected(marker);

    if (this._map.isMode('draw') && this.getLayers().length === 1) {
      this._setFirst(marker);
    }

    return marker;
  },
  removeHole() {
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
  removeSelected() {
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
        this.eachLayer(layer => {
          layer.options.holePosition = {
            hGroup: this._position,
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
    this.eachLayer(layer => {
      layer.options.title = position;
      layer.__position = position++;
    });
  },
  getPointsForIntersection(polygon) {
    var map = this._map;
    this._originalPoints = [];
    var layers = (polygon ? polygon.getLayers() : this.getLayers()).filter(l => !l.isMiddle());

    this._originalPoints = [];
    layers._each(layer => {
      var latlng = layer.getLatLng();
      this._originalPoints.push(new L.Point(latlng.lng, latlng.lat));
      // this._originalPoints.push(this._map.latLngToLayerPoint(latlng));
    });

    if (!polygon) {
      if (map._selectedMarker === layers[0]) {
        // point is first
        this._originalPoints = this._originalPoints.slice(1);
      } else if (map._selectedMarker === layers[layers.length - 1]) {
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
  _hasIntersection(points, newPoint, isFinish) {
    var len = points ? points.length : 0,
        lastPoint = points ? points[len - 1] : null,

    // The previous previous line segment. Previous line segment doesn't need testing.
    maxIndex = len - 2;

    if (this._tooFewPointsForIntersection(1)) {
      return false;
    }

    return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, isFinish);
  },

  _hasIntersectionWithHole(points, newPoint, lastPoint) {
    var len = points ? points.length : 0,

    //lastPoint = points ? points[len - 1] : null,
    // The previous previous line segment. Previous line segment doesn't need testing.
    maxIndex = len - 2;

    if (this._tooFewPointsForIntersection(1)) {
      return false;
    }

    return this._lineHoleSegmentsIntersectsRange(lastPoint, newPoint);
  },

  hasIntersection(latlng, isFinish) {
    var map = this._map;
    if (map.options.allowIntersection) {
      return false;
    }

    var newPoint = new L.Point(latlng.lng, latlng.lat);
    // var newPoint = map.latLngToLayerPoint(latlng);

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
  hasIntersectionWithHole(lArray, hole) {

    if (this._map.options.allowIntersection) {
      return false;
    }

    var newPoint = new L.Point(lArray[0].lng, lArray[0].lat);
    var lastPoint = new L.Point(lArray[1].lng, lArray[1].lat);
    // var newPoint = this._map.latLngToLayerPoint(lArray[0]);
    // var lastPoint = this._map.latLngToLayerPoint(lArray[1]);

    var points = this.getPointsForIntersection(hole);

    var rslt1 = this._hasIntersectionWithHole(points, newPoint, lastPoint);

    // code was dublicated to check intersection from both sides
    // (the main idea to reverse array of points and check intersection again)

    points = this.getPointsForIntersection(hole).reverse();
    lastPoint = new L.Point(lArray[2].lng, lArray[2].lat);
    // lastPoint = this._map.latLngToLayerPoint(lArray[2]);
    var rslt2 = this._hasIntersectionWithHole(points, newPoint, lastPoint);

    this._map.edgesIntersected(rslt1 || rslt2);
    var edgesIntersected = this._map.edgesIntersected();

    return edgesIntersected;
  },
  _tooFewPointsForIntersection(extraPoints) {
    var points = this._originalPoints,
        len = points ? points.length : 0;
    // Increment length by extraPoints if present
    len += extraPoints || 0;

    return !this._originalPoints || len <= 3;
  },
  _lineHoleSegmentsIntersectsRange(p, p1) {
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
  _lineSegmentsIntersectsRange(p, p1, maxIndex, isFinish) {
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
  _isMarkerInPolygon(marker) {
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
}));

/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__edit_marker__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_sortByPosition__ = __webpack_require__(9);



/* harmony default export */ __webpack_exports__["a"] = (L.Class.extend({
  includes: L.Mixin.Events,

  _selected: false,
  _lastMarker: undefined,
  _firstMarker: undefined,
  _positionHash: undefined,
  _lastPosition: 0,
  _markers: [],
  onAdd(map) {
    this._map = map;
    this.clearLayers();
    //L.LayerGroup.prototype.onAdd.call(this, map);
  },
  onRemove(map) {
    //L.LayerGroup.prototype.onRemove.call(this, map);
    this.clearLayers();
  },
  clearLayers() {
    this._markers.forEach(marker => {
      this._map.removeLayer(marker);
    });
    this._markers = [];
  },
  addTo(map) {
    map.addLayer(this);
  },
  addLayer(marker) {
    this._map.addLayer(marker);
    this._markers.push(marker);
    if (marker.position != null) {
      this._markers.move(this._markers.length - 1, marker.position);
    }
    marker.position = marker.position != null ? marker.position : this._markers.length - 1;
  },
  remove() {
    var markers = this.getLayers();
    markers._each(marker => {
      while (this.getLayers().length) {
        this.removeMarker(marker);
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
  removeLayer(marker) {
    var position = marker.position;
    this._map.removeLayer(marker);
    this._markers.splice(position, 1);
  },
  getLayers() {
    return this._markers;
  },
  eachLayer(cb) {
    this._markers.forEach(cb);
  },
  markerAt(position) {
    var rslt = this._markers[position];

    if (position < 0) {
      return this.firstMarker();
    }

    if (rslt === undefined) {
      rslt = this.lastMarker();
    }

    return rslt;
  },
  firstMarker() {
    return this._markers[0];
  },
  lastMarker() {
    var markers = this._markers;
    return markers[markers.length - 1];
  },
  removeMarker(marker) {
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
  removeMarkerAt(position) {
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
    markers.forEach(_marker => {
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
  addMarker(latlng, position, options) {
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

    var marker = new __WEBPACK_IMPORTED_MODULE_0__edit_marker__["a" /* default */](this, latlng, options);
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
  clear() {
    var ids = this._ids();

    this.clearLayers();

    ids.forEach(id => {
      this._deleteEvents(id);
    });

    this._lastPosition = 0;

    this._firstMarker = undefined;
  },
  _deleteEvents(id) {
    delete this._map._leaflet_events.viewreset_idx[id];
    delete this._map._leaflet_events.zoomanim_idx[id];
  },
  _getMiddleLatLng(marker1, marker2) {
    var map = this._map,
        p1 = map.project(marker1.getLatLng()),
        p2 = map.project(marker2.getLatLng());

    return map.unproject(p1._add(p2)._divideBy(2));
  },
  _recalcPositions(position) {
    var markers = this._markers;

    var changePos = false;
    markers.forEach((marker, _position) => {
      if (position === _position) {
        changePos = true;
      }
      if (changePos) {
        this._markers[_position].position += 1;
      }
    });
  },
  _recalcRelations() {
    var markers = this._markers;

    markers.forEach((marker, position) => {

      marker._prev = this.markerAt(position - 1);
      marker._next = this.markerAt(position + 1);

      // first
      if (position === 0) {
        marker._prev = this.lastMarker();
        marker._next = this.markerAt(1);
      }

      // last
      if (position === markers.length - 1) {
        marker._prev = this.markerAt(position - 1);
        marker._next = this.markerAt(0);
      }
    });
  },
  _ids() {
    var rslt = [];

    for (let id in this._layers) {
      rslt.push(id);
    }

    rslt.sort((a, b) => a - b);

    return rslt;
  },
  select() {
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

    this.getLayers()._each(marker => {
      marker.selectIconInGroup();
    });
    this._selected = true;

    this._map._selectedMGroup = this;
    this._map.fire('editor:marker_group_select');
  },
  isEmpty() {
    return this.getLayers().length === 0;
  },
  resetSelection() {
    this.getLayers()._each(marker => {
      marker.unSelectIconInGroup();
    });
    this._selected = false;
  }
}));

/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
/* unused harmony default export */ var _unused_webpack_default_export = (Array);

/***/ }),
/* 29 */,
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__map__ = __webpack_require__(10);


window.LeafletEditor = Object(__WEBPACK_IMPORTED_MODULE_0__map__["a" /* default */])('mapbox');

/***/ })
/******/ ]);