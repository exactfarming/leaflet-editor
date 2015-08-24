var xhrObj = new XMLHttpRequest();
xhrObj.open('GET', 'http://maps.google.com/maps/api/js?sensor=true', false);
xhrObj.send('');
var se = document.createElement('script');
se.type = "text/javascript";
se.text = xhrObj.responseText;
document.getElementsByTagName('head')[0].appendChild(se);

//(function () {
//  var i, len, object, ref;
//
//  window.google = {
//    maps: {
//      event: jasmine.createSpyObj('google.maps.event', ['addListener', 'Ke', 'removeListener', 'clearListeners', 'clearInstanceListeners', 'trigger', 'addDomListener', 'addDomListenerOnce', 'T', 'bind', 'addListenerOnce', 'forward', 'Ga', 'Og', 'Nj']),
//      LatLngBounds: function() {
//        return jasmine.createSpyObj('google.maps.LatLngBounds', ['getCenter', 'toString', 'toUrlValue', 'b', 'equals', 'contains', 'intersects', 'extend', 'union', 'getSouthWest', 'getNorthEast', 'toSpan', 'isEmpty']);
//      },
//      Map: function() {
//        return jasmine.createSpyObj('google.maps.Map', ['constructor', 'streetView_changed', 'getDiv', 'M', 'panBy', 'panTo', 'panToBounds', 'fitBounds', 'getBounds', 'getStreetView', 'setStreetView', 'getCenter', 'setCenter', 'getZoom', 'setZoom', 'getMapTypeId', 'setMapTypeId', 'getProjection', 'getHeading', 'setHeading', 'getTilt', 'setTilt']);
//      }
//    }
//  };
//
//  $.extend(google.maps, jasmine.createSpyObj('google.maps', ['__gjsload__', 'Circle', 'GroundOverlay', 'ImageMapType', 'InfoWindow', 'LatLng', 'MVCArray', 'MVCObject', 'MapTypeRegistry', 'Marker', 'MarkerImage', 'OverlayView', 'Point', 'Polygon', 'Polyline', 'Rectangle', 'Size', 'BicyclingLayer', 'DirectionsRenderer', 'DirectionsService', 'DistanceMatrixService', 'ElevationService', 'FusionTablesLayer', 'Geocoder', 'KmlLayer', 'MaxZoomService', 'StreetViewPanorama', 'StreetViewService', 'StyledMapType', 'TrafficLayer', 'TransitLayer']));
//
//  ref = ['Animation', 'ControlPosition', 'MapTypeControlStyle', 'MapTypeId', 'NavigationControlStyle', 'ScaleControlStyle', 'SymbolPath', 'ZoomControlStyle', 'DirectionsStatus', 'DirectionsTravelMode', 'DirectionsUnitSystem', 'DistanceMatrixStatus', 'DistanceMatrixElementStatus', 'ElevationStatus', 'GeocoderLocationType', 'GeocoderStatus', 'KmlLayerStatus', 'MaxZoomStatus', 'StreetViewStatus', 'TravelMode', 'UnitSystem', 'geometry'];
//  for (i = 0, len = ref.length; i < len; i++) {
//    object = ref[i];
//    google.maps[object] = {};
//  }
//}());