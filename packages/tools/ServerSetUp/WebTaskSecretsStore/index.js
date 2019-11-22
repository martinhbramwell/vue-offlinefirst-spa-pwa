const express    = require('express');
const Webtask    = require('webtask-tools');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const PRODUCTION_BRANCH = 'invoices';

const PRD_COUCH_HOST = 'chdb1.iridium.blue';
const PRD_SUPERVISOR_HOST = 'spvr1.iridium.blue';
const PRD_NEW_HOST_NAME = 'IridiumBlueGDF';

const PRD_ERPNEXT_SITE = 'ib_erp.local';
const PRD_ERPNEXT_HOST = 'erpn1.iridium.blue';
const PRD_ERPHOST_NAME = 'IridiumBlueERP';
const PRD_ERPHOST_USR = 'erpnext';
const PRD_ERPHOST_USR_NAME = 'ERPNext User';
// const PRD_ERPHOST_PWD = '';

const DATABASE_NAME = 'ib201908';
const DATABASE_VERSION = '002';

const MASTER_HOST = 'couch:5984';
const MASTER_HOST_PRTCL = 'http';
const MASTER_HOST_USER = 'you';
const MASTER_HOST_ADMIN = 'admin';
// const MASTER_HOST_PWD = "";
const MASTER_COUCH_DATABASE_NAME = 'ib201908';
const MASTER_COUCH_DATABASE_VERSION = '002';

const SLAVE_HOST = "chdb1.iridium.blue"
const SLAVE_HOST_PRTCL = "https";
const SLAVE_HOST_USER = "you";
const SLAVE_HOST_ADMIN = "admin";
// const SLAVE_HOST_PWD = "";
const SLAVE_COUCH_DATABASE_NAME = 'ib201910';
const SLAVE_COUCH_DATABASE_VERSION = '001';

const SECRETS_FILE_PATH = ".ssh/secrets";
const GOOGLE_DRIVE_FOLDER = "1mP7fSzZr2UDKmoqCPqe3DO89GncdFi0A";
const SIGNATURE_FILE_ID="1Xs2adG9u4dfLsvSOqPseF5wavXmd-AoL";

const SRI_LOGICHEM_RUC = '1792177758001';
const SRI_HASAN_CEDULA = '1713931416';

const BITLY_PATH = 'http://bit.ly/VOSP_02';
const CERTS_BACKUP_FILE = 'LetsEncrypt.tar.gz';

const MAILING_MODE = "TST";
// const MAILING_MODE = "PRD";

const PRD_SEND_TO = 'GET FROM DATABASE';
const PRD_SEND_FROM = 'Logichem Solutions <facturacionlogichem@gmail.com>';
const PRD_SEND_SENDER = 'Logichem Solutions <facturacionlogichem@gmail.com>';
const PRD_SEND_BCC = '';
const PRD_SEND_REPLYTO = 'Logichem Ecuador <logichemec@gmail.com>';

const TST_SEND_TO = 'yourself.yourorg@gmail.com';
const TST_SEND_FROM = 'Facturacion Iridium Blue <facturacion.iridium.blue@gmail.com>';
const TST_SEND_SENDER = 'Facturacion Iridium Blue <facturacion.iridium.blue@gmail.com>';
const TST_SEND_BCC = 'Iridium Blue Water <water.iridium.blue@gmail.com>';
const TST_SEND_REPLYTO = 'Doowa Diddee <doowa.diddee@gmail.com>';


