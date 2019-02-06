/* eslint-disable max-len */
import template from './template'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils'; // eslint-disable-line no-unused-vars

const IVA = '0.12';
const fpIVA = parseFloat(IVA);
const pctIVA = fpIVA * 100;


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

const checkDigit11 = (src) => {
  let res = src.toString().split('').reverse()
    .map((elem, idx) => elem * ((idx % 6) + 2))
    .reduce((acc, val) => acc + val) % 11;
  res = 11 - res;
  return res < 10 ? res : Math.abs(res - 11);
};


const specialCase = {
  impuestos(item) {
    return {
      impuesto: {
        codigo: '2',
        codigoPorcentaje: '2',
        tarifa: pctIVA.toString(),
        baseImponible: item.total,
        valor: Number(item.total * fpIVA).toFixed(2).toString(),
      },
    };
  },
  baseImponible(item) {
    // LG.info(`\n baseImponible :: ${JSON.stringify(item, null, 2)}`);
    return item.subTotal;
  },
  fecha(item) {
    // LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return usDateOblique(item.fecha);
  },
  sucursal(item) {
    // LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return item.sucursal.toString().padStart(3, '0');
  },
  pdv(item) {
    // LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return item.pdv.toString().padStart(3, '0');
  },
  sequential(item) {
    // LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return item.sequential.toString().padStart(9, '0');
  },
  valor(item) {
    // LG.info(`\n valor :: ${JSON.stringify(item, null, 2)}`);
    return Number((item.subTotal * fpIVA).toFixed(2)).toString();
  },
  claveAcceso(item) {
    // LG.info(`\n claveAcceso :: ${JSON.stringify(item, null, 2)}`);

    // CLG(`template :: ${JSON.stringify(template.infoTributaria.codDoc, null, 2)}`);

    let clave = '';
    clave = `${clave}${usDateCode(item.fecha)}`;
    clave = `${clave}${template.infoTributaria.codDoc}`;
    clave = `${clave}${template.infoTributaria.ruc}`;
    clave = `${clave}${template.infoTributaria.ambiente}`;
    clave = `${clave}${item.sucursal.toString().padStart(3, '0')}`;
    clave = `${clave}${item.pdv.toString().padStart(3, '0')}`;
    clave = `${clave}${item.sequential.toString().padStart(9, '0')}`;
    clave = `${clave}${'12345678'}`;
    clave = `${clave}${'1'}`; // Tipo de Emision
    clave = `${clave}${checkDigit11(clave)}`;


    // CLG(`clave :: ${clave}`);


    // 2110201101179214673900110020010000000011234567813
    // 21102011 01 1792146739001 1 002 001 000000001 12345678 1 3
    // 18092018 01 1792177758001 1 001 001 000009861 79217775 1


    return clave;
  },
  legalId(item) {
    return item.legalId.replace('[', '').replace(']', '');
  },
  tipoIdentificacionComprador(item) {
    const id = item.legalId.replace('[', '').replace(']', '');
    // LG.info(`\n tipoIdentificacionComprador :: ${item.legalId} ${id} ${id.length}`);
    switch (id.length) {
      case 10: return '05';
      case 13: return '04';
      case 0: return '07';
      default: return '06';
    }
  },
  nombreCliente(item) {
    return item.nombreCliente.toUpperCase();
  },
  pagoTotal(item) {
    // LG.info(`\n pagoTotal :: ${JSON.stringify(item, null, 2)}`);
    return item.total;
  },
  nombreProducto(item) {
    return item.nombreProducto.toUpperCase();
  },
  telefono(item) {
    // LG.info(`\n pagoTotal :: ${JSON.stringify(item, null, 2)}`);
    return item.telefono.replace(/\D/g, '');
  },
  totalConImpuestos() {
    // LG.info(`\n totalConImpuestos :: ${JSON.stringify(item, null, 2)}`);
    return '????';
  },
};

