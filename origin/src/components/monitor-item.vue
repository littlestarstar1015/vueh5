<template>
    <table v-bind:class="[{'m-alert': monitorData.state === 2},{'m-warn': monitorData.state === 1},{'m-normal': monitorData.state === 0}]">
        <tr>
            <td width="20%"></td><td width="20%"></td><td width="10%"></td><td width="20%"></td><td width="10%"></td><td width="20%"></td>
        </tr>
        <tr>
            <td colspan="2" rowspan="2" class="vfield main-value">{{monitorData.typeName}}</td>
            <td class="text-right">类型</td>
            <td class="vfield" colspan="3">{{monitorData.dataDisplay.type}}</td>
        </tr>
        <tr>
            <td class="text-right">危险度</td>
            <td class="vfield highlight-field">{{monitorData.dataDisplay.risk}}</td>
            <td class="text-right">状态</td>
            <td class="vfield highlight-field">{{monitorData.dataDisplay.state}}</td>
        </tr>
        <tr>
            <td class="text-left">{{monitorData.dataDisplay.v1title}}</td>
            <td class="vfield">{{monitorData.dataDisplay.v1}}</td>
            <td rowspan="5" colspan="4" style="position:relative;overflow:hidden;">
                <div class="chart-wrapper">
                    <div class="mchart" v-bind:id='"monitorChart" + monitorData.type'> </div>
                </div>
            </td>
        </tr>
        <tr>
            <td class="text-left">{{monitorData.dataDisplay.v2title}}</td>
            <td class="vfield">{{monitorData.dataDisplay.v2}}</td>
        </tr>
        <tr>
            <td class="text-left">{{monitorData.dataDisplay.v3title}}</td>
            <td class="vfield">{{monitorData.dataDisplay.v3}}</td>
        </tr>
        <tr>
            <td class="text-left">{{monitorData.dataDisplay.v4title}}</td>
            <td class="vfield">{{monitorData.dataDisplay.v4}}</td>
        </tr>
        <tr>
            <td colspan="2" class="just-for-height"></td>
        </tr>
    </table>
</template>

<script>

    import {bus} from '../data/websocket';

    function initSeriesData(historyData, myDataKeys) {
        if (!historyData) {
            return [];
        }

        var data = [], times = historyData.time;

        for (var i = 0; i < myDataKeys.length; i++) {
            var historyRow = historyData[myDataKeys[i]];
            data[i] = [];
            for (var j = 0; j < times.length; j++) {
                data[i].push([
                    times[j], historyRow[j]
                ]);
            }
        }
        return data;
    }

    function initChartOption(seriesDatas, monitorData) {
        var titleKeys=monitorData.realtimeKeys;
        var option = {
            title: {
                show: false
            },
            color: [
                '#42B500',
                '#0A8D82',
                '#d48265',
                '#91c7ae',
                '#c23531',
                '#ca8622',
                '#bda29a',
                '#6e7074',
                '#546570',
                '#c4ccd3'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false
                }
            },
            xAxis: {
                type: 'time',
                show: false,
                splitNumber : 100,
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                splitNumber: 3,
                min: 0,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: "#666",
                        opacity: 0.5
                    }
                }
            },
            series: [],
            textStyle: {
                color: "#aaa"
            }

        };

        if (monitorData.yAxis) {
            Object.assign(option.yAxis, monitorData.yAxis);
        }

        for (var i = 0; i < seriesDatas.length; i++) {
            option.series[i] = {
                name: monitorData.dataDisplay[titleKeys[i] + "title"],
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: seriesDatas[i]
            };
        }

        return option;
    }

    export default {

        props: ['monitorData','historyData'],

        watch: {
            'historyData': function() {
                var seriesDatas;
                if (!this.$props.historyData) {
                    return;
                }

                if (this.chart) {
                    seriesDatas = initSeriesData(this.$props.historyData,  this.$props.monitorData.series);

                    for (var i = 0; i < seriesDatas.length; i++) {
                        this.chartOption.series[i].data = seriesDatas[i];
                    }
                    this.chart.setOption(this.chartOption);
                } else {
                    seriesDatas = initSeriesData(this.$props.historyData,  this.$props.monitorData.series);
                    this.chartOption = initChartOption(seriesDatas, this.$props.monitorData);
                }
            },

            'monitorData.time': function() {

                var monitorData = this.$props.monitorData;
                if (!this.chartOption || monitorData.time === 0) {
                    return;
                }

                for (var i = 0;  i < monitorData.series.length; i++) {
                    this.chartOption.series[i].data.push([
                        monitorData.time,
                        monitorData.dataDisplay[monitorData.realtimeKeys[i]]
                    ]);
                    if (this.chartOption.series[i].data.length > 100) {
                        this.chartOption.series[i].data.shift();
                    }
                }

                if (this.chart) {
                    this.chart.setOption(this.chartOption);
                } else {
                    this.chart = echarts.init(document.getElementById("monitorChart" + monitorData.type));
                    this.chart.setOption(this.chartOption);
                }
            }
        },

        mounted: function () {
            var seriesDatas, monitorData = this.$props.monitorData;
            if (this.$props.historyData) {
                seriesDatas = initSeriesData(this.$props.historyData,  monitorData.series);
                this.chartOption = initChartOption(seriesDatas, monitorData);
                // this.chart = initChart(this.seriesDatas, this.$props.monitorData);
            }

            bus.$on('show-chart-page', () => {
                setTimeout(()=>{
                    if (!this.chart) {
                        this.chart = echarts.init(document.getElementById("monitorChart" + monitorData.type));
                        this.chart.setOption(this.chartOption);
                    }
                }, 100);
            });
        }
    }
</script>