/* eslint-disable no-unused-vars, no-underscore-dangle */
import { logger as LG } from '../utils';


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

    alteredPerson.data = Object.assign({}, updateRequest.data);
    alteredPerson._rev = alteredPerson.data.version;
    delete alteredPerson.data.version;
    alteredPerson._id = alteredPerson.data._id;
    delete alteredPerson.data._id;
    delete alteredPerson.data.id;
    delete alteredPerson.data.status;
    delete alteredPerson.data.type;

    this.lclDB.get(alteredPerson._id)
      .then((pers) => {
        const updPerson = pers;
        LG.verbose('Fetched person');
        LG.debug(`Person ${alteredPerson._id} :: ${JSON.stringify(updPerson, null, 2)}`);
        LG.debug(`Person ${alteredPerson._id} :: ${JSON.stringify(alteredPerson.data, null, 2)}`);
        Object.keys(alteredPerson.data).forEach((field) => {
          LG.debug(`Person ${field} :: ${alteredPerson.data[field]} vs ${updPerson.data[field]}`);
          updPerson.data[field] = alteredPerson.data[field];
        });
        LG.debug(`Person ${alteredPerson._id} :: ${JSON.stringify(updPerson, null, 2)}`);
        this.lclDB.put(updPerson)
          .then((updpers) => {
            LG.verbose('Person Updated');
            LG.debug(`Update :: ${JSON.stringify(updpers, null, 2)}`);
            updateRequest._deleted = true; // eslint-disable-line no-underscore-dangle
            LG.debug(`Delete :: ${JSON.stringify(updateRequest, null, 2)}`);
            this.lclDB.put(updateRequest)
              .then((updrq) => {
                LG.verbose('Marked PersonUpdate Request Deleted');

                LG.debug(`Deletion :: ${JSON.stringify(updrq, null, 2)}`);
              })
              .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
          })
          .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
      })
      .catch(err => LG.error(`Person "${alteredPerson._id}" fetch error :: ${JSON.stringify(err, null, 2)}`));
  }
}
