import fs from 'fs'; // eslint-disable-line no-unused-vars

import { databaseLocal } from '../database';
import findMaxRow from '../utils/findMaxRow';
import getInvoice from '../digitalDocuments/invoice';

import bundleInvoices from '../supervisor/Invoice/bundleInvoices';
import signInvoices from '../supervisor/Invoice/signInvoices';
import sendInvoices from '../supervisor/Invoice/sendInvoices';
import queryAuthorizations from '../supervisor/Invoice/queryAuthorizations';

import frags from './htmlFragments';

import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

/* eslint-disable no-unused-vars */
const HEAD = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<factura id="comprobante" version="1.0.0">`;
const FOOT = `
</factura>`;
/* eslint-enable no-unused-vars */

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
        // CLG(`Extra :: ${JSON.stringify(ext, null, 2)}`);
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

/* eslint-disable no-var, vars-on-top */

const processVoids = async (voidsToProcess) => {
  CLG('Process voids');
  const dbInvoices = await databaseLocal.allDocs({
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
    if (inv.doc.void || voidedIds.includes(seq.toString())) {
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

  await databaseLocal.bulkDocs(writes);

  CLG('Processed voids');
};

/* eslint-enable no-var, vars-on-top */
const saveSettings = async (args) => { // eslint-disable-line no-unused-vars
  const settings = JSON.parse(args);
  const voidsToProcess = Object.entries(settings)
    .filter(pair => pair[1].V);
    // .reduce((acc, val) => { return acc || val }, false);
  if (voidsToProcess.length) {
    processVoids(voidsToProcess);
    return false;
  }

  const invoices = await databaseLocal.allDocs({
    include_docs: true,
    attachments: true,
    // startkey: 'Invoice_2',
    // endkey: 'Invoice_1_0000000000000000',
    // descending: true,

    startkey: 'Invoice_1_0000000000000000',
    endkey: 'Invoice_2',
  });

  const writes = invoices.rows.filter((invoice) => { // eslint-disable-line no-unused-vars
    const inv = invoice;
    if (inv.doc && inv.doc.data) {
      if (inv.doc.void) return false;
      const seq = inv.doc.data.seqib;
      if (settings[`h${seq}`]) {
        inv.doc.hold = settings[`h${seq}`].H;
        return !inv.doc.hold;
      }
    }
    return false;
  }).map(inv => inv.doc);


  const bulkResults = await databaseLocal.bulkDocs(writes);
  CDR(bulkResults);
  return true;
};

const reHold = async () => { // eslint-disable-line no-unused-vars
  const invoices = await databaseLocal.allDocs({
    include_docs: true,
    attachments: true,
    startkey: 'Invoice_2',
    endkey: 'Invoice_1_0000000000000000',
    // limit:  3,
    descending: true,
  });

  /* eslint-disable no-param-reassign */
  const writes = invoices.rows.map((inv) => {
    inv.doc.hold = true;
    return inv.doc;
  });
  /* eslint-enable no-param-reassign */

  await databaseLocal.bulkDocs(writes);
};

const clientActions = {
  firmar: async (args) => {
    if (await saveSettings(args)) {
      await bundleInvoices({ db: databaseLocal });
      await signInvoices({ db: databaseLocal });
      await reHold();
    }
  },

  enviar: async (args) => {
    if (await saveSettings(args)) {
      await sendInvoices({ db: databaseLocal });
      await reHold();
    }
  },

  verificar: async (args) => {
    CLG('verificar');
    CDR(args);
    if (await saveSettings(args)) {
      await queryAuthorizations({ db: databaseLocal });
      await reHold();
    }
  },

  NUTHIN: () => {
    CLG('Null client action');
  },
};

/* eslint-disable max-len */
export default async (req, res) => {
  /* Get last invoice serial number  */

  // CLG(`manageInvoices.js {req.body}`);
  // CDR(req.body);
  clientActions[req.body.action || 'NUTHIN'](req.body.data);

  if (req.method === 'POST') {
    res.redirect(307, '/gdf');
    return;
  }

  const sCreds = 'creds';
  const replace = `${sCreds}=\{.+\}`; // eslint-disable-line no-useless-escape
  const re = new RegExp(replace, 'i');

  let creds = null;
  let allowed = false;
  CDR(req.headers.cookie);
  try {
    creds = JSON.parse(req.headers.cookie.match(re)[0].replace(`${sCreds}=`, ''));
    // CLG(`User in cookie is ${creds.username}`);
    if (creds.password) allowed = true;
  } catch (err) {
    CLG(`Could not get user from cookie. Err : >${err}<`);
  }

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

  // const getPersonRecord = async (name) => { // eslint-disable-line arrow-body-style
  //   return databaseLocal.find({
  //     selector: {
  //       'data.type': 'person',
  //       'data.nombre': name,
  //     },
  //   });
  // };

  // CAN'T USE ARROW FUNCTION IN THIS CASE
  const writeInvoice = function (inv, out) { // eslint-disable-line no-unused-vars, func-names
    const { doc } = inv;
    const { data: d } = doc;

    const prp = doc._attachments && doc._attachments.invoiceXml; // eslint-disable-line no-underscore-dangle
    const frm = doc._attachments && doc._attachments.invoiceSigned; // eslint-disable-line no-underscore-dangle

    const voided = doc.void === true
      ? '<i class="fas fa-times-circle"  name="Void"/>'
      : `<input id="v${d.seqib}" type="checkbox" name="Void"}>`;

    let env = 'circle';
    env = doc.accepted ? 'check-circle' : env;
    env = doc.rejected ? 'times-circle' : env;
    let aut = 'circle';
    aut = doc.authorized ? 'check-circle' : aut;
    aut = (doc.authorized === 'no timestamp') ? 'times-circle' : aut;
    const fecha = new Date(d.fecha);

    // const persons = await getPersonRecord(d.nombreCliente); // eslint-disable-line no-unused-vars

    /* eslint-disable no-bitwise, no-underscore-dangle, max-len */
    let hider = 0;
    hider |= (doc.authorized === 'no timestamp') && 1;
    hider |= doc.authorized && 2;
    hider |= doc.rejected && 4;
    hider |= doc.accepted && 8;
    hider |= doc._attachments && doc._attachments.invoiceSigned && doc._attachments.invoiceXml && 16;
    hider |= doc.void && 32;
    /* eslint-enable no-bitwise, no-underscore-dangle, max-len */

    d.sequential = d.sequential > 0
      ? d.sequential.toString().padStart(9, '0')
      : '~~~~~~~~~';
    /* eslint-disable no-mixed-operators */
    out.write(`<tr id="${d.seqib}" name=${hider} class="invoiceRow showMe">
      <td>${d.sequential}</td>
      <td>${d.seqib && d.seqib.toString().padStart(9, '0') || '?????????'}</td>
      <td><input id="h${d.seqib}" type="checkbox" name="Hold" ${doc.hold ? 'checked' : ''}></td>
      <td id="Anu_${d.seqib}" name="${doc.void ? 'void' : 'valid'}">${voided}</td>
      <td style="text-align: center;" id="Prp_${d.seqib}" name="${prp ? 'processed' : 'new'}"><i class="fas fa-${prp ? 'check-circle' : 'circle'}" /></td>
      <td style="text-align: center;"><i class="fas fa-${frm ? 'check-circle' : 'circle'}" /></td>
      <td style="text-align: center;"><i class="fas fa-${env}" /></td>
      <td style="text-align: center;"><i class="fas fa-${aut}" /></td>
      <!-- td class="fecha">${hider}</td -->
      <td class="fecha">${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}</td>
      <td>${d.nombreCliente}</td>
      <td>${d.legalId.replace('[', '').replace(']', '')}</td>
      <td>${d.email}</td>
      <td>${d.telefono}</td>
      <td>${d.direccion}</td>
      </tr>
    `);
    /* eslint-enable no-mixed-operators */
  };

  const serialIndexName = 'invoice_serial';
  const serialIndex = { name: serialIndexName, category: CATEGORY_FIELD, indexer: SERIAL_INDEX };
  const codeIndexName = 'invoice_code';
  const codeIndex = { name: codeIndexName, category: CATEGORY_FIELD, indexer: CODE_INDEX };

  try {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write('<!DOCTYPE html><html>');
    res.write(frags.documentHead);
    res.write('<body text="lightyellow" bgcolor="#000007"><font face="Arial, Helvetica, sans-serif">');

    res.write('<i>Última factura extraida ... </i><br /><br />');

    const maxSerial = (await findMaxRow(databaseLocal, serialIndex));
    if (!maxSerial.data) throw new Error(`Unable to get results using index ${serialIndexName}!`);
    const { data: serial } = maxSerial;

    const maxCode = (await findMaxRow(databaseLocal, codeIndex));
    if (!maxCode.data) throw new Error(`Unable to get results using index ${codeIndexName}!`);
    const { data: code } = maxCode;

    LG.info(`
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
    const invoice = `Invoice_1_${code.idib.toString().padStart(16, '0')}`;

    const jsonInvoice = (await getInvoice(databaseLocal, invoice));
    if (!jsonInvoice) throw new Error(`Unable to get invoice ${invoice}!`);
    const T = jsonInvoice.infoTributaria;
    const uniqueId = T.claveAcceso;
    LG.info(`Got invoice ${uniqueId}`);

    res.write(`</div>Numero serial :: ${T.estab}-${T.ptoEmi}-${T.secuencial}</div>`);
    res.write(`<br /></div>Cliente :: ${jsonInvoice.infoFactura.razonSocialComprador}</div>`);
    res.write(`<br /></div>Codigo interno :: ${serial.idib}</div>`);
  } catch (err) {
    res.write(`<br /></div>Query error ::  ${JSON.stringify(err, null, 2)}</div>`);
  }


  try {
    res.write('<hr />');
    res.write('<form name="gestionDeFacturas" action="/gestionDeFacturas" method="post">');
    res.write(frags.hiddenFields);
    res.write(frags.authentication);
    res.write(frags.topSection);
    res.write(frags.taskButtons);
    res.write('<br />');
    res.write(frags.filterFields);
    res.write('<br />');

    if (allowed) {
      try {
        await databaseLocal.createIndex({
          index: {
            fields: ['data.type', 'data.nombre'],
          },
        });
      } catch (err) {
        res.write(`<br /></div>Index creation error ::  ${JSON.stringify(err, null, 2)}</div>`);
      }

      res.write('<table id="facturas">');
      res.write(frags.tableColumnHeader);

      const invoices = await databaseLocal.allDocs({
        include_docs: true,
        attachments: true,
        startkey: 'Invoice_2',
        endkey: 'Invoice_1_0000000000000000',
        // limit: 3,
        descending: true,
      });

      invoices.rows.forEach(rev => writeInvoice(rev, res));

      res.write('</table>');
    } else {
      res.write('Esperando usuario autorizado');
    }

    res.write('</form>');
  } catch (err) {
    CLG(err);
  }


  res.write(frags.modalBapuScraper);

  res.write('</body></html>');
  res.end();
};
