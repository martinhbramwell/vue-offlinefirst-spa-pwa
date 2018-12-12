#!/usr/bin/env bash
#
export LAUNCH_DIR="${HOME}/vue-offlinefirst-spa-pwa/packages/lambdaSrv";

DO_PID=$(ps faux | grep -v grep | grep -v "sh -c" | grep "node dist/index.js"  | awk '{ print $2 }');
echo -e "$(date) | Supervisor '${DO_PID}' is alive." | tee -a /tmp/pouchLog;
if [[ "x${DO_PID}x" = "xx" ]]; then
  echo "$(date) |  PouchDb supervisor died. Restarting!" | tee -a /tmp/pouchLog;
  cd ${LAUNCH_DIR};
  ./unLaunch.sh;
  ./launch.sh;
  DO_PID=$(ps faux | grep -v grep | grep -v "sh -c" | grep "node dist/index.js"  | awk '{ print $2 }');
  echo "$(date) |  PouchDb supervisor restarted. PID :: ${DO_PID}" | tee -a /tmp/pouchLog;
else
  exit 0;
fi;
