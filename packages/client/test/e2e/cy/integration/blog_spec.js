const LG = console.log; // eslint-disable-line no-console, no-unused-vars

describe('Iiridum Blue', () => {
  context('API', () => {
    beforeEach(() => {
      // Visiting our app before each test removes any state build up from
      // previous tests. Visiting acts as if we closed a tab and opened a fresh one
      cy.visit('/');
    });

    // Let's query for some DOM elements and make assertions
    // The most commonly used query is 'cy.get()', you can
    // think of this like the '$' in jQuery

    it('Go to blog page', () => {
      cy.get('[data-cyp=\'blog\']').click();
      cy.get('[data-cyp=\'fetch-articles\']').click();
    });
  });
});

