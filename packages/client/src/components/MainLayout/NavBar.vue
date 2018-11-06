<template>
  <nav class="navbar is-transparent" style="background-color: transparent;">
    <div class="navbar-brand">
      <router-link v-bind:to="{name: 'home'}">
        <img
          :src="logo"
          alt="Iridium Blue Logo">
        <span data-cyp="appTitle" style="font-family: 'Advent Pro'; font-size: 48px;">iridium blue</span>
      </router-link>
      <div id="burger" class="navbar-burger burger" data-target="burgerBar">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div id="burgerBar" class="navbar-menu burger-bar">
      <div class="navbar-start">
        <Shop/>
        <Distributor />
        <Admin />
        <Tests />
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="field is-grouped">
            <Authentication />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>

  import { shutBurgerMenu } from '@/utils/responsive';
  import Authentication from '@/accessControl/Authentication';

  import Shop from '../Shop/Menu';
  import Admin from '../Admin/Menu';
  import Tests from '../Tests/Menu';
  import Distributor from '../Distributor/Menu';


  const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  export default {
    components: {
      Authentication,
      Shop,
      Admin,
      Tests,
      Distributor,
    },
    data() {
      return {
        activeTab: 0,
        logo: `${process.env.BASE_URL}img/WaterDrop_50.png`,
      };
    },
    methods: {
      showTab() {
        return true;
      },
      shutBurger() {
        LG(shutBurgerMenu());
      },
    },
  };
</script>

<style scoped>

  section {
    text-align: left;
  }
</style>
