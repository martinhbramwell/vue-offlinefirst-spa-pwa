import axios from 'axios';

import xml2js from 'xml2js';

import { logger as LG } from '../../utils';
import {
  soapUploadStart,
  soapUploadEnd,
  urlUpload,
  headers,
  soapUploadReceived,
  soapUploadRegistered,
} from './soapFragments';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const send = async (args) => {
  const { doc: inv, db } = args;
  LG.verbose(`
    Invoice to send :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);

  // if (inv.data.idib !== 4257) return;

  try {
    const invSigned = await db.getAttachment(inv._id, 'invoiceSigned'); // eslint-disable-line no-underscore-dangle

    const invB64 = (Buffer.from(invSigned, 'utf-8')).toString('base64');

    const bundle = `${soapUploadStart}${invB64}${soapUploadEnd}`;

    // CLG(bundle);

    const sriResponse = await axios.post(urlUpload, bundle, headers);
    const { data: d } = sriResponse;
    CLG(`\n\nsriResponse.data for :: ${inv._id}. Rev :: ${inv._rev}`); // eslint-disable-line quotes, no-underscore-dangle
    CDR(d);

    xml2js.parseString(d, async (err, result) => {
      if (err) {
        CLG(`\n\n ***** Error *****\n\n`); // eslint-disable-line quotes
        CDR(err);
        return;
      }

      // CLG(`\n\nparse result`); // eslint-disable-line quotes
      // CDR(d.includes(soapUploadReceived));
      // CDR(d.includes(soapUploadRegistered));

      try {
        const success = d.includes(soapUploadReceived) || d.includes(soapUploadRegistered) ? 'accepted' : 'rejected';
        LG.info(`Upload response for invoice #${inv.data.codigo} : ${success}`);

        const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
        fresh[success] = true; // eslint-disable-line no-param-reassign, max-len
        const pt = await db.put(fresh);
        LG.info(`Put acceptance result : ${JSON.stringify(pt, null, 2)}`);
      } catch (errResult) {
        CLG(`Error saving acceptance result for ${inv.data.codigo}`);
        LG.error(errResult);
      }

      try {
        CLG(`Saving 'respuestaSRI' attachment for #${inv.data.codigo}`);
        const response = result['soap:Envelope']['soap:Body'][0]['ns2:validarComprobanteResponse'][0];
        const reception = (new xml2js.Builder())
          .buildObject(response.RespuestaRecepcionComprobante[0]);
        const attachment = (Buffer.from(reception, 'utf-8')).toString('base64');

        const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
        LG.info(`Will save reception response invoice as attachment.  Id :: ${fresh._id}. Rev :: ${fresh._rev}`); // eslint-disable-line no-underscore-dangle
        const attch = await db.putAttachment(fresh._id, 'respuestaSRI', fresh._rev, attachment, 'text/plain'); // eslint-disable-line no-underscore-dangle
        LG.info(`Saved reception response as attachment ${JSON.stringify(attch, null, 2)}`);
      } catch (errAttch) {
        CLG(`Error saving attachment for ${inv.data.codigo}`);
        LG.error(errAttch);
      }

      /* eslint-disable max-len */
      // setTimeout(async () => {
      //   CLG(`Saving 'respuestaSRI' attachment for #${inv.data.codigo}`);
      //   try {
      //     const response = result['soap:Envelope']['soap:Body'][0]['ns2:validarComprobanteResponse'][0];
      //     const reception = (new xml2js.Builder())
      //       .buildObject(response.RespuestaRecepcionComprobante[0]);
      //     const attachment = (Buffer.from(reception, 'utf-8')).toString('base64');

      //     const fresh = await db.get(inv._id); // eslint-disable-line no-underscore-dangle
      //     LG.info(`Will save reception response invoice as attachment.  Id :: ${fresh._id}. Rev :: ${fresh._rev}`); // eslint-disable-line no-underscore-dangle
      //     const attch = await db.putAttachment(fresh._id, 'respuestaSRI', fresh._rev, attachment, 'text/plain'); // eslint-disable-line no-underscore-dangle
      //     LG.info(`Saved reception response as attachment ${JSON.stringify(attch, null, 2)}`);
      //   } catch (errAttch) {
      //     LG.error(errAttch);
      //   }
      // }, 1000);
      /* eslint-enable max-len */
    });
  } catch (err) {
    LG.error(err);
  }
};

export default send;
