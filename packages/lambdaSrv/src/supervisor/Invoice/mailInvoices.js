import mailInvoice from './mailInvoice';

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const processing = async (args) => {
  const { db } = args;
  try {
    const result = await db.find({
      selector: {
        type: 'invoice',
        void: false,
        hold: false,
        accepted: { $exists: true },
        authorized: { $exists: true },
        'emailed.sent': { $ne: true },
        '_attachments.invoiceXml': { $exists: true },
        '_attachments.invoiceSigned': { $exists: true },
        '_attachments.respuestaSRI': { $exists: true },
        // '_attachments.invoiceAuthorized': { $exists: false },
        // '_attachments.invoiceNotAuthorized': { $exists: false },
        // '_attachments.invoiceRejected': { $exists: false },
      },
    });
    LG.info(`\n
      Authorized invoices not yet emailed :: ${JSON.stringify(result.docs.length, null, 3)}\n
    `);

    /* eslint-disable no-restricted-syntax */
    // result.docs.forEach(inv => queryAuthorization({ doc, db }));
    const proms = [];
    for (const doc of result.docs) {
      proms.push(mailInvoice({ doc, db }));
    }
    /* eslint-enable no-restricted-syntax */

    await Promise.all(proms);
  } catch (err) {
    LG.error(`Error querying authorizations : ${JSON.stringify(err, null, 3)}`);
  }
};

export default processing;
