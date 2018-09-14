<template>
  <div @click="shutBurger" class="navbar-item has-dropdown is-hoverable">
    <router-link class="navbar-item"  :to="{ name: 'start' }">
      Distributor
    </router-link>
    <div class="navbar-dropdown is-boxed">
      <router-link class="navbar-item"  :style="canOpen('start')" :to="{ name: 'start' }">
        Sales
      </router-link>
      <router-link class="navbar-item"  :style="canOpen('start')" :to="{ name: 'start' }">
        Bonus
      </router-link>
      <router-link class="navbar-item" :style="canOpen('bottles/list')" :to="{ name: 'bottles/list' }">
        Bottle Inventory
      </router-link>
      <router-link class="navbar-item" :style="canOpen('bottles/test')" :to="{ name: 'bottles/test' }">
        Bottle test
      </router-link>
    </div>
  </div>
</template>

<script>

  import { shutBurgerMenu } from '@/utils/responsive';

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
