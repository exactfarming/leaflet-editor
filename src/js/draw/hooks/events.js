export default (_this) => {
  return () => {
    var polygon = _this.getEPolygon();
    polygon.on('click', function () {
      // reset marker selection
      _this.getEMarkersGroup().resetSelected();
      _this.$.trigger('change_edited_polygon');
    });
  }
}