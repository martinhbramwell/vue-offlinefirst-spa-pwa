import queryAuthorization from './queryAuthorization';

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
CLG(process.env.CERT);

const processing = async (args) => {
  const { db } = args;
  try {
    const result = await db.find({
      selector: {
        type: 'invoice',
        accepted: { $exists: true },
        authorized: { $exists: false },
        '_attachments.invoiceXml': { $exists: true },
        '_attachments.invoiceSigned': { $exists: true },
        // '_attachments.invoiceAuthorized': { $exists: false },
        // '_attachments.invoiceNotAuthorized': { $exists: false },
        // '_attachments.invoiceRejected': { $exists: false },
      },
    });
    LG.info(`\n
      Sent invoices not yet queried :: ${JSON.stringify(result.docs.length, null, 3)}\n
    `);

    result.docs.forEach(inv => queryAuthorization({ inv, db }));
  } catch (err) {
    LG.error(`Error querying authorizations : ${JSON.stringify(err, null, 3)}`);
  }
};

export default processing;
