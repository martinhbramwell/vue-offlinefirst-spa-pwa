import { databaseLocal as lclDB } from '../database';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console

// /* eslint-disable max-len */
// let theMovement = {};

// let invPers = {};
// let invPersMoves = {};

// let custPers = {};
// let custPersMoves = {};

// const theBottles = [];

export default (req, res) => {
  lclDB.allDocs({
    include_docs: true,
    conflicts: true,
    // startkey: 'Invoice',
    // endkey: 'Invoice\ufff0',
    startkey: '_design',
    endkey: '_design\ufff0',
  })
    .then((rslt) => {
      res.write(
        JSON.stringify(
          rslt.rows
          , null, 3, // eslint-disable-line comma-style
        ),
      );
      return rslt;
    })

    // .then((rslt) => {
    //   res.write(
    //     JSON.stringify(
    //       rslt.rows
    //         .filter(row => row.doc
    //           && row.doc.data
    //           && row.doc.data.type
    //           && row.doc.data.idib
    //           && row.doc.data.type === 'invoice'
    //           && row.doc.data.codigo.length > 16)
    //       , null, 3, // eslint-disable-line comma-style
    //     ),
    //   );
    //   return rslt;
    // })


    /* eslint-disable max-len */
    // .then((rslt) => {
    //   res.write(
    //     JSON.stringify(
    //       rslt.rows
    //         .filter(row => row.doc && row.doc.data)
    //         .map(row => row.doc.data)
    //         .reduce((acc, row) => {
    //           acc[row.type] = acc[row.type] ? 1 + acc[row.type] : 1;
    //           return acc;
    //         }, {})
    //       , null, 3, // eslint-disable-line comma-style
    //     ),
    //   );

    //   res.write(`\n\nMovement identifier :: ${JSON.stringify(req.query.m, null, 3)}\n\n`);

    //   res.write(`
    //     ----------------------------
    //     The movement :: "Movement_2_${req.query.m}"\n`);
    //   [theMovement] = rslt.rows
    //     .filter(row => row.doc
    //                 && row.doc.data
    //                 && row.doc.data.type === 'movement'
    //                 && row.doc._id === `Movement_2_${req.query.m}` // eslint-disable-line comma-dangle, no-underscore-dangle, max-len
    //     ) // eslint-disable-line function-paren-newline
    //     .map(row => ({
    //       id: row.doc.data.id,
    //       direction: row.doc.data.inOut,
    //       customer: row.doc.data.customer,
    //       inventory: row.doc.data.inventory,
    //       bottles: Array.from(new Set(row.doc.data.bottles)),
    //     }));
    //   if (theMovement) {
    //     LG(theMovement);
    //     res.write(
    //       JSON.stringify(
    //         theMovement, null, 3, // eslint-disable-line comma-style
    //       ),
    //     );


    //     res.write(`
    //       ----------------------------
    //       The inventory person\n`);
    //     [invPers] = rslt.rows
    //       .filter(row => row.doc
    //                   && row.doc.data
    //                   && row.doc.data.type === 'person'
    //                   && row.doc.data.idib === theMovement.inventory // eslint-disable-line comma-dangle, max-len
    //       ) // eslint-disable-line function-paren-newline
    //       .map(row => ({
    //         person: row.doc.data.idib,
    //         nombre: row.doc.data.nombre,
    //         bottles: Array.from(new Set(row.doc.data.bottles)),
    //       }));
    //     // LG(invPers);
    //     [invPersMoves] = rslt.rows
    //       .filter(row => row.doc
    //                   && row.doc.data
    //                   && row.doc.data.type === 'person_bottle_move'
    //                   && row.doc.data.person === theMovement.inventory // eslint-disable-line comma-dangle, max-len
    //       ) // eslint-disable-line function-paren-newline
    //       .map(row => ({
    //         moves: Array.from(new Set(row.doc.data.bottle_movements)),
    //       }));
    //     // LG(invPersMoves);

    //     res.write(
    //       JSON.stringify(
    //         Object.assign({}, invPers, invPersMoves)
    //         , null, 3, // eslint-disable-line comma-style
    //       ),
    //     );


    //     res.write(`
    //       ----------------------------
    //       The customer person\n`);
    //     [custPers] = rslt.rows
    //       .filter(row => row.doc
    //                   && row.doc.data
    //                   && row.doc.data.type === 'person'
    //                   && row.doc.data.idib === theMovement.customer // eslint-disable-line comma-dangle, max-len
    //       ) // eslint-disable-line function-paren-newline
    //       .map(row => ({
    //         person: row.doc.data.idib,
    //         nombre: row.doc.data.nombre,
    //         bottles: Array.from(new Set(row.doc.data.bottles)),
    //       }));
    //     // LG(custPers);
    //     [custPersMoves] = rslt.rows
    //       .filter(row => row.doc
    //                   && row.doc.data
    //                   && row.doc.data.type === 'person_bottle_move'
    //                   && row.doc.data.person === theMovement.customer // eslint-disable-line comma-dangle, max-len
    //       ) // eslint-disable-line function-paren-newline
    //       .map(row => ({
    //         moves: Array.from(new Set(row.doc.data.bottle_movements)),
    //       }));
    //     // LG(custPersMoves);

    //     res.write(
    //       JSON.stringify(
    //         Object.assign({}, custPers, custPersMoves)
    //         , null, 3, // eslint-disable-line comma-style
    //       ),
    //     );


    //     // theMovement.bottles = [228, 308];
    //     // res.write(`\n\n\n  !!! FAKE BOTTLES LIST FOR TESTING !!!
    //     //   \n${JSON.stringify(theMovement.bottles, null, 3)}\n`);

    //     let idx = 0;
    //     theMovement.bottles.forEach((bottle) => {
    //       let theBottle = {};
    //       let theBottleMoves = {};
    //       res.write(`
    //         \n  Bottle #${idx += 1} :: ${JSON.stringify(bottle, null, 3)}\n`);

    //       [theBottle] = rslt.rows
    //         .filter(row => row.doc
    //                     && row.doc.data
    //                     && row.doc.data.type === 'bottle'
    //                     && row.doc.data.idib === bottle // eslint-disable-line comma-dangle
    //         ) // eslint-disable-line function-paren-newline
    //         .map(row => ({
    //           codigo: row.doc.data.codigo,
    //           ultimo: row.doc.data.ultimo,
    //         }));

    //       [theBottleMoves] = rslt.rows
    //         .filter(row => row.doc
    //                     && row.doc.data
    //                     && row.doc.data.type === 'bottle_move'
    //                     && row.doc.data.bottle === bottle // eslint-disable-line comma-dangle
    //         ) // eslint-disable-line function-paren-newline
    //         .map(row => ({
    //           movements: row.doc.data.movements,
    //         }));

    //       const combined = Object.assign({}, theBottle, theBottleMoves);

    //       res.write(`${JSON.stringify(combined, null, 3)}\n`);

    //       theBottles.push(combined);
    //     });

    //     /* eslint-disable max-len */
    //   } else {
    //     res.write('\n       !!  Bottles movement record not found  !!');
    //   }
    //   return rslt;
    // })


    .then(() => {
      res.write(`
        ============================\n`);
      res.end();
    });
};
