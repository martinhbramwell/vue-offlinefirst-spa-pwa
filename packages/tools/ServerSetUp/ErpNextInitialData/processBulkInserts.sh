#!/usr/bin/env bash
#

# set -e;

export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

funcTitle () {
  mx=16; ttl=$1;
  let spcs="$mx - (${#ttl} / 2)"; str=$(printf "%${spcs}s");
  echo -e "\n~~~~~~${str// /' '} ${ttl}() ${str// /' '}~~~~~~";
};

export BULKS="${XDG_RUNTIME_DIR}/bulkDeletesInsertsAndUpdates.sql";

export HEADER="";
export COUCH_DB="http://${COUCH_ADMIN}:${COUCH_ROOT_PWD}@${COUCH_HOST_INTERNAL}/${COUCH_DATABASE}";
export DDOC_NAME="erpnext";

export HNDLRS="./docTypeHandlers";

declare SCRTS_DIR="${HOME}/.ssh/secrets";
source ${SCRTS_DIR}/vue-offlinefirst-spa-pwa.config;

urldecode(){
  echo -e "$(sed 's/+/ /g;s/%\(..\)/\\x\1/g;')"
}


generateDeletes () { funcTitle ${FUNCNAME[0]};
  declare JSN=( `tac "${HNDLRS}/docTypeMetaData.json"` );
  for RECORD in "${JSN[@]}"
  do
    declare REC=$(echo -e `echo ${RECORD} | sed 's/+/ /g;s/%/\\\\x/g;'`);
    declare PFX=$(echo "${REC}" | jq -r .prefix);
    declare TAB=$(echo "${REC}" | jq -r .name);
    if [ ${START} ]; then
      declare DEL=$(echo "${REC}" | jq -r .delete);
      if [[ -z ${DEL} ]]; then
        echo -e "/* No deletes from table 'tab$(echo "${REC}" | jq -r .name)' */" >> ${BULKS};
      else
        echo -e "Making Deletes for \`${TAB}\`";
        echo -e "DELETE FROM \`${PFX}${TAB//_/ }\` ${DEL};" >> ${BULKS};
      fi;
    # else
    #   echo -e "Skipping ${TAB}.";
    fi;
    [ "${TAB}" = "SKIP" ] && START=true;
  done;

  echo -e "Wrote deletes to '${BULKS}'.\n\n";
}


