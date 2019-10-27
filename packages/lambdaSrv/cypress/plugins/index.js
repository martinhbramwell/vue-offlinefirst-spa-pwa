const fs = require('fs');

const couchTools = require('../support/couchTools');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  // bind to the event we care about
  on('task', {
    consoleLogger (msg) {
      console.log(msg);
      fs.appendFileSync(process.env.LOG_DIR, msg);
      return null;
    },
    initCouchClientList () {
      console.log(`initCouchClientList`);
      couchTools.init();
      console.log(`\n-------------------\n`);

      return null;
    },
    getCouchSingle (cmd) {
      const { query } = cmd;
      console.log(`getCouchSingle`);
      return couchTools.get(query);
      // console.log(`\n<--------- ${JSON.stringify(response, null, 2)} ---------->\n`);
    },
    getCouchLists () {
      console.log(`getCouchLists`);
      const res = couchTools.get(process.env.CYPRESS_CH_SCRAPERCONTROL);
      console.log(`\n<------------------->\n`);
      return res;
    },
    updateCouch (cmd) {
      const { action, list, value } = cmd;
      // console.log(`UPDATE Couch ${JSON.stringify(cmd, null, 2)}`);
      couchTools.get(process.env.CYPRESS_CH_SCRAPERCONTROL).then((rec) => {
        const theList = rec[list];
        // console.log(`UPDATE Couch record ${JSON.stringify(rec, null, 2)}`);
        switch (action) {
          case 'delete':
            rec[list] = theList.filter((e) => {
              console.log(`${e} vs ${value}`);
              return e !== value;
            });
            console.log(`UPDATE Couch record ${JSON.stringify(rec, null, 2)}`);
            couchTools.update(rec).then((res) => {
              console.log(`Result  '${JSON.stringify(res, null, 2)}'`);
            });
            break;
          case 'update':
            console.log(`Update '${list}' with '${value}'`);
            break;
          default:
            console.log(`No such action: ${action}`);
        }

      });
      return null;
    },
    saveToCouch (rec) {
      console.log(`Save to Couch ${JSON.stringify(rec, null, 2)}`);
      const res = couchTools.save(rec);
      console.log(`Save to Couch ${JSON.stringify(res, null, 2)}`);

      // console.log(`\n-------------------\n${JSON.stringify(opts, null, 2)}\n-------------------`);

      return null;
    },
  });

}
