#!/usr/bin/env bash
#
export CONFIG_FILE="${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config";
function usage() {
  echo "Usage: 'COUCH_URL', 'COUCH_DATABASE_NAME' and 'VERSION' must be specified in ${CONFIG_FILE}";
  exit 1;
}

if [[ ! -f ${CONFIG_FILE} ]]; then
  echo -e "Error: Found no file :: ${CONFIG_FILE}";
  usage;
fi;

source ${CONFIG_FILE};

export COUCH_DATABASE="${COUCH_DATABASE_NAME}_${VERSION}";

if [[ -z "$COUCH_URL" || -z "$COUCH_DATABASE_NAME" || -z "$VERSION" ]]; then
  usage;
fi;


# echo -e "
# Resetting persons and bottles for exchange request test: ${COUCH_DATABASE}";

export BottleFile="${TEST_FILES_DIR}/bottles/bottles.json";
export PersonFile="${TEST_FILES_DIR}/persons/persons.json";
export HOST="${COUCH_URL}/${COUCH_DATABASE}";

echo -e "\nBottles...............";
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

echo -e "\nPersons...............";
export PersonList=$(cat ${PersonFile} | jq -r '.docs[] | ._id');
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
