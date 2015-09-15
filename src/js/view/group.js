export default L.MultiPolygon.extend({
  initialize (latlngs, options) {
    L.MultiPolygon.prototype.initialize.call(this, latlngs, options);

    this.on('layeradd', (e) => {
      var mViewStyle = this._map.options.style.view;
      e.target.setStyle($.extend({
        opacity: 0.7,
        fillOpacity: 0.35,
        color: '#00ABFF'
      }, mViewStyle));

      this._map._moveEPolygonOnTop();
    });
  },
  onAdd (map) {
    L.MultiPolygon.prototype.onAdd.call(this, map);

    this.on('mousemove', (e) => {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mousemove', {layerPoint: e.layerPoint});
      } else {
        if(!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mousemove', {layerPoint: e.layerPoint});
        }
      }
    });
    this.on('mouseout', () => {
      var eMarkersGroup = map.getEMarkersGroup();
      if (eMarkersGroup.isEmpty()) {
        map.fire('editor:view_polygon_mouseout');
      } else {
        if(!eMarkersGroup.getFirst()._hasFirstIcon()) {
          map.fire('editor:view_polygon_mouseout');
        }
      }
    });
  },
  onRemove (map) {
    this.off('mouseover');
    this.off('mouseout');

    map.off('editor:view_polygon_mousemove');
    map.off('editor:view_polygon_mouseout');
  }
});