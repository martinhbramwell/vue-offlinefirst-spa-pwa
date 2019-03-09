#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");
export SSH_DIR="${HOME}/.ssh";

configureGit ()
{
  declare SSH_KEY=$(echo ${NODEJS_APP} | jq -r .SSH_KEY);
  declare SSH_KEY_PUB=$(echo ${NODEJS_APP} | jq -r .SSH_KEY_PUB);
  declare SSH_ALIAS=$(echo ${NODEJS_APP} | jq -r .SSH_ALIAS);

  declare SSH_KEY_FILE_NAME="";
  declare SSH_KEY_PUB_FILE_NAME="";
  pushd SecretsCollector >/dev/null;
    [ -e ./node_modules/axios/lib/axios.js ] || npm install;
    echo -e "Get private key.";
    SSH_KEY_FILE_NAME=$(node collectSecret.js ${SSH_KEY} ${SSH_ALIAS});
    echo -e "Get public key.";
    SSH_KEY_PUB_FILE_NAME=$(node collectSecret.js ${SSH_KEY_PUB} ${SSH_ALIAS}.pub);
  popd >/dev/null;

  echo -e "SSH_KEY_FILE_NAME = ${SSH_KEY_FILE_NAME}";
  echo -e "SSH_KEY_PUB_FILE_NAME = ${SSH_KEY_PUB_FILE_NAME}";

  mkdir -p ${SSH_DIR} 2>/dev/null;

  mv ${XDG_RUNTIME_DIR}/${SSH_KEY_FILE_NAME} ${SSH_DIR};
  mv ${XDG_RUNTIME_DIR}/${SSH_KEY_PUB_FILE_NAME} ${SSH_DIR};
  chmod go-rwx ${SSH_DIR}/${SSH_KEY_FILE_NAME};
  chmod go-wx ${SSH_DIR}/${SSH_KEY_PUB_FILE_NAME};

  export CONF="${SSH_DIR}/config";
  if [[ 1 > $(cat ${CONF} | grep -c "# Default GitHub") ]]; then
  cat << EOD > ${CONF}
# Default GitHub
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa
EOD
  fi;

  export START_ALIAS="# ^^^^ HostAlias ${SSH_ALIAS} ^^^^";
  export END_ALIAS="# vvvv HostAlias ${SSH_ALIAS} vvvv";
  sed -i "/${START_ALIAS}/,/${END_ALIAS}/d" ${SSH_DIR}/config
  echo -e "
${START_ALIAS}
Host ${SSH_ALIAS}.github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/${SSH_ALIAS}

${END_ALIAS}
" >> ${CONF}

  declare GIT_USER_EMAIL=$(cat ${PARMS} | jq -r .SSL_PARMS.CERTIFICATE_OWNER_EMAIL);
  declare GIT_USER_NAME=$(echo ${NODEJS_APP} | jq -r .GIT_USER_NAME);

  git config --global user.email ${GIT_USER_EMAIL};
  git config --global user.name ${GIT_USER_NAME};

}


configureCronJob ()
{
  echo -e "*/5 * * * * /home/meta/vue-offlinefirst-spa-pwa/packages/lambdaSrv/watchdog.sh > /dev/null";
}


installNodeApplication ()
{
  echo -e "Installing Node app...";

  export NVM_DIR="$HOME/.nvm";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


  declare KNOWN_HOSTS="${SSH_DIR}/known_hosts";
  mkdir -p  ${SSH_DIR} 2>/dev/null;
  touch ${KNOWN_HOSTS};
  if ! grep "$(ssh-keyscan github.com 2>/dev/null)" ${KNOWN_HOSTS} > /dev/null; then
      ssh-keyscan github.com >> ${KNOWN_HOSTS};
  fi

  pushd ${SCRIPT_DIR} >/dev/null;
    declare PARMS="virtualHostsConfigParameters.json";
    export NODEJS_APP=$(cat ${PARMS} | jq -r .NODEJS_APP);
    echo "export NODEJS_APP=\"${NODEJS_APP}\"";

    configureGit;

    declare CLONING_URL=$(echo ${NODEJS_APP} | jq -r .CLONING_URL);
    declare FOLDER_NAME=$(echo ${NODEJS_APP} | jq -r .FOLDER_NAME);
    declare PRODUCTION_BRANCH=$(echo ${NODEJS_APP} | jq -r .PRODUCTION_BRANCH);

    mkdir -p ${HOME}/services;
    pushd ${HOME}/services >/dev/null;
      if [ ! -d "${FOLDER_NAME}" ] ; then
        echo -e "Cloning project...";
        git clone ${CLONING_URL} ${FOLDER_NAME};
      else
        pushd "${FOLDER_NAME}" >/dev/null;
          git pull ${CLONING_URL};
        popd >/dev/null;
      fi
      pushd "${FOLDER_NAME}" >/dev/null;
        echo -e "Switching to production branch...";
        git checkout ${PRODUCTION_BRANCH};
      popd >/dev/null;

    popd >/dev/null;

  popd >/dev/null;

  declare INITIAL_DATABASE_ZIP=$(echo ${NODEJS_APP} | jq -r .INITIAL_DATABASE_ZIP);
  declare INITIAL_DATABASE_ZIP_FILE_NAME=$(echo ${NODEJS_APP} | jq -r .INITIAL_DATABASE_ZIP_FILE_NAME);
  pushd ${SCRIPT_DIR}/SecretsCollector >/dev/null;
    echo -e "Get database initializations files...";
    INITIAL_DATABASE_ZIP_FILE_NAME=$(node collectSecret.js ${INITIAL_DATABASE_ZIP} "${INITIAL_DATABASE_ZIP_FILE_NAME}");
  popd >/dev/null;

  declare TEMP_DIR=${HOME}/temp;
  mkdir -p ${TEMP_DIR};

  pushd ${TEMP_DIR} >/dev/null;
    mv ${XDG_RUNTIME_DIR}/${INITIAL_DATABASE_ZIP_FILE_NAME} .;
    base64 -d ${INITIAL_DATABASE_ZIP_FILE_NAME} | tar -zxv;
  popd >/dev/null;


  echo -e "Installed Node app.";
}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  installNodeApplication;
fi;
