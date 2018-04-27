<template>
    <div class="user-card">

        <p>登录用户: {{user.name}}</p>
        <p>日期时间: {{date}}</p>
        <p>技术支持: {{servicePhone}}</p>
        <p class="btn-box">
            <a v-on:click="toggleHisotry()" >历史报警</a>

            <a>场景演习</a>

            <a class="btn-exit" v-on:click="quit()">退出</a>
        </p>
        <div v-bind:class="['alarm-history',{'hidden': hidden}]">
            <table>
                <tr class="thead">
                    <td>位置</td>
                    <td>开始时间</td>
                    <td>结束时间</td>
                    <td>类型</td>
                    <td>现场状况</td>
                    <td>历史数据</td>
                </tr>
                <tr v-for="alarm in history">
                    <td>{{alarm.pointName}}</td>
                    <td>{{formatDate(alarm.startTime)}}</td>
                    <td>{{formatDate(alarm.endTime)}}</td>
                    <td>{{alarm.type}}</td>
                    <td>{{alarm.message}}</td>
                    <td><button v-on:click="selectEvent(alarm)">提取</button></td>
                </tr>
            </table>
            <div class="text-center btn-box">
                <button @click="findMore()">查看更多</button>
                <button @click="toggleHisotry()">关闭</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {getToken, getServicePhone} from '../data/data-util';
    import {loadAlarmEvents, loadAlarmEventData, quit} from '../data/dataproxy';
    import {formatTimestamp} from '../util/date-utils';
    import {bus} from '../data/websocket'

    var data = {
        date: "",
        time: "",
        servicePhone: null,
        hidden: true,
        history: []
    };

    export default {
        props: ['user', 'point'],
        data : function() {
            return data;
        },
        methods: {
            'toggleHisotry': function() {
                if (this.hidden) {
                    loadAlarmEvents((alarmHistory) => {
                        this.history = alarmHistory;
                        this.hidden = false;
                    });
                } else {
                    this.hidden = true;
                }
            },

            findMore: function() {
                window.open("//" + window.location.host + "/admin/a/monitor/alarm?sk=" + getToken(), "event-window", "fullscreen=1");
            },

            'formatDate': formatTimestamp,
            'selectEvent': function(event) {
                window.open("./event.html?id=" + event.id + "&token=" + getToken(), "event-window", "fullscreen=1");
            },
            'quit': function() {
                quit();
                location.href = "./login.html";
            }
        },

        mounted: function() {
            data.servicePhone = getServicePhone();

            setTimeout(() => {
                loadAlarmEvents((alarmHistory) => {
                    var i = 0;
                    if (alarmHistory && alarmHistory.length > 0) {
                        for (i = 0; i < alarmHistory.length; i++) {
                            if (!alarmHistory[i].endTime) {
                                bus.$emit("monitor-event", alarmHistory[i]);
                            }
                        }
                    }
                });
            }, 1000);

        }
    }

    setInterval(function() {
        var now = new Date();
        var dt = formatTimestamp(now.getTime());
        data.date = dt;
    }, 1000);

</script>




