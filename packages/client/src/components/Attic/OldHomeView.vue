<template>
  <div>
    <div class="mdl-grid">
      <div class="mdl-cell mdl-cell--3-col mdl-cell mdl-cell--1-col-tablet mdl-cell--hide-phone"></div>
      <div class="mdl-cell mdl-cell--6-col mdl-cell--4-col-phone">
        <a class="button" data-cyp="qiktst" @click="qiktst">Quick Test</a>
        <a class="button" data-cyp="logOutUser" @click="logOutUser">Purge User</a>
        <a class="button" data-cyp="purge" @click="purge">Purge All</a>
        <div data-cyp="status">{{ status }}</div>
        <div>{{ response }}</div>
        <div
          v-for="picture in this.pictures"
          class="image-card"
          @click="displayDetails(picture.id)">
          <div class="image-card__picture">
            <img :src="picture.url" />
          </div>
        </div>
        <router-link class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" to="/blog">
          <i class="material-icons">blog</i>
        </router-link>
        <router-link class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" to="/form">
          <i class="material-icons">form</i>
        </router-link>
        <router-link class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" :to="{ name: 'persons' }">
          <i class="material-icons">Persons</i>
        </router-link>
        <router-link class="mdl-button mdl-js-button mdl-button--fab mdl-button--colored" :to="{ name: 'poisons' }">
          <i class="material-icons">Persons (old)</i>
        </router-link>
      </div>
    </div>
    <router-link class="add-picture-button mdl-button mdl-js-button mdl-button--fab mdl-button--colored" to="/post">
      <i class="material-icons">add</i>
    </router-link>
  </div>
</template>

<script>

  import jwt from 'jsonwebtoken';
  import { mapGetters } from 'vuex';

  import cfg from '../../config';
  import data from './data';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    methods: {
      displayDetails(id) {
        this.$router.push({ name: 'detail', params: { id } });
      },
      qiktst() {
        const accessToken = this.jwt;
        const url = `${cfg.server}/api/person?s=1&c=3`;

        this.$log.info(`  +++ Quick Test '${url}' +++ `);
        const headers = {};
        if (accessToken) {
          headers.Authorization = `JWT ${accessToken}`;
        }

        fetch(`${url}`, { headers })
          .then((response) => {
            this.status = response.statusText;
            response.text().then((text) => {
              this.response = text;
            });
          });
      },
      logOutUser() {
        const accessToken = this.jwt;
        const memb = jwt.decode(accessToken).id;

        const headers = {};
        if (accessToken) {
          headers.Authorization = `JWT ${accessToken}`;
        }

        const url = `${cfg.server}/lgo/${memb}`;
        this.$log.info(` +++ LOG OUT USER '${memb}' AT '${url}' +++ `);

        fetch(`${url}`, { headers })
          .then((response) => {
            this.status = response.statusText;
            response.text().then((text) => {
              this.response = text;
            });
          });
      },
      purge() {
        const accessToken = this.jwt;
        const url = `${cfg.server}/purge`;

        this.$log.info(`  +++ PURGE USERS AT '${url}' +++ `);
        const headers = {};
        if (accessToken) {
          headers.Authorization = `JWT ${accessToken}`;
        }

        fetch(`${url}`, { headers })
          .then((response) => {
            this.status = response.statusText;
            response.text().then((text) => {
              this.response = text;
            });
          });
      },
    },
    data() {
      return {
        pictures: data.pictures,
        status: '',
        response: '',
      };
    },
    computed: {
      ...mapGetters({
        jwt: 'axsToken',
      }),
    },
  };
</script>

<style scoped>

  .add-picture-button {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 998;
  }
  .image-card {
    position: relative;
    margin-bottom: 8px;
  }
  .image-card__picture > img {
    width:10%;
  }
  .image-card__comment {
    position: absolute;
    bottom: 0;
    height: 52px;
    padding: 16px;
    text-align: right;
    background: rgba(0, 0, 0, 0.5);
  }
  .image-card__comment > span {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
  }

</style>
