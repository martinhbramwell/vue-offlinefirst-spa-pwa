#!/usr/bin/env bash
#
prepareUFW () {
  sudo -A ufw default deny incoming
  sudo -A ufw default allow outgoing

  sudo -A ufw allow ssh
  sudo -A ufw allow http;
  sudo -A ufw allow https;

  sudo -A ufw allow 9418;

  sudo -A ufw allow 8092;

  sudo -A ufw -f disable; sudo -A ufw -f enable;
  # sudo -A ufw status numbered;
};
