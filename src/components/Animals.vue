<template>
    <div v-if="items.length">
        <div class="header">
            <h1>Animals</h1>
            <ToggleSwitch @switch-click="autoClaimClick" />
        </div>
        <div class="animals">
            <div class="animal" :key="anm.asset_id" v-for="anm in animals">
                <img :src="$store.state.path + anmconf.filter(e => e.template_id === anm.template_id)[0].img">
                <p>{{anm.name}}</p>
                <p>{{anm.times_claimed}}/{{anmconf.filter(e => e.template_id === anm.template_id)[0].required_claims}} Claimed</p>
                <CountDown
                    @endTime="autoclaim && !hasDailyClaimed(anm) && hasMats(anm) ? emit(anm) : null"
                    :endDate="new Date(anm.next_availability * 1000)">
                    <p slot-scope="data" v-text="data.hour + ':' + data.min + ':' + data.sec"/>
                </CountDown>
                <p v-if="hasDailyClaimed(anm)" v-bind:class="{error : anm.next_availability !== 0}">Daily claim reached</p>
                <p v-if="!hasMats(anm)" v-bind:class="{error : anm.next_availability !== 0}">Missing {{anmconf.filter(e => e.template_id === anm.template_id)[0].consumed_quantity}} {{itemconf.filter(e => e.template_id === anmconf.filter(e => e.template_id === anm.template_id)[0].consumed_card)[0].name}}</p>
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

        // Does it have claimed the daily limit
        hasDailyClaimed(anm) { 
            const anmconf = this.anmconf.filter(e => e.template_id === anm.template_id)[0]

            const now = new Date()
            const firstclaim = new Date(anm.day_claims_at[0] * 1000)
            //console.log(anm.name)
            //console.log("anm.times_claimed", anm.times_claimed, "anmconf.daily_claim_limit", anmconf.daily_claim_limit, "Now", now.getUTCDay(), "First Claim", firstclaim.getUTCDay())

            if (anm.times_claimed >= anmconf.daily_claim_limit && now.getUTCDay() === firstclaim.getUTCDay())
                return true
            return false
        },

        getConsumedItems(anm){
            const anmconf = this.anmconf.filter(e => e.template_id === anm.template_id)[0]
            const item = this.itemconf.filter(e => e.template_id === anmconf.consumed_card)[0]
            return this.items.filter(e => parseInt(e.template.template_id, 10) === item.template_id)
        },

        // Does it have the required nft to claim
        hasMats(anm) {
            const anmconf = this.anmconf.filter(e => e.template_id === anm.template_id)[0]
            if (anmconf.consumed_card !== 0) {
                if(anmconf.consumed_quantity <= this.getConsumedItems(anm).length)
                    return true
                else
                    return false
            }
            return true
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
                this.$toast(e.message)
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
                this.$toast(anm.name + ' Claimed')
            } catch(e) { 
                this.$toast(e.message)
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
                this.$toast(<div>{anm.name} Claimed<br />{item.name} Burned</div>)
            } catch(e) { 
                this.$toast(e.message)
            } 
            this.refresh()
        },

        emit(anm) {
            if(!this.recentlyEmitedTransaction){
                this.recentlyEmitedTransaction = true
                const anmconf = this.anmconf.filter(e => e.template_id === anm.template_id)[0]
                if(this.hasMats(anm) && anmconf.consumed_card !== 0)
                    this.anmclaimburn(anm, this.getConsumedItems(anm)[0])
                else
                    this.anmclaim(anm)
                this.transactionTimeout()
            }
        },
        
        transactionTimeout() {
            clearTimeout(this.refreshTimeoutTransaction)
            this.refreshTimeoutTransaction = setTimeout(() => {
                this.recentlyEmitedTransaction = false
            }, 15000)
        },

        refresh() {
            clearTimeout(this.refreshTimeOut)
            this.refreshTimeOut = setTimeout(() => {
                this.getTables()
                this.$emit('recover')
                this.$emit('newItem')
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