const arraySubTypes = {
  twig(args) {
    // LG.info('"twig" processing');
    const {
      _tmplt,
      data,
      lvl,
      key,
    } = args;
    // LG.info(`I am an array :: len ${ary.length}`);

    // LG.info(`\n\n\nArray item :: ${JSON.stringify(key, null, 2)}`);
    if (_tmplt[key][0].alias) {
      const arrayAlias = _tmplt[key][0].alias;
      delete _tmplt[key][0].alias;
      const elemName = Object.getOwnPropertyNames(_tmplt[key][0])[0];
      // const doneTmplt = recursivePopulate(data[arrayAlias], _tmplt[key][0][elemName], lvl + 1, data[arrayAlias].length, key);
      const doneTmplt = recursivePopulate({ // eslint-disable-line no-use-before-define
        data: data[arrayAlias],
        _tmplt: _tmplt[key][0][elemName],
        lvl: lvl + 1,
        inArray: data[arrayAlias].length,
        key,
      });
      // LG.debug(`\nDone template = ${JSON.stringify(doneTmplt, null, 2)}`);
      // LG.debug(`\nArray template['${JSON.stringify(key, null, 2)}'] = ${JSON.stringify(_tmplt[key], null, 2)}`);
      _tmplt[key] = doneTmplt;
      return _tmplt[key];
    }

    if (_tmplt[key][0].extra) {
      LG.debug('Process as special extra field');
      return _tmplt[key];
    }
    LG.debug('No alias for this element yet');
    return null;
  },
  attrLeaf(args) {
    // LG.info('"Leaf with attributes" processing');
    const {
      _tmplt,
      data,
      key,
    } = args;

    const doneTmplt = [];
    const sub = _tmplt[key][0].extra;

    _tmplt[key][0][sub].forEach((ext) => {
      // LG.info(`Extra :: ${JSON.stringify(ext, null, 2)}`);
      if (ext.alias) {
        ext.text = data[ext.alias] || 'nulo'; // eslint-disable-line no-param-reassign
      } else if (ext.specialCase) {
        ext.text = specialCase[ext.specialCase](data) || 'nulo'; // eslint-disable-line no-param-reassign
      } else {
        ext.text = 'nulo'; // eslint-disable-line no-param-reassign
      }
      delete ext.alias; // eslint-disable-line no-param-reassign
      delete ext.specialCase; // eslint-disable-line no-param-reassign
      const obj = {};
      obj[sub] = ext;
      doneTmplt.push(obj);
    });

    return null;
  },
};

const nodeSubTypes = {
  object(obj) { // eslint-disable-line no-unused-vars
    // LG.debug(`I am an objeet :: ${Object.keys(obj).length}`);
  },
  array(args) {
    // LG.info(`
    //   I am an array`);
    const { _tmplt, key } = args;
    const typ = _tmplt[key][0].type;
    delete _tmplt[key][0].type;
    // LG.info(`I am a '${typ}' array`);
    arraySubTypes[typ](args);
  },
};

const nodeTypes = {
  object(args) {
    const { _tmplt, key } = args;
    const typ = Array.isArray(_tmplt[key]) ? 'array' : 'object';
    nodeSubTypes[typ](args);
  },
  string(args) {
    const { _tmplt, key } = args;
    // LG.info(`I am a string :: ${_tmplt[key]}`);
    return _tmplt[key];
  },
};


// const processArrayTypeNode = (data, _tmplt, inArray = false) => { // eslint-disable-line no-unused-vars
const processArrayTypeNode = (args) => { // eslint-disable-line no-unused-vars
  const { data, _tmplt } = args; // eslint-disable-line no-unused-vars
  let { inArray } = args; // eslint-disable-line prefer-const, no-unused-vars

  const tmplt = _tmplt;
  //       LG.debug(`\nArray ITEM . Count:: ${inArray}. ${JSON.stringify(data[inArray - 1], null, 2)}\n`);
  //       LG.debug(`\nrecursivePopulate(\ndata: ${JSON.stringify(data, null, 2)},
  // _tmplt: ${JSON.stringify(tmplt, null, 2)},\nlvl: ${lvl + 1};`);
  const ret = [];
  data.forEach((item) => {
    // LG.info(`\nItem ${JSON.stringify(item, null, 2)}  array count ${inArray}\n`);
    const tmp = {};
    Object.keys(tmplt).forEach((k) => {
      if (tmplt[k].alias) {
        // LG.info(`Alias ${k} ${tmplt[k].alias}`);
        tmp[k] = item[tmplt[k].alias];
      } else if (tmplt[k].specialCase) {
        // LG.debug(`\n\n\nObject ${JSON.stringify(tmplt[k], null, 2)} **********************\n\n\n`);
        tmp[k] = specialCase[tmplt[k].specialCase](item);
      } else {
        tmp[k] = tmplt[k];
      }
    });

    inArray -= 1; // eslint-disable-line no-param-reassign
    ret.push(JSON.parse(JSON.stringify(tmp)));
  });
  // LG.debug(`\nret = ${ret}\ntmplt = ${JSON.stringify(tmplt, null, 2)}`);
  return ret;
};

