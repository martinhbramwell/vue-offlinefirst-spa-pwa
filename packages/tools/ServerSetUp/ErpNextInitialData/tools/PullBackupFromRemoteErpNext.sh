#!/usr/bin/env bash
#
# set -e;

export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
}

usage () { funcTitle ${FUNCNAME[0]};
  echo -e "Usage:
  ${0} targetDirectory directoryToHoldBackUpFiles";
  exit 1;
}

declare BACKUP_LOCATION=;
declare BACKUP_FILES=;
setVars () { # funcTitle ${FUNCNAME[0]};
  BACKUP_LOCATION=${1};
  BACKUP_FILES=${2};
}

export BENCH_DIR="frappe-bench";
export BENCH="/usr/local/bin/bench";
export BENCH_BKPS="sites/${PRD_ERPNEXT_SITE}/private/backups";

export LTS=LATEST.txt;
export LATEST="/tmp/${LTS}";
runRemoteErpNextBackup () { funcTitle ${FUNCNAME[0]};
  echo -e "Creating backup tasks script ...";
  declare BACKTASKS="backupTasks.sh";
  cat << EOFBTS > ${XDG_RUNTIME_DIR}/${BACKTASKS}
#!/usr/bin/env bash
#
declare CONFIG_FILE="site_config.json";
declare PRIVATE_FILES="./private/files";
pushd ${BENCH_DIR} >/dev/null;
  pushd sites/${PRD_ERPNEXT_SITE} >/dev/null;
    # ls -la;
    if [[ -h \${CONFIG_FILE} ]]; then
      echo -e "\${CONFIG_FILE} is already a symlink";
    else
      echo "\${CONFIG_FILE} is a regular file. Symlinking to private files directory";
      mv \${CONFIG_FILE} \${PRIVATE_FILES};
      ln -s \${PRIVATE_FILES}/\${CONFIG_FILE} \${CONFIG_FILE};
    fi;
  popd >/dev/null;
  ${BENCH} --site ${PRD_ERPNEXT_SITE} backup --with-files >/dev/null;
  ls -t ${BENCH_BKPS} | head -n1 | cut -d '-' -f 1 | tee ${LATEST} 1>/dev/null;
popd >/dev/null;
EOFBTS

  chmod +x ${XDG_RUNTIME_DIR}/${BACKTASKS};
  # cat ${XDG_RUNTIME_DIR}/${BACKTASKS};
  echo -e "Created backup tasks script ...";

  echo -e "Starting backup process on remote ...";
  # ls -la ${XDG_RUNTIME_DIR};
  scp ${XDG_RUNTIME_DIR}/${BACKTASKS} ${PRD_ERPHOST_NAME}:~;
  ssh ${PRD_ERPHOST_NAME} "./${BACKTASKS}";
  echo -e "... done remote backup.";
};

export BKPS=/opt/backupErpNext;
pullBackupFromRemoteErpNext () { funcTitle ${FUNCNAME[0]};
  pushd ${BKPS} >/dev/null;
    scp ${PRD_ERPHOST_NAME}:${LATEST} . >/dev/null;
    declare LT=$(cat ${LTS});
    echo -e "Will pull ${PRD_ERPHOST_NAME}:~/${BENCH_DIR}/${BENCH_BKPS}/${LT}*";
    scp ${PRD_ERPHOST_NAME}:~/${BENCH_DIR}/${BENCH_BKPS}/${LT}* . >/dev/null;
    echo -e "To clean up, you can run...
      ssh ${PRD_ERPHOST_NAME}

  ... then ...

      cd ~/${BENCH_DIR}/${BENCH_BKPS}; shopt -s extglob; rm -v !(${LT}*);

Or, locally ...

      ${BKPS}/purge.sh;

    ";
  popd >/dev/null;
};

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [ ! -z "${2+xxx}" ] && [ ! -z "${1+xxx}" ] && [ -d ${1} ] && [ -d ${1}/${2} ]; then
    declare PARENT="${1}";
    declare DIR="${2}";
  else
    declare PARENT="/opt";
    declare DIR="backupErpNext";
  fi;
  # [ -z "${2+xxx}" ] && usage "${0}";
  # [ -z "${1+xxx}" ] && usage "${0}";
  # [ -d ${1} ] || usage "${0}";
  # [ -d ${1}/${2} ] || usage "${0}";

  setVars ${PARENT} ${DIR};
  BKPS=${BACKUP_LOCATION}/${BACKUP_FILES};
  sudo -A mkdir -p ${BKPS};
  sudo chown ${USER}:${USER} ${BKPS};
  echo -e "Downloading to : '${BKPS}'";

  runRemoteErpNextBackup;

  pullBackupFromRemoteErpNext;
  cp ${SCRIPT_DIR}/purge.sh ${BKPS};
  # echo -e "--------  Curtailed   --------\n\n"
  # exit;

  echo -e "-----------  Done  -----------\n\n"
  exit;


fi;
