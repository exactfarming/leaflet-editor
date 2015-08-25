import {firstIcon,icon,dragIcon,middleIcon,hoverIcon,intersectionIcon} from '../marker-icons';
export default {
  _bindDrawEvents () {
    this._unBindDrawEvents();

    // click on map
    this.on('click', (e) => {
      // bug fix
      if (e.originalEvent && e.originalEvent.clientX === 0 && e.originalEvent.clientY === 0) {
        return;
      }

      if ((e.target instanceof L.Marker)) {
        return;
      }

      var eMarkersGroup = e.target.getEMarkersGroup();

      // start add new polygon
      if (eMarkersGroup.isEmpty()) {
        this._addMarker(e);

        this.fire('editor:start_add_new_polygon');

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
      if (firstMarker && !firstMarker._hasFirstIcon()) {
        if ((e.target.getEPolygon()._path == e.originalEvent.toElement)) {
          if (!ehMarkersGroup.getLastHole()) {
            var lastHGroup = ehMarkersGroup.addHoleGroup();
            lastHGroup.set(e.latlng, null, {icon: firstIcon});
            this.clearSelectedMarker();

            this._selectedMGroup = lastHGroup;
            this.fire('editor:start_add_new_hole');

            return false;
          }
        }
      }

      // continue with new hole polygon
      if (ehMarkersGroup.getLastHole()) {
        if (this.getEMarkersGroup()._isMarkerInPolygon(e.latlng)) {
          var marker = ehMarkersGroup.getLastHole().set(e.latlng);
          var rslt = marker._detectIntersection(); // in case of hole
          if(rslt) {
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

    this.on('editor:join_path', (e) => {
      var eMarkersGroup = e.mGroup;

      if (eMarkersGroup._isHole) {
        this.getEHMarkersGroup().resetLastHole();
      }
      //1. set middle markers
      var layers = eMarkersGroup.getLayers();

      var position = -1;
      layers.forEach(() => {
        var marker = eMarkersGroup.addMarker(position, null, {icon: middleIcon});
        position = marker.position + 2;
      });

      //2. clear line
      eMarkersGroup.getDELine().clear();

      eMarkersGroup.getLayers()._each((marker) => {
        marker.dragging.enable();
      });

      //this.getEMarkersGroup().select();

      eMarkersGroup.select();

      this.fire('editor:marker_group_select');
    });

    this.getVGroup().on('click', (e) => {
      var eMarkersGroup = this.getEMarkersGroup();
      if (eMarkersGroup.getFirst() && eMarkersGroup.getFirst()._hasFirstIcon() && !eMarkersGroup.isEmpty()) {
        this._addMarker(e);
      } else {
        // reset
        if (this._getSelectedVLayer()) {
          this._setEPolygon_To_VGroup();
        } else {
          this._addEPolygon_To_VGroup();
        }
        this.clear();
        this.mode('draw');

        this._hideSelectedVLayer(e.layer);

        eMarkersGroup.restore(e.layer);
        this._convertToEdit(eMarkersGroup);

        eMarkersGroup.select();
      }
    });

    this.on('editor:delete_marker', () => {
      this._convertToEdit(this.getEMarkersGroup());
    });
    this.on('editor:delete_polygon', () => {
      this.getEHMarkersGroup().remove();
    });
  },
  _addMarker (e) {
    var latlng = e.latlng;

    var eMarkersGroup = this.getEMarkersGroup();

    var marker = eMarkersGroup.set(latlng);

    this._convertToEdit(eMarkersGroup);

    return marker;
  },
  _updateDELine (latlng) {
    return this.getEMarkersGroup().getDELine().update(latlng);
  },
  _unBindDrawEvents () {
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
}
