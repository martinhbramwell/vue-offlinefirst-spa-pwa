/* eslint-disable max-len, indent, no-unused-vars, no-underscore-dangle */
import { logger as LG } from '../utils';
import query from '../utils/query';
import findMaxRow from '../utils/findMaxRow';

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
    last: 9999,
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
    last: 9999,
  },
];

const serialIndex = { name: 'invoice_serial', category: CATEGORY_FIELD, indexer: SERIAL_INDEX };
const codeIndex = { name: 'invoice_code', category: CATEGORY_FIELD, indexer: CODE_INDEX };


export default class {
  constructor(requestSpec, localDatabase, jobStack) {
    this.lclDB = localDatabase;
    this.request = requestSpec;
    this.jobStack = jobStack;
  }

  async process() {
    const operationName = 'process';
    LG.info(`${moduleTitle}.${operationName} --> Process request ${JSON.stringify(this.request.doc.data, null, 2)};`);
    LG.debug(`${moduleTitle}.${operationName} --> Request is ${JSON.stringify(this.request.doc, null, 2)}`);

    const disposableRequest = Object.assign({}, this.request.doc);
    disposableRequest._deleted = true;

    LG.verbose(`${moduleTitle}.${operationName} --> Disposable Request is :: ${JSON.stringify(disposableRequest, null, 2)}`);

    const newRecord = {};
    newRecord.data = Object.assign({}, this.request.doc.data);

    CLG(`From ${categoryMetaData} to ${categoryName}`);

    const { data: serial } = (await findMaxRow(this.lclDB, serialIndex));
    const { sucursal, pdv } = serial;
    const sequential = 1 + serial.sequential;
    LG.info(`\n\nQuery result -- Serial #${JSON.stringify(sequential, null, 2)}\n`);
    const { data: code } = (await findMaxRow(this.lclDB, codeIndex));
    const idib = 1 + code.idib;
    LG.info(`\n\nQuery result -- Code #${JSON.stringify(idib, null, 2)}\n`);


    newRecord._id = `Invoice_1_${idib.toString().padStart(16, '0')}`;
    newRecord.data.pdv = pdv;
    newRecord.data.idib = idib;
    newRecord.data.sucursal = sucursal;
    newRecord.data.sequential = sequential;
    newRecord.data.codigo = `${sucursal.toString().padStart(3, '0')}`;
    newRecord.data.codigo += `-${pdv.toString().padStart(3, '0')}`;
    newRecord.data.codigo += `-${sequential.toString().padStart(9, '0')}`;
    LG.debug(`Got newRecord:\n${JSON.stringify(newRecord, null, 2)}`);

    this.lclDB.put(newRecord)
      .then((newpers) => {
        LG.verbose(`Invoice Created :: ${JSON.stringify(newpers, null, 2)}`);
        LG.debug(`Delete :::: ${JSON.stringify(disposableRequest, null, 2)}`);
        this.lclDB.put(disposableRequest)
          .then((delrq) => {
            LG.verbose(`Marked ${moduleTitle} Request Deleted`);
            LG.debug(`Deletion :: ${JSON.stringify(delrq, null, 2)}`);
          })
          .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
      })
      .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
  }
}
