#!/usr/bin/env bash
#
set -e;

export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )";

# echo -e "    .    .    .    .    .    .    .    .    .    .    .

#  *** Pulling from remote ***

# ";
# ${SCRIPTPATH}/pullFromRemote.sh -f;

echo -e "

 *** Starting new database***

";
${SCRIPTPATH}/restartWithNewDatabase.sh -f;
echo -e " *** Test mode exit (updateLocalFromRemote.sh) ***";
exit;


echo -e "

 *** Checking for database resync completion ***

";

${SCRIPTPATH}/waitForDatabaseEquivalence.sh;
sleep 10;

echo -e "

 *** Purging and restarting ***

";
${SCRIPTPATH}/purgeDatabase.sh -f;
echo -e "---

 *** Done ***

";
exit;
