#!/usr/bin/env bash
#
export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";

export TEMP_DIR="/dev/shm";
export CRONJOB="crontab.txt";
export CRONJOB_PATH="${TEMP_DIR}/${CRONJOB}";

export START_ALIAS="# ^^^^ Database Backup Monitor vue-offlinefirst-spa-pwa ^^^^";
export END_ALIAS="# vvvv Database Backup Monitor vue-offlinefirst-spa-pwa vvvv";

# ls -la ${TEMP_DIR};

# # ^^^^ Application Watch Dog vue-offlinefirst-spa-pwa ^^^^
# */5 * * * * /home/you/services/vue-offlinefirst-spa-pwa/packages/lambdaSrv/watchdog.sh > /dev/null
# # vvvv Application Watch Dog vue-offlinefirst-spa-pwa vvvv

echo -e "# ---------------- Cron Job Table -------------------" > ${CRONJOB_PATH};

if crontab -l &>/dev/null; then
  crontab -l > ${CRONJOB_PATH};
else
  crontab ${CRONJOB_PATH};
  echo "Initialized empty crontab.";
fi;

# touch ${CRONJOB_PATH};
sed -i "/${START_ALIAS}/,/${END_ALIAS}/d" ${CRONJOB_PATH};
echo -e "
${START_ALIAS}
0 */1 * * * /home/you/services/vue-offlinefirst-spa-pwa/packages/lambdaSrv/backUpToGoogleDrive.sh > /dev/null
${END_ALIAS}
" >> ${CRONJOB_PATH};

cat -s ${CRONJOB_PATH} | tee "${CRONJOB_PATH}" >/dev/null;
cat ${CRONJOB_PATH};

crontab ${CRONJOB_PATH};
echo -e "~~~~ Updated crontab file ~~~~";
exit;


# crontab -l > ${TEMP};
# # cat ${TEMP};
# ls -la ${TEMP_DIR};


# if [[ "${ENABLE}" -eq 0 ]]
# then
#   if grep "^# \*\/.*lambdaSrv/backUpToGoogleDrive.sh" ${TEMP} >/dev/null; then
#     sed -i '/lambdaSrv\/backUpToGoogleDrive.sh/s/^# //g' ${TEMP};
#     crontab ${TEMP};
#     echo "Enabled application.";
#   else
#     echo " Application: Already enabled.";
#   fi;
# else
#   if grep "^\*\/.*lambdaSrv/watchdog.sh" ${TEMP} >/dev/null; then
#     sed -i '/lambdaSrv\/watchdog.sh/ s/^/# /' ${TEMP};
#     crontab ${TEMP};
#     ${SCRIPTPATH}/${PATH_TO_LAMBDA_SRV}/unLaunch.sh;
#     echo "Disabled application.";
#   else
#     echo " Application: Already disabled.";
#   fi;
# fi;
# echo -e "~~~~ Controlled Application ~~~~";
