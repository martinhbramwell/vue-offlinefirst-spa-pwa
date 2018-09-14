<template>
  <section id="hdr">
    <nav class="level">
      <!-- Left side -->
      <div class="level-left">
        <div class="level-item">
          <router-link v-bind:to="{name: 'home'}">
            <img
              src="static/img/WaterDrop_50.png"
              alt="Iridium Blue Logo">
            <span data-cyp="appTitle" style="font-family: 'Advent Pro'; font-size: 48px;">iridium blue</span>
          </router-link>
        </div>
      </div>

      <!-- Right side -->
      <div class="level-right">
        <div class="level-item">
          <accessControl></accessControl>
        </div>
      </div>
    </nav>


    <b-collapse id="divTbl" :open="true">
      <button class="button is-small is-primary" slot="trigger">Authorizations Tester</button>
      <div>
        <table id="axsCtrl" class="table is-narrow is-hoverable is-size-6">
          <thead>
            <tr>
              <th id="colRsrc">Resource</th>
              <th id="colPrvlg">Privilege</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in axsLvlTblDef">
              <th id="colRsrc" class="is-size-7">{{ row.name }}</th>
              <td id="colPrvlg">
                <b-field>
                  <b-select class="is-size-7" :placeholder="row.name" v-model="axsLvl[row.name]">
                    <option v-for="l in axsLvls" :value="l.id" :key="l.id">
                     {{ l.axs }}
                    </option>
                  </b-select>
                </b-field>
              </td>
              <td class="is-info is-hidden">{{ axsLvls[axsLvl[row.name]].axs }}</td>
            </tr>
          </tbody>
          <tfoot class="is-hidden">
            <tr>
              <th id="colRsrc">Resource</th>
              <th id="colPrvlg">Privilege</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </b-collapse>


    <div>
      <p>
        <input
          type="radio"
          name="role"
          value="admin"
          v-model="role"
          @change="onRoleChange" />
        <label>Admin</label>
      </p>
      <p>
        <input
          type="radio"
          name="role"
          value="user"
          v-model="role"
          @change="onRoleChange" />
        <label>Regular User</label>
      </p>

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

    </div>

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

  import { mapMutations, mapState, mapGetters } from 'vuex';
  import { Levels as accessLevels } from '@/accessControl';

  import authentication from './Auth';


  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  // const axsLvls = ['No Access', 'View Only', 'Comment', 'Alter', 'Own'];
  LG('ACCESS LEVELS :::::::::::::');
  LG(accessLevels.alvls[accessLevels.OWN]);

  export default {
    data() {
      return {
        activeTab: 0,
        aclDebug: false,

        lvlAcl: 0,
        axsLvlSelectorOpen: false,
        role: 'admin',
        // axsLvls: Array.from(axsLvls, (x, ix) => ({ id: ix, axs: x })),
        axsLvls: accessLevels.olvls,
        axsLvl: { Classified: 0, Protected: 0 },
        axsLvlTblDef: {
          Classified: { name: 'Classified' },
          Protected: { name: 'Protected' },
        },
        // axsRights: ['visitor'],
      };
    },
    computed: {
      theVersion() {
        return window.version;
      },
      ...mapState([
        'a12n.user',
      ]),
      ...mapGetters({
        jwt: 'axsToken',
        isHere: 'isActive',
        isKnown: 'isAuthenticated',
      }),

      // axsRoles() {
      //   this.$store.dispatch('setAxsRole', { roles: this.access });
      //   return this.access;
      // },
      // axsRights: {
      //   get: () => {
      //     LG(` .  .  .  .  ${this.access} `);
      //     return this.access;
      //   },
      //   set: (roles) => {
      //     LG(` .  .  .  . ${roles} vs ${this.access} `);
      //     this.access = roles;
      //   },
      // },
    },
    components: {
      accessControl: authentication,
    },
    methods: {
      showTab() {
        return true;
      },
      ...mapMutations([
        'changeRole',
      ]),
      onRoleChange() {
        LG(`================================ ${this.role}`);
        this.changeRole(this.role);
      },
      // ...mapActions(['setAxsRole']),
      setRole() {
        this.access = this.axsRights;
        // LG(`================================ ${this.access} vs ${this.axsRights}`);
        this.$store.dispatch('setAxsRole', { roles: this.axsRights });
      },
      prog() {
        LG(' ------- prog -------');
      },
    },
  };
</script>

<style scoped>

  #hdr {
    text-align: center;
  }

  #divTbl {
    width: 100%;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  #axsCtrl {
    width: 70%;
    margin: 0 auto;
    background-color: rgba(0, 0, 0, 0.05);
  }

  #colRsrc {
    text-align: right;
    vertical-align: bottom;
    padding-bottom: 8px;
  }
  #colPrvlg {
    text-align: center;
    padding-left: 18px;
  }
</style>
