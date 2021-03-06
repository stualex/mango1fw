import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'

import * as waxjs from "@waxio/waxjs/dist"

import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

import VueGtag from "vue-gtag"

Vue.use(Vuex)

Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
  position: "top-right",
  timeout: 15000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
})

Vue.use(VueGtag, {
  config: { id: "G-5DHGWB2J8T" }
})

Vue.config.productionTip = false

Vue.prototype.$store = new Vuex.Store({
  state: {
    wcwName : null,
    wax : Object,
    waxjs : waxjs,
    path : "https://mypinata.cloud/ipfs/",
    rpcList : ['https://wax.eosphere.io',
      'https://wax.pink.gg',
      'https://wax.dapplica.io',
      'https://api.waxsweden.org',
      'https://api.wax.greeneosio.com',
      'https://wax.cryptolions.io',
      'https://wax.greymass.com',
    ]
  },
  mutations: {
    setWcwName(state, wcwName) {
      state.wcwName = wcwName
    },
    setWax(state, wax) {
      state.wax = wax
    }
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
