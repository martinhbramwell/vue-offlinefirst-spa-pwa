<template>
  <div style="margin-left: 30px">
    <h1>Some Protected Sections!</h1>
    <ol>
      <li>
        <h3>Read-only view</h3>
        <p style="margin-left: 30px" v-if="$can('only_view', 'protected')">
          You are allowed to see this text.
        </p>
      </li>
      <li>
        <h3>Limited Edits</h3>
        <p style="margin-left: 30px" v-if="$can('comment', 'protected')">
          You are allowed to make some edits.
        </p>
      </li>
      <li>
        <h3>Any Edits</h3>
        <p style="margin-left: 30px" v-if="$can('alter', 'protected')">
          You are allowed any edits of this resource.
        </p>
      </li>
      <li>
        <h3>Alter Privileges</h3>
        <p style="margin-left: 30px" v-if="$can('assign', 'protected')">
          You are allowed to control access to this resource.
        </p>
      </li>
    </ol>
    <hr />
    <p>Unprotected text</p>

    <p v-show="$can('only_view', 'protected')">Protected text!</p>
    {{ qtst }}

    <hr />
    <router-link class="button is-small is-link is-outlined" v-bind:to="{name: 'home'}">
      <icon name="arrow-circle-up" />
      &nbsp;Home
    </router-link>
    <router-link class="button is-small is-link is-outlined" v-bind:to="{name: 'classified'}">
      <icon name="arrow-circle-right" />
      &nbsp;Classified
    </router-link>
  </div>
</template>

<script>
  import Levels from '@/accessControl/Levels';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    computed: {
      qtst() {
        const msg = ' ------- Quick Test -------';
        LG(msg);
        LG(Levels);
        // this.$ability.update([{ actions: ['only view'], subject: 'doodle' }]);
        LG(this.$ability);
        LG(window.ability);
        LG(this.$can('alter', 'protected'));
        return msg;
      },
    },
  };
</script>
