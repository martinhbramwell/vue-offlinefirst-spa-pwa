import PDF from 'pdfkit';
import fs from 'fs-extra';

const LG = console.log;

const cm2in = 0.3937;
const in2cm = 2.54;
const ppiPerIn = 72;
const pdfInch = 2.45;
const adjuster = in2cm / pdfInch;

const pixels_per_PDF_inch = ppiPerIn * adjuster;
const cm2ppi = pixels_per_PDF_inch * cm2in;

const CNV = cm => parseInt(cm * cm2ppi, 10);

const LabelWidth = 8.5;
const LabelHeight = 4.55;

const lbl_w = CNV(LabelWidth);
const lbl_h = CNV(LabelHeight);

const qrCode_d = LabelHeight - 1;
const qrCode_x = CNV(LabelWidth - 0.5 - qrCode_d);
const qrCode_y = CNV(0.4);

const code_x = CNV(1.5);
const code_y = CNV(1.5);

const left_x = CNV(1.5);
const gap_x = CNV(0.6);
const offset_x = gap_x + lbl_w;

const top_y = CNV(1.65);
const gap_y = CNV(0.4);
const offset_y = gap_y + lbl_h;


const A1_x = CNV(1.5);
const A1_y = CNV(1.65);

const Label = (D, x, y) => {
    D.lineJoin('miter')
        .rect(x, y, lbl_w, lbl_h)
        .stroke()
}

const showLabels = true;
// const showLabels = false;

// const showCornerMarkers = true;
const showCornerMarkers = false;

const positions = [];
for (let iy = 0; iy < 5; iy += 1) {
  for (let ix = 0; ix < 2; ix += 1) {
    positions.push({x: ix * offset_x, y: iy * offset_y});
  }
}

const pdfgen = (codeFiles) => {

  let creating = true;
  let docName = null;

  let doc = new PDF();
  let pos = 0;
  let imageName = null;
  let qrc_xpos = 0;
  let qrc_ypos = 0;

  let cod_xpos = 0;
  let cod_ypos = 0;

  codeFiles.forEach((codeFile) => {
    if (creating) {
      creating = false;
      docName = codeFile.file;

      // LG(`[pdf/index.js] Writing :: ${docName}`);
      doc.pipe(fs.createWriteStream(codeFile.file));  //creating a write stream to write the content on the file system

      if (showCornerMarkers) {
          doc.lineJoin('miter')
              .rect(0, 0, 72, 72)
              .stroke()

          doc.lineJoin('miter')
              .rect(537, 720, 72, 72)
              .stroke()
      }
    }

    if (showLabels) {
      Label(doc, left_x + positions[pos].x, top_y + positions[pos].y);
    }

    qrc_xpos = left_x + positions[pos].x + qrCode_x;
    qrc_ypos = top_y + positions[pos].y + qrCode_y;
    imageName = `/tmp/iriblu_bottleLabels/${codeFile.code}.png`;
    doc.image(imageName, qrc_xpos, qrc_ypos, CNV(qrCode_d), CNV(qrCode_d));
    fs.removeSync(imageName);


    cod_xpos = left_x + positions[pos].x + code_x;
    cod_ypos = top_y + positions[pos].y + code_y;
    doc.font('fonts/Roboto-Regular.ttf')
       .fontSize(18)
       .text(codeFile.code, cod_xpos, cod_ypos);

    // LG(` --- wrote :: ${codeFile.code}`);
    // LG(` --- at (${left_x + positions[pos].x + qrCode_x}, ${top_y + positions[pos].y + qrCode_y})`);
    pos += 1;

  });

  /* Finalize PDF file */
  doc.end();
  // LG(`[pdf/index.js] Closed :: ${docName}`);
}

export default pdfgen;
