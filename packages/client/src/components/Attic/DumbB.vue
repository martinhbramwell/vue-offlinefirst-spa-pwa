<template>
  <div>
    <button type="button" @click="increment">Increment</button>
    <button type="button" @click="decrement">Decrement</button>
    <div> Dumb #B -- count {{ counter.other }}</div>
    <div> Token {{ token }}</div>
  </div>
</template>

<script>

  import { mapGetters, mapActions } from 'vuex';

  import cfg from '../../config';

  // const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    name: 'B',
    data() {
      return {
        old_counter: 0,
        axStkn: 'unused',
      };
    },
    // watch: {
    //   counter(val) {
    //     window.ls.set(cfg.reroutesCounterName, val);
    //   },
    // },
    created() {
      this.axStkn = window.ls.get(cfg.tokenName, 0);
      const self = this;
      window.ls.on(cfg.tokenName, (lsToken) => {
        window.lgr.warn(`New token value in local store :: ${lsToken}`);
        self.keepTkn(lsToken);
      });
    },
    computed: {
      ...mapGetters({
        counter: 'theCounter',
        token: 'axsToken',
      }),
    },
    methods: {
      ...mapActions(['increment', 'decrement', 'keepTkn']),
    },
  };
</script>


<style scoped>
</style>
