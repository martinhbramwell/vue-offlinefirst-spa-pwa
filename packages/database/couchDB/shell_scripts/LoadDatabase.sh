#!/usr/bin/env bash
#

export DOWNLOADS_DIR="${HOME}/Downloads";
export SAFE_DIR="backup";
export SOURCE_FILES_DIR="${DOWNLOADS_DIR}/${SAFE_DIR}";


export CONFIG_FILE="${HOME}/.ssh/secrets/offsppwa-vue.config";
source ${CONFIG_FILE};

export COUCH_DATABASE="${COUCH_DATABASE_NAME}_${VERSION}";
export DATAFILES_TEMP_DIR="${HOME}/temp/databases";


if [[ -z "$COUCH_URL" ||  -z "$COUCH_DATABASE" ]]; then
  usage;
fi;

if [[ 1 == 0 ]]; then
  ./CleanSheetsFilenames.sh &>/dev/null;
  pushd ${HOME}/Downloads;
    mkdir -p backup;
    mv FactElec2018_dev_*.csv ./backup &>/dev/null;
  popd;

  if [[ -f ${SOURCE_FILES_DIR}/FactElec2018_dev_Envases_JSON.csv ]]; then
    ./FixJsonFile.sh ${SOURCE_FILES_DIR}/FactElec2018_dev_Envases_JSON.csv ${DATAFILES_TEMP_DIR}/bottles/bottles;
  fi;
  if [[ -f ${SOURCE_FILES_DIR}/FactElec2018_dev_Persons_JSON.csv ]]; then
    ./FixJsonFile.sh ${SOURCE_FILES_DIR}/FactElec2018_dev_Persons_JSON.csv ${DATAFILES_TEMP_DIR}/persons;
  fi;
fi;

if [[ 1 == 1 ]]; then
  ./DropCreateDatabase.sh;
  ./PutSecurity.sh;
  ./PutUsers.sh;


  export COUCH_GROUP_NAME='persons';
  export COUCH_COLLECTION_NAME='person';
  ./UploadJsonFile.sh ${DATAFILES_TEMP_DIR}/${COUCH_GROUP_NAME}/${COUCH_COLLECTION_NAME};
  export COUCH_COLLECTION_NAME='address';
  ./UploadJsonFile.sh ${DATAFILES_TEMP_DIR}/${COUCH_GROUP_NAME}/${COUCH_COLLECTION_NAME};
  export COUCH_COLLECTION_NAME='profile';
  ./UploadJsonFile.sh ${DATAFILES_TEMP_DIR}/${COUCH_GROUP_NAME}/${COUCH_COLLECTION_NAME};


  export COUCH_GROUP_NAME='bottles';
  export COUCH_COLLECTION_NAME='bottle';
  ./UploadJsonFile.sh ${DATAFILES_TEMP_DIR}/${COUCH_GROUP_NAME}/${COUCH_COLLECTION_NAME};


  export COUCH_GROUP_NAME='movements';
  export COUCH_COLLECTION_NAME='movementsIn';
  ./UploadJsonFile.sh ${DATAFILES_TEMP_DIR}/${COUCH_GROUP_NAME}/${COUCH_COLLECTION_NAME};
  export COUCH_COLLECTION_NAME='movementsOut';
  ./UploadJsonFile.sh ${DATAFILES_TEMP_DIR}/${COUCH_GROUP_NAME}/${COUCH_COLLECTION_NAME};

fi;

if [[ 1 == 1 ]]; then

  export COUCH_GROUP_NAME='movements';
  export SPEC_NAME='post_processing';
  ./PutDesignDocument.sh;

  export COUCH_GROUP_NAME='iriblu';
  export SPEC_NAME='ddocs';
  ./PutDesignDocument.sh;
  export SPEC_NAME='full_range';
  ./PutDesignDocument.sh;
  export SPEC_NAME='user_specific';
  ./PutDesignDocument.sh;

  export SPEC_NAME='visible';
  ./PutViewsDocument.sh;

fi;

if [[ 1 == 0 ]]; then

  # ./TestGet.sh;
  ./tests/ResetExchangeRequestData.sh;
  ./tests/ResetExchangeRequests.sh;

fi;
