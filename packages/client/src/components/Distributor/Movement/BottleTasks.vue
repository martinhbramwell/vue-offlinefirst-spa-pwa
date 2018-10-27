<template>
  <div>
    <div class="card-edge">
      <div class="card" >
        <header class="card-header">
          <p class="card-header-title">
            <span class="is-size-7">Traspaso de Envases</span>
          </p>
          <div class="card-header-icon" aria-label="more options">
            <button id="control-button" :class="PersonsButton.class" @click="openShutPersons('toggle')" ref="personsButton">
              <span class="is-size-7">{{ PersonsButton.text }}</span>
            </button>
            <button id="control-button" :class="CameraButton.class" @click="openShutCamera('toggle')" ref="CameraButton">
              <span class="is-size-7">{{ CameraButton.text }}</span>
            </button>
          </div>

         </header>

        <div class="card-content">

          <nav class="level">
            <!-- Left side -->
            <div class="level-left">
              <div class="level-item">
                <div class="is-small">Nombre de Persona</div>
              </div>

              <div class="level-item">
                <autocomplete-input
                  @input="personPicked()"
                  :options="personPicker || null"
                  id="person-picker"
                  ref="prsnPckr"
                />
              </div>

              <div class="level-item" v-if="autocompleteDirty">
                <a class="button is-small is-black is-inverted" @click="clearAutoComplete">
                  <span class="icon is-small">
                    <i class="far fa-trash-alt"></i>
                  </span>
                </a>
              </div>
<!--
              <div class="level-item">
                <div class="field is-grouped is-grouped-centered" v-if="thoseChosen.length > 0">
                  <p class="control">
                    <span class="content is-size-5 italic">
                      {{ inwardOutward }} {{personChosen.nombre}}
                    </span>
                  </p>
                  <p class="control">
                    <span class="block">
                        <b-radio v-model="inwardOutward" size="is-small" native-value="Recibir de">
                            Recepcion
                        </b-radio>
                        <b-radio v-model="inwardOutward" size="is-small" native-value="Entregar a">
                            Entrega
                        </b-radio>
                    </span>
                  </p>
                </div>
              </div>
 -->
<!--
              <div class="level-item" v-if="autocompleteDirty">
                <a class="button is-small is-black is-inverted" @click="clearAutoComplete">
                  <span class="icon is-small">
                    <i class="far fa-trash-alt"></i>
                  </span>
                </a>
              </div>
 -->
            </div>
            <!-- Right side -->
            <div class="level-right">
            </div>
          </nav>


          <b-collapse :open="true" ref="collapsePersons">
            <div id="scrollable-content">
              <virtual-scroller
                class="virtual-list"
                :items="items || []"
                type-field="type"
                item-height="24"
                content-tag="table"
                page-mode
                ref="scroller"
                >
                <template slot-scope="props">
                  <tr v-if="props.item.type === 'chosen'" class="chosen" :key="props.itemKey">
                    <td @click="picked(props)" class="tag is-info persons">
                      {{props.item.data.nombre}} - &nbsp;<span class="italic"> &nbsp; {{props.item.data.email}}</span>
                    </td>
                  </tr>

                  <tr v-if="props.item.type === 'person'" class="person" :key="props.itemKey">
                    <td @click="picked(props)" class="persons">
                      {{props.item.data.nombre}} - &nbsp;<span class="italic"> &nbsp; {{props.item.data.email}}</span>
                    </td>
                  </tr>
                </template>
              </virtual-scroller>
            </div>
          </b-collapse>
        </div>

        <div class="columns">
          <div class="column is-one-quarter" id="drag-column">
            <hr />
            <nav class="level">
              <div class="tags has-addons level-item has-text-centered">
                <span class="tag is-dark">nosotros</span>
                <span class="tag is-outlined tag-inventory">
                  <strong>{{ currentUser.nombre || '_____' }}</strong>
                </span>
              </div>
            </nav>
            <nav class="level">
              <div class="level-item has-text-centered control is-small">
                <input class="input is-small" :disabled="!autocompleteDirty" type="text" placeholder="Codigo" v-model="newInventoryBottle" id="inp-esp-envase" @keyup.13="addNewBottle('Inventory')" @focus="closeError(UNKNOWN_BOTTLE_ERROR)">
              </div>
              <p class="level-item has-text-centered control is-small">
                <a class="button is-small" :disabled="!autocompleteDirty" @click="addNewBottle('Inventory')" id="butt-add-inventory-bottle">
                  <span class="is-size-7"><strong>Especificar Envase</strong></span>
                </a>
              </p>
            </nav>

