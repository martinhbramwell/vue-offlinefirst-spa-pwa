import { databaseLocal as lclDB } from '../database';
import { logger as LG } from '../utils';

const bottles = {};
const persons = {};

const findDuplicates = (doc) => {
  LG(`Total rows ${JSON.stringify(doc.total_rows, null, 2)}  vs length : ${JSON.stringify(doc.rows.length, null, 2)}`);
  for (let ii = 0; ii < doc.rows.length; ii += 1) {
  // for (let ii = 0; ii < 5; ii += 1) {
    // LG(`Found bottle ${ii} :: ${JSON.stringify(doc.rows[ii].doc.data.id, null, 2)}`);
    const bottle = doc.rows[ii].doc.data;
    const idBottle = parseInt(bottle.id, 10);
    const idPerson = parseInt(bottle.ultimo, 10);
    let tmpBottle = [];
    if (bottles[idBottle]) tmpBottle = bottles[idBottle];
    tmpBottle.push({
      id: bottle.id,
      ID: doc.rows[ii].doc._id, // eslint-disable-line no-underscore-dangle
      persons: [idPerson],
    });
    bottles[idBottle] = tmpBottle;

    let tmpPerson = { id: idPerson, bottles: [] };
    if (persons[idPerson]) tmpPerson = persons[idPerson];
    tmpPerson.bottles.push(bottle.id);
    persons[idBottle] = tmpPerson;
  }
  const duplicates = Object.entries(bottles).filter(bottle => bottle[1].length > 1);
  LG(`
    Bottles with duplicate or missing internal ids :: ${JSON.stringify(duplicates, null, 2)}`);
  // LG(`
  //   Persons :: ${JSON.stringify(persons, null, 2)}`);
};

export default () => {
  LG(`
    Ready to validate`);

  lclDB.allDocs({
    include_docs: true,
    startkey: 'aBottle_1_0000000000100001',
    endkey: 'aBottle_1_9999999999999999',
  })
    .then(findDuplicates);
};
