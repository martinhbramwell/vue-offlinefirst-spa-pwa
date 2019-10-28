#!/usr/bin/env bash
#
DO_PID=$(ps faux | grep -v grep | grep -v "sh -c" | grep -e "node.*src/index.js" -e "node.*dist/index.js"  | awk '{ print $2 }');
if [[ "x${DO_PID}x" = "xx" ]]; then
  echo "$(date) |  No PID for supervisor." | tee -a /tmp/pouchLog;
else
  echo "$(date) |  Killing supervisor PID ${DO_PID}" | tee -a /tmp/pouchLog;
  kill -9 ${DO_PID};
fi;

DO_PID=$(ps faux | grep -v grep | grep -v "sh -c" | grep -e "cypress"  | awk '{ print $2 }');
if [[ "x${DO_PID}x" = "xx" ]]; then
  echo "$(date) |  No PID for cypress." | tee -a /tmp/pouchLog;
else
  echo "$(date) |  Killing cypress PID ${DO_PID}" | tee -a /tmp/pouchLog;
  kill -9 ${DO_PID};
fi;

