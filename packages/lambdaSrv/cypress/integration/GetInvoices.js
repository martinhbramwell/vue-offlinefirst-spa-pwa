// import { couchPutOpts, couchPayload, scrapeInvoice, tightDate } from '../support/couchdb';
import { couchGetOpts, processYear } from '../support/couchdb';

const years = [ '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023' ];

const getContext = (startDate) => {
  let opts = couchGetOpts(Cypress.env('CH_SCRAPERCONTROL'));

  cy.task('consoleLogger', `\n\n\n###### BAPU Scraper --> getContext()
    CH_SCRAPERCONTROL :: ${Cypress.env('CH_SCRAPERCONTROL')}
    opts :: ${JSON.stringify(opts, null, 2)}`);
  cy.request(opts)
    .then((r) => {
      try {
        return r.body;
      } catch {
        return false;
      }
    }).as('context');

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

const startProcessing = (args) => {
/*
      cy.log('DISABLED');
*/
  // cy.visit(Cypress.env('ENDPNT'));

  // cy.login();

  // cy.visit(`${Cypress.env('ENDPNT')}?m=invoice_control`);

  // cy.get('#form-status').select('Pagada Parcial');

  // cy.task('consoleLogger', `\n###### Start processing ${JSON.stringify(args, null, 2)}.`);
  const { skim, single } = args;

  cy.get('@latestInvoice').then((lastAccess) => {
    const d = lastAccess;
    cy.log(`Last access ${JSON.stringify(d, null, 2)}.`);

    let lastTime = new Date(d[0], parseInt(d[1])  - 1, d[2], d[3], d[4], d[5]);
    let testTime = new Date(2019, 8, 20, 18, 9, 30);

    // cy.task('consoleLogger', `\n\n### START TIME ###   ${lastTime}\n\n`);
    // lastTime = testTime;
    // cy.task('consoleLogger', `\n\n###### FAKE START TIME !!!! ########\n     ${lastTime}.\n\####################\n\n`);

    const acc = { years: {} };
    debugger;

    if (skim) {
      cy.task('initCouchClientList');
    }

    years.forEach((year) => {
      testTime = new Date(parseInt(year) + 1, 0, 0, 23, 59, 59);
      processYear({ acc, year, lastTime, testTime, single, skim });
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

    cy.task('consoleLogger', `\n\n\n###### BAPU Scraper --> beforeEach()`);
    cy.fixture('../fixtures/couch.json').as('couchData');

    const startDateStr = Cypress.env('CH_FIRSTINVOICE');
    const startDate = startDateStr.split(' ').map(x=>+x);

    getContext(startDate);

  });

  it('Scrapes BAPU for Invoices', function() {

    cy.visit(Cypress.env('ENDPNT'));

    cy.login();

    cy.visit(`${Cypress.env('ENDPNT')}?m=invoice_control`);

    cy.get('@context').then((context) => {
      // debugger;
      cy.task('consoleLogger', `\n###### Context : ${JSON.stringify(context, null, 2)}.`);
      const { skim, invoices: specialCases } = context;
      if (specialCases && specialCases.length > 0) {
        cy.task('consoleLogger', `\n###### Handling special cases ${JSON.stringify(specialCases, null, 2)}.`);
        cy.wrap(specialCases).each((aCase) => {
          cy.log(`Got special :: ${JSON.stringify(aCase, null, 2)}.`);

          splitDate(aCase.date);
          startProcessing({ skim, single: aCase.number });

        });
      } else {
        cy.get('@latestInvoice').then((dt) => {
          const type = skim ? 'Listing' : 'Processing';
          cy.task('consoleLogger', `\n###### ${type} from last invoice :: "${dt[0]}-${dt[1]}-${dt[2]} ${dt[3]}:${dt[4]}".`);
        });

        startProcessing({ skim });
      }

    });
  });
});
