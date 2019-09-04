#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";
. ${SCRIPTPATH}/initializeConstants.sh;
initializeAllConstants;

###  Use current script path and remote script's installed path to build full path to remote backup script
export WORK_PATH=${PROJ_DIR}/$(echo ${SCRIPTPATH} | sed 's/^.*vue-/vue-/');

echo -e "Executing remote script '${WORK_PATH}/backup.sh'";
ssh -t  -o LogLevel=QUIET ${REMOTE} "export SUDO_ASKPASS=\"\${HOME}/.ssh/.supwd.sh\"; ${WORK_PATH}/backup.sh -f;";

pushd ${BACKUPS_DIR} > /dev/null;
  echo -e "Getting backup file name from '${REMOTE}:~/LATEST_POUCHDB_${REMOTE_DATABASE_NAME}_BACKUP.txt'";
  scp ${REMOTE}:~/LATEST_POUCHDB_${REMOTE_DATABASE_NAME}_BACKUP.txt .  > /dev/null;
  export LATEST=$(cat LATEST_POUCHDB_${REMOTE_DATABASE_NAME}_BACKUP.txt) > /dev/null;
  echo -e "Pulling remote backup file '${REMOTE}:${LATEST}' to '${BACKUPS_DIR}'";
  scp ${REMOTE}:${BACKUPS_DIR}/${LATEST} .;
  cp ${LATEST} LATEST_${REMOTE_DATABASE_NAME}.tar.gz;
popd > /dev/null;

echo -e "~~~~~~~~~  Obtained ${LATEST}  ~~~~~~~~~~
 ";
exit;
