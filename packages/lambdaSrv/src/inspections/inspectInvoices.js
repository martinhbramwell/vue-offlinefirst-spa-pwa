import { databaseLocal } from '../database';
import findMaxRow from '../utils/findMaxRow';
import getInvoice from '../digitalDocuments/invoice';

import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

/* eslint-disable max-len */
// let theMovement = {};

// let invPers = {};
// let invPersMoves = {};

// let custPers = {};
// let custPersMoves = {};

// const theBottles = [];


/* e s l int-disable max-len, indent, no-unused-vars, object-curly-newline */
export default async (req, res) => {
  /* Get last invoice serial number  */

  res.write('<html><body text="lightyellow" bgcolor="#000007"><font face="Arial, Helvetica, sans-serif">');

  const CATEGORY_FIELD = {
    fieldName: 'data.type',
    sortOrder: 'desc',
    value: 'invoice',
    purge: true,
  };
  const SERIAL_INDEX = [
    {
      fieldName: '_id',
      first: 'Invoice_1_0000000000000000',
      last: 'Invoice_9',
    },
    {
      fieldName: 'data.sucursal',
      first: 0,
      last: 999,
    },
    {
      fieldName: 'data.pdv',
      first: 0,
      last: 999,
    },
    {
      fieldName: 'data.sequential',
      first: 0,
      last: 999999999,
    },
  ];

  const CODE_INDEX = [
    {
      fieldName: '_id',
      first: 'Invoice_1_0000000000000000',
      last: 'Invoice_9',
    },
    {
      fieldName: 'data.idib',
      first: 0,
      last: 99999999,
    },
  ];

  const serialIndexName = 'invoice_serial';
  const serialIndex = { name: serialIndexName, category: CATEGORY_FIELD, indexer: SERIAL_INDEX };
  const codeIndexName = 'invoice_code';
  const codeIndex = { name: codeIndexName, category: CATEGORY_FIELD, indexer: CODE_INDEX };

  try {
    const bbb = [];
    res.write(`Checked something :: ${Array.isArray(bbb)}<br /><br />`);

    const maxSerial = (await findMaxRow(databaseLocal, serialIndex));
    if (!maxSerial.data) throw new Error(`Unable to get results using index ${serialIndexName}!`);
    const { data: serial } = maxSerial;
    res.write(`</div>IB ID       :: ${JSON.stringify(serial.sequential, null, 2)}</div>`);

    const maxCode = (await findMaxRow(databaseLocal, codeIndex));
    if (!maxCode.data) throw new Error(`Unable to get results using index ${codeIndexName}!`);
    const { data: code } = maxCode;

    const invoice = `Invoice_1_${code.idib.toString().padStart(16, '0')}`;
    res.write(`<br /></div>Couch _id key :: ${JSON.stringify(invoice, null, 2)}</div>`);

    const digitalInvoice = (await getInvoice(databaseLocal, invoice));
    if (!digitalInvoice) throw new Error(`Unable to get invoice ${invoice}!`);
    // res.write('<br /><br /><div><textarea rows="140" cols="100" style="color:lightyellow;background-color:#000007;font-size:7pt">');
    // res.write(`<br /><br />Invoice is: \n${JSON.stringify(digitalInvoice, null, 2)}`);
    // res.write('</textarea></div>');
    LG.info(digitalInvoice);
  } catch (err) {
    res.write(`<br /></div>Query error ::  ${JSON.stringify(err, null, 2)}</div>`);
  }

  res.write('</body></html>');
  res.end();
};
