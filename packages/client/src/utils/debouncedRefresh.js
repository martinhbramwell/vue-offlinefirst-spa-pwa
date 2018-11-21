import { debounce } from 'lodash';

export default debounce((category, upd, rows, resolve) => {
  window.lgr.warn(`deBouncedRefresh --> Change to ${category}: ${upd.action}`);
  window.lgr.debug(`${JSON.stringify(upd, null, 2)}`);
  window.lgr.debug(`${JSON.stringify(rows, null, 2)}`);
  resolve(rows);
}, 50);
