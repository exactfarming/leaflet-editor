import BaseMap from './base.js';
import ControlsHook from './hooks/controls.js';

import opts from './options.js';

import './utils/array.js';
import ViewGroup from './view/group.js';
import DrawGroup from './modes/draw/group.js';
import EditPolygon from './modes/edit/polygon.js';
import MarkerGroup from './modes/edit/marker-group.js';
import DashedEditLineGroup from './modes/draw/dashed-line.js';
import HolesGroup from './modes/edit/holesGroup.js';

let Map = L.Map.extend({
  setLayers() {
    this.viewGroup = new ViewGroup([]);
    this.editGroup = new DrawGroup([]);
    this.editPolygon = new EditPolygon([]);
    this.editMarkersGroup = new MarkerGroup([]);
    this.dashedEditLineGroup = new DashedEditLineGroup([]);
    this.editHoleMarkersGroup = new HolesGroup([]);

    this.viewGroup.addTo(this);
    this.editGroup.addTo(this);
    this.editPolygon.addTo(this);
    this.editMarkersGroup.addTo(this);
    this.dashedEditLineGroup.addTo(this);
    this.editHoleMarkersGroup.addTo(this);
  },

  removeLayers() {
    this.removeLayer(this.viewGroup);
    this.removeLayer(this.editGroup);
    this.removeLayer(this.editPolygon);
    this.removeLayer(this.editMarkersGroup);
    this.removeLayer(this.dashedEditLineGroup);
    this.removeLayer(this.editHoleMarkersGroup);
  },

  initialize(id, options) {
    this.viewGroup = null;

    this.editGroup = null;

    this.editPolygon = null;

    this.editMarkersGroup = null;

    this.dashedEditLineGroup = null;

    this.editHoleMarkersGroup = null;

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

    if (options.style) {
      if (options.style.draw) {
        Object.assign(opts.style.draw, options.style.draw);
      }
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

    L.Map.prototype.initialize.call(this, id, options);

    this.whenReady(() => {
      this.setLayers();
    });

    if (this.options.forceToDraw) {
      this.mode('draw');
    }

    this.on('unload', () => {
      this.removeControl(this.msgHelper);
      this.removeLayers();
    });
  },

  getVGroup() {
    return this.viewGroup;
  },

  getEGroup() {
    return this.editGroup;
  },

  getEPolygon() {
    return this.editPolygon;
  },

  getEMarkersGroup() {
    return this.editMarkersGroup;
  },

  getDELine() {
    return this.dashedEditLineGroup;
  },

  getEHMarkersGroup() {
    return this.editHoleMarkersGroup;
  },

  getSelectedMGroup() {
    return this._selectedMGroup;
  },

  getCurrentGeoJSON() {
    const coords = [];

    this.getVGroup().eachLayer(layer => {
      if (layer !== this._getSelectedVLayer()) {
        coords.push(layer.toGeoJSON().geometry.coordinates);
      }
    });

    const eCoordinates = this.getEPolygon().toGeoJSON().geometry.coordinates;

    if (eCoordinates.length) {
      coords.push(eCoordinates);
    }

    return L.GeoJSON.getFeature(this, {
      type: 'MultiPolygon',
      coordinates: coords
    });
  }
});

Map.include(BaseMap);
Map.addInitHook(ControlsHook);

export default Map;

