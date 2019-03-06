import ExtendedPolygon from '../../extended/Polygon.js';

import EVENTS from '../../event-names.js';

export default L.EditPloygon = ExtendedPolygon.extend({
  _oldE: undefined, // to reuse event object after "bad hole" removing to build new hole
  _k: 1, // to decrease 'diff' value which helps build a hole
  _holes: [],
  initialize (latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    this._initWithHoles(latlngs);

    this.options.className = "leaflet-clickable editable-polygon";
  },
  _update (e) {
    var marker = e.marker;

    if (marker._mGroup._isHole) {
      var markers = marker._mGroup._markers;
      markers = markers.filter((marker) => !marker.isMiddle());
      this._holes[marker._mGroup.position] = markers.map((marker) => marker.getLatLng());

    }
    this.redraw();
  },
  _removeHole (e) {
    var holePosition = e.marker._mGroup.position;
    this._holes.splice(holePosition, 1);

    this._map.getEHMarkersGroup().removeLayer(e.marker._mGroup._leaflet_id);
    this._map.getEHMarkersGroup().repos(e.marker._mGroup.position);

    this.redraw();
  },
  onAdd (map) {
    L.Polyline.prototype.onAdd.call(this, map);

    map.off(EVENTS.add_marker);
    map.on(EVENTS.add_marker, (e) => this._update(e));
    map.off(EVENTS.drag_marker);
    map.on(EVENTS.drag_marker, (e) => this._update(e));
    map.off(EVENTS.delete_marker);
    map.on(EVENTS.delete_marker, (e) => this._update(e));
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
    this._holes = this._holes || [];
    this._holes.push(hole);

    this.redraw();
  },
  hasHoles() {
    return this._holes.length > 0;
  }
});
