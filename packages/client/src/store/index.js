import Vuex from 'vuex';
import Vue from 'vue';

import { formulateState, formulateGetters, formulateMutations } from 'vue-formulate';

import { store as person } from '@/components/Admin/Person';
import { store as product } from '@/components/Sales/Product';
import { store as invoice } from '@/components/Sales/Invoice';
import { store as articles } from '@/components/Attic/Blog';
import { store as bottle } from '@/components/Distributor/Bottle';
import { store as movement } from '@/components/Distributor/Movement';

// import articles from './articles';

import Auth from './Auth';
import a12n from '../accessControl'; // eslint-disable-line no-unused-vars
import dbmgr from '../database'; // eslint-disable-line no-unused-vars


const LG = console.log; // eslint-disable-line no-console, no-unused-vars

Vue.use(Vuex);

export const store = new Vuex.Store({ // eslint-disable-line new-cap
  state: {
    counter: 0,
    isDebug: false,
    isError: false,
    msgError: { txt: 'We got failure happening', lvl: 'is-warning' },
    axsRights: ['visitor'],
    integrityCheck: { person: 9999, product: 8888, invoice: 7777 },
    ...formulateState()(),
  },

  getters: {
    isDebug: state => state.isDebug,
    isError: state => state.isError,
    msgError: state => state.msgError,
    theRoles: (state) => {
      window.lgr.debug(state.axsRights);
      return state.axsRights;
    },
    theCounter: state => ({ cntr: state.counter, other: 'okok' }),
    theFormData: () => ({ email: 'a@b.ca', password_confirmation: 'qwer', password: 'qwer' }),
    ...formulateGetters(),
  },

  mutations: {
    /* eslint-disable no-param-reassign */
    notifyUser: (state, pyld) => {
      window.lgr.warn(pyld.txt);
      LG(state);
      state.msgError = pyld;
      state.isError = true;
    },
    debugMode: (state, pyld) => {
      state.isDebug = pyld;
    },
    updateIntegrityCheck: (state, pyld) => {
      window.lgr.warn(pyld);
      state.integrityCheck = pyld;
    },
    clearNotifyUser: (state) => {
      state.msgError = '';
      state.isError = false;
    },
    axsRole: (state, pyld) => {
      window.lgr.debug(pyld.roles);
      state.axsRights = pyld.roles;
    },
    increment: (state) => {
      window.lgr.warn('UU');
      state.counter += 1;
    },
    decrement: (state) => {
      LG('DD');
      state.counter -= 1;
    },
    fillFormPerX: (state) => {
      LG('QQQQQ GG QQQQQQ');
      LG(state);
      state.values.person = {
        email: 'a@b.es',
        description: 'qwer',
        name: 'qwer',
      };
    },
    fillForm: (state) => {
      LG('QQQQQQQQQQQ');
      LG(state);
      state.values.registration = {
        email: 'a@b.c',
        password_confirmation: 'qwer',
        password: 'qwer',
      };
    },
    ...formulateMutations(),
  },

  actions: {
    updateIntegrityCheck: ({ commit }, pyld) => { commit('updateIntegrityCheck', pyld); },
    notifyUser: ({ commit }, pyld) => { commit('notifyUser', pyld); },
    clearNotifyUser: ({ commit }) => { commit('clearNotifyUser'); },
    debugMode: ({ commit }, pyld) => { commit('debugMode', pyld); },
    setAxsRole: ({ commit }, pyld) => { commit('axsRole', pyld); },
    increment: (ctx) => {
      LG('QQQQQ  increment QQQQQQ');
      LG(ctx);
      return ctx.commit('increment');
    },
    decrement: ({ commit }) => { commit('decrement'); },
    fillForm: ({ commit }) => { commit('fillForm'); },
  },

  modules: {
    Auth,
    a12n,
    dbmgr,
    articles,
    person,
    product,
    invoice,
    bottle,
    movement,
  },
});

export const dummy = 'shut up eslint';
