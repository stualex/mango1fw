<template>
  <header>
    <h1 v-if="loggedIn">{{ title + ' ' + $store.state.wcwName }}</h1>
    <h1 v-else>{{ title }}</h1>
    <!-- Comment <Button @btn-click="$emit('btnRelog')"
      :text="'Relog'" /> --> 
    <Button @btn-click="$emit('btnClick')"
      :text="loggedIn ? 'Logout' : 'Login'"
      :color="loggedIn ? 'red' : 'green'"
    />
  </header>
</template>

<script>
import Button from '@/components/Button.vue'

export default {
  name: 'LoginHeader',
  props: {
    title: String,
    loggedIn: Boolean
  },
  components: {
    Button,
  },
}
</script>

<style scoped>

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid steelblue;
}

</style>