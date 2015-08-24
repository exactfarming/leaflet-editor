export default function () {
  L.Control.Search = L.Control.extend({
    options: {
      position: 'topleft',
      title: 'search location',
      email: ''
    },

    onAdd (map) {
      this._map = map;
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-search-bar');
      var wrapper = document.createElement('div');
      container.appendChild(wrapper);
      var link = L.DomUtil.create('a', '', wrapper);
      link.href = '#';

      var stop = L.DomEvent.stopPropagation;
      L.DomEvent
        .on(link, 'click', stop)
        .on(link, 'mousedown', stop)
        .on(link, 'dblclick', stop)
        .on(link, 'click', L.DomEvent.preventDefault)
        .on(link, 'click', this._toggle, this);

      link.appendChild(L.DomUtil.create('i', 'fa fa-search'));

      var form = this._form = document.createElement('form');

      var input = this._input = document.createElement('input');

      L.DomEvent.on(input, 'click', stop);

      form.appendChild(input);

      L.DomEvent.on(form, 'submit', function () {
        this._doSearch(input.value);
        return false;
      }, this).on(form, 'submit', L.DomEvent.preventDefault);
      container.appendChild(form);


      this._map.on('loadBtnOpened', this._collapse, this);

      L.DomEvent.addListener(container, 'mouseover', this._onMouseOver, this);
      L.DomEvent.addListener(container, 'mouseout', this._onMouseOut, this);

      return container;
    },

    _toggle () {
      if (this._form.style.display != 'block') {
        this._form.style.display = 'block';
        this._input.focus();
        this._map.fire('searchEnabled');
      } else {
        this._collapse();
        this._map.fire('searchDisabled');
      }
    },

    _collapse () {
      this._form.style.display = 'none';
      this._input.value = '';
    },

    _nominatimCallback (results) {

      if (this._results) {
        this._results.parentNode.removeChild(this._results);
      }

      var resultsContainer = this._results = document.createElement('div');
      resultsContainer.style.height = '80px';
      resultsContainer.style.overflowY = 'auto';
      resultsContainer.style.overflowX = 'hidden';
      resultsContainer.style.backgroundColor = 'white';
      resultsContainer.style.margin = '3px';
      resultsContainer.style.padding = '2px';
      resultsContainer.style.border = '2px grey solid';
      resultsContainer.style.borderRadius = '2px';

      var divResults = [];

      for (var i = 0; i < results.length; i++) {
        var div = L.DomUtil.create('div', 'search-results-el');
        div.innerText = results[i].display_name;
        div.title = results[i].display_name;
        resultsContainer.appendChild(div);

        var callback = (function (map, result, divEl) {
          return function () {
            for (var j = 0; j < divResults.length; j++) {
              L.DomUtil.removeClass(divResults[j], 'selected');
            }
            L.DomUtil.addClass(divEl, 'selected');

            var bbox = result.boundingbox;
            map.fitBounds(L.latLngBounds([[bbox[0], bbox[2]], [bbox[1], bbox[3]]]));
          }
        }(this._map, results[i], div));

        L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation)
        L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation)
          .on(div, 'click', callback);

        divResults.push(div);
      }

      this._form.appendChild(resultsContainer);

      if (results.length === 0) {
        this._results.parentNode.removeChild(this._results);
      }
    },

    _callbackId: 0,

    _doSearch (query) {
      var callback = '_l_osmgeocoder_' + this._callbackId++;
      window[callback] = L.Util.bind(this._nominatimCallback, this);
      var queryParams = {
        q: query,
        format: 'json',
        limit: 10,
        'json_callback': callback
      };
      if (this.options.email)
        queryParams.email = this.options.email;
      if (this._map.getBounds())
        queryParams.viewbox = this._map.getBounds().toBBoxString();
      var url = 'http://nominatim.openstreetmap.org/search' + L.Util.getParamString(queryParams);
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
    },
    _onMouseOver () {
      this._map._msgContainer.msg(this.options.title);
    },
    _onMouseOut () {
      this._map._msgContainer.hide();
    }
  });

  L.control.search = function (options) {
    return new L.Control.Search(options);
  };
}