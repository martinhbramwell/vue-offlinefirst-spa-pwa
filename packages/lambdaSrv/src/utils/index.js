import fs from 'fs';
import { createLogger, format, transports } from 'winston';

const {
  combine,
  timestamp,
  label,
  printf,
} = format;


const padVal = (pad, val) => (pad + val).substring(val.length);

const tightDate = () => {
  const d = new Date();
  let dt = '';
  dt += d.getYear() - 100;
  dt += padVal('00', (1 + d.getMonth()).toString());
  dt += padVal('00', d.getDate().toString());


  dt += padVal('00', d.getHours().toString());
  dt += padVal('00', d.getMinutes().toString());
  dt += padVal('00', d.getSeconds().toString());
  // dt += padVal('00', rand.toString());

  const ret = parseInt(`${dt}`, 16);
  return ret;
};

function unique() {
  const number = tightDate();
  unique.old = (number > unique.old) ? number : unique.old += 1;
  return unique.old;
}
unique.old = 0;


function ID() {
  return unique();
}

//  This has not been tested or even used yet
export const waitFor = (conditionFunction) => {
  const poll = (resolve) => {
    if (conditionFunction()) {
      resolve();
    } else {
      setTimeout(() => poll(resolve), 400);
    }
  };
  return new Promise(poll);
};

export const generateMovementId = user => `${ID()}${user}`;

export const logDir = '/tmp/pouchLog';

const stream = fs.createWriteStream(logDir, { flags: 'a' });
stream.on('error', () => stream.end());
// var LG = (msg) => (stream.write(`${msg}
// `));

// export const logger = msg => (stream.write(`${msg}
// `));
const myFormat = printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);

export const logger = createLogger({
  format: combine(
    label({ label: 'CouchDB Supervisor' }),
    timestamp(),
    myFormat,
  ),
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: logDir, level: 'debug' }),
  ],
});
