// import { couchPutOpts, couchPayload, scrapeInvoice, tightDate } from '../support/couchdb';
import { couchGetOpts, processPage } from '../support/couchdb';
import secrets from '../secrets.js';

describe('BAPU Scraper', function() {

  it('Scrapes BAPU for Persons', function() {
    cy.login();

    cy.visit(`${secrets.ENDPNT}?m=clients_list`);

    cy.get(page length).get(100 option).click();
    const acc = { page: {} };

    processPage({acc});
  });
});
