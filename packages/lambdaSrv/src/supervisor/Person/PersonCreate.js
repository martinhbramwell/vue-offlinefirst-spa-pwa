/* eslint-disable no-unused-vars, no-underscore-dangle */
import { logger as LG } from '../../utils';
import { create } from './shared';

const moduleTitle = 'PersonCreate';
// const categoryName = 'aPerson';
// const categoryMetaData = `${categoryName}_2_MetaData`;

export default class {
  constructor(requestSpec, localDatabase, jobStack) {
    this.lclDB = localDatabase;
    this.request = requestSpec;
    this.jobStack = jobStack;
  }

  async process() {
    const operationName = 'process';
    LG.verbose(`${moduleTitle}.${operationName} --> Process request ${JSON.stringify(this.request.doc.data, null, 2)};`);
    LG.debug(`${moduleTitle}.${operationName} --> Request is ${JSON.stringify(this.request.doc, null, 2)}`);

    const disposableRequest = Object.assign({}, this.request.doc);
    disposableRequest._deleted = true;

    LG.verbose(`${moduleTitle}.${operationName} --> Disposable Request is :: ${JSON.stringify(disposableRequest, null, 2)}`);

    const newPerson = {};
    newPerson.data = Object.assign({}, this.request.doc.data);
    delete newPerson.data.handler;

    create({
      request: disposableRequest,
      newRec: newPerson,
    },
    this.lclDB,
    this.jobStack);

    // this.lclDB.allDocs({
    //   include_docs: true,
    //   attachments: true,
    //   descending: true,
    //   limit: 1,
    //   skip: 1,
    //   endkey: categoryName,
    //   startkey: categoryMetaData,
    // }).then((result) => {
    //   LG.debug(`${moduleTitle}.${operationName} --> Last record ::
    //     result = ${JSON.stringify(result, null, 2)}`);

    //   const newCode = 1 + parseInt(result.rows[0].doc.data.codigo, 10);
    //   const newId = this.lclDB.rel.makeDocID({ type: categoryName, id: newCode });
    //   LG.debug(`${moduleTitle}.${operationName} -->
    //     New code :: ${newCode}
    //     New ID = ${newId}
    //   `);
    //   newPerson._id = newId;

    //   newPerson.data.type = 'person';
    //   newPerson.data.codigo = newCode;
    //   newPerson.data.idib = newCode;
    //   newPerson.data.address_details = newCode;
    //   newPerson.data.bottle_movements = newCode;
    //   newPerson.data.admin_details = newCode;
    //   newPerson.data.bottles = [];

    //   newPerson.data.es_empresa = 'FIXME';
    //   newPerson.data.es_client = 'FIXME';
    //   newPerson.data.es_proveedor = 'FIXME';
    //   newPerson.data.distribuidor = 'FIXME';
    //   newPerson.data.retencion = 'FIXME';
    //   newPerson.data.role = 'FIXME';

    //   LG.debug(`${moduleTitle}.${operationName} --> Create ::
    //     Person ${newPerson._id} => ${JSON.stringify(newPerson, null, 2)}`);
    //   this.lclDB.put(newPerson)
    //     .then((newpers) => {
    //       LG.verbose(`Person Created :: ${JSON.stringify(newpers, null, 2)}`);
    //       LG.debug(`Delete :::: ${JSON.stringify(disposableRequest, null, 2)}`);
    //       this.lclDB.put(disposableRequest)
    //         .then((delrq) => {
    //           LG.verbose('Marked PersonUpdate Request Deleted');
    //           LG.debug(`Deletion :: ${JSON.stringify(delrq, null, 2)}`);
    //         })
    //         .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
    //     })
    //     .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
    // }).catch((err) => {
    //   LG.error(`${moduleTitle}.${operationName} --> methods
    //   Unable to obtain last used person ID :: ${JSON.stringify(err, null, 2)}`);
    // });
  }
}
