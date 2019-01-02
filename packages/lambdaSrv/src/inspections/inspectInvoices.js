import fs from 'fs';

import { databaseLocal } from '../database';
import findMaxRow from '../utils/findMaxRow';
import getInvoice from '../digitalDocuments/invoice';

import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const HEAD = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<factura id="comprobante" version="1.0.0">`;
const FOOT = `
</factura>`;

const sep = '\n';
const toXML = (inv, lvl = 1, inAry = false) => {
  const lt = '<';
  const gt = '>';
  const indent = '    '.repeat(lvl);

  const dt = 'detalle';

  let doc = '';

  if (inAry) {
    inv.forEach((det) => {
      doc = `${doc}${sep}${indent}${lt}${dt}${gt}${toXML(det, lvl + 1)}${sep}${indent}${lt}/${dt}${gt}`;
    });
  } else {
    Object.keys(inv).forEach((k) => {
      const tag = inv[k];
      if (typeof tag === 'object') {
        doc = `${doc}${sep}${indent}${lt}${k}${gt}${toXML(tag, lvl + 1, Array.isArray(tag))}${sep}${indent}${lt}/${k}${gt}`;
      } else {
        doc = `${doc}${sep}${indent}${lt}${k}${gt}${tag}${lt}/${k}${gt}`;
      }
    });
  }
  return doc;
};


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

    const jsonInvoice = (await getInvoice(databaseLocal, invoice));
    if (!jsonInvoice) throw new Error(`Unable to get invoice ${invoice}!`);
    const uniqueId = jsonInvoice.infoTributaria.claveAcceso;
    LG.info(`Got invoice ${uniqueId}`);

    const digitalInvoice = `${HEAD}${toXML(jsonInvoice)}${FOOT}`;

    LG.info(digitalInvoice);

    fs.writeFile(`/tmp/${uniqueId}.xml`, digitalInvoice, (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;

      // success case, the file was saved
      LG.info('Invoice saved!');
    });
  } catch (err) {
    res.write(`<br /></div>Query error ::  ${JSON.stringify(err, null, 2)}</div>`);
  }

  res.write('</body></html>');
  res.end();
};
