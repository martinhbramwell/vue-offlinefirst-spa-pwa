#!/usr/bin/env bash
#
pushd /dev/shm > /dev/null;
  curl -s http://localhost:3001/recheck > checked.json;
  if grep -zqv "No data for BAPU invoice" checked.json; then
    jq -r '.' checked.json;
    echo "";
  else
    echo -e "[$(date)] No new invoices";
  fi;
popd > /dev/null;