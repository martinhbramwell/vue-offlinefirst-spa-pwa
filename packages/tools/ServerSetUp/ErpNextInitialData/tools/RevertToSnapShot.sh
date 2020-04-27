#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;
source ${SCRIPT_DIR}/ListVMSnapShots.sh;

export REVERT_JOB_NAME="startVM.json";
export REVERT_JOB_PATH=${XDG_RUNTIME_DIR}/${REVERT_JOB_NAME};

declare REVERT_STS_RSLT=".reverttovmsnapshotresponse.jobid";

revertVMSnapShot () {
  declare SNAPSHOT=${1};
  # echo "CHOICE :: '${CHOICE}' VS ${SNAPSHOT}";
  declare VMSSID="${SNAPSHOTS[${SNAPSHOT}]}";

  echo "Reverting with VM Id '${SNAPSHOTS[${CHOICE}]}'";
  declare RVRT_BODY="{ \"command\": \"revertToVMSnapshot\", \"vmsnapshotid\": \"${VMSSID}\" }";
  # echo "Reversion '${RVRT_BODY}'";
  echo ${RVRT_BODY} > ${REVERT_JOB_PATH};

  # echo "Sending reversion request";
  declare asyncJobId=$(./iwstackCmd.py ${REVERT_JOB_PATH} | jq -r ${REVERT_STS_RSLT});

  # echo "Awaiting job '${asyncJobId}'";
  ./WaitForJobEnd.sh ${asyncJobId};

  echo "Done waiting";
}


loadSnapShotList () {
  readarray -t LINES < ${VM_PAIRS_PATH};
  for LINE in "${LINES[@]}"; do
    KY=${LINE%%|*};
    VAL=${LINE#*|};
    # echo -e "${KY}  <=>  ${VAL}";
    SNAPSHOTS[${KY}]=${VAL};
  done

}


generateKeysList () {
  for (( I=0; $I < ${#SNAPSHOTS[@]}; I+=1 )); do
    KEY="${KEYS[$I]}";  echo "$I) $KEY";
    # KEY="${KEYS[$I]}";  echo "$I) $KEY  ==> [${SNAPSHOTS[${KEY}]}]";
  done
}


revertChosenVMSnapShot () {

  declare JOB_STS_RSLT=".queryasyncjobresultresponse.jobstatus";

  # loadSnapShotList;

  # KEYS=("${!SNAPSHOTS[@]}");
  while [ -z $DONE ]; do
    # generateKeysList;
    read -p "Pick a number: " count;
    if [[ $count == [0123456789] ]]; then
      declare CHOICE=${KEYS[$count]};
      read -p "   Revert VM to snapshot '${CHOICE}'? " confirm;
      if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        revertVMSnapShot "${CHOICE}";
        # declare VMSSID="${SNAPSHOTS[${CHOICE}]}";
        # echo "Reverting with VM Id '${SNAPSHOTS[${CHOICE}]}'";
        # declare RVRT_BODY="{ \"command\": \"revertToVMSnapshot\", \"vmsnapshotid\": \"${VMSSID}\" }";
        # echo "Reversion '${RVRT_BODY}'";
        # echo ${RVRT_BODY} > ${REVERT_JOB_PATH};

        # declare asyncJobId=$(./iwstackCmd.py ${REVERT_JOB_PATH} | jq -r ${REVERT_STS_RSLT});

        # ./WaitForJobEnd.sh ${asyncJobId};

        DONE=true;
      elif [[ $confirm == [qQ] || $confirm == [qQ][uU][iI][T] ]]; then
        echo "QQ";
        exit 1;
      fi;
    fi;
  done

  echo -e "*** VM snapshot reverted to '${CHOICE}'. ***";
}


declare -A SNAPSHOTS;
declare KEYS;
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  pushd ${SCRIPT_DIR} >/dev/null;

    getVMSnapShots;
    loadSnapShotList;
    KEYS=("${!SNAPSHOTS[@]}");
    generateKeysList;
    if [[ -z $1 ]]; then
      echo -e "Choose from list...";
      revertChosenVMSnapShot;
    elif [[ $1 == [01234567] ]]; then
      echo -e "Using supplied choice '${1}'";
      declare CHOICE=${KEYS[${1}]};
      echo -e "Reverting '${CHOICE}'";
      revertVMSnapShot "${CHOICE}";
    else
      echo -e "Choice '${1}' is not a number in range '01234567'";
    fi;

  popd >/dev/null;

  echo -e "~~~~~~~~\n\n";
  exit;

fi;
