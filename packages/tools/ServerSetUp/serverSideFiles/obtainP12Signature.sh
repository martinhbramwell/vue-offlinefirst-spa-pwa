#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

export SECRETS_FILE_PATH=".ssh/secrets";

source ${HOME}/${SECRETS_FILE_PATH}/vue-offlinefirst-spa-pwa.config;

export SIG_B64="${ENCODED_SIGNATURE_FILE_NAME}";
export SIG_TARGZ="${SIG_B64%.b64}";
export SIG_FILE="${SIG_TARGZ%.tar.gz}";
# echo -e "Files are =>  :'${SIG_B64}'  :'${SIG_TARGZ}'  :'${SIG_FILE}'";

unWrapSignature() {
  sed -i 's/ /\n/g' ${SIG_B64};
  cat ${SIG_B64} | base64 --decode > ${SIG_TARGZ};
  rm -f ${SIG_B64};
  tar zxf ${SIG_TARGZ};
  rm -f ${SIG_TARGZ};
};

export NVM_DIR="$HOME/.nvm";
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


pushd ${SCRIPT_DIR} >/dev/null;
  # echo -e "parameters = '${SECRETS_FILE_PATH}' '${ENCODED_SIGNATURE_FILE_NAME}' 'application/zip' '${GOOGLE_DRIVE_FOLDER}'";
  # pushd SecretsCollector >/dev/null;
  #   node uploadSecret.js "${HOME}/${SECRETS_FILE_PATH}" "${ENCODED_SIGNATURE_FILE_NAME}" "application/zip" "${GOOGLE_DRIVE_FOLDER}";
  # popd >/dev/null;
  # echo -e "";

  export SIGNATURE_FILE_ID="1nu1N3Use6iVOlEt1YuUV72HSBylcj3Dq";
  echo -e "Obtaining '${ENCODED_SIGNATURE_FILE_NAME}' from Google Drive with ID:  '${SIGNATURE_FILE_ID}'";
  pushd SecretsCollector >/dev/null;
    npm install;
    node collectSecret.js "${SIGNATURE_FILE_ID}" "${ENCODED_SIGNATURE_FILE_NAME}" "${XDG_RUNTIME_DIR}";
  popd >/dev/null;
  echo -e "";

popd >/dev/null;

pushd ${XDG_RUNTIME_DIR} >/dev/null;
  echo -e "Unwrapping file...";
  unWrapSignature;
  mv -v *.p12 ${HOME}/${SECRETS_FILE_PATH};
popd >/dev/null;

echo -e "+~~~~+\n\n";
