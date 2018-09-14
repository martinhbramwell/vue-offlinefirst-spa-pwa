const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const idxAliases = ['reassign', 'delete', 'edit', 'view', 'none'];
const makeAliases = (levels) => {
  const ary = levels.map(x => x.toLowerCase().split(' ').join('_'));
  let idx = 0;
  const aliases = {};

  while (idx < idxAliases.length - 1) {
    aliases[idxAliases[idx]] = Array.from(ary);
    idx += 1;
    ary.pop();
  }

  return aliases;
};


const accessLevels = ['Do Nothing', 'Only View', 'Comment', 'Alter', 'Assign'];

const Levels = {};
const levelOptions = [];
for (let idx = 0; idx < accessLevels.length; idx += 1) {
  const name = accessLevels[idx];
  const value = name.toUpperCase().split(' ').join('_');
  Levels[value] = idx;
  levelOptions.push({
    name, value: idx, id: idx, label: name,
  });
}

Levels.alvls = accessLevels;
Levels.options = levelOptions;
Levels.olvls = Array.from(accessLevels, (x, ix) => ({ id: ix, axs: x }));
Levels.aliases = makeAliases(accessLevels);
Levels.idxAliases = idxAliases.reverse();

export default Levels;
