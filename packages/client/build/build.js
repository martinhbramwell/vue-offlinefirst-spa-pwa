'use strict'

require('./check-versions')()

// process.env.NODE_ENV = 'production'

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const shell = require('shelljs')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')

const spinner = ora(`building for ${process.env.NODE_ENV}...`);
spinner.start()

let nameBkgrnd = 'BodyBgnd';
let imgBkgrnd = `${nameBkgrnd}*.jpg`;
let dupBkgrnd = `${nameBkgrnd}.jpg`;
let stc = 'docs/static';
let src = `${stc}/img`;
let trgt = `${stc}/css/static/img`;

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    shell.echo('  Tweak background image location');
    shell.mkdir('-p', trgt);
    shell.cp(`${src}/${imgBkgrnd}`, trgt);
    // shell.rm(`${trgt}/${dupBkgrnd}`);
    shell.mv(`${stc}/CNAME`, 'docs');

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
