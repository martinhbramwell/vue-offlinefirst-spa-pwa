import scrapeInvoice from './ScrapeInvoice';

const date1 = new Date('December 10, 2018 23:15:30 GMT+11:00');
const aDay = 4*60*60;
const dates = [];

let offset = 1;

for (let cnt = 0; cnt < 44 ; cnt += 1) {
  offset = cnt+aDay + Math.random()*aDay*12;
  date1.setSeconds(date1.getSeconds() + offset)
  dates.push(new Date(date1));
}

const processMonth = (pyld) => {
  const { acc, year, month, lastTime: L, testTime: T} = pyld;
// debugger;
  cy.log(`###### Last: ${L} > Test ${T}? ${L > T} ######`);
  if(L > T) return;
  cy.log(`###### Working from here ######`);
  cy.get('#form-month')
    .select(month)
    .then(() => {
      cy.log(`************* MONTH : ${year}/${month}.`);
                 // debugger;
      // let lMth = parseInt(L[1]);
      // lMth -= 1;
      // const lastDate = new Date(L[0], lMth, L[2], L[3], L[4], L[5]);
      // cy.log(`###################### Last ${lastDate} #######################`);
      // cy.log(`###################### Last ${testDate} #######################`);
      acc[year][month] = {};
      cy.get('#por_facturar > tbody').children()
        .each(($row) => {
          const serialNumber = $row.children().eq(2).text();
          let date = $row.children().eq(1).children().eq(2).text();
          date = new Date(date.substring('Facturado '.length))
          cy.log(`~~~~~~ Invoice date: ${date} > Last run date: ${L}? ${date > L} ~~~~~~`);
          if(date > L) {
            cy.log(`~~~~~~ Working from here ~~~~~~`);
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
              cy.log(`Skipped ahead. No data.`);
            };
          }
        });
    });
};

export default processMonth;
