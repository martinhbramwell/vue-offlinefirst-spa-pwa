<template>
  <div v-if="isDebug" id="pauth">
    <b-collapse id="divTbl" :open="false">
      <button class="button is-small is-primary" slot="trigger">Authorizations Tester</button>
      <div>
        <table id="axsCtrl" class="table is-narrow is-hoverable is-size-6">

          <thead>
            <tr>
              <th id="colRsrc">Resource</th>
              <th id="colPrvlg">Privilege</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, key, index) in getUserPermissions">
              <th id="colRsrc" class="is-size-7">{{ key }}</th>
              <td id="colPrvlg">
                <b-field>
                  <b-select :id="key" class="is-size-7" :placeholder="axsLvls[0].axs" @change.native="updPermissions" v-model="user.permissions[key]">

                    <option v-for="l in axsLvls" :value="l.id" :key="l.id">
                     {{ l.axs }}
                    </option>

                  </b-select>
                </b-field>
              </td>
            </tr>
          </tbody>

          <tfoot class="is-hidden">
            <tr>
              <th id="colRsrc">Resource</th>
              <th id="colPrvlg">Privilege</th>
            </tr>
          </tfoot>

        </table>
      </div>
    </b-collapse>

{{ getUserPermissions }}

  </div>
</template>


<script>

  import { mapActions, mapState, mapGetters } from 'vuex';
  // import { mapMutations, mapState } from 'vuex';
  import { Levels as accessLevels } from '@/accessControl';

  const LG = console.log; // eslint-disable-line no-console, no-unused-vars

  export default {
    data() {
      return {
        axsLvls: accessLevels.olvls,
        axsLvl: { Example: 0, Person: 3 },
        role: 'admin',
      };
    },
    computed: {
      ...mapState('a12n', ['domains', 'user']),
      ...mapGetters('a12n', ['getUserPermissions']),
      ...mapGetters({
        isDebug: 'isDebug',
      }),
    },
    methods: {
      ...mapActions('a12n', [
        // 'changeRole',
        'changePermissions',
      ]),
      onRoleChange() {
        LG(`================================ ${this.domains}`);
        this.changeRole(this.role);
      },
      updPermissions(e) {
        this.changePermissions({
          change: {
            resource: e.target.id,
            setting: e.target.value,
          },
          ability: this.$ability,
        });
      },
    },
  };

</script>

<style scoped>

  #pauth {
    text-align: center;
  }

  #divTbl {
    width: 100%;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  #axsCtrl {
    width: 70%;
    margin: 0 auto;
    background-color: rgba(0, 0, 0, 0.05);
  }

  #colRsrc {
    text-align: right;
    vertical-align: bottom;
    padding-bottom: 8px;
  }
  #colPrvlg {
    text-align: left;
    padding-left: 18px;
  }
</style>
