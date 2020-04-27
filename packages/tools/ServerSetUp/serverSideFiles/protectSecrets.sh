#!/usr/bin/env bash
#

export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

declare PARMS="virtualHostsConfigParameters.json";

declare GOOGLE_CREDS_FILE="credentials.json";
declare GOOGLE_WIB_TOKEN="token.json";
declare COLLECTOR_DIR="SecretsCollector";

declare SECRETS_FILE_PATH=".ssh/secrets";
declare SECRETS_FILE_DIR="${HOME}/${SECRETS_FILE_PATH}";
declare LETSENCRYPT_ARCHIVE="LetsEncrypt.tar.gz";
declare ERPNEXT_LETSENCRYPT_ARCHIVE="LetsEncrypt_erpnext.tar.gz";

unset FAILED;
pushd ${SCRIPT_DIR} >/dev/null;
  declare FAILURE_MESSAGES="Failed because...\n";
  mkdir -p ${SECRETS_FILE_DIR};
  if [[ -f "${SECRETS_FILE_DIR}/${PARMS}" ]]; then
    rm -f ./${PARMS};
  else
    if [[ -f "./${PARMS}" ]]; then
      mv ./${PARMS} ${SECRETS_FILE_DIR};
    else
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ./${PARMS} does not exist.\n";
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ${SECRETS_FILE_DIR}/${PARMS} does not exist.\n";
      declare FAILED=true;
    fi
  fi

  if [[ -f "${SECRETS_FILE_DIR}/${LETSENCRYPT_ARCHIVE}" ]]; then
      rm -f ./${LETSENCRYPT_ARCHIVE};
  else
    if [[ -f "./${LETSENCRYPT_ARCHIVE}" ]]; then
      mv ./${LETSENCRYPT_ARCHIVE} ${SECRETS_FILE_DIR};
    else
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ./${LETSENCRYPT_ARCHIVE} does not exist.\n";
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ${SECRETS_FILE_DIR}/${LETSENCRYPT_ARCHIVE} does not exist.\n";
      declare FAILED=true;
    fi
  fi

  if [[ -f "${SECRETS_FILE_DIR}/${ERPNEXT_LETSENCRYPT_ARCHIVE}" ]]; then
      rm -f ./${ERPNEXT_LETSENCRYPT_ARCHIVE};
  else
    if [[ -f "./${ERPNEXT_LETSENCRYPT_ARCHIVE}" ]]; then
      mv ./${ERPNEXT_LETSENCRYPT_ARCHIVE} ${SECRETS_FILE_DIR};
    else
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ./${ERPNEXT_LETSENCRYPT_ARCHIVE} does not exist.\n";
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ${SECRETS_FILE_DIR}/${ERPNEXT_LETSENCRYPT_ARCHIVE} does not exist.\n";
      declare FAILED=true;
    fi
  fi

  if [[ -f "${SECRETS_FILE_DIR}/${GOOGLE_CREDS_FILE}" ]]; then
      rm -f ./${COLLECTOR_DIR}/${GOOGLE_CREDS_FILE};
  else
    if [[ -f "./${COLLECTOR_DIR}/${GOOGLE_CREDS_FILE}" ]]; then
      mv ./${COLLECTOR_DIR}/${GOOGLE_CREDS_FILE} ${SECRETS_FILE_DIR};
    else
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ./${COLLECTOR_DIR}/${GOOGLE_CREDS_FILE} does not exist.\n";
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ${SECRETS_FILE_DIR}/${GOOGLE_CREDS_FILE} does not exist.\n";
      declare FAILED=true;
    fi
  fi

  if [[ -f "${SECRETS_FILE_DIR}/${GOOGLE_WIB_TOKEN}" ]]; then
      rm -f ./${GOOGLE_WIB_TOKEN};
  else
    if [[ -f "./${GOOGLE_WIB_TOKEN}" ]]; then
      mv ./${GOOGLE_WIB_TOKEN} ${SECRETS_FILE_DIR};
    else
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ./${GOOGLE_WIB_TOKEN} does not exist.\n";
      FAILURE_MESSAGES="${FAILURE_MESSAGES} ==> ${SECRETS_FILE_DIR}/${GOOGLE_WIB_TOKEN} does not exist.\n";
      declare FAILED=true;
    fi
  fi
popd >/dev/null;

if [[ -z ${FAILED} ]]; then
  echo -e "Secrets files have been moved to '${SECRETS_FILE_DIR}'.  New contents...\n____";
  ls -1 ${SECRETS_FILE_DIR};
  echo -e "~~~~";
else
  echo -e "### ${FAILURE_MESSAGES}";
  exit 1;
fi;

# ls -la ./${COLLECTOR_DIR}/${GOOGLE_CREDS_FILE};
# echo -e "+~~~~+";


# echo -e "GOOGLE_CREDS_FILE :: ${HOME}/${SECRETS_FILE_PATH}/${GOOGLE_CREDS_FILE}";
# exit;
