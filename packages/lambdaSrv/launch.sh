#!/usr/bin/env bash
#
. ${HOME}/.ssh/secrets/offsppwa-vue.config;

export PKG="xvfb"; dpkg -l | grep -qw ${PKG} || sudo apt-get install ${PKG};
export PKG="libgtk2.0-0"; dpkg -l | grep -qw ${PKG} || sudo apt-get install ${PKG};
export PKG="libnotify-dev"; dpkg -l | grep -qw ${PKG} || sudo apt-get install ${PKG};
export PKG="libgconf-2-4"; dpkg -l | grep -qw ${PKG} || sudo apt-get install ${PKG};
export PKG="libnss3"; dpkg -l | grep -qw ${PKG} || sudo apt-get install ${PKG};
export PKG="libxss1"; dpkg -l | grep -qw ${PKG} || sudo apt-get install ${PKG};
export PKG="libasound2"; dpkg -l | grep -qw ${PKG} || sudo apt-get install ${PKG};

# sudo apt-get -y update && sudo apt-get -y upgrade && sudo apt-get -y dist-upgrade && sudo apt-get -y clean && sudo apt-get -y autoremove;


npm install;
npm run prestart;

node dist/index.js &
