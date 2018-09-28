import Express from 'express';
import BodyParser from 'body-parser';


import PouchDB from 'pouchdb';
import relater from '@movilizame/relational-pouch';
import debug from 'pouchdb-debug';

import { generateMovementId } from './utils';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console

PouchDB.plugin(debug);
PouchDB.plugin(relater);
// PouchDB.debug.enable('*');

const app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

const NEW = 'new';
const PROCESSING = 'processing';
const COMPLETE = 'complete';
const userId = 12354;

const movesDB = process.env.LOCAL_DB;
const movesDatabaseLocal = new PouchDB(movesDB);
const movesDatabaseRemote = new PouchDB(process.env.REMOTE_DB);

movesDatabaseLocal.setSchema([
  {
    singular: 'aBottle',
    plural: 'allBottles',
    relations: {
      ultimo: { belongsTo: 'aPerson' },
      movements: { hasMany: 'Movement' },
    },
  },
  {
    singular: 'aPerson',
    plural: 'allPersons',
    relations: {
      bottles: { hasMany: 'aBottle' },
      movements: { hasMany: 'Movement' },
    },
  },
  {
    singular: 'Customer',
    plural: 'Customers',
    documentType: 'aPerson',  //  Treat as READ-ONLY
  },
  {
    singular: 'Inventory',
    plural: 'Inventories',
    documentType: 'aPerson',  //  Treat as READ-ONLY
  },
  {
    singular: 'Movement',
    plural: 'Movements',
    relations: {
      inventory: { belongsTo: 'Inventory' },
      customer: { belongsTo: 'Customer' },
      bottles: { hasMany: 'aBottle' },
    },
  },
  {
    singular: 'ExchangeRequest',
    plural: 'ExchangeRequests',
    relations: {
      inventory: { belongsTo: 'Inventory' },
      customer: { belongsTo: 'Customer' },
      bottles: { hasMany: 'aBottle' },
    },
  },
]);

LG(`REMOTE_DB  :  ${process.env.REMOTE_DB}`);

const EXCHANGE_RECORD = 'exchange';
const MOVEMENT_RECORD = 'movement';

const processExchangeRequest = (row) => {
  if (!row.doc.data) return;
  const exchangeRequest = row.doc;
  const mvdt = exchangeRequest.data;
  if (mvdt.type !== EXCHANGE_RECORD) return;
  if (mvdt.status !== NEW) return;

  LG(`Row ${JSON.stringify(exchangeRequest, null, 2)}`);
  LG(`Process ${mvdt.id} ${mvdt.bottles.length}`);


  let customer = null;
  let customerID = null;
  let inventory = null;
  let inventoryID = null;
  let aryBottles = [];
  let aryBottleIDs = [];

  mvdt.status = PROCESSING;
  mvdt.rev = exchangeRequest._rev;
  mvdt.id = parseInt(mvdt.id);
  LG(`ExchangeRequest status ${PROCESSING} :: ${JSON.stringify(exchangeRequest, null, 2)}`);

  movesDatabaseLocal.put(exchangeRequest)
    .then((mvmnt) => {
      LG(`SAVED UPDATED EXCHANGE REQUEST BEFORE PROCESSING
        ${JSON.stringify(mvmnt, null, 2)}
      `);

      exchangeRequest._rev = mvmnt.rev;

      const aryMarshallerPromises = [];
      aryMarshallerPromises.push(movesDatabaseLocal.rel.find('aPerson', mvdt.customer)
        .then((person) => {
          LG('CUSTOMER');
          customer = person;
          customerID = customer.allPersons[0].id;
          LG(customerID);
          LG(customer.allPersons[0]);
        }));

      aryMarshallerPromises.push(movesDatabaseLocal.rel.find('aPerson', mvdt.inventory)
        .then((person) => {
          LG('INVENTORY');
          inventory = person;
          inventoryID = inventory.allPersons[0].id;
          LG(inventoryID);
          LG(inventory.allPersons[0]);
        }));

      aryMarshallerPromises.push(movesDatabaseLocal.rel.find('aBottle', mvdt.bottles)
        .then((btls) => {
          aryBottles = btls.allBottles.filter(bottle => mvdt.bottles.includes(bottle.id));
          LG(`MOV.BOTTLES  : ${JSON.stringify(mvdt.bottles, null, 2)}`);
          LG(`BOTTLEs  : ${JSON.stringify(aryBottles, null, 2)}`);
        }));

      const collectedBottles = Promise.all(aryMarshallerPromises)
        .then(() => {
          // LG('BOTTLES');
          // LG(aryBottles);
          aryBottleIDs = aryBottles.map(btl => btl.id);
          LG(`customer bottles length = ${customer.allBottles  ?  customer.allBottles.length  :  0}`);
          LG(`inventory bottles length = ${inventory.allBottles  ?  inventory.allBottles.length : 0}`);

          let srce = customer;
          let dest = inventory;
          let destID = inventoryID;
          let location = 'planta';
          if (mvdt.inOut === 'out') {
            srce = inventory;
            dest = customer;
            destID = customerID;
            location = 'cliente';
          }

          const savingPromises = [];
          /* eslint-disable no-param-reassign */
          // LG(`Source person before : ${JSON.stringify(srce, null, 2)}`);
          LG(`Source person before : ${JSON.stringify(srce.allPersons[0], null, 2)}`);

          LG(`Bottle IDs : ${JSON.stringify(aryBottleIDs, null, 2)}`);

          let saveSrc = {
            _rev: srce.allPersons[0].rev,
            _id: movesDatabaseLocal.rel.makeDocID({ type: 'aPerson', id: srce.allPersons[0].id })
          };
          delete srce.allPersons[0].rev;
          saveSrc.data = srce.allPersons[0];

          saveSrc.data.bottles = saveSrc.data.bottles.filter((btl) => {
            return !aryBottleIDs.includes(btl);
          });
          saveSrc.data.movements.push(mvdt.id);

          LG(`Source person after : ${JSON.stringify(saveSrc, null, 2)}`);

          LG(`Destination person before : ${JSON.stringify(dest.allPersons[0], null, 2)}`);
          let saveDst = {
            _rev: dest.allPersons[0].rev,
            _id: movesDatabaseLocal.rel.makeDocID({ type: 'aPerson', id: dest.allPersons[0].id })
          };
          delete dest.allPersons[0].rev;
          saveDst.data = dest.allPersons[0];

          saveDst.data.movements.push(mvdt.id);
          aryBottles.forEach((btl) => {
              LG(`bottle  : ${JSON.stringify(btl, null, 2)}`);
              btl.ultimo = destID;
              btl.ubicacion = location;
              btl.movements.push(mvdt.id);
              saveDst.data.bottles.push(btl.id);

              savingPromises.push(movesDatabaseLocal.rel.save('aBottle', btl));
            });
          LG(`Destination person after : ${JSON.stringify(saveDst, null, 2)}`);

          // LG(`customer bottles length = ${customer.allBottles.length}`);
          // LG(`inventory bottles length = ${inventory.allBottles.length}`);


          savingPromises.push(movesDatabaseLocal.put(saveSrc).then((res) => { LG(`SRCE ${JSON.stringify(res, null, 2)}`) }));

          savingPromises.push(movesDatabaseLocal.put(saveDst).then((res) => { LG(`DEST ${JSON.stringify(res, null, 2)}`) }));

          Promise.all(savingPromises)
            .then((values) => {
              LG(`PROMISE LIST \n${JSON.stringify(values, null, 2)}`);
              exchangeRequest._deleted = true;
              LG(`EXCHANGE \n${JSON.stringify(exchangeRequest, null, 2)}`);
              movesDatabaseLocal.put(exchangeRequest)
                .then((exrq) => {
                  LG(`MARKED EXCHANGE REQUEST DELETED :: ${JSON.stringify(exrq, null, 2)}`);
                  mvdt.status = COMPLETE;
                  mvdt.type = MOVEMENT_RECORD;
                  delete mvdt.rev;
                  movesDatabaseLocal.rel.save('Movement', mvdt)
                    .then(mvmnt => {
                      LG(`MOVEMENT RECORDED :: ${JSON.stringify(mvmnt, null, 2)}`);
                      processExchangeRequests();
                    })
                    .catch(err => LG(`MOVEMENT RECORDING ERROR :: ${JSON.stringify(err, null, 2)}`));
                })
                .catch(err => LG(`EXCHANGE REQUEST DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
            })
            .catch(err => LG(`PROMISES RESOLUTION ERROR :: ${JSON.stringify(err, null, 2)}`));
        });


    }).catch(err => LG(`Error: ${JSON.stringify(err, null, 2)}`));
};

const processExchangeRequests = () => {
  LG(`

    PROCESS EXCHANGE REQUESTS
    `);
    movesDatabaseLocal.allDocs({
      include_docs: true,
    }).then((rslt) => {
      if (rslt.rows.length > 0 && rslt.rows[0].doc.data.type && rslt.rows[0].doc.data.type === EXCHANGE_RECORD) {
      LG(`
        PROCESS ONE EXCHANGE REQUEST ::
        ${JSON.stringify(rslt.rows[0], null, 2)}`)
        // rslt.rows.forEach(processExchangeRequest);
        processExchangeRequest(rslt.rows[0]);
      }
})
    .catch(function (err) {
      console.log(err);
    });
};

const fromFilter = 'ddocs/this_ddoc';
movesDatabaseLocal.replicate.from(movesDatabaseRemote, {
  live: true,
  retry: true,
  filter: fromFilter,
})
  .on('change', (response) => {
    LG(`${movesDB} ${fromFilter} **********  REPLICATION DELTA ********* `);
    LG(response.docs[0]);
    LG(`Database replication from: ${response.docs.length} records.`);
    // LG(response.change.docs[0].data);
    // LG(response);
  })
  .on('active', () => {
    LG(`${movesDB} ${fromFilter} **********  REPLICATION RESUMED ********* `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${fromFilter}  ************  REPLICATION ON HOLD *********** `);
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${fromFilter} **********  REPLICATION DENIED ********* ${info}`);
  })

  .on('error', err => LG(`Database error ${err}`));


const repFromCounts = {};
const repFromFilter = 'post_processing/by_new_inventory';
movesDatabaseLocal.replicate.from(movesDatabaseRemote, {
  live: true,
  retry: true,
  filter: repFromFilter,
  // query_params: { 'agent': userId },
})
  .on('change', (response) => {
    LG(`${movesDB} ${repFromFilter} **********  NEW EXCHANGE REQUEST DELTA ********* `);
    LG(`Database replication from: ${response.docs.length} records.`);
    response.docs.forEach((doc) => {
      if (!repFromCounts[doc.data.type]) repFromCounts[doc.data.type] = 0;
      repFromCounts[doc.data.type] += 1;
    });
    LG(repFromCounts);
  })
  .on('active', () => {
    LG(`${movesDB} ${repFromFilter} **********  NEW EXCHANGE REQUEST REPLICATION RESUMED ********* `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${repFromFilter}  ************  NEW EXCHANGE REQUEST REPLICATION ON HOLD *********** `);
    processExchangeRequests(); // ????????????????????????????????????????????????????????????????????????????????????????????????????????
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${repFromFilter} **********  NEW EXCHANGE REQUEST REPLICATION DENIED ********* ${info}`);
  })

  .on('error', err => LG(`Database error ${err}`));
/*
*/
const processingCounts = {};
movesDatabaseLocal.replicate.to(movesDatabaseRemote, {
  live: true,
  retry: true,
  filter: 'post_processing/by_processed_movement',
})
  .on('change', (response) => {
    LG(`${movesDB} ${repToFilter} **********  PROCESSING MOVEMENT DELTA ********* `);
    LG(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
    response.change.docs.forEach((doc) => {
      if (!processingCounts[doc.data.type]) processingCounts[doc.data.type] = 0;
      processingCounts[doc.data.type] += 1;
    });
    LG(processingCounts);
  })
  .on('active', () => {
    LG(`${movesDB} ${repToFilter} **********  PROCESSING MOVEMENT REPLICATION RESUMED ********* `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${repToFilter}  ************  PROCESSING MOVEMENT REPLICATION ON HOLD *********** `);
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${repToFilter} **********  PROCESSING MOVEMENT REPLICATION DENIED ********* ${info}`);
  })
  .on('error', err => LG(`Database error ${err}`));


const repToCounts = {};
const repToFilter = 'post_processing/by_processed_inventory';
movesDatabaseLocal.replicate.to(movesDatabaseRemote, {
  live: true,
  retry: true,
  filter: repToFilter,
})
  .on('change', (response) => {
    LG(`${movesDB} ${repToFilter} **********  PROCESSED MOVEMENT DELTA ********* `);
    LG(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
    response.change.docs.forEach((doc) => {
      if (!repToCounts[doc.data.type]) repToCounts[doc.data.type] = 0;
      repToCounts[doc.data.type] += 1;
    });
    LG(repToCounts);
  })
  .on('active', () => {
    LG(`${movesDB} ${repToFilter} **********  PROCESSED MOVEMENT REPLICATION RESUMED ********* `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${repToFilter}  ************  PROCESSED MOVEMENT REPLICATION ON HOLD *********** `);
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${repToFilter} **********  PROCESSED MOVEMENT REPLICATION DENIED ********* ${info}`);
  })
  .on('error', err => LG(`Database error ${err}`));
/*
*/

movesDatabaseLocal.changes({
  include_docs: true,
  filter: doc => doc.data && doc.data.type === MOVEMENT_RECORD && doc.data.status !== COMPLETE,
}).then((chng) => {
  LG(`Changes ===========
    `);
  if (chng.results.length < 1) return;
  LG(`Will process ${chng.results.length} changes`);
  LG(chng.results[0]);
  LG(`

    MOVEMENT PROCESSING ON INTERNAL CHANGE HAS BEEN DISABLED

    `);
  // processExchangeRequests();

}).catch((err) => {
  LG(err);
});

// const personalDatabaseName = 'DanielLeonardWildStapel'.toLowerCase();
// // const personalDatabaseURL = process.env.COUCH_URL + '/' + personalDatabaseName;

// LG(personalDatabaseURL);
// const personalDatabaseRemote = new PouchDB(personalDatabaseURL);
// personalDatabaseRemote.put({
//   _id: 'mydoc',
//   title: 'Heroes'
// }).then(function (response) {
//   LG('Put OK' );
//   LG(response);
// }).catch(function (err) {
//   LG('Put ERR' );
//   LG(err);
// });


app.get('/', (req, res) => {
  res.send(`go away ${process.env.REMOTE_DB} ${process.env.LOCAL_DB}`);
}); // eslint-disable-line no-unused-vars, no-console

app.get('/test', (req, res) => {

  const testNumber = 0;
  const testSets = [
    { inventory: 12345, customer: 12349, inOut: 'out', bottles: [100037, 100038, 100039] },
    { inventory: 12350, customer: 12346, inOut: 'in', bottles: [100538, 101309] },
    { inventory: 12348, customer: 12354, inOut: 'out', bottles: [100538, 101309] },
  ];

  const id = generateMovementId(testSets[testNumber].customer, 1);
  const data = { id, type: MOVEMENT_RECORD, status: NEW };
  const movement = {
    _id: `Movement_1_${id}`,
    _rev: '1-19058b1d37d9fba888cddf4092de74fe',
    data: Object.assign(data, testSets[testNumber]),
  };

  LG('MOVEMENT BEFORE PROCESSING');
  LG(movement);
  /*

  data:
   { id: '000000180902155434012349',
     type: ${MOVEMENT_RECORD},
     status: 'new',
     inventory: 12345,
     customer: 12349,
     inOut: 'out',
     bottles: [ 100037, 100038, 100039 ]
   }

  */

  const mov = movement.data;
  let customer = null;
  let customerID = null;
  let inventory = null;
  let inventoryID = null;
  let aryBottles = [];
  let aryBottleIDs = [];

  mov.status = PROCESSING;
  movesDatabaseLocal.rel.save('Movement', mov)
    .then((mvmnt) => {
      LG('SAVED MOVEMENT BEFORE PROCESSING');
      LG(mvmnt);

      const aryMarshallerPromises = [];
      aryMarshallerPromises.push(movesDatabaseLocal.rel.find('aPerson', mov.customer)
        .then((person) => {
          LG('CUSTOMER');
          customer = person;
          customerID = customer.allPersons[0].id;
          LG(customerID);
          LG(customer.allPersons[0]);
        }));

      aryMarshallerPromises.push(movesDatabaseLocal.rel.find('aPerson', mov.inventory)
        .then((person) => {
          LG('INVENTORY');
          inventory = person;
          inventoryID = inventory.allPersons[0].id;
          LG(inventoryID);
          LG(inventory.allPersons[0]);
        }));

      aryMarshallerPromises.push(movesDatabaseLocal.rel.find('aBottle', mov.bottles)
        .then((btls) => {
          aryBottles = btls.allBottles.filter(btle => mov.bottles.includes(btle.id));;
          LG(`MOV.BOTTLES  : ${JSON.stringify(mov.bottles, null, 2)}`);
          LG(`BOTTLEs  : ${JSON.stringify(aryBottles, null, 2)}`);
        }));

      const collectedBottles = Promise.all(aryMarshallerPromises)
        .then(() => {
          // LG('BOTTLES');
          // LG(aryBottles);
          aryBottleIDs = aryBottles.map(btl => btl.id);
          LG(`customer bottles length = ${customer.allBottles.length}`);
          LG(`inventory bottles length = ${inventory.allBottles.length}`);

          let srce = customer;
          let dest = inventory;
          let destID = inventoryID;
          let location = 'planta';
          if (mov.inOut === 'out') {
            srce = inventory;
            dest = customer;
            destID = customerID;
            location = 'cliente';
          }

          const savingPromises = [];
          /* eslint-disable no-param-reassign */
          LG(`Source person before : ${JSON.stringify(srce, null, 2)}`);
          LG(`Source person before : ${JSON.stringify(srce.allPersons[0], null, 2)}`);

          LG(`Bottle IDs : ${JSON.stringify(aryBottleIDs, null, 2)}`);

          let saveSrc = {
            _rev: srce.allPersons[0].rev,
            _id: movesDatabaseLocal.rel.makeDocID({ type: 'aPerson', id: srce.allPersons[0].id })
          };
          delete srce.allPersons[0].rev;
          saveSrc.data = srce.allPersons[0];

          saveSrc.data.bottles = saveSrc.data.bottles.filter((btl) => {
            return !aryBottleIDs.includes(btl);
          });
          saveSrc.data.movements.push(mov.id);

          LG(`Source person after : ${JSON.stringify(saveSrc, null, 2)}`);

          LG(`Destination person before : ${JSON.stringify(dest.allPersons[0], null, 2)}`);
          let saveDst = {
            _rev: dest.allPersons[0].rev,
            _id: movesDatabaseLocal.rel.makeDocID({ type: 'aPerson', id: dest.allPersons[0].id })
          };
          delete dest.allPersons[0].rev;
          saveDst.data = dest.allPersons[0];

          saveDst.data.movements.push(mov.id);
          aryBottles.forEach((btl) => {
              LG(`bottle  : ${JSON.stringify(btl, null, 2)}`);
              btl.ultimo = destID;
              btl.ubicacion = location;
              btl.movements.push(mov.id);
              saveDst.data.bottles.push(btl.id);

              savingPromises.push(movesDatabaseLocal.rel.save('aBottle', btl));
            });
          LG(`Destination person after : ${JSON.stringify(saveDst, null, 2)}`);

          // LG(`customer bottles length = ${customer.allBottles.length}`);
          // LG(`inventory bottles length = ${inventory.allBottles.length}`);


          savingPromises.push(movesDatabaseLocal.put(saveSrc).then((res) => { LG(`SRCE ${JSON.stringify(res, null, 2)}`) }));

          savingPromises.push(movesDatabaseLocal.put(saveDst).then((res) => { LG(`DEST ${JSON.stringify(res, null, 2)}`) }));

          Promise.all(savingPromises)
            .then((values) => {
              LG(`PROMISE LIST
                ${JSON.stringify(values, null, 2)}`);

              mov.status = COMPLETE;
              movesDatabaseLocal.rel.save('Movement', mov)
                .then(() => {
                  LG(' ############################# MOVEMENT RECORDED ############################## ')
                });

              // LG(`customer bottles = ${JSON.stringify(customer.allBottles, null, 2)}`);
            });
        });
    });


  res.send('done');
}); // eslint-disable-line no-unused-vars, no-console

app.get('/fakemove', (req, res) => {
  LG(req.query.v);

  const customer = 12345;
  const id = generateMovementId(customer, 1);
  let str = `doing it : ${id}
  `;

  const moveIn = {
    _id: `Movement_1_${id}`,
    data: {
      id,
      type: MOVEMENT_RECORD,
      inOut: 'in',
      bottles: [100023],
      customer,
      inventory: userId,
    },
  };
  str += `movement in ${JSON.stringify(moveIn, null, 2)}
  `;
  movesDatabaseLocal.put(moveIn)
    .then((mvmnt) => {
      str += `---------- Saved movement IN --------
      `;
      str += `${JSON.stringify(mvmnt, null, 2)}`;
      res.send(str);
      LG('done');
    }).then(() => {
      movesDatabaseLocal.allDocs({
        include_docs: true,
      }).then((result) => {
        // LG(`filtered ${JSON.stringify(result.rows[0].doc, null, 2)}`);
        const filt = result.rows.filter(rec => rec.doc.data && rec.doc.data.type === MOVEMENT_RECORD);
        filt.forEach((f) => {
          LG(`filtered ${JSON.stringify(f.doc.data.id, null, 2)}`);
        });
      }).catch((err) => { LG(err); });
    });
}); // eslint-disable-line no-unused-vars, no-console

const server = app.listen(3000, () => {
  movesDatabaseLocal.info().then((info) => {
    LG(info);
    LG('Listening on port %s...', server.address().port);
  });
});
