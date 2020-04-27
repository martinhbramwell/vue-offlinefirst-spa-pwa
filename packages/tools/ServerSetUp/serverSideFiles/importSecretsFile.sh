#!/usr/bin/env bash
#
declare SECRET=${1};
if [[ -z "${SECRET}" ]]; then
  echo -e "\${SECRET} not supplied as parameter.\n";
  exit 1;
fi;
# echo -e "${WEBTASK_SECRET} supplied as parameter.\n";

export TYPE="configuration";
export MODE="PRD";
# export MODE="DEV";

mkdir -p ${HOME}/.ssh/secrets;
pushd ${HOME}/.ssh/secrets;

curl -sH "Content-Type: application/json" \
  -d '{"mode":"'"${MODE}"'","type":"'"${TYPE}"'","scrt":"'"${SECRET}"'"}' \
  --post301 -X POST \
  -L http://bit.ly/VOSP_02 > vue-offlinefirst-spa-pwa.config;
popd;

