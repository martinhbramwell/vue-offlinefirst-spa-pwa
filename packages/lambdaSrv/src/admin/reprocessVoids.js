import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars
import { databaseLocal as db } from '../database';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

export const processVoids = async (voidsToProcess) => {
  CLG('Process voids');
  const dbInvoices = await db.allDocs({
    include_docs: true,
    attachments: true,
    // startkey: 'Invoice_2',
    // endkey: 'Invoice_1_0000000000000000',
    // descending: true,

    startkey: 'Invoice_1_0000000000000000',
    endkey: 'Invoice_2',
  });

  const invoices = dbInvoices.rows;
  const voidedIds = voidsToProcess.map(inv => inv[0].replace('h', ''));
  const first = invoices[0].doc.data.sequential;
  let subtractor = invoices[0].doc.data.seqib - first;

  const writes = invoices.map((itm) => {
    const inv = itm;
    const seq = inv.doc.data.seqib;
    if ((inv.doc.void && inv.doc.void === true) || voidedIds.includes(seq.toString())) {
      inv.doc.void = true;
      subtractor += 1;
      inv.doc.data.sequential = 0;
      inv.doc.data.codigo = '???-???-?????????';
    } else {
      inv.doc.void = inv.doc.void || false;
      const sequential = seq - subtractor;
      inv.doc.data.sequential = sequential;
      inv.doc.data.codigo = `001-002-${sequential.toString().padStart('0', 9)}`;
      // const annul = settings[`h${seq}`].V && !inv.doc._attachments;
      // inv.doc.void = inv.doc.void || annul;

      // if (inv.doc.void) {
      // } else {
      // }
    }
    return inv.doc;
  });
  /* eslint-enable no-param-reassign, no-underscore-dangle */

  await db.bulkDocs(writes);

  CLG('Processed voids');
};


export default async (req, res) => {
  CLG(`updateRange.js ${req.query}`);
  CLG(`full request URL ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  // CDR(req);

  processVoids([]);

  res.write('<html><body>');
  res.write('Voids reprocessing has been dispatched.');
  res.write(`Wait 2 minutes the click on :: <a href=${req.protocol}://${req.get('host')}/gestionDeFacturas'}>${req.protocol}://${req.get('host')}/gestionDeFacturas'}</a>`);
  res.write('</body></html>');
  res.end();
};
