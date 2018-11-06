// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import VueLocalStore from 'vue-ls';

import { Can, abilitiesPlugin } from '@casl/vue';

import VueLogger from 'vuejs-logger';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';

import formulate from 'vue-formulate';

// import axios from 'axios';
// import VueAxios from 'vue-axios';

import { sync } from 'vuex-router-sync';

import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

// import { setupCalendar, DatePicker } from 'v-calendar';
import VCalendar from 'v-calendar';
import 'v-calendar/lib/v-calendar.min.css';

import 'awesomplete/awesomplete.css';

import _ from 'lodash';

import VueVirtualScroller from 'vue-virtual-scroller';

/* *********************************** o/
                                     * */
import './registerServiceWorker'; /* * o/
                                     * o/
************************************** */

import App from './App';
import { store } from './store';

import VuePouchDB from './database/vuejs-pouchdb';

import xlate from './internationalization';

import config from './config';

// import HomeView from './components/HomeView';

import { currentUser, abilities } from './accessControl'; // eslint-disable-line no-unused-vars

import router from './router';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

Vue.use(abilitiesPlugin, abilities);
Vue.component('Can', Can);


Vue.use(VueLogger, config.logger);

Vue.use(VueI18n);
Vue.use(VueLocalStore, { namespace: 'vuesppwa-' });

Vue.use(Buefy, {
  defaultIconPack: 'fa',
});


// Remember to setup calendar (passing in defaults if needed)
// setupCalendar({
//   firstDayOfWeek: 1, // Sunday,
//   formats: {
//     title: 'MMMM / YYYY',
//     weekdays: 'W',
//     navMonths: 'MMM',
//     input: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'], // Only for `v-date-picker`
//     dayPopover: 'L', // Only for `v-date-picker`
//     data: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'], // For attribute dates
//   },
// });
// Vue.component('v-date-picker', DatePicker);
Vue.use(VCalendar);

Vue.use(formulate, {
  rules: {
    isPct: ({ value }) => (_.inRange(value || 0, 0, 101) ? false : `Value ${value} is not in range 0 to 100.`),
  },
});

Vue.use(VuePouchDB);

Vue.use(VueVirtualScroller);

// Vue.component('home', HomeView);
Vue.component('icon', Icon);

Vue.config.productionTip = config.productionTip;

const messages = xlate; // Make it observable

const locale = navigator.languages[0] || 'en';
const i18n = new VueI18n({
  locale: locale.split('-')[0] || 'en',
  fallbackLocale: 'en',
  // fallbackLocale: locale.split('-')[0] || 'en',
  messages,
});

sync(store, router);

/* eslint-disable no-new */
const mainVue = new Vue({
  el: '#app',
  i18n,
  router,
  store,
  beforeCreate() {
    LG('<<<<<<<<<< beforeCreate >>>>>>>>>>>');
    window.lgr = this.$log;
    window.ls = this.$ls;
    window.ability = this.$ability;

    this.$store.dispatch('dbmgr/rememberDbMgr', { dbmgr: this.$pouch });

    const token = this.$route.query.tkn ? this.$route.query.tkn : this.$ls.get(config.tokenName);
    LG('<<<<<<<<<< keeping token >>>>>>>>>>>');
    this.$store.dispatch('keepTkn', { token, ability: this.$ability });

    this.$store.dispatch('person/fetchAll');
    this.$store.dispatch('product/fetchAll');
  },
  created() {
    LG('<<<<<<<<<< created >>>>>>>>>>>');
    window.version = config.version;
    this.$log.info(`microservice = ${config.server}`);

    LG(`
      !!!!!!!!!?  returnToExitPoint  ?!!!!!!!!!`);
    const ls = window.localStorage;
    const retRoute = config.localStorageNameSpace + config.returnRouteName;
    const redir = JSON.parse(ls.getItem(retRoute));
    if (redir) {
      const rr = redir.value;
      if (rr && rr.length > 0 && !rr.includes('home')) {
        LG(`
    !!!!!!!!!?  return to ${rr}  !!!!!!!!!`);
        LG(this.$router.push({ name: rr }));
        ls.removeItem(retRoute);
        // nxt({ name: rr });
      }
    }
  },
  render: site => site(App),
});

export default mainVue;
