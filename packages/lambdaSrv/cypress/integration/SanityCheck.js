describe('BAPU Scraper', function() {

  it('Checks for environment variables', function() {

    const CHK = Cypress.env('CH_LATESTINVOICE');
    cy.wrap(CHK).should('eq', '_design/bapu/_view/latestInvoice?stable=true&update=true&descending=true&limit=1');
    cy.log(`Latest invoice query test ...\n${CHK}`);

    // cy.readFile('./cypress/nextPage.json').then((text) => {
    //   const { thisPage } = text;
    //   const CHK = Cypress.env('CH_LATESTINVOICE');
    //   cy.wrap(CHK).should('eq', '_design/bapu/_view/latestInvoice?stable=true&update=true&descending=true&limit=1');
    //   cy.log(`Next page ${thisPage}`);
    // });
  });
});
