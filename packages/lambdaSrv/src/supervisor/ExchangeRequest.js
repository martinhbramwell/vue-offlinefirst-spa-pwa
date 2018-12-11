import { logger as LG } from '../utils';

import processor from './requestProcessor';

const MOVEMENT_RECORD = 'movement';

const PROCESSING = 'processing';
const COMPLETE = 'complete';

class Request {
  constructor(requestSpec, localDatabase, jobStack) {
    this.lclDB = localDatabase;
    this.request = requestSpec;
    this.jobStack = jobStack;

    this.customer = {};
    this.customerID = 0;
    this.inventory = null;
    this.inventoryID = null;
    this.aryBottles = [];
    this.aryBottleIDs = [];
  }

  setCustomer(person) {
    // LG.verbose(`Person : ${JSON.stringify(person.allPersons[0], null, 2)}`);
    this.customer = person;
    if (person.allPersons && person.allPersons[0] && person.allPersons[0].id) {
      this.customerID = person.allPersons[0].id;
      // LG.verbose(`Request : ${JSON.stringify(this.request, null, 2)}`);
      // LG.verbose(`Customer : ${JSON.stringify(this.customer, null, 2)}`);
      // LG.verbose(this.customerID);
      // LG.verbose(this.customer.allPersons[0]);
    } else {
      throw new Error(`Error! Found no 'customer' person with ID: ${this.customerID}`);
    }
  }

  setInventory(person) {
    // LG.verbose(`Person : ${JSON.stringify(person.allPersons[0], null, 2)}`);
    this.inventory = person;
    if (person.allPersons && person.allPersons[0] && person.allPersons[0].id) {
      this.inventoryID = person.allPersons[0].id;
      // LG.verbose(this.customerID);
      // LG.verbose(this.customer.allPersons[0]);
    } else {
      throw new Error(`Error! Found no 'inventory' person with ID: ${this.inventoryID}`);
    }
  }

  setBottles(bottles) {
    this.aryBottles = bottles.allBottles.filter(bottle => this.aryBottleIDs.includes(bottle.id));
    LG.debug(`MOV.BOTTLES  : ${JSON.stringify(this.aryBottleIDs, null, 2)}`);
    LG.silly(`BOTTLEs  : ${JSON.stringify(this.aryBottles, null, 2)}`);
  }

