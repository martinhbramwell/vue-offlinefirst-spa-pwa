import { couchGetOpts } from '../support/couchdb/utils';

describe('BAPU Scraper', function() {

  it('Checks for environment variables', function() {

    cy.readFile('./cypress/nextPage.json').then((text) => {
      const { thisPage } = text;
      const CHK = Cypress.env('CH_LATESTINVOICE');
      cy.wrap(CHK).should('eq', '_design/bapu/_view/latestInvoice?stable=true&update=true&descending=true&limit=1');
      cy.log(`Next page ${thisPage}`);

      let req = { someCrap: 'fasdfasdf'};
      let opts = Object.assign(couchGetOpts(CHK), { body: req });

      cy.log('-------------------');
      cy.log(JSON.stringify(opts, null, 2));
      cy.log('-------------------');

      cy.request(opts).then(r => r).as('latestInvoice');
      cy.get('@latestInvoice').then((latest) => {
        cy.log(`Processing from last invoice ${JSON.stringify(latest.body.rows[0], null, 2)}.`);
      });

    });
  });
});
