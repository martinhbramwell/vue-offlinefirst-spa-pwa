const LG = console.log; // eslint-disable-line no-unused-vars, no-console
const LGERR = console.error; // eslint-disable-line no-unused-vars, no-console

export default {
  replicateOut: (dbMgr, replicatorOptions) => {
    const {
      filterText,
      dbMaster,
      dbName,
      user,
    } = replicatorOptions;

    const pouchOptions = {
      live: true,
      retry: true,
      filter: doc => doc._id.substring(0, filterText.length) === filterText, // eslint-disable-line max-len, no-underscore-dangle, no-param-reassign
      // query_params: { agent: user.name },
    };

    dbMgr.replicate.to(dbMaster, pouchOptions)
      .on('change', (info) => {
        window.lgr.info(`${dbName}/${filterText} **********  OUTGOING REPLICATION DELTA ********* `);
        const shortList = info.change.docs.filter(doc => (!doc.data) || (doc.data.type !== 'person' && doc.data.type !== 'bottle'));
        shortList.forEach((doc) => {
          window.lgr.debug(`DOC :: ${JSON.stringify(doc, null, 2)}`);
        });
      })
      .on('paused', () => {
        window.lgr.info(`${dbName}/${filterText} **********  OUTGOING REPLICATION ON HOLD ********* ${user.name}`);
        dbMgr.allDocs({
          include_docs: true,
          attachments: true,
        }).then((result) => {
          window.lgr.debug(`allDocs fetch result ${JSON.stringify(result, null, 2)}`);
        }).catch((err) => {
          window.lgr.error(`allDocs fetch failure ${err}`);
        });
      })
      .on('active', () => {
        window.lgr.info(`${dbName}/${filterText} **********  OUTGOING REPLICATION RESUMED *********`);
      })
      .on('denied', (info) => {
        window.lgr.info(`${dbName}/${filterText} **********  OUTGOING REPLICATION DENIED ********* ${info}`);
      })
      .on('error', err => window.lgr.error(`${dbName}/${filterText} OUTGOING REPLICATION FAILURE ************ ${err}`));
  },

  replicateIn: () => {
    LG(`




      ReplicateIn not implemented




      `);
  },
};
