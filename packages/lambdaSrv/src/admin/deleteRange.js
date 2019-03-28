import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars
import listRange from '../utils/listRange';
import { databaseLocal as db } from '../database';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

export default async (req, res) => {
  CLG(`deleteRange.js ${req.body}`);
  CDR(req.body);

  res.write('<html><body>');

  const config = {
    startkey: 'Request_2',
    endkey: 'Request_3',
    alteration: { _deleted: true },
  };

  const deletions = await listRange(res, db, config);
  CDR(deletions);
  await db.bulkDocs(deletions);

  res.write('</br></br>Deleted all "Request" records');

  res.write('</body></html>');
  res.end();
};
