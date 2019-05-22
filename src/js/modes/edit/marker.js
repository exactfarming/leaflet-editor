import { icon } from '../../marker-icons.js';

import EVENTS from '../../event-names.js';

var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (userAgent.indexOf('ipad') !== -1 || userAgent.indexOf('iphone') !== -1) {
  size = 2;
}

export default L.Marker.extend({
  _draggable: undefined, // an instance of L.Draggable
  _oldLatLngState: undefined,
  initialize(group, latlng, options = {}) {

    options = Object.assign({
      icon: icon,
      draggable: false
    }, options);

    L.Marker.prototype.initialize.call(this, latlng, options);

    this._mGroup = group;

    this._isFirst = group.getLayers().length === 0;
  },

  enableDrag() {
    this.dragging.enable();
  },
  disableDrag() {
    this.dragging.disable();
  },
  group() {
    return this._mGroup;
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

      var prevLatLng = this.group()._getMiddleLatLng(this.prev(), this);
      var nextLatLng = this.group()._getMiddleLatLng(this, this.next());

      this._prev.setLatLng(prevLatLng);
      this._next.setLatLng(nextLatLng);
    }
  },
  _resetIcon(_icon) {
    if (this._hasFirstIcon()) {
      return;
    }
    var ic = _icon || icon;

    this.setIcon(ic);
    this.prev().setIcon(ic);
    this.next().setIcon(ic);
  },

  _addIconClass(className) {
    L.DomUtil.addClass(this._icon, className);
  },
  _removeIconClass(className) {
    L.DomUtil.removeClass(this._icon, className);
  },
  _hasFirstIcon() {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-div-icon-first');
  },
  isMiddle() {
    return this._icon && L.DomUtil.hasClass(this._icon, 'm-editor-middle-div-icon')
      && !L.DomUtil.hasClass(this._icon, 'leaflet-drag-target');
  },
  _setDragIcon() {
    this._removeIconClass('m-editor-div-icon');
    this._removeIconClass('m-editor-middle-div-icon');
    this._addIconClass('m-editor-div-icon-drag');

    this.update();
  },
  isPlain() {
    return L.DomUtil.hasClass(this._icon, 'm-editor-div-icon');
  },
  _onceClick() {
    if (this._isFirst) {
      this.once('click', (e) => {
        if (!this._hasFirstIcon()) {
          return;
        }
        const map = this._map;
        const mGroup = this.group();

        if (mGroup._markers.length < 3) {
          this._onceClick();
          return;
        }

        this._isFirst = false;
        this.setIcon(icon);
        map.fire(EVENTS.join_path, {mGroup: mGroup});
      });
    }
  },
  isAcceptedToDelete() {
    return this._map.options.notifyClickMarkerDeletePolygon &&
      !this.isMiddle() &&
      this.isSelectedInGroup() &&
      this._map.getSelectedMarker() === this &&
      this.group().hasMinimalMarkersLength();
  },
  needAcceptToDelete() {
    return this._map.options.notifyClickMarkerDeletePolygon &&
      !this.isMiddle() &&
      this.isSelectedInGroup() &&
      this._map.getSelectedMarker() !== this &&
      this.group().hasMinimalMarkersLength();
  },
  _disallowToExecuteEvent() {
    const map = this._map;
    let selectedMGroup;

    if (map) {
      selectedMGroup = map.getSelectedMGroup()
    }

    return selectedMGroup && selectedMGroup.hasFirstMarker() && selectedMGroup !== this.group();
  },
  _bindEvents() {

    this.on('dragstart', e => {
      this._setDragIcon();

      this.group().setSelected(this);
      this._oldLatLngState = e.target._latlng;

      if (this._prev.isPlain()) {
        this.group().setMiddleMarkers(this.position);
      }

      this._map.fire(EVENTS.marker_dragstart);

      this.__dragging = true;
    });

    this.on('click', () => {
      const mGroup = this.group();
      const map = this._map;

      if (this._disallowToExecuteEvent()) {
        return;
      }

      if (this.needAcceptToDelete()) {
        mGroup.setSelected(this);
        map.msgHelper.msg(map.options.text.acceptDeletion, 'error', this);
        return;
      }

      if (mGroup.hasFirstMarker() && this !== mGroup.getFirst()) {
        return;
      }

      if (this._hasFirstIcon()) {
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

        if (this.isAcceptedToDelete()) {
          map.msgHelper.msg(map.options.text.acceptDeletion, 'error', this);
        }

        return;
      }

      if (this.isMiddle()) { //add vertex
        mGroup.setMiddleMarkers(this.position);
        this._resetIcon(icon);
        mGroup.select();
        map.msgHelper.msg(map.options.text.clickToRemoveAllSelectedEdges, null, this);

        map.clearSelectedMarker();

      } else { //remove vertex
        if (!mGroup.getFirst()._hasFirstIcon()) {
          map.msgHelper.hide();

          mGroup.removeMarker(this);

          if (mGroup.isEmpty()) {
            if (mGroup._isHole) {
              map.fire(EVENTS.hole_deleted);
            } else {
              map.fire(EVENTS.polygon_deleted);
            }
            map.msgHelper.hide();
          }
          mGroup.select();
        }
      }
    });

    this.on('mousedown', () => {
      if (!this.dragging._enabled) {
        return false;
      }
    });

    this.on('mouseover', (e) => {
      e.originalEvent.stopPropagation();

      const selectedMarker = this._map.getSelectedMarker();
      const selectedMarkerDragging = !!(selectedMarker && selectedMarker.__dragging);

      if (this._disallowToExecuteEvent() || selectedMarkerDragging) {
        return;
      }

      const map = this._map;
      if (this.group().getFirst()._hasFirstIcon()) {
        if (this.group().getLayers().length > 2) {
          if (this._hasFirstIcon()) {
            map.fire(EVENTS.first_marker_mouseover, {marker: this});
          } else if (this === this.group()._lastMarker) {
            map.fire(EVENTS.last_marker_dblclick_mouseover, {marker: this});
          }
        }
      } else {
        if (this.isSelectedInGroup()) {
          if (this.isMiddle()) {
            map.fire(EVENTS.selected_middle_marker_mouseover, {marker: this});
          } else {
            map.fire(EVENTS.selected_marker_mouseover, {marker: this});
          }
        } else {
          map.fire(EVENTS.not_selected_marker_mouseover, {marker: this});
        }
      }
      if (this.isAcceptedToDelete()) {
        map.msgHelper.msg(map.options.text.acceptDeletion, 'error', this);
      }
    });
    this.on('mouseout', (e) => {
      e.originalEvent.stopPropagation();

      const selectedMarker = this._map.getSelectedMarker();
      const selectedMarkerDragging = !!(selectedMarker && selectedMarker.__dragging);

      if (this._disallowToExecuteEvent() || selectedMarkerDragging) {
        return;
      }

      this._map.fire(EVENTS.marker_mouseout);
    });

    this._onceClick();

    this.on('dblclick', () => {
      if (this._disallowToExecuteEvent()) {
        return;
      }

      var mGroup = this.group();
      if (mGroup && mGroup.getFirst() && mGroup.getFirst()._hasFirstIcon()) {
        if (this === mGroup._lastMarker) {
          mGroup.getFirst().fire('click');
        }
      }
    });

    this.on('drag', (e) => {
      this._onDrag(e);
    });

    this.on('dragend', (e) => {
      this._onDragEnd(e);
    });
  },

  onAdd(map) {
    L.Marker.prototype.onAdd.call(this, map);

    this._bindEvents(map);
  },
  _onDrag(e) {
    const marker = e.target;

    marker.changePrevNextPos();

    const map = this._map;
    map._convertToEdit(map.getEMarkersGroup());

    this._setDragIcon();

    map.fire(EVENTS.drag_marker, {marker: this});
  },
  _onDragEnd() {
    setTimeout(() => {
      this.group().select();
      this._map.fire(EVENTS.dragend_marker, {marker: this});

      this._map.fire(EVENTS.selected_marker_mouseover, {marker: this});

      this.resetStyle();
    }, 1);
  },
  resetIcon() {
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

  resetStyle() {
    this.resetIcon();
    this.selectIconInGroup();
  }
});
