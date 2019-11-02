#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

export SSH_DIR="${HOME}/.ssh";
export SECRETS_FILE_PATH=".ssh/secrets";
export SECRETS_FILE_DIR="${HOME}/${SECRETS_FILE_PATH}";
declare PARMS="${SECRETS_FILE_DIR}/virtualHostsConfigParameters.json";

configureGit ()
{
  pushd ${SCRIPT_DIR} >/dev/null;
    export NODEJS_APP=$(cat ${PARMS} | jq -r .NODEJS_APP);

    declare SSH_KEY=$(echo ${NODEJS_APP} | jq -r .SSH_KEY);
    declare SSH_KEY_PUB=$(echo ${NODEJS_APP} | jq -r .SSH_KEY_PUB);
    declare SSH_ALIAS=$(echo ${NODEJS_APP} | jq -r .SSH_ALIAS);

    declare SSH_KEY_FILE_NAME="";
    declare SSH_KEY_PUB_FILE_NAME="";
    pushd SecretsCollector >/dev/null;
      [ -e ./node_modules/axios/lib/axios.js ] || npm install;
      echo -e "Get private key.  | node collectSecret.js ${SSH_KEY} ${SSH_ALIAS} ${XDG_RUNTIME_DIR} |";
      SSH_KEY_FILE_NAME=$(node collectSecret.js ${SSH_KEY} ${SSH_ALIAS} ${XDG_RUNTIME_DIR});
      echo -e "Get public key.";
      SSH_KEY_PUB_FILE_NAME=$(node collectSecret.js ${SSH_KEY_PUB} ${SSH_ALIAS}.pub ${XDG_RUNTIME_DIR});
    popd >/dev/null;


    echo -e "SSH_KEY_FILE_NAME = ${SSH_KEY_FILE_NAME}";
    echo -e "SSH_KEY_PUB_FILE_NAME = ${SSH_KEY_PUB_FILE_NAME}";


    mkdir -p ${SSH_DIR} 2>/dev/null;

    mv ${XDG_RUNTIME_DIR}/${SSH_KEY_FILE_NAME} ${SSH_DIR};
    mv ${XDG_RUNTIME_DIR}/${SSH_KEY_PUB_FILE_NAME} ${SSH_DIR};
    chmod go-rwx ${SSH_DIR}/${SSH_KEY_FILE_NAME};
    chmod go-wx ${SSH_DIR}/${SSH_KEY_PUB_FILE_NAME};
    export CONF="${SSH_DIR}/config";
    touch ${CONF};
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

    declare KNOWN_HOSTS="${SSH_DIR}/known_hosts";
    mkdir -p  ${SSH_DIR} 2>/dev/null;
    touch ${KNOWN_HOSTS};
    if ! grep "$(ssh-keyscan github.com 2>/dev/null)" ${KNOWN_HOSTS} > /dev/null; then
        ssh-keyscan github.com >> ${KNOWN_HOSTS};
    fi
  pushd ${SCRIPT_DIR} >/dev/null;

}



if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "\n+ ~~~~~~ prepareClientSSH.sh ~~~~~~ +";
  source ${SECRETS_FILE_DIR}/vue-offlinefirst-spa-pwa.config;

  export NVM_DIR="$HOME/.nvm";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh";  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion";  # This loads nvm bash_completion

  configureGit;
    # echo -e "+~~~~~~ ${CONF} ~~~~~~+";
    # ls -la
    # pwd
    # exit;
fi;
