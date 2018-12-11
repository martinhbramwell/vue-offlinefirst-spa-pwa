import processor from './requestProcessor';
import BottleExchange from './BottleExchange';
import PersonUpdate from './PersonUpdate';

const CLG = console.log; // eslint-disable-line no-console, no-unused-vars

const actions = {
  BottleExchange,
  PersonUpdate,
};

const requestsHandler = (database) => {
  CLG('Handling Change Request');
  processor({
    database,
    actions,
  });
};

export default requestsHandler;
