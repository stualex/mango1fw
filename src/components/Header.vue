<template>
  <header>
    <h1>{{ title }}</h1>
    <Button @btn-click="$emit('toggleConnect')"
      :text="account.account ? account.account : 'Login'"
      :color="account.account ? 'red' : 'green'"
    />
  </header>
</template>

<script>
import Button from './Button'

export default {
  name: 'Header',
  props: {
    title: String,
    account: {}
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