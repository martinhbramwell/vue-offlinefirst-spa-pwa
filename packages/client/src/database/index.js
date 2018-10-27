import PouchDB from 'pouchdb-browser';

// import { dbServerProtocol, dbServerURI, databaseName } from '@/config';
import config from '@/config';

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

    const dbName = srvr.databaseName;
    const dbMasterURI = `${srvr.dbServerProtocol}://${user.name}:${user.password}@${srvr.dbServerURI}/${srvr.databaseName}`;

    const dbMaster = new PouchDB(dbMasterURI, { skip_setup: true });

    const ddocsFromServer = [
      { type: 'view', name: 'visible/compact_bottle' },
      { type: 'view', name: 'visible/compact_person' },
      { type: 'filter', name: 'ddocs/this_ddoc' },
    ];
    ddocsFromServer.forEach((ddoc) => {
      const options = {
        live: true,
        retry: true,
      };
      options[ddoc.type] = ddoc.name;
      dbMgr.replicate.from(dbMaster, options)
        .on('change', (info) => {
          LG(`${dbName}/${ddoc.name} **********  INCOMING REPLICATION DELTA ********* ${JSON.stringify(info, null, 2)}`);
          if (ddoc.name === 'ddocs/this_ddoc') LG(info);
        })
        .on('paused', () => {
          LG(`${dbName}/${ddoc.name} **********  INCOMING REPLICATION ON HOLD *********`);
          dbMgr.allDocs({
            include_docs: true,
            attachments: true,
          }).then((result) => {
            LG('allDocs fetch result');
            LG(result);
          }).catch((err) => {
            LGERR(`allDocs fetch failure ${err}`);
          });
        })
        .on('active', () => {
          LG(`${dbName}/${ddoc.name} **********  INCOMING REPLICATION RESUMED *********`);
        })
        .on('denied', (info) => {
          LG(`${dbName}/${ddoc.name} **********  INCOMING REPLICATION DENIED ********* ${info}`);
        })
        .on('error', err => LG(`${dbName}/${ddoc.name} INCOMING REPLICATION FAILURE ************ ${err}`));
    });

    // const filter = 'post_processing/by_new_inventory';
    const filterText = 'ExchangeRequest';
    const filter = doc => doc._id.substring(0, 15) === filterText; // eslint-disable-line max-len, no-underscore-dangle
    const options = {
      live: true,
      retry: true,
      filter,
      // query_params: { agent: user.name },
    };
    dbMgr.replicate.to(dbMaster, options)
      .on('change', (info) => {
        LG(`${dbName}/${filterText} **********  OUTGOING REPLICATION DELTA ********* `);
        const shortList = info.change.docs.filter(doc => (!doc.data) || (doc.data.type !== 'person' && doc.data.type !== 'bottle'));
        shortList.forEach((doc) => {
          LG(`DOC :: ${JSON.stringify(doc, null, 2)}`);
        });
      })
      .on('paused', () => {
        LG(`${dbName}/${filterText} **********  OUTGOING REPLICATION ON HOLD ********* ${user.name}`);
        dbMgr.allDocs({
          include_docs: true,
          attachments: true,
        }).then((result) => {
          LG('allDocs fetch result');
          LG(result);
        }).catch((err) => {
          LGERR(`allDocs fetch failure ${err}`);
        });
      })
      .on('active', () => {
        LG(`${dbName}/${filterText} **********  OUTGOING REPLICATION RESUMED *********`);
      })
      .on('denied', (info) => {
        LG(`${dbName}/${filterText} **********  OUTGOING REPLICATION DENIED ********* ${info}`);
      })
      .on('error', err => LG(`${dbName}/${filterText} OUTGOING REPLICATION FAILURE ************ ${err}`));

    // const filter = 'user_specific/by_vendor_agent';
    // dbMgr.sync(dbMaster, {
    //   live: true,
    //   retry: true,
    //   filter,
    // })
    //   .on('change', (repl) => {
    //     LG(`${dbName}/${filter} **********  SYNCING DELTA ********* `);
    //     LG(`Database replication: ${repl.direction} ${repl.change.docs.length} records.`);
    //     LG(repl.change.docs[0].data);
    //     LG(repl);
    //     LG(this);
    //   })
    //   .on('active', () => {
    //     LG(`${dbName}/${filter} **********  SYNCING RESUMED ********* `);
    //   })
    //   .on('paused', () => {
    //     LG(`${dbName}/${filter}  ************  SYNCING ON HOLD *********** `);
    //   })
    //   .on('error', err => LG(`Database error ${err}`));

    // const view = 'persons/minimal_person';
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
