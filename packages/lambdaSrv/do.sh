source ${HOME}/.ssh/secrets/local.config;

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
const envAuth = { username: '${COUCH_USR}', password: '${COUCH_PWD}' };
EOF

 popd >/dev/null;

# npm run dev
npm run dbg
# npm start
