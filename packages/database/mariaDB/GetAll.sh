./EnvVars_ManualInit.sh x

export TARGET="${HOME}/temp/databases"
rm -fr  ${TARGET};
echo -e Generating ...

export SUBTARGET="${TARGET}/bottles"
mkdir -p ${SUBTARGET}
echo -e ${SUBTARGET}/bottle.json
./RunAScript.sh ./GetBottles.sql > ${SUBTARGET}/bottle.json

export SUBTARGET="${TARGET}/movements"
mkdir -p ${SUBTARGET}
echo -e ${SUBTARGET}/movementsIn.json
./RunAScript.sh ./GetMovementsIn.sql > ${SUBTARGET}/movementsIn.json
echo -e ${SUBTARGET}/movementsOut.json
./RunAScript.sh ./GetMovementsOut.sql > ${SUBTARGET}/movementsOut.json

export SUBTARGET="${TARGET}/persons"
mkdir -p ${SUBTARGET}
echo -e ${SUBTARGET}/person.json
./RunAScript.sh ./GetPersons.sql > ${SUBTARGET}/person.json
echo -e ${SUBTARGET}/profile.json
./RunAScript.sh ./GetPersonProfiles.sql > ${SUBTARGET}/profile.json
echo -e ${SUBTARGET}/address.json
./RunAScript.sh ./GetPersonAddresses.sql > ${SUBTARGET}/address.json

