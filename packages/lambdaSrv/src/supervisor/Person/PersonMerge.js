/* eslint-disable max-len, no-unused-vars, no-underscore-dangle */
import { logger as LG } from '../../utils';
import { create, update } from './shared';

const categoryName = 'aPerson';

export default class {
  constructor(requestSpec, localDatabase, jobStack) {
    this.lclDB = localDatabase;
    this.request = requestSpec;
    this.jobStack = jobStack;
  }

  async process() {
    LG.info(`Process request ${this.request.doc.data.id}; status = ${this.request.doc.data.status}`);
    // LG.debug(`PersonMerge Request is ${JSON.stringify(this.request.doc, null, 2)}`);

    const upsertRequest = this.request.doc;
    upsertRequest._deleted = true;

    const upsertPerson = {};
    upsertPerson.data = Object.assign({}, upsertRequest.data);

    const personId = upsertPerson.data.id.toString();
    const recordId = `aPerson_1_${personId.toString().padStart(16, '0')}`;

    LG.info(`Searching for record :: ${JSON.stringify(recordId, null, 2)}`);

    try {
      const result = await this.lclDB.allDocs({
        include_docs: true,
        startkey: recordId,
        endkey: recordId,
        limit: 1,
      });

      // LG.info(`Found ${JSON.stringify(result, null, 2)}`);
      if (result.rows.length > 0) {
        LG.info(`Ready to update ${upsertPerson.data.nombre}`);
        upsertPerson._id = upsertRequest.data.codigo;
        update({
          request: upsertRequest,
          oldRec: result.rows[0].doc,
          newRec: upsertPerson,
        },
        this.lclDB,
        this.jobStack);
      } else {
        LG.info(`Ready to insert ${upsertPerson.data.nombre}`);
        create({
          request: upsertRequest,
          newRec: upsertPerson,
        },
        this.lclDB,
        this.jobStack);
      }
    } catch (err) {
      LG.error(err);
    }

    // this.lclDB.get(upsertPerson._id)
    //   .then((pers) => {
    //     const updPerson = pers;
    //     LG.verbose('Fetched person');
    //     LG.debug(`Person ${upsertPerson._id} :: ${JSON.stringify(updPerson, null, 2)}`);
    //     LG.debug(`Person ${upsertPerson._id} :: ${JSON.stringify(upsertPerson.data, null, 2)}`);
    //     Object.keys(upsertPerson.data).forEach((field) => {
    //       LG.debug(`Person ${field} :: ${upsertPerson.data[field]} vs ${updPerson.data[field]}`);
    //       updPerson.data[field] = upsertPerson.data[field];
    //     });
    //     LG.debug(`Person ${upsertPerson._id} :: ${JSON.stringify(updPerson, null, 2)}`);
    //     this.lclDB.put(updPerson)
    //       .then((updpers) => {
    //         LG.verbose('Person Updated');
    //         LG.debug(`Update :: ${JSON.stringify(updpers, null, 2)}`);
    //         upsertRequest._deleted = true; // eslint-disable-line no-underscore-dangle
    //         LG.debug(`Delete :: ${JSON.stringify(upsertRequest, null, 2)}`);
    //         this.lclDB.put(upsertRequest)
    //           .then((updrq) => {
    //             LG.verbose('Marked PersonUpdate Request Deleted');

    //             LG.debug(`Deletion :: ${JSON.stringify(updrq, null, 2)}`);
    //           })
    //           .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
    //       })
    //       .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
    //   })
    //   .catch(err => LG.error(`Person "${upsertPerson._id}" fetch error :: ${JSON.stringify(err, null, 2)}`));
  }
}
