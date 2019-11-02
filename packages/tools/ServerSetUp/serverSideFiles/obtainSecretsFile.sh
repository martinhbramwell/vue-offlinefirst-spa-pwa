#!/usr/bin/env bash
#
declare PARMS="virtualHostsConfigParameters.json";
export NODEJS_APP=$(cat ${PARMS} | jq -r .NODEJS_APP);
# echo "export NODEJS_APP=\"${NODEJS_APP}\"";
declare SECRETS_FILE_PATH=$(echo ${NODEJS_APP} | jq -r .SECRETS_FILE_PATH);
declare SECRETS_FILE_NAME=$(echo ${NODEJS_APP} | jq -r .SECRETS_FILE_NAME);
echo -e "Loading secrets from '${HOME}/${SECRETS_FILE_PATH}/${SECRETS_FILE_NAME}'";
source ${HOME}/${SECRETS_FILE_PATH}/${SECRETS_FILE_NAME};

# ls -la ${XDG_RUNTIME_DIR}
# echo -e "+~~~~+";
# pwd;
