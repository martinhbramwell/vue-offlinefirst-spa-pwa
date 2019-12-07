#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

waitForSSH () {
  declare HOST=$1;
  declare OPTS=" -o ConnectTimeout=1 -o ConnectionAttempts=1";

  ssh ${OPTS} ${HOST} pwd &>/dev/null;
  while test $? -gt 0
  do
    sleep 5
    echo "Trying ${HOST} connection again..."
    ssh ${OPTS} ${HOST} pwd &>/dev/null;
  done
}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  pushd ${SCRIPT_DIR} >/dev/null;
    waitForSSH $1;
  popd >/dev/null;

fi;
