#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

# export CONFIG_FILE="${HOME}/.ssh/secrets/local.config";
export CONFIG_FILE="${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config";
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
  declare SSHPTH="/home/${USER}/.ssh";
  declare KEY_NAME=${NEW_HOST_ADMIN}_$(echo ${NEW_HOST} | tr . _);

  echo -e "Check for public key '${KEY_NAME}.pub'";
  if ls -la ${SSHPTH} | grep -v grep | grep "${KEY_NAME}.pub" &> /dev/null; then
    echo "Found it.";
  else
    echo "Not found.  Generating new key for '${KEY_NAME}'";
    ssh-keygen -b 4096 -C ${NEW_HOST_ADMIN}@$(hostname) -t rsa -N "" -f ${SSHPTH}/${KEY_NAME};
  fi;

  echo "Patching SSH config file with alias for '${NEW_HOST_ADMIN}@${NEW_HOST}'";
  export PTRN="# Alias configuration: '${NEW_HOST_NAME}'";
  export PTRNB="${PTRN} «begins»";
  export PTRNE="${PTRN} «ends»";

  export SSHCFG_FILE="${SSHPTH}/config";
  touch ${SSHCFG_FILE};
  sed -i "/${PTRNB}/,/${PTRNE}/d" ${SSHCFG_FILE};

  echo -e "${PTRNB}
# Alias '${NEW_HOST_NAME}'' binds to remote user '${NEW_HOST_ADMIN}@${NEW_HOST}'.'
Host ${NEW_HOST_NAME}
  User ${NEW_HOST_ADMIN}
  HostName ${NEW_HOST}
  IdentityFile ${SSHPTH}/${KEY_NAME}
${PTRNE}
" >> ${SSHCFG_FILE}
  #
  sed -i "s/ *$//" ${SSHCFG_FILE}; # trim whitespace to EOL
  sed -i "/^$/N;/^\n$/D" ${SSHCFG_FILE}; # blank lines to 1 line

  echo "Pushing SSH public key to account '${NEW_HOST_ADMIN}@${NEW_HOST}'";
  # echo "sshpass -p ${NEW_HOST_PWD} ssh-copy-id -f -i ${SSHPTH}/${KEY_NAME} ${NEW_HOST_ADMIN}@${NEW_HOST}";
  sshpass -p ${NEW_HOST_PWD} ssh-copy-id -f -i ${SSHPTH}/${KEY_NAME} ${NEW_HOST_ADMIN}@${NEW_HOST};

}


########
pushNewUserPublicKey () {
  echo "Pushing public key for user : '${NEW_HOST_ADMIN}@${NEW_HOST}'.";
  sshpass -p ${NEW_HOST_PWD} ssh -t ${NEW_HOST_ADMIN}@${NEW_HOST} "pwd";
  echo "!";
  patchSSHConfigFile;
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
prepareTimeZone () {
  sudo timedatectl set-timezone America/Guayaquil
  declare TZ_SETUP_FILE="SetUpTZ.sh";

  echo -e "Set up Time Zone"
  TZCMD="${GET_ASK_PASS_FUNC} source \${HOME}/${DIR_SETUP_FILES}/${TZ_SETUP_FILE}; prepareTZ;";
  ssh -t ${NEW_HOST_NAME} ${TZCMD};
};



########
prepareAPT () {
  echo -e "Refresh APT"
  declare APTCMD="${GET_ASK_PASS_FUNC}";
  APTCMD="${APTCMD} source \${HOME}/${DIR_SETUP_FILES}/${APT_UPDATE_FILE};";
  # APTCMD="${APTCMD} pushd ${DIR_SETUP_FILES};";
  APTCMD="${APTCMD} lazyUpdate;";
  APTCMD="${APTCMD} aptInstallIfNotInstalled;";
  # APTCMD="${APTCMD} popd;";
  ssh -t ${NEW_HOST_NAME} ${APTCMD};
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

########
downLoadSignature () {
  export DLD_TYPE="signature";
  export DLD_URL="${BITLY_LINK}";
  # export DLD_URL="http://bit.ly/vue-offlinefirst-spa-pwa";

  pushd ${XDG_RUNTIME_DIR} > /dev/null;
    curl -sH "Content-Type: application/json" -d '{"mode":"'"${MODE}"'","type":"'"${DLD_TYPE}"'","scrt":"'"${WEBTASK_SECRET}"'"}' --post301 -X POST -L ${DLD_URL} > ${SIG_B64};
    export isERROR=$(grep -c "Error" ${SIG_B64});
    if [[ ${isERROR} -lt 1 ]]; then unWrapSignature; fi;
    rm -f "${SIG_FILE}*";
    # ls -la;
  popd >/dev/null;
};



########
prepareNodeApp () {
  declare NODE_APP_SETUP_FILE="InstallNodeApplication.sh";
  declare PARMS=./serverSideFiles/virtualHostsConfigParameters.json;

  declare SECRETS_FILE_PATH=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_PATH);
  declare SECRETS_FILE_NAME=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_NAME);
  declare SECRETS_FILE="${HOME}/${SECRETS_FILE_PATH}/${SECRETS_FILE_NAME}";

  declare HDR="Content-Type: application/json";
  declare HOST="${BITLY_LINK}";
  # declare HOST="http://bit.ly/vue-offlinefirst-spa-pwa";

  pushd ${XDG_RUNTIME_DIR} >/dev/null;
    pwd;
    echo -e "Download secret files from secure cloud locations";
    curl -sH "${HDR}" -d '{"mode":"PRD","type":"configuration","scrt":"'"${WEBTASK_SECRET}"'"}' --post301 -X POST -L ${HOST} > ${SECRETS_FILE_NAME};

    ssh -t ${NEW_HOST_NAME} "mkdir -p ${SECRETS_FILE_PATH}";
    scp ${SECRETS_FILE_NAME} ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};

    rm -f ${SECRETS_FILE_NAME};
  popd >/dev/null;

  declare MATCH="SIGNING_CERTIFICATE";
  declare TMP=$(cat ${SECRETS_FILE} | grep -m 1 ${MATCH} | cut -d'"' -f 2);
  declare SIGNING_CERTIFICATE_FILE=$(eval "echo ${TMP}");
  # eval "echo ${TMP}";

  downLoadSignature;
  ls -la ${XDG_RUNTIME_DIR}/${SIGNING_CERTIFICATE_FILE};
  scp ${XDG_RUNTIME_DIR}/${SIGNING_CERTIFICATE_FILE} ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};

  echo -e "Set up Node Application";
  APPCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${NODE_APP_SETUP_FILE};";
  ssh -t ${NEW_HOST_NAME} ${APPCMD};

};



