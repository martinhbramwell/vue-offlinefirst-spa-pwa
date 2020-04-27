#!/usr/bin/env bash
#
prepareUFW () {
  sudo -A ufw default deny incoming
  sudo -A ufw default deny outgoing

  sudo -A ufw allow ssh;
  sudo -A ufw allow out ssh;
  sudo -A ufw allow ntp;
  sudo -A ufw allow http;
  sudo -A ufw allow https;

  sudo -A ufw allow 9418;
  sudo -A ufw allow out 9418;

  sudo -A ufw allow 8092;

  sudo -A ufw allow out 53;
  sudo -A ufw allow out 80;
  sudo -A ufw allow out 443;
  sudo -A ufw allow out 993;
  sudo -A ufw allow out 587;

  # sudo -A ufw -f disable;
  bash -c 'sleep 1 ; sudo -A ufw -f disable ; echo "disabled"' &
  bash -c 'sleep 3 ; sudo -A ufw -f enable ; echo "enabled"' &
  # bash -c 'sleep 2 ; echo "test"' &
  sleep 5;
  echo -e "Finished UFW updates.";


  # sudo -A ufw status numbered;
};
