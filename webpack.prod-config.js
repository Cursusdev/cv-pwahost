import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackCssReplaceWebp from 'webpack-css-replace-images-to-webp';
import { common } from './webpack.shared-config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default () => merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    publicPath: '/',
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              esModule: false,
            }
          },
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
      (compiler) => {
        new TerserPlugin({
          terserOptions: {
            compress: {},
          },
          extractComments: true,
        }).apply(compiler);
      },
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
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
  ],
});
