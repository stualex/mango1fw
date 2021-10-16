<template>
  <div>
    <div class="container" id="account">
      <Header title="Farmers World" :account="account"
        @toggleConnect="toggleConnect" />
      <Resources v-if="account.balances" :account="account" 
        @recover="recover" />
      <Tools v-if="tools" :tools="tools" :toolconfs="toolconfs" 
        @claim="claim"
        @repair="repair" />
      <Memberships v-if="mbs" :mbs="mbs" :mbsconf="mbsconf" 
        @mbsclaim="mbsclaim" />
      <Buildings v-if="buildings" :buildings="buildings" :bldconf="bldconf" 
        @bldclaim="bldclaim"/>
      <Animals v-if="animals" :animals="animals" :anmconf="anmconf" :items="items" :itemconf="itemconf"
        @anmclaim="anmclaim" @anmclaimburn="anmclaimburn" />
      <Crops v-if="crops" :crops="crops" :cropconf="cropconf" 
        @cropclaim="cropclaim"/> 
      <Items :items="items" :itemconf="itemconf" /> 
      <Footer />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Resources from '@/components/Resources.vue'
import Tools from '@/components/Tools.vue'
import Memberships from '@/components/Memberships.vue'
import Buildings from '@/components/Buildings.vue'
import Animals from '@/components/Animals.vue'
import Crops from '@/components/Crops.vue'
import Items from '@/components/Items.vue'
import Footer from '@/components/Footer.vue'
import * as waxjs from "@waxio/waxjs/dist"

