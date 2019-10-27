const axios = require('axios')

const couchUtils = require('./couchdb/util');

module.exports = {
  init: async () => {
    const opts = couchUtils.couchGetOpts(process.env.CYPRESS_CH_SCRAPERCONTROL);
    // opts.url = `${opts.url}xx`;
    console.log(`-------------------\n${opts.url}\n-------------------`);
    const content = { _id: "00_ClientesTmp", clientes: [], facturas: [] };
    let response = null;
    let revision = null;

    try {
      response = await axios.get(opts.url);
      revision = response.data._rev;
      console.log(` Found it ---> `);
      console.dir(revision);
      content._rev = revision;
    } catch (error) {
      console.log(` NOT Found ---> Creating a new record`);
      // console.error(error);
    }

    try {
      response = await axios.put(opts.url, JSON.stringify(content, null, 2));
      console.log(` Did PUT ---> `);
      console.dir(response.data);
    } catch (error) {
      console.log(` Unable to PUT new record`);
      console.error(error);
    }
    return "Hola";
  },
  save: async (item) => {
    const opts = couchUtils.couchGetOpts(process.env.CYPRESS_CH_SCRAPERCONTROL);
    console.log(`-------------------\n${opts.url}\n-------------------`);

    try {
      let response = await axios.get(opts.url);
      console.log(` Found it ---> `);
      const content = response.data;
      console.dir(content);
      content.clientes.push(item.customerName);
      content.facturas.push(item.serialNumber);

      response = await axios.put(opts.url, JSON.stringify(content, null, 2));
      console.log(` Did PUT ---> `);
      console.dir(response.data);
    } catch (error) {
      console.log(` Unable to PUT new record`);
      console.error(error);
    }
    return "Hola";
  },
  update: async (rec) => {
    const opts = couchUtils.couchGetOpts(process.env.CYPRESS_CH_SCRAPERCONTROL);
    console.log(`couchTools.update() -------------------\n${opts.url}\n-------------------`);

    try {
      response = await axios.put(opts.url, JSON.stringify(rec, null, 2));
      console.log(` Did PUT ---> `);
      console.dir(response.data);
    } catch (error) {
      console.log(` Unable to PUT new record`);
      console.error(error);
    }
    return "Hola";
  },
  get: async (query) => {
    const opts = couchUtils.couchGetOpts(query);
    console.log(`couchTools.get() -------------------\n${opts.url}\n-------------------`);
    try {
      const response = await axios.get(opts.url);
      return response.data;
    } catch (error) {
      console.log(` Unable to GET new record : ${query}`);
      console.error(error);
      return error;
    }
    return [];
  }
};
