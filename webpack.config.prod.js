const merge = require('webpack-merge');
const mainConfig = require('./webpack.config');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(mainConfig, {
  devtool: false,
  plugins: [
    new UglifyWebpackPlugin() // 压缩js
  ]
})
