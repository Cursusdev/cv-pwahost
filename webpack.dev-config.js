import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { common } from './webpack.shared-config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default () => merge(common, {
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
    static: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            },
          },
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
