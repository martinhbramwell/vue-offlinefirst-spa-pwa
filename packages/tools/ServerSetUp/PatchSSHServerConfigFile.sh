#!/usr/bin/env bash
#
source .bash_login;
pushd /etc/ssh &> /dev/null;

  sudo -A sed -i '/^PasswordAuthentication/c\PasswordAuthentication no' sshd_config;
  sudo -A sed -i '/#PasswordAuthentication/c\PasswordAuthentication no' sshd_config;
  sudo -A sed -i '/^PermitRootLogin/c\PermitRootLogin no' sshd_config;

  sudo -A service ssh restart;

popd &> /dev/null;