########
prepareMasterDbAccess () {
  echo -e "\n\n\nStart prepareMasterDbAccess...";

  declare SSH_ALIAS=$(cat ./serverSideFiles/virtualHostsConfigParameters.json | jq -r .NODEJS_APP.SSH_ALIAS);
  # echo ${SSH_ALIAS};
  declare TMP_KEYS_DIR=tmp_keys_dir;
  pushd ${XDG_RUNTIME_DIR} >/dev/null;
    declare REMOTE_XDG_RUNTIME_DIR=$(ssh ${MASTER_HOST_USER}@${MASTER_HOST} "cd \${XDG_RUNTIME_DIR}; pwd;");
    echo -e "Copy ${NEW_HOST_NAME} public key to ${MASTER_HOST_USER}@${MASTER_HOST}:${REMOTE_XDG_RUNTIME_DIR}";

    scp -3 ${NEW_HOST_NAME}:${HOME}/.ssh/${SSH_ALIAS}.pub ${MASTER_HOST_USER}@${MASTER_HOST}:${REMOTE_XDG_RUNTIME_DIR};

    cat << EOFPAK > patch_authorized_keys.sh
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

    chmod +x patch_authorized_keys.sh;
    scp patch_authorized_keys.sh ${MASTER_HOST_USER}@${MASTER_HOST}:${REMOTE_XDG_RUNTIME_DIR};
    ssh ${MASTER_HOST_USER}@${MASTER_HOST} "cd ${REMOTE_XDG_RUNTIME_DIR}; ./patch_authorized_keys.sh";

    scp ${NEW_HOST_NAME}:~/.ssh/config .;

    # cat config;
    sed "/# ^^^^ HostAlias ${MASTER_HOST} ^^^^/,/# vvvv HostAlias ${MASTER_HOST} vvvv/d" config > cfg.txt;
    sed -i '/^$/N;/^\n$/D' ./cfg.txt;

    cat << EOFSCP > ssh_config_patch.txt

# ^^^^ HostAlias ${MASTER_HOST} ^^^^
Host ${MASTER_HOST}
  HostName ${MASTER_HOST}
  User ${MASTER_HOST_USER}
  IdentityFile ~/.ssh/${SSH_ALIAS}

# vvvv HostAlias ${MASTER_HOST} vvvv
EOFSCP

    cat cfg.txt ssh_config_patch.txt > config;

    # echo -e "..............................";
    # cat config;
    # echo -e "..............................\n\n\n";

    scp config ${NEW_HOST_NAME}:~/.ssh;

  popd >/dev/null;

  echo -e "Done prepareMasterDbAccess.";
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
# echo -e "
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
# exit;

echo -e "Attempting to connect to host alias ${NEW_HOST_NAME} as admin user '${NEW_HOST_ADMIN}:${NEW_HOST}'.";
if ssh -oBatchMode=yes -t ${NEW_HOST_NAME} "pwd" &> /dev/null; then
  echo -e "Logged in. Building server now";
  importSecretFiles;
  uploadServerSideFiles;
  prepareAPT;
  prepareUFW;
  prepareNodeJS;
  prepareCouchDB;
  prepareMasterDbAccess;
  prepareLetsEncrypt;
  prepareNginx;
  # prepareNodeApp;
else
  echo -e "Cannot log in yet. Preparing for key based logins";
  prepareHostForKeyBasedLogins;
fi;


echo -e "";
echo -e "   DONE    ";
echo -e "
                                    time zone  ????
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
echo -e "";
echo -e "";
