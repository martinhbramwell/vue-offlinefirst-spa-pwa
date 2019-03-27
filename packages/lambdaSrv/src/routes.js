import { Router } from 'express';

import validations from './validations';
import inspectDesignDocs from './inspections/inspectDesignDocs';

import deleteRange from './admin/deleteRange';
import manageInvoices from './admin/manageInvoices';
import scrapeInv from './admin/cypress/scrapeInv';

import inspectInvoices from './inspections/inspectInvoices';
import inspectPersons from './inspections/inspectPersons';
import inspectTest from './inspections/inspectTest';

const routes = Router();
const BY_BOTTLE = 'byBottle';

/**
 * GET home page
 */
routes.get('/', (req, res) => {
  res.render('index', { title: 'Express Babel' });
});

/**
 * GET experiments page
 */
routes.get('/exp', (req, res) => {
  res.render('index', { title: 'Running experiment. See log file and terminal output.' });
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


routes.get('/inspect', (req, res, next) => {
  inspectDesignDocs(req, res, next);
});

routes.get('/invoices', (req, res, next) => {
  inspectInvoices(req, res, next);
});

routes.get('/try', (req, res, next) => {
  inspectTest(req, res, next);
});

routes.get('/persons', (req, res, next) => {
  inspectPersons(req, res, next);
});

routes.get('/gestionDeFacturas', (req, res, next) => {
  manageInvoices(req, res, next);
});

routes.post('/gdf', (req, res) => {
  res.redirect('/gestionDeFacturas');
});

routes.post('/gestionDeFacturas', (req, res, next) => {
  manageInvoices(req, res, next);
});

routes.get('/scrapeInv', (req, res, next) => {
  scrapeInv(req, res, next);
});

routes.get('/deleteRange', (req, res, next) => {
  deleteRange(req, res, next);
});

export default routes;
