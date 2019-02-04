import scrapePerson from './ScrapePerson';

let not516 = true;
const processPage = (pyld) => {
  const { acc, page } = pyld;
  acc[page] = {};
  cy.log(`Scraping page of persons (${JSON.stringify(pyld, null, 2)})`);
  cy.get('#dataTables_clients > tbody > tr', { log: false })
    .each((elem, idx) => {
      const codigo = elem[0].children[0].innerText;
      if (codigo !== '516' || not516) {
        if (codigo === '516') not516 = false;
        const namePerson = elem[0].children[1].innerText;
        acc[page][codigo] = { name: namePerson };
        scrapePerson(elem, { acc, page, codigo });
      }
    });
}

export default processPage;
