<template>
  <div class="modal-card" style="width: auto">
    <formulate
      class="my-form"
      @submit="saveForm"
      name="bottleDetails"
    >
      <header class="modal-card-head">
        <p class="title">Item</p>
      </header>
      <section class="modal-card-body">
        <div class="columns">

          <div class="column is-four-fifths">
            <div class="control">
              <label class="label">Producto / Servicio</label>
                <formulate-element
                  class="select is-small is-focused"
                  name="code"
                  type="select"
                  initial="nombre"
                  :options="typesId"
                />
            </div>
          </div>

          <div class="column is-one-fifth">
            <div class="control">
              <label class="label">Cantidad</label>

              <formulate-element
                name="qty"
                placeholder="cantidad"
                element-classes="resizedTextbox"
              />

            </div>
          </div>

        </div>
      </section>
      <footer class="modal-card-foot">
          <button class="button" type="button" @click="$parent.close()">Close</button>
          <formulate-element
            type="submit"
            name="Save"
            elementClasses="button is-info"
          />
      </footer>
    </formulate>
  </div>
</template>

<script>

  import {
    mapGetters, mapActions, mapState, dispatch, // eslint-disable-line no-unused-vars
  } from 'vuex';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    computed: {
      ...mapGetters('product', {
        products: 'list',
        productsMap: 'getProductsMap',
      }),
      typesId() {
        LG('%%%%%%%%%%%%%%%%%%%% CC %%%%%%%%%%%%%%%%%%');
        LG(this);
        LG(this.$store.getters);
        const ret = [];
        const prods = this.products;
        if (prods) {
          Object.keys(prods).forEach((value) => {
            const prod = prods[value];
            ret.push({
              name: prod.nombre,
              value: prod.codigo,
              id: prod.codigo,
              label: `${prod.nombre} (${prod.unidad})`,
            });
          });
        }
        LG(ret);
        return ret;
      },
    },
    methods: {
      ...mapActions('bottle', {
        saveRow: 'saveRow',
      }),
      saveForm(_form) {
        this.saveRow({ rowNum: -1, values: _form });
        this.$parent.close();
      },
    },
  };
</script>

<style>
 .resizedTextbox { width: 75px; height: 20px; padding: 1px }
</style>
