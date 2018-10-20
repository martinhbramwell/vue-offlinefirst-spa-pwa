export REMOTE_USER=$1;
export REMOTE_URI=$2;

export SYNC_DIR="mariaDB";
export SYNC_PATH="projects/offspwa-vue/packages/database";
export LOCAL_DIR="${HOME}/${SYNC_PATH}/${SYNC_DIR}";
export REMOTE_DIR="/home/${REMOTE_USER}/${SYNC_PATH}";

echo -e "Will now sync
      '${LOCAL_DIR}'
 with '${REMOTE_USER}@${REMOTE_URI}:${REMOTE_DIR}'
";

rsync -avz ${LOCAL_DIR} ${REMOTE_USER}@${REMOTE_URI}:${REMOTE_DIR};
while true; do
  inotifywait -r -e modify,create,delete ${LOCAL_DIR};
  rsync -avz ${LOCAL_DIR} ${REMOTE_USER}@${REMOTE_URI}:${REMOTE_DIR};
  date
done
