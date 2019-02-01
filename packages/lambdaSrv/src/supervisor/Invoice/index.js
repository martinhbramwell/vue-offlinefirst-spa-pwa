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
  acc |= doc.rejected && 16;
  acc |= doc.authorized && 32;
  acc |= doc.void && 64;
  acc |= doc.hold && 128;


  let msg = '';
  let task = '';
  switch (acc) {
    // case 0:
    //   task = 'bundleInvoice';
    //   break;
    // case 3:
    //   task = 'signInvoice';
    //   args.cert = fs.readFileSync(process.env.CERT, { flag: 'r' });
    //   args.pwd = process.env.CERTPWD;
    //   break;
    // case 7:
    //   task = 'sendInvoice';
    //   break;
    // case 15:
    //   task = 'queryAuthorization';
    //   break;
    case 23:
      task = 'nothing';
      msg = 'Rejected';
      break;
    case 47:
      task = 'nothing';
      msg = 'Fully authorized';
      break;
    case 64:
    case 65:
    case 67:
    case 71:
      task = 'nothing';
      msg = '  ** VOID **';
      break;
    default:
      task = 'nothing';
      msg = (acc & 128) ? 'Can do nothing with' : 'Invoice on hold';
  }
  LG.warn(`\n\n${msg} :: ${acc}\n\n`);
  /* eslint-enable no-bitwise, no-underscore-dangle */


  tasks[task](args);
};

export default invoices;
