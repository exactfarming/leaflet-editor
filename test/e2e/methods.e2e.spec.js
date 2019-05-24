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

    expect(document.querySelectorAll('path.leaflet-clickable:not(.view-polygon)').length).to.eql(1);
  });

  it('area', async () => {

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

    expect(editor.area()).to.eql(114178506.51615);

    await triggerEvent('click', 'path.leaflet-clickable:not(.view-polygon)', {position: {x: 40, y: 40}});

    expect(editor.area()).to.eql(114178506.51615);
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

    await triggerEvent('click', 'path.leaflet-clickable:not(.view-polygon)', {position: {x: 40, y: 40}});

    expect(editor.area()).to.eql(114178506.51615);
    expect(editor.geoJSONArea(geoJSON)).to.eql(114178506.51615033);
  });

  it('saveState', async () => {

    const geoJSON = {
      "type": "MultiPolygon",
      "coordinates": [
        [
          [
            [
              34.573288,
              54.035401
            ],
            [
              34.586334,
              54.039232
            ],
            [
              34.586678,
              54.031167
            ],
            [
              34.571915,
              54.031167
            ],
            [
              34.573288,
              54.035401
            ]
          ],
          [
            [
              34.580262,
              54.036359
            ],
            [
              34.582729,
              54.037241
            ],
            [
              34.583588,
              54.036157
            ],
            [
              34.583201,
              54.03467
            ],
            [
              34.580712,
              54.034645
            ],
            [
              34.581549,
              54.03588
            ],
            [
              34.580262,
              54.036359
            ]
          ]
        ],
        [
          [
            [
              34.577858,
              54.037543
            ],
            [
              34.576442,
              54.037253
            ],
            [
              34.576442,
              54.038312
            ],
            [
              34.578695,
              54.038526
            ],
            [
              34.578996,
              54.037896
            ],
            [
              34.577858,
              54.037543
            ]
          ]
        ]
      ]
    };
    const expectedGeoJSON = {
      "type": "MultiPolygon",
      "coordinates": [
        [
          [
            [
              34.573288,
              54.035401
            ],
            [
              34.586334,
              54.039232
            ],
            [
              34.586678,
              54.031167
            ],
            [
              34.571915,
              54.031167
            ],
            [
              34.573288,
              54.035401
            ]
          ],
          [
            [
              34.580262,
              54.036359
            ],
            [
              34.582729,
              54.037241
            ],
            [
              34.583588,
              54.036157
            ],
            [
              34.583201,
              54.03467
            ],
            [
              34.580712,
              54.034645
            ],
            [
              34.581549,
              54.03588
            ],
            [
              34.580262,
              54.036359
            ]
          ]
        ],
        [
          [
            [
              34.577858,
              54.037543
            ],
            [
              34.576442,
              54.037253
            ],
            [
              34.576442,
              54.038312
            ],
            [
              34.578695,
              54.038526
            ],
            [
              34.578996,
              54.037896
            ],
            [
              34.577858,
              54.037543
            ]
          ]
        ]
      ]
    };

    editor.createEditPolygon(geoJSON);

    const json = editor.saveState();

    assert.deepEqual(json, expectedGeoJSON);
  });

  it('polygon.isEmpty', async () => {
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
              [73.900909, 54.622183],
              [73.981934, 54.633313],
              [73.946228, 54.661124]
            ]
          ]
        ]
      }
    };

    editor.createEditPolygon(geoJSON);

    await triggerEvent('click', '.view-polygon', {position: {x: 40, y: 40}});

    expect(editor.getEPolygon().isEmpty()).to.be.false;

    editor.saveState();

    expect(editor.getEPolygon().isEmpty()).to.be.true;

    await triggerEvent('click', '.view-polygon', {position: {x: 40, y: 40}});

    editor.getEPolygon().clear();

    expect(editor.getEPolygon().isEmpty()).to.be.true;
  });
});
