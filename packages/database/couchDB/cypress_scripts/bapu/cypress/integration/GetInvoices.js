// import { couchPutOpts, couchPayload, scrapeInvoice, tightDate } from '../support/couchdb';
import { couchGetOpts, scrapeInvoice } from '../support/couchdb';

const YR = 0;
const MTH = YR + 1;
const DAY = MTH + 1;
const HR = DAY + 1;
const MIN = HR + 1;
const SEC = MIN + 1;

const years = [ '2016', '2017', '2018' ];

const months = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
];

const processMonth = (pyld) => {
  const { acc, year, month, lastTime } = pyld;

  cy.get('#form-month')
    .select(month)
    .then(() => {
      cy.log(`************* MONTH : ${year}/${month}.`);
      acc[year][month] = {};
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
  const { acc, year, lastTime } = pyld;
  if (year < lastTime[YR]) return;

  cy.get('#form-year')
    .select(year)
    .then(() => {
      // cy.log(`************* YEAR : ${year}.`);
      acc[year] = {};
      months.slice(lastTime[MTH] - 1).forEach((month) => {
        processMonth({ acc, year, month, lastTime });
      });
      lastTime[MTH] = 1;
    });
}

describe('BAPU Scraper', function() {

  beforeEach(function () {
    cy.fixture('../fixtures/couch.json').as('couchData');

    const query = `_design/BapuViews/_view/latestInvoice?update=true&descending=true&limit=1`;
    const opts = couchGetOpts(query);

    cy.log('-------------------');
    cy.log(JSON.stringify(opts, null, 2));
    cy.log('-------------------');

    cy.request(opts)
      .then((r) => {
        if (r.body.total_rows > 0) return r.body.rows[0].key
                                            .replace(/-/g, '|')
                                            .replace(/ /, '|')
                                            .replace(/:/g, '|')
                                            .split('|');
        return [2016, 0, 1, 0, 0, 0];
      }).as('latestInvoice');
  });

  it('Scrape BAPU', function() {

    cy.get('@couchData').then((couch) => {
      cy.log(`Processing from last invoice ${couch.lastInvoice}.`);
    });

    cy.get('@latestInvoice').then((latest) => {
      cy.log(`Processing from last invoice ${JSON.stringify(latest, null, 2)}.`);
    });


    cy.visit('http://www.iridiumblue.ec/erp/bapu/test/index.php')

    cy.login();

    cy.visit('http://www.iridiumblue.ec/erp/bapu/test/index.php?m=invoice_control');

    cy.get('#form-status').select('Pagada Parcial');

    cy.get('@latestInvoice').then((lastTime) => {
      const d = lastTime;
      const startFrom = new Date(d[0], d[1], d[2], d[3], d[4], d[5]);
      cy.log(startFrom);

      const acc = { years: { "2000": {} } };
      years.forEach((year) => {
        processYear({ acc, year, lastTime });
        lastTime[YR] = year;
      });
      cy.log(`Accumulator : ${JSON.stringify(acc, null, 2)}.`);
    });
  });
});
