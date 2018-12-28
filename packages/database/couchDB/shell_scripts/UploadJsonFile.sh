#!/usr/bin/env bash
#
FILE=${1}.json;

# DB=${2:-$COUCH_DATABASE};
# UZR=${3:-$COUCH_USR};
# PSS=${4:-$COUCH_PWD};

# HOST="https://${UZR}:${PSS}@yourdb.yourpublic.work";
#
echo -e "
sending file: ${FILE} to ${COUCH}";
curl -H "Content-type: application/json" -X POST "${COUCH}/_bulk_docs"  -d @${FILE};
echo -e "
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
