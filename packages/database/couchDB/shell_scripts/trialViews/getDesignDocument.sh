#!/usr/bin/env bash
#
DB=${1:-$COUCH_DATABASE};
UZR=${2:-$COUCH_USR};
PSS=${3:-$COUCH_PWD};

if [[ -z "$DB" ||  -z "$UZR" ||  -z "$PSS" ]]; then
  echo "Usage: ./getDesignDocument.sh $COUCH_DATABASE $COUCH_USR $COUCH_PWD";
  exit 1;
fi;
HOST="https://${UZR}:${PSS}@yourdb.yourpublic.work";

# curl -H "Content-type: application/json" -X GET "${HOST}/${DB}/_design/trialViews/" > trialViews.json;
curl -H "Content-type: application/json" -X GET "${HOST}/${DB}/_design/trialViews/" > tmp.json;
cat tmp.json | jq --compact-output 'del(._id) | del(._rev)' > trialViews.json;
