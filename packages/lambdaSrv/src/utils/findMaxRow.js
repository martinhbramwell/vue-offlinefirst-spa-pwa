/* e s l int-disable no-unused-vars, no-underscore-dangle */
import { logger as LG } from './index'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

export default async (db, options) => {
  let result = null;

  const { name, category, indexer } = options;

  const indexing = [];
  let idxField = {};
  idxField[`${category.fieldName}`] = category.sortOrder;
  indexing.push(Object.assign({}, idxField));

  const sorting = [];
  let sortField = {};
  sortField[`${category.fieldName}`] = category.sortOrder;
  sorting.push(Object.assign({}, sortField));

  const selecting = [];
  let selectField = {};
  selectField[category.fieldName] = category.value;
  selecting.push(Object.assign({}, selectField));

  indexer.forEach((fld) => {
    idxField = {};
    idxField[`${fld.fieldName}`] = category.sortOrder;
    indexing.push(Object.assign({}, idxField));

    sortField = {};
    sortField[`${fld.fieldName}`] = category.sortOrder;
    sorting.push(Object.assign({}, sortField));

    selectField = {};
    selectField[fld.fieldName] = { $gt: fld.first };
    selecting.push(Object.assign({}, selectField));
    selectField[fld.fieldName] = { $lt: fld.last };
    selecting.push(Object.assign({}, selectField));
  });

  const fields = indexing;

  const selector = { $and: selecting };
  const limit = 1;
  const sort = sorting;
  const ddoc = name; // eslint-disable-line camelcase, no-unused-vars
  const use_index = name; // eslint-disable-line camelcase, no-unused-vars

  const opts = {
    idx: { index: { fields, name, ddoc } },
    qry: { selector, limit, sort, use_index }, // eslint-disable-line object-curly-newline
  };

  LG.debug(`Index and query options ... \n${JSON.stringify(opts, null, 2)}`);

  try {
    if (category.purge) {
      const tmp = await db.getIndexes();
      const ourIndex = tmp.indexes.filter(idx => idx.name === name)[0];
      if (ourIndex) {
        LG.debug(`Our index ... \n${JSON.stringify(ourIndex, null, 2)}`);
        delete ourIndex.def;
        await db.deleteIndex(ourIndex);
      }
    }

    await db.createIndex(opts.idx);
    await db.viewCleanup();

    const explainResult = await db.explain(opts.qry);
    LG.debug(`Explain index ... \n${JSON.stringify(explainResult, null, 2)}`);

    const queryResult = await db.find(opts.qry);
    LG.debug(`Query result ... \n${JSON.stringify(queryResult, null, 2)}`);

    result = queryResult.docs[0]; // eslint-disable-line prefer-destructuring
  } catch (err) {
    LG.error(`Indexing error ... \n${JSON.stringify(err, null, 2)}`);
    CLG(err);
  }

  // return db.find(opts.qry);
  return result;
};

// export default async makeFindMaxRecordOptions;
