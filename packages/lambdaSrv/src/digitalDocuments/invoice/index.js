/* eslint-disable max-len */
import { logger as LG } from '../../utils'; // eslint-disable-line no-unused-vars
import template from './template'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const IVA = '0.12';
const fpIVA = parseFloat(IVA);
const pctIVA = fpIVA * 100;

const checkDigit11 = (src) => {
  const res = src.toString().split('').reverse()
    .map((elem, idx) => elem * ((idx % 6) + 2))
    .reduce((acc, val) => acc + val) % 11;
  return res === 0 ? 0 : 11 - res;
};

const usDate = (date) => {
  const dt = new Date(date);
  const d = dt.getDate().toString().padStart(2, '0');
  const m = (1 + dt.getMonth()).toString().padStart(2, '0');
  const y = dt.getFullYear();

  return { d, m, y };
};

const usDateCode = (date) => {
  const { d, m, y } = usDate(date);
  return `${d}${m}${y}`;
};

const usDateOblique = (date) => {
  const { d, m, y } = usDate(date);
  return `${d}/${m}/${y}`;
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
  fecha(item) {
    LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return usDateOblique(item.fecha);
  },
  sucursal(item) {
    LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return item.sucursal.toString().padStart(3, '0');
  },
  pdv(item) {
    LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return item.pdv.toString().padStart(3, '0');
  },
  sequential(item) {
    LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return item.sequential.toString().padStart(9, '0');
  },
  valor(item) {
    LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return Number((item.subTotal * fpIVA).toFixed(2)).toString();
  },
  claveAcceso(item) {
    LG.info(`\n claveAcceso :: ${JSON.stringify(item, null, 2)}`);

    CLG(`template :: ${JSON.stringify(template.infoTributaria.codDoc, null, 2)}`);

    let clave = '';
    clave = `${clave}${usDateCode(item.fecha)}`;
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


  const jsonInvoice = recursivePopulate(inv, JSON.parse(JSON.stringify(template)));

  CLG(`\nDone :: ${JSON.stringify(jsonInvoice, null, 2)}`);

  // const infoFactura = `${HEAD}${toXML(test)}${FOOT}`;
  // return infoFactura;

  return jsonInvoice;
};
