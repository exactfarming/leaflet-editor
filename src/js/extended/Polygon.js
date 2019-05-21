export default L.Polygon.extend({
  isEmpty () {
    const latLngs = this.getLatLngs();
    return latLngs === null ||
      latLngs === undefined ||
      (latLngs && latLngs.length === 0) ||
      latLngs.toString() === 'LatLng(0, 0),LatLng(0, 0)' ||
      latLngs.toString() === 'LatLng(0, 0)';
  },
  _isHiddenData: true,

  setLatLngs (latlngs) {
    if (this._isHiddenData) {
      this._isHiddenData = true;
    }

    L.Polygon.prototype.setLatLngs.call(this, latlngs);
  },

  addLatLng (latlng) {
    if (this._isHiddenData) {
      this._isHiddenData = true;
    }

    L.Polygon.prototype.addLatLng.call(this, latlng);
  },

  getHoles () {
    const [latlngs, ...holes] = this.getLatLngs();

    return holes;
  },

  clearHoles () {
    this._latlngs = this._latlngs[0] ? [this._latlngs[0]] : [];
    this.redraw();
  },
  clear () {
    this.clearHoles();

    if (Array.isArray(this._latlngs) && this._latlngs[0] !== undefined) {
      this._isHiddenData = true;
      this.setLatLngs([[0,0],[0,0]]);
    }
  }
})
