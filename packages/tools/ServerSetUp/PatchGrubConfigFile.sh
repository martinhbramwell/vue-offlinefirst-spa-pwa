#!/usr/bin/env bash
#
source .bash_login;
pushd /etc/default &> /dev/null;

  echo -e "Patching GRUB configuration. ";

  sudo -A sed -i '/^GRUB_HIDDEN_TIMEOUT_QUIET/d' grub;
  sudo -A sed -i '/^GRUB_HIDDEN_TIMEOUT/c\GRUB_TIMEOUT_STYLE=hidden' grub;

popd &> /dev/null;
