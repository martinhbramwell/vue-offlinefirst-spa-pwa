#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
. ${SCRIPTPATH}/initializeConstants.sh;
initializeLocalConstants;

export DATABASE_NAME="${PRD_COUCH_DATABASE_NAME}_${PRD_VERSION}";

echo cat "${BACKUPS_DIR}/|${BACKUP_NAME_HOLDER_start}|${DATABASE_NAME}|${BACKUP_NAME_HOLDER_end}|";
cat "${BACKUPS_DIR}/${BACKUP_NAME_HOLDER_start}${DATABASE_NAME}${BACKUP_NAME_HOLDER_end}";

exit;

export LATEST=$(cat "${BACKUPS_DIR}/${BACKUP_NAME_HOLDER_start}${DATABASE_NAME}${BACKUP_NAME_HOLDER_end}");

echo "Will overwrite ${POUCH_DIR}/${DATABASE_NAME} from ${BACKUPS_DIR}/${LATEST}"

if [[ $1 = "-f" ]]
then
  REPLY="y";
else
  read -p "Are you sure? " -n 1 -r
fi;
echo "";
if [[ $REPLY =~ ^[Yy]$ ]]
then
  pushd ${POUCH_DIR} > /dev/null;
    # pwd;
    rm -fr ${LOCAL_DBNAME}*;
    tar -zxvf ${BACKUPS_DIR}/${LATEST};
  popd > /dev/null;
fi

echo -e "~~~~~~~~  Restored '${BACKUPS_DIR}/${LATEST}' ~~~~~~~~
";
