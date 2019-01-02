const processPage = (pyld) => {
  cy.log(`Scraping page of persons (${JSON.stringify(pyld, null, 2)})`);
  cy.get('#form-year')
    .select(page)
    .then(() => {
      acc[page] = {};
      persons.forEach((person, idx) => {
        scrapePersons({ acc, person });
      });
      // lastTime[MTH] = 1;
    });
}

export default processPage;
