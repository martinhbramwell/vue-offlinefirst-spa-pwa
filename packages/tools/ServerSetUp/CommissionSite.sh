#!/usr/bin/env bash
#
# set -e;

export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;


declare INITIAL_STATE_FILES_NAME="${PRD_ERPNEXT_SITE}_WIZARD";

declare TARGET_VM_SNAPSHOT_NUMBER="5";

export SECRETS_FILE_PATH=".ssh/secrets";
export GOOGLE_CREDS_FILE="credentials.json";
export MIME="application/gzip";

funcTitle () {
  mx=28; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
};

export DIR="${ERP_NEXT_BKUP_NAME}";
export TAR="${DIR}.tar.gz";
export B64="${TAR}.b64";

pullSiteBackUp () { funcTitle ${FUNCNAME[0]};
  # export PARENT="1zGQyVXRig9jLm4B-DI1KBwKa8zHRkWuI";
  # node ~/ServerSetUp/serverSideFiles/SecretsCollector/uploadSecret.js ${FILEDIR} ${FILENAME} "${MIME}" "${PARENT}";
  pushd ${XDG_RUNTIME_DIR} >/dev/null;
    export FILEID="${ERP_NEXT_BKUP_ID}"; # "1t_whTdOZLi9BRxtlwB-kB_85nEEMu_RM";
    export FILENAME="${B64}";
    export FILEDIR=".";
    rm -fr ${DIR};
    rm -f ${B64};
    rm -f ${TAR};
    node ~/ServerSetUp/serverSideFiles/SecretsCollector/collectSecret ${FILEID} ${FILENAME} "${FILEDIR}"; echo -e "\n......";
    # ls -la ${B64};
    base64 -d ${B64} > ${TAR};
    rm -f ${B64};
    # ls -la ${TAR};
    tar zxvf ${TAR} >/dev/null;
    rm -f ${TAR};

    rm -f ${PRD_ERPNEXT_SITE}_WIZARD.*;
    declare SITE_NAME="$(echo ${PRD_ERPNEXT_SITE//./_})";
    # rm -f ${SITE_NAME}_WIZARD.*;
    declare INITIAL_STATE_FILES_NAME="${PRD_ERPNEXT_SITE}_WIZARD";
    rm -f ${INITIAL_STATE_FILES_NAME}.tar.gz*;
    pushd ${DIR} >/dev/null;
      declare TS=$(cat LATEST.txt);
      mv ${TS}-${SITE_NAME}-database.sql.gz ${INITIAL_STATE_FILES_NAME}-database.sql.gz;
      mv ${TS}-${SITE_NAME}-files.tar ${INITIAL_STATE_FILES_NAME}-files.tar;
      mv ${TS}-${SITE_NAME}-private-files.tar ${INITIAL_STATE_FILES_NAME}-private-files.tar;
      rm -f LATEST.txt;
      tar zcvf ../${INITIAL_STATE_FILES_NAME}.tar.gz *.* >/dev/null;
      cp API_Keys.txt ${HOME}/.ssh/secrets/ErpNext_API_Keys.txt;
    popd >/dev/null;
    rm -fr ${DIR};
    tar ztvf ${INITIAL_STATE_FILES_NAME}.tar.gz
    # ls -la;
    # exit;
    # ls -la; # ${INITIAL_STATE_FILES_NAME}.tar.gz;
  popd >/dev/null;
}

revertVMtoSnapShot () { funcTitle ${FUNCNAME[0]};
  pushd ./ErpNextInitialData/tools >/dev/null;
    # pwd;
    # ls -ls RevertSnapShotAndStartVM.sh;
    ./RevertSnapShotAndStartVM.sh ${1};
  popd >/dev/null;
};

setSiteNameToDomainName () { funcTitle ${FUNCNAME[0]};
  declare CHNG_NAME="setSiteNameToDomainName.sh";
  declare CHNG_NGNX="fixSiteName.patch";
  pushd ${XDG_RUNTIME_DIR} >/dev/null;

    cat << EOFSSN > ${CHNG_NAME};
#!/usr/bin/env bash
#
mv ${CHNG_NGNX} \${HOME}/frappe-bench/config/;
pushd \${HOME}/frappe-bench >/dev/null;
  pushd sites >/dev/null;
    echo -e "Renaming site from ${PRD_ERPNEXT_SITE} to ${PRD_ERPNEXT_HOST}";
    [ -d ${PRD_ERPNEXT_SITE} ] && mv ${PRD_ERPNEXT_SITE} ${PRD_ERPNEXT_HOST};
    echo ${PRD_ERPNEXT_HOST} > currentsite.txt;
  popd >/dev/null;
  pushd ./config >/dev/null;
    declare TS=\$(date +"%Y%m%d_%H%M");
    echo -e "Patching name change in NGinX config.";
    cp nginx.conf nginx.conf_bk\${TS};
    sed -i "s/${PRD_ERPNEXT_SITE}/${PRD_ERPNEXT_HOST}/g" nginx.conf
  popd >/dev/null;
popd >/dev/null;
EOFSSN

    chmod +x ${CHNG_NAME};

    scp ${CHNG_NAME} ${PRD_ERPHOST_NAME}:~  >/dev/null;
    scp ${CHNG_NGNX} ${PRD_ERPHOST_NAME}:~  >/dev/null;
    ssh ${PRD_ERPHOST_NAME} "./${CHNG_NAME}";
    # ./RevertSnapShotAndStartVM.sh 6;
  popd >/dev/null;
}

