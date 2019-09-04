#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
. ${SCRIPTPATH}/initializeConstants.sh;
initializeLocalConstants;


echo "Will purge and replace the database: '${LOCAL_DBNAME}'"
if [[ $1 = "-f" ]]
then
  REPLY="y";
else
  read -p "Are you sure? " -n 1 -r
fi;
echo "";
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo -e "Purging ...
  ";

  ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV}/unLaunch.sh;

  export PURGE_TO_CLEAN="Purge%20from%20${LOCAL_DBNAME}%20to%20${CLEAN_DB}";
  export PURGE_TO_CLEAN_URI="${COUCH_CREDS}/${REPLDB}/${PURGE_TO_CLEAN}";
  export PURGE_TO_CLEAN_TITLE=$(echo ${PURGE_TO_CLEAN//%20/ })
  echo ${PURGE_TO_CLEAN_TITLE}

  export RESTORE_FROM_CLEAN="Restore%20from%20${CLEAN_DB}";
  export RESTORE_FROM_CLEAN_URI="${COUCH_CREDS}/${REPLDB}/${RESTORE_FROM_CLEAN}";

  pushd ${TMPDIR} > /dev/null;
    echo -e "Deleting ${COUCH_CREDS}/${CLEAN_DB}";
    curl -X DELETE ${COUCH_CREDS}/${CLEAN_DB};

    curl -s ${PURGE_TO_CLEAN_URI} > 1.tmp;
    cat 1.tmp | jq -r ". |= del(${REPL_DONE_FLAGS})" > 2.tmp;
    cat 2.tmp | jq ".source += {\"url\": \"${COUCH_DB}/${LOCAL_DBNAME}\"}" > 3.tmp;
    cat 3.tmp | jq ".target += {\"url\": \"${COUCH_DB}/${CLEAN_DB}\"}" > 4.tmp;
    mv 4.tmp PurgeToClean.json;
    cat PurgeToClean.json | jq -r;

    curl -X PUT ${PURGE_TO_CLEAN_URI} -d @PurgeToClean.json;

    while  [ "$(curl -s ${ACTIVE_URI} | jq -r .[0].doc_id)" = "null" ]; do echo "Awaiting purge start"; tput cuu 1; sleep 1; done
    while  [ "$(curl -s ${ACTIVE_URI} | jq -r .[0].doc_id)" != "null" ]; do curl -s ${ACTIVE_URI} | jq -r .[0].doc_id; tput cuu 1; sleep 1; done

    echo -e "
    Done purge replication";

    echo -e "Deleting ${COUCH_CREDS}/${LOCAL_DBNAME}";
    curl -X DELETE ${COUCH_CREDS}/${LOCAL_DBNAME};

    curl -s ${RESTORE_FROM_CLEAN_URI} > 1.tmp;
    cat 1.tmp | jq -r ". |= del(${REPL_DONE_FLAGS})" > 2.tmp;
    cat 2.tmp | jq ".source += {\"url\": \"${COUCH_DB}/${CLEAN_DB}\"}" > 3.tmp;
    cat 3.tmp | jq ".target += {\"url\": \"${COUCH_DB}/${LOCAL_DBNAME}\"}" > 4.tmp;
    mv 4.tmp RestoreFromClean.json;
    cat RestoreFromClean.json | jq -r;

    curl -X PUT ${RESTORE_FROM_CLEAN_URI} -d @RestoreFromClean.json;

    while  [ "$(curl -s ${ACTIVE_URI} | jq -r .[0].doc_id)" = "null" ]; do echo "Awaiting replication start"; tput cuu 1; sleep 1; done
    while  [ "$(curl -s ${ACTIVE_URI} | jq -r .[0].doc_id)" != "null" ]; do curl -s ${ACTIVE_URI} | jq -r .[0].doc_id; tput cuu 1; sleep 1; done
  popd > /dev/null;

  pushd ${POUCH_DIR} > /dev/null
    rm -fr ${LOCAL_DBNAME}*;
  popd > /dev/null;

  ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV}/launch.sh;
fi;

echo -e "~~~~~~~~~ Purged deleted records from database ${COUCH_DB}/${CLEAN_DB} ~~~~~~~~~~
 ";
exit;
