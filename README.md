# leaflet-editor [![Build Status](https://travis-ci.org/exactfarming/leaflet-editor.svg?branch=master)](https://travis-ci.org/exactfarming/leaflet-editor)

Leaflet plugin which helps edit polygons

Works with leaflet 0.7.x (see folder "examples") and mapbox v2.2.1 (see folders "examples/mapbox.html", "test/index.html")

## Support old browsers versions

> IE10

## Examples
1) [http://exactfarming.github.io/leaflet-editor/](http://exactfarming.github.io/leaflet-editor/)

2) ["area" function](http://exactfarming.github.io/leaflet-editor/index-area) ("turf.js" library is required)

## Install packages
yarn install

## Build
npm run build

## Run
npm run start:dev

## Tests

 There are several ways to do it:

 1) Open test/index.html file
 2) Use wallabyjs tool
 3) Run `testem`

## Style

Change style of markers using css variables

```
:root {
  --l-editor-icon-selected-background-color: #B53200;
  --l-editor-icon-selected-border-color: #FFFFFF;
  /*--l-editor-icon-selected-box-shadow-color: #B53200;*/

  --l-editor-icon-first-border-color: rgba(229, 81, 16, 1);
  --l-editor-icon-first-background-color: #88ff88;

  --l-editor-icon-background-color: #88ff88;
  --l-editor-icon-border-color: #88ff88;
  /*--l-editor-icon-box-shadow-color: #313131;*/
  --l-editor-icon-drag-border-color: #00cd00;

  --l-editor-tooltip-background-color: rgba(0, 0, 0, 0.5);
  --l-editor-tooltip-border-color: rgba(0, 0, 0, 0);

  --l-editor-icon-middle-selected-border-color: #FFFFFF;
  --l-editor-icon-middle-background-color: transparent;

  --l-editor-icon-middle-border-color: #88ff88;
  /*--l-editor-icon-middle-box-shadow-color: #212121;*/

  --l-editor-icon-width: 12px;
  --l-editor-icon-height: 12px;
}
```

## Deprecations

Removed:

 options

 - `defaultControlLayers` - please, add your own layers

 - `allowIntersection` - please use @turf/kinks to detect self-intersections

 - `allowCorrectIntersection`

 methods

 - `restoreEPolygon`

 The main purpose of deprecation is to simplify process of editing
 and posibility to edit polygons with self-intersections.
