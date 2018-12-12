const LG = console.log; // eslint-disable-line no-unused-vars, no-console

const dbServerProtocol = process.env.VUE_APP_COUCH_PROTOCOL;
const dbServerURI = process.env.VUE_APP_COUCH_URI;
const databaseName = process.env.VUE_APP_COUCH_NAME;

export default {
  // NODE 4 server: 'https://wt-a0a68818c7b34a465e865e888dc419c9-0.run.webtask.io/webtasksso',
  server: 'https://wt-a0a68818c7b34a465e865e888dc419c9-0.sandbox.auth0-extend.com/webtasksso',
  authPath: '/authentication/google/start',
  tokenTimeToLive: 20000, // 10m * 60s * 1000ms
  tokenName: 'tkn',
  activityName: 'actv',
  authName: 'authd',
  returnRouteName: 'retRoute',
  localStorageNameSpace: 'vuesppwa-',
  productionTip: false,
  testAuthUrlEnvVar: 'AUTH_TEST_URL', // 'process.env.TEST_TOKEN'
  logger: {
    // required ['debug', 'info', 'warn', 'error', 'fatal']
    // logLevel: 'debug',
    logLevel: 'info',
    // optional: defaults to false if not specified
    stringifyArguments: false,
    // optional: defaults to false if not specified
    showLogLevel: true,
    // optional: defaults to false if not specified
    showMethodName: true,
    // optional: defaults to '|' if not specified
    separator: '|',
    // optional: defaults to false if not specified
    showConsoleColors: true,
  },
  version: '0.0.102',
  //  dbServerProtocol: 'https',
  //  dbServerURI: 'yourdb.yourpublic.work',
  //  databaseName: 'ib2018_103',
  dbServerProtocol,
  dbServerURI,
  databaseName,

};
