#!/usr/bin/env bash
#
funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
}

getProducts () { funcTitle ${FUNCNAME[0]};
  declare ACCUM="${XDG_RUNTIME_DIR}/products.sql";

  echo -e "
DELETE FROM tabItem;

INSERT INTO
  tabItem
  (
    name,
    item_code,
    item_group,
    stock_uom,
    item_name,
    is_stock_item,
    include_item_in_manufacturing,
    valuation_rate,
    description,
    shelf_life_in_days,
    default_material_request_type,
    weight_uom,
    has_batch_no
  )
VALUES" > ${ACCUM};

  # cat products.json | jq -r '.[] | ("( \"`IB_00" + .id + "`\", \"IB_00" + .id + "\", \"Consumer\", \"Litre\",  \"" + .text + "\",  1,  1, " + .product_price + ",  \"" + .product_description + "\", 365, \"Manufacture\", \"Litre\",   1" + ", \"\", \"\", \"\", \"\", \"\", \"`27ba96373e`\"" + ", " + "\"Iridium Blue\", " + "\"Stores - IB\" ),")' \
  cat products.json | jq -r '.[] | ("  ( \"`IB_00" + .id + "`\", \"IB_00" + .id + "\", \"Consumer\", \"Litre\", \"" + .text + "\", 1, 1, " + .product_price + ", \"" + .product_description + "\", 365, \"Manufacture\", \"Litre\", 1" + " ),")' \
    | tee -a ${ACCUM} >/dev/null;

  sed -i '$s/\(.*\),/\1 /' ${ACCUM};

  echo -e ";" >> ${ACCUM};

  cat ${ACCUM} >> ${BULKS};
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
  # cat ${BULKS};
  mysql -A ${OPTS} < ${BULKS};
  # echo -e "SELECT * FROM tabItem;" | mysql -A ${OPTS};

};

export BULKS="./bulkInserts.sql";
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "\n+ ~~~~~~ GetBAPUProducts.sh ~~~~~~ +";
  source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

  echo -e "/* Bulk inserts from BAPU to ErpNext */" > ${BULKS};

  getProducts;
  # exit;

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
  echo -e "Found database :: '${ERP_DB}'";
  processAllBulkInserts;
  # sleep 5;

  killSSHTunnel;

fi;
