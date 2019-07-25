#!/usr/bin/env bash
#
source ${HOME}/.bash_login;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )";
pushd ${DIR} >/dev/null;

  pushd './public/scripts/' >/dev/null;

    cat << EOF > parms.js
const envServerURL = '${COUCH_PROTOCOL}://${COUCH_HOST}';
const envDbName = '${COUCH_DATABASE}';
const envAuth = { username: '${COUCH_USR}', password: '${COUCH_PWD}' };
EOF

  popd >/dev/null;

  export PKG="xvfb";            dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libgtk2.0-0";     dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libnotify-dev";   dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libgconf-2-4";    dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libnss3";         dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libxss1";         dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libasound2";      dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="build-essential"; dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libssl-dev";      dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="libffi-dev";      dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="python-dev";      dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};
  export PKG="python3-pip";     dpkg -l | grep -qw ${PKG} || sudo -A apt-get -y install ${PKG};

  # sudo -A apt-get -y update && sudo -A apt-get -y upgrade && sudo -A apt-get -y dist-upgrade && sudo -A apt-get -y clean && sudo -A apt-get -y autoremove;

  export NVM_DIR="$HOME/.nvm";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

  sudo -A mkdir -p ${POUCH_DIR};
  sudo chown ${COUCH_ADM}:${COUCH_ADM} ${POUCH_DIR};
  sudo chmod ugo+rwx ${POUCH_DIR};

  sudo -A mkdir -p ${MAIL_DIR};
  sudo chown ${COUCH_ADM}:${COUCH_ADM} ${MAIL_DIR};
  sudo chmod ugo+rwx ${MAIL_DIR};

  export NODE_ICU_DATA='node_modules/full-icu/';


  npm install;
  npm run prestart;

  node dist/index.js &

popd >/dev/null;
