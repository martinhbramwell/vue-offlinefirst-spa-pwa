#!/usr/bin/env bash
#
declare BEFORE_FILE="before.sql";
pushd /opt/backupErpNext >/dev/null;

  declare LT=$(cat LATEST.txt);
  declare SQL_EXPORT="${LT}-ib_erp_local-database.sql.gz";

  echo -e "\n     Will unzip ${SQL_EXPORT} to '${BEFORE_FILE}':";
  gunzip -ck ${SQL_EXPORT} > ${BEFORE_FILE};

popd >/dev/null;
