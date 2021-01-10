import axios from 'axios';
import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

/* eslint-disable no-underscore-dangle */

// import listRange from '../utils/listRange';
// import { databaseLocal as db } from '../database';
// import { processVoids } from './reprocessVoids';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const lastInvoiceView = '_design/bapu/_view/latestInvoice?include_docs=true&limit=1&descending=true';

const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const twoCents = float => money.format(float);

function NoMoreData(message = '') {
  this.message = message;
}
NoMoreData.prototype = new Error();


const makeNewKeyFromId = id => `aPerson_1_${id.padStart(16, '0')}`;

const patchCustomerForTesting = (cust, patch = false) => {
  const customer = cust;
  if (patch) {
    customer._id = cust._id.startsWith('A_') ? cust._id : `A_${cust._id.slice(1)}`;
  }
  // CDR(customer);
  return customer;
};

const getLegalIDType = (legalId) => {
  switch (legalId.length) {
    case 13:
      return '_04';
    case 10:
      return '_05';
    case 0:
      return '_07';
    default:
      return '_06';
  }
};

const applyBapuDataToCouchPersonRecord = (aPartner, aCustomer) => {
  let cust = {};
  cust = aCustomer;

  let theCustomer = {};
  try {
    const { partner_name, partner_id } = aPartner; // eslint-disable-line camelcase
    const pId = parseInt(partner_id, 10);
    const pName = partner_name.trim();

    const { nombre: cName, idib } = aCustomer.data;
    const cId = parseInt(idib, 10);
    // CLG(`Partner : ${pId} - ${pName}`);
    // CLG(`Customer : ${cId} - ${cName}`);

    if (cust._id === '') {
      CLG('Make new record');
      cust._id = makeNewKeyFromId(partner_id);
    } else if (pId !== cId || pName !== cName) {
      throw new Error(`[applyBapuDataToCouchPersonRecord] ID or name mismatch: >${cId}< vs >${pId}< OR >${cName}< vs >${pName}<`);
    }

    // theCustomer = patchCustomerForTesting(cust, true);
    theCustomer = patchCustomerForTesting(cust);

    const d = new Date().toISOString().split(':');
    theCustomer.updated = `${d[0]}${d[1]}`.replace('-', '').replace('-', '').replace('T', '');
    theCustomer.data.updated = theCustomer.updated;
    theCustomer.data.codigo = pId.toString();
    theCustomer.data.idib = pId.toString();
    theCustomer.data.nombre = pName;

    theCustomer.data.ruc_cedula = aPartner.partner_legal_id;
    theCustomer.data.telefono_1 = aPartner.partner_telf_primary;
    theCustomer.data.distribuidor = aPartner.distribuidor === 'N' ? 'no' : 'si';
    theCustomer.data.tipo_de_documento = getLegalIDType(aPartner.partner_legal_id);

    theCustomer.data.address_details = parseInt(pId, 10);
    theCustomer.data.bottle_movements = parseInt(pId, 10);
    theCustomer.data.admin_details = parseInt(pId, 10);
    theCustomer.data.id = pId.toString();
    theCustomer.data.direccion = aPartner.street_acc;

    theCustomer.data.email = aPartner.partner_email;
    theCustomer.data.mobile = aPartner.partner_celular_phone;

    CLG(`Customer record loaded with BAPU data :: ${theCustomer._id}`);

    // CLG(`${JSON.stringify(aPartner, null, 2)}`);
    // CLG('-------------------------------------------');
  } catch (e) {
    throw new Error(`[applyBapuDataToCouchPersonRecord] Can't correlate existing customer and BAPU partner : ${cust._id}.  Cause : ${e.message}`);
  }

  return theCustomer;
};


const couchGetOpts = query => ({
  url: `${process.env.CYPRESS_CH_URL}/${query}`,
  method: 'GET',
  followRedirect: true,
  failOnStatusCode: true,
  headers: {
    pragma: 'no-cache',
    'cache-control': 'no-cache',
  },
});

const couchPostOpts = path => ({
  url: `${process.env.CYPRESS_CH_URL}/${path}`,
  method: 'POST',
  followRedirect: true,
  failOnStatusCode: true,
});


const couchPutOpts = id => ({
  url: `${process.env.CYPRESS_CH_URL}/${id}`,
  method: 'PUT',
  followRedirect: true,
  failOnStatusCode: true,
});


const invoiceByID = 'ventas/invoice_data.php?iInvoice_id';
const partnerByID = 'clientes/cliente_data.php?iClientNumber';
const bapuGetOpts = query => ({
  url: `${process.env.BAPU_ROOT}/${query}`,
  method: 'GET',
  failOnStatusCode: true,
  withCredentials: true,
  headers: { Cookie: `${process.env.BAPU_CKIE}` },
});

