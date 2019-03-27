import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars
import { databaseLocal } from '../database';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console


const listRecords = async (res) => { // eslint-disable-line no-unused-vars
  CLG('List Records');
  const dbRecords = await databaseLocal.allDocs({
    include_docs: true,
    attachments: true,
    // startkey: 'Invoice_2',
    // endkey: 'Invoice_1_0000000000000000',
    // descending: true,

    startkey: 'qqqqqqRequest_2',
    endkey: 'qqqqqqRequest_3',
  });

  const invoices = dbRecords.rows;
  const deletions = [];
  invoices.forEach((invoice) => {
    // CLG(`${invoice.id} (${invoice.value.rev})`);
    deletions.push({ _deleted: true, _id: invoice.id, _rev: invoice.value.rev });
    res.write('</br>');
    res.write(`${invoice.id} (${invoice.value.rev})`);
  });


  CLG('Listed Records');

  return deletions;
};


export default async (req, res) => {
  CLG(`deleteRange.js ${req.body}`);
  CDR(req.body);

  res.write('<html><body>');

  const deletions = await listRecords(res);
  CDR(deletions);
  await databaseLocal.bulkDocs(deletions);

  res.write('</br></br>Deleted all "Request" records');

  res.write('</body></html>');
  res.end();
};
