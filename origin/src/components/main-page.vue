
<template>
    <div class="main-page">
        <div class="org-tree main-left" v-if="user.userType === '3'">
            <div v-if="!!area" class="tree-selector">
                <label>数据模式</label>
                <ul>
                    <li><a v-bind:class="{ active: lineOrArea === 0 }" @click="selectLineOrArea(0)">站区</a></li>
                    <li><a v-bind:class="{ active: lineOrArea === 1 }" @click="selectLineOrArea(1)">线路</a></li>
                </ul>
            </div>
            <tree v-bind:treeData="treeData" v-bind:selectedNodeId="selectedNodeId" v-on:nodeselect="nodeSelect" ></tree>
        </div>
        <div v-bind:class="['map-box', 'main-right', {'user-station': user.userType === '2'}]" id="mapBox"></div>
    </div>
</template>

<script>
    import tree from './tree.vue'
    import {getDefaultSelectRoom} from '../data/data-util';
    import {loadConfig} from '../data/dataproxy';
    import {USER_TYPE_STATION} from '../data/const';
    import {bus} from '../data/websocket';

    var defaultPointStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)'
        }),

        image: new ol.style.Circle({
            radius: 12,
            fill: new ol.style.Fill({
                color: 'rgba(7, 204, 63, 0.8)'
            })
        })
    }),

    defaultImages = {
        "226_v1": new ol.style.RegularShape({
            fill: new ol.style.Fill({
                color: 'rgba(10, 57, 164, 0.8)'
            }),
            points: 4,
            radius: 14,
            angle: Math.PI / 4
        }),
        "308_v1": new ol.style.Circle({
            radius: 12,
            fill: new ol.style.Fill({
                color: 'rgba(7, 204, 63, 0.8)'
            })
        })
    },

    defaultAreaStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.5)'
        }),
        stroke: new ol.style.Stroke({
            color: '#999',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#999'
            })
        })
    }),

    highlightPointStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)'
        }),
        stroke: new ol.style.Stroke({
            color: '#FF0000',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 15,
            fill: new ol.style.Fill({
                color: '#FF0000'
            })
        }),
        zIndex: 100
    });

    function makeLayerSource(data) {
        var features = [], gisdata;

        for (var i = 0; i < data.length; i++) {
            gisdata = data[i].gisdata;
            delete data[i].gisdata;
            features.push({
                'geometry': JSON.parse(gisdata),
                'properties': data[i],
                'style': defaultPointStyle,
                'type': 'Feature',
                'id': data[i].id
            });
        }

        var geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:4326'
                }
            },
            'features': features
        };

        var v = new ol.source.Vector({
            style: defaultPointStyle,
            features: new ol.format.GeoJSON().readFeatures(geojsonObject, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });

        v.forEachFeature(function(f) {

            var props = f.getProperties();
            if (props.device) {
                f.setStyle(new ol.style.Style({
                    image: defaultImages[props.device.deviceModel]
                }));
            } else {
                f.setStyle(defaultPointStyle);
            }

        });

        return v;
    }


    export default {
        props: ['line', 'area', 'user', 'activePoint'],
        data: function() {
            if (this.$props.line && getDefaultSelectRoom(this.$props.line)) {
                return {
                    lineOrArea: 1,
                    events: {},
                    treeData: this.$props.line,
                    selectedNodeId: this.$props.line.id
                }
            } else {
                return {
                    lineOrArea: 0,
                    events: {},
                    treeData: this.$props.area,
                    selectedNodeId: this.$props.area.id
                }
            }
        },
        components: {
            tree
        },
        methods: {
            selectLineOrArea: function(lineOrArea) {
                if (lineOrArea === this.lineOrArea) {
                    return;
                }
                this.lineOrArea = 1 - this.lineOrArea;
                if (this.lineOrArea === 1) {
                    this.treeData = this.$props.line;
                } else {
                    this.treeData = this.$props.area;
                }
            },
            nodeSelect: function(node) {
                // console.log("node select:" + node.name);
                var list = [], $this = this, i;
                this.selectedNodeId = node.id;

                if (!!node.roomId) {

                    // 加载站内地图
                    this.stationLayer && this.stationLayer.setVisible(false);
                    this.roomInnerLayer.setVisible(true);

                    this.roomInnerLayer.setSource(new ol.source.XYZ({
                        // 设置本地离线瓦片所在路径，由于例子里面只有一张瓦片，页面显示时就只看得到一张瓦片。
                        url: node.map + '/{z}-{x}-{y}.png'
                    }));

                    loadConfig(node.roomId, function(roomData) {
                        var areas = {};
                        if (roomData.monitorPoints.length === 0) {
            alert(roomData.roomName + "没有配置任何监测设备");
    return;
    }
    $this.$emit("roomselect", roomData);

    for (i = 0; i < roomData.monitorPoints.length; i++) {
        list.push({
            "id": roomData.monitorPoints[i].pointId,
            "name": roomData.monitorPoints[i].pointName,
            "type": "point",
            "device": roomData.monitorPoints[i],
            "gisdata": roomData.monitorPoints[i].pointCoordinate
        });

        areas[roomData.monitorPoints[i].pointId] = {
            properties: {
                "id": roomData.monitorPoints[i].pointId,
                "name": roomData.monitorPoints[i].pointName,
                "type": "area"
            },
            "gisdata": roomData.monitorPoints[i].pointAreaCoordinate
        };
    }

    $this.roomLayer.setSource(makeLayerSource(list));
    $this.areas = areas;
    $this.recoverEventPoint();
    });

    } else {
        this.collectRoomPositions(node, list);
        setTimeout(function() {
            $this.stationLayer.setVisible(true);
            $this.roomInnerLayer.setVisible(false);
            $this.roomLayer.setSource(makeLayerSource(list));
            $this.recoverEventPoint();
        }, 100);

    }
    },

            recoverEventPoint: function() {
                setTimeout(() => {
                    var i = 0;
                    for (var eventId in this.events) {
                        this.handlePointEvent(this.events[eventId], true, i > 0);
                        i++;
                    }
                },100);
            },

            collectRoomPositions: function(node, list) {
                if (!!node.roomId) {
                    list.push({
                        "id": node.roomId,
                        "name": node.roomName,
                        "type": "room",
                        "node": node,
                        "gisdata": node.pointCoordinate
                    });
                } else {
                    for (var i = 0; i < node.children.length; i++) {
                        this.collectRoomPositions(node.children[i], list);
                    }
                }
            },

            handlePointEvent: function(event, recover, noAnimation) {
                var feature, featureId;
                if (this.roomInnerLayer.getVisible()) {
                    featureId = event.pointId;
                } else {
                    featureId = event.roomId;
                }

                feature = this.roomLayer.getSource().getFeatureById(featureId);
                if (!feature) {
                    return;
                }

                if (event.endTime) {
                    delete this.events[event.id];
                    if (!this.haveEventInRoom(event)) {
                        feature.setStyle(defaultPointStyle);
                    }
                    this.removeAreaFeature(featureId);

                } else if (!this.events[event.id] || recover){
                    this.events[event.id] = event;
                    feature.setStyle(highlightPointStyle);
                    if (this.roomInnerLayer.getVisible()) {
                        this.addAreaFeature(event.pointId);
                    }

                    if (!noAnimation) {
                        this.focusOnFeature(feature);
                    }

                }
            },

            haveEventInRoom: function(event) {
                if (this.roomInnerLayer.getVisible()) {
                    return false;
                }

                for (var id in this.events) {
                    if (event.roomId === this.events[id].roomId) {
                        return true;
                    }
                }
                return false;
            },

            focusOnFeature: function(feature) {
                var duration = 2000; //持续时间（毫秒）
                var start = +new Date();
                var view = this.map.getView();
                //移动效果
                var pan = ol.animation.pan({
                    duration: duration, //设置持续时间
                    source: view.getCenter(),
                    start: start
                });
                //反弹效果
                var bounce = ol.animation.bounce({
                    duration: duration, //设置持续时间
                    resolution: 2 * view.getResolution(),  //4倍分辨率
                    start: start
                });
                this.map.beforeRender(pan, bounce); //地图渲染前设置动画效果(pan+bounce)
                view.setCenter(feature.getGeometry().getFirstCoordinate()); //定位
            },

            removeAreaFeature: function(id) {
                var feature = this.roomLayer.getSource().getFeatureById("area-" + id);
                if (feature) {
                    this.roomLayer.getSource().removeFeature(feature);
                }
            },

            addAreaFeature: function(id) {
                var area = this.areas[id];
                if (!area) {
                    return;
                }

                var areaFeature = new ol.format.GeoJSON().readFeature({
                    'geometry': JSON.parse(area.gisdata),
                    'properties': {
                        "id": id
                    },
                    'id': 'area-' + id,
                    'type': 'Feature'
                }, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });

                areaFeature.setStyle(defaultAreaStyle);
                this.roomLayer.getSource().addFeature(areaFeature);
            }

        },

        mounted: function() {
            // 中控室标注layer
            this.roomLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    wrapX: false
                }),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#0000CD',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#0000CD'
                        })
                    })
                })
            });

            this.roomInnerLayer = new ol.layer.Tile();

            if (this.user.userType === USER_TYPE_STATION) {

                this.stationLayer = new ol.layer.Tile({
                });

                setTimeout(() => {
                    this.nodeSelect(this.user);
                }, 200);
            } else {
                this.stationLayer = new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        // 设置本地离线瓦片所在路径，由于例子里面只有一张瓦片，页面显示时就只看得到一张瓦片。
                        url: './ditie/{z}-{x}-{y}.png'
                    })
                });
            }


            this.map = new ol.Map({
                layers: [
                    this.stationLayer, this.roomInnerLayer, this.roomLayer
                ],
                target: 'mapBox',
                controls: [new ol.control.Zoom()],
                view: new ol.View({
                    center: ol.proj.transform([-45, 75], 'EPSG:4326', 'EPSG:3857'),
                    projection: 'EPSG:3857',
                    zoom: 3,
                    minZoom: 3,
                    maxZoom: 5
                })
            });

            var $thismap = this.map, $this = this;
            this.map.on('pointermove', function (e) {
                var pixel = $thismap.getEventPixel(e.originalEvent);
                var hit = $thismap.hasFeatureAtPixel(pixel);
                $thismap.getTargetElement().style.cursor = hit ? 'pointer' : '';
            });

            this.map.on('click', (evt) => {
                var props, i;
                //判断当前单击处是否有要素，捕获到要素时弹出popup
                var feature = $thismap.forEachFeatureAtPixel(evt.pixel, function (feature, layer) { return feature; });
                if (feature) {
                    //alert(feature.getId());
                    props = feature.getProperties();
                    if (props.type === "room") {
                        this.nodeSelect(props.node);
                        this.selectedNodeId = props.node.id;
                    } else if (props.type === "point"){
                        this.$emit('deviceselect', props.device);
                    }
                }
            });

            bus.$on("monitor-event", (event) => {
                this.handlePointEvent(event);
            })

        }
    }

</script>

