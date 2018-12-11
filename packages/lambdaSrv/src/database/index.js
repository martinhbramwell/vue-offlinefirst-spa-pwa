// import fs from 'fs';
import PouchDB from 'pouchdb';
import relater from 'relational-pouch';
import finder from 'pouchdb-find';

import adptrMemory from 'pouchdb-adapter-memory';

import {
  exchangeRequestsFilter,
  personUpdateRequestFilter,
} from '../supervisor';

import { logger as LG } from '../utils';

const CLG = console.log; // eslint-disable-line no-console, no-unused-vars

const runInMemory = false;
const adapter = runInMemory ? 'memory' : null;
const lclDb = runInMemory ? 'theDB' : process.env.LOCAL_DB;
const rmtDb = process.env.REMOTE_DB;
const rmtDbHost = process.env.COUCH_HOST;

// LG.verbose(`UTILS : ${JSON.stringify(logger, null, 2)}`)
LG.info(`Logs written to ${process.env.LOG_DIR}`);
LG.info(`Local :: ${lclDb}`);
// LG.verbose(`Remote :: ${process.env.REMOTE_DB}`);

PouchDB.plugin(finder);
PouchDB.plugin(relater);
PouchDB.plugin(adptrMemory);

const userId = process.env.COUCH_USR;

export const databaseRemote = new PouchDB(rmtDb);
export const databaseLocal = new PouchDB(lclDb, { adapter });

LG.info(` ***  User Agent *** ${userId}`);


