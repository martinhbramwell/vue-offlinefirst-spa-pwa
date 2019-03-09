#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");


configureSSL()
{
  declare SSL_DFH_ID=$(cat ${PARMS} | jq -r .SSL_PARMS.SSL_DFH_ID);

  declare SSL_DFH_FILE_NAME="";
  pushd SecretsCollector >/dev/null;
    [ -e ./node_modules/axios/lib/axios.js ] || npm install;
    SSL_DFH_FILE_NAME=$(node collectSecret.js ${SSL_DFH_ID} "dhparams_4096.pem");
  popd >/dev/null;

  echo -e "SSL_DFH_FILE_NAME = ${SSL_DFH_FILE_NAME}";
  export SSLD_SERVER="/etc/ssl/private/";
  sudo -A cp ${XDG_RUNTIME_DIR}/${SSL_DFH_FILE_NAME} ${SSLD_SERVER};

}

defineVirtualHost ()
{
  echo "++++++++++++++  VHOST  +++++++++++++++";

  declare GDRIVE_FILE_ID=$(echo ${VHOSTS} | jq -r .[$1].GDRIVE_FILE_ID);
  declare SITES_ENABLED_SYMLINK_NAME=$(echo ${VHOSTS} | jq -r .[$1].SYMLINK_NAME);
  declare GDRIVE_FILE_NAME=$(echo ${VHOSTS} | jq -r .[$1].GDRIVE_FILE_NAME);

  echo -e "Processing VHost : '${SITES_ENABLED_SYMLINK_NAME}' from GSuite file : '${GDRIVE_FILE_ID}'";

  declare SITES_AVAILABLE_FILE_NAME="";
  pushd SecretsCollector >/dev/null;
    SITES_AVAILABLE_FILE_NAME=$(node collectSecret.js ${GDRIVE_FILE_ID} ${GDRIVE_FILE_NAME});
    # SITES_AVAILABLE_FILE_NAME="CouchDB_ReverseProxy_WITHCERT.sh"
  popd >/dev/null;

  export SITES_AVAILABLE_FILE=${HTTPD_SERVER}/${SITES_AVAILABLE_DIR}/${SITES_AVAILABLE_FILE_NAME%.sh};
  #   *** SITES_AVAILABLE_FILE is required in template ***
  export VHOST_NAME=$(echo ${VHOSTS} | jq -r .[$1].VHOST_NAME);
  #   *** VHOST_NAME is required in template ***

  # echo -e "export XDG_RUNTIME_DIR=\"${XDG_RUNTIME_DIR}\"";
  # echo -e "export SITES_AVAILABLE_FILE_NAME=\"${SITES_AVAILABLE_FILE_NAME}\"";
  # echo -e "export SITES_AVAILABLE_FILE=\"${SITES_AVAILABLE_FILE}\"";
  echo -e "External URL : \"${VHOST_NAME}\"";

  chmod +x ${XDG_RUNTIME_DIR}/${SITES_AVAILABLE_FILE_NAME};
  ${XDG_RUNTIME_DIR}/${SITES_AVAILABLE_FILE_NAME};

  pushd ${HTTPD_SERVER}/${SITES_ENABLED_DIR} >/dev/null;
    sudo -A rm -f ${SITES_ENABLED_SYMLINK_NAME}
    sudo -A ln -s ../${SITES_AVAILABLE_DIR}/${SITES_AVAILABLE_FILE_NAME%.sh} ${SITES_ENABLED_SYMLINK_NAME%.sh};
  popd >/dev/null;

  sudo -A mkdir -p "/var/log/nginx/${VHOST_NAME}";
  sudo -A touch "/var/log/nginx/${VHOST_NAME}/access.log";
  sudo -A touch "/var/log/nginx/${VHOST_NAME}/error.log";
  sudo -A chown nobody:root /var/log/nginx/${VHOST_NAME}/*.log;

}

installNginx()
{

  echo -e "${SCRIPT_DIR}";
  echo -e "${SCRIPT_NAME}";

  export NVM_DIR="$HOME/.nvm";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


  pushd ${SCRIPT_DIR} >/dev/null;
    declare PARMS="virtualHostsConfigParameters.json";

    export HTTPD_SERVER="/etc/nginx";

    export SITES_AVAILABLE_DIR="sites-available";
    export SITES_ENABLED_DIR="sites-enabled";

    # Configure SSL
    configureSSL;

    # Configure Virtual Hosts
    declare VHOSTS=$(cat ${PARMS} | jq -r .VHOSTS);
    for (( IX=0; IX<$(echo ${VHOSTS} | jq '. | length'); IX++ ))
    # for (( IX=0; IX<2; IX++ ))
    do
      defineVirtualHost $IX;
    done

  popd >/dev/null;

  sudo -A service nginx stop;
  sudo -A service nginx start;

  echo "### Nginx installed ";
  echo -e "";

}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  installNginx;
fi;
