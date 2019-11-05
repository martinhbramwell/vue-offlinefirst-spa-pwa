#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";
export SCRIPT_NAME=$(basename "$0");

function rprt() {
  echo -e "$(date +"%F %H:%M";) [ ${SCRIPT_NAME}  ] ::\n      ${1}\n" | tee -a  /tmp/backUp.log;
}

rprt "Running :: ${SCRIPTPATH}/${SCRIPT_NAME}";

# . ${SCRIPTPATH}/initializeConstants.sh;
# initializeLocalConstants;

export CONFIG_FILE="vue-offlinefirst-spa-pwa.config";
export CONFIG_DIR=".ssh/secrets/${CONFIG_FILE}";
export CONFIG="${HOME}/${CONFIG_DIR}";
source ${CONFIG};

export DATABASE_NAME="${MASTER_COUCH_DATABASE_NAME}_${MASTER_COUCH_DATABASE_VERSION}";

export NOW=$(date +"%Y%m%d_%H%M");
export TARGZ_FILE="pouchdb_${DATABASE_NAME}_${NOW}.tar.gz";

export BACKUP_NAME_HOLDER_start="LATEST_POUCHDB_";
export BACKUP_NAME_HOLDER_end="_BACKUP.txt";

sudo -A mkdir -p ${BACKUPS_DIR};
sudo -A chown ${USER}:${USER} ${BACKUPS_DIR};
rprt "Will backup ${POUCH_DIR}/${DATABASE_NAME} to ${BACKUPS_DIR}/${TARGZ_FILE}";

if [[ $1 = "-f" ]]
then
  REPLY="y";
else
  read -p "Are you sure? " -n 1 -r
fi;
echo "";
if [[ $REPLY =~ ^[Yy]$ ]]
then
  export NAME_HOLDER="${BACKUP_NAME_HOLDER_start}${DATABASE_NAME}${BACKUP_NAME_HOLDER_end}";
  pushd ${POUCH_DIR} > /dev/null;
    tar -Pzcf ${BACKUPS_DIR}/${TARGZ_FILE} ${DATABASE_NAME}*;
    echo "${TARGZ_FILE}" > ${BACKUPS_DIR}/${NAME_HOLDER};
    cat ${BACKUPS_DIR}/${NAME_HOLDER};
    cp ${BACKUPS_DIR}/${NAME_HOLDER} ${HOME};
  popd > /dev/null;

fi

echo -e ">> ~~~~~~~~~  Backed Up to '${BACKUPS_DIR}/${TARGZ_FILE}' ~~~~~~~~ <<
";

# echo -e " *** Test mode exit  (backup.sh) ***";
# exit;
