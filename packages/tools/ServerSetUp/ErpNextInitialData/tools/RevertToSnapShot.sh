#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;
source ${SCRIPT_DIR}/ListVMSnapShots.sh;

export REVERT_JOB_NAME="startVM.json";
export REVERT_JOB_PATH=${XDG_RUNTIME_DIR}/${REVERT_JOB_NAME};

revertVMSnapShot () {

  declare -A SNAPSHOTS;
  readarray -t LINES < ${VM_PAIRS_PATH};
  for LINE in "${LINES[@]}"; do
    KY=${LINE%%|*};
    VAL=${LINE#*|};
    # echo -e "${KY}  <=>  ${VAL}";
    SNAPSHOTS[${KY}]=${VAL};
  done

  KEYS=("${!SNAPSHOTS[@]}");

  declare REVERT_STS_RSLT=".reverttovmsnapshotresponse.jobid";
  declare JOB_STS_RSLT=".queryasyncjobresultresponse.jobstatus";

  while [ -z $DONE ]; do
    for (( I=0; $I < ${#SNAPSHOTS[@]}; I+=1 )); do
      KEY="${KEYS[$I]}";  echo "$I) $KEY";
    done
    read -p "Pick a number: " count;
    if [[ $count == [01234567] ]]; then
      declare CHOICE=${KEYS[$count]};
      read -p "   Revert VM to snapshot '${CHOICE}'? " confirm;
      if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        declare VMSSID="${SNAPSHOTS[${CHOICE}]}";
        # echo "Reverting with VM Id '${SNAPSHOTS[${CHOICE}]}'";
        declare RVRT_BODY="{ \"command\": \"revertToVMSnapshot\", \"vmsnapshotid\": \"${VMSSID}\" }";
        # echo "Reversion '${RVRT_BODY}'";
        echo ${RVRT_BODY} > ${REVERT_JOB_PATH};

        declare asyncJobId=$(./iwstackCmd.py ${REVERT_JOB_PATH} | jq -r ${REVERT_STS_RSLT});

        ./WaitForJobEnd.sh ${asyncJobId};

        DONE=true;
      elif [[ $confirm == [qQ] || $confirm == [qQ][uU][iI][T] ]]; then
        echo "QQ";
        exit 1;
      fi;
    fi;
  done

  echo -e "*** VM snapshot reverted to '${CHOICE}'. ***";
}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  pushd ${SCRIPT_DIR} >/dev/null;

    getVMSnapShots;
    revertVMSnapShot;

  popd >/dev/null;

  echo -e "~~~~~~~~\n\n";
  exit;

fi;
