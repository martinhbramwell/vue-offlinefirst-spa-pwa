#!/usr/bin/env bash
#
export HOST="localhost";
export URL="http://${HOST}:5984/ib201902_004/Invoice_1_000000000000";

export invoices=( "5218" );
# export invoices=( "5212" "5213" "5214" );
# export invoices=( "5211" "5212" "5213" "5214" "5215" "5216" "5217" "5218" "5219" "5220" "5221" "5222" "5223" "5224" "5225" "5226" "5227" "5228" "5229" "5230" "5231" "5232" "5233" "5234" "5235" "5236" "5237" "5238" "5239" "5240" "5241" "5242" "5243" "5244" "5245" "5246" "5247" "5248" "5249" "5250" "5251" "5252" "5253" "5254" "5255" "5256" "5257" "5258" "5259" "5260" "5261" );

# export attachments=( "invoiceXml" "invoiceSigned" "respuestaSRI" )
export attachments=( "respuestaSRI" )


for invoice in "${invoices[@]}"
do
  url=${URL}${invoice};
  # echo ${url};
  # curl -s ${url} | jq -r .data.codigo;
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
  jsonInvoice=$(curl -s ${url} | jq '.data.email |= "yourself.yourorg@gmail.com"');

  # ### For all 'invoices' remove all status flags 'accessKey, accepted, rejected, authorized, .authorizationStatus, emailed'
  # jsonInvoice=$(curl -s ${url} | jq 'del(.accessKey, .accepted, .rejected, .authorized, .authorizationStatus, .emailed)');

  # ### For all 'invoices' remove all status flags except 'accessKey'
  # jsonInvoice=$(curl -s ${url} | jq 'del(.accepted, .rejected, .authorized, .authorizationStatus, .emailed)');

  ### For all 'invoices' remove status flags 'authorized, .authorizationStatus, emailed'
  # jsonInvoice=$(curl -s ${url} | jq 'del(.authorized, .authorizationStatus, .emailed)');

  curl -H 'Accept: application/json' -H 'Content-Type: application/json' -X PUT ${url} -d "${jsonInvoice}";
done

echo "

.................................................

"
