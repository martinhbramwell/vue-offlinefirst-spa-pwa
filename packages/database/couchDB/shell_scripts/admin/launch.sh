#!/usr/bin/env bash
#
source ${HOME}/.bash_login;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )";

. ${DIR}/initializeConstants.sh;
initializeLocalConstants;


pushd ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV} >/dev/null;

  ./preBuild.sh;

  export LOCAL_DB="/opt/pouchdb/ib201908_002";
  export REMOTE_DB="http://admin:plokplok.0.0.0@localhost:5984/ib201910_001";

  node dist/index.js &

popd >/dev/null;
