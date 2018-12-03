const LG = console.log; // eslint-disable-line no-unused-vars, no-console

export default {
  text: v => v,
  integer: v => v,
  title: v => v,
  // percent: v => ({ raw: v, str: `${(v * 100).toFixed(0)}%` }),
  percent: (_v, decimalPlaces) => {
    const v = (typeof _v === 'number') ? _v : parseFloat(_v);
    return ({
      raw: parseFloat((v || 0).toFixed(4)),
      str: `${((v || 0) * 100).toFixed(decimalPlaces || 1)}%`,
    });
  },
  boolean: (v) => { // eslint-disable-line arrow-body-style
    return {
      raw: v !== 'no',
      str: v,
    };
  },
  JSON1: (v, pkg) => pkg.JSON1.fn(pkg.JSON1.vl),
  foreignKey1: (v, pkg) => {
    // LG(v);
    // LG(pkg.foreignKey1);
    const rslt = pkg.foreignKey1.fn(pkg.foreignKey1.vl);
    return rslt;
  },
  // usd: v => ({ raw: v, str: `$ ${(v || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}` }),
  usd: v => ({
    raw: (v || 0).toFixed(2),
    str: `$ ${(v || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
  }),
  date: (v) => {
    // const options = {
    //   year: 'numeric',
    //   month: 'numeric',
    //   day: 'numeric',
    // };
    // const date = new Date(Date.parse(v)).toLocaleDateString('fr-FR', options);
    if (v.length < 10) return v;
    const date = new Date(Date.parse(v)).toISOString().split('T')[0];
    return date;
  },
};
