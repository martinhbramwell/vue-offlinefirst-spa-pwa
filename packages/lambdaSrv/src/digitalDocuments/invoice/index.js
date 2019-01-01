/* eslint-disable max-len */
import { logger as LG } from '../../utils'; // eslint-disable-line no-unused-vars
import template from './template'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const IVA = '0.12';
const fpIVA = parseFloat(IVA);
const pctIVA = fpIVA * 100;
const sep = '\n';

const HEAD = `
<?xml version="1.0" encoding="UTF-8"?>
<factura xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="file:factura_2_1_0.xsd" id="comprobante" version="2.1.0">
`;
const FOOT = `
</factura>`;
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
        // doc = `${doc}${sep}${indent}${lt}${k}${gt}${toXML(tag, lvl + 1, Array.isArray(tag))}${sep}${indent}${lt}/${k}${gt}`;
        doc = `${doc}${sep}${indent}${lt}${k}${gt}${toXML(tag, lvl + 1, Array.isArray(tag))}${sep}${indent}${lt}/${k}${gt}`;
      } else {
        doc = `${doc}${sep}${indent}${lt}${k}${gt}${tag}${lt}/${k}${gt}`;
      }
    });
  }
  return doc;
};


const checkDigit11 = (src) => {
  const res = src.toString().split( '' ).reverse()
    .map( ( elem, idx ) => elem * ( ( idx % 6 ) + 2 ) )
    .reduce( ( acc, val ) => acc + val ) % 11;
  return res === 0 ? 0 : 11 - res;
};

const specialCase = {

  impuestos(item) {
    return {
      impuesto: {
        codigo: '2',
        codigoPorcentaje: '2',
        tarifa: pctIVA.toString(),
        baseImponible: item.total,
        valor: Number((item.total * fpIVA).toFixed(2)).toString(),
      },
    };
  },
  baseImponible(item) {
    LG.info(`\n baseImponible :: ${JSON.stringify(item, null, 2)}`);
    return item.subTotal;
  },
  valor(item) {
    LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return Number((item.subTotal * fpIVA).toFixed(2)).toString();
  },
  claveAcceso(item) {
    LG.info(`\n claveAcceso :: ${JSON.stringify(item, null, 2)}`);

    const dt = new Date(item.fecha);
    const d = dt.getDate().toString().padStart(2, '0');
    const m = (1 + dt.getMonth()).toString().padStart(2, '0');
    const y = dt.getFullYear();

    CLG(`template :: ${JSON.stringify(template.infoTributaria.codDoc, null, 2)}`);
    const codigoNumerico = 99999999;

    let clave = '';
    clave = `${clave}${d}${m}${y}`;
    clave = `${clave}${template.infoTributaria.codDoc}`;
    clave = `${clave}${template.infoTributaria.ruc}`;
    clave = `${clave}${template.infoTributaria.ambiente}`;
    clave = `${clave}${item.sucursal.toString().padStart(3, '0')}`;
    clave = `${clave}${item.pdv.toString().padStart(3, '0')}`;
    clave = `${clave}${item.sequential.toString().padStart(9, '0')}`;
    clave = `${clave}${'38827179'}`;
    clave = `${clave}${checkDigit11(clave)}`;


    CLG(`clave :: ${clave}`);


    // 2110201101179214673900110020010000000011234567813
    // 21102011 01 1792146739001 1 002 001 000000001 12345678 1 3
    // 18092018 01 1792177758001 1 001 001 000009861 79217775 1


    return clave;
  },
  tipoIdentificacionComprador(item) {
    LG.info(`\n tipoIdentificacionComprador :: ${JSON.stringify(item, null, 2)}`);
    switch (item.legalId.length) {
      case 10: return '05';
      case 13: return '04';
      case 0: return '07';
      default: return '06';
    }
  },
  pagoTotal(item) {
    LG.info(`\n pagoTotal :: ${JSON.stringify(item, null, 2)}`);
    return item.total;
  },
  totalConImpuestos(item) {
    LG.info(`\n totalConImpuestos :: ${JSON.stringify(item, null, 2)}`);
    return '????';
  },
};

