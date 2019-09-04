#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
. ${SCRIPTPATH}/initializeConstants.sh;
initializeAllConstants;

function updateRemoteCouch() {
  pushd ${TMPDIR} > /dev/null;
    export REMOTE_CREDS="${REMOTE_PROTOCOL}://${REMOTE_ADMIN}:${REMOTE_ROOT_PWD}@${REMOTE_HOST}";
    export REMOTE_DB="${REMOTE_PROTOCOL}://${REMOTE_HOST}";

    echo -e "Deleting ${REMOTE_CREDS}/${REMOTE_DATABASE_NAME}";
    curl -X DELETE ${REMOTE_CREDS}/${REMOTE_DATABASE_NAME};

    export PUSH_TO_REMOTE="Push%20${LOCAL_DBNAME}%20to%20${REMOTE_HOST}";
    export PUSH_TO_REMOTE_URI="${COUCH_CREDS}/${REPLDB}/${PUSH_TO_REMOTE}";
    export PUSH_TO_REMOTE_TITLE=$(echo ${PUSH_TO_REMOTE//%20/ })
    echo -e "PUSH_TO_REMOTE_URI= ${PUSH_TO_REMOTE_URI}";
    echo -e "PUSH_TO_REMOTE_TITLE= ${PUSH_TO_REMOTE_TITLE}";

    curl -s ${PUSH_TO_REMOTE_URI} > 1.tmp;
    cat 1.tmp | jq -r ". |= del(${REPL_DONE_FLAGS})" > 2.tmp;
    cat 2.tmp | jq ".source += {\"url\": \"${COUCH_DB}/${LOCAL_DBNAME}\"}" > 3.tmp;
    cat 3.tmp | jq ".target += {\"url\": \"${REMOTE_DB}/${REMOTE_DATABASE_NAME}\"}" > 4.tmp;
    mv 4.tmp PushToRemote.json;
    cat PushToRemote.json | jq -r;

    curl -X PUT ${PUSH_TO_REMOTE_URI} -d @PushToRemote.json;
    # echo ${ACTIVE_URI};

    while  [ "$(curl -s ${ACTIVE_URI} | jq -r .[0].doc_id)" = "null" ]; do echo "Awaiting repliction start"; tput cuu 1; sleep 1; done
    while  [ "$(curl -s ${ACTIVE_URI} | jq -r .[0].doc_id)" != "null" ]; do curl -s ${ACTIVE_URI} | jq -r .[0].doc_id; tput cuu 1; sleep 1; done
  popd > /dev/null;

  echo -e "
  Done dev to production replication";
}


echo "Will purge and replace the CouchDb and PouchDb '${LOCAL_DBNAME}' on '${REMOTE_HOST}'"
if [[ $1 = "-f" ]]
then
  REPLY="y";
else
  read -p "Are you sure? " -n 1 -r
fi;
echo "";
if [[ $REPLY =~ ^[Yy]$ ]]
then
  export NAME_HOLDER="${BACKUP_NAME_HOLDER_start}${LOCAL_DBNAME}${BACKUP_NAME_HOLDER_end}";
  echo -e "Purging and replacing database '${LOCAL_DBNAME}' on '${REMOTE_HOST}...'
  ";

#   echo -e "***
# Disabled pushing database
# ***";
  ${SCRIPTPATH}/backup.sh -f;
  mv ${HOME}/${NAME_HOLDER} ${BACKUPS_DIR};
  pushd ${BACKUPS_DIR} > /dev/null
    tar zcvf xfer.tar.gz ${NAME_HOLDER} $(cat ${NAME_HOLDER});
    scp xfer.tar.gz ${REMOTE}:~ > /dev/null;
    ssh ${REMOTE} "cd ${BACKUPS_DIR}; tar zxvf \${HOME}/xfer.tar.gz";
  popd > /dev/null;


#   echo -e "***
# Disabled restoring database. App base dir: ${PROJECT_CONTAINER_DIR}
# ***";
  export WORK_PATH=${PROJ_DIR}/$(echo ${SCRIPTPATH} | sed 's/^.*vue-/vue-/');
  ssh -t  -o LogLevel=QUIET ${REMOTE} "export SUDO_ASKPASS=\"\${HOME}/.ssh/.supwd.sh\"; ${WORK_PATH}/enableDisableApplication.sh -d;";

  updateRemoteCouch;

  echo -e "Executing remote script '${WORK_PATH}/restore.sh'";
  ssh -t  -o LogLevel=QUIET ${REMOTE} "export SUDO_ASKPASS=\"\${HOME}/.ssh/.supwd.sh\"; ${WORK_PATH}/restore.sh -f;";

  ssh -t  -o LogLevel=QUIET ${REMOTE} "export SUDO_ASKPASS=\"\${HOME}/.ssh/.supwd.sh\"; ${WORK_PATH}/enableDisableApplication.sh -e;";
fi;


echo -e "~~~~~~~~~  Pushed Couch and Pouch to ${PRD_NEW_HOST}  ~~~~~~~~~~
 ";
exit;
