#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

export JOB_STATUS_PATH=".queryasyncjobresultresponse.jobstatus";

declare QUERY_JOB="queryJob.json";
declare QUERY_JOB_PATH=${XDG_RUNTIME_DIR}/${QUERY_JOB};
waitForJob () {
  declare asyncJobId=$1;
  cat << QAJREOF > ${QUERY_JOB_PATH}
{
  "command": "queryAsyncJobResult",
  "jobid": "${asyncJobId}"
}
QAJREOF

  declare STATUS=0;

  STATUS=$(./iwstackCmd.py ${QUERY_JOB_PATH} | jq -r ${JOB_STATUS_PATH});
  while [ "${STATUS}" = "0" ]; do
    STATUS=$(./iwstackCmd.py ${QUERY_JOB_PATH} | jq -r ${JOB_STATUS_PATH});
    echo -e "Job status: ${STATUS}";
    sleep 1;
  done

}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  if [ -z $1 ]; then
    echo -e "No Job ID provided.";
    exit 1;
  fi;
  pushd ${SCRIPT_DIR} >/dev/null;
    waitForJob $1;
  popd >/dev/null;

  # echo -e "~~~~~~~~\n\n";
  exit;

fi;
