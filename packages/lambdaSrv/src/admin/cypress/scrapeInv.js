import cypress from 'cypress';
import fs from 'fs';

import { logger as LG } from '../../utils'; // eslint-disable-line no-unused-vars

const sanityCheck = 'cypress/integration/SanityCheck.js'; // eslint-disable-line no-unused-vars
const scrapePersons = 'cypress/integration/GetPersons.js';
const scrapeInvoices = 'cypress/integration/GetInvoices.js';

const jsonStart = '{ "starts": "OK"';
const jsonEnd = '}';

const pages = { thisPage: 0 };
const path = process.cwd();
const controlFile = `${path}/cypress/nextPage.json`;
let resultSanityCheck = null; // eslint-disable-line no-unused-vars, prefer-const
let resultPersons = null;
export default async (req, res) => {
  LG.info('Start screen scrapers');
  res.setHeader('Content-Type', 'application/json');
  res.write(jsonStart);

  try {
    /* eslint-disable max-len */

    if (process.env.CYPRESS_SKIP_PERSONS && process.env.CYPRESS_SKIP_PERSONS === 'true') {
      const message = 'Will not scrape persons data';
      LG.info(message);
      res.write(`, "${message}"`);
    } else {
      for (let pg = 8; pg > 0; pg -= 1) {
        pages.thisPage = pg;
        fs.writeFileSync(controlFile, JSON.stringify(pages, null, 3));
        resultPersons = await cypress.run({ spec: `${path}/${scrapePersons}` }); // eslint-disable-line no-await-in-loop
        LG.info(`Persons pages scraper results:\n${JSON.stringify(resultPersons.config.env, null, 3)}`);
        res.write(', "Persons"');
      }
    }

    const resultInvoices = await cypress.run({ spec: `${path}/${scrapeInvoices}` });
    LG.info(`Invoices page scraper results:\n${JSON.stringify(resultInvoices.config.env, null, 3)}`);
    res.write(', "Invoices"');

    /* eslint-enable max-len */
  } catch (err) {
    LG.error(err);
    res.write(`, "Screen scraping failed ${err}.`);
  }

  res.write(`${jsonEnd}`);
  res.end();
  LG.info(`Awaiting ended on path ${path}`);
};
