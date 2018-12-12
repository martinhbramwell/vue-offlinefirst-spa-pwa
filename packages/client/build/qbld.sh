#!/usr/bin/env bash
#

export MODE="dry";
if [[ ${1} == "--wet" ]]; then
  MODE="wet";
fi;

export THE_PROJECT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && cd .. && pwd)";

echo -e "
Building and committing distribution of 'iridium-blue.github.io' ...
";

export THE_TARGET='iridium-blue.github.io';
export DIR=$(pwd);
if [ $(basename ${DIR}) != ${THE_TARGET} ]; then
  echo "Must be in directory named ${THE_TARGET}";
  exit 1;
fi;

export THE_TARGET_BRANCH='master';
export BRNCH=$(git rev-parse --abbrev-ref HEAD);
if [ ${BRNCH} != ${THE_TARGET_BRANCH} ]; then
  echo "Must be in git branch named ${THE_TARGET_BRANCH}";
  exit 1;
fi;

if [[ ! $(which jq) ]]; then
  echo -e "Need to install 'jq' using command --> 'sudo apt -y install jq'.";
  sudo apt -y install jq;
fi;


echo "         THE_PROJECT = ${THE_PROJECT}";
echo "THE_TARGET DIRECTORY = ${THE_TARGET}";
echo "     THE TARGET REPO = $(cat .git/config | grep 'url =' | sed 's|.*url = ||')";
echo "   THE_TARGET_BRANCH = ${THE_TARGET_BRANCH}";
echo -e "\n";

echo -e "\nSwitching directories ... "
pushd ${THE_PROJECT}

  export SMVR=$(jq -r .version ./package.json);
  echo " CURRENT_SEMVER = ${SMVR}";

  [ -f ./semver.sh ] || wget -q https://raw.githubusercontent.com/warehouseman/semver_shell/master/semver.sh;
  chmod +x semver.sh;

  export NSMVR=$(./semver.sh ${SMVR} bump_patch);
  echo "     NEW_SEMVER = ${NSMVR}";

  if [[ ${MODE} == "wet" ]]; then
    sed -i "s/  \"version\":.*/  \"version\": \"${NSMVR}\",/" package.json;
    sed -i "s/  version:.*/  version: '${NSMVR}',/" ./src/config.js;
  fi;


  npm run build;
  cp -R ./build/dist_files/. ./dist/;

popd

rm -fr precache*;
rm -fr css;
rm -fr img;
rm -fr js;

cp -R ${THE_PROJECT}/dist/. ./;

git add --all;

if [[ ${MODE} == "wet" ]]; then
  git commit -asm "Test (ghp): Push latest version of project offsppwa-vue: (v${NSMVR})"
  git push;
fi;

if [ ${MODE} != "wet" ]; then
  echo -e "That was just a dry run. Use --wet for semver management and commit/push.
    Done";
fi;


echo -e "
Done";

