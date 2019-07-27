import PDF from 'pdfkit';
import fs from 'fs-extra';
import QRCode from 'qrcode';
// import fontkit from 'fontkit';

import fontdims from './fontdims';

import { fechaShort as shortDate } from '../../utils'; // eslint-disable-line no-unused-vars

/* eslint-disable no-console, no-unused-vars */
const CLG = console.log;
const CER = console.error;
const CDR = console.dir;
/* eslint-enable no-console, no-unused-vars */

const cm2in = 0.3937;
const in2cm = 2.54;
const ppiPerIn = 72;
const pdfInch = 2.45;
const adjuster = in2cm / pdfInch;

const pixelsPerPdfInch = ppiPerIn * adjuster;
const cm2ppi = pixelsPerPdfInch * cm2in;
const CNV = cm => parseInt(cm2ppi * (cm / 10), 10);

const WA = 10000 / 10347;
const HA = 15000 / 15508;

const VE = CNV(10) * HA;
const HE = CNV(20) * WA;

const fntRegular = './public/fonts/SourceSansPro-Regular.ttf';
const fntRegItalic = './public/fonts/SourceSansPro-RegularItalic.ttf';
const fntBold = './public/fonts/SourceSansPro-Bold.ttf';
const fntSemiBoldItalic = './public/fonts/SourceSansPro-SemiBoldItalic.ttf';

const showCornerMarkers = false;
// const showCornerMarkers = true;

const placeLogo = (doc, dims) => {
  const { top, left, width, height } = dims; // eslint-disable-line object-curly-newline
  doc.image('./public/images/LogiChemLogo.png',
    HE + CNV(top), VE + CNV(left),
    { fit: [CNV(width) * WA, CNV(height) * HA], align: 'left', valign: 'center' });
};


const placeVendorBox = (doc, dims) => {
  const { top, left, width, height } = dims; // eslint-disable-line object-curly-newline
  // CDR(dims);

  const y = VE + CNV(top);
  const x = HE + CNV(left);
  const w = CNV(width) * WA;
  const h = CNV(height) * HA;

  const lpad = 6;
  const tpad = 2;

  const lineSp = 14;

  doc.lineJoin('miter').roundedRect(x, y, w, h, 8).stroke();

  const colAx = x + lpad;
  const line1 = y + tpad;
  doc.font(fntRegular)
    .text(process.env.RAZONSOCIAL, colAx, line1);

  const line2 = line1 + lineSp;
  const midW = w - 2 * lpad;
  doc.moveDown(0.4);
  doc.font(fntSemiBoldItalic, 16)
    .text(process.env.NOMBRECOMERCIAL, colAx, line2,
      { width: midW, align: 'center' });

  const line3 = line2 + 22;
  const colAw = CNV(13) * HA;
  doc.font(fntRegItalic, 8)
    .text('Dirección Matriz:', colAx, line3,
      { width: colAw, align: 'left' });

  const colBw = midW - colAw;
  const colBx = x + colAw;
  doc.font(fntRegular, 8)
    .text(process.env.DIRMATRIZ, colBx, line3,
      { width: colBw, align: 'right' });


  const line4 = line3 + 22;
  doc.font(fntRegItalic, 8)
    .text('Dirección Sucursal:', colAx, line4,
      { width: colAw, align: 'left' });

  doc.font(fntRegular, 8)
    .text(process.env.DIRESTABLECIMIENTO, colBx, line4,
      { width: colBw, align: 'right' });


  const line5 = line4 + 22;
  doc.font(fntRegItalic, 8)
    .text('    Obligado a Llevar Contabilidad:', colAx, line5,
      { continued: true })
    .font(fntBold, 8)
    .text('           SI');
};