  process() {
    LG.info(`Process request ${this.request.doc.data.id}; status = ${this.request.doc.data.status}`);
    const exchangeRequest = this.request.doc;
    const mvdt = exchangeRequest.data;

    // if (mvdt.status === PROCESSING) { rej({ msg: DAMAGED, idER: mvdt.id }); return; }
    // if (mvdt.status !== NEW) { res({ msg: UNINTERESTING }); return; }

    // LG.verbose(`Row ${JSON.stringify(exchangeRequest, null, 2)}`);
    LG.info(`Process ${mvdt.bottles.length} bottles for request '${mvdt.id}'`);

    mvdt.status = PROCESSING;
    mvdt.rev = exchangeRequest._rev; // eslint-disable-line no-underscore-dangle
    // mvdt.id = parseInt(mvdt.id);
    LG.verbose(`ExchangeRequest status ${PROCESSING} :: ${JSON.stringify(exchangeRequest, null, 2)}`);

    this.lclDB.put(exchangeRequest)
      .then((mvmnt) => {
        // LG.verbose(`SAVED UPDATED EXCHANGE REQUEST BEFORE PROCESSING
        //   ${JSON.stringify(mvmnt, null, 2)}
        // `);

        LG.debug('Getting identifiers');
        exchangeRequest._rev = mvmnt.rev; // eslint-disable-line no-underscore-dangle
        this.customerID = mvdt.customer;
        this.inventoryID = mvdt.inventory;
        this.aryBottleIDs = mvdt.bottles;

        const aryMarshallerPromises = [];

        LG.debug('Getting customer person');
        aryMarshallerPromises.push(
          this.lclDB.rel
            .find('aPerson', mvdt.customer)
            .then(this.setCustomer.bind(this))
            .catch(err => LG.error(`Getting customer person :: ${JSON.stringify(err, null, 2)}`)),
        );

        LG.debug('Getting inventory person');
        aryMarshallerPromises.push(
          this.lclDB.rel
            .find('aPerson', mvdt.inventory)
            .then(this.setInventory.bind(this))
            .catch(err => LG.error(`Getting inventory person :: ${JSON.stringify(err, null, 2)}`)),
        );

        LG.debug('Getting exchanged bottles');
        aryMarshallerPromises.push(
          this.lclDB.rel
            .find('aBottle', mvdt.bottles)
            .then(this.setBottles.bind(this))
            .catch(err => LG.error(`Getting exchanged bottles :: ${JSON.stringify(err, null, 2)}`)),
        );

        LG.debug('Processing exchange');
        Promise.all(aryMarshallerPromises) // eslint-disable-line no-undef
          .then(() => {
            LG.debug('Getting array of bottle IDs');
            LG.debug(`BOTTLES${JSON.stringify(this.aryBottles, null, 2)}`);
            this.aryBottleIDs = this.aryBottles.map(btl => btl.id);
            LG.verbose(`customer bottles length = ${this.customer.allBottles ? this.customer.allBottles.length : 0}`);
            LG.verbose(`inventory bottles length = ${this.inventory.allBottles ? this.inventory.allBottles.length : 0}`);

            const srce = (mvdt.inOut === 'out') ? this.inventory : this.customer;
            const dest = (mvdt.inOut === 'out') ? this.customer : this.inventory;
            const destID = (mvdt.inOut === 'out') ? this.customerID : this.inventoryID;
            const location = (mvdt.inOut === 'out') ? 'cliente' : 'planta';

            // if (mvdt.inOut === 'out') {
            //   srce = this.inventory;
            //   dest = this.customer;
            //   destID = this.customerID;
            //   location = 'cliente';
            // }

            const savingPromises = [];

            LG.debug(`Source person before : ${JSON.stringify(srce.allPersons[0], null, 2)}`);

            LG.debug(`Bottle IDs : ${JSON.stringify(this.aryBottleIDs, null, 2)}`);

            const saveSrc = {
              _rev: srce.allPersons[0].rev,
              _id: this.lclDB.rel.makeDocID({ type: 'aPerson', id: srce.allPersons[0].id }),
            };
            delete srce.allPersons[0].rev;
            saveSrc.data = srce.allPersons[0]; // eslint-disable-line prefer-destructuring

            saveSrc.data.bottles = saveSrc.data.bottles
              .filter(btl => btl > 0)
              .filter(btl => !this.aryBottleIDs.includes(btl));
            // saveSrc.data.movements.push(mvdt.id); // will no longer store movements in persons

            LG.verbose(`Source person after : ${JSON.stringify(saveSrc, null, 2)}`);


            this.lclDB.rel
              .find('PersonBottleMovement', saveSrc.data.bottle_movements)
              .then((res) => {
                LG.debug(`\n========= Source Person Bottle Movement Response ::
                  ${JSON.stringify(res, null, 2)}`);
                const perBoMo = res.allPersonBottleMovements
                  .filter(mo => mo.id === srce.allPersons[0].id)[0];
                if (perBoMo) {
                  LG.info(`\n========= Source Person Bottle Movement : ${JSON.stringify(perBoMo, null, 2)}`);
                  perBoMo.bottle_movements.push(exchangeRequest.data.id);
                  LG.info(`\n========= Source Person Bottle Movement : ${JSON.stringify(perBoMo, null, 2)}`);
                  savingPromises.push(this.lclDB.rel.save('PersonBottleMovement', perBoMo));
                }
              })
              .catch((err) => {
                LG.error(`${JSON.stringify(err, null, 2)}
                  No source person bottle movements for : ${JSON.stringify(saveSrc.data, null, 2)}`);
              });


            LG.debug(`Destination person before : ${JSON.stringify(dest.allPersons[0], null, 2)}`);
            const saveDst = {
              _rev: dest.allPersons[0].rev,
              _id: this.lclDB.rel.makeDocID({ type: 'aPerson', id: dest.allPersons[0].id }),
            };
            delete dest.allPersons[0].rev;
            saveDst.data = dest.allPersons[0]; // eslint-disable-line prefer-destructuring

            // saveDst.data.movements.push(mvdt.id); // will no longer store movements in persons
            this.aryBottles.forEach((btl) => {
              const bottle = btl;
              bottle.ultimo = destID;
              bottle.ubicacion = location;
              // bottle.movements.push(mvdt.id);
              saveDst.data.bottles.push(bottle.id);
              const newId = this.lclDB.rel.makeDocID({ type: 'aBottle', id: bottle.id });
              LG.debug(`${newId}  bottle  : ${JSON.stringify(bottle, null, 2)}`);

              this.lclDB.rel
                .find('BottleMovement', bottle.id)
                .then((res) => {
                  const boMo = res.allBottleMovements
                    .filter(mo => mo.id === bottle.id)[0];
                  LG.debug(`\n========= Bottle Movement : ${JSON.stringify(boMo, null, 2)}`);
                  boMo.movements.push(exchangeRequest.data.id);
                  savingPromises.push(this.lclDB.rel.save('BottleMovement', boMo));
                });

              savingPromises.push(this.lclDB.rel.save('aBottle', bottle));
            });


            LG.verbose(`Destination person after : ${JSON.stringify(saveDst, null, 2)}`);


            this.lclDB.rel
              .find('PersonBottleMovement', saveDst.data.bottle_movements)
              .then((res) => {
                const perBoMo = res.allPersonBottleMovements
                  .filter(mo => mo.id === dest.allPersons[0].id)[0];
                perBoMo.bottle_movements.push(exchangeRequest.data.id);
                LG.debug(`\n========= Destination Person Bottle Movement : ${JSON.stringify(perBoMo, null, 2)}`);
                savingPromises.push(this.lclDB.rel.save('PersonBottleMovement', perBoMo));
              });


            savingPromises.push(this.lclDB.put(saveSrc).then((rslt) => { LG.debug(`SRCE save result :: ${JSON.stringify(rslt, null, 2)}`); }));

            savingPromises.push(this.lclDB.put(saveDst).then((rslt) => { LG.debug(`DEST save result :: ${JSON.stringify(rslt, null, 2)}`); }));

            Promise.all(savingPromises) // eslint-disable-line no-undef
              .then((values) => {
                LG.debug(`PROMISE LIST \n${JSON.stringify(values, null, 2)}`);
                exchangeRequest._deleted = true; // eslint-disable-line no-underscore-dangle
                LG.debug(`EXCHANGE \n${JSON.stringify(exchangeRequest, null, 2)}`);
                this.lclDB.put(exchangeRequest)
                  .then((exrq) => {
                    LG.verbose('Marked Exchange Request Deleted');
                    LG.debug(`Deletion :: ${JSON.stringify(exrq, null, 2)}`);
                    mvdt.status = COMPLETE;
                    mvdt.type = MOVEMENT_RECORD;
                    mvdt.id = exchangeRequest.data.id;
                    delete mvdt.rev;
                    this.lclDB.rel.save('Movement', mvdt)
                      .then((movement) => {
                        LG.info(`MOVEMENT RECORDED :: ${movement.Movements[0].id}\n\n`);

                        const tmp = this.jobStack.pop();
                        if (tmp) tmp.process();
                      })
                      .catch(err => LG.error(`MOVEMENT RECORDING ERROR :: ${JSON.stringify(err, null, 2)}`));
                  })
                  .catch(err => LG.error(`EXCHANGE REQUEST DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
              })
              .catch(err => LG.error(`ERROR FINDING PERSONS OR BOTTLES :: ${JSON.stringify(err, null, 2)}`));
          })
          .catch(err => LG.error(`PROMISES RESOLUTION ERROR :: ${JSON.stringify(err, null, 2)}`));
      });
  }
}


const category = 'ExchangeRequest';
const name = 'Exchange Request';
const label = 'BOTTLE EXCHANGE REQUEST';
const filterName = 'post_processing/by_exchange_request';
const action = (database) => {
  processor({
    name,
    category,
    label,
    database,
    Request,
  });
};


const filterDefinition = {
  name: filterName,
  label,
  action,
};

export default filterDefinition;
