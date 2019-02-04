import { abbr } from './utils';
import processMonth from './ProcessMonth';

const { YR, MTH } = abbr;

const months = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
];

const processYear = (pyld) => {
  const { acc, year, lastTime, testTime: T } = pyld;
  let testTime = T;
  const lastRunYear = lastTime.getFullYear();
  cy.log(`Test year: ${JSON.stringify(year, null, 2)} vs Last run year ${JSON.stringify(lastRunYear, null, 2)}`);
  if (year < lastRunYear) return;
  const thisYear = new Date().getFullYear();
  cy.log(`Test year: ${JSON.stringify(year, null, 2)} vs This year ${JSON.stringify(thisYear, null, 2)}`);
  if (year > thisYear) return;

  cy.get('#form-year')
    .select(year)
    .then(() => {
      acc[year] = {};
      months.forEach((month, idx) => {
        testTime = new Date(testTime.getFullYear(), idx + 1, 0, 23, 59, 59);
        cy.log('testTime');
        cy.log(testTime);
        // debugger;
        processMonth({ acc, year, month, lastTime, testTime });
      });
      // lastTime[MTH] = 1;
    });
}

export default processYear;
