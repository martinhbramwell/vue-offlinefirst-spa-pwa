import secrets from '../secrets.js';

// -- These are parent commands --
Cypress.Commands.add("login", () => {

  cy.get('#username').type(secrets.UID);
  cy.get('body > div.middle-box.text-center.loginscreen.animated.fadeInDown > div > form > div:nth-child(2) > input').type(secrets.PWD);
  cy.get('body > div.middle-box.text-center.loginscreen.animated.fadeInDown > div > form > button').click();

})

Cypress.Commands.add("couch", () => {
  return 'stuff';
})


// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })


// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })


// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
