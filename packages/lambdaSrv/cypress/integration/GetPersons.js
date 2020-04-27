import axios from 'axios';
import { processPage } from '../support/couchdb';
import { couchPutOpts, couchGetOpts, latinise, uniqueRequest } from '../support/couchdb/utils';

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

describe('BAPU Scraper', function() {

  it('Scrapes BAPU for Persons', function() {
    // cy.readFile('./cypress/nextPage.json').then((text) => {
    //   const { thisPage } = text;
    //   cy.log(`Next page ${thisPage}`);

      cy.visit(Cypress.env('ENDPNT'));

      cy.login();

      cy.visit(`${Cypress.env('ENDPNT')}?m=clients_list`);

      cy.get('#dataTables_clients_length > label > select').select('100');

      cy.task('getCouchLists').then((data) => {
        data.clientes.forEach((cliente) => {
          const client = latinise(cliente).trim();
          cy.log(`Client : ${client}`);
          cy.get('#dataTables_clients_length > label > .form-control').select('5');
          cy.get('#dataTables_clients_filter > label > .form-control').as('Buscar')
          cy.get('@Buscar').clear();
          cy.get('@Buscar').type(client);


          /* ---------------------------------------- */
          cy.get('table#dataTables_clients > tbody > tr').eq(0).children().as('TopRowCells'); // ********************************
          cy.waitUntil(() => {
            cy.task('consoleLogger', `\n --> Client : >${client}< (was >${cliente}<).`);
            return cy.get('@TopRowCells').eq(1).then(($cl) => {
              const row0_col1_text = latinise($cl[0].innerText.trim());
              const res = Boolean(row0_col1_text === client);
              console.log(res);
              return res;
            });
          }, {
            errorMsg: 'Autocomplete failed to return a single record',
            timeout: 60000,
            interval: 500
          });

          const ClientRecord = JSON.parse(JSON.stringify(template));

          cy.get('@TopRowCells').eq(0).invoke('text').then((codigo) => {
            let id = uniqueRequest(codigo.toString().padStart(5, '0'));
            ClientRecord._id = id;
            ClientRecord.data.id = codigo;
            ClientRecord.data.idib = codigo;
            ClientRecord.data.codigo = codigo;
          });

          cy.get('@TopRowCells').eq(1).invoke('text').then((nombre) => {
            ClientRecord.data.nombre = nombre.replace(/\s\s+/g, ' ').trim();
          });

          cy.get('@TopRowCells').eq(2).invoke('text').then((idDoc) => {
            ClientRecord.data.tipo_de_documento = null;
            ClientRecord.data.ruc_cedula = idDoc;
            switch(idDoc.length) {
              case 13:
                ClientRecord.data.tipo_de_documento = '_04';
                break;
              case 10:
                ClientRecord.data.tipo_de_documento = '_05';
                break;
              case 0:
                ClientRecord.data.tipo_de_documento = '_07';
                break;
              default:
                ClientRecord.data.tipo_de_documento = '_06';
            }
          });

          cy.get('@TopRowCells').eq(3).invoke('text').then((email) => {
            ClientRecord.data.email = email.trim();
          });

          cy.get('@TopRowCells').eq(4).invoke('text').then((telefono) => {
            ClientRecord.data.telefono_1 = telefono;
          });

          ClientRecord.data.updated = tStamp(new Date());

          cy.get('@TopRowCells').eq(5).children().eq(0).click({ force: true });
          cy.wait(100);
          cy.get('#modal-edit-client > .modal-dialog > .modal-content').as('Editar');
          cy.get('@Editar').within(($form) => {
            cy.get('div#tab-edit-1').within(($tab) => {
              const tab1_left = $tab[0].children[0].children[0];
              const tab1_right = $tab[0].children[1].children[0];

              // for (let ii = 0; ii < 20 ; ii += 1) {
              //   if (tab1_left.children[ii]) {
              //     for (let jj = 0; jj < 3 ; jj += 1) {
              //       if (tab1_left.children[ii].children[jj]) {
              //         cy.log(` -- ${ii} > ${jj} exists -- ${tab1_left.children[ii].children[jj].value}`);
              //       }
              //     }
              //   }
              // }

              ClientRecord.data.telefono_2 = tab1_left.children[9].children[0] ? tab1_left.children[9].children[0].value : '';
              ClientRecord.data.mobile = tab1_left.children[11].children[0] ? tab1_left.children[11].children[0].value : '';
              ClientRecord.data.es_empresa = tab1_left.children[13].children[0] ? tab1_left.children[13].children[0].value : '';

              ClientRecord.data.direccion = tab1_right.children[7].children[0] ? tab1_right.children[7].children[0].value : '';
              ClientRecord.data.pais = tab1_right.children[9].children[0] ? tab1_right.children[9].children[0].value : '';
              ClientRecord.data.provincia = tab1_right.children[11].children[0] ? tab1_right.children[11].children[0].value : '';
              ClientRecord.data.ciudad = tab1_right.children[13].children[0] ? tab1_right.children[13].children[0].value : '';
              ClientRecord.data.canton = tab1_right.children[15].children[0] ? tab1_right.children[15].children[0].value : '';
              ClientRecord.data.parroquia = tab1_right.children[17].children[0] ? tab1_right.children[17].children[0].value : '';
              ClientRecord.data.parroquia = tab1_right.children[17].children[0] ? tab1_right.children[17].children[0].value : '';

              console.dir(ClientRecord);

              let opts = Object.assign(couchPutOpts(ClientRecord._id), { body: ClientRecord });
              cy.log(JSON.stringify(opts, null, 2));
              cy.log('---------||----------');

              cy.request(opts);
              opts = null;

              // cy.task('updateCouch', { action: 'delete', list: 'clientes', value: cliente });

              // cy.task('getCouchLists').then((data) => {
              //   data.clientes.forEach((cliente = 'nulo') => {
              //     const client = latinise(cliente);
              //     cy.task('consoleLogger', `\n --> Client : ${client} (was ${cliente}).`);
              //     cy.task('updateCouch', { action: 'delete', list: 'clientes', value: cliente });
              //     cy.log(`Client : ${cliente}`);
              //   });
              // });

            });
            cy.get('.modal-footer > .btn').click({ force: true });
          });
        });
      });
    // });
  });
});