// const recursivePopulate = (data, _tmplt, lvl = 0, inArray = false) => {
const recursivePopulate = (args) => {
  const { data, _tmplt, key = '' } = args; // eslint-disable-line no-unused-vars
  let { lvl = 0, inArray = false } = args; // eslint-disable-line prefer-const

  const tmplt = _tmplt;
  if (data) {
    if (inArray > 0) {
      // return processArrayTypeNode(data, tmplt, lvl, inArray);
      return processArrayTypeNode(args);
    }

    Object.keys(tmplt).forEach((k) => { // eslint-disable-line
      args.key = k; // eslint-disable-line no-param-reassign
      // LG.debug(`Lvl :: ${lvl}  Ary: ${inArray}  Key :: ${k} Val :: ${tmplt[k]} Type :: ${typeof tmplt[k]}`);


      // try {
      //   nodeTypes[typeof tmplt[k]](args);
      // } catch (err) {
      //   throw new Error(`Unknown data type in template : ${typeof tmplt[k]}`);
      // }


      if (Array.isArray(tmplt[k])) {
        // LG.info(`\n\n\nArray item :: ${JSON.stringify(k, null, 2)}`);
        // if (tmplt[k][0].alias) {
        //   const arrayAlias = tmplt[k][0].alias;
        //   delete tmplt[k][0].alias;
        //   const elemName = Object.getOwnPropertyNames(tmplt[k][0])[0];
        //   // const doneTmplt = recursivePopulate(data[arrayAlias], tmplt[k][0][elemName], lvl + 1, data[arrayAlias].length, k);
        //   const doneTmplt = recursivePopulate({
        //     data: data[arrayAlias],
        //     _tmplt: tmplt[k][0][elemName],
        //     lvl: lvl + 1,
        //     inArray: data[arrayAlias].length,
        //     key: k,
        //   });
        //   // LG.debug(`\nDone template = ${JSON.stringify(doneTmplt, null, 2)}`);
        //   // LG.debug(`\nArray template['${JSON.stringify(k, null, 2)}'] = ${JSON.stringify(tmplt[k], null, 2)}`);
        //   tmplt[k] = doneTmplt;
        //   return tmplt[k];
        // }

        // if (tmplt[k][0].extra) {
        //   LG.debug('Process as special extra field');
        //   return tmplt[k];
        // }
        // LG.debug('No alias for this element yet');
        // LG.debug(`typeof tmplt[k] ${typeof tmplt[k]}`);
        return nodeTypes[typeof tmplt[k]](args);
      }

      if (typeof tmplt[k] === 'object') {
        if (tmplt[k].alias) {
          // LG.info(`\nObject data['${tmplt[k].alias}'] = ${data[tmplt[k].alias]}\n`);
          // LG.info(`\nAliased result ${data[tmplt[k].alias]}\n`);
          tmplt[k] = data[tmplt[k].alias];
        } else if (tmplt[k].specialCase) {
          // LG.debug(`\nObject data['${tmplt[k].specialCase}']\n`);
          tmplt[k] = specialCase[tmplt[k].specialCase](data);
        } else {
          // return recursivePopulate(data, tmplt[k], lvl + 1);
          return recursivePopulate({
            data,
            _tmplt: tmplt[k],
            lvl: lvl + 1,
          });
        }
      } else if (typeof tmplt[k] === 'string') {
        // return tmplt[k];
        return nodeTypes[typeof tmplt[k]](args);
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

export default recursivePopulate;
