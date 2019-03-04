#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

installCert()
{
  source ${SCRIPT_DIR}/virtualHostsConfigParameters.sh;

  if [ 0 -lt $(sudo -A certbot certificates  2>/dev/null | grep -c ${COUCHDB_RP_VHOST_NAME}) ]; then
    sudo -A certbot certificates 2>/dev/null | grep -B 1 ${COUCHDB_RP_VHOST_NAME}/fullchain.pem;
  else
    sudo -A certbot --noninteractive --nginx --agree-tos --email "${CERTIFICATE_OWNER_EMAIL}" --domain ${COUCHDB_RP_VHOST_NAME} certonly
  fi;

  echo "### LetsEncypt certificates installed ###";
  echo -e "";

}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  installCert;
fi;
