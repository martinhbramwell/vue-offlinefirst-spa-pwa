import PouchDB from 'pouchdb-browser';
import relater from '@movilizame/relational-pouch';
import finder from 'pouchdb-find';
import loader from 'pouchdb-load';

import debug from 'pouchdb-debug'; // eslint-disable-line no-unused-vars
import liveFinder from 'pouchdb-live-find';

import config from '@/config';

const { databaseName } = config;

const LG = console.log; // eslint-disable-line no-unused-vars, no-console
const LGERR = console.error; // eslint-disable-line no-unused-vars, no-console

const plugIn = (plugin) => {
  PouchDB.plugin(plugin);
};

// const user = {
//   name: '12354',
//   password: '34erDFCV',
// };
// const cred = `${user.name}:${user.password}`;
// const ajaxOpts = {
//   ajax: {
//     headers: {
//       Authorization: `Basic ${window.btoa(cred)}`,
//     },
//   },
// };

  /* eslint-disable max-len */

const install = (VueJs) => {
  const Vue = VueJs;
  if (!databaseName) throw new Error('VuePouchDB Error → a main database name is expected !');
  // LG(`database is :: ${databaseName}`);
  // const dbMasterURI = `${options.dbServerProtocol}://${user.name}:${user.password}@${options.dbServerURI}/${options.databaseName}`;
  // LG('dbMasterURI');
  // LG(dbMasterURI);

  PouchDB.plugin(relater);
  PouchDB.plugin(finder);
  PouchDB.plugin(loader);
  PouchDB.plugin(liveFinder);
  // PouchDB.plugin(authenticator);
  // PouchDB.plugin(debug);
  // PouchDB.debug.enable('*');

  const localDatabase = new PouchDB(databaseName);

  // const dbMaster = new PouchDB(dbMasterURI, { skip_setup: true });
  // // dbMaster.login(user.name, user.password, ajaxOpts)
  // //   .then(() => dbMaster.allDocs())
  // //   .then((docs) => { LG('Logged in :: '); LG(docs); })
  // //   .catch((error) => { LGERR('Log in error ::'); LGERR(error); });

  // localDatabase.sync(dbMaster, { live: true })
  //   .on('change', (repl) => {
  //     LG(`Database replication: ${repl.direction} ${repl.change.docs.length} records.`);
  //     LG(repl);
  //   })
  //   .on('error', err => LG(`Database synchronization error ${err}`));


  Vue.pouch = localDatabase;
  Vue.prototype.$pouch = localDatabase;


  localDatabase.setSchema([
    {
      singular: 'aBottle',
      plural: 'allBottles',
      relations: {
        ultimo: { belongsTo: 'aPerson' },
        // movements: { hasMany: 'Movement' },
      },
    },
    {
      singular: 'aPerson',
      plural: 'allPersons',
      relations: {
        bottles: { hasMany: 'aBottle' },
        // movements: { hasMany: 'Movement' },
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
  ]);


  let INDEXNAME = null;


  INDEXNAME = 'idxPersonName';
  localDatabase.createIndex({
    index: {
      fields: ['data.type', 'data.nombre'],
      name: INDEXNAME,
    },
  }).then((result) => {
    LG(`New index ${INDEXNAME} :: ${result}`);
    LG(result);
  }).catch((err) => {
    LG(`Failed to create index ${INDEXNAME} :: ${err}`);
    LG(err);
  });

  INDEXNAME = 'idxBottleCode';
  localDatabase.createIndex({
    index: {
      fields: ['data.type', 'data.codigo'],
      name: INDEXNAME,
    },
  }).then((result) => {
    LG(`New index ${INDEXNAME} :: ${result}`);
    LG(result);
  }).catch((err) => {
    LG(`Failed to create index ${INDEXNAME} :: ${err}`);
    LG(err);
  });

  INDEXNAME = 'idxBottleId';
  localDatabase.createIndex({
    index: {
      fields: ['data.type', 'data.id'],
      name: INDEXNAME,
    },
  }).then((result) => {
    LG(`New index ${INDEXNAME} :: ${result}`);
    LG(result);
  }).catch((err) => {
    LG(`Failed to create index ${INDEXNAME} :: ${err}`);
    LG(err);
  });

  INDEXNAME = 'idxMovement';
  localDatabase.createIndex({
    index: {
      fields: ['data.type', 'data.inventory'],
      name: INDEXNAME,
    },
  }).then((result) => {
    LG(`New index ${INDEXNAME} :: ${result}`);
    LG(result);
  }).catch((err) => {
    LG(`Failed to create index ${INDEXNAME} :: ${err}`);
    LG(err);
  });

  /* ************************************************************************ */
};

export default {
  install,
  plugIn,
  PouchDB,
};
