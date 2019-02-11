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

      let req = JSON.parse(JSON.stringify(template));
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


      req._id = id;
      req.data.codigo = codigo;
      req.data.idib = codigo;
      req.data.id = codigo;
      req.data.ruc_cedula = `[${cols[2].innerText}]`;
      req.data.nombre = cols[1].innerText.replace(/\s\s+/g, ' ').trim();
      req.data.telefono_1 = cols[4].innerText;
      req.data.tipo_de_documento = tipo_de_documento;
      req.data.email = cols[3].innerText;

      req.data.updated = tStamp(new Date());

      let opts = Object.assign(couchPutOpts(id), { body: req });

      // cy.log('-------------------');
      cy.log(JSON.stringify(opts, null, 2));
      cy.log('-------------------');


      cy.request(opts);

      // console.log(`${JSON.stringify(req, null, 2)}`);

      opts = null;
      tipo_de_documento = null;
      req = null;
      id = null;
      codigo = null;


    });
  //   cy.get('.project-title').get('a').invoke('text')
  //     .then(v => invoice.data.nombreCliente = v);

  //   cy.get('.project-actions').first().click();

  });

};

export default processPerson;
