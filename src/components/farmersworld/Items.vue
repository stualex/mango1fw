<template>
    <div>
        <div class="header">
            <h1>Items</h1>
        </div>
        <div class="items">
            <div class="item" :key="item.template_id" v-for="item in itemconf">
                <img :src="$store.state.path + item.img">
                <p>{{item.name}}</p>
                <p>Assets : {{items.filter(e => parseInt(e.template.template_id, 10) === item.template_id).length}}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Items',
    props: {
        hasNewItem: false,
    },
    data() {
        return {
            items: new Array(),
            itemconf: {},
            refreshTimeOut: null,
        }
    },
    created: function () {
        this.getTables()
    },
    watch: {
        hasNewItem : function () {
            if(this.hasNewItem){
                this.refresh()
                this.$emit('itemsRefreshed')
            }
        }
    },
    methods: {
        
        async getTables() {
            try {
                const itemconfTable = await this.$store.state.wax.api.rpc.get_table_rows({
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

                //Adding Farmer Coins
                this.itemconf.push({
                    can_burn: 0,
                    img: "Qmam1XbS4Z3SNU1hZzZNNtV1o4V4hpAeRwCZ4nk1YMuech",
                    name: "Farmer Coins",
                    schema_name: "farmercoins",
                    template_id: 260676
                })
                
                //Get FW Items
                const res = await fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=5000&collection_name=farmersworld&owner=' + this.$store.state.wcwName)
                const results = await res.json()

                const items = []
                results.data.filter(data => {
                    if(this.itemconf.find(x => x.template_id == data.template.template_id))
                        items.push(data)
                })

                this.items = items
            } catch (e) {
                this.$toast(e.message)
            }
        },

        refresh() {
            clearTimeout(this.refreshTimeOut)
            this.refreshTimeOut = setTimeout(() => {
                this.getTables()
            }, 1000)
        },
    }
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid steelblue;
}

</style>