#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

installCert(){
  export VHOST_NAME=$(echo ${VHOSTS} | jq -r .[$1].VHOST_NAME);
  echo -e "Doing cert #$1  ${VHOST_NAME}";
  if [ 0 -lt $(sudo -A certbot certificates  2>/dev/null | grep -c ${VHOST_NAME}) ]; then
    sudo -A certbot certificates 2>/dev/null | grep -B 1 ${VHOST_NAME}/fullchain.pem;
  else
    echo "Now making certificate for '${VHOST_NAME}'";
    sudo -A certbot --noninteractive --nginx --agree-tos --email "${CERTIFICATE_OWNER_EMAIL}" --domain ${VHOST_NAME} certonly
  fi;
}

installSslCertificates()
{
  declare PARMS="./setupScripts/virtualHostsConfigParameters.json";
  # cat ${PARMS};
  declare CERTIFICATE_OWNER_EMAIL=$(cat ${PARMS} | jq -r .SSL_PARMS.CERTIFICATE_OWNER_EMAIL);
  echo -e "CERTIFICATE_OWNER_EMAIL=\"${CERTIFICATE_OWNER_EMAIL}\"";

  declare VHOSTS=$(cat ${PARMS} | jq -r .VHOSTS);
  for (( IX=0; IX<$(echo ${VHOSTS} | jq '. | length'); IX++ ))
  do
    installCert $IX;
  done

  echo "### LetsEncypt certificates installed ###";
  echo -e "";

}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  installSslCertificates;
fi;
