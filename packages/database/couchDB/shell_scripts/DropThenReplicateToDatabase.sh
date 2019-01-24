#!/usr/bin/env bash
#
export SOURCE_DATABASE=${1:-$SOURCE_DATABASE};
export CONFIG_FILE="${HOME}/.ssh/secrets/local.config";

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

function usage() {
  echo "Usage: ./DropCreateDatabase.sh \$SOURCE_DATABASE";
  echo "       ALSO: 'COUCH_URL' must be specified in ${CONFIG_FILE}";
  exit 1;
}

if [[ ! -f ${CONFIG_FILE} ]]; then
  echo -e "Error: Found no file :: ${CONFIG_FILE}";
  usage;
fi;

source ${CONFIG_FILE};

if [[ -z "$COUCH_URL" ||  -z "$SOURCE_DATABASE"||  -z "$COUCH_DATABASE" ]]; then
  usage;
fi;

##
echo -e "
Recreating database: ${COUCH_DATABASE} from ${SOURCE_DATABASE} (host is ${COUCH_URL})";
curl -X DELETE ${COUCH_URL}/${COUCH_DATABASE};
curl -X PUT ${COUCH_URL}/${COUCH_DATABASE};

curl -H "Content-type: application/json" -X POST "${COUCH_URL}/_replicate" -d @${SCRIPT_DIR}/tests/ReplicateToBapuTmp.json | jq -r
exit;
