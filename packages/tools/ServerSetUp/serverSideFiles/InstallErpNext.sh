#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${SCRIPT_DIR}/utils.sh;
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
};

# prepareServerSideScripts () { funcTitle ${FUNCNAME[0]};
#   pushd ${SCRIPT_DIR} > /dev/null;
#     pwd;
#     cp aptFix.sh ..;
#   popd > /dev/null;
# };

# prepareDependencies () {

#   echo -e "\nInstalling :: System Dependencies ...";

#   ${HOME}/aptFix.sh;

#   X="python3-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="python3-setuptools"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="python3-pip"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

#   alias python=python3;
#   alias pip=pip3;

#   X="software-properties-common"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="python3-minimal"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="build-essential"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="inotify-tools"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="redis-server"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="expect"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#   X="tree"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
# };

# createErpNextUser () { funcTitle ${FUNCNAME[0]};
#   echo -e "Ready to create new user '${PRD_ERPHOST_USR}'.";
#   if ! id -u ${PRD_ERPHOST_USR} &>/dev/null; then
#     echo -e "Creating new user '${PRD_ERPHOST_USR}'.";
#     sudo -A adduser --disabled-password --gecos "${PRD_ERPHOST_USR_NAME}" ${PRD_ERPHOST_USR};
#     echo -e "${PRD_ERPHOST_PWD}\n${PRD_ERPHOST_PWD}" | sudo -A passwd -q ${PRD_ERPHOST_USR};
#     sudo -A usermod -aG sudo ${PRD_ERPHOST_USR};
#   else
#     echo -e "User '${PRD_ERPHOST_USR}' exists already.";
#   fi;

#   # ls -la ${HOME}/setupScripts;
#   declare KEY_NAME=${PRD_ERPHOST_USR}_$(echo ${PRD_ERPNEXT_HOST} | tr . _);
#   echo -e "Finalizing SSH for '${KEY_NAME}'.";
#   sudo -A mkdir -p /home/${PRD_ERPHOST_USR}/.ssh;
#   sudo -A cp ${HOME}/setupScripts/${KEY_NAME}.pub /home/${PRD_ERPHOST_USR}/.ssh/authorized_keys;
#   sudo -A chown -R ${PRD_ERPHOST_USR}:${PRD_ERPHOST_USR} /home/${PRD_ERPHOST_USR}/.ssh;
#   sudo -A chmod 700 /home/${PRD_ERPHOST_USR}/.ssh;
#   sudo -A chmod 640 /home/${PRD_ERPHOST_USR}/.ssh/authorized_keys;

# };

# prepareMariaDB () { funcTitle ${FUNCNAME[0]};

#   export MYSQL_INSTALLED=$(mysql -u root -p${PRD_ERPHOST_PWD} -e "show databases;" -h localhost | grep myql);
#   if [[ "${MYSQL_INSTALLED}" == "mysql" ]]; then
#     echo -e "\bMariadb is already running.\b";
#   else
#     echo -e "MariaDB not found.  Installing ...";
#     declare MARIADB="mariadb-server-10.3";
#     declare Q_PWD="mysql-server/root_password";
#     declare Q_PWD2="mysql-server/root_password_again";
#     X="software-properties-common"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#     sudo -A apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
#     sudo -A add-apt-repository 'deb [arch=amd64,i386,ppc64el] http://ftp.ubuntu-tw.org/mirror/mariadb/repo/10.3/ubuntu xenial main'
#     sudo -A apt-get update

#     sudo -A debconf-set-selections <<< "${MARIADB} ${Q_PWD} password ${PRD_ERPHOST_PWD}";
#     sudo -A debconf-set-selections <<< "${MARIADB} ${Q_PWD2} password ${PRD_ERPHOST_PWD}";

#     X=${MARIADB}; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
#     X="libmysqlclient-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

#     echo UNREGISTER ${Q_PWD} | sudo -A debconf-communicate ${MARIADB};
#     echo UNREGISTER ${Q_PWD2} | sudo -A debconf-communicate ${MARIADB};

#     if [[ $(cat /etc/mysql/my.cnf | grep -c utf8mb4) -lt 3 ]]; then
#       echo -e "Patching my.cnf ...";
#       declare PATCH="${SCRIPT_DIR}/my.cnf.patch";
#       sudo -A patch -N -i ${PATCH} /etc/mysql/my.cnf;
#     fi;
#     echo -e "my.cnf has been patched ...";

#     echo -e "Restarting MariaDB...";
#     sudo -A service mysql restart;
#     echo -e "Restarted MariaDB.";


#   fi;
#   echo -e "MariaDB is available.";
# };


# prepareRedis () { funcTitle ${FUNCNAME[0]};
#   X=redis-server; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
# };


