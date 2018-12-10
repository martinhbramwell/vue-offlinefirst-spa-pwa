<template>
  <div>
    <b-modal :active.sync="isConflictModalActive" has-modal-card>
      <conflict v-bind="formProps" v-on:close="onCloseConflictDialog"></conflict>
    </b-modal>

    <formulate
      :name="formUid"
      class="my-form"
      v-if="!values"
      @submit="submit"

      :initial="p(id)"
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
                <label class="label">Telefono 1ra</label>

                <formulate-element
                  name="telefono_1"
                  type="tel"
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
                  validation="email"
                />

              </div>
            </div>

            <div class="column">
              <div class="control" v-show=false>
                <label class="label">Version</label>

                <formulate-element
                  name="version"
                  type="text"
                  placeholder="-- version --"
                  element-classes="emailTextbox"
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
    {{ p(id).version }}
    </formulate>
    <code
      v-else
      class="my-form my-form--code"
      v-text="values"
    />
  </div>
</template>

<script>

  import { cloneDeep } from 'lodash';

  import { mapGetters, mapActions, mapState } from 'vuex'; // eslint-disable-line no-unused-vars
  import Conflict from './Conflict';
  import { generateRequestId } from '@/database';


  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    props: ['id'],
    data() {
      return {
        isConflictModalActive: false,
        formProps: {},
        formUID: 0,
        values: false,
      };
    },
    components: {
      conflict: Conflict, // eslint-disable-line no-undef
    },
    mounted() {
      this.rememberOriginalRecord(cloneDeep(this.p(this.id)));
    },
    computed: {
      ...mapGetters('person', {
        enums: 'getEnums',
        p: 'getPerson',
        o: 'getOriginalRecord',
        columns: 'getColumns',
        // pers: 'getPersonsMap',
      }),
      ...mapState('person', {
        isUpdating: 'isUpdating',
      }),
      formUid() {
        this.formUID = `pers_${this.p(this.id).codigo}`;
        return this.formUID;
      },
      typesId() {
        const ret = [];
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
        update: 'update',
        rememberOriginalRecord: 'rememberOriginalRecord',
      }),
      onCloseConflictDialog(resolvedValues) {
        this.isConflictModalActive = false;
        // LG(`
        //   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);
        // LG(resolvedValues);
        // LG(this.$store.state.values);
        const formCopy = Object.assign(
          {},
          this.$store.state.values[this.formUID],
          resolvedValues,
        );
        // LG(formCopy);
        this.$store.state.values[this.formUID] = formCopy;
        this.rememberOriginalRecord(cloneDeep(this.p(this.id)));
      },
      submit(form) {
        const liveRecord = this.p(this.id);
        const originalRecord = this.o;
        const currentRecord = form;
        //         window.lgr.warn(`Person.Update --> methods.submit
        // live version:
        // ${JSON.stringify(liveRecord, null, 2)}

        // original:
        // ${JSON.stringify(originalRecord, null, 2)}

        // form:
        // ${JSON.stringify(currentRecord, null, 2)}


        //         `);

        const titles = {};
        this.columns.forEach((col) => {
          titles[col.field] = col.meta;
        });
        //         window.lgr.warn(`Person.Update --> methods.submit
        // fields:
        // ${JSON.stringify(titles, null, 2)}
        //         `);
        const affectedKeys = Object.keys(currentRecord)
          .filter((k) => {
            if (k === 'version') return false;
            if (!liveRecord[k]) return false;
            return liveRecord[k] !== originalRecord[k];
          });
        LG('affectedKeys');
        LG(affectedKeys);
        const discrepancies = affectedKeys.map(k => ({
          key: k,
          name: titles[k],
          v: {
            // o: originalRecord[k],
            l: currentRecord[k],
            r: liveRecord[k],
          },
        }));

        LG(discrepancies);
        if (discrepancies.length > 0) {
          this.formProps = {
            pyld: discrepancies,
            record: this.p(this.id).nombre,
          };
          this.isConflictModalActive = true;
        } else {
          // LG('-------   Updating  ------');
          // LG(this.$pouch);
          // LG(currentRecord);
          const type = 'PersonUpdate';
          const changedData = {
            version: currentRecord.version,
            type,
            status: 'new',
            id: this.id,
            _id: this.$pouch.rel.makeDocID({ type: 'aPerson', id: this.id }),
          };
          let tmp = {};
          Object.keys(titles).forEach((k) => {
            tmp = currentRecord[k] ? currentRecord[k] : originalRecord[k];
            if (k === 'distribuidor') {
              tmp = (tmp || 'no');
              tmp = tmp === 'no' ? 'no' : 'si';
            }
            if (tmp) {
              changedData[k] = tmp;
              const flag = changedData[k] === originalRecord[k] ? '  ' : '##';
              const vals = `${changedData[k]} | ${currentRecord[k]} | ${originalRecord[k]}`;
              LG(`Field : ${flag} ${k} :: ${vals} `);
            }
          });

          window.lgr.warn(`
            new ID : ${type}_${generateRequestId(this.id)}
            `);

          const pId = `${type}_${generateRequestId(this.id)}`;
          const personUpdate = {
            _id: pId,
            data: changedData,
          };
          LG(personUpdate);

          this.$pouch.get(pId)
            .then((prevUpd) => {
              window.lgr.debug('---------- Got the record --------');
              personUpdate._rev = prevUpd._rev; // eslint-disable-line no-underscore-dangle
            }).catch(() => {
              window.lgr.debug('---------- Did not get the record --------');
            }).then(() => {
              window.lgr.debug('---------- Do the other thing --------');
              this.$pouch.put(personUpdate)
                .then(() => {
                  window.lgr.debug(`Saved Person Update -- ${personUpdate}`);
                });
            });

          this.$emit('closePersonUpdate');
        }
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
