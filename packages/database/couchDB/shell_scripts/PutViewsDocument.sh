#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

# DB=${1:-$COUCH_DATABASE};
# UZR=${2:-$COUCH_USR};
# PSS=${3:-$COUCH_PWD};

if [[ -z "${COUCH}" ]]; then
  echo "Usage: ./PutDesignDocument.sh ${COUCH}";
  exit 1;
fi;
# HOST="https://${UZR}:${PSS}@yourdb.yourpublic.work";

echo -e "
Getting design doc ${SPEC_NAME}.json";
export REV=$(curl -H "Content-type: application/json" -sX GET "${COUCH}/_design/${SPEC_NAME}/" | jq -r ._rev);

echo -e "
Deleting design doc ${SPEC_NAME}.json";
curl -H "Content-type: application/json" -sX DELETE "${COUCH}/_design/${SPEC_NAME}?rev=${REV}";

echo -e "
Putting design doc ${SPEC_NAME}.json";
curl -H "Content-type: application/json" -X PUT "${COUCH}/_design/${SPEC_NAME}/" -d @${SCRIPT_DIR}/views/${SPEC_NAME}.json;

echo -e "
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
