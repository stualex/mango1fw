<template>
    <div>
        <div class="header">
            <h1>Buildings</h1>
            <ToggleSwitch @switch-click="autoClaimClick" />
        </div>
        <div class="buildings">
            <div class="building" :key="bld.asset_id" v-for="bld in buildings">
                <img :src="$store.state.path + bldconf.filter(data => data.template_id === bld.template_id)[0].img">
                <p>{{bldconf.filter(data => data.template_id === bld.template_id)[0].name}}</p>
                <p>{{bld.times_claimed}}/{{bldconf.filter(data => data.template_id === bld.template_id)[0].required_claims}} Claimed</p>
                <CountDown v-if="bld.next_availability !== 0"
                    @endTime="autoclaim ? emit(bld) : null"
                    :endDate="new Date(bld.next_availability * 1000)">
                    <p slot-scope="data" v-text="data.hour + ':' + data.min + ':' + data.sec"/>
                </CountDown>
                <p v-else>Completed</p>
            </div>
        </div>
    </div>
</template>

<script>
import CountDown from '@/components/CountDown.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
                    
export default {
    name: 'Buildings',
    components: {
        CountDown,
        ToggleSwitch,
    },
    data() {
        return {
            autoclaim: false,
            buildings: {},
            bldconf: {},
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
                const bldconfTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true,
                    "code": "farmersworld",
                    "scope": "farmersworld",
                    "table": "bldconf",
                    "lower_bound": "",
                    "upper_bound": "",
                    "index_position": 1,
                    "key_type": "",
                    "limit": 100,
                    "reverse": false,
                    "show_payer": false
                })
                this.bldconf = bldconfTable.rows
                
                const buildingsTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true, 
                    "code": "farmersworld", 
                    "scope": "farmersworld", 
                    "table": "buildings",
                    "lower_bound": this.$store.state.wcwName, 
                    "upper_bound": this.$store.state.wcwName, 
                    "index_position": 2,
                    "key_type": "i64",
                    "reverse": false,
                    "show_payer": false,
                })
                this.buildings = buildingsTable.rows
            } catch (e) {
                this.$toast(e.message)
            }
        },

        async bldclaim(bld) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "farmersworld", 
                    name: "bldclaim", 
                    authorization: [{
                    actor: this.$store.state.wcwName,
                    permission: "active",
                    }], 
                    data: {
                    owner: this.$store.state.wcwName,
                    asset_id: bld.asset_id,
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                
                this.$toast(bld.name + ' claimed')
            } catch(e) { 
                this.$toast(e.message)
            }
        },

        emit(bld) {
            if(!this.recentlyEmitedTransaction){
                this.recentlyEmitedTransaction = true
                this.bldclaim(bld)
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

.buildings {
    text-align: center;
    margin-bottom: 20px;
}

.building {
    max-width: 200px;
    display: inline-block;
    background: #f4f4f4;
    margin: 5px;
    padding: 5px 10px;
}

.building img {
    height: 100%; 
    width: 100%;
    object-fit: cover;
    display: flex;
}

.building p {
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