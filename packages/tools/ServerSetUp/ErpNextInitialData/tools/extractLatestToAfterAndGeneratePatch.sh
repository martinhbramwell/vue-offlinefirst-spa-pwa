#!/usr/bin/env bash
#
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

declare BEFORE_FILE="before.sql";
declare AFTER_FILE="after.sql";
declare CHANGES_FILE="changes.patch";
pushd /opt/backupErpNext >/dev/null;

  declare LT=$(cat LATEST.txt);
  declare SQL_EXPORT="${LT}-${PRD_ERPNEXT_SITE//./_}-database.sql.gz";

  echo -e "\n     Will unzip ${SQL_EXPORT} to '${AFTER_FILE}':";
  gunzip -ck ${SQL_EXPORT} > ${AFTER_FILE};

  export SQL_FILE_NAME="after.sql";
  export TABLE_NAME="Version"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="global_search"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  # export TABLE_NAME="Singles"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Sessions"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Activity Log"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Comment"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Data Import"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="File"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Scheduled Job Log"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Scheduled Job Type"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};

  export SQL_FILE_NAME="before.sql";
  export TABLE_NAME="Version"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="global_search"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  # export TABLE_NAME="Singles"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Sessions"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Activity Log"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Comment"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Data Import"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="File"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Scheduled Job Log"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};
  export TABLE_NAME="Scheduled Job Type"; sed -i "/^.*40.*${TABLE_NAME}.*DISA.*$/,/^.*40.*${TABLE_NAME}.*ENA.*$/d" ${SQL_FILE_NAME};

  echo -e "\n     Will generate differences patch :: ${CHANGES_FILE}':";
  diff -u ${BEFORE_FILE} ${AFTER_FILE} > ${CHANGES_FILE}

  sed -i 's/VALUES (/VALUES\n   (/g' ${CHANGES_FILE};
  sed -i 's/),(/)\n  ,(/g' ${CHANGES_FILE};

popd >/dev/null;


