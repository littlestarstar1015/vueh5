<!--
  monitorDatas 是
-->

<template>
    <div class="monitor-list">
        <div class="monitor-item" v-for="monitorData in monitorDatas">
            <monitor-item v-bind:monitorData="monitorData"
                          v-bind:historyData="historyData" :key="monitorData.type">
            </monitor-item>
        </div>
    </div>
</template>

<script>
    import monitorItem from './monitor-item.vue';

    export default {
        components: {
            monitorItem
        },
        props: ['monitorDatas', 'historyData']
    }
</script>