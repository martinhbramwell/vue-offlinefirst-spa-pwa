import { logger as LG } from '../utils';

const name = 'Request';

const ignoreList = [];
const processRequests = (parms) => {
  const {
    actions,
    database,
  } = parms;

  database.allDocs({
    include_docs: true,
    startkey: name,
    endkey: `${name}\ufff0`,
  }).then((rslt) => {
    let numOfRequests = 0;
    rslt.rows.filter((request) => {
      const idReq = request.doc._id; // eslint-disable-line no-underscore-dangle
      // LG.debug(`Getting only new ${name}s :: ${idReq}`);
      if (ignoreList.includes(idReq)) return false;
      ignoreList.push(idReq);
      numOfRequests += 1;
      return true;
    });
    LG.info(`${numOfRequests} new ${name}s`);
    LG.debug(`Ignore list contains ... \n${JSON.stringify(ignoreList, null, 2)}`);

    if (numOfRequests > 0) {
      const jobStack = [];
      rslt.rows.forEach((request) => {
        const { handler } = request.doc.meta;
        // LG.verbose(`\nStacking ${name}s :: ${handler} ${request.id}\n`);
        if (!actions[handler]) throw new Error(`Request action handler "${handler}" is undefined.`);
        jobStack.push(new actions[handler](request, database, jobStack));
      });
      LG.verbose(`Processing ${name.toLowerCase()} stack...`);
      const job = jobStack.pop();
      job.process();
    }
  }).catch((err) => {
    LG.error(`\n
      Request processor exception! ${err}
      `);
  });
};

export default processRequests;
