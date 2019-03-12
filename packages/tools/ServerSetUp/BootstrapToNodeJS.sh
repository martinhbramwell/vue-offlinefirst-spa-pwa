#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");
export ROOT_PASSWORD=${1};

# export CONFIG_FILE="${HOME}/.ssh/secrets/local.config";
export CONFIG_FILE="${HOME}/.ssh/secrets/offsppwa-vue.config";
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
pushNewUserPublicKey () {
  echo "Pushing public key for user : '${NEW_HOST_ADMIN}'.";
  sshpass -p ${NEW_HOST_PWD} ssh -t ${NEW_HOST_ADMIN}@${NEW_HOST} "pwd";
  patchSSHConfigFile;
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
  export PTRN="# Alias configuration for '${NEW_HOST_ADMIN}@${NEW_HOST}'";
  export PTRNB="${PTRN} «begins»";
  export PTRNE="${PTRN} «ends»";

  export SSHCFG_FILE="${SSHPTH}/config";
  touch ${SSHCFG_FILE};
  sed -i "/${PTRNB}/,/${PTRNE}/d" ${SSHCFG_FILE};

  echo -e "${PTRNB}
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
  sshpass -p ${NEW_HOST_PWD} ssh-copy-id -i ${SSHPTH}/${KEY_NAME} ${NEW_HOST_NAME};

}



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
  echo -e "\nApparently user '${NEW_HOST_ADMIN}' does not yet exist. Creating...";
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
uploadServerSideFiles () {
  echo -e "Create server side script files home '${HOME}/${DIR_SETUP_FILES}'";
  ssh -t ${NEW_HOST_NAME} "mkdir -p \${HOME}/${DIR_SETUP_FILES}";
  echo -e "Upload server side files ...
  from : '${SCRIPT_DIR}/${DIR_FILES_FOR_UPLOAD}/*'
  to   : '~/${DIR_SETUP_FILES}'";
  rsync -a ${SCRIPT_DIR}/${DIR_FILES_FOR_UPLOAD}/* ${NEW_HOST_NAME}:~/${DIR_SETUP_FILES};
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



########
prepareNodeApp () {
  declare NODE_APP_SETUP_FILE="InstallNodeApplication.sh";
  declare PARMS=./serverSideFiles/virtualHostsConfigParameters.json;

  declare SECRETS_FILE_PATH=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_PATH);
  declare SECRETS_FILE_NAME=$(cat ${PARMS} | jq -r .NODEJS_APP.SECRETS_FILE_NAME);
  declare SECRETS_FILE="${HOME}/${SECRETS_FILE_PATH}/${SECRETS_FILE_NAME}";

  declare MATCH="SIGNING_CERTIFICATE";
  declare TMP=$(cat ${SECRETS_FILE} | grep -m 1 ${MATCH} | cut -d'"' -f 2);
  declare SIGNING_CERTIFICATE_FILE=$(eval "echo ${TMP}");
  # eval "echo ${TMP}";

  echo -e "Signing certificate file : ${SIGNING_CERTIFICATE_FILE}";
  echo -e "Push secrets file '${SECRETS_FILE_NAME}' to target '${NEW_HOST_NAME}:${SECRETS_FILE_PATH}'";
  ssh -t ${NEW_HOST_NAME} "mkdir -p ${SECRETS_FILE_PATH}";
  scp ${SECRETS_FILE} ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};
  scp ${HOME}/${SECRETS_FILE_PATH}/local.config ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};
  scp ${SIGNING_CERTIFICATE_FILE} ${NEW_HOST_NAME}:~/${SECRETS_FILE_PATH};

  echo -e "Set up Node Application";
  APPCMD="${GET_ASK_PASS_FUNC} \${HOME}/${DIR_SETUP_FILES}/${NODE_APP_SETUP_FILE};";
  ssh -t ${NEW_HOST_NAME} ${APPCMD};

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
    export VUESPPWAKEY_PUB=$(node collectSecret.js "1m_6vKD1kaiFU1NhX1oNlnJ2GPjuq7ire" "vuesppwaKey.pub");
    echo "export VUESPPWAKEY_PUB=\"${VUESPPWAKEY_PUB}\"";
  popd >/dev/null;

  echo -e "Done quick test.";
};



########  Installations
echo -e "Effecting unfulfilled APT requirement installations..."
dpkg -s sshpass &> /dev/null || sudo apt install sshpass;


source ${CONFIG_FILE};


################################################################################
######  It all starts here ......

export SERVER_IP=$(getent hosts ${NEW_HOST} | awk '{ print $1 }');
echo -e "Preparing server: '${NEW_HOST}'  (${SERVER_IP}).
    ****************************************
";

# #qTst;
# uploadServerSideFiles;
# # prepareNginx;
# # prepareLetsEncrypt;
# prepareNodeApp;
# # # prepareCouchDB;
# # # pushAndRunAskPassServiceMaker;
# echo -e "
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
# exit;


updateLocalKnownHostsFile;

echo -e "Attempting to connect as admin user '${NEW_HOST_ADMIN}'.";
if ssh -oBatchMode=yes -tl ${NEW_HOST_ADMIN} ${NEW_HOST} "pwd" &> /dev/null; then
  uploadServerSideFiles;
  prepareAPT;
  prepareUFW;
  prepareNodeJS;
  prepareCouchDB;
  prepareLetsEncrypt;
  prepareNginx;
  prepareNodeApp;
else
  prepareHostForKeyBasedLogins;
fi;


echo -e "       ";
echo -e "
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
echo -e "";
echo -e "";
