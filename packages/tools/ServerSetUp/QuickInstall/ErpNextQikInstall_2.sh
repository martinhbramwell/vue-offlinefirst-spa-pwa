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



bench --version
bench init --frappe-branch version-12 --python /usr/bin/python3 frappe-bench




# ####################################################################################################
fi

echo -e "
Done
==========================================
";
exit;

