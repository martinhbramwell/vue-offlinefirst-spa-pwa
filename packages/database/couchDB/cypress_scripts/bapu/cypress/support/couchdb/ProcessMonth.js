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
  cy.log(`###### Last: ${L} > Test ${T}? ${L > T} ######`);
  if(L > T) return;
  cy.log(`###### Working from here ######`);
  cy.get('#form-month')
    .select(month)
    .then(() => {
      cy.log(`************* MONTH : ${year}/${month}.`);
      acc[year][month] = {};
      cy.get('#por_facturar > tbody').children()
        .then((invoices) => {
          if (invoices.length > 0 && invoices[0].innerText.indexOf('undefined') < 0) {
            // cy.log(`Invoice table: \n${JSON.stringify(invoices, null, 2)}`);
            cy.log(`Last row : ${JSON.stringify(invoices[invoices.length - 1], null, 2)}.`);
            for (let ii = invoices.length -1; ii > -1; ii -= 1) {
              debugger;
              const serialNumber = invoices[ii].children[2].innerText;
              const date = new Date(invoices[ii].children[1].children[2].children[0].innerText);
              // cy.wrap(invoices[ii]).children().eq(1).within((td) => {
              //   const date = new Date(td[0].children[2].children[0].textContent);
              cy.log(`~~~~~~ Invoice date: ${date} > Last run date: ${L}? ${date > L} ~~~~~~`);
              if(date > L) {

                const invoice = {
                  meta: { type: "Request", handler: "InvoiceCreate" },
                  data: { type: "invoice", codigo: serialNumber, count: 0, itemes: [] },
                };
                cy.log(`~~~~~~ Working from here ~~~~~~\n${JSON.stringify(invoice, null, 2)}`);

                acc[year][month][serialNumber] = invoice;
                pyld.codigo = serialNumber;
                scrapeInvoice(invoices[ii], pyld);
              };
              // });
            }
          }
        });
    });
};

export default processMonth;
