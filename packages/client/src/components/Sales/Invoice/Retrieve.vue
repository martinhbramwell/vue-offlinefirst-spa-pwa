<template>
<!--
  <main id="invoice">
    <p class="back">
      <router-link :to="{ name: 'invoices' }">Back to Invoices</router-link>
    </p>
    <invoice-record v-if="currentInvoice" :invoice="currentInvoice" />
  </main>
-->

  <div>
    <nav class="level">
      <div class="level-left">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Codigo</p>
            <p class="is-size-5">{{ invc.codigo }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Fecha</p>
            <p class="is-size-5">{{ invc.fecha }}</p>
          </div>
        </div>
      </div>

      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Cliente</p>
          <p class="is-size-5">{{ invc.codigo_cliente }}</p>
          <p v-bind:class="[invc.distribuidor === 'si' ? 'has-text-info' : 'is-invisible']">
            Distribuidor
          </p>
        </div>
      </div>

      <div class="level-right">
        <div class="level-item has-text-centered">
          <div>
          <p class="heading">Mail</p>
          <p class="is-size-5">{{ invc.email }}</p>
          </div>
        </div>
      </div>
    </nav>
    <nav class="level">
      <div class="level-item has-text-centered">
        <b-table
          :data="detail"
          :narrowed="true">
          <template slot-scope="props">
              <b-table-column field="cant" label="Cantidad" width="10" numeric>
                  {{ props.row.cantidad }}
              </b-table-column>
              <b-table-column field="nombre" label="Nombre" width="400">
                  ({{ props.row.codigo }}) {{ props.row.nombre }}
              </b-table-column>
              <b-table-column field="nombre" label="Unidades">
                  {{ props.row.unidad }}
              </b-table-column>
              <b-table-column field="precio" label="Precio" width="100">
                  {{ props.row.precio }}
              </b-table-column>
              <b-table-column field="descuento" label="Descuento Especial" width="10">
                  {{ props.row.descuento }}
              </b-table-column>
              <b-table-column field="total" label="Total" width="100">
                  {{ props.row.total }}
              </b-table-column>
          </template>
        </b-table>
      </div>
    </nav>
    <nav class="level">
        <div class="level-left has-text-centered">
          <div>
            <p class="heading">Estado</p>
            <p class="is-size-5">{{ enums[invc.estado] }}</p>
          </div>
        </div>
      <div class="level-item has-text-centered">
        <b-table
          :data="totals || []"
          :bordered=true
          :narrowed=true
          :mobile-cards=true>

          <template slot-scope="props">
              <b-table-column field="title">
                  {{ props.row.title }}
              </b-table-column>
              <b-table-column field="value" numeric>
                  {{ props.row.value }}
              </b-table-column>
          </template>
        </b-table>
      </div>

    </nav>
  </div>
</template>

<script>

  import { mapState, mapActions, mapGetters } from 'vuex'; // eslint-disable-line no-unused-vars
  import format from '@/utils/format';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    data() {
      const totals = [];

      return {
        totals,
      };
    },

    computed: {
      ...mapGetters('invoice', {
        enums: 'getEnums',
      }),
      detail() {
        LG(`  *************** INVC **********************
        `);
        const inv = this.invc;
        const items = inv.lista_de_items;
        const distributor = inv.distribuidor === 'si';
        LG(this);
        const rslt = [];
        LG('items object');
        LG(items);
        for (let ii = 0; ii < items.length; ii += 1) {
          const item = items[ii];
          const price = distributor ? item[0].valor_distribuidor : item[0].valor;
          const qty = item[1];
          const discount = format.percent(item[2], 0);
          LG(`At ${ii} -- ${item[0].unidad} (${item[0].codigo}) ${item[0].nombre}`);
          rslt.push({
            codigo: item[0].codigo,
            nombre: item[0].nombre,
            unidad: item[0].unidad,
            cantidad: qty,
            precio: price.str,
            descuento: format.percent(1 - discount.raw, 0).str,
            total: format.usd((price.raw * qty) - discount.raw).str,
          });
        }

        this.totals = [];
        this.totals.push({ title: 'Subtotal IVA 12%', value: inv.subtotal_iva_12.str });
        this.totals.push({ title: 'Descuento Especial', value: inv.descuento_especial.str });
        this.totals.push({ title: 'Valor', value: inv.subtotal_descontado.str });
        this.totals.push({
          title: 'IVA',
          value: format.usd(inv.total_calculado.raw - inv.subtotal_descontado.raw).str,
        });
        this.totals.push({ title: 'Valor Total', value: inv.total_calculado.str });
        this.totals.push({ title: 'Retenido', value: inv.retenido.str });
        this.totals.push({ title: 'Total Final', value: inv.monto_final.str });

        return rslt;
      },
    },

    props: {
      invc: {
        type: Object,
        required: true,
        default: () => ({
          codigo: 9999,
          ruc_cedula: '34-4545',
          nombre: 'asdf asdf asdf asdf',
          telefono: '23452345',
          direccion: 'asdfasdf',
          distribuidor: 'si',
          retencion: 'no',
          tipo_de_documento: 'RUC',
        }),
      },
    },

  };
</script>

<style scoped>
  div.price--line-through {
    background-color: transparent;
    background-image: -webkit-gradient(linear, 19.1% -7.9%, 81% 107.9%, color-stop(0, #fff), color-stop(.48, #fff), color-stop(.5, #000), color-stop(.52, #fff), color-stop(1, #fff));
    background-image: -webkit-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: repeating-linear-gradient(163deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: -ms-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
  }
</style>
