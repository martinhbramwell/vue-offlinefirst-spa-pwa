#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

# source ${SCRIPT_DIR}/utils.sh;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
};

createErpNextUser () { funcTitle ${FUNCNAME[0]};
  echo -e "Ready to create new user '${PRD_ERPHOST_USR}'.";
  if ! id -u ${PRD_ERPHOST_USR} &>/dev/null; then
    echo -e "Creating new user '${PRD_ERPHOST_USR}'.";
    sudo -A adduser --disabled-password --gecos "${PRD_ERPHOST_USR_NAME}" ${PRD_ERPHOST_USR};
    echo -e "${PRD_ERPHOST_PWD}\n${PRD_ERPHOST_PWD}" | sudo -A passwd -q ${PRD_ERPHOST_USR};
    sudo -A usermod -aG sudo ${PRD_ERPHOST_USR};
  else
    echo -e "User '${PRD_ERPHOST_USR}' exists already.";
  fi;

  # ls -la ${HOME}/setupScripts;
  declare KEY_NAME=${PRD_ERPHOST_USR}_$(echo ${PRD_ERPNEXT_HOST} | tr . _);
  echo -e "Finalizing SSH for '${KEY_NAME}'.";
  sudo -A mkdir -p /home/${PRD_ERPHOST_USR}/.ssh;
  sudo -A cp ${HOME}/setupScripts/${KEY_NAME}.pub /home/${PRD_ERPHOST_USR}/.ssh/authorized_keys;
  sudo -A chown -R ${PRD_ERPHOST_USR}:${PRD_ERPHOST_USR} /home/${PRD_ERPHOST_USR}/.ssh;
  sudo -A chmod 700 /home/${PRD_ERPHOST_USR}/.ssh;
  sudo -A chmod 640 /home/${PRD_ERPHOST_USR}/.ssh/authorized_keys;

};

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "\n~~~~~ Creating ErpNext User ~~~~~~\n\n";
  createErpNextUser;
  echo -e "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
fi;
