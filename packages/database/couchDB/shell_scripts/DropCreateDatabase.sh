#!/usr/bin/env bash
#
export COUCH_DATABASE=${1:-$COUCH_DATABASE};
export CONFIG_FILE="${HOME}/.ssh/secrets/offsppwa-vue.config";

function usage() {
  echo "Usage: ./DropCreateDatabase.sh \$COUCH_DATABASE";
  echo "       ALSO: 'COUCH_URL' must be specified in ${CONFIG_FILE}";
  exit 1;
}

if [[ ! -f ${CONFIG_FILE} ]]; then
  echo -e "Error: Found no file :: ${CONFIG_FILE}";
  usage;
fi;

# source ${CONFIG_FILE};

if [[ -z "$COUCH_URL" ||  -z "$COUCH_DATABASE" ]]; then
  usage;
fi;

##
echo -e "
Recreating database: ${COUCH_DATABASE}";

curl -X DELETE ${COUCH_URL}/${COUCH_DATABASE};
curl -X PUT ${COUCH_URL}/${COUCH_DATABASE};