// const replicatedEntityCounters = {};

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

  // databaseLocal.changes({
  //   since: 'now',
  //   live: true,
  //   include_docs: true,
  // }).on('change', (change) => {
  //   LG.info(`\n${lclDb} *** DATA CHANGE ::\n${JSON.stringify(change, null, 3)} *** `);
  // }).on('error', (err) => {
  //   LG.info(`\n*** UNRECOVERABLE DATA CHANGE ERROR ::\n${JSON.stringify(err, null, 3)} *** `);
  // });

  const launchSyncs = (db, filter) => { // eslint-disable-line no-unused-vars
    const {
      name,
      label,
      action,
      // direction,
    } = filter;
    // const dir = direction.toUpperCase();

    db.sync(databaseRemote, {
      live: true,
      retry: true,
      filter: name,
      query_params: { agent: userId },
    })
      .on('change', (response) => {
        const dir = response.direction;
        const { docs } = response.change;
        LG.info(`${lclDb} ${name} *** ${label} ${dir} sync delta *** `);
        LG.info(`Database replication from: ${docs.length} records.`);
        // response.docs.forEach((doc) => {
        //   if (!replicatedEntityCounters[doc.data.type]) {
        //     replicatedEntityCounters[doc.data.type] = 0
        //   };
        //   replicatedEntityCounters[doc.data.type] += 1;
        // });
        // LG.info(`'from' counts by type : ${JSON.stringify(replicatedEntityCounters, null, 2)}`);
      })
      .on('active', () => {
        LG.info(`${lclDb} ${name} *** ${label} sync resumed *** `);
      })
      .on('paused', () => {
        LG.info(`${lclDb} ${name}  *** ${label} sync on hold *** `);
        action(db);
      })
      .on('denied', (info) => {
        LG.info(`${lclDb}/${name} *** ${label} sync denied *** ${info}`);
      })
      .on('error', err => LG.error(`Database error ${err}`));
  };

  // const launchSyncs = (db, filter) => { // eslint-disable-line no-unused-vars
  //   const {
  //     name,
  //     label,
  //     action,
  //     direction,
  //   } = filter;
  //   const dir = direction.toUpperCase();

  //   db.replicate[direction](databaseRemote, {
  //     live: true,
  //     retry: true,
  //     filter: name,
  //     query_params: { agent: userId },
  //   })
  //     .on('change', (response) => {
  //       LG.info(`${lclDb} ${name} *** ${label} REPLICATION DELTA ${dir} *** `);
  //       LG.info(`Database replication from: ${response.docs.length} records.`);
  //       // response.docs.forEach((doc) => {
  //       //   if (!replicatedEntityCounters[doc.data.type]) {
  //       //     replicatedEntityCounters[doc.data.type] = 0
  //       //   };
  //       //   replicatedEntityCounters[doc.data.type] += 1;
  //       // });
  //     // LG.info(`'from' counts by type : ${JSON.stringify(replicatedEntityCounters, null, 2)}`);
  //     })
  //     .on('active', () => {
  //       LG.info(`${lclDb} ${name} *** ${label} REPLICATION ${dir} RESUMED *** `);
  //     })
  //     .on('paused', () => {
  //       LG.info(`${lclDb} ${name}  *** ${label} REPLICATION ${dir} ON HOLD *** `);
  //       action(db);
  //     })
  //     .on('denied', (info) => {
  //       LG.info(`${lclDb}/${name} *** ${label} REPLICATION ${dir} DENIED *** ${info}`);
  //     })
  //     .on('error', err => LG.error(`Database error ${err}`));
  // };

  const nullAction = () => { LG.info(' no special action required '); };

  const coreReplicationFilter = {
    name: 'core_data/by_entities',
    label: 'CORE DATA ENTITIES',
    action: nullAction,
    direction: 'to',
  };

    // {
    //   name: 'post_processing/by_person_update',
    //   label: 'PERSON UPDATE REQUEST',
    //   action: processPersonUpdateRequests,
    //   direction: 'from',
    // },

  const replicationFilters = [
    coreReplicationFilter,
    exchangeRequestsFilter,
    personUpdateRequestFilter,
  ];

  let secondaryReplicationsWaiting = true;
  const startSecondaryReplications = (initializer) => { // eslint-disable-line no-unused-vars
    initializer.cancel();
    if (secondaryReplicationsWaiting) {
      LG.info('--------------------\nStart Secondary Replicators\n--------------------');
      replicationFilters.forEach((filter) => {
        // launchReplicator(databaseLocal, filter);
        launchSyncs(databaseLocal, filter);
      });
      secondaryReplicationsWaiting = false;
    }
  };

  const filterName = 'core_data/by_entities';
  const filterLabel = 'CORE DATA ENTITIES';

  databaseLocal.setMaxListeners(Infinity);
  const initialReplicator = databaseLocal.replicate.from(databaseRemote, {
    live: true,
    retry: true,
    filter: filterName,
    // query_params: { agent: userId },
  })
    .on('change', (info) => {
      LG.info(`${lclDb} *** ${filterLabel} REPLICATION DELTA FROM ${rmtDbHost} *** `);
      LG.info(`Database replication inbound _${JSON.stringify(info.docs.length, null, 3)}_ records.`);
      // LG.info(`${JSON.stringify(info.change.docs, null, 3)}`);
      // info.docs.forEach((doc) => {
      //   if (!replicatedEntityCounters[doc.data.type]) {
      //     replicatedEntityCounters[doc.data.type] = 0
      //   };
      //   replicatedEntityCounters[doc.data.type] += 1;
      // });
      // LG.info(`'from' counts by type : ${JSON.stringify(replicatedEntityCounters, null, 2)}`);
    })
    .on('active', () => {
      LG.info(`${lclDb} *** ${filterLabel} REPLICATION RESUMED *** `);
    })
    .on('paused', (err) => {
      LG.info(`${lclDb} *** ${filterLabel} REPLICATION PAUSED *** `);
      if (err) LG.info(`${databaseLocal} *** Error? >${err}< *** `);
      startSecondaryReplications(initialReplicator);
    })
    .on('paused', (err) => {
      LG.info(`${lclDb} *** ${filterLabel} REPLICATION PAUSED *** `);
      if (err) LG.info(`${databaseLocal} *** Error? >${err}< *** `);
      startSecondaryReplications(initialReplicator);
    })
    .on('complete', (info) => {
      LG.info(`${lclDb} *** ${filterLabel} INITIAL REPLICATION COMPLETE ***  (${JSON.stringify(info, null, 3)})`);
    })
    .on('error', err => LG.error(`Database replication error ${err}`));

  /* eslint-disable max-len */

  // const processingCounts = {};
  // const repMvmntFilter = 'post_processing/by_processed_movement';
  // databaseLocal.replicate.to(databaseRemote, {
  //   live: true,
  //   retry: true,
  //   filter: repMvmntFilter,
  // })
  //   .on('change', (response) => {
  //     LG.info(`${lclDb} ${repMvmntFilter} ***  PROCESSING MOVEMENT DELTA *** `);
  //     LG.info(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
  //     response.change.docs.forEach((doc) => {
  //       if (!processingCounts[doc.data.type]) processingCounts[doc.data.type] = 0;
  //       processingCounts[doc.data.type] += 1;
  //     });
  //     LG.info(`'processing' counts by type : ${JSON.stringify(processingCounts, null, 2)}`);
  //   })
  //   .on('active', () => {
  //     LG.debug(`${lclDb} ${repMvmntFilter} ***  PROCESSING MOVEMENT REPLICATION RESUMED *** `);
  //   })
  //   .on('paused', () => {
  //     LG.debug(`${lclDb} ${repMvmntFilter}  ***  PROCESSING MOVEMENT REPLICATION ON HOLD *** `);
  //   })
  //   .on('denied', (info) => {
  //     LG.debug(`${lclDb}/${repMvmntFilter} ***  PROCESSING MOVEMENT REPLICATION DENIED *** ${info}`);
  //   })
  //   .on('error', err => LG.error(`Database error ${err}`));

  // filterFrom(databaseLocal, 'ddocs/this_ddoc');

  // filterFrom(databaseLocal, 'core_data/by_entities');


  // databaseLocal.replicate.from(databaseRemote, {
  //   live: true,
  //   retry: true,
  //   filter: fromFilter,
  // })
  //   .on('change', (response) => {
  //     LG.info(`${lclDb} ${fromFilter} ***  REPLICATION DELTA *** `);
  //     LG.info(`${JSON.stringify(response.docs[0], null, 2)}`);
  //     LG.info(`Database replication from: ${response.docs.length} records.`);
  //     // LG.verbose(response.change.docs[0].data);
  //     // LG.verbose(response);
  //   })
  //   .on('active', () => {
  //     LG.info(`${lclDb} ${fromFilter} ***  REPLICATION RESUMED *** `);
  //   })
  //   .on('paused', () => {
  //     LG.info(`${lclDb} ${fromFilter}  ***  REPLICATION ON HOLD *** `);
  //   })
  //   .on('denied', (info) => {
  //     LG.info(`${lclDb}/${fromFilter} ***  REPLICATION DENIED *** ${info}`);
  //   })
  //   .on('error', err => LG.error(`Database error ${err}`));


  // const repFromCounts = {};
  // const repFromFilter = 'post_processing/by_new_inventory';
  // databaseLocal.replicate.from(databaseRemote, {
  //   live: true,
  //   retry: true,
  //   filter: repFromFilter,
  //   // query_params: { 'agent': userId },
  // })
  //   .on('change', (response) => {
  //     LG.info(`${lclDb} ${repFromFilter} ***  NEW EXCHANGE REQUEST DELTA *** `);
  //     LG.info(`Database replication from: ${response.docs.length} records.`);
  //     response.docs.forEach((doc) => {
  //       if (!repFromCounts[doc.data.type]) repFromCounts[doc.data.type] = 0;
  //       repFromCounts[doc.data.type] += 1;
  //     });
  //     LG.info(`'from' counts by type : ${JSON.stringify(repFromCounts, null, 2)}`);
  //   })
  //   .on('active', () => {
  //     LG.debug(`${lclDb} ${repFromFilter} ***  NEW EXCHANGE REQUEST REPLICATION RESUMED *** `);
  //   })
  //   .on('paused', () => {
  //     LG.debug(`${lclDb} ${repFromFilter}  ***  NEW EXCHANGE REQUEST REPLICATION ON HOLD *** `);
  //     processExchangeRequests(databaseLocal); // ??????????????????????????????????????????????????
  //   })
  //   .on('denied', (info) => {
  //     LG.debug(`${lclDb}/${repFromFilter} ***  NEW EXCHANGE REQUEST REPLICATION DENIED *** ${info}`);
  //   })
  //   .on('error', err => LG.error(`Database error ${err}`));


  // const repToCounts = {};
  // const repToFilter = 'post_processing/by_processed_inventory';
  // databaseLocal.replicate.to(databaseRemote, {
  //   live: true,
  //   retry: true,
  //   filter: repToFilter,
  // })
  //   .on('change', (response) => {
  //     LG.info(`${lclDb} ${repToFilter} ***  PROCESSED MOVEMENT DELTA *** `);
  //     LG.info(`Database replication: ${response.direction} ${response.change.docs.length} records.`);
  //     response.change.docs.forEach((doc) => {
  //       if (!repToCounts[doc.data.type]) repToCounts[doc.data.type] = 0;
  //       repToCounts[doc.data.type] += 1;
  //     });
  //     LG.info(`'to' counts by type : ${JSON.stringify(repToCounts, null, 2)}`);
  //   })
  //   .on('active', () => {
  //     LG.debug(`${lclDb} ${repToFilter} ***  PROCESSED MOVEMENT REPLICATION RESUMED *** `);
  //   })
  //   .on('paused', () => {
  //     LG.debug(`${lclDb} ${repToFilter}  ***  PROCESSED MOVEMENT REPLICATION ON HOLD *** `);
  //   })
  //   .on('denied', (info) => {
  //     LG.debug(`${lclDb}/${repToFilter} ***  PROCESSED MOVEMENT REPLICATION DENIED *** ${info}`);
  //   })
  //   .on('error', err => LG.error(`Database error ${err}`));

  // launchReplicator(databaseLocal, replicationFilters[1]);
  // const repFromFilter = replicationFilters[0].name;
  // databaseLocal.replicate.from(databaseRemote, {
  //   live: true,
  //   retry: true,
  //   filter: repFromFilter,
  //   query_params: { agent: userId },
  // })
  //   .on('change', (response) => {
  //     LG.info(`${lclDb} ${repFromFilter} *** ${replicationFilters[0].label} REPLICATION DELTA *** `);
  //     LG.info(`Database replication from: ${response.docs.length} records.`);
  //     response.docs.forEach((doc) => {
  //       if (!replicatedEntityCounters[doc.data.type]) replicatedEntityCounters[doc.data.type] = 0;
  //       replicatedEntityCounters[doc.data.type] += 1;
  //     });
  //     LG.info(`'from' counts by type : ${JSON.stringify(replicatedEntityCounters, null, 2)}`);
  //   })
  //   .on('active', () => {
  //     LG.info(`${lclDb} ${repFromFilter} *** ${replicationFilters[0].label} REPLICATION RESUMED *** `);
  //   })
  //   .on('paused', () => {
  //     LG.info(`${lclDb} ${repFromFilter}  *** ${replicationFilters[0].label} REPLICATION ON HOLD *** `);
  //     processExchangeRequests(databaseLocal); // ??????????????????????????????????????????????????
  //   })
  //   .on('denied', (info) => {
  //     LG.info(`${lclDb}/${repFromFilter} *** ${replicationFilters[0].label} REPLICATION DENIED *** ${info}`);
  //   })
  //   .on('error', err => LG.error(`Database error ${err}`));

  // const repFromPersonUpdateCounts = {};
  // const repFromFilterPersonUpdate = 'post_processing/by_person_update';
  // databaseLocal.replicate.from(databaseRemote, {
  //   live: true,
  //   retry: true,
  //   filter: repFromFilterPersonUpdate,
  //   // query_params: { agent: userId },
  // })
  //   .on('change', (response) => {
  //     LG.info(`${lclDb} ${repFromFilterPersonUpdate} ***  NEW PERSON UPDATE REQUEST DELTA *** `);
  //     LG.info(`Database replication from: ${response.docs.length} records.`);
  //     response.docs.forEach((doc) => {
  //       if (!repFromPersonUpdateCounts[doc.data.type]) repFromPersonUpdateCounts[doc.data.type] = 0;
  //       repFromPersonUpdateCounts[doc.data.type] += 1;
  //     });
  //     LG.info(`'from' counts by type : ${JSON.stringify(repFromPersonUpdateCounts, null, 2)}`);
  //   })
  //   .on('active', () => {
  //     LG.info(`${lclDb} ${repFromFilterPersonUpdate} ***  NEW PERSON UPDATE REQUEST REPLICATION RESUMED *** `);
  //   })
  //   .on('paused', () => {
  //     LG.info(`${lclDb} ${repFromFilterPersonUpdate}  ***  NEW PERSON UPDATE REQUEST REPLICATION ON HOLD *** `);
  //     processExchangeRequests(databaseLocal); // ??????????????????????????????????????????????????
  //   })
  //   .on('denied', (info) => {
  //     LG.info(`${lclDb}/${repFromFilterPersonUpdate} ***  NEW PERSON UPDATE REQUEST REPLICATION DENIED *** ${info}`);
  //   })
  //   .on('error', err => LG.error(`Database error ${err}`));
  /* eslint-enable max-len */


  // End of filters
};
