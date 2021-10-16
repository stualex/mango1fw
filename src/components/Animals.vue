<template>
    <div>
        <div class="header">
            <h1>Animals</h1>
            <ToggleSwitch @switch-click="autoClaimClick" />
        </div>
        <div class="animals">
            <div class="animal" :key="anm.asset_id" v-for="anm in animals">
                <img :src="$store.state.path + anmconf.filter(e => e.template_id === anm.template_id)[0].img">
                <p>{{anm.name}}</p>
                <p>{{anm.times_claimed}}/{{anmconf.filter(e => e.template_id === anm.template_id)[0].required_claims}} Claimed</p>
                <CountDown v-if="anm.next_availability !== 0 && anm.day_claims_at.length !== anmconf.filter(e => e.template_id === anm.template_id)[0].daily_claim_limit"
                    @endTime="autoclaim ? doEmit(anm) : null"
                    :endDate="new Date(anm.next_availability * 1000)">
                    <p slot-scope="data" v-text="data.hour + ':' + data.min + ':' + data.sec"/>
                </CountDown>
                <p v-else v-bind:class="{error : anm.next_availability !== 0}">{{canEat(anm)}}</p>
            </div>
        </div>
    </div>
</template>

<script>
import CountDown from '@/components/CountDown.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
                    
export default {
    name: 'Animals',
    components: {
        CountDown,
        ToggleSwitch,
    },
    data() {
        return {
            autoclaim: false,
            animals: {},
            anmconf: {},
            items: {},
            itemconf: {},
            recentlyEmitedTransaction: false,
            refreshTimeout: null,
            refreshTimeoutTransaction: null
        }
    },
    created: function () {
        this.getTables()
    },
    methods: {

        autoClaimClick(bool) {
            this.autoclaim = bool
        },

        // Can do better
        canEat(anm) { 
            const required = this.anmconf.filter(e => e.template_id === anm.template_id)[0]
            if (anm.day_claims_at.length === required.daily_claim_limit)
                return "Daily claim reached"
            if (required.consumed_card !== 0) {
                const item = this.itemconf.filter(e => e.template_id === required.consumed_card)[0]
                const assets = this.items.filter(e => parseInt(e.template.template_id, 10) === item.template_id)
                if(required.consumed_quantity > assets.length)
                    return "Missing " + required.consumed_quantity + ' ' + item.name
            }
        },

        doEmit(anm) {
            const required = this.anmconf.filter(e => e.template_id === anm.template_id)[0]
            if (required.consumed_card !== 0) {
                const item = this.itemconf.filter(e => e.template_id === required.consumed_card)[0]
                const assets = this.items.filter(e => parseInt(e.template.template_id, 10) === item.template_id)
                if(required.consumed_quantity <= assets.length && !this.recentlyEmitedTransaction){
                    this.recentlyEmitedTransaction = true
                    this.transactionTimeout()
                    this.anmclaimburn(anm, assets[0])
                }
            } else {
                anmclaim(anm)
            }
        },
        
        async getTables() {
            try {
                const anmconfTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true,
                    "code": "farmersworld",
                    "scope": "farmersworld",
                    "table": "anmconf",
                    "lower_bound": "",
                    "upper_bound": "",
                    "index_position": 1,
                    "key_type": "",
                    "limit": 100,
                    "reverse": false,
                    "show_payer": false
                })
                this.anmconf = anmconfTable.rows
                
                const animalsTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true, 
                    "code": "farmersworld", 
                    "scope": "farmersworld", 
                    "table": "animals",
                    "lower_bound": this.$store.state.wcwName, 
                    "upper_bound": this.$store.state.wcwName, 
                    "index_position": 2,
                    "key_type": "i64",
                    "reverse": false,
                    "show_payer": false,
                })
                this.animals = animalsTable.rows

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
                

                //Get FW Items
                const res = await fetch('https://wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=1000&template_blacklist=260676&collection_name=farmersworld&owner=' + this.$store.state.wcwName)
                const results = await res.json()

                const items = []
                results.data.filter(data => {
                    if(this.itemconf.find(x => x.template_id == data.template.template_id))
                        items.push(data)
                })
                this.items = items
            } catch (e) {
                console.log(e)
            }
        },

        async anmclaim(anm) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "farmersworld", 
                    name: "anmclaim", 
                    authorization: [{
                    actor: this.$store.state.wcwName,
                    permission: "active",
                    }], 
                    data: {
                    owner: this.$store.state.wcwName,
                    animal_id: anm.asset_id,
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                console.log(res)
                this.$toast(anm.name + ' Claimed')
            } catch(e) { 
                console.log(e)
            } 
            this.refresh()
        },

        async anmclaimburn(anm, item) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "atomicassets", 
                    name: "transfer", 
                    authorization: [{
                    actor: this.$store.state.wcwName,
                    permission: "active",
                    }], 
                    data: {
                    from: this.$store.state.wcwName,
                    to: "farmersworld",
                    asset_ids: [item.asset_id],
                    memo: "feed_animal:" + anm.asset_id
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                console.log(res)
                this.$toast(<div>{anm.name} Claimed<br />{item.name} Burned</div>)
            } catch(e) { 
                console.log(e)
            } 
            this.refresh()
        },
        
        transactionTimeout() {
            clearTimeout(this.refreshTimeoutTransaction)
            this.refreshTimeoutTransaction = setTimeout(() => {
                this.recentlyEmitedTransaction = false
            }, 30000)
        },

        refresh() {
            clearTimeout(this.refreshTimeOut)
            this.refreshTimeOut = setTimeout(() => {
                this.getTables()
            }, 1000)
        },
    },
}
</script>

<style scoped>

.animals {
    text-align: center;
    margin-bottom: 20px;
}

.animal {
    max-width: 200px;
    display: inline-block;
    background: #f4f4f4;
    margin: 5px;
    padding: 5px 10px;
}

.animal img {
    height: 100%; 
    width: 100%;
    object-fit: cover;
    display: flex;
}

.animal p {
    text-align: center;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid steelblue;
}

.error {
    color:red;
}

</style>