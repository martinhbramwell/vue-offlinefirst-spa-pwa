#!/usr/bin/env bash
#
source ${HOME}/.bash_login;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )";

. ${DIR}/initializeConstants.sh;
initializeLocalConstants;


pushd ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV} >/dev/null;

  pushd './public/scripts/' >/dev/null;

    cat << EOF > parms.js
const envServerURL = '${COUCH_PROTOCOL}://${COUCH_HOST}';
const envDbName = '${SLAVE_COUCH_DB}';
const envAuth = { username: '', password: '' };
EOF

    cat parms.js;
  popd >/dev/null;

  # export LOCAL_DB="${POUCH_DIR}/${MASTER_COUCH_DB}";
  # export REMOTE_DB="${COUCH_URL}/${SLAVE_COUCH_DB}";

  echo "LOCAL_DB => ${LOCAL_DB}";
  echo "REMOTE_DB => ${REMOTE_DB}";

  ./preBuild.sh;

  node dist/index.js &
popd >/dev/null;
