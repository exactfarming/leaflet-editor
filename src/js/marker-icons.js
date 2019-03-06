import m from './utils/mobile.js';

var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (m.isMobileBrowser()) {
  size = 2;
}

export var firstIcon = L.divIcon({
  className: "m-editor-div-icon-first",
  iconSize: [10 * size, 10 * size]
});

export var icon = L.divIcon({
  className: "m-editor-div-icon",
  iconSize: [10 * size, 10 * size]
});

export var dragIcon = L.divIcon({
  className: "m-editor-div-icon-drag",
  iconSize: [10 * size * 3, 10 * size * 3]
});

export var middleIcon = L.divIcon({
  className: "m-editor-middle-div-icon",
  iconSize: [10 * size, 10 * size]

});
