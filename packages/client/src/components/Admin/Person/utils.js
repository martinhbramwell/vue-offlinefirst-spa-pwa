const LG = console.log; // eslint-disable-line no-unused-vars, no-console
const LGERR = console.error; // eslint-disable-line no-unused-vars, no-console

export default {
  computeTypesId: (types) => {
    LG('CC %%%%%%%%%%%%%%%%%%');
    const ret = [];
    if (types) {
      Object.keys(types).forEach((value) => {
        const name = types[value];
        ret.push({
          name,
          value,
          id: value,
          label: name,
        });
      });
    } else {
      ret.push({
        name: 'aa',
        value: 'AA',
        id: 'AA-',
        label: 'aa-',
      });
    }
    LG(ret);
    return ret;
  },
};
