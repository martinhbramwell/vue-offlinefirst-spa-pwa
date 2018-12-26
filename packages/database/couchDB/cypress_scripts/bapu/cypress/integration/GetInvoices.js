// import { couchPutOpts, couchPayload, scrapeInvoice, tightDate } from '../support/couchdb';
import { scrapeInvoice } from '../support/couchdb';

const years = [ '2016', '2017', '2018' ];
// const years = [ '2017' ];
const months = [
  'DICIEMBRE',
];
// const months = [
//   'ENERO',
//   'FEBRERO',
//   'MARZO',
//   'ABRIL',
//   'MAYO',
//   'JUNIO',
//   'JULIO',
//   'AGOSTO',
//   'SEPTIEMBRE',
//   'OCTUBURE',
//   'NOVIEMBRE',
//   'DICIEMBRE',
// ];

const processMonth = (pyld) => {
  const { acc, year, month } = pyld;
  cy.get('#form-month')
    .select(month)
    .then(() => {
      cy.log(`************* MONTH : ${month}.`);
      acc[year][month] = {};

  debugger;
      cy.get('#por_facturar > tbody').children()
        .each(($row) => {
          const serialNumber = $row.children().eq(2).text();
          if (serialNumber) {
            cy.log(`============= Row : ${JSON.stringify(serialNumber, null, 2)}.`);

            const invoice = {
              meta: { type: "Request", handler: "InvoiceCreate" },
              data: { type: "invoice", codigo: serialNumber, count: 0, itemes: [] },
            };

            acc[year][month][serialNumber] = invoice;
            pyld.codigo = serialNumber;
            scrapeInvoice($row[0], pyld);
          } else {
            cy.log(`Skipped year. No data.`);
          };
        });
    });
};

const processYear = (pyld) => {
  const { acc, year } = pyld;
  cy.get('#form-year')
    .select(year)
    .then(() => {
      cy.log(`************* YEAR : ${year}.`);
      acc[year] = {};
      months.forEach((month) => {
        processMonth({ acc, year, month });
      });
    });
}

describe('My First Test', function() {

  beforeEach(function () {
    cy.fixture('../fixtures/couch.json').as('couchData');
  });

  it('Visits BAPU', function() {

    cy.visit('http://www.iridiumblue.ec/erp/bapu/test/index.php');

    cy.login();

    cy.visit('http://www.iridiumblue.ec/erp/bapu/test/index.php?m=invoice_control');

    cy.get('#form-status').select('Pagada Parcial');

    cy.get('@couchData').then((acc) => {
      years.forEach((year) => {
        processYear({ acc, year });
      });
      cy.log(`Accumulator : ${JSON.stringify(acc, null, 2)}.`);

    });
  })
})

