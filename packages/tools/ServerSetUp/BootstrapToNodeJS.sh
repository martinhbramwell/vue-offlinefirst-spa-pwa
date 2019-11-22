#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

# export CONFIG_FILE="${HOME}/.ssh/secrets/local.config";
export SECRETS_DIR="${HOME}/.ssh/secrets";
export CONFIG_FILE="${SECRETS_DIR}/vue-offlinefirst-spa-pwa.config";
export DIR_FILES_FOR_UPLOAD="serverSideFiles";
export DIR_SETUP_FILES="setupScripts";

export GET_ASK_PASS_FUNC="source .bash_login;";
export APT_UPDATE_FILE="aptFix.sh";

########  Function definitions
usage () {
  echo -e "
  Usage:

  ${SCRIPT_NAME} [ROOT_PASSWORD]

   Note 1: ROOT_PASSWORD is required for first run.
   Note 2: expects a config file at: '${CONFIG_FILE}'";
   exit 1;
};



########
updateLocalKnownHostsFile () {
  echo -e "Clearing host from known_hosts.";
  ssh-keygen -R ${NEW_HOST} &> /dev/null;
  ssh-keygen -R ${SERVER_IP} &> /dev/null;

  echo -e "Adding host to known_hosts.";
  ssh-keygen -F ${NEW_HOST} &> /dev/null || ssh-keyscan -H ${NEW_HOST} 2> /dev/null >> ${HOME}/.ssh/known_hosts;
  ssh-keygen -F ${SERVER_IP} &> /dev/null || ssh-keyscan -H ${SERVER_IP} 2> /dev/null >> ${HOME}/.ssh/known_hosts;
}



########
createNewUser () {
  if sshpass -p ${NEW_HOST_PWD} ssh -t ${NEW_HOST_ADMIN}@${NEW_HOST} "pwd" &> /dev/null; then
    echo -e "User '${NEW_HOST_ADMIN}' exists with basic authentication.";
  else
    echo -e "Create new user: '${NEW_HOST_ADMIN}'";

    command -v mkpasswd &> /dev/null || sudo -A apt install whois;
    # echo ${NEW_HOST_ADMIN};
    # echo ${NEW_HOST_PWD};
    # echo ${NEW_HOST};
    declare TMP=$(echo $RANDOM)${NEW_HOST_ADMIN}${NEW_HOST};
    declare SALT=${TMP:0:16}; # echo ${SALT}
    declare HASHPWD=$(mkpasswd -m sha-512 ${NEW_HOST_PWD} ${SALT}); # echo ${HASHPWD};

    declare CMD="useradd -m -p '${HASHPWD}' -s /bin/bash ${NEW_HOST_ADMIN};";
    CMD="${CMD} usermod -aG sudo ${NEW_HOST_ADMIN};";
    # echo ${CMD};
    sshpass -p ${ROOT_PASSWORD} ssh -t root@${NEW_HOST} "${CMD}";
  fi;
};




