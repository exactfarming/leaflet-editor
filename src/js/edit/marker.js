import Tooltip from '../extended/Tooltip';
import {firstIcon,icon,dragIcon,middleIcon,hoverIcon,intersectionIcon} from '../marker-icons';

var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (userAgent.indexOf("ipad") !== -1 || userAgent.indexOf("iphone") !== -1) {
  size = 2;
}

var tooltip;
var dragend = false;
var _markerToDeleteGroup = null;

export default L.Marker.extend({
  _draggable: undefined, // an instance of L.Draggable
  _oldLatLngState: undefined,
  initialize (group, latlng, options = {}) {

    options = $.extend({
      icon: icon,
      draggable: false
    }, options);

    L.Marker.prototype.initialize.call(this, latlng, options);

    this._mGroup = group;

    this._isFirst = group.getLayers().length === 0;
  },
  removeGroup () {
    if (this._mGroup._isHole) {
      this._mGroup.removeHole();
    } else {
      this._mGroup.remove();
    }
  },
  remove () {
    if (this._map) {
      this._mGroup.removeSelected();
    }
  },
  removeHole () { // deprecated
    this.removeGroup();
  },
  next () {
    var next = this._next._next;
    if (!this._next.isMiddle()) {
      next = this._next;
    }
    return next;
  },
  prev () {
    var prev = this._prev._prev;
    if (!this._prev.isMiddle()) {
      prev = this._prev;
    }
    return prev;
  },
  changePrevNextPos () {
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
    resetEvents (callback) {
    if (callback) {
      callback.call(this);
    }
  },
  _posHash () {
    return this._prev.position + '_' + this.position + '_' + this._next.position;
  },
  _resetIcon (_icon) {
    if (this._hasFirstIcon()) {
      return;
    }
    var ic = _icon || icon;

    this.setIcon(ic);
    this.prev().setIcon(ic);
    this.next().setIcon(ic);
  },
  _setHoverIcon (_hIcon) {
    if (this._hasFirstIcon()) {
      return;
    }
    this.setIcon(_hIcon || hoverIcon);
  },
  _addIconClass (className) {
    L.DomUtil.addClass(this._icon, className);
  },
  _removeIconClass (className) {
    L.DomUtil.removeClass(this._icon, className);
  },
  _setIntersectionIcon () {
    var iconClass = intersectionIcon.options.className;
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
  _setFirstIcon () {
    this._isFirst = true;
    this.setIcon(firstIcon);
  },
  _hasFirstIcon () {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-div-icon-first');
  },
  _setMiddleIcon () {
    this.setIcon(middleIcon);
  },
  isMiddle () {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-middle-div-icon')
      && !L.DomUtil.hasClass(this._icon, 'leaflet-drag-target');
  },
  _setDragIcon () {
    this._removeIconClass('m-editor-div-icon');
    this.setIcon(dragIcon);
  },
  isPlain () {
    return L.DomUtil.hasClass(this._icon, 'm-editor-div-icon') || L.DomUtil.hasClass(this._icon, 'm-editor-intersection-div-icon');
  },
  _onceClick () {
    if (this._isFirst) {
      this.once('click', (e) => {
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
          this.setIcon(icon);
          //mGroup.setSelected(this);
          map.fire('editor:__join_path', { mGroup: mGroup });
        }
      });
    }
  },
  _detectGroupDelete() {
    let map = this._map;

    var selectedMGroup = map.getSelectedMGroup();
    if (this._mGroup._isHole || !this.isPlain() || (selectedMGroup && selectedMGroup.hasFirstMarker())) {
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
        let plainMarkersLen = selectedMGroup.getLayers().filter((item) => {
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
  _bindCommonEvents () {
    this.on('click', (e) => {
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

      if (this.isMiddle()) { //add edge
        mGroup.setMiddleMarkers(this.position);
        this._resetIcon(icon);
        mGroup.select();
        map.msgHelper.msg(map.options.text.clickToRemoveAllSelectedEdges, null, this);
        _markerToDeleteGroup = null;
      } else { //remove edge
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
            map.fire('editor:polygon:deleted');
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

    this.on('drag', (e) => {
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
  _isInsideHole () {
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
  _isOutsideOfPolygon (polygon) {
    return !polygon._isMarkerInPolygon(this.getLatLng());
  },
  _detectIntersection (e) {
    var map = this._map;

    if (map.options.allowIntersection) {
      return;
    }

    var latlng = (e === undefined) ? this.getLatLng() : e.target._latlng;
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
  _detectIntersectionWithHoles (e) {
    var map = this._map, hasIntersection = false, hole, latlng = (e === undefined) ? this.getLatLng() : e.target._latlng;
    var holes = map.getEHMarkersGroup().getLayers();
    var eMarkersGroup = map.getEMarkersGroup();
    var prevPoint = this.prev();
    var nextPoint = this.next();

    if (prevPoint == null && nextPoint == null) {
      return;
    }

    var secondPoint = prevPoint.getLatLng();
    var lastPoint = nextPoint.getLatLng();
    var layers, tmpArray = [];

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

          layers._each((layer) => {
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
  onAdd (map) {
    L.Marker.prototype.onAdd.call(this, map);

    this.on('dragstart', (e) => {
      this._storedLayerPoint = null; //reset point

      this._mGroup.setSelected(this);
      this._oldLatLngState = e.target._latlng;

      if (this._prev.isPlain()) {
        this._mGroup.setMiddleMarkers(this.position);
      }

    }).on('drag', (e) => {
      this._onDrag(e);
    }).on('dragend', (e) => {
      this._onDragEnd(e);
    });

    this.on('mousedown', () => {
      if (!this.dragging._enabled) {
        return false;
      }
    });

    this._bindCommonEvents(map);
  },
  _onDrag (e) {
    this._detectIntersection(e);
  },
  _onDragEnd (e) {
    var rslt = this._detectIntersection(e);
    if (rslt && !this._map.options.allowCorrectIntersection) {
      this._restoreOldPosition();
    }
  },
  //todo: continue with option 'allowCorrectIntersection'
  _restoreOldPosition () {
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
  _animateZoom (opt) {
    if (this._map) {
      var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

      this._setPos(pos);
    }
  },
  resetIcon () {
    this._removeIconClass('m-editor-intersection-div-icon');
    this._removeIconClass('m-editor-div-icon-drag');
  },
  unSelectIconInGroup () {
    this._removeIconClass('group-selected');
  },
  _selectIconInGroup () {
    if (!this.isMiddle()) {
      this._addIconClass('m-editor-div-icon');
    }
    this._addIconClass('group-selected');
  },
  selectIconInGroup () {
    if (this._prev) {
      this._prev._selectIconInGroup();
    }
    this._selectIconInGroup();
    if (this._next) {
      this._next._selectIconInGroup();
    }
  },
  isSelectedInGroup () {
    return L.DomUtil.hasClass(this._icon, 'group-selected');
  },
  onRemove (map) {
    this.off('mouseout');

    L.Marker.prototype.onRemove.call(this, map);
  },
  _errorLines: [],
  _prevErrorLine: null,
  _nextErrorLine: null,
  _drawErrorLines () {
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
  _clearErrorLines () {
    this._errorLines._each((line) => this._map.removeLayer(line));
  },
  setIntersectedStyle () {
    this._setIntersectionIcon();

    //show intersected lines
    this._drawErrorLines();
  },
  resetStyle () {
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
  _previewErrorLine () {
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
});