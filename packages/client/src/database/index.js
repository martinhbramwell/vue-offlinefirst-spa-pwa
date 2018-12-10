import PouchDB from 'pouchdb-browser';
import axios from 'axios'; // eslint-disable-line no-unused-vars

// import { dbServerProtocol, dbServerURI, databaseName } from '@/config';
import config from '@/config';
import utils from './utils'; // eslint-disable-line no-unused-vars

const { dbServerProtocol, dbServerURI, databaseName } = config;

const LG = console.log; // eslint-disable-line no-unused-vars, no-console
const LGERR = console.error; // eslint-disable-line no-unused-vars, no-console

LG(`PouchDb configuration...
  ${JSON.stringify(config, null, 2)}
`);

if (!dbServerProtocol) throw new Error('VuePouchDB Error → remote database server protocol is required!');
if (!dbServerURI) throw new Error('VuePouchDB Error → remote database server URI is required!');
if (!databaseName) throw new Error('VuePouchDB Error → a main database name is required!');


const getCtgryLoadLevels = (vx) => {
  window.lgr.debug('Getting category load levels');
  const { categoryCounts } = vx.state;
  const categories = Object.keys(categoryCounts);

  let haveLoadedCategories = true;
  categories.forEach((key) => {
    window.lgr.debug(`Category ${key} ${categoryCounts[key].total} ${categoryCounts[key].loaded}`);
    if (categoryCounts[key].total > categoryCounts[key].loaded) haveLoadedCategories = false;
  });
  window.lgr.debug(`Category load levels available? - ${haveLoadedCategories}`);
  if (haveLoadedCategories) {
    window.lgr.debug(`Category counts : ${JSON.stringify(vx.state.categoryCounts, null, 2)}}`);
    vx.commit('setCategoriesLoading', true);
    return;
  }

  window.lgr.debug('Getting category loads state');

  vx.commit('setCategoriesLoading', false);

  const db = vx.getters.getDbMgr;
  const counts = {};
  db.allDocs({ include_docs: true }).then((result) => {
    result.rows.forEach((row) => {
      if (row.doc.data) {
        const { data } = row.doc;
        if (categories.includes(data.type)) {
          counts[data.type] = counts[data.type] ? counts[data.type] += 1 : 1;
          window.lgr.debug(`Counts values :: ${JSON.stringify(counts, null, 2)}`);
        }
      }
    });
    window.lgr.debug(`Counts values :: ${JSON.stringify(counts, null, 2)}`);

    Object.keys(counts).forEach((counter) => {
      window.lgr.debug(`Count ${counter} ${counts[counter]} `);
      vx.commit('setCategoryLoadedCount',
        { key: counter, value: counts[counter] });
    });

    const ct = vx.state.categoryCounts;
    const stt = Object.keys(ct).filter(c => ct[c].total < 1 || ct[c].total > ct[c].loaded);
    if (stt.length < 1) vx.commit('setCategoriesLoading', true);

    window.lgr.debug(`Category counts : ${JSON.stringify(vx.state.categoryCounts, null, 2)}}`);
  }).catch((err) => {
    window.lgr.error(`${err}
      QQQQQQQQQQQQQQQQQQQQ got nothing QQQQQQQQQQQQQQQQQQQQ`);
  });
};

