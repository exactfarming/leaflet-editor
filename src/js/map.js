import Base from './base';
import ControlsHook from './hooks/controls';

import layers from './layers';
import opts from './options';

import './utils/array';

function map(type) {
  let Instance = (type === 'mapbox') ? L.mapbox.Map : L.Map;
  let map = Instance.extend(Object.assign(Base, {
    $: undefined,
    initialize(id, options) {
      if (options.text) {
        Object.assign(opts.text, options.text);
        delete options.text;
      }

      let controls = options.controls;
      if (controls) {
        if (controls.zoom === false) {
          options.zoomControl = false;
        }
      }

      //if (options.drawLineStyle) {
      //  Object.assign(opts.drawLineStyle, options.drawLineStyle);
      //  delete options.drawLineStyle;
      //}
      if (options.style) {
        if (options.style.draw) {
          Object.assign(opts.style.draw, options.style.draw);
        }
        //delete options.style.draw;
        if (options.style.view) {
          Object.assign(opts.style.view, options.style.view);
        }
        if (options.style.startDraw) {
          Object.assign(opts.style.startDraw, options.style.startDraw);
        }
        if (options.style.drawLine) {
          Object.assign(opts.style.drawLine, options.style.drawLine);
        }
        delete options.style;
      }

      Object.assign(this.options, opts, options);
      //L.Util.setOptions(this, opts);

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