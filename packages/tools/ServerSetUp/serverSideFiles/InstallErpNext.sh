#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${SCRIPT_DIR}/utils.sh;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

prepareDependencies () {
  echo -e "\nInstalling :: System Dependencies ...";
  ${HOME}/aptFix.sh;

  X="python3-setuptools"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python3-minimal"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  # X="python3-virtualenv"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="build-essential"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="redis-server"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="inotify-tools"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="tree"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
};

createErpNextUser () {
  echo -e "Ready to create new user '${PRD_ERPHOST_USR}'.";
  if ! id -u ${PRD_ERPHOST_USR} &>/dev/null; then
    echo -e "Creating new user '${PRD_ERPHOST_USR}'.";
    sudo -A adduser --disabled-password --gecos "${PRD_ERPHOST_USR_NAME}" ${PRD_ERPHOST_USR};
    echo -e "${PRD_ERPHOST_PWD}\n${PRD_ERPHOST_PWD}" | sudo -A passwd -q ${PRD_ERPHOST_USR};
    sudo -A usermod -aG sudo ${PRD_ERPHOST_USR};
  else
    echo -e "User '${PRD_ERPHOST_USR}' exists already.";
  fi;

  # ls -la ${HOME}/setupScripts;
  declare KEY_NAME=${PRD_ERPHOST_USR}_$(echo ${PRD_ERPNEXT_HOST} | tr . _);
  echo -e "Finalizing SSH for '${KEY_NAME}'.";
  sudo -A mkdir -p /home/${PRD_ERPHOST_USR}/.ssh;
  sudo -A cp ${HOME}/setupScripts/${KEY_NAME}.pub /home/${PRD_ERPHOST_USR}/.ssh/authorized_keys;
  sudo -A chown -R ${PRD_ERPHOST_USR}:${PRD_ERPHOST_USR} /home/${PRD_ERPHOST_USR}/.ssh;
  sudo -A chmod 700 /home/${PRD_ERPHOST_USR}/.ssh;
  sudo -A chmod 640 /home/${PRD_ERPHOST_USR}/.ssh/authorized_keys;

};

installErpNext () {
  echo -e "\nInstalling :: ErpNext ...";

  declare ERP_DIR="/home/${PRD_ERPHOST_USR}";
  declare SERVICE_DIR="${ERP_DIR}/services";
  declare CONFIG_DIR="${ERP_DIR}/.bench/bench/config";

  sudo -Au ${PRD_ERPHOST_USR} mkdir -p ${SERVICE_DIR};
  pushd ${SERVICE_DIR} >/dev/null;

    echo -e "Obtaining 'install.py' (${HOME})...";

    sudo -Au ${PRD_ERPHOST_USR} wget -nc https://raw.githubusercontent.com/frappe/bench/master/playbooks/install.py;
    echo -e "Production install:
        --site ${PRD_ERPNEXT_SITE}
        --user ${PRD_ERPHOST_USR}
        --mysql-root-password ***********
        --admin-password **********
        --bench-name ${NEWBENCH}

     ...";
    sudo -AH python3 install.py --production \
        --site ${PRD_ERPNEXT_SITE} \
        --user ${PRD_ERPHOST_USR} \
        --mysql-root-password ${PRD_ERPHOST_PWD} \
        --admin-password ${PRD_ERPHOST_PWD} \
        --bench-name ${NEWBENCH}

    # sudo -A ufw allow 80
  #   cd ${NEWBENCH}

  #   bench update
  #   # bench start

  popd >/dev/null;
};

patchErpNext () {
  echo -e "\nPatching :: ErpNext NGinx 'unicode' bug...";

  declare CONFIG_DIR="${ERP_DIR}/.bench/bench/config";

  pushd ${CONFIG_DIR}/ >/dev/null;     # Got to bench config directory
    sudo -Au ${PRD_ERPHOST_USR} cp nginx.py nginx_BACKUP.py;                      # Back up your config file

    # Set variables
    declare PATTERN="isinstance(domain, unicode)";
    declare REPLACEMENT="\t\t\t\tif isinstance(domain, str) or isinstance(domain, bytes):";

    sudo -Au ${PRD_ERPHOST_USR} sed -i "/${PATTERN}/c\\${REPLACEMENT}" nginx.py;  # Do the replacement
    # diff nginx_BACKUP.py nginx.py;
  popd;
};

