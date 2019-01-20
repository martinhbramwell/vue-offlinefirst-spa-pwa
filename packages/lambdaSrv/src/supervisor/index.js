import processor from './requestProcessor';
import BottleExchange from './BottleExchange';
import PersonUpdate from './Person/PersonUpdate';
import PersonCreate from './Person/PersonCreate';
import PersonMerge from './Person/PersonMerge';
import InvoiceCreate from './Invoice/InvoiceCreate';

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

const actions = {
  BottleExchange,
  PersonUpdate,
  PersonCreate,
  PersonMerge,
  InvoiceCreate,
};

const requestsHandler = (database) => {
  // CLG('Handling Change Request');
  processor({
    database,
    actions,
  });
};

export default requestsHandler;
