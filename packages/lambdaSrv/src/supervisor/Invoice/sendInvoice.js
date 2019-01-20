import { logger as LG } from '../../utils';
import soapUpldEnd from './soapUpldEnd';
import soapUpldStart from './soapUpldStart';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const send = async (inv, db) => {
  LG.verbose(`
    Invoice to send :: ${JSON.stringify(inv.data.idib, null, 2)}
    `);

  try {
    const invSigned = await db.getAttachment(inv._id, 'invoiceSigned'); // eslint-disable-line no-underscore-dangle

    const invB64 = (Buffer.from(invSigned, 'utf-8')).toString('base64');

    const bundle = `${soapUpldStart}${invB64}${soapUpldEnd}`;

    CLG(bundle);

    LG.info(`Sent bundled invoice ${JSON.stringify(inv.data.idib, null, 2)}`);
  } catch (err) {
    LG.error(err);
  }
};

export default send;