const recursivePopulate = (data, _tmplt, lvl = 0, inArray = false) => {
  const tmplt = _tmplt;
  if (data) {
    if (inArray > 0) {
      LG.debug(`\nArray ITEM . Count:: ${inArray}. ${JSON.stringify(data[inArray - 1], null, 2)}\n`);
      LG.debug(`\nrecursivePopulate(\ndata: ${JSON.stringify(data, null, 2)},\n_tmplt: ${JSON.stringify(tmplt, null, 2)},\nlvl: ${lvl + 1};`);
      const ret = [];
      data.forEach((item) => {
        LG.info(`\nItem ${JSON.stringify(item, null, 2)}  array count ${inArray}\n`);
        const tmp = {};
        Object.keys(tmplt).forEach((k) => {
          if (tmplt[k].alias) {
            LG.info(`Alias ${k} ${tmplt[k].alias}`);
            tmp[k] = item[tmplt[k].alias];
          } else if (tmplt[k].specialCase) {
            LG.debug(`\n\n\nObject ${JSON.stringify(tmplt[k], null, 2)} **********************\n\n\n`);
            tmp[k] = specialCase[tmplt[k].specialCase](item);
          } else {
            tmp[k] = tmplt[k];
          }
        });
        // recursivePopulate(item, tmplt, lvl + 1, inArray);
        inArray -= 1; // eslint-disable-line no-param-reassign
        ret.push(JSON.parse(JSON.stringify(tmp)));
      });
      LG.debug(`\nret = ${ret}\ntmplt = ${JSON.stringify(tmplt, null, 2)}`);
      return ret;
    }

    Object.keys(tmplt).forEach((k) => { // eslint-disable-line
      LG.debug(`Lvl :: ${lvl}  Ary: ${inArray}  Key :: ${k} Val :: ${tmplt[k]} Type :: ${typeof tmplt[k]}`);
      if (k === 'details') {
        LG.info(`\nVal :: ${JSON.stringify(tmplt[k], null, 2)}`);
      }

      if (Array.isArray(tmplt[k])) {
        if (tmplt[k][0].alias) {
          const arrayAlias = tmplt[k][0].alias;
          delete tmplt[k][0].alias;
          const elemName = Object.getOwnPropertyNames(tmplt[k][0])[0];
          const doneTmplt = recursivePopulate(data[arrayAlias], tmplt[k][0][elemName], lvl + 1, data[arrayAlias].length, k);
          LG.debug(`\nDone template = ${JSON.stringify(doneTmplt, null, 2)}`);
          LG.debug(`\nArray template['${JSON.stringify(k, null, 2)}'] = ${JSON.stringify(tmplt[k], null, 2)}`);
          tmplt[k] = doneTmplt;
          return tmplt[k];
        }
        LG.debug('No alias for this element yet');
      } else if (typeof tmplt[k] === 'object') {
        if (tmplt[k].alias) {
          LG.info(`\nObject data['${tmplt[k].alias}'] = ${data[tmplt[k].alias]}\n`);
          LG.info(`\nAliased result ${data[tmplt[k].alias]}\n`);
          tmplt[k] = data[tmplt[k].alias];
        } else if (tmplt[k].specialCase) {
          LG.debug(`\nObject data['${tmplt[k].specialCase}']\n`);
          tmplt[k] = specialCase[tmplt[k].specialCase](data);
        } else {
          return recursivePopulate(data, tmplt[k], lvl + 1);
        }
      } else if (typeof tmplt[k] === 'string') {
        return tmplt[k];
      } else {
        throw new Error(`Unknown data type in template : ${typeof tmplt[k]}`);
      }
      // LG.info(`
      //   Inv ::  ${inv[tmplt[k].alias]}`);
      // test[k] = inv[tmpl.test[k]];
      // tmplt[k] = 'wait';
    });
  }
  return tmplt;
};

let inv = null;
export default async (db, startkey) => {
  try {
    const val = await db.allDocs({
      include_docs: true,
      startkey,
      limit: 1,
    });
    inv = val && val.rows && val.rows[0] ? val.rows[0].doc.data : {};
  } catch (err) {
    LG.error(`AllDocs failed to retrieve invoices from ${startkey}: <${err}>`);
  }


  const test = recursivePopulate(inv, JSON.parse(JSON.stringify(template)));

  CLG(`\nDone :: ${JSON.stringify(test, null, 2)}`);

  const infoFactura = `${HEAD}${toXML(test)}${FOOT}`;
  // const infoFactura = test;
  return infoFactura;
};
