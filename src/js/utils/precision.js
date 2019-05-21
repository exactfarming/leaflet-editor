export const precision = function(number, prec) {
  let arrayStrings = (`${number}`).split('.');
  prec = prec || 0;

  if (!number || arrayStrings.length === 1) {
    return number;
  }

  let isFloat = arrayStrings[1].length > 0;

  let rslt = 0;

  if (isFloat) {
    let _prec = (arrayStrings[1].length < prec) ? arrayStrings[1].length : prec;
    rslt = number.toPrecision(arrayStrings[0].length + _prec);
  }

  return Number(rslt);
};

export const precisionGeoJSON = function(geoJSON, prec = 0) {
  let json;
  if (geoJSON === null || geoJSON === undefined) {
    throw new Error('Please, make sure that first arguments is geoJSON');
  }

  if (geoJSON.features && geoJSON.features[0]) {
    geoJSON.features = geoJSON.features.map(feature => {
      return precisionGeoJSON(feature, prec);
    }, []);
  }

  json = Object.assign({}, geoJSON);

  if (json.geometry) {
    let { geometry: { type, coordinates } } = json;

    if (!Array.isArray(coordinates)) {
      throw new Error('Please, make sure that geoJSON has correct structure');
    }

    if (type === 'Polygon') {
      if (prec > 0) {
        coordinates.forEach(outlet => {
          outlet.forEach(edge => {
            edge[0] = precision(edge[0], prec);
            edge[1] = precision(edge[1], prec);
          });
        });
      }
    }

    if (type === 'MultiPolygon') {
      if (prec > 0) {
        coordinates.forEach(polygon => {
          polygon.forEach(outlet => {
            outlet.forEach(edge => {
              edge[0] = precision(edge[0], prec);
              edge[1] = precision(edge[1], prec);
            });
          });
        });
      }
    }
  }

  return json;
};
