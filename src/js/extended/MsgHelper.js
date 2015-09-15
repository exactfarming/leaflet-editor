export default L.Control.extend({
  options: {
    position: 'msgcenter',
    defaultMsg: null
  },
  initialize (options) {
    L.Util.setOptions(this, options);
  },
  _titleContainer: null,
  onAdd (map) {
    var corner = L.DomUtil.create('div', 'leaflet-bottom');
    var container = L.DomUtil.create('div', 'leaflet-msg-editor');

    map._controlCorners['msgcenter'] = corner;
    map._controlContainer.appendChild(corner);

    setTimeout(() => {
      this._setContainer(container, map);
      map.fire('msgHelperAdded', {control: this});

      this._changePos();
    }, 1000);

    map.getBtnControl = () => this;

    this._bindEvents(map);

    return container;
  },
  _changePos () {
    var controlCorner = this._map._controlCorners['msgcenter'];
    if (controlCorner && controlCorner.children.length) {
      var child = controlCorner.children.item().children[0];

      if (!child) {
        return;
      }

      var width = child.clientWidth;
      if (width) {
        controlCorner.style.left = (this._map._container.clientWidth - width) / 2 + 'px';
      }
    }
  },
  _bindEvents () {
    setTimeout(() => {
      window.addEventListener('resize', () => {
        this._changePos();
      });
    }, 1);
  },
  _setContainer (container) {
    this._titleContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    this._titlePosContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    container.appendChild(this._titleContainer);
    document.body.appendChild(this._titlePosContainer);

    if (this.options.defaultMsg !== null) {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      this._titleContainer.innerHTML = this.options.defaultMsg;
    }
  },
  getOffset (el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft;
      _y += el.offsetTop;
      el = el.offsetParent;
    }
    return {y: _y, x: _x};
  },
  msg (text, type, object) {
    if (object) {
      L.DomUtil.removeClass(this._titlePosContainer, 'title-hidden');
      L.DomUtil.removeClass(this._titlePosContainer, 'title-error');
      L.DomUtil.removeClass(this._titlePosContainer, 'title-success');

      this._titlePosContainer.innerHTML = text;

      var point;

      var offset = this.getOffset(document.getElementById(this._map._container.getAttribute('id')));

      if (object instanceof L.Point) {
        point = object;
        point = this._map.layerPointToContainerPoint(point);
      } else {
        point = this._map.latLngToContainerPoint(object.getLatLng());
      }

      point.x += offset.x;
      point.y += offset.y;

      this._titlePosContainer.style.top = (point.y - 8) + "px";
      this._titlePosContainer.style.left = (point.x + 10) + "px";

      if (type) {
        L.DomUtil.addClass(this._titlePosContainer, 'title-' + type);
      }
    } else {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      L.DomUtil.removeClass(this._titleContainer, 'title-error');
      L.DomUtil.removeClass(this._titleContainer, 'title-success');

      this._titleContainer.innerHTML = text;

      if (type) {
        L.DomUtil.addClass(this._titleContainer, 'title-' + type);
      }
      this._changePos();
    }
  },
  hide () {
    L.DomUtil.addClass(this._titleContainer, 'title-hidden');
    L.DomUtil.addClass(this._titlePosContainer, 'title-hidden');
  },
  getBtnContainer () {
    return this._map._controlCorners['msgcenter'];
  },
  getBtnAt (pos) {
    return this.getBtnContainer().child[pos];
  },
  disableBtn (pos) {
    L.DomUtil.addClass(this.getBtnAt(pos), 'disabled');
  },
  enableBtn (pos) {
    L.DomUtil.removeClass(this.getBtnAt(pos), 'disabled');
  }
});