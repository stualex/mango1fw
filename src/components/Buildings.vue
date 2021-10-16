<template>
    <div>
        <div class="header">
            <h1>Buildings</h1>
        </div>
        <div class="buildings">
            <div class="building" :key="bld.asset_id" v-for="bld in buildings">
                <img :src="path + bldconf.filter(data => data.template_id === bld.template_id)[0].img">
                <p>{{bldconf.filter(data => data.template_id === bld.template_id)[0].name}}</p>
                <p>{{bld.times_claimed}}/{{bldconf.filter(data => data.template_id === bld.template_id)[0].required_claims}} Claimed</p>
                <CountDown v-if="bld.next_availability !== 0"
                    @endTime="$emit('bldclaim', bld)"
                    :endDate="new Date((bld.next_availability) * 1000)">
                    <p slot-scope="data" v-text="data.hour + ':' + data.min + ':' + data.sec"/>
                </CountDown>
                <p v-else>Completed</p>
            </div>
        </div>
    </div>
</template>

<script>
import CountDown from '@/components/CountDown.vue'
                    
export default {
    name: 'Buildings',
    components: {
        CountDown,
    },
    props: {
        buildings: {},
        bldconf: {},
    },
    data() {
        return {
            //path: 'https://ipfs.atomichub.io/ipfs/',
            path: 'https://mypinata.cloud/ipfs/',
        }
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
    border-bottom: 1px solid steelblue;
    margin-bottom: 20px;
}

</style>