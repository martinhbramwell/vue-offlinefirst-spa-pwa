import { logger as LG } from './utils';

export const EXCHANGE_RECORD = 'exchange';
export const MOVEMENT_RECORD = 'movement';

export const NEW = 'new';
export const PROCESSING = 'processing';
export const COMPLETE = 'complete';

const LGE = console.error;

export default class {
  constructor(local_database) {
    this.lclDB = local_database;

    this.customer = {};
    this.customerID = 0;
    this.inventory = null;
    this.inventoryID = null;
    this.aryBottles = [];
    this.aryBottleIDs = [];

  }

  // Getter
  get area() {
    return 40 * 40;
  }

  setCustomer(person) {
    // LG(`Person : ${JSON.stringify(person.allPersons[0], null, 2)}`);
    this.customer = person;
    if (person.allPersons && person.allPersons[0] && person.allPersons[0].id) {
      this.customerID = person.allPersons[0].id;
      // LG(this.customerID);
      // LG(this.customer.allPersons[0]);
    } else {
      throw `Error! Found no 'customer' person with ID: ${this.customerID}`;
    }
  }

  setInventory(person) {
    // LG(`Person : ${JSON.stringify(person.allPersons[0], null, 2)}`);
    this.inventory = person;
    if (person.allPersons && person.allPersons[0] && person.allPersons[0].id) {
      this.inventoryID = person.allPersons[0].id;
      // LG(this.customerID);
      // LG(this.customer.allPersons[0]);
    } else {
      throw `Error! Found no 'inventory' person with ID: ${this.inventoryID}`;
    }
  }

  setBottles(bottles) {
    this.aryBottles = bottles.allBottles.filter(bottle => this.aryBottleIDs.includes(bottle.id));
    LG(`MOV.BOTTLES  : ${JSON.stringify(this.aryBottleIDs, null, 2)}`);
    LG(`BOTTLEs  : ${JSON.stringify(this.aryBottles, null, 2)}`);
  }


  something(request) {
    return new Promise((res, rej) => {
      setTimeout(() => { res('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');  }, 5000);
    })
  }


