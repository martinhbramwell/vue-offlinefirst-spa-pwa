#!/usr/bin/env bash
#
if [ $(id -u) = 0 ]; then
   echo -e "These scripts must not be run as root!";
   exit 1;
fi;

source ./ErpNextQikInstall_0.sh;

read -n1 -r -p "Press <q>  to quit, any other to proceed..." key

if [ "$key" = 'q' ]; then
  echo -e "Quitting";
  exit;
elif [ "$key" = 's' ]; then
  echo -e "Not Skipping";
# ####################################################################################################

# ####################################################################################################
  exit;
else
  # echo -e "\n\nSynchronizing clock";
  # date;
  # sudo -A ntpdate pool.ntp.org;
  # date;

# ####################################################################################################

  echo -e "\nConfiguring firewall\n\n";
  sudo -A ufw default deny incoming;
  sudo -A ufw allow ssh;
  sudo -A ufw allow http;
  sudo -A ufw allow https;
  sudo -A ufw allow 8000;
  sudo -A ufw allow 9000;
  sudo -A ufw allow 11000;
  sudo -A ufw allow imap;
  sudo -A ufw allow smtp;
  sudo -A ufw allow ntp;

  sudo -A ufw disable;

  echo -e "\nInstalling clock synchronizer";
  sudo -A apt install -y ntpdate;
  echo -e "\n\nSynchronizing clock";
  date;
  sudo -A ntpdate pool.ntp.org;
  date;

  echo -e "\n\nPatch SSH config";
  sudo -A sed -i '/ChallengeResponseAuthentication/c\ChallengeResponseAuthentication no' /etc/ssh/sshd_config; 
  sudo -A sed -i '/PasswordAuthentication/c\PasswordAuthentication no' /etc/ssh/sshd_config; 
  sudo -A sed -i '/UsePAM/c\UsePAM no' /etc/ssh/sshd_config; 
  sudo -A sed -i '/PermitRootLogin/c\PermitRootLogin no' /etc/ssh/sshd_config; 

  echo -e "Apt preparation";
  sudo -A apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8;
  sudo -A add-apt-repository "deb [arch=amd64,arm64,ppc64el] http://mariadb.mirror.liquidtelecom.com/repo/10.4/ubuntu $(lsb_release -cs) main"

  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo -A apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo -A tee /etc/apt/sources.list.d/yarn.list
  sudo -A apt -y update

  echo -e "Apt Installs";
  # sudo -A apt -y install python-minimal;
  sudo -A apt -y install python3-dev;
  sudo -A apt -y install python3-setuptools;
  sudo -A apt -y install python3-pip;
  sudo -A apt -y install python3-testresources;
  sudo -A apt -y install nginx;
  sudo -A apt -y install software-properties-common;
  sudo -A apt -y install redis-server;

  sudo -A apt -y install mariadb-server-10.4;

  sudo -A apt -y install mariadb-client;
  sudo -A apt -y install libmysqlclient-dev;
  sudo -A apt -y install yarn;
  sudo -A apt -y install git;
  sudo -A apt -y install curl;
  sudo -A apt -y install tree;

  export MYSQL_CNF_FILE="${HOME}/.my.cnf";
  tee ${MYSQL_CNF_FILE} >/dev/null <<MCF
[client]
user=root
password="${MYPWD}"

[mysql]
user=root
password="${MYPWD}"

[mysqldump]
user=root
password="${MYPWD}"

[mysqldiff]
user=root
password="${MYPWD}"
MCF

  chmod u+x,go-rwx ${MYSQL_CNF_FILE};

  # echo -e "
  # ${MYSQL_CNF_FILE}
  # ${MYPWD}
  # ++++++++++++++
  # ";

  if mysql -u root -e "select 1+1;" mysql &>/dev/null; then
    echo -e "MariaDB already secured";
  else
    echo "Securing MariaDB....";
    sudo -A mysql_secure_installation 2>/dev/null <<MSI

n
y
${MYPWD}
${MYPWD}
y
y
y
y

MSI
    echo -e "Update MySql";
    sudo -A mysql -u root -e "FLUSH PRIVILEGES;;" mysql;
  fi;

  sudo -A service mysql restart

  mysql -u root -p${MYPWD} -e "SELECT 1+1";

  export MYCNF_PATCH="/dev/shm/mycnf.patch";
    sudo -A tee ${MYCNF_PATCH} >/dev/null <<MCFP18
--- my.cnf  2020-05-09 19:27:56.000000000 +0000
+++ my.cnf.new  2020-05-19 22:01:02.759916503 +0000
@@ -28,6 +28,9 @@
 nice   = 0
 
 [mysqld]
+character-set-client-handshake = FALSE
+character-set-server = utf8mb4
+collation-server = utf8mb4_unicode_ci
 #
 # * Basic Settings
 #
MCFP18

  export MYCNFN="my.cnf";
  echo -e "Patching '${MYCNFN}'";

  pushd /etc/mysql/ >/dev/null;
    export MYCNF="$(realpath ./${MYCNFN})";
    sudo -A patch -p0 --forward ${MYCNF} < ${MYCNF_PATCH} >/dev/null;
  popd >/dev/null;




  echo -e "\n\nInstalling NodeJs and NPM";
    
  # curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
  # export NVM_DIR="$HOME/.nvm"
  # [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  # [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  # nvm --version
  # nvm install stable

  curl -sL https://deb.nodesource.com/setup_12.x | sudo -A -E bash -

  sudo -A apt install -y nodejs

  echo -e "\nInstalled NodeJs and NPM\n\n";

  echo -e "\nConfiguring file watchers\n\n";
  echo fs.inotify.max_user_watches=524288 | sudo -A tee -a /etc/sysctl.conf && sudo -A sysctl -p

  # sudo -A npm install -g yarn
  # sudo -A chown -R $USER:$GROUP ~/.npm
  # sudo -A chown -R $USER:$GROUP ~/.config
  # 
  # # sudo -A npm uninstall -g yarn
  # # sudo -A rm -fr ${HOME}/.config;
  # # sudo -A npm install -g yarn
  # ls -la;


  echo -e "\n\nInstall bench";
  # git clone https://github.com/frappe/bench
  # pip install -e ./bench
  pip3 install frappe-bench


  echo -e "
  _____________________________________________________
  Sanity checks
  ";


  echo -e "Check NGinx ok";
  sudo -A service nginx status
  echo -e "Check Mysql ok";
  # mysql -u root -p${MYPWD} -e "SELECT 1+1";
  mysql -u root -e "SELECT 1+1";
  echo -e "\n\nNodeJs version";
  node --version
  echo -e "NPM version";
  npm --version
  echo -e "Check Redis ok";
  redis-cli ping

  echo -e "

  _____________________________________________________
  Ready to install Frappe ....
  ";

  export PATH="/home/erpdev/.local/bin:${PATH}";

  bench --version
  bench init --frappe-branch version-12 --python /usr/bin/python3 frappe-bench



  sudo -A ufw --force enable;

  echo -e "
  Done
  ==========================================


  Please reboot your server and proceed to ...
  
   - script 'ErpNextQikInstall_2.sh' in one terminal session

  ... then when the former is ready ...

   - script 'ErpNextQikInstall_3.sh' in a 2nd terminal session

  ";
  exit;


  # ####################################################################################################
fi

echo -e "
Done
==========================================
";
exit;
