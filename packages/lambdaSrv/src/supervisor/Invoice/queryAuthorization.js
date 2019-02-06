import axios from 'axios';
// import { Parser } from 'xml2js';

// import xpath from 'xpath';
import { DOMParser } from 'xmldom';
// import { DOMParser, XMLSerializer } from 'xmldom';

import { logger as LG } from '../../utils';
import {
  soapQueryStart,
  soapQueryEnd,
  urlQuery,
  headers,
  soapQueryAuthorized,
} from './soapFragments';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const extractTimestamp = (xml) => {
  try {
    // const srlzr = new XMLSerializer();
    const dom = new DOMParser().parseFromString(xml.data);
    const response = dom.childNodes[0].childNodes[0].childNodes[0].childNodes[0];

    let look = true;
    let cntRespElems = -1;
    while (look && cntRespElems < Object.keys(response.childNodes).length) {
      cntRespElems += 1;
      look = response.childNodes[cntRespElems].localName !== 'autorizaciones';
    }

    const autorizacion = response.childNodes[cntRespElems].childNodes[0];
    // const strAut = srlzr.serializeToString(autorizacion);
    // CLG(autorizacion.childNodes[1].localName);

    look = true;
    let cntAutDate = -1;
    while (look && cntAutDate < Object.keys(autorizacion.childNodes).length) {
      cntAutDate += 1;
      look = autorizacion.childNodes[cntAutDate].localName !== 'fechaAutorizacion';
    }

    CLG(`fechaAutorizacion :: ${autorizacion.childNodes[cntAutDate].firstChild.data}`);
    return autorizacion.childNodes[cntAutDate].firstChild.data;
  } catch (err) {
    LG.error(`Error while reading XML reply ${err}`);
    return 'no timestamp';
  }
};

const query = async (args) => { // eslint-disable-line no-unused-vars
  const { doc: inv, db } = args;
  LG.verbose(`
    Invoice authorization to query :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);

  try {
    const bundle = `${soapQueryStart}${inv.accessKey}${soapQueryEnd}`;
    // CLG(bundle);

    const sriResponse = await axios.post(urlQuery, bundle, headers);
    if (sriResponse.data.includes(soapQueryAuthorized)) {
      const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
      fresh.authorized = extractTimestamp(sriResponse); // eslint-disable-line no-param-reassign
      // CLG(`|${sriResponse.data}|`);

      /* eslint-disable max-len */
      // parser.parseString(sriResponse.data, (err, result) => {
      //   if (err) throw new Error('Unable to parse SRI response XML');
      //   const body = result['soap:Envelope']['soap:Body'][0];
      //   const response = body['ns2:autorizacionComprobanteResponse'][0].RespuestaAutorizacionComprobante[0];
      //   delete response.autorizaciones[0].autorizacion[0].comprobante;
      //   CLG(`
      //     ${JSON.stringify(response, null, 2)}
      //   `);
      // });

      const pt = await db.put(fresh);

      LG.info(`Timestamp Put response :: ${JSON.stringify(pt, null, 2)}`);
    }
  } catch (err) {
    LG.error(`Error while requesting authorization status report ${err}`);
  }
};

export default query;