# patchErpNext_NGinx () { funcTitle ${FUNCNAME[0]};
#   declare CONFIG_DIR="/home/${PRD_ERPHOST_USR}/.bench/bench/config";
#   declare TS=$(date +"%Y%m%d_%H%M");
#   declare PATTERN="isinstance(domain, unicode)";
#   declare REPLACEMENT="\t\t\t\tif isinstance(domain, str) or isinstance(domain, bytes):";

#   declare FIX_NGINX="fixNGinX.sh";

#   pushd ${XDG_RUNTIME_DIR} >/dev/null;
#     cat << EOFFXN > ${FIX_NGINX};
# #!/usr/bin/env bash
# #
# echo -e "\nPatching :: ErpNext NGinx 'unicode' bug...";
# pushd ${CONFIG_DIR}/ >/dev/null;                                                # Got to bench config directory
#   # sudo -Au ${PRD_ERPHOST_USR} cp nginx.py nginx_bk${TS}.py;                   # Backup wpuld interfer with upgrade
#   rm -f nginx_BACKUP.py;
#   sudo -Au ${PRD_ERPHOST_USR} sed -i "/${PATTERN}/c\\${REPLACEMENT}" nginx.py;  # Do the replacement
#   cat nginx.py | grep unicode;
#   cat nginx.py | grep bytes;
# popd >/dev/null;
# EOFFXN

#     chmod +x ${FIX_NGINX};
#     ls -ls ${FIX_NGINX};
#     scp ${FIX_NGINX} ${PRD_ERPHOST_NAME}:~  >/dev/null;
#     ssh ${PRD_ERPHOST_NAME} "./${FIX_NGINX}";

#   popd >/dev/null;
# };


fixSSHPermissions () { funcTitle ${FUNCNAME[0]};
  declare FIX_SSH="fixSSHPermissions.sh";
  pushd ${XDG_RUNTIME_DIR} >/dev/null;

    cat << EOFUPG > ${FIX_SSH};
#!/usr/bin/env bash
#
chmod -R go-rwx ./.ssh;
chmod -R g+r ./.ssh;
chmod g+x ./.ssh;
chmod go-rwx ./.ssh/id_rsa;
EOFUPG

    chmod +x ${FIX_SSH};
    ls -ls ${FIX_SSH};
    scp ${FIX_SSH} ${PRD_ERPHOST_NAME}:~  >/dev/null;
    ssh ${PRD_ERPHOST_NAME} "./${FIX_SSH}";

  popd >/dev/null;
};


upgradeBench () { funcTitle ${FUNCNAME[0]};
  declare FIX_SSH="upgradeErpNext.sh";
  pushd ${XDG_RUNTIME_DIR} >/dev/null;

    cat << EOFUPG > ${FIX_SSH};
#!/usr/bin/env bash
#
pushd \${HOME}/frappe-bench >/dev/null;
  pushd ./apps/frappe >/dev/null;
    git checkout -- yarn.lock;
  popd >/dev/null;
  pwd;
  bench update;
popd >/dev/null;
EOFUPG

    chmod +x ${FIX_SSH};
    ls -ls ${FIX_SSH};
    scp ${FIX_SSH} ${PRD_ERPHOST_NAME}:~  >/dev/null;
    ssh ${PRD_ERPHOST_NAME} "./${FIX_SSH}";

  popd >/dev/null;
};


########
fixWordLeftRightBug () { funcTitle ${FUNCNAME[0]};
  declare FIX_BUG="fixWordLeftRightBug";
  pushd ${XDG_RUNTIME_DIR} > /dev/null;
    cat << EOFLRB > ${FIX_BUG};
#!/usr/bin/env bash
#                            #
[ 2 = \$(cat .bashrc | grep -c  "^ bind.*ward-word") ] ||  echo -e "bind '\"\\\\\e[1;5D\" backward-word';\nbind '\"\\\\\e[1;5C\" forward-word';" >> .bashrc;
echo -e "Fixed left and right arrow key bug.";
EOFLRB

    chmod +x ${FIX_BUG};
    # ls -ls ${FIX_BUG};
    scp ${FIX_BUG} ${PRD_ERPHOST_NAME}:~  >/dev/null;
    ssh ${PRD_ERPHOST_NAME} "./${FIX_BUG}";


  popd > /dev/null;
};


