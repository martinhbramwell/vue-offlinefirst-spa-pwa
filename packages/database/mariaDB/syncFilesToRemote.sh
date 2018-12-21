export CONFIG_FILE="${HOME}/.ssh/secrets/offsppwa-vue.config";
source ${CONFIG_FILE};

export SYNC_DIR="mariaDB";
export SYNC_PATH="projects/vue-offlinefirst-spa-pwa/packages/database";
export LOCAL_DIR="${HOME}/${SYNC_PATH}/${SYNC_DIR}";
export REMOTE_DIR="/home/${MARIA_USR}/${SYNC_PATH}";

echo -e "Will now sync
      '${LOCAL_DIR}'
 with '${MARIA_USR}@${MARIA_HOST}:${REMOTE_DIR}'
";

rsync -avz ${LOCAL_DIR} ${MARIA_USR}@${MARIA_HOST}:${REMOTE_DIR};
while true; do
  inotifywait -r -e modify,create,delete ${LOCAL_DIR};
  rsync -avz ${LOCAL_DIR} ${MARIA_USR}@${MARIA_HOST}:${REMOTE_DIR};
  date
done
