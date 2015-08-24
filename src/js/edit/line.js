export default L.FeatureGroup.extend({
    update () {
      var map = this._map;
      map._convertToEdit(map.getEMarkersGroup());
      map.getEMarkersGroup()._connectMarkers();
//    map.getEPolygon().setStyle(map.editStyle[map._getModeType()]);
    }
  });