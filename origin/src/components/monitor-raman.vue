<template>
    <table v-bind:class="[{'m-alert': monitorData.state === 2},{'m-warn': monitorData.state === 1},{'m-normal': monitorData.state === 0}]">
        <tr>
            <td width="40%"></td><td width="10%"></td><td width="20%"></td><td width="10%"></td><td width="20%"></td>
        </tr>
        <tr>
            <td rowspan="2" class="vfield main-value">{{monitorData.typeName}}</td>
            <td class="text-right">{{monitorData.dataDisplay.v1title}}</td>
            <td class="vfield" colspan="3">{{monitorData.dataDisplay.v1}}</td>
        </tr>
        <tr>
            <td class="text-right">危险度</td>
            <td class="vfield highlight-field">{{monitorData.dataDisplay.risk}}</td>
            <td class="text-right">状态</td>
            <td class="vfield highlight-field">{{monitorData.dataDisplay.state}}</td>
        </tr>
        <tr>
            <td colspan="5" style="position:relative;overflow:hidden;height:300px;">
                <div class="chart-wrapper">
                    <div class="mchart" v-bind:id='"monitorChart" + monitorData.type'> </div>
                </div>
            </td>
        </tr>
    </table>
</template>

<script>

    export default {

        props: ['monitorData','historyData'],

        data: function() {
            return {results: []};
        },

        watch: {
            'historyData': function() {
                if (!this.$props.historyData) {
                    return;
                }

                if (this.chart) {
                    var monitorData = this.$props.monitorData;

                    var myDataKeys = monitorData.series;
                    this.seriesDatas = initSeriesData(this.$props.historyData,  myDataKeys);

                    var option = {series:[]};
                    for (var i = 0; i < this.seriesDatas.length; i++) {
                        option.series[i] = {data: this.seriesDatas[i]};
                    }
                    this.chart.setOption(option);
                } else {
                    this.seriesDatas = initSeriesData(this.$props.historyData,  this.$props.monitorData.series);
                    this.chart = initChart(this.seriesDatas, this.$props.monitorData);
                }
            },

            'monitorData.time': function() {

                var monitorData = this.$props.monitorData;
                if (!this.seriesDatas || monitorData.time === 0) {
                    return;
                }

                for (var i = 0;  i < monitorData.series.length; i++) {
                    this.seriesDatas[i].push([
                        monitorData.time,
                        monitorData.dataDisplay[monitorData.realtimeKeys[i]]
                    ]);
                    if (this.seriesDatas[i].length > 100) {
                        this.seriesDatas[i].shift();
                    }
                }

                var option = {series:[]};
                for (var i = 0; i < this.seriesDatas.length; i++) {
                    option.series[i] = {data: this.seriesDatas[i]};
                }
                this.chart.setOption(option);
            }
        }
    }
</script>