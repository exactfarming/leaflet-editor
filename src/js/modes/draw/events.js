import { firstIcon, middleIcon } from '../../marker-icons.js';
import EVENTS from '../../event-names.js';

export default {
  _bindDrawEvents () {
    this._unBindDrawEvents();

    // click on map
    this.on('click', (e) => {
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

        this.fire(EVENTS.start_add_new_polygon);
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
        if ((e.target.getEPolygon()._path === e.originalEvent.target)) {
          if (!lastHole || !lastHole.getFirst() || !lastHole.getFirst()._hasFirstIcon()) {
            this.clearSelectedMarker();

            var lastHGroup = ehMarkersGroup.addHoleGroup();
            lastHGroup.set(e.latlng, null, { icon: firstIcon });

            this._selectedMGroup = lastHGroup;
            this.fire(EVENTS.start_add_new_hole);

            this.getEHMarkersGroup().resetSelection();
            this.getEMarkersGroup().resetSelection();

            return false;
          }
        }
      }

      // continue with new hole polygon
      if (lastHole && !lastHole.isEmpty() && lastHole.hasFirstMarker()) {
        ehMarkersGroup.getLastHole().set(e.latlng);

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

      this.fire(EVENTS.marker_group_clear);
    });

    this.on(EVENTS.join_path, (e) => {
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
        var marker = eMarkersGroup.addMarker(position, null, { icon: middleIcon });
        position = marker.position + 2;
      });

      //2. clear line
      eMarkersGroup.getDELine().clear();

      eMarkersGroup.getLayers()._each((marker) => {
        marker.dragging.enable();
      });

      eMarkersGroup.select();

      //reset style if 'startDraw' was used
      this.getEPolygon().setStyle(this.options.style.draw);


      if (eMarkersGroup._isHole) {
        this.fire(EVENTS.hole_created);
      } else {
        this.fire(EVENTS.polygon_created);
      }
    });

    var vGroup = this.getVGroup();

    vGroup.on('click', (e) => {
      vGroup.onClick(e);

      this.msgHelper.msg(this.options.text.clickToDrawInnerEdges, null, e.layerPoint);
      this.fire(EVENTS.polygon_selected);
    });

    this.on(EVENTS.delete_marker, () => {
      this._convertToEdit(this.getEMarkersGroup());
    });
    this.on(EVENTS.delete_polygon, () => {
      this.getEHMarkersGroup().remove();
    });
  },
  _addMarker ({ latlng }) {

    var eMarkersGroup = this.getEMarkersGroup();

    var marker = eMarkersGroup.set(latlng);

    this._convertToEdit(eMarkersGroup);

    return marker;
  },
  _unBindDrawEvents () {
    this.off('click');
    this.getVGroup().off('click');

    this.off('dblclick');

    this.getDELine().clear();

    this.off(EVENTS.join_path);

    if (this._openPopup) {
      delete this._openPopup;
    }
  }
}
