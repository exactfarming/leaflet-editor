import Base from './base';
import ControlsHook from './hooks/controls';
import EditEventsHook from './edit/hooks/events';

import * as layers from './layers';
import * as opts from './options';

import './utils/array';

function map() {
  var map = L.Map.extend($.extend(Base, {
    $: undefined,
    initialize (id, options) {
      $.extend(opts.options, options);
      L.Util.setOptions(this, opts.options);
      L.Map.prototype.initialize.call(this, id, options);
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
  map.addInitHook(EditEventsHook);

  return map;
}

export default map();
