#!/usr/bin/env bash
#
export CONFIG_FILE="${HOME}/.ssh/secrets/offsppwa-vue.config";

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

export HOST="${COUCH_URL}/${COUCH_DATABASE}";


# export Persons="./tests/ThreePersons.json";
# export PersonsList=$(cat ${Persons} | jq -r '.docs[] | ._id');

# while read -r person; do
#   echo -e "\nPerson...............";
#   export revReq=$(curl -s -H "Content-type: application/json" "${HOST}/${person}" | jq -r '._rev');
#   echo -e "Person query: ${HOST}/${person}
#     returns :: Rev: '${revReq}'";

#   if [[ "${revReq}" != "null" ]]
#   then
#     echo -e "Deleting person: ${HOST}/${person} ";
#     curl -H "Content-type: application/json" -X DELETE "${HOST}/${person}?rev=${revReq}";
#   fi
# done <<< "$PersonsList"


export PersonUpdateRequests="./tests/OnePersonUpdateRequests.json";
# export PersonUpdateRequests="./tests/ThreePersonUpdateRequests.json";
export PersonUpdateRequestList=$(cat ${PersonUpdateRequests} | jq -r '.docs[] | ._id');

while read -r request; do
  echo -e "\nPersonUpdateRequest...............";
  export revReq=$(curl -s -H "Content-type: application/json" "${HOST}/${request}" | jq -r '._rev');
  echo -e "PersonUpdate request query: ${HOST}/${request}
    returns :: Rev: '${revReq}'";

  if [[ "${revReq}" != "null" ]]
  then
    echo -e "Deleting request: ${HOST}/${request}";
    curl -H "Content-type: application/json" -X DELETE "${HOST}/${request}?rev=${revReq}";
  fi
done <<< "$PersonUpdateRequestList"


echo -e "
"
read -n 1 -s -r -p "Press any key to continue...";


# echo -e "
# Sending file: ${Persons} to ${HOST}";
# curl -H "Content-type: application/json" -X POST "${HOST}/_bulk_docs"  -d @${Persons};


echo -e "
Sending file: ${PersonUpdateRequests} to ${HOST}";
curl -H "Content-type: application/json" -X POST "${HOST}/_bulk_docs"  -d @${PersonUpdateRequests};

echo -e "




";

exit;
