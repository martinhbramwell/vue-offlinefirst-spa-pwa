#!/usr/bin/env bash
#
set -e;

export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SECRETS_FILE_PATH=".ssh/secrets";

source ${HOME}/${SECRETS_FILE_PATH}/vue-offlinefirst-spa-pwa.config;

export GOOGLE_CREDS_FILE="credentials.json";

declare BACKUP_LOCATION=;
declare BACKUP_FILES=;
declare TAR=;
declare B64=;

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
}

usage () { funcTitle ${FUNCNAME[0]};
  echo -e "Usage:
  ${0} parentDirectory directoryToBundleAndUpload";
  exit 1;
}

setVars () { funcTitle ${FUNCNAME[0]};
  BACKUP_LOCATION=${1};
  BACKUP_FILES=${2};
  TAR="${BACKUP_FILES}.tar.gz";
  B64="${BACKUP_FILES}.tar.gz.b64";
}

bundle () { funcTitle ${FUNCNAME[0]};
  echo -e "Bundling '${BACKUP_LOCATION}/${BACKUP_FILES}'";
  pushd ${BACKUP_LOCATION} > /dev/null;
    tar zcvf ${BACKUP_FILES}.tar.gz ${BACKUP_FILES};
    base64 ${TAR} > ${B64};
  popd > /dev/null;
}

export MIME="text/plain";
export PARENT="${ERP_NEXT_BKUPS_DIR_ID}"; #"1zGQyVXRig9jLm4B-DI1KBwKa8zHRkWuI";
upload () { funcTitle ${FUNCNAME[0]};
  echo -e "Uploading '${BACKUP_LOCATION}/${BACKUP_FILES}'";
  export FILEDIR="${BACKUP_LOCATION}";
  export FILENAME="${B64}";
  pushd ${HOME}/ServerSetUp/serverSideFiles/SecretsCollector > /dev/null;
    node uploadSecret.js ${FILEDIR} ${FILENAME} "${MIME}" "${PARENT}";
  popd > /dev/null;
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  [ -z "${2+xxx}" ] && usage "${0}";
  [ -z "${1+xxx}" ] && usage "${0}";
  [ -d ${1} ] || usage "${0}";
  [ -d ${1}/${2} ] || usage "${0}";

  setVars ${1} ${2};

  declare INCLUDED_API_KEY_FILE="${BACKUP_LOCATION}/${BACKUP_FILES}/API_Keys.txt";
  declare STORED_API_KEY_FILE="${HOME}/${SECRETS_FILE_PATH}/ErpNext_API_Keys.txt";
  if [[ ! -f ${INCLUDED_API_KEY_FILE} ]]; then
    if [[ -f  ${STORED_API_KEY_FILE} ]]; then
      echo -e "Adding stored API keys to bundle...";
      cp ${STORED_API_KEY_FILE} ${INCLUDED_API_KEY_FILE};
    else
      echo -e "Failed:  There must be an ErpNext key pair file as either:
      1) ${INCLUDED_API_KEY_FILE}  OR
      2) ${STORED_API_KEY_FILE}";
      exit;
    fi;
  fi;

  bundle;
  upload;

  echo -e "\n-----------  Done  -----------\n\n"
fi;
