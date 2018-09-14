<template>
  <div class="person tag is-white" @click="edit">{{item.value.name}}</div>
</template>

<script>

  import { mapGetters, mapActions, mapState } from 'vuex'; // eslint-disable-line no-unused-vars
  import { NONECHOSENFLAG } from './index';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    props: ['item'],
    computed: {
      ...mapState('movement', ['personChosen']),
    },
    methods: {
      ...mapActions('movement', ['choosePerson', 'unChooseAll']),
      edit() {
        LG(this.item.type);
        LG(this.personChosen);
        LG(NONECHOSENFLAG);
        this.item.type = 'chosen';
        if (this.personChosen !== NONECHOSENFLAG) {
          LG('CHOOSING person, but there is one already, so unchoose all');
          this.unChooseAll();
        }

        this.choosePerson(this.item.value.name);
        // this.item.value.name += ' #';
      },
    },
  };
</script>
