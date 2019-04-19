#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

export COUCH_DATABASE=${1:-$COUCH_DATABASE};
export CONFIG_FILE="${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config";

function usage() {
  echo "Usage: ./TestGet.sh \$COUCH_DATABASE";
  echo "       ALSO: 'COUCH_URL' must be specified in ${CONFIG_FILE}";
  exit 1;
}

if [[ ! -f ${CONFIG_FILE} ]]; then
  echo -e "Error: Found no file :: ${CONFIG_FILE}";
  usage;
fi;

source ${CONFIG_FILE};

if [[ -z "$COUCH_URL" ||  -z "$COUCH_DATABASE" ]]; then
  usage;
fi;

timestamp() {
  date +"%Y%m%d%H%M%S";
}

fecha() {
  date +"%Y-%m-%d %H:%M:%S";
}

# ##
# # export QUERY="_security";
# # export QUERY="_design/persons/_view/minimal_person";
# export QUERY="_design/visible/_view/compact_person";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";

# curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}?since=0&limit=10";
# # curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}";


# export QUERY="_design/visible/_view/compact_bottle";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";

# curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}?since=0&limit=10";


# export QUERY="_design/visible/_view/compact_movement";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";

# curl -H "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}?since=0&limit=10";

# ----------------------------------------------------------------------------------------
# export dataset="bottle";
# export QUERY="_design/visible/_view/count_${dataset}";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";
# echo -e "# of ${dataset} records : $(curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}" | jq -r .rows[0].value)";

# export dataset="person";
# export QUERY="_design/visible/_view/count_${dataset}";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";
# echo -e "# of ${dataset} records : $(curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}" | jq -r .rows[0].value)";

# export dataset="invoice";
# export QUERY="_design/visible/_view/count_${dataset}";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";
# echo -e "# of ${dataset} records : $(curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}" | jq -r .rows[0].value)";

# export dataset="movement";
# export QUERY="_design/visible/_view/count_${dataset}";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";
# echo -e "# of ${dataset} records : $(curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}" | jq -r .rows[0].value)";

# export dataset="product";
# export QUERY="_design/visible/_view/count_${dataset}";
# echo -e "
# Getting test query: ${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";
# echo -e "# of ${dataset} records : $(curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}" | jq -r .rows[0].value)";

# Test "count_movement" view
# export QUERY="_design/visible/_view/count_movement";
# echo curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}"

export FULL_URL="${COUCH_URL}/${COUCH_DATABASE}";

if [[ 1 == 0 ]]; then # Database data
  export QUERY="aPerson_1_0000000000000018";

  # export FIELD="ruc_cedula";
  # export FIELD="tipo_de_documento";
  # export FIELD="nombre";
  # export FIELD="direccion";
  # export FIELD="telefono_1";
  export FIELD="telefono_2";
  # export FIELD="mobile";
  # export FIELD="distribuidor";
  # export FIELD="email";

  export REPLACEMENT="    \"${FIELD}\": \"$(echo $RANDOM % 1000 + 1 | bc)\",";

  # export QUERY="Invoice_1_0000000000000001";
  # export FIELD="notas";
  # export REPLACEMENT="    \"${FIELD}\": \"$(echo $RANDOM % 1000 + 1 | bc) litros\",";

  # export QUERY="aPerson_1_0000000000000001";
  # export FIELD="email";
  # export REPLACEMENT="    \"${FIELD}\": \"$(echo $RANDOM % 1000 + 1 | bc) litros\",";


  export PATTERN=".*${FIELD}.*";
  generate_post_data()
  {
    PUTDATA=$(curl -sH "Content-type: application/json" "${FULL_URL}" | jq -r .);
    echo -e "${PUTDATA}" | sed "s/${PATTERN}/${REPLACEMENT}/";
  }

  # export NEW_PRODUCT_2=$(generate_post_data);
  # echo -e ${NEW_PRODUCT_2};

  echo -e "Updating person '${QUERY}' in database '${COUCH_DATABASE}'..."
  curl --silent --include \
    --header "Accept: application/json" \
    --header "Content-Type:application/json" \
    --request PUT \
    --data "$(generate_post_data)" ${FULL_URL} > /dev/null

  echo -e "... fetching result."
  curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}"
fi;



if [[ 1 == 0 ]]; then # Database data

  export ID="Request_2_$(timestamp)_Invoice";

  read -r -d '' PUTDATA <<EOF
{
  "data": {
    "idib": 5,
    "type": "invoice",
    "fecha": "$(fecha)",
    "codigo": "001-001",
    "sucursal": 1,
    "pdv": 1,
    "sequential": 0,
    "idCliente": 347,
    "nombreCliente": "Santiago Mora Cevallos",
    "idResponsable": 6,
    "nombreResponsable": "Segundo Morales",
    "estado": "P",
    "subTotalConImpuesto": 6.25,
    "subTotalSinImpuesto": 0,
    "subTotal": 6.25,
    "totalImpuesto": 0.75,
    "total": 7,
    "descuento": 0,
    "notas": "",
    "count": 1,
    "itemes": [
      {
        "idItem": 1,
        "idProducto": 1,
        "nombreProducto": "Agua IridiumBlue",
        "cantidad": 1,
        "descuento": 6,
        "precio": 6.25,
        "total": 6.25,
        "impuesto": 6
      }
    ]
  },
  "meta": {
    "type": "Request",
    "handler": "InvoiceCreate"
  },
  "_id": "${ID}"
}
EOF

  generatePutData()
  {
    echo -e "${PUTDATA}";
  }

  export QUERY_URL=${FULL_URL}/${ID};
  echo -e "Submitting new record '${ID}' to database '${COUCH_DATABASE}'..."

  echo -e "curl --silent --include \
    --header 'Accept: application/json' \
    --header 'Content-Type:application/json' \
    --request PUT \
   --data "$(generatePutData)" ${QUERY_URL} >/dev/null";

  echo -e "... fetching result.";
  echo -e "curl -sH 'Content-type: application/json' ${QUERY_URL};"
fi;


# if [[ 1 == 1 ]]; then # Database data

#   echo -e "
#   Ready to purge CouchDb database '${COUCH}'!!
#   -----------------------------------------$(head -c ${#COUCH} < /dev/zero | tr '\0' '-')---
#   ";
#   read -p "Type 'y' to confirm? " -n 1 -r
#   echo    # (optional) move to a new line
#   if [[ ! $REPLY =~ ^[Yy]$ ]]
#   then
#     echo -e "Quitting..."
#     exit 0;
#   fi

#   export QUERY_URL=${FULL_URL}/_purge;

#   echo -e "... purging  '${QUERY_URL}'.";
#   curl -sH 'Content-type: application/json' -X POST ${QUERY_URL};

# fi;

if [[ 1 == 1 ]]; then # Database data

  export DESIGN_NAME='bapu';

  export VIEW_NAME='latestInvoice';
  export UPD_VIEW='update=true';
  export SORT_VIEW='&descending=true';
  export LIMIT_VIEW='&limit=1';
  export VIEWOPTIONS=${VIEW_NAME}?${UPD_VIEW}${SORT_VIEW}${LIMIT_VIEW};

  export QUERY_URL=${FULL_URL}/_design/${DESIGN_NAME}/_view/${VIEWOPTIONS};

  echo -e "... fetching from view WITH '${QUERY_URL}'.";
  curl -sH 'Content-type: application/json' ${QUERY_URL};

fi;
