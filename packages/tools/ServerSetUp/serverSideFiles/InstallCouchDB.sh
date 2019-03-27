#!/usr/bin/env bash
#

export DISTRO="$(lsb_release -sc)";
export SPACER="";
export COMMENT="## CouchDB";
export SOURCE_SPEC="deb https://apache.bintray.com/couchdb-deb ${DISTRO} main";
export APT_SOURCES="/etc/apt/sources.list";


patchCouchConfig()
{
  export MSG="CORS configuration";
  export START_ALIAS="# ^^^^ ${MSG} ^^^^";
  export END_ALIAS="# vvvv ${MSG} vvvv";
  export PATCH="
${START_ALIAS}
[cors]
headers = accept, authorization, content-type, origin, referer
origins = *
credentials = true
methods = GET, PUT, POST, HEAD, DELETE

[httpd]
enable_cors = true
${END_ALIAS}
";

  export COUCH_LOCAL="/opt/couchdb/etc/local.d";
  export COUCH_INI="10-admins.ini";
  export COUCH_CFG="${COUCH_LOCAL}/${COUCH_INI}";
  if [ ! -e ${COUCH_CFG} ]
  then
    sudo -A mkdir -p ${COUCH_LOCAL};
    echo "# " | sudo -A tee ${COUCH_CFG};
  fi
  sudo -A sed -i "/${START_ALIAS}/,/${END_ALIAS}/d" ${COUCH_CFG};
  echo -e "${PATCH}" | sudo -A tee --append ${COUCH_CFG};

#  sudo -A cat ${COUCH_CFG};

}

installCouchDB()
{

  source ${HOME}/.ssh/secrets/CouchDB;
  if ! systemctl is-active --quiet couchdb; then
    declare ERROR=$(sudo -A service couchdb start 2>&1 >/dev/null);
    if [[ ${ERROR} == *"couchdb.service not found"* ]]; then
      echo "No such service. Have to install."
    fi;

    export HAVE_SET_APT_SOURCE=$(cat /etc/apt/sources.list | grep "couchdb-deb ${DISTRO} main");
    if [ -z "${HAVE_SET_APT_SOURCE}" ]; then
      echo -e "Appending source spec '${SOURCE_SPEC}' to '${APT_SOURCES}'";
      echo ${SPACER} | sudo -A tee -a ${APT_SOURCES};
      echo ${COMMENT} | sudo -A tee -a ${APT_SOURCES};
      echo ${SOURCE_SPEC} | sudo -A tee -a ${APT_SOURCES};
    fi;
    echo -e "Have APT source for CouchDB for '${DISTRO}'. Getting public key ...";
    curl -L https://couchdb.apache.org/repo/bintray-pubkey.asc | sudo apt-key add -;

    echo -e "Have key. Installing...";
    export DEBIAN_FRONTEND=noninteractive;
    sudo -A apt-get update;

    echo "couchdb couchdb/adminpass_again password ${COUCH_ROOT_PWD}" | sudo -A debconf-set-selections;
    echo "couchdb couchdb/adminpass password ${COUCH_ROOT_PWD}" | sudo -A debconf-set-selections;
    echo "couchdb couchdb/mode select standalone" | sudo -A debconf-set-selections;
    echo "couchdb couchdb/bindaddress string 0.0.0.0" | sudo -A debconf-set-selections;

    sudo -A apt-get install -y couchdb;

  else
    source ${HOME}/.ssh/secrets/CouchDB;
    declare COUCHDB_VERSION=$(curl -q http://localhost:5984/ 2>/dev/null | jq -r .version);
    # declare COUCHDB_VERSION="2.3.0";
    echo -e "CouchDB '${COUCHDB_VERSION}' is up and running;";
  fi;

  patchCouchConfig;
  sudo -A service couchdb stop;
  sudo -A service couchdb start;
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  installCouchDB;
fi;