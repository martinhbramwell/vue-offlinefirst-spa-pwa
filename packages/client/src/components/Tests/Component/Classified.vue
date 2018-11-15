<template>

  <div class="columns is-mobile">
    <div class="column is-one-quarter"></div>
    <Container class="column is-one-quarter" :group-name="'1'" :get-child-payload="sourcePayload" @drop="onDrop('source', $event)">
      <Draggable v-for="item in source" :key="item.id">
        <div class="draggable-item">
          {{item.data}}
        </div>
      </Draggable>
    </Container>
    <Container class="column is-one-quarter" :group-name="'1'" :get-child-payload="targetPayload" @drop="onDrop('target', $event)">
      <Draggable v-for="item in target" :key="item.id">
        <div class="draggable-item">
          {{item.data}}
        </div>
      </Draggable>
    </Container>
    <div class="column is-one-quarter"></div>
  </div>

</template>

<script>

  import { Container, Draggable } from 'vue-smooth-dnd';
  // import { applyDrag, generateItems } from '@/utils/dragAndDrop';
  import { applyDrag } from '@/utils/dragAndDrop';

  export default {
    name: 'Groups',
    components: { Container, Draggable },
    data() {
      return {
        source: [{ id: 100001, data: 'IBAA001' }, { id: 100005, data: 'IBAA005' }],
        target: [{ id: 100014, data: 'IBAA014' }, { id: 100015, data: 'CLAA015' }],
      };
    },
    methods: {
      onDrop(collection, dropResult) {
        this[collection] = applyDrag(this[collection], dropResult);
      },
      sourcePayload(index) {
        return this.source[index];
      },
      targetPayload(index) {
        return this.target[index];
      },
    },
  };
</script>


