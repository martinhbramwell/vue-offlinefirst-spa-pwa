import fs from 'fs'; // eslint-disable-line no-unused-vars
import bundleInvoice from './bundleInvoice'; // eslint-disable-line no-unused-vars
import signInvoice from './signInvoice'; // eslint-disable-line no-unused-vars
import sendInvoice from './sendInvoice'; // eslint-disable-line no-unused-vars
import queryAuthorization from './queryAuthorization'; // eslint-disable-line no-unused-vars

import { logger as LG } from '../../utils';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

// let supervisoryTasksWaiting = true;
// const startSupervisoryTasks = () => { // eslint-disable-line no-unused-vars
//   if (supervisoryTasksWaiting) {
//     LG.info('\n--------------------\nStart Invoice Transformers\n--------------------');
//     bundleInvoices(databaseLocal);
//     signInvoices(databaseLocal);
//     sendInvoices(databaseLocal);
//     queryAuthorizations(databaseLocal);
//     supervisoryTasksWaiting = false;
//   }
// };
const nothing = () => {};

const tasks = {
  bundleInvoice,
  signInvoice,
  sendInvoice,
  queryAuthorization,
  nothing,
};

const invoices = (ctx) => {
  const { doc } = ctx;
  const args = ctx;

  let acc = 0;
  /* eslint-disable no-bitwise, no-underscore-dangle */
  acc |= doc._attachments && doc._attachments.invoiceXml && 1;
  acc |= doc.accessKey && 2;
  acc |= doc._attachments && doc._attachments.invoiceSigned && 4;
  acc |= doc.accepted && 8;
  acc |= doc.authorized && 16;
  /* eslint-enable no-bitwise, no-underscore-dangle */


  let task = '';
  switch (acc) {
    case 0:
      task = 'bundleInvoice';
      break;
    case 3:
      task = 'signInvoice';
      args.cert = fs.readFileSync(process.env.CERT, { flag: 'r' });
      args.pwd = process.env.CERTPWD;
      break;
    case 7:
      task = 'sendInvoice';
      break;
    case 15:
      task = 'queryAuthorization';
      break;
    case 31:
      task = 'nothing';
      break;
    default:
      task = 'nothing';
      LG.warn(`Can't do anything with :: ${acc}`);
  }

  // if (!doc._attachments) { // eslint-disable-line no-underscore-dangle
  //   task = 'bundleInvoice';
  // } else if (!doc._attachments.invoiceXml) { // eslint-disable-line no-underscore-dangle
  //   task = 'bundleInvoice';
  // } else if (doc._attachments.invoiceXml
  //     && doc.accessKey
  //     && !doc._attachments.invoiceSigned) { // eslint-disable-line no-underscore-dangle
  //   task = 'signInvoice';
  //   args.cert = fs.readFileSync(process.env.CERT, { flag: 'r' });
  //   args.pwd = process.env.CERTPWD;
  // } else if (!doc.accepted) {
  //   task = 'sendInvoice';
  // } else if (!doc.authorized) {
  //   task = 'queryAuthorization';
  // } else {
  //   return;
  // }

  tasks[task](args);
};

export default invoices;
