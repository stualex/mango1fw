<template>
    <div class="resource">
        <div>
            <h3>Energy</h3>
            <p>{{getEnergy()}}</p>
        </div>
        <div>
            <h3>Wood</h3>
            <p>{{filterNumber(account.balances[0])}}</p>
        </div>
        <div>
            <h3>Gold</h3>
            <p>{{filterNumber(account.balances[1])}}</p>
        </div>
        <div>
            <h3>Food</h3>
            <p>{{filterNumber(account.balances[2])}}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Resources',
    props: {
        account: {}
    },
    emits: ['recover'],
    methods: {
        filterNumber(value){
            return value.match(/(\d+)/)[0]
        },
        getEnergy(){
            if ((this.account.energy / this.account.max_energy) < 0.20) {
                const amount = Math.trunc(this.account.max_energy - this.account.energy)
                this.$emit('recover', amount)
            }
            return this.account.energy + '/' + this.account.max_energy
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