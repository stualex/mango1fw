import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'

import * as waxjs from "@waxio/waxjs/dist"

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

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

Vue.config.productionTip = false

Vue.prototype.$store = new Vuex.Store({
  state: {
    wcwName : null,
    wax : Object,
    waxjs : waxjs,
    path : "https://mypinata.cloud/ipfs/",
    rpcList : ['https://api.wax.greeneosio.com',
      'https://api.waxsweden.org',
      'https://wax.cryptolions.io',
      'https://wax.greymass.com',
      'https://wax.api.zenblocks.io',
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
