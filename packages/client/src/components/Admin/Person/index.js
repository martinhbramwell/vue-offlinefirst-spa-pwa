// import createCrudModule, { client } from 'vuex-crud';
import createCrudModule from 'vuex-crud';
import { REST as client } from '@/database/vuejs-pouchdb';

import { store as vuex } from '@/store';

import { variablizeTitles } from '@/utils/strings';
import format from '@/utils/format'; // eslint-disable-line no-unused-vars

import cfg from '@/config';

import List from './List';
import layout from './Layout';
// import Retrieve from './Retrieve';
import columns from './column_specs';
import { PERSON, PERSONS, PERSONS_LIST } from './accessGroups'; // eslint-disable-line no-unused-vars

// import { Resources } from '@/accessControl';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console,

const local = [{
  name: PERSONS_LIST,
  path: 'list',
  components: {
    personsList: List,
  },
}];

const children = []
  .concat(local);

export const routes = [
  {
    name: PERSONS,
    path: 'persons',
    component: layout,
    children,
  },
];

const IDATTRIBUTE = 'codigo';
const RESOURCE = 'person';
export const store = createCrudModule({
  resource: RESOURCE, // The name of your CRUD resource (mandatory)
  idAttribute: IDATTRIBUTE, // What should be used as ID

  client,
  state: {
    columns,

    enums: {},
    personsMap: {},
    paginator: { s: 1, c: 100 },
    dirtyData: -1,
  },
  actions: {
    fetchAll: ({ dispatch }) => {
      LG('<<<<<< fetchAll persons >>>>>>');
      /* eslint-disable no-underscore-dangle */
      const parameters = {
        customUrlFnArgs: store.state.paginator,
        config: {
          category: 'Persons',
          selector: {
            $and: [
              { _id: { $gte: 'aPerson_1_0000000000000000' } },
              { _id: { $lt: 'aPerson_3_0000000000000000' } },
            ],
          },
        },
      };
      /* eslint-enable no-underscore-dangle */
      dispatch('fetchList', parameters)
        .then((resp) => {
          window.lgr.info(' * * Fetched persons * *');
          window.lgr.debug(`             >>================================================<<
            persons response: ${JSON.stringify(resp, null, 2)}
          `);
          dispatch('setColumns', (resp.columns));
          store.state.dirtyData = -1;
          // dispatch('setDirtyData', -1);
        })
        .catch((e) => {
          window.lgr.error(`*** Error while fetching persons :: ${e.message} ***`);
          if (e.message.endsWith('401')) {
            dispatch('handle401', null, { root: true });
          } else {
            dispatch('notifyUser', {
              txt: `Error while fetching persons :: ${e.message}`,
              lvl: 'is-danger',
            }, { root: true });
          }
        });
    },
    setColumns: ({ commit }, cols) => {
      window.lgr.debug(`Person.index --> actions.setColumns ${JSON.stringify(cols, null, 2)}`);
      commit('tableColumns', cols);
    },
    setEnums: ({ commit }, enums) => {
      window.lgr.debug('Person.index --> actions.setEnums');
      commit('enums', enums);
    },
    setMap: ({ commit }, prodMap) => {
      window.lgr.debug('Person.index --> actions.setProdMap');
      commit('prodMap', prodMap);
    },
    setDirtyData: ({ commit }, dataState) => {
      window.lgr.debug('Person.index --> actions.setDirtyData');
      commit('dirtyData', dataState);
    },
  },

  getters: {
    getColumns: vx => vx.columns,
    getPersons: vx => vx.list,
    getEnums: vx => vx.enums,
    getDirtyData: vx => vx.dirtyData,
    getPersonsMap: vx => vx.personsMap,
    getPaginator: vx => vx.paginator,
    getPerson: vx => id => vx.entities[id],
  },

  mutations: {
    /* eslint-disable no-param-reassign */
    persons: (vx, payload) => {
      LG(`${payload.id} = ${payload.data.codigo}/${payload.data.nombre}`);
      vx.entities[payload.id] = payload.data;
    },
    enums: (vx, enums) => {
      vx.enums = enums;
    },
    dirtyData: (vx, dataState) => {
      vx.dirtyData = dataState;
    },
    prodMap: (vx, personsMap) => {
      vx.personsMap = personsMap;
    },
    tableColumns: (vx, cols) => {
      window.lgr.debug('Person.index --> mutation.tableColumns');
      vx.columns = cols;
    },
    /* eslint-enable no-param-reassign */
  },

  onFetchListSuccess(state, response) { // eslint-disable-line no-unused-vars
    window.lgr.error(`
      Parse list success handler >>>>>>>>>>>>>>>>>>>>>>>>>>
      ${JSON.stringify(state.dirtyData, null, 2)}
    `);
    state.dirtyData = -1; // eslint-disable-line no-param-reassign
    // LG(state);
    // if (state.dirtyData > 0) {
    //   window.lgr.info(`Person/index.js -->
    // Store changed again ${JSON.stringify(state.dirtyData, null, 2)}`);
    //   // state.dispatch('fetchAll');
    //   // this.setDirtyData(0);
    // }
  },

  customUrlFn(_id, _pgntr) {
    LG(`config server --> ${cfg.server}`);
    LG(`client --> ${JSON.stringify(client, null, 2)}`);
    // LG(this.resource);

    LG(`using paginator --> ${_pgntr}`);
    const id = _id ? `/${_id}` : '';
    const pgntr = _pgntr ? `s=${_pgntr.s}&c=${_pgntr.c}` : 's=0&c=0';
    LG(`using customUrlFn( ${id}, ${pgntr} )`);
    LG(`URI :: ${cfg.server}/api/${RESOURCE}${id}?${pgntr}`);
    const URI = `${cfg.server}/api/${RESOURCE}${id}?${pgntr}`;
    return URI;
  },

  parseSingle(response) {
    LG('parseSingle');
    LG(response.data);
    LG(vuex.state.persons.entities[response.data.itemID]);

    const objID = {};
    objID[IDATTRIBUTE] = response.data.itemID;
    return Object.assign({}, response, {
      data: objID, // expecting object with ID
    });
  },

  parseList(response) {
    const personMap = {}; // eslint-disable-line no-unused-vars
    const personArray = [];
    // let personArray = [];

    let data = {}; // eslint-disable-line no-unused-vars
    // let titles = [];
    let meta = [];
    // let enums = [];
    const enums = [];

    /*            ******************** THIS IS THE NEW VERSION ******************* */
    window.lgr.debug(`||================================================||
      persons response: ${JSON.stringify(response, null, 2)}
      persons response length: ${response.length}
    `);

    let metaData = { name: 'none' };
    let idx = response.length;
    while (metaData.name === 'none' && idx >= 0) {
      idx -= 1;
      metaData = response[idx].data;
    }

    meta = metaData.columns;
    window.lgr.debug(`persons meta data: ${JSON.stringify(metaData, null, 2)}`);
    const vars = variablizeTitles(meta.map(column => column.meta));

    window.lgr.debug(`persons vars: ${JSON.stringify(vars, null, 2)}`);

    idx = -1;
    response.forEach((item) => {
      idx += 1;

      ({ data } = item);
      const prod = {};
      if (data.idib) {
        // if (idx < 4) {
        //   window.lgr.error(`person nombre: ${data.nombre}`);
        //   // ${JSON.stringify(newProd[ix], null, 2)} -->> ${col.type}
        // }
        meta.forEach((col) => {
          window.lgr.debug(`column idx: ${col.idx} ${col.field}`);
          if (data[col.field]) {
            const attr = format[col.type](data[col.field]);
            prod[col.idx] = attr;
            prod[col.field] = attr;
          }
        });
        personMap[data.codigo] = prod;
        Object.keys(prod).forEach((attr) => {
          prod[attr] = prod[attr].str || prod[attr];
        });
        personArray.push(prod);
      }
    });

    // if (enums.length === -1) {
    //   return Object.assign({}, response, {
    //     data: personArray, // expecting array of objects with IDs
    //     columns: meta,
    //     enums,
    //   });
    // }

    vuex.dispatch('person/setEnums', enums);
    vuex.dispatch('person/setMap', personMap);

    //     window.lgr.warn(`
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Persons response:
    // ${JSON.stringify(response, null, 2)}
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // `);
    //     window.lgr.error(`
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Persons personArray:
    // ${JSON.stringify(personArray, null, 2)}
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // `);
    //     window.lgr.warn(`
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Persons meta:
    // ${JSON.stringify(meta, null, 2)}
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // `);
    //     window.lgr.error(`
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Persons enums:
    // ${JSON.stringify(enums, null, 2)}
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // `);

    return Object.assign({}, response, {
      data: personArray, // expecting array of objects with IDs
      columns: meta,
      enums,
    });
  },
});
