/* eslint-disable no-unused-vars, no-underscore-dangle */
import { logger as LG } from '../../utils';

export const update = (args, db, jobStack) => {
  const {
    request,
    oldRec,
    newRec,
  } = args;

  const updPerson = oldRec;
  const alteredPerson = newRec;
  const updateRequest = request;

  LG.verbose('Fetched person');
  // LG.debug(`Person ${alteredPerson._id} :: ${JSON.stringify(updPerson, null, 2)}`);
  // LG.debug(`Person ${alteredPerson._id} :: ${JSON.stringify(alteredPerson, null, 2)}`);
  Object.keys(alteredPerson.data).forEach((field) => {
    // LG.debug(`Person ${field} :: ${alteredPerson.data[field]} vs ${updPerson.data[field]}`);
    updPerson.data[field] = alteredPerson.data[field];
  });
  LG.debug(`\n\n UPDATING Person ${updPerson._id} ::\n${JSON.stringify(updPerson, null, 2)}`);
  db.put(updPerson)
    .then((updpers) => {
      LG.verbose('Person Updated');
      // LG.debug(`Update :: ${JSON.stringify(updpers, null, 2)}`);
      updateRequest._deleted = true; // eslint-disable-line no-underscore-dangle
      // LG.debug(`Delete :: ${JSON.stringify(updateRequest, null, 2)}`);
      db.put(updateRequest)
        .then((updrq) => {
          LG.verbose('Marked PersonUpdate Request Deleted');
          LG.debug(`Deletion :: ${JSON.stringify(updrq, null, 2)}`);

          const job = jobStack.pop();
          if (job) job.process();
        })
        .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
    })
    .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
};


const categoryName = 'aPerson';
const moduleTitle = 'PersonCreate';
const categoryMetaData = `${categoryName}_2_MetaData`;