# prepareNode () { funcTitle ${FUNCNAME[0]};
#   X=nodejs;
#   if aptNotYetInstalled "${X}"; then
#     curl -AsL https://deb.nodesource.com/setup_10.x | sudo -E bash -;
#     sudo -A apt-get -y install "${X}";
#   else
#     say ${X};
#   fi;
#   echo -e "Installing 'yarn' with 'npm'...";
#   sudo -A npm install -g yarn;
# };


installFrappe () { funcTitle ${FUNCNAME[0]};
  echo -e "\nInstalling :: Frappe ...";

  echo -e "\nChecking 'bench' version:";
  bench --version;

  echo -e "\nInitializing new 'bench': $(pwd)/${FRAPPE_BENCH}...";
  bench init --frappe-branch version-12 --python /usr/bin/python3 ${HOME}/${FRAPPE_BENCH};

  pushd ${HOME}/${FRAPPE_BENCH} > /dev/null;
    echo -e "\nInstalling 'frappe' with 'pip'...";
    ./env/bin/pip3 install -e apps/frappe;
    ./env/bin/pip3 install werkzeug==0.16.0;
    # echo -e "\nLaunching new bench in background process...";
    # bench start &;
    # echo -e "\nCreating Frappe site ...";

  popd > /dev/null;
};


installErpNext () { funcTitle ${FUNCNAME[0]};
  echo -e "\nInstalling :: ErpNext ...";

  mkdir -p ${BENCH_HOME};

  pushd ${HOME}/${FRAPPE_BENCH} > /dev/null;

    echo -e "*********** check ****************";
    ls -la ./apps/

    echo -e "\nNew ErpNext site '${PRD_ERPNEXT_SITE}'  ...";
    bench new-site --mariadb-root-password=${PRD_ERPHOST_PWD} --admin-password=${PRD_ERPHOST_PWD} --verbose ${PRD_ERPNEXT_SITE};
    # tree -augp -L 2 ./sites;
    echo -e "*********** check ****************";
    ls -la ./apps/

    # echo -e "\nPrepare multitenant  ...";
    # bench config dns_multitenant on;

    echo -e "\nObtain ErpNext V12  ...";
    bench get-app --branch version-12 erpnext;

    echo -e "\nInstall ErpNext V12 installer ...";
    ./env/bin/pip3 install -e apps/erpnext;

    echo -e "\nInstall ErpNext V12 app ...";
    bench --site erpn3.iridium.blue install-app erpnext;


    echo -e "\nProduction mode ...";
    sudo -AH bench setup production erpnext --yes;

    echo -e "\nDo sudoers ...";
    sudo -AH bench setup sudoers erpnext;

    echo -e "\nRestart bench ...";
    bench restart;


  popd > /dev/null;
}

installErpNext_BK () {
  echo -e "\nInstalling :: ErpNext ...";

  declare ERP_DIR="${HOME}";
  declare SERVICE_DIR="${HOME}/services";
  declare CONFIG_DIR="${BENCH_HOME}/bench/config";

  sudo -Au ${PRD_ERPHOST_USR} mkdir -p ${SERVICE_DIR};
  pushd ${SERVICE_DIR} >/dev/null;

    echo -e "Obtaining 'install.py' (${HOME})...";
    sudo -Au ${PRD_ERPHOST_USR} wget -nc https://raw.githubusercontent.com/frappe/bench/master/playbooks/install.py;

    echo -e "Setting 'LC_ALL' for ERPNext installer...";
    export LC_ALL=C.UTF-8

    echo -e "Starting '--production' install:
      --user ${PRD_ERPHOST_USR}
      --without-site
      --without-erpnext
      --mysql-root-password ***********
      --bench-name ${FRAPPE_BENCH}
      --admin-password **********
...";
# unused...

    sudo -AH python3 install.py --production \
      --user ${PRD_ERPHOST_USR} \
      --without-site \
      --without-erpnext \
      --mysql-root-password ${PRD_ERPHOST_PWD} \
      --admin-password ${PRD_ERPHOST_PWD} \
      --verbose \
      --bench-name ${FRAPPE_BENCH}

#     echo -e "Starting '--production' install:
#    --site ${PRD_ERPNEXT_SITE}
#    --user ${PRD_ERPHOST_USR}
#    --mysql-root-password ***********
#    --bench-name ${FRAPPE_BENCH}
#    --admin-password **********
# ...";
# # unused...

#     sudo -AH python3 install.py --production \
#       --site ${PRD_ERPNEXT_SITE} \
#       --user ${PRD_ERPHOST_USR} \
#       --mysql-root-password ${PRD_ERPHOST_PWD} \
#       --admin-password ${PRD_ERPHOST_PWD} \
#       --verbose \
#       --bench-name ${FRAPPE_BENCH}

   # --admin-password ${PRD_ERPHOST_PWD} \
    echo -e "\nERPNext installation terminated";
    # sudo -A ufw allow 80
  #   cd ${FRAPPE_BENCH}

  #   bench update
  #   # bench start

  popd >/dev/null;
};

