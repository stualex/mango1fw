<template>
    <div>
        <div class="header">
            <h1>Tools</h1>
            <ToggleSwitch @switch-click="autoClaimClick"/>
        </div>
        <div class="tools">
            <div class="tool" :key="tool.asset_id" v-for="tool in tools">
                <img :src="$store.state.path + toolconfs.filter(data => data.template_id === tool.template_id)[0].img">
                <p>{{showDurability(tool)}}</p>
                <CountDown
                    @endTime="autoclaim ? emitClaim(tool) : null"
                    :endDate="new Date(tool.next_availability * 1000)">
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
            if (tool.current_durability === 0 && this.autoclaim)
                this.emitRepair(tool)
            return tool.current_durability + '/' + tool.durability
        },
        
        async getTables() {
            try {
                const toolconfsTable = await this.$store.state.wax.api.rpc.get_table_rows({
                "json": true,
                "code": "farmersworld",
                "scope": "farmersworld",
                "table": "toolconfs",
                "lower_bound": "",
                "upper_bound": "",
                "index_position": 1,
                "key_type": "",
                "limit": 100,
                "reverse": false,
                "show_payer": false
                })
                this.toolconfs = toolconfsTable.rows

                const toolsTable = await this.$store.state.wax.api.rpc.get_table_rows({
                "json": true, 
                "code": "farmersworld", 
                "scope": "farmersworld", 
                "table": "tools",
                "lower_bound": this.$store.state.wcwName, 
                "upper_bound": this.$store.state.wcwName, 
                "index_position": 2,
                "key_type": "i64",
                "reverse": false,
                "show_payer": false,
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
                    account: "farmersworld", 
                    name: "claim", 
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
                const logclaim = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logclaim")[0].act.data.rewards[0]
                const logbonus = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logbonus")[0].act.data.bonus_rewards[0]
                this.$toast(<div>Claimed {logclaim}<br />Bonus {logbonus}</div>)
            } catch(e) { 
                //{"errors":[{"error_type":"Request validation error","message":"Session token required in header","error_code":"0"}]}
                console.log(e)
            }
        },

        async repair(tool) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "farmersworld", 
                    name: "repair", 
                    authorization: [{
                    actor: this.$store.state.wcwName,
                    permission: "active",
                    }], 
                    data: {
                    asset_owner: this.$store.state.wcwName,
                    asset_id: tool.asset_id,
                    },
                }]
                }, {
                blocksBehind: 3,
                expireSeconds: 1200,
                })
                this.$toast(this.toolconfs.filter(e => e.template_id === tool.template_id)[0].template_name + ' Repaired')
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