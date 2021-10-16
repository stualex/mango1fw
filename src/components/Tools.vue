<template>
    <div>
        <div class="header">
            <h1>Tools</h1>
        </div>
        <div class="tools">
            <div class="tool" :key="tool.asset_id" v-for="tool in tools">
                <img :src="path + toolconfs.filter(data => data.template_id === tool.template_id)[0].img">
                <p>{{getDurability(tool)}}</p>
                <CountDown
                    @endTime="$emit('claim', tool.asset_id)"
                    :endDate="new Date(tool.next_availability * 1000)">
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
    name: 'Tools',
    components: {
        CountDown,
        Button
    },
    props: {
        tools: {},
        toolconfs: {},
    },
    emits: ['repair'],
    data() {
        return {
            //path: 'https://ipfs.atomichub.io/ipfs/',
            path: 'https://mypinata.cloud/ipfs/',
        }
    },
    methods: {
        getDurability(tool) {
            console.log
            if (tool.current_durability === 0 )
                this.$emit('repair', tool)
            return tool.current_durability + '/' + tool.durability
        }
    }
}
</script>

<style scoped>

.tools {
    text-align: center;
    margin-bottom: 20px;
}

.tool {
    max-width: 200px;
    display: inline-block;
    background: #f4f4f4;
    margin: 5px;
    padding: 5px 10px;
}

.tool img {
    height: 100%; 
    width: 100%;
    object-fit: cover;
    display: flex;
}

.tool p {
    text-align: center;
}

.header {
    border-bottom: 1px solid steelblue;
    margin-bottom: 20px;
}

</style>