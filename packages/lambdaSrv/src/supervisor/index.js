import processor from './requestProcessor';
import BottleExchange from './BottleExchange';
import PersonUpdate from './PersonUpdate';
import PersonCreate from './PersonCreate';

const CLG = console.log; // eslint-disable-line no-console, no-unused-vars

const actions = {
  BottleExchange,
  PersonUpdate,
  PersonCreate,
};

const requestsHandler = (database) => {
  CLG('Handling Change Request');
  processor({
    database,
    actions,
  });
};

export default requestsHandler;
