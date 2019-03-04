#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

installNginx()
{

  echo -e "${SCRIPT_DIR}";
  echo -e "${SCRIPT_NAME}";

  export NVM_DIR="$HOME/.nvm";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


  pushd ${SCRIPT_DIR} >/dev/null;
    source virtualHostsConfigParameters.sh;
    pushd SecretsCollector >/dev/null;
      [ -e ./node_modules/axios/lib/axios.js ] || npm install;
      # echo -e "SSL_DFH_ID = ${SSL_DFH_ID}";
      declare SSL_DFH_FILE_NAME=$(node collectSecret.js ${SSL_DFH_ID});

      declare COUCHDB_RP_NGINX_VP_FILE_NAME=$(node collectSecret.js ${COUCHDB_RP_GDRIVE_FILE_ID});
      declare NODEJS_RP_NGINX_VP_FILE_NAME=$(node collectSecret.js ${NODEJS_RP_GDRIVE_FILE_ID});

      # export COUCHDB_RP_NGINX_VP_FILE_NAME="CouchDB_ReverseProxy_WITHCERT";
      # export NODEJS_RP_NGINX_VP_FILE_NAME="NodeJS_ReverseProxy_WITHCERT";
    popd >/dev/null;

    echo -e "SSL_DFH_FILE_NAME = ${SSL_DFH_FILE_NAME}";
    export SSLD_SERVER="/etc/ssl/private/";
    sudo -A cp ${XDG_RUNTIME_DIR}/${SSL_DFH_FILE_NAME} ${SSLD_SERVER};


    echo -e "COUCHDB_RP_NGINX_VP_FILE_NAME = ${COUCHDB_RP_NGINX_VP_FILE_NAME}";
    echo -e "NODEJS_RP_NGINX_VP_FILE_NAME = ${NODEJS_RP_NGINX_VP_FILE_NAME}";

    # cat ${XDG_RUNTIME_DIR}/${NODEJS_RP_NGINX_VP_FILE_NAME};

    export HTTPD_SERVER="/etc/nginx";

    export SITES_AVAILABLE_DIR="sites-available";
    export SITES_ENABLED_DIR="sites-enabled";

    export SITES_AVAILABLE_FILE_NAME=${COUCHDB_RP_NGINX_VP_FILE_NAME};
    export SITES_AVAILABLE_FILE=${HTTPD_SERVER}/${SITES_AVAILABLE_DIR}/${SITES_AVAILABLE_FILE_NAME};

    export SITES_ENABLED_SYMLINK_NAME=${COUCHDB_SYMLINK_NAME};

    chmod +x ${XDG_RUNTIME_DIR}/${SITES_AVAILABLE_FILE_NAME};
    ${XDG_RUNTIME_DIR}/${SITES_AVAILABLE_FILE_NAME};

    pushd ${HTTPD_SERVER}/${SITES_ENABLED_DIR} >/dev/null;
      sudo -A rm -f ${SITES_ENABLED_SYMLINK_NAME}
      sudo -A ln -s ../${SITES_AVAILABLE_DIR}/${SITES_AVAILABLE_FILE_NAME} ${SITES_ENABLED_SYMLINK_NAME};
    popd >/dev/null;

    sudo -A mkdir -p "/var/log/nginx/${COUCHDB_RP_VHOST_NAME}";
    sudo -A touch "/var/log/nginx/${COUCHDB_RP_VHOST_NAME}/access.log";
    sudo -A touch "/var/log/nginx/${COUCHDB_RP_VHOST_NAME}/error.log";
    sudo -A chown nobody:root /var/log/nginx/${COUCHDB_RP_VHOST_NAME}/*.log;

  popd >/dev/null;

  sudo -A service nginx stop;
  sudo -A service nginx start;

  echo "### Nginx installed ";
  echo -e "";

}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  installNginx;
fi;
