import { processPage } from '../support/couchdb';

describe('BAPU Scraper', function() {

  it('Scrapes BAPU for Persons', function() {
    cy.readFile('./cypress/nextPage.json').then((text) => {
      const { thisPage } = text;
      cy.log(`Next page ${thisPage}`);

      cy.visit(Cypress.env('ENDPNT'));

      cy.login();

      cy.visit(`${Cypress.env('ENDPNT')}?m=clients_list`);

      cy.get('#dataTables_clients_length > label > select').select('100');

      cy.get('#dataTables_clients_paginate > ul > li').last().then((val) => {
        const acc = {};
        const numPages = parseInt(val[0].innerText);
        acc.flagWord = 'Iridium Blue Agua';
        for(let page = numPages; page > 0; page -= 1) {
            cy.get('#dataTables_clients_paginate > ul > li')
              .contains(page).should('contain', page)
              .click({force: true}).then(() => {
                cy.get('#dataTables_clients > tbody > tr > td')
                  .should('not.contain', acc.flagWord)
                  .then((whereAreWe) => {
                    cy.get('#dataTables_clients > tbody > tr.text-info > td', { log: false }).eq(1).then((fld) => {
                      acc.flagWord = fld[0].innerText;
                    });
                    if (page === thisPage) {
                      processPage({acc, page});
                    } else {
                      cy.log(`Skipping page #${page}.`)
                    }
                  });
              });
        };
        console.log(acc);
      });
    });

  });
});
