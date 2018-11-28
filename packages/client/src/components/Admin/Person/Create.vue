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
                  initial="Joe Bloggs"
                  placeholder="Nombre y Appellidos"
                  element-classes="nameTextbox"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Tipo de Identificación</label>

                <formulate-element
                  class="select is-small"
                  name="tipo"
                  type="select"
                  initial="_05"
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
                  initial="1713931416"
                  placeholder="Codigo de identificación"
                  element-classes="identTextbox"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Correos Electronicos</label>

                <formulate-element
                  name="email"
                  type="text"
                  initial="a@b.cd"
                  placeholder="Correos Electronicos"
                  element-classes="emailTextbox"
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
                <label class="label">Telefono</label>

                <formulate-element
                  name="telefono"
                  type="tel"
                  initial="4444719"
                  placeholder="# de telefono"
                />

              </div>
            </div>

            <div class="column">
              <div class="control">
                <label class="label">Dirección</label>

                <formulate-element
                  name="direccion"
                  initial="#1 1st St., Here, There, Everywhere"
                  type="text"
                  placeholder="Dirección"
                  element-classes="addrTextbox"
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
    // qtst() {
    //   LG(' ------- Quick Test -------');
    //   this.onCreatePerson();
    // },
    // onCreatePerson() {
    //   this.createPerson({
    //     data: {
    //       store: 'person',
    //       mode: 'post',
    //       data: {
    //         ruc_cedula: '0708217086001',
    //         nombre: 'Jesu Cristo',
    //         direccion: '#1 Pearly Gates',
    //         telefono: '099-444-4719',
    //         distribuidor: 'si',
    //         retencion: 'si',
    //         tipo: '_04',
    //         scabetti: '333',
    //         tipo_de_documento: 'RUC',
    //       },
    //     },
    //   });
    // },

    ...mapActions('person', {
      saveForm: 'saveForm',
    }),
  },
};
</script>

<style>
  .nameTextbox { width: 220px; padding: 1px; text-align: left; }
  .identTextbox { width: 110px; padding: 1px; text-align: left; }
  .emailTextbox { width: 300px; padding: 1px; text-align: left; }
  .addrTextbox { width: 500px; padding: 1px; text-align: left; }
</style>