configureErpNextSSL () {
  echo -e "\nConfiguring :: ErpNext Secure Sockets Layer...";

  declare BENCH_DIR="${ERP_DIR}/${NEWBENCH}";

  declare NGINX="/etc/nginx";
  declare CNF="nginx.conf";
  declare SITES_ENABLED="${NGINX}/sites-enabled";

  pushd ${BENCH_DIR} >/dev/null;
    if grep -ic ssl_ciphers ./config/nginx.conf >/dev/null; then
      echo -e "ErpNext SSL has already been installed...";
    else
      echo -e "Protecting old config file... $(date +"%Y%m%d_%H%M")";
      pushd config >/dev/null;
        # pwd;
        sudo -Au ${PRD_ERPHOST_USR} mv ${CNF} ${CNF}_bk$(date +"%Y%m%d_%H%M");
        # ls -la;
      popd >/dev/null;

      echo -e "Turning on multitenant...";
      sudo -Au ${PRD_ERPHOST_USR} bench config dns_multitenant on;
      echo -e "Adding our domain: '${PRD_ERPNEXT_HOST}' ...";
      sudo -Au ${PRD_ERPHOST_USR} bench setup add-domain --site ${PRD_ERPNEXT_SITE} ${PRD_ERPNEXT_HOST};
      echo -e "Mapping our domain: '${PRD_ERPNEXT_HOST}' to virtual host '${PRD_ERPNEXT_SITE}' ...";
      sudo -A -H bench setup lets-encrypt  --custom-domain ${PRD_ERPNEXT_HOST} --non-interactive ${PRD_ERPNEXT_SITE};
      echo -e "Enable scheduler...";
      sudo -Au ${PRD_ERPHOST_USR} bench --site ${PRD_ERPNEXT_SITE} enable-scheduler;

      pushd config >/dev/null;
        echo -e "Patching '${CNF}'";
        sudo -Au ${PRD_ERPHOST_USR} sed -i '/ssl_dhparam/d' ${CNF};
        sudo -Au ${PRD_ERPHOST_USR} sed -i '/Strict-Transport-Security/d' ${CNF};
        declare PATTERN="ssl_protocols";
        declare REPLACEMENT="        ssl_protocols TLSv1.2 TLSv1.3;\n        ssl_dhparam /etc/ssl/private/dhparams_4096.pem;";
        sudo -Au ${PRD_ERPHOST_USR} sed -i "/${PATTERN}/c\\${REPLACEMENT}" ${CNF};
        # cat ${CNF} | grep -B 5 -A 5 ssl_protocols;

        declare PATTERN="X-Frame-Options";
        declare REPLACEMENT='        add_header X-Frame-Options "SAMEORIGIN";\n        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";';
        sudo -Au ${PRD_ERPHOST_USR} sed -i "/${PATTERN}/c\\${REPLACEMENT}" ${CNF};
        # cat ${CNF} | grep -B 5 -A 5 X-Frame-Options;
      popd >/dev/null;
    fi;
  popd >/dev/null;

  pushd ${NGINX} >/dev/null;
    if grep enabled ${CNF} >/dev/null; then
      echo "${CNF} has already been patched";
    else
      sudo -A cp ${CNF} ${CNF}_bk$(date +"%Y%m%d_%H%M");

      cat << EOFNG > /tmp/${CNF}_patch
--- nginx.conf_bk20191122_1039  2019-11-22 10:39:03.765168975 -0500
+++ nginx.conf  2019-11-22 11:08:23.253779028 -0500
@@ -73,4 +73,5 @@
     proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=web-cache:8m max_size=1000m inactive=600m;

     include /etc/nginx/conf.d/*.conf;
+    include /etc/nginx/sites-enabled/*;
 }
EOFNG
      echo -e "Enabling wanted sites...";
      sudo -A patch ${CNF} /tmp/${CNF}_patch;
    fi;

  popd >/dev/null;

  echo -e "Disabling unwanted sites...";
  sudo -A rm -f ${SITES_ENABLED}/default;
  sudo -A rm -f ${SITES_ENABLED}/ErpNext;

  sudo -A service nginx restart;
  sudo -A service nginx status;

};

restoreSiteBackup () {

  export FILEDIR="${XDG_RUNTIME_DIR}";

  echo -e "\nConfiguring :: Restoring initial database and files... ";

  declare FILE_TIMESTAMP="";
  declare LATEST=$(curl --silent "https://docs.google.com/spreadsheets/d/19fkZoWrbeGlNyRbf5Mku2fELh4dy0e4VxL8-KoXmNpI/export?format=csv");
  declare FILEID=$(echo ${LATEST} | cut -d "," -f 1);
  declare FILENAME=$(echo ${LATEST} | cut -d "," -f 2);

  declare SITE_ID=${PRD_ERPNEXT_SITE%.local};

  echo -e "For site '${SITE_ID}':  ${FILENAME} has ID ${FILEID}";

  pushd ${SCRIPT_DIR}/SecretsCollector >/dev/null;
    test -f "node_modules/axios/package.json" || npm install;
    node collectSecret "${FILEID}" "${FILENAME}" "${FILEDIR}";
    echo -e "";
  popd >/dev/null;

  declare BKUP_DIR="${PRD_ERPNEXT_SITE}/private/backups";
  declare HLDR="latest_backup";
  declare DBSFX="-database.sql.gz";
  declare PUSFX="-files.tar";
  declare PRSFX="-private-files.tar";
  pushd ${FILEDIR} >/dev/null;
    base64 -d ${FILENAME} > ${HLDR}.tar.gz
    mkdir -p ${HLDR};
    pushd ${HLDR} >/dev/null;
      tar zxvf ../${HLDR}.tar.gz >/dev/null;

      declare BK=( ./*.sql.gz );
      # echo -e "BK :: ${BK}";
      declare TL=${BK#"./"};
      # echo -e "TL :: ${TL}";
      FILE_TIMESTAMP=${TL%-${SITE_ID}${DBSFX}};

      sudo -A chown ${PRD_ERPHOST_USR}:${PRD_ERPHOST_USR} *.*;
      sudo -A mv *.* /home/${PRD_ERPHOST_USR}/frappe-bench/sites/${BKUP_DIR};
    popd >/dev/null;
    # tree;

    echo -e "The file unique identifier is : ${FILE_TIMESTAMP}";

  popd >/dev/null;


  pushd /home/${PRD_ERPHOST_USR}/frappe-bench  >/dev/null;
    # sudo -Au ${PRD_ERPHOST_USR} pwd;
    declare BK_DB="${BKUP_DIR}/${FILE_TIMESTAMP}-${SITE_ID}${DBSFX}";
    declare BK_PU="${BKUP_DIR}/${FILE_TIMESTAMP}-${SITE_ID}${PUSFX}";
    declare BK_PR="${BKUP_DIR}/${FILE_TIMESTAMP}-${SITE_ID}${PRSFX}";
    ls -la ./sites/${BK_DB};
    ls -la ./sites/${BK_PU};
    ls -la ./sites/${BK_PR};

    sudo -Au ${PRD_ERPHOST_USR} bench \
        --site ${PRD_ERPNEXT_SITE} \
        --force restore ${BK_DB} \
        --with-private-files ${BK_PR} \
        --with-public-files ${BK_PU} \
        --mariadb-root-password ${PRD_ERPHOST_PWD};
  popd >/dev/null;
    # cat ${FILEDIR}/${FILENAME} | jq -r .;

};


export ERP_DIR="/home/${PRD_ERPHOST_USR}";
export NEWBENCH="frappe-bench";

prepareDependencies;
createErpNextUser;

installErpNext;

patchErpNext;
configureErpNextSSL;

restoreSiteBackup;

if [[ 0 -eq 1 ]]; then

  su ${NEWUSER}


fi;

echo -e "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
