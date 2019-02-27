#!/usr/bin/env bash
#
########
aptNotYetInstalled() {
  set -e;
  return $(dpkg-query -W --showformat='${Status}\n' $1 2>/dev/null | grep -c "install ok installed");
}
