import process from 'process';
import sendInvoice from './sendInvoice';

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const processing = async (args) => {
  const { db } = args;
  try {
    const result = await db.find({
      selector: {
        type: 'invoice',
        void: false,
        hold: false,
        rejected: { $exists: false },
        authorized: { $exists: false },
        '_attachments.invoiceXml': { $exists: true },
        '_attachments.invoiceSigned': { $exists: true },
      },
    });
    LG.info(`\n
      Unsent invoices :: ${JSON.stringify(result.docs.length, null, 3)}\n
    `);

    result.docs.forEach(async doc => {
      sendInvoice({ doc, db });
    });
  } catch (err) {
    LG.error(`Error sending invoices: ${JSON.stringify(err, null, 3)}`);
  }
};

export default processing;
