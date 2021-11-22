<template>
    <div>
        <div class="header">
            <h1>Tools</h1>
            <ToggleSwitch @switch-click="autoClaimClick"/>
        </div>
        <div class="tools">
            <div class="tool" :key="tool.asset_id" v-for="tool in tools">
                <!-- Can't get the tool img path, so this is a work around while having the nfts in website assets -->
                <!-- <img :src="$store.state.path + toolconfs.filter(data => data.template_id === tool.template_id)[0].img"> -->
                <img :src="require(`@/assets/${tool.template_id}.png`)">
                <p>{{showDurability(tool)}}</p>
                <CountDown
                    @endTime="autoclaim ? emitClaim(tool) : null"
                    :endDate="getNextAvailability(tool)">
                    <p slot-scope="data" v-text="data.hour + ':' + data.min + ':' + data.sec"/>
                </CountDown>
            </div>
        </div>
    </div>
</template>

<script>
import CountDown from '@/components/CountDown.vue'
import Button from '@/components/Button.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
                    
export default {
    name: 'Tools',
    components: {
        CountDown,
        Button,
        ToggleSwitch,
    },
    data() {
        return {
            autoclaim: false,
            tools: {},
            toolconfs: {},
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

        showDurability(tool) {
            if (tool.strength_usage > tool.strength && this.autoclaim)
                this.emitRepair(tool)
            return tool.strength + '/' + tool.basic_strength
        },

        getNextAvailability(tool){
            //Add Z for UTC
            const next_availability = new Date(Date.parse(tool.last_claim_time+'Z'))
            next_availability.setHours(next_availability.getHours() + 1)
            return next_availability
        },
        
        async getTables() {
            try {
                const toolsTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true, 
                    "code": "spacecraftxc",
                    "table": "stakedassets",
                    "key_type": "i64",
                    "index_position": 1,
                    "limit": 1000,
                    "reverse": false,
                    "show_payer": false,
                    "scope": this.$store.state.wcwName, 
                })
                this.tools = toolsTable.rows
            } catch (e) {
                this.$toast(e.message)
            }
        },

        async claim(tool) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "spacecraftxc", 
                    name: "getreward", 
                    authorization: [{
                        actor: this.$store.state.wcwName,
                        permission: "active",
                    }], 
                    data: {
                        owner: this.$store.state.wcwName,
                        asset_id: tool.asset_id,
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                this.$toast('Tool ' + tool.template_id + ' Claimed')
            } catch(e) { 
                console.log(e)
            }
        },

        async repair(tool) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "spacecraftxc", 
                    name: "repairasset", 
                    authorization: [{
                        actor: this.$store.state.wcwName,
                        permission: "active",
                    }], 
                    data: {
                        owner: this.$store.state.wcwName,
                        asset_id: tool.asset_id,
                        dark_matter_payment: ((tool.basic_strength - tool.strength) / 10) * 10000
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                this.$toast('Tool ' + tool.template_id + ' Repaired')
            } catch(e) { 
                console.log(e)
            }
        },

        emitClaim(tool) {
            if(!this.recentlyEmitedTransaction){
                this.recentlyEmitedTransaction = true
                this.claim(tool)
                this.refresh()
                this.transactionTimeout()
            }
        },

        emitRepair(tool) {
            if(!this.recentlyEmitedTransaction){
                this.recentlyEmitedTransaction = true
                this.repair(tool)
                this.refresh()
                this.transactionTimeout()
            }
        },
        
        transactionTimeout() {
            clearTimeout(this.refreshTimeoutTransaction)
            this.refreshTimeoutTransaction = setTimeout(() => {
                this.recentlyEmitedTransaction = false
            }, 5000)
        },

        refresh() {
            clearTimeout(this.refreshTimeout)
            this.refreshTimeout = setTimeout(() => {
                this.getTables()
                this.$emit('recover')
            }, 1000)
        },
    }
}
</script>

<style scoped>

.tools {
    text-align: center;
    margin-bottom: 20px;
}

.tool {
    max-width: 200px;
    display: inline-block;
    background: #f4f4f4;
    margin: 5px;
    padding: 5px 10px;
}

.tool img {
    height: 100%; 
    width: 100%;
    object-fit: cover;
    display: flex;
}

.tool p {
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