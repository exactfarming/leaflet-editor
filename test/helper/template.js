window.mapTemplate = `
  <style>
    .container {
      width: 100%;
      height: 400px;
    }
    .panel {
      display: flex;
      flex-direction: row;
      
      min-width: 200px;
      
      background: lightgrey;
      
      /*min-height: 50px;;*/
      
      padding: 20px;
    }
  </style>
  <div id="map" class="container"></div>
  <div class="panel">
    <button id="clear">clear()</button>
  </div>
`;

window.initMap = function(opts = {}) {

  const editor = new window.LeafletEditor('map', Object.assign({
    defaultControlLayers: false,
    fullscreenControl: false,
    allowIntersection: true,
    center: [54.521081495443596, 73.95996093749999],
    zoom: 4
  }, opts));

  return editor;
};
