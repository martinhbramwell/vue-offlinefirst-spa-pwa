#!/usr/bin/env bash
#
shopt -s extglob;
export LTS=LATEST.txt;
export INTERACTIVE=" -i";
if [[ "X$1X" = "X-fX" ]]; then
  INTERACTIVE="";
fi;

pushd /opt/backupErpNext  >/dev/null;
  export LT=$(cat LATEST.txt); ls -la; echo -e "\n     Will purge all files except:"; ls -la ${LT}* pu* LA* before.sql;
  echo -e "\n";
  read -p '      Are you sure? ' -n 1 -r;
  echo ;
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ "X${INTERACTIVE}X" = "XX" ]]; then
      echo -e "Forcing deletes";
      rm -fr -v !(${LT}*|pu*|LA*|before.sql);
    else
      echo -e "Interactive deletes";
      rm -r ${INTERACTIVE} -v !(${LT}*|pu*|LA*|before.sql);
    fi;
  fi;
popd >/dev/null;

shopt -u extglob;
