#!/usr/bin/env bash
#
DO_PID=$(ps faux | grep -v grep | grep -v "sh -c" | grep -e "node.*src/index.js" -e "node.*dist/index.js"  | awk '{ print $2 }');
if [[ "x${DO_PID}x" = "xx" ]]; then
  echo -e "No PID for supervisor.";
else
  echo -e "Killing supervisor PID ${DO_PID}";
  kill -9 ${DO_PID};
fi;

DO_PID=$(ps faux | grep -v grep | grep -v "sh -c" | grep -e "cypress"  | awk '{ print $2 }');
if [[ "x${DO_PID}x" = "xx" ]]; then
  echo -e "No PID for cypress.";
else
  echo -e "Killing cypress PID ${DO_PID}";
  kill -9 ${DO_PID};
fi;