const template = {
  _id: '',
  _rev: 'NONE',
  data: {
    codigo: '',
    idib: '',
    ruc_cedula: '',
    nombre: '',
    telefono_1: '',
    distribuidor: '',
    tipo_de_documento: '',
    email: '',
    id: '',
    role: 'Cliente',
    status: 'new',
    updated: '',
    telefono_2: '',
    mobile: '',
    direccion: '',
    type: 'person',
    address_details: 0,
    bottle_movements: 0,
    admin_details: 0,
    bottles: [],
    es_empresa: 'FIXME',
    es_client: 'si',
    es_proveedor: 'FIXME',
    retencion: 'FIXME',
  },
  type: 'person',
  updated: '',
};

const getLastInvoiceFromCouch = async () => {
  const rslt = {};
  const lastOpts = couchGetOpts(lastInvoiceView);
  try {
    const response = await axios(lastOpts);
    // CDR(response.data);
    rslt.idBAPU = response.data.rows[0].doc.data.idib;
    rslt.seqSRI = response.data.rows[0].doc.data.sequential;
    CLG(`Retrieved last invoice. Id = '${JSON.stringify(rslt, null, 2)}'`);
    return rslt;
  } catch (error) {
    throw new NoMoreData(`[getLastInvoiceFromCouch] Couldn't retrieve last invoice view.  Cause ${error}`);
  }
};

const getNextInvoiceFromBAPU = async (idNext) => {
  let rslt = {};
  const invoiceOpts = bapuGetOpts(`${invoiceByID}=${idNext}`);
  try {
    const response = await axios(invoiceOpts);
    rslt = response.data.invoice_head;
    rslt.items = response.data.invoice_lines;
    // CDR(rslt);
    CLG(`Retrieved next BAPU invoice :: '${rslt.invoice_id}'`);
    return rslt;
  } catch (error) {
    throw new Error(`[getNextInvoiceFromBAPU] Couldn't retrieve next invoice : ${idNext}.  Cause ${error}`);
  }
};

const reindexCouchByPersonId = async () => {
  const indexOpts = couchPostOpts('_index');
  indexOpts.data = { index: { fields: ['data.id'] }, name: 'personId', type: 'json' };
  try {
    const response = await axios(indexOpts);
    CLG(`Created CouchDb index :: '${response.data.name}'`);
  } catch (error) {
    throw new Error(`[reindexCouchByPersonId] Can't create CouchDb index: ${indexOpts.data.index.name}`);
  }
};

const retrieveCouchPersonById = async (idPerson) => {
  let rslt = {};
  const findOpts = couchPostOpts('_find');
  findOpts.data = { selector: { 'data.id': { $eq: idPerson.toString() } } };
  CLG('Find with ...');
  CDR(findOpts.data);
  try {
    const response = await axios(findOpts);
    CDR(response.data);
    const { docs } = response.data;
    if (docs.length < 1) {
      rslt = template;
      delete rslt._rev;
      CLG('Will insert new person from template');
    } else if (docs.length < 2) {
      [rslt] = docs;
      CLG(`Will create copy of EXISTING person :: '${rslt.data.nombre}'`);
    } else {
      const [first, second] = docs;
      rslt = first._id.startsWith('A_Person') ? first : second;
      CLG(`Will update EXISTING person :: '${rslt.data.nombre}'`);
    }
    return rslt;
  } catch (e) {
    throw new Error(`[retrieveCouchPersonById] Couldn't retrieve person: ${idPerson}.  Cause : ${e.message}`);
  }
};

const retrieveBapuPartnerById = async (idPartner) => {
  let rslt = {};
  const partnerOpts = bapuGetOpts(`${partnerByID}=${idPartner}`);
  try {
    const response = await axios(partnerOpts);
    // CDR(response.data[0]);
    [rslt] = response.data;
    return rslt;
  } catch (e) {
    throw new Error(`[retrieveBapuPartnerById] Couldn't retrieve BAPU partner: ${idPartner}.  Cause : ${e.message}`);
  }
};

const writePersonRecordToCouch = async (person) => {
  let rslt = {};
  const pers = person;

  const customerOpts = couchPutOpts(pers._id);
  if (pers._rev === 'NONE') delete pers._rev;
  customerOpts.data = pers;
  CDR(customerOpts);
  try {
    const response = await axios(customerOpts);
    rslt = response.data;
    CLG('Customer record written to CouchDb.');
    CDR(rslt);
  } catch (e) {
    throw new Error(`[writePersonRecordToCouch] Couldn't upsert customer : ${pers._id}.  Cause : ${e.message}`);
  }
  return rslt;
};


