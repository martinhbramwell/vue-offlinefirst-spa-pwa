import sendInvoice from './sendInvoice';

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
CLG(process.env.CERT);

const processing = async (args) => {
  const { db } = args;
  try {
    const result = await db.find({
      selector: {
        type: 'invoice',
        accepted: { $exists: false },
        authorized: { $exists: false },
        '_attachments.invoiceXml': { $exists: true },
        '_attachments.invoiceSigned': { $exists: true },
        // '_attachments.invoiceAuthorized': { $exists: false },
        // '_attachments.invoiceNotAuthorized': { $exists: false },
        // '_attachments.invoiceRejected': { $exists: false },
      },
    });
    LG.info(`\n
      Unsent invoices :: ${JSON.stringify(result.docs.length, null, 3)}\n
    `);


    /* eslint-disable no-restricted-syntax */
    // result.docs.forEach(doc => sendInvoice({ doc, db }));
    const proms = [];
    for (const doc of result.docs) {
      proms.push(sendInvoice({ doc, db }));
    }
    /* eslint-enable no-restricted-syntax */

    await Promise.all(proms);
  } catch (err) {
    LG.error(`Error signing invoices: ${JSON.stringify(err, null, 3)}`);
  }
};

export default processing;