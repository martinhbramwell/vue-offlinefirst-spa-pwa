<template>
  <div id="dialog-window">
    <div id="header" class="container is-fluid">
      <nav class="level">
        <!-- Left side -->
        <div class="level-left">
          <div class="level-item">
            <p class="subtitle is-6 is-primary">
              <strong>Buscar Envase</strong>
            </p>
          </div>
          <div class="level-item">
            <p class="subtitle is-7">
              <strong>Codigo</strong>
            </p>
          </div>
          <!-- <div class="level-item" @keyup="seekCodigoChange()"> -->
          <div class="level-item">
            <b-input
              v-model="seekCodigo"
              placeholder='codigo de envase'
              @focus='seekCodigoFocus'
              @blur='seekCodigoBlur'>
            </b-input>
            <strong>{{ seekIndicator }}</strong>
          </div>
        </div>

        <!-- Right side -->

        <div class="level-right">
          <p class="level-item"><strong>{{ items.length }}</strong></p>
          <p class="level-item"><a v-on:click="purge"class="button is-danger">Purge</a></p>
        </div>
      </nav>
    </div>

    <div id="scrollable-content">
      <virtual-scroller
        page-mode
        class="virtual-list"
        :items="items || []"
        item-height="24"
        content-tag="ul">
        <template slot-scope="props">

          <li v-if="props.item.data.ubicacion.toLowerCase() === 'planta'" :key="props.itemKey">
            {{props.item.data.codigo}}: Movimientos {{props.item.data.movements && props.item.data.movements.length || '_'}} - ubicacion: Planta
          </li>

          <li v-else :key="props.itemKey">
            {{props.item.data.codigo}}: Movimientos {{props.item.data.movements && props.item.data.movements.length || '_'}} - ubicacion: <strong>{{props.item.data.ultimo}}</strong>
            <!-- <strong>{{person(props.item.ultimo)}}</strong> -->
          </li>
        </template>
      </virtual-scroller>

    </div>
    >{{ getRelational }}<
    {{ relationalData }}
  </div>
</template>