<!--
            <nav class="level">
              <div class="tags has-addons level-item has-text-centered">
                <span class="tag is-invisible">dummy</span>
              </div>
            </nav>
 -->
            <div class="container scrollable-container">
              <Container :group-name="'1'" :get-child-payload="inventoryPayload" :should-accept-drop="shouldAcceptInventory" @drop="onDrop('inventory', $event)">
                <Draggable v-for="item in inventory" :key="item.id">
                  <div :class="item.props.className" :id="item.id" :style="item.props.style">
                    {{item.data}}
                  </div>
                </Draggable>
              </Container>
            </div>
          </div>

          <div class="column is-one-quarter" id="drag-column">
            <hr />
            <nav class="level">
              <div class="tags level-item has-text-centered">
                <span class="tag is-dark">Intercambio</span>
              </div>
            </nav>

            <div class="trashBin">
              <nav class="level">
                <div class="level-item has-text-centered">
                  <Container :group-name="'1'" :should-accept-drop="shouldTrash" @drop="onDrop('trash', $event)">
                    <Draggable class="icon is-invisible">
                      <i class="far fa-trash-alt"></i>
                    </Draggable>
                    <Draggable class="icon">
                      <i class="far fa-trash-alt"></i>
                    </Draggable>
                  </Container>
                </div>
              </nav>
            </div>


            <div class="container scrollable-container">
              <Container :group-name="'1'" :get-child-payload="exchangePayload" :should-accept-drop="shouldAcceptExchange" @drop="onDrop('exchange', $event)">
                <Draggable v-for="item in exchange" :key="item.id">
                  <div :class="item.props.className" :id="item.id" :style="item.props.style">
                    {{item.data}}
                  </div>
                </Draggable>
              </Container>
            </div>

            <nav class="level">
              <div class="level-item has-text-centered control is-small is-primary">
                <a class="button is-small is-warning" :disabled="!autocompleteDirty" @click="saveMovements" id="butt-save-moves">
                  <span class="is-size-7"><strong>Grabar Movimientos</strong></span>
                </a>
              </div>
            </nav>
          </div>


          <div class="column is-one-quarter" id="drag-column">
            <hr />
            <nav class="level">
              <div class="tags has-addons level-item has-text-centered">
                <span class="tag is-dark">cliente</span>
                <span class="tag is-outlined tag-customer">
                  <strong>{{ personChosen.nombre || '_____' }}</strong>
                </span>
              </div>
            </nav>

            <nav class="level">
              <div class="level-item has-text-centered control is-small">
                <input class="input is-small" :disabled="!autocompleteDirty" type="text" placeholder="Codigo" v-model="newCustomerBottle" id="inp-esp-envase" @keyup.13="addNewBottle('Customer')" @focus="closeError(UNKNOWN_BOTTLE_ERROR)">
              </div>
              <p class="level-item has-text-centered control is-small">
                <a class="button is-small" :disabled="!autocompleteDirty" @click="addNewBottle('Customer')" id="butt-add-customer-bottle">
                  <span class="is-size-7"><strong>Especificar Envase</strong></span>
                </a>
              </p>
            </nav>


<!--
            <nav class="level">
              <div class="tags has-addons level-item has-text-centered">
                <span class="tag is-invisible">dummy</span>
              </div>
            </nav>
 -->
            <div class="container scrollable-container">
              <Container :group-name="'1'" :get-child-payload="customerPayload" :should-accept-drop="shouldAcceptCustomer" @drop="onDrop('customer', $event)">
                <Draggable v-for="item in customer" :key="item.id">
                  <div :class="item.props.className" :id="item.id" :style="item.props.style">
                    {{item.data}}
                  </div>
                </Draggable>
              </Container>
            </div>
<!--
            <div class="trashBin">
              <nav class="level">
                <div class="level-item has-text-centered">
                  <Container :group-name="'1'" :should-accept-drop="shouldTrash" @drop="onDrop('trash', $event)">
                    <Draggable class="icon is-invisible">
                      <i class="far fa-trash-alt"></i>
                    </Draggable>
                    <Draggable class="icon">
                      <i class="far fa-trash-alt"></i>
                    </Draggable>
                  </Container>
                </div>
              </nav>
            </div>
 -->
          </div>
<!--
          <div class="column is-one-quarter">
            <nav class="level">
              <div class="tags has-addons level-item has-text-centered">
                <span class="tag is-dark">cliente</span>
                <span class="tag is-outlined tag-customer">
                  {{ personChosen.nombre || '_____' }}
                </span>
              </div>
            </nav>
            <nav class="level">
              <div class="tags has-addons level-item has-text-centered">
                <span class="tag is-invisible">dummy</span>
              </div>
            </nav>
          </div>
 -->
        </div>
