#!/usr/bin/env bash
#
export SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )";
export SCRIPT_NAME=$(basename "$0");

export SECRETS_FILE_PATH=".ssh/secrets";
export SECRETS_FILE_DIR="${HOME}/${SECRETS_FILE_PATH}";

installCert(){
  export VHOST_NAME=$(echo ${VHOSTS} | jq -r .[$1].VHOST_NAME);
  echo -e "Doing cert #$1  ${VHOST_NAME}";
  if [ 0 -lt $(sudo -A certbot certificates  2>/dev/null | grep -c ${VHOST_NAME}) ]; then
    sudo -A certbot certificates 2>/dev/null | grep -B 1 ${VHOST_NAME}/fullchain.pem;
  else
    echo "Now making certificate for '${VHOST_NAME}'";
    sudo -A certbot --noninteractive --nginx --agree-tos --email "${CERTIFICATE_OWNER_EMAIL}" --domain ${VHOST_NAME} certonly;
  fi;
}

installSslCertificates()
{
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
  echo -e "\n\n*** Installing Letsencrypt SSL certificates ***";
  declare PARMS="${SECRETS_FILE_DIR}/virtualHostsConfigParameters.json";
  declare CERTS_BACKUP_FILE=$(cat ${PARMS} | jq -r .SSL_PARMS.CERTS_BACKUP_FILE);
  declare BACKUP=${SECRETS_FILE_DIR}/${CERTS_BACKUP_FILE};

  echo -e "\n\n\nDo we possess a 'letsencrypt' backup?";
  if [[ -f "${BACKUP}" ]]; then
    echo -e "Restoring 'letsencrypt' directory from ${BACKUP}.";
    pushd / >/dev/null;
      sudo -A tar zxvf ${BACKUP};
    popd >/dev/null;
  else
    echo -e "Found no 'letsencrypt' directory backup :: ${BACKUP}. Starting new install...";
    installSslCertificates;
  fi
fi;