openFirewallForEmail () { funcTitle ${FUNCNAME[0]};
  sudo -A ufw allow out 993;
  sudo -A ufw allow out 587;
};

patchPipWerkzeug () { funcTitle ${FUNCNAME[0]};

  pushd ${XDG_RUNTIME_DIR}  > /dev/null;
    echo -e "pushd /home/erpnext/frappe-bench > /dev/null;
  ./env/bin/pip install werkzeug==0.16.0;
  echo -e 'python version is ...';
  python --version;
  echo -e '.................';
popd > /dev/null;
" > fixWerkzeug.sh;

    chmod +x fixWerkzeug.sh;
    sudo -A chown erpnext:erpnext fixWerkzeug.sh;
    sudo -A mv fixWerkzeug.sh /home/erpnext;

    sudo -A -i -u erpnext -- ./fixWerkzeug.sh;
  popd > /dev/null;

};



# patchErpNext_NGinx () { # NO LONGER REQUIRED
#   echo -e "\nPatching :: ErpNext NGinx 'unicode' bug...";

#   declare CONFIG_DIR="${ERP_DIR}/.bench/bench/config";
#   echo -e "${CONFIG_DIR}";

#   pushd ${CONFIG_DIR}/ >/dev/null;     # Got to bench config directory
#     sudo -Au ${PRD_ERPHOST_USR} cp nginx.py nginx_BACKUP.py;                      # Back up your config file

#     # Set variables
#     declare PATTERN="isinstance(domain, unicode)";
#     declare REPLACEMENT="\t\t\t\tif isinstance(domain, str) or isinstance(domain, bytes):";

#     sudo -Au ${PRD_ERPHOST_USR} sed -i "/${PATTERN}/c\\${REPLACEMENT}" nginx.py;  # Do the replacement
#     # diff nginx_BACKUP.py nginx.py;
#   popd;
# };

installLetsEncryptDependencies () { funcTitle ${FUNCNAME[0]};

  X="libaugeas0"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="libssl-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="virtualenv"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="augeas-lenses"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python-virtualenv"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python3-virtualenv"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
};

