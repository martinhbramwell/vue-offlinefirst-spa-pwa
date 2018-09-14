export const makeVariableName = (v) => {
  const us = '_';
  return v.replace(/[Áá]/g, 'a')
    .replace(/[Éé]/g, 'e')
    .replace(/[Íí]/g, 'i')
    .replace(/[Ôó]/g, 'o')
    .replace(/[Úú]/g, 'u')
    .replace(/[ñÑ]/g, 'n')
    .replace(/[a-z][A-Z]/g, m => `${m[0]} ${us} ${m[1].toLowerCase()}`)
    .replace(/\W$/g, '')
    .replace(/\W/g, '_')
    .replace(/_{1,}/g, '_')
    .replace(/[A-Z]/g, m => m.toLowerCase());
};

export const variablizeTitles =
  ary => ary.map(itm => makeVariableName(itm));

export const shutUpEsLint = true;
