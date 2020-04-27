#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${SCRIPT_DIR}/utils.sh;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
};


prepareServerSideScripts () { funcTitle ${FUNCNAME[0]};
  pushd ${SCRIPT_DIR} > /dev/null;
    pwd;
    cp aptFix.sh ..;
  popd > /dev/null;
};

prepareDependencies () { funcTitle ${FUNCNAME[0]};

  echo -e "\nInstalling :: System Dependencies ...";

  # ${HOME}/aptFix.sh;
  sudo -A apt-get update;

  X="python3-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python3-setuptools"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python3-pip"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

  alias python=python3;
  alias pip=pip3;

  X="software-properties-common"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python3-minimal"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="build-essential"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="inotify-tools"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="redis-server"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="expect"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="tree"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
};

prepareMariaDB () { funcTitle ${FUNCNAME[0]};

  echo -e "PRD_ERPHOST_PWD = ${PRD_ERPHOST_PWD}"
  export MYSQL_INSTALLED=$(mysql -u root -p${PRD_ERPHOST_PWD} -e "show databases;" -h localhost | grep mysql);
  if [[ $(which mysql) && "${MYSQL_INSTALLED}" == "mysql" ]]; then
    echo -e "\bMariadb is already running.\b";
  else
    echo -e "MariaDB not found.  Installing ...";
    declare MARIADB="mariadb-server-10.3";
    declare Q_PWD="mysql-server/root_password";
    declare Q_PWD2="mysql-server/root_password_again";
    X="software-properties-common"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
    sudo -A apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
    sudo -A add-apt-repository 'deb [arch=amd64,i386,ppc64el] http://ftp.ubuntu-tw.org/mirror/mariadb/repo/10.3/ubuntu xenial main'
    sudo -A apt-get update

    echo -e "\n\nConfiguring 'debconf' with \"${MARIADB} ${Q_PWD} password ${PRD_ERPHOST_PWD}\"";
    sudo -A debconf-set-selections <<< "${MARIADB} ${Q_PWD} password ${PRD_ERPHOST_PWD}";
    sudo -A debconf-set-selections <<< "${MARIADB} ${Q_PWD2} password ${PRD_ERPHOST_PWD}";
    echo -e "Configured 'debconf'\n\n";

    echo -e "\n\nInstalling '${MARIADB}'";
    X=${MARIADB}; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

    echo -e "\n\nDeconfiguring 'debconf'";
    echo UNREGISTER ${Q_PWD} | sudo -A debconf-communicate ${MARIADB};
    echo UNREGISTER ${Q_PWD2} | sudo -A debconf-communicate ${MARIADB};
    echo -e "Deconfigured 'debconf'\n\n";

    X="libmysqlclient-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

    if [[ $(cat /etc/mysql/my.cnf | grep -c utf8mb4) -lt 3 ]]; then
      echo -e "Patching my.cnf ...";
      declare PATCH="${SCRIPT_DIR}/my.cnf.patch";
      sudo -A patch -N -i ${PATCH} /etc/mysql/my.cnf;
    fi;
    echo -e "my.cnf has been patched ...";

    echo -e "Restarting MariaDB...";
    sudo -A service mysql restart;
    echo -e "Restarted MariaDB.";


  fi;
  echo -e "MariaDB is available.";
};


prepareRedis () { funcTitle ${FUNCNAME[0]};
  X=redis-server; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
};


prepareNode () { funcTitle ${FUNCNAME[0]};
  X=nodejs;
  if aptNotYetInstalled "${X}"; then
    curl -AsL https://deb.nodesource.com/setup_10.x | sudo -E bash -;
    sudo -A apt-get -y install "${X}";
  else
    say ${X};
  fi;
  echo -e "Installing 'yarn' with 'npm'...";
  sudo -A npm install -g yarn;
};


installFrappeBootstrap () { funcTitle ${FUNCNAME[0]};
  echo -e "\nPreparing :: Frappe ...";

  mkdir -p ${BENCH_HOME};

  sudo -A chown -R ${USER}:${USER} ${HOME}/.config;

  pushd ${BENCH_HOME} > /dev/null;
    if ! bench --version; then

      echo -e "Cloning 'frappe'...";
      git clone https://github.com/frappe/bench ${BENCH_HOME};
      echo -e "\nInstalling 'bench' with 'pip'...";
      sudo -A pip3 install -e ${BENCH_HOME};

    else
      echo -e "Bench version $(bench --version) is already installed";
    fi;

  popd > /dev/null;
}



export BENCH_HOME="${HOME}/.bench";
export ERP_DIR="${HOME}";

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "\n~~~~~ Installing ErpNext  ~~~~~~\n\n";

  if [[ 1 -eq 1 ]]; then

    prepareServerSideScripts;
    prepareDependencies;

    prepareMariaDB;
    prepareRedis;
    prepareNode;

    installFrappeBootstrap;

    # echo -e "
    # ~~~~~~~~~~~~~~~~~~~~~~~  CURTAILED Frappe Installation  ~~~~~~~~~~~~~~~~~~~~~~~~~~";
    # exit;

  else
    echo -e "
    ~~~~~~~~~~~~~~~~~~~~~~~  Frappe Installation disabled  ~~~~~~~~~~~~~~~~~~~~~~~~~~";
    exit;
  fi;

  echo -e "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
fi;
