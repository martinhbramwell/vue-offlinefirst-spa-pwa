#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

waitForERPNext () {
  declare HOST="${1}";
  declare TKN="${2}";
  declare PRT="${3}";
  declare USR="${4}";
  declare HDR="Authorization: token";
  declare ROUTE="api/resource/User";

  # declare URI="${PRT}://${HOST}/${ROUTE}/${USR}";
  declare URI="${PRT}://${HOST}/${ROUTE}/${USR}";

  # echo "==> curl -sH '${HDR} ${TKN}' -L ${URI}";
  declare RSLT=$(curl -sH "${HDR} ${TKN}" -L ${URI} | jq -r .data.name);
  # echo ${RSLT}
  while [[ "${RSLT}" != "${USR}" ]]
  do
    sleep 5
    echo "Trying ${HOST} connection again...";
    RSLT=$(curl -sH "${HDR} ${TKN}" -L ${URI} | jq -r .data.name);
  done
}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  pushd ${SCRIPT_DIR} >/dev/null;
    declare HOST="${1}";
    declare KEYS="${2}";
    declare PORT="${3}";
    declare ADMN="${4}";

    # echo -e "== ${HOST} ${KEYS} ${PORT} ${ADMN}";
    waitForERPNext ${HOST} ${KEYS} ${PORT} ${ADMN};
  popd >/dev/null;

fi;

# curl --location --request GET 'https://erpn3.iridium.blue/api/resource/User/Administratox' \


