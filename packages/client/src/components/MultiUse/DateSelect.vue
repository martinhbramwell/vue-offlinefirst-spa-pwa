<template>
  <v-date-picker
    :formats='formats'
    mode='single'
    ref="datePicked"
    v-model='theDate'
    @input="datePick"
    >
<!--     @input="$emit('input', $refs.datePicked.internalValue)"
 -->
  </v-date-picker>
</template>

<script>

const LG = console.log; // eslint-disable-line no-unused-vars, no-console

export default {
  props: {
    value: {
      type: [Date, Boolean],
      default: false,
    },
  },
  created() {
    this.$emit('input', new Date());
  },
  methods: {
    datePick() {
      this.$emit('input', this.theDate);
    },
  },
  data() {
    return {
      theDate: new Date(),
      formats: {
        title: 'MMMM / YYYY',
        weekdays: 'W',
        navMonths: 'MMM',
        input: ['YYYY-MM-DD', 'YYYY/MM/DD'],
        dayPopover: 'L',
        data: ['L', 'YYYY-MM-DD', 'YYYY/MM/DD'],
      },
    };
  },
};
</script>
