module.exports = () => {
  return {
    files: [
      {pattern: 'node_modules/leaflet/dist/leaflet.css', instrument: false},
      {pattern: 'dist/css/index.css', instrument: false},
      {pattern: 'node_modules/chai/chai.js', instrument: false},
      {pattern: 'node_modules/chai-spies/chai-spies.js', instrument: false},
      {pattern: 'vendor/js/turf-area.min.js', instrument: false},
      {pattern: 'test/helper/*.js', instrument: false},
      {
        load: true,
        pattern: 'node_modules/leaflet/dist/leaflet-src.js',
        instrument: false
      },

      'src/**/*.js',
      '!src/**/*.spec.js',

      '!dist/**/*.js',
      '!src/**/index.mapbox.js'
    ],
    tests: [
      'src/**/*.spec.js',
      'test/**/*.spec.js',
      'test/**/*.e2e.spec.js'
    ],
    env: {
      kind: 'chrome',
      params: {
        runner: '--headless --disable-gpu'
      }
    },
    debug: false,

    setup() {
      window.expect = chai.expect;
      window.assert = chai.assert;
    }
  };
};
