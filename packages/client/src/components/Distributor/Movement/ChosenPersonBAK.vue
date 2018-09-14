<template>
  <div class="person tag is-info" @click="edit">{{item.value.name}}</div>
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
        this.item.type = 'person';
        if (this.personChosen !== NONECHOSENFLAG) {
          LG('UNCHOOSING person, so unchoose all');
          this.unChooseAll();
        }
        this.choosePerson(NONECHOSENFLAG);
      },
    },
  };
</script>
