import Marker from '../edit/marker';
import sort from '../utils/sortByPosition';

export default L.Class.extend({
  includes: L.Mixin.Events,

  _selected: false,
  _lastMarker: undefined,
  _firstMarker: undefined,
  _positionHash: undefined,
  _lastPosition: 0,
  _markers: [],
  onAdd (map) {
    this._map = map;
    this.clearLayers();
    //L.LayerGroup.prototype.onAdd.call(this, map);
  },
  onRemove (map) {
    //L.LayerGroup.prototype.onRemove.call(this, map);
    this.clearLayers();
  },
  clearLayers () {
    this._markers.forEach((marker) => {
      this._map.removeLayer(marker);
    });
    this._markers = [];
  },
  addTo (map) {
    map.addLayer(this);
  },
  addLayer (marker) {
    this._map.addLayer(marker);
    this._markers.push(marker);
    if (marker.position != null) {
      this._markers.move(this._markers.length - 1, marker.position);
    }
    marker.position = (marker.position != null) ? marker.position : this._markers.length - 1;
  },
  remove () {
    var markers = this.getLayers();
    markers._each((marker) => {
      while (this.getLayers().length) {
        this.removeMarker(marker);
      }
    });

    if (!this._isHole) {
      var map = this._map;
      map.getVGroup().removeLayer(map._getSelectedVLayer());
    }
  },
  removeLayer (marker) {
    var position = marker.position;
    this._map.removeLayer(marker);
    this._markers.splice(position, 1);
  },
  getLayers () {
    return this._markers;
  },
  eachLayer (cb) {
    this._markers.forEach(cb);
  },
  markerAt (position) {
    var rslt = this._markers[position];

    if (position < 0) {
      return this.firstMarker();
    }

    if (rslt === undefined) {
      rslt = this.lastMarker();
    }

    return rslt;
  },
  firstMarker () {
    return this._markers[0];
  },
  lastMarker () {
    var markers = this._markers;
    return markers[markers.length - 1];
  },
  removeMarker (marker) {
    var b = !marker.isMiddle();

    var prevMarker = marker._prev;
    var nextMarker = marker._next;
    var nextnextMarker = marker._next._next;
    this.removeMarkerAt(marker.position);
    this.removeMarkerAt(prevMarker.position);
    this.removeMarkerAt(nextMarker.position);

    var map = this._map;

    if (this.getLayers().length > 0) {
      this.setMiddleMarker(nextnextMarker.position);

      if (b) {
        map.fire('editor:delete_marker', {marker: marker});
      }
    } else {
      if (this._isHole) {
        map.removeLayer(this);
        map.fire('editor:delete_hole', {marker: marker});
      } else {
        map.removePolygon(map.getEPolygon());

        map.fire('editor:delete_polygon');
      }
      map.fire('editor:marker_group_clear');
    }
  },
  removeMarkerAt (position) {
    if (this.getLayers().length === 0) {
      return;
    }

    var marker;
    if (typeof position === 'number') {
      marker = this.markerAt(position);
    } else {
      return;
    }

    var _changePos = false;
    var markers = this._markers;
    markers.forEach((_marker) => {
      if (_changePos) {
        _marker.position = (_marker.position === 0) ? 0 : _marker.position - 1;
      }
      if (_marker === marker) {
        marker._prev._next = marker._next;
        marker._next._prev = marker._prev;
        _changePos = true;
      }
    });

    this.removeLayer(marker);

    if (markers.length < 5) {
      this.clear();
      if (!this._isHole) {
        var map = this._map;
        map.getEPolygon().clear();
        map.getVGroup().removeLayer(map._getSelectedVLayer());
      }
    }
  },
  addMarker (latlng, position, options) {
    // 1. recalculate positions
    if (typeof latlng === 'number') {
      position = this.markerAt(latlng).position;
      this._recalcPositions(position);

      var prevMarker = (position - 1) < 0 ? this.lastMarker() : this.markerAt(position - 1);
      var nextMarker = this.markerAt((position == -1) ? 1 : position);
      latlng = this._getMiddleLatLng(prevMarker, nextMarker);
    }

    if (this.getLayers().length === 0) {
      options.draggable = false;
    }

    if (this.getFirst()) {
      options.draggable = !this.getFirst()._hasFirstIcon();
    }

    var marker = new Marker(this, latlng, options);
    if (!this._firstMarker) {
      this._firstMarker = marker;
      this._lastMarker = marker;
    }

    if (position !== undefined) {
      marker.position = position;
    }

    //if (this.getFirst()._hasFirstIcon()) {
    //  marker.dragging.disable();
    //} else {
    //  marker.dragging.enable();
    //}

    this.addLayer(marker);

    {
      marker.position = (marker.position !== undefined ) ? marker.position : this._lastPosition++;
      marker._prev = this._lastMarker;
      this._firstMarker._prev = marker;
      if (marker._prev) {
        this._lastMarker._next = marker;
        marker._next = this._firstMarker;
      }
    }

    if (position === undefined) {
      this._lastMarker = marker;
    }

    // 2. recalculate relations
    if (position !== undefined) {
      this._recalcRelations(marker);
    }
    // 3. trigger event
    if (!marker.isMiddle()) {
      this._map.fire('editor:add_marker', {marker: marker});
    }

    return marker;
  },
  clear () {
    var ids = this._ids();

    this.clearLayers();

    ids.forEach((id) => {
      this._deleteEvents(id);
    });

    this._lastPosition = 0;

    this._firstMarker = undefined;
  },
  _deleteEvents (id) {
    delete this._map._leaflet_events.viewreset_idx[id];
    delete this._map._leaflet_events.zoomanim_idx[id];
  },
  _getMiddleLatLng (marker1, marker2) {
    var map = this._map,
      p1 = map.project(marker1.getLatLng()),
      p2 = map.project(marker2.getLatLng());

    return map.unproject(p1._add(p2)._divideBy(2));
  },
  _recalcPositions (position) {
    var markers = this._markers;

    var changePos = false;
    markers.forEach((marker, _position) => {
      if (position === _position) {
        changePos = true;
      }
      if (changePos) {
        this._markers[_position].position += 1;
      }
    });
  },
  _recalcRelations () {
    var markers = this._markers;

    markers.forEach((marker, position) => {

      marker._prev = this.markerAt(position - 1);
      marker._next = this.markerAt(position + 1);

      // first
      if (position === 0) {
        marker._prev = this.lastMarker();
        marker._next = this.markerAt(1);
      }

      // last
      if (position === markers.length - 1) {
        marker._prev = this.markerAt(position - 1);
        marker._next = this.markerAt(0);
      }
    });
  },
  _ids () {
    var rslt = [];

    for (let id in this._layers) {
      rslt.push(id);
    }

    rslt.sort((a, b) => a - b);

    return rslt;
  },
  select () {
    if (this.isEmpty()) {
      this._map._selectedMGroup = null;
      return;
    }

    var map = this._map;
    if (this._isHole) {
      map.getEHMarkersGroup().resetSelection();
      map.getEMarkersGroup().resetSelection();
      map.getEHMarkersGroup().setLastHole(this);
    } else {
      map.getEHMarkersGroup().resetSelection();
      map.getEHMarkersGroup().resetLastHole();
    }

    this.getLayers()._each((marker) => {
      marker.selectIconInGroup();
    });
    this._selected = true;

    this._map._selectedMGroup = this;
    this._map.fire('editor:marker_group_select');
  },
  isEmpty () {
    return this.getLayers().length === 0;
  },
  resetSelection () {
    this.getLayers()._each((marker) => {
      marker.unSelectIconInGroup();
    });
    this._selected = false;
  }
})