import Vue from 'vue';
import axios from 'axios'; // eslint-disable-line no-unused-vars
import Router from 'vue-router';

// import Header from '@/components/Attic/Header';

import { routes as mainLayout } from '@/components/MainLayout';

import { beforeEach as beforeEachTaskAcl } from '@/accessControl';

// import { routes as example } from '@/components/Tests/Component';

// import OldHomeView from '@/components/Attic/OldHomeView';
// import DetailView from '@/components/Attic/DetailView';
// import PostView from '@/components/Attic/PostView';
// import DumbA from '@/components/Attic/DumbA';
// import DumbB from '@/components/Attic/DumbB';
// import Form from '@/components/Attic/Form';

// import { Blog, Article } from '@/components/Blog';
// import { routes as blog } from '@/components/Attic/Blog';
// import { routes as poison } from '@/components/Attic/Poison';

import cfg from '../config';


import { store } from '../store';

Vue.use(Router);

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const baseRoutes = [

  // {
  //   path: '/ohv',
  //   name: 'ohv',
  //   components: { default: OldHomeView, hdr: Header },
  //   // meta: { permission: 'visitor' },
  // },
  // {
  //   path: '/post',
  //   name: 'post',
  //   components: { default: PostView, hdr: Header },
  //   // meta: { permission: 'visitor' },
  // },
  // {
  //   path: '/detail/:id',
  //   name: 'detail',
  //   components: { default: DetailView, hdr: Header },
  //   // meta: { permission: 'visitor' },
  // },
  // {
  //   path: '/dc',
  //   name: 'DA',
  //   components: { default: DumbA, hdr: Header },
  //   // meta: { permission: 'visitor' },
  // },
  // {
  //   path: '/db',
  //   name: 'DB',
  //   components: { default: DumbB, hdr: Header },
  //   // meta: { permission: 'visitor' },
  // },
  // {
  //   path: '/form',
  //   name: 'form',
  //   components: { default: Form, hdr: Header },
  //   // meta: { permission: 'visitor' },
  // },
];

const routes = baseRoutes
  // .concat(person)
  // .concat(example)
  // .concat(blog)
  // .concat(poison)
  .concat(mainLayout);

const processServerSideChanges = (t, f, n) => { // eslint-disable-line no-unused-vars
  if (window.lgr) {
    window.lgr.info('Guard: processServerSideChanges.');
  }
  if (store && store.state && store.state.Auth && store.state.Auth.accessToken.length > 10) {
    const url = `${cfg.server}/api/metadata`;

    const config = {
      headers: {
        Accept: 'application/json, text/plain, */*',
        Authorization: `JWT ${store.state.Auth.accessToken}`,
      },
    };

    // LG(config);
    // LG(url);

    axios.get(url, config)
      .then((response) => {
        const srvrChks = response.data.metadata.checks;
        const lclChks = store.state.integrityCheck;
        //         LG(`
        // ???????????????????????????
        //   processServerSideChanges
        // ???????????????????????????`);
        //         LG(`Checks are ${srvrChks}`);
        //         LG(srvrChks);

        Object.keys(srvrChks).forEach((chk) => {
          // LG(`Check ${chk} is ${srvrChks[chk]}`);
          // LG(`Local ${chk} is ${lclChks[chk]}`);
          if (srvrChks[chk] !== lclChks[chk]) {
            lclChks[chk] = srvrChks[chk];
            LG(`will call -- store.dispatch('${chk}/fetchAll')`);
            store.dispatch(`${chk}/fetchAll`);
            store.dispatch('updateIntegrityCheck', lclChks);
          }
        });
      })
      .catch((e) => {
        LG(`*** Error while fetching metadata :: >${e.message}<***`);
        LG(e.message);
        if (e.message.endsWith('401')) {
          store.dispatch('handle401', null, { root: true });
        } else {
          store.dispatch('notifyUser', {
            txt: `Error fetching invoices :: ${e.message}`,
            lvl: 'is-danger',
          }, { root: true });
        }
      });
  }
  return null;
};

const clearErrorNotification = (t, f, n) => { // eslint-disable-line no-unused-vars
  if (window.lgr) {
    window.lgr.info('Guard: clearErrorNotification.');
  }
  store.dispatch('clearNotifyUser');
  return null;
};

let beforeEachTasks = [];
// (t, f) => { LG(`TSK 0 ${t}, ${f}`); },

beforeEachTasks = beforeEachTasks
  // .concat(keepToken)
  .concat(processServerSideChanges)
  .concat(clearErrorNotification)
  .concat(beforeEachTaskAcl);

const router = new Router({
  routes,
});

router.beforeEach((_to, _from, _next) => {
  LG(`Router.beforeEach ==> Routing from '${_from.name}' to '${_to.name}'. Params '${_from.params}').`);
  LG(_to);
  LG(_from);
  LG(`beforeEachTasks.length ${beforeEachTasks.length}`);
  LG(beforeEachTasks);

  let blockRoute = null;
  beforeEachTasks.forEach((tsk) => {
    if (blockRoute === null) {
      blockRoute = tsk(_to, _from, _next);
    }
  });

  if (blockRoute !== null) {
    _next(blockRoute);
    return;
  }
  _next();
});

export default router;
