import { couchPutOpts, couchPayload, uniqueRequest } from './utils';

const processInvoice = (elem, pyld) => {
  const { acc, year, month, codigo } = pyld;

  const invoice = acc[year][month][codigo];

  cy.log('-------- SCRAPE INVOICE ---------');
  cy.log(invoice.data.codigo);

  const row = cy.wrap(elem).within(($row) => {

    cy.get('.project-title').get('a').invoke('text')
      .then(v => invoice.data.nombreCliente = v);
    cy.get('.project-title').get('span').eq(1).invoke('text')
      .then(v => invoice.data.fecha = v);
    cy.get('.project-status').get('span').eq(0).invoke('text')
      .then(v => invoice.data.estado = v);
    cy.get('.project-people').invoke('text')
      .then(v => invoice.data.nombreResponsable = v);

    cy.get('.project-actions').first().click();

  });

  cy.get('#modal-lista-factura').within(($modal) => {
    cy.get('#modal-lista-factura-invoice_number')
    .then((e) => {
      invoice.data.codigo = e.text();
      var bits = e.text().split('-');
      invoice.data.sucursal = parseInt(bits[0]);
      invoice.data.pdv = parseInt(bits[1]);
      invoice.data.sequential = parseInt(bits[2]);
    });
    cy.get('#modal-lista-factura-invoice_id')
    .then(e => invoice.data.idib = parseInt(e.text()));
    cy.get('#modal-lista-factura-street_res')
    .then(e => invoice.data.direccion = e.text());
    cy.get('#modal-lista-factura-partner_legal_id')
    .then(e => invoice.data.legalId = e.text());
    cy.get('#modal-lista-factura-partner_telf_primary')
    .then(e => invoice.data.telefono = e.text());

    invoice.data.itemes = [];
    let idx = 0;
    cy.get('#modal-lista-factura-table > tbody')
      .children('tr')
      .then(($item) => {
        for (let ii = 0; ii < $item.length; ii += 1) {
          const itm = {
            idItem: idx,
            nombreProducto: $item[ii].cells[0].innerText,
            cantidad: $item[ii].cells[1].innerText,
            precio: $item[ii].cells[2].innerText,
            total: $item[ii].cells[3].innerText,
          };
          invoice.data.itemes.push(itm);
        }

        cy.log('~~~~~~~~~~~~~~~~~~~~~~');
        cy.log();
      });

      // .each(($item) => {
      //   cy.log('~~~~~~~~~~~~~~~~~~~~~~');
      //   pyld.item = idx;
      //   processItems($item, pyld);

      //   idx += 1;
      // });
    cy.get('.invoice-total').get('tbody').within(($totals) => {
      cy.log('totals');
      invoice.data.count = invoice.data.itemes.length;
      invoice.data.subTotalConImpuesto = $totals[1].children[0].children[1].children[0].innerText;
      invoice.data.subTotalSinImpuesto = $totals[1].children[1].children[1].children[0].innerText;
      invoice.data.descuento =           $totals[1].children[2].children[1].children[0].innerText;
      invoice.data.subTotal =            $totals[1].children[3].children[1].children[0].innerText;
      invoice.data.totalImpuesto =       $totals[1].children[4].children[1].children[0].innerText;
      invoice.data.total =               $totals[1].children[5].children[1].children[0].innerText;
      cy.log($totals[1].children[1].children[1]);
    });

    cy.get('.modal-footer').within(($foot) => {
      const parts = invoice.data.codigo.split('-');
      cy.log(parts[1]);
      invoice.data.sucursal = parseInt(parts[0], 10);
      invoice.data.pdv = parseInt(parts[1], 10);
      invoice.data.sequential = parseInt(parts[2], 10);

      const id = uniqueRequest();
      const opts = Object.assign(
        couchPutOpts(id),
        couchPayload(id, invoice.data)
      );

      cy.log('-------------------');
      cy.log(JSON.stringify(opts, null, 2));
      cy.log('-------------------');


      cy.request(opts);

      // cy.log(`Accumulated Invoice Data: ${JSON.stringify(acc[year][month][codigo].data, null, 2)}.`);

      cy.get('button').first().click();
    });
  });


  // debugger;
};

export default processInvoice;
