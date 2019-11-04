import fs from 'fs';
import XLSX from 'xlsx';

import { logger as LG } from '../../../utils'; // eslint-disable-line no-unused-vars
import { databaseLocal as db } from '../../../database'; // eslint-disable-line no-unused-vars

const CLG = console.log; // eslint-disable-line no-unused-vars, no-console
const CLE = console.error; // eslint-disable-line no-unused-vars, no-console
const CDR = console.dir; // eslint-disable-line no-unused-vars, no-console

const monthNames = {
  ene: { name: 'Enero', number: 1 },
  feb: { name: 'Febrero', number: 2 },
  mar: { name: 'Marzo', number: 3 },
  abr: { name: 'Abril', number: 4 },
  may: { name: 'Mayo', number: 5 },
  jun: { name: 'Junio', number: 6 },
  jul: { name: 'Julio', number: 7 },
  ago: { name: 'Agosto', number: 8 },
  sep: { name: 'Septiembre', number: 9 },
  oct: { name: 'Octubre', number: 10 },
  nov: { name: 'Noviembre', number: 11 },
  dic: { name: 'Diciembre', number: 12 },
};

const convertMonthCode = (mth) => {
  const mthObj = { code: mth };
  const result = Object.assign(mthObj, monthNames[mth.slice(0, 3)]);
  return result;
};
function defineMonth(monthCode) {
  const month = convertMonthCode(monthCode);
  const year = monthCode.slice(3, 5);
  const fullYear = `20${year}`;
  const nextMonth = ((month.number) % 12) + 1;
  const nextYear = `20${month.number === 12 ? parseInt(year, 10) + 1 : year}`;
  return {
    fullName: month.name,
    fullYear,
    monthStart: `${fullYear}-${month.number.toString().padStart(2, '0')}-01 00:00:00`,
    nextMonthStart: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01 00:00:00`,
  };
}

const listReports = (req, res) => {
  const url = `${req.protocol}://${req.headers.host}${req.url}`;
  res.set('Content-Type', 'text/html');
  res.write('<html><body>');

  res.write('</br><h1>Reportes de facturación por mes</h1>');
  res.write('</br>');
  res.write('<ul>');
  res.write('   <li>');
  res.write('     <h2>2019</h2>');
  res.write('     <ul>');
  res.write(`       <li><a href="${url}?mes=ago19">Agosto</a></li>`);
  res.write(`       <li><a href="${url}?mes=sep19">Septiembre</a></li>`);
  res.write(`       <li><a href="${url}?mes=oct19">Octubre</a></li>`);
  res.write(`       <li><a href="${url}?mes=nov19">Noviembre</a></li>`);
  res.write(`       <li><a href="${url}?mes=dic19">Diciembre</a></li>`);
  res.write('     </ul>');
  res.write('   </li>');
  res.write('   <li>');
  res.write('     <h2>2020</h2>');
  res.write('     <ul>');
  res.write(`       <li><a href="${url}?mes=ene20">Enero</a></li>`);
  res.write(`       <li><a href="${url}?mes=feb20">Febrero</a></li>`);
  res.write(`       <li><a href="${url}?mes=mar20">Marzo</a></li>`);
  res.write(`       <li><a href="${url}?mes=abr20">Abril</a></li>`);
  res.write(`       <li><a href="${url}?mes=may20">Mayo</a></li>`);
  res.write(`       <li><a href="${url}?mes=jun20">Junio</a></li>`);
  res.write(`       <li><a href="${url}?mes=jul20">Julio</a></li>`);
  res.write('    </ul>');
  res.write('  </li>');
  res.write('</ul>');

  res.write('</body></html>');
  res.end();
};


const generateXlsxFromJson = (invoices, month) => {
  // CDR(invoices);

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: 'SheetJS Tutorial',
    Subject: 'Test',
    Author: 'Iridium Blue Water',
    CreatedDate: new Date(2017, 12, 19),
  };

  const colName = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const totalsRow = 2;
  const titlesRow = totalsRow + 1;

  const startCol = 4;
  const numberOfCols = 3;
  const startRow = titlesRow + 1;
  const numberOfRows = invoices.length;

  const ws = XLSX.utils.json_to_sheet([{ A: `REPORTE FACTURACIÓN ${month.fullName} ${month.fullYear}` }], { header: ['A'], skipHeader: true });
  ws['A1'].t = 'r'; // eslint-disable-line dot-notation
  // const ws = XLSX.utils.aoa_to_sheet([['REPORTE FACTURACIÓN AGOSTO 2019']]);
  XLSX.utils.sheet_add_aoa(ws, [['TOTALES', '', '', '', '$0.00', '$0.00', '$0.00']], { origin: `A${totalsRow}` });
  XLSX.utils.sheet_add_json(ws, invoices, { origin: `A${titlesRow}` });
  for (let cc = startCol; cc < startCol + numberOfCols; cc += 1) {
    for (let rr = startRow; rr < startRow + numberOfRows; rr += 1) {
      // CLG(`Alter ${colName[cc]}${rr}`);
      ws[`${colName[cc]}${rr}`].t = 'n';
      ws[`${colName[cc]}${rr}`].z = '#,##0.00;[Red](#,##0.00)';
      // CDR(ws[`${colName[cc]}${rr}`]);
    }
  }
  ws['!merges'] = [{ s: { r: 0, c: 6 }, e: { r: 0, c: 7 } }];
  ws['!cols'] = [{ wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 10 }];
  for (let cc = startCol; cc < startCol + numberOfCols; cc += 1) {
    ws[`${colName[cc]}${totalsRow}`] = { t: 'n', f: `SUM(${colName[cc]}${startRow}:${colName[cc]}${startRow + numberOfRows - 1})`, z: '#,##0.00;[Red](#,##0.00)' }; // eslint-disable-line dot-notation
  }

  CDR(ws['A1']); // eslint-disable-line dot-notation
  XLSX.utils.book_append_sheet(wb, ws, `${month.fullName} ${month.fullYear}`);

  return wb;
};

