command -v jq > /dev/null || sudo apt install jq;
[ -d node_modules/cypress ] || npm install;


# source ${HOME}/.ssh/secrets/offsppwa-vue.config
# cat << EOF > .secrets.js;
# NODE_ENV=development
# VUE_APP_STATIC_MODE=STATIC_DEV
# VUE_APP_COUCH_PROTOCOL=${COUCH_PROTOCOL}
# VUE_APP_COUCH_URI=${COUCH_HOST}
# VUE_APP_COUCH_NAME=${COUCH_DATABASE}
# EOF
# npm run serve &

# ./node_modules/.bin/cypress open

source ${HOME}/.ssh/secrets/local.config;
# source ${HOME}/.ssh/secrets/offsppwa-vue.config;


# ./node_modules/.bin/cypress open;
# ./node_modules/.bin/cypress run --spec cypress/integration/GetPersons.js;
./node_modules/.bin/cypress run --spec cypress/integration/GetInvoices.js;