<!--
          <p v-for="bottle in bottles" class="control is-small">
            <a class="button is-small" @click="dropBottle(bottle)">{{ bottle }}</a>
          </p>
          <p v-if="bottles[0] !== this.PLACEMARKER" class="control is-small">
            <a class="button is-small is-danger" @click="dropBottles">
              <strong>Vaciar Lista</strong>
            </a>
          </p>
 -->

        <div class="card-image">
          <div v-for="error in errors" class="alert alert-danger" role="alert">
            <b-notification type="is-danger">
              {{ error }}
            </b-notification>
           </div>
            <b-collapse :open="true" ref="collapseCamera">
              <!-- <Component :is="selectedDemo" @error="openError" @success="clearErrors" /> -->
            </b-collapse>

        </div>
        <footer class="card-footer">
          <a href="#" class="card-footer-item">Save</a>
          <a href="#" class="card-footer-item">Edit</a>
          <a href="#" class="card-footer-item">Delete</a>
        </footer>
        <p>currentUser: {{ currentUser.id }}
               Bottles: {{ currentUser.bottles && currentUser.bottles.length }} </p>
        <p>personChosen: {{ personChosen.id }}
                Bottles: {{ personChosen.bottles && personChosen.bottles.length }} </p>
      </div>
    </div>
  </div>
</template>

