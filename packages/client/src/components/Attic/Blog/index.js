import createCrudModule, { client } from 'vuex-crud';

import Header from '@/components/Attic/Header';
import cfg from '@/config';

import Articles from './Articles';
import Article from './Article';

// import { mainStore } from './store';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

export const routes = [
  {
    path: '/blog',
    name: 'blog',
    components: { default: Articles, hdr: Header },
    meta: { permission: 'visitor' },
  },
  {
    path: '/articles/:id',
    name: 'article',
    components: { default: Article, hdr: Header },
    meta: { permission: 'visitor' },
  },
];

client.interceptors.request.use((_payload) => {
  const payload = _payload;
  const token = window.ls.get(cfg.tokenName);

  if (token != null) {
    payload.headers.Authorization = `JWT ${token}`;
  }

  return payload;
}, (error) => {
  LG('request failed');
  return Promise.reject(error);
});

const RESOURCE = 'articles';
export const store = createCrudModule({
  resource: RESOURCE, // The name of your CRUD resource (mandatory)
  idAttribute: 'id', // What should be used as ID
  urlRoot: `${cfg.server}/api/${RESOURCE}`, // The url to fetch the resource
  client,
  // onFetchListError: (err) => {
  //   LG(`*******  ?? 401 ?? ******\n${err}`);
  //   // store.dispatch('logIn');
  // },
  // onFetchSingleError: () => {
  //   store.dispatch('logIn');
  // },
  // onCreateError: () => {
  //   store.dispatch('logIn');
  // },
  // onUpdateError: () => {
  //   store.dispatch('logIn');
  // },
  // onReplaceError: () => {
  //   store.dispatch('logIn');
  // },
  // onDestroyError: () => {
  //   store.dispatch('logIn');
  // },
});

// export { default as Article } from './Article';
// export { default as Blog } from './Blog';

