#!/usr/bin/env bash
#
set -e;

function upgrade_jq() {
  export JQ_VRSN=$(jq --version)
  if [[ "${JQ_VRSN}" < "jq-1.6" ]]; then
    echo "Upgrading jq from '${JQ_VRSN}' to 'jq-1.6'";
    pushd /tmp;
      wget https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64;
      chmod +x jq-linux64;
      sudo -A mv jq-linux64 $(which jq);
    popd;
  else
    echo "jq version :: ${JQ_VRSN}";
  fi;
}

function uriencode() {
  jq -nr --arg v "$1" '$v|@uri';
};

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

  export REMOTE="${MASTER_HOST_USER}@${MASTER_HOST}";
  export REMOTE_DATABASE_NAME="${MASTER_COUCH_DATABASE_NAME}_${MASTER_COUCH_DATABASE_VERSION}";
  export LOCAL_DBNAME="${SLAVE_COUCH_DATABASE_NAME}_${SLAVE_COUCH_DATABASE_VERSION}";
  export CLEAN_DB="${DEV_COUCH_DATABASE_NAME}_${DEV_VERSION}_clean";

  export TMPDIR="/dev/shm/vosp";
  mkdir -p ${TMPDIR};

  export HEADERS='  --header "Accept: application/json" --header "Content-Type: application/json"';

  export COUCH_USER_CREDS="${DEV_COUCH_ADMIN}:${DEV_COUCH_ROOT_PWD}"; #
  export COUCH_CREDS="${DEV_COUCH_PROTOCOL}://${COUCH_USER_CREDS}@${DEV_COUCH_HOST_INTERNAL}";
  export COUCH_DB="${DEV_COUCH_PROTOCOL}://${DEV_COUCH_HOST_INTERNAL}";

  export MASTER_COUCH_CREDS="${DEV_COUCH_PROTOCOL}://${DEV_COUCH_ADMIN}:${DEV_COUCH_ROOT_PWD}@${DEV_COUCH_HOST_INTERNAL}";
  # export MASTER_COUCH_DB="${DEV_COUCH_PROTOCOL}://${DEV_COUCH_HOST_INTERNAL}";

  export ACTIVE="_active_tasks";
  export ACTIVE_URI="${COUCH_CREDS}/${ACTIVE}";

  export REPLDB="_replicator";
  export REPL_DONE_FLAGS="._replication_state, ._replication_state_time, ._replication_stats";
  export REVISION_ATTRIBUTE="_rev";

  export BACKUP_NAME_HOLDER_start="LATEST_POUCHDB_";
  export BACKUP_NAME_HOLDER_end="_BACKUP.txt";

  export PATH_TO_LAMBDA_SRV="../../../../lambdaSrv";

  # echo -e "*********\n${REMOTE}\n${REMOTE_DATABASE_NAME}\n${LOCAL_DBNAME}\n${COUCH_CREDS}\n${COUCH_DB}\n********"
  echo -e "~~~~~~~~~  Initialized Constants  ~~~~~~~~~~
   ";
};

function initializeAllConstants() {
  echo -e "~~~~~~~~~  Initializing Local and Remote Constants  ~~~~~~~~~~
   ";

  upgrade_jq;
  initializeLocalConstants;

  export REMOTE_CONFIGURATION="/home/${MASTER_HOST_USER}/${CONFIG_DIR}";
  export REMOTE_CONFIG_FILE="REMOTE_${CONFIG_FILE}";

  echo -e "~~~~~~~~~  Reading configuration '${REMOTE}:${REMOTE_CONFIGURATION}' into '${REMOTE_CONFIG}' ~~~~~~~~~~
   ";

  ###  Get remote script's installed path from configuration file of remote server
  mkdir -p ${SAFE_TEMP_DIR};
  pushd ${SAFE_TEMP_DIR} > /dev/null;
    scp ${REMOTE}:${REMOTE_CONFIGURATION} ${REMOTE_CONFIG_FILE};
    source ${REMOTE_CONFIG_FILE};
    echo -e "#!/usr/bin/env bash\n#" > ${REMOTE_CONFIG};
    echo "export PROJ_DIR=${MASTER_PROJ_DIR}" >> ${REMOTE_CONFIG};
    echo "export REMOTE_HOST=${PRD_COUCH_HOST_EXTERNAL}" >> ${REMOTE_CONFIG};
    echo "export REMOTE_ADMIN=${PRD_COUCH_ADMIN}" >> ${REMOTE_CONFIG};
    echo "export REMOTE_ROOT_PWD=${PRD_COUCH_ROOT_PWD}" >> ${REMOTE_CONFIG};
    echo "export REMOTE_PROTOCOL=${PRD_COUCH_PROTOCOL}" >> ${REMOTE_CONFIG};

    echo "export LOCAL_HOST=${DEV_COUCH_HOST_INTERNAL}" >> ${REMOTE_CONFIG};
    echo "export LOCAL_ADMIN=${DEV_COUCH_ADMIN}" >> ${REMOTE_CONFIG};
    echo "export LOCAL_ROOT_PWD=${DEV_COUCH_ROOT_PWD}" >> ${REMOTE_CONFIG};

    echo "export LOCAL_PROTOCOL=${DEV_COUCH_PROTOCOL}" >> ${REMOTE_CONFIG};
  popd > /dev/null;

  source ${SAFE_TEMP_DIR}/${REMOTE_CONFIG};

  source ${CONFIG};
  echo -e "~~~~~~~~~  Obtained '${CONFIG_FILE}' of host '${MASTER_HOST}' ~~~~~~~~~~
   ";

  # cat ${SAFE_TEMP_DIR}/${REMOTE_CONFIG};
  # echo -e "${SAFE_TEMP_DIR}/${REMOTE_CONFIG}";
  # cat ${CONFIG};
  # echo -e "${CONFIG}";
}