  process(request) {
    return new Promise((res, rej) => {
      if (!request.doc.data) { res('uninteresting'); return; }
      const exchangeRequest = request.doc;
      const mvdt = exchangeRequest.data;
      if (mvdt.type !== EXCHANGE_RECORD) { res('uninteresting'); return; }
      if (mvdt.status !== NEW) { res('uninteresting'); return; }

      LG(`Row ${JSON.stringify(exchangeRequest, null, 2)}`);
      LG(`Process ${mvdt.id} ${mvdt.bottles.length}`);

      mvdt.status = PROCESSING;
      mvdt.rev = exchangeRequest._rev;
      // mvdt.id = parseInt(mvdt.id);
      LG(`ExchangeRequest status ${PROCESSING} :: ${JSON.stringify(exchangeRequest, null, 2)}`);

      this.lclDB.put(exchangeRequest)
        .then((mvmnt) => {
          LG(`SAVED UPDATED EXCHANGE REQUEST BEFORE PROCESSING
            ${JSON.stringify(mvmnt, null, 2)}
          `);

          exchangeRequest._rev = mvmnt.rev;
          this.customerID = mvdt.customer;
          this.inventoryID = mvdt.inventory;
          this.aryBottleIDs = mvdt.bottles;

          const aryMarshallerPromises = [];
          aryMarshallerPromises.push(
            this.lclDB.rel
              .find('aPerson', mvdt.customer)
              .then(this.setCustomer.bind(this))
              .catch(err => LGE(`${JSON.stringify(err, null, 2)}`))
          );

          aryMarshallerPromises.push(
            this.lclDB.rel
              .find('aPerson', mvdt.inventory)
              .then(this.setInventory.bind(this))
              .catch(err => LGE(`${JSON.stringify(err, null, 2)}`))
          );

          aryMarshallerPromises.push(
            this.lclDB.rel
              .find('aBottle', mvdt.bottles)
              .then(this.setBottles.bind(this)));

          Promise.all(aryMarshallerPromises)
            .then(() => {
              LG(`BOTTLES${JSON.stringify(this.aryBottles, null, 2)}`);

              this.aryBottleIDs = this.aryBottles.map(btl => btl.id);
              LG(`customer bottles length = ${this.customer.allBottles  ?  this.customer.allBottles.length  :  0}`);
              LG(`inventory bottles length = ${this.inventory.allBottles  ?  this.inventory.allBottles.length : 0}`);

              let srce = (mvdt.inOut === 'out') ? this.inventory : this.customer;
              let dest = (mvdt.inOut === 'out') ? this.customer : this.inventory;
              let destID = (mvdt.inOut === 'out') ? this.customerID : this.inventoryID;
              let location = (mvdt.inOut === 'out') ? 'cliente' : 'planta';

              // if (mvdt.inOut === 'out') {
              //   srce = this.inventory;
              //   dest = this.customer;
              //   destID = this.customerID;
              //   location = 'cliente';
              // }

              const savingPromises = [];

              LG(`Source person before : ${JSON.stringify(srce.allPersons[0], null, 2)}`);

              LG(`Bottle IDs : ${JSON.stringify(this.aryBottleIDs, null, 2)}`);

              let saveSrc = {
                _rev: srce.allPersons[0].rev,
                _id: this.lclDB.rel.makeDocID({ type: 'aPerson', id: srce.allPersons[0].id })
              };
              delete srce.allPersons[0].rev;
              saveSrc.data = srce.allPersons[0];

              saveSrc.data.bottles = saveSrc.data.bottles.filter((btl) => {
                return !this.aryBottleIDs.includes(btl);
              });
              saveSrc.data.movements.push(mvdt.id);

              LG(`Source person after : ${JSON.stringify(saveSrc, null, 2)}`);

              LG(`Destination person before : ${JSON.stringify(dest.allPersons[0], null, 2)}`);
              let saveDst = {
                _rev: dest.allPersons[0].rev,
                _id: this.lclDB.rel.makeDocID({ type: 'aPerson', id: dest.allPersons[0].id })
              };
              delete dest.allPersons[0].rev;
              saveDst.data = dest.allPersons[0];

              saveDst.data.movements.push(mvdt.id);
              this.aryBottles.forEach((btl) => {
                  LG(`bottle  : ${JSON.stringify(btl, null, 2)}`);
                  btl.ultimo = destID;
                  btl.ubicacion = location;
                  btl.movements.push(mvdt.id);
                  saveDst.data.bottles.push(btl.id);

                  savingPromises.push(this.lclDB.rel.save('aBottle', btl));
                });
              LG(`Destination person after : ${JSON.stringify(saveDst, null, 2)}`);

              savingPromises.push(this.lclDB.put(saveSrc).then((res) => { LG(`SRCE ${JSON.stringify(res, null, 2)}`) }));

              savingPromises.push(this.lclDB.put(saveDst).then((res) => { LG(`DEST ${JSON.stringify(res, null, 2)}`) }));

              Promise.all(savingPromises)
                .then((values) => {
                  LG(`PROMISE LIST \n${JSON.stringify(values, null, 2)}`);
                  exchangeRequest._deleted = true;
                  LG(`EXCHANGE \n${JSON.stringify(exchangeRequest, null, 2)}`);
                  this.lclDB.put(exchangeRequest)
                    .then((exrq) => {
                      LG(`MARKED EXCHANGE REQUEST DELETED :: ${JSON.stringify(exrq, null, 2)}`);
                      mvdt.status = COMPLETE;
                      mvdt.type = MOVEMENT_RECORD;
                      delete mvdt.rev;
                      this.lclDB.rel.save('Movement', mvdt)
                        .then(mvmnt => {
                          LG(`MOVEMENT RECORDED :: ${JSON.stringify(mvmnt, null, 2)}`);
                          res(COMPLETE);
                          // processExchangeRequests();
                        })
                        .catch(err => LG(`MOVEMENT RECORDING ERROR :: ${JSON.stringify(err, null, 2)}`));
                    })
                    .catch(err => LG(`EXCHANGE REQUEST DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
                })
                .catch(err => LG(`ERROR FINDING PERSONS OR BOTTLES :: ${JSON.stringify(err, null, 2)}`));
            })
            .catch(err => LG(`PROMISES RESOLUTION ERROR :: ${JSON.stringify(err, null, 2)}`));

        });
    });
  }
}