<script>

  import { Container, Draggable } from 'vue-smooth-dnd';
  import { applyDrag } from '@/utils/dragAndDrop';
  import { cloneDeep } from 'lodash';

  import { mapGetters, mapActions, mapState } from 'vuex'; // eslint-disable-line no-unused-vars
  import qrDecode from '@/utils/qrcodes/Decoder';
  import AutoComplete from '@/components/MultiUse/AutoComplete';
  import { generateMovementId } from '@/database';

  // import TheValidateDemo from '@/utils/qrcodes/TheValidateDemo';

  // import Person from './Person';
  // import ChosenPerson from './ChosenPerson';
  // import { NONECHOSENFLAG } from './index';

  const LG = console.log; // eslint-disable-line no-unused-vars, no-console
  const LGERR = console.error; // eslint-disable-line no-console, no-unused-vars

  const loader = (theComponent) => {
    const vm = theComponent;
    LG(`
      uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu`);
    const seekCodigo = new RegExp('^.*', 'gi');

    vm.liveFeedStatus = 'finding';
    LG(`Searching with: ${seekCodigo}`);
    return vm.$pouch.liveFind({
      selector: {
        // _id: { $regex: new RegExp('bottle_.*', 'gi') },
        'data.type': 'person',
        'data.nombre': { $regex: seekCodigo },
        // ent: { $gt: 0 },
      },
      sort: ['data.type', 'data.nombre'],
      // aggregate: true,
    })

      // Called every time there is an update to the query
      .on('update', (upDate, aggregate) => { // eslint-disable-line no-unused-vars
        // update.action is 'ADD', 'UPDATE', or 'REMOVE'
        // update also contains id, rev, and doc
        // aggregate is an array of docs containing the latest state of the query
        const update = upDate;
        // LG(`######### Updating. ${update.id} ${update.doc}`);
        // LG(update.doc);
        vm.getItems(update);
        // if (update.doc.data.ultimo === 0) {
        //   vm.getItems(update);
        // } else {
        //   // LG(`######### Updated. ${update.id} ${update.doc.data.codigo}`);
        //   vm.$pouch.rel.find('aPerson', update.doc.data.ultimo).then((rslt) => {
        //     LG(`rslt for ${update.doc.data.ultimo} --`);
        //     LG(rslt);
        //     LG(rslt.allPersons);
        //     LG(rslt.allPersons[0].nombre);
        //     update.doc.data.ultimo =
        //       (rslt.allPersons[0] && rslt.allPersons[0].nombre) || update.doc.data.ultimo;
        //     update.doc.data.extra = rslt;
        //     // LG(update.doc.data);
        //     vm.getItems(update);
        //   });
        // }
      })

      // Called when the initial query is complete
      .on('ready', () => {
        LG('###############   Initial query complete.   ##############');

        // vm.$pouch.rel.find('aPerson', 12357).then((prsn) => {
        //   LG('prsn 12357');
        //   LG(prsn);
        // });

        vm.liveFeedStatus = 'listening';
      })

      // Called when you invoke `liveFeed.cancel()`
      .on('cancelled', () => {
        LG('###############   LiveFind cancelled.   ##############');
        vm.liveFeedStatus = 'idle';
        // vm.newSearch();
      })

      // Called if there is any error
      .on('error', (err) => {
        LGERR('Oh no!', err);
      });
  };

  const items = [];
  const PLACEMARKER = 'Lista de Envases';
  //            :renderers="renderers"

  // const renderers = Object.freeze({
  //   chosen: ChosenPerson,
  //   person: Person,
  // });
  const PersonsButtonVer = {
    class: 'button is-small is-info',
    text: 'Ver Personas',
  };
  const PersonsButtonEsconder = {
    class: 'button is-small is-info is-outlined',
    text: 'Esconder Personas',
  };
  const CameraButtonVer = {
    class: 'button is-small is-info',
    text: 'Ver QR',
  };
  const CameraButtonEsconder = {
    class: 'button is-small is-info is-outlined',
    text: 'Esconder QR',
  };
  const ID_BOTTLEPLACEHOLDER = 99999999;
  const BOTTLEPLACEHOLDER = {
    id: ID_BOTTLEPLACEHOLDER,
    data: `Rastrear envases aqui
    `,
    src: '',
    props: {
      className: 'card',
      style: {
        marginLeft: '10px',
        marginRight: '10px',
        marginTop: '10px',
        paddingTop: '20px',
        backgroundColor: '#fffff0',
        textAlign: 'center',
      },
    },
  };

  const clearExchangeArea = (area, codes) => {
    area
      .map((b, ix) => (codes.includes(b.id) ? ix : -1))
      .sort((a, b) => (a - b) * -1)
      .forEach(idx => area.splice(idx, 1));
    if (area.findIndex(tag => tag.id === ID_BOTTLEPLACEHOLDER) < 0) area.push(BOTTLEPLACEHOLDER);
  };

  const UNKNOWN_BOTTLE_ERROR = 'Error: Envase desconocido!';

  const vm = {
    name: 'bottle-tasks',
    data() {
      return {
        thoseChosen: [],
        personChosen: {
          name: null,
          id: '------',
          bottles: [],
        },
        selectedDemo: 'qrDecode',
        PersonsButton: PersonsButtonEsconder,
        CameraButton: CameraButtonEsconder,
        autocompleteDirty: false,
        // autocompleteIdx: -1,
        personPicker: {
          list: [],
          data(picked) {
            // vm.autocompleteIdx = picked.pos;
            return { label: `[${picked.pos}] ${picked.label}`, value: picked.pos };
            // return `[${picked.pos}] ${picked.label}`;
          },
        },
        items,
        inwardOutward: 'Recibir de',
        newCustomerBottle: '',
        newInventoryBottle: '',
        PLACEMARKER,
        UNKNOWN_BOTTLE_ERROR,
        bottles: [PLACEMARKER],
        errors: [],
        currentUser: {
          id: null,
          bottles: [],
        },

        inventory: [],
        customer: [],
        exchange: [BOTTLEPLACEHOLDER],
        trash: [BOTTLEPLACEHOLDER],

        // inventory: [{ id: 100001, data: 'IBAA001' }, { id: 100005, data: 'IBAA005' }],
        // customer: [{ id: 100014, data: 'IBAA014' }, { id: 100015, data: 'CLAA015' }],
        // exchange: [{ id: 99999999, data: 'Rastrear envases aqui' }],
      };
    },
    methods: {
      personPicked() {
        /* eslint-disable no-underscore-dangle */
        this.$nextTick(() => {
          LG('%%%%%%%%%%%%%%%% person picked %%%%%%%%%%%%%%%%%% ');
          LG(this.$refs.prsnPckr.$el);
          LG(this.$refs.prsnPckr.$el._value - 1);
          // const itemIndex = this.$refs.prsnPckr.$el.value;
          // const valueShown = this.$refs.prsnPckr.$el.value;
          // const itemIndex = valueShown.split(']')[0].split('[')[1] - 1;
          const itemIndex = this.$refs.prsnPckr.$el._value - 1;
          LG(itemIndex);
          const them = cloneDeep(this.items[itemIndex]);
          LG(this.items[itemIndex].data.nombre);
          LG(them.data.nombre);
          LG(cloneDeep(this.items[itemIndex]).data.nombre);
          this.$refs.prsnPckr.$el.value = them.data.nombre;
          this.picked({ itemIndex });
        });
        /* eslint-enable no-underscore-dangle */
      },
      clearAutoComplete() {
        this.autocompleteDirty = false;
        this.thoseChosen.forEach((idx) => {
          // LG(idx);
          this.items[idx].type = 'person';
        });
        this.$refs.prsnPckr.$el.value = '';
        this.personChosen.bottles = [];
        this.personChosen.nombre = null;
        this.customer = [];
        this.exchange = [];
        this.exchange.push(BOTTLEPLACEHOLDER);

        this.openShutPersons('open');
      },
      addNewBottle(side) {
        LG('%%%%%%%%%%%%%%%% add new bottle %%%%%%%%%%%%%%%%%% ');
        const codeBottle = this[`new${side}Bottle`].toUpperCase();
        LG(this.inventory);
        LG(this.customer);
        LG(this.exchange);
        this.$pouch.find({
          selector: {
            'data.type': 'bottle',
            'data.codigo': codeBottle,
          },
          // fields: ['data.id', 'data.codigo'],
        }).then((recs) => {
          if (recs.docs.length < 1) {
            this.openError(UNKNOWN_BOTTLE_ERROR);
            this[`new${side}Bottle`] = null;
            return;
          }
          const bottleInInventory = this.inventory.filter(env => env.data === codeBottle);
          const bottleInCustomer = this.customer.filter(env => env.data === codeBottle);
          let [bottle] = recs.docs;
          if (bottleInInventory.length > 0) {
            [bottle] = bottleInInventory;
            LG(`move from inventory ${JSON.stringify(bottleInInventory, null, 2)}`);
            this.inventory = this.inventory.filter(btl => btl !== bottleInInventory[0]);
          } else if (bottleInCustomer.length > 0) {
            [bottle] = bottleInCustomer;
            LG(`move from customer ${JSON.stringify(bottleInCustomer, null, 2)}`);
            this.customer = this.customer.filter(btl => btl !== bottleInCustomer[0]);
          } else {
            LG(`add to exchange ${JSON.stringify(bottle, null, 2)}`);
            bottle = {
              id: parseInt(bottle.data.id, 10),
              data: bottle.data.codigo,
              src: `#${side.slice(0, 1)}`,
              props: {
                className: `draggable-item draggable-${side.toLowerCase()} dashed`,
                style: { textAlign: 'center', backgroundColor: side === 'Inventory' ? '#c0ebfd' : '#f0fff0' },
              },
            };
          }
          this.exchange.push(bottle);
          this.exchange = this.exchange.filter(itm => itm.id !== 99999999);
        }).catch((err) => {
          this.openError(`Error: Búsqueda fallida! (${err})`);
        });
        // this.$store.state.dbmgr.dbMgr.allDocs({
        //   include_docs: true,
        //   attachments: true,
        // }).then((recs) => {
        //   LG(recs);
        // });
        if (this.bottles[0] === this.PLACEMARKER) {
          this.bottles.splice(0, 1, codeBottle);
        } else {
          this.bottles.push(codeBottle);
        }
      },
      saveMovements() {
        LG('%%%%%%%%%%%%%%%% save movements %%%%%%%%%%%%%%%%%% ');

        const customer = parseInt(this.personChosen.idIB, 10);
        const inventory = parseInt(this.currentUser.id, 10);
        const type = 'ExchangeRequest';

        // LG(`MOVEMENT ID ${moveId}`);

        // LG(`Customer Id ${this.personChosen.id}`);
        // LG(`Inventory Id ${this.currentUser.id}`);
        // LG(`exchange ${JSON.stringify(this.exchange, null, 2)}`);
        const incoming = this.exchange.filter(btle => btle.src.match(/C/)).map(btle => btle.id);
        const outgoing = this.exchange.filter(btle => btle.src.match(/I/)).map(btle => btle.id);
        // LG(`bottles coming in ${JSON.stringify(incoming, null, 2)}`);
        // LG(`bottles going out ${JSON.stringify(outgoing, null, 2)}`);
        if (incoming.length > 0) {
          const pouchId = this.$pouch.rel.makeDocID({
            type, id: generateMovementId(customer, 'I'),
          });
          const pchid = this.$pouch.rel.parseDocID(pouchId);

          const moveIn = {
            _id: pouchId,
            data: {
              id: pchid.id,
              type,
              inOut: 'in',
              status: 'new',
              bottles: incoming,
              customer,
              inventory,
            },
          };
          LG(`movement in ${JSON.stringify(moveIn, null, 2)}`);
          this.$pouch.put(moveIn)
            .then((mvmnt) => {
              LG('---------- Saved movement IN --------');
              // LG(this.exchange);
              // LG(incoming);
              clearExchangeArea(this.exchange, incoming);
              LG(mvmnt);
            });
        }

        if (outgoing.length > 0) {
          const pouchId = this.$pouch.rel.makeDocID({
            type, id: generateMovementId(customer, 'O'),
          });
          const pchid = this.$pouch.rel.parseDocID(pouchId);
          const moveOut = {
            _id: pouchId,
            data: {
              id: pchid.id,
              type,
              status: 'new',
              inOut: 'out',
              bottles: outgoing,
              customer,
              inventory,
            },
          };
          LG(`movement out ${JSON.stringify(moveOut, null, 2)}`);
          this.$pouch.put(moveOut)
            .then((mvmnt) => {
              LG('---------- Saved movement OUT --------');
              // LG(outgoing);
              // LG(this.exchange);
              clearExchangeArea(this.exchange, outgoing);
              LG(mvmnt);
            });
        }
        this.$pouch.rel.find('Movement').then((res) => {
          LG('wwwwwwwwwwwwwwwww Result wwwwwwwwwwwwwww');
          LG(res);
        });
      },
      dropBottle(aBottle) {
        this.bottles.splice(this.bottles.indexOf(aBottle), 1);
      },
      dropBottles() {
        this.bottles = [this.PLACEMARKER];
      },
      openShutPersons(change) {
        const { isOpen } = this.$refs.collapsePersons;
        this.$refs.personsButton.blur();
        switch (change) {
          case 'open':
            if (isOpen) {
              this.PersonsButton = PersonsButtonEsconder;
              return;
            }
            break;
          case 'shut':
            if (!isOpen) {
              this.PersonsButton = PersonsButtonVer;
              return;
            }
            break;
          default:
        }
        // this.PersonsButton = `fas fa-angle-double-${isOpen ? 'down' : 'left'}`;
        this.PersonsButton = isOpen ? PersonsButtonVer : PersonsButtonEsconder;
        this.$refs.collapsePersons.toggle();
      },
      openShutCamera(change) {
        const { isOpen } = this.$refs.collapseCamera;
        this.$refs.CameraButton.blur();
        switch (change) {
          case 'open':
            if (isOpen) {
              this.CameraButton = CameraButtonEsconder;
              return;
            }
            break;
          case 'shut':
            if (!isOpen) {
              this.CameraButton = CameraButtonVer;
              return;
            }
            break;
          default:
        }
        // this.CameraButton = `fas fa-angle-double-${isOpen ? 'down' : 'left'}`;
        this.CameraButton = isOpen ? CameraButtonVer : CameraButtonEsconder;
        this.$refs.collapseCamera.toggle();
      },
      onDrop(collection, dropResult) {
        this[collection] = applyDrag(this[collection], dropResult);

        if (collection === 'exchange') {
          LG('onDrop');
          if (this.exchange.length > 1) {
            this.exchange = this.exchange.filter(itm => itm.id !== 99999999);
          } else if (this.exchange.length < 1) {
            this.exchange.push(BOTTLEPLACEHOLDER);
          }
          LG(dropResult);
        }
      },
      inventoryPayload(index) {
        return this.inventory[index];
      },
      exchangePayload(index) {
        return this.exchange[index];
      },
      customerPayload(index) {
        return this.customer[index];
      },
      trashPayload(index) {
        return this.trash[index];
      },
      shouldAcceptCustomer(sourceContainerOptions, payload) {
        LG('shouldAcceptCustomer');
        LG(payload);
        if (payload.src === 'C') return this.autocompleteDirty;
        return false;
      },
      shouldAcceptInventory(sourceContainerOptions, payload) {
        LG('shouldAcceptInventory');
        LG(payload);
        if (payload.src === 'I') return this.autocompleteDirty;
        return false;
      },
      shouldAcceptExchange(sourceContainerOptions, payload) {
        LG('shouldAcceptExchange');
        LG(payload);
        return this.autocompleteDirty;
      },
      shouldTrash(sourceContainerOptions, payload) {
        LG('shouldTrash');
        LG(payload.src);
        if (payload.src.slice(0, 1) === '#') return true;
        return false;
      },
      picked(val) {
        LG(`picked ${JSON.stringify(val, null, 2)}`);
        LG(val);
        const them = cloneDeep(this.items[val.itemIndex]);
        this.autocompleteDirty = true;
        // LG(them.data.nombre);
        // LG(them.type);
        if (this.personChosen.nombre === them.data.nombre) {
          this.personChosen.nombre = null;
          this.items[val.itemIndex].type = 'person';
          this.thoseChosen = [];
          this.openShutPersons('open');
        } else {
          this.thoseChosen.forEach((idx) => {
            // LG(idx);
            this.items[idx].type = 'person';
          });
          this.thoseChosen.push(val.itemIndex);
          this.items[val.itemIndex].type = 'chosen';
          this.personChosen = them.data;
          this.$refs.prsnPckr.$el.value = this.personChosen.nombre;
          const personChosenId = parseInt(this.personChosen.idIB, 10);
          const PersonId = this.$pouch.rel.makeDocID({ type: 'aPerson', id: personChosenId });
          LG(PersonId);
          this.$pouch.liveFind({
            selector: { _id: { $eq: PersonId } }, // eslint-disable-line prefer-destructuring
          }).on('update', () => {
            LG('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Chosen User Updated ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
            this.$pouch.rel.find('aPerson', personChosenId).then((persons) => {
              LG(`
                !!!!!!!!!!!!!!!!  [ picked ]  !!!!!!!!!!!!!!!!!!
                ${JSON.stringify(this.personChosen, null, 2)}
                `);
              LG(persons);
              if (persons.allBottles) {
                this.customer = persons.allBottles
                  .filter(bottle => persons.allPersons[0].bottles.includes(bottle.id))
                  .map(bottle => ({
                    id: bottle.id,
                    data: bottle.codigo,
                    src: 'C',
                    props: {
                      className: 'draggable-item draggable-customer ',
                      style: { backgroundColor: '#f0fff0', textAlign: 'center' },
                    },
                  }));

                LG(this.personChosen);
              } else {
                this.personChosen.bottles = [];
                this.customer = [];
              }
            });
          });

          // this.customer = this.currentUser.bottles
          //   .map(bottle => ({ id: bottle.id, data: bottle.codigo }));

          this.$refs.collapsePersons.toggle();
          this.openShutPersons('shut');
        }
      },

      getItems(pouchData) {
        // LG('###############   getPersons   ##############');
        // LG(pouchData);

        let idx = null;
        let pos = null;
        let cod = null;
        let idToUpdate = null;
        let data = null;
        /* eslint-disable no-underscore-dangle */
        switch (pouchData.action) {
          case 'REMOVE':
            LG('###############   LiveFind remove not implemented   ##############');
            break;
          case 'UPDATE':
            idToUpdate = this.$pouch.rel.parseDocID(pouchData.id).id.toString();
            idx = this.items.findIndex(item => item.data.idIB == idToUpdate); // eslint-disable-line eqeqeq, max-len
            LG('###############   LiveFind update   ##############');
            // LG(idx);
            // LG(this.items[idx].data.nombre);
            data = pouchData.doc.data; // eslint-disable-line prefer-destructuring
            // LG(data);
            if (this.items[idx]) {
              this.items[idx].data = data;
            } else {
              LG(`?????????????????????????????????????????????????????????????????????
                What is wrong with ${JSON.stringify(this.items, null, 2)}
                ?????????????????????????????????????????????????????????????????????`);
            }
            // this.items = this.items.slice().sort();
            // LG(this.personPicker.list);
            cod = data.codigo;
            pos = this.personPicker.list.findIndex(itm => itm.value === cod);
            // LG(`pos= ${pos}`);
            // this.personPicker.list[pos - 1].pos = pos;
            try {
              this.personPicker.list[pos - 1].value = cod;
              this.personPicker.list[pos - 1].label = data.nombre;
            } catch (err) {
              LG(`Unexpected missing list item in personPicker
                pouchData.doc.data.codigo :: ${cod}
                personPicker.list :: ${pos}`);
            }

            break;
          default:
            this.items.push({ type: 'person', data: pouchData.doc.data });
            this.personPicker.list.push({
              pos: this.personPicker.list.length + 1,
              value: pouchData.doc.data.codigo,
              label: pouchData.doc.data.nombre,
            });
        }
        /* eslint-enable no-underscore-dangle */
      },

      openError(error) {
        this.errors.push(error);
      },

      closeError(error) {
        const index = this.errors.indexOf(error);
        this.errors.splice(index, 1);
      },

      clearErrors() {
        this.errors = [];
      },
    },

    created() {
      this.liveFeed = loader(this);
    },

    mounted() {
      LG(`
        !!!!!!!!!!!!!!!! mounted !!!!!!!!!!!!!!!!!!`);
      this.currentUser.id = parseInt(this.$store.state.dbmgr.user.name, 10);
      LG(this.currentUser);
      const PersonId = this.$pouch.rel.makeDocID({ type: 'aPerson', id: this.currentUser.id });
      LG(PersonId);
      this.$pouch.liveFind({
        selector: { _id: { $eq: PersonId } }, // eslint-disable-line prefer-destructuring
      }).on('update', () => {
        LG('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Current User Updated ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        this.$pouch.rel.find('aPerson', this.currentUser.id).then((persons) => {
          LG(persons);
          LG(persons.allPersons);
          LG(persons.allPersons.length);
          if (persons.allPersons && persons.allPersons.length > 0) {
            this.currentUser.bottles = persons.allBottles
              .filter(bottle => persons.allPersons[0].bottles.includes(bottle.id));
            this.currentUser.nombre = persons.allPersons[0].nombre;
            this.inventory = this.currentUser.bottles
              .map((bottle) => {
                const drgBottle = {
                  id: bottle.id,
                  data: bottle.codigo,
                  src: 'I',
                  props: {
                    className: 'draggable-item draggable-inventory ',
                    style: { backgroundColor: '#c0ebfd', textAlign: 'center' },
                  },
                };
                return drgBottle;
              });
            LG(this.currentUser);
          }
        });
      });
    },

    components: {
      Container,
      Draggable,
      qrDecode,
      'autocomplete-input': AutoComplete,
      // TheValidateDemo,
    },

    watch: {
      selectedDemo: 'clearErrors',
    },

    computed: {
      draggableItemStyle(elem, val) {
        LG(`
          !!!!!!!!!!!!!!!! draggableItemStyle !!!!!!!!!!!!!!!!!!
          `);
        LG(elem);
        LG(val);
        return 'draggable-item draggable-customer';
      },
      // ...mapGetters('dbmgr', {
      //   user: 'getUserCredentials',
      // }),

      // personsId() {
      //   LG('||  %%%%%%%%%%%%%%%% personsId %%%%%%%%%%%%%%%%%% || ');
      //   LG(items);
      //   const list = [];
      //   items.forEach((item, idx) => {
      //     list.push({ pos: idx, value: item.data.codigo, label: item.data.nombre });
      //   });
      //   const ret = {
      //     list,
      //     data(text) {
      //       LG('%%%%%%%%%%%%%%%% we have picked someone %%%%%%%%%%%%%%%%%% ');
      //       LG(text);
      //       // return `(${text.value}) ${text.label}`;
      //       return `[${text.pos}] ${text.label}`;
      //     },
      //   };
      //   LG(ret);
      //   return ret;
      // },

      // personsId() {
      //   LG('%%%%%%%%%%%%%%%% personsId %%%%%%%%%%%%%%%%%% ');
      //   LG(this.$pouch);
      //   const ret = [];
      //   this.$pouch.liveFind({
      //     selector: { 'data.type': 'person' },
      //     // sort: [{data.type: 'desc'}, {data.nombre: 'desc'}],
      //     aggregate: true,
      //   })
      //     // Called every time there is an update to the query
      //     .on('update', (update, aggregate) => {
      //       // update.action is 'ADD', 'UPDATE', or 'REMOVE'
      //       // update also contains id, rev, and doc
      //       LG('update.action, update.id');
      //       LG(update.action, update.id);
      //       LG('aggregate');
      //       LG(aggregate);
      //       // aggregate is an array of docs containing the latest state of the query
      //       // refreshUI(aggregate);
      //       // (refreshUI would be a function you write to pipe the
      //       //    changes to your rendering engine)
      //     })

      //     // Called when the initial query is complete
      //     .on('ready', () => {
      //       LG('Livefind query complete.');
      //     })

      //     // Called when you invoke `liveFeed.cancel()`
      //     .on('cancelled', () => {
      //       LG('LiveFind cancelled.');
      //     })

      //     // Called if there is any error
      //     .on('error', (err) => {
      //       LGERR('LiveFind ERROR!', err);
      //     });

      //   // const ret = [];
      //   // const prsns = this.persons;
      //   // if (prsns) {
      //   //   LG('prsns');
      //   //   Object.keys(prsns).forEach((value) => {
      //   //     const person = prsns[value];
      //   //     ret.push({
      //   //       // name: person.nombre,
      //   //       value: person.codigo,
      //   //       // id: person.codigo,
      //   //       label: `${person.nombre}`,
      //   //     });
      //   //   });
      //   // }
      //   LG(ret);
      //   return {
      //     list: [{ value: 12, label: 'abc' }, { value: 112, label: 'ABcqq' }],
      //     data(text) {
      //       return `(${text.value}) ${text.label}`;
      //     },
      //   };
      // },
    },

  };