########
patchSSHConfigFile () {

  declare NEW_REMOTE_USER="$1";
  declare NEW_REMOTE_HOST="$2";
  declare NEW_REMOTE_HOST_NAME="$3";
  declare NEW_REMOTE_HOST_PWD="$4";

  declare SSHPTH="/home/${USER}/.ssh";
  declare KEY_NAME=${NEW_REMOTE_USER}_$(echo ${NEW_REMOTE_HOST} | tr . _);

  echo -e "Check for public key '${KEY_NAME}.pub'";

  if ls -la ${SSHPTH} | grep -v grep | grep "${KEY_NAME}.pub" &> /dev/null; then
    echo "Found it.";
  else
    echo "Not found.  Generating new key for '${KEY_NAME}'";
    ssh-keygen -b 4096 -C ${NEW_REMOTE_USER}@$(hostname) -t rsa -N "" -f ${SSHPTH}/${KEY_NAME};
  fi;

  echo "Patching SSH config file with alias for '${NEW_REMOTE_USER}@${NEW_REMOTE_HOST}'";
  export PTRN="# Alias configuration: '${NEW_REMOTE_HOST_NAME}'";
  export PTRNB="${PTRN} «begins»";
  export PTRNE="${PTRN} «ends»";

  export SSHCFG_FILE="${SSHPTH}/config";
  touch ${SSHCFG_FILE};
  sed -i "/${PTRNB}/,/${PTRNE}/d" ${SSHCFG_FILE};

  echo -e "${PTRNB}
# Alias '${NEW_REMOTE_HOST_NAME}'' binds to remote user '${NEW_REMOTE_USER}@${NEW_REMOTE_HOST}'.'
Host ${NEW_REMOTE_HOST_NAME}
  User ${NEW_REMOTE_USER}
  HostName ${NEW_REMOTE_HOST}
  IdentityFile ${SSHPTH}/${KEY_NAME}
${PTRNE}
" >> ${SSHCFG_FILE}
  #
  sed -i "s/ *$//" ${SSHCFG_FILE}; # trim whitespace to EOL
  sed -i "/^$/N;/^\n$/D" ${SSHCFG_FILE}; # blank lines to 1 line

  if ! ssh -oBatchMode=yes -t ${NEW_HOST_NAME} "pwd" &> /dev/null; then
    echo "Pushing SSH public key to account '${NEW_REMOTE_USER}@${NEW_REMOTE_HOST}'"; # " identified by '${NEW_REMOTE_HOST_PWD}'";
    # echo "sshpass -p ${NEW_REMOTE_HOST_PWD} ssh-copy-id -f -i ${SSHPTH}/${KEY_NAME} ${NEW_REMOTE_USER}@${NEW_REMOTE_HOST}";
    sshpass -p ${NEW_REMOTE_HOST_PWD} ssh-copy-id -f -i ${SSHPTH}/${KEY_NAME} ${NEW_REMOTE_USER}@${NEW_REMOTE_HOST};
  fi;

}


########
pushNewUserPublicKey () {
  echo "Pushing public key for user : '${NEW_HOST_ADMIN}@${NEW_HOST}' identified by '${NEW_HOST_PWD}'.";
  sshpass -p ${NEW_HOST_PWD} ssh -t ${NEW_HOST_ADMIN}@${NEW_HOST} "pwd";
  echo "!";
  patchSSHConfigFile ${NEW_HOST_ADMIN} ${NEW_HOST} ${NEW_HOST_NAME} ${NEW_HOST_PWD};
};


########
pushAndRunAskPassServiceMaker() {
  echo "Running SUDO_ASKPASS maker script for user '${NEW_HOST_ADMIN}' on remote host.";
  ssh -T ${NEW_HOST_NAME} "bash -s" -- < ${SCRIPT_DIR}/MakeAskPassService.sh "${NEW_HOST_ADMIN}" "${NEW_HOST_PWD}"
}



########
patchGrubConfigFile () {
  echo "Patching GRUB configuration of '${NEW_HOST}'.";
  ssh -T ${NEW_HOST_NAME} "bash -s" -- < ${SCRIPT_DIR}/PatchGrubConfigFile.sh;
};


########
patchSSHServerConfigFile () {
  echo "Patching SSH server configuration of '${NEW_HOST}'.";
  ssh -T ${NEW_HOST_NAME} "bash -s" -- < ${SCRIPT_DIR}/PatchSSHServerConfigFile.sh;
};



########
prepareHostForKeyBasedLogins () {

  ssh-keygen -R ${NEW_HOST};
  export NEW_HOST_IP=$(ping -q -c 1 ${NEW_HOST} > tmp; cat tmp | grep -oE '((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])')
  rm -f tmp;

  ssh-keygen -R ${NEW_HOST_IP};

  ssh-keyscan -H ${NEW_HOST} >> ~/.ssh/known_hosts
  ssh-keyscan -H ${NEW_HOST_IP} >> ~/.ssh/known_hosts

  echo -e "\nApparently user '${NEW_HOST_ADMIN}' does not yet exist. Creating...
  ${NEW_HOST_ROOT}:${ROOT_PASSWORD}@${NEW_HOST}";
  [[ -z "${ROOT_PASSWORD}" ]] && usage;
  if sshpass -p ${ROOT_PASSWORD} ssh -t ${NEW_HOST_ROOT}@${NEW_HOST} "pwd" &> /dev/null; then
    createNewUser;
    pushNewUserPublicKey;
    pushAndRunAskPassServiceMaker;
    patchGrubConfigFile;
    patchSSHServerConfigFile;
  else
    echo "Failed to login as root user on '${NEW_HOST}'";
    exit 1;
  fi;
};



