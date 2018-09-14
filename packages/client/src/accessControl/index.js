import { Ability, AbilityBuilder } from '@casl/ability';

import accessGroups from './accessGroups';

import Levels from './Levels';


const LG = console.log; // eslint-disable-line no-console, no-unused-vars

Levels.idxAliases.forEach((lvl) => {
  if (lvl !== 'none') Ability.addAlias(lvl, Levels.aliases[lvl]);
});

export const abilities = AbilityBuilder.define((can) => {
  Object.entries(accessGroups).forEach(([key, value]) => { // eslint-disable-line no-unused-vars
    // LG(`+++++++++++++++++ accessGroups ++++++++++++++++ ${key}`);
    // LG(value);
    can('do_nothing', value);
  });
});


export const currentUser = {
  child: vx => (vx ? vx.state.a12n.user : null),
};

const routeAccessControls = (t, f, nxt) => { // eslint-disable-line no-unused-vars
  if (!(window.ability && window.ability.can)) return null;

  // LG(`


  //   accessControl/index ===>
  //   routeAccessControls beforeEach ==> Query has '${t.name}'.`);
  // LG(window.ability);
  if (t.name === 'home') return null;
  if (window.ability.can('only_view', t.name)) return null;
  return false;
};

export const beforeEach = [
  routeAccessControls,
];


const state = {
  user: {
    permissions: {
      // Example: Levels.NO_ACCESS,
      Example: Levels.VIEW_ONLY,
      // Example: Levels.COMMENT,
      // Example: Levels.ALTER,
      // Example: Levels.OWN,

      // Invoice: Levels.NO_ACCESS,
      Invoice: Levels.VIEW_ONLY,
      // Invoice: Levels.COMMENT,
      // Invoice: Levels.ALTER,
      // Invoice: Levels.OWN,

      // Person: Levels.NO_ACCESS,
      // Person: Levels.VIEW_ONLY,
      // Person: Levels.COMMENT,
      // Person: Levels.ALTER,
      Person: Levels.OWN,

      // Product: Levels.NO_ACCESS,
      Product: Levels.VIEW_ONLY,
      // Product: Levels.COMMENT,
      // Product: Levels.ALTER,
      // Product: Levels.OWN,
      // Example: Levels.NO_ACCESS,

      Bottle: Levels.VIEW_ONLY,
      // Example: Levels.COMMENT,
      // Example: Levels.ALTER,
      // Example: Levels.OWN,

    },
  },
};

const getters = {
  getUserPermissions: vx => vx.user.permissions,
};

const mutations = {
  changePermission(vx, chg) {
    window.lgr.debug(`Access Control (mutation) :: changePermissions of "${chg.resource}"`);
    vx.user.permissions[chg.resource] = chg.setting; // eslint-disable-line no-param-reassign
    // LG(vx.user.permissions);
  },
};

const actions = {
  resetPermissions(vx, args) {
    const { payload, ability } = args;
    const prms = JSON.parse(payload.permissions.replace(/'/g, '"'));
    Object.keys(prms).forEach((permission) => {
      const change = { resource: permission, setting: prms[permission] };
      LG(change);
      vx.dispatch('changePermissions', { change, ability });
    });


    LG(`

      Permissions reset >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    `);
  },
  changePermissions(vx, args) {
    const { change, ability } = args;

    // LG('args.ability');
    // LG(ability);
    // LG(change);
    // LG('accessGroups');
    // LG(accessGroups);
    vx.commit('changePermission', change);

    const newRules = [];
    ability.rules.map((rule) => { // eslint-disable-line arrow-body-style
      let existing = false;

      rule.subject.forEach((subj) => {
        // LG(`rule : subj = ${subj}`);
        if (!existing) existing = accessGroups[change.resource].includes(subj);
        // LG(`existing = ${existing}`);
      });

      if (existing) {
        newRules.push({
          actions: Levels.idxAliases[change.setting],
          subject: accessGroups[change.resource],
        });
        // LG(`Updated rule : setting = ${Levels.idxAliases[change.setting]}`);
        // LG(accessGroups[change.resource]);
      } else {
        newRules.push(rule);
      }
      return rule;
    });

    ability.update(newRules);

    // LG(' -- ability -- ');
    // LG(ability.rules.forEach((rule) => {
    //   LG(rule);
    // }));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

const rsrc = new Set();
Object.keys(accessGroups).forEach((x) => {
  rsrc.add(x);
});
const Resources = Array.from(rsrc);

export { Levels, Resources };
