<template>
  <section>
<!--
    <b-loading :is-full-page="false" :active.sync="isBusy" :canCancel="true"></b-loading>
 -->
    <b-table
      :data="isEmpty ? [] : products"
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

        <product-detail :id="row.codigo" />
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

    <!-- <div class="block is-size-7 has-text-light"> -->
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

  import ProductDetail from './Retrieve';
  import { LoaderProgress as spinner } from '@/database/vuejs-pouchdb'; // eslint-disable-line no-unused-vars

  export default {
    name: 'ProductList',
    mounted() {
      window.lgr.warn('!!!!!!!!!!!!!!!! mounted product list !!!!!!!!!!!!!!!!!!');

      // spinner.start(this.$loading);
      // this.$store.watch(
      //   state => state.dbmgr.categoriesLoading,
      //   spinner.kill,
      // );
    },
    beforeMount() {
      window.lgr.warn('\n * * Ready to fetch products * * \n');
      if (this.isLoadingList || this.products.length > 0) return;
      this.onFetchProducts();
    },
    props: {
      tst: { val: 'passed in with props' },
    },
    data() {
      const products = [];
      return {
        anObj: { tst: 'passed in as data' },
        isFullPage: false,
        isEmpty: false,
        defaultOpenedDetails: [123],
        selected: products[1],
        columnSelectorOpen: false,
      };
    },
    components: {
      'product-detail': ProductDetail, // eslint-disable-line no-undef
    },
    computed: {
      ...mapGetters('product', {
        products: 'list',
        prod: 'getProduct',
        columns: 'getColumns',
        getDirtyData: 'getDirtyData',
      }),
      ...mapGetters({
        loggedIn: 'isAuthenticated',
      }),

      ...mapState('product', {
        isLoadingList: 'isFetchingList',
        isUpdating: 'isUpdating',
        isCreating: 'isCreating',
      }),
      refresh() {
        if (this.getDirtyData > 0) {
          window.lgr.error(`* * Product list dirty? (${this.getDirtyData}) * *`);
          this.fetchProducts();
        }
        return (this.getDirtyData > 0) ? '|' : '_';
      },
      // isBusy() {
      //   return this.isLoadingList || this.isUpdating || this.isCreating;
      // },
    },

    methods: {
      ...mapActions(['handle401', 'notifyUser']),
      ...mapActions('product', {
        fetchProducts: 'fetchAll',
        setColumns: 'setColumns',
        setDirtyData: 'setDirtyData',
      }),
      onFetchProducts() {
        window.lgr.debug(' * * Try to fetch products * *');
        this.fetchProducts();
      },
    },
  };
</script>
