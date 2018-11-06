var path = require('path');
module.exports = {
  devServer: {
    host: 'tstv',
    port: 3030,
  },
  chainWebpack: config => {
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .tap(options => {
        options.configFile = path.resolve(__dirname, ".eslintrc.js");
        return options;
      })
  },
  css: {
    loaderOptions: {
      postcss: {
        config:{
          path:__dirname
        }
      }
    }
  }
};
