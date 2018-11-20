#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

export COUCH_DATABASE=${1:-$COUCH_DATABASE};
export CONFIG_FILE="${HOME}/.ssh/secrets/offsppwa-vue.config";

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



export QUERY="Product_1_0000000000000002";
export FULL_URL="${COUCH_URL}/${COUCH_DATABASE}/${QUERY}";
export FIELD=".*unidad.*";
export NEW_FIELD="    \"unidad\": \"$(echo $RANDOM % 1000 + 1 | bc) litros\",";

generate_post_data()
{
  PRODUCT_2=$(curl -sH "Content-type: application/json" "${FULL_URL}" | jq -r .);
  echo -e "${PRODUCT_2}" | sed "s/${FIELD}/${NEW_FIELD}/";
}

# export NEW_PRODUCT_2=$(generate_post_data);
# echo -e ${NEW_PRODUCT_2};

curl --silent --include \
  --header "Accept: application/json" \
  --header "Content-Type:application/json" \
  --request PUT \
  --data "$(generate_post_data)" ${FULL_URL}  > /dev/null

curl -sH "Content-type: application/json" "${COUCH_URL}/${COUCH_DATABASE}/${QUERY}"
