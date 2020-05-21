#!/usr/bin/env bash
#
source ./ErpNextQikInstall_0.sh;


echo -e "

*** Attention ***

    This script produces a lot of output, then appears to slow down and come to a stop at...

        00:15:10 watch.1          | Rebuilding erpnext-web.min.js
        00:15:10 watch.1          | Rebuilding erpnext-web.css
        00:15:10 watch.1          | Rebuilding marketplace.min.js
        00:15:13 watch.1          | Rebuilding erpnext.min.js
        00:15:14 watch.1          | Rebuilding item-dashboard.min.js
        
    It does not stop because it failed.
    You will be seeing the Frappe application server running and ready to accept connections.
        
      *** IT MUST BE RUNNING IN ORDER TO INSTALL ERPNext (script #3) ***
    
    While installing ERPNext it will display many log lines as it reports the progress of the installation.
    
";

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
