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

  import { moduleTitle } from '@/components/Admin/Person';

  import utils from './utils';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  const moduleName = 'person';
  const operationName = 'Create';

  const { computeTypesId } = utils;

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
        return computeTypesId(this.enums.DocTypeLookup);
      },
    },
    methods: {
      ...mapActions(moduleName, {
        create: 'create',
      }),
      saveForm(form) {
        const pyld = form;
        window.lgr.debug(`${moduleTitle}.${operationName} --> methods
        ${JSON.stringify(pyld, null, 2)}`);

        let dstrbdr = null;
        dstrbdr = pyld.distribuidor || 'no';
        if (dstrbdr) {
          pyld.distribuidor = 'si';
          pyld.role = 'Distribuidor';
        } else {
          pyld.distribuidor = 'no';
          pyld.role = 'Cliente';
        }

        LG({ data: { pyld } });
        this.create({ data: { pyld } });
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
