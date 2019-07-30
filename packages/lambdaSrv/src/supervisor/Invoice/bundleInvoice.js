/* eslint-disable no-underscore-dangle, max-len */
import recursivePopulate from '../../digitalDocuments/invoice/recursivePopulate'; // eslint-disable-line no-unused-vars
import template from '../../digitalDocuments/invoice/template'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const HEAD = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<factura id="comprobante" version="1.0.0">`;
const FOOT = `
</factura>`;

const sep = '\n';

const fpIVA = parseFloat(process.env.IMPUESTO_VALOR_AGGREGADO);


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

const correctInvoice = (invoice) => {
  const newInvoice = Object.assign({}, invoice);
  CLG('NEW INVOICE DATA');
  CDR(newInvoice.data);

  let subTotal = 0;
  const newItems = newInvoice.data.itemes.map((item) => {
    const newItem = Object.assign({}, item);
    const { cantidad, precio } = newItem;

    const sTtl = parseInt(cantidad, 10) * parseFloat(precio);

    subTotal += sTtl;
    newItem.total = sTtl.toFixed(2).toString(10);

    return newItem;
  });


  const tax = subTotal * fpIVA;
  const total = subTotal + tax;

  newInvoice.data.totalImpuesto = tax.toFixed(2).toString(10);
  newInvoice.data.total = total.toFixed(2).toString(10);

  subTotal = subTotal.toFixed(2).toString(10);

  newInvoice.data.subTotalConImpuesto = subTotal;
  newInvoice.data.subTotal = subTotal;

  newInvoice.data.itemes = newItems;

  return newInvoice;
};

/* eslint-disable no-unused-vars, prefer-const */
const bundle = async (args) => {
  const { doc: inv, db } = args;
  const { data: d } = inv;
  let invXml = `${HEAD}{ "empty": true }${FOOT}`;

  LG.verbose(`\n\nInvoice to process:: ${JSON.stringify(inv.data.idib, null, 2)}  `);

  const correctedInvoice = correctInvoice(inv);
  CLG('CORRECTED INVOICE');
  CDR(correctedInvoice.data);

  const jsonInvoice = recursivePopulate({
    data: correctedInvoice.data,
    _tmplt: JSON.parse(JSON.stringify(template)),
  });

  const accessKey = jsonInvoice.infoTributaria.claveAcceso;
  // LG.verbose(` Converted invoice :: ${JSON.stringify(jsonInvoice, null, 2)}  `);
  LG.info(`Got JSON invoice ${accessKey}`);

  invXml = `${HEAD}${toXML(jsonInvoice)}${FOOT}`;
  LG.verbose(` Ready to save XML invoice as base64 attachment :: ${correctedInvoice._id} >> ${correctedInvoice._rev}  `);

  try {
    const attachment = (Buffer.from(invXml, 'utf-8')).toString('base64');
    const attch = await db.putAttachment(correctedInvoice._id, 'invoiceXml', correctedInvoice._rev, attachment, 'text/plain');
    LG.info(`Result of attaching XML : ${JSON.stringify(attch, null, 2)}`);
    const doc = await db.get(correctedInvoice._id);
    doc.accessKey = accessKey;
    doc.data = correctedInvoice.data;
    const pt = await db.put(doc);
    LG.info(`Result of putting accessKey : ${JSON.stringify(pt, null, 2)}`);
  } catch (err) {
    LG.error(`Save with attachment failed :: ${JSON.stringify(err, null, 2)}`);
  }

  // try {
  //   if (correctedInvoice._id === 'Invoice_1_0000000000004263') {
  //     const attachment = (Buffer.from(' ** EXPERIMENT ** ', 'utf-8')).toString('base64');
  //     const result = await db.putAttachment(correctedInvoice._id, 'invoiceSigned', correctedInvoice._rev, attachment, 'text/plain');
  //     LG.info(`Saved with attachment ${JSON.stringify(result, null, 2)}`);
  //   }
  // } catch (err) {
  //   LG.error(`Save with attachment failed :: ${JSON.stringify(err, null, 2)}`);
  // }


  return invXml;
};

export default bundle;
