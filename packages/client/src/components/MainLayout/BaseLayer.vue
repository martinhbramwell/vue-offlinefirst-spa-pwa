<template>
  <section>
    <NavBar/>
    <PseudoAuthorizations/>
    <router-view/>
    <router-view name="helper"/>
    <Footer/>
  </section>
</template>

<script>

  import Authentication from '@/accessControl/Authentication';
  import PseudoAuthorizations from './PseudoAuthorizations';
  import NavBar from './NavBar';
  import Footer from './Footer';

  export default {
    components: {
      PseudoAuthorizations,
      NavBar,
      Authentication,
      Footer,
    },
  };
</script>

<style scoped>
</style>


