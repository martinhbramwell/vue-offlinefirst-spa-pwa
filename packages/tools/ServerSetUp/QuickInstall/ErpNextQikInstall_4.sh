#!/usr/bin/env bash
#
source ./ErpNextQikInstall_0.sh;

read -n1 -r -p "Press <q>  to quit, any other to proceed..." key

if [ "$key" = 'q' ]; then
  echo -e "Quitting";
  exit;
elif [ "$key" = 's' ]; then
  echo -e "Skipping";
# ####################################################################################################



# ####################################################################################################
  exit;
else
  echo -e "\nCalibrating date & time...";
  sudo -A ntpdate pool.ntp.org;
# ####################################################################################################


# export MYSQL_PWD_FILE="${HOME}/.ssh/mysql_pwd.sh";
# source ${MYSQL_PWD_FILE};
# mysql -u root -e "SELECT 1+1";


echo -e "Adding '${THESITE}' to /etc/hosts";
grep "127.0.0.1 *${THESITE}" /etc/hosts >/dev/null || \
    echo -e "\n127.0.0.1   ${THESITE}" | sudo -A tee -a /etc/hosts;

cat /etc/hosts;

pushd ${HOME}/frappe-bench/;

  # source ${HOME}/.ssh/mysql_pwd.sh;
  export NEW_SITE="${THESITE}";

  echo -e "Creating the new '${NEW_SITE}' site in Frappe";
  # echo bench new-site --mariadb-root-password ${MYSQL_PWD} --admin-password ${ADMPWD}  ${NEW_SITE}
  bench new-site --mariadb-root-password ${MYPWD} --admin-password ${ADMPWD}  ${NEW_SITE}

  echo -e "Configuring NGinx for the '${NEW_SITE}' site.";
  bench config dns_multitenant on
  echo "" > sites/currentsite.txt
  bench setup nginx

  echo -e "Linking Frappe site config to NGinx site config.";
  pushd /etc/nginx/sites-enabled/
    sudo -A rm default 
    sudo -A ln -s /home/erpdev/frappe-bench/config/nginx.conf nginx.conf
  popd

popd

ls -la /etc/nginx/sites-enabled/

echo -e "Restarting NGinx.";
sudo -A service nginx restart

echo -e "Adding '${NEW_SITE}' to /etc/hosts";
grep "127.0.0.1 *${NEW_SITE}" /etc/hosts >/dev/null || \
    echo -e "\n127.0.0.1   ${NEW_SITE}" | sudo -A tee -a /etc/hosts; cat /etc/hosts;

pushd ${HOME}/frappe-bench/;
  echo -e "Obtaining ERPNext app for installation";
  bench get-app --branch version-12 erpnext

  echo -e "Building ERPNext app ";
  ./env/bin/pip3 install -e apps/erpnext/

  echo -e "Installing ERPNext app in '${NEW_SITE}' site";
  bench --site ${NEW_SITE} install-app erpnext
popd

echo -e "


The last two tasks will fail if the 'bench' is not running

Check back to the other console to restart bench if it failed, executing:

cd \${HOME}/frappe-bench
bench start


When bench has finished starting...";

read -n1 -r -p "...press any key to proceed (or q to quit)..." key

if [ "$key" != 'q' ]; then
  echo -e "
  Continuing...";
  pushd ${HOME}/frappe-bench >/dev/null;
    echo -e "\nClearing cache...";
    bench --site ${THESITE} clear-cache;

    echo -e "\nMigrating changes ...";
    bench --site ${THESITE} migrate
  popd >/dev/null;
else
  echo -e "
  Skipped 'clear-cache' and 'migrate' ...";
fi;


# ####################################################################################################
fi

echo -e "
Done
==========================================
";
exit;
