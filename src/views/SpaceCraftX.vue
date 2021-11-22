<template>
  <div class="container" id="account">
    <LoginHeader title="Space Miner" @btnRelog="relog" @btnClick="btnClick" :loggedIn="loggedIn" />
    <div v-if="loggedIn">
      <Resources :hasTransactionEmited="hasTransactionEmited" @energyRefreshed="energyRefreshed"/>
      <Tools @recover="getEnergy" />
    </div>
  </div>
</template>

<script>
import LoginHeader from '@/components/LoginHeader.vue'
import Resources from '@/components/spacecraftx/Resources.vue'
import Tools from '@/components/spacecraftx/Tools.vue'

export default {
  name: 'FarmersWorld',
  components: {
    LoginHeader,
    Resources,
    Tools,
  },
  data() {
    return {
      loggedIn: false,
      hasNewItem: false,
      hasTransactionEmited: false
    }
  },
  created: function () {
    this.autoLogin()
  },
  methods: {

    btnClick() {
      if(this.loggedIn)
        this.logout()
      else
        this.login()
    },

    async autoLogin() { 
      try {
        const res = new this.$store.state.waxjs.WaxJS({
          rpcEndpoint: this.$store.state.rpcList[0],
          tryAutoLogin: false
        })
        this.$store.commit('setWax', res)
        var isAutoLoginAvailable = await this.$store.state.wax.isAutoLoginAvailable()
        if (isAutoLoginAvailable) { 
          this.login()
        }
      } catch (e) {
        console.log(e)
      }
    },

    async login() { 
      try { 
        const res = new this.$store.state.waxjs.WaxJS({
          rpcEndpoint: this.$store.state.rpcList[0],
          tryAutoLogin: false
        })
        this.$store.commit('setWax', res)
        const wcwName = await this.$store.state.wax.login()
        this.$store.commit('setWcwName', wcwName)
        this.loggedIn = true
      } catch(e) { 
        console.log(e)
      } 
    },

    relog() {
      this.$store.commit('setWax', null)
      this.$store.commit('setWcwName', null)
      this.autoLogin()
    },

    logout() {
      this.$store.commit('setWax', null)
      this.$store.commit('setWcwName', null)
      this.loggedIn = false
    },

    getEnergy() {
      this.hasTransactionEmited = true
    },

    getNewItem() {
      this.hasNewItem = true
    },

    energyRefreshed() {
      this.hasTransactionEmited = false
    },
    
    itemsRefreshed() {
      this.hasNewItem = false
    }
  },
}
</script>

<style>

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