export MM=$(date +"%b")
export DD=$(date +"%d")
source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config;

echo -e ""
echo -e ""
echo -e "   1)  Backup pouchdb to pouchdb_bk_${MM,,}$DD.tar.gz"
echo -e sudo tar zcvf /opt/pouchdb_bk_${MM,,}${DD}.tar.gz /opt/pouchdb/
echo -e ""
echo -e ""
echo -e "   2)  Backup CouchDB \"${COUCH_DATABASE_NAME}_${VERSION}\" using replicator 'Purgative replication'"
echo -e "    \"url\": \"http://localhost:5984/${COUCH_DATABASE_NAME}_${VERSION}_${MM,,}${DD}\",
"
echo -e ""
echo -e "   3)  Edit env vars to set new start date and sequence"
echo -e "nano \${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config
"
echo -e ""
echo -e "   4)  Tail the pouch log, waiting for Supervisor '23622' is alive."
echo -e "tail -fn 200 /tmp/pouchLog"
echo -e ""
echo -e ""
echo -e "   5)  unlaunch NodeJS"
echo -e "cd \${HOME}/services/vue-offlinefirst-spa-pwa/packages/lambdaSrv/"
echo -e "./unLaunch.sh"
echo -e ""
echo -e "   6)  Delete the pouch database"
echo -e "rm -fr /opt/pouchdb/${COUCH_DATABASE_NAME}_${VERSION}*"
echo -e "ll /opt/pouchdb"
echo -e ""
echo -e "   7)  Delete Couch database '${COUCH_DATABASE_NAME}_${VERSION}'"
echo -e ""
echo -e ""
echo -e ""
echo -e "   8)  Restore Couch database '${COUCH_DATABASE_NAME}_${VERSION}' using replicator 'Restore from clean'"
echo -e ""
