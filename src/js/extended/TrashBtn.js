import BtnCtrl from './BtnControl';

export default BtnCtrl.extend({
  options: {
    eventName: 'trashAdded'
  },
  _btn: null,
  onAdd (map) {
    map.on('btnPressed', () => {
      if (this._btn && !L.DomUtil.hasClass(this._btn, 'disabled')) {
        this._onPressBtn();
      }
    });

    map.on('trashAdded', () => {
      L.DomUtil.addClass(this._btn, 'disabled');
    });

    map.on('editor:marker_group_select', this._bindEvents, this);

    map.on('editor:start_add_new_polygon', this._bindEvents, this);

    map.on('editor:start_add_new_hole', this._bindEvents, this);

    map.on('editor:marker_group_clear', this._disableBtn, this);
    map.on('editor:delete_polygon', this._disableBtn, this);
    map.on('editor:delete_hole', this._disableBtn, this);
    map.on('editor:map_cleared', this._disableBtn, this);

    return BtnCtrl.prototype.onAdd.call(this, map);
  },
  _bindEvents () {
    L.DomUtil.removeClass(this._btn, 'disabled');

    L.DomEvent.addListener(this._btn, 'mouseover', this._onMouseOver, this);
    L.DomEvent.addListener(this._btn, 'mouseout', this._onMouseOut, this);
  },
  _disableBtn () {
    L.DomUtil.addClass(this._btn, 'disabled');

    L.DomEvent.removeListener(this._btn, 'mouseover', this._onMouseOver);
    L.DomEvent.removeListener(this._btn, 'mouseout', this._onMouseOut);
  },
  _onPressBtn () {
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
  _onMouseOver () {
    var map = this._map;
    if (map.getEMarkersGroup().getLayers()[0]._isFirst) {
      map._msgContainer.msg(map.options.text.rejectChanges);
    } else {
      map._msgContainer.msg(map.options.text.deleteSelectedEdges);
    }
  },
  _onMouseOut () {
    this._map._msgContainer.hide();
  }
});