source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config

export SRCE=${MARIA_USR}@${MARIA_HOST}:/home/${MARIA_USR}/${TEST_FILES_PATH}

mkdir -p ${TEST_FILES_DIR}

export COUCH_GROUP_NAME="bottles";
scp -r ${SRCE}/${COUCH_GROUP_NAME} ${TEST_FILES_DIR}

export COUCH_GROUP_NAME="persons";
scp -r ${SRCE}/${COUCH_GROUP_NAME} ${TEST_FILES_DIR}

export COUCH_GROUP_NAME="movements";
scp -r ${SRCE}/${COUCH_GROUP_NAME} ${TEST_FILES_DIR}

export COUCH_GROUP_NAME="invoices";
scp -r ${SRCE}/${COUCH_GROUP_NAME} ${TEST_FILES_DIR}

export COUCH_GROUP_NAME="products";
scp -r ${SRCE}/${COUCH_GROUP_NAME} ${TEST_FILES_DIR}
