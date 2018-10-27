import PouchDB from 'pouchdb-browser';
import relater from '@movilizame/relational-pouch';
import finder from 'pouchdb-find';
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

  // /* eslint-disable no-unused-vars */

  // const randomIntFromInterval = (min, max) => Math.floor((Math.random() * (max - (min + 1))) + min);
  // const fillRange = (bgn, end) => Array(end - (bgn + 1)).fill().map((item, idx) => bgn + idx);
  // const newID = () => {
  //   const d = new Date();
  //   return parseInt(`${1 + d.getMonth()}${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}`, 10);
  // };


  // const firstPerson = 12346;
  // const lastPerson = 12366;
  // const persons = fillRange(firstPerson, lastPerson);


  // LG('---------- Saving movement --------');

  // localDatabase.rel.find('aPerson', persons)
  //   .then((prsns) => {
  //     LG('---------- Got Vendor & Buyer --------');
  //     const vendor = { p: null, c: 0 };
  //     const buyer = { p: null, c: 99999999 };
  //     prsns.allPersons.forEach((prsn) => {
  //       const bottleCount = prsn.bottles.length;
  //       LG(`(${prsn.id}): ${prsn.nombre}. Dist: ${prsn.distribuidor}. Bottles: ${bottleCount}`);
  //       if (bottleCount > vendor.c) {
  //         vendor.c = bottleCount;
  //         vendor.p = prsn;
  //       }
  //       if (bottleCount < buyer.c) {
  //         buyer.c = bottleCount;
  //         buyer.p = prsn;
  //       }
  //     });
  //     const numBottles = randomIntFromInterval(1, 1 + vendor.c);
  //     LG(`numBottles = ${numBottles} of ${vendor.c}`);

  //     let bottlesToMove = [];
  //     const stock = vendor.p.bottles;
  //     LG('stock');
  //     LG(stock);
  //     for (let idx = 0; idx < numBottles; idx += 1) {
  //       bottlesToMove.push(stock[randomIntFromInterval(1, 1 + numBottles)]);
  //     }
  //     LG('bottlesToMove');
  //     LG(bottlesToMove);
  //     bottlesToMove = [...new Set(bottlesToMove)];
  //     LG('bottlesToMove');
  //     LG(bottlesToMove);
  //     let vendorBottles = prsns.allBottles.filter(bottle => bottle.id > 0);
  //     vendorBottles = vendorBottles.filter(bottle => bottlesToMove.includes(bottle.id));
  //     vendorBottles.forEach((bottle) => {
  //       const idx = stock.indexOf(bottle.id);
  //       stock.splice(idx, 1);
  //       buyer.p.bottles.push(bottle.id);
  //     });
  //     return { vendor, buyer, vendorBottles };
  //   })
  //   .then((ctx) => {
  //     LG('ctx');
  //     LG(ctx);
  //     if (ctx.vendorBottles.length < 1) return;

  //     LG(`---------- Save movement of vendor ${ctx.vendor.p}--------`);
  //     localDatabase.rel.save('Movement', {
  //       id: newID(),
  //       vendor: ctx.vendor.p,
  //       buyer: ctx.buyer.p,
  //       bottles: ctx.vendorBottles,
  //       inOut: 'sale',
  //     })
  //       .then((mvmnt) => {
  //         LG('---------- Saved movement --------');
  //         LG(mvmnt);

  //         ctx.vendorBottles.forEach((btl) => {
  //           const bottle = btl;
  //           bottle.movements.push(mvmnt.Movements[0].id);
  //           bottle.ultimo = mvmnt.Movements[0].buyer.id;
  //           localDatabase.rel.save('aBottle', bottle);
  //         });
  //         localDatabase.rel.save('aPerson', mvmnt.Movements[0].buyer);
  //         localDatabase.rel.save('aPerson', mvmnt.Movements[0].vendor);
  //         LG(`Movement #${mvmnt.Movements[0].id}: bottles: [${ctx.vendorBottles.map(b => b.id)}]
  // from ${mvmnt.Movements[0].vendor.nombre}
  // to ${mvmnt.Movements[0].buyer.nombre}`);
  //       });
  //   });

  // /* eslint-enable no-unused-vars */


  let INDEXNAME = null;

  // INDEXNAME = 'idxBottleCode';
  // localDatabase.createIndex({
  //   index: {
  //     fields: ['data.type', 'data.codigo'],
  //     name: INDEXNAME,
  //   },
  // }).then((result) => {
  //   LG(`New index ${INDEXNAME} :: ${result}`);
  //   LG(result);
  // }).catch((err) => {
  //   LG(`Failed to create index ${INDEXNAME} :: ${err}`);
  //   LG(err);
  // });

  // INDEXNAME = 'idxBottlePerson';
  // localDatabase.createIndex({
  //   index: {
  //     fields: ['data.aPerson', '_id'],
  //     name: INDEXNAME,
  //   },
  // }).then((result) => {
  //   LG(`New index ${INDEXNAME} :: ${result}`);
  //   LG(result);
  // }).catch((err) => {
  //   LG(`Failed to create index ${INDEXNAME} :: ${err}`);
  //   LG(err);
  // });

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

//   const movesDB = 'bottle_movements1';
//   const movesDatabaseLocal = new PouchDB(movesDB);
//   const movesDatabaseRemote = new PouchDB(`https://12354:34erDFCV@yourdb.yourpublic.work/${movesDB}`);

//   /*
//     {
//       "_id": "org.couchdb.user:12354",
//       "name": "12354",
//       "password": "34erDFCV",
//       "roles": ["read/write"],
//       "type": "user"
//     }
//   */

//   movesDatabaseLocal.sync(movesDatabaseRemote, {
//     live: true,
//     retry: true,
//     filter: 'user_specific/by_vendor_agent',
//   })
//     .on('change', (repl) => {
//       LG(`${movesDB} **********  REPLICATION DELTA ********* `);
//       LG(`Database replication: ${repl.direction} ${repl.change.docs.length} records.`);
//       LG(repl.change.docs[0].data);
//       LG(repl);
//       LG(this);
//     })
//     .on('active', () => {
//       LG(`${movesDB} **********  REPLICATION RESUMED ********* `);
//     })
//     .on('paused', () => {
//       LG(`${movesDB}  ************  SYNCING ON HOLD *********** `);
//     })
//     .on('error', err => LG(`Database error ${err}`));


//   Vue.pouch = localDatabase;
//   Vue.prototype.$pouch = localDatabase;
};

export default {
  install,
  plugIn,
  PouchDB,
};
