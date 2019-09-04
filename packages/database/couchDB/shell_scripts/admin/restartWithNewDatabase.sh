#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";
. ${SCRIPTPATH}/initializeConstants.sh;
initializeLocalConstants;

echo "Will replace the database: '${LOCAL_DBNAME}'"
if [[ $1 = "-f" ]]
then
  REPLY="y";
else
  read -p "Are you sure? " -n 1 -r
fi;
echo "";
if [[ $REPLY =~ ^[Yy]$ ]]
then

  ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV}/unLaunch.sh;

  export FROM_DDOCS="Restore%20from%20ddocs_only";
  export FROM_DDOCS_URI="${COUCH_CREDS}/${REPLDB}/${FROM_DDOCS}";

  pushd ${TMPDIR} > /dev/null;
    curl -X DELETE ${COUCH_CREDS}/${LOCAL_DBNAME};

    curl -s ${FROM_DDOCS_URI} > 1.tmp;
    cat 1.tmp | jq -r ". |= del(${REPL_DONE_FLAGS})" > 2.tmp;
    cat 2.tmp | jq ".target += {\"url\": \"${COUCH_DB}/${LOCAL_DBNAME}\"}" > 3.tmp;
    cat 3.tmp | jq ".source += {\"url\": \"${COUCH_DB}/ddocs_only\"}" > 4.tmp;
    mv 4.tmp RestoreFrom_ddocs_only.json;
    cat RestoreFrom_ddocs_only.json | jq -r;

    curl -X PUT ${FROM_DDOCS_URI} -d @RestoreFrom_ddocs_only.json; # ${HEADERS};

  popd > /dev/null;

  pushd ${POUCH_DIR} > /dev/null;
    rm -fr ${LOCAL_DBNAME}*;
    tar -zxvf ${BACKUPS_DIR}/LATEST_${DEV_COUCH_DATABASE_NAME}_${DEV_VERSION}.tar.gz;
  popd > /dev/null;

  ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV}/launch.sh;

fi

echo -e "~~~~~~~~~ Obtained ${BACKUPS_DIR} ~~~~~~~~~~
 ";
exit;