export default async (req, res) => {
  CLG(`invoicesByMonth.js ${JSON.stringify(req.query, null, 2)}`);
  const reportsLocation = '/opt/ibReports/invoices';
  if (req.query.mes) {
    const defMonth = defineMonth(req.query.mes);
    const fullMonthName = `${defMonth.fullName}_${defMonth.fullYear}`;
    CLG(`defMonth = ${JSON.stringify(defMonth, null, 2)}`);
    const filePath = `${reportsLocation}/Facturacion_${fullMonthName}.xlsx`;
    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          CLG(`ERR = ${err}`);
        } else {
          CLG('Download OK');
        }
      });
    } else {
      res.set('Content-Type', 'text/html');
      res.write('<html><body>');
      res.write(`</br>Processing JSON : ${fullMonthName}`);

      let invoices = null;
      try {
        const result = await db.allDocs({
          include_docs: true,
          attachments: false,
          startkey: 'Invoice_1',
          endkey: 'Invoice_9',
        });
        const invoiceRecords = result.rows.filter((row) => {
          const { fecha } = row.doc.data;
          return fecha > defMonth.monthStart && fecha < defMonth.nextMonthStart;
        });
        // CDR(invoiceRecords);
        invoices = invoiceRecords.map((rec) => {
          const { data: d } = rec.doc;
          return {
            'Nº FACTURA ELECTRÓNICA': d.codigo,
            CLIENTE: d.nombreCliente,
            FECHA: d.fecha,
            'RUC/CI': d.legalId,
            SUBTOTAL: d.subTotal,
            IVA: d.totalImpuesto,
            TOTAL: d.total,
          };
        });
        CDR(invoices[0]);
      } catch (err) {
        CDR(err);
      }

      // const jsonPath = `${reportsLocation}/Facturacion_${fullMonthName}`;
      // const invoices = require(jsonPath).map(x => x.value);
      // eslint-disable-line no-unused-vars, global-require, import/no-dynamic-require, max-len
      const workbook = generateXlsxFromJson(invoices, defMonth);
      XLSX.writeFile(workbook, `${reportsLocation}/Facturacion_${fullMonthName}.xlsx`, { type: 'file' });

      res.write('</body></html>');
      res.end();
    }
  } else {
    listReports(req, res);
  }
};
