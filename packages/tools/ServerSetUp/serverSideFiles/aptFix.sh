#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

echo -e "${SCRIPT_DIR}/setupScripts/utils.sh"
source ${SCRIPT_DIR}/setupScripts/utils.sh;



########
say () {
  echo "'${1}'${MSG}";
}

upgrade_jq () {
  export JQ_VRSN=$(jq --version)
  if [[ "${JQ_VRSN}" < "jq-1.6" ]]; then
    echo "Upgrading jq from '${JQ_VRSN}' to 'jq-1.6'";
    pushd /tmp;
      wget https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64;
      chmod +x jq-linux64;
      sudo -A mv jq-linux64 $(which jq);
    popd;
  else
    echo "jq version :: ${JQ_VRSN}";
  fi;
}


########
aptInstallIfNotInstalled() {
  declare MSG=" is already installed";

  X="software-properties-common"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

  sudo -A add-apt-repository -y universe;
  sudo -A add-apt-repository -y ppa:certbot/certbot;
  sudo -A apt-get -y update;

  X="git"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="ufw"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="curl"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="nginx"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="gnupg2"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="certbot"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="debconf-utils"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="apt-transport-https"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python-certbot-nginx"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

  X="jq"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  upgrade_jq;
}



########
get_date() {
  date --date="$1" +"%Y-%m-%d %H:%M:%S";
}



########
forceUpdate() {

  export DEBIAN_FRONTEND=noninteractive;

  echo -e "\n    ********* Updating ********* \n\n";
  sudo -A apt -y update;
  echo -e "\n    ********* Upgrading ********* \n\n";
  sudo -A DEBIAN_FRONTEND=noninteractive apt -y upgrade;
  echo -e "\n ********* Dist Upgrading ********* \n\n";
  sudo -A apt -y dist-upgrade;
  echo -e "\n    ********* Cleaning ********* \n\n";
  sudo -A apt -y clean;
  echo -e "\n    ********* Removing ********* \n\n";
  sudo -A apt -y autoremove;
  date -d "$(date) 4 hours" > ~/.last_apt_update;
}



########
lazyUpdate() {
  pushd ${HOME} >/dev/null;
  declare NEXT_APT=$(cat ~/.last_apt_update 2> /dev/null);
  if [[ ! -f ~/.last_apt_update || $(get_date "${NEXT_APT}") < $(get_date "$(date)") ]]; then
    echo "Updating apt registry . . . ";
    forceUpdate;
  else
    echo "Next 'apt update' needed after $(cat ~/.last_apt_update)"
  fi;
  popd >/dev/null;
};


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  lazyUpdate;
fi;
