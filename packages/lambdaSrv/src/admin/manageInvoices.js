import fs from 'fs'; // eslint-disable-line no-unused-vars

import { databaseLocal } from '../database';
import findMaxRow from '../utils/findMaxRow';
import getInvoice from '../digitalDocuments/invoice';

import bundleInvoices from '../supervisor/Invoice/bundleInvoices';
import signInvoices from '../supervisor/Invoice/signInvoices';
import sendInvoices from '../supervisor/Invoice/sendInvoices';
import queryAuthorizations from '../supervisor/Invoice/queryAuthorizations';

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


async function cypressInvoices() {
  try {
    const host = window.location.origin;
    const response = await fetch(`${host}/scrapeInv`);
    const myJson = await response.json(); // extract JSON from the http response
    CLG(myJson);
  } catch (err) {
    CLG(`Cypress error ${err}`);
  }
}

function refresh() {
  window.location.reload(true);
}

function changeVisibility() {
  var all = document.getElementsByTagName('tr');
  for (let ix = 1; ix < all.length; ix += 1) {
    document.getElementById(all[ix].id).classList.remove('showMe');
    document.getElementById(all[ix].id).classList.add('hideMe');
  }

  let hider = 0;
  hider |= document.getElementById("denegados").checked && 1;
  hider |= document.getElementById("autorizados").checked && 2;
  hider |= document.getElementById("rechazados").checked && 4;
  hider |= document.getElementById("aceptados").checked && 8;
  hider |= document.getElementById("firmados").checked && 16;
  hider |= document.getElementById("anulados").checked && 32;

  var shown = document.getElementsByName(hider);
  for (let ix = 0; ix < shown.length; ix += 1) {
    document.getElementById(shown[ix].id).classList.remove('hideMe');
    document.getElementById(shown[ix].id).classList.add('showMe');
  }
}

function submit() {
  var held = document.getElementsByName('Hold');
  var anulled = document.getElementsByName('Void');
  var acc = {};
  for (var ix = 0; ix < held.length; ix += 1) {
    acc[held[ix].id] = { H: held[ix].checked, V: anulled[ix].checked };
  }
  var data = document.getElementsByName('data');
  data[0].value = JSON.stringify(acc);

  document.gestionDeFacturas.submit();
  CLG('Sent');
}

function firmar() {
  var act = document.getElementsByName('action');
  act[0].value = 'firmar';
  submit();
}

function enviar() {
  var act = document.getElementsByName('action');
  act[0].value = 'enviar';
  submit();
}

function verificar() {
  var act = document.getElementsByName('action');
  act[0].value = 'verificar';
  submit();
}
/* eslint-enable no-var, vars-on-top */

const saveSettings = async (args) => { // eslint-disable-line no-unused-vars
  const settings = JSON.parse(args);
  const invoices = await databaseLocal.allDocs({
    include_docs: true,
    attachments: true,
    startkey: 'Invoice_2',
    endkey: 'Invoice_1_0000000000000000',
    // limit:  3,
    descending: true,
  });

  CDR(settings);

  const updates = invoices.rows.filter((inv) => { // eslint-disable-line no-unused-vars
    if (inv && inv.doc && inv.doc.data) {
      const seq = inv.doc.data.sequential;
      const hld = inv.doc.hold || false;
      const anu = inv.doc.void || false;
      if (settings[`h${seq}`]) {
        CLG(`${seq}  ${hld === settings[`h${seq}`].H} & ${anu === settings[`h${seq}`].V}`);
        const diff = (hld === settings[`h${seq}`].H) && (anu === settings[`h${seq}`].V);
        return !diff;
      }
    }
    return false;
  });

  CLG(`updates :: ${updates.length}`);

  /* eslint-disable no-param-reassign */
  const writes = updates.map((inv) => {
    const seq = inv.doc.data.sequential;
    inv.doc.hold = settings[`h${seq}`].H;
    inv.doc.void = settings[`h${seq}`].V;
    return inv.doc;
  });
  /* eslint-enable no-param-reassign */

  await databaseLocal.bulkDocs(writes);
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
    await saveSettings(args);
    await bundleInvoices({ db: databaseLocal });
    await signInvoices({ db: databaseLocal });
    await reHold();
  },

  enviar: async (args) => {
    await saveSettings(args);
    await sendInvoices({ db: databaseLocal });
    await reHold();
  },

  verificar: async (args) => {
    CLG('verificar');
    CDR(args);
    await saveSettings(args);
    await queryAuthorizations({ db: databaseLocal });
    await reHold();
  },

  NUTHIN: () => {
    CLG('NUTHIN');
  },
};

