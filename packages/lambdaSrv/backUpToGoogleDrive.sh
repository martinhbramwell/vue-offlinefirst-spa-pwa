#!/usr/bin/env bash
#
export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )";
export SCRIPT_NAME=$(basename "$0");

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

function rprt() {
  echo -e "$(date +"%F %H:%M";) [ ${SCRIPT_NAME}  ] ::\n      ${1}\n" | tee -a  /tmp/backUp.log;
}

export NVM_DIR="$HOME/.nvm";
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


rprt "****   Backing Up To Google Drive   ***";

declare BACKUP_FILE_NAME="";
pushd ${DIR}/../database/couchDB/shell_scripts/admin >/dev/null;
  rprt "Starting backup to tar.gz ...";
  ./backup.sh -f;
  BACKUP_FILE_NAME=$(cat ${BACKUPS_DIR}/LATEST*);
  rprt "Backed up to '${BACKUP_FILE_NAME}'";
popd >/dev/null;

if [[ -z ${BACKUP_FILE_NAME} ]]; then
  rprt "No back up was found.";
else
  pushd ${DIR}/../tools/ServerSetUp/serverSideFiles/SecretsCollector/ >/dev/null;
    rprt "Pushing '${BACKUPS_DIR} ${BACKUP_FILE_NAME}' to Drive ...";
    [[ ! -d './node_modules/googleapis' ]] && npm install;
    node uploadSecret.js ${BACKUPS_DIR} ${BACKUP_FILE_NAME} "application/zip" "${GOOGLE_DRIVE_FOLDER}";

    rprt "Pushed to Drive folder : [ https://drive.google.com/drive/u/3/folders/${GOOGLE_DRIVE_FOLDER} ]";
  popd >/dev/null;
fi;

rprt "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
