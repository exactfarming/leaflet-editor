export default function (map) {
  var link = map.fullscreenControl.link;
  link.title = "";
  L.DomUtil.addClass(link, 'full-screen');

  map.off('fullscreenchange');
  map.on('fullscreenchange', () => {
    L.DomUtil.addClass(map._titleFullScreenContainer, 'title-hidden');

    if (map.isFullscreen()) {
      map._titleFullScreenContainer.innerHTML = "Hide full";
    } else {
      map._titleFullScreenContainer.innerHTML = "View full";
    }
  }, this);

  var fullScreenContainer = map.fullscreenControl._container;

  map._titleFullScreenContainer = L.DomUtil.create('div', 'btn-leaflet-msg-container title-hidden');
  map._titleFullScreenContainer.innerHTML = "View full";
  fullScreenContainer.appendChild(map._titleFullScreenContainer);

  var _onMouseOver = () => {
    L.DomUtil.removeClass(map._titleFullScreenContainer, 'title-hidden');
  };
  var _onMouseOut = () => {
    L.DomUtil.addClass(map._titleFullScreenContainer, 'title-hidden');
  };

  L.DomEvent.addListener(fullScreenContainer, 'mouseover', _onMouseOver, this);
  L.DomEvent.addListener(fullScreenContainer, 'mouseout', _onMouseOut, this);
}