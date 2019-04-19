// import { couchPutOpts, couchPayload, scrapeInvoice, tightDate } from '../support/couchdb';
import { couchGetOpts, processYear } from '../support/couchdb';

const years = [ '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023' ];

const getLastInvoiceDate = (startDate) => {
  let opts = couchGetOpts(Cypress.env('CH_SPECIALFIX'));

  cy.log('-------------------');
  cy.log(JSON.stringify(opts, null, 2));
  cy.log('-------------------');

  cy.request(opts)
    .then((r) => {
      try {
        console.log(JSON.stringify(r.body.rows[0].value.invoices, null, 2));
        // return false;
        return r.body.rows[0].value.invoices;
        // return [
        //     {
        //       "date": "2019-04-09 13:45:13",
        //       "number": "10946"
        //     },
        //     {
        //       "date": "2019-04-09 15:53:10",
        //       "number": "10964"
        //     },
        //     {
        //       "date": "2019-04-12 12:27:17",
        //       "number": "10975"
        //     }
        //   ];
      } catch {
        return false;
      }
    }).as('specials');

  opts = couchGetOpts(Cypress.env('CH_LATESTINVOICE'));

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
      // return [2019, 1, 31, 14, 6, 30];
      return startDate;
    }).as('latestInvoice');
}

const startProcessing = (single) => {
/*
      cy.log('DISABLED');
*/
  // cy.visit(Cypress.env('ENDPNT'));

  // cy.login();

  // cy.visit(`${Cypress.env('ENDPNT')}?m=invoice_control`);

  // cy.get('#form-status').select('Pagada Parcial');

  cy.get('@latestInvoice').then((lastAccess) => {
    const d = lastAccess;
    cy.log(`Last access ${JSON.stringify(d, null, 2)}.`);

    const lastTime = new Date(d[0], parseInt(d[1])  - 1, d[2], d[3], d[4], d[5]);
    let testTime = new Date(2015, 0, 0, 23, 59, 59);

    console.log('lastTime  & testTime');
    console.log(lastTime);
    console.log(testTime);

    const acc = { years: {} };

    years.forEach((year) => {
      testTime = new Date(parseInt(year) + 1, 0, 0, 23, 59, 59);
      processYear({ acc, year, lastTime, testTime, single });
    });
    cy.log(`Accumulator : ${JSON.stringify(acc, null, 2)}.`);
  });

}

const splitDate = (aDate) => {
  let D = new Date(aDate);
  D.setSeconds(D.getSeconds() - 1);

  cy.log(`Date :: ${D}.`);

  cy.wrap([
    D.getFullYear(),
    D.getMonth() + 1,
    D.getDate(),
    D.getHours(),
    D.getMinutes(),
    D.getSeconds(),
  ]).as('latestInvoice');
}


describe('BAPU Scraper', function() {

  beforeEach(function () {

    cy.fixture('../fixtures/couch.json').as('couchData');

    const startDateStr = Cypress.env('CH_FIRSTINVOICE');
    const startDate = startDateStr.split(' ').map(x=>+x);

    getLastInvoiceDate(startDate);

  });

  it('Scrapes BAPU for Invoices', function() {

    cy.visit(Cypress.env('ENDPNT'));

    cy.login();

    cy.visit(`${Cypress.env('ENDPNT')}?m=invoice_control`);

    cy.get('@specials').then((specialCases) => {
      debugger;
      if (specialCases && specialCases.length > 0) {
        cy.wrap(specialCases).each((aCase) => {
          cy.log(`Got special :: ${JSON.stringify(aCase, null, 2)}.`);

          splitDate(aCase.date);
          startProcessing(aCase.number);

        });
      } else {
        cy.get('@latestInvoice').then((latest) => {
          cy.log(`Processing from last invoice ${JSON.stringify(latest, null, 2)}.`);
        });

        startProcessing();
      }

    });
  });
});
