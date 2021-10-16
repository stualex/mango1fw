<template>
    <div>
        <div class="header">
            <h1>Crops</h1>
            <ToggleSwitch @switch-click="autoClaimClick" />
        </div>
        <div class="crops">
            <div class="crop" :key="crop.asset_id" v-for="crop in crops">
                <img :src="$store.state.path + cropconf.filter(data => data.template_id === crop.template_id)[0].img">
                <p>{{cropconf.filter(data => data.template_id === crop.template_id)[0].name}}</p>
                <p>{{crop.times_claimed}}/{{cropconf.filter(data => data.template_id === crop.template_id)[0].required_claims}} Claimed</p>
                <CountDown v-if="crop.next_availability !== 0"
                    @endTime="autoclaim ? cropclaim(crop) : null"
                    :endDate="new Date(crop.next_availability * 1000)">
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
    name: 'Crops',
    components: {
        CountDown,
        ToggleSwitch,
    },
    data() {
        return {
            autoclaim: false,
            crops: {},
            cropconf: {},
            refreshTimeOut: null,
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
                const cropconfTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true,
                    "code": "farmersworld",
                    "scope": "farmersworld",
                    "table": "cropconf",
                    "lower_bound": "",
                    "upper_bound": "",
                    "index_position": 1,
                    "key_type": "",
                    "limit": 100,
                    "reverse": false,
                    "show_payer": false
                })
                this.cropconf = cropconfTable.rows
        
                const cropsTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true, 
                    "code": "farmersworld", 
                    "scope": "farmersworld", 
                    "table": "crops",
                    "lower_bound": this.$store.state.wcwName, 
                    "upper_bound": this.$store.state.wcwName, 
                    "index_position": 2,
                    "key_type": "i64",
                    "reverse": false,
                    "show_payer": false,
                })
                this.crops = cropsTable.rows
            } catch (e) {
                console.log(e)
            }
        },

        async cropclaim(crop) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "farmersworld", 
                    name: "cropclaim", 
                    authorization: [{
                    actor: this.$store.state.wcwName,
                    permission: "active",
                    }], 
                    data: {
                    owner: this.$store.state.wcwName,
                    crop_id: crop.asset_id,
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                
                this.$toast(crop.name + ' Claimed')
            } catch(e) { 
                console.log(e)
            } 
            this.refresh()
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

.crops {
    text-align: center;
    margin-bottom: 20px;
}

.crop {
    max-width: 200px;
    display: inline-block;
    background: #f4f4f4;
    margin: 5px;
    padding: 5px 10px;
}

.crop img {
    height: 100%; 
    width: 100%;
    object-fit: cover;
    display: flex;
}

.crop p {
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