const webpack = require('webpack');
const path = require('path');

module.exports = function() {
  return {
    entry: {
      vendor: './client/vendor.js',
      index: './client/index.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'public/dist')
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor', // Specify the common bundle's name.
        minChunks: function (module) {
          // this assumes your vendor imports exist in the node_modules directory
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
      })
    ]
  }
};