import {loadAlarmEventData, getQueryString} from './src/data/dataproxy';
import {getMonitorDatas} from './src/data/data-util';
import dataEventPage from './src/components/data-event-page.vue'

import polyfile from 'babel-polyfill'

loadAlarmEventData(getQueryString("id"), function(eventData) {
    var data = {
        "key": eventData.key
    }, realtimeData = eventData.data;

    if (eventData.key === "info_v1") {
        data.monitorDatas = getMonitorDatas(realtimeData.model);
        data.monitorDatas[1]["series"] = ["tvoc", "cl2", "nh3", "co"];

        data.historyData = eventData[eventData.key];
        mergeMonitorData(realtimeData, data.monitorDatas);
    } else if (eventData.key === "info_v226") {
        data.monitorDatas = {};
        data.historyData = {
            "id": realtimeData.monitorPoint + realtimeData.timestamp,
            "startTime": realtimeData.timestamp,
            "condRisk": realtimeData.data[0].condition.risk,
            "dataType": realtimeData.data[0].type,
            "condType": realtimeData.data[0].condition.type,
            "dataState": +realtimeData.data[0].state,
            "condPidValue": realtimeData.data[0].condition.value3,
            "condMaterialId": realtimeData.data[0].condition.value1,
            "condIsNucleus": realtimeData.data[0].condition.value4
        }
    }

    new Vue({
        el: '#event-box',
        components: {dataEventPage},
        data: data
    })

});

function mergeMonitorData(serverRealtimeData, monitorDatas) {
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

}

function getMonitorData(type, datas) {
    for (var i = 0; i < datas.length; i++) {
        if (datas[i].type === type) {
            return datas[i];
        }
    }
}
