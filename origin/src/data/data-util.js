import {VIEW_MAIN, USER_TYPE_LINGDAO} from './const'
import {getQueryString} from "./dataproxy";

var token = null, servicePhone;
var rooms = {};

export function getToken() {
    if (token) {
        return token;
    }
    return getQueryString("token");
}

export function getServicePhone() {
    return servicePhone;
}

export function getRooms() {
    return rooms;
}

/**
 * 根据设备型号获取初始化的数据。
 *
 * @param deviceModel
 * @returns
 */
export function getMonitorDatas(deviceModel) {
        return [{
            "type":"smoke",
            "typeName": "火灾烟雾",
            "viewType": "ht01",
            "series": ["smoke"],
            "realtimeKeys": ["v2"],
            "time": 0,
            "state": 0,
            dataDisplay: {
                "type": "",
                "risk": "",
                "state": "",

                "v1title": "气流状态",
                "v2title": "烟雾值",
                "v3title": "大颗粒",
                "v4title":"小颗粒",
                "v1":"",
                "v2":"",
                "v3":"",
                "v4":""
            },
            yAxis: {
                max: function(val) {
                    if (val.max < 100) {
                        return Math.ceil(val.max) * 2;
                    } else {
                        return Math.ceil(val.max) + 100;
                    }
                }
            }
        },{
            "type":"tvoc",
            "typeName": "有毒有害易燃",
            "viewType": "ht01",
            "series": ["tvoc"],
            "realtimeKeys": ["v1","v5","v6","v7"],
            "time": 0,
            "state": 0,
            dataDisplay: {
                "type": "",
                "risk": "",
                "state": "",
                "v1title": "约化浓度",
                "v2title": "有毒有害浓度",
                "v3title": "设备温度",
                "v4title":"设备湿度",
                "v5title":"氯气",
                "v6title":"氨气",
                "v7title":"一氧化碳",
                "v1":"",
                "v2":"",
                "v3":"",
                "v4":""
            },
            yAxis: {
                max: function(val) {
                    if (val.max < 120) {
                        return Math.ceil(val.max) * 2;
                    } else {
                        return Math.ceil(val.max) + 100;
                    }
                }
            }
        },{
            "type":"bio",
            "typeName": "微颗粒",
            "viewType": "ht01",
            "series": ["bio_1","bio_2","bio_3","bio_4"],
            "realtimeKeys": ["v1", "v2", "v3", "v4"],
            "time": 0,
            "state": 0,
            dataDisplay: {
                "type": "",
                "risk": "",
                "state": "",
                "v1title": "颗粒0.5-1.0μm",
                "v2title": "颗粒1.0-2.5μm",
                "v3title": "颗粒2.5-5.0μm",
                "v4title": "颗粒5.0-10μm",
                "v1":"",
                "v2":"",
                "v3":"",
                "v4":""
            },
            yAxis: {
                max: function(val) {
                    if (val.max < 800) {
                        return Math.ceil(val.max * 2);
                    } else {
                        return Math.ceil(val.max) + 100;
                    }
                }
            }
        },{
            "type":"cwa",
            "typeName": "化学战剂",
            "viewType": "ht01",
            "series": ["cwa_1","cwa_2"],
            "realtimeKeys": ["v2","v4"],
            "time": 0,
            "state": 0,
            dataDisplay: {
                "type": "",
                "risk": "",
                "state": "",
                "v1title": "通道1",
                "v2title": "通道2",
                "v3title": "通道3",
                "v4title": "通道4",
                "v1":"",
                "v2":"",
                "v3":"",
                "v4":""
            },
            yAxis: {
                max: function(val) {
                    if (val.max < 2) {
                        return 4;
                    } else {
                        return Math.ceil(val.max) + 2;
                    }
                }
            }
        }];


}


export function cacheStationData(data) {
    sessionStorage.setItem("stations", JSON.stringify(data));
}

export function initData() {
    var data = {
        "view": VIEW_MAIN,
        "room": {
            "monitorPoints": null
        },
        activePoint: null
    }, authed;


    var stations = sessionStorage.getItem("stations");
    if (stations) {
        authed = JSON.parse(stations);
        data.area = authed.area;
        data.line = authed.line;
        data.user = authed.info;
        data.user.userType = authed.type;
        token = authed.securityKey;
        servicePhone = authed.phone;

        if (authed.type === USER_TYPE_LINGDAO) {
            collectRoomIds(data.area);
            collectRoomIds(data.line);
        }

        return data;
    }
    // 没有登录信息，回到登录界面
    location.href = "./login.html";
}

function collectRoomIds(node) {
    if (!node) {
        return;
    }

    if (!!node.roomId) {
        rooms[node.roomId] = node.roomName;
    } else {
        for (var i = 0; i < node.children.length; i++) {
            collectRoomIds(node.children[i]);
        }
    }
}

/**
 * 从线路或者区域中获取第一个中控室
 */
export function getDefaultSelectRoom(data) {
    var tmp = data;
    while (tmp.children && tmp.children[0]) {
        tmp = tmp.children[0];
    }
    return tmp;
}
