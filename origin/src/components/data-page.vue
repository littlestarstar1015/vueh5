
<template>
    <div class="data-view">
        <div class="monitor-title">
            当前监测点:<span>{{activePoint.pointName}}</span> <a class="pull-right" @click="back2main">返回</a>
        </div>
        <monitor-list v-bind:monitor-datas="monitorDatas" v-bind:history-data="historyData"
                      v-if="dataview === '308_v1'"></monitor-list>
        <monitor226 v-bind:monitor-datas="historyData" v-if="dataview === '226_v1'"></monitor226>
    </div>
</template>

<script>
    import monitorList from './monitor-list.vue';
    import monitor226 from './monitor-226.vue';
    import {bus} from '../data/websocket';
    import {getMonitorDatas} from '../data/data-util';
    import {loadInitChartData} from '../data/dataproxy';

    export default {
        components: {
            monitorList, monitor226
        },

        data: function() {
            return {
                'monitorDatas': null,
                'historyData': null,
                'dataview': null
            }
        },
        props: ['activePoint'],

        methods: {
            'back2main': function() {
                this.$emit('viewchange', "main");
                if (this.backDog) {
                    clearTimeout(this.backDog);
                    this.backDog = null;
                }
            }
        },

        watch: {
            "activePoint": function() {
                init(this.$props.activePoint, this.$data);
            }
        },

        mounted: function() {
            bus.$on("monitor-data", (serverRealtimeData) => {
                if (this.$props.activePoint
                    && serverRealtimeData.monitorPoint === this.$props.activePoint.pointId
                    && handlers[serverRealtimeData.model]) {
                    // 有对应deviceModel的处理器，则处理。
                    handlers[serverRealtimeData.model](serverRealtimeData, this.$data.monitorDatas, this.$data.historyData);
                }
            });
            init(this.$props.activePoint, this.$data);

            this.backDog = setTimeout(() => {
                this.back2main();
            }, 1200000);

        }

    }

    var handlers = {
        "308_v1":   function (serverRealtimeData, monitorDatas, historyData) {
            var theData;

            // 合并到当前正在监控的数据中
            for (var i = 0; i < monitorDatas.length; i++) {
                if (serverRealtimeData["data"]) {
                    theData = getMonitorData(monitorDatas[i].type, serverRealtimeData["data"]);

                    monitorDatas[i].dataDisplay.type = theData.condition.type;
                    monitorDatas[i].dataDisplay.risk = theData.condition.risk;
                    monitorDatas[i].dataDisplay.state = theData.condition.state;
                    monitorDatas[i].dataDisplay.v1 = theData.condition.value1;
                    monitorDatas[i].dataDisplay.v2 = theData.condition.value2;
                    monitorDatas[i].dataDisplay.v3 = theData.condition.value3;
                    monitorDatas[i].dataDisplay.v4 = theData.condition.value4;
                    monitorDatas[i].time = serverRealtimeData.timestamp;
                    monitorDatas[i].state = theData.state;
                }
            }

        },

        "226_v1": function(serverRealtimeData, monitorDatas, historyData) {
            historyData.splice(0, 0, {
                "id": serverRealtimeData.monitorPoint + serverRealtimeData.timestamp,
                "startTime": serverRealtimeData.timestamp,
                "condRisk": serverRealtimeData.data[0].condition.risk,
                "dataType": serverRealtimeData.data[0].type,
                "condType": serverRealtimeData.data[0].condition.type,
                "dataState": +serverRealtimeData.data[0].state,
                "condPidValue": serverRealtimeData.data[0].condition.value3,
                "condMaterialId": serverRealtimeData.data[0].condition.value1,
                "condIsNucleus": serverRealtimeData.data[0].condition.value4
            });

            if (historyData.length > 20) {
                historyData.splice(historyData.length-1, 1);
            }
        }
    };

    function getMonitorData(type, datas) {
        for (var i = 0; i < datas.length; i++) {
            if (datas[i].type === type) {
                return datas[i];
            }
        }
    }


    function init(point, data) {
        if (!point) {
            return;
        }

        var monitorDatas = getMonitorDatas(point.deviceModel);
        data.monitorDatas = monitorDatas;

        loadInitChartData(point.pointId, (historyData) => {
            if (historyData) {
                data.historyData = historyData[historyData.key];
            } else {
                data.historyData = [];
            }

            if (data.dataview !== "308_v1" && point.deviceModel === "308_v1") {
                setTimeout(() => {
                    bus.$emit("show-chart-page");
                }, 200);
            }

            data.dataview = point.deviceModel;
        });

    }

</script>