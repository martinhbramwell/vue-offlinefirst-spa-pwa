const LG = console.log; // eslint-disable-line no-console, no-unused-vars

describe('Iiridum Blue', () => {
  it('Sanity check!', () => {
    cy.visit('/');
    cy.contains('iridium blue');
    cy.get('[data-cyp=\'purge\']').click()
      .get('[data-cyp=\'status\']')
      .then(($val) => {
        LG(` *** ${$val.text()} *** `);
        LG('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
      });
    // .should('contain.oneOf', ['OK', 'Unauthorized']);
    // .contents().should('be.oneOf', ['OK', 'Unauthorized']);
  });

  context('Authentication', () => {
    beforeEach(() => {
      // Visiting our app before each test removes any state build up from
      // previous tests. Visiting acts as if we closed a tab and opened a fresh one
      cy.visit('/');
    });

    // Let's query for some DOM elements and make assertions
    // The most commonly used query is 'cy.get()', you can
    // think of this like the '$' in jQuery

    it('Log in', () => {
      cy.get('[data-cyp=\'logIn\']').click();
    });
  });
});

