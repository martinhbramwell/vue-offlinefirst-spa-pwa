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
    const invSigned = await db.getAttachment(inv._id, 'invoiceSigned'); // eslint-disable-line no-underscore-dangle

    const invB64 = (Buffer.from(invSigned, 'utf-8')).toString('base64');

    const bundle = `${soapUploadStart}${invB64}${soapUploadEnd}`;

    const sriResponse = await axios.post(urlUpload, bundle, headers);
    const { data } = sriResponse;
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

    // CLG(`\n\nsriResponse.data for :: ${inv._id}. Rev :: ${inv._rev}`); // eslint-disable-line quotes, no-underscore-dangle, max-len
    // CDR(data);
    /* eslint-enable max-len */
    const jsonResponse = decodeSriUploadXml(data);
    LG.info(`\n\nUpload result for '${inv.data.codigo}' : ${JSON.stringify(jsonResponse.attachment, null, 2)}`);
    if (jsonResponse.reason && jsonResponse.reason.code === 43) jsonResponse.flag = 'accepted'; // eslint-disable-line max-len

    try {
      LG.verbose(`Upload response for invoice #${inv.data.codigo} : ${jsonResponse}`);
      const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
      delete fresh.returned;
      fresh[jsonResponse.flag] = true; // eslint-disable-line no-param-reassign, max-len
      if (jsonResponse.flag !== 'accepted') {
        fresh.reason = jsonResponse.reason; // eslint-disable-line no-param-reassign, max-len
      }
      const pt = await db.put(fresh);
      LG.verbose(`Put acceptance result : ${JSON.stringify(pt, null, 2)}`);
    } catch (errResult) {
      CLG(`Error saving acceptance result for ${inv.data.codigo}`);
      LG.error(errResult);
    }

    try {
      // CLG(`Saving 'respuestaSRI' attachment for #${inv.data.codigo}`);
      const xmlAttachment = (new xml2js.Builder()).buildObject(jsonResponse.attachment);
      const attachment = (Buffer.from(xmlAttachment, 'utf-8')).toString('base64');

      const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
      LG.verbose(`Will save reception response as attachment.  Id :: ${fresh._id}. Rev :: ${fresh._rev}`); // eslint-disable-line no-underscore-dangle
      const attch = await db.putAttachment(fresh._id, 'respuestaSRI', fresh._rev, attachment, 'text/plain'); // eslint-disable-line no-underscore-dangle
      LG.verbose(`Saved reception response as attachment ${JSON.stringify(attch, null, 2)}`);
    } catch (errAttch) {
      CLG(`Error saving attachment for ${inv.data.codigo}`);
      LG.error(errAttch);
    }
    LG.info(`\n\nResult recorded for '${inv.data.codigo}  (${inv.data.idib}) '\n`);
  } catch (err) {
    LG.error(err);
  }
};

export default send;