export default vm;

</script>

<style>
  input[type=text] {
    border: 1px solid;
    border-radius: 4px;
    width: 80px;
  }
  div.card-edge {
    margin: 10px;
  }
  #control-button {
    margin-left: 3px;
    margin-right: 3px;
  }
  #grouped-field {
    padding-left: 10px;
  }

  #person-picker {
    width: 100%;
  }

  #scrollable-content {
    height: 200px;
    overflow: auto;
    border: 2px outset;
    border-color: #9cdffc;
  }

  #drag-column {
    /*border-radius: 4px;*/
    margin-left: 30px;
    margin-right: 20px;
    padding: 10px;
  }

  #butt-save-moves {
    margin-top: 5px;
  }

  #inp-esp-envase {
    width: 80px;
  }

  #butt-add-inventory-bottle {
    margin-left: 10px;
    background-color: #c0ebfd;
  }

  #butt-add-customer-bottle {
    margin-left: 10px;
    background-color: #f0fff0;
  }

  span.tag-inventory {
    background-color: #c0ebfd
  }

  span.tag-customer {
    background-color: #f0fff0
  }

  div.scrollable-container {
    height: 300px;
    width: 90%;
    overflow: auto;
    border: 2px inset;
    border-color: #9cdffc;
  }

  div.draggable-item {
    margin: 2px;
    padding-left: 5px;
    border-width: 2px;
    border-style: ridge;
    text-align: 'center';
  }

  div.draggable-customer {
    border-color: #ccffcc;
  }

  div.draggable-inventory {
    border-color: #7bb8f7;
  }

  div.dashed {
    border-style: dashed;
    /*margin-top: 5px;*/
  }

  div.trashBin {
    border: 1px inset #7b5fcb;
    margin-bottom: 5px;
    margin-left: 19px;
    margin-right: 19px;
    /*padding: 10px;*/
  }

  td.persons {
    padding-left: 10px;
  }

  span.italic { font-style: italic; }


</style>
