<template>

  <vue-awesomplete
    :setting=options
    ref="choices"
    @selectcomplete="$emit('input', $refs.choices.internalValue)"
  >
  </vue-awesomplete>
</template>

<script>

import VueAwesomplete from 'vue-awesomplete';

const LG = console.log; // eslint-disable-line no-unused-vars, no-console

export default {
  components: {
    'vue-awesomplete': VueAwesomplete,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
  },
};
</script>
