<template>
    <div class="device-list">
        <div v-for="device in monitorPoints"
             v-on:click="deviceSelect(device)"
             v-bind:class="[ {'active': (activePoint && device.pointId === activePoint.pointId) } ,
             'alert'+ device.state, 'device-item']" >
            <p class="name">{{device.pointName}}</p>
            <p class="status">{{pointStates[device.state]}}</p>
            <p>{{device.deviceName}}</p>
            <p class="contact">{{device.contactName}}<br>{{device.contactPhone}}</p>
        </div>
    </div>
</template>

<script>

import {POINT_STATE} from '../data/const'

export default {
    props: ['monitorPoints','activePoint'],
    data : function() {
        return {
            pointStates: POINT_STATE
        }
    },
    methods: {
        deviceSelect: function(device) {
            this.$emit('deviceselect', device)
        }
    }
}

</script>


