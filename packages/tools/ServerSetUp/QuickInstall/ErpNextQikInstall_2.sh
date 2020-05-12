#!/usr/bin/env bash
#
source ./ErpNextQikInstall_0.sh;


# sudo -A ls -la;  #  *** prime the sudo pwd ***

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



bench --version
bench init --frappe-branch version-12 --python /usr/bin/python3 frappe-bench



sudo -A ufw --force enable;

# ####################################################################################################
fi

echo -e "
Done
==========================================


Please reboot your server and proceed to ...
 - script 'ErpNextQikInstall_3.sh' in one terminal session

... then when the former is ready ...

 - script 'ErpNextQikInstall_4.sh' in a 2nd terminal session

";
exit;

