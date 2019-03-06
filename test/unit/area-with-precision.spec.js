import {
  precision
} from '../../src/js/utils/precision.js';

describe('area', function() {
  it('test area precision', function() {
    let json = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [37.547836, 55.665193],
              [37.573929, 55.687649],
              [37.597961, 55.680294],
              [37.572556, 55.656285],
              [37.547836, 55.665193]
            ]
          ]
        ]
      }
    };


    let m2 = turf.area(json);
    let ha = precision(m2/10000, 2);

    assert.equal(ha, 542.07);
  });
});
