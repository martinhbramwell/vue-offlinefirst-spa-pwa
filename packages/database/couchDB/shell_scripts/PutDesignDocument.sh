#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

DB=${1:-$COUCH_DATABASE};
UZR=${2:-$COUCH_USR};
PSS=${3:-$COUCH_PWD};

if [[ -z "$DB" ||  -z "$UZR" ||  -z "$PSS" ]]; then
  echo "Usage: ./PutDesignDocument.sh $SPEC_NAME $COUCH_DATABASE $COUCH_USR $COUCH_PWD";
  exit 1;
fi;
HOST="https://${UZR}:${PSS}@yourdb.yourpublic.work";

echo -e "
Getting design doc ${SPEC_NAME}.json";
export REV=$(curl -H "Content-type: application/json" -sX GET "${HOST}/${DB}/_design/${SPEC_NAME}/" | jq -r ._rev);

echo -e "
Deleting design doc ${SPEC_NAME}.json";
curl -H "Content-type: application/json" -sX DELETE "${HOST}/${DB}/_design/${SPEC_NAME}?rev=${REV}";

echo -e "
Putting design doc ${SPEC_NAME}.json";
curl -H "Content-type: application/json" -X PUT "${HOST}/${DB}/_design/${SPEC_NAME}/" -d @${SCRIPT_DIR}/databases/${COUCH_GROUP_NAME}/design/${SPEC_NAME}.json;

echo -e "
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
