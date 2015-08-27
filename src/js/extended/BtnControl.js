export default L.Control.extend({
  options: {
    position: 'topleft',
    btns: [
      //{'title': 'remove', 'className': 'fa fa-trash'}
    ],
    eventName: "controlAdded"
  },
  _btn: null,
  stopEvent: L.DomEvent.stopPropagation,
  initialize (options) {
    L.Util.setOptions(this, options);
  },
  _titleContainer: null,
  onAdd (map) {
    map.on('btnPressed', () => {
      if (this._btn && !L.DomUtil.hasClass(this._btn, 'disabled')) {
        this._onPressBtn();
      }
    });

    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-editor-buttons');

    map._controlContainer.appendChild(container);

    var options = this.options;

    var self = this;
    setTimeout(() => {
      self._setBtn(options.btns, container);
      if (options.eventName) {
        map.fire(options.eventName, {control: self});
      }

      L.DomEvent.addListener(self._btn, 'mouseover', this._onMouseOver, this);
      L.DomEvent.addListener(self._btn, 'mouseout', this._onMouseOut, this);

    }, 1000);

    map.getBtnControl = () => this;

    return container;
  },
  _onPressBtn () {},
  _onMouseOver () {},
  _onMouseOut () {},
  _setBtn (opts, container) {
    var _btn;
    opts.forEach((btn, index) => {
      if (index === opts.length - 1) {
        btn.className += " last";
      }
      //var child = L.DomUtil.create('div', 'leaflet-btn' + (btn.className ? ' ' + btn.className : ''));

      var wrapper = document.createElement('div');
      container.appendChild(wrapper);
      var link = L.DomUtil.create('a', 'leaflet-btn', wrapper);
      link.href = '#';

      var stop = L.DomEvent.stopPropagation;
      L.DomEvent
        .on(link, 'click', stop)
        .on(link, 'mousedown', stop)
        .on(link, 'dblclick', stop)
        .on(link, 'click', L.DomEvent.preventDefault);

      link.appendChild(L.DomUtil.create('i', 'fa' + (btn.className ? ' ' + btn.className : '')));

      var callback = (function (map, pressEventName) {
        return function () {
          map.fire(pressEventName);
        }
      }(this._map, btn.pressEventName || this.options.pressEventName|| 'btnPressed'));

      L.DomEvent.on(link, 'click', L.DomEvent.stopPropagation)
        .on(link, 'click', callback);

      _btn = link;
    });
    this._btn = _btn;
  },
  getBtnContainer () {
    return this._map._controlCorners['topleft'];
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