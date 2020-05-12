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


cd ${HOME}/frappe-bench/

./env/bin/pip3 install -e apps/frappe/
# ./env/bin/pip3 install apps/frappe/
# ./env/bin/pip3 install werkzeug==0.16.0
bench start



# ####################################################################################################
fi

echo -e "
Done
==========================================
";
exit;
