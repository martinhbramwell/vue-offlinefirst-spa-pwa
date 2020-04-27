#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export START_JOB_NAME="startVM.json";
export START_JOB_PATH=${XDG_RUNTIME_DIR}/${START_JOB_NAME};
export JOB_ID_PATH=".startvirtualmachineresponse.jobid";

export TARGET_HOST="${PRD_ERPHOST_NAME}";

startVirtualMachine () {
  declare JSON_BODY="{ \"command\": \"startVirtualMachine\", \"id\": \"${IW_VM_ID}\" }";
  echo ${JSON_BODY} > ${START_JOB_PATH};

  echo -e "*** Starting VM. ***";

  declare asyncJobId=$(./iwstackCmd.py ${START_JOB_PATH} | jq -r ${JOB_ID_PATH});

  ./WaitForJobEnd.sh ${asyncJobId};
  echo -e "*** VM started. ***";

  ./WaitForSshStart.sh ${NEW_HOST_NAME};
  echo -e "*** ${NEW_HOST_NAME} is alive. ***";


}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  pushd ${SCRIPT_DIR} >/dev/null;
    startVirtualMachine;
  popd >/dev/null;

  echo -e "~~~~~~~~\n\n";
  exit;

fi;
