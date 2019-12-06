#!/usr/bin/env bash
#
set -e;

export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
};

# declare ERPNEXT_BACKUP_DIR="/opt/backupErpNext";
declare ERPNEXT_MASTER_POST_WIZARD_BACKUP_NAME="ErpNext_WIZARD_backup";
declare ERPNEXT_MASTER_POST_WIZARD_BACKUP="${ERPNEXT_MASTER_POST_WIZARD_BACKUP_NAME}.tar.gz";
declare ERPNEXT_BACKUP_DIR="${XDG_RUNTIME_DIR}";
declare INITIAL_STATE_FILES_NAME="${PRD_ERPNEXT_SITE}_WIZARD";
declare DATABASE_FILE="database.sql";
declare DATABASE_PKG="${DATABASE_FILE}.gz";
declare PUBLIC_PKG="files.tar";
declare PRIVATE_PKG="private-files.tar";
patchAdministratorPasswordIntoRestoreSQL () { funcTitle ${FUNCNAME[0]};

  pip3 install passlib;

  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    tar zxvf ${ERPNEXT_MASTER_POST_WIZARD_BACKUP} >/dev/null;
    mv ${ERPNEXT_MASTER_POST_WIZARD_BACKUP_NAME}/*.* .
    rm -fr ${ERPNEXT_MASTER_POST_WIZARD_BACKUP_NAME};

    gunzip ${INITIAL_STATE_FILES_NAME}-${DATABASE_PKG};
    declare PBKDF2=$(${SCRIPT_DIR}/generatePBKDF2.sh ${PRD_ERPHOST_PWD});
    # echo -e "${PBKDF2}";
    # # cat ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE} | grep "PUT_THE_ADMINISTRATORZ_ENCRYPTED_PASSSWORD_HERE";
    # echo sed -i "s/PUT_THE_ADMINISTRATORZ_ENCRYPTED_PASSSWORD_HERE/${PBKDF2}/g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    sed -i "s|PUT_THE_ADMINISTRATORZ_ENCRYPTED_PASSSWORD_HERE|${PBKDF2}|g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    # grep -A 4 "INSERT INTO \`__Auth\` VALUES" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    gzip ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE} >/dev/null;
    tar zcvf ${INITIAL_STATE_FILES_NAME}.tar.gz ${INITIAL_STATE_FILES_NAME}-*.* >/dev/null;
    rm -f ${INITIAL_STATE_FILES_NAME}-*.*;
    # ls -la;
  popd >/dev/null;
};

pushBackUpFilesToTarget () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    # # pwd;
    # # ls -la ${INITIAL_STATE_FILES_NAME}.tar.gz;
    scp ${INITIAL_STATE_FILES_NAME}.tar.gz ${PRD_ERPHOST_NAME}:~ >/dev/null;


    declare SITE_TAR="${INITIAL_STATE_FILES_NAME}.tar.gz";
    declare SITE_DB=${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    declare DATA=" \${HOME}/${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE}";
    declare FILE=" --with-public-files \${HOME}/${INITIAL_STATE_FILES_NAME}-${PUBLIC_PKG}";
    declare PRIV=" --with-private-files \${HOME}/${INITIAL_STATE_FILES_NAME}-${PRIVATE_PKG}";
    declare PASS=" --mariadb-root-password ${PRD_ERPHOST_PWD}";
    cat << EOFPAK > ${XDG_RUNTIME_DIR}/restoreBkUp.sh
#!/usr/bin/env bash
#
set -e;
tar zxvf ${SITE_TAR} >/dev/null;
rm -f ${SITE_TAR};
gunzip -f ${SITE_DB}.gz;
echo -e "Unpacked files. Restoring from backup now ..."
pushd \${HOME}/frappe-bench >/dev/null;
  bench --site ${PRD_ERPNEXT_SITE} --force restore ${PASS} ${DATA} ${FILE} ${PRIV};
  echo -e "Restored from backup."
  pushd sites/${PRD_ERPNEXT_SITE} >/dev/null;
    rm -f site_config.json;
    ln -s private/files/site_config.json site_config.json;
    echo -e "Symlinked site_config.json."
  popd >/dev/null;
popd >/dev/null;
rm -f ${INITIAL_STATE_FILES_NAME}*.*;

EOFPAK

    chmod +x ${XDG_RUNTIME_DIR}/restoreBkUp.sh;
    scp ${XDG_RUNTIME_DIR}/restoreBkUp.sh ${PRD_ERPHOST_NAME}:~ >/dev/null;
    ssh ${PRD_ERPHOST_NAME} "./restoreBkUp.sh;";

  popd >/dev/null;
};

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  pushd ${SCRIPT_DIR} > /dev/null;
    patchAdministratorPasswordIntoRestoreSQL;
    pushBackUpFilesToTarget;
  popd > /dev/null;
fi;
