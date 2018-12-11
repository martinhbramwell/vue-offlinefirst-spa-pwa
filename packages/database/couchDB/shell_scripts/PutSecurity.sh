#!/usr/bin/env bash
#
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";

export COUCH_DATABASE=${1:-$COUCH_DATABASE};
export CONFIG_FILE="${HOME}/.ssh/secrets/offsppwa-vue.config";

function usage() {
  echo "Usage: ./DropCreateSecurity.sh \$COUCH_DATABASE";
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

##
echo -e "
Setting database security for database :: ${COUCH_DATABASE}";
export SecuritySettings="./databases/persons/security.json";

curl -H "Content-type: application/json" -X PUT "${COUCH_URL}/${COUCH_DATABASE}/_security" -d @${SecuritySettings};


# curl -H Content-type: application/json -X PUT https://hasan:34erDFCV@yourdb.yourpublic.work/ib201812_102/_security -d ./databases/persons/security.json
# curl -H 'content-type: application/json' -H 'accept: application/json' https://hasan:34erDFCV@yourdb.yourpublic.work/ib201812_102/_security -X PUT -d @${SecuritySettings};

# '{"admins":{"names":["superuser"],"roles":["admins"]},"members":{"names": ["user1","user2"],"roles": ["developers"]}}'
