import ExtendedPolygon from '../extended/Polygon';
import Tooltip from '../extended/Tooltip';

export default L.EditPloygon = ExtendedPolygon.extend({
  _oldE: undefined, // to reuse event object after "bad hole" removing to build new hole
  _k: 1, // to decrease 'diff' value which helps build a hole
  _holes: [],
  initialize (latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    this._initWithHoles(latlngs);

    this.options.className = "leaflet-clickable polygon";
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

    map.off('editor:add_marker');
    map.on('editor:add_marker', (e) => this._update(e));
    map.off('editor:drag_marker');
    map.on('editor:drag_marker', (e) => this._update(e));
    map.off('editor:delete_marker');
    map.on('editor:delete_marker', (e) => this._update(e));
    map.off('editor:delete_hole');
    map.on('editor:delete_hole', (e) => this._removeHole(e));

    this.on('mouseover', () => {
      if (map.getEMarkersGroup().hasFirstMarker()) {
       return;
      }

      map.fire('editor:edit_polygon_mouseover');
    });
    this.on('mouseout', () => map.fire('editor:edit_polygon_mouseout'));
  },
  onRemove (map) {
    this.off('mouseover');
    this.off('mouseout');

    map.off('editor:edit_polygon_mouseover');
    map.off('editor:edit_polygon_mouseout');

    L.Polyline.prototype.onRemove.call(this, map);
  },
  addHole (hole) {
    this._holes = this._holes || [];
    this._holes.push(hole);

    this.redraw();
  },
  _resetLastHole () {
    var map = this._map;

    map.getSelectedMarker().removeHole();

    if (this._k > 0.001) {
      this._addHole(this._oldE, 0.5);
    }
  },
  checkHoleIntersection () {
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