<script>

  /* eslint-disable no-underscore-dangle */

  import { debounce } from 'lodash'; // eslint-disable-line no-unused-vars

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars
  const LGERR = console.error; // eslint-disable-line no-console, no-unused-vars

  const hintId = 'codigo de envase';
  const loader = (vm, seekCode) => {
    LG(`
      ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::`);
    let seekCodigo = new RegExp('^.*', 'gi');

    if (seekCode !== hintId) seekCodigo = new RegExp(`^${seekCode}.*`, 'gi');
    vm.liveFeedStatus = 'finding'; // eslint-disable-line no-param-reassign
    LG(`Searching with: ${seekCodigo} from >${seekCode}<`);
    return vm.$pouch.liveFind({
      selector: {
        // _id: { $regex: new RegExp('bottle_.*', 'gi') },
        'data.codigo': { $regex: seekCodigo },
        'data.type': 'bottle',
        // ent: { $gt: 0 },
      },
      sort: [{ 'data.codigo': 'asc' }],
      // aggregate: true,
    })

      // Called every time there is an update to the query
      .on('update', (upDate, aggregate) => { // eslint-disable-line no-unused-vars
        // update.action is 'ADD', 'UPDATE', or 'REMOVE'
        // update also contains id, rev, and doc
        // aggregate is an array of docs containing the latest state of the query
        const update = upDate;
        // LG(`######### Updating. ${update.id} ${update.doc.data.ultimo}`);
        if (update.doc.data.ultimo === 0) {
          vm.getItems(update);
        } else {
          // LG(`######### Updated. ${update.id} ${update.doc.data.codigo}`);
          vm.$pouch.rel.find('aPerson', update.doc.data.ultimo).then((rslt) => {
            // LG(`rslt for ${update.doc.data.ultimo} --`);
            // LG(rslt);
            // LG(rslt.allPersons);
            // LG(rslt.allPersons[0].nombre);
            update.doc.data.ultimo =
              (rslt.allPersons[0] && rslt.allPersons[0].nombre) || update.doc.data.ultimo;
            update.doc.data.extra = rslt;
            // LG(update.doc.data);
            vm.getItems(update);
          });
        }
        // LG(update.action, update.id, update.doc);
        // const debouncedGetItems = debounce(vm.getItems, 50);
        // debouncedGetItems(update);
      })

      // Called when the initial query is complete
      .on('ready', () => {
        LG('###############   Initial query complete.   ##############');
        vm.$pouch.rel.find('aPerson', 12357).then((prsn) => {
          LG('prsn 12357');
          LG(prsn);
        });
        // vm.$pouch.rel.find('aPerson', 'aPerson_1_0000000000012344').then((prsn) => {
        //   LG('prsna Person_1_0000000000012344');
        //   LG(prsn);
        // });
        vm.liveFeedStatus = 'listening'; // eslint-disable-line no-param-reassign
      })

      // Called when you invoke `liveFeed.cancel()`
      .on('cancelled', () => {
        LG('###############   LiveFind cancelled.   ##############');
        vm.liveFeedStatus = 'idle'; // eslint-disable-line no-param-reassign
        vm.newSearch();
      })

      // Called if there is any error
      .on('error', (err) => {
        LGERR('Oh no!', err);
      });
  };

  export default {
    data() {
      return {
        items: [],
        liveFeed: null,
        liveFeedStatus: 'idle',

        seekCodigo: hintId,
        seekCodigoIsDirty: false,
        seeking: false,

        relationalData: 'none',

      };
    },
    created() {
      this.liveFeed = loader(this, hintId);
    },
    computed: {
      getRelational() {
        LG('###############   getRelational   ##############');

        this.$pouch.allDocs({ include_docs: true })
          .then((val) => {
            LG('====== all Docs ======');
            LG(val);
          });

        // this.$pouch.rel.findHasMany('aBottle', 'aPerson', 'aPerson_14577.612095809644')
        // this.$pouch.rel.find('aPerson', 'aPerson_13015.605307960835')
        this.$pouch.rel.find('aPerson', 12347)
        // this.$pouch.rel.findHasMany('aBottle', 'aPerson')
          .then((val) => {
            LG('====== Person 12347 ======');
            LG(val);
            // this.relationalData =
            //    `Bottle ${val.allBottles[0].codigo} at ${val.allBottles[0].ubicacion}`;
          });
      },
      seekIndicator() {
        LG('###############   seekIndicator   ##############');
        LG(this.seekCodigo);
        if (this.seeking) {
          return '⟳ Fetching new results';
        } else if (this.seekCodigoIsDirty) {
          return '... Typing';
        }
        return '✓ Done';
      },
    },
    watch: {
      seekCodigo() {
        LG('###############   seekCodigo   ##############');
        LG(this.seekCodigo);
        this.seekCodigoIsDirty = true;

        this.items = [];
        LG(this.liveFeedStatus);
        this.liveFeedStatus = 'cancelling';
        this.liveFeed.cancel();
        // loader(this, val);
      },
    },
    methods: {
      purge() {
        LG('###############   purge   ##############');
        this.$pouch.rel.find('aPerson')
          .then((persons) => {
            LG(persons);
          });
      },
      newSearch: debounce(function restrain() {
        if (this.seekCodigo === hintId) return;
        LG('###############   newSearch   ##############');

        this.seeking = true;
        setTimeout(function delay() { // eslint-disable-line prefer-arrow-callback
          LG('setTimeout');
          LG(this.seekCodigo);
          this.seeking = false;
          this.seekCodigoIsDirty = false;
        }.bind(this), 2000);
        this.liveFeed = loader(this, this.seekCodigo);
      }, 100),
      getItems(pouchData) {
        // LG('###############   getItems   ##############');
        // LG(pouchData);

        let idx = null;
        /* eslint-disable no-underscore-dangle */
        switch (pouchData.action) {
          case 'REMOVE':
            LG('###############   LiveFind remove not implemented   ##############');
            break;
          case 'UPDATE':
            idx = this.items.findIndex(elem => elem._id === pouchData.id);
            LG('###############   LiveFind update   ##############');
            LG(this.items[idx]);
            this.items[idx] = pouchData.doc;
            this.items = this.items.slice();
            break;
          default:
            this.items.push(pouchData.doc);
        }
        /* eslint-enable no-underscore-dangle */
      },
      seekCodigoFocus() {
        if (this.seekCodigo === hintId) this.seekCodigo = '';
      },
      seekCodigoBlur() {
        if (this.seekCodigo === '') this.seekCodigo = hintId;
      },
    },
  };
</script>


<style>
  #dialog-window {
    height: 500px;
    padding: 10px;
    /*padding-bottom: 35px;*/
    margin-left: 15px;
    margin-right: 15px;
    margin-bottom: 15px;
    border: 1px black solid;
  }

  #scrollable-content {
    height: 435px;
    overflow: auto;
  }

  #header {
    height: 50px;
  }
</style>
