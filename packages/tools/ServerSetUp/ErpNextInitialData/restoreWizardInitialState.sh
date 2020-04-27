#!/usr/bin/env bash
#
set -e;

export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

funcTitle () {
  mx=28; ttl=$1;
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

# loadPermanentDevBackup () { funcTitle ${FUNCNAME[0]};
#   pushd ${PERMANENT_DEV_BACKUP_DIR} >/dev/null;
#     # pwd;
#     # ls -la;
#     declare LATEST="$(cat LATEST.txt)";
#     declare SITE_NAME="$(echo ${PRD_ERPNEXT_SITE//./_})";

#     declare TGT="${ERPNEXT_BACKUP_DIR}/${INITIAL_STATE_FILES_NAME}";
#     # echo -e "${LATEST}";

#     cp ${LATEST}-${SITE_NAME}-${DATABASE_PKG}  ${TGT}-${DATABASE_PKG};
#     cp ${LATEST}-${SITE_NAME}-${PRIVATE_PKG}  ${TGT}-${PRIVATE_PKG};
#     cp ${LATEST}-${SITE_NAME}-${PUBLIC_PKG}  ${TGT}-${PUBLIC_PKG};
#     echo -e "Moved back up files from ...
#     ${PERMANENT_DEV_BACKUP_DIR}/${LATEST}-${SITE_NAME}.*
#         ... to ...
#     ${TGT}.*";
#   popd >/dev/null;
# };

loadPermanentDevBackup () { funcTitle ${FUNCNAME[0]};
  pushd ${XDG_RUNTIME_DIR} >/dev/null;
    rm -f ${PERMANENT_DEV_BACKUP_FILE};
    rm -f ${INITIAL_STATE_FILES_NAME}*.*;
  popd >/dev/null;
  cp ${PERMANENT_DEV_BACKUP} ${XDG_RUNTIME_DIR};
  # ls -ls ${XDG_RUNTIME_DIR};
};

compressBackup () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    rm -f ${INITIAL_STATE_FILES_NAME}.tar.gz;
    tar zcvf ${INITIAL_STATE_FILES_NAME}.tar.gz ${INITIAL_STATE_FILES_NAME}-*.* >/dev/null;
    # rm -f ${INITIAL_STATE_FILES_NAME}-*.*;
    # ls -la
    echo -e "Compressed backup files into '${ERPNEXT_BACKUP_DIR}/${INITIAL_STATE_FILES_NAME}.tar.gz'";
  popd >/dev/null;
};

pushBackUpFileToTarget () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    # pwd;
    # ls -la ${INITIAL_STATE_FILES_NAME}.tar.gz;
    scp ${PERMANENT_DEV_BACKUP_FILE} ${PRD_ERPHOST_NAME}:~ >/dev/null;
    echo -e "Pushed ${PERMANENT_DEV_BACKUP_FILE} to ${PRD_ERPHOST_NAME}";
  popd >/dev/null;
};

