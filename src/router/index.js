import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'

Vue.use(VueRouter)

const routes = [
  /*{
    path: '/',
    name: 'Home',
    component: Home
  },*/
  {
    path: '/farmersworld',
    name: 'FarmersWorld',
    component: () => import('@/views/FarmersWorld.vue')
  },
  {
    path: '/spacecraftx',
    name: 'SpaceCraftX',
    component: () => import('@/views/SpaceCraftX.vue')
  },
  {
    path: '/',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
  }
]

const router = new VueRouter({
  //mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.name;
  next();
});

export default router
