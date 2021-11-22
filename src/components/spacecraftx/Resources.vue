<template>
    <div class="resource">
        <div>
            <h3>Energy</h3>
            <p>{{getEnergy()}}</p>
        </div>
        <div>
            <h3>Cosmic Dust</h3>
            <p>{{getResourceValue(this.account.cosmic_dust)}}</p>
        </div>
        <div>
            <h3>Dark Matter</h3>
            <p>{{getResourceValue(this.account.dark_matter)}}</p>
        </div>
        <div>
            <h3>Waves</h3>
            <p>{{getResourceValue(this.account.waves)}}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Resources',
    props: {
        hasTransactionEmited: false,
    },
    data() {
        return {
            account: {},
            recentlyEmitedTransaction: false,
            refreshTimeout: null,
            refreshTimeoutTransaction: null
        }
    },
    created: function () {
        this.getTables()
    },
    watch: {
        hasTransactionEmited : function () {
            if(this.hasTransactionEmited){
                this.refresh()
                this.$emit('energyRefreshed')
            }
        }
    },
    methods: {

        getResourceValue(balance){
            if(balance != null)
                return parseInt(balance.quantity.substr(0,balance.quantity.indexOf(' ')))
            return 0
        },
        
        getEnergy(){
            if ((this.account.energy / 1000) < 0.15) {
                const waveValueInEnergy = this.getResourceValue(this.account.waves) * 10
                const energyNeeded = Math.trunc(1000 - this.account.energy)
                
                if (waveValueInEnergy < energyNeeded) 
                    this.emit(waveValueInEnergy)
                else
                    this.emit(energyNeeded)
            }
            return this.account.energy + '/1000'
        },
        
        async getTables() {
            try {
                const accountTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true, 
                    "code": "spacecraftxc", 
                    "scope": "spacecraftxc", 
                    "table": "users",
                    "key_type": "name",
                    "show_payer": false,
                    "reverse": false,
                    "limit": 1,
                    "index_position": 1,
                    "lower_bound": this.$store.state.wcwName, 
                    "upper_bound": this.$store.state.wcwName, 
                })
                this.account = accountTable.rows[0]
            } catch (e) {
                this.$toast(e.message)
            }
        },

        async recover(amount) {
            try {
                const res = await this.$store.state.wax.api.transact({
                actions: [{
                    account: "spacecraftxc", 
                    name: "buyenergy", 
                    authorization: [{
                        actor: this.$store.state.wcwName,
                        permission: "active",
                    }], 
                    data: {
                        owner: this.$store.state.wcwName,
                        waves_payment: amount / 10,
                    },
                }]
                }, {
                    blocksBehind: 3,
                    expireSeconds: 1200,
                })
                this.$toast('Recovered ' + amount + ' energy')
            } catch(e) { 
                this.$toast(e.message)
            } 
            this.refresh()
        },

        emit(amount) {
            if(!this.recentlyEmitedTransaction){
                this.recentlyEmitedTransaction = true
                this.recover(amount)
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
            }, 1000)
        },
    }
}
</script>

<style scoped>

.resource {
    background: #f4f4f4;
    margin: 5px;
    margin-bottom: 20px;
}

.resource div{
    display: inline-block;
    width: 25%;
    padding: 10px 20px;
}

.resource div:not(:last-child){
    border-right: 3px inset;
}

.resource div{
    display: inline-block;
    width: 25%;
    padding: 10px 20px;
}

.resource h3, .resource p {
    text-align: center;
}

</style>