// import { couchPutOpts, couchPayload, scrapeInvoice, tightDate } from '../support/couchdb';
import { couchGetOpts, processYear } from '../support/couchdb';

const years = [ '2016', '2017', '2018', '2019', '2020', '2021' ];

describe('BAPU Scraper', function() {

  beforeEach(function () {

    cy.fixture('../fixtures/couch.json').as('couchData');

    const opts = couchGetOpts(Cypress.env('CH_LATESTINVOICE'));

    cy.log('-------------------');
    cy.log(JSON.stringify(opts, null, 2));
    cy.log('-------------------');

    cy.request(opts)
      .then((r) => {
        // console.log(JSON.stringify(r, null, 2));
        if (r.body.total_rows > 0) return r.body.rows[0].key
                                            .replace(/-/g, '|')
                                            .replace(/ /, '|')
                                            .replace(/:/g, '|')
                                            .split('|');
        return [2018, 12, 31, 0, 0, 0];
      }).as('latestInvoice');
  });

  it('Scrapes BAPU for Invoices', function() {

    // cy.log('DISABLED');

    // cy.get('@couchData').then((couch) => {
    //   cy.log(`Processing from last invoice ${couch.lastInvoice}.`);
    // });

    cy.get('@latestInvoice').then((latest) => {
      cy.log(`Processing from last invoice ${JSON.stringify(latest, null, 2)}.`);
    });

    cy.visit(Cypress.env('ENDPNT'));

    cy.login();

    cy.visit(`${Cypress.env('ENDPNT')}?m=invoice_control`);

    // cy.get('#form-status').select('Pagada Parcial');

    cy.get('@latestInvoice').then((lastAccess) => {
      const d = lastAccess;

      const lastTime = new Date(d[0], parseInt(d[1])  - 1, d[2], d[3], d[4], d[5]);
      let testTime = new Date(2015, 0, 0, 23, 59, 59);

      cy.log('lastTime  & testTime');
      cy.log(lastTime);
      cy.log(testTime);

      const acc = { years: {} };

      years.forEach((year) => {
        testTime = new Date(parseInt(year) + 1, 0, 0, 23, 59, 59);
        processYear({ acc, year, lastTime, testTime });
      });
      cy.log(`Accumulator : ${JSON.stringify(acc, null, 2)}.`);
    });
  });
});
