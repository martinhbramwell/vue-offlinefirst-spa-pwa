<template>
  <div id="app" class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <!-- Header container -->
    <router-view name="hdr"></router-view>
    <main class="mdl-layout__content">
      <div class="page-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>


<script>

  // import cfg from './config';

  // const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  import { responsivity } from '@/utils/responsive';

  export default {
    name: 'app',
    data: () => ({
    }),
    created() {
      document.addEventListener('DOMContentLoaded', responsivity);
    },
  };
</script>

<style>
  @import url('https://use.fontawesome.com/releases/v5.0.9/css/all.css');
  @import url('https://fonts.googleapis.com/css?family=Advent+Pro:thin|Open+Sans:light');


  #app {
    font-family: 'Open Sans', Open Sans, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #022442;
    border: 2px solid white;
    padding-right: 10px;
    padding-left: 10px;
    background-image: url('../static/img/BodyBgnd.jpg'); background-repeat: repeat;
    /* Only 'BodyBgnd.jpg' can be used, due to tricks in /build/build.js  */
  }
</style>
