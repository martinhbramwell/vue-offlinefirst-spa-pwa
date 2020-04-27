#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

declare PATCH_FILE_NAME="lets_encrypt.patch";
declare CODE_FILE_NAME="lets_encrypt.py";

pushd ${1}/bench/config > /dev/null;
  (patch  --forward < ${SCRIPT_DIR}/${PATCH_FILE_NAME} >/dev/null || true) && echo -e "Patched 'lets_encrypt.py'";
popd > /dev/null;
