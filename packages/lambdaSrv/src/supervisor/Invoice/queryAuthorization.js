import axios from 'axios';

// import { DOMParser } from 'xmldom';

import { logger as LG } from '../../utils';
import srixml from '../../utils/srixml';
import {
  soapQueryStart,
  soapQueryEnd,
  urlQuery,
  headers,
  soapQueryAuthorized,
} from './soapFragments';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

// const extractTimestamp = (xml) => {
//   try {
//     // const srlzr = new XMLSerializer();
//     const dom = new DOMParser().parseFromString(xml);
//     const response = dom.childNodes[0].childNodes[0].childNodes[0].childNodes[0];

//     let look = true;
//     let cntRespElems = -1;
//     while (look && cntRespElems < Object.keys(response.childNodes).length) {
//       cntRespElems += 1;
//       look = response.childNodes[cntRespElems].localName !== 'autorizaciones';
//     }

//     const autorizacion = response.childNodes[cntRespElems].childNodes[0];
//     // const strAut = srlzr.serializeToString(autorizacion);
//     // CLG(autorizacion.childNodes[1].localName);

//     look = true;
//     let cntAutDate = -1;
//     while (look && cntAutDate < Object.keys(autorizacion.childNodes).length) {
//       cntAutDate += 1;
//       look = autorizacion.childNodes[cntAutDate].localName !== 'fechaAutorizacion';
//     }

//     CLG(`fechaAutorizacion :: ${autorizacion.childNodes[cntAutDate].firstChild.data}`);
//     return autorizacion.childNodes[cntAutDate].firstChild.data;
//   } catch (err) {
//     LG.error(`Error while reading XML reply ${err}`);
//     return 'no timestamp';
//   }
// };

const query = async (args) => { // eslint-disable-line no-unused-vars
  // CLG(`

  //   called
  //   `);
  const { doc: inv, db } = args;
  const bundle = `${soapQueryStart}${inv.accessKey}${soapQueryEnd}`;
  let fresh = null;
  let sriResponse = null;
  let rprt = null;

  LG.verbose(`
    Invoice authorization to query :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);

  try {
    // CDR(urlQuery);
    // CDR(bundle);
    // CDR(headers);
    sriResponse = await axios.post(urlQuery, bundle, headers);
    // CDR(sriResponse.data);
    // CLG(`
    //    *******************************>>> <<<*************************************
    //   `);
    rprt = srixml(sriResponse.data);
    // CDR(rprt);
    fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
    fresh.authorizationStatus = rprt.authorizationStatus;
    if (rprt.authorizationStatus === soapQueryAuthorized) {
      fresh.authorized = rprt.authorized;
    } else {
      fresh.failed = rprt.failed;
    }

    const pt = await db.put(fresh);

    LG.info(`Authorization status PUT response :: ${JSON.stringify(pt, null, 2)}`);

    /* eslint-disable max-len */
    // if (sriResponse.data.includes(soapQueryAuthorized)) {
    //   const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
    //   fresh.authorized = extractTimestamp(sriResponse.data); // eslint-disable-line no-param-reassign, max-len
    //   // CLG(`|${sriResponse.data}|`);

    //   /* eslint-disable max-len */
    //   // parser.parseString(sriResponse.data, (err, result) => {
    //   //   if (err) throw new Error('Unable to parse SRI response XML');
    //   //   const body = result['soap:Envelope']['soap:Body'][0];
    //   //   const response = body['ns2:autorizacionComprobanteResponse'][0].RespuestaAutorizacionComprobante[0];
    //   //   delete response.autorizaciones[0].autorizacion[0].comprobante;
    //   //   CLG(`
    //   //     ${JSON.stringify(response, null, 2)}
    //   //   `);
    //   // });

    //   const pt = await db.put(fresh);

    //   LG.info(`Timestamp Put response :: ${JSON.stringify(pt, null, 2)}`);
    /* eslint-enable max-len */

    // }
  } catch (err) {
    LG.error(`\n\nError while requesting authorization status report:\n * ${err}\n\n`);
  }
};

export default query;
