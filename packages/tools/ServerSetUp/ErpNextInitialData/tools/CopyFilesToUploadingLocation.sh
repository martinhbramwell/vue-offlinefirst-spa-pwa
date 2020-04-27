#!/usr/bin/env bash
#
# export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
declare SCRTS="${HOME}/.ssh/secrets";
if [[ -z ${1} ]]; then
  echo -e "You must supply the directory from which the original backup files will be taken.";
else
  if [[ -z ${2} ]]; then
    echo -e "You must supply the safe storage directory in which the backup package will be kept.";
  else
    source ${SCRTS}/vue-offlinefirst-spa-pwa.config;

    declare SRC_DIR="${1}";
    declare TGT_DIR="${2}";
    declare TGT_DIR_PARENT="$(dirname -- "$(realpath -- "${TGT_DIR}")")";
    declare TGT=${TGT_DIR#"${TGT_DIR_PARENT}/"}

    declare LATEST="LATEST.txt";
    declare SITE_NAME="$(echo ${PRD_ERPNEXT_SITE//./_})";

    declare INITIAL_STATE_FILES_NAME="${PRD_ERPNEXT_SITE}_WIZARD";
    declare DATABASE_FILE="database.sql";
    declare DATABASE_PKG="${DATABASE_FILE}.gz";
    declare PUBLIC_PKG="files.tar";
    declare PRIVATE_PKG="private-files.tar";


    pushd ${SRC_DIR} >/dev/null;
      if [ -f "${LATEST}" ]; then
        declare PREFIX=$(cat ${LATEST});
        # echo ${PREFIX}''
        # ls -la;
        cp ${PREFIX}-${SITE_NAME}-*.* ${TGT_DIR} >/dev/null;
        # ls -la ${TGT_DIR};
        pushd ${TGT_DIR}  >/dev/null;
          rm -f ${SITE_NAME}*;
          rm -f ${PRD_ERPNEXT_SITE}*;
          gunzip ${PREFIX}-${SITE_NAME}-${DATABASE_PKG} >/dev/null;
          mv ${PREFIX}-${SITE_NAME}-${DATABASE_FILE} ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
          gzip  ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
          mv ${PREFIX}-${SITE_NAME}-${PUBLIC_PKG} ${INITIAL_STATE_FILES_NAME}-${PUBLIC_PKG};
          mv ${PREFIX}-${SITE_NAME}-${PRIVATE_PKG} ${INITIAL_STATE_FILES_NAME}-${PRIVATE_PKG};
          cp ${SCRTS}/ErpNext_API_Keys.sh .;
        popd >/dev/null;
        # ls -la ${TGT_DIR};

        pushd ${TGT_DIR_PARENT} >/dev/null;
          rm -fr ${TGT}.tar.gz;
          tar zcvf ${TGT}.tar.gz ${TGT} >/dev/null;
        popd >/dev/null;
        # ls -la ${TGT_DIR_PARENT};

        echo -e "Moved the ...
        ${SRC_DIR}/${PREFIX}-${SITE_NAME}*
    ... files to ...
        ${TGT_DIR}/${INITIAL_STATE_FILES_NAME}*
        ";
      else
        echo "${LATEST} does not exist";
      fi;
      echo -e "
      ${TGT}";
    popd >/dev/null;
  fi;

fi;
        # echo -e "CURTAILED ${TGT_DIR}";
        # exit

