import createCrudModule, { client } from 'vuex-crud';
import { store as vuex } from '@/store';

import { variablizeTitles } from '@/utils/strings';

import { Resources } from '@/accessControl';


import cfg from '@/config';
import format from '@/utils/format';

import List from './List';

import Person from './Layout';
import Retrieve from './Retrieve';
import columns from './column_specs';

import { PERSON, PERSONS } from './accessGroups';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const local = [{
  path: 'list',
  name: 'persons/list',
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
    component: Person,
    children,
  },
  {
    name: PERSON,
    path: 'person/:id',
    component: Retrieve,
  },
];

client.interceptors.request.use((_payload) => {
  const payload = _payload;
  const token = window.ls.get(cfg.tokenName);

  if (token != null) {
    payload.headers.Authorization = `JWT ${token}`;
  }

  return payload;
}, (error) => {
  LG('request failed');
  return Promise.reject(error);
});


const formatters = {
  processPermissions(pkg) {
    try {
      return JSON.parse(pkg.replace(/'/g, '"'));
    } catch (e) {
      return pkg;
    }
  },
};

const IDATTRIBUTE = 'codigo';
const RESOURCE = 'person';
export const store = createCrudModule({
  resource: RESOURCE, // The name of your CRUD resource (mandatory)
  idAttribute: IDATTRIBUTE, // What should be used as ID
  urlRoot: `${cfg.server}`, // The url to fetch the resource person?s=1&c=3
  client,
  state: {
    columns,
    currentTab: 0,
    enums: {},
    paginator: { s: 1, c: 1000 },
  },
  actions: {
    /* eslint-disable no-unused-vars */
    fetchAll: ({ dispatch }) => {
      LG('<<<<<< fetchAll >>>>>>');
      dispatch('fetchList', { customUrlFnArgs: store.state.paginator })
        .then((resp) => {
          LG(' * * Fetched persons * *');
          LG(resp.columns);
          dispatch('setColumns', (resp.columns));
        })
        .catch((e) => {
          LG(`*** Error while fetching persons :: >${e.message}<***`);
          LG(e.message);
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
      window.lgr.debug('Person.index --> actions.setColumns');
      // LG(cols);
      commit('tableColumns', cols);
    },
    setCurrentTab: ({ commit }, numTab) => {
      window.lgr.debug(`Person.index --> actions.setCurrentTab -- ${numTab}`);
      commit('tab', numTab);
    },
    setEnums: ({ commit }, enums) => {
      window.lgr.debug('Person.index --> actions.setEnums');
      commit('enums', enums);
    },
    updLocal: ({ commit }, record) => {
      LG('uuuuuuu Update local record uuuuuuuuuu');
      LG(`${record.data.mode} ${record.data.store} ${record.id}`);
      LG(record.data.data);
      commit('person', { id: record.id, data: record.data.data });
    },
    newLocal: ({ dispatch }, record) => {
      LG('uuuuuuu Append new local record uuuuuuuuuu');
      LG(`${record.data.mode} ${record.data.store}`);
    },
    saveForm: ({ dispatch }, _form) => {
      window.lgr.info('Person.index --> actions.saveForm');
      const model = _form;
      const pkge = {};

      model.retencion = _form.retencion ? 'si' : 'no';
      model.distribuidor = _form.distribuidor ? 'si' : 'no';

      LG('unununu save form ununununun');
      const permissions = {};
      Resources.map((rsrc) => {
        LG(`${rsrc} => ${model[rsrc]}`);
        permissions[rsrc] = model[rsrc];
        delete model[rsrc];
        return permissions[rsrc];
      });
      model.permissions = JSON.stringify(permissions).split('"').join("'");

      LG('model');
      LG(model);
      if (_form.codigo) {
        pkge.id = model.codigo;
        pkge.data = {
          mode: 'patch',
          data: {
            key_column: 'codigo',
            data: model,
          },
          store: 'person',
        };
        dispatch('update', pkge);
        // dispatch('updLocal', pkge);
        LG('store');
        LG(store);
      } else {
        delete model.codigo;
        pkge.data = { mode: 'post', data: model, store: 'person' };
        dispatch('newLocal', pkge);
        dispatch('create', pkge);
      }
    },
    backToListTab: ({ getters, dispatch }) => {
      vuex.dispatch('person/fetchList', { customUrlFnArgs: getters.getPaginator });
      vuex.dispatch('person/setCurrentTab', 0);
    },
    /* eslint-enable no-unused-vars */
  },

  getters: {
    getCurrentTab: vx => vx.currentTab,
    getColumns: vx => vx.columns,
    getPersons: vx => vx.list,
    getEnums: vx => vx.enums,
    getPaginator: vx => vx.paginator,
    getPerson: vx => id => vx.entities[id],
  },

  mutations: {
    /* eslint-disable no-param-reassign */
    tab: (vx, numTab) => {
      window.lgr.debug(`Person.index --> mutations.tab -- ${numTab}`);
      vx.currentTab = numTab;
    },
    person: (vx, payload) => {
      LG(`${payload.id} = ${payload.data.codigo}/${payload.data.nombre}`);
      vx.entities[payload.id] = payload.data;
    },
    enums: (vx, enums) => {
      vx.enums = enums;
    },
    tableColumns: (vx, cols) => {
      window.lgr.debug('Person.index --> mutation.tableColumns');
      vx.columns = cols;
    },
    /* eslint-enable no-param-reassign */
  },

  customUrlFn(_id, _pgntr) {
    LG(cfg.server);
    // LG(this.resource);

    LG(`using paginator --> ${_pgntr}`);
    const id = _id ? `/${_id}` : '';
    const pgntr = _pgntr ? `s=${_pgntr.s}&c=${_pgntr.c}` : 's=0&c=0';
    LG(`using customUrlFn( ${id}, ${pgntr} )`);
    LG(`URI :: ${cfg.server}/api/${RESOURCE}${id}?${pgntr}`);
    const URI = `${cfg.server}/api/${RESOURCE}${id}?${pgntr}`;
    return URI;
  },

  onCreateSuccess() {
    vuex.dispatch('person/backToListTab');
    window.lgr.info('Person.index --> mutation.onCreateSuccess OK!');
  },

  onUpdateSuccess() {
    vuex.dispatch('person/backToListTab');
    window.lgr.info('Person.index --> mutation.onUpdateSuccess OK!');
  },

  parseSingle(response) {
    LG('parseSingle');
    LG(response.data);
    LG(vuex.state.person.entities[response.data.itemID]);

    const objID = {};
    objID[IDATTRIBUTE] = response.data.itemID;
    return Object.assign({}, response, {
      data: objID, // expecting object with ID
    });
  },

  parseList(response) {
    const {
      data,
      titles,
      meta,
      enums,
    } = response.data[RESOURCE];

    const vars = variablizeTitles(titles);

    const result = data.map((_person, idx) => {
      const person = _person;
      const mapping = {};
      meta.forEach((col, ix) => {
        if (idx === 3) {
          // LG(` ?? ${col.field}`);
          // LG(` ?? ${person[ix]}`);
          // LG(` ==== ${format[col.type](person[ix])}`);
        }
        person[ix] = format[col.type](
          person[ix],
          {
            JSON1: { fn: formatters.processPermissions, vl: person[ix] },
          },
        );
      });

      person.forEach((vl, ix) => {
        // LG(`  ${vars[ix]} -->> ${vl} `);
        mapping[vars[ix]] = vl;
      });

      return mapping;
    });

    // LG(' * * Parsed persons data * * ');
    // LG('result');
    // LG(result);
    vuex.dispatch('person/setEnums', enums);
    return Object.assign({}, response, {
      data: result, // expecting array of objects with IDs
      columns: meta,
      enums,
    });
  },
});
