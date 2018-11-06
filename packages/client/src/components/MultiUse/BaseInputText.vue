<template>
  <!--
    Everything is wrapped in a label, which acts as a clickable wrapper around a form element.
    In this case, the file input.
  -->
  <label class="file-select">
    <!-- We can't use a normal button element here, as it would become the target of the label. -->
    <div class="select-button">
      <!-- Display the filename if a file has been selected. -->
      <span v-if="value">Selected File: {{value.name}}</span>
      <span v-else>Select File</span>
    </div>
    <!-- Now, the file input that we hide. -->
    <input type="file" @change="handleFileChange"/>
  </label>
</template>

<!--
<template>
  <span>
    <input ref="awesomplete"
           v-model="model"
           class="form-control"
           :placeholder="placeholder"
           :class="classes"
           type="text"
           autofocus
           title
    />
  </span>
</template>
 -->


<script>
  import Awesomplete from 'awesomplete';

  export default {
    name: 'awesomplete',
    data() {
      return {
        model: '',
        awesomplete: {},
      };
    },
    props: {
      placeholder: { default: '', type: String, required: false },
      list: { default: '', type: Array, required: true },
      classes: { default: String, type: String, required: false },
    },
    mounted() {
      const self = this;

      this.$nextTick(() => {
        this.awesomplete = new Awesomplete(self.$refs.awesomplete, {
          minChars: 3,
          maxItems: 5,
          list: this.list,
        });

        this.$refs.awesomplete.focus();
      });
    },
  };
</script>
