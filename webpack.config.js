const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = () => {
  return {
    devtool: 'source-map',
    entry: {
      'index': './src/js/index.js',
      'index.min': './src/js/index.js',
      'index.mapbox': './src/js/index.mapbox.js',
      'index.mapbox.min': './src/js/index.mapbox.js'
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'js/[name].js'
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'src/css', to: 'css' },
        { from: 'vendor', to: 'vendor' }
      ]),
      new UglifyJsPlugin({
        include: /\.min\.js$/
      })
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
