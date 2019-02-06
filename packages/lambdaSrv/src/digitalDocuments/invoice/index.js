/* eslint-disable max-len, no-unused-vars */
import template from './template'; // eslint-disable-line no-unused-vars
import recursivePopulate from './recursivePopulate';

import { logger as LG } from '../../utils'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

let inv = null;
export default async (db, startkey) => {
  try {
    const val = await db.allDocs({
      include_docs: true,
      startkey,
      limit: 1,
    });
    inv = val && val.rows && val.rows[0] ? val.rows[0].doc.data : {};
  } catch (err) {
    LG.error(`AllDocs failed to retrieve invoices from ${startkey}: <${err}>`);
  }

  // LG.verbose(`\n\nInvoice to process:: ${JSON.stringify(inv, null, 2)}  `);
  // LG.verbose(`\n\nTemplate to use :: ${JSON.stringify(template, null, 2)}  `);

  // const jsonInvoice = recursivePopulate(inv, JSON.parse(JSON.stringify(template)));
  const jsonInvoice = recursivePopulate({
    data: inv,
    _tmplt: JSON.parse(JSON.stringify(template)),
  });

  // LG.debug(`\nDone :: ${JSON.stringify(jsonInvoice, null, 2)}`);

  // const infoFactura = `${HEAD}${toXML(test)}${FOOT}`;
  // return infoFactura;

  return jsonInvoice;
};
