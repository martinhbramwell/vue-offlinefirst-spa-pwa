#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";

. ${SCRIPTPATH}/initializeConstants.sh;
initializeAllConstants;

echo "${REMOTE_HOST}";
export REMOTE_URI="${REMOTE_PROTOCOL}://${REMOTE_HOST}";
export LOCAL_URI="${LOCAL_PROTOCOL}://${LOCAL_HOST}";
export MASTER="${PRD_COUCH_DATABASE_NAME}_${PRD_VERSION}";

echo -e "

 ***
    Waiting for size of ${COUCH_DB}/${LOCAL_DBNAME}
    to match the size of ${REMOTE_URI}/${MASTER}

 ***

";

remote=$(curl -s ${REMOTE_URI}/${MASTER} | jq -r .doc_count);
local=$(curl -s ${LOCAL_URI}/${LOCAL_DBNAME} | jq -r .doc_count);
max=120;
echo "Comparing sizes: remote [${remote}] greater than local [${local}]?? ( ${max} secs left )";
while  [[ max -gt 0 && remote -gt local ]];
do
  ((max--));
  local=$(curl -s ${LOCAL_URI}/${LOCAL_DBNAME} | jq -r .doc_count);
  sleep 1;
  tput cuu 1;
  echo -e "

    Comparing sizes: remote [${remote}] greater than local [${local}]?? ( ${max} secs left )
  ";
done

echo -e "
";

if [[ remote -gt local ]]; then exit -1; fi;
exit 0;
