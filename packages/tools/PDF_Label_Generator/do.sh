export TEST_DIR="/tmp/iriblu_bottleLabels";
export TEST_FILE="test.pdf";
mkdir -p ${TEST_DIR};
touch ${TEST_DIR}/${TEST_FILE};
cp tools/envases.csv /tmp/iriblu_bottleLabels;
# source ${HOME}/.ssh/secrets/vue-offlinefirst-spa-pwa.config

ls -la ${TEST_DIR};
npm install;
npm run dev;
