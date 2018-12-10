/* eslint-disable no-unused-vars, no-underscore-dangle */
import { logger as LG } from '../utils';

import processor from './requestProcessor';


class Request {
  constructor(requestSpec, localDatabase, jobStack) {
    this.lclDB = localDatabase;
    this.request = requestSpec;
    this.jobStack = jobStack;
  }

  process() {
    LG.info(`Process request ${this.request.doc.data.id}; status = ${this.request.doc.data.status}`);
    LG.debug(`Request is ${JSON.stringify(this.request.doc, null, 2)}`);

    const newPerson = {};
    const updateRequest = this.request.doc;

    updateRequest._deleted = true;

    newPerson.data = updateRequest.data;
    newPerson._rev = newPerson.data.version;
    delete newPerson.data.version;
    newPerson._id = newPerson.data._id;
    delete newPerson.data._id;
    delete newPerson.data.id;
    delete newPerson.data.status;
    delete newPerson.data.type;

    this.lclDB.get(newPerson._id)
      .then((pers) => {
        const updPerson = pers;
        LG.verbose('Fetched person');
        LG.debug(`Person ${newPerson._id} :: ${JSON.stringify(updPerson, null, 2)}`);
        LG.debug(`Person ${newPerson._id} :: ${JSON.stringify(newPerson.data, null, 2)}`);
        Object.keys(newPerson.data).forEach((field) => {
          LG.debug(`Person ${field} :: ${newPerson.data[field]} vs ${updPerson.data[field]}`);
          updPerson.data[field] = newPerson.data[field];
        });
        LG.debug(`Person ${newPerson._id} :: ${JSON.stringify(updPerson, null, 2)}`);
        this.lclDB.put(updPerson)
          .then((updpers) => {
            LG.verbose('Person Updated');
            LG.debug(`Update :: ${JSON.stringify(updpers, null, 2)}`);
            LG.debug(`Delete :: ${JSON.stringify(updateRequest, null, 2)}`);
            this.lclDB.remove(updateRequest._id, updateRequest._rev)
              .then((updrq) => {
                LG.verbose('Marked Request Deleted');
                LG.debug(`Deletion :: ${JSON.stringify(updrq, null, 2)}`);
                // mvdt.status = COMPLETE;
                // mvdt.type = MOVEMENT_RECORD;
                // mvdt.id = exchangeRequest.data.id;
                // delete mvdt.rev;
                // this.lclDB.rel.save('Movement', mvdt)
                //   .then((movement) => {
                //     LG.info(`MOVEMENT RECORDED :: ${movement.Movements[0].id}\n\n`);

                //     const tmp = this.jobStack.pop();
                //     if (tmp) tmp.process();
                //   })
                //  .catch(err => LG.error(`SAVE ERROR :: ${JSON.stringify(err, null, 2)}`));
              })
              .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
          })
          .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
      })
      .catch(err => LG.error(`Person "${newPerson._id}" fetch error :: ${JSON.stringify(err, null, 2)}`));

    // this.lclDB.get(personId)
    //   .then((pers) => {
    //     LG.verbose('Fetched person');
    //     LG.debug(`Person ${personId} :: ${JSON.stringify(pers, null, 2)}`);
    //     const versionOfUpdatedPerson =

    //     // this.lclDB.put(updateRequest)
    //     //   .then((updrq) => {
    //     //     LG.verbose('Marked Request Deleted');
    //     //     LG.debug(`Deletion :: ${JSON.stringify(updrq, null, 2)}`);
    //     //     this.lclDB.put(updateRequest)
    //     //       .then((updrq) => {
    //     //         LG.verbose('Marked Request Deleted');
    //     //         LG.debug(`Deletion :: ${JSON.stringify(updrq, null, 2)}`);
    //     //         // mvdt.status = COMPLETE;
    //     //         // mvdt.type = MOVEMENT_RECORD;
    //     //         // mvdt.id = exchangeRequest.data.id;
    //     //         // delete mvdt.rev;
    //     //         // this.lclDB.rel.save('Movement', mvdt)
    //     //         //   .then((movement) => {
    //     //         //     LG.info(`MOVEMENT RECORDED :: ${movement.Movements[0].id}\n\n`);

    //     //         //     const tmp = this.jobStack.pop();
    //     //         //     if (tmp) tmp.process();
    //     //         //   })
    //     //         //   .catch(err => LG.error(`SAVE ERROR :: ${JSON.stringify(err, null, 2)}`));
    //     //       })
    //     //       .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
    //     //   })
    //     //   .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
    //   })
    //   .catch(err => LG.error(`Person "${personId}" fetch error ::
    //      ${JSON.stringify(err, null, 2)}`));
  }
}

const category = 'PersonUpdate';
const name = 'Person Update Request';
const label = 'PERSON UPDATE REQUEST';
const filterName = 'post_processing/by_person_update';
const action = (database) => {
  processor({
    name,
    category,
    label,
    database,
    Request,
  });
};

// const processRequests = (database) => {
//   LG.info(`Process ${name}`);
// };

const filterDefinition = {
  name: filterName,
  label,
  action,
};

export default filterDefinition;
