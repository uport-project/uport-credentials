const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: './lib/index.js',
  output: {
    filename: 'uport.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: 'Uport'
  }
}
