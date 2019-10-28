import scrapeClient from './ScrapeClient';

let not516 = true;
const processPage = (pyld) => {
  const { acc, page } = pyld;
  acc[page] = {};
  cy.task('consoleLogger', `\n\n##### Scraping page of persons (${JSON.stringify(pyld, null, 2)})`);
  cy.get('#dataTables_clients > tbody > tr', { log: false })
    .each((elem, idx) => {
      const codigo = elem[0].children[0].innerText;
      if (codigo !== '516' || not516) {
        if (codigo === '516') not516 = false;
        const namePerson = elem[0].children[1].innerText;
        acc[page][codigo] = { name: namePerson };
        cy.task('consoleLogger', `\n###### Scraping person: ${namePerson}`);
        scrapeClient(elem, { acc, page, codigo });
      }
    });
}

export default processPage;
