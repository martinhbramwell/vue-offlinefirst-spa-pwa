import { couchPutOpts, uniqueRequest } from './utils';

const template = {
  '_id': 'Request_2_20190104055310_00null',
  'data': {
    'codigo': null,
    'idib': null,
    'ruc_cedula': null,
    'nombre': null,
    'telefono_1': null,
    'distribuidor': 'no',
    'tipo_de_documento': '_00',
    'email': null,
    'id': null,
    'role': 'Cliente',
    'status': 'new'
  },
  'meta': {
    'type': 'Request',
    'handler': 'PersonMerge',
  }
}

const tStamp = D => ''.concat(
  D.getFullYear().toString(),
  (D.getMonth() + 1).toString().padStart(2, '0'),
  D.getDate().toString().padStart(2, '0'),
  D.getHours().toString().padStart(2, '0'),
  D.getMinutes().toString().padStart(2, '0')
);

const processPerson = (elem, pyld) => {
  const { acc, page, codigo } = pyld;

  const person = acc[page][codigo];

  cy.log(`-------- SCRAPE PERSON : '${person.name}' ---------`);

  cy.wrap(elem, { log: false }).within(($row) => {
    cy.wrap($row, { log: false }).children({ log: false }).then((cols) => {
      // cy.log(cols);
      // console.log(`==> ${cols[0].innerText} ${cols[1].innerText} ${cols[2].innerText} ${cols[3].innerText} ${cols[4].innerText} `);
      let codigo = cols[0].innerText.toString();

      let id = uniqueRequest(cols[0].innerText.toString().padStart(5, '0'));

      let ClientRecord = JSON.parse(JSON.stringify(template));
      let tipo_de_documento = null;
      switch(cols[2].innerText.length) {
        case 13:
          tipo_de_documento = '_04';
          break;
        case 10:
          tipo_de_documento = '_05';
          break;
        case 0:
          tipo_de_documento = '_07';
          break;
        default:
          tipo_de_documento = '_06';
      }


      ClientRecord._id = id;
      ClientRecord.data.codigo = codigo;
      ClientRecord.data.idib = codigo;
      ClientRecord.data.id = codigo;
      ClientRecord.data.ruc_cedula = `[${cols[2].innerText}]`;
      ClientRecord.data.nombre = cols[1].innerText.replace(/\s\s+/g, ' ').trim();
      ClientRecord.data.telefono_1 = cols[4].innerText;
      ClientRecord.data.tipo_de_documento = tipo_de_documento;
      ClientRecord.data.email = cols[3].innerText.trim();

      ClientRecord.data.updated = tStamp(new Date());

      cy.log(cols[5]).debug(); //.eq(4).children().eq(0).click({ force: true });

      // cols[5].children().eq(0).click({ force: true });
      // cy.wait(100);


      // cy.get('.modal-footer > .btn').click({ force: true });




      let opts = Object.assign(couchPutOpts(id), { body: ClientRecord });

      cy.log(JSON.stringify(opts, null, 2));
      cy.log('-------------------');


      // cy.request(opts);

      // console.log(`${JSON.stringify(ClientRecord, null, 2)}`);

      opts = null;
      tipo_de_documento = null;
      ClientRecord = null;
      id = null;
      codigo = null;


    });
  //   cy.get('.project-title').get('a').invoke('text')
  //     .then(v => invoice.data.nombreCliente = v);

  //   cy.get('.project-actions').first().click();

  });

};

export default processPerson;
