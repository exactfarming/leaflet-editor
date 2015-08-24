var wallabify = require('wallabify');
var wallabyPostprocessor = wallabify({
    // browserify options, such as
    // insertGlobals: false
  }
  // you may also pass an initializer function to chain other
  // browserify options, such as transformers
  // , b => b.exclude('mkdirp').transform(require('babelify'))
);

module.exports = function (wallaby) {
  wallaby.defaults.files.instrument = true;
  return {
    files: [
      //{pattern: 'bower_components/leaflet/dist/leaflet.css', load: true},
      //{pattern: 'bower_components/Leaflet.fullscreen/dist/leaflet.fullscreen.css', load: true},
      //{pattern: 'bower_components/bootstrap/dist/css/bootstrap.css', load: true},
      //{pattern: 'src/css/map-editor.css', load: true},
      //
      //{pattern: 'bower_components/jquery/dist/jquery.min.js', load: true},
      //{pattern: 'tests/google.js', load: true},
      //{pattern: 'bower_components/bootstrap/dist/js/bootstrap.js', load: true},
      //{pattern: 'bower_components/leaflet/dist/leaflet-src.js', load: true},
      //{pattern: 'bower_components/leaflet-plugins/layer/tile/Google.js', load: true},
      //{pattern: 'bower_components/Leaflet.fullscreen/dist/Leaflet.fullscreen.js', load: true},
      //
      //{pattern: 'tests/utils.js', load: true},
      //
      //{pattern: 'src/js/utils/*.js', load: false},
      //{pattern: 'src/js/*.js', load: false},
      //{pattern: 'src/js/view/*.js', load: false},
      //{pattern: 'src/js/view/group/*.js', load: false},
      //{pattern: 'src/js/draw/*.js', load: false},
      //{pattern: 'src/js/draw/hooks/*.js', load: false},
      //{pattern: 'src/js/after-draw/*.js', load: false},
      //{pattern: 'src/js/edit/*.js', load: false},
      //{pattern: 'src/js/edit/hooks/*.js', load: false},
      //{pattern: 'src/js/extended/*.js', load: false},
      //{pattern: 'src/js/hooks/*.js'
      {pattern: "src/js/utils/mobile.js"},
      {pattern: "src/js/utils/array.js", load: false}
    ],

    tests: [
      {pattern: 'tests/*Spec.js', load: false}
    ],

    preprocessors: {
      '**/*.js': file => require('babel').transform(file.content, {sourceMap: true})
    },
    "testFramework": "jasmine@2.1.3",
    postprocessor: wallabyPostprocessor,

    bootstrap: function () {
    //   required to trigger tests loading
      window.__moduleBundler.loadTests();
    },

    env: {
      type: 'browser',
      params: {
        runner: '--web-security=no'
      }
    }
  };
};