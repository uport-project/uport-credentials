var path = require('path')

module.exports = {
  entry: './lib/index.js',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: path.resolve(__dirname, 'node_modules/redis'),
        loader: 'null-loader'
      }
    ]
  },
  output: {
    filename: 'uport.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: 'Uport'
  }
}
