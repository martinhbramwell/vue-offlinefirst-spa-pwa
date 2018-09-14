#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

export COUCH_DATABASE=${1:-$COUCH_DATABASE};
export CONFIG_FILE="${HOME}/.ssh/secrets/vuesppwa.config";

function usage() {
  echo "Usage: ./TestGet.sh \$COUCH_DATABASE";
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
# export QUERY="_security";
# export QUERY="_design/persons/_view/minimal_person";
export QUERY="_design/visible/_view/compact_person";
echo -e "
Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";

curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}?since=0&limit=10";
# curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}";


export QUERY="_design/visible/_view/compact_bottle";
# export QUERY="_design";
echo -e "
Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";

curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}?since=0&limit=10";


export QUERY="_design/visible/_view/compact_movement";
# export QUERY="_design";
echo -e "
Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";

curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}?since=0&limit=10";
