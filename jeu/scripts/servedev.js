var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');
var webpackconfig = require('../webpack.config');

webpackconfig.entry.app.unshift(
  'webpack-dev-server/client?http://localhost:8080',
  'webpack/hot/dev-server'
);

webpackconfig.plugins.push(new webpack.HotModuleReplacementPlugin());

var compiler = webpack(webpackconfig);
var server = new webpackDevServer(compiler, {
  hot: true,
  inline: true,
  publicPath: '/assets/',
  stats: { colors: true },
  quiet: false,
  noInfo: false,
  contentBase: __dirname + "/../public",
  hostname: "0.0.0.0"
});

server.listen(8080);