app.get('/', (_, res) => {
  const hdr = '"Content-Type: application/json"';
  const host = BITLY_PATH;

  const body = `'{"mode":"'"\${MODE}"'","type":"'"\${TYPE}"'","scrt":"'"\${SECRET}"'"}\'`;
  const confFile = 'vue-offlinefirst-spa-pwa.config';
  const scrtFile = '\${XDG_RUNTIME_DIR}/tmp.json';
  res.send(`
    <html>
      <head>
        <title>Example command for getting "vue-offlinefirst-spa-pwa" project secrets</title>
        <style>
          {
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-kerning: auto;
          }
          html {
            font-size: 10pt;
            line-height: .8;
            font-weight: 400;
            font-family: 'Helvetica Neue', 'Myriad Pro', 'Segoe UI', Myriad, Helvetica, 'Lucida Grande', 'DejaVu Sans Condensed', 'Liberation Sans', 'Nimbus Sans L', Tahoma, Geneva, Arial, sans-serif;
          }
          div {
              margin-left:24px;
              width:400px;
          }
          p {
              font-family: "Courier New", Courier, monospace;
              font-weight: normal;
              font-style: normal;
              font-size: 15px;
              margin:0 28px;
              text-indent: -28px;
          }
          body {
            padding: 1em;
            margin: 0 auto;
            max-width: 800px;
          }
          code,
          pre,
          blockquote {
            padding: .2em;
            background: rgba(0,0,0,.1);
          }
          code,
          pre {
            font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
          }
          h1, h2, h3, h4, h5, h6 {
            margin: 0 0 .5em 0;
            line-height: 1.2;
            letter-spacing: -.02em;
          }
          [class*=float-] {
            margin: 0 auto 1em auto;
            display: block;
            width: auto;
            max-width: 100%;
            clear: both;
          }
          @media (min-width: 600px) {
            h1 { font-size: 300%; }
            h2 { font-size: 200%; }
            h3 { font-size: 180%; }
            h4 { font-size: 160%; }
            h5 { font-size: 140%; }
            h6 { font-size: 120%; }
            [class*=float-] {
              max-width: 40%;
            }
            .float-left {
              float: left;
              margin: 0 1em .5em 0;
            }
            .float-right {
              float: right;
              margin: 0 0 .5em 1em;
            }
          }
        </style>

      </head>
      <body>
        <h1>Script fragments to use to acquire stored secrets</h2>
        <h2>Initialization for all/any of the command groups below</h2>
        <h4>
          <div>
            <p>export SECRET=" ?????????";</p>
            <p>mkdir -p \${HOME}/${SECRETS_FILE_PATH};</p>
          </div>
        </h4>

        <hr />

        <h2>Example command for getting "vue-offlinefirst-spa-pwa" project secrets...</h2>
        <h4>
          <div>
            <p>export TYPE="configuration";</p>
            <p>export MODE="PRD";</p>
            <p># export MODE="DEV";</p>
            <p>pushd \${HOME}/${SECRETS_FILE_PATH};</p>
            <p>curl -sH ${hdr} -d ${body} --post301 -X POST -L ${host} > ${confFile};</p>
            <p>source ${confFile};</p>
            <p>popd;</p>
          </div>
        </h4>

        <hr />

        <h2>Example command for getting the digital signature...</h2>
        <h4>
          <div>
            <p>export TYPE="signature";</p>
            <p>export SIG_FILE=sig.p12;</p>
            <p>export SIG_TARGZ="\${SIG_FILE}.tar.gz";</p>
            <p>export SIG_B64="\${SIG_TARGZ}.b64";</p>

            <p>pushd $XDG_RUNTIME_DIR > /dev/null;</p>
            <p>curl -sH ${hdr} -d ${body} --post301 -X POST -L ${host} > \${SIG_B64};</p>
            <p>export isERROR=\$(grep -c "Error" \${SIG_B64});</p>
            <p>function process() {</p>
            <p>sed -i 's/ /\\n/g' \${SIG_B64};</p>
            <p>cat \${SIG_B64} | base64 --decode > \${SIG_TARGZ};</p>
            <p>tar zxvf \${SIG_TARGZ};</p>
            <p>};</p>
            <p>if [[ \${isERROR} -lt 1 ]]; then process; fi;</p>
            <p>rm -f "\${SIG_FILE}*";</p>
            <p>ll *.p12;</p>
            <p>popd >/dev/null;</p>
          </div>
        </h4>

        <hr />

        <h2>Example command for getting virtual hosts...</h2>
        <h4>
          <div>
            <p>export TYPE="virtualHostsCfgPrms";</p>
            <p>pushd \${HOME}/${SECRETS_FILE_PATH};</p>
            <p>curl -sH ${hdr} -d ${body} --post301 -X POST -L ${host} > ${scrtFile};</p>
            <p>head ${scrtFile};</p>
            <p>popd;</p>
          </div>
        </h4>

        <hr />
      </body>
    </html>

  `);
});

const WIB_API_Token = (secrets) => {
  return `{
  "access_token": "${secrets.WIB_API_Token}",
  "refresh_token": "${secrets.WIB_API_RefreshToken}",
  "scope": "https://www.googleapis.com/auth/drive",
  "token_type": "Bearer",
  "expiry_date": 1573827434485
}\n`;
};

