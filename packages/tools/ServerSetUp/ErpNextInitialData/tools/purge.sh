#!/usr/bin/env bash
#
shopt -s extglob;
export LTS=LATEST.txt;
export INTERACTIVE=" -i";
if [[ "X$1X" = "X-fX" ]]; then
  INTERACTIVE="";
fi;

pushd /opt/backupErpNext  >/dev/null;
  export LT=$(cat LATEST.txt); ls -la; echo -e "\n     Will purge all files except:"; ls -la ${LT}* pu* LA*;
  echo -e "\n";
  read -p '      Are you sure? ' -n 1 -r;
  echo ;
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm ${INTERACTIVE} -v !(${LT}*|pu*|LA*);
  fi;
popd >/dev/null;

shopt -u extglob;
