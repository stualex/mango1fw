<template>
  <div class="container" id="account">
    <Header title="Farmers World" @btnClick="btnClick" :loggedIn="loggedIn" />
    <div v-if="loggedIn">
      <Resources :hasTransactionEmited="hasTransactionEmited" @energyRefreshed="energyRefreshed"/>
      <Tools @recover="getEnergy" />
      <Memberships @recover="getEnergy" @newItem="getNewItem" />
      <Buildings @recover="getEnergy" />
      <Animals @recover="getEnergy" @newItem="getNewItem" />
      <Crops @recover="getEnergy" @newItem="getNewItem" /> 
      <Items :hasNewItem="hasNewItem" @itemsRefreshed="itemsRefreshed" /> 
    </div>
    <Footer />
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