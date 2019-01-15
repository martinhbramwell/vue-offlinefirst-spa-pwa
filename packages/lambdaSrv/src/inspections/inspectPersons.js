import { databaseLocal } from '../database';

import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console


/* e s l int-disable max-len, indent, no-unused-vars, object-curly-newline */
export default async (req, res) => {
  /* Get last invoice serial number  */

  res.write('<html><body text="lightyellow" bgcolor="#000007"><font face="Arial, Helvetica, sans-serif">');

  try {
    const persons = await databaseLocal.allDocs({
      include_docs: true,
      attachments: true,
      descending: true,
      endkey: 'aPerson_1',
      startkey: 'aPerson_2',
    });

    persons.rows.forEach((person) => {
      res.write(`</p>[ ${person.doc.data.type} ] ${person.doc._id} -> ${person.doc.data.nombre}</p>`); // eslint-disable-line no-underscore-dangle
    });
  } catch (err) {
    res.write(`<br /></div>Query error ::  ${JSON.stringify(err, null, 2)}</div>`);
  }

  res.write('</body></html>');
  res.end();
};
