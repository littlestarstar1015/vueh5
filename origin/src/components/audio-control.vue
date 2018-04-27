
<template>
    <div class="alarm-box">
        <audio loop="loop" ref="audioPlayer" v-bind:src="songUrl"></audio>
        <div class="event-list">
            <div v-for="evt in events" :class='["event-info", "alert-level-" + evt.state]' >
                <p class="event-time">
                    {{formatDate(evt.startTime)}}<span v-if="evt.endTime > 0">至{{formatDate(evt.endTime)}}</span>
                    <a class="btn-clear" v-if="evt.endTime > 0" v-on:click="clearAlarm(evt.id)">清除</a>
                </p>
                <p class="event-type">{{evt.pointName}}：{{evt.type}}</p>
                <p class="event-detail">{{evt.message}}</p>
                <p class="event-detail">处理预案：打开通风，疏散人群</p>
            </div>
            <button v-if="voiceOK && count > 0" v-on:click="closeAlarmVoice">关闭声音</button>
        </div>
    </div>
</template>

<script>
    import { POINT_STATE_ALERT, POINT_STATE_WARN, POINT_STATE_UNCONNECT} from '../data/const'
    import {formatTimestamp} from '../util/date-utils'
    import {bus} from '../data/websocket'
    var STATE_ALERT = +POINT_STATE_ALERT;

    export default {
        props: ['event'],
        data : function() {
            return {
                songUrl: "./voice/alarm.mp3",
                count : 0,
                seriousCount: 0,
                voiceOK: true,
                events: []
            }
        },
        mounted: function(){
            bus.$on('monitor-event', (event) => {
                var i, theSeriousCount;

                for (i = 0; i < this.events.length; i++) {
                    if (this.events[i].id === event.id) {
                        // 之前报警事件没有结束，而现在结束了，则count减一
                        if (!this.events[i].endTime && event.endTime && this.count > 0) {
                            this.events[i].endTime = event.endTime;
                            this.count && (this.count--);
                            if (this.events[i].state === STATE_ALERT && this.seriousCount) {
                                this.seriousCount --;
                            }
                        } else if (this.events[i].state !== STATE_ALERT && event.state === STATE_ALERT) {
                            // 之前不是alert状态，现在是alert状态
                            this.seriousCount ++;
                        }

                        this.events[i].state = event.state;
                        this.events[i].type = event.type;
                        this.events[i].message = event.message;

                        break;
                    }
                }

                if (i >= this.events.length) {
                    if (!event.endTime) {
                        this.count++;

                        if (event.state === STATE_ALERT) {
                            this.seriousCount ++;
                        }

                    }
                    this.events.push(event);
                }

                if (this.seriousCount > 0 && this.voiceOK) {
                    this.$refs.audioPlayer.play();
                } else {
                    this.$refs.audioPlayer.pause();
                    if (this.count === 0) {
                        this.voiceOK = true;
                    }
                }
            })
        },
        methods: {
            clearAlarm: function (id) {
                for (var i = 0; i < this.events.length; i++) {
                    if (this.events[i].id === id) {
                        this.events.splice(i, 1);
                        break;
                    }
                }
            },
            closeAlarmVoice: function() {
                this.voiceOK = false;
                this.$refs.audioPlayer.pause();
            },
            'formatDate': formatTimestamp
        }
    }

</script>