declare JSN=( `cat "${HNDLRS}/docTypeMetaData.json"` );
generateInserts () { funcTitle ${FUNCNAME[0]};
  declare SKIP=1;
  for RECORD in "${JSN[@]}"
  do
    declare REC=$(echo -e `echo ${RECORD} | sed 's/+/ /g;s/%/\\\\x/g;'`);
    declare TAB=$(echo "${REC}" | jq -r .name);
    declare PFX=$(echo "${REC}" | jq -r .prefix);
    [ "${TAB}" = "SKIP" ] && SKIP=0;
    # echo -e " ${TAB} == ${SKIP} ??"
    if [ ${SKIP} = 1 ]; then
      declare INS=$(echo "${REC}" | jq -r .insert);
      if [ "${INS}" = "true" ]; then
        declare COLS=$(echo "${REC}" | jq -r .cols);
        echo -e "Making Inserts for \`${TAB}\`";
        ./${HNDLRS}/docType_${TAB// /}.sh ${BULKS} ${COLS};
      else
        echo -e "No inserts for '${TAB}'."
      fi;
    else
      [ ${TAB} = "SKIP" ] || echo -e "Skipping ${TAB}."
    fi;
  done

  echo -e "Wrote inserts to '${BULKS}'.\n\n";
};


generateUpdates () { funcTitle ${FUNCNAME[0]};
  declare SKIP=1;
  for RECORD in "${JSN[@]}"
  do
    declare REC=$(echo -e `echo ${RECORD} | sed 's/+/ /g;s/%/\\\\x/g;'`);
    declare TAB=$(echo "${REC}" | jq -r .name);
    declare PFX=$(echo "${REC}" | jq -r .prefix);
    [ "${TAB}" = "SKIP" ] && SKIP=0;
    # echo -e " ${TAB} == ${SKIP} ??"
    if [ ${SKIP} = 1 ]; then
      declare UPD=$(echo "${REC}" | jq -r .update);
      if [ "${UPD}" = "true" ]; then
        declare COLS=$(echo "${REC}" | jq -r .cols);
        echo -e "Making Updates for \`${TAB}\`";
        ./${HNDLRS}/docType_${TAB// /}.sh ${BULKS} ${COLS};
      else
        echo -e "No updates for '${TAB}'."
      fi;
    else
      [ ${TAB} = "SKIP" ] || echo -e "Skipping ${TAB}."
    fi;

  done

  # UPDATE `_05037877cca8cff9`.`tabSocial Login Key`
  # SET creation=NULL, modified=NULL, modified_by=NULL, owner=NULL, docstatus=0, parent=NULL, parentfield=NULL, parenttype=NULL, idx=0, api_endpoint=NULL, client_secret=NULL, enable_social_login=0, user_id_property=NULL, custom_base_url=0, api_endpoint_args=NULL, icon=NULL, provider_name=NULL, auth_url_data=NULL, client_id=NULL, access_token_url=NULL, authorize_url=NULL, social_login_provider='Custom', redirect_url=NULL, base_url=NULL, `_user_tags`=NULL, `_comments`=NULL, `_assign`=NULL, `_liked_by`=NULL
  # WHERE name='';


  echo -e "Wrote updates to '${BULKS}'.\n\n";
}


refreshDesignDoc () { funcTitle ${FUNCNAME[0]};
  declare EXISTING_REVISION=$(curl -s ${HEADER} ${COUCH_DB}/_design/${DDOC_NAME} | jq -r ._rev);
  # curl -s ${HEADER} ${COUCH_DB}/_design/${DDOC_NAME};
  # echo -e "~~~~~~~~~~~~~~~~~~~~";
  echo -e "Delete design doc '${DDOC_NAME}'? :: ${EXISTING_REVISION}";
  if [ "${EXISTING_REVISION}" = "null" ]; then
    echo "View not found.";
  else
    echo "View exists. Deleting";
    # echo -e curl ${HEADER} -X DELETE ${COUCH_DB}/_design/${DDOC_NAME}?rev=${EXISTING_REVISION};
    curl ${HEADER} -X DELETE ${COUCH_DB}/_design/${DDOC_NAME}?rev=${EXISTING_REVISION};
  fi;

  echo -e "\nCreating design doc '${DDOC_NAME}'";
  curl ${HEADER} -X PUT --data "@Couch/design_erpNext.js" ${COUCH_DB}/_design/${DDOC_NAME};
};

# getAddresses () { funcTitle ${FUNCNAME[0]};
#   # declare ACCUM="${XDG_RUNTIME_DIR}/persons.sql";

# # name,address_title,address_line1,city,county,state,country,phone,email_id,address_type,is_primary_address
#   curl -s ${HEADER} ${COUCH_DB}/_design/${DDOC_NAME}/_view/addressExport \
#     | jq -r .rows[].value
#   echo -e "name,address_title,address_line1,city,county,state,country,phone,email_id,address_type";

# };

getPersons () { funcTitle ${FUNCNAME[0]};
  declare ACCUM="${XDG_RUNTIME_DIR}/persons.sql";
  echo -e "
DELETE FROM tabItem;

INSERT INTO
  tabItem
  (
    name,
    customer_name,
    customer_type,
    customer_group,
    territory,
    tax_id
  )
VALUES" > ${ACCUM};

  curl -s ${HEADER} ${COUCH_DB}/_design/${DDOC_NAME}/_view/personExport \
    | jq -r .rows[].value \
    | tee -a ${ACCUM} >/dev/null;

  sed -i '$s/\(.*\),/\1 /' ${ACCUM};

  cat ${ACCUM};

};


# getProducts () { funcTitle ${FUNCNAME[0]};
#   declare LOCAL_PRIVATE_DATA_DIR="/opt/ErpNext_DocTypeHandlers";
#   declare PRODUCTS="products.json";
#   declare DATA_SOURCE="${LOCAL_PRIVATE_DATA_DIR}/${PRODUCTS}";

#   declare ACCUM="${XDG_RUNTIME_DIR}/products.sql";

#   echo -e "
# DELETE FROM tabItem;

# INSERT INTO
#   tabItem
#   (
#     name,
#     item_code,
#     item_group,
#     stock_uom,
#     item_name,
#     is_stock_item,
#     include_item_in_manufacturing,
#     valuation_rate,
#     description,
#     shelf_life_in_days,
#     default_material_request_type,
#     weight_uom,
#     has_batch_no
#   )
# VALUES" > ${ACCUM};

#   # # cat products.json | jq -r '.[] | ("( \"`IB_00" + .id + "`\", \"IB_00" + .id + "\", \"Consumer\", \"Litre\",  \"" + .text + "\",  1,  1, " + .product_price + ",  \"" + .product_description + "\", 365, \"Manufacture\", \"Litre\",   1" + ", \"\", \"\", \"\", \"\", \"\", \"`27ba96373e`\"" + ", " + "\"Iridium Blue\", " + "\"Stores - IB\" ),")' \
#   cat ${DATA_SOURCE} | jq -r '.[] | ("  ( \"`IB_00" + .id + "`\", \"IB_00" + .id + "\", \"Consumer\", \"Litre\", \"" + .text + "\", 1, 1, " + .product_price + ", \"" + .product_description + "\", 365, \"Manufacture\", \"Litre\", 1" + " ),")' \
#     | tee -a ${ACCUM} >/dev/null;

#   sed -i '$s/\(.*\),/\1 /' ${ACCUM};

#   echo -e ";" >> ${ACCUM};

#   cat ${ACCUM} >> ${BULKS};
# };

ensureConn () { # funcTitle ${FUNCNAME[0]};
  TRIES="$(seq 10)"; DELAY=2;
  # declare OPTS="${SWHOST} ${SWPORT} ${SWUSER} ${SWPASS}";
  echo -e "OPTS = ${OPTS}";
  for i in ${TRIES};
    do echo "SELECT NOW()" | mysql -A ${OPTS} && break || sleep ${DELAY};
  done;
};



startUpSSHTunnel () { # funcTitle ${FUNCNAME[0]};
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

getErpNextDatabaseName () { # funcTitle ${FUNCNAME[0]};
  declare DBS_LIST="${XDG_RUNTIME_DIR}/erpnext_databases.txt";
  echo "show databases" | mysql ${SWITCHES} > ${DBS_LIST};
  sed -i '/schema/d;/mysql/d;/atabase/d' ${DBS_LIST};
  # echo -e "cat \${DBS_LIST}";
  # cat ${DBS_LIST}
  ERP_DB=$(cat ${DBS_LIST});
};

# bulkInserts () { funcTitle ${FUNCNAME[0]};

#   declare BAPU_SESSION_COOKIE_FILE="${SCRTS_DIR}/BAPU_Session_id.sh";
#   if [[ -f ${BAPU_SESSION_COOKIE_FILE} ]]; then
#     source ${BAPU_SESSION_COOKIE_FILE};
#     echo -e "\n~~~~~\nCookie :: ${BAPU_SESSION_COOKIE}";

#     for ITEM in "${ORDERED_LIST_OF_BULK_DOC_TYPES[@]}"
#     do
#       SKIP="$(echo ${ITEM} | cut -d'|' -f1)";
#       DOC_TYPE="$(echo ${ITEM} | cut -d'|' -f2)";
#       if [[ ${SKIP} -lt 1 ]]; then
#         if [[ -f "${SCRIPT_DIR}/${HANDLERS}/docType_${DOC_TYPE}.sh" ]]; then
#           echo -e "\n\nAPI insert to '${DOC_TYPE//_/ }' doc type.";
#           ${SCRIPT_DIR}/${HANDLERS}/docType_${DOC_TYPE}.sh "${BASE_URL}" "${AUTH}";
#         else
#           echo -e "\n\nAPI insert to '${DOC_TYPE//_/ }' doc type, with docType_GenericType.sh.";
#           ${SCRIPT_DIR}/${HANDLERS}/docType_GenericType.sh "${DOC_TYPE}" "${BASE_URL}" "${AUTH}";
#         fi
#       fi;
#     done;

#   else
#     echo -e "\n~~~~~\nCannot retrieve BAPU session key from '${BAPU_SESSION_COOKIE_FILE}'";
#     exit 1;
#   fi;
# };


declare TMP_DIR="/dev/shm";
apiInsertsAndUpdates () { funcTitle ${FUNCNAME[0]};

  declare BAPU_SESSION_COOKIE_FILE="${SCRTS_DIR}/BAPU_Session_id.sh";
  if [[ -f ${BAPU_SESSION_COOKIE_FILE} ]]; then
    source ${BAPU_SESSION_COOKIE_FILE};
    echo -e "\n~~~~~\nCookie :: ${BAPU_SESSION_COOKIE}";

    for ITEM in "${ORDERED_LIST_OF_BULK_DOC_TYPES[@]}"
    do
      ACTION="$(echo ${ITEM} | cut -d'|' -f1)";
      DOC_TYPE="$(echo ${ITEM} | cut -d'|' -f2)";

      if [[ "${ACTION}" == "I" ]]; then
        echo -e "\nPOST ${DOC_TYPE}";
        ${SCRIPT_DIR}/${HANDLERS}/docType_GenericType.sh "${DOC_TYPE}" "${BASE_URL}" "${AUTH}";
      elif [[ "${ACTION}" == "U" ]]; then
        declare REC_NAME=$(cat ./${HANDLERS}/docType_${DOC_TYPE}.json | jq -r .name);
        declare TMP_NAME=${REC_NAME//./};
        echo -e "\nPUT ${DOC_TYPE}/${REC_NAME}";

        declare RESOURCE="${DOC_TYPE//_/%20}/${REC_NAME// /%20}";
        declare DATA_FILE="${TMP_DIR}/${DOC_TYPE}_${TMP_NAME// /}.json";
        declare RSLT_FILE="${TMP_DIR}/${DOC_TYPE}_${TMP_NAME// /}_RESULT.json";

        # cat ./${HANDLERS}/docType_${DOC_TYPE}.json | jq -r .data;
        cat ./${HANDLERS}/docType_${DOC_TYPE}.json | jq -r .data > "${DATA_FILE}";
        # echo -e "\n${REC_DATA}";
        # echo -e "curl -X PUT \"${BASE_URL}/resource/${DOC_TYPE//_/%20}/${REC_NAME// /%20}\" -H \"${AUTH}\" -d \"@/dev/shm/${DOC_TYPE// /}_${TMP_NAME// /}.json\"";
        curl -sX PUT ${BASE_URL}/resource/${RESOURCE} -H "${AUTH}" -d @${DATA_FILE} > ${RSLT_FILE};
        echo -e "Updated ${DOC_TYPE}/${REC_NAME}";
      elif [[ "${ACTION}" == "S" ]]; then
        echo -e "\nRun ${DOC_TYPE} special handler.";
        ${SCRIPT_DIR}/${HANDLERS}/docType_${DOC_TYPE}.sh "${BASE_URL}" "${AUTH}" "${BAPU_SESSION_COOKIE}";
      else

        echo -e "Skip ${DOC_TYPE}";
      fi;
      # #   echo -e "Insert ${DOC_TYPE}"
      # #   if [[ -f "${SCRIPT_DIR}/${HANDLERS}/docType_${DOC_TYPE}.sh" ]]; then
      # #     echo -e "\n\nAPI insert to '${DOC_TYPE//_/ }' doc type.";
      # #     ${SCRIPT_DIR}/${HANDLERS}/docType_${DOC_TYPE}.sh "${BASE_URL}" "${AUTH}";
      # #   else
      # #     echo -e "\n\nAPI insert to '${DOC_TYPE//_/ }' doc type, with docType_GenericType.sh.";
      # #     ${SCRIPT_DIR}/${HANDLERS}/docType_GenericType.sh "${DOC_TYPE}" "${BASE_URL}" "${AUTH}";
      # #   fi
      # # fi;
    done;

  else
    echo -e "\n~~~~~\nCannot retrieve BAPU session key from '${BAPU_SESSION_COOKIE_FILE}'";
    exit 1;
  fi;
};

# singleInserts () { funcTitle ${FUNCNAME[0]};

#   for ITEM in "${ORDERED_LIST_OF_SINGLE_LINE_DOC_TYPES[@]}"
#   do
#     SKIP="$(echo ${ITEM} | cut -d'|' -f1)";
#     DOC_TYPE="$(echo ${ITEM} | cut -d'|' -f2)";
#     if [[ ${SKIP} -lt 1 ]]; then
#       echo -e "\n\nAPI insert to '${DOC_TYPE}; doc type.";
#       curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;
#     else
#       echo -e "\n\nSkipped API insert of '${DOC_TYPE};";
#     fi;
#     # do something on $var
#   done

#     # declare DOC_TYPE="Company";
#     # echo -e "\n~~~~~\nInserting :: ${DOC_TYPE}";
#     # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;

#     # declare DOC_TYPE="Sales_Taxes_and_Charges_Template";
#     # echo -e "\n~~~~~\nInserting :: ${DOC_TYPE}";
#     # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;

#     # declare DOC_TYPE="Tax_Category";
#     # echo -e "\n~~~~~\nInserting :: ${DOC_TYPE}";
#     # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;

#     # declare DOC_TYPE="Email_Domain";
#     # echo -e "\n~~~~~\nInserting :: ${DOC_TYPE}";
#     # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;

#     # declare DOC_TYPE="Email_Account";
#     # echo -e "\n~~~~~\nInserting :: ${DOC_TYPE}";
#     # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;


#     # declare DOC_TYPE="User";
#     # echo -e "\n~~~~~\nInserting :: ${DOC_TYPE}";
#     # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;
# };

# singleInsertsAndUpdates () { funcTitle ${FUNCNAME[0]};

#   for ITEM in "${ORDERED_LIST_OF_SINGLE_LINE_DOC_TYPES[@]}"
#   do
#     TASK="$(echo ${ITEM} | cut -d'|' -f1)";
#     DOC_TYPE="$(echo ${ITEM} | cut -d'|' -f2)";
#     if [[ "${TASK}" == "I" ]]; then
#       echo -e "\n\nAPI insert to '${DOC_TYPE}; doc type.";
#       # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;
#     else if [[ "${TASK}" == "U" ]]; then
#       echo -e "\n\nAPI update to '${DOC_TYPE}; doc type.";
#       # curl -X POST ${BASE_URL}/${DOC_TYPE//_/%20} -H "${AUTH}" -d @./${HANDLERS}/docType_${DOC_TYPE}.json;
#     else
#       echo -e "\n\nSkipped API tasks for '${DOC_TYPE};";
#     fi;
#   done
# };

apiDeletes () { # funcTitle ${FUNCNAME[0]};

  for ITEM in "${ORDERED_LIST_OF_DOC_TYPE_DELETES[@]}"
  do
    SKIP="$(echo ${ITEM} | cut -d'|' -f1)";
    DOC_TYPE="$(echo ${ITEM} | cut -d'|' -f2)";
    A_DOC="$(echo ${ITEM} | cut -d'|' -f3)";
    echo "'${SKIP}' '${DOC_TYPE}' '${A_DOC}'";
    if [[ ${SKIP} -lt 1 ]]; then
      echo -e "\n\nAPI delete from '${DOC_TYPE}' doc type.";
      echo -e "curl -s -X DELETE ${BASE_URL}/${DOC_TYPE//_/%20}/${A_DOC} -H '${AUTH}')";
      declare RESPONSE=$( curl -s -X DELETE ${BASE_URL}/${DOC_TYPE//_/%20}/${A_DOC} -H "${AUTH}");
      echo -e "< ${RESPONSE} >";
      if echo -e ${RESPONSE} | jq .message &>/dev/null; then
        # echo "Inserted into ${DATA_TYPE//_/%20}";
        echo -e "Curl deletion response :: '${RESPONSE}', for doc type ${DOC_TYPE//_/ }";
      else
        echo -e "Error response when deleting '${DOC_TYPE//_/ }'.";
        echo -e "${RESPONSE}" > /dev/shm/${DOC_TYPE}_error.html;
      fi;
    fi;
    # do something on $var
  done
};

processApiDeletes () { funcTitle ${FUNCNAME[0]};

  declare KEYS_FILE="${SCRTS_DIR}/ErpNext_API_Keys.sh";
  if [ ! -f ${KEYS_FILE} ]; then
    echo -e "Could not find :: '${KEYS_FILE}'
    It should be found in Drive file '${ERP_NEXT_BKUP_NAME}.tar.gz.b64' ('${ERP_NEXT_BKUP_ID}')";
  fi;
  source ${KEYS_FILE};

  echo -e "/* ~~~~~~ cURLing JSON format deletes to API ~~~~~~ */\n";

  declare BASE_URL="${ERPNEXT_PROTOCOL}://${ERPNEXT_HOST}/${ERPNEXT_ROUTE}";
  export AUTH="Authorization: token ${KEYS}";

  declare processDeletes=1;
  if [[ ${processDeletes} = 1 ]]; then
    apiDeletes;
  else
    echo -e "\n\n\n *** ${SCRIPT_NAME} -- Skipped 'apiDeletes()' ***\n\n";
  fi;

  echo -e "/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */\n\n";
};


processApiCalls () { funcTitle ${FUNCNAME[0]};

  declare KEYS_FILE="${SCRTS_DIR}/ErpNext_API_Keys.sh";
  if [ ! -f ${KEYS_FILE} ]; then
    echo -e "Could not find :: '${KEYS_FILE}'
    It should be found in Drive file '${ERP_NEXT_BKUP_NAME}.tar.gz.b64' ('${ERP_NEXT_BKUP_ID}')";
  fi;
  source ${KEYS_FILE};

  echo -e "/* ~~~~~~ cURLing JSON format inserts to API ~~~~~~ */\n\n";

  declare BASE_URL="${ERPNEXT_PROTOCOL}://${ERPNEXT_HOST}/api";
  export AUTH="Authorization: token ${KEYS}";

  declare HANDLERS="docTypeHandlers";

  # declare processSingles=1;
  # if [[ ${processSingles} = 1 ]]; then
  #   singleInsertsAndUpdates;
  # else
  #   echo -e "\n\n\n *** ${SCRIPT_NAME} -- Skipped 'singleInsertsAndUpdates()' ***\n\n";
  # fi;

  declare processBulks=1;
  if [[ ${processBulks} = 1 ]]; then
    apiInsertsAndUpdates;
  else
    echo -e "\n\n\n *** ${SCRIPT_NAME} -- Skipped 'apiInsertsAndUpdates()' ***\n\n";
  fi;


  echo -e "/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */\n\n";
};


processAllBulkSql () { funcTitle ${FUNCNAME[0]};
  declare DATABASE="--database ${ERP_DB}";
  OPTS="${SWHOST} ${SWPORT} ${SWUSER} ${SWPASS} ${DATABASE}";
  # echo ${BULKS};
  mysql -A ${OPTS} < ${BULKS};
  # echo -e "mysql -A ${OPTS} < ${BULKS};"
};


processSqlCommands () { funcTitle ${FUNCNAME[0]};

  echo -e "/* Bulk deletes, inserts and updates from BAPU to ErpNext */\n" > ${BULKS};

  echo -e "    /* Bulk Deletes */\n" >> ${BULKS};
  generateDeletes;
  echo -e "\n\n    /* Bulk Inserts */\n" >> ${BULKS};
  generateInserts;
  echo -e "\n\n    /* Bulk Updates */\n" >> ${BULKS};
  generateUpdates;
  # echo -e "\n\n/* ~~~~~~~~~ Curtailed ~~~~~~~ ${BULKS} ~~~~~_~~~ */";
  # exit;

  export KILLME=-1;
  export SWHOST="--host=127.0.0.1";
  export PORT="3333";
  export SWPORT="--port=${PORT}";
  export SWUSER="-u root";
  export SWPASS="-p${PRD_ERPHOST_PWD}";
  export ERP_DB="";
  export SWITCHES="-A ${SWHOST} ${SWPORT} ${SWUSER} ${SWPASS}";
  startUpSSHTunnel;
  echo -e "
  Probably connected. Can get database name??";
  getErpNextDatabaseName;
  echo -e "Found database :: '${ERP_DB}'";
  SWITCHES="${SWITCHES} --database ${ERP_DB}";
  processAllBulkSql;
  sleep 5;
  killSSHTunnel;
};

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then


  # refreshDesignDoc;
  # # cat ${BULKS};
  # # getPersons;

  # export ORDERED_LIST_OF_SINGLE_LINE_DOC_TYPES=(
  #   "I|Customer"
  # );
    # "I|Customer                                    (is backed up already)"

  export ORDERED_LIST_OF_DOC_TYPE_DELETES=(
    # "0|Blog_Post|Welcome"
  );

  export ORDERED_LIST_OF_BULK_DOC_TYPES=(
    # "S|Chart_of_Accounts_Importer"
    # "U|Company"
    # "I|Tax_Category"
    # "I|Sales_Taxes_and_Charges_Template"
    # "I|Email_Domain"
    # "I|Email_Account"
    # "I|User"
    # "S|FiscalYear"
    # "S|WarehouseType"
    # "S|Warehouse"
    # "I|Blog_Post"
    # "I|Web_Page"
    # "I|Homepage_Section"

    # "I|UOM"
    # "I|Supplier_Group"
    # "I|Supplier"

    # "I|Item_Attribute"
    # "I|Item_Group"
    # "I|Item"
    # "I|Workstation"
    # "I|Operation"
    # "I|Routing"
    "I|BOM"

    "S|Customer"
  );

  # export ORDERED_LIST_OF_BULK_DOC_TYPES=(
  #   "I|Item"
  # );


  # export ORDERED_LIST_OF_BULK_DOC_TYPES=(
  #   # "S|Chart_of_Accounts_Importer"
  #   # "I|Account"
  #   # "U|Company"
  #   # "I|Warehouse"
  #   # "I|UOM"
  #   # "I|Item_Attribute"
  #   # "I|Item_Group"
  #   # "I|Supplier_Group"
  #   # "I|Supplier"
  #   # "I|Purchase_Taxes_and_Charges_Template"
  #   # "U|Mode_of_Payment"
  #   # "I|Account_Type"
  #   # "S|WarehouseType"
  #   # "I|Bank"
  #   # "I|Bank_Account"
  #   # "I|Item"
  #   # "I|Manufacturer"
  #   # "I|Item_Manufacturer"
  #   # "I|Workstation"
  #   # "I|Operation"
  #   # "I|Routing"
  #   # "I|BOM"
  #   # "I|Material_Request"
  # );

  processApiDeletes;

  processApiCalls;

  # processSqlCommands;

  echo -e "\n\n/* <~~~~~~~~~~~~~~ Curtailed ~~~~~~~~~~~~~~~> */";
  exit;

fi;

# echo -e "${BASE_URL}";
# echo -e "\n\n/* ~~~~~~~~~ Curtailed ~~~~~~~~~~~~~~~ */";
# exit;

