<template>
    <div>
        <h1>监测时间：{{formatDate(mdata.startTime)}}，监测结果：{{mdata.condType}}</h1>
        <h2>现场气体采样</h2>
        <div id="m226chart" class="mchart" style="width: 500px;height:400px;"> </div>
        <h2 v-if="!!detail">被检物说明：</h2>
        <p class="raman-detail">{{detail}}</p>
    </div>
</template>

<script>

    import {formatTimestamp} from '../util/date-utils'
    import {loadRamanDetail} from '../data/dataproxy';

    export default {
        props: ['mdata'],
        data: function() {
            return {
                detail: null
            }
        },
        methods: {
            'formatDate': formatTimestamp
        },
        mounted: function() {
            this.chart = initChart(this.$props.mdata.condPidValue);
            loadRamanDetail(this.$props.mdata.condMaterialId, (data) => {
                this.detail = data.moreInfo;
            });
        },

        watch: {
            mdata : function() {
                loadRamanDetail(this.$props.mdata.condMaterialId, (data) => {
                    this.detail = data.moreInfo;
                });

                this.chart.setOption({
                    series: [{
                        data: makeSeriesData(this.$props.mdata.condPidValue)
                    }]
                });
            }
        }
    }

    function makeSeriesData(pidData) {
        var datas = pidData.split(","), seriesData = [];

        for (var i = 1; i < datas.length; i++) {
            seriesData.push({
                name: i,
                value: [
                    i, +datas[i]
                ]
            })
        }

        return seriesData;
    }


    function initChart(data) {

        var seriesData = makeSeriesData(data);

        var option = {
            title: {
                show: false
            },
            color: ['#42B500'],
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    return 'PID:' + params[0].data.value[1];
                },
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
            series: [{
                name: '模拟数据',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: seriesData
            }],
            textStyle: {
                color: "#aaa"
            }
        };

        var chart = echarts.init(document.getElementById("m226chart"));
        chart.setOption(option);
        return chart;
    }

</script>