const placeSriBox = (doc, dims, invoice, qrcode) => {
  const { top, left, width, height } = dims; // eslint-disable-line object-curly-newline

  const inv = invoice;
  const { data: d } = inv;

  const y = VE + CNV(top);
  const x = HE + CNV(left);
  const w = CNV(width) * WA;
  const h = CNV(height) * HA;

  const lpad = 10;
  const tpad = 8;

  // const lineSp = 14;

  doc.lineJoin('miter')
    .roundedRect(x, y, w, h, 8)
    .stroke();

  const colAx = x + lpad;
  const line1 = y + tpad;
  const colAw = CNV(14) * HA;

  doc.font(fntRegItalic, 14)
    .text('R.U.C. :', colAx, line1,
      { width: colAw, align: 'left' });

  const midW = w - 2 * lpad;

  const colBw = midW - colAw;
  const colBx = x + colAw;
  doc.font(fntRegular, 16)
    .text(process.env.RUC, colBx, line1,
      { width: colBw, align: 'right' });


  const line2 = line1 + 18;
  doc.font(fntSemiBoldItalic, 16)
    .text('FACTURA', colAx, line2,
      { width: midW, align: 'center' });


  const line3 = line2 + 22;
  doc.font(fntRegItalic, 12)
    .text('Numero de Factura :', colAx, line3,
      { align: 'left' });

  doc.font(fntRegular, 12)
    .text(d.codigo, colBx, line3,
      { width: colBw, align: 'right' });


  const line4 = line3 + 22;
  doc.font(fntRegItalic, 12)
    .text('Numero de Autorización :', colAx, line4,
      { align: 'left' });

  const line5 = line4 + 16;
  doc.font(fntRegular, 8)
    .text(inv.accessKey, colAx, line5,
      { align: 'right' });


  const line6 = line5 + 22;
  doc.font(fntRegItalic, 12)
    .text('Fecha y Hora de Autorización :', colAx, line6,
      { align: 'left' });

  doc.font(fntRegular, 12)
    .text(inv.authorized.replace('T', ' ').slice(0, 16), colBx, line6,
      { width: colBw, align: 'right' });

  const line7 = line6 + 12;
  doc.image(qrcode, colBx + CNV(20), line7,
    { fit: [90, 90], align: 'center', valign: 'center' });
};

const placeBuyerBox = (doc, dims, invoice) => {
  const { top, left, width, height } = dims; // eslint-disable-line object-curly-newline

  const inv = invoice;
  const { data: d } = inv;

  const y = VE + CNV(top);
  const x = HE + CNV(left);
  const w = CNV(width) * WA;
  const h = CNV(height) * HA;

  const lpad = 10;
  const tpad = 8;

  doc.lineJoin('miter')
    .roundedRect(x, y, w, h, 8)
    .stroke();

  const midW = w - 2 * lpad;
  const colAx = x + lpad;
  const colAw = (w / 2) - (4 * lpad);
  const colBx = x + colAw + (4 * lpad);
  const colBw = (w / 2) - lpad;

  let line = 0;
  let font = 0;

  line += y + tpad;
  font = 16;
  doc.font(fntSemiBoldItalic, font)
    .text('CLIENTE', colAx, line,
      { width: midW, align: 'left' });


  line += font + 4;
  font = 14;
  doc.font(fntRegItalic, font)
    .text('Nombre o Razon Social :', colAx, line,
      { width: midW, align: 'left' });

  font = 16;
  doc.font(fntRegular, font)
    .text(d.nombreCliente, colAx, line,
      { width: midW, align: 'right' });


  line += font + 6;
  font = 12;
  doc.font(fntRegItalic, font)
    .text('Fecha :', colAx, line,
      { width: colAw, align: 'left' });

  doc.font(fntRegular, font)
    .text(d.fecha.slice(0, 10), colAx, line,
      { width: colAw, align: 'right' });

  doc.font(fntRegItalic, font)
    .text('Identificación :', colBx, line,
      { width: colBw, align: 'left' });

  doc.font(fntRegular, font)
    .text(d.legalId.replace('[', '').replace(']', ''), colBx, line,
      { width: colBw, align: 'right' });


  line += font + 6;
  doc.font(fntRegItalic, font)
    .text('Email :', colAx, line,
      { width: colAw, align: 'left' });

  doc.font(fntRegular, font)
    .text(d.email, colAx, line,
      { width: colAw, align: 'right' });

  doc.font(fntRegItalic, font)
    .text('Telefono :', colBx, line,
      { width: colBw, align: 'left' });

  doc.font(fntRegular, font)
    .text(d.telefono, colBx, line,
      { width: colBw, align: 'right' });


  line += font + 6;
  doc.font(fntRegItalic, font)
    .text('Dirección :', colAx, line,
      { width: midW, align: 'left' });

  doc.font(fntRegular, font)
    .text(d.direccion, colAx, line,
      { width: midW, align: 'right' });
};

