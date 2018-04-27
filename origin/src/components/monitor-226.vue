<template>
    <div class="monitor-226-container">
        <table class="raman-check-list">
            <thead>
                <tr>
                    <td width="180">检测时间</td>
                    <td width="50" class="text-center">风险</td>
                    <td width="240">检测结果</td>
                    <td width="50">报警</td>
                    <td width="100" class="text-center">详细信息</td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="monitorData in monitorDatas">
                    <td>{{formatDate(monitorData.startTime)}}</td>
                    <td class="text-center">{{monitorData.condRisk}}</td>
                    <td>{{monitorData.condType}}</td>
                    <td>{{monitorData.dataState == 0 ? "否" : "是" }}</td>
                    <td class="text-center"><a @click="showDetail(monitorData)">查看</a></td>
                </tr>
            </tbody>
        </table>

        <detail226 class="raman-check-detail" v-if="!!mdata" :mdata="mdata"></detail226>
    </div>
</template>

<script>

    import {formatTimestamp} from '../util/date-utils';
    import detail226 from './detail-226.vue';

    export default {
        components: {
            detail226
        },
        props: ['monitorDatas'],
        data: function() {
            return {
                mdata: null
            }
        },
        methods: {
            'formatDate': formatTimestamp,
            'showDetail': function(data) {
                this.mdata = data;
            }
        }
    }
</script>