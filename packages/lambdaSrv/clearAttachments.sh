#!/usr/bin/env bash
#
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

# export COUCH_PROTOCOL="http"; export COUCH_HOST="localhost";
export URL="${COUCH_PROTOCOL}://${COUCH_HOST}/${COUCH_DATABASE_NAME}_${VERSION}/Invoice_1_000000000000";

declare START_RNG=0;
# declare START_RNG=5744;
declare END_RNG=${START_RNG};
# declare END_RNG=5768;
export invoices=( $(eval "echo {${START_RNG}..${END_RNG}..1}") );

export attachments=( );
# export attachments=( "respuestaSRI" );
# export attachments=( "invoiceXml" "invoiceSigned" "respuestaSRI" );

export fakeEmailTarget="";
# export fakeEmailTarget="yourself.yourorg@gmail.com";

export statusFlags="";
# export statusFlags=".hold, .emailed";
# export statusFlags=".hold, .authorized, .authorizationStatus, .emailed";
# export statusFlags=".hold, .accepted, .rejected, .returned, .reason, .authorized, .authorizationStatus, .emailed";
# export statusFlags=".hold, .accessKey, .accepted, .rejected, .authorized, .failed, .authorizationStatus, .emailed";

if [[ ${START_RNG} -lt 1 ]];
then
  echo "Nothing to do.";
  exit;
fi;

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
if [[ $1 = "-f" ]]
then
  REPLY="y";
else
  read -p "Are you sure? " -n 1 -r
fi;
echo "";
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

