#!/usr/bin/env bash
#
funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
}

getProducts () { funcTitle ${FUNCNAME[0]};
  export FILEDIR="${XDG_RUNTIME_DIR}";
  cat products.json | jq -r '.[] | ("\"\", \"`IB_00" + .id + "`\", \"IB_00" + .id + "\", \"Consumer\", \"Litre\", \"" + .text + "\", 1, 1, " + .product_price + ", \"" + .product_description + "\", 365, \"Manufacture\", \"Litre\", 1" + ", \"\", \"\", \"\", \"\", \"\", \"`27ba96373e`\"" + ", " + "\"Iridium Blue\", " + "\"Stores - IB\"")' | tee ${FILEDIR}/Products.csv >/dev/null;
};

ensureConn () { funcTitle ${FUNCNAME[0]};
  tries="$(seq 10)"; dly=1;
  OPTS="${SWHOST} ${SWPORT} ${SWUSER} ${SWPASS}";
  for i in $tries;
    do echo "SELECT NOW()" | mysql -A ${OPTS} && break || sleep $dly;
  done;
};



startUpSSHTunnel () { funcTitle ${FUNCNAME[0]};
  # echo -e "~~~~~~   startUpSSHTunnel()    ~~~~~~";
  ssh ${NEW_HOST_NAME} -L ${PORT}:127.0.0.1:3306 -N &
  KILLME=$(ps aux | grep "ssh ${NEW_HOST_NAME}" | grep -v grep | tr -s " " | cut -d " " -f 2);
  echo -e "MariaDb Tunnel has PID [ ${KILLME} ];";
  ensureConn;

};

killSSHTunnel () { funcTitle ${FUNCNAME[0]};
  KILLME=$(ps aux | grep "ssh ${NEW_HOST_NAME}" | grep -v grep | tr -s " " | cut -d " " -f 2);
  echo -e "Killing MariaDb Tunnel with PID [ ${KILLME} ];";
  kill -9 ${KILLME};
};

getErpNextDatabaseName () { funcTitle ${FUNCNAME[0]};
  declare DBS_LIST="${XDG_RUNTIME_DIR}/erpnext_databases.txt";
  echo "show databases" | mysql ${SWITCHES} > ${DBS_LIST};
  sed -i -e '/information_schema/d' -e '/performance_schema/d' -e '/mysql/d' -e '/Database/d' ${DBS_LIST};
  ERP_DB=$(cat ${DBS_LIST});
};

processAllBulkInserts () { funcTitle ${FUNCNAME[0]};
  declare DATABASE="--database ${ERP_DB}";
  OPTS="${SWHOST} ${SWPORT} ${SWUSER} ${SWPASS} ${DATABASE}";
  mysql -A ${OPTS} < ./bulkInserts.sql;
};

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "\n+ ~~~~~~ GetBAPUProducts.sh ~~~~~~ +";
  source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

  # export NVM_DIR="$HOME/.nvm";
  # [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh";  # This loads nvm
  # [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion";  # This loads nvm bash_completion

  getProducts;

  export KILLME=-1;
  export SWITCHES="-A --database _a7a7e96ba1644fd9 --host=127.0.0.1 --port=3333 -u root -pplokplok.0.0.0";
  export SWHOST="--host=127.0.0.1";
  export PORT="3333";
  export SWPORT="--port=${PORT}";
  export SWUSER="-u root";
  export SWPASS="-p${PRD_ERPHOST_PWD}";
  export ERP_DB="";
  startUpSSHTunnel;
  getErpNextDatabaseName;
  echo -e "Found database :: '${ERP_DB}'"
  processAllBulkInserts;
  # sleep 5;

  killSSHTunnel;

fi;
