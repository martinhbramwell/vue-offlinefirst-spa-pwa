source ./ErpNextQikInstall_0.sh;

# sudo -A ls -la;  #  *** prime the sudo pwd ***

read -n1 -r -p "Press <q>  to quit..." key

if [ "$key" = 'q' ]; then
  echo -e "Quitting";
  exit;
elif [ "$key" = 's' ]; then
  echo -e "Skipping";
# ####################################################################################################




# ####################################################################################################
  exit;
else
  echo -e "Working";
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
sudo -A apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
sudo -A add-apt-repository "deb [arch=amd64,arm64,ppc64el] http://mariadb.mirror.liquidtelecom.com/repo/10.4/ubuntu $(lsb_release -cs) main"
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo -A apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo -A tee /etc/apt/sources.list.d/yarn.list
sudo -A apt -y update

echo -e "Apt Installs";
sudo -A apt -y install python-minimal python3-dev python3-setuptools python3-pip nginx software-properties-common redis-server
sudo -A apt -y install mariadb-server mariadb-client libmysqlclient-dev
sudo -A apt -y install yarn



echo -e "\n\nPatching MyCnf";
pushd /etc/mysql;
# [mysqld]
# character-set-client-handshake = FALSE
# character-set-server = utf8mb4
# collation-server = utf8mb4_unicode_ci
# 
# [mysql]
# default-character-set = utf8mb4

export MY_CONF="my.cnf";
export MY_CONF_OLD="${MY_CONF}_OLD";
# sudo cp ${MY_CONF}_vold ${MY_CONF};

[ -f ${MY_CONF_OLD} ] && echo "backup exists" || sudo -A cp ${MY_CONF} ${MY_CONF_OLD};
export TAB="$(printf '\t')";
export MY_CONF_PATCH="${MY_CONF}.patch";
sudo -A tee ${MY_CONF_PATCH} <<EOF >/dev/null
--- my.cnf${TAB}2020-04-22 15:42:26.896458036 +0000
+++ my.cnf_new${TAB}2020-04-22 15:44:32.227296543 +0000
@@ -29,6 +29,13 @@
 
 [mysqld]
 #
+# * ERPNext settings
+#
+character-set-client-handshake = FALSE
+character-set-server = utf8mb4
+collation-server = utf8mb4_unicode_ci
+
+#
 # * Basic Settings
 #
 user${TAB}${TAB}= mysql
@@ -175,6 +182,11 @@
 max_allowed_packet${TAB}= 16M
 
 [mysql]
+#
+# * ERPNext settings
+#
+default-character-set = utf8mb4
+
 #no-auto-rehash${TAB}# faster start of mysql but no tab completion
 
 [isamchk]
EOF
# cat ${MY_CONF};
sudo -A patch --forward < ${MY_CONF_PATCH} &>/dev/null;
# cat ${MY_CONF};
popd;
echo -e "\nPatched MyCnf\n\n";

export MYSQL_PWD_FILE="${HOME}/.ssh/mysql_pwd.sh";
echo "export MYSQL_PWD='${MYPWD}'" > ${MYSQL_PWD_FILE};
source ${MYSQL_PWD_FILE};
echo -e "
${MYSQL_PWD_FILE}
${MYSQL_PWD}
";

sudo -A mysql_secure_installation 2>/dev/null <<MSI

n
y
${MYSQL_PWD}
${MYSQL_PWD}
y
y
y
y

MSI

sudo -A service mysql restart

# mysql -u root -p${MYSQL_PWD} -e "SELECT 1+1";
mysql -u root -e "SELECT 1+1";


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
# mysql -u root -p${MYSQL_PWD} -e "SELECT 1+1";
mysql -u root -e "SELECT 1+1";
echo -e "\n\nNodeJs version";
node --version
echo -e "NPM version";
npm --version
echo -e "Check Redis ok";
redis-cli ping

echo -e "

 *** Exit session and log back in to continue ***
===================================================
";


# ####################################################################################################
fi

echo -e "
Done
==========================================
";
exit;





# -----    <reboot>
# -----    <snapshot>


# -----    < LOG OUT >
#
# ------------------------------------------------------------------------------
#

sudo -A ls;  #  *** prime the sudo pwd ***


bench --version
bench init --frappe-branch version-12 --python /usr/bin/python3 frappe-bench



cd ${HOME}/frappe-bench/

./env/bin/pip3 install -e apps/frappe/
# ./env/bin/pip3 install werkzeug==0.16.1
bench start

cd ${HOME}/frappe-bench/
export NEW_SITE="einvoice";
bench new-site ${NEW_SITE}

bench config dns_multitenant on
echo "" > sites/currentsite.txt
bench setup nginx

sudo -A ls -la;  #  *** prime the sudo pwd ***

pushd /etc/nginx/sites-enabled/
sudo -A rm default 
sudo -A ln -s /home/erpdev/frappe-bench/config/nginx.conf nginx.conf
popd
ll /etc/nginx/sites-enabled/

sudo -A service nginx restart



