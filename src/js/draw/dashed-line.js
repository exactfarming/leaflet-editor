import * as opts from '../options';

export default L.Polyline.extend({
  options: opts.options.style.drawLine,
  _latlngToMove: undefined,
  onAdd: function (map) {
    L.Polyline.prototype.onAdd.call(this, map);
    this.setStyle(map.options.style.drawLine);
  },
  addLatLng (latlng) {
    if (this._latlngToMove) {
      this._latlngToMove = undefined;
    }

    if (this._latlngs.length > 1) {
      this._latlngs.splice(-1);
    }

    this._latlngs.push(L.latLng(latlng));

    return this.redraw();
  },
  update (pos) {

    if (!this._latlngToMove && this._latlngs.length) {
      this._latlngToMove = L.latLng(pos);
      this._latlngs.push(this._latlngToMove);
    }
    if (this._latlngToMove) {
      this._latlngToMove.lat = pos.lat;
      this._latlngToMove.lng = pos.lng;

      this.redraw();
    }
    return this;
  },
  _addLine (line, group, isLastMarker) {
    if (!isLastMarker) {
      line.addTo(group);
    }
  },
  clear () {
    this.setLatLngs([]);
  }
});