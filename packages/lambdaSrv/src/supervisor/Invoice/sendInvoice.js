import axios from 'axios';
import xml2js from 'xml2js';

import { logger as LG } from '../../utils';
import decodeSriUploadXml from '../../utils/decodeSriUploadXml';

import {
  soapUploadStart,
  soapUploadEnd,
  urlUpload,
  headers,
} from './soapFragments';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const send = async (args) => {
  const { doc: inv, db } = args;
  LG.verbose(`
    Invoice to send :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);

  try {
    /* eslint-disable no-underscore-dangle */
    CLG(`get attachment :: ${inv._id}.`);
    const invSigned = await db.getAttachment(inv._id, 'invoiceSigned'); // eslint-disable-line no-underscore-dangle
    CLG(`get B64 :: ${inv._id}.`);
    const invB64 = (Buffer.from(invSigned, 'utf-8')).toString('base64');

    CLG(`bundle it :: ${inv._id}.`);
    const bundle = `${soapUploadStart}${invB64}${soapUploadEnd}`;

    CLG(`post it :: ${inv._id}.`);
    CDR(urlUpload);
    CDR(headers);
    const sriResponse = await axios.post(urlUpload, bundle, headers);

    CLG(`evaluate response :: ${inv._id}.`);
    const { data } = sriResponse;
    /* eslint-enable no-underscore-dangle */

    /* eslint-disable max-len */
    //     const data = `
    // <?xml version="1.0"?>
    // <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    // <soap:Body>
    //     <ns2:validarComprobanteResponse xmlns:ns2="http://ec.gob.sri.ws.recepcion">
    //     <RespuestaRecepcionComprobante>
    //       <estado>DEVUELTA</estado>
    //       <comprobantes>
    //         <comprobante>
    //           <claveAcceso>2708201901179217775800120010020000002661234567814</claveAcceso>
    //           <mensajes>
    //             <mensaje>
    //               <identificador>70</identificador>
    //               <mensaje>CLAVE DE ACCESO EN PROCESAMIENTO </mensaje>
    //               <informacionAdicional>La clave de acceso 2708201901179217775800120010020000002661234567814  esta en procesamiento VALOR DEVUELTO POR EL PROCEDIMIENTO: SI</informacionAdicional>
    //               <tipo>ERROR</tipo>
    //             </mensaje>
    //           </mensajes>
    //         </comprobante>
    //       </comprobantes>
    //     </RespuestaRecepcionComprobante>
    // </ns2:validarComprobanteResponse>
    // </soap:Body>
    // </soap:Envelope>
    // `;

    CLG(`\n\nsriResponse.data for :: ${inv._id}. Rev :: ${inv._rev}`); // eslint-disable-line quotes, no-underscore-dangle, max-len
    CDR(data);

    /* eslint-enable max-len */
    const jsonResponse = decodeSriUploadXml(data);
    LG.info(`\n\nUpload result was (${jsonResponse.reason.code}) for '${inv.data.codigo}' :
      ${JSON.stringify(jsonResponse.attachment, null, 2)}`);
    // LG.info(`\n\nUpload result for '${inv.data.codigo}'
    //   : ${JSON.stringify(jsonResponse.attachment, null, 2)}`);
    if (jsonResponse.reason && jsonResponse.reason.code === 43) jsonResponse.flag = 'accepted'; // eslint-disable-line max-len

    try {
      const fake = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
      const pt = await db.put(fake);
    } catch (errResult) {
      CLG(`Faked error`);
      LG.error(`Faked error :: ${errResult} with invoice ${inv._id}`);
    }

    try {
      LG.verbose(`Upload response for invoice #${inv.data.codigo} : ${jsonResponse.flag}`);
      const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
      // CLG("Got fresh invoice record copy...");
      // CDR(fresh);
      delete fresh.returned;
      fresh[jsonResponse.flag] = true; // eslint-disable-line no-param-reassign, max-len
      if (jsonResponse.flag !== 'accepted') {
        fresh.reason = jsonResponse.reason; // eslint-disable-line no-param-reassign, max-len
      }
      // CLG("Putting acceptance result...");
      // CDR(fresh);
      const pt = await db.put(fresh);
      LG.info(`Put acceptance result : ${JSON.stringify(pt, null, 2)}`);
    } catch (errResult) {
      CLG(`Error saving acceptance result for ${inv.data.codigo}`);
      LG.error(`While saving acceptance result for ${inv.data.codigo} :: ${errResult}`);
    }

    try {
      // CLG(`Saving 'respuestaSRI' attachment for #${inv.data.codigo}`);
      const xmlAttachment = (new xml2js.Builder()).buildObject(jsonResponse.attachment);
      const attachment = (Buffer.from(xmlAttachment, 'utf-8')).toString('base64');

      const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
      LG.verbose(`Will save reception response as attachment.  Id :: ${fresh._id}. Rev :: ${fresh._rev}`); // eslint-disable-line no-underscore-dangle
      const attch = await db.putAttachment(fresh._id, 'respuestaSRI', fresh._rev, attachment, 'text/plain'); // eslint-disable-line no-underscore-dangle
      LG.info(`Saved reception response as attachment ${JSON.stringify(attch, null, 2)}`);
    } catch (errAttch) {
      CLG(`Error saving attachment for ${inv.data.codigo}`);
      LG.error(errAttch);
    }
    LG.info(`\n\nResult recorded for '${inv.data.codigo}  (${inv.data.idib}) '\n`);
  } catch (err) {
    CLG('Axios POST error encountered');
    LG.error(err);
  }
};

export default send;
