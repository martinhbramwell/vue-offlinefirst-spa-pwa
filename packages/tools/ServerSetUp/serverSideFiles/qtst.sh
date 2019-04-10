#!/usr/bin/env bash
#
export TMPLT_FILE_NAME="${1}";
export TMPLT_FILE=${XDG_RUNTIME_DIR}/${TMPLT_FILE_NAME};

export DEST_DIR="/etc/nginx/sites-available";
export DEST_FILE_NAME="splidge";
export DEST_FILE=${DEST_DIR}/${DEST_FILE_NAME};

pushd SecretsCollector >/dev/null;
  node collectSecret.js 1zH7Kx74kesEgVh8AtXU7BOBdGGVHWzKh ${TMPLT_DIR}  ${XDG_RUNTIME_DIR};
popd >/dev/null;

# export RFRF="splut";
# source ./tmplt.sh;


# cat ${TMPLT_FILE};
ls -la ${XDG_RUNTIME_DIR}
echo -e "+~~~~+";
pwd;
