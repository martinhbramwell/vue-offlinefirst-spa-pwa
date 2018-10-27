// import fs from 'fs';
import PouchDB from 'pouchdb';
import relater from 'relational-pouch';
import finder from 'pouchdb-find';

import adptrMemory from 'pouchdb-adapter-memory';

import processExchangeRequests from '../supervisor/ExchangeRequest';
import { logger as LG } from '../utils';

const runInMemory = false;
const adapter = runInMemory ? 'memory' : null;
const movesDB = runInMemory ? 'theDB' : process.env.LOCAL_DB;

// LG.verbose(`UTILS : ${JSON.stringify(logger, null, 2)}`)
LG.info(`Logs written to ${process.env.LOG_DIR}`); // eslint-disable-line no-console
LG.info(`Local :: ${movesDB}`);
// LG.verbose(`Remote :: ${process.env.REMOTE_DB}`);

PouchDB.plugin(finder);
PouchDB.plugin(relater);
PouchDB.plugin(adptrMemory);

export const databaseLocal = new PouchDB(movesDB, { adapter });
const databaseRemote = new PouchDB(process.env.REMOTE_DB);

export default () => {
  databaseLocal.setSchema([
    {
      singular: 'aBottle',
      plural: 'allBottles',
      relations: {
        ultimo: { belongsTo: 'aPerson' },
        movements: { belongsTo: 'BottleMovement' },
      },
    },
    {
      singular: 'BottleMovement',
      plural: 'allBottleMovements',
      relations: {
        bottle: { belongsTo: 'aBottle' },
        movements: { hasMany: 'Movement' },
      },
    },
    {
      singular: 'aPerson',
      plural: 'allPersons',
      relations: {
        bottles: { hasMany: 'aBottle' },
        bottle_movements: { belongsTo: 'PersonBottleMovement' },
      },
    },
    {
      singular: 'PersonBottleMovement',
      plural: 'allPersonBottleMovements',
      relations: {
        person: { belongsTo: 'aPerson' },
        movements: { hasMany: 'Movement' },
      },
    },
    {
      singular: 'Customer',
      plural: 'Customers',
      documentType: 'aPerson', //  Treat as READ-ONLY
    },
    {
      singular: 'Inventory',
      plural: 'Inventories',
      documentType: 'aPerson', //  Treat as READ-ONLY
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

  const fromFilter = 'ddocs/this_ddoc';
  databaseLocal.replicate.from(databaseRemote, {
    live: true,
    retry: true,
    filter: fromFilter,
  })
    .on('change', (response) => {
      LG.info(`${movesDB} ${fromFilter} ***  REPLICATION DELTA *** `);
      LG.info(response.docs[0]);
      LG.info(`Database replication from: ${response.docs.length} records.`);
      // LG.verbose(response.change.docs[0].data);
      // LG.verbose(response);
    })
    .on('active', () => {
      LG.debug(`${movesDB} ${fromFilter} ***  REPLICATION RESUMED *** `);
    })
    .on('paused', () => {
      LG.debug(`${movesDB} ${fromFilter}  ***  REPLICATION ON HOLD *** `);
    })
    .on('denied', (info) => {
      LG.debug(`${movesDB}/${fromFilter} ***  REPLICATION DENIED *** ${info}`);
    })

    .on('error', err => LG.error(`Database error ${err}`));


  const repFromCounts = {};
  const repFromFilter = 'post_processing/by_new_inventory';
  databaseLocal.replicate.from(databaseRemote, {
    live: true,
    retry: true,
    filter: repFromFilter,
    // query_params: { 'agent': userId },
  })
    .on('change', (response) => {
      LG.info(`${movesDB} ${repFromFilter} ***  NEW EXCHANGE REQUEST DELTA *** `);
      LG.info(`Database replication from: ${response.docs.length} records.`);
      response.docs.forEach((doc) => {
        if (!repFromCounts[doc.data.type]) repFromCounts[doc.data.type] = 0;
        repFromCounts[doc.data.type] += 1;
      });
      LG.info(`'from' counts by type : ${JSON.stringify(repFromCounts, null, 2)}`);
    })
    .on('active', () => {
      LG.debug(`${movesDB} ${repFromFilter} ***  NEW EXCHANGE REQUEST REPLICATION RESUMED *** `);
    })
    .on('paused', () => {
      LG.debug(`${movesDB} ${repFromFilter}  ***  NEW EXCHANGE REQUEST REPLICATION ON HOLD *** `);
      processExchangeRequests(databaseLocal); // ??????????????????????????????????????????????????
    })
    .on('denied', (info) => {
      LG.debug(`${movesDB}/${repFromFilter} ***  NEW EXCHANGE REQUEST REPLICATION DENIED *** ${info}`);
    })

    .on('error', err => LG.error(`Database error ${err}`));
  /*
  */
  const processingCounts = {};
  const repMvmntFilter = 'post_processing/by_processed_movement';
  databaseLocal.replicate.to(databaseRemote, {
    live: true,
    retry: true,
    filter: repMvmntFilter,
  })
    .on('change', (response) => {
      LG.info(`${movesDB} ${repMvmntFilter} ***  PROCESSING MOVEMENT DELTA *** `);
      LG.info(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
      response.change.docs.forEach((doc) => {
        if (!processingCounts[doc.data.type]) processingCounts[doc.data.type] = 0;
        processingCounts[doc.data.type] += 1;
      });
      LG.info(`'processing' counts by type : ${JSON.stringify(processingCounts, null, 2)}`);
    })
    .on('active', () => {
      LG.debug(`${movesDB} ${repMvmntFilter} ***  PROCESSING MOVEMENT REPLICATION RESUMED *** `);
    })
    .on('paused', () => {
      LG.debug(`${movesDB} ${repMvmntFilter}  ***  PROCESSING MOVEMENT REPLICATION ON HOLD *** `);
    })
    .on('denied', (info) => {
      LG.debug(`${movesDB}/${repMvmntFilter} ***  PROCESSING MOVEMENT REPLICATION DENIED *** ${info}`);
    })
    .on('error', err => LG.error(`Database error ${err}`));


  const repToCounts = {};
  const repToFilter = 'post_processing/by_processed_inventory';
  databaseLocal.replicate.to(databaseRemote, {
    live: true,
    retry: true,
    filter: repToFilter,
  })
    .on('change', (response) => {
      LG.info(`${movesDB} ${repToFilter} ***  PROCESSED MOVEMENT DELTA *** `);
      LG.info(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
      response.change.docs.forEach((doc) => {
        if (!repToCounts[doc.data.type]) repToCounts[doc.data.type] = 0;
        repToCounts[doc.data.type] += 1;
      });
      LG.info(`'to' counts by type : ${JSON.stringify(repToCounts, null, 2)}`);
    })
    .on('active', () => {
      LG.debug(`${movesDB} ${repToFilter} ***  PROCESSED MOVEMENT REPLICATION RESUMED *** `);
    })
    .on('paused', () => {
      LG.debug(`${movesDB} ${repToFilter}  ***  PROCESSED MOVEMENT REPLICATION ON HOLD *** `);
    })
    .on('denied', (info) => {
      LG.debug(`${movesDB}/${repToFilter} ***  PROCESSED MOVEMENT REPLICATION DENIED *** ${info}`);
    })
    .on('error', err => LG.error(`Database error ${err}`));
};
