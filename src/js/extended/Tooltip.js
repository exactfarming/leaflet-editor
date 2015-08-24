export default L.Class.extend({
  _time: 2000,
  initialize (map, text, time) {
    this._map = map;
    this._popupPane = map._panes.popupPane;
    this._text = '' || text;
    this._isStatic = false;
    this._container = L.DomUtil.create('div', 'leaflet-tooltip', this._popupPane);

    this._render();

    this._time = time || this._time;
  },

  dispose () {
    if (this._container) {
      this._popupPane.removeChild(this._container);
      this._container = null;
    }
  },

  'static' (isStatic) {
    this._isStatic = isStatic || this._isStatic;
    return this;
  },
  _render () {
    this._container.innerHTML = "<span>" + this._text + "</span>";
  },
  _updatePosition (latlng) {
    var pos = this._map.latLngToLayerPoint(latlng),
      tooltipContainer = this._container;

    if (this._container) {
      tooltipContainer.style.visibility = 'inherit';
      L.DomUtil.setPosition(tooltipContainer, pos);
    }

    return this;
  },

  _showError (latlng) {
    if (this._container) {
      L.DomUtil.addClass(this._container, 'leaflet-show');
      L.DomUtil.addClass(this._container, 'leaflet-error-tooltip');
    }
    this._updatePosition(latlng);

    if (!this._isStatic) {
      this._map.on('mousemove', this._onMouseMove, this);
    }
    return this;
  },

  _showInfo (latlng) {
    if (this._container) {
      L.DomUtil.addClass(this._container, 'leaflet-show');
      L.DomUtil.addClass(this._container, 'leaflet-info-tooltip');
    }
    this._updatePosition(latlng);

    if (!this._isStatic) {
      this._map.on('mousemove', this._onMouseMove, this);
    }
    return this;
  },

  _hide () {
    if (this._container) {
      L.DomUtil.removeClass(this._container, 'leaflet-show');
      L.DomUtil.removeClass(this._container, 'leaflet-info-tooltip');
      L.DomUtil.removeClass(this._container, 'leaflet-error-tooltip');
    }
    this._map.off('mousemove', this._onMouseMove, this);
    return this;
  },

  text (text) {
    this._text = text || this._text;
    this._render();
  },
  show (latlng, type = 'info') {

    this.text();

    if(type === 'error') {
      this.showError(latlng);
    }
    if(type === 'info') {
      this.showInfo(latlng);
    }
  },
  showInfo (latlng) {
    this._showInfo(latlng);

    if (this._hideInfoTimeout) {
      clearTimeout(this._hideInfoTimeout);
      this._hideInfoTimeout = null;
    }

    this._hideInfoTimeout = setTimeout(L.Util.bind(this.hide, this), this._time);
  },
  showError (latlng) {
    this._showError(latlng);

    if (this._hideErrorTimeout) {
      clearTimeout(this._hideErrorTimeout);
      this._hideErrorTimeout = null;
    }

    this._hideErrorTimeout = setTimeout(L.Util.bind(this.hide, this), this._time);
  },
  hide () {
    this._hide();
  },
  _onMouseMove (e) {
    this._updatePosition(e.latlng);
  },
  setTime (time) {
    if (time) {
      this._time = time;
    }
  }
});