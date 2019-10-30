#!/usr/bin/env bash
#
export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

function rprt() {
  echo -e "$(date +"%F %H:%M";) :: ${1}" >> /tmp/backUp.log;
}

export NVM_DIR="$HOME/.nvm";
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


rprt "\n\n\n****   Backing Up To Google Drive   ***";


# sudo -A mkdir -p ${POUCH_DIR};
# sudo -A chown ${USER}:${USER} ${POUCH_DIR};
# sudo -A chmod go-rwx ${POUCH_DIR};
# pushd ${POUCH_DIR} >/dev/null;
#   rprt $(pwd);
# popd >/dev/null;

# sudo -A mkdir -p ${BACKUPS_DIR};
# sudo -A chown ${USER}:${USER} ${BACKUPS_DIR};
# sudo -A chmod go-rwx ${BACKUPS_DIR};
# pushd ${BACKUPS_DIR} >/dev/null;
#   rprt $(pwd);
# popd >/dev/null;

declare BACKUP_FILE_NAME="";
pushd ${DIR}/../database/couchDB/shell_scripts/admin >/dev/null;
  # rprt "Starting backup to tar.gz ...";
  ./backup.sh -f;
  BACKUP_FILE_NAME=$(cat ${BACKUPS_DIR}/LATEST*);
  rprt "Backed up to ${BACKUP_FILE_NAME}";
popd >/dev/null;

pushd ${DIR}/../tools/ServerSetUp/serverSideFiles/SecretsCollector/ >/dev/null;
  # rprt "Starting push to Drive ...";
  [[ ! -d './node_modules/googleapis' ]] && npm install;
  # node collectSecret.js "1m_6vKD1kaiFU1NhX1oNlnJ2GPjuq7ire" "vuesppwaKey.pub" ${XDG_RUNTIME_DIR}
  node uploadSecret.js ${BACKUPS_DIR} ${BACKUP_FILE_NAME} "application/zip" "${GOOGLE_DRIVE_FOLDER}";
  # node uploadSecret.js ${XDG_RUNTIME_DIR} "juicy.txt" "text/plain";

  rprt "Pushed to Drive folder : [ https://drive.google.com/drive/u/3/folders/${GOOGLE_DRIVE_FOLDER} ]\n";
popd >/dev/null;

rprt "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n";
echo -e "\n";