const cellVal = (name, item) => {
  let rtrn = null;
  switch (name) {
    case 'Cod. Principal':
      rtrn = item.idItem;
      break;
    case 'Cod. Auxiliar':
      rtrn = '';
      break;
    case 'Cantidad':
      rtrn = item.cantidad;
      break;
    case 'Descripción':
      rtrn = item.nombreProducto;
      break;
    case 'Detalle Adicional':
      rtrn = '';
      break;
    case 'Precio Unitario':
      rtrn = parseFloat(item.precio).toFixed(2);
      break;
    case 'Subsidio':
      rtrn = 0;
      break;
    case 'Precio sin Subsidio':
      rtrn = 0;
      break;
    case 'Descuento':
      rtrn = 0;
      break;
    case 'Precio Total':
      rtrn = (item.precio * item.cantidad).toFixed(2);
      break;
    default:
      // code block
  }

  return rtrn;
};

const prepareTableHeader = () => [
  [
    'Cod. Principal',
    'Cod. Auxiliar',
    'Cantidad',
    'Descripción',
    'Detalle Adicional',
    'Precio Unitario',
    'Subsidio',
    'Precio sin Subsidio',
    'Descuento',
    'Precio Total',
  ],
  [
    'Cod.',
    'Cod.',
    '',
    '',
    'Detalle',
    'Precio',
    '',
    'Precio sin',
    '',
    'Precio',
  ],
  [
    'Principal',
    'Auxiliar',
    'Cantidad',
    'Descripción',
    'Adicional',
    'Unitario',
    'Subsidio',
    'Subsidio',
    'Descuento',
    'Total',
  ],
];

const prepareDataTable = (invoiceData) => {
  const table = prepareTableHeader();
  invoiceData.itemes.forEach((item) => {
    const dataRow = [];
    table[0].forEach((column) => {
      dataRow.push(cellVal(column, item));
    });
    table.push(dataRow);
  });
  return table;
};

const prepareWidthsList = (table, font, size, cellpad) => {
  const rows = [];
  for (let ix = 1; ix < table.length; ix += 1) {
    const widths = [];
    for (let iy = 0; iy < table[0].length; iy += 1) {
      widths.push(fontdims(font, size, table[ix][iy]) + 2 * cellpad);
    }
    rows.push(widths);
  }

  const widest = Array(table[0].length).fill(0);
  rows.forEach((row) => {
    let col = 0;
    row.forEach((clmn) => {
      widest[col] = widest[col] > clmn ? widest[col] : clmn;
      col += 1;
    });
  });

  return widest;
};

const prepareAdjustedWidthsList = (blockWidth, widths) => {
  const adj = blockWidth * (154.63 / (154.63 + 4.38));
  const roughWidth = widths.reduce((a, c) => a + c);
  const scale = adj / (CNV(roughWidth) * WA);
  const fixedWidths = widths.map(c => CNV(c * scale));
  return fixedWidths;
};

const prepareLeftEdgesList = (widths, left) => {
  const edges = [];

  // Accumulate volumn widths to edge positions
  const lastEdge = widths.reduce((a, c) => {
    edges.push(a);
    return a + c;
  }, left);

  // Recover last edge
  edges.push(lastEdge);
  return edges;
};

