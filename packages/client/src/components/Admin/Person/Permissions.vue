<template>
  <div>
    <formulate
      :name="formUid"
      class="my-form"
      v-if="!values"
      @submit="saveForm"

      :initial="permissionsField"
    >
      <formulate-element
        name="codigo"
        type="hidden"
        placeholder="-1"
      />
        <article class="tile is-child box">
          <h3>{{ pers.nombre }}</h3>
          <h5>Sus Permisos por Recurso</h5>
          <div class="columns is-mobile is-multiline is-centered">


            <div class="column" v-for="resource in resources">
              <div class="control">
                <label class="label">{{ resource }}</label>

                <formulate-element
                  class="select is-small is-focused"
                  :name="resource"
                  type="select"
                  initial="0"
                  :options="levels"
                />

              </div>
            </div>

            <div class="control">

              <formulate-element
                type="submit"
                name="Save"
                elementClasses="button is-info"
              />

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

import { mapGetters, mapActions } from 'vuex'; // eslint-disable-line no-unused-vars
import { Resources, Levels as accessLevels } from '@/accessControl';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

export default {
  props: ['pers'],
  data() {
    return { values: false };
  },
  computed: {
    ...mapGetters('person', {
      enums: 'getEnums',
    }),
    permissionsField() {
      LG('xxxxxxxxxxxxxxxxxxx this.pers xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      LG(this.pers);
      LG(this.pers.permissions);
      return this.pers.permissions ? this.pers.permissions : {};
    },
    formUid() {
      return `pers_${this.pers.codigo}`;
    },
    levels() {
      return accessLevels.options;
    },
    resources() {
      LG('Resources');
      LG(Resources);
      return Resources;
    },
  },
  methods: {
    ...mapActions('person', {
      saveForm: 'saveForm',
    }),
    // onSubmit(_formFields) {
    //   const formFields = _formFields;
    //   LG('--------------------------------------------------------------');
    //   LG(formFields);

    //   formFields.permissions = {};
    //   Resources.map((rsrc) => {
    //     LG(`${rsrc} => ${formFields[rsrc]}`);
    //     formFields.permissions[rsrc] = formFields[rsrc];
    //     delete formFields[rsrc];
    //     return formFields.permissions[rsrc];
    //   });

    //   // Object.keys(formFields).forEach((fld) => {
    //   //   const name = formFields[fld];
    //   //   LG(`${fld} => ${name}`);
    //   // });
    //   LG(formFields);
    //   this.saveForm(formFields);
    // },
  },
};
</script>

<style>
</style>
