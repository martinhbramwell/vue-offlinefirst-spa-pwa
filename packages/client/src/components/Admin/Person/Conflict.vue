<template>
  <form action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Conflicto de versions</p>
      </header>
      <section class="modal-card-body">
        <p>Los datos de "{{ record }}" fueron alterado por otro usuario. Ud. puede:</p>
        <ul>
          <li><icon name="caret-right" /> &nbsp; o escoger los valores corectos</li>
          <li><icon name="caret-right" /> &nbsp; o cancelar y volver a ingresar los cambios</li>
        </ul>
        <hr></hr>
        <div class="columns is-mobile">
          <div class="column">
            <p class="bd-notification is-size-7-mobile has-text-info"></p>
          </div>
<!--
          <div class="column">
            <p class="bd-notification is-size-7-mobile has-text-info">Original</p>
          </div>
 -->
          <div class="column">
            <p class="bd-notification is-size-7-mobile has-text-info">Local</p>
          </div>
          <div class="column">
            <p class="bd-notification is-size-7-mobile has-text-info">Remote</p>
          </div>
        </div>


        <div v-for="item in pyld">
          <div class="control">
            <div class="columns is-mobile">
              <div class="column">
                <p class="bd-notification is-size-7-mobile" :style="styleObject[item.key]">
                  {{ item.name }}
                </p>
              </div>
<!--
              <div class="column">
                <label class="radio">
                  <input type="radio"  :name="item.name" class="is-size-7-mobile"
                          @change="picked({ r: item.key, c: item.v.o })">
                    <span class="is-size-7-mobile"> {{ item.v.o }}</span>
                </label>
              </div>
 -->
              <div class="column">
                <label class="radio">
                  <input type="radio" :name="item.name" class="is-size-7-mobile"
                          @change="picked({ r: item.key, c: item.v.l })">
                    <span class="is-size-7-mobile"> {{ item.v.l }}</span>
                </label>
              </div>
              <div class="column">
                <label class="radio">
                  <input type="radio" :name="item.name" class="is-size-7-mobile"
                          @change="picked({ r: item.key, c: item.v.r })">
                    <span class="is-size-7-mobile"> {{ item.v.r }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>


      </section>
      <footer class="modal-card-foot">
        <button class="button is-primary" type="button" @click="submit()">
          Grabar
        </button>
      </footer>
    </div>
  </form>
</template>

<script>

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console

  // const doneColor = 'hsl(204, 86%, 53%)'; // eslint-disable-line no-unused-vars
  const doneColor = 'blue'; // eslint-disable-line no-unused-vars
  const toDoColor = 'red';

  export default {
    props: ['pyld', 'record'],
    data() {
      return {
        picks: {},
        fontColor: {},
        styleObject: {},
      };
    },
    beforeMount() {
      // LG(this.pyld);
      this.pyld.forEach((item) => {
        this.styleObject[item.key] = { color: toDoColor };
      });
      // LG(`
      //   &&&&&&&&&&& ${JSON.stringify(this.fontColor, null, 2)}`);
    },
    methods: {
      picked(val) {
        // LG(`
        //   *********************************** Field : ${val.r}  Choice : ${val.c}`);
        this.picks[val.r] = val.c;
        const style = {};
        style[val.r] = { color: doneColor };
        this.styleObject = Object.assign({}, this.styleObject, style);
        // // this.styleObject[val.r].color = doneColor;
        // // this.$set(this.someObject, 'b', 2);
        // LG(`
        //   &&&&&&&&&&& ${JSON.stringify(this.styleObject, null, 2)}`);
      },
      submit() {
        const ignored = this.pyld.filter(itm => !Object.keys(this.picks).includes(itm.key));
        if (ignored.length > 0) return;
        LG(`
          ==================== ${JSON.stringify(ignored, null, 2)}`);
        this.$emit('close', this.picks);
      },
    },
  };
</script>
