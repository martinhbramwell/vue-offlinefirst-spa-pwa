import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import routes from './routes';

// import qr from './qr';
// import pdf from './pdf';
import labeler from './labeler';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const app = express();
app.disable('x-powered-by');

// View engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev', {
  skip: () => app.get('env') === 'test'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', routes);

// Request
app.get('/lbl', labeler);
// app.get('/pdf', (req, res) => {
//   LG('DOING');
//   const codes = ['IBAA001', 'IBCC001', 'IBCC002'];
//   if (!fs.existsSync(tmpDir)){
//     fs.mkdirSync(tmpDir);
//   }
//   if (!fs.existsSync(bottlesListPath)){
//     res.send(`File not found :: ${bottlesListPath}`);
//   } else {
//     const codeFiles = codes.map(code => ({ code, file: `${tmpDir}/${code}.png` }));
//     qr(codeFiles);
//     pdf(codeFiles);
//     res.send(`Did codes :: ${codes}`);
//   }
// });

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
      message: err.message
    });
});


// // Request
// app.get('/pdf', (req, res) => {
//   LG('DOING');
//   const codes = ['IBAA001', 'IBCC001', 'IBCC002'];
//   if (!fs.existsSync(tmpDir)){
//     fs.mkdirSync(tmpDir);
//   }
//   if (!fs.existsSync(bottlesListPath)){
//     res.send(`File not found :: ${bottlesListPath}`);
//   } else {
//     const codeFiles = codes.map(code => ({ code, file: `${tmpDir}/${code}.png` }));
//     qr(codeFiles);
//     pdf(codeFiles);
//     res.send(`Did codes :: ${codes}`);
//   }
// });

export default app;
