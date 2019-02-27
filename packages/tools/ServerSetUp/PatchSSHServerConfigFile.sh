#!/usr/bin/env bash
#
source .bash_login;
pushd /etc/ssh &> /dev/null;

  echo -e "Patching SSHD configuration.";

  sudo -A sed -i '/^PasswordAuthentication/c\PasswordAuthentication no' sshd_config;
  sudo -A sed -i '/#PasswordAuthentication/c\PasswordAuthentication no' sshd_config;
  sudo -A sed -i '/^PermitRootLogin/c\PermitRootLogin no' sshd_config;

  # echo -e "Restarting SSHD";
  # sudo -A service ssh restart;

popd &> /dev/null;
