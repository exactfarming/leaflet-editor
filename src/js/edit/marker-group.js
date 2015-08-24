import BaseMGroup from '../extended/BaseMarkerGroup';
import EditMarker from '../edit/marker';
import EditLineGroup from '../edit/line';
import DashedEditLineGroup from '../draw/dashed-line';

import sort from '../utils/sortByPosition';
import * as icons from '../marker-icons';

L.Util.extend(L.LineUtil, {
  // Checks to see if two line segments intersect. Does not handle degenerate cases.
  // http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
  segmentsIntersect (/*Point*/ p, /*Point*/ p1, /*Point*/ p2, /*Point*/ p3) {
    return this._checkCounterclockwise(p, p2, p3) !==
      this._checkCounterclockwise(p1, p2, p3) &&
      this._checkCounterclockwise(p, p1, p2) !==
      this._checkCounterclockwise(p, p1, p3);
  },

  // check to see if points are in counterclockwise order
  _checkCounterclockwise (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
    return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
  }
});

export default L.MarkerGroup = BaseMGroup.extend({
  _isHole: false,
  _editLineGroup: undefined,
  _position: undefined,
  dashedEditLineGroup: new DashedEditLineGroup([]),
  options: {
    mIcon: undefined,
    mHoverIcon: undefined
  },
  initialize (layers) {
    L.LayerGroup.prototype.initialize.call(this, layers);

    this._markers = [];
    //this._bindEvents();
  },
  onAdd (map) {
    this._map = map;
    this.dashedEditLineGroup.addTo(map);
  },
  _updateDELine (latlng) {
    var deLine = this.getDELine();
    if (this._firstMarker) {
      deLine.update(latlng);
    }
    return deLine;
  },
  _addMarker (latlng) {
    //var eMarkersGroup = this.getEMarkersGroup();

    this.set(latlng);
    this.getDELine().addLatLng(latlng);

    this._map._convertToEdit(this);
  },
  getDELine () {
    if (!this.dashedEditLineGroup._map) {
      this.dashedEditLineGroup.addTo(this._map);
    }

    return this.dashedEditLineGroup;
  },
  _setHoverIcon () {
    var map = this._map;
    if (map._oldSelectedMarker !== undefined) {
      map._oldSelectedMarker._resetIcon(this.options.mIcon);
    }
    map._selectedMarker._setHoverIcon(this.options.mHoverIcon);
  },
  _sortByPosition () {
    if (!this._isHole) {
      var layers = this.getLayers();

      layers = layers.sort(function (a, b) {
        return a._leaflet_id - b._leaflet_id;
      });

      var idArray = [];
      var posArray = [];
      layers.forEach((layer) => {
        idArray.push(layer._leaflet_id);
        posArray.push(layer.__position);
      });

      sort(this._layers, idArray);
    }
  },
  updateStyle () {
    var markers = this.getLayers();

    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      marker._resetIcon(this.options.mIcon);
      if (marker === this._map._selectedMarker) {
        this._setHoverIcon();
      }
    }
  },
  setSelected (marker) {
    var map = this._map;

    if (map.__polygonEdgesIntersected && this.hasFirstMarker()) {
      map._selectedMarker = this.getLast();
      map._oldSelectedMarker = map._selectedMarker;
      return;
    }

    map._oldSelectedMarker = map._selectedMarker;
    map._selectedMarker = marker;
  },
  resetSelected () {
    var map = this._map;
    if (map._selectedMarker) {
      map._selectedMarker._resetIcon(this.options.mIcon);
      map._selectedMarker = undefined;
    }
  },
  getSelected () {
    return this._map._selectedMarker;
  },
  _setFirst (marker) {
    this._firstMarker = marker;
    this._firstMarker._setFirstIcon();
  },
  getFirst () {
    return this._firstMarker;
  },
  getLast () {
    if (this.hasFirstMarker()) {
      var layers = this.getLayers();
      return layers[layers.length - 1];
    }
  },
  hasFirstMarker () {
    return this.getFirst() && this.getFirst()._hasFirstIcon();
  },
  convertToLatLngs () {
    var latlngs = [];
    this.eachLayer(function (layer) {
      if (!layer.isMiddle()) {
        latlngs.push(layer.getLatLng());
      }
    });
    return latlngs;
  },
  restore (layer) {
    this.setAll(layer._latlngs);
    this.setAllHoles(layer._holes);
  },
  _add (latlng, position, options = {}) {

    if (this._map.isMode('draw')) {
      if (!this._firstMarker) {
        options.icon = icons.firstIcon;
      }
    }


    var marker = this.addMarker(latlng, position, options);

    this.getDELine().addLatLng(latlng);

    this._map.off('mousemove');
    if (this.getFirst()._hasFirstIcon()) {
      this._map.on('mousemove', (e) => {
        this._updateDELine(e.latlng);
      });
    } else {
      this.getDELine().clear();
    }

    if (marker._mGroup.getLayers().length > 2) {
      if (marker._mGroup._firstMarker._hasFirstIcon() && marker === marker._mGroup._lastMarker) {
        this._map.fire('editor:last_marker_dblclick_mouseover');
      }
    }

    return marker;
  },
  _closestNotMiddleMarker (layers, position, direction) {
    return (layers[position].isMiddle()) ? layers[position + direction] : layers[position];
  },
  _setPrevNext (marker, position) {
    var layers = this.getLayers();

    var maxLength = layers.length - 1;
    if (position === 1) {
      marker._prev = this._closestNotMiddleMarker(layers, position - 1, -1);
      marker._next = this._closestNotMiddleMarker(layers, 2, 1);
    } else if (position === maxLength) {
      marker._prev = this._closestNotMiddleMarker(layers, maxLength - 1, -1);
      marker._next = this._closestNotMiddleMarker(layers, 0, 1);

    } else {
      if (marker._middlePrev == null) {
        marker._prev = layers[position - 1];
      }
      if (marker._middleNext == null) {
        marker._next = layers[position + 1];
      }
    }

    return marker;
  },
  setMiddleMarker (position) {
    this.addMarker(position, null, {icon: icons.middleIcon});
  },
  setMiddleMarkers (position) {
    this.setMiddleMarker(position);
    this.setMiddleMarker(position + 2);
  },
  set (latlng, position, options) {
    if (!this.hasIntersection(latlng)) {
      this._map._msgContainer.hide();
      this._map.edgesIntersected(false);
      return this._add(latlng, position, options);
    } else {
      this._map.edgesIntersected(false);
      this._map._showIntersectionError();
    }
  },
  setMiddle (latlng, position, options) {
    position = (position < 0) ? 0 : position;

    //var func = (this._isHole) ? 'set' : 'setHoleMarker';
    var marker = this.set(latlng, position, options);

    marker._setMiddleIcon();
    return marker;
  },
  setAll (latlngs) {
    latlngs.forEach((latlng, position) => {
      this.set(latlng, position);
    });

    this.getFirst().fire('click');
  },
  setAllHoles (holes) {
    holes.forEach((hole) => {
      //this.set(hole);
      var lastHGroup = this._map.getEHMarkersGroup().addHoleGroup();

      hole._each((latlng, position) => {
        lastHGroup.set(latlng, position);
      });
      //var length = hole.length;
      //var i = 0;
      //for (; i < length; i++) {
      //  lastHGroup.set(hole[i], i);
      //}

      lastHGroup.getFirst().fire('click');
    });
  },
  setHoleMarker (latlng, options = {isHoleMarker: true, holePosition: {}}) {
    var marker = new EditMarker(this, latlng, options || {});
    marker.addTo(this);

    //this.setSelected(marker);

    if (this._map.isMode('draw') && this.getLayers().length === 1) {
      this._setFirst(marker);
    }

    return marker;
  },
  removeHole () {
    var map = this._map;
    //remove edit line
    //this.getELineGroup().clearLayers();
    //remove edit markers
    this.clearLayers();

    //remove hole
    map.getEPolygon().getHoles().splice(this._position, 1);
    map.getEPolygon().redraw();

    //redraw holes
    map.getEHMarkersGroup().clearLayers();
    var holes = map.getEPolygon().getHoles();

    var i = 0;
    for (; i < holes.length; i++) {
      map._setEHMarkerGroup(holes[i]);
    }
  },
  removeSelected () {
    var selectedEMarker = this.getSelected();
    var markerLayersArray = this.getLayers();
    var latlng = selectedEMarker.getLatLng();
    var map = this._map;

    if (markerLayersArray.length > 0) {
      this.removeLayer(selectedEMarker);

      map.fire('editor:delete_marker', {latlng: latlng});
    }

    markerLayersArray = this.getLayers();

    if (this._isHole) {
      if (map.isMode('edit')) {
        var i = 0;
        // no need to remove last point
        if (markerLayersArray.length < 4) {
          this.removeHole();
        } else {
          //selectedEMarker = map.getSelectedMarker();
          var holePosition = selectedEMarker.options.holePosition;

          //remove hole point
          //map.getEPolygon().getHole(this._position).splice(holePosition.hMarker, 1);
          map.getEPolygon().getHole(this._position).splice(selectedEMarker.__position, 1);
          map.getEPolygon().redraw();
        }

        var _position = 0;
        this.eachLayer((layer) => {
          layer.options.holePosition = {
            hGroup: this._position,
            hMarker: _position++
          };
        });
      }
    } else {
      if (map.isMode('edit')) {
        // no need to remove last point
        if (markerLayersArray.length < 3) {
          //remove edit markers
          this.clearLayers();
          map.getEPolygon().clear();
        }
      }
    }

    var position = 0;
    this.eachLayer((layer) => {
      layer.options.title = position;
      layer.__position = position++;
    });
  },
  getPointsForIntersection (polygon) {
    var map = this._map;
    this._originalPoints = [];
    var layers = ((polygon) ? polygon.getLayers() : this.getLayers()).filter((l) => !l.isMiddle());

    this._originalPoints = [];
    layers._each((layer) => {
      var latlng = layer.getLatLng();
      this._originalPoints.push(this._map.latLngToLayerPoint(latlng));
    });

    if (!polygon) {
      if (map._selectedMarker == layers[0]) { // point is first
        this._originalPoints = this._originalPoints.slice(1);
      } else if (map._selectedMarker == layers[layers.length - 1]) { // point is last
        this._originalPoints.splice(-1);
      } else { // point is not first / last
        var tmpArrPoints = [];
        for (var i = 1; i < layers.length; i++) {
          if (map._selectedMarker === layers[i]) {
            tmpArrPoints = this._originalPoints.splice(i + 1);
            this._originalPoints = tmpArrPoints.concat(this._originalPoints);
            this._originalPoints.splice(-1);
            break;
          }
        }
      }
    }
    return this._originalPoints;
  },
  _bindLineEvents: undefined,
  _hasIntersection (points, newPoint, isFinish) {
    var len = points ? points.length : 0,
      lastPoint = points ? points[len - 1] : null,
    // The previous previous line segment. Previous line segment doesn't need testing.
      maxIndex = len - 2;

    if (this._tooFewPointsForIntersection(1)) {
      return false;
    }

    return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, isFinish);
  },

  _hasIntersectionWithHole (points, newPoint, lastPoint) {
    var len = points ? points.length : 0,
    //lastPoint = points ? points[len - 1] : null,
    // The previous previous line segment. Previous line segment doesn't need testing.
      maxIndex = len - 2;

    if (this._tooFewPointsForIntersection(1)) {
      return false;
    }

    return this._lineHoleSegmentsIntersectsRange(lastPoint, newPoint);
  },

  hasIntersection (latlng, isFinish) {
    var map = this._map;
    if (map.options.allowIntersection) {
      return false;
    }

    var newPoint = map.latLngToLayerPoint(latlng);

    var points = this.getPointsForIntersection();

    var rslt1 = this._hasIntersection(points, newPoint, isFinish);
    var rslt2 = false;

    var fMarker = this.getFirst();
    if (fMarker && !fMarker._hasFirstIcon()) {
      // code was dublicated to check intersection from both sides
      // (the main idea to reverse array of points and check intersection again)

      points = this.getPointsForIntersection().reverse();
      rslt2 = this._hasIntersection(points, newPoint, isFinish);
    }

    map.edgesIntersected(rslt1 || rslt2);
    var edgesIntersected = map.edgesIntersected();
    return edgesIntersected;
  },
  hasIntersectionWithHole (lArray, hole) {

    if (this._map.options.allowIntersection) {
      return false;
    }

    var newPoint = this._map.latLngToLayerPoint(lArray[0]);
    var lastPoint = this._map.latLngToLayerPoint(lArray[1]);

    var points = this.getPointsForIntersection(hole);

    var rslt1 = this._hasIntersectionWithHole(points, newPoint, lastPoint);

    // code was dublicated to check intersection from both sides
    // (the main idea to reverse array of points and check intersection again)

    points = this.getPointsForIntersection(hole).reverse();
    lastPoint = this._map.latLngToLayerPoint(lArray[2]);
    var rslt2 = this._hasIntersectionWithHole(points, newPoint, lastPoint);

    this._map.edgesIntersected(rslt1 || rslt2);
    var edgesIntersected = this._map.edgesIntersected();

    return edgesIntersected;
  },
  _tooFewPointsForIntersection (extraPoints) {
    var points = this._originalPoints,
      len = points ? points.length : 0;
    // Increment length by extraPoints if present
    len += extraPoints || 0;

    return !this._originalPoints || len <= 3;
  },
  _lineHoleSegmentsIntersectsRange (p, p1) {
    var points = this._originalPoints, p2, p3;

    for (var j = points.length - 1; j > 0; j--) {
      p2 = points[j - 1];
      p3 = points[j];

      if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
        return true;
      }
    }

    return false;
  },
  _lineSegmentsIntersectsRange (p, p1, maxIndex, isFinish) {
    var points = this._originalPoints,
      p2, p3;

    var min = isFinish ? 1 : 0;
    // Check all previous line segments (beside the immediately previous) for intersections
    for (var j = maxIndex; j > min; j--) {
      p2 = points[j - 1];
      p3 = points[j];

      if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
        return true;
      }
    }

    return false;
  },
  _isMarkerInPolygon (marker) {
    var j = 0;

    var layers = this.getLayers();
    var sides = layers.length;

    var x = marker.lng;
    var y = marker.lat;

    var inPoly = false;

    for (var i = 0; i < sides; i++) {
      j++;
      if (j == sides) {
        j = 0;
      }
      var point1 = layers[i].getLatLng();
      var point2 = layers[j].getLatLng();
      if (((point1.lat < y) && (point2.lat >= y)) || ((point2.lat < y) && (point1.lat >= y))) {
        if (point1.lng + (y - point1.lat) / (point2.lat - point1.lat) * (point2.lng - point1.lng) < x) {
          inPoly = !inPoly
        }
      }
    }

    return inPoly;
  }
});