const getCtgryTotals = (vx) => {
  window.lgr.debug('Getting category counts.');
  window.lgr.debug(`Authentication status ${JSON.stringify(vx.rootState.Auth, null, 2)}`);
  if (vx.rootGetters.isAuthenticated < 1) return;

  const { user, srvr, categoryCounts } = vx.state;
  const categories = Object.keys(categoryCounts);

  let haveCategoryTotals = true;
  categories.forEach((key) => {
    window.lgr.debug(`Category ${key} ${categoryCounts[key].total} ${categoryCounts[key].loaded}`);
    if (categoryCounts[key].total < 1) haveCategoryTotals = false;
  });

  window.lgr.debug(`Category totals available? - ${haveCategoryTotals}`);
  if (haveCategoryTotals) {
    getCtgryLoadLevels(vx);
    return;
  }

  vx.commit('setCategoriesLoading', false);

  const dbName = srvr.databaseName;
  const baseURL = `${srvr.dbServerProtocol}://${srvr.dbServerURI}/`;
  const url = `${dbName}/_design/visible/_view`;

  window.lgr.info(`Getting category totals :: ${user.name} ${baseURL}${url}`);

  const promises = [];
  categories.forEach((category) => {
    window.lgr.debug(`
      Getting category count ${baseURL}${url}/count_${category}
      `);
    promises.push(
      axios.get(`${baseURL}${url}/count_${category}`, {
        auth: { username: user.name, password: user.password },
        method: 'get',
      }).then((response) => {
        window.lgr.debug(`
          Response for category count ${baseURL}${url}/count_${category} ::
            ${JSON.stringify(response, null, 2)}
          `);
        if (response.status === 200) {
          if (!response.data) {
            window.lgr.error(`
              Should have data element ${JSON.stringify(response, null, 2)}
              `);
          }
          const count = response.data.rows[0].value;
          window.lgr.debug(`Got '${category}' category count ${JSON.stringify(count, null, 2)}`);
          return { key: category, value: count };
        }
        window.lgr.error(`* ERROR COUNTING PRODUCTS * ${JSON.stringify(response, null, 2)}}`);
        return null;
      }).catch((err) => {
        window.lgr.error(`Axios connexion error :: ${JSON.stringify(err, null, 2)}}`);
      }),
    );
  });

  Promise.all(promises).then((results) => {
    window.lgr.debug(`CATEGORIES: ${JSON.stringify(results, null, 2)}}`);
    const counts = {};
    results.filter(r => r).forEach((r) => {
      counts[r.key] = { total: r.value, loaded: 0 };
    });

    window.lgr.debug(`Items per category : ${JSON.stringify(counts, null, 2)}}`);
    vx.commit('setCategoryCounts', counts);
    window.lgr.debug(`Category counts : ${JSON.stringify(vx.state.categoryCounts, null, 2)}}`);

    getCtgryLoadLevels(vx);
  });
};


const state = {
  user: {
    name: null,
    password: null,
  },
  dbMgr: 'asdf',
  categoryCounts: {
    product: { total: 0, loaded: 0 },
    person: { total: 0, loaded: 0 },
    bottle: { total: 0, loaded: 0 },
    invoice: { total: 0, loaded: 0 },
  },
  categoriesLoading: false,
  srvr: {
    dbServerProtocol,
    dbServerURI,
    databaseName,
  },
};

const getters = {
  getUserCredentials: vx => vx.user,
  getDbMgr: vx => vx.dbMgr,
  getCategoriesLoading: vx => vx.categoriesLoading,
  getCategoryCounts: vx => vx.categoryCounts,
  getCategoryCounters: vx => vx.categoryCounters,
};

const mutations = {
  setUserCredentials(vx, user) {
    window.lgr.debug(`Database (mutation) :: recording new user credentials "${user.name}"`);
    vx.user = user; // eslint-disable-line no-param-reassign
  },
  setDbMgr(vx, pyld) {
    window.lgr.debug('Database (mutation) :: recording database manager ');
    vx.dbMgr = pyld; // eslint-disable-line no-param-reassign
  },
  setCategoriesLoading(vx, pyld) {
    window.lgr.warn(`Database (mutation) :: setting categoriesLoading "${JSON.stringify(pyld, null, 2)}"`);
    vx.categoriesLoading = pyld; // eslint-disable-line no-param-reassign
  },
  setCategoryCounts(vx, pyld) {
    window.lgr.debug(`Database (mutation) :: recording categoryCounts "${JSON.stringify(pyld, null, 2)}"`);
    vx.categoryCounts = pyld; // eslint-disable-line no-param-reassign
  },
  setCategoryLoadedCount(vx, pyld) {
    window.lgr.debug(`Database (mutation) :: recording categoryCount "${JSON.stringify(pyld, null, 2)}"`);
    vx.categoryCounts[pyld.key].loaded = pyld.value; // eslint-disable-line no-param-reassign
    window.lgr.debug(`Database (mutation) :: recorded "${JSON.stringify(vx.categoryCounts, null, 2)}"`);
  },
};

