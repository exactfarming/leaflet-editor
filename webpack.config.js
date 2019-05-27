const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = () => {
  return {
    devtool: 'inline-source-map',
    entry: {
      'dist/js/index': './src/js/index.js',
      'dist/js/index.min': './src/js/index.js',
      'dist/js/index.mapbox': './src/js/index.mapbox.js',
      'dist/js/index.mapbox.min': './src/js/index.mapbox.js'
    },
    output: {
      path: path.join(__dirname, ''),
      filename: '[name].js'
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'src/css', to: 'dist/css' },
        { from: 'vendor', to: 'dist/vendor' }
      ]),
      // new UglifyJsPlugin({
      //   include: /\.min\.js$/
      // })
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /(node_modules|bower_components|vendor)/
        }
      ]
    }
  };
};
