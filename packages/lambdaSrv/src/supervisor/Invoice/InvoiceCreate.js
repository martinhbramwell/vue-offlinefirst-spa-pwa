/* eslint-disable max-len, indent, no-unused-vars, no-underscore-dangle */
import { logger as LG } from '../../utils';
import query from '../../utils/query';
import findMaxRow from '../../utils/findMaxRow';

const CLG = console.log; // eslint-disable-line no-console, no-unused-vars

const moduleTitle = 'InvoiceCreate';
const categoryName = 'Invoice';
const categoryID = 'invoice';
const categoryMetaData = `${categoryName}_2_MetaData`;

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
const codeIndex = { name: 'invoice_code', category: CATEGORY_FIELD, indexer: CODE_INDEX };


export default class {
  constructor(requestSpec, localDatabase, jobStack) {
    this.lclDB = localDatabase;
    this.request = requestSpec;
    this.jobStack = jobStack;
  }

  async process() {
    const operationName = 'process';
    // LG.info(`${moduleTitle}.${operationName} --> Process request ${JSON.stringify(this.request.doc.data, null, 2)};`);
    LG.debug(`${moduleTitle}.${operationName} --> Request is ${JSON.stringify(this.request.doc, null, 2)}`);

    const DISABLED = false;
    // const DISABLED = true;
    if (DISABLED) {
      LG.warn(`${moduleTitle}.${operationName} --> TEMPORARILY DISABLED`);
      const tmp = this.jobStack.pop();
      if (tmp) tmp.process();
    } else {
      const disposableRequest = Object.assign({}, this.request.doc);
      disposableRequest._deleted = true;

      LG.verbose(`${moduleTitle}.${operationName} --> Disposable Request is :: ${JSON.stringify(disposableRequest, null, 2)}`);

      const newRecord = {};
      newRecord.data = Object.assign({}, this.request.doc.data);
      newRecord.data.nombreCliente = newRecord.data.nombreCliente.trim();

      CLG(`From ${categoryMetaData} to ${categoryName}`);

      const goodIbidIn = newRecord.data.idib && newRecord.data.idib > 10;
      const goodCodigoIn = newRecord.data.codigo && newRecord.data.codigo.length > 10;

      if (goodIbidIn && goodCodigoIn) {
        LG.warn(`\n\nAssuming we are loading a BAPU invoice request. PK ${newRecord.data.idib} Serial ${newRecord.data.codigo}\n`);
        const slctr = {
          'data.type': 'person',
          'data.nombre': newRecord.data.nombreCliente,
        };
        const lclPerson = await this.lclDB.find({ selector: slctr });

        if (lclPerson.docs.length < 1) {
          LG.warn(`${moduleTitle}.${operationName} --> NO SUCH PERSON`);
          const tmp = this.jobStack.pop();
          if (tmp) tmp.process();
          return;
        }
        newRecord._id = `Invoice_1_${newRecord.data.idib.toString().padStart(16, '0')}`;

        newRecord.data.email = lclPerson.docs[0].data.email || 'nulo';
        LG.info(`Person : ${lclPerson.docs[0].data.nombre} has email  ${newRecord.data.email}`);


        newRecord.data.codigo = `001-002-${newRecord.data.sequential.toString().padStart(9, '0')}`;
        newRecord.data.pdv = 2;
      } else {
        LG.warn(`\n\nAssuming we are loading a VueSPPWA invoice request. PK ${newRecord.data.idib} Serial ${newRecord.data.codigo}\n`);
        const maxRow = (await findMaxRow(this.lclDB, serialIndex));
        if (!maxRow.data) throw new Error(`Unable to get results using index ${serialIndexName}!`);

        const { data: serial } = maxRow;
        const { sucursal, pdv } = serial;
        const sequential = 1 + serial.sequential;
        LG.info(`\n\nQuery result -- Serial #${JSON.stringify(sequential, null, 2)}\n`);
        const { data: code } = (await findMaxRow(this.lclDB, codeIndex));
        const idib = 1 + code.idib;
        LG.info(`\n\nQuery result -- Code #${JSON.stringify(idib, null, 2)}\n`);

        newRecord.data.pdv = pdv;
        newRecord.data.idib = idib;
        newRecord.data.sucursal = sucursal;
        newRecord.data.sequential = sequential;
        newRecord.data.codigo = `${sucursal.toString().padStart(3, '0')}`;
        newRecord.data.codigo += `-${pdv.toString().padStart(3, '0')}`;
        newRecord.data.codigo += `-${sequential.toString().padStart(9, '0')}`;

        newRecord._id = `Invoice_1_${idib.toString().padStart(16, '0')}`;
      }
      // CLG(newRecord.data.idib);
      newRecord.type = 'invoice';
      LG.debug(`\nBuilt newRecord:\n${JSON.stringify(newRecord.data.codigo, null, 2)}\n`);

      this.lclDB.put(newRecord)
        .then((newpers) => {
          LG.verbose(`Invoice Created :: ${JSON.stringify(newpers, null, 2)}`);
          LG.debug(`Delete :::: ${JSON.stringify(disposableRequest, null, 2)}`);
          this.lclDB.put(disposableRequest)
            .then((delrq) => {
              LG.verbose(`Marked ${moduleTitle} Request Deleted`);
              LG.debug(`Deletion :: ${JSON.stringify(delrq, null, 2)}`);

              const tmp = this.jobStack.pop();
              if (tmp) tmp.process();
            })
            .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
        })
        .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
    }
  }
}
