process.env.NODE_ENV="production"

const webpack = require("webpack");
const path = require("path");
const Dotenv = require('dotenv-webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  node: {
    fs: "empty"
  },
  debug: false,
  devtool: 'source-map', // inline-source-map - A SourceMap is added as a DataUrl to the bundle. //
  noInfo: false, // Webpack will display a list of all the files that it's bundling, can be deactivated later
  entry: [
    path.resolve(__dirname, 'src/index')
  ],
  target: 'web', // webpack knows it needs to bundle it up for the browser
  output: {
    path: __dirname + '/dist', // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'src')
  },
  plugins: [
    new Dotenv({
      path: './.env', // Path to .env file (this is the default)
      safe: false // load .env (defaults to "false" which does not use dotenv-safe)
    }),
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new webpack.DefinePlugin({
       'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  module: {
    noParse: /node_modules\/provotum-stomp-client\/lib\/sock-js\/sockjs.js/,
    loaders: [
      {test: /\.js$/, include: path.join(__dirname, 'src'), loaders: ['babel']},
      {test: /(\.css)$/, loaders: ['style', 'css']},
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
      {test: /\.(woff|woff2)$/, loader: 'url?prefix=font/&limit=5000'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
    ]
  }

};
