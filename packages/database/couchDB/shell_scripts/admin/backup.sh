#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
echo ${SCRIPTPATH};

. ${SCRIPTPATH}/initializeConstants.sh;
initializeLocalConstants;

export DATABASE_NAME="${PRD_COUCH_DATABASE_NAME}_${PRD_VERSION}";

export NOW=$(date +"%Y%m%d_%H%M");
export TARGZ_FILE="pouchdb_${DATABASE_NAME}_${NOW}.tar.gz";

sudo -A mkdir -p ${BACKUPS_DIR};
sudo -A chown ${USER}:${USER} ${BACKUPS_DIR};
echo "Will backup ${POUCH_DIR}/${DATABASE_NAME} to ${BACKUPS_DIR}/${TARGZ_FILE}"
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
    tar -Pzcvf ${BACKUPS_DIR}/${TARGZ_FILE} ${DATABASE_NAME}*;
    echo "${TARGZ_FILE}" > ${BACKUPS_DIR}/${NAME_HOLDER};
    cat ${BACKUPS_DIR}/${NAME_HOLDER};
    cp ${BACKUPS_DIR}/${NAME_HOLDER} ${HOME};
  popd > /dev/null;

fi

echo -e "> ~~~~~~~~  Backed Up to '${BACKUPS_DIR}/${TARGZ_FILE}' ~~~~~~~~ <
";
