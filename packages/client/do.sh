[ -d node_modules/abbrev ] || npm install;

source ${HOME}/.ssh/secrets/offsppwa-vue.config
cat << EOF > .env.development
NODE_ENV=development
VUE_APP_STATIC_MODE=STATIC_DEV
VUE_APP_COUCH_PROTOCOL=${COUCH_PROTOCOL}
VUE_APP_COUCH_URI=${COUCH_HOST}
VUE_APP_COUCH_NAME=${COUCH_DATABASE}
EOF
npm run serve &
