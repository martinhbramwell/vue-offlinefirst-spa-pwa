import PouchDB from 'pouchdb';
import relater from 'relational-pouch';
import finder from 'pouchdb-find';

import adptrMemory from 'pouchdb-adapter-memory';

import supervisor from '../supervisor';

import { logger as LG } from '../utils';
import query from '../utils/query'; // eslint-disable-line no-unused-vars
// import testMango from '../../test/mango'; // eslint-disable-line no-unused-vars


const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const runInMemory = false;
const adapter = runInMemory ? 'memory' : null;
const lclDb = runInMemory ? 'theDB' : process.env.LOCAL_DB;
const rmtDb = process.env.REMOTE_DB;
const rmtDbHost = process.env.COUCH_HOST;

// LG.verbose(`UTILS : ${JSON.stringify(logger, null, 2)}`)
LG.info(`Logs written to ${process.env.LOG_DIR}`);
LG.info(`Local :: ${lclDb}`);
LG.info(`Remote :: ${rmtDb}`);

PouchDB.plugin(finder);
PouchDB.plugin(relater);
PouchDB.plugin(adptrMemory);

const userId = process.env.COUCH_ADMIN;

export const databaseRemote = new PouchDB(rmtDb);
export const databaseLocal = new PouchDB(lclDb, { adapter });

LG.info(` ***  User Agent *** ${userId}`);

const { requestsHandler, changesProcessor } = supervisor; // eslint-disable-line no-unused-vars

databaseLocal.changes({
  since: 'now',
  live: true,
  include_docs: true,
}).on('change', (change) => {
  changesProcessor(databaseLocal, change);
  // LG.info(`\n@@@@@@@@@@@@@\n${JSON.stringify(change, null, 2)}\n@@@@@@@@@@@@@`);
}).on('complete', (info) => {
  LG.info(`\n#############\n${JSON.stringify(info, null, 2)}\n#############`);
}).on('error', (err) => {
  LG.error(`Failure of changes monitor ${err}`);
});


/*  MAKE FINDER INDEXES */
const makeFinderIndexes = async (db) => {
  const ddoc = 'lclDDoc';
  const idxPbyN = 'personsByName';
  try {
    await db.createIndex({
      index: {
        fields: ['data.type', 'data.nombre'],
        name: idxPbyN,
        type: 'json',
        ddoc,
      },
    });
  } catch (err) {
    LG.error(` Failed to create ${idxPbyN} index ${err}`);
  }

  // const idxPbyPS = 'invoicesByProcessStage';
  // try {
  //   await db.createIndex({
  //     index: {
  //       fields: [
  //         'type',
  //         // 'data.codigo',
  //         '_attachments.invoiceXml',
  //         '_attachments.invoiceSigned',
  //         // '_attachments.invoiceAuthorized',
  //         // '_attachments.invoiceNotAuthorized',
  //         // '_attachments.invoiceRejected',
  //       ],
  //       name: idxPbyPS,
  //       type: 'json',
  //       ddoc,
  //     },
  //   });
  //   LG.verbose(` Created '${idxPbyPS}' index`);
  // } catch (err) {
  //   LG.error(` Failed to create ${idxPbyPS} index ${err}`);
  // }
};
makeFinderIndexes(databaseLocal);

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
        if (name === 'post_processing/by_test') {
          LG.info(`${lclDb} ${name}  *** ${label} sync DELTA *** `);
        }
        const dir = response.direction;
        const { docs } = response.change;
        LG.info(`${lclDb} ${name} *** ${label} ${dir} sync delta *** `);
        LG.info(`Database replication : ${dir}ed ${docs.length} record${docs.length === 1 ? '' : 's'}.`);
        docs.forEach((doc) => {
          if (!replicatedEntityCounters[doc.data.type]) {
            replicatedEntityCounters[doc.data.type] = 0;
          }
          replicatedEntityCounters[doc.data.type] += 1;
        });

        // LG.debug(`The request(s) : ${JSON.stringify(docs, null, 2)}`);
      })
      .on('active', () => {
        if (name === 'post_processing/by_test') {
          LG.info(`${lclDb} ${name} *** ${label} sync resumed *** `);
        }
      })
      .on('paused', () => {
        if (name === 'post_processing/by_test') {
          LG.info(`${lclDb} ${name}  *** ${label} sync on hold *** `);
        }
        action(db);
      })
      .on('denied', (info) => {
        LG.warn(`${lclDb}/${name} *** ${label} sync denied *** ${info}`);
      })
      .on('error', err => LG.error(`Database error ${err}`));
  };

  // const nullAction = () => { LG.debug(' no special action required '); };
  const nullAction = () => {};

  const coreReplicationFilter = {
    name: 'core_data/by_entities',
    label: 'CORE DATA ENTITIES',
    action: nullAction,
  };

  const requestsReplicationFilter = {
    name: 'post_processing/by_request',
    label: 'CHANGE REQUEST',
    action: requestsHandler,
  };

  const invoicesReplicationFilter = {
    name: 'post_processing/by_invoice',
    label: 'INVOICES',
    action: nullAction,
  };

  const personsReplicationFilter = {
    name: 'post_processing/by_person',
    label: 'PERSONS',
    action: nullAction,
  };

  const specialReplicationFilter = {
    name: 'post_processing/special',
    label: 'SPECIAL',
    action: nullAction,
  };

  // const testReplicationFilter = {
  //   name: 'post_processing/by_test',
  //   label: 'TESTS',
  //   action: nullAction,
  // };


  const replicationFilters = [
    coreReplicationFilter,
    requestsReplicationFilter,
    invoicesReplicationFilter,
    personsReplicationFilter,
    specialReplicationFilter,
    // testReplicationFilter,
  ];

  let secondaryReplicationsWaiting = true;
  const startSecondaryReplications = () => { // eslint-disable-line no-unused-vars
    if (secondaryReplicationsWaiting) {
      LG.info('\n--------------------\nStart Secondary Replicators\n---------------------');
      replicationFilters.forEach((filter) => {
        launchSyncs(databaseLocal, filter);
      });
      secondaryReplicationsWaiting = false;
    }
  };

  const filterName = 'core_data/by_entities';
  const filterLabel = 'CORE DATA ENTITIES';

  databaseLocal.setMaxListeners(Infinity);

  LG.info('\n--------------------\nStart Primary Replicators\n--------------------');
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
};

/*                                      SAVED FOR A RAINY DAY
const options = { db: databaseLocal };
testMango(options);
*/
