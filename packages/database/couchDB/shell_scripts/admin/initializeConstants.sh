#!/usr/bin/env bash
#
function initializeLocalConstants() {
  echo -e "~~~~~~~~~  Initializing Local Constants  ~~~~~~~~~~
   ";
  export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

  export CONFIG_FILE="vue-offlinefirst-spa-pwa.config";
  export CONFIG_DIR=".ssh/secrets/${CONFIG_FILE}";
  export CONFIG="${HOME}/${CONFIG_DIR}";
  source ${CONFIG};

  if [ ! -d "${BACKUPS_DIR}" ]; then
    sudo -A mkdir -p ${BACKUPS_DIR};
    sudo -A chown ${USER}:${USER} ${BACKUPS_DIR};
  fi

  export REMOTE="${NEW_HOST_ADMIN}@${PRD_NEW_HOST}";
  export REMOTE_DATABASE_NAME="${PRD_COUCH_DATABASE_NAME}_${PRD_VERSION}";

  export LOCAL_DBNAME="${DEV_COUCH_DATABASE_NAME}_${DEV_VERSION}";
  export CLEAN_DB="${DEV_COUCH_DATABASE_NAME}_${DEV_VERSION}_clean";

  export TMPDIR="/dev/shm/vosp";
  mkdir -p ${TMPDIR};

  export HEADERS='  --header "Accept: application/json" --header "Content-Type: application/json"';

  export COUCH_CREDS="${DEV_COUCH_PROTOCOL}://${DEV_COUCH_ADMIN}:${DEV_COUCH_ROOT_PWD}@${DEV_COUCH_HOST_INTERNAL}";
  export COUCH_DB="${DEV_COUCH_PROTOCOL}://${DEV_COUCH_HOST_INTERNAL}";

  export ACTIVE="_active_tasks";
  export ACTIVE_URI="${COUCH_CREDS}/${ACTIVE}";

  export REPLDB="_replicator";
  export REPL_DONE_FLAGS="._replication_state, ._replication_state_time, ._replication_stats";

  export BACKUP_NAME_HOLDER_start="LATEST_POUCHDB_";
  export BACKUP_NAME_HOLDER_end="_BACKUP.txt";

  export PATH_TO_LAMBDA_SRV="../../../../lambdaSrv";

  echo -e "~~~~~~~~~  Initialized Constants  ~~~~~~~~~~
   ";
};

function initializeAllConstants() {
  echo -e "~~~~~~~~~  Initializing Local and Remote Constants  ~~~~~~~~~~
   ";

  initializeLocalConstants;

  export REMOTE_CONFIG_FILE="REMOTE_${CONFIG_FILE}";

  echo -e "~~~~~~~~~  Reading configuration of host '${PRD_NEW_HOST}' ~~~~~~~~~~
   ";

  ###  Get remote script's installed path from configuration file of remote server
  mkdir -p ${SAFE_TEMP_DIR};
  pushd ${SAFE_TEMP_DIR} > /dev/null;
    scp ${REMOTE}:${CONFIG} ${REMOTE_CONFIG_FILE};
    source ${REMOTE_CONFIG_FILE};
    echo -e "#!/usr/bin/env bash\n#" > ${REMOTE_CFG};
    echo "export PROJ_DIR=${PROJECT_CONTAINER_DIR}" >> ${REMOTE_CFG};
    echo "export REMOTE_HOST=${PRD_COUCH_HOST_EXTERNAL}" >> ${REMOTE_CFG};
    echo "export REMOTE_ADMIN=${PRD_COUCH_ADMIN}" >> ${REMOTE_CFG};
    echo "export REMOTE_ROOT_PWD=${PRD_COUCH_ROOT_PWD}" >> ${REMOTE_CFG};
    echo "export REMOTE_PROTOCOL=${PRD_COUCH_PROTOCOL}" >> ${REMOTE_CFG};

    echo "export LOCAL_HOST=${DEV_COUCH_HOST_INTERNAL}" >> ${REMOTE_CFG};
    echo "export LOCAL_ADMIN=${DEV_COUCH_ADMIN}" >> ${REMOTE_CFG};
    echo "export LOCAL_ROOT_PWD=${DEV_COUCH_ROOT_PWD}" >> ${REMOTE_CFG};
    echo "export LOCAL_PROTOCOL=${DEV_COUCH_PROTOCOL}" >> ${REMOTE_CFG};

    echo "export LOCAL_PROTOCOL=${DEV_COUCH_PROTOCOL}" >> ${REMOTE_CFG};
  popd > /dev/null;

  source ${SAFE_TEMP_DIR}/${REMOTE_CFG};

  source ${CONFIG};
  echo -e "~~~~~~~~~  Obtained '${CONFIG_FILE}' of host '${PRD_NEW_HOST}' ~~~~~~~~~~
   ";

}
