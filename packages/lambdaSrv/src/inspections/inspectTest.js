const CLG = console.log; // eslint-disable-line no-unused-vars, no-console

//   const inner = {
//     a: { stuff: 'jtgheihg' },
//     b: { stuff: 'dueglndsgxle' },
//     c: { stuff: 'msdl.jikwn' },
//   };

//   const outer = [
//     { id: "A", more: "a" },
//     { id: "B", more: "b" },
//     { id: "C", more: "c" },
//   ];

// function getDetailData(more) {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve(inner[more]);
//     }, 1000);
//   });
// }

// const writeItem = async function (item) { // eslint-disable-line func-names
//   CLG('== outer ==');

//   return new Promise(async (rslv) => {
//     const val = await getDetailData(item.more);
//     CLG(`${item.id} -- ${item.more} (${val.stuff})`);
//     // rslv(this.write(`<p>${item.id}  --  ${item.more} ()</p>`));
//   });

// };

export default async (req, res) => {
  res.write(`<!DOCTYPE html><html>
<body text="lightyellow" bgcolor="#000007">
<font face="Arial, Helvetica, sans-serif">`);

  const val = 'for testing';
  res.write(`<br /></div>  ${JSON.stringify(val, null, 2)}</div>`);

  CLG('== Before loop ==');
  // outer.forEach(await writeItem, res);
  CLG('== After loop ==');

  res.write('</body></html>');
  res.end();
};
