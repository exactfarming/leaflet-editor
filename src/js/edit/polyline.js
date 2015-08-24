export default L.Polyline.extend({
  initialize (latlngs, options, position, markersGroup) {
    L.Path.prototype.initialize.call(this, options);
    this._latlngs = this._convertLatLngs(latlngs);

    this.__position = position;
    this._markersGroup = markersGroup;

    //if (options._bindEvents) {
    //  //this._unBindEvents();
    //  //options._bindEvents.call(this);
    //} else {
    //  //this._unBindEvents();
    //  //this._bindEvents();
    //}
  }
  //,
  //_bindEvents () {
  //  var self = this;
  //  this.on('click', function (e) {
  //    var map = self._map;
  //    var markersGroup = self._markersGroup;
  //    if (markersGroup._isHole) {
  //      var hole = map.getEPolygon().getHole(markersGroup._position);
  //      //remove edit line
  //      //markersGroup.getELineGroup().clearLayers();
  //      //remove edit markers
  //      markersGroup.clearLayers();
  //
  //      // add hole point
  //      hole.splice(self.__position + 1, 0, e.latlng);
  //
  //      for (var i = 0; i < hole.length; i++) {
  //        // set hole marker
  //        var holePosition = {
  //          hGroup: markersGroup._position,
  //          hMarker: i
  //        };
  //        markersGroup.setHoleMarker(hole[i], {holePosition: holePosition});
  //      }
  //      // set selected marker
  //      markersGroup.setSelected(markersGroup.getLayers()[self.__position + 1]);
  //
  //      markersGroup._connectMarkers();
  //    } else {
  //      markersGroup._add(e.latlng, self.__position);
  //      //markersGroup.getELineGroup().update();
  //    }
  //  });
  //
  //  this.on('mouseover', function (e) {
  //    e.target.setStyle({
  //      weight: '10px'
  //    });
  //  }).on('mouseout', function (e) {
  //    e.target.setStyle({
  //      weight: '5px'
  //    });
  //  });
  //},
  //_unBindEvents () {
  //  this.off('click');
  //  this.off('mouseover');
  //  this.off('mouseout');
  //}
})