const ENDPNT = '    <scraped host>    ';
const EP_UID = '       <user id>      ';
const EP_PWD = '    <user password>   ';

const CH_PRTL = 'http';
const CH_UID = ' <supervisor>  ';
const CH_PWD = '  <sup pwd>    ';
const CH_HOST = '192.168.0.7';
const CH_PORT = '9876';
const CH_PATH = '  <where to go>  ';

const CH_URL = `${CH_PRTL}://${CH_UID}:${CH_PWD}@${CH_HOST}:${CH_PORT}/${CH_PATH}`;

const CH_LATESTINVOICE = '_design/ <database> /_view/ <viewname> ?stable=true&update=true&descending=true&limit=1';

export default {
  ENDPNT,
  EP_UID,
  EP_PWD,
  CH_PRTL,
  CH_UID,
  CH_PWD,
  CH_HOST,
  CH_PORT,
  CH_PATH,
  CH_URL,
  CH_LATESTINVOICE,
};
