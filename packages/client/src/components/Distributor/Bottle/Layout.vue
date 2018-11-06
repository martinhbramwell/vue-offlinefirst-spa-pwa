<template>
  <section>
    <b-tabs v-model="activeTab">

      <b-tab-item label="Bottles">
        <router-view name="bottlesList"/>
      </b-tab-item>

      <b-tab-item :visible="canEdit()" label="Add Bottle">
        <Create/>
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

  import Create from './CreateBottle';

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  export default {
    name: 'Bottle',
    components: {
      Create,
    },
    computed: {
      ...mapGetters('bottle', {
        currentTab: 'getCurrentTab',
      }),
      activeTab: {
        get: () => store.state.bottle.currentTab,
        set: newTab => store.dispatch('bottle/setCurrentTab', newTab),
      },
    },
    methods: {
      canEdit() {
        return this.$can('comment', 'bottles/list');
      },
      qtst() {
        LG(' ------- Quick Test -------');
        this.onCreateBottle();
      },
      // onCreateBottle() {
      //   this.createBottle({
      //     data: {
      //       store: 'bottle',
      //       mode: 'post',
      //       data: {
      //         ruc_cedula: '0708217086001',
      //         nombre: 'Jesu Cristo',
      //         direccion: '#1 Pearly Gates',
      //         telefono: '099-444-4719',
      //         distribuidor: 'si',
      //         retencion: 'si',
      //         tipo: '_04',
      //         scabetti: '333',
      //         tipo_de_documento: 'RUC',
      //       },
      //     },
      //   });
      // },
      ...mapActions('bottle', {
        createBottle: 'create',
        setTab: 'setCurrentTab',
      }),
    },
  };
</script>