const drawColumnSeparators = (doc, edgesList, yPos, height) => {
  const edges = Array.from(edgesList);
  edges.shift();
  edges.pop();
  // Draw all left edges, except the first
  for (const edge of edges.values()) { // eslint-disable-line no-restricted-syntax
    doc.moveTo(edge, yPos).lineTo(edge, yPos + height).stroke();
  }
};

const placeDetailsBox = (doc, dims, invoice) => {
  const { top, left, width, height } = dims; // eslint-disable-line object-curly-newline

  const inv = invoice;
  const { data: d } = inv;

  const theFont = fntRegular;
  const fontSize = 9;

  const y = VE + CNV(top);
  const x = HE + CNV(left);
  const w = CNV(width) * WA;
  const h = CNV(height) * HA;

  // const lpad = 6;
  const tpad = 2;
  const cellpad = 2;

  // let size = null;
  // const lineSp = 14;

  const table = prepareDataTable(d);
  const colWidths = prepareWidthsList(table, theFont, fontSize, cellpad);
  const adjustedColumnWidths = prepareAdjustedWidthsList(w, colWidths);
  const columnsLeftEdges = prepareLeftEdgesList(adjustedColumnWidths, x);

  doc.lineJoin('miter').roundedRect(x, y, w, h, 8).stroke();

  drawColumnSeparators(doc, columnsLeftEdges, y, h);

  doc.font(theFont, fontSize);

  let line = y + tpad;

  const headerRow = 1;
  const itemsRow = 3;
  for (let iy = headerRow; iy < itemsRow; iy += 1) {
    for (let ix = 0; ix < table[headerRow].length; ix += 1) {
      doc.text(table[iy][ix], columnsLeftEdges[ix], line,
        { width: adjustedColumnWidths[ix], align: 'center' });
    }
    line += fontSize + 2;
  }

  line += fontSize;
  // doc.lineWidth(10);
  doc.moveTo(x, line).lineTo(x + w, line).stroke();

  line += 4;
  for (let iy = itemsRow; iy < table.length; iy += 1) {
    for (let ix = 0; ix < table[headerRow].length; ix += 1) {
      doc.text(table[iy][ix], columnsLeftEdges[ix], line,
        { width: adjustedColumnWidths[ix], align: 'center' });
    }
    line += fontSize + 2;
  }
};

const totalsTitles = [
  { title: 'Subtotal 12%', field: 'subTotal' },
  { title: 'Subtotal 0%', field: 'zero' },
  { title: 'Subtotal No Objeto De Iva', field: 'zero' },
  { title: 'Subtotal Exento De Iva', field: 'zero' },
  { title: 'Subtotal Sin Impuestos', field: 'subTotalConImpuesto' },
  { title: 'Total Descuento', field: 'descuento' },
  { title: 'ICE', field: 'zero' },
  { title: 'IVA 12%', field: 'totalImpuesto' },
  { title: 'IRBPNR', field: 'zero' },
  { title: 'Propina', field: 'zero' },
  { title: 'Valor Total', field: 'total' },
];


const placeTotalsBox = (doc, dims, invoice) => {
  const { top, left, width, height } = dims; // eslint-disable-line object-curly-newline

  const inv = invoice;
  const { data: d } = inv;

  const y = VE + CNV(top);
  const x = HE + CNV(left);
  const w = CNV(width) * WA;
  const h = CNV(height) * HA;

  const lpad = 10;
  const tpad = 8;

  doc.lineJoin('miter')
    .roundedRect(x, y, w, h, 8)
    .stroke();

  const midW = w - 2 * lpad;
  const colAx = x + lpad;
  // const colAw = (w / 2) - (4 * lpad);
  // const colBx = x + colAw + (4 * lpad);
  // const colBw = (w / 2) - lpad;

  let line = 0;
  let font = 0;

  d.zero = '0.00';

  font = 10;
  doc.font(fntRegular, font);

  line += y + tpad;
  totalsTitles.forEach((total) => {
    doc.text(total.title, colAx, line,
      { width: midW, align: 'left' });

    doc.text(d[total.field], colAx, line,
      { width: midW, align: 'right' });

    line += font + 3;
  });
};

