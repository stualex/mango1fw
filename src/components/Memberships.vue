<template>
    <div>
        <div class="header">
            <h1>Memberships</h1>
            <ToggleSwitch @switch-click="autoClaimClick" />
        </div>
        <div class="memberships">
            <div class="membership" :key="mb.asset_id" v-for="mb in mbs">
                <img :src="$store.state.path + mbsconf.filter(data => data.template_id === mb.template_id)[0].img">
                <p>{{mbsconf.filter(data => data.template_id === mb.template_id)[0].name + ' ' + mb.type}}</p>
                <CountDown
                    @endTime="autoclaim ? emit(mb) : null"
                    :endDate="new Date(mb.next_availability * 1000)">
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
    name: 'Memberships',
    components: {
        CountDown,
        Button,
        ToggleSwitch,
    },
    data() {
        return {
            autoclaim: false,
            mbs: {},
            mbsconf: {},
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
        
        async getTables() {
            try {
                const mbsconfTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true,
                    "code": "farmersworld",
                    "scope": "farmersworld",
                    "table": "mbsconf",
                    "lower_bound": "",
                    "upper_bound": "",
                    "index_position": 1,
                    "key_type": "",
                    "limit": 100,
                    "reverse": false,
                    "show_payer": false
                })
                this.mbsconf = mbsconfTable.rows
                const mbsTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true, 
                    "code": "farmersworld", 
                    "scope": "farmersworld", 
                    "table": "mbs",
                    "lower_bound": this.$store.state.wcwName, 
                    "upper_bound": this.$store.state.wcwName, 
                    "index_position": 2,
                    "key_type": "i64",
                    "reverse": false,
                    "show_payer": false,
                })
                this.mbs = mbsTable.rows
            } catch (e) {
                this.$toast(e.message)
            }
        },

        async mbsclaim(mb) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "farmersworld", 
                    name: "mbsclaim", 
                    authorization: [{
                    actor: this.$store.state.wcwName,
                    permission: "active",
                    }], 
                    data: {
                    owner: this.$store.state.wcwName,
                    asset_id: mb.asset_id,
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                const logmbsclaim = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logmbsclaim")[0].act.data.amounts[0]
                const logbonus = res.processed.action_traces.filter(e => e.receiver === "farmersworld")[0].inline_traces.filter(e => e.receiver === "farmersworld").filter(e => e.act.name === "logbonus")[0].act.data.bonus_rewards[0]
                this.$toast(<div>Claimed {logmbsclaim} Farmer Coins<br />Bonus {logbonus}</div>)
            } catch(e) { 
                this.$toast(e.message)
            } 
            this.refresh()
        },

        emit(mb) {
            if(!this.recentlyEmitedTransaction){
                this.recentlyEmitedTransaction = true
                this.mbsclaim(mb)
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
                this.$emit('newItem')
            }, 1000)
        },
    }
}
</script>

<style scoped>

.memberships {
    text-align: center;
    margin-bottom: 20px;
}

.membership {
    max-width: 200px;
    display: inline-block;
    background: #f4f4f4;
    margin: 5px;
    padding: 5px 10px;
}

.membership img {
    height: 100%; 
    width: 100%;
    object-fit: cover;
    display: flex;
}

.membership p {
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