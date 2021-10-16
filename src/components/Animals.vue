<template>
    <div>
        <div class="header">
            <h1>Animals</h1>
        </div>
        <div class="animals">
            <div class="animal" :key="anm.asset_id" v-for="anm in animals">
                <img :src="path + anmconf.filter(e => e.template_id === anm.template_id)[0].img">
                <p>{{anm.name}}</p>
                <p>{{anm.times_claimed}}/{{anmconf.filter(e => e.template_id === anm.template_id)[0].required_claims}} Claimed</p>
                <CountDown v-if="anm.next_availability !== 0 && anm.day_claims_at.length !== anmconf.filter(e => e.template_id === anm.template_id)[0].daily_claim_limit"
                    @endTime="doEmit(anm)"
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
                    
export default {
    name: 'Animals',
    components: {
        CountDown,
    },
    props: {
        items: {},
        animals: {},
        anmconf: {},
        itemconf: {},
    },
    data() {
        return {
            //path: 'https://ipfs.atomichub.io/ipfs/',
            path: 'https://mypinata.cloud/ipfs/',
            recentlyEmitedBurn: false,
            refreshTimeout: null
        }
    },
    methods: {
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
                if(required.consumed_quantity <= assets.length && !this.recentlyEmitedBurn){
                    this.recentlyEmitedBurn = true
                    this.$emit('anmclaimburn', anm, assets[0])
                    this.cooldownBurn()
                }
            } else {
                this.$emit('anmclaim', anm)
            }
        },
        
        cooldownBurn() {
            clearTimeout(this.refreshTimeout)
            this.refreshTimeout = setTimeout(() => {
                this.recentlyEmitedBurn = false
            }, 30000)
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
    border-bottom: 1px solid steelblue;
    margin-bottom: 20px;
}

.error {
    color:red;
}

</style>