const actions = {
  setUserCredentials(vx, pyld) {
    if (pyld.payload.couchdb) {
      const user = pyld.payload.couchdb;
      window.lgr.debug(`Database (action) :: recording new user credentials > ${JSON.stringify(pyld.payload, null, 2)}`);
      window.lgr.debug(user);
      vx.commit('setUserCredentials', user);
    }
  },
  connectToRemoteService(vx, args) {
    window.lgr.debug(`

      Connext to remote service >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    `);
    window.lgr.debug(args);
    window.lgr.debug(vx);

    const { user, srvr, dbMgr } = vx.state;
    dbMgr.setMaxListeners(Infinity);

    const dbName = srvr.databaseName;
    const dbMasterURI = `${srvr.dbServerProtocol}://${user.name}:${user.password}@${srvr.dbServerURI}/${srvr.databaseName}`;

    const dbMaster = new PouchDB(dbMasterURI, { skip_setup: true });

    const repFromCounts = {};
    const ddocsFromServer = [
      { type: 'view', name: 'visible/compact_invoice' },
      { type: 'view', name: 'visible/compact_bottle' },
      { type: 'view', name: 'visible/compact_person' },
      { type: 'view', name: 'visible/compact_product' },

      // { type: 'filter', name: 'ddocs/this_ddoc' },
    ];
    ddocsFromServer.forEach((ddoc) => {
      const options = {
        live: true,
        retry: true,
      };
      options[ddoc.type] = ddoc.name;
      dbMgr.replicate.from(dbMaster, options)
        .on('change', (info) => {
          window.lgr.info(`${dbName}/${ddoc.name} ***  INCOMING REPLICATION DELTA **** read: ${info.docs_read} wrote: ${info.docs_written}`);
          if (ddoc.name === 'ddocs/this_ddoc') window.lgr.debug(info);

          window.lgr.info(`Replication from: ${info.docs.length} records.`);
          info.docs.forEach((doc) => {
            if (!repFromCounts[doc.data.type]) repFromCounts[doc.data.type] = 0;
            repFromCounts[doc.data.type] += 1;
          });

          Object.keys(repFromCounts).forEach((counter) => {
            const count = repFromCounts[counter];
            window.lgr.debug(`Count ${counter} ${count} `);
            vx.commit('setCategoryLoadedCount',
              { key: counter, value: count });
            const action = `${counter}/setDirtyData`;
            try {
              vx.dispatch(action, count, { root: true });
              window.lgr.debug(`Dispatched ${action} with ${count} for ${counter}.`);
            } catch (err) {
              window.lgr.warn(`Action ${action} not found.`);
            }
          });


          // vx.commit('setCategoryLoadedCount',
          //   { key: doc.data.type, value: repFromCounts[doc.data.type] });

          window.lgr.debug(`'from' counts by type : ${JSON.stringify(repFromCounts, null, 2)}`);
        })
        .on('paused', () => {
          window.lgr.info(`${dbName}/${ddoc.name} **********  INCOMING REPLICATION ON HOLD *********`);
          vx.dispatch('collectCategoryCounts');
          // dbMgr.allDocs({
          //   include_docs: true,
          //   attachments: true,
          // }).then((result) => {
          //   window.lgr.debug(`allDocs fetch result ${JSON.stringify(result, null, 2)}`);
          // }).catch((err) => {
          //   window.lgr.error(`allDocs fetch failure ${err}`);
          // });
        })
        .on('active', () => {
          window.lgr.info(`${dbName}/${ddoc.name} **********  INCOMING REPLICATION RESUMED *********`);
        })
        .on('denied', (info) => {
          window.lgr.info(`${dbName}/${ddoc.name} **********  INCOMING REPLICATION DENIED ********* ${info}`);
        })
        .on('error', err => window.lgr.error(`${dbName}/${ddoc.name} INCOMING REPLICATION FAILURE ************ ${err}`));
    });

    const filterNames = ['ExchangeRequest', 'PersonUpdate'];
    filterNames.forEach((filterName) => {
      LG(` filterName ${filterName}`);
      const replicatorOptions = {
        filterText: filterName,
        dbMaster,
        dbName,
        user,
      };

      utils.replicateOut(dbMgr, replicatorOptions);
    });
  },
  collectCategoryCounts(vx) {
    getCtgryTotals(vx);
  },
  rememberDbMgr(vx, args) {
    window.lgr.debug(`

      Remember DB manager >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      ${JSON.stringify(args, null, 2)}
    `);
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

export const generateRequestId = (user, spacer = '_') => `${ID()}${spacer}${user.toString().padStart(5, '0')}`;

// export const generateRequestId = (user, rand) => {
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
