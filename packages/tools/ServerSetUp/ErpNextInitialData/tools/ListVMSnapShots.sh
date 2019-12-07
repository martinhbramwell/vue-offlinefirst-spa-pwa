#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export VM_PAIRS_NAME="virtualMachines.json";
export VM_PAIRS_PATH=${XDG_RUNTIME_DIR}/${VM_PAIRS_NAME};

export LVM_JSON="listVM.json";
export LVM_JSON_PATH=${XDG_RUNTIME_DIR}/${LVM_JSON};
export LVMSS_JSON="listVMSnapShots.json";
getVMSnapShots () {

  declare LVM_JSON_BODY="{ \"command\": \"listVMSnapshot\", \"virtualmachineid\": \"${IW_VM_ID}\" }";
  echo ${LVM_JSON_BODY} > ${LVM_JSON_PATH};

  ./iwstackCmd.py ${LVM_JSON_PATH} | jq -r ".listvmsnapshotresponse.vmSnapshot[] | .displayname + \"|\" + .id" > ${VM_PAIRS_PATH};

}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  pushd ${SCRIPT_DIR} >/dev/null;
    getVMSnapShots;
  popd >/dev/null;

  echo -e "~~~~~~~~\n\n";
  exit;

fi;
