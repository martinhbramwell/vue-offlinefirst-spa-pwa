<template>
  <div @click="shutBurger" class="navbar-item has-dropdown is-hoverable">
    <router-link class="navbar-item"  :to="{ name: 'start' }">
      Admin
    </router-link>
    <div class="navbar-dropdown is-boxed">
      <router-link class="navbar-item" :style="canOpen('persons/list')" :to="{ name: 'persons/list' }">
        User Management
      </router-link>
      <router-link class="navbar-item"  :style="canOpen('start')" :to="{ name: 'start' }">
        Accounts Payable
      </router-link>
      <router-link class="navbar-item"  :style="canOpen('start')" :to="{ name: 'start' }">
        Accounts Receivable
      </router-link>
    </div>
  </div>
</template>

<script>

  import { shutBurgerMenu } from '@/utils/responsive';
  import { store as Person } from '../Admin/Person'; // eslint-disable-line no-unused-vars

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
