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

  source ${HOME}/.ssh/mysql_pwd.sh;
  export NEW_SITE="${THESITE}";

  echo -e "Creating the new '${NEW_SITE}' site in Frappe";
  # echo bench new-site --mariadb-root-password ${MYSQL_PWD} --admin-password ${ADMPWD}  ${NEW_SITE}
  bench new-site --mariadb-root-password ${MYSQL_PWD} --admin-password ${ADMPWD}  ${NEW_SITE}

  echo -e "Configuring the NGinx for the '${NEW_SITE}' site.";
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




# ####################################################################################################
fi

echo -e "
Done
==========================================
";
exit;





# ####################################################################################################
# ####################################################################################################


if [ "${EUID:-0}" -ne 0 ]; then
  echo "Please run as root, eg ==> sudo ./patchMyCnf.sh";
  exit
# else
#   echo "Please do not run as root"
#   exit
fi

