import createCrudModule, { client } from 'vuex-crud';

import { store as vuex } from '@/store';
import { store as person } from '@/components/Admin/Person';
import { store as product } from '@/components/Sales/Product';

import { variablizeTitles } from '@/utils/strings';

// import { Resources } from '@/accessControl';


// import Header from '@/components/Header';
import cfg from '@/config';
import format from '@/utils/format';

import List from './List';
import Test from './Test';
// import Create from './Create';
import Bottle from './Layout';
import Retrieve from './Retrieve';
import columns from './column_specs';

import { BOTTLES, BOTTLE, BOTTLES_LIST, BOTTLES_TEST } from './accessGroups';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const local = [
  {
    name: BOTTLES_LIST,
    path: 'list',
    components: {
      bottlesList: List,
    },
  },
];

const children = []
  .concat(local);

export const routes = [
  {
    name: BOTTLES,
    path: 'bottles',
    component: Bottle,
    children,
  },
  {
    name: BOTTLE,
    path: 'bottle/:id',
    component: Retrieve,
  },
  {
    name: BOTTLES_TEST,
    path: 'bottles/test',
    component: Test,
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
  processPersonFK(fkPerson) {
    const someone = person.state.entities[fkPerson];
    if (someone) return someone.nombre;
    return `Usuario #${fkPerson}`;
  },

  processDetailsJSON(_detail) {
    if (!product.state.entities) return _detail;
    if (Object.keys(product.state.entities).length < 1) return _detail;
    // LG(`product.state.entities.length = ${Object.keys(product.state.entities).length}`);
    try {
      return JSON
        .parse(_detail.replace(/'/g, '"')).details
        .filter(d => d[0] > 0)
        .map(d => [
          product.state.entities[d[0]], // product
          d[1], // quantity
          d[2], // discount percentage of normal price, eg .85 = 15% discount
        ]);
    } catch (e) {
      return _detail;
    }
  },
};

const IDATTRIBUTE = 'codigo';
const RESOURCE = 'bottle';
export const store = createCrudModule({
  resource: RESOURCE, // The name of your CRUD resource (mandatory)
  idAttribute: IDATTRIBUTE, // What should be used as ID
  // urlRoot: `${cfg.server}/api/${RESOURCE}`, // The url to fetch the resource
  urlRoot: `${cfg.server}`, // The url to fetch the resource bottle?s=1&c=3
  client,
  state: {
    columns,
    currentTab: 0,
    enums: {},
    paginator: { s: 1, c: 10000 },
    formRows: {
      row: [
        // { code: 5000, qty: 2 }, { code: 5001, qty: 4 },
        // { code: 999, qty: 2 },
      ],
    },
    // formVals: {
    //   row: [
    //     { code: 5000, qty: 2 }, { code: 5001, qty: 4 },
    //     { code: 999.0, qty: 2 },
    //   ],
    // },
    // formRows: { row: [{ code: -1, qty: -1 }] },
  },
  actions: {
    /* eslint-disable no-unused-vars */
    // fetchAll: ({ dispatch }) => {
    //   LG('<<<<<< fetchAll >>>>>>');
    //   dispatch('fetchList', { customUrlFnArgs: store.state.paginator })
    //     .then((resp) => {
    //       LG(' * * Fetched bottles * *');
    //       LG(resp.columns);
    //       dispatch('setColumns', (resp.columns));
    //     })
    //     .catch((e) => {
    //       LG(`*** Error while fetching bottles :: >${e.message}<***`);
    //       LG(e.message);
    //       if (e.message.endsWith('401')) {
    //         dispatch('handle401', null, { root: true });
    //       } else {
    //         dispatch('notifyUser', {
    //           txt: `Error fetching bottles :: ${e.message}`,
    //           lvl: 'is-danger',
    //         }, { root: true });
    //       }
    //     });
    // },

    setColumns: ({ commit }, cols) => {
      window.lgr.info('Bottle.index --> actions.setColumns');
      LG(cols);
      commit('tableColumns', cols);
    },
    setCurrentTab: ({ commit }, numTab) => {
      window.lgr.info(`Bottle.index --> actions.setCurrentTab -- ${numTab}`);
      commit('tab', numTab);
    },
    setEnums: ({ commit }, enums) => {
      window.lgr.info('Bottle.index --> actions.setEnums');
      commit('enums', enums);
    },
    updLocal: ({ commit }, record) => {
      LG('uuuuuuu Update local record uuuuuuuuuu');
      LG(`${record.data.mode} ${record.data.store} ${record.id}`);
      LG(record.data.data);
      commit('bottle', { id: record.id, data: record.data.data });
    },
    newLocal: ({ dispatch }, record) => {
      LG('uuuuuuu Append new local record uuuuuuuuuu');
      LG(`${record.data.mode} ${record.data.store}`);
    },
    saveRow: (ctx, _rowSpec) => {
      LG(`

        Saving row......................`);
      const item = ctx.rootGetters['product/getProduct'](_rowSpec.values.code);

      LG(item);
      LG(_rowSpec.values);
      ctx.commit('appendItemRow', _rowSpec.values);
    },
    saveForm: ({ dispatch }, _form) => {
      window.lgr.info('Bottle.index --> actions.saveForm');
      LG('unununu save form ununununun');
      LG(_form);
      LG(this);
      // LG('_form.summation.discountPct');
      // LG(_form.summation.discountPct);
      const details = _form.items.map(item => [
        item.codigo,
        parseInt(item.cantidad, 10),
        item.discount.raw,
      ]);

      const pkge = {
        data: {
          mode: 'post',
          store: 'bottle',
          data: {
            fecha: format.date(_form.BottleDate),
            estado: 'REG',
            codigo_cliente: _form.summation.person,
            distribuidor: _form.summation.distributor,
            descuento_especial: format.percent(_form.summation.discountPct / 100).raw,
            lista_de_items: JSON.stringify({ details }).split('"').join("'"),
            subtotal_iva_12: format.usd(_form.summation.iva12).raw,
            subtotal_iva_0: format.usd(_form.summation.iva0).raw,
            subtotal_descontado: format.usd(_form.summation.valor).raw,
            total_calculado: format.usd(_form.summation.total).raw,
            retenido: format.usd(_form.summation.retention).raw,
            monto_final: format.usd(_form.summation.final).raw,
            total_cobrado: 0.00,
          },
        },
      };
      LG('@@@@@@@@@@ pkge @@@@@@@@');
      LG(pkge);
      dispatch('newLocal', pkge);
      dispatch('create', pkge);
    },
    backToListTab: ({ getters, dispatch }) => {
      vuex.dispatch('bottle/fetchList', { customUrlFnArgs: getters.getPaginator });
      vuex.dispatch('bottle/setCurrentTab', 0);
    },
    /* eslint-enable no-unused-vars */
  },

  getters: {
    getCurrentTab: vx => vx.currentTab,
    getColumns: vx => vx.columns,
    getBottles: vx => vx.list,
    getEnums: vx => vx.enums,
    getPaginator: vx => vx.paginator,
    getBottle: vx => id => vx.entities[id],
  },

  mutations: {
    /* eslint-disable no-param-reassign */
    tab: (vx, numTab) => {
      window.lgr.debug(`Bottle.index --> mutations.tab -- ${numTab}`);
      vx.currentTab = numTab;
    },
    bottle: (vx, payload) => {
      LG(`${payload.id} = ${payload.data.codigo}/${payload.data.nombre}`);
      vx.entities[payload.id] = payload.data;
    },
    appendItemRow: (vx, _row) => {
      if (!vx.formRows.row || !vx.formRows.row[0] || vx.formRows.row[0].code < 0) {
        vx.formRows.row = [];
      }
      vx.formRows.row.push(_row);
    },
    enums: (vx, enums) => {
      vx.enums = enums;
    },
    tableColumns: (vx, cols) => {
      window.lgr.debug('Bottle.index --> mutation.tableColumns');
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
    vuex.dispatch('bottle/backToListTab');
    window.lgr.info('Bottle.index --> mutation.onCreateSuccess OK!');
  },

  onUpdateSuccess() {
    vuex.dispatch('bottle/backToListTab');
    window.lgr.info('Bottle.index --> mutation.onUpdateSuccess OK!');
  },

  parseSingle(response) {
    LG('parseSingle');
    LG(response.data);
    LG(vuex.state.bottle.entities[response.data.itemID]);

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

    const result = data.map((_bottle, idx) => {
      const bottle = _bottle;
      const mapping = {};
      if (idx === 486) {
        // LG(bottle);
      }
      meta.forEach((col, ix) => {
        // if (idx > 485) {
        //   LG(` ?? ${col.field}`);
        //   LG(` ?? ${bottle[ix]}`);
        //   LG(` ==== ${format[col.type](bottle[ix])}`);
        // }
        bottle[ix] = format[col.type](
          bottle[ix],
          {
            foreignKey1: { fn: formatters.processPersonFK, vl: bottle[ix] },
            JSON1: { fn: formatters.processDetailsJSON, vl: bottle[ix] },
          },
        );
      });

      bottle.forEach((vl, ix) => {
        // LG(`  ${vars[ix]} -->> ${vl} `);
        mapping[vars[ix]] = vl;
      });

      return mapping;
    });
    LG(' * * Parsed bottles data * * ');
    // LG('store');
    // LG(store);
    LG('result');
    LG(result);
    // LG('meta');
    // LG(meta);
    // LG('enums');
    // LG(enums);
    vuex.dispatch('bottle/setEnums', enums.StatusLookup);
    LG(' - - - - - - - - - -  Parsed bottle list  - - - - - - - - - - ');
    return Object.assign({}, response, {
      data: result, // expecting array of objects with IDs
      columns: meta,
      enums: typeof enums,
    });
  },
});
