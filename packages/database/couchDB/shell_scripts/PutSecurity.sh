#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

export COUCH_DATABASE=${1:-$COUCH_DATABASE};
export CONFIG_FILE="${HOME}/.ssh/secrets/vuesppwa.config";

function usage() {
  echo "Usage: ./DropCreateSecurity.sh \$COUCH_DATABASE";
  echo "       ALSO: 'COUCH_URL' must be specified in ${CONFIG_FILE}";
  exit 1;
}

if [[ ! -f ${CONFIG_FILE} ]]; then
  echo -e "Error: Found no file :: ${CONFIG_FILE}";
  usage;
fi;

source ${CONFIG_FILE};

if [[ -z "$COUCH_URL" ||  -z "$COUCH_DATABASE" ]]; then
  usage;
fi;

##
echo -e "
Setting database security: ${COUCH_DATABASE}";

curl -H "Content-type: application/json" -X PUT "${COUCH_URL}/${COUCH_DATABASE}/_security" -d @${SCRIPT_DIR}/databases/${COUCH_DATABASE_NAME}/security.json;
