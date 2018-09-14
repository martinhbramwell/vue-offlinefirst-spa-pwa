<template>
  <div id="app">
    <formulate
      name="person"
      class="my-form"
      v-if="!values"
      @submit="useFormData"

      :initial="formData"
    >
        <article class="tile is-child box">
          <h2 class="title">Person</h2>

          <button class="button is-info" type="button" @click="fillForm">Fill</button>


          <div class="columns">
            <div class="column">
              <div class="control">
                <label class="label">Email Address</label>

                <formulate-element
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  validation="required|email"
                />

              </div>
            </div>
            <div class="column">
              <div class="control">
                <label class="label">Password</label>

                <formulate-element
                  name="password_confirmation"
                  type="password"
                  placeholder="Choose a password"
                  validation="required"
                />
              </div>
            </div>
            <div class="column">
              <div class="control">
                <label class="label">Confirm Password</label>

                <formulate-element
                  name="password"
                  type="password"
                  placeholder="Confirm your password"
                  validation-label="Password"
                  validation="required|confirmed"
                />

              </div>
              <div class="control">

                <formulate-element
                  type="submit"
                  name="Save"
                  elementClasses="button is-info"
                />

              </div>
            </div>
          </div>
        </article>
    </formulate>
    <code
      v-else
      class="my-form my-form--code"
      v-text="values"
    />
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return { values: false };
  },
  computed: {
    ...mapGetters({
      formData: 'theFormData',
    }),
  },
  methods: {
    useFormData(vals) {
      this.values = JSON.stringify(vals, null, 2);
    },
    ...mapActions(['fillForm']),
  },
};

</script>

<style>

/*
html,
body {
  min-height: 100%;
}
*/

/*body {
  background: linear-gradient(to top left, #35495e, #41b883);
  background-repeat: no-repeat;
  padding: 0;
  border: 0;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}


*/

button.Fill {
    margin-bottom: 25px;
}

code {
  white-space: pre;
}
::-webkit-input-placeholder {
  color: lightgray;
}
::-moz-placeholder {
  color: lightgray;
}
:-ms-input-placeholder {
  color: lightgray;
}
:-moz-placeholder {
  color: lightgray;
}
/*
.my-form {
  box-sizing: border-box;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
  background-color: white;
  border-radius: .25em;
  padding: 2em;
  margin: auto;
  min-width: 100px;
}
*/

.formulate-element {
  font-size: 1em;
  margin-bottom: 1em;
}

.formulate-element:last-child {
  margin-bottom: 0;
}

.formulate-errors {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.formulate-errors li {
  margin: .25em 0;
  font-size: 14px;
  color: red;
  font-style: italic;
}
/*
div[class="formulate-element-input-wrapper"] button {
  box-sizing: inherit;
  border: inherit;
  border-radius: inherit;
  background-color: inherit;
  color: inherit;
  font-size: inherit;
  padding: .75em;
  text-transform: inherit;
  text-align: inherit;
  width: inherit;
  min-width: inherit;
}
*/

/*

label {
  display: block;
  font-weight: normal;
  font-weight: bold;
  margin-bottom: .5em;
}

input[type="text"],
input[type="password"],
input[type="email"] {
  border: 1px solid gainsboro;
  box-sizing: border-box;
  font-size: 1em;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: transparent;
  padding: .5em;
  width: 100%;
}
input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
  outline: 0;
  border-color: #41b883;
}
*/

/*
button {
  box-sizing: border-box;
  border: 1px solid #41b883;
  border-radius: 2em;
  background-color: #41b883;
  color: white;
  font-size: 1em;
  padding: .75em;
  text-transform: uppercase;
  text-align: center;
  min-width: 30%;
}

button:focus {
  outline: 0;
  border-color: #35495e;
}
*/
</style>
