#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
${SCRIPT_DIR}/pullBackupFromRemoteErpNext.sh;
${SCRIPT_DIR}/extractLatestToBeforeCopy.sh;