export default {
  name: 'App',
  components: {
    Header,
    Resources,
    Tools,
    Memberships,
    Buildings,
    Animals,
    Crops,
    Items,
    Footer,
  },
  data() {
    return {
      wax: Object,
      wcwName: String,
      autoClaim : true,
      rpcList: ['https://wax.greymass.com',
        'https://wax.cryptolions.io',
        'https://api.waxsweden.org',
        'https//wax.api.zenblocks.io',
        'https://api.wax.greeneosio.com',
        ],
      account: {},
      items: new Array(),
      tools: {},
      mbs: {},
      buildings: {},
      animals: {},
      crops: {},
      toolconfs: {},
      mbsconf: {},
      bldconf: {},
      anmconf: {},
      cropconf: {},
      itemconf: {},
      refreshTimeOut: null,
    }
  },
  created: function () {
    this.autoLogin()
  },
  methods: {

    async toggleConnect() {
      this.login()
    },

    async autoLogin() { 
      try {
        this.wax = new waxjs.WaxJS({
          rpcEndpoint: this.rpcList[0],
          tryAutoLogin: false
        })
        var isAutoLoginAvailable = await this.wax.isAutoLoginAvailable();
        if (isAutoLoginAvailable) { 
          await this.login()
        }
      } catch (e) {
        console.log(e)
      }
    },

    async login() { 
      try { 
        this.wcwName = await this.wax.login()
        this.getTables()
      } catch(e) { 
        console.log(e)
      } 
    },

    async claim(assetId) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "farmersworld", 
            name: "claim", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              owner: this.wcwName,
              asset_id: assetId,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        const logclaim = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logclaim")[0].act.data.rewards[0]
        const logbonus = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logbonus")[0].act.data.bonus_rewards[0]
        this.$toast(<div>Claimed {logclaim}<br />Bonus {logbonus}</div>)
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async mbsclaim(assetId) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "farmersworld", 
            name: "mbsclaim", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              owner: this.wcwName,
              asset_id: assetId,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        const logmbsclaim = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logmbsclaim")[0].act.data.amounts[0]
        const logbonus = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logbonus")[0].act.data.bonus_rewards[0]
        this.$toast(<div>Claimed {logmbsclaim} Farmer Coins<br />Bonus {logbonus}</div>)
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async bldclaim(bld) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "farmersworld", 
            name: "bldclaim", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              owner: this.wcwName,
              asset_id: bld.asset_id,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        this.$toast(bld.name + ' claimed')
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async anmclaim(anm) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "farmersworld", 
            name: "anmclaim", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              owner: this.wcwName,
              animal_id: anm.asset_id,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        this.$toast(anm.name + ' Claimed')
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async anmclaimburn(anm, item) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "atomicassets", 
            name: "transfer", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              from: this.wcwName,
              to: "farmersworld",
              asset_ids: [item.asset_id],
              memo: "feed_animal:" + anm.asset_id
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        this.$toast(<div>{anm.name} Claimed<br />{item.name} Burned</div>)
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async cropclaim(crop) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "farmersworld", 
            name: "cropclaim", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              owner: this.wcwName,
              crop_id: crop.asset_id,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        this.$toast(crop.name + ' Claimed')
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async repair(tool) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "farmersworld", 
            name: "repair", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              asset_owner: this.wcwName,
              asset_id: tool.asset_id,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        this.$toast(this.toolconfs.filter(e => e.template_id === tool.template_id)[0].template_name + ' Repaired')
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async recover(amount) {
      try {
        const res = await this.wax.api.transact({
          actions: [{
            account: "farmersworld", 
            name: "recover", 
            authorization: [{
              actor: this.wcwName,
              permission: "active",
            }], 
            data: {
              owner: this.wcwName,
              energy_recovered: amount,
            },
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 1200,
        })
        console.log(res)
        this.$toast('Recovered ' + amount + ' energy')
      } catch(e) { 
        console.log(e)
      } 
      this.refresh()
    },

    async getTables() { 
      try {

        //Gets Configs
        const accountTable = await this.wax.api.rpc.get_table_rows({
          "json": true, 
          "code": "farmersworld", 
          "scope": "farmersworld", 
          "table": "accounts",
          "lower_bound": this.wcwName, 
          "upper_bound": this.wcwName, 
          })
        this.account = accountTable.rows[0]

        const toolconfsTable = await this.wax.api.rpc.get_table_rows({
          "json": true,
          "code": "farmersworld",
          "scope": "farmersworld",
          "table": "toolconfs",
          "lower_bound": "",
          "upper_bound": "",
          "index_position": 1,
          "key_type": "",
          "limit": 100,
          "reverse": false,
          "show_payer": false
          })
        this.toolconfs = toolconfsTable.rows

        const mbsconfTable = await this.wax.api.rpc.get_table_rows({
          "json": true,
          "code": "farmersworld",
          "scope": "farmersworld",
          "table": "mbsconf",
          "lower_bound": "",
          "upper_bound": "",
          "index_position": 1,
          "key_type": "",
          "limit": 100,
          "reverse": false,
          "show_payer": false
          })
        this.mbsconf = mbsconfTable.rows
        
        const bldconfTable = await this.wax.api.rpc.get_table_rows({
          "json": true,
          "code": "farmersworld",
          "scope": "farmersworld",
          "table": "bldconf",
          "lower_bound": "",
          "upper_bound": "",
          "index_position": 1,
          "key_type": "",
          "limit": 100,
          "reverse": false,
          "show_payer": false
          })
        this.bldconf = bldconfTable.rows
        
        const anmconfTable = await this.wax.api.rpc.get_table_rows({
          "json": true,
          "code": "farmersworld",
          "scope": "farmersworld",
          "table": "anmconf",
          "lower_bound": "",
          "upper_bound": "",
          "index_position": 1,
          "key_type": "",
          "limit": 100,
          "reverse": false,
          "show_payer": false
          })
        this.anmconf = anmconfTable.rows
        
        const cropconfTable = await this.wax.api.rpc.get_table_rows({
          "json": true,
          "code": "farmersworld",
          "scope": "farmersworld",
          "table": "cropconf",
          "lower_bound": "",
          "upper_bound": "",
          "index_position": 1,
          "key_type": "",
          "limit": 100,
          "reverse": false,
          "show_payer": false
          })
        this.cropconf = cropconfTable.rows
        
        const itemconfTable = await this.wax.api.rpc.get_table_rows({
          "json": true,
          "code": "farmersworld",
          "scope": "farmersworld",
          "table": "itemconf",
          "lower_bound": "",
          "upper_bound": "",
          "index_position": 1,
          "key_type": "",
          "limit": 100,
          "reverse": false,
          "show_payer": false
          })
        this.itemconf = itemconfTable.rows

        //Gets Tables
        const toolsTable = await this.wax.api.rpc.get_table_rows({
          "json": true, 
          "code": "farmersworld", 
          "scope": "farmersworld", 
          "table": "tools",
          "lower_bound": this.wcwName, 
          "upper_bound": this.wcwName, 
          "index_position": 2,
          "key_type": "i64",
          "reverse": false,
          "show_payer": false,
          })
        this.tools = toolsTable.rows
        
        const mbsTable = await this.wax.api.rpc.get_table_rows({
          "json": true, 
          "code": "farmersworld", 
          "scope": "farmersworld", 
          "table": "mbs",
          "lower_bound": this.wcwName, 
          "upper_bound": this.wcwName, 
          "index_position": 2,
          "key_type": "i64",
          "reverse": false,
          "show_payer": false,
          })
        this.mbs = mbsTable.rows
        
        const buildingsTable = await this.wax.api.rpc.get_table_rows({
          "json": true, 
          "code": "farmersworld", 
          "scope": "farmersworld", 
          "table": "buildings",
          "lower_bound": this.wcwName, 
          "upper_bound": this.wcwName, 
          "index_position": 2,
          "key_type": "i64",
          "reverse": false,
          "show_payer": false,
          })
        this.buildings = buildingsTable.rows
        
        const animalsTable = await this.wax.api.rpc.get_table_rows({
          "json": true, 
          "code": "farmersworld", 
          "scope": "farmersworld", 
          "table": "animals",
          "lower_bound": this.wcwName, 
          "upper_bound": this.wcwName, 
          "index_position": 2,
          "key_type": "i64",
          "reverse": false,
          "show_payer": false,
          })
        this.animals = animalsTable.rows
        
        const cropsTable = await this.wax.api.rpc.get_table_rows({
          "json": true, 
          "code": "farmersworld", 
          "scope": "farmersworld", 
          "table": "crops",
          "lower_bound": this.wcwName, 
          "upper_bound": this.wcwName, 
          "index_position": 2,
          "key_type": "i64",
          "reverse": false,
          "show_payer": false,
          })
        this.crops = cropsTable.rows

        //Get FW Items
        const res = await fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=1000&template_blacklist=260676&collection_name=farmersworld&owner=' + this.wcwName)
        const results = await res.json()

        const items = []
        results.data.filter(data => {
          if(this.itemconf.find(x => x.template_id == data.template.template_id))
            items.push(data)
        })
        this.items = items
        
      } catch (e) {
        //console.log(e)
      }
    },

    refresh() {
      clearTimeout(this.refreshTimeOut)
      this.refreshTimeOut = setTimeout(() => {
        this.getTables()
      }, 1000)
    },
  },
}
</script>

<style>

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', sans-serif;
}

h1 {
  margin: 5px;
}

.container {
  max-width: 1500px;
  overflow: auto;
  margin: 30px auto;
  min-height: 300px;
  border: 1px solid steelblue;
  padding: 30px;
  border-radius: 5px;
}

.btn {
  display: inline-block;
  background: #000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  font-size: 15px;
  font-family: inherit;
}

.btn:focus {
  outline: none;
}

.btn:active {
  transform: scale(0.98);
}

.btn-block {
  display: block;
  width: 100%;
}

</style>