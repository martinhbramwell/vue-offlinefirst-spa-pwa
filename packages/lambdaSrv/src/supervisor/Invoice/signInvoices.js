import fs from 'fs';
import signInvoice from './signInvoice'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
CLG(process.env.CERT);

const signing = async (args) => {
  const { db } = args;
  try {
    const result = await db.find({
      selector: {
        type: 'invoice',
        accepted: { $exists: false },
        authorized: { $exists: false },
        '_attachments.invoiceXml': { $exists: true },
        '_attachments.invoiceSigned': { $exists: false },
        // '_attachments.invoiceAuthorized': { $exists: false },
        // '_attachments.invoiceNotAuthorized': { $exists: false },
        // '_attachments.invoiceRejected': { $exists: false },
      },
    });
    LG.info(`\n
      Unsigned invoices :: ${JSON.stringify(result.docs.length, null, 3)}\n
    `);

    const cert = fs.readFileSync(process.env.CERT, { flag: 'r' });
    const pwd = process.env.CERTPWD;

    result.docs.forEach(inv => signInvoice({ inv, db, cert, pwd })); // eslint-disable-line object-curly-newline, max-len
  } catch (err) {
    LG.error(`Error signing invoices: ${JSON.stringify(err, null, 3)}`);
  }
};

export default signing;


/*
{
   "selector": {
      "type": "invoice",
      "data.codigo": {
         "$gt": "001-002-000010480",
         "$lt": "001-002-000010500"
      },
      "_attachments.invoiceXml": {
         "$exists": true
      },
      "_attachments.invoiceSigned": {
         "$exists": false
      }
   }
}
*/
