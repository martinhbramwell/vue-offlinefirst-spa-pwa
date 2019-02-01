import axios from 'axios';

import { logger as LG } from '../../utils';
import {
  soapUploadStart,
  soapUploadEnd,
  urlUpload,
  headers,
  soapUploadReceived,
} from './soapFragments';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

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
    CLG(sriResponse.data);


    const success = sriResponse.data.includes(soapUploadReceived) ? 'accepted' : 'rejected';
    inv[success] = true; // eslint-disable-line no-param-reassign, max-len

    const pt = await db.put(inv);
    LG.info(`Put acceptance result : ${JSON.stringify(pt, null, 2)}`);


    LG.info(`Sent bundled invoice ${JSON.stringify(inv.data.idib, null, 2)}`);
  } catch (err) {
    LG.error(err);
  }
};

export default send;
