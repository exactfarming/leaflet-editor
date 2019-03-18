export default L.Polygon.extend({
  isEmpty () {
    var latLngs = this.getLatLngs();
    return latLngs === null || latLngs === undefined || (latLngs && latLngs.length === 0);
  },
  getHoles () {
    return this._holes;
  },
  clearHoles () {
    this._holes = [];
    this.redraw();
  },
  clear () {
    this.clearHoles();

    if (Array.isArray(this._latlngs) && this._latlngs[0] !== undefined) {
      this.setLatLngs([[0,0],[0,0]]);
    }
  }
})
