#!/usr/bin/env bash
#
source ${HOME}/.ssh/secrets/offsppwa-vue.config;

npm install;
npm run prestart;

node dist/index.js &