########
importSecretFiles () {
  declare TYPE="virtualHostsCfgPrms";
  declare SECRET="${WEBTASK_SECRET}";
  declare HDR="Content-Type: application/json";
  pwd;
  echo -e "Download secret files from secure cloud locations";
  curl -sH "${HDR}" -d '{"type":"virtualHostsCfgPrms","scrt":"'"${SECRET}"'"}' --post301 -X POST -L ${BITLY_LINK} > tmp.json;
  # curl -sH "${HDR}" -d '{"type":"virtualHostsCfgPrms","scrt":"'"${SECRET}"'"}' --post301 -X POST -L http://bit.ly/vue-offlinefirst-spa-pwa > tmp.json;
  mv tmp.json ./serverSideFiles/virtualHostsConfigParameters.json;

  curl -sH "${HDR}" -d '{"type":"token","scrt":"'"${SECRET}"'"}' --post301 -X POST -L ${BITLY_LINK} > tmp.json;
  mv tmp.json ./serverSideFiles/token.json;

  echo -e "Imported secret files.";
};

########
uploadServerSideFiles () {
  echo -e "Create server side script files home '${NEW_HOST_NAME}:${HOME}/${DIR_SETUP_FILES}'";
  ssh -t ${NEW_HOST_NAME} "mkdir -p \${HOME}/${DIR_SETUP_FILES}";
  echo -e "Upload server side files ...
  from : '${SCRIPT_DIR}/${DIR_FILES_FOR_UPLOAD}/*'
  to   : '~/${DIR_SETUP_FILES}'";
  rsync -a ${SCRIPT_DIR}/${DIR_FILES_FOR_UPLOAD}/* ${NEW_HOST_NAME}:~/${DIR_SETUP_FILES};
};

########
protectSecrets () {
  echo -e "Move secrets files to '${SECRETS_DIR}'";
  ssh -t ${NEW_HOST_NAME} "\${HOME}/${DIR_SETUP_FILES}/protectSecrets.sh";
};



########
prepareTimeZone () {
  declare TZ_SETUP_FILE="SetUpTZ.sh";

  echo -e "Set up Time Zone"
  TZCMD="${GET_ASK_PASS_FUNC} source \${HOME}/${DIR_SETUP_FILES}/${TZ_SETUP_FILE}; prepareTZ;";
  ssh -t ${NEW_HOST_NAME} ${TZCMD};
};



########
prepareAPT () {
  echo -e "Refresh APT"
  declare APTCMD="${GET_ASK_PASS_FUNC}";
  declare APT_UPDATE="\${HOME}/${DIR_SETUP_FILES}/${APT_UPDATE_FILE}";
  APTCMD="${APTCMD} source ${APT_UPDATE};";
  # APTCMD="${APTCMD} pushd ${DIR_SETUP_FILES};";
  APTCMD="${APTCMD} lazyUpdate;";
  APTCMD="${APTCMD} aptInstallIfNotInstalled;";
  # APTCMD="${APTCMD} popd;";
  ssh -t ${NEW_HOST_NAME} ${APTCMD};
  ssh -t ${NEW_HOST_NAME} "mv ${APT_UPDATE} ${HOME}";
};



########
prepareUFW () {
  declare UFW_SETUP_FILE="SetUpUFW.sh";

  echo -e "Set up UFW"
  UFWCMD="${GET_ASK_PASS_FUNC} source \${HOME}/${DIR_SETUP_FILES}/${UFW_SETUP_FILE}; prepareUFW;";
  ssh -t ${NEW_HOST_NAME} ${UFWCMD};
};



########
prepareNodeJS () {
  declare NODEJS_SETUP_FILE="InstallNodeJS.sh";

  echo -e "Set up NodeJS"
  NJSCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${NODEJS_SETUP_FILE};";
  ssh -t ${NEW_HOST_NAME} ${NJSCMD};
};



########
prepareCouchDB () {
  declare COUCHDB_SETUP_FILE="InstallCouchDB.sh";
  declare SECRETS_PATH="\${HOME}/.ssh/secrets";
  declare SECRETS_FILENAME="CouchDB";
  declare SECRETS_FILE="${SECRETS_PATH}/${SECRETS_FILENAME}";
  declare SECRETS_FILE_WRITER_NAME="writeSecret.sh";

  echo -e "Set up CouchDB";
  source ${CONFIG_FILE};

  cat << EOF > ${XDG_RUNTIME_DIR}/${SECRETS_FILENAME}
#!/usr/bin/env bash
#
mkdir -p ${SECRETS_PATH};
cat << 'END_OF_FILE' > ${SECRETS_FILE}
export COUCH_USR="${COUCH_USR}";
export COUCH_PWD="${COUCH_PWD}";
export COUCH_ROOT_PWD="${COUCH_ROOT_PWD}";
END_OF_FILE
chmod go-rwx ${SECRETS_FILE};
rm -f ${SECRETS_FILE_WRITER_NAME};
EOF

  scp ${XDG_RUNTIME_DIR}/${SECRETS_FILENAME} ${NEW_HOST_NAME}:~/${SECRETS_FILE_WRITER_NAME};

  SECCMD="chmod +x ${SECRETS_FILE_WRITER_NAME}; ./${SECRETS_FILE_WRITER_NAME};";
  ssh -t ${NEW_HOST_NAME} ${SECCMD};

  CDBCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${COUCHDB_SETUP_FILE};";
  ssh -t ${NEW_HOST_NAME} ${CDBCMD};
};



########
prepareNginx () {
  declare NGINX_SETUP_FILE="InstallNginx.sh";

  echo -e "Set up Nginx";
  NGXCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${NGINX_SETUP_FILE};";
  ssh -t ${NEW_HOST_NAME} ${NGXCMD};
};



########
prepareLetsEncrypt () {
  declare CERTS_SETUP_FILE="InstallCertificates.sh";

  echo -e "Set up LetsEncypt";
  CRTCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${CERTS_SETUP_FILE};";
  ssh -t ${NEW_HOST_NAME} ${CRTCMD};
};


export SIG_FILE=sig.p12;
export SIG_TARGZ="${SIG_FILE}.tar.gz";
export SIG_B64="${SIG_TARGZ}.b64";
unWrapSignature() {
  sed -i 's/ /\n/g' ${SIG_B64};
  cat ${SIG_B64} | base64 --decode > ${SIG_TARGZ};
  tar zxvf ${SIG_TARGZ};
};



# ########
# obtainSignature () {
#   export DLD_TYPE="signature";
#   export DLD_URL="${BITLY_LINK}";
#   # export DLD_URL="http://bit.ly/vue-offlinefirst-spa-pwa";

#   pushd ${XDG_RUNTIME_DIR} > /dev/null;
#     echo -e "
# export MODE=${MODE}
# export DLD_TYPE=${DLD_TYPE}
# export WEBTASK_SECRET=${WEBTASK_SECRET}
# export DLD_URL=${DLD_URL}
#     ";
#     curl -sH "Content-Type: application/json" -d '{"mode":"'"${MODE}"'","type":"'"${DLD_TYPE}"'","scrt":"'"${WEBTASK_SECRET}"'"}' --post301 -X POST -L ${DLD_URL};
#     # curl -sH "Content-Type: application/json" -d '{"mode":"'"${MODE}"'","type":"'"${DLD_TYPE}"'","scrt":"'"${WEBTASK_SECRET}"'"}' --post301 -X POST -L ${DLD_URL} > ${SIG_B64};
#     export isERROR=$(grep -c "Error" ${SIG_B64});
#     if [[ ${isERROR} -lt 1 ]]; then unWrapSignature; fi;
#     rm -f "${SIG_FILE}*";
#     # ls -la;
#   popd >/dev/null;
# };



########
obtainSignature () {
  declare SIGNATURE_RECOVERY="obtainP12Signature.sh";
  echo -e "Running ${SIGNATURE_RECOVERY}...";
  APPCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${SIGNATURE_RECOVERY};";
  ssh -t ${NEW_HOST_NAME} ${APPCMD};
};



########
prepareNodeApp () {
  declare NODE_APP_SETUP_FILE="InstallNodeApplication.sh";
  declare PARMS=./serverSideFiles/virtualHostsConfigParameters.json;
  declare SECRETS_FILE_PATH=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_PATH);
  declare SECRETS_FILE_NAME=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_NAME);
  declare SECRETS_FILE="${HOME}/${SECRETS_FILE_PATH}/${SECRETS_FILE_NAME}";

  # declare HDR="Content-Type: application/json";
  # declare HOST="${BITLY_LINK}";
  # # declare HOST="http://bit.ly/vue-offlinefirst-spa-pwa";

  # pushd ${XDG_RUNTIME_DIR} >/dev/null;
  #   pwd;
  #   echo -e "Download secret files from secure cloud locations";
  #   curl -sH "${HDR}" -d '{"mode":"PRD","type":"configuration","scrt":"'"${WEBTASK_SECRET}"'"}' --post301 -X POST -L ${HOST} > ${SECRETS_FILE_NAME};

  #   ssh -t ${NEW_HOST_NAME} "mkdir -p ${SECRETS_FILE_PATH}";
  #   scp ${SECRETS_FILE_NAME} ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};

  #   rm -f ${SECRETS_FILE_NAME};
  # popd >/dev/null;

  declare MATCH="SIGNING_CERTIFICATE";
  declare TMP=$(cat ${SECRETS_FILE} | grep -m 1 ${MATCH} | cut -d'"' -f 2);
  declare SIGNING_CERTIFICATE_FILE=$(eval "echo ${TMP}");


  # eval "echo ${TMP}";

  obtainSignature;
  # ls -la ${XDG_RUNTIME_DIR}/${SIGNING_CERTIFICATE_FILE};
  # scp ${XDG_RUNTIME_DIR}/${SIGNING_CERTIFICATE_FILE} ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};

  echo -e "Set up Node Application";
  APPCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${NODE_APP_SETUP_FILE};";

  ssh -t ${NEW_HOST_NAME} ${APPCMD};

};



########
prepareSecrets () {
  echo -e "\n\n\nStart prepareSecrets...";
  declare PARMS=./serverSideFiles/virtualHostsConfigParameters.json;

  declare SECRETS_FILE_PATH=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_PATH);
  declare SECRETS_FILE_NAME=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_NAME);
  declare SECRETS_FILE="${HOME}/${SECRETS_FILE_PATH}/${SECRETS_FILE_NAME}";

  declare HDR="Content-Type: application/json";
  declare HOST="${BITLY_LINK}";

  pushd ${XDG_RUNTIME_DIR} >/dev/null;
    pwd;
    echo -e "Download secret files from secure cloud locations";
    curl -sH "${HDR}" -d '{"mode":"PRD","type":"configuration","scrt":"'"${WEBTASK_SECRET}"'"}' --post301 -X POST -L ${HOST} > ${SECRETS_FILE_NAME};

    ssh -t ${NEW_HOST_NAME} "mkdir -p ${SECRETS_FILE_PATH}";
    scp ${SECRETS_FILE_NAME} ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};

    rm -f ${SECRETS_FILE_NAME};
  popd >/dev/null;


};



########
prepareClientSSH () {
  echo -e "\n\n\nStart prepareClientSSH...";
  ssh ${NEW_HOST_NAME} "./setupScripts/prepareClientSSH.sh;";

  declare PATCH_AUTHORIZED_KEYS="patch_authorized_keys.sh";
  declare SSH_ALIAS=$(cat ./serverSideFiles/virtualHostsConfigParameters.json | jq -r .NODEJS_APP.SSH_ALIAS);
  # echo ${SSH_ALIAS};
  declare TMP_KEYS_DIR=tmp_keys_dir;
  pushd ${XDG_RUNTIME_DIR} >/dev/null;
    # declare REMOTE_XDG_RUNTIME_DIR=$(ssh ${MASTER_HOST_USER}@${MASTER_NAME} "cd \${XDG_RUNTIME_DIR}; pwd;");
    echo -e "Copy ${NEW_HOST_NAME} public key to ${MASTER_HOST_USER}@${MASTER_NAME}:${HOME}";

    scp -3 ${NEW_HOST_NAME}:${HOME}/.ssh/${SSH_ALIAS}.pub ${MASTER_HOST_USER}@${MASTER_NAME}:${HOME};

    cat << EOFPAK > ${PATCH_AUTHORIZED_KEYS}
#!/usr/bin/env bash
#
declare KEYS_FILE="authorized_keys";
declare PUB_KEY=\$(cat ${SSH_ALIAS}.pub);
# PUB_KEY=\${PUB_KEY};";
pushd \${HOME}/.ssh >/dev/null;
  echo -e "Patching authorized_keys if needed";
  cat \${KEYS_FILE} | grep "\${PUB_KEY}" >/dev/null && echo -e "Key already added" || (echo "\${PUB_KEY}" >> \${KEYS_FILE}; echo -e "Added new key.";);
popd >/dev/null;
EOFPAK

    chmod +x ${PATCH_AUTHORIZED_KEYS};
    echo -e "Copy '${PATCH_AUTHORIZED_KEYS}' to '${MASTER_HOST_USER}@${MASTER_NAME}:${HOME}'";
    scp ${PATCH_AUTHORIZED_KEYS} ${MASTER_HOST_USER}@${MASTER_NAME}:${HOME};

    echo -e "Execute '${PATCH_AUTHORIZED_KEYS}' on remote host '${MASTER_NAME}'";
    # ssh ${MASTER_HOST_USER}@${MASTER_HOST} "pwd; ls -la;";
    ssh ${MASTER_HOST_USER}@${MASTER_NAME} "./${PATCH_AUTHORIZED_KEYS}; rm -f ./${PATCH_AUTHORIZED_KEYS}";

    scp ${NEW_HOST_NAME}:~/.ssh/config .;
    # cat config;
    sed "/# ^^^^ HostAlias ${MASTER_NAME} ^^^^/,/# vvvv HostAlias ${MASTER_NAME} vvvv/d" config > cfg.txt;
    sed -i '/^$/N;/^\n$/D' ./cfg.txt;

    cat << EOFSCP > ssh_config_patch.txt

# ^^^^ HostAlias ${MASTER_NAME} ^^^^
Host ${MASTER_NAME}
  HostName ${MASTER_NAME}
  User ${MASTER_HOST_USER}
  IdentityFile ~/.ssh/${SSH_ALIAS}

# vvvv HostAlias ${MASTER_NAME} vvvv
EOFSCP

    cat cfg.txt ssh_config_patch.txt > config;

    # echo -e "..............................";
    # cat config;
    # echo -e "..............................\n\n\n";

    scp config ${NEW_HOST_NAME}:~/.ssh;

  popd >/dev/null;

  echo -e "Done prepareClientSSH.";
  # echo -e "***************  CURTAILED **************";
  # exit;

};

function uriencode() {
  declare VAL="${1}";
  # declare VAL=$(echo -e "${1}" | sed "s/'/%27/g");
  jq -nr --arg v "${VAL}" '$v|@uri';
};



########
replicationBuilder () {
  echo -e "\n\n\nreplicationBuilder ...";

  declare NAME=$1;

  declare SOURCE_URL=$2;
  declare SOURCE_AUTH=$3;

  declare TARGET_URL=$4;
  declare TARGET_AUTH=$5;

  pushd ${XDG_RUNTIME_DIR} >/dev/null;

    cat > ${REPLICATOR} <<EOF
{
  "_id": "${NAME}",
  "user_ctx": {
    "name": "admin",
    "roles": [
      "_admin",
      "_reader",
      "_writer"
    ]
  },
  "source": {
    "url": "${SOURCE_URL}",
    "headers": {
      "Authorization": "Basic ${SOURCE_AUTH}"
    }
  },
  "target": {
    "url": "${TARGET_URL}",
    "headers": {
      "Authorization": "Basic ${TARGET_AUTH}"
    }
  },
  "create_target": true,
  "continuous": false,
  "owner": "admin"
}
EOF

  popd >/dev/null;

};



########
replicator () {
  declare FILE=${1};
  declare REMOTE_URI=${2};
  declare HEADER="Content-Type: application/json";
  echo -e "\n\n\nreplicator ... Delete First? ${DELETE_FIRST}";
  pushd ${XDG_RUNTIME_DIR} >/dev/null;
    chmod +x ${REPLICATOR};
    # ls -la ${REPLICATOR};
    # cat ${REPLICATOR};

    declare REV=$(curl -H "${HEADER}" ${REMOTE_URI} | jq -r ._rev);
    if [[ "X${REV}" != "Xnull" ]]; then
      echo -e "REV :: ${REV}";
      cp ${FILE} ${FILE}.tmp;
      jq "._rev = \"${REV}\"" ${FILE}.tmp > ${FILE}
      rm ${FILE}.tmp;
      # cat ${FILE} | jq -r .;
    fi;
    curl -X PUT -H "${HEADER}" -d @${FILE} ${REMOTE_URI};
  popd >/dev/null;

};



########
initializeCouchDB () {
  declare REPLICATOR="replicate.json";

  echo -e "\n\n\nStart initializeCouchDB ...";
  echo -e "${MASTER_HOST}";
  echo -e "${XDG_RUNTIME_DIR}";

  declare SOURCE_AUTH="$(echo -n ${MASTER_USER_CREDS} | base64)";
  declare TARGET_AUTH="$(echo -n ${SLAVE_USER_CREDS} | base64)";

  declare MASTER="http://localhost:5984"

  declare ARTEFACT="";
  declare NAME="";
  declare SOURCE_URL="";
  declare TARGET_URL="";

  ARTEFACT="${MASTER_COUCH_DB}";
  NAME="00_Push '${ARTEFACT}' to '${SLAVE_HOST}'";
  SOURCE_URL="${MASTER}/${ARTEFACT}";
  TARGET_URL="${SLAVE_URL}/${ARTEFACT}";
  replicationBuilder "${NAME}" "${SOURCE_URL}" "${SOURCE_AUTH}" "${TARGET_URL}" "${TARGET_AUTH}";
  replicator ${REPLICATOR} ${MASTER_CRED_URL}/_replicator/$(uriencode "${NAME}");

  ARTEFACT="_replicator";
  NAME="00_Push '${ARTEFACT}' to '${SLAVE_HOST}'";
  SOURCE_URL="${MASTER}/${ARTEFACT}";
  TARGET_URL="${SLAVE_URL}/${ARTEFACT}";
  replicationBuilder "${NAME}" "${SOURCE_URL}" "${SOURCE_AUTH}" "${TARGET_URL}" "${TARGET_AUTH}";
  replicator ${REPLICATOR} ${MASTER_CRED_URL}/_replicator/$(uriencode "${NAME}");

  ARTEFACT="_users";
  NAME="00_Push '${ARTEFACT}' to '${SLAVE_HOST}'";
  SOURCE_URL="${MASTER}/${ARTEFACT}";
  TARGET_URL="${SLAVE_URL}/${ARTEFACT}";
  replicationBuilder "${NAME}" "${SOURCE_URL}" "${SOURCE_AUTH}" "${TARGET_URL}" "${TARGET_AUTH}";
  replicator ${REPLICATOR} ${MASTER_CRED_URL}/_replicator/$(uriencode "${NAME}");

  ARTEFACT="ddocs_only";
  NAME="01_Push '${ARTEFACT}' to '${SLAVE_HOST}'";
  SOURCE_URL="${MASTER}/${ARTEFACT}";
  TARGET_URL="${SLAVE_URL}/${ARTEFACT}";
  replicationBuilder "${NAME}" "${SOURCE_URL}" "${SOURCE_AUTH}" "${TARGET_URL}" "${TARGET_AUTH}";
  replicator ${REPLICATOR} ${MASTER_CRED_URL}/_replicator/$(uriencode "${NAME}");

  echo -e "Finally -- updating 'locate' search database...";
  sudo -A updatedb;
  echo -e "Updated 'locate' search database.";

};



########
prepareErpNext () {
  echo -e "\n\n\nSet up ErpNext";
  patchSSHConfigFile ${PRD_ERPHOST_USR} ${PRD_ERPNEXT_HOST} ${PRD_ERPHOST_NAME} ${NEW_HOST_PWD};
  declare KEY_NAME=${PRD_ERPHOST_USR}_$(echo ${PRD_ERPNEXT_HOST} | tr . _);

  echo -e "Push '${KEY_NAME}.pub' to target '${PRD_NEW_HOST_NAME}:${HOME}/setupScripts'";
  scp ${HOME}/.ssh/${KEY_NAME}.pub ${PRD_NEW_HOST_NAME}:${HOME}/setupScripts;

  declare ERPNEXT_SETUP_FILE="InstallErpNext.sh";
  ERPCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${ERPNEXT_SETUP_FILE};";
  ssh -t ${NEW_HOST_NAME} ${ERPCMD};
};



########
qTst () {
  echo -e "Quick test...";
  pushd serverSideFiles/SecretsCollector >/dev/null;
    [ -e ./node_modules/axios/lib/axios.js ] || npm install;
    # export VUESPPWAKEY=$(node uploadSecret.js "${XDG_RUNTIME_DIR}/driveFiles" "vuesppwaKey");
    # echo "export VUESPPWAKEY=\"${VUESPPWAKEY}\"";
    # export VUESPPWAKEY_PUB=$(node uploadSecret.js "${XDG_RUNTIME_DIR}/driveFiles" "vuesppwaKey.pub");
    # echo "export VUESPPWAKEY_PUB=\"${VUESPPWAKEY_PUB}\"";
    export VUESPPWAKEY_PUB=$(node collectSecret.js "1m_6vKD1kaiFU1NhX1oNlnJ2GPjuq7ire" "vuesppwaKey.pub" ${XDG_RUNTIME_DIR});
    echo "export VUESPPWAKEY_PUB=\"${VUESPPWAKEY_PUB}\"";
  popd >/dev/null;

  echo -e "Done quick test.";
};



########  Installations
echo -e "Effecting unfulfilled APT requirement installations..."
dpkg -s sshpass &> /dev/null || sudo apt install sshpass;


source ${CONFIG_FILE}  || exit;
export ROOT_PASSWORD="${1:-${NEW_HOST_PWD}}";


################################################################################
######
######  It all starts here ......
######
################################################################################

export SERVER_IP=$(getent hosts ${NEW_HOST} | awk '{ print $1 }');
echo -e "Preparing server: '${NEW_HOST}'  (${SERVER_IP}).
    ****************************************
";

# # #qTst;
# # prepareHostForKeyBasedLogins;
# # importSecretFiles;
# # uploadServerSideFiles;
# # prepareAPT;
# # # prepareLetsEncrypt;
# # prepareNginx;
# # # # prepareCouchDB;
# # # # pushAndRunAskPassServiceMaker;
# prepareNodeApp;

#   source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;
#   prepareErpNext;
# echo -e "
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
# exit;

echo -e "Attempting to connect to host alias ${NEW_HOST_NAME} as admin user '${NEW_HOST_ADMIN}:${NEW_HOST}'.";
if ! ssh -oBatchMode=yes -t ${NEW_HOST_NAME} "pwd" &> /dev/null; then
  echo -e "Cannot log in yet. Preparing for key based logins";
  prepareHostForKeyBasedLogins;
fi;

if ssh -oBatchMode=yes -t ${NEW_HOST_NAME} "pwd" &> /dev/null; then
  echo -e "\n\nLogged in. Building server now";
  importSecretFiles;
  uploadServerSideFiles;
  prepareAPT;
  prepareUFW;
  prepareTimeZone;
  prepareNodeJS;
  protectSecrets;
  prepareCouchDB;
  prepareLetsEncrypt;
  prepareNginx;
  prepareSecrets;
  prepareClientSSH;
  prepareNodeApp;
  initializeCouchDB;
  prepareErpNext;
else
  echo -e "\n\nCannot log in yet. Installation failed.";
fi;

echo -e "";
echo -e "   DONE    ";
echo -e "";
echo -e "";
