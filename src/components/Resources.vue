<template>
    <div class="resource">
        <div>
            <h3>Energy</h3>
            <p>{{getEnergy()}}</p>
        </div>
        <div :key="balance" v-for="balance in account.balances">
            <h3>{{getResourceName(balance)}}</h3>
            <p>{{getResourceValue(balance)}}</p>
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

        getResourceName(balance){
            const resourceName = balance.substr(balance.indexOf(' ')+1)
            return resourceName.charAt(0).toUpperCase() + resourceName.slice(1).toLowerCase()
        },

        getResourceValue(balance){
            return parseInt(balance.substr(0,balance.indexOf(' ')))
        },

        getEnergy(){
            if ((this.account.energy / this.account.max_energy) < 0.20) {
                const foodValueInEnergy = Math.trunc(this.getResourceValue(this.account.balances[2]) * 5)
                const energyNeeded = Math.trunc(this.account.max_energy - this.account.energy)
                console.log('Can fill completely?', foodValueInEnergy > energyNeeded)
                
                if (foodValueInEnergy !== 0)
                    if (foodValueInEnergy < energyNeeded)
                        this.emit(foodValueInEnergy / 5)
                    else
                        this.emit(energyNeeded)
            }
            return this.account.energy + '/' + this.account.max_energy
        },
        
        async getTables() {
            try {
                const accountTable = await this.$store.state.wax.api.rpc.get_table_rows({
                    "json": true, 
                    "code": "farmersworld", 
                    "scope": "farmersworld", 
                    "table": "accounts",
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
                    account: "farmersworld", 
                    name: "recover", 
                    authorization: [{
                    actor: this.$store.state.wcwName,
                    permission: "active",
                    }], 
                    data: {
                    owner: this.$store.state.wcwName,
                    energy_recovered: amount,
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