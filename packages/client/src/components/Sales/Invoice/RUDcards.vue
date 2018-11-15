<template>
  <section>
    <nav class="panel">
      <p class="panel-heading">
            <span class="is-size-6">Registro #{{ p(id).codigo }}</span>
      </p>
      <b-tabs v-model="activeSubTab">
        <b-tab-item>
          <template slot="header">
            <p class="button is-small is-outlined">
              <b-icon icon="eye"></b-icon>
            </p>
          </template>
          <invoice-record :invc="p(id)"/>
        </b-tab-item>

        <b-tab-item :visible="canAlter()">
          <template slot="header">
            <p class="button is-small is-info is-outlined">
              <b-icon icon="edit"></b-icon>
            </p>
          </template>
          <invoice-update :invc="p(id)"/>
        </b-tab-item>

        <b-tab-item :visible="canAssign()">
          <template slot="header">
            <p class="button is-small is-warning has-text-weight-bold is-outlined">
              <b-icon icon="lock"></b-icon>
            </p>
          </template>
          <invoice-auth :invc="p(id)"/>
        </b-tab-item>

        <b-tab-item :visible="canAssign()">
          <template slot="header">
            <p class="button is-small is-danger is-outlined">
              <b-icon icon="trash"></b-icon>
            </p>
          </template>
          The record for "{{ p(id).nombre }}" will be marked for deletion, will no longer appear in the invoices list, but will be kept for historical purposes.

          <nav class="level">
            <div class="level-right">
              <div class="level-item has-text-centered">
                <a class="button is-info" @click="activeSubTab = 0">Go back</a>
              </div>
            </div>
            <div class="level-left">
              <div class="level-item has-text-centered">
                <a class="button is-danger">Yes, Delete</a>
              </div>
            </div>
          </nav>
        </b-tab-item>

      </b-tabs>
    </nav>
  </section>
</template>

<script>
  import { mapGetters } from 'vuex';
  import Retrieve from './Retrieve';
  import Update from './Update';
  import Permissions from './Permissions';

  export default {
    name: 'RUDcards',
    props: ['id', 'distributor'],
    data() {
      return {
        activeSubTab: 0,
      };
    },
    components: {
      'invoice-record': Retrieve, // eslint-disable-line no-undef
      'invoice-update': Update, // eslint-disable-line no-undef
      'invoice-auth': Permissions, // eslint-disable-line no-undef
    },
    methods: {
      canAlter() {
        return this.$can('alter', 'invoice');
      },
      canAssign() {
        return this.$can('assign', 'invoice');
      },
    },
    computed: {
      ...mapGetters('invoice', {
        p: 'getInvoice',
      }),
    },
  };
</script>
