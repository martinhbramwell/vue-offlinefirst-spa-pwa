import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars
import listRange from '../utils/listRange';
import { databaseLocal as db } from '../database';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

export default async (req, res) => {
  CLG(`updateRange.js ${req.body}`);
  CDR(req.body);

  res.write('<html><body>');

  const config = {
    startkey: 'qqqInvoice_1_0000000000004626',
    endkey: 'qqqInvoice_2',
    alteration: { fixed: Date.now() / 1000 | 0 },
  };

  const updates = await listRange(res, db, config);
  CDR(updates);
  await db.bulkDocs(updates);

  res.write('</br></br>Updated some "Invoice" records');

  res.write('</body></html>');
  res.end();
};
