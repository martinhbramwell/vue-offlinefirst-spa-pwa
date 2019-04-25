import cypress from 'cypress';
import fs from 'fs';

import { logger as LG } from '../../utils'; // eslint-disable-line no-unused-vars
import { databaseLocal } from '../../database';

import { processVoids } from '../reprocessVoids';

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

const setSpecialFix = async (Fix) => {
  const fix = Fix;
  let resp = null;
  try {
    resp = await databaseLocal.get('00_SpecialFix');
  } catch (err) {
    if (err.message !== 'missing') LG.error(`>${err.message}<`);
  }
  if (resp && resp._rev) fix._rev = resp._rev; // eslint-disable-line no-underscore-dangle
  LG.info(JSON.stringify(fix, null, 2));
  try {
    await databaseLocal.put(fix);
  } catch (err) {
    LG.error(`Failed write to '00_SpecialFix' :: >${err.message}<`);
  }
};


export default async (req, res) => {
  LG.info('Start screen scrapers');
  res.setHeader('Content-Type', 'application/json');
  res.write(jsonStart);

  try {
    /* eslint-disable max-len */

    setSpecialFix({ _id: '00_SpecialFix', invoices: [] });

    if (process.env.CYPRESS_SKIP_PERSONS && process.env.CYPRESS_SKIP_PERSONS === 'true') {
      const message = 'Will not scrape persons data';
      LG.info(message);
      res.write(`, "msg": "${message}"`);
    } else {
      for (let pg = 8; pg > 0; pg -= 1) {
        pages.thisPage = pg;
        fs.writeFileSync(controlFile, JSON.stringify(pages, null, 3));
        resultPersons = await cypress.run({ spec: `${path}/${scrapePersons}` }); // eslint-disable-line no-await-in-loop
        LG.info(`Persons pages scraper results:\n${JSON.stringify(resultPersons.config.env, null, 3)}`);
        res.write(', "type": Persons"');
      }
    }

    if (process.env.CYPRESS_SKIP_INVOICES && process.env.CYPRESS_SKIP_INVOICES === 'true') {
      const message = 'Will not scrape invoice data';
      LG.info(message);
      res.write(', "type": "message"');
    } else {
      const resultInvoices = await cypress.run({ spec: `${path}/${scrapeInvoices}` });
      LG.info(`Invoices page scraper results:\n${JSON.stringify(resultInvoices.config.env, null, 3)}`);
      res.write(', "type": "Invoices"');
    }

    /* eslint-enable max-len */
  } catch (err) {
    LG.error(err);
    res.write(`, "Screen scraping failed ${err}.`);
  }

  try {
    const result = await databaseLocal.allDocs({ // eslint-disable-line no-unused-vars
      include_docs: true,
      attachments: true,
      startkey: 'Invoice',
      endkey: 'Invoice_2',
    });
    const { rows } = result;
    const count = rows.length;
    // LG.info(JSON.stringify(rows[0].doc.data.seqib, null, 2));
    const first = parseInt(rows[0].doc.data.seqib.toString().substr(-5), 10);
    // LG.info(JSON.stringify(rows[count - 1].doc.data.seqib, null, 2));
    const last = parseInt(rows[count - 1].doc.data.seqib.toString().substr(-5), 10);
    const expected = last - first + 1;
    const missing = count - expected;

    LG.info(`Got ${count} docs. First ${first}. Last ${last}.`);
    LG.info(`Expected count ${expected}. Diffrence? ${missing}`);

    if (missing) {
      const missed = [];

      let previous = 0;
      let previousData = {};

      let current = first - 1;
      let data = {};
      rows.forEach((row) => {
        previousData = data;
        data = row.doc.data; // eslint-disable-line prefer-destructuring
        previous = current;
        current = parseInt(data.seqib.toString().substr(-5), 10);
        if (current === 1 + previous) return;
        LG.info(current);
        const theDate = new Date(previousData.fecha);
        theDate.setSeconds(theDate.getSeconds() + 1);
        missed.push({
          date: theDate,
          number: previous + 1,
        });
      });
      LG.info(JSON.stringify(missed, null, 2));

      setSpecialFix({ _id: '00_SpecialFix', invoices: missed });
      const resultInvoices = await cypress.run({ spec: `${path}/${scrapeInvoices}` });
      LG.info(`Invoices page scraper results:\n${JSON.stringify(resultInvoices.config.env, null, 3)}`);
      res.write(', "type": "Invoices"');
    }
  } catch (err) {
    LG.error(err);
  }

  res.write(`${jsonEnd}`);
  res.end();
  LG.info(`Awaiting ended on path ${path}`);
  processVoids([]);
};
