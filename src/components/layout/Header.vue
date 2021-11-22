<template>
    <header class="header">
        <h1>mango1anchor</h1>
        <div id="nav">
            <!-- <router-link to="/">Home</router-link> | --> 
            <router-link to="/">About</router-link> |
            <router-link to="/farmersworld">Farmers World</router-link> |
            <router-link to="/spacecraftx">Space Craft X</router-link>
        </div>
    </header>
</template>

<script>
export default {
    name: "Header"
}
</script>

<style scoped>
.header{
    background: #333;
    color: #fff;
    text-align: center;
    padding: 10px;
}

.header a {
    color: #fff;
    text-decoration: none;
}

#nav {
  padding: 5px;
}

#nav a {
  font-weight: bold;
  color: #4b7096;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>