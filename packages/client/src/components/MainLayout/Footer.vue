<template>
  <div>

    <section>
        <b-notification :type="msgError.lvl" has-icon :active.sync="isError">
        {{ msgError.txt }}
      </b-notification>


    </section>

    <div class="control">
      <b-switch v-model="aclDebug" type="is-danger">
        Debug
      </b-switch>
    </div>

    <div v-if="aclDebug">
      <div class="mdl-grid">
        <div class="mdl-cell mdl-cell--3-col mdl-cell mdl-cell--1-col-tablet mdl-cell--hide-phone">

        <!--/div>
        <div class="mdl-cell mdl-cell--6-col mdl-cell--4-col-phone" -->
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
        { { access } }
      </p>
      <div>
        User status :: " {{ getExpiry() }} "
      </div>
      <a class="button is-small" @click="qtst">
        Quick Tests
      </a>
    </div>
    <div v-else class="is-small">Version :: v{{theVersion}}</div>
  </div>
</template>

<script>

  import { mapGetters, mapActions, mapState } from 'vuex'; // eslint-disable-line no-unused-vars
  import jwt from 'jsonwebtoken';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars
  export default {
    // data() {
    //   return {
    //     aclDebug: false,
    //     // aclDebug: true,
    //   };
    // },
    methods: {
      getExpiry() {
        try {
          const expiry = new Date(jwt.decode(this.tkn).exp * 1000);
          const now = new Date();
          return `Token expiry at ${expiry.getDate()} ${expiry.toTimeString()}  vs  ${now.getDate()} ${now.toTimeString()}`;
        } catch (e) {
          return 'Logged out';
        }
      },
      qtst() {
        LG(' ------- Quick Test -------');
      },
    },
    computed: {
      aclDebug: {
        get() { return (this.$store && this.$store.state && this.$store.state.isDebug) || false; },
        set() {
          LG(this);
          this.$store.dispatch('debugMode', this.$store.state.isDebug = !this.$store.state.isDebug);
        },
      },
      theVersion() {
        return window.version;
      },
      ...mapGetters({
        tkn: 'axsToken',
        isHere: 'isActive',
        isKnown: 'isAuthenticated',
        isError: 'isError',
        // isDebug: 'isDebug',
        msgError: 'msgError',
      }),
    },
  };

</script>
