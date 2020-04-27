#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
${SCRIPT_DIR}/PullBackupFromRemoteErpNext.sh;
${SCRIPT_DIR}/extractLatestToAfterAndGeneratePatch.sh;
