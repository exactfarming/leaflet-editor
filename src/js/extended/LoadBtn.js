import BtnCtrl from './BtnControl';

export default BtnCtrl.extend({
  options: {
    eventName: 'loadBtnAdded'
  },
  onAdd (map) {
    var container = BtnCtrl.prototype.onAdd.call(this, map);

    map.on('loadBtnAdded', () => {
      this._map.on('searchEnabled', this._collapse, this);

      this._renderForm(container);
    });

    L.DomUtil.addClass(container, 'load-json-container');

    return container;
  },
  _onPressBtn () {
    if (this._form.style.display != 'block') {
      this._form.style.display = 'block';
      this._textarea.focus();
      this._map.fire('loadBtnOpened');
    } else {
      this._collapse();
      this._map.fire('loadBtnHidden');
    }
  },
  _collapse () {
    this._form.style.display = 'none';
    this._textarea.value = '';
  },
  _renderForm (container) {
    var form = this._form = L.DomUtil.create('form');

    var textarea = this._textarea = L.DomUtil.create('textarea');
    textarea.style.width = '200px';
    textarea.style.height = '100px';
    textarea.style.border = '1px solid white';
    textarea.style.padding = '5px';
    textarea.style.borderRadius = '4px';

    L.DomEvent
      .on(textarea, 'click', this.stopEvent)
      .on(textarea, 'mousedown', this.stopEvent)
      .on(textarea, 'dblclick', this.stopEvent)
      .on(textarea, 'mousewheel', this.stopEvent);

    form.appendChild(textarea);

    var submitBtn = this._submitBtn = L.DomUtil.create('button', 'leaflet-submit-btn');
    submitBtn.type = "submit";
    submitBtn.innerText =this._map.options.text.submitLoadBtn;

    L.DomEvent
      .on(submitBtn, 'click', this.stopEvent)
      .on(submitBtn, 'mousedown', this.stopEvent)
      .on(submitBtn, 'click', this._submitForm, this);

    form.appendChild(submitBtn);

    L.DomEvent.on(form, 'submit', L.DomEvent.preventDefault);
    container.appendChild(form);
  },
  _timeout: null,
  _submitForm () {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    var json;
    var map = this._map;
    try {
      json = JSON.parse(this._textarea.value);

      map._msgContainer.msg(map.options.text.jsonWasLoaded, "success");

      map.createEditPolygon(json);

      this._timeout = setTimeout(() => {
        this._map._msgContainer.hide();
      }, 2000);

      this._collapse();
    } catch (e) {
      map._msgContainer.msg(map.options.text.checkJson, "error");

      this._timeout = setTimeout(() => {
        this._map._msgContainer.hide();
      }, 2000);
    }
  },
  _onMouseOver () {
    this._map._msgContainer.msg(this._map.options.text.loadJson);
  },
  _onMouseOut () {
    this._map._msgContainer.hide();
  }
});