import invoices from './Invoice';
import { emitters, Queue, logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

const { queueEmitter } = emitters;

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console


const handlers = {
  invoice: (args) => {
    // const { doc } = args;
    // LG.verbose(`Invoice change handler ${doc.data.idib}`);
    invoices(args);
  },
  person: (args) => {
    const { doc } = args;
    LG.verbose(`No change handler for type 'person'. ${doc.data.idib}`);
    // invoices(args);
  },
};

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));


const processItem = async (item) => {
  const { doc } = item;
  CLG(`Ready to process queue item '${doc.type}'.`);
  await sleep(1500); // eslint-disable-line no-await-in-loop
  handlers[doc.type](item);
};


const changesQueue = new Queue(queueEmitter);
let idle = true;

const queueAction = async () => {
  if (idle) {
    // CLG(`An item was added to the queue! Idle ? ${idle}`);
    idle = false;
    let more = true;
    while (more) {
      const item = changesQueue.shift();
      if (item) {
        processItem(item);
      } else {
        more = false;
        idle = true;
        // CLG(`Done with queued changes! Idle ? ${idle}`);
      }
    }
  }
};

queueEmitter.on('itemAdded', queueAction);


const changeHandler = (db, change) => { // eslint-disable-line no-unused-vars
  const { doc } = change;
  if (doc && doc.type) {
    // LG.debug(`\n@@@@@@@@@@@@@\n${JSON.stringify(change, null, 2)}\n@@@@@@@@@@@@@`);
    changesQueue.push({ db, doc });
  }
};

const changeHandlingDISABLED = () => { // eslint-disable-line no-unused-vars
  CLG('CHANGE HANDLING DISABLED -- ( /home/hasan/projects/vue-offlinefirst-spa-pwa/packages/lambdaSrv/src/supervisor/changesProcessor.js )');
};

export default changeHandler;
// export default changeHandlingDISABLED;
