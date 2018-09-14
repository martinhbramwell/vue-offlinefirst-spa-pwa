<template>
  <div>
    <b-loading :is-full-page="false" :active.sync="isCreating" :canCancel="true"></b-loading>
    <formulate
      class="my-form"
      @submit="commitForm"
      name="createInvoice"
    >
      <formulate-element
        name="summation"
        type="hidden"
        placeholder="-1"
      />

      <formulate-element
        name="items"
        type="hidden"
        placeholder="-1"
      />

        <article class="tile is-child box">
          <h3 class="title">Invoice</h3>

          <div class="columns">
            <div class="column is-centered">

              <div class="control">
                <label class="label">Cliente</label>
                <formulate-element
                  name="Persona"
                  validation="required"
                >
                  <autocomplete-input
                    v-model="Persona"
                    :options="personsId || null"
                  />
                </formulate-element>
              </div>

            </div>

            <div class="column is-centered">
              <div class="control">
                <label class="label">Fecha</label>
                <formulate-element
                  name="InvoiceDate"
                  validation="required"
                >
                  <dateselect-input
                    v-model="InvoiceDate"
                  />
                </formulate-element>
              </div>
            </div>

            <div class="column is-centered">
              <div class="control">
                <label class="label">Descuento</label>
                <formulate-element
                  name="desc"
                  placeholder=0
                  element-classes="resizedTextbox"
                  validation="isPct(desc)"
                />
              </div>
            </div>

          </div>

          <div class="columns is-mobile">
            <div class="column">

              <label class="label">Itemes</label>
              <button class="button is-info"
                @click="openModal">
                  <b-icon icon="plus"></b-icon>
                  <span>Anadir item</span>
              </button>

              <button class="button field is-danger" @click="dropRow"
                  :disabled="!checkedRows.length">
                  <b-icon icon="trash"></b-icon>
                  <span>Borrar seleccionadas</span>
              </button>

              <b-modal :active.sync="isComponentModalActive" has-modal-card>
                <!-- <detailsForm v-bind="formProps"></detailsForm> -->
                <detailsForm></detailsForm>
              </b-modal>

              <b-table
                :data="tableData"
                :checked-rows.sync="checkedRows"
                checkable>

                <template slot-scope="props">
                  <b-table-column label="Codigo" numeric>
                    {{ props.row.codigo }}
                  </b-table-column>

                  <b-table-column label="Producto/Servicio">
                    {{ props.row.nombre }}
                  </b-table-column>

                  <b-table-column label="Unidad">
                    {{ props.row.unidad }}
                  </b-table-column>

                  <b-table-column label="Valor" numeric>
                    {{ props.row.valor }}
                  </b-table-column>

                  <b-table-column label="IVA" numeric>
                    {{ props.row.iva.str }}
                  </b-table-column>

                  <b-table-column label="Cantidad" centered>
                    {{ props.row.cantidad }}
                  </b-table-column>

                  <b-table-column label="Total" numeric>
                    {{ props.row.total }}
                  </b-table-column>

                </template>

                <template slot="footer">

                  <div class="columns">
                    <div class="column is-offset-2 is-narrow-mobile">
                      <div class="box" style="width: 125px;">
                        <div v-if="retention" v-bind:class="[retention === 'si' ? '' : 'strike-out']">
                          Retencion
                        </div>
                        <div v-if="distributor" v-bind:class="[distributor === 'si' ? '' : 'strike-out']">
                          Distribuidor
                        </div>
                      </div>
                    </div>
                    <div class="column is-5">
                      <div class="box">
                        <b-table :data="totals">
                          <template slot-scope="props">
                            <b-table-column width="180">
                                {{ props.row.label }}
                            </b-table-column>

                            <b-table-column numeric>
                              {{ props.row.value }}
                            </b-table-column>
                          </template>
                        </b-table>
                      </div>
                    </div>
                    <div class="column is-1"></div>
                  </div>

<!--              <th colspan="4">
                    <div class="th-wrap is-numeric">  </div>
                  </th>
                  <th>
                    <nav class="level">
                      <div class="level-left">
                        <div class="level-item has-text-centered">
                          <div v-if="retention" v-bind:class="[distributor === 'si' ? '' : 'strike-out']">
                            Retencion
                          </div>
                        </div>
                      </div>
                    </nav>
                    <nav class="level">
                      <div class="level-left">
                        <div class="level-item has-text-centered">
                          <div v-if="distributor" v-bind:class="[distributor === 'si' ? '' : 'strike-out']">
                            Distribuidor
                          </div>
                        </div>
                      </div>
                    </nav>
                  </th>
                  <th colspan="2">
                    <div class="is-numeric">
                      <b-table :data="totals">
                        <template slot-scope="props">
                          <b-table-column width="180">
                              {{ props.row.label }}
                          </b-table-column>

                          <b-table-column numeric>
                            {{ props.row.value }}
                          </b-table-column>
                        </template>
                      </b-table>
                    </div>
                  </th>
 -->
                </template>

              </b-table>


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

  </div>
