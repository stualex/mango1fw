<template>
    <div>
        <div class="header">
            <h1>Items</h1>
        </div>
        <div class="items">
            <div class="item" :key="item.template_id" v-for="item in itemconf">
                <img :src="path + item.img">
                <p>{{item.name}}</p>
                <p>Assets : {{items.filter(e => parseInt(e.template.template_id, 10) === item.template_id).length}}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Items',
    components: {
    },
    props: {
        items: {},
        itemconf: {},
    },
    data() {
        return {
            //path: 'https://ipfs.atomichub.io/ipfs/',
            path: 'https://mypinata.cloud/ipfs/',
        }
    },
}
</script>

<style scoped>

.items {
    text-align: center;
    margin-bottom: 20px;
}

.item {
    max-width: 200px;
    display: inline-block;
    background: #f4f4f4;
    margin: 5px;
    padding: 5px 10px;
}

.item img {
    height: 100%; 
    width: 100%;
    object-fit: cover;
    display: flex;
}

.item p {
    text-align: center;
}

.header {
    border-bottom: 1px solid steelblue;
    margin-bottom: 20px;
}

</style>