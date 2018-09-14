import NavBar from '@/components/MainLayout/NavBar';

import BottleTasks from './BottleTasks';
import BottleTasksHelper from './BottleTasksHelper';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console

export const NONECHOSENFLAG = 'escoger';

export const routes = [{
  path: '',
  name: 'home',
  components: {
    nav_bar: NavBar,
    default: BottleTasks,
    helper: BottleTasksHelper,
  },
}];

export const store = {
  namespaced: true,
  state: {
    personChosen: 'escoger',
    resetList: false,
  },
  getters: {
    personChosen: vx => vx.personChosen,
    resetList: vx => vx.resetList,
  },
  mutations: {
  /* eslint-disable no-param-reassign */
    setChosenPerson: (vx, payload) => {
      LG(`Set chosen to - ${payload}`);
      vx.personChosen = payload;
    },
    toggleDirty: (vx) => {
      LG(`Toggle dirty from - ${vx.resetList}`);
      vx.resetList = !vx.resetList;
    },
  /* eslint-enable no-param-reassign */
  },
  actions: {
    choosePerson: (ctx, pyld) => {
      LG(`Choosing - ${pyld}`);
      ctx.commit('setChosenPerson', pyld);
    },
    unChooseAll: (ctx) => {
      LG('UN Choosing');
      ctx.commit('toggleDirty');
      // BottleTasks.reLoad();
      // ctx.commit('setChosenPerson', pyld);
    },
  },
};

export const dummy = 'shutUpEsLint';
