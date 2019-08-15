#!/usr/bin/env bash
#
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

# export COUCH_PROTOCOL="http"; export COUCH_HOST="localhost";
export URL="${COUCH_PROTOCOL}://${COUCH_HOST}/${COUCH_DATABASE_NAME}_${VERSION}/Invoice_1_000000000000";

export invoices=( "5327" );
# export invoices=( "0000" );

export attachments=( "invoiceXml" "invoiceSigned" "respuestaSRI" )
# export attachments=( "respuestaSRI" )


for invoice in "${invoices[@]}"
do
  url=${URL}${invoice};
  # echo ${url};
  # curl -s ${url} | jq -r .data.codigo;
  rev=$(curl -s ${url} | jq -r ._rev);
  ### Loop through 'invoices' deleting any attachment named in 'attachments'
  for attachment in "${attachments[@]}"
  do
    # echo
    rev2=$(curl -s -X 'DELETE' ${url}/${attachment}?rev=${rev} | jq -r .rev)
    rev=$(curl -s ${url} | jq -r ._rev);
    echo "rev : ${rev}  rev2 : ${rev2}";
  done
  echo -e "......
  "
  # ### For each member of 'invoices' change email address to "yourself.yourorg@gmail.com"
  # jsonInvoice=$(curl -s ${url} | jq '.data.email |= "yourself.yourorg@gmail.com"');

  # ### For each member of 'invoices' change email address to "logichemec@gmail.com"
  # # jsonInvoice=$(curl -s ${url} | jq '.data.email |= "logichemec@gmail.com"');

  # curl -H 'Accept: application/json' -H 'Content-Type: application/json' -X PUT ${url} -d "${jsonInvoice}";

  # echo -e " .......
  # "

  ### For all 'invoices' remove all status flags 'accessKey, accepted, rejected, authorized, .authorizationStatus, emailed'
  jsonInvoice=$(curl -s ${url} | jq 'del(.accessKey, .accepted, .rejected, .authorized, .authorizationStatus, .emailed)');

  # ### For all 'invoices' remove all status flags except 'accessKey'
  # jsonInvoice=$(curl -s ${url} | jq 'del(.accepted, .rejected, .authorized, .authorizationStatus, .emailed)');

  # ### For all 'invoices' remove status flags 'authorized, .authorizationStatus, emailed'
  # # jsonInvoice=$(curl -s ${url} | jq 'del(.authorized, .authorizationStatus, .emailed)');

  # curl -H 'Accept: application/json' -H 'Content-Type: application/json' -X PUT ${url} -d "${jsonInvoice}";
done

echo "

.................................................

";

