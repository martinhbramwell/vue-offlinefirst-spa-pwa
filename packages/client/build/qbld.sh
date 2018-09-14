#!/usr/bin/env bash
#
echo -e "
Building and committing master";

export ONLY='vuesppwa_master';
export DIR=$(pwd);
if [ $(basename ${DIR}) != ${ONLY} ]; then
  echo "Must be in directory named ${ONLY}";
  exit 1;
fi;

export ONLY='master';
export BRNCH=$(git rev-parse --abbrev-ref HEAD);
if [ ${BRNCH} != ${ONLY} ]; then
  echo "Must be in git branch named ${ONLY}";
  exit 1;
fi;

if [[ ! $(which jq) ]]; then
  echo -e "Need to install 'jq' using command --> 'sudo apt -y install jq'.";
  sudo apt -y install jq;
fi;

pushd ../vuesppwa

  export SMVR=$(jq -r .version ./package.json);
  echo ${SMVR};

  [ -f ./semver.sh ] || wget -q https://raw.githubusercontent.com/warehouseman/semver_shell/master/semver.sh;
  chmod +x semver.sh;

  export NSMVR=$(./semver.sh ${SMVR} bump_patch);
  echo ${NSMVR};

  sed -i "s/  \"version\":.*/  \"version\": \"${NSMVR}\",/" package.json;
  sed -i "s/  version:.*/  version: '${NSMVR}',/" ./src/config.js;

  rm -fr docs
  npm run build
popd

rm -fr docs
mv ../vuesppwa/docs .
git add docs

git commit -asm "Test (ghp): Use latest dev branch for docs (v${NSMVR})"
git push

echo -e "
Done";

