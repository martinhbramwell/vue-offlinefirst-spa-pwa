import { Router } from 'express';
import queue from 'queue';

import validations from './validations';
import { logger } from './utils';

const routes = Router();
const BY_BOTTLE = 'byBottle';

/**
 * GET home page
 */
routes.get('/', (req, res) => {
  res.render('index', { title: 'Express Babel' });
});

function seven(fat) {
  logger.info(`job 7: ${fat}`)
}
/**
 * GET experiments page
 */
routes.get('/exp', (req, res) => {
  res.render('index', { title: 'Running experiment. See log file and terminal output.' });

  const labelMarker = '//|';
  const jobTimeout = 5000;

  const q = queue()
  q.autostart = true
  q.timeout = jobTimeout

  q.on('timeout', function (next, job) {
    logger.error(`\n      ************\n
      job timed out: ${job.toString().split(labelMarker)[1]}\n
      *********\n`)
  })

  // get notified when jobs complete
  q.on('success', function (result, job) {
    logger.info(`job finished processing: ${job.toString().split("//|")[1]}`)
  })


  const results = []


  // begin processing, get notified on end / failure
  q.start()

  // add jobs using the familiar Array API
  q.push((cb) => {
    //| JOB TWO //|
    results.push('two')
    cb()
  })

  q.push(
    function (cb) {
    //| JOB FOUR //|
      results.push('four')
      cb()
    },
    function (cb) {
    //| JOB FIVE //|
      results.push('five')
      cb()
    }
  )

  // jobs can accept a callback or return a promise
  q.push(function () {
    return new Promise(function (resolve, reject) {
    //| JOB TWO 2 //|
      results.push('two2')
      resolve()
    })
  })

  q.unshift(function (cb) {
    //| JOB ONE //|
    results.push('one')
    cb()
  })

  q.splice(2, 0, function (cb) {
    //| JOB THREE //|
    results.push('three')
    cb()
  })

  // use the timeout feature to deal with jobs that
  // take too long or forget to execute a callback

  q.push(function (cb) {
    //| JOB SLOW  //|
    setTimeout(function () {
      logger.info('slow job finished')
      cb()
    }, 4000)
  })

  q.push(function (cb) {
    //| JOB WITH NO CALLBACK //|

    logger.info('forgot to execute callback')
  })


  // // begin processing, get notified on end / failure
  // q.start(function (err) {
  //   if (err) throw err
  //   logger.info(`all done: ${results}`)
  // })

  q.push((cb) => {
    //| JOB SIX //|
    results.push('six')
    cb()
  })

  q.push((cb) => {
    //| JOB SEVEN //|
    results.push('seven')
    seven('bitch')
    cb()
  });

});


routes.get(`/${BY_BOTTLE}`, (req, res, next) => { // eslint-disable-line no-unused-vars
  const title = 'Analyzing by bottle number ....!...';
  const outputFile = '/tmp/resultsByBottle.txt';
  res.render(BY_BOTTLE, { title, outputFile });
  validations();
});

/**
 * GET /byBottle
 *
 * This is a sample route demonstrating
 * a simple approach to error handling and testing
 * the global error handler. You most certainly want to
 * create different/better error handlers depending on
 * your use case.
 */
routes.get('/list', (req, res, next) => { // eslint-disable-line no-unused-vars
  const { title } = req.query;

  if (title == null || title === '') {
    // You probably want to set the response HTTP status to 400 Bad Request
    // or 422 Unprocessable Entity instead of the default 500 of
    // the global error handler (e.g check out https://github.com/kbariotis/throw.js).
    // This is just for demo purposes.
    next(new Error('The "title" parameter is required'));
    return;
  }

  res.render('index', { title });
});

export default routes;