/*

    },
    {
      "SYMLINK_NAME": "ErpNext",
      "GDRIVE_FILE_ID": "1pjVYHUCpHfVAPL9Q0QNaTdVlo7rmHiBk",
      "GDRIVE_FILE_NAME": "ErpNext_ReverseProxy_WITHCERT.sh",
      "VHOST_NAME": "${PRD_ERPNEXT_HOST}"

*/
const virtualHostsCfgPrms = (secrets) => {
  return `{
  "SSL_PARMS": {
    "CERTIFICATE_OWNER_EMAIL": "water.iridium.blue@gmail.com",
    "SSL_DFH_ID": "1gT4cOCZzNUJEuriUkzQqR3cceHu7PcH-",
    "CERTS_BACKUP_FILE": "${CERTS_BACKUP_FILE}"
  },
  "VHOSTS": [
    {
      "SYMLINK_NAME": "CouchDB",
      "GDRIVE_FILE_ID": "1FJ6Az9n68IByS9F5LXR9d0qrZSC3Lnmm",
      "GDRIVE_FILE_NAME": "CouchDB_ReverseProxy_WITHCERT.sh",
      "VHOST_NAME": "${PRD_COUCH_HOST}"
    },
    {
      "SYMLINK_NAME": "NodeJS",
      "GDRIVE_FILE_ID": "1KvedJxa2XHtKdbmoEyCDzyq1Attmmdpe",
      "GDRIVE_FILE_NAME": "NodeJS_ReverseProxy_WITHCERT.sh",
      "VHOST_NAME": "${PRD_SUPERVISOR_HOST}"
    }
  ],
  "NODEJS_APP": {
    "SSH_KEY": "1-1j9NPnZnazIYjOFflDAmkxnIwLCMLEH",
    "SSH_KEY_PUB": "1m_6vKD1kaiFU1NhX1oNlnJ2GPjuq7ire",
    "SSH_ALIAS": "vuesppwa",
    "CLONING_URL": "git@vuesppwa.github.com:martinhbramwell/vue-offlinefirst-spa-pwa.git",
    "FOLDER_NAME": "vue-offlinefirst-spa-pwa",
    "PRODUCTION_BRANCH": "${PRODUCTION_BRANCH}",
    "SECRETS_FILE_PATH": "${SECRETS_FILE_PATH}",
    "SECRETS_FILE_NAME": "vue-offlinefirst-spa-pwa.config",
    "INITIAL_DATABASE_ZIP": "1HJ9SMMg1WLT4a2127EebEkL25YRER2ky",
    "INITIAL_DATABASE_ZIP_FILE_NAME": "CouchInitialization_IridiumBlue.tar.gz.b64",
    "GIT_USER_NAME": "Iridium Blue"
  }
}
`;
};


