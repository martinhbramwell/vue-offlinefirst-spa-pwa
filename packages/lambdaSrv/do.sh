source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

###
# rm -fr /opt/pouchdb/iriblu_34; echo -e "Ready\n"> /tmp/pouchLog; ./do.sh
###

echo -e "
Supervised DB ${COUCH_URL}
--------------$(head -c ${#COUCH_URL} < /dev/zero | tr '\0' '-')
";

pushd './public/scripts/' >/dev/null;

    cat << EOF > parms.js
const envServerURL = '${COUCH_PROTOCOL}://${COUCH_HOST}';
const envDbName = '${COUCH_DATABASE}';
const envAuth = { username: '', password: '' };
EOF

 popd >/dev/null;

./unLaunch.sh;
export NODE_ICU_DATA='node_modules/full-icu/';
npm run dev;
# npm run dbg;
# npm start
