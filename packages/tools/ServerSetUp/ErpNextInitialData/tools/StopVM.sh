#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export STOP_JOB_NAME="stopVM.json";
export STOP_JOB_PATH=${XDG_RUNTIME_DIR}/${STOP_JOB_NAME};
export JOB_ID_PATH=".stopvirtualmachineresponse.jobid";

stopVirtualMachine () {
  declare JSON_BODY="{ \"command\": \"stopVirtualMachine\", \"id\": \"${IW_VM_ID}\" }";
  echo ${JSON_BODY} > ${STOP_JOB_PATH};

  echo -e "*** Stopping VM. ***";
  declare asyncJobId=$(./iwstackCmd.py ${STOP_JOB_PATH} | jq -r ${JOB_ID_PATH});

  ./WaitForJobEnd.sh ${asyncJobId};

  echo -e "*** VM stopped. ***";
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  pushd ${SCRIPT_DIR} >/dev/null;
    stopVirtualMachine;
  popd >/dev/null;

  echo -e "~~~~~~~~\n\n";
  exit;

fi;
