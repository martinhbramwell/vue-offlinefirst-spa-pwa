// import Header from '@/components/Header';

import Protected from './Protected';
import Classified from './Classified';

import { PROTECTED, CLASSIFIED } from './accessGroups';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

export const routes = [ // eslint-disable-line import/prefer-default-export
  {
    name: PROTECTED,
    path: 'protected',
    component: Protected,
  },
  {
    name: CLASSIFIED,
    path: 'classified',
    component: Classified,
  },
];
