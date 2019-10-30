import fs from 'fs';
import EventEmitter from 'events';

import nodemailer from 'nodemailer';

import { createLogger, format, transports } from 'winston';

import badEmailAddresses from '../badEmailAddresses';

const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const {
  combine,
  timestamp,
  label,
  printf,
} = format;


export const fechaLong = fecha => (new Date(fecha)).toLocaleDateString('es-ES',
  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}); // eslint-disable-line object-curly-spacing, object-curly-newline

export const fechaShort = fecha => (new Date(fecha)).toLocaleDateString('fr-CA').split('/').join('-');

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


export const mailCfg = {
  service: 'gmail',
  send_to: process.env.SEND_TO,
  send_from: process.env.SEND_FROM,
  send_sender: process.env.SEND_SENDER,
  send_bcc: process.env.SEND_BCC,
  send_replyto: process.env.SEND_REPLYTO,
  auth: {
    user: process.env.MAILERUID,
    pass: process.env.MAILERPWD,
  },
};

export const getMailer = nodemailer.createTransport(mailCfg);

/* eslint-disable no-useless-escape */
export const validateEmail = (email) => {
  if (badEmailAddresses.includes(email)) return false;
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
/* eslint-enable no-useless-escape */

export const logDir = '/tmp/pouchLog';

const stream = fs.createWriteStream(logDir, { flags: 'a' });
stream.on('error', () => stream.end());
// var LG = (msg) => (stream.write(`${msg}
// `));

// export const logger = msg => (stream.write(`${msg}
// `));
const myFormat = printf(info => `\n${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);

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

export const booleanVal = (val) => {
  if (val) {
    if (typeof val === 'string') {
      return (val.toLowerCase() === 'true');
    }
    return val;
  }
  return false;
};

export const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

export class Queue {
  constructor(emitter, ...elements) {
    this.elements = [...elements];
    this.emitter = emitter;
  }

  push(...args) {
    const itm = this.elements.push(...args);
    if (this.emitter) this.emitter.emit('itemAdded');
    return itm;
  }

  shift(...args) {
    return this.elements.shift(...args);
  }

  includes(item) {
    return this.elements.includes(item);
  }

  get length() {
    return this.elements.length;
  }

  set length(length) {
    return this.elements.length = length; // eslint-disable-line no-return-assign
  }
}

class Emitter extends EventEmitter {}
const queueEmitter = new Emitter();
export const emitters = {
  queueEmitter,
};
