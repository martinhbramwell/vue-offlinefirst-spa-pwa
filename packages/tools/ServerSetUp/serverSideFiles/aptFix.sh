#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

echo -e "${SCRIPT_DIR}/setupScripts/utils.sh"
source ${SCRIPT_DIR}/setupScripts/utils.sh;



########
say () {
  echo "'${1}'${MSG}";
}



########
aptInstallIfNotInstalled() {
  declare MSG=" is already installed";
  X="git"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="jq"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="curl"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="gnupg2"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

}



########
get_date() {
  date --date="$1" +"%Y-%m-%d %H:%M:%S";
}



########
forceUpdate() {
  sudo -A apt -y update;
  sudo -A apt -y upgrade;
  sudo -A apt -y dist-upgrade;
  sudo -A apt -y clean;
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