configureErpNextSSL () {

  declare ERPNEXT_LETSENCRYPT_ARCHIVE="LetsEncrypt_erpnext.tar.gz";
  declare SECRETS_FILE_PATH=".ssh/secrets";
  declare SECRETS_FILE_DIR="${HOME}/${SECRETS_FILE_PATH}";

  echo -e "\nConfiguring :: ErpNext Secure Sockets Layer...";

  declare WAS_PATCHED=$(cat ${BENCH_HOME}/bench/config/lets_encrypt.py | grep -c "if interactive:");
  if [[ ${WAS_PATCHED} -eq 1 ]]; then
    echo -e "\nNo need to patch 'lets_encrypt.py'";
  else
    echo -e "\nPatching 'lets_encrypt.py' at '${BENCH_HOME}/bench/config/lets_encrypt.py'.";
    ${SCRIPT_DIR}/patchLetsEncryptPyBug.sh ${BENCH_HOME};
  fi;
# pwd;
# echo ${SCRIPT_DIR}
# ls -la ${SCRIPT_DIR}
  if [[ -f "${SCRIPT_DIR}/${ERPNEXT_LETSENCRYPT_ARCHIVE}" ]]; then
    echo -e "Found ${ERPNEXT_LETSENCRYPT_ARCHIVE}";
    pushd / > /dev/null;
      pwd;
      echo -e "Restoring '${ERPNEXT_LETSENCRYPT_ARCHIVE}' archive to '/etc/letsencrypt ...";
      sudo -A tar zxvf ${SCRIPT_DIR}/${ERPNEXT_LETSENCRYPT_ARCHIVE} >/dev/null;
    popd > /dev/null;
  else
    echo -e "'${ERPNEXT_LETSENCRYPT_ARCHIVE}' not found ";
  fi

  declare BENCH_DIR="${ERP_DIR}/${FRAPPE_BENCH}";

  declare NGINX="/etc/nginx";
  declare CNF="nginx.conf";
  declare SITES_ENABLED="${NGINX}/sites-enabled";

  pushd ${BENCH_DIR} >/dev/null;
    declare NGINX_CONFIGURED=$(cat config/nginx.conf | grep -c "upstream frappe-bench");
    if [[ ${NGINX_CONFIGURED} -lt 1 ]]; then
      echo -e "Configuring Frappe Bench NGinx.";
      bench setup nginx --yes;
    else
      echo -e "Frappe Bench NGinx has already been configured.";
    fi;

    echo -e "Turning on multitenant...";
    # sudo -Au ${PRD_ERPHOST_USR} bench config dns_multitenant on;
    bench config dns_multitenant on;

    sudo -A bench setup lets-encrypt --non-interactive ${PRD_ERPNEXT_SITE};


  echo -e "
  ~~~~~~~~~~~~~~~~~~~~~~~  configureErpNextSSL CURTAILED  ~~~~~~~~~~~~~~~~~~~~~~~~~~";
  exit;
    if grep -ic ssl_ciphers ./config/nginx.conf >/dev/null; then
      echo -e "'frappe-bench/config/nginx.conf' has already been patched";
    else
      echo -e "Protecting old config file... $(date +"%Y%m%d_%H%M")";
      pushd config >/dev/null;
       # pwd;
       sudo -Au ${PRD_ERPHOST_USR} cp ${CNF} ${CNF}_bk$(date +"%Y%m%d_%H%M");
       sudo -Au ${PRD_ERPHOST_USR} rm -fr ${CNF};
       # ls -la;
      popd >/dev/null;
      echo -e "\n\nAdding our domain: '${PRD_ERPNEXT_HOST}' ...";
      sudo -Au ${PRD_ERPHOST_USR} bench setup add-domain --site ${PRD_ERPNEXT_SITE} ${PRD_ERPNEXT_HOST};
      echo -e "\n\nSetting SSL certs for our domain: '${PRD_ERPNEXT_HOST}' on virtual host '${PRD_ERPNEXT_SITE}' ...";
#       cat << SLEEOF > /dev/shm/setupLetsEncrypt.sh
# #!/usr/bin/env bash
# #
# set +e;
# # echo -e "sudo -A -H bench setup lets-encrypt --custom-domain ${PRD_ERPNEXT_HOST} --non-interactive ${PRD_ERPNEXT_SITE};"
# echo -e "Running 'bench setup lets-encrypt'";
# sudo -A -H bench setup lets-encrypt --custom-domain ${PRD_ERPNEXT_HOST} --non-interactive ${PRD_ERPNEXT_SITE};
# echo -e "Completed 'bench setup lets-encrypt'";
# SLEEOF
#       chmod +x /dev/shm/setupLetsEncrypt.sh;
#       expect -c "
#         spawn /dev/shm/setupLetsEncrypt.sh
#         expect \"want to continue\" {
#           send \"y\r\"
#           exp_continue
#         }
#       ";

#  REQUIRED SECTION 2020/02/06

      # sudo -A -H bench setup lets-encrypt ${PRD_ERPNEXT_SITE};
      # ls -la config;
      # ls -la /etc/nginx;

      sudo -A -H bench setup lets-encrypt --non-interactive ${PRD_ERPNEXT_SITE};
      # echo -e "Mapping our domain: '${PRD_ERPNEXT_HOST}' to virtual host '${PRD_ERPNEXT_SITE}' ...";
      # sudo -A -H bench setup lets-encrypt --custom-domain ${PRD_ERPNEXT_HOST} --non-interactive ${PRD_ERPNEXT_SITE};
      echo -e "\n\nEnable scheduler...";
      sudo -Au ${PRD_ERPHOST_USR} bench --site ${PRD_ERPNEXT_SITE} enable-scheduler;

      pushd config >/dev/null;
        echo -e "Patching '${CNF}'";
        sudo -Au ${PRD_ERPHOST_USR} sed -i '/ssl_dhparam/d' ${CNF};
        sudo -Au ${PRD_ERPHOST_USR} sed -i '/Strict-Transport-Security/d' ${CNF};
        # sudo -Au ${PRD_ERPHOST_USR} sed -i '40,${/Strict-Transport-Security/d;}' ${CNF};
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
--- nginx.conf  2020-02-11 15:17:13.320000000 -0500
+++ nginx.conf_NEW  2020-02-11 15:24:02.580000000 -0500
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

export BENCH_HOME="${HOME}/.bench";
export ERP_DIR="${HOME}";
export FRAPPE_BENCH="frappe-bench";

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "\n~~~~~ Installing ErpNext  ~~~~~~\n\n";

  if [[ 1 -eq 1 ]]; then

    installFrappe;

    installErpNext;

    # # installLetsEncryptDependencies;
    configureErpNextSSL;

    openFirewallForEmail;

    # echo -e "
    # ~~~~~~~~~~~~~~~~~~~~~~~  CURTAILED ErpNext Installation  ~~~~~~~~~~~~~~~~~~~~~~~~~~";
    # exit;

  else
    echo -e "
    ~~~~~~~~~~~~~~~~~~~~~~~  ErpNext Installation CURTAILED  ~~~~~~~~~~~~~~~~~~~~~~~~~~";
    exit;
  fi;

  # # restoreSiteBackup;

  echo -e "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
fi;
