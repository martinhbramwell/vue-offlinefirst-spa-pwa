#!/usr/bin/env bash
#
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

declare BEFORE_FILE="before.sql";
pushd /opt/backupErpNext >/dev/null;

  declare LT=$(cat LATEST.txt);
  declare SQL_EXPORT="${LT}-${PRD_ERPNEXT_SITE//./_}-database.sql.gz";

  echo -e "\n     Will unzip ${SQL_EXPORT} to '${BEFORE_FILE}':";
  ls -la;
  gunzip -ck ${SQL_EXPORT} > ${BEFORE_FILE};

popd >/dev/null;
