import assert from 'assert';
import {
  precision,
  precisionGeoJSON
} from '../../src/js/utils/precision';

describe('precision', function() {
  it('undefined', function() {
    assert.equal(precision(), undefined);
  });

  it('precision(1234.456)', function() {
    assert.equal(precision(1234.456), 1234);
  });

  it('precision(1234.456, 1)', function() {
    assert.equal(precision(1234.456, 1), 1234.5);
  });

  it('precision(1234.456, 2)', function() {
    assert.equal(precision(1234.456, 2), 1234.46);
  });

  it('precision(1234.4512, 2)', function() {
    assert.equal(precision(1234.4512, 2), 1234.45);
  });

  it('precision(1234.4512, 2)', function() {
    assert.equal(precision(1234.4512, 3), 1234.451);
  });

  it('precision(1234.12, 6)', function() {
    assert.equal(precision(1234.12, 6), 1234.12);
  });

  it('precision(1234, 2)', function() {
    assert.equal(precision(1234, 2), 1234);
  });
});

describe('precisionGeoJSON', function() {

  it('undefined', function() {
    let json = undefined;

    try {
      precisionGeoJSON(json)
    } catch (e) {
      assert.equal(e.message, 'Please, make sure that first arguments is geoJSON');
    }

  });

  it('"coordinates": null', function() {
    let json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": null
      }
    };
    try {
      precisionGeoJSON(json)
    } catch (e) {
      assert.equal(e.message, 'Please, make sure that geoJSON has correct structure');
    }
  });


  it('"coordinates": []', function() {
    let json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": []
      }
    };
    assert.deepEqual(precisionGeoJSON(json, 6), json);
  });

  it('1. coordinates: [...]', function() {
    let json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [73.80477905273438, 54.65000162223775],
            [74.00802612304688, 54.68177097461746],
            [74.058837890625, 54.61264087543258],
            [73.88168334960936, 54.59673227441446],
            [73.71414184570312, 54.67065452767036],
            [73.817138671875, 54.70796198778959],
            [73.80477905273438, 54.65000162223775]
          ]
        ]
      }
    };

    assert.deepEqual(precisionGeoJSON(json), json);
  });

  it('2. coordinates: [...]', function() {
    let json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [73.80477905273438, 54.65000162223775],
            [74.00802612304688, 54.68177097461746],
            [74.058837890625, 54.61264087543258],
            [73.88168334960936, 54.59673227441446],
            [73.71414184570312, 54.67065452767036],
            [73.817138671875, 54.70796198778959],
            [73.80477905273438, 54.65000162223775]
          ]
        ]
      }
    };

    let precised_json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            ['73.804779', '54.650002'],
            [74.008026, 54.681771],
            [74.058838, 54.612641],
            [73.881683, 54.596732],
            [73.714142, 54.670655],
            [73.817139, 54.707962],
            [73.804779, 54.650002]
          ]
        ]
      }
    };
    assert.deepEqual(precisionGeoJSON(json, 6), precised_json);
  });
  it('3. coordinates: [...]', function() {
    let json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [73.80477905273438, 54.65000162223775],
            [73.970947265625, 54.68494654333107],
            [74.058837890625, 54.61264087543258],
            [73.88168334960936, 54.59673227441446],
            [73.71414184570312, 54.67065452767036],
            [73.817138671875, 54.70796198778959],
            [73.80477905273438, 54.65000162223775]
          ],
          [
            [73.94622802734375, 54.66112372206639],
            [73.98193359375, 54.63331276401967],
            [73.90090942382812, 54.622183052287575],
            [73.94622802734375, 54.66112372206639]
          ]
        ]
      }
    };

    let precised_json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
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
      }
    };
    assert.deepEqual(precisionGeoJSON(json, 6), precised_json);
  });
});