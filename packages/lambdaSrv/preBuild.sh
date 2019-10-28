#!/usr/bin/env bash
#
source ${HOME}/.bash_login;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )";

pushd ${DIR} >/dev/null;

#   pushd './public/scripts/' >/dev/null;

#     cat << EOF > parms.js
# const envServerURL = '${COUCH_PROTOCOL}://${COUCH_HOST}';
# const envDbName = '${COUCH_DATABASE}';
# const envAuth = { username: '', password: '' };
# EOF

#   popd >/dev/null;
  echo "$(date) |    Doing APT install as needed" | tee -a /tmp/pouchLog;

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

  echo "$(date) |    Loading NVM" | tee -a /tmp/pouchLog;
  export NVM_DIR="$HOME/.nvm";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

  echo "$(date) |    Creating data directories as needed" | tee -a /tmp/pouchLog;
  sudo -A mkdir -p ${POUCH_DIR};
  sudo chown ${COUCH_ADM}:${COUCH_ADM} ${POUCH_DIR};
  sudo chmod ugo+rwx ${POUCH_DIR};

  sudo -A mkdir -p ${MAIL_DIR};
  sudo chown ${COUCH_ADM}:${COUCH_ADM} ${MAIL_DIR};
  sudo chmod ugo+rwx ${MAIL_DIR};

  echo "$(date) |    Trial 'npm install'" | tee -a /tmp/pouchLog;
  export NODE_ICU_DATA='node_modules/full-icu/';
  npm install;
  if [ $? -ne 0 ]
  then
    echo "$(date) |    Full install attempt failed.  Separately installing 'full-icu'." | tee -a /tmp/pouchLog;
    export NODE_ICU_DATA=
    npm install full-icu;
    export NODE_ICU_DATA='node_modules/full-icu/';
    echo "$(date) |       ** Retrying full install **" | tee -a /tmp/pouchLog;
    npm install;
  fi;

  echo "$(date) |    Running 'npm run prestart'" | tee -a /tmp/pouchLog;
  npm run prestart;

popd >/dev/null;
#
