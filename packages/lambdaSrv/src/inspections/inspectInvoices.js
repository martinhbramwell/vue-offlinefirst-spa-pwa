import { databaseLocal } from '../database';

import { logger as LG } from '../utils'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const HEAD = `<head>
  <style>
  #facturas {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }

  #facturas td, #facturas th {
    border: 1px solid #ddd;
    padding: 8px;
  }

  #facturas tr:nth-child(even){background-color: #336600;}

  #facturas tr:hover {background-color: #ddd;}

  #facturas th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #4CAF50;
    color: white;
  }

  td.fecha {
      width: 1%;
      white-space: nowrap;
  }

  </style>
</head>`;

/* e s l int-disable max-len, indent, no-unused-vars, object-curly-newline */
export default async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write('<!DOCTYPE html><html>');
  res.write(HEAD);

  res.write('<body text="lightyellow" bgcolor="#000007"><font face="Arial, Helvetica, sans-serif">');

  if (req && req.query && req.query.f && req.query.l) {
    res.write(`Invoices from #${req.query.f} to  #${req.query.l}`);

    try {
      const invoices = await databaseLocal.allDocs({
        include_docs: true,
        attachments: true,
        startkey: '00_SpecialFix',
        // startkey: 'Invoice_1',
        endkey: 'Invoice_2',
      });

      // CDR(invoices.rows);

      let sep = '    ';
      res.write('<pre>{ "docs": [</pre>');


      const range = invoices.rows.filter((inv) => {
        const first = parseInt(req.query.f, 10);
        const last = parseInt(req.query.l, 10);
        let cmp = 0;
        if (inv && inv.doc && inv.doc.data) {
          const d = inv.doc.data;
          const bapu = parseInt(d.seqib, 10);
          const ib = parseInt(d.sequential, 10);
          const type = typeof req.query.c === 'undefined' ? '' : req.query.c;

          cmp = type === 'BAPU' ? bapu : ib;
        }
        return (first <= cmp) && (cmp <= last);
      });

      // CDR(range);

      range.forEach((_invoice) => {
        const invoice = _invoice;
        delete invoice.doc._rev; // eslint-disable-line no-underscore-dangle
        res.write(`<pre>${sep}`);
        res.write(JSON.stringify(invoice.doc));
        res.write('</pre>');
        sep = '    , ';
      });

      res.write(`<pre>  ]
}</pre>`);
    } catch (err) {
      res.write(`<br /></div>Query error ::  ${JSON.stringify(err, null, 2)}</div>`);
    }
  } else {
    const url = `${req.protocol}://${req.headers.host}${req.url}`;
    res.write(`Usage: </br> &nbsp; &nbsp; &nbsp;
      <a href="${url}?f=20&l=24">${url}?f=20&l=24</a>  </br> &nbsp; &nbsp; &nbsp;
       &nbsp; &nbsp; &nbsp;OR  </br> &nbsp; &nbsp; &nbsp;
      <a href="${url}?f=11371&l=011373&c=BAPU">${url}?f=11371&l=011373&c=BAPU</a>
      `);
  }

  res.write('</body></html>');
  res.end();
};
