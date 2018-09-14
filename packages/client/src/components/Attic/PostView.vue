<template>
  <div class="waiting">
    Not yet available
    <AA></AA>
    <BB></BB>
  </div>
</template>


<script>

  import DumbA from './DumbA';
  import DumbB from './DumbB';

  export default {
    components: {
      AA: DumbA,
      BB: DumbB,
    },
  };
</script>


<style scoped>
  .waiting {
    padding: 10px;
    color: #555;
  }
</style>