const configurationData = (opts) => {
  const {
    OPERATION_MODE: mode,
    WEBTASK_SECRET: scrt,
    MAILER_PWD: mail_pwd,
    SRI_LOGICHEM_PWD: log_pwd,
    SRI_HASAN_PWD: has_pwd,
    MASTER_HOST_PWD: master_host_password,
    SLAVE_HOST_PWD: slave_host_password,
    P12_SIGNATURE_LOCATOR: p12_signature_locator,
    PRD_ERPHOST_PWD: erp_pwd,
  } = opts;
  return `#!/usr/bin/env bash
  #
  ##  Specify either 'PRD' OR 'DEV' for production or developement respectively
  export OPERATION_MODE="${mode || 'PRD'}";
  export WEBTASK_SECRET="${scrt}";

  export BITLY_LINK='${BITLY_PATH}';

  export DEV_COUCH_HOST_EXTERNAL="localhost:5984";
  export DEV_COUCH_HOST_INTERNAL="localhost:5984";
  export DEV_COUCH_HOST_USR="you";
  export DEV_COUCH_HOST_PWD="okok";
  export DEV_COUCH_PROTOCOL="http";
  export DEV_COUCH_DATABASE_NAME="${DATABASE_NAME}";
  export DEV_VERSION="${DATABASE_VERSION}";
  export DEV_COUCH_ADMIN="admin";
  export DEV_COUCH_ROOT_PWD="plokplok.0.0.0";

  export PRD_COUCH_HOST_EXTERNAL="${PRD_COUCH_HOST}";
  export PRD_COUCH_HOST_INTERNAL="localhost:5984";
  export PRD_COUCH_HOST_USR="you";
  export PRD_COUCH_HOST_PWD="plokplok.0.0.0";
  export PRD_COUCH_PROTOCOL="https";
  export PRD_COUCH_DATABASE_NAME="${DATABASE_NAME}";
  export PRD_VERSION="${DATABASE_VERSION}";
  export PRD_COUCH_ADMIN="admin";
  export PRD_COUCH_ROOT_PWD="plokplok.0.0.0";

  export COUCH_HOST_EXTERNAL=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_HOST_EXTERNAL)");
  export COUCH_HOST_INTERNAL=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_HOST_INTERNAL)");
  export COUCH_HOST="\${COUCH_HOST_EXTERNAL}";

  export COUCH_ADM=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_HOST_USR)");
  export COUCH_PWD=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_HOST_PWD)");
  export COUCH_PROTOCOL=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_PROTOCOL)");
  export COUCH_DATABASE_NAME=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_DATABASE_NAME)");
  export VERSION=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_VERSION)");
  export COUCH_ADMIN=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_ADMIN)");
  export COUCH_ROOT_PWD=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_COUCH_ROOT_PWD)");

  export COUCH_DATABASE="\${COUCH_DATABASE_NAME}_\${VERSION}";

  export COUCH_URL_EXTERNAL="\${COUCH_PROTOCOL}://\${COUCH_ADMIN}:\${COUCH_ROOT_PWD}@\${COUCH_HOST_EXTERNAL}"
  export COUCH_URL_INTERNAL="http://\${COUCH_ADMIN}:\${COUCH_ROOT_PWD}@\${COUCH_HOST_INTERNAL}"
  export COUCH_URL="\${COUCH_URL_EXTERNAL}";

  export POUCH_DIR="/opt/pouchdb";
  export MAIL_DIR="/opt/ibEmailAttachments";
  export REPORTS_DIR="/opt/ibReports";
  export BACKUPS_DIR="/opt/backupPouch";
  export SECRETS_FILE_PATH="${SECRETS_FILE_PATH}";
  export GOOGLE_CREDS_FILE="credentials.json";
  export GOOGLE_DRIVE_FOLDER="${GOOGLE_DRIVE_FOLDER}";
  export SIGNATURE_FILE_ID="${p12_signature_locator}";
  export ENCODED_SIGNATURE_FILE_NAME="sig.p12.tar.gz.b64";

  export LOCAL_DB="\${POUCH_DIR}/\${COUCH_DATABASE}";
  export REMOTE_DB="\${COUCH_URL}/\${COUCH_DATABASE}";

  export LOG_DIR="/tmp/pouchLog";
  export PROJECT_CONTAINER_DIR="\${HOME}/services";


  export TEST_FILES_PATH="temp/databases"
  export TEST_FILES_DIR="\${HOME}/\${TEST_FILES_PATH}"

  declare -a COUCH_USERS=(
    '{
      "_id": "org.couchdb.user:1",
      "name": "1",
      "roles": ["read/write"],
      "type": "user",
      "password": "34erDFCV"
    }'
    '{
      "_id": "org.couchdb.user:18",
      "name": "18",
      "roles": ["read/write"],
      "type": "user",
      "password": "34erDFCV"
    }'
    '{
      "_id": "org.couchdb.user:marcelo",
      "name": "marcelo",
      "roles": ["read/write"],
      "type": "user",
      "password": "09oikjmn"
    }'
    '{
      "_id": "org.couchdb.user:leo",
      "name": "leo",
      "roles": ["read/write"],
      "type": "user",
      "password": "56rtfgvb"
    }'
  );

  # New server commissioning credentials
  export DEV_NEW_HOST="couch";
  export PRD_NEW_HOST="${PRD_COUCH_HOST}";

  export DEV_NEW_HOST_NAME="meta";
  export PRD_NEW_HOST_NAME="${PRD_NEW_HOST_NAME}";

  export NEW_HOST="\${${mode}_NEW_HOST}";
  export NEW_HOST_NAME="\${${mode}_NEW_HOST_NAME}";


  export NEW_HOST_ROOT="you";
  export NEW_HOST_ADMIN="you";
  export NEW_HOST_PWD="plokplok";

  export MASTER_PROJ_DIR="/home/${MASTER_HOST_ADMIN}/services";


  # Master/slave replication
  export MASTER_HOST="${MASTER_HOST}";
  export MASTER_HOST_PRTCL="${MASTER_HOST_PRTCL}";
  export MASTER_HOST_USER="${MASTER_HOST_USER}";
  export MASTER_HOST_ADMIN="${MASTER_HOST_ADMIN}";
  export MASTER_HOST_PWD="${master_host_password}";

  export MASTER_USER_CREDS="\${MASTER_HOST_ADMIN}:\${MASTER_HOST_PWD}";

  export MASTER_COUCH_DATABASE_NAME="${MASTER_COUCH_DATABASE_NAME}";
  export MASTER_COUCH_DATABASE_VERSION="${MASTER_COUCH_DATABASE_VERSION}";
  export MASTER_COUCH_DB="\${MASTER_COUCH_DATABASE_NAME}_\${MASTER_COUCH_DATABASE_VERSION}";
  export MASTER_URL="\${MASTER_HOST_PRTCL}://\${MASTER_HOST}";
  export MASTER_CRED_URL="\${MASTER_HOST_PRTCL}://\${MASTER_USER_CREDS}@\${MASTER_HOST}";

  export SLAVE_HOST="${SLAVE_HOST}";
  export SLAVE_HOST_PRTCL="${SLAVE_HOST_PRTCL}";
  export SLAVE_HOST_USER="${SLAVE_HOST_USER}";
  export SLAVE_HOST_ADMIN="${SLAVE_HOST_ADMIN}";
  export SLAVE_HOST_PWD="${slave_host_password}";

  export SLAVE_USER_CREDS="\${SLAVE_HOST_ADMIN}:\${SLAVE_HOST_PWD}";

  export SLAVE_COUCH_DATABASE_NAME="${SLAVE_COUCH_DATABASE_NAME}";
  export SLAVE_COUCH_DATABASE_VERSION="${SLAVE_COUCH_DATABASE_VERSION}";
  export SLAVE_COUCH_DB="\${SLAVE_COUCH_DATABASE_NAME}_\${SLAVE_COUCH_DATABASE_VERSION}";
  export SLAVE_URL="\${SLAVE_HOST_PRTCL}://\${SLAVE_HOST}";
  export SLAVE_CRED_URL="\${SLAVE_HOST_PRTCL}://\${SLAVE_USER_CREDS}@\${SLAVE_HOST}";

  # Cypress Screen Scraper environment variables
  export CYPRESS_ENDPNT='http://www.iridiumblue.ec/erp/bapu/test/index.php';
  export CYPRESS_EP_UID='Leonardo Wild';
  export CYPRESS_EP_PWD='Leonardo_123aSd';

  export CYPRESS_CH_FIRSTINVOICE='2019 09 20 18 07 00';
  export CYPRESS_CH_FIRSTINVOICE_SEQ='11360';
  export CYPRESS_CH_LATESTINVOICE='_design/bapu/_view/latestInvoice?stable=true&update=true&descending=true&limit=1';
  export CYPRESS_CH_SPECIALFIX='_design/bapu/_view/specialFix?stable=true&update=true&descending=true&limit=1';
  export CYPRESS_CH_SCRAPERCONTROL='00_ScraperControl';
  # export CYPRESS_CH_SCRAPERCONTROL='_design/bapu/_view/scraperControl?stable=true&update=true&descending=true&limit=1';
  # export CYPRESS_CH_TMP_CLIENTS='00_ClientesTmp';
  export CYPRESS_CH_DB=\${COUCH_DATABASE};
  export CYPRESS_CH_URL=\${COUCH_URL_INTERNAL}/\${COUCH_DATABASE};

  export CYPRESS_SKIP_PERSONS=true;
  export CYPRESS_SKIP_INVOICES=false;

  ## When running scripts against BAPU database copy
  export MARIA_HOST="warehouseman.com";
  export MARIA_USR="you";

  # Digital certificate
  export SIGNING_CERTIFICATE="daniel_leonard_wild_stapel.p12";
  export SIGNING_CERTIFICATE_PATH="\${HOME}/${SECRETS_FILE_PATH}/\${SIGNING_CERTIFICATE}";
  export CERT="\${SIGNING_CERTIFICATE_PATH}";
  export CERTPWD="TaxEne2018";
  export SSL_DFH_FILE_NAME="dhparams_4096.pem";
  export CERTS_BACKUP_FILE="${CERTS_BACKUP_FILE}";

  # SRI control constants
  export DEV_AMBIENTE='1'; # directs to SRI upload target 1 = PRUEBAS
  export PRD_AMBIENTE='2'; # directs to SRI upload target 2 = PRODUCCION
  # export AMBIENTE=\$(eval "echo \\\$\$(echo \${OPERATION_MODE}_AMBIENTE)");
  export AMBIENTE="1";

  export IMPUESTO_VALOR_AGGREGADO='0.12';

  export RAZONSOCIAL='LOGICHEM SOLUTIONS SOCIEDAD ANONIMA';
  export NOMBRECOMERCIAL='LOGICHEM SOLUTIONS';
  export RUC='1792177758001';

  export DIRMATRIZ='PICHINCHA / QUITO / CUMBAYA / 23 DE ABRIL S13-205 Y ALFONSO LAMINA';
  export DIRESTABLECIMIENTO=\${DIRMATRIZ};

  export MAILERUID='facturacion.iridium.blue@gmail.com';
  export MAILERPWD='${mail_pwd}';

  export PRD_SEND_TO='${PRD_SEND_TO}';
  export PRD_SEND_FROM='${PRD_SEND_FROM}';
  export PRD_SEND_SENDER='${PRD_SEND_SENDER}';
  export PRD_SEND_BCC='${PRD_SEND_BCC}';
  export PRD_SEND_REPLYTO='${PRD_SEND_REPLYTO}';

  export TST_SEND_TO='${TST_SEND_TO}';
  export TST_SEND_FROM='${TST_SEND_FROM}';
  export TST_SEND_SENDER='${TST_SEND_SENDER}';
  export TST_SEND_BCC='${TST_SEND_BCC}';
  export TST_SEND_REPLYTO='${TST_SEND_REPLYTO}';

  export MAILING_MODE='${MAILING_MODE}';  #  PRD or TST
  export SEND_TO=\$(eval "echo \\\$\$(echo \${MAILING_MODE}_SEND_TO)");
  export SEND_FROM=\$(eval "echo \\\$\$(echo \${MAILING_MODE}_SEND_FROM)");
  export SEND_SENDER=\$(eval "echo \\\$\$(echo \${MAILING_MODE}_SEND_SENDER)");
  export SEND_BCC=\$(eval "echo \\\$\$(echo \${MAILING_MODE}_SEND_BCC)");
  export SEND_REPLYTO=\$(eval "echo \\\$\$(echo \${MAILING_MODE}_SEND_REPLYTO)");

  export SAFE_TEMP_DIR='/dev/shm/vosp';
  export REMOTE_CONFIG='remote.config';

  export PRD_ERPNEXT_SITE='${PRD_ERPNEXT_SITE}';
  export PRD_ERPNEXT_HOST='${PRD_ERPNEXT_HOST}';
  export PRD_ERPHOST_NAME='${PRD_ERPHOST_NAME}';
  export PRD_ERPHOST_USR='${PRD_ERPHOST_USR}';
  export PRD_ERPHOST_USR_NAME='${PRD_ERPHOST_USR_NAME}';
  export PRD_ERPHOST_PWD='${erp_pwd}';

  # SRI credentials
  # HB
  # UID = "${SRI_HASAN_CEDULA}"
  # PWD = "${has_pwd}"

  # LW
  # UID = "${SRI_LOGICHEM_RUC}"
  # PWD = "${log_pwd}"
`;
};


