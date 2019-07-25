/* eslint-disable no-console, no-unused-vars */
import fontkit from 'fontkit';

const CLG = console.log;
const CER = console.err;
const CDR = console.dir;
/* eslint-enable no-console, no-unused-vars */

// const tffRegular = fontkit.openSync(fntRegular);
// const tffRegItalic = fontkit.openSync(fntRegItalic);
// const tffBold = fontkit.openSync(fntBold);
// const tffSemiBoldItalic = fontkit.openSync(fntSemiBoldItalic);

const adjFactors = {
  './public/fonts/SourceSansPro-Regular.ttf': 3500,
  './public/fonts/SourceSansPro-RegularItalic.ttf': 3500,
  './public/fonts/SourceSansPro-Bold.ttf': 3500,
  './public/fonts/SourceSansPro-SemiBoldItalic.ttf': 3500,
};

const getStringLayoutWidth = (fontName, fontSize, strText) => {
  const font = fontkit.openSync(fontName);
  // CLG(typeof strText);
  const txt = typeof strText === 'string' ? strText : strText.toString();
  const glyphrun = font.layout(txt);
  const advWidth = glyphrun.glyphs.reduce((a, c) => a + c._metrics.advanceWidth, 0); // eslint-disable-line no-underscore-dangle, max-len
  const adjFactor = adjFactors[fontName];

  return Math.round(fontSize * advWidth / adjFactor);
};

export default getStringLayoutWidth;
