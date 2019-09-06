import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import routes from './routes';
import root from './modules/root';
import invoices from './modules/invoices';
import deliveryNotes from './modules/deliveryNotes';

import dbMonitor from './database';
import quickTest from './qtst';

// import validations from './validations'; // eslint-disable-line no-unused-vars
import { logger as LG } from './utils'; // eslint-disable-line no-unused-vars


const app = express();
app.disable('x-powered-by');

// View engine setup
app.set('views', [__dirname + '/../views', __dirname + '/modules']);

app.set('view engine', 'pug');

app.use(logger('dev', {
  skip: () => app.get('env') === 'test',
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', routes);
app.use('/a', root);
app.use('/a/factura', invoices);
app.use('/a/guia', deliveryNotes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res
    .status(err.status || 500)
    .render('error', {
      message: err.message,
    });
});

dbMonitor();
quickTest();
// validations();
// LG(`Got ${dbMonitor()}`);

export default app;
