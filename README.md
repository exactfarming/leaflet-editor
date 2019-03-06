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
