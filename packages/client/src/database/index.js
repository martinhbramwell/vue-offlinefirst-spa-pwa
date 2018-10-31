import PouchDB from 'pouchdb-browser';
import base64 from 'base-64'; // eslint-disable-line no-unused-vars

// import { dbServerProtocol, dbServerURI, databaseName } from '@/config';
import config from '@/config';
import test from '@/assets/tst';

import replicationIn from './replicationIn'; // eslint-disable-line no-unused-vars
import replicationOut from './replicationOut'; // eslint-disable-line no-unused-vars


const { dbServerProtocol, dbServerURI, databaseName } = config;

const LG = console.log; // eslint-disable-line no-console, no-unused-vars
const LGERR = console.error; // eslint-disable-line no-console, no-unused-vars

LG(`PouchDb configuration...
${JSON.stringify(config, null, 2)}
`);

if (!dbServerProtocol) throw new Error('VuePouchDB Error → remote database server protocol is required!');
if (!dbServerURI) throw new Error('VuePouchDB Error → remote database server URI is required!');
if (!databaseName) throw new Error('VuePouchDB Error → a main database name is required!');

const state = {
  user: {
    name: null,
    password: null,
  },
  dbMgr: 'asdf',
  srvr: {
    dbServerProtocol,
    dbServerURI,
    databaseName,
  },
};

const getters = {
  getUserCredentials: vx => vx.user,
  getDbMgr: vx => vx.dbMgr,
};

const mutations = {
  setUserCredentials(vx, user) {
    window.lgr.debug(`Database (mutation) :: recording new user credentials "${user.name}"`);
    vx.user = user; // eslint-disable-line no-param-reassign
  },

  setDbMgr(vx, pyld) {
    window.lgr.info('Database (mutation) :: recording datbase manager');
    LG(vx.dbMgr);
    vx.dbMgr = pyld; // eslint-disable-line no-param-reassign
    LG(vx.dbMgr);
  },
};

const actions = {
  setUserCredentials(vx, pyld) {
    if (pyld.payload.couchdb) {
      const user = pyld.payload.couchdb;
      window.lgr.info(`Database (action) :: recording new user credentials > ${JSON.stringify(pyld.payload, null, 2)}`);
      LG(user);
      vx.commit('setUserCredentials', user);
    }
  },

  connectToRemoteService(vx, args) {
    LG(`

      Connext to remote service >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    `);
    LG(args);
    LG(vx);

    const { user, srvr, dbMgr } = vx.state;
    dbMgr.setMaxListeners(30);

    /* eslint-disable no-unused-vars */
    const dbName = srvr.databaseName;
    const dbMasterURI = `${srvr.dbServerProtocol}://${user.name}:${user.password}@${srvr.dbServerURI}/${srvr.databaseName}`;
    const dbBulkLoadURI = 'https://yourdb.yourpublic.work/cdb/201810291221.json';

    const dbMaster = new PouchDB(dbMasterURI, { skip_setup: true });
    /* eslint-enable no-unused-vars */

    // const username = 'hasan';
    // const password = '34erDFCV';
    // const creds = base64.encode(`${username}:${password}`);

    // const headers = new Headers();
    // headers.set('Authorization', `Basic ${creds}`);

    // fetch(dbBulkLoadURI, {
    //   method: 'GET',
    //   credentials: 'include',
    //   headers,
    // })
    //   .then((response) => {
    //     LG(response);
    //     return response.json();
    //   });
    // // .then((json) => {
    // //   LG('*************************************************');
    // //   LG(JSON.stringify(json, null, 2));
    // //   LG('*************************************************');
    // // });

    test();


    LG(`

      Loading from ${dbBulkLoadURI}
      Ready for ${dbMasterURI}
    `);


    dbMaster.load(dbBulkLoadURI, {
      proxy: dbMasterURI,
      // // fetch: (url, opts) => {
      // //   opts.headers.set('Authorization', `Basic ${creds}`);
      // //   return PouchDB.fetch(url, opts);
      // // },
    }).then(() => {
      LG(`
        Ready for more.
      `);

      // replicationIn(dbMgr, dbMaster, dbName);
      // replicationOut(dbMgr, dbMaster, dbName);
    }).catch((err) => {
      LG(`
        Awwww FUCK! ${err}
      `);
    });
  },

  rememberDbMgr(vx, args) {
    LG(`

      Remember DB manager >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    `);
    LG(args);
    vx.commit('setDbMgr', args.dbmgr);
  },
};

const padVal = (pad, val) => (pad + val).substring(val.length);

// const tightDate = (rand) => {
const tightDate = () => {
  const d = new Date();
  let dt = '';
  dt += d.getFullYear();
  dt += padVal('00', (1 + d.getMonth()).toString());
  dt += padVal('00', d.getDate().toString());


  dt += padVal('00', d.getHours().toString());
  dt += padVal('00', d.getMinutes().toString());
  dt += padVal('00', d.getSeconds().toString());
  // dt += padVal('00', rand.toString());

  const ret = parseInt(`${dt}`, 10);
  return ret;
};

function unique() {
  const number = tightDate();
  unique.old = (number > unique.old) ? number : unique.old += 1;
  return unique.old;
}
unique.old = 0;


function ID() {
  return unique();
}

export const generateMovementId = (user, spacer = '_') => `${ID()}${spacer}${user.toString().padStart(5, '0')}`;

// export const generateMovementId = (user, rand) => {
//   const tddt = tightDate(rand).toString();
//   LG(`ID request :: ${parseInt(`${user}${tddt}`, 10)}`);
//   LG(`Max safe integer :: ${Number.MAX_SAFE_INTEGER}`);
//   LG(`Unique :: ${ID()}`);
//   // return parseInt(`${user}${tddt}`, 10);
//   return `${user}${ID()}`;
// };

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
// Movement_1_188279331012348
// Movement_1_0000000081392005
// Movement_1_0188279526012348
// Movement_1_0188279527012348
