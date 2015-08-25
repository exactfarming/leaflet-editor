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
    var corner = L.DomUtil.create('div', 'leaflet-top');
    var container = L.DomUtil.create('div', 'leaflet-msg-editor');

    map._controlCorners['msgcenter'] = corner;
    map._controlContainer.appendChild(corner);

    setTimeout(() => {
      this._setContainer(container, map);
      map.fire('msgHelperAdded', {control: this});

      this._changePos(map);
    }, 1000);

    map.getBtnControl = () => this;

    this._bindEvents(map);

    return container;
  },
  _changePos (map) {
    var controlCorner = map._controlCorners['msgcenter'];
    if (controlCorner && controlCorner.children.length) {
      var child = controlCorner.children.item().children[0];

      if(!child) {
        return;
      }

      var width = child.clientWidth;
      if(width) {
        controlCorner.style.left = (map._container.clientWidth - width) / 2 + 'px';
      }
    }
  },
  _bindEvents (map) {
    setTimeout(() => {
      window.addEventListener('resize', () => {
        this._changePos(map);
      });
    }, 1);
  },
  _setContainer (container, map) {
    this._titleContainer = L.DomUtil.create('div', 'leaflet-msg-container title-hidden');
    container.appendChild(this._titleContainer);

    if (this.options.defaultMsg !== null) {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      this._titleContainer.innerHTML = this.options.defaultMsg;
    }

    this._titleContainer.msg = (text, type) => {
      L.DomUtil.removeClass(this._titleContainer, 'title-hidden');
      L.DomUtil.removeClass(this._titleContainer, 'title-error');
      L.DomUtil.removeClass(this._titleContainer, 'title-success');

      this._titleContainer.innerHTML = text;

      if (type) {
        L.DomUtil.addClass(this._titleContainer, 'title-' + type);
      }
      this._changePos(map);
    };

    this._titleContainer.hide = () => {
      L.DomUtil.addClass(this._titleContainer, 'title-hidden');
    };
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