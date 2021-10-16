<template>
    <div>
        <div class="header">
            <h1>Memberships</h1>
        </div>
        <div class="memberships">
            <div class="membership" :key="mb.asset_id" v-for="mb in mbs">
                <img :src="path + mbsconf.filter(data => data.template_id === mb.template_id)[0].img">
                <p>{{mbsconf.filter(data => data.template_id === mb.template_id)[0].name + ' ' + mb.type}}</p>
                <CountDown
                    @endTime="$emit('mbsclaim', mb.asset_id)"
                    :endDate="new Date((mb.next_availability) * 1000)">
                    <p slot-scope="data" v-text="data.hour + ':' + data.min + ':' + data.sec"/>
                </CountDown>
            </div>
        </div>
    </div>
</template>

<script>
import CountDown from '@/components/CountDown.vue'
import Button from '@/components/Button.vue'
                    
export default {
    name: 'Memberships',
    components: {
        CountDown,
        Button
    },
    props: {
        mbs: {},
        mbsconf: {},
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
    border-bottom: 1px solid steelblue;
    margin-bottom: 20px;
}

</style>