#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

# echo -e "${SCRIPT_DIR}/setupScripts/utils.sh";
# source ${SCRIPT_DIR}/setupScripts/utils.sh;

aptNotYetInstalled() {
  set -e;
  return $(dpkg-query -W --showformat='${Status}\n' $1 2>/dev/null | grep -c "install ok installed");
}



########
say () {
  echo "'${1}'${MSG}";
}


########
apt_wait () {
  declare DPKG_LCK="/var/lib/dpkg/lock";
  while sudo -A fuser ${DPKG_LCK} >/dev/null 2>&1 ; do
    echo -e "Waiting for ${DPKG_LCK}";
    sleep 1
  done


  declare APTLSTS_LCK="/var/lib/apt/lists/lock";
  while sudo -A fuser ${APTLSTS_LCK} >/dev/null 2>&1 ; do
    echo -e "Waiting for ${APTLSTS_LCK}";
    sleep 1
  done


  declare FRNT_LCK="/var/lib/dpkg/lock-frontend";
  while sudo -A fuser ${FRNT_LCK} >/dev/null 2>&1 ; do
    echo -e "Waiting for ${FRNT_LCK}";
    sleep 1
  done


  declare UPGRADES_LOG="/var/log/unattended-upgrades/unattended-upgrades.log";
  if [ -f ${UPGRADES_LOG} ]; then
    while sudo -A fuser ${UPGRADES_LOG} >/dev/null 2>&1 ; do
      echo -e "Waiting for ${UPGRADES_LOG}";
      sleep 1
    done
  fi
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
  X="tree"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
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

  apt_wait;

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
