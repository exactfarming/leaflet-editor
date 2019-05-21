import ExtendedPolygon from '../../extended/Polygon.js';

import EVENTS from '../../event-names.js';

export default L.EditPloygon = ExtendedPolygon.extend({
  _oldE: undefined, // to reuse event object after "bad hole" removing to build new hole
  _k: 1, // to decrease 'diff' value which helps build a hole
  initialize (latlngs = [[0,0]], options) {
    L.Polygon.prototype.initialize.call(this, latlngs, options);

    this.options.className = 'leaflet-clickable editable-polygon';
  },
  _updateMarker (e) {
    let marker = e.marker;

    if (marker._mGroup._isHole) {
      let markers = marker._mGroup._markers;
      markers = markers.filter((marker) => !marker.isMiddle());
      this._latlngs[marker._mGroup.position + 1] = markers.map((marker) => marker.getLatLng());
    }

    this.redraw();
  },
  _removeHole (e) {
    let holePosition = e.marker._mGroup.position;
    this._latlngs.splice(holePosition + 1, 1);

    const ehMarkersGroup = this._map.getEHMarkersGroup();

    ehMarkersGroup.removeLayer(e.marker._mGroup._leaflet_id);
    ehMarkersGroup.repos(e.marker._mGroup.position);

    this.redraw();
  },
  onAdd (map) {
    L.Polyline.prototype.onAdd.call(this, map);

    map.off(EVENTS.before_add_marker);
    map.on(EVENTS.before_add_marker, (e) => this._updateMarker(e));
    map.off(EVENTS.drag_marker);
    map.on(EVENTS.drag_marker, (e) => this._updateMarker(e));
    map.off(EVENTS.delete_marker);
    map.on(EVENTS.delete_marker, (e) => this._updateMarker(e));
    map.off(EVENTS.delete_hole);
    map.on(EVENTS.delete_hole, (e) => this._removeHole(e));

    this.on('mousemove', (e) => {
      map.fire(EVENTS.edit_polygon_mousemove, { layerPoint: e.layerPoint });
    });

    this.on('mouseout', () => map.fire(EVENTS.edit_polygon_mouseout));
  },
  onRemove (map) {
    this.off('mousemove');
    this.off('mouseout');

    map.off(EVENTS.edit_polygon_mouseover);
    map.off(EVENTS.edit_polygon_mouseout);

    L.Polyline.prototype.onRemove.call(this, map);
  },
  addHole (hole) {
    this._latlngs.push(hole);

    this.redraw();
  },
  hasHoles() {
    return this._latlngs.length > 1;
  }
});
