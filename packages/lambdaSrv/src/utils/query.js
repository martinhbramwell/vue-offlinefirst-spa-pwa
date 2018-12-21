/*

   This code is backburnered ....
   https://stackoverflow.com/questions/53843331/why-does-first-use-of-a-pouchdb-view-after-from-replication-return-one-record

*/

import { logger as LG } from './index';

const query = (db, view, params) => {
  const namespace = view.split('/')[0];
  LG.debug(`Namespace :: ${namespace}`);
  LG.debug(`View :: ${view}`);

  return db
    .query(view, params)
    .catch((err) => {
      if (err.status === 404) {
        throw new Error(`View ${view} is not defined.`);
      }
      throw new Error(`Error querying ${view}.\n${err}`);
    });
};

export default query;
