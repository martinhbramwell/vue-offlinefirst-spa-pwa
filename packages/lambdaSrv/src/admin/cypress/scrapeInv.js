import cypress from 'cypress'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils'; // eslint-disable-line no-unused-vars

const sanityCheck = 'cypress/integration/SanityCheck.js';
const scrapePersons = 'cypress/integration/GetPersons.js'; // eslint-disable-line no-unused-vars
const scrapeInvoices = 'cypress/integration/GetInvoices.js'; // eslint-disable-line no-unused-vars

const jsonStart = '{ "starts": "OK"';
const jsonArrayStart = '"ping": [';
const jsonArrayEnd = ']';
const jsonEnd = '}';

export default async (req, res) => {
  const path = process.cwd();
  res.setHeader('Content-Type', 'application/json');
  res.write(jsonStart);

  let timer = null;
  try {
    /* eslint-disable max-len */
    res.write(`, ${jsonArrayStart} "${(new Date()).toLocaleTimeString()}"`);
    const resultSanityCheck = await cypress.run({ spec: `${path}/${sanityCheck}` });
    LG.info(`Sanity Check results :\n${JSON.stringify(resultSanityCheck.config.env, null, 3)}`);
    res.write(', "Sanity"');

    timer = setInterval(() => {
      res.write(`, "${(new Date()).toLocaleTimeString()}"`);
    }, 5000);

    const resultPersons = await cypress.run({ spec: `${path}/${scrapePersons}` });
    LG.info(`Persons pages scraper results:\n${JSON.stringify(resultPersons.config.env, null, 3)}`);
    res.write(', "Persons"');

    const resultInvoices = await cypress.run({ spec: `${path}/${scrapeInvoices}` });
    LG.info(`Invoices page scraper results:\n${JSON.stringify(resultInvoices.config.env, null, 3)}`);
    res.write(', "Invoices"');
    /* eslint-enable max-len */
  } catch (err) {
    LG.error(err);
    res.write(`, "Async functional test failed ${err}.`);
  }

  clearInterval(timer);
  res.write(`${jsonArrayEnd}${jsonEnd}`);
  res.end();
  LG.info(`Awaiting ended on path ${path}`);
};
