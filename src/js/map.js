import Base from './base';
import ControlsHook from './hooks/controls';

import * as layers from './layers';
import * as opts from './options';

import './utils/array';

function map(type) {
  let Instance = (type === 'mapbox') ? L.mapbox.Map : L.Map;
  var map = Instance.extend($.extend(Base, {
    $: undefined,
    initialize (id, options) {
      if (options.text) {
        $.extend(opts.options.text, options.text);
        delete options.text;
      }

      var controls = options.controls;
      if (controls) {
        if (controls.zoom === false) {
          options.zoomControl = false;
        }
      }

      if (options.drawLineStyle) {
        $.extend(opts.options.drawLineStyle, options.drawLineStyle);
        delete options.drawLineStyle;
      }
      if (options.style) {
        if (options.style.draw) {
          $.extend(opts.options.style.draw, options.style.draw);
        }
        //delete options.style.draw;
        if (options.style.view) {
          $.extend(opts.options.style.view, options.style.view);
        }
        if (options.style.startDraw) {
          $.extend(opts.options.style.startDraw, options.style.startDraw);
        }
        delete options.style;
      }

      $.extend(this.options, opts.options, options);
      //L.Util.setOptions(this, opts.options);

      if (type === 'mapbox') {
        L.mapbox.Map.prototype.initialize.call(this, id, this.options.mapboxId, this.options);
      } else {
        L.Map.prototype.initialize.call(this, id, this.options);
      }

      this.$ = $(this._container);

      layers.setLayers();

      this._addLayers([
        layers.viewGroup
        , layers.editGroup
        , layers.editPolygon
        , layers.editMarkersGroup
        , layers.editLineGroup
        , layers.dashedEditLineGroup
        , layers.editHoleMarkersGroup
      ]);

      this._setOverlays(options);

      if (this.options.forceToDraw) {
        this.mode('draw');
      }
    },
    _setOverlays (opts) {
      var overlays = opts.overlays;

      for (var i in overlays) {
        var oi = overlays[i];
        this._controlLayers.addOverlay(oi, i);
        oi.addTo(this);
        oi.bringToBack();
        oi.on('click', function () {
          return false;
        });
        oi.on('mouseup', function () {
          return false;
        });
      }
    },
    getVGroup () {
      return layers.viewGroup;
    },
    getEGroup () {
      return layers.editGroup;
    },
    getEPolygon () {
      return layers.editPolygon;
    },
    getEMarkersGroup () {
      return layers.editMarkersGroup;
    },
    getELineGroup () {
      return layers.editLineGroup;
    },
    getDELine () {
      return layers.dashedEditLineGroup;
    },
    getEHMarkersGroup () {
      return layers.editHoleMarkersGroup;
    },
    getSelectedPolygon: () => this._selectedPolygon,
    getSelectedMGroup () {
      return this._selectedMGroup;
    }
  }));

  map.addInitHook(ControlsHook);

  return map;
}

export default map;