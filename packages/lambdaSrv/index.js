// import fs from 'fs';
import PouchDB from 'pouchdb';
import relater from '@movilizame/relational-pouch';
import finder from 'pouchdb-find';

import adptrMemory from 'pouchdb-adapter-memory';
import ExchangeRequest from './ExchangeRequest';

import { generateMovementId, logger as LG } from './utils';
// import debug from 'pouchdb-debug';

const runInMemory = false;
const adapter = runInMemory ? 'memory' : null;
const movesDB = runInMemory ? 'theDB' : process.env.LOCAL_DB;

// LG(`UTILS : ${JSON.stringify(logger, null, 2)}`)

LG(`Local :: ${movesDB}`);
LG(`Remote :: ${process.env.REMOTE_DB}`);

PouchDB.plugin(finder);
PouchDB.plugin(relater);
PouchDB.plugin(adptrMemory);

const movesDatabaseLocal = new PouchDB(movesDB, { adapter });
const movesDatabaseRemote = new PouchDB(process.env.REMOTE_DB);

const NEW = 'new';
const PROCESSING = 'processing';
const COMPLETE = 'complete';


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


// const idData = `${generateMovementId(12376)}`;
// const idReq = `ExchangeRequest_2_${idData}`;
// const request = {
//   id: idReq,
//   key: idReq,
//   value: {
//     rev: "1-c225802747a455835dae9853e8e04489"
//   },
//   doc: {
//     data: {
//       id: idData,
//       type: "exchange",
//       status: "new",
//       inOut: "out",
//       bottles: [
//         100041
//       ],
//       customer: 12376,
//       inventory: 12345
//     },
//     _id: idReq,
//   }
// }

const exchangeHandler = new ExchangeRequest(movesDatabaseLocal);

const processExchangeRequests = () => {
  LG(`

    PROCESS EXCHANGE REQUESTS
    `);
    movesDatabaseLocal.allDocs({
      include_docs: true,
    }).then((rslt) => {
      if (rslt.rows.length > 0 && rslt.rows[0].doc.data && rslt.rows[0].doc.data.type && rslt.rows[0].doc.data.type === EXCHANGE_RECORD) {
      LG(`
        PROCESS ONE EXCHANGE REQUEST ::
        ${JSON.stringify(rslt.rows[0], null, 2)}`)
        // // rslt.rows.forEach(processExchangeRequest);
        // processExchangeRequest(rslt.rows[0]);

        exchangeHandler.process(rslt.rows[0])
          .then((result) => {
            LG(`Processing result :: ${result}`);
            processExchangeRequests();
          })
          .catch(err => LG(`Processing failure :: ${JSON.stringify(err, null, 2)}`));


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
    LG(`${movesDB} ${fromFilter} ***  REPLICATION DELTA *** `);
    LG(response.docs[0]);
    LG(`Database replication from: ${response.docs.length} records.`);
    // LG(response.change.docs[0].data);
    // LG(response);
  })
  .on('active', () => {
    LG(`${movesDB} ${fromFilter} ***  REPLICATION RESUMED *** `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${fromFilter}  ***  REPLICATION ON HOLD *** `);
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${fromFilter} ***  REPLICATION DENIED *** ${info}`);
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
    LG(`${movesDB} ${repFromFilter} ***  NEW EXCHANGE REQUEST DELTA *** `);
    LG(`Database replication from: ${response.docs.length} records.`);
    response.docs.forEach((doc) => {
      if (!repFromCounts[doc.data.type]) repFromCounts[doc.data.type] = 0;
      repFromCounts[doc.data.type] += 1;
    });
    LG(`'from' counts by type : ${JSON.stringify(repFromCounts, null, 2)}`);
  })
  .on('active', () => {
    LG(`${movesDB} ${repFromFilter} ***  NEW EXCHANGE REQUEST REPLICATION RESUMED *** `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${repFromFilter}  ***  NEW EXCHANGE REQUEST REPLICATION ON HOLD *** `);
    processExchangeRequests(); // ????????????????????????????????????????????????????????????????????????????????????????????????????????
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${repFromFilter} ***  NEW EXCHANGE REQUEST REPLICATION DENIED *** ${info}`);
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
    LG(`${movesDB} ${repToFilter} ***  PROCESSING MOVEMENT DELTA *** `);
    LG(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
    response.change.docs.forEach((doc) => {
      if (!processingCounts[doc.data.type]) processingCounts[doc.data.type] = 0;
      processingCounts[doc.data.type] += 1;
    });
    LG(`'processing' counts by type : ${JSON.stringify(processingCounts, null, 2)}`);
  })
  .on('active', () => {
    LG(`${movesDB} ${repToFilter} ***  PROCESSING MOVEMENT REPLICATION RESUMED *** `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${repToFilter}  ***  PROCESSING MOVEMENT REPLICATION ON HOLD *** `);
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${repToFilter} ***  PROCESSING MOVEMENT REPLICATION DENIED *** ${info}`);
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
    LG(`${movesDB} ${repToFilter} ***  PROCESSED MOVEMENT DELTA *** `);
    LG(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
    response.change.docs.forEach((doc) => {
      if (!repToCounts[doc.data.type]) repToCounts[doc.data.type] = 0;
      repToCounts[doc.data.type] += 1;
    });
    LG(`'to' counts by type : ${JSON.stringify(repToCounts, null, 2)}`);
  })
  .on('active', () => {
    LG(`${movesDB} ${repToFilter} ***  PROCESSED MOVEMENT REPLICATION RESUMED *** `);
  })
  .on('paused', () => {
    LG(`${movesDB} ${repToFilter}  ***  PROCESSED MOVEMENT REPLICATION ON HOLD *** `);
  })
  .on('denied', (info) => {
    LG(`${movesDB}/${repToFilter} ***  PROCESSED MOVEMENT REPLICATION DENIED *** ${info}`);
  })
  .on('error', err => LG(`Database error ${err}`));

