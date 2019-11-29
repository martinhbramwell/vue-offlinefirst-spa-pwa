#!/usr/bin/env bash
#
set -e;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
}

export BENCH_DIR="frappe-bench";
export BENCH="/usr/local/bin/bench";
export BENCH_BKPS="${BENCH_DIR}/sites/${PRD_ERPNEXT_SITE}/private/backups";

export LTS=LATEST.txt;
export LATEST="/tmp/${LTS}";
runRemoteErpNextBackup () { funcTitle ${FUNCNAME[0]};
  ssh ${PRD_ERPHOST_NAME} "cd ${BENCH_DIR}; ${BENCH} --site ${PRD_ERPNEXT_SITE} backup --with-files >/dev/null";
  ssh ${PRD_ERPHOST_NAME} "ls -t ${BENCH_BKPS} | head -n1 | cut -d '-' -f 1 | tee ${LATEST} 1>/dev/null";
};


export BKPS=/opt/backupErpNext;
pullBackupFromRemoteErpNext () { funcTitle ${FUNCNAME[0]};
  pushd ${BKPS} >/dev/null;
    scp ${PRD_ERPHOST_NAME}:${LATEST} . >/dev/null;
    declare LT=$(cat ${LTS});
    echo -e "Will pull ${PRD_ERPHOST_NAME}:~/${BENCH_BKPS}/${LT}*";
    scp ${PRD_ERPHOST_NAME}:~/${BENCH_BKPS}/${LT}* . >/dev/null;
    echo -e "To clean up, you can run...
      ssh ${PRD_ERPHOST_NAME}

  ... then ...

      cd ~/${BENCH_BKPS}; shopt -s extglob; rm -v !(${LT}*);

Or, locally ...

      ${BKPS}/purge.sh;

    ";
  popd >/dev/null;
};

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  runRemoteErpNextBackup;
  pullBackupFromRemoteErpNext;
  cp purge.sh ${BKPS};

  echo -e "-----------  Done  -----------\n\n"
fi;