export const create = async (args, db, jobStack) => {
  const {
    request,
    newRec,
  } = args;

  const disposableRequest = request;
  const newPerson = newRec;
  let newRecord = null;
  const operationName = 'create';

  let newCode = null;

  try {
    if (newRec.data.codigo) {
      newCode = parseInt(newRec.data.codigo, 10);
    } else {
      const result = await db.allDocs({
        include_docs: true,
        attachments: true,
        descending: true,
        limit: 1,
        skip: 1,
        endkey: categoryName,
        startkey: categoryMetaData,
      });

      // LG.debug(`${moduleTitle}.${operationName} --> Last record ::
      //   result = ${JSON.stringify(result, null, 2)}`);

      newCode = 1 + parseInt(result.rows[0].doc.data.codigo, 10);
    }

    const newId = `aPerson_1_${newCode.toString().padStart(16, '0')}`;

    LG.debug(`${moduleTitle}.${operationName} -->
      New code :: ${newCode}
      New ID = ${newId}
    `);

    newPerson._id = newId;

    newPerson.data.type = 'person';
    newPerson.data.codigo = newCode;
    newPerson.data.idib = newCode;
    newPerson.data.address_details = newCode;
    newPerson.data.bottle_movements = newCode;
    newPerson.data.admin_details = newCode;
    newPerson.data.bottles = [];

    newPerson.data.es_empresa = 'FIXME';
    newPerson.data.es_client = 'si';
    newPerson.data.es_proveedor = 'FIXME';
    newPerson.data.retencion = 'FIXME';
    newPerson.data.role = 'Cliente';

    newRecord = newPerson;

    const tmp = {
      data: {
        nombre: 'Carmen Miranda',
        telefono_1: '02-222-2222',
        telefono_2: '03-333-3333',
        mobile: '654654654654',
        tipo_de_documento: '_07',
        ruc_cedula: '1711711717',
        direccion: '     DUMMY NEW RECORD   ',
        distribuidor: 'FIXME',
        email: 'a@b.cd',
        role: 'FIXME',
        type: 'person',
        codigo: 688,
        idib: 688,
        address_details: 688,
        bottle_movements: 688,
        admin_details: 688,
        bottles: [],
        es_empresa: 'FIXME',
        es_client: 'FIXME',
        es_proveedor: 'FIXME',
        retencion: 'FIXME',
      },
      _id: 'aPerson_1_0000000000000688',
    };

    // newRecord = tmp;

    // LG.debug(`\n\n CREATING Person ${newPerson._id} ::\n${JSON.stringify(newRecord, null, 2)}`);

    try {
      const newpers = await db.put(newRecord);
      // LG.verbose('Person Created');
      LG.info(`Created :: ${JSON.stringify(newpers, null, 2)}`);
      // LG.debug(`Delete :::: ${JSON.stringify(disposableRequest, null, 2)}`);
    } catch (err) {
      LG.error(`INSERT ERROR :: ${JSON.stringify(err, null, 2)}`);
    }

    try {
      const delrq = await db.put(disposableRequest);
      LG.verbose('Marked PersonUpdate Request Deleted');
      LG.debug(`Deletion :: ${JSON.stringify(delrq, null, 2)}`);

      const job = jobStack.pop();
      if (job) job.process();
    } catch (err) {
      LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`);
    }
  } catch (err) {
    LG.error(`${moduleTitle}.${operationName} --> methods
    Unable to obtain last used person ID :: ${JSON.stringify(err, null, 2)}`);
  }

  // db.allDocs({
  //   include_docs: true,
  //   attachments: true,
  //   descending: true,
  //   limit: 1,
  //   skip: 1,
  //   endkey: categoryName,
  //   startkey: categoryMetaData,
  // }).then((result) => {
  //   LG.debug(`${moduleTitle}.${operationName} --> Last record ::
  //     result = ${JSON.stringify(result, null, 2)}`);

  //   const newCode = 1 + parseInt(result.rows[0].doc.data.codigo, 10);
  //   const newId = db.rel.makeDocID({ type: categoryName, id: newCode });
  //   LG.debug(`${moduleTitle}.${operationName} -->
  //     New code :: ${newCode}
  //     New ID = ${newId}
  //   `);

  //   newPerson._id = newId;

  //   newPerson.data.type = 'person';
  //   newPerson.data.codigo = newCode;
  //   newPerson.data.idib = newCode;
  //   newPerson.data.address_details = newCode;
  //   newPerson.data.bottle_movements = newCode;
  //   newPerson.data.admin_details = newCode;
  //   newPerson.data.bottles = [];

  //   newPerson.data.es_empresa = 'FIXME';
  //   newPerson.data.es_client = 'FIXME';
  //   newPerson.data.es_proveedor = 'FIXME';
  //   newPerson.data.distribuidor = 'FIXME';
  //   newPerson.data.retencion = 'FIXME';
  //   newPerson.data.role = 'FIXME';

  //   LG.debug(`${moduleTitle}.${operationName} --> Create ::
  //     Person ${newPerson._id} => ${JSON.stringify(newPerson, null, 2)}`);
  //   db.put(newPerson)
  //     .then((newpers) => {
  //       LG.verbose(`Person Created :: ${JSON.stringify(newpers, null, 2)}`);
  //       LG.debug(`Delete :::: ${JSON.stringify(disposableRequest, null, 2)}`);
  //       db.put(disposableRequest)
  //         .then((delrq) => {
  //           LG.verbose('Marked PersonUpdate Request Deleted');
  //           LG.debug(`Deletion :: ${JSON.stringify(delrq, null, 2)}`);
  //         })
  //         .catch(err => LG.error(`DELETION ERROR :: ${JSON.stringify(err, null, 2)}`));
  //     })
  //     .catch(err => LG.error(`UPDATE ERROR :: ${JSON.stringify(err, null, 2)}`));
  // }).catch((err) => {
  //   LG.error(`${moduleTitle}.${operationName} --> methods
  //   Unable to obtain last used person ID :: ${JSON.stringify(err, null, 2)}`);
  // });
};
