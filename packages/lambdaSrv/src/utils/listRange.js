const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const listRange = async (res, db, config) => { // eslint-disable-line no-unused-vars
  // CLG('List Range');
  const { startkey, endkey, alteration } = config;
  const dbRange = await db.allDocs({
    include_docs: true,
    attachments: true,
    startkey,
    endkey,
  });

  const records = dbRange.rows;
  const result = [];
  records.forEach((rec) => {
    Object.assign(rec.doc, alteration);
    // CDR(rec.doc);
    // CLG(`${rec.id} (${rec.value.rev})`);
    result.push(rec.doc);
    res.write('</br>');
    res.write(`${rec.id} (${rec.value.rev}) ${JSON.stringify(alteration)}`);
  });


  // CLG('Listed Range');

  return result;
};


export default listRange;
