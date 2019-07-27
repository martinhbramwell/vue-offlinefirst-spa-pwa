#!/usr/bin/env bash
#
export HOST="localhost";
export URL="http://${HOST}:5984/ib201902_004/Invoice_1_000000000000";

export invoices=( "5208" "5209" "5210" "5211" "5212" "5213" );
# export invoices=( "5205" "5206" "5207" "5208" "5209" "5210" "5211" "5212" "5213" "5214" "5215" "5216" "5217" "5218" "5219" "5220" "5221" "5222" "5223" "5224" "5225" "5226" "5227" "5228" "5229" "5230" );

export attachments=( "invoiceXml" "invoiceSigned" "respuestaSRI" )


for invoice in "${invoices[@]}"
do
  url=${URL}${invoice};
  rev=$(curl -s ${url} | jq -r ._rev);
  # ### Loop through 'invoices' deleting any attachment named in 'attachments'
  # for attachment in "${attachments[@]}"
  # do
  #   # echo
  #   rev2=$(curl -s -X 'DELETE' ${url}/${attachment}?rev=${rev} | jq -r .rev)
  #   rev=$(curl -s ${url} | jq -r ._rev);
  #   echo "rev : ${rev}  rev2 : ${rev2}";
  # done
  echo -e "
  "
  ### For all 'invoices' change email address to "yourself.yourorg@gmail.com"
  # jsonInvoice=$(curl -s ${url} | jq '.data.email |= "yourself.yourorg@gmail.com"');
  # curl -H 'Accept: application/json' -H 'Content-Type: application/json' -X PUT ${url} -d "${jsonInvoice}";

  ### For all 'invoices' remove status flags 'accessKey, accepted, rejected, authorized, emailed'
  # jsonInvoice=$(curl -s ${url} | jq 'del(.accessKey, .accepted, .rejected, .authorized, .emailed)');

  ### For all 'invoices' remove status flags 'authorized, emailed'
  jsonInvoice=$(curl -s ${url} | jq 'del(.authorized, .emailed)');
  curl -H 'Accept: application/json' -H 'Content-Type: application/json' -X PUT ${url} -d "${jsonInvoice}";
done

echo "

.................................................

"
