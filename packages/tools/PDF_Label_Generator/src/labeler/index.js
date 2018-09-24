import fs from 'fs-extra';
import parse from 'csv-parse';
import async from 'async';

import qr from '../qr';
import pdf from '../pdf';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

export const tmpDir = '/tmp/iriblu_bottleLabels';

const allPages = 'IridiumBlueBottleLabels';
// const dirGroup = '';
// const dirHundreds = '';
// const dirTens = '';
const bottlesList = 'envases.csv';
const bottlesListPath = `${tmpDir}/${bottlesList}`;

const pageOfTen = [];
const TOP_LEVEL = 0;
const LOWER_LEVEL = 1;
const PDF_PAGE = 2;
const ITEM_CODE = 3;
let oldPage = { path: null, name: null };
let newPage = { path: null, name: null };

export const END_OF_DATA = 'End Of Data';

const writePDFPage = (page, items) => {
  LG(`[writePDFPage] Will write :: ${page.path}/${page.name}`);
  const itemFiles = items.map(code => ({ code, file: `${page.path}/${page.name}` }));

  // const promz = qr(itemFiles);
  // LG('promz');
  // LG(promz);
  Promise
    .all(qr(itemFiles))
    .then(() => {
      pdf(itemFiles);
    });
}

const processItem = (item) => {
  if(!item[0]) return;
  if(item[0] === END_OF_DATA) {
    LG(`Make directory :: ${oldPage.path}`);
    fs.ensureDirSync(`${oldPage.path}`);

    LG(`Write LAST page '${oldPage.name}'.`)
    writePDFPage(oldPage, pageOfTen);
    return;
  }

  // LG(`Processing item :: ${item[TOP_LEVEL]}${item[PDF_PAGE]}  /  ${item[ITEM_CODE]}`);
  newPage.name = `${item[TOP_LEVEL]}${item[PDF_PAGE]}`;
  newPage.path = `${tmpDir}/${allPages}/${item[TOP_LEVEL]}/${item[TOP_LEVEL]}${item[LOWER_LEVEL]}`;
  if(oldPage.name == null) {
    oldPage = JSON.parse(JSON.stringify(newPage));
  } else if(newPage.name !== oldPage.name) {
    LG(`Make directory :: ${oldPage.path}`);
    fs.ensureDirSync(`${oldPage.path}`);

    // LG(`Write old page '${oldPage.name}'.`);
    writePDFPage(oldPage, pageOfTen);
    pageOfTen.splice(0, pageOfTen.length);

    oldPage = JSON.parse(JSON.stringify(newPage));
  }
  // LG(`Partial page :: ${pageOfTen}`);
  pageOfTen.push(item[ITEM_CODE]);

};

const labeler = (req, res) => {
  LG('DOING');
  const codes = ['IBAA001', 'IBCC001', 'IBCC002'];
  fs.ensureDirSync(tmpDir);
  if (!fs.existsSync(bottlesListPath)){
    res.send(`File not found :: ${bottlesListPath}`);
  } else {

    oldPage = { path: null, name: null };
    newPage = { path: null, name: null };
    pageOfTen.splice(0, pageOfTen.length);

    const parser = parse({delimiter: ','});
    let record = null;

    parser.on('readable', () => {
      while(record = parser.read()) {
        processItem(record);
      }
    });
    parser.on('end', () => {
      processItem([END_OF_DATA]);
      res.send(`Process complete. Files were written to :: ${tmpDir}/${allPages}`);
    });

    fs.createReadStream(bottlesListPath).pipe(parser);


    // const codeFiles = codes.map(code => ({ code, file: `${tmpDir}/${code}.png` }));
    // qr(codeFiles);
    // pdf(codeFiles);
    // res.send(`Did codes :: ${codes}`);
  }
}

export default labeler;
