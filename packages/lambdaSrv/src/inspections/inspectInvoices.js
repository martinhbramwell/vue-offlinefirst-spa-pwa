import { databaseLocal } from '../database';
import findMaxRow from '../utils/findMaxRow';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console

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

  res.write('<html><body  text="lightyellow" bgcolor="#000007">');

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
      last: 9999,
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
      last: 9999,
    },
  ];

  const serialIndex = { name: 'invoice_serial', category: CATEGORY_FIELD, indexer: SERIAL_INDEX };
  const codeIndex = { name: 'invoice_code', category: CATEGORY_FIELD, indexer: CODE_INDEX };

  try {
    const { data: serial } = (await findMaxRow(databaseLocal, serialIndex));
    res.write(`</div>Query result -- Serial #${JSON.stringify(serial.sequential, null, 2)}</div>`);

    const { data: code } = (await findMaxRow(databaseLocal, codeIndex));
    res.write(`<br /></div>Query result -- Code #${JSON.stringify(code.idib, null, 2)}</div>`);
  } catch (err) {
    res.write(`</div>Query error ::  ${JSON.stringify(err, null, 2)}</div>`);
  }

  res.write('</body></html>');
  res.end();
};
