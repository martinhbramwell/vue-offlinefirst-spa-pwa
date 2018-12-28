import secrets from '../../secrets';

const couchPutOpts = (id) => {
  return {
    url: `${secrets.CH_URL}/${id}`,
    method: "PUT",
    followRedirect: true,
    failOnStatusCode: true,
  }
};

const couchGetOpts = (query) => {
  return {
    url: `${secrets.CH_URL}/${query}`,
    method: "GET",
    followRedirect: true,
    failOnStatusCode: true,
    headers: {
      'pragma': 'no-cache',
      'cache-control': 'no-cache'
    }
  }
};

const couchPayload = (_id, data) => {
  return {
    body: {
      _id,
      meta: {
        type: "Request",
        handler: "InvoiceCreate"
      },
      data,
    }
  }
};

const padVal = (pad, val) => (pad + val).substring(val.length);

const tightDate = () => {
  const d = new Date();
  let dt = '';
  // dt += d.getYear() - 100;
  dt += d.getFullYear();
  dt += padVal('00', (1 + d.getMonth()).toString());
  dt += padVal('00', d.getDate().toString());


  dt += padVal('00', d.getHours().toString());
  dt += padVal('00', d.getMinutes().toString());
  dt += padVal('00', d.getSeconds().toString());
  // dt += padVal('00', rand.toString());

  const ret = parseInt(`${dt}`, 10);
  return ret;
};

// const scrapeInvoice = () => {
//   cy.log('-------- INVOICE ---------');
// };
const uniqueRequest = () => `Request_2_${tightDate()}_Invoice`;

const YR = 0;
const MTH = YR + 1;
const DAY = MTH + 1;
const HR = DAY + 1;
const MIN = HR + 1;
const SEC = MIN + 1;

const abbr = { YR, MTH, DAY, HR, MIN, SEC };

export default {
  abbr,
  couchGetOpts,
  couchPutOpts,
  couchPayload,
  uniqueRequest,
  tightDate
}
