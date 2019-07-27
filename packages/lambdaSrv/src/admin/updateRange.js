import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars
import listRange from '../utils/listRange';
import { databaseLocal as db } from '../database';
import { processVoids } from './reprocessVoids';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

export default async (req, res) => {
  CLG(`updateRange.js ${req.query}`);
  CDR(req.query);

  res.write('<html><body>');

  if (req.query.e && req.query.s && req.query.alt) {
    res.write(`</br>Start key : ${req.query.s}`);
    res.write(`</br>End key : ${req.query.e}`);
    // CDR(req.query.alt);
    const alteration = JSON.parse(req.query.alt);
    // CDR(alteration);
    res.write(`</br>Alteration : ${req.query.alt}`);
    res.write('</br>');

    const config = {
      startkey: req.query.s,
      endkey: req.query.e,
      alteration,
    };

    const updates = await listRange(res, db, config);
    // CDR(updates);
    await db.bulkDocs(updates);

    processVoids([]);

    res.write('</br></br>Updated some "Invoice" records');
  } else {
    const url = `${req.protocol}://${req.headers.host}${req.url}`;

    res.write('</br></br>No range specified.');
    res.write('</br>Example usage ::');
    res.write(`</br>&nbsp; &nbsp; &nbsp; <a href="${url}?s=Invoice_1_0000000000004685&e=Invoice_1_0000000000004685&alt={%22dummy%22:%22xxx%22}">${url}?s=Invoice_1_0000000000004685&e=Invoice_1_0000000000004685&alt={%22dummy%22:%22xxx%22}</a>`);
  }

  res.write('</body></html>');
  res.end();
};
