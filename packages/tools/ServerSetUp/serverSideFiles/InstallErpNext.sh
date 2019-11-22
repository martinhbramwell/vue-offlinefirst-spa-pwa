#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${SCRIPT_DIR}/utils.sh;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

prepareDependencies () {
  echo -e "\nInstalling :: System Dependencies ...";
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

export ERP_DIR="/home/${PRD_ERPHOST_USR}";
export NEWBENCH="frappe-bench";

prepareDependencies;
createErpNextUser;

installErpNext;

patchErpNext;
configureErpNextSSL;

if [[ 0 -eq 1 ]]; then

  su ${NEWUSER}


fi;

echo -e "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
