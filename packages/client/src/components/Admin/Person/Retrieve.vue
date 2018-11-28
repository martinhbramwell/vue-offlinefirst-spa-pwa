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
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">{{ pers.tipo_de_documento }}</p>
          <p class="is-size-5">{{ pers.ruc_cedula }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Nombre</p>
          <p class="is-size-5">{{ pers.nombre }}</p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Telefono</p>
          <p class="is-size-5">{{ pers.telefono_1 }}</p>
        </div>
      </div>
    </nav>
    <nav class="level">
      <div class="level-right">
        <div class="level-item has-text-centered">
          <div>
          <p class="heading">Direccion</p>
          <p class="is-size-5">{{ pers.direccion }}</p>
          </div>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item has-text-centered">
          <div>
          <p class="heading">Mail</p>
          <p class="is-size-5">{{ pers.email }}</p>
          </div>
        </div>
      </div>
      <div class="level-left">
        <div class="level-item has-text-centered">
          <div v-bind:class="[pers.distribuidor === 'no' ? 'strike-out' : '']">
            {{ pers.distribuidor == 'hq' ? 'Sede Principal' : 'Distribuidor' }}
          </div>
        </div>
<!--
        <div class="level-item has-text-centered">
          <p class="is-size-5">{{ pers(id).distribuidor }}</p>
          <div v-bind:class="[pers(id).retencion === 'si' ? '' : 'strike-out']">
            Retencion
          </div>
        </div>
      </div>
 -->
<!--
      <div class="level-item has-text-centered" v-for="col in columns">
        <div>
          <p class="heading">{{ col.meta }}</p>
          <p class="is-size-5">{{ pers(id)[col.field] }}</p>
        </div>
 -->
      </div>
    </nav>
  </div>
</template>

<script>

  export default {

    props: {
      pers: {
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
  div.strike-out {
    background-color: transparent;
    background-image: -webkit-gradient(linear, 19.1% -7.9%, 81% 107.9%, color-stop(0, #fff), color-stop(.48, #fff), color-stop(.5, #000), color-stop(.52, #fff), color-stop(1, #fff));
    background-image: -webkit-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: repeating-linear-gradient(163deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
    background-image: -ms-repeating-linear-gradient(287deg, #fff 0%, #fff 48%, #000 50%, #fff 52%, #fff 100%);
  }
</style>
