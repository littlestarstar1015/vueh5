
<template>
    <div class="monitor-226-container">
        <monitor-list v-bind:monitor-datas="monitorDatas" v-bind:history-data="historyData"
                      v-if="dataview === 'info_v1'"></monitor-list>
        <detail226 class="raman-check-detail" v-bind:mdata="historyData" v-if="dataview === 'info_v226'"></detail226>
    </div>
</template>

<script>
    import monitorList from './monitor-list.vue';
    import detail226 from './detail-226.vue';
    import {bus} from '../data/websocket';

    export default {
        components: {
            monitorList, detail226
        },

        props: ['monitorDatas', 'historyData', 'dataview'],

        created: function() {
            setTimeout(() => {
                bus.$emit("show-chart-page");
            }, 200);
        }
    }


</script>