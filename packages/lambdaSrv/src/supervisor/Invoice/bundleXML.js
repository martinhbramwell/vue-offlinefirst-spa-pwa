/* eslint-disable no-underscore-dangle, max-len */
import recursivePopulate from '../../digitalDocuments/invoice/recursivePopulate'; // eslint-disable-line no-unused-vars
import template from '../../digitalDocuments/invoice/template'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils';

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

const bundle = async (args) => {
  const { inv, db } = args;

  LG.verbose(`\n\nInvoice to process:: ${JSON.stringify(inv.data.idib, null, 2)}  `);

  const jsonInvoice = recursivePopulate({
    data: inv.data,
    _tmplt: JSON.parse(JSON.stringify(template)),
  });

  // LG.verbose(` Converted invoice :: ${JSON.stringify(jsonInvoice, null, 2)}  `);
  LG.info(`Got JSON invoice ${jsonInvoice.infoTributaria.claveAcceso}`);

  const invXml = `${HEAD}${toXML(jsonInvoice)}${FOOT}`;
  LG.verbose(` Ready to save XML invoice as base64 attachment :: ${inv._id} >> ${inv._rev}  `);

  try {
    const attachment = (Buffer.from(invXml, 'utf-8')).toString('base64');
    const result = await db.putAttachment(inv._id, 'invoiceXml', inv._rev, attachment, 'text/plain');
    LG.info(`Saved with attachment ${JSON.stringify(result, null, 2)}`);
  } catch (err) {
    LG.error(`Save with attachment failed :: ${JSON.stringify(err, null, 2)}`);
  }

  // try {
  //   if (inv._id === 'Invoice_1_0000000000004263') {
  //     const attachment = (Buffer.from(' ** EXPERIMENT ** ', 'utf-8')).toString('base64');
  //     const result = await db.putAttachment(inv._id, 'invoiceSigned', inv._rev, attachment, 'text/plain');
  //     LG.info(`Saved with attachment ${JSON.stringify(result, null, 2)}`);
  //   }
  // } catch (err) {
  //   LG.error(`Save with attachment failed :: ${JSON.stringify(err, null, 2)}`);
  // }


  return invXml;
};

export default bundle;
