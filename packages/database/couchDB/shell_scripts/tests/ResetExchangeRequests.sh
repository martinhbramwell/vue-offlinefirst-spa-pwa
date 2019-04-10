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


export ExchangeRequest="./tests/FourExchangeRequests.json";
# export ExchangeRequest="./tests/TwoExchangeRequests.json";
export HOST="${COUCH_URL}/${COUCH_DATABASE}";


export ExchangeRequestList=$(cat ${ExchangeRequest} | jq -r '.docs[] | ._id');
export pattern="ExchangeRequest";
export replacement="Movement";
while read -r request; do
  echo -e "\nExchangeRequest...............";
  export revReq=$(curl -s -H "Content-type: application/json" "${HOST}/${request}" | jq -r '._rev');
  echo -e "Exchange request query: ${HOST}/${request} has Rev: '${revReq}'";

  if [[ "${revReq}" != "null" ]]
  then
    echo -e "Deleting request: ${HOST}/${request}";
    curl -H "Content-type: application/json" -X DELETE "${HOST}/${request}?rev=${revReq}";
  fi

  echo -e "\nMovement...............";
  export movement=${request/$pattern/$replacement};
  export revMov=$(curl -s -H "Content-type: application/json" "${HOST}/${movement}" | jq -r '._rev');
  echo -e "Movement query: ${HOST}/${movement} has Rev: '${revMov}'";

  if [[ "${revMov}" != "null" ]]
  then
    echo -e "Deleting movement: ${HOST}/${movement}";
    curl -H "Content-type: application/json" -X DELETE "${HOST}/${movement}?rev=${revMov}";
  fi

done <<< "$ExchangeRequestList"

echo -e "
"
read -n 1 -s -r -p "Press any key to continue...";

echo -e "
Sending file: ${ExchangeRequest} to ${HOST}";
curl -H "Content-type: application/json" -X POST "${HOST}/_bulk_docs"  -d @${ExchangeRequest};

