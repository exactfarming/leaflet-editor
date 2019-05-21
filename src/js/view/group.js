import EVENTS from '../event-names.js';

export default L.FeatureGroup.extend({
  initialize (latlngs, options = {}) {
    L.FeatureGroup.prototype.initialize.call(this, latlngs, options);


    this.on('layeradd', (e) => {
      var mViewStyle = this._map.options.style.view;
      e.target.setStyle(Object.assign({
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
  onAdd (map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this.on('mousemove', (e) => {
      map.fire(EVENTS.view_polygon_mousemove, { layerPoint: e.layerPoint });
    });
    this.on('mouseout', () => {
      map.fire(EVENTS.view_polygon_mouseout);
    });
  },
  onClick (e) {
    L.DomEvent.stopPropagation(e);

    const map = this._map;
    const selectedMGroup = map.getSelectedMGroup();
    const eMarkersGroup = map.getEMarkersGroup();
    if ((selectedMGroup && selectedMGroup.getFirst() && selectedMGroup.getFirst()._hasFirstIcon() && !selectedMGroup.isEmpty())) {
      const eMarkersGroup = map.getEMarkersGroup();
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
  onRemove (map) {
    this.off('mouseover');
    this.off('mouseout');

    map.off(EVENTS.view_polygon_mousemove);
    map.off(EVENTS.view_polygon_mouseout);
  }
});
