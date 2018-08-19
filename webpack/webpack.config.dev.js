const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
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
  entry: [
    'webpack-dev-server/client',
    'webpack/hot/only-dev-server',
    resolve(__dirname, 'hotReload'),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, '../src'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname),
    publicPath: '/',
  },
  context: resolve(__dirname, '../src'),
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    host: '0.0.0.0',
    contentBase: resolve(__dirname, '../assets'),
    publicPath: '/',
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [resolve(__dirname, '../src'), resolve(__dirname)],
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
    new webpack.DefinePlugin({
      'process.env': {
        tpApiHost: JSON.stringify(process.env.tpApiHost),
        apiUrl: JSON.stringify(process.env.apiUrl),
        publicBucket: JSON.stringify(process.env.publicBucket),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      title: 'Agile Calendar',
      template: '../webpack/template.html',
    }),
  ],
  performance: { hints: false },
}
