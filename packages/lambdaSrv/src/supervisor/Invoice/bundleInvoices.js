import bundleInvoice from './bundleInvoice'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const bundle = async (args) => {
  const { db } = args;
  try {
    const result = await db.find({
      selector: {
        type: 'invoice',
        void: false,
        hold: false,
        accepted: { $exists: false },
        authorized: { $exists: false },
        '_attachments.invoiceXml': { $exists: false },
        '_attachments.invoiceSigned': { $exists: false },


        // // '_attachments.invoiceAuthorized': { $exists: false },
        // // '_attachments.invoiceNotAuthorized': { $exists: false },
        // // '_attachments.invoiceRejected': { $exists: false },
      },
    });
    LG.info(`\n
      Unbundled invoices :: ${JSON.stringify(result.docs.length, null, 3)}\n`);

    /* eslint-disable no-restricted-syntax */
    // await result.docs.forEach(doc => bundleInvoice({ doc, db }));
    const proms = [];
    for (const doc of result.docs) {
      proms.push(bundleInvoice({ doc, db }));
    }
    /* eslint-enable no-restricted-syntax */

    await Promise.all(proms);
  } catch (err) {
    LG.error(`Error bundling invoices: ${JSON.stringify(err, null, 3)}`);
  }
};

export default bundle;
