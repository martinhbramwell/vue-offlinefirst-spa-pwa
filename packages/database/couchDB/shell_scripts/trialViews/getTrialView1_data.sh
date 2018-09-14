#!/usr/bin/env bash
#
DB=${1:-$COUCH_DATABASE};
UZR=${2:-$COUCH_USR};
PSS=${3:-$COUCH_PWD};

if [[ -z "$DB" ||  -z "$UZR" ||  -z "$PSS" ]]; then
  echo "Usage: ./getTrialView1_data.sh $COUCH_DATABASE $COUCH_USR $COUCH_PWD";
  exit 1;
fi;
HOST="https://${UZR}:${PSS}@yourdb.yourpublic.work";
VIEW_PATH="_design/trialViews/_view";

curl -g "${HOST}/${DB}/${VIEW_PATH}/CommentsOfPost?startkey=[\"myslug\"]&endkey=[\"myslug\",2]"; # | jq '.';
# ?key=[\"myslug\", 0]&include_docs=true&reduce=false";
# ?startkey=['myslug', 0]&endkey=['myslug', 2]"
 # | jq '.';
