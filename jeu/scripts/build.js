var webpack = require('webpack');
var webpackconfig = require('../webpack.config');
var chalk = require('chalk');

webpackconfig.bail = true;  // throw on error !

[
  new webpack.ProgressPlugin(function(percentage, msg) {
    console.log(chalk.yellow((percentage * 100) + '%') + ' ' + chalk.cyan(msg));
  }),
  new webpack.NoErrorsPlugin(),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.AggressiveMergingPlugin(),
].map(function(plugin) {
  webpackconfig.plugins.push(plugin);
});

webpack(webpackconfig, function(err, stats) {
  if(err) { throw err; }
  console.log('');
  console.log(chalk.grey(stats.toString()));
  console.log('');
  console.log(chalk.green('Compiled.'));
  console.log('');
});
