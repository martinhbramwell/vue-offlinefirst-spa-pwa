#!/usr/bin/env bash
#
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

# export COUCH_PROTOCOL="http"; export COUCH_HOST="localhost";
export URL="${COUCH_PROTOCOL}://${COUCH_HOST}/${COUCH_DATABASE_NAME}_${VERSION}/Invoice_1_000000000000";

export invoices=( "9999" );
# export invoices=( "5337" "5338" "5339" "5340" "5341" "5342" "5343" "5345" "5347" "5348" "5349" "5350" "5351" "5352" "5353" "5354" "5355" "5356" "5357" "5358" "5359" "5360" "5361" "5362" "5363" "5364" "5365" "5366" "5367" "5368" );
# export invoices=( "5310" "5311" "5312" "5313" "5314" "5315" "5316" "5317" "5318" "5319" "5320" "5321" "5322" "5323" "5324" "5327" "5328" "5330" "5331" "5332" "5333" "5334" "5335" "5336" "5337" "5338" "5339" "5340" "5341" "5342" "5343" "5345" "5347" "5348" "5349" "5350" "5351" "5352" "5353" "5354" "5355" "5356" "5357" "5358" "5359" "5360" "5361" "5362" "5363" "5364" "5365" "5366" "5367" "5368" );

export attachments=( );
# export attachments=( "respuestaSRI" );
# export attachments=( "invoiceXml" "invoiceSigned" "respuestaSRI" );

# export fakeEmailTarget="yourself.yourorg@gmail.com";
export fakeEmailTarget="";

export statusFlags="";
# export statusFlags=".hold, .emailed";
# export statusFlags=".hold, .authorized, .authorizationStatus, .emailed";
# export statusFlags=".hold, .accepted, .rejected, .authorized, .authorizationStatus, .emailed";
# export statusFlags=".hold, .accessKey, .accepted, .rejected, .authorized, .authorizationStatus, .emailed";

echo -e "For these invoices...";
for invoice in "${invoices[@]}"
do
  url=${URL}${invoice};
  echo -e " -- ${url}";
done;

if [ ${#attachments[@]} -eq 0 ]; then
  echo "Will not alter attachments"
else
  echo -e "Will remove attachments...";
  for attachment in "${attachments[@]}"
  do
    echo -e " -- ${attachment}";
  done;
fi;

if [ -z "${fakeEmailTarget}" ];
then
  echo "Will not alter email address"
else
  echo "Will set customer to email address to '${fakeEmailTarget}'";
fi;

if [ -z "${statusFlags}" ];
then
  echo "Will not alter status flags"
else
  echo "Will REMOVE status flags: '${statusFlags}'";
fi;

echo "
";

read -p "Are you sure? " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  for invoice in "${invoices[@]}"
  do
    url=${URL}${invoice};
    if [ ${#attachments[@]} -eq 0 ]; then
      echo "Attachments not altered."
    else
      # echo ${url};
      # curl -s ${url} | jq -r .data.codigo;
      rev=$(curl -s ${url} | jq -r ._rev);
      ### Loop through 'invoices' deleting any attachment named in 'attachments'
      for attachment in "${attachments[@]}"
      do
        # echo "'DELETE' ${url}/${attachment}?rev=${rev}";
        rev2=$(curl -s -X 'DELETE' ${url}/${attachment}?rev=${rev} | jq -r .rev)
        rev=$(curl -s ${url} | jq -r ._rev);
        echo "rev : ${rev}  rev2 : ${rev2}";
      done
    fi;

    if [ -z "${fakeEmailTarget}" ];
    then
      echo "Email target not altered."
    else
      ### For each member of 'invoices' change email address to "${fakeEmailTarget}"
      jsonInvoice=$(curl -s ${url} | jq --arg EMAILID "${fakeEmailTarget}" '.data.email |= $EMAILID');
      curl -H 'Accept: application/json' -H 'Content-Type: application/json' -X PUT ${url} -d "${jsonInvoice}";
      echo "Email target is now: ";
      curl -s ${url} | jq -r .data.email;
    fi;


    if [ -z "${statusFlags}" ];
    then
      echo "Status flags not altered.";
    else
      ### For all 'invoices' remove all status flags 'accessKey, accepted, rejected, authorized, .authorizationStatus, emailed'
      jsonInvoice=$(curl -s ${url} | jq "del(${statusFlags})");
      # jsonInvoice=$(curl -s ${url} | jq --arg FLAGS "${statusFlags}" 'del($FLAGS)');
      echo -e "Changed '${statusFlags}' of invoice #${url} ";
      curl -H 'Accept: application/json' -H 'Content-Type: application/json' -X PUT ${url} -d "${jsonInvoice}";
    fi;

  done

  echo '
  .................................................

  ';
fi

