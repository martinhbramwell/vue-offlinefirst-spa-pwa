#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";
. ${SCRIPTPATH}/initializeConstants.sh;
initializeLocalConstants;

if [[ $1 = "-e" ]]
then
  export ENABLE=0;
elif [[ $1 = "-d" ]]
then
  export ENABLE=1;
else
  exit 1;
fi;

export TEMP_DIR="/dev/shm";
export TEMP_TAB="crontab.txt";
export TEMP="${TEMP_DIR}/${TEMP_TAB}";

echo -e "~~~~ Controlling Application ~~~~";

cp ${SCRIPTPATH}/crontabExample.txt ${TEMP_DIR};

if ! crontab -l &>/dev/null; then
  crontab ${TEMP_DIR}/crontabExample.txt;
  echo "Initialized empty crontab.";
fi;

crontab -l > ${TEMP};
# cat ${TEMP};

if [[ "${ENABLE}" -eq 0 ]]
then
  if grep "^# \*\/.*lambdaSrv/watchdog.sh" ${TEMP} >/dev/null; then
    sed -i '/lambdaSrv\/watchdog.sh/s/^# //g' ${TEMP};
    crontab ${TEMP};
    echo "Enabled application.";
  else
    echo " Application: Already enabled.";
  fi;
else
  if grep "^\*\/.*lambdaSrv/watchdog.sh" ${TEMP} >/dev/null; then
    sed -i '/lambdaSrv\/watchdog.sh/ s/^/# /' ${TEMP};
    crontab ${TEMP};
    ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV}/unLaunch.sh;
    echo "Disabled application.";
  else
    echo " Application: Already disabled.";
  fi;
fi;
echo -e "~~~~ Controlled Application ~~~~";
