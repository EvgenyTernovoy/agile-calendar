const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const OfflinePlugin = require('offline-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const autoprefixer = require('autoprefixer')
const cssvariables = require('postcss-css-variables')
const inputrange = require('postcss-input-range')
const rootCssProps = require('./rootCssProps')
const nestedCss = require('postcss-nested')

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: function plugins() {
      return [
        nestedCss(),
        cssvariables({ preserve: true, variables: rootCssProps }),
        inputrange(),
        autoprefixer({ browsers: 'last 2 versions' }),
      ]
    },
  },
}

module.exports = {
  entry: {
    main: resolve(__dirname, '../src'),
    vendor: [
      'react',
      'react-dom',
      'react-redux',
      'react-router-dom',
      'redux',
      'redux-thunk',
      'emotion',
    ],
  },
  resolve: {
    alias: {
      src: resolve(__dirname, '../src'),
    },
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: resolve(__dirname, '../devops/run/dist/'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [resolve(__dirname, '../src')],
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              camelCase: true,
              importLoaders: 1,
              localIdentName: '[path][local]',
              context: './src/components/',
            },
          },
          postcssLoader,
        ],
      },
      {
        test: /\.svg$/,
        use: [
          { loader: 'svg-sprite-loader' },
        ],
      },
    ],
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        tpApiHost: JSON.stringify(process.env.tpApiHost),
        apiUrl: JSON.stringify(process.env.apiUrl),
        publicBucket: JSON.stringify(process.env.publicBucket),
      },
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'MotionTailor',
      template: 'webpack/template.html',
    }),
    new PreloadWebpackPlugin({
      rel: 'preload',
      as: 'script',
      include: 'all',
    }),
    // new OfflinePlugin({
    //   ServiceWorker: {
    //     navigateFallbackURL: '/',
    //   },
    //   AppCache: false,
    // }),
  ],
}