declare RESTORE_COMMAND_FILE="restoreBkUp.sh";
createRestoreCommand () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    declare SITE_TAR="${INITIAL_STATE_FILES_NAME}.tar.gz";
    declare SITE_DB=${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    declare DATA=" \${BKUP_DIR}/${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE}";
    declare FILE="\${BKUP_DIR}/${INITIAL_STATE_FILES_NAME}-${PUBLIC_PKG}";
    declare PRIV="\${BKUP_DIR}/${INITIAL_STATE_FILES_NAME}-${PRIVATE_PKG}";
    declare PASS=" --mariadb-root-password ${PRD_ERPHOST_PWD}";
    cat << EOFPAK > ${XDG_RUNTIME_DIR}/${RESTORE_COMMAND_FILE}
#!/usr/bin/env bash
#
set -e;
declare BKUP_DIR=\${HOME}/bkps;
mkdir -p \${BKUP_DIR};
rm -fr \${BKUP_DIR}/*;
tar zxvf ./${PERMANENT_DEV_BACKUP_FILE} >/dev/null;
mv ${PERMANENT_DEV_BACKUP_DIR}/* \${BKUP_DIR};
rm -fr ${PERMANENT_DEV_BACKUP_DIR};
pushd \${BKUP_DIR} >/dev/null;
  echo -e "Unpacking '${PERMANENT_DEV_BACKUP_FILE}' ...";
  gunzip -f ${SITE_DB}.gz;
  echo -e "Unpacked files. Restoring from backup now ...";
  # ls -la;
popd >/dev/null;
# ls -la;

rm -f ${PERMANENT_DEV_BACKUP_FILE};

declare FILE_SW=" --with-public-files ${FILE}";
declare PRIV_SW=" --with-private-files ${PRIV}";
pushd \${HOME}/frappe-bench >/dev/null;
  bench --site ${PRD_ERPNEXT_SITE} --force restore ${PASS} ${DATA} \${FILE_SW} \${PRIV_SW};
  # echo bench --site ${PRD_ERPNEXT_SITE} --force restore ${PASS} ${DATA} \${FILE_SW} \${PRIV_SW};
  echo -e "\nRestored from backup."
  pushd sites/${PRD_ERPNEXT_SITE} >/dev/null;
    declare SCJ="site_config.json";
    declare SCJ_PATH="./private/files";
    if [[ -f "\${SCJ_PATH}/\${SCJ}" ]]; then
      echo "\${SCJ_PATH}/\${SCJ} exists";
      mv \${SCJ} \${SCJ}_BK;
    else
      echo "\${SCJ} NOT found in \${SCJ_PATH}. Moving ./\${SCJ} to  \${SCJ_PATH}.";
      mv \${SCJ} \${SCJ_PATH};
    fi;
    ln -s \${SCJ_PATH}/\${SCJ} \${SCJ};
    echo -e "Symlinked \${SCJ} to \${SCJ_PATH}/\${SCJ}."
  popd >/dev/null;
popd >/dev/null;
# ls -la;
# pwd;
rm -f restoreBkUp.sh;
rm -f \${BKUP_DIR}/*;
exit;

EOFPAK

    chmod +x ${XDG_RUNTIME_DIR}/${RESTORE_COMMAND_FILE};
    echo -e "Created ${XDG_RUNTIME_DIR}/${RESTORE_COMMAND_FILE}";
  popd >/dev/null;
};

pushRestoreCommandToTarget () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    scp ${XDG_RUNTIME_DIR}/${RESTORE_COMMAND_FILE} ${PRD_ERPHOST_NAME}:~ >/dev/null;
  popd >/dev/null;
  echo -e "Pushed ${RESTORE_COMMAND_FILE} to ${PRD_ERPHOST_NAME}:~";
};

runRestoreCommandOnTarget () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    ssh ${PRD_ERPHOST_NAME} "./${RESTORE_COMMAND_FILE};";
  popd >/dev/null;
};

deCompressBackup () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    pwd ;
    ls -la;
    echo rm -f ${INITIAL_STATE_FILES_NAME}*.*;
    echo tar zxvf ${ERPNEXT_MASTER_POST_WIZARD_BACKUP}; # >/dev/null;
    echo mv ${ERPNEXT_MASTER_POST_WIZARD_BACKUP_NAME}/*.* .
    echo rm -fr ${ERPNEXT_MASTER_POST_WIZARD_BACKUP_NAME};
  popd >/dev/null;
};

deCompressSQL () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    gunzip ${INITIAL_STATE_FILES_NAME}-${DATABASE_PKG};
  popd >/dev/null;
};

patchAdministratorPasswordIntoRestoreSQL () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;

    declare PBKDF2=$(${SCRIPT_DIR}/generatePBKDF2.sh ${PRD_ERPHOST_PWD});

    # echo -e "${PBKDF2}";
    # # cat ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE} | grep "PUT_THE_ADMINISTRATORZ_ENCRYPTED_PASSSWORD_HERE";
    # echo sed -i "s/PUT_THE_ADMINISTRATORZ_ENCRYPTED_PASSSWORD_HERE/${PBKDF2}/g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    sed -i "s|PUT_THE_ADMINISTRATORZ_ENCRYPTED_PASSSWORD_HERE|${PBKDF2}|g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    # grep -A 4 "INSERT INTO \`__Auth\` VALUES" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    # ls -la;
  popd >/dev/null;
};

patchNewCompanyNameIntoRestoreSQL () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    sed -i "s|Your Org|Logichem|g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    sed -i "s| - YO| - LSSA|g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    sed -i "s|Makes Me Money|NO HAY VIDA SIN AGUA|g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    sed -i "s|This is an example website auto-generated from ERPNext|¿Qué es Iridium Blue?\n\nIridium Blue es agua subterránea de gran pureza y calidad, purificada y envasada.\nTratada para conseguir la mejor hidratación posible manteniendo un fino equilibrio entre sus elementos naturales, asociados a la molécula de H2O. Nos basamos en los parámetros bio-electrónicos de agua que se considera no solo apta, sino saludable para el ser humano, con resultados perceptibles a corto, mediano y largo plazo, repercutiendo en el bienestar y la salud de quienes la consumen con regularidad.|g" ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    # ls -la ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE};
    # exit;
  popd >/dev/null;
};

compressSQL () { funcTitle ${FUNCNAME[0]};
  pushd ${ERPNEXT_BACKUP_DIR} >/dev/null;
    gzip ${INITIAL_STATE_FILES_NAME}-${DATABASE_FILE} >/dev/null;
  popd >/dev/null;
};


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  declare PERMANENT_DEV_BACKUP_DIR="ErpNext_WIZARD_backup";
  declare PERMANENT_DEV_BACKUP_FILE="${PERMANENT_DEV_BACKUP_DIR}.tar.gz";
  declare PERMANENT_DEV_BACKUP_HOME="${HOME}/Desktop";
  declare PERMANENT_DEV_BACKUP="${PERMANENT_DEV_BACKUP_HOME}/${PERMANENT_DEV_BACKUP_FILE}";
  pushd ${SCRIPT_DIR} > /dev/null;
    # # deCompressBackup;
    # # # deCompressSQL;
    # # # patchAdministratorPasswordIntoRestoreSQL;
    # # # patchNewCompanyNameIntoRestoreSQL;
    # # # compressSQL;

    # # # compressBackup;

    loadPermanentDevBackup;
    pushBackUpFileToTarget;
    createRestoreCommand;
    pushRestoreCommandToTarget;
    runRestoreCommandOnTarget;

    echo -e "
    ~~~~~~~~~~~~~~~~~~~~~~~  restoreWizardInitialState.sh CURTAILED  ~~~~~~~~~~~~~~~~~~~~~~~~~~";
    exit;

  popd > /dev/null;

  echo -e "\n\n~~~~~~~~ restoreWizardInitialState.sh terminated ~~~~~~~"
fi;
