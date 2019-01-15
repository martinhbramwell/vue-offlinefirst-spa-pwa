/* eslint-disable no-unused-vars, no-underscore-dangle, max-len */
import { logger as LG } from '../../utils';
import { update } from './shared';

export default class {
  constructor(requestSpec, localDatabase, jobStack) {
    this.lclDB = localDatabase;
    this.request = requestSpec;
    this.jobStack = jobStack;
  }

  process() {
    LG.info(`Process request ${this.request.doc.data.id}; status = ${this.request.doc.data.status}`);
    LG.debug(`PersonUpdate Request is ${JSON.stringify(this.request.doc, null, 2)}`);

    const alteredPerson = {};
    const updateRequest = this.request.doc;

    updateRequest._deleted = true;

    alteredPerson._rev = updateRequest.meta.version;
    alteredPerson._id = updateRequest.meta._id;
    alteredPerson.data = Object.assign({}, updateRequest.data);

    this.lclDB.get(alteredPerson._id)
      .then((pers) => {
        update({
          request: updateRequest,
          oldRec: pers,
          newRec: alteredPerson,
        },
        this.lclDB,
        this.jobStack);
      })
      .catch(err => LG.error(`Person "${alteredPerson._id}" fetch error :: ${JSON.stringify(err, null, 2)}`));
  }
}
