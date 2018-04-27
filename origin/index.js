import deviceList from './src/components/device-list.vue'
import dataPage from './src/components/data-page.vue'
import audioControl from './src/components/audio-control.vue'
import userCard from './src/components/user-card.vue'
import mainPage from './src/components/main-page.vue'

import polyfile from 'babel-polyfill'

import {initData} from './src/data/data-util';
import {startWS, registerData, bus} from './src/data/websocket'
import {POINT_STATE_FAULT, POINT_STATE_UNCONNECT} from './src/data/const'

var data = initData();

new Vue({
    el: '#ht308-container',
    data: data,
    components: {
        deviceList, dataPage, audioControl, mainPage, userCard
    },

    methods: {
        deviceSelect: function(point) {
            if ( (""+point.state) === POINT_STATE_UNCONNECT) {
                return;
            }
            data.activePoint = point;
            this.changeView("monitor");
        },
        changeView: function(view) {
            if (data.view === view) {
                return;
            }

            if (view === "monitor") {
                if (data.activePoint) {
                    data.view = view;
                }
            } else {
                data.view = view;
            }
        },
        roomSelect: function(roomData) {
            // 初始化为未连接状态
            for (var i = 0; i < roomData.monitorPoints.length; i++) {
                roomData.monitorPoints[i].state = POINT_STATE_UNCONNECT;
                roomData.monitorPoints[i].condition = [];
            }

            data.room = roomData;
            data.activePoint = null;

            registerData(roomData.monitorPoints);
        }
    }
});

startWS();

bus.$on("monitor-data", (serverRealtimeData) => {
    var points = data.room.monitorPoints;
    var now = new Date().getTime();
    for (var i = 0; i < points.length; i++) {
        var mypoint = points[i];

        if (mypoint.pointId === serverRealtimeData.monitorPoint) {
            mypoint.updateTime = now;

            if (serverRealtimeData.runstate === 0) {
                // 断线
                mypoint.state = POINT_STATE_UNCONNECT;
            } else if (serverRealtimeData.state > 0) {
                // 报警
                mypoint.state = serverRealtimeData.state;
            } else if (serverRealtimeData.runstate === 3) {
                // 故障
                mypoint.state = POINT_STATE_FAULT;
            } else {
                mypoint.state = serverRealtimeData.state;
            }
        }
    }
});

/*
 * 定期任务
 * 1. 检查监测点更新，如果90秒中未更新，则设置为未更新状态
 * 2. 凌晨3点，刷新一下页面，防止内存泄露
 */
setInterval(function() {
    var points = data.room.monitorPoints;
    var now = new Date();

    if (!points) {
        return;
    }

    for (var i = 0; i < points.length; i++) {
        var mypoint = points[i];
        // 如果设备超过10秒钟，没有更新，就认为连接断了
        if (mypoint.updateTime && (now.getTime() - mypoint.updateTime) > 90000) {
            mypoint.state = POINT_STATE_UNCONNECT;
        }
    }

    reloadAt3AM(now);
}, 5000);

function reloadAt3AM(now) {
    var dog;
    if (now.getHours() === 3 && now.getMinutes() === 0 && now.getSeconds() < 10) {
        dog = sessionStorage.getItem("reloadDog") || 0;
        if ((+dog) < now.getTime()) {
            sessionStorage.setItem("reloadDog", now + 10000);
            location.reload(true);   //从服务器端从新载入
        }
    }
}
