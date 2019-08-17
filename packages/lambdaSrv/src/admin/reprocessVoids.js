import { booleanVal, getRandomInt, logger as LG } from '../utils'; // eslint-disable-line no-unused-vars
import { databaseLocal as db } from '../database';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const getFirstSequential = (seqs) => {
  let idx = -1;
  let looking = true;
  do {
    idx += 1;
    looking = parseInt(seqs[idx], 10) < 1;
    // console.log(`${idx} ${looking}`);
  } while (idx < seqs.length - 1 && looking);

  // CLG(looking);
  const ret = {
    prefix: '0',
    strSerial: '0',
    intSerial: 0,
    sequential: '0',
  };
  if (looking) {
    ret.prefix = getRandomInt(9999).toString().padStart(4, '0');
    ret.intSerial = 1;
    ret.strSerial = ret.intSerial.toString().padStart(5, '0');
    ret.sequential = `${ret.prefix}${ret.strSerial}`;
  } else {
    ret.sequential = seqs[idx].toString();
    // ret.prefix = ret.sequential.slice(0, 4);
    ret.prefix = 0;
    ret.strSerial = ret.sequential.slice(-5);
    ret.intSerial = parseInt(ret.strSerial, 10);
  }
  return ret;
};


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

  let seqPrefix = null;
  const randomPrefix = false;
  if (randomPrefix) {
    seqPrefix = getRandomInt(9999).toString().padStart(4, '0');
  } else {
    const seqs = invoices.map(seq => seq.doc.data.sequential);
    const firstSequential = getFirstSequential(seqs);
    const { prefix } = firstSequential;
    seqPrefix = prefix;
    // const seqPrefix = invoices[0].doc.data.sequential.toString().slice(0, 4);
  }

  let subtractor = parseInt(invoices[0].doc.data.seqib.toString().slice(-5), 10) - 1;

  const writes = invoices.map((itm) => {
    const inv = itm;
    const seqBAPU = inv.doc.data.seqib.toString();
    const isVoid = booleanVal(inv.doc.void);
    if (isVoid || voidedIds.includes(seqBAPU)) {
      inv.doc.void = true;
      subtractor += 1;
      inv.doc.data.sequential = 0;
      inv.doc.data.codigo = '???-???-?????????';
    } else {
      inv.doc.void = false;
      const seq = parseInt(seqBAPU.slice(-7), 10);
      const maxSeqLen = 9;
      const strSequential = `${seqPrefix}${(seq - subtractor).toString().padStart(maxSeqLen - seqPrefix.toString().length, '0')}`;
      inv.doc.data.sequential = strSequential;
      inv.doc.data.codigo = `001-002-${strSequential}`;
    }
    return inv.doc;
  });

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
  res.write(`Wait 2 minutes the click on :: <a href=${req.protocol}://${req.get('host')}/gestionDeFacturas>${req.protocol}://${req.get('host')}/gestionDeFacturas'}</a>`);
  res.write('</body></html>');
  res.end();
};
