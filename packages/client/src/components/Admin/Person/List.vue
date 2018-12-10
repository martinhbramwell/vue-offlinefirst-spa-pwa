<template>
  <section>
<!--
    <b-loading :is-full-page="false" :active.sync="isBusy" :canCancel="true"></b-loading>
 -->
    <b-table
      :data="isEmpty ? [] : persons"
      :columns="columns"
      :striped="true"
      paginated
      :per-page="20"
      :current-page="1"
      :opened-detailed="defaultOpenedDetails"
      detailed
      detail-key="codigo"
      @details-open="(row, index) => $toast.open(`Expanded ${row.nombre}`)"
      focusable>

      <template slot-scope="props" slot="header">
        <b-tooltip position="is-left" :active="!!props.column.meta" :label="props.column.meta" dashed>
          {{ props.column.label }}
        </b-tooltip>
      </template>

      <template slot="detail" slot-scope="{ row }">
        <person-detail :id="row.codigo" />
      </template>

      <template slot="empty">
        <section class="section">
          <div style="font-size:large;" class="content has-text-grey has-text-centered">
            <icon scale="3" name="thumbs-down" />
            <p>No results</p>
          </div>
        </section>
      </template>
    </b-table>

    <div class="block">
        {{ refresh }}
        <button class="button is-small is-primary"
            @click="columnSelectorOpen = !columnSelectorOpen">
            Escoger Columnas
        </button>
    </div>

    <b-collapse class="panel" :open.sync="columnSelectorOpen">
      <ul>
        <b-field grouped group-multiline>
          <div v-for="(column, index) in columns"
            :key="index"
            class="control">
            <li>
              <b-checkbox v-model="column.visible">
                {{ column.meta }}
              </b-checkbox>
            </li>
          </div>
        </b-field>
      </ul>
    </b-collapse>

  </section>
</template>

<script>
  import { mapState, mapActions, mapGetters } from 'vuex';

  import PersonDetail from './RUDcards';
  // import PersonDetail from './Retrieve';
  import { LoaderProgress as spinner } from '@/database/vuejs-pouchdb'; // eslint-disable-line no-unused-vars

  // const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  export default {
    name: 'PersonList',
    mounted() {
      window.lgr.debug('!!!!!!!!!!!!!!!! mounted person list !!!!!!!!!!!!!!!!!!');

      // spinner.start(this.$loading);
      // this.$store.watch(
      //   state => state.dbmgr.categoriesLoading,
      //   spinner.kill,
      // );
    },
    beforeMount() {
      window.lgr.debug('\n * * Ready to fetch persons * * \n');
      if (this.isLoadingList || this.persons.length > 0) return;
      this.onFetchPersons();
    },
    props: {
      tst: { val: 'passed in with props' },
    },
    data() {
      const persons = [];
      return {
        anObj: { tst: 'passed in as data' },
        isFullPage: false,
        isEmpty: false,
        defaultOpenedDetails: [123],
        selected: persons[1],
        columnSelectorOpen: false,
      };
    },
    components: {
      'person-detail': PersonDetail, // eslint-disable-line no-undef
    },
    computed: {
      ...mapGetters('person', {
        persons: 'list',
        prod: 'getPerson',
        columns: 'getColumns',
        getDirtyData: 'getDirtyData',
      }),
      ...mapGetters({
        loggedIn: 'isAuthenticated',
      }),

      ...mapState('person', {
        isLoadingList: 'isFetchingList',
        isUpdating: 'isUpdating',
        isCreating: 'isCreating',
      }),
      refresh() {
        if (this.getDirtyData > 0) {
          window.lgr.error(`* * Person list dirty? (${this.getDirtyData}) * *`);
          this.fetchPersons();
        }
        return (this.getDirtyData > 0) ? '|' : '_';
      },
      // isBusy() {
      //   return this.isLoadingList || this.isUpdating || this.isCreating;
      // },
    },

    methods: {
      ...mapActions(['handle401', 'notifyUser']),
      ...mapActions('person', {
        fetchPersons: 'fetchAll',
        setColumns: 'setColumns',
        setDirtyData: 'setDirtyData',
      }),
      onFetchPersons() {
        window.lgr.debug(' * * Try to fetch persons * *');
        this.fetchPersons();
      },
    },
  };
</script>
