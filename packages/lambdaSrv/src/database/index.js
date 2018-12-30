import PouchDB from 'pouchdb';
import relater from 'relational-pouch';
import finder from 'pouchdb-find';

import adptrMemory from 'pouchdb-adapter-memory';

import supervisor from '../supervisor';

import { logger as LG } from '../utils';
import query from '../utils/query'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

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

  const replicatedEntityCounters = {};
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
        docs.forEach((doc) => {
          if (!replicatedEntityCounters[doc.data.type]) {
            replicatedEntityCounters[doc.data.type] = 0;
          }
          replicatedEntityCounters[doc.data.type] += 1;
        });

        // LG.debug(`The request(s) : ${JSON.stringify(docs, null, 2)}`);
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

  const nullAction = () => { LG.info(' no special action required '); };

  const coreReplicationFilter = {
    name: 'core_data/by_entities',
    label: 'CORE DATA ENTITIES',
    action: nullAction,
  };

  const requestsReplicationFilter = {
    name: 'post_processing/by_request',
    label: 'CHANGE REQUEST',
    action: supervisor,
  };

  const invoicesReplicationFilter = {
    name: 'post_processing/by_invoice',
    label: 'INVOICE',
    action: nullAction,
  };

    // {
    //   name: 'post_processing/by_person_update',
    //   label: 'PERSON UPDATE REQUEST',
    //   action: processPersonUpdateRequests,
    //   direction: 'from',
    // },

  const replicationFilters = [
    coreReplicationFilter,
    requestsReplicationFilter,
    invoicesReplicationFilter,
  ];

  let secondaryReplicationsWaiting = true;
  const startSecondaryReplications = () => { // eslint-disable-line no-unused-vars
    if (secondaryReplicationsWaiting) {
      LG.info('--------------------\nStart Secondary Replicators\n--------------------');
      replicationFilters.forEach((filter) => {
        launchSyncs(databaseLocal, filter);
      });
      secondaryReplicationsWaiting = false;
    }
  };

  const filterName = 'core_data/by_entities';
  const filterLabel = 'CORE DATA ENTITIES';

  databaseLocal.setMaxListeners(Infinity);

  databaseLocal.replicate.from(databaseRemote, {
    filter: filterName,
    batch_size: 500,
  })
    .on('change', (info) => {
      LG.info(`${lclDb} *** ${filterLabel} REPLICATION DELTA FROM ${rmtDbHost} *** `);
      LG.info(`Database replication inbound _${JSON.stringify(info.docs.length, null, 3)}_ records.`);
      info.docs.forEach((doc) => {
        if (doc.data && doc.data.type) {
          if (!replicatedEntityCounters[doc.data.type]) {
            replicatedEntityCounters[doc.data.type] = 0;
          }
          replicatedEntityCounters[doc.data.type] += 1;
        }
        if (doc.filters) {
          let fname = '';
          let spacer = '';
          Object.keys(doc.filters).forEach((k) => {
            fname += spacer + k;
            spacer = ', ';
          });
          if (!replicatedEntityCounters[fname]) {
            replicatedEntityCounters[fname] = 0;
          }
          replicatedEntityCounters[fname] += 1;
          LG.info(`Counted filter : ${JSON.stringify(fname, null, 2)}`);
        }
      });
      LG.info(`'from' counts by type : ${JSON.stringify(replicatedEntityCounters, null, 2)}`);
    })
    .then((rslt) => {
      LG.info(`${lclDb} *** ${filterLabel}
    INITIAL REPLICATION COMPLETE ***  (${JSON.stringify(rslt, null, 3)})`);
      startSecondaryReplications();
    })
    .catch(err => LG.error(`Database replication error ${err}`));

  /* eslint-disable max-len */

  // .on('active', () => {
  //   LG.info(`${lclDb} *** ${filterLabel} REPLICATION RESUMED *** `);
  // })
  // .on('complete', (info) => {
  //   CLG(info);
  // LG.info(`${lclDb} *** ${filterLabel} REPLICATION FINISHED ***\n${info}`);
  //       if (err.message.length > 0) LG.info(`${lclDb} *** Error? >${err}< *** `);

  //   //    // LG.debug(`${lclDb} Initializing sequence counters `);
  //   //    // const lastValueOptions = { descending: true, limit: 1 };
  //   //    // query(databaseLocal, 'sequences/last_invoice_serial', lastValueOptions)
  //   //    //   .then(s => LG.debug(`${lclDb} Sequence : ${JSON.stringify(s.rows, null, 2)} `));
  //   //    // query(databaseLocal, 'sequences/last_invoice_id', lastValueOptions)
  //   //    //   .then(s => LG.debug(`${lclDb} ID : ${JSON.stringify(s.rows, null, 2)} `));

  //       LG.debug(`
  // {
  //   "_id": "_design/sequences",
  //   "_rev": "1-7d4586c1649f86e4098bf3717afe6de0",
  //   "views": {
  //     "last_invoice_id": {
  //       "map": "function(doc) {if (doc.data && doc.data.type === 'invoice' && !doc.data.metadata && !doc.meta) emit(doc.data.idib, data.codigo)}"
  //     }
  //   }
  // }
  // `);

  //       databaseLocal.query(
  //         'sequences/last_invoice_id',
  //         { descending: true, limit: 1 },
  //       ).then(rslt => LG.debug(`\nLAST ID : ${JSON.stringify(rslt, null, 2)} `));

  //       databaseLocal.allDocs({
  //         include_docs: true,
  //         attachments: true,
  //         descending: true,
  //         endkey: 'Invoice_1_0000000000000000',
  //         startkey: 'Invoice_3',
  //         limit: 1,
  //       })
  //         .then(rslt => LG.debug(`\nLAST INVOICE ::\n${JSON.stringify(rslt, null, 2)} `))
  //         .catch(error => LG.error(`UPDATE ERROR :: ${JSON.stringify(error, null, 2)}`));

  //       startSecondaryReplications(initialReplicator);
  // })

  // .then((rslt) => {
  //   LG.info(`${lclDb} *** ${filterLabel}
  // INITIAL REPLICATION COMPLETE ***  (${JSON.stringify(rslt, null, 3)})`);

  //     // const IDX_INV_CODE = 'invoice_codigo';
  //     // const IDX_FLD_CODE = 'data.codigo';
  //     // databaseLocal.createIndex({ index: { fields: [IDX_FLD_CODE], name: IDX_INV_CODE } })
  //     //   .then((idxRslt) => {
  //     //     LG.debug(`\nBuilt index ${IDX_INV_CODE}: ${JSON.stringify(idxRslt, null, 2)} `);
  //     //     databaseLocal.find({
  //     //       selector: {
  //     //         $and: [
  //     //           {
  //     //             'data.codigo': {
  //     //               $gte: '001-001-000000000',
  //     //             },
  //     //           },
  //     //           {
  //     //             'data.codigo': {
  //     //               $lt: '999',
  //     //             },
  //     //           },
  //     //         ],
  //     //       },
  //     //       sort: [
  //     //         {
  //     //           'data.codigo': 'desc',
  //     //         },
  //     //       ],
  //     //     })
  //     //       .then(qryRslt => LG.debug(`\nQuery result:\n${JSON.stringify(qryRslt, null, 2)} `))
  //     //       .catch(err => LG.error(`Querying ${IDX_INV_CODE} -- ${err}`));
  //     //   })
  //     //   .catch(err => LG.error(`Building index ${IDX_INV_CODE} -- ${err}`));

  //     // databaseLocal.query(
  //     //   'sequences/last_invoice_id',
  //     //   { descending: true, limit: 1 },
  //     // ).then(last => LG.debug(`\nLAST ID : ${JSON.stringify(last, null, 2)} `));

  //     // databaseLocal.allDocs({
  //     //   include_docs: true,
  //     //   attachments: true,
  //     //   startkey: 'Invoice_1_0000000000000000',
  //     //   endkey: 'Invoice_3',
  //     //   // endkey: 'Invoice_1_0000000000000000',
  //     //   // startkey: 'Invoice_3',
  //     //   // limit: 1,
  //     // })
  //     //   .then(last => LG.debug(`\nLAST INVOICE ::\n${JSON.stringify(last, null, 2)} `));

  //   //   startSecondaryReplications();
  //   // })
  //   // .catch(err => LG.error(`Database replication error ${err}`));
  // .on('error', err => LG.error(`Database replication error ${err}`));

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
