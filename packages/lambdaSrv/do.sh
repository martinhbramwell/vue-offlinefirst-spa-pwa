# source ${HOME}/.ssh/secrets/offsppwa-vue.config;
source ${HOME}/.ssh/secrets/local.config;

###
# rm -fr /opt/pouchdb/iriblu_34; echo -e "Ready\n"> /tmp/pouchLog; ./do.sh
###

echo -e "
Supervised DB ${COUCH_URL}
--------------$(head -c ${#COUCH_URL} < /dev/zero | tr '\0' '-')
";

# npm run dev
npm run dbg
# npm start
