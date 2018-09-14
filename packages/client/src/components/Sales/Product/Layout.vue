<template>
  <section>
    <b-tabs>
      <b-tab-item label="Products">
        <router-view name="productsList"/>
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

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  export default {
    name: 'Product',
  };
</script>
