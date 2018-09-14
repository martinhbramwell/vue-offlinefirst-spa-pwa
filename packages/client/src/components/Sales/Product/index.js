import createCrudModule, { client } from 'vuex-crud';
import { store as vuex } from '@/store';

import { variablizeTitles } from '@/utils/strings';
import format from '@/utils/format';


// import Header from '@/components/Header';
import cfg from '@/config';

import List from './List';
import Product from './Layout';
// import Retrieve from './Retrieve';
import columns from './column_specs';
import { PRODUCTS, PRODUCTS_LIST } from './accessGroups';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const local = [{
  name: PRODUCTS_LIST,
  path: 'list',
  components: {
    productsList: List,
  },
}];

const children = []
  .concat(local);

export const routes = [
  {
    name: PRODUCTS,
    path: 'products',
    component: Product,
    children,
  },
];

const IDATTRIBUTE = 'codigo';
const RESOURCE = 'product';
export const store = createCrudModule({
  resource: RESOURCE, // The name of your CRUD resource (mandatory)
  idAttribute: IDATTRIBUTE, // What should be used as ID
  urlRoot: `${cfg.server}/api/${RESOURCE}`, // The url to fetch the resource
  client,

  state: {
    columns,
    enums: {},
    productsMap: {},
    paginator: { s: 1, c: 100 },
  },
  actions: {
    /* eslint-disable no-unused-vars */

    fetchAll: ({ dispatch }) => {
      LG('<<<<<< fetchAll >>>>>>');
      dispatch('fetchList', { customUrlFnArgs: { s: 1, c: 100 } })
        .then((resp) => {
          LG(' * * Fetched products * *');
          LG(resp.columns);
          dispatch('setColumns', (resp.columns));
        })
        .catch((e) => {
          LG(`*** Error while fetching products :: ${e}***`);
          LG(e.message);
          if (e.message.endsWith('401')) {
            dispatch('handle401', null, { root: true });
          } else {
            dispatch('notifyUser', {
              txt: `Error while fetching products :: ${e.message}`,
              lvl: 'is-danger',
            }, { root: true });
          }
        });
    },
    setColumns: ({ commit }, cols) => {
      window.lgr.info('Product.index --> actions.setColumns');
      LG(cols);
      commit('tableColumns', cols);
    },
    setEnums: ({ commit }, enums) => {
      window.lgr.info('Product.index --> actions.setEnums');
      commit('enums', enums);
    },
    setMap: ({ commit }, prodMap) => {
      window.lgr.info('Product.index --> actions.setProdMap');
      commit('prodMap', prodMap);
    },
    /* eslint-enable no-unused-vars */
  },

  getters: {
    getColumns: vx => vx.columns,
    getProducts: vx => vx.list,
    getEnums: vx => vx.enums,
    getProductsMap: vx => vx.productsMap,
    getPaginator: vx => vx.paginator,
    getProduct: vx => id => vx.entities[id],
  },

  mutations: {
    /* eslint-disable no-param-reassign */
    products: (vx, payload) => {
      LG(`${payload.id} = ${payload.data.codigo}/${payload.data.nombre}`);
      vx.entities[payload.id] = payload.data;
    },
    enums: (vx, enums) => {
      vx.enums = enums;
    },
    prodMap: (vx, productsMap) => {
      vx.productsMap = productsMap;
    },
    tableColumns: (vx, cols) => {
      window.lgr.debug('Product.index --> mutation.tableColumns');
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

  parseSingle(response) {
    LG('parseSingle');
    LG(response.data);
    LG(vuex.state.products.entities[response.data.itemID]);

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

    const prodMap = {};
    const result = data.map((product) => {
      const newProd = product;
      meta.forEach((col, ix) => {
        newProd[ix] = format[col.type](newProd[ix]);
        // LG(`  ${newProd[ix]} -->> ${col.type} `);
      });
      newProd.forEach((field, ix) => {
        // LG(`  ${vars[ix]} -->> ${field} `);
        // if (vars[ix] === 'retencion' || vars[ix] === 'distribuidor') {
        //   newProd[vars[ix]] = field === 'si';
        // } else if (vars[ix] === 'permissions') {
        //   newProd[vars[ix]] = field ? JSON.parse(field.replace(/'/g, '"')) : '';
        // } else {
        //   newProd[vars[ix]] = field;
        // }
        newProd[vars[ix]] = field;
        return field;
      });
      prodMap[product.codigo] = product;
      return newProd;
    });
    // LG(' * * Parsed products data * * * * * * * * * * * * * * * ');
    // LG('prodMap');
    // LG(prodMap);
    vuex.dispatch('product/setEnums', enums);
    vuex.dispatch('product/setMap', prodMap);
    return Object.assign({}, response, {
      data: result, // expecting array of objects with IDs
      columns: meta,
      enums,
    });
  },

});
