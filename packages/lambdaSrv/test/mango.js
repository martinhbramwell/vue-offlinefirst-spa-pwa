/* eslint-disable no-console, no-underscore-dangle, quote-props */
import jsonRestaurants from './restaurants';
import jsonPersons from './persons';

const restaurants = JSON.parse(jsonRestaurants); // eslint-disable-line no-unused-vars
const persons = JSON.parse(jsonPersons); // eslint-disable-line no-unused-vars


/*  Function to instantiate a new random JSON record */
const item = () => ({ // eslint-disable-line no-unused-vars
  _id: `Thing_${parseInt(1000 * Math.random(), 10)}`,
  stuff: ' silly random remark ',
  email: 'u0@email.com',
  companies: [
    {
      id: 'company',
      uid: 'u0',
    },
  ],
  marks: [
    {
      grade: 'A',
      score: 5,
    },
    {
      grade: 'A',
      score: 7,
    },
    {
      grade: 'A',
      score: 12,
    },
    {
      grade: 'A',
      score: 12,
    },
  ],
});

/* Function to 'put', then retrieve, records from PouchDB */
const dbTest = async (myapp) => { // 'async' advises JavaScript to expect 'await' statements
  console.log(`
    Start ...
    `);
  try {
    // const blkPersons = await myapp.db.bulkDocs(persons.rows);
    // const blkEateries = await myapp.db.bulkDocs(restaurants.rows);
    let slctr = {};
    let found = {};

    // /* Remember the item ID */
    // const rndItemId = item();

    // /* Store the random item in PouchDB */
    // const response = await myapp.db.put(rndItemId); // Do NOT return until 'put' is complete

    // /* Log the response from PouchDB */
    // console.log(`response for <${rndItemId._id}> ....\n${JSON.stringify(response, null, 2)}`);

    // /* Get back all the random items we 'put' in the Pouch so far */
    // const result = await myapp.db.allDocs({ // Do NOT return until 'allDocs' is complete
    //   include_docs: true,
    //   attachments: true,
    //   startkey: 'Thing_0',
    //   endkey: 'Thing_999',
    // });

    // /* Log the result from PouchDB */
    // console.log(`result ....\n${JSON.stringify(result, null, 2)}`);

    slctr = {
      'address.zipcode': '11224',
    };
    found = await myapp.db.find({ selector: slctr });
    console.log(`with ....\n${JSON.stringify(slctr, null, 2)} \nfound ....${JSON.stringify(found.docs.length, null, 2)}`);

    slctr = {
      'sports': { '$all': ['football', 'boxing'] },
    };
    found = await myapp.db.find({ selector: slctr });
    console.log(`with ....\n${JSON.stringify(slctr, null, 2)} \nfound ....${JSON.stringify(found.docs.length, null, 2)}`);

    slctr = {
      'marks': { '$elemMatch': { '$gte': 0, '$lt': 30 } },
    };
    found = await myapp.db.find({ selector: slctr });
    console.log(`with ....\n${JSON.stringify(slctr, null, 2)} \nfound ....${JSON.stringify(found.docs.length, null, 2)}`);

    slctr = {
      'grades': { '$elemMatch': { 'score': 14 } },
    };
    found = await myapp.db.find({ selector: slctr });
    console.log(`with ....\n${JSON.stringify(slctr, null, 2)} \nfound ....${JSON.stringify(found.docs.length, null, 2)}`);

    slctr = {
      'grades': { '$elemMatch': { 'grade': 'B' } },
    };
    found = await myapp.db.find({ selector: slctr });
    console.log(`with ....\n${JSON.stringify(slctr, null, 2)} \nfound ....${JSON.stringify(found.docs.length, null, 2)}`);

    // const found = await myapp.db.find({
    //   limit: 9999999,
    //   selector: {
    //     // marks: { $elemMatch: { $gte: 70, $lt: 85 } },
    //     marks: { $elemMatch: { $eq: 70 } },
    //     // marks: { $elemMatch: { 'score': 44 } },

    //     // companies: { $elemMatch: { $gte: 70, $lt: 85 } },
    //     // email: 'u0@email.com',
    //     // companies: { $elemMatch: { $and: [ { id: 'company' }, { uid: 'u0'} ] } }
    //     // $or: [
    //     //   {$and: [{type:'something'},{uid:'u0'}] },
    //     //   {$and: [{type:'document'}]}
    //     // ]
    //   },
    // });
  } catch (err) {
    console.log(err);
  }
  console.log(`
    ... done!
    `);
};
// /* Call the above function */
// dbTest();
// /* Call it again */
// dbTest();

export default dbTest;
