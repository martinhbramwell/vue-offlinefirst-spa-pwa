const padVal = (pad, val) => (pad + val).substring(val.length);

const tightDate = () => {
  const d = new Date();
  let dt = '';
  dt += d.getYear() - 100;
  dt += padVal('00', (1 + d.getMonth()).toString());
  dt += padVal('00', d.getDate().toString());
  dt += padVal('00', d.getHours().toString());
  dt += padVal('00', d.getMinutes().toString());
  dt += padVal('00', d.getSeconds().toString());
  return parseInt(`${dt}`, 10);
};

/* eslint-disable import/prefer-default-export */
export const generateMovementId = (user, incr) => {
  const tddt = (incr + tightDate()).toString();
  return `${padVal(`000000${tddt}0`, user)}`;
};
/* eslint-enable import/prefer-default-export */
