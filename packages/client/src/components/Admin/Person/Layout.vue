<template>
  <section>
    <b-tabs v-model="activeTab">
      <b-tab-item label="Add Person">
        <Create/>
      </b-tab-item>
      <b-tab-item :visible="canEdit()" label="Persons">
        <router-view name="personsList"/>
      </b-tab-item>
    </b-tabs>

    <router-link class="button is-small is-link is-outlined" v-bind:to="{name: 'home'}">
      <icon name="arrow-circle-up" />
      &nbsp;Home
    </router-link>
  </section>
</template>

<script>
  import { mapState, mapActions, mapGetters } from 'vuex'; // eslint-disable-line no-unused-vars

  import { store } from '@/store';

  import Create from './Create';

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  export default {
    name: 'Person',
    components: {
      Create,
    },
    computed: {
      ...mapGetters('person', {
        currentTab: 'getCurrentTab',
      }),
      activeTab: {
        get: () => store.state.person.currentTab,
        set: newTab => store.dispatch('person/setCurrentTab', newTab),
      },
    },
    methods: {
      canEdit() {
        return this.$can('comment', 'persons/list');
      },
      ...mapActions('person', {
        createPerson: 'create',
        setTab: 'setCurrentTab',
      }),
    },
  };
</script>
