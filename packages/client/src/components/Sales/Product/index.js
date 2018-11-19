// import createCrudModule, { client } from 'vuex-crud';
import createCrudModule from 'vuex-crud';
import { REST as client } from '@/database/vuejs-pouchdb';

import { store as vuex } from '@/store';

/* eslint-disable no-unused-vars */
import { variablizeTitles } from '@/utils/strings';
import format from '@/utils/format';
/* eslint-enable no-unused-vars */

// import Header from '@/components/Header';
import cfg from '@/config';

import List from './List';
import Product from './Layout';
// import Retrieve from './Retrieve';
import columns from './column_specs';
import { PRODUCTS, PRODUCTS_LIST } from './accessGroups';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console,

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

  // LG(` USING POUCH REST CLIENT ****************************************
  //   vuex
  // `);

  // const vue = vuex._vm; // eslint-disable-line no-underscore-dangle
  // const clnt = vue.$PouchRest;
  // LG(vue.$yourMethod('xyz'));
  // clnt.get('a', 'b').then();

  state: {
    columns,
    enums: {},
    productsMap: {},
    paginator: { s: 1, c: 100 },
  },
  actions: {
    /* eslint-disable no-unused-vars */

    fetchAll: ({ dispatch }) => {
      LG('<<<<<< fetchAll products >>>>>>');
      dispatch('fetchList', { customUrlFnArgs: { s: 1, c: 100 } })
        .then((resp) => {
          window.lgr.info(' * * Fetched products * *');
          window.lgr.debug(`             >>================================================<<
            products response: ${JSON.stringify(resp, null, 2)}
          `);
          // LG(resp.columns);
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
    LG(vuex.state.products.entities[response.data.itemID]);

    const objID = {};
    objID[IDATTRIBUTE] = response.data.itemID;
    return Object.assign({}, response, {
      data: objID, // expecting object with ID
    });
  },

  parseList(response) {
    const productMap = {}; // eslint-disable-line no-unused-vars
    const productArray = [];
    // let productArray = [];

    let data = {}; // eslint-disable-line no-unused-vars
    // let titles = [];
    let meta = [];
    // let enums = [];
    const enums = [];
    if (response.data && response.data[RESOURCE]) {
      /*            ******************** THIS IS THE OLD VERSION ******************* */
      window.lgr.error(`
        ******************** THIS IS THE OLD VERSION *******************
      `);
      /*
            ({
              data,
              titles,
              meta,
              enums,
            } = response.data[RESOURCE]);

            const vars = variablizeTitles(titles);

            window.lgr.warn(`
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Products titles:
      ${JSON.stringify(titles, null, 2)}
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `);

            window.lgr.error(`
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Products vars:
      ${JSON.stringify(vars, null, 2)}
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `);

            productArray = data.map((product) => {
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
              productMap[product.codigo] = product;
              return newProd;
            });
      */
    } else {
      /*            ******************** THIS IS THE NEW VERSION ******************* */
      window.lgr.warn(`||================================================||
        products response: ${JSON.stringify(response, null, 2)}
        products response length: ${response.length}
      `);

      let metaData = { name: 'none' };
      let idx = response.length;
      while (metaData.name === 'none' && idx >= 0) {
        idx -= 1;
        metaData = response[idx].data;
      }

      meta = metaData.columns;
      window.lgr.debug(`products meta data: ${JSON.stringify(metaData, null, 2)}`);
      const vars = variablizeTitles(meta.map(column => column.meta));

      window.lgr.error(`products vars: ${JSON.stringify(vars, null, 2)}`);

      idx = -1;
      response.forEach((item) => {
        idx += 1;

        ({ data } = item);
        const prod = {};
        if (data.idib) {
          if (idx < 4) {
            window.lgr.error(`product nombre: ${data.nombre}`);
            // ${JSON.stringify(newProd[ix], null, 2)} -->> ${col.type}
          }
          meta.forEach((col) => {
            window.lgr.warn(`column idx: ${col.idx} ${col.field}`);
            if (data[col.field]) {
              prod[col.idx] = data[col.field];
              prod[col.field] = data[col.field];
            }
          });
          productMap[data.codigo] = prod;
          productArray.push(prod);
        }
      });

      if (enums.length === -1) {
        return Object.assign({}, response, {
          data: productArray, // expecting array of objects with IDs
          columns: meta,
          enums,
        });
      }
    }

    vuex.dispatch('product/setEnums', enums);
    vuex.dispatch('product/setMap', productMap);

    window.lgr.warn(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Products response:
${JSON.stringify(response, null, 2)}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
    window.lgr.error(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Products productArray:
${JSON.stringify(productArray, null, 2)}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
    window.lgr.warn(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Products meta:
${JSON.stringify(meta, null, 2)}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
    window.lgr.error(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Products enums:
${JSON.stringify(enums, null, 2)}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

    return Object.assign({}, response, {
      data: productArray, // expecting array of objects with IDs
      columns: meta,
      enums,
    });
  },
});
