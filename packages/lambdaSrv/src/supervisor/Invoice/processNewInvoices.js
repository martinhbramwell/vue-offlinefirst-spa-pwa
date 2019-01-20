import bundleXML from './bundleXML'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const bundle = async (db) => {
  try {
    const result = await db.find({
      selector: {
        type: 'invoice',
        '_attachments.invoiceXml': { $exists: false },
        '_attachments.invoiceSigned': { $exists: false },
        '_attachments.invoiceAuthorized': { $exists: false },
        '_attachments.invoiceNotAuthorized': { $exists: false },
        '_attachments.invoiceRejected': { $exists: false },
      },
    });
    LG.info(`\n
      Unbundled invoices :: ${JSON.stringify(result.docs.length, null, 3)}\n`);
    result.docs.forEach(inv => bundleXML({ inv, db }));
  } catch (err) {
    LG.error(`Error bundling invoices: ${JSON.stringify(err, null, 3)}`);
  }
};

export default bundle;
