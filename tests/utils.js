window.setPoint = function (map, latlng) {
  var latlngPoint = new L.LatLng(latlng.lat, latlng.lng);
  map.fireEvent('click', {
    latlng: latlngPoint,
    layerPoint: map.latLngToLayerPoint(latlngPoint),
    containerPoint: map.latLngToContainerPoint(latlngPoint)
  });
};

window.setPolygon = function (map, latlngs) {

  latlngs.forEach(function(latlng) {setPoint(map, latlng)});

  var firstMarker = map.getEMarkersGroup().getFirst();

  selectPoint(firstMarker);
};

window.selectPoint = function (marker) {
  marker.fireEvent('click', {
    latlng: marker.getLatLng()
  });
};

window.setTestPolygon = function (map) {
  var k = 4;

  var latlng = map.getCenter();

  latlng = {lat: latlng.lat - 0.04 * k, lng: latlng.lng};

  var latlng2 = $.extend(true, {}, latlng);
  latlng2.lat += 0.04 * k; latlng2.lng += 0.081 * k;

  var latlng3 = $.extend(true, {}, latlng2);
  latlng3.lat += 0.04 * k; latlng3.lng -= 0.081 * k;

  var latlng4 = $.extend(true, {}, latlng2);
  latlng4.lat += 0.02 * k; latlng4.lng -= 0.16 * k;

  setPolygon(map, [
    latlng, latlng2, latlng3, latlng4
  ]);
};