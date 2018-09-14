'use strict'

const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  AUTH_TEST_URL: '"COPY ./config/dev.env.js.example TO ./config/dev.env.js AND THEN FIX THIS LINE"',
  NODE_ENV: '"development"',
  STATIC_MODE: '"STATIC_DEV"'
});
