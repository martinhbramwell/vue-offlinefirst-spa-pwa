#!/usr/bin/env bash
#

source ${HOME}/.ssh/secrets/offsppwa-vue.config;

export OLD_IFS=${IFS};
IFS='/';
read -ra PROJ_BUILD_PATH <<< "${0}";
export IFS=$OLD_IFS;

export THE_PROJECT=${PROJ_BUILD_PATH[0]}/${PROJ_BUILD_PATH[1]};

echo "      THE_PROJECT = ${THE_PROJECT}";
echo "       THE_TARGET = ${THE_TARGET}";

# -----------------
cat << EOF > ${THE_PROJECT}/../unpackLambdaSrv.sh
#!/usr/bin/env bash
#
sudo -A mv lambdaSrv.tar.gz /home/meta;
cd /home/meta
sudo -A tar zxf lambdaSrv.tar.gz
sudo chown -R meta:meta lambdaSrv
cd \${HOME}
rm -f ./unpackLambdaSrv.sh;
EOF
# -----------------

pushd ${THE_PROJECT}/..
  # pwd;
  # ls -la;
  # exit;

  tar zcf lambdaSrv.tar.gz lambdaSrv;
  scp lambdaSrv.tar.gz ${COUCH_ADM}@${COUCH_HOST}:~/.
  rm -f lambdaSrv.tar.gz;

  scp unpackLambdaSrv.sh ${COUCH_ADM}@${COUCH_HOST}:~/.
  ssh -t ${COUCH_ADM}@${COUCH_HOST} ". ./.bash_login; sudo -A sh ./unpackLambdaSrv.sh"
popd;

rm -f ${THE_PROJECT}/../unpackLambdaSrv.sh

echo -e "

  The 'lambdaSrv.tar.gz' bundle has been unpacked on the server.";

cat ${THE_PROJECT}/DEPLOYMENT.md
echo -e "\n\n";