import fs from 'fs';

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

  const ret = parseInt(`${dt}`, 10);
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

export const generateMovementId = user => `${user}${ID()}`;

const stream = fs.createWriteStream("/tmp/pouchLog", {flags:'a'});
stream.on('error', err => stream.end());
// var LG = (msg) => (stream.write(`${msg}
// `));

export const logger = (msg) => (stream.write(`${msg}
`));
