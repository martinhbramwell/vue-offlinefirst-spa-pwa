<template>
  <div>
    <!-- <b-loading :is-full-page="false" :active.sync="isUpdating" :canCancel="true"></b-loading> -->
    <formulate
      :name="formUid"
      class="my-form"
      v-if="!values"
      @submit="saveForm"

      :initial="pers"
    >
      <formulate-element
        name="codigo"
        type="hidden"
        placeholder="-1"
      />
        <article class="tile is-child box">
          <h3 class="title">Person</h3>

          <div class="columns is-mobile is-multiline is-centered">




            <div class="column">
              <div class="control">
                <label class="label">Nombre</label>

                <formulate-element
                  name="nombre"
                  type="text"
                  placeholder="Nombre y Appellidos"
                  element-classes="nameTextbox"
                />
              </div>
            </div>



            <div class="column">
              <div class="control">
                <label class="label">Telefono</label>

                <formulate-element
                  name="telefono_1"
                  type="tel"
                  placeholder="# de telefono"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Tipo de Identificación</label>

                <formulate-element
                  class="select is-small is-focused"
                  name="tipo"
                  type="select"
                  initial="_07"
                  :options="typesId"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Identificación</label>

                <formulate-element
                  name="ruc_cedula"
                  type="text"
                  placeholder="Codigo de identificación"
                  element-classes="identTextbox"
                />

              </div>
            </div>


            <div class="column">
              <div class="control">
                <label class="label">Dirección</label>

                <formulate-element
                  name="direccion"
                  type="text"
                  placeholder="Dirección"
                  element-classes="addrTextbox"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">

                <label class="label">Distribuidor?</label>
                <formulate-element
                  type="checkbox"
                  label="  "
                  name="distribuidor"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Correos Electronicos</label>

                <formulate-element
                  name="email"
                  type="text"
                  placeholder="Correos Electronicos"
                  element-classes="emailTextbox"
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

import { mapGetters, mapActions, mapState } from 'vuex'; // eslint-disable-line no-unused-vars

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
    ...mapState('person', {
      isUpdating: 'isUpdating',
    }),
    formUid() {
      return `pers_${this.pers.codigo}`;
    },
    typesId() {
      const ret = [];
      // LG('UU %%%%%%%%%%%%%%%%%%');
      // LG(this);
      const types = this.enums.DocTypeLookup || {};
      Object.keys(types).forEach((value) => {
        const name = types[value];
        ret.push({
          name,
          value,
          id: value,
          label: name,
        });
      });
      // LG(ret);
      return ret;
    },
  },
  methods: {
    ...mapActions('person', {
      saveForm: 'saveForm',
    }),
  },
};
</script>

<style scoped>
  .nombreTextbox { width: 20px; padding: 1px; text-align: left; }
  .emailTextbox { width: 240px; padding: 1px; text-align: left; }
  .identTextbox { width: 200px; padding: 1px; text-align: left; }
  .addrTextbox { width: 200px; padding: 1px; text-align: left; }
</style>
