import opts from '../../options.js';

let style = Object.assign(opts.style.drawLine, {
  className: 'dash-line'
});

export default L.Polyline.extend({
  options: Object.assign(opts.style.drawLine, {
    className: 'dash-line'
  }),
  _latlngToMove: undefined,
  _isHiddenLine: true,

  initialize: function (latlngs = [[0,0]], options) {
    if (latlngs.toString() === '0,0') {
      this._isHiddenLine = true;
      this.setStyle({ opacity: 0 });
    }
    L.Polyline.prototype.initialize.call(this, latlngs, options);

    return this
  },
  addLatLng (latlng, options = style) {
    if (this._isHiddenLine) {
      this._isHiddenLine = false;

      this.setLatLngs([latlng]);
    }

    this.setStyle(options);

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
