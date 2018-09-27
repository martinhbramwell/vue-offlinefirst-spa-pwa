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

source ${CONFIG_FILE};

if [[ -z "$COUCH_URL" ||  -z "$COUCH_DATABASE" ]]; then
  usage;
fi;


# echo -e "
# Resetting persons and bottles for exchange request test: ${COUCH_DATABASE}";

export BottleFile="./tests/SixBottles.json";
export PersonFile="./tests/TwoPersons.json";
export HOST="${COUCH_URL}/${COUCH_DATABASE}";

export BottleList=$(cat ${BottleFile} | jq -r '.docs[] | ._id');

while read -r bottle; do
  export rev=$(curl -s -H "Content-type: application/json" "${HOST}/${bottle}" | jq -r '._rev');
  echo -e "Bottle query: ${HOST}/${bottle} has Rev: '${rev}'";
  if [[ "${rev}" != "null" ]]
  then
    echo -e "Deleting bottle: ${HOST}/${bottle}";
    curl -H "Content-type: application/json" -X DELETE "${HOST}/${bottle}?rev=${rev}";
  fi
done <<< "$BottleList"

export PersonList=$(cat ./tests/TwoPersons.json | jq -r '.docs[] | ._id');

while read -r person; do
  export rev=$(curl -s -H "Content-type: application/json" "${HOST}/${person}" | jq -r '._rev');
  echo -e "Person query: ${HOST}/${person} has Rev: '${rev}'";
  if [[ "${rev}" != "null" ]]
  then
    echo -e "Deleting person: ${HOST}/${person}";
    curl -H "Content-type: application/json" -X DELETE "${HOST}/${person}?rev=${rev}";
  fi
done <<< "$PersonList"

echo -e "
Sending file: ${BottleFile} to ${HOST}";
curl -H "Content-type: application/json" -X POST "${HOST}/_bulk_docs"  -d @${BottleFile};

echo -e "
Sending file: ${PersonFile} to ${HOST}";
curl -H "Content-type: application/json" -X POST "${HOST}/_bulk_docs"  -d @${PersonFile};
