const path = require('path');
const fs = require('fs');
const common = require('./webpack.common');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  output: {
    publicPath: '/',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer:{
    host: '127.0.0.1',
    port: 8080,
    historyApiFallback: true,
    contentBase: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'dev.html',
      template: './pages/dev.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'chain.html',
      template: './pages/chain.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'pro.html',
      template: './pages/pro.html',
    }),
  ]
});
