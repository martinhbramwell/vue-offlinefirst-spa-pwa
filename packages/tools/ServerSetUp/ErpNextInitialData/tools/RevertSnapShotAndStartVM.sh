#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  pushd ${SCRIPT_DIR} >/dev/null;
    ./KillVM.sh;
    ./RevertToSnapShot.sh ${1};
    ./StartVM.sh;
  popd >/dev/null;

  echo -e "~~~~~~~~\n\n";
  exit;

fi;
