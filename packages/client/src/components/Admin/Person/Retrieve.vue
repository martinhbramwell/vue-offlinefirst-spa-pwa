<template>
  <div>
    <nav class="level">
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">{{ this.enums.DocTypeLookup[p(id).tipo_de_documento] }}</p>
          <p class="is-size-5">{{ p(id).ruc_cedula }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Nombre</p>
          <p class="is-size-5">{{ p(id).nombre }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Telefono</p>
          <p class="is-size-5">{{ p(id).telefono_1 }}</p>
        </div>
      </div>
    </nav>
    <nav class="level">
      <div class="level-item has-text-centered">
        <div>
        <p class="heading">Direccion</p>
        <p class="is-size-5">{{ p(id).direccion }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
        <p class="heading">Mail</p>
        <p class="is-size-5">{{ p(id).email }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
        <p class="heading">Rol</p>
        <p class="is-size-5">{{ p(id).role }}</p>
        </div>
      </div>
    </nav>
    {{ p(id).version }}
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console,

  export default {
    props: ['id'],

    computed: {
      ...mapGetters('person', {
        enums: 'getEnums',
        p: 'getPerson',
        pmap: 'getPersonsMap',
      }),
    },
  };
</script>

<style scoped>
  div.strike-out {
    background-color: transparent;
    background-image: -webkit-gradient(linear, 19.1% -7.9%, 81% 107.9%, color-stop(0, #fff), color-stop(.48, #fff), color-stop(.5, #000), color-stop(.52, #fff), color-stop(1, #fff));
    background-image: -webkit-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: repeating-linear-gradient(163deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: -ms-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
  }
</style>
