<template>
  <div @click="shutBurger" class="navbar-item has-dropdown is-hoverable">
    <router-link class="navbar-item" :to="{ name: 'start' }">
      Shop
    </router-link>
    <div class="navbar-dropdown is-boxed">
      <router-link class="navbar-item" :style="canOpen('invoices/list')" :to="{ name: 'invoices/list' }">
        Invoicing
      </router-link>
      <router-link class="navbar-item" :style="canOpen('products/list')" :to="{ name: 'products/list' }">
        Products
      </router-link>
      <router-link class="navbar-item" :style="canOpen('start')" :to="{ name: 'start' }" event="">
        Payment
      </router-link>
      <router-link class="navbar-item" :style="canOpen('start')" :to="{ name: 'start' }">
        Bottle Returns
      </router-link>
    </div>
  </div>
</template>

<script>

  import { shutBurgerMenu } from '@/utils/responsive';
  import invoicing from '../Sales/Invoice/Layout'; // eslint-disable-line no-unused-vars

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    methods: {
      canOpen(path) {
        return this.$can('only_view', path) ? '' : 'color: bisque;';
      },
      shutBurger() { shutBurgerMenu(); },
    },
  };
</script>