const applyBapuDataToCouchInvoiceRecord = (previousSequential, invoice) => {
  CDR(invoice);

  CLG(`Previous sequential = '${previousSequential}'`);
  const sequential = (parseInt(previousSequential, 10) + 1).toString().padStart(9, 0);

  CLG(`BAPU Id = ${invoice.invoice_id}`);
  const idib = invoice.invoice_id;
  const idBAPU = idib.toString().padStart(16, 0);


  const itemes = [];
  let count = 0;
  let subTotal = 0.0;
  invoice.items.forEach((item) => {
    const cantidad = parseInt(item.invoice_line_product_quantity, 10);
    const precio = parseFloat(item.invoice_line_untitary_price_amount);
    const total = cantidad * precio;
    itemes.push(
      {
        idItem: count,
        nombreProducto: item.product_name,
        cantidad: cantidad.toString(),
        precio: twoCents(precio),
        total: twoCents(total),
      },
    );
    count += 1;
    subTotal += total;
  });

  const totalImpuesto = subTotal * parseFloat(process.env.IMPUESTO_VALOR_AGGREGADO);
  const total = twoCents(totalImpuesto + subTotal);
  const rslt = {
    _id: `Invoice_1_${idBAPU}`,
    data: {
      type: 'invoice',
      codigo: `001-002-${sequential}`,

      count,
      itemes,

      nombreCliente: invoice.partner_name,
      fecha: invoice.invoice_creation_date,
      estado: `${invoice.invoice_status === 'P' ? '' : 'NO '}PAGADA`,
      nombreResponsable: `Facturado por: ${invoice.username}`,
      sucursal: 1,
      pdv: 2,

      sequential,
      idib: parseInt(idib),

      subTotalConImpuesto: twoCents(invoice.invoice_subtotal_tax_amount),
      subTotalSinImpuesto: twoCents(invoice.invoice_subtotal_iva_cero_amount),
      descuento: twoCents(invoice.invoice_discount),

      subTotal: twoCents(subTotal),
      totalImpuesto: twoCents(totalImpuesto),
      total,

      email: invoice.partner_email,
      direccion: invoice.street_acc,
      legalId: `[${invoice.partner_legal_id}]`,
      telefono: invoice.partner_telf_primary,
      telefono_2: invoice.partner_telf_secundary == '' ? 'nulo' : invoice.partner_telf_secundary,
      mobile: invoice.partner_celular_phone,
      seqib: parseInt(invoice.invoice_number.split('-')[2], 10),
    },
    hold: true,
    void: false,
    type: 'invoice',
  };

  return rslt;
};


const writeInvoiceRecordToCouch = async (inv) => {
  let rslt = {};
  const invoice = inv;

  const invoiceOpts = couchPutOpts(invoice._id);
  invoiceOpts.data = invoice;
  CDR(invoiceOpts);
  try {
    const response = await axios(invoiceOpts);
    rslt = response.data;
    CLG(`Invoice record written to CouchDb :: ${rslt.id}`);
    // CDR(rslt);
  } catch (e) {
    throw new Error(`[writeInvoiceRecordToCouch] Couldn't insert invoice : ${invoice._id}.  Cause : ${e.message}`);
  }
  return rslt;
};

export default async (req, res) => {
  CLG(`

      ========================`);

  try {
    reindexCouchByPersonId();

    const { idBAPU: lastInvoiceId, seqSRI: lastSequential } = await getLastInvoiceFromCouch();
    const nextInvoiceId = lastInvoiceId + 1;

    const nextInvoice = await getNextInvoiceFromBAPU(nextInvoiceId);

    const { invoice_id: invoiceId, partner_id: customerId } = nextInvoice;
    CLG(`Got invoice '${invoiceId}' of customer :: '${customerId}'`);

    const fakeNoSuchPerson = false;
    const nextInvoiceCustomer = await retrieveCouchPersonById(fakeNoSuchPerson ? 2345 : customerId);
    CDR(nextInvoiceCustomer);

    const bapuCustomer = await retrieveBapuPartnerById(customerId);
    CLG(`Got BAPU customer :: '${bapuCustomer.partner_name}'`);
    // CDR(bapuCustomer);

    const revisedCustomer = applyBapuDataToCouchPersonRecord(bapuCustomer, nextInvoiceCustomer);
    // CLG(`${JSON.stringify(revisedCustomer, null, 2)}`);

    const { id: personRecordId } = await writePersonRecordToCouch(revisedCustomer);
    // const writeResult = await writePersonRecordToCouch(revisedCustomer);
    // CLG(`${JSON.stringify(writeResult, null, 2)}`);

    const couchInvoice = applyBapuDataToCouchInvoiceRecord(lastSequential, nextInvoice);
    const { codigo: sriSequential } = couchInvoice.data;
    // CDR(couchInvoice);
    CDR(couchInvoice.data);
    // CLG(`${JSON.stringify(couchInvoice,_id null, 2)}`);

    const { id: invoiceRecordId } = await writeInvoiceRecordToCouch(couchInvoice);
    // const writeResult = await writeInvoiceRecordToCouch(revisedCustomer);
    // CLG(`${JSON.stringify(writeResult, null, 2)}`);

    CLG(`sriSequential : ${sriSequential}`);
    res.send({ Result: `Completed data updates successfully for invoice '${invoiceId}'.`, invoiceRecordId, sriSequential, personRecordId });

    CLG('--------------------|||----------------------');
  } catch (e) {
    if (e instanceof NoMoreData) {
      // statements to handle TypeError exceptions
    } else {
      const msg = `${e.name}: ${e.message}`;
      CLG(msg);
      res.send({ Result: `Error : ${msg}` });
    }
  }

  const useableCode = false;
  if (useableCode) {
    CLG('hidden');
  }

  CLG(`reCheck.js  
      ========================\n\n`);
};
