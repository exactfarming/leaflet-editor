import MarkerGroup from '../../modes/edit/marker-group.js';

export default L.FeatureGroup.extend({
  _selected: false,
  _lastHole: undefined,
  _lastHoleToDraw: undefined,
  addHoleGroup () {
    this._lastHole = new MarkerGroup();
    this._lastHole._isHole = true;
    this._lastHole.addTo(this);

    this._lastHole.position = this.getLength() - 1;

    this._lastHoleToDraw = this._lastHole;

    return this._lastHole;
  },
  getLength () {
    return this.getLayers().length;
  },
  resetLastHole () {
    this._lastHole = undefined;
  },
  setLastHole (layer) {
    this._lastHole = layer;
  },
  getLastHole () {
    return this._lastHole;
  },
  remove () {
    this.eachLayer((hole) => {
      while (hole.getLayers().length) {
        hole.removeMarkerAt(0);
      }
    });
  },
  repos (position) {
    this.eachLayer((layer) => {
      if (layer.position >= position) {
        layer.position -= 1;
      }
    });
  },
  resetSelection () {
    this.eachLayer((layer) => {
      layer.resetSelection();
    });
    this._selected = false;
  }
});
