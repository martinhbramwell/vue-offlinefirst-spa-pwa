<template>
<!--
  <main id="person">
    <p class="back">
      <router-link :to="{ name: 'persons' }">Back to Persons</router-link>
    </p>
    <person-record v-if="currentPerson" :person="currentPerson" />
  </main>
-->

  <div>
    <nav class="level">
      <div class="level-item has-text-centered" v-for="col in columns">
        <div>
          <p class="heading">{{ col.meta }}</p>
          <p class="is-size-5">{{ prod(id)[col.field] }}</p>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>

  import { mapGetters } from 'vuex';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {

    props: ['id'],
    // props: {
    //   prod: {
    //     type: Object,
    //     required: true,
    //     default: () => ({
    //       codigo: 9999,
    //       ruc_cedula: '34-4545',
    //       nombre: 'asdf asdf asdf asdf',
    //       telefono: '23452345',
    //       direccion: 'asdfasdf',
    //       distribuidor: 'si',
    //       retencion: 'no',
    //       tipo_de_documento: 'RUC',
    //     }),
    //   },
    // },
    computed: {
      ...mapGetters('product', {
        prod: 'getProduct',
        columns: 'getColumns',
      }),
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