const closeStream = stream => new Promise(resolve => stream.on('finish', resolve));

const pdfgen = async (invoice, names) => {
  const inv = invoice;
  const { data: d } = inv;
  const { mailDir, mailFile } = names;

  CDR(inv);
  CDR(d.itemes);
  CLG(`
  +++++++++++++++++++ ${__dirname}
  `);


  const fechaShort = shortDate(d.fecha);

  const theFile = `${mailDir}/${mailFile}.pdf`;
  await fs.ensureDir(mailDir);

  await QRCode.toFile(`${mailDir}/${mailFile}.png`, inv.accessKey);

  const writeStream = fs.createWriteStream(theFile);
  const doc = new PDF();
  doc.pipe(writeStream);

  if (showCornerMarkers) {
    doc.lineJoin('miter')
      .roundedRect(HE + CNV(0), VE + CNV(0), CNV(20) * HA, CNV(20) * WA, 8)
      .stroke();

    doc.lineJoin('miter')
      .roundedRect(HE + CNV(165), VE + CNV(230), CNV(20) * HA, CNV(20) * WA, 8)
      .stroke();
  }

  /* Vendor Logo */
  const logoDimensions = {
    top: 0,
    left: 0,
    width: 82,
    height: 35,
  };
  placeLogo(doc, logoDimensions);

  const logoBottomMargin = 5;

  /* Vendor Box */
  const vendDimensions = {
    top: logoDimensions.top + logoDimensions.height + logoBottomMargin,
    left: logoDimensions.left,
    width: 82,
    height: 35,
  };
  placeVendorBox(doc, vendDimensions);

  const vendRightMargin = 5;

  /*  SRI Box */
  const sriDimensions = {
    top: 0,
    left: vendDimensions.left + vendDimensions.width + vendRightMargin,
    width: 95,
    height: vendDimensions.top + vendDimensions.height + 1,
  };
  const qrcode = `${mailDir}/${mailFile}.png`;
  // CLG(vendDimensions.height);
  // CLG(vendDimensions.top);
  // CLG(sriDimensions.height);
  placeSriBox(doc, sriDimensions, invoice, qrcode);

  /*  Buyer Box */
  const buyerDimensions = {
    top: sriDimensions.top + sriDimensions.height + 2,
    left: vendDimensions.left,
    width: vendDimensions.left + vendDimensions.width + vendRightMargin + sriDimensions.width + 3,
    height: 40,
  };
  placeBuyerBox(doc, buyerDimensions, invoice);

  /*  Details Box */
  const detailsDimensions = {
    top: buyerDimensions.top + buyerDimensions.height + 2,
    left: buyerDimensions.left,
    width: buyerDimensions.width,
    height: 60,
  };
  placeDetailsBox(doc, detailsDimensions, invoice);


  /*  Totals Box */
  const totalsDimensions = {
    top: detailsDimensions.top + detailsDimensions.height + 2,
    left: vendDimensions.left + vendDimensions.width + vendRightMargin,
    width: 95,
    height: 56,
  };
  placeTotalsBox(doc, totalsDimensions, invoice);

  try {
    await fs.ensureSymlink(
      `${mailDir}`,
      `${process.env.MAIL_DIR}/${fechaShort}_${d.sequential}`,
    );
    CLG('Success writing PDF!');
  } catch (err) {
    CER(err);
  }

  /* Finalize PDF file */
  doc.end();

  /* Finalize writer stream */
  await closeStream(writeStream);

  return theFile;
};

export default pdfgen;
