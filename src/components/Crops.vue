<template>
    <div>
        <div class="header">
            <h1>Crops</h1>
        </div>
        <div class="crops">
            <div class="crop" :key="crop.asset_id" v-for="crop in crops">
                <img :src="path + cropconf.filter(data => data.template_id === crop.template_id)[0].img">
                <p>{{cropconf.filter(data => data.template_id === crop.template_id)[0].name}}</p>
                <p>{{crop.times_claimed}}/{{cropconf.filter(data => data.template_id === crop.template_id)[0].required_claims}} Claimed</p>
                <CountDown v-if="crop.next_availability !== 0"
                    @endTime="$emit('cropclaim', crop)"
                    :endDate="new Date((crop.next_availability) * 1000)">
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
    name: 'Crops',
    components: {
        CountDown,
    },
    props: {
        crops: {},
        cropconf: {},
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
    border-bottom: 1px solid steelblue;
    margin-bottom: 20px;
}

</style>