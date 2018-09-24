import QRCode from 'qrcode';

import { tmpDir } from '../labeler';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const qrgen = (codeFiles) => {
  const promises = [];
  codeFiles.forEach((codeFile) => {
    // LG(`Encoding ${codeFile.code} as ${tmpDir}/${codeFile.code}.png`);
    promises.push(
      QRCode.toFile(`${tmpDir}/${codeFile.code}.png`, codeFile.code)
        .catch(err => LG(`Error writing "${file}" :: ${err}`))
    );
  });
  return promises;
}

export default qrgen;
