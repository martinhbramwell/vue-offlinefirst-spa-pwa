import fs from 'fs';

import { databaseLocal } from '../database';
import findMaxRow from '../utils/findMaxRow';
import getInvoice from '../digitalDocuments/invoice';

import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const HEAD = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<factura id="comprobante" version="1.0.0">`;
const FOOT = `
</factura>`;

const sep = '\n';
const toXML = (inv, lvl = 1, inAry = false) => {
  const lt = '<';
  const gt = '>';
  const indent = '    '.repeat(lvl);


  let doc = '';

  if (inAry) {
    if (inv[0].extra) {
      const xt = inv[0].extra;
      inv[0][xt].forEach((ext) => {
        CLG(`Extra :: ${JSON.stringify(ext, null, 2)}`);
        const { name, value } = ext.attribute;
        const { text } = ext;
        doc = `${doc}${sep}${indent}${lt}${xt} ${name}="${value}"${gt}`;
        doc = `${doc}${text}`;
        doc = `${doc}${lt}/${xt}${gt}`;
      });
    } else {
      const dt = 'detalle';
      inv.forEach((det) => {
        doc = `${doc}${sep}${indent}${lt}${dt}${gt}${toXML(det, lvl + 1)}${sep}${indent}${lt}/${dt}${gt}`;
      });
    }
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


/* eslint-disable max-len */
export default async (req, res) => {
  /* Get last invoice serial number  */

  res.write(`
<!DOCTYPE html>
<html>
<head>
<style>
#customers {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#customers td, #customers th {
  border: 1px solid #ddd;
  padding: 8px;
}

#customers tr:nth-child(even){background-color: #336600;}

#customers tr:hover {background-color: #ddd;}

#customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #4CAF50;
  color: white;
}
</style>
</head>
  `);

  res.write('<body text="lightyellow" bgcolor="#000007"><font face="Arial, Helvetica, sans-serif">');

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

  const getPersonRecord = async (name) => { // eslint-disable-line arrow-body-style
    return databaseLocal.find({
      selector: {
        'data.type': 'person',
        'data.nombre': name,
      },
    });
  };

  // CAN'T USE ARROW FUNCTION IN THIS CASE
  const writePersons = async function (inv, out) { // eslint-disable-line func-names
    const d = inv.doc.data;
    const fecha = new Date(d.fecha);

    const persons = await getPersonRecord(d.nombreCliente);

    out.write(`<tr>
      <td>${d.sequential}</td>
      <td>${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}</td>
      <td>${d.nombreCliente}</td>
      <td><ul><li>${d.legalId}</li></ul></td>
      <td><ul><li>${d.email}</li></ul></td>
      <td><ul><li>${d.telefono}</li></ul></td>
      <td>${d.direccion}</td>
      </tr>
    `);

    let ids = '';
    let emails = '';
    let phones = '';

    persons.docs.forEach((person) => {
      const pdd = person.data;
      ids += `<li>${pdd.ruc_cedula}</li>`;
      emails += `<li>${pdd.email}</li>`;
      phones += `<li>${pdd.telefono_1.replace(/\D/g, '')}</li>`;
    });

    out.write(`<tr>
      <td></td>
      <td></td>
      <td></td>
      <td><ul>${ids}</ul></td>
      <td><ul>${emails}</ul></td>
      <td><ul>${phones}</ul></td>
      <td></td>
      </tr>`);
  };

  const serialIndexName = 'invoice_serial';
  const serialIndex = { name: serialIndexName, category: CATEGORY_FIELD, indexer: SERIAL_INDEX };
  const codeIndexName = 'invoice_code';
  const codeIndex = { name: codeIndexName, category: CATEGORY_FIELD, indexer: CODE_INDEX };

  try {
    res.write('Ultima factura extraida ... <br /><br />');

    const maxSerial = (await findMaxRow(databaseLocal, serialIndex));
    if (!maxSerial.data) throw new Error(`Unable to get results using index ${serialIndexName}!`);
    const { data: serial } = maxSerial;

    const maxCode = (await findMaxRow(databaseLocal, codeIndex));
    if (!maxCode.data) throw new Error(`Unable to get results using index ${codeIndexName}!`);
    const { data: code } = maxCode;

    LG.info(`
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
    const invoice = `Invoice_1_${code.idib.toString().padStart(16, '0')}`;
    // res.write(`<br /></div>Couch _id key :: ${JSON.stringify(invoice, null, 2)}</div>`);

    const jsonInvoice = (await getInvoice(databaseLocal, invoice));
    if (!jsonInvoice) throw new Error(`Unable to get invoice ${invoice}!`);
    const T = jsonInvoice.infoTributaria;
    const uniqueId = T.claveAcceso;
    LG.info(`Got invoice ${uniqueId}`);

    res.write(`</div>Numero serial :: ${T.estab}-${T.ptoEmi}-${T.secuencial}</div>`);
    res.write(`<br /></div>Cliente :: ${jsonInvoice.infoFactura.razonSocialComprador}</div>`);
    res.write(`<br /></div>Codigo interno :: ${serial.idib}</div>`);

    const digitalInvoice = `${HEAD}${toXML(jsonInvoice)}${FOOT}`;

    // LG.info(digitalInvoice);

    fs.writeFile(`/tmp/${uniqueId}.iri.raw.xml`, digitalInvoice, (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;

      // success case, the file was saved
      LG.info('Invoice saved!');
    });
  } catch (err) {
    res.write(`<br /></div>Query error ::  ${JSON.stringify(err, null, 2)}</div>`);
  }

  try {
    await databaseLocal.createIndex({
      index: {
        fields: ['data.type', 'data.nombre'],
      },
    });
  } catch (err) {
    res.write(`<br /></div>Index creation error ::  ${JSON.stringify(err, null, 2)}</div>`);
  }

  try {
    res.write('<br /><hr /><br />');

    res.write(`<table id="customers"><tr>
      <th>Secuencial</th>
      <th>&nbsp; &nbsp; Fecha &nbsp; &nbsp;</th>
      <th>Nombre</th>
      <th>Documento</th>
      <th>Email</th>
      <th>Telef #1</th>
      <th>Direccion</th>
      </tr>`);

    const invoices = await databaseLocal.allDocs({
      include_docs: true,
      attachments: true,
      startkey: 'Invoice_2',
      endkey: 'Invoice_1_0000000000000000',
      // limit: 3,
      descending: true,
    });

    const proms = [];
    for (let ix = 0; ix < invoices.rows.length; ix += 1) {
      proms.push(writePersons(invoices.rows[ix], res));
    }

    await Promise.all(proms);

    res.write('</table>');

    // LG.info(`Person :: ${JSON.stringify(person, null, 2)}`);
    // LG.info(`Person: ${pdd.nombre} ==> Telef: ${pdd.telefono_1} ID: ${pdd.ruc_cedula} Email: ${pdd.email}`);
  } catch (err) {
    CLG(err);
  }


  res.write('</body></html>');
  res.end();
};