const types = {
  token: (secrets, body) => WIB_API_Token(secrets),
  signature: (secrets, body) => secrets.LeoSignature,
  virtualHostsCfgPrms: (secrets) => virtualHostsCfgPrms(secrets),
  configuration: (secrets, body) => configurationData({
    OPERATION_MODE: body.mode,
    WEBTASK_SECRET: body.scrt,
    MAILER_PWD: secrets.MAILER_PWD,
    SRI_LOGICHEM_PWD: secrets.SRI_LOGICHEM_PWD,
    SRI_HASAN_PWD: secrets.SRI_HASAN_PWD,
    MASTER_HOST_PWD: secrets.MASTER_HOST_PWD,
    SLAVE_HOST_PWD: secrets.SLAVE_HOST_PWD,
    P12_SIGNATURE_LOCATOR: secrets.P12_SIGNATURE_LOCATOR,
    PRD_ERPHOST_PWD: secrets.PRD_ERPHOST_PWD,
  }),
};

app.post('/', (req, res) => {
  const scrts = req.webtaskContext.secrets;
  const body = req.body;
  const MATCHED = body.scrt === scrts.AccessPassword;
  if (MATCHED) {
    const type = body.type;
    try {
      res.send(types[type](scrts, body));
    } catch (err) {
      if (err instanceof TypeError ) {
        res.send('Error: Unknown document type. Try "signature" or "configuration".\n');
      } else {
        res.send('Error: Unknown.\n');
      }
    }
  } else {
    res.send('Error: Invalid access key');
  }
  // console.log(`Provided secret ${req.body.scrt};`);
  // console.log(`Expected secret ${scrts.AccessPassword};`);
  // console.log(`MATCHED: ${MATCHED};`);
});



module.exports = Webtask.fromExpress(app);