</template>

<script>

  import { mapGetters, mapActions, mapState } from 'vuex'; // eslint-disable-line no-unused-vars
  import { mapModels } from 'vue-formulate'; // eslint-disable-line no-unused-vars

  import Awesomplete from 'awesomplete'; // eslint-disable-line no-unused-vars
  import AutoComplete from '@/components/MultiUse/AutoComplete';
  import DateSelect from '@/components/MultiUse/DateSelect';

  import format from '@/utils/format';

  import Details from './Details';

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  // const SUBTOTALIVA0 = 0;
  // const SUBTOTALIVA12 = SUBTOTALIVA0 + 1;
  // const SUBTOTAL = SUBTOTALIVA12 + 1;
  // const DESCUENTO = SUBTOTAL + 1;
  // const TOTAL = DESCUENTO + 1;

  export default {
    props: ['pers'],
    components: {
      detailsForm: Details,
      'autocomplete-input': AutoComplete,
      'dateselect-input': DateSelect,
    },
    created() {
      if (
        (this.persons && this.persons.length > 0) &&
        (this.productsMap && Object.keys(this.productsMap).length > 0) &&
        (this.products && this.products.length > 0)
      ) {
        // LG('@@@@@@@@@@@@@@@@@@@@@@ CREATED @@@@@@@@@@@@@@@@@@@@@@');
        // LG(this.products[5]);
        return;
      }
      this.$router.push({ name: 'home' });
    },
    data() {
      const totals = [];
      return {
        totals,
        isComponentModalActive: false,
        checkedRows: [],
        retention: null,
        distributor: null,
        myDate: new Date(),
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

    computed: {
      ...mapGetters('invoice', {
        enums: 'getEnums',
      }),
      ...mapGetters('product', {
        products: 'list',
        productsMap: 'getProductsMap',
      }),
      ...mapGetters('person', {
        persons: 'list',
        getPerson: 'getPerson',
      }),
      ...mapState('invoice', {
        isCreating: 'isCreating',
        formRows: 'formRows',
      }),
      ...mapModels({
        Persona: 'createInvoice/Persona',
        InvoiceDate: 'createInvoice/InvoiceDate',
      }),
      tableData() {
        const rows = [];
        const { state } = this.$store;
        if (state.values.createInvoice) {
          const accum = state.values.createInvoice;
          accum.Persona = accum.Persona || '(0) no one';
          accum.InvoiceDate = accum.InvoiceDate || new Date();
          const dummy = [{
            codigo: 'codigo',
            nombre: 'nombre',
            unidad: 'unidad',
            iva: 'iva',
            valor: '$0.00',
            cantidad: 0,
            total: '$0.00',
          }];
          LG(`


            tableData() ----------------------------`);
          LG(this.productsMap);

          const personCode = accum.Persona.match(/\(([^)]+)\)/)[1]; // '(123) some one' => 123
          const personRecord = this.getPerson(personCode);

          this.retention = (personRecord && personRecord.retencion) || null;
          this.distributor = (personRecord && personRecord.distribuidor) || null;

          this.totals = [];

          let strPrice = 0;
          let price = 0;
          let pctDistributorDiscount = 0;

          const summation = {
            distributor: this.distributor,
            person: personCode,
            discountPct: 0,
            iva0: 0,
            iva12: 0,
            subtotal: 0,
            discount: 0,
            retention: 0,
            total: 0,
          };

          if (this.products.length < 1) return dummy;
          if (this.formRows.row.length < 1) return dummy;
          if (this.formRows.row[0].code < 0) return dummy;


          this.formRows.row.forEach((row) => {
            LG('row');
            LG(row);
            const prd = this.productsMap[row.code];
            LG(prd.porcentaje.raw);
            if (this.distributor && this.distributor === 'si') {
              strPrice = prd.valor_distribuidor.str;
              price = prd.valor_distribuidor.raw;
              pctDistributorDiscount = format.percent(prd.valor_distribuidor.raw / prd.valor.raw);
            } else {
              strPrice = prd.valor.str;
              price = prd.valor.raw;
              pctDistributorDiscount = format.percent(1);
            }
            const rowval = price * row.qty;
            LG(prd.iva);
            const i0 = (prd.iva.raw === 0) ? rowval : 0;
            const i12 = (prd.iva.raw > 0) ? rowval : 0;

            summation.iva0 += i0;
            summation.iva12 += i12;
            summation.subtotal += i0 + i12;

            rows.push({
              codigo: row.code,
              nombre: prd.nombre,
              unidad: prd.unidad,
              discount: pctDistributorDiscount,
              iva: prd.iva,
              valor: strPrice,
              cantidad: row.qty,
              total: format.usd(price * row.qty).str,
            });
          });
          LG('rows');
          LG(rows);
          summation.discountPct = (accum && accum.desc) || 0;
          summation.discount = (summation.discountPct / 100) * summation.subtotal;
          summation.valor = summation.subtotal - summation.discount;
          summation.iva = summation.valor * 0.12;
          summation.total = summation.valor + summation.iva;
          summation.final = summation.total;

          if (summation.iva0 > 0) {
            this.totals.push({ label: 'Subtotal IVA  0%', value: format.usd(summation.iva0).str });
          }
          this.totals.push({ label: 'Subtotal IVA 12%', value: format.usd(summation.iva12).str });
          this.totals.push({ label: 'Descuento Especial', value: format.usd(summation.discount).str });
          this.totals.push({ label: 'Valor', value: format.usd(summation.valor).str });
          this.totals.push({ label: 'IVA', value: format.usd(summation.iva).str });
          this.totals.push({ label: 'Valor Total', value: format.usd(summation.total).str });
          summation.final = summation.total;

          if (this.retention === 'si') {
            summation.retention = summation.total * 0.01;
            summation.final = summation.total - summation.retention;
            this.totals.push({ label: 'Retenido', value: format.usd(summation.retention).str });
          }
          this.totals.push({ label: 'Total Final', value: format.usd(summation.final).str });

          LG(`summation.iva0 ${summation.iva0}`);
          LG(`summation.iva12 ${summation.iva12}`);
          LG(`summation.discountPct ${summation.discountPct}`);
          LG(`summation.discount ${summation.discount}`);
          LG(`summation.valor ${summation.valor}`);
          LG(`summation.iva ${summation.iva}`);
          LG(`summation.total ${summation.total}`);
          LG(`summation.retention ${summation.retention}`);
          LG(`summation.final ${summation.final}`);

          accum.summation = summation;
          accum.items = rows;

          LG(accum);
          LG(this.$store);
          LG(rows);
        }

        return rows;
      },
      personsId() {
        LG('%%%%%%%%%%%%%%%% personsId %%%%%%%%%%%%%%%%%% ');
        LG(this);
        const ret = [];
        const prsns = this.persons;
        if (prsns) {
          LG('prsns');
          Object.keys(prsns).forEach((value) => {
            const person = prsns[value];
            ret.push({
              // name: person.nombre,
              value: person.codigo,
              // id: person.codigo,
              label: `${person.nombre}`,
            });
          });
        }
        LG(ret);
        return {
          list: ret,
          data(text) {
            return `(${text.value}) ${text.label}`;
          },
        };
      },
    },
    methods: {
      ...mapActions('invoice', {
        saveForm: 'saveForm',
      }),
      openModal: function (event) { // eslint-disable-line func-names, object-shorthand
        event.preventDefault();
        this.isComponentModalActive = true;
      },
      // newDate() {
      //   LG('!!!!!!!!!!!!!!!! newDate !!!!!!!!!!!!!!!!!!!!!!!!!!');
      //   LG(this);
      // },
      dropRow: function (event) { // eslint-disable-line func-names, object-shorthand
        this.checkedRows.forEach((chkd) => {
          this.formRows.row.forEach((row, ix) => {
            if (row.code === chkd.codigo && row.code === chkd.codigo) {
              this.formRows.row.splice(ix, 1);
            }
          });
        });

        LG(this.checkedRows);
        event.preventDefault();
      },
      commitForm(_form) {
        // LG('Commit form');
        // LG(this);
        // LG(_form);
        // LG(this.$store.state.values.createInvoice);
        // LG(this.$store.state.values.createInvoice.InvoiceDate);
        // LG(this.$store.state.values.createInvoice.Persona);
        this.saveForm(_form);
      },
      setItem(item) {
        LG(`Item ${item.qty} of ${item.code}`);
      },
    },
  };

</script>

<style scoped>
  .resizedTextbox { width: 40px; padding: 1px; text-align: right; }
  div.text-right { margin-left:auto; margin-right:0; }
  div.push-down {
      padding-top: 50px;
  }
  div.push-right {
      padding-left: 25px;
  }
  div.strike-out {
    background-color: transparent;
    background-image: -webkit-gradient(linear, 19.1% -7.9%, 81% 107.9%, color-stop(0, #fff), color-stop(.48, #fff), color-stop(.5, #000), color-stop(.52, #fff), color-stop(1, #fff));
    background-image: -webkit-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: repeating-linear-gradient(163deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: -ms-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
  }
</style>
