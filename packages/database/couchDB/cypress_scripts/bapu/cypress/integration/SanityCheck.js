describe('BAPU Scraper', function() {

  it('Checks for environment variables', function() {
    const CHK = Cypress.env('CH_LATESTINVOICE');
    cy.wrap(CHK).should('eq', '_design/bapu/_view/latestInvoice?stable=true&update=true&descending=true&limit=1');
  });
});
