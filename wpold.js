var webpack = require('webpack');
var path = require('path');

module.exports = function() {
  return {
    entry: {
      vendor: './client/vendor.js',
      index: './client/index.js'
    },
    output: {
      filename: '[name]-[chunkhash].js',
      path: path.resolve(__dirname, 'public')
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'] // Specify the common bundle's name.
      })
    ]
  }
};