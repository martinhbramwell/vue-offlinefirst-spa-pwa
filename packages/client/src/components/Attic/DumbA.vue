<template>
  <div>
    Dumb #A --> {{ counter }}
  </div>
</template>

<script>

  // const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    name: 'A',
    data() {
      return {
        old_counter: 0,
      };
    },
    computed: {
      counter() {
        return this.$store.state.counter;
      },
    },
  };
</script>


<style scoped>
</style>