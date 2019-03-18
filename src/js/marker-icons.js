import m from './utils/mobile.js';

var size = 1;
var userAgent = navigator.userAgent.toLowerCase();

if (m.isMobileBrowser()) {
  size = 2;
}

export const firstIcon = L.divIcon({
  className: "m-editor-div-icon-first",
  iconSize: [10 * size, 10 * size]
});

export const icon = L.divIcon({
  className: "m-editor-div-icon",
  iconSize: [10 * size, 10 * size]
});

export const dragIcon = L.divIcon({
  className: "m-editor-div-icon-drag",
  iconSize: [10 * size * 3, 10 * size * 3]
});

export const middleIcon = L.divIcon({
  className: "m-editor-middle-div-icon",
  iconSize: [10 * size, 10 * size]
});