########
pushQikBackupRestoreFilesToRemote () { funcTitle ${FUNCNAME[0]};
  pushd ${XDG_RUNTIME_DIR} > /dev/null;

    declare SITE_ALIAS=${PRD_ERPNEXT_SITE//./_};

    cat << QBEOF > qikBackup.sh
#!/usr/bin/env bash
#
declare SITE="${PRD_ERPNEXT_SITE}";

pushd \${HOME}/frappe-bench >/dev/null;
  echo -e "/* ~~~~~~~~  Backing Up ~~~~~~~~~ */";
  bench --site \${SITE} backup --with-files;
  echo -e "/* ~~~~~~~~ Done Backing Up ~~~~~~~~~ */\n\n";
popd >/dev/null;
QBEOF


    cat << QREOF > qikRestore.sh
#!/usr/bin/env bash
#
declare SITE="${PRD_ERPNEXT_SITE}";
declare YEAR=\$(date +"%Y");
declare BACKUPS_PATH="./sites/\${SITE}/private/backups";
declare LATEST="";
declare BKTMP="\${XDG_RUNTIME_DIR}/BKTMP";

if [[ -z \${PRD_ERPHOST_PWD} ]]; then
  echo -e "Must supply mariadb-root-password environment variable 'PRD_ERPHOST_PWD'
  export PRD_ERPHOST_PWD='';";
else
  pushd \${HOME}/frappe-bench >/dev/null;
    echo -e "/* ~~~~~~~~  Identifying latest backup ~~~~~~~~~ */";
    pushd \${BACKUPS_PATH} >/dev/null;
      declare TS=\$(ls -1 \${YEAR}* | tail -n 1);
      echo \${TS%-\${SITE//./_}*} > LATEST.txt;
      LATEST="\$(cat LATEST.txt)";
      mkdir -p \${BKTMP};
      rm -f \${BKTMP}/*.*;
      cp \${LATEST}* \${BKTMP};
    popd >/dev/null;
    # echo -e "LATEST = \$LATEST";

    ls -l \${BKTMP};
    echo -e "---";
    declare BUPR="\${BKTMP}/\${LATEST}-${SITE_ALIAS}-private-files.tar";
    declare BUPU="\${BKTMP}/\${LATEST}-${SITE_ALIAS}-files.tar";
    declare BUSQ="\${BKTMP}/\${LATEST}-${SITE_ALIAS}-database.sql.gz";
    # ls -la \${BUPR};
    # ls -la \${BUPU};
    # ls -la \${BUSQ};

    echo -e "/* ~~~~~~~~  Restoring ~~~~~~~~~ */";
    declare PASS=" --mariadb-root-password \${PRD_ERPHOST_PWD}";
    declare DATA=" \${BUSQ}";
    declare FILE=" --with-public-files \${BUPU}";
    declare PRIV=" --with-private-files \${BUPR}";

    bench --site \${SITE} --force restore \${PASS} \${DATA} \${FILE} \${PRIV};
    echo -e "/* ~~~~~~~~ Done Restore ~~~~~~~~~ */\n\n";
  popd >/dev/null;
fi;
QREOF

    chmod +x ./qik*.sh;

    scp qik*.sh ${PRD_ERPHOST_NAME}:~;
  popd > /dev/null;
};



########
restoreInitialState () { funcTitle ${FUNCNAME[0]};
  echo -e " *** Restoring Server Initial State...";

  declare reversionToSnapShot=0;
  if [[ ${reversionToSnapShot} = 1 ]]; then
    revertVMtoSnapShot 1;
  else
    echo -e "\n\n\n *** ${SCRIPT_NAME} -- SKIPPED reversion to snapshot ***\n\n";
  fi;

  # # setSiteNameToDomainName;
  # # ./ErpNextInitialData/tools/KillVM.sh;
  # # ./ErpNextInitialData/tools/StartVM.sh;

  fixSSHPermissions;
  # patchErpNext_NGinx;

  # # upgradeBench;

  pullSiteBackUp;

  echo -e "\n\n/* ~~~~~~~~~ Curtailed ~~~~~~~~~~~~~~~ */";
  exit;

  fixWordLeftRightBug;

  pushQikBackupRestoreFilesToRemote;

  # # ssh ${PRD_ERPHOST_NAME} "export PRD_ERPHOST_PWD='${PRD_ERPHOST_PWD}'; ./qikRestore.sh;"
  pushd ${SCRIPT_DIR}/ErpNextInitialData > /dev/null;
    echo -e " *** Restoring ErpNext to post-Wizard initial State...";
    ./restoreWizardInitialState.sh;
  popd > /dev/null;
};


########
restoreIntermediateState () { funcTitle ${FUNCNAME[0]};
  pushd ${SCRIPT_DIR}/ErpNextInitialData/tools > /dev/null;
    echo -e " *** Restoring most recent back up...";
    ./RestoreSelectedBackUp.sh ${1} ${2};
  popd > /dev/null;
};

########
getErpNextIinitialData () { funcTitle ${FUNCNAME[0]};
  declare GOOGLE="https://docs.google.com/spreadsheets/d";
  declare KEY="";
  declare GID="";
  pushd ${SCRIPT_DIR}/ErpNextInitialData/docTypeHandlers > /dev/null;

    declare PullChartOfAccountsData=1;
    if [[ ${PullChartOfAccountsData} = 1 ]]; then
      echo -e " *** Pulling Chart_of_Accounts Data ...";
      KEY="${ERP_NEXT_CoA_WKBK}";
      GID="${ERP_NEXT_CoA_SHT}";
      wget -O docType_Chart_of_Accounts_Importer.csv -o /dev/null \
       "${GOOGLE}/${KEY}/export?format=csv&gid=${GID}";
    else
      echo -e "\n\n\n *** ${SCRIPT_NAME} -- Skipped 'Pulling Chart_of_Accounts Data' ***\n\n";
    fi;

    declare PullCompanyData=1;
    if [[ ${PullCompanyData} = 1 ]]; then
      echo -e " *** Pulling Company Data...";
      KEY="${ERP_NEXT_CMPNY_WKBK}";
      GID="${ERP_NEXT_CMPNY_SHT}";
      wget -O tmp.json -o /dev/null \
       "${GOOGLE}/${KEY}/export?format=tsv&gid=${GID}";
      cat tmp.json | jq -r . > docType_Company.json;
    else
      echo -e "\n\n\n *** ${SCRIPT_NAME} -- Skipped 'Pulling Company Data' ***\n\n";
    fi;

  popd > /dev/null;
};

########
initializeErpNext () { funcTitle ${FUNCNAME[0]};
  pushd ${SCRIPT_DIR}/ErpNextInitialData > /dev/null;
    echo -e " *** Processing Bulk Data Operations...";
    ./processBulkInserts.sh;
  popd > /dev/null;
};


source ${HOME}/${SECRETS_FILE_PATH}/ErpNext_API_Keys.sh;
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  echo -e "Checking host '${NEW_HOST_NAME}'..... ";
  ./ErpNextInitialData/tools/WaitForSshStart.sh ${NEW_HOST_NAME};
  echo -e "*** ${NEW_HOST_NAME} is alive. ***";
  # echo -e "\n${ERPNEXT_HOST}\n ${KEYS}\n ${ERPNEXT_PROTOCOL}";

  echo -e "\nHost: ${ERPNEXT_HOST} Keys: ${KEYS} Protocol: ${ERPNEXT_PROTOCOL} Admin: ${ERPNEXT_ADMN}";
  ./ErpNextInitialData/tools/WaitForErpNextStart.sh ${ERPNEXT_HOST} ${KEYS} ${ERPNEXT_PROTOCOL} ${ERPNEXT_ADMN};
  echo -e "*** ERPNext is alive. ***";

  echo -e "\n\n/* ~~~~~~~~~ Commissioning Site ~~~~~~~~~~~~~~~ */";

  export BACKUPS_DIR="${HOME}/Desktop/ErpNext_Master_Post_WIZARD_backup";
  export LATEST_BACKUP="CustomersAndAddresses.tar.gz";

  declare revertToBackup=0;
  if [[ ${revertToBackup} = 1 ]]; then

    declare rebuildFromRawErpNext=1;
    if [[ ${rebuildFromRawErpNext} = 1 ]]; then
      restoreInitialState;
    else
      restoreIntermediateState ${BACKUPS_DIR} ${LATEST_BACKUP};
    fi;

  else
    echo -e "*** ${SCRIPT_NAME} -- SKIPPED reverting to backup ***\n\n";
  fi;


  declare finishInitializations=1;
  if [[ ${finishInitializations} = 1 ]]; then

    # getErpNextIinitialData;
    initializeErpNext;
  # echo -e "\n\n/* ~~~~~~~~~ Curtailed ~~~~~~~~~~~~~~~ */";
  # exit;

  else
    echo -e "\n\n *** ${SCRIPT_NAME} -- SKIPPED Bulk Data Operations ***\n\n";
  fi;

  echo -e "\n\n/* ~~~~~~~~ Site Commissioned ~~~~~~~~~~~ */";

fi;
