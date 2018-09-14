<template>
  <section>
    <b-tabs v-model="activeTab">

      <b-tab-item label="Invoices">
        <router-view name="invoicesList"/>
      </b-tab-item>

      <b-tab-item :visible="canEdit()" label="Add Invoice">
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

  import Create from './Create';

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  export default {
    name: 'Invoice',
    components: {
      Create,
    },
    computed: {
      ...mapGetters('invoice', {
        currentTab: 'getCurrentTab',
      }),
      activeTab: {
        get: () => store.state.invoice.currentTab,
        set: newTab => store.dispatch('invoice/setCurrentTab', newTab),
      },
    },
    methods: {
      canEdit() {
        return this.$can('comment', 'invoices/list');
      },
      qtst() {
        LG(' ------- Quick Test -------');
        this.onCreateInvoice();
      },
      // onCreateInvoice() {
      //   this.createInvoice({
      //     data: {
      //       store: 'invoice',
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
      ...mapActions('invoice', {
        createInvoice: 'create',
        setTab: 'setCurrentTab',
      }),
    },
  };
</script>
