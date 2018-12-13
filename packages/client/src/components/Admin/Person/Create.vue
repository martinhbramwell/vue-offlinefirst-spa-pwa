<template>
  <div>
    <b-loading :is-full-page="false" :active.sync="isCreating" :canCancel="true"></b-loading>
    <formulate
      class="my-form"
      @submit="saveForm"
      name="createPerson"
    >
      <formulate-element
        name="codigo"
        type="hidden"
        placeholder="-1"
      />

        <article class="tile is-child box">
          <h3 class="title">Person</h3>

          <div class="columns is-mobile is-multiline is-centered">

            <div class="column is-narrow">
              <div class="control">
                <label class="label">Nombre</label>

                <formulate-element
                  name="nombre"
                  type="text"
                  initial="Carmen Miranda"
                  placeholder="Nombre y Appellidos"
                  element-classes="nameTextbox"
                />
              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Telefono 1ro</label>

                <formulate-element
                  name="telefono_1"
                  type="tel"
                  initial="02-222-2222"
                  placeholder="# de telefono"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Telefono 2do</label>

                <formulate-element
                  name="telefono_2"
                  type="tel"
                  initial="03-333-3333"
                  placeholder="# de telefono alterno"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Mobile</label>

                <formulate-element
                  name="mobile"
                  type="tel"
                  placeholder="# de telefono mobile"
                  initial="099-999-9999"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Tipo de Identificación</label>

                <formulate-element
                  class="select is-small is-focused"
                  name="tipo_de_documento"
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
                  initial="1711711717"
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
                  initial="#1 1st St., Here, There, Everywhere"
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
                  validation="email"
                  initial="a@b.cd"
                />

              </div>
            </div>















            <div class="control">

              <formulate-element
                type="submit"
                name="Grabar"
                elementClasses="button is-info"
              />

            </div>
          </div>
        </article>

    </formulate>





  </div>
</template>

<script>

/* eslint-disable no-unused-vars */
import { mapGetters, mapActions, mapState } from 'vuex';

import { RequestMsgIdentifier } from '@/database';
/* eslint-enable no-unused-vars */

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

const moduleTitle = 'Person';
const moduleName = 'person';
const operationName = 'Create';
// const categoryName = 'aPerson';
// const categoryMetaData = `${categoryName}_2_MetaData`;

export default {
  props: ['pers'],
  data() {
    return {
      values: false,
    };
  },
  computed: {
    ...mapGetters(moduleName, {
      enums: 'getEnums',
    }),
    ...mapState(moduleName, {
      isCreating: 'isCreating',
    }),
    typesId() {
      LG('CC %%%%%%%%%%%%%%%%%%');
      // LG(this);
      const ret = [];
      const types = this.enums.DocTypeLookup;
      if (types) {
        Object.keys(types).forEach((value) => {
          const name = types[value];
          ret.push({
            name,
            value,
            id: value,
            label: name,
          });
        });
      } else {
        ret.push({
          name: 'aa',
          value: 'AA',
          id: 'AA-',
          label: 'aa-',
        });
      }
      LG(ret);
      return ret;
    },
  },
  methods: {
    ...mapActions(moduleName, {
      create: 'create',
      holdRecord: 'rememberOriginalRecord',
    }),
    saveForm(form) {
      window.lgr.debug(`${moduleTitle}.${operationName} --> methods
      ${JSON.stringify(form, null, 2)}`);

      this.holdRecord(form);
      this.create();
    },
  },
};
</script>

<style scoped>
  .nombreTextbox { width: 20px; padding: 1px; text-align: left; }
  .emailTextbox { width: 240px; padding: 1px; text-align: left; }
  .identTextbox { width: 200px; padding: 1px; text-align: left; }
  .addrTextbox { width: 200px; padding: 1px; text-align: left; }
</style>
