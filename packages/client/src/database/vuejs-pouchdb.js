import PouchDB from 'pouchdb-browser';
import relater from '@movilizame/relational-pouch';
import finder from 'pouchdb-find';
import debug from 'pouchdb-debug'; // eslint-disable-line no-unused-vars
import liveFinder from 'pouchdb-live-find';

import config from '@/config';
import { store as vuex } from '@/store';
import debouncedRefresh from '@/utils/debouncedRefresh';

const { databaseName } = config;

const LG = console.log; // eslint-disable-line no-unused-vars, no-console
const LGERR = console.error; // eslint-disable-line no-unused-vars, no-console


PouchDB.plugin(relater);
PouchDB.plugin(finder);
PouchDB.plugin(liveFinder);
// PouchDB.plugin(authenticator);
// PouchDB.plugin(debug);
// PouchDB.debug.enable('*');

if (!databaseName) throw new Error('VuePouchDB Error → a main database name is expected !');
// LG(`database is :: ${databaseName}`);
// const dbMasterURI = `${options.dbServerProtocol}://${user.name}:${user.password}@${options.dbServerURI}/${options.databaseName}`;
// LG('dbMasterURI');
// LG(dbMasterURI);

const localDatabase = new PouchDB(databaseName);

// const plugIn = (plugin) => {
//   PouchDB.plugin(plugin);
// };

export const LoaderProgress = {
  spinner: null,
  start: (loader) => {
    if (vuex.getters.isAuthenticated < 1) {
      vuex.commit('dbmgr/setCategoriesLoading', false);
      return;
    }
    const allLoaded = vuex.getters['dbmgr/getCategoriesLoading'];
    if (allLoaded) return;
    LoaderProgress.spinner = loader.open({ container: null });
    window.lgr.debug('Started loader spinner');
  },
  kill: () => {
    const allLoaded = vuex.getters['dbmgr/getCategoriesLoading'];
    window.lgr.debug(`Checking loader spinner :: \n${JSON.stringify(allLoaded, null, 2)}`);
    if (allLoaded) {
      LoaderProgress.spinner.close();
      window.lgr.debug('Killed loader spinner');
    }
  },
};

export const REST = {
  interceptors: {
    request: {
      interceptors: [],
      use: (interceptor) => {
        window.lgr.debug(`
        ??????????????????????????????
          interceptor: ${JSON.stringify(interceptor, null, 2)}
        ??????????????????????????????`);
        this.interceptors.push(interceptor);
      },
    },
  },
  get: (endPoint, parameters) => new Promise((resolve) => {
    window.lgr.debug(`
      endPoint: ${JSON.stringify(endPoint, null, 2)}
      parameters: ${JSON.stringify(parameters, null, 2)}
    `);
    const db = vuex.getters['dbmgr/getDbMgr'];

    db.liveFind({
      aggregate: true,
      selector: parameters.selector,
    })
      .on('update', (update, rows) => {
        debouncedRefresh(parameters.category, update, rows, resolve);
      // // update.action is 'ADD', 'UPDATE', or 'REMOVE'
      // // update also contains id, rev, and doc
      // // aggregate is an array of docs containing the latest state of the query
      // refreshUI(aggregate);
      // // (refreshUI would be a function you write to pipe the changes to your rendering engine)
      })

    // Called when the initial query is complete
      .on('ready', () => {
        LG('Initial query complete.');
      })

    // Called when you invoke `liveFeed.cancel()`
      .on('cancelled', () => {
        LG('LiveFind cancelled.');
      })

    // Called if there is any error
      .on('error', (err) => {
        LG('Oh no!', err);
      // })

      // .then((result) => {
      //   LG(`
      //   Pouch liveFind Result: ${JSON.stringify(result, null, 2)}
      // `);
      // })

      // .catch((err) => {
      //   LG(`
      //   Pouch AllDocs Error: ${JSON.stringify(err, null, 2)}
      // `);
      });
  }),
};


/* eslint-disable max-len */

localDatabase.setSchema([
  {
    singular: 'product',
    plural: 'allProducts',
  },
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

/* eslint-disable no-unused-vars */
/* eslint-enable no-unused-vars */


const PRODUCT_INDEXNAME = 'idxTypeName';
localDatabase.createIndex({
  index: {
    fields: ['data.type', 'data.nombre'],
    name: PRODUCT_INDEXNAME,
    ddoc: 'indexes',
  },
}).then((result) => {
  window.lgr.debug(`New index ${PRODUCT_INDEXNAME} :: ${JSON.stringify(result, null, 2)}`);
}).catch((err) => {
  window.lgr.debug(`Failed to create index ${PRODUCT_INDEXNAME} :: ${JSON.stringify(err, null, 2)}`);
});

const GENERIC_INDEXNAME = 'idxId';
localDatabase.createIndex({
  index: {
    fields: ['id'],
    name: GENERIC_INDEXNAME,
    ddoc: 'indexes',
  },
}).then((result) => {
  window.lgr.debug(`New index ${GENERIC_INDEXNAME} :: ${JSON.stringify(result, null, 2)}`);
}).catch((err) => {
  window.lgr.debug(`Failed to create index ${GENERIC_INDEXNAME} :: ${JSON.stringify(err, null, 2)}`);
});

const BOTTLECODE_INDEXNAME = 'idxTypeCode';
localDatabase.createIndex({
  index: {
    fields: ['data.type', 'data.codigo'],
    name: BOTTLECODE_INDEXNAME,
    ddoc: 'indexes',
  },
}).then((result) => {
  window.lgr.debug(`New index ${BOTTLECODE_INDEXNAME} :: ${JSON.stringify(result, null, 2)}`);
}).catch((err) => {
  window.lgr.debug(`Failed to create index ${BOTTLECODE_INDEXNAME} :: ${JSON.stringify(err, null, 2)}`);
});

const BOTTLEID_INDEXNAME = 'idxTypeId';
localDatabase.createIndex({
  index: {
    fields: ['data.type', 'data.id'],
    name: BOTTLEID_INDEXNAME,
    ddoc: 'indexes',
  },
}).then((result) => {
  window.lgr.debug(`New index ${BOTTLEID_INDEXNAME} :: ${JSON.stringify(result, null, 2)}`);
}).catch((err) => {
  window.lgr.debug(`Failed to create index ${BOTTLEID_INDEXNAME} :: ${JSON.stringify(err, null, 2)}`);
});

const MOVEMENT_INDEXNAME = 'idxTypeInventory';
localDatabase.createIndex({
  index: {
    fields: ['data.type', 'data.inventory'],
    name: MOVEMENT_INDEXNAME,
    ddoc: 'indexes',
  },
}).then((result) => {
  window.lgr.debug(`New index ${MOVEMENT_INDEXNAME} :: ${JSON.stringify(result, null, 2)}`);
}).catch((err) => {
  window.lgr.debug(`Failed to create index ${MOVEMENT_INDEXNAME} :: ${JSON.stringify(err, null, 2)}`);
});

const install = (VueJs) => {
  const Vue = VueJs;


  Vue.pouch = localDatabase;
  Vue.prototype.$pouch = localDatabase;
};

export default {
  install,
  // plugIn,
  PouchDB,
  LoaderProgress,
};
