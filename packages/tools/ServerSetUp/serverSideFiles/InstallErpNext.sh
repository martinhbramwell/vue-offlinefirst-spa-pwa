#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

# export NVM_DIR="$HOME/.nvm";
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

source ./utils.sh;

prepareErpNextUser () {
  cat /etc/passwd | grep ${ERPNEXT_USR} >/dev/null \
    && echo -e "User '${ERPNEXT_USR}' already exists" \
    || sudo -A useradd -m -s /bin/bash ${ERPNEXT_USR};
  echo -e "Setting password for user '${ERPNEXT_USR}'";
  echo "${ERPNEXT_USR}:${ERPNEXT_PWD}" | sudo -A chpasswd;
  echo -e "Setting sudo privileges for user '${ERPNEXT_USR}'";
  sudo -A usermod -aG sudo ${ERPNEXT_USR};

  pushd /home/${ERPNEXT_USR} >/dev/null;
    declare PATHFIX="PATH=\$PATH:~/.local/bin/";
    cat .bashrc | grep ${PATHFIX} >/dev/null \
      && echo -e "The '.bashrc' file was already patched" \
      || echo -e "\n\n${PATHFIX}" | sudo -A tee -a .bashrc;
  popd >/dev/null;
};

prepareSystemDependencies () {
  echo -e "\nInstalling :: System Dependencies ...";
  X="libffi-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="wkhtmltopdf"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="libssl-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python-dev"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="python-pip"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  # X="chalk"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="gcc"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="g++"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="make"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="redis-server"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

  X="mariadb-server"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;
  X="libmariadbclient18"; if aptNotYetInstalled "${X}"; then sudo -A apt-get -y install "${X}"; else say ${X}; fi;

};

prepareNodeJsDependencies () {
  export NVM_DIR="$HOME/.nvm";
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

  npm --version;
  npm install -g chalk;
  npm install -g yarn;
};

preparePythonDependencies () {
  echo -e "\nPreparing :: Python stuff ...";
};

prepareMariaDb () {
  declare READY=$(mysql --defaults-extra-file=${MARIA_CLIENT_CONF} -sN --execute="SELECT 2+2;" 2>/dev/null;);

  if [[ ${READY} -eq 4 ]]; then
    echo -e "\n\nMariaDb is ready already.";
  else
    echo -e "\n\nPreparing :: MariaDb";

    echo -e "Reconfiguring MariaDb";
    declare MARIA_SRVR_CONF="50-server.cnf";
    declare MARIA_SRVR_CONF_DIR="/etc/mysql/mariadb.conf.d";
    sudo -A mkdir -p ${MARIA_SRVR_CONF_DIR};
    sudo -A cp ${MARIA_SRVR_CONF} ${MARIA_SRVR_CONF_DIR};

    sudo -A systemctl restart mariadb;
    sudo -A systemctl enable mariadb;


    echo -e "Securing MariaDb";
    export MYSQL_PWD="${ERPNEXT_DB_PWD}";

    cat << EOF > /dev/shm/mysql_secure_installation.sql
UPDATE mysql.user SET Password=PASSWORD('${ERPNEXT_DB_PWD}') WHERE User='root';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
DROP FUNCTION IF EXISTS ed25519_password;
CREATE FUNCTION ed25519_password RETURNS STRING SONAME "auth_ed25519.so";
EOF
    echo -e " pwd :: ${MYSQL_PWD}";
    sudo -A mysql -u root -p${MYSQL_PWD} < /dev/shm/mysql_secure_installation.sql;


    echo -e "Correcting MariaDb Root Password";
    declare PWD_HASH=$(sudo -A mysql -sN -u root -p${MYSQL_PWD} --execute="SELECT ed25519_password('${ERPNEXT_DB_PWD}');");
    echo -e " Hash :: ${PWD_HASH}";

    sudo -A mysql -sN -u root -p${MYSQL_PWD} \
      --execute="update mysql.user set Password = '', plugin = 'ed25519', authentication_string = '${PWD_HASH}' where User = 'root' and Host = 'localhost'";
    sudo -A mysql -sN -u root -p${MYSQL_PWD} --execute="flush privileges";

    sudo -A mysql -u root -p${MYSQL_PWD} --execute="SELECT Host, User, Password, plugin, authentication_string from mysql.user;";
    cat << CNFEOF > ${MARIA_CLIENT_CONF}
[client]
user=root
password=${ERPNEXT_DB_PWD}
CNFEOF

  cat ${MARIA_CLIENT_CONF}
  echo -e "MARIA_CLIENT_CONF :: ${MARIA_CLIENT_CONF}";

  fi;
};


installBench () {
  echo -e "Installing :: Bench ...";
  pushd ${HOME}/services >/dev/null;
    [ -d "bench-repo" ] || git clone https://github.com/frappe/bench bench-repo;
    pip install --user -e bench-repo;

    export PY_USER_BIN=$(python -c 'import site; print(site.USER_BASE + "/bin")');
    export PATH=$PY_USER_BIN:$PATH;

    # export NVM_DIR="$HOME/.nvm";
    # [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    # [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion



    # [ -d "frappe-bench" ] || bench init frappe-bench;
    # pushd frappe-bench >/dev/null;
    #   bench new-site site1.local;
    #   bench get-app erpnext https://github.com/frappe/erpnext;
    # popd >/dev/null;

  popd >/dev/null;
};

installFrappeBench () {
  echo -e "Preparing :: Frappe Bench ...";

  prepareErpNextUser;
  prepareSystemDependencies;
  preparePythonDependencies;
  prepareNodeJsDependencies;
  prepareMariaDb;

  # installBench;


  echo -e "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
};

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  export ERPNEXT_USR=erpnext;
  export ERPNEXT_PWD=plokplok.0.0.0;
  export ERPNEXT_DB_PWD=plokplok.0.0.0;
  export MARIA_CLIENT_CONF="${HOME}/.ssh/secrets/mariadb.cnf";
  installFrappeBench;
fi;