/* eslint-disable max-len */
export default async (req, res) => {
  /* Get last invoice serial number  */

  CDR(req.body);
  clientActions[req.body.action || 'NUTHIN'](req.body.data);

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write(`
<!DOCTYPE html>
<html>
<head>
<link rel="icon" type="image/png" href="../images/favicon.ico" />
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
<script>
  var CLG = console.log;
  var CLE = console.err;
  var CDR = console.dir;
  ${cypressInvoices.toString()}
  ${refresh.toString()}
  ${submit.toString()}
  ${firmar.toString()}
  ${enviar.toString()}
  ${verificar.toString()}
  ${changeVisibility.toString()}
</script>
<style>
#facturas {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#facturas td, #facturas th {
  border: 1px solid #ddd;
  padding: 8px;
}

#facturas tr:nth-child(even){background-color: #336600;}

#facturas tr:hover {background-color: #ddd;}

#facturas th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #4CAF50;
  color: white;
}

td.fecha {
    width: 1%;
    white-space: nowrap;
}

input[type="text"] {
  background-color : #4CAF50;
}

input[type="password"] {
  background-color : #4CAF50;
}

.fa-times-circle {
  color: #ff0000;
}

.spanBox {
  color: white;
  padding: 10px;
  border: 1px solid white;
}

p {
  font-size: 16px;
}

.button {
  display: inline-block;
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  outline: none;
  color: #fff;
  background-color: #4CAF50;
  border: none;
  border-radius: 5px;
  box-shadow: 0 4px #999;

  margin: 8px 4px;
  margin-bottom: 25px;
}

.button:hover {background-color: #3e8e41}

.button:active {
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}

.d-table {
  display:table !important;
}

.d-table-cell {
  display:table-cell !important;
}

.w-100 {
  width: 100% !important;
}

.tar {
  text-align: right !important;
}

.hideMe {
  visibility: collapse;
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
    const { doc } = inv;
    const { data: d } = doc;

    const prp = doc._attachments && doc._attachments.invoiceXml; // eslint-disable-line no-underscore-dangle
    const frm = doc._attachments && doc._attachments.invoiceSigned; // eslint-disable-line no-underscore-dangle
    let env = 'circle';
    env = doc.accepted ? 'check-circle' : env;
    env = doc.rejected ? 'times-circle' : env;
    let aut = 'circle';
    aut = doc.authorized ? 'check-circle' : aut;
    aut = (doc.authorized === 'no timestamp') ? 'times-circle' : aut;
    const fecha = new Date(d.fecha);

    const persons = await getPersonRecord(d.nombreCliente); // eslint-disable-line no-unused-vars
    /* eslint-disable no-bitwise, no-underscore-dangle, max-len */
    let hider = 0;
    hider |= (doc.authorized === 'no timestamp') && 1;
    hider |= doc.authorized && 2;
    hider |= doc.rejected && 4;
    hider |= doc.accepted && 8;
    hider |= doc._attachments && doc._attachments.invoiceSigned && doc._attachments.invoiceXml && 16;
    hider |= doc.void && 32;
    /* eslint-enable no-bitwise, no-underscore-dangle, max-len */

    out.write(`<tr id="${d.sequential}" name=${hider} class="showMe">
      <td>${d.sequential}</td>
      <td><input id="h${d.sequential}" type="checkbox" name="Hold" ${doc.hold ? 'checked' : ''}></td>
      <td><input id="v${d.sequential}" type="checkbox" name="Void" ${doc.void ? 'checked' : ''}></td>
      <td><i class="fas fa-${prp ? 'check-circle' : 'circle'}" /></td>
      <td><i class="fas fa-${frm ? 'check-circle' : 'circle'}" /></td>
      <td><i class="fas fa-${env}" /></td>
      <td><i class="fas fa-${aut}" /></td>
      <td class="fecha">${hider}</td>
      <!-- td class="fecha">${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}</td -->
      <td>${d.nombreCliente}</td>
      <td>${d.legalId.replace('[', '').replace(']', '')}</td>
      <td>${d.email}</td>
      <td>${d.telefono}</td>
      <td>${d.direccion}</td>
      </tr>
    `);

    // let ids = '';
    // let emails = '';
    // let phones = '';

    // persons.docs.forEach((person) => {
    //   const pdd = person.data;
    //   ids += `<li>${pdd.ruc_cedula}</li>`;
    //   emails += `<li>${pdd.email}</li>`;
    //   phones += `<li>${pdd.telefono_1.replace(/\D/g, '')}</li>`;
    // });

    // out.write(`<tr>
    //   <td></td>
    //   <td></td>
    //   <td></td>
    //   <td><ul>${ids}</ul></td>
    //   <td><ul>${emails}</ul></td>
    //   <td><ul>${phones}</ul></td>
    //   <td></td>
    //   </tr>`);
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

    /* ***************************************************************************
       ***************************************************************************
    const digitalInvoice = `${HEAD}${toXML(jsonInvoice)}${FOOT}`;

    // LG.info(digitalInvoice);

    fs.writeFile(`/tmp/${uniqueId}.iri.raw.xml`, digitalInvoice, (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;

      // success case, the file was saved
      LG.info('Invoice saved!');
    });
       ***************************************************************************
       *************************************************************************** */
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
    res.write(`
      <div class="border d-table w-100">
        <p class="d-table-cell">
          <button class="button" type="button" onclick="refresh()">Refrescar</button>
        </p>
        <div class="d-table-cell tar">
          <p>
            Raspado de datos de BAPU :: &nbsp;
            <button class="button" type="button" onclick="cypressInvoices()">Iniciar</button>
          </p>
        </div>
      </div>
    `);
    res.write('<hr /><br />');
    res.write('<form name="gestionDeFacturas" action="/gestionDeFacturas" method="post">');
    res.write('Usuario: <input type="text" name="uid" /> ');
    res.write('&nbsp;Clave: <input type="password" name="pwd" />');
    res.write('<input type="hidden" name="action" />');
    res.write('<input type="hidden" name="data" /><br><br>');
    res.write('<button class="button" type="button" onclick="firmar()">Firmar Facturas</button>');
    res.write('<button class="button" type="button" onclick="enviar()">Enviar Facturas</button>');
    res.write('<button class="button" type="button" onclick="verificar()">Verificar Facturas</button>');
    res.write('&nbsp; &nbsp; <span class="spanBox">');
    res.write(' Anulados: <input id="anulados" onChange="changeVisibility()" type="checkbox" name="Anu">');
    res.write(' Firmados: <input id="firmados" onChange="changeVisibility()" type="checkbox" name="Frm">');
    res.write(' Aceptados: <input id="aceptados" onChange="changeVisibility()" type="checkbox" name="Acp">');
    res.write(' Rechazados: <input id="rechazados" onChange="changeVisibility()" type="checkbox" name="Rch">');
    res.write(' Autorizados: <input id="autorizados" onChange="changeVisibility()" type="checkbox" name="Aut">');
    res.write(' Denegados: <input id="denegados" onChange="changeVisibility()" type="checkbox" name="Aut">');
    res.write('</span><br />');

    res.write(`<table id="facturas"><tr>
      <th>Secuencial</th>
      <th><i class="fas fa-hand-paper"/></th>
      <th><i class="fas fa-ban"/></th>
      <th>Prp</th>
      <th>Frm</th>
      <th>Env</th>
      <th>Aut</th>
      <th>Fecha</th>
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

    res.write('</form>');
  } catch (err) {
    CLG(err);
  }


  res.write('</body></html>');
  res.end();
};
