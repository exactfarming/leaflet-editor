window.editor = window.editor || {};

describe('methods', function () {

  beforeEach(() => {
    const content = document.querySelector('#test-container');

    if (!content) {
      document.querySelector('body').innerHTML = '<div id="test-container"></div>';
    }
    document.querySelector('#test-container').innerHTML = window.mapTemplate;

    editor = window.initMap();
  });

  afterEach(() => {
    const content = document.querySelector('#test-container');

    if (content) {
      editor.on('unload', () => {
        document.querySelector('#test-container').innerHTML = '';
      });

      editor.remove();
    }
  });

  it('createEditPolygon', async () => {

    const geoJSON = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[
          [
            [73.804779, 54.650002],
            [73.970947, 54.684947],
            [74.058838, 54.612641],
            [73.881683, 54.596732],
            [73.714142, 54.670655],
            [73.817139, 54.707962],
            [73.804779, 54.650002]],
          [
            [73.946228, 54.661124],
            [73.981934, 54.633313],
            [73.900909, 54.622183],
            [73.946228, 54.661124]
          ]
        ]]
      }
    };

    let layer = editor.createEditPolygon(geoJSON);

    editor.fitBounds(layer.getBounds());

    expect(document.querySelectorAll('path.leaflet-clickable:not(.editable-polygon)').length).to.eql(1);
  });

  it('getEditableArea', async () => {

    const geoJSON = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [73.804779, 54.650002],
              [73.970947, 54.684947],
              [74.058838, 54.612641],
              [73.881683, 54.596732],
              [73.714142, 54.670655],
              [73.817139, 54.707962],
              [73.804779, 54.650002]],
            [
              [73.946228, 54.661124],
              [73.981934, 54.633313],
              [73.900909, 54.622183],
              [73.946228, 54.661124]
            ]
          ]
        ]
      }
    };

    let layer = editor.createEditPolygon(geoJSON);

    editor.fitBounds(layer.getBounds());

    expect(editor.getEditableArea()).to.eql(0);

    await triggerEvent('click', 'path.leaflet-clickable:not(.editable-polygon)', {position: {x: 40, y: 40}});

    expect(editor.getEditableArea()).to.eql(114178506.51615);
  });

  it('geoJSONArea', async () => {
    const geoJSON = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [73.804779, 54.650002],
              [73.970947, 54.684947],
              [74.058838, 54.612641],
              [73.881683, 54.596732],
              [73.714142, 54.670655],
              [73.817139, 54.707962],
              [73.804779, 54.650002]],
            [
              [73.946228, 54.661124],
              [73.981934, 54.633313],
              [73.900909, 54.622183],
              [73.946228, 54.661124]
            ]
          ]
        ]
      }
    };

    let layer = editor.createEditPolygon(geoJSON);

    editor.fitBounds(layer.getBounds());

    await triggerEvent('click', 'path.leaflet-clickable:not(.editable-polygon)', {position: {x: 40, y: 40}});

    expect(editor.getEditableArea()).to.eql(114178506.51615);
    expect(editor.geoJSONArea(geoJSON)).to.eql(114178506.51615033);
  });

  it('saveState', async () => {
    const geoJSON = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [73.804779, 54.650002],
              [73.970947, 54.684947],
              [74.058838, 54.612641],
              [73.881683, 54.596732],
              [73.714142, 54.670655],
              [73.817139, 54.707962],
              [73.804779, 54.650002]],
            [
              [73.946228, 54.661124],
              [73.981934, 54.633313],
              [73.900909, 54.622183],
              [73.946228, 54.661124]
            ]
          ]
        ]
      }
    };

    editor.createEditPolygon(geoJSON);

    const json = editor.saveState();

    expect(json).to.eql(geoJSON.geometry);


    await triggerEvent('click', 'path.leaflet-clickable:not(.editable-polygon)', {position: {x: 40, y: 40}});
  });
});
