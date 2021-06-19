const path = require('path');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCssReplaceWebp = require('webpack-css-replace-images-to-webp');


module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    publicPath: '/',
    filename: '[name].[contentHash].js',
    chunkFilename: '[name].[contentHash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true,
          },
        },
      }),
      new TerserPlugin({
        parallel: true,
        cache: true,
        sourceMap: true,
      }),
      new HtmlWebpackPlugin({
        title: 'CV Index',
        filename: 'index.html',
        template: './index.html',
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        },
      }),
      new HtmlWebpackPlugin({
        title: 'CV Développeur',
        filename: 'dev.html',
        template: './pages/dev.html',
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        },
      }),
      new HtmlWebpackPlugin({
        title: 'CV Blockchain',
        filename: 'chain.html',
        template: './pages/chain.html',
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        },
      }),
      new HtmlWebpackPlugin({
        title: 'CV Projeteur',
        filename: 'pro.html',
        template: './pages/pro.html',
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new WebpackCssReplaceWebp(),
    new MiniCssExtractPlugin({ filename: '[name].[contentHash].css' }),
  ],
});
