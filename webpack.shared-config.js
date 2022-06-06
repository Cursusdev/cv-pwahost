import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const common = {
  entry: {
    main: path.join(__dirname, './entry.js'),
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: [
          {
            loader: 'html-loader-srcset',
            options: {
              interpolate: true,
              attrs: [
                'img:src',
                'img:srcset',
                ':srcset',
                ':data-srcset',
                ':data-src'
              ],
              minimize: true,
              caseSensitive: true,
              removeAttributeQuotes:false,
              minifyJS:false,
              minifyCSS:false,
            },
          }
        ]
      },
      {
        test: /\.(png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[contenthash].[ext]',
              outputPath: 'img',
              esModule: false,
            }
          },
        ]
      },
      {
        test: /\.webp$/,
        include: [
            path.resolve(__dirname, './img')
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[contenthash].[ext]',
              outputPath: 'img',
              esModule: false,
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              webp: {
                quality: 75
              }
            }
          }
        ]
      },
      {
        test: /\.gif$/i,
        use: {
          loader: 'url-loader',
          options: {
            outputPath: 'img',
            esModule: false,
          }
        }
      },
      {
        test: /\.svg$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[contenthash].[ext]',
            outputPath: 'assets',
            esModule: false,
          }
        }
      },
      {
        test: /\.(woff2?|woff)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[contenthash].[ext]',
          outputPath: 'font',
        }
      },
    ]
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './favicon.ico',
          to: 'favicon.ico',
        },
        {
          from: './manifest.json',
          to: 'manifest.json',
        },
        {
          from: './browserconfig.xml',
          to: 'browserconfig.xml',
        },
        {
          from: './android-icon-144x144.png',
          to: 'android-icon-144x144.png',
        },
        {
          from: './apple-touch-icon.png',
          to: 'apple-touch-icon.png',
        },
        {
          from: './img/PerformCV_1200w630h.jpg',
          to: './img/PerformCV_1200w630h.jpg',
        },
        {
          from: './img/palmier-mer_800w600h.webp',
          to: './img/palmier-mer_800w600h.webp',
        },
        {
          from: './404.html',
          to: '404.html',
        },
        {
          from: './pages/offline.html',
          to: './offline.html',
        },
        {
          from: './favicons',
          to: 'favicons',
        },
        {
          from: './sw.js',
          to: 'sw.js',
        },
        {
          from: './robots.txt',
          to: 'robots.txt',
        }
      ]
    })
  ]
};
