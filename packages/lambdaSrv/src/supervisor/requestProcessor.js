import { logger as LG } from '../utils';

const ignoreList = [];
const processRequests = (parms) => {
  const {
    name,
    category,
    label,
    Request,
    database,
  } = parms;

  LG.debug(`

    ${label}S
    `);

  // console.log('................................');

  database.allDocs({
    include_docs: true,
    startkey: category,
    endkey: `${category}\ufff0`,
  }).then((rslt) => {
    let numOfRequests = 0;
    rslt.rows.filter((request) => {
      const idReq = request.doc._id; // eslint-disable-line no-underscore-dangle
      LG.debug(`Getting only new ${name}s :: ${idReq}`);
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
        LG.info(`Stacking ${name}s :: ${JSON.stringify(request.id, null, 2)}`);
        jobStack.push(new Request(request, database, jobStack));
      });
      LG.verbose(`Processing ${name.toLowerCase()} stack...`);
      const job = jobStack.pop();
      job.process();
    }
  });
};

export default processRequests;
