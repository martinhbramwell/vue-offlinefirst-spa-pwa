#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

# export COUCH_DATABASE=${1:-$COUCH_DATABASE};
# export CONFIG_FILE="${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config";
# export CONFIG_FILE="${HOME}/.ssh/secrets/local.config";

function usage() {
  echo "Usage: ./PutUsers.sh \$COUCH_DATABASE";
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

######

echo -e "
Setting database users for :: ${COUCH_DATABASE}
${COUCH_USERS[@]}";

## now loop through the above array
for COUCH_USER in "${COUCH_USERS[@]}"
do
  echo ${COUCH_USER};
  export USER_ID=$(echo ${COUCH_USER} | jq -r .name);
  export REV=$(curl -s  -H "Content-type: application/json" -X GET "${COUCH_URL}/_users/org.couchdb.user:${USER_ID}" | jq -r ._rev)
  curl -s  -H "Content-type: application/json" -X DELETE "${COUCH_URL}/_users/org.couchdb.user:${USER_ID}?rev=${REV}";
  curl -H "Content-type: application/json" -X PUT "${COUCH_URL}/_users/org.couchdb.user:${USER_ID}"  --data-binary "${COUCH_USER}";
  echo -e '---------------------------------------------
  ';

   # or do whatever with individual element of the array
done
