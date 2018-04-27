<template>
    <div class="monitor-title">

        <a v-on:click="changeView('main')">首页</a>
        <a v-on:click="changeView('monitor')">监控视图</a>

        <a href="javascript:void(0);" v-on:click="toggleHisotry()" >历史报警</a>

        <!--<div class="userinfo" v-if="!!point">-->
            <!--<label>监测点：</label>{{point.pointName}}；-->
            <!--<label>{{point.contactName}}：</label>{{room.activePoint.contactPhone}}-->
        <!--</div>-->

        <div v-bind:class="['alarm-history',{'hidden': hidden}]">
            <table>
                <tr class="thead">
                    <td>开始时间</td>
                    <td>结束时间</td>
                    <td>设备</td>
                    <td>类型</td>
                    <td>现场状况</td>
                    <td>历史数据</td>
                </tr>
                <tr v-for="alarm in history">
                    <td>{{formatDate(alarm.startTime)}}</td>
                    <td>{{formatDate(alarm.endTime)}}</td>
                    <td>{{alarm.pointName}}</td>
                    <td>{{alarm.type}}</td>
                    <td>{{alarm.message}}</td>
                    <td><button v-on:click="selectEvent(alarm)">提取</button></td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    import {getToken} from '../data/data-util';
    import {loadAlarmEvents, loadAlarmEventData} from '../data/dataproxy';
    import {formatTimestamp} from '../util/date-utils'

    export default {
        props: ['room', 'event'],
        data : function() {
            return {
                hidden: true,
                history: []
            }
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
            'formatDate': formatTimestamp,
            'selectEvent': function(event) {
                window.open("./event.html?id=" + event.id + "&token=" + getToken(), "event-window", "fullscreen=1");

//                loadAlarmEventData(event.id);

            },
            'changeView': function(view) {
                this.$emit('viewchange', view)
            }
        }
    }
</script>




