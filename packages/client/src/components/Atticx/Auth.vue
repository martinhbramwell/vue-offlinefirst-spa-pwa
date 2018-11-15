<template>
  <div>
    <div v-if="isKnown && isHere">
      <a class="button is-small" v-bind:class="highLightAdmin" data-cyp="logOut" @click="signOut">
        <span name="icon">
          <icon name="sign-out-alt" />
        </span>&nbsp;{{ $t('label.signout') }}, {{ user }}
      </a>
    </div>
    <div v-else="isKnown && isHere">
      &nbsp;
      <a class="button is-small" data-cyp="logIn" @click="logIn">
        <icon name="sign-in-alt" />
        &nbsp;{{ $t('label.signin') }}
      </a>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapActions } from 'vuex';

  import cfg from '@/config';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  const vm = {
    name: 'auth',
    data() {
      return {
        // counter: 0,
        // sentinel: false,
        tkn: null,
        axStkn: 'unused',
        isActive: 'unused',
      };
    },

    beforeUpdate() {
      if (!this.$store.getters.permissions) return;
      if (this.access === this.$store.getters.permissions) return;
      this.access = this.$store.getters.permissions;
    },

    created() {
      const self = this;

      // this.isActive = window.ls.get(cfg.activityName, 0);
      window.ls.on(cfg.activityName, (pyld) => {
        window.lgr.warn(`Auth.vue :: Activity updated :: ${pyld}`);
        self.setActivity(pyld);
      });

      window.ls.on(cfg.authName, (pyld) => {
        window.lgr.warn(`Auth.vue :: Auth updated :: ${pyld}`);
        self.setAuth(pyld);
      });

      this.axStkn = window.ls.get(cfg.tokenName, 0);
      window.ls.on(cfg.tokenName, (pyld) => {
        window.lgr.warn(`Auth.vue :: New token value in local store :: ${pyld}`);
        self.keepTkn(pyld);
        // this.axStkn = pyld;
        // self.sentinel = !self.sentinel;
      });
    },
    computed: {
      highLightAdmin() {
        return this.$store.getters.accessLevel.toString() === 'admin' ? 'is-warning' : '';
      },
      ...mapGetters({
        jwt: 'axsToken',
        isHere: 'isActive',
        isKnown: 'isAuthenticated',
        user: 'nameUser',
        roles: 'permissions',
        priv: 'accessLevel',
      }),
    },
    methods: {
      ...mapActions(['keepTkn', 'logIn', 'logOut', 'setActivity', 'setAuth']),
      signOut() {
        this.logOut();
        this.$router.push({ name: 'home' });
      },
      signIn() {
        this.logIn();
        this.$router.push({ name: 'home' });
        window.lgr.info(`Auth.vue :: signin '[${this.access}]'`);
      },
    },
  };

export default vm;
</script>

<style>

span[name="icon"] {
  font-size: 200%;
}

</style>
