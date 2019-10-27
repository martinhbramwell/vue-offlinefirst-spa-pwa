#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";
. ${SCRIPTPATH}/initializeConstants.sh;
initializeLocalConstants;

echo "Will replace the database: '${COUCH_CREDS}/${LOCAL_DBNAME}'"
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
  echo -e "Stopped the application\n";

  export GET_DDOCS_ONLY=$(uriencode "Obtain 'ddocs_only' from master database");
  export GET_DDOCS_ONLY_URI="${COUCH_CREDS}/${REPLDB}/${GET_DDOCS_ONLY}";

  export FROM_DDOCS=$(uriencode "Restore from 'ddocs_only'");
  export FROM_DDOCS_URI="${COUCH_CREDS}/${REPLDB}/${FROM_DDOCS}";

  export DDOCS_ONLY="ddocs_only";
  export DDOCS_ONLY_URI="${COUCH_CREDS}/${DDOCS_ONLY}";

  export MISSING="";
  pushd ${TMPDIR} > /dev/null;
    curl -X DELETE ${COUCH_CREDS}/${LOCAL_DBNAME};
    echo -e "${LOCAL_DBNAME} has been deleted.\n";

    echo -e "Verifying existence of ${DDOCS_ONLY_URI}.";
    export CORE_DATABASE=$(curl -s ${DDOCS_ONLY_URI}) >/dev/null;
    MISSING=$(echo ${CORE_DATABASE} | jq -r .error);
    if [[ "${MISSING}" == "not_found" ]]; then
      echo "No database '${DDOCS_ONLY}'.
      Pulling '${DDOCS_ONLY}' from '${MASTER_HOST_PRTCL}://${MASTER_HOST}' to '${DEV_COUCH_PROTOCOL}://${DEV_COUCH_HOST_INTERNAL}'.
      Master: ${MASTER_USER_CREDS}
      Slave: ${COUCH_USER_CREDS}";
      cat ${SCRIPTPATH}/ObtainDocs_only.json | jq ".source.headers += {\"Authorization\": \"Basic $(echo -n ${MASTER_USER_CREDS} | base64)\"}" > OD1.json;
      cat OD1.json | jq ".target.headers += {\"Authorization\": \"Basic $(echo -n ${COUCH_USER_CREDS} | base64)\"}" > OD2.json;
      cat OD2.json | jq ".source += {\"url\": \"${MASTER_HOST_PRTCL}://${MASTER_HOST}/${DDOCS_ONLY}\"}" > OD3.json;
      cat OD3.json | jq ".target += {\"url\": \"${DEV_COUCH_PROTOCOL}://${DEV_COUCH_HOST_INTERNAL}/${DDOCS_ONLY}\"}" > OD4.json;
      cat OD4.json | jq .;
      curl -X PUT ${GET_DDOCS_ONLY_URI} -d @OD4.json;
      rm -f OD*.json;
    else
      echo "Found database '${DDOCS_ONLY}'.";
    fi;

    echo -e "\n ${FROM_DDOCS_URI} \n\n";
    export REPLICATOR=$(curl -s ${FROM_DDOCS_URI}) >/dev/null;
    MISSING=$(echo ${REPLICATOR} | jq -r .error);
    echo -e "MISSING :: ${MISSING}";

    if [[ "${MISSING}" == "not_found" ]]; then
      echo "No replicator '${FROM_DDOCS}'";
      REPLICATOR=$(cat ${SCRIPTPATH}/RestoreFromDocs_only.json) >/dev/null;
      # cp ${SCRIPTPATH}/RestoreFromDdocs_only.json 1.tmp;
    else
      echo -e "Found replicator ...";
    fi;

    # echo ${REPLICATOR} | jq -r .;

    echo ${REPLICATOR} | jq -r ". |= del(${REPL_DONE_FLAGS})" > rp1.json;
    # cat rp1.json | jq -r .;
    cat rp1.json | jq ".target += {\"url\": \"${COUCH_DB}/${LOCAL_DBNAME}\"}" > rp2.json;
    cat rp2.json | jq ".source += {\"url\": \"${COUCH_DB}/ddocs_only\"}" > rp3.json;
    cat rp3.json | jq ".source.headers += {\"Authorization\": \"Basic $(echo -n ${COUCH_USER_CREDS} | base64)\"}" > rp4.json;
    cat rp4.json | jq ".target.headers += {\"Authorization\": \"Basic $(echo -n ${COUCH_USER_CREDS} | base64)\"}" > rp5.json;
    mv rp5.json RestoreFrom_ddocs_only.json;
    cat RestoreFrom_ddocs_only.json | jq -r .;
    curl -X PUT ${FROM_DDOCS_URI} -d @RestoreFrom_ddocs_only.json;

  popd > /dev/null;

  pushd ${POUCH_DIR} > /dev/null;
    rm -fr ${LOCAL_DBNAME}*;
    tar -ztvf ${BACKUPS_DIR}/LATEST_${DEV_COUCH_DATABASE_NAME}_${DEV_VERSION}.tar.gz;
  popd > /dev/null;

  # ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV}/launch.sh;
  ./launch.sh;
echo -e "*** Test mode exit  (restartWithNewDatabase.sh) ***\n\n";
exit;

fi

echo -e "~~~~~~~~~ Obtained ${BACKUPS_DIR} ~~~~~~~~~~
 ";
