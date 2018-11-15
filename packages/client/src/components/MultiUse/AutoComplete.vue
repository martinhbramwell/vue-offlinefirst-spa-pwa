<template>
    <div class="autocomplete">
      <input
          type="text"
          :id="elemId"
          :ref="elemId"
          @input="onChange"
          @blur="onBlur"
          v-model="search"
          @keyup.down="onArrowDown"
          @keyup.up="onArrowUp"
          @keyup.enter="onEnter"
      />
      <ul id="autocomplete-choices" v-show="isOpen" class="autocomplete-choices">
        <li class="loading" v-if="isLoading">Loading choices</li>
        <li
            v-else
            v-for="(choice, i) in choices"
            :key="i"
            @click="setChoice(choice)"
            class="autocomplete-choice"
            :class="{ 'is-active': i === arrowCounter }">
          {{ choice }}
        </li>
      </ul>
    </div>
</template>

<script>

const LG = console.log; // eslint-disable-line no-unused-vars, no-console
const LGERR = console.error; // eslint-disable-line no-unused-vars, no-console

export default {
  name: 'autocomplete',
  template: '#autocomplete',
  props: {
    elemId: {
      type: String,
      required: true,
      default: () => 'autocomplete',
    },
    items: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    isAsync: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      isOpen: false,
      choices: [],
      search: '',
      isLoading: false,
      arrowCounter: 0,
    };
  },

  methods: {
    onChange() {
      // Is the data given by an outside ajax request?
      if (this.isAsync) {
        this.isLoading = true;
      } else {
        // Let's search our flat array
        this.filterChoices();
        this.isOpen = true;
      }
    },

    filterChoices() {
      this.choices = this.items.list
        .filter(item => item.label.toLowerCase().indexOf(this.search.toLowerCase()) > -1)
        .map(item => item.label);
    },
    setValue(value) {
      LG(`elemId ${this.elemId}`);
      LG(`elemId ${JSON.stringify(this.$refs, null, 2)}`);
      this.$refs[this.elemId].value = value;
    },
    setChoice(choice) {
      LG(`setChoice = ${choice}`);
      this.search = choice;
      this.isOpen = false;
      this.arrowCounter = this.choices.findIndex(item => item === choice);
      this.gotOne();
    },
    onArrowDown() {
      if (this.arrowCounter < this.choices.length) {
        this.arrowCounter += 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter -= 1;
      }
    },
    gotOne() {
      LG(' gotOne \n\n');
      this.search = this.choices[this.arrowCounter];
      if (this.search && this.search.length > 1 && this.choices.includes(this.search)) {
        this.$emit('selection-made', this.items.list
          .filter(item => item.label.indexOf(this.search) > -1)[0]);
        LG(`Chose ${this.search}`);
      }
      this.arrowCounter = -1;
    },
    onBlur() {
      // LG(' onBlur ');
      // this.gotOne();
    },
    onEnter() {
      LG(` onEnter ${this.isOpen}`);
      if (this.isOpen) {
        this.gotOne();

        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
        LG(' handleClickOutside ');
      }
    },
  },
  watch: {
    items: function (val, oldValue) { // eslint-disable-line func-names, object-shorthand
      // actually compare them
      if (val.length !== oldValue.length) {
        this.choices = val;
        this.isLoading = false;
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<style scoped lang="scss">
  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
  }

  .autocomplete {
    position: relative;
    width: 250px;
  }

  .autocomplete-choices {
    padding: 0;
    margin: 0;
    border: 1px solid #eeeeee;
    height: 120px;
    overflow: auto;
    width: 100%;
  }

  .autocomplete-choice {
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
  }

  .autocomplete-choice.is-active,
  .autocomplete-choice:hover {
    background-color: #4aae9b;
    color: white;
  }
</style>
