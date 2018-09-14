<template>
  <section>
<!--                   ******  HOW TO SET A SPECIFIC TAB ********
    <div class="block">
      <button class="button" @click="activeTab = 1">Set Pictures</button>
    </div>
 -->
<!-- 
    <b-tabs v-model="activeTab">
      <b-tab-item :visible="showTab('Shop', ['visitor', 'member', 'distributor', 'staff', 'manager', 'owner', 'legalRepresentative'])" label="Shop">
        <h3>Online Shop tasks</h3>
        <ul is-pulled-left>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Water sales</li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Bottle sales</li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Bottle inventory outgoing</li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Bottle inventory incoming</li>
        </ul>
        <a href="/static/privacypolicy.html" target="_blank">Our privacy policy</a>
      </b-tab-item>

      <b-tab-item :visible="showTab('Distributors', ['distributor', 'staff', 'manager', 'owner', 'legalRepresentative'])" label="Distributors">
        <h3>Distributor Tasks</h3>
        <ul >
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Sales</li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Bonus</li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Bottle inventory</li>
        </ul>
      </b-tab-item>

      <b-tab-item :visible="showTab('Admin', ['manager', 'owner', 'legalRepresentative'])" label="Admin">
        Administrative tasks.
        <ul is-pulled-left>
          <li><b-icon size="is-small" icon="users" />
            <router-link :to="{ name: 'persons' }">
              User Management
            </router-link>
          </li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Accounts Payable</li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Accounts Receivable</li>
          <li><b-icon size="is-small" icon="hand-point-right" /> &nbsp; Banking</li>
        </ul>
      </b-tab-item>

      <b-tab-item :visible="showTab('Tests', ['member'])" label="Tests">
        Tests.
        <ul is-pulled-left>
          <li><b-icon size="is-small" icon="unlock-alt" />
            <router-link :to="{ name: 'protected' }">
              Protected
            </router-link>
          </li>
          <li><b-icon size="is-small" icon="user-secret" />
            <router-link :to="{ name: 'classified' }">
              Classified
            </router-link>
          </li>
        </ul>
      </b-tab-item>

      <b-tab-item :visible="showTab('Orders', ['member', 'distributor', 'staff', 'manager', 'owner', 'legalRepresentative'])" label="Orders" disabled>
        Nunc nec velit nec libero vestibulum eleifend.
        Curabitur pulvinar congue luctus.
        Nullam hendrerit iaculis augue vitae ornare.
        Maecenas vehicula pulvinar tellus, id sodales felis lobortis eget.
      </b-tab-item>
    </b-tabs>
 -->
<!-- 
    <div class="control">
      <b-switch v-model="aclDebug" type="is-danger">
        Debug
      </b-switch>
    </div>
    <div v-if="aclDebug">
      <div class="mdl-grid">
        <div class="mdl-cell mdl-cell--3-col mdl-cell mdl-cell--1-col-tablet mdl-cell--hide-phone">

        <router-link class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" :to="{ name: 'persons' }">
          <i class="material-icons">Persons</i>
        </router-link>
        <router-link class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" :to="{ name: 'ohv' }">
          <i class="material-icons">Old Home </i>
        </router-link>
        </div>
      </div>
      <a class="button is-small">{{ isHere }}</a><a class="button is-small">{{ isKnown }}</a>
      <p class="content">
        <b>Privileges:</b>
        {{ access }}
      </p>
      <div class="is-invisible">
        Token signature :: '{{ jwt.split(".")[2] }}'
      </div>
    </div>
    <div v-else class="is-small">Version :: v{{theVersion}}</div>
 -->
  </section>
</template>

<script>

  // import jwt from 'jsonwebtoken';
  // import { mapGetters } from 'vuex';

  import PersonDetail from './Admin/Person/Detail';

  // import cfg from '../config';
  // import data from '../data';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    // data() {
    //   return {
    //     activeTab: 0,
    //     aclDebug: false,
    //   };
    // },
    computed: {
      // theVersion() {
      //   return window.version;
      // },
      axsRights() {
        // return this.$store.getters.theRoles;
        return this.access;
      },
      // ...mapGetters({
      //   jwt: 'axsToken',
      //   isHere: 'isActive',
      //   isKnown: 'isAuthenticated',
      // }),
    },
    components: {
      'person-detail': PersonDetail, // eslint-disable-line no-undef
    },
    methods: {
      // showTab() {
      //   return true;
      // },
      // showTab(tab, allowedRoles) {
      //   const may = new Set(allowedRoles);
      //   const role = new Set(this.access);
      //   const can = [...may].filter(right => role.has(right));
      //   // LG(may);
      //   // LG(role);
      //   // LG(`........ ${tab} allows [${can}]........`);
      //   return can.length > 0;
      // },
    },
  };
</script>
