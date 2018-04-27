import axios from 'axios'
import {getToken, getRooms} from './data-util';

// var urlPrefix = "//" + window.location.host + "/access/admin";
var urlPrefix = "http://192.168.0.35/access/admin";
var roomUrl = urlPrefix + "/room";
var historyDataUrl =  urlPrefix + "/data";
var eventUrl = urlPrefix + "/event";
var eventDataUrl = urlPrefix + "/room/event/data";
var loginUrl = urlPrefix + "/login";
var logoutUrl = urlPrefix + "/logout";

var ramanUrl = urlPrefix + "/material/";

/**
 * 加载这个中控室的配置.
 * @param  monitorId 中控室Id
 * @param callback 回调
 */
export function loadConfig(monitorId, callback) {

    axios.get(roomUrl, {
        params: {
            "token": getToken(),
            "roomid": monitorId
        }
    }).then(function(response) {
        callback(response.data[monitorId]);
    }).catch(function(err) {
        if (err.response && err.response.status === 400) {
            alert("请检查token参数是否正确");
        } else {
            console.log(JSON.stringify(err));
        }
    });

}

/**
 * 加载某一个监测设备的历史数据。
 * @param mpId
 * @param callback
 */
export function loadInitChartData(mpId, callback) {
    axios.get(historyDataUrl, {
        params: {
            "token": getToken(),
            "point": mpId
        }
    }).then(function(response) {
        callback(response.data);
    }).catch(function(err) {
        if (err.response && err.response.status === 401) {
            alert("该监测点设备未连接");
        } else {
            console.log(JSON.stringify(err));
        }
        callback();
    });
}

export function loadAlarmEvents(callback) {
    axios.get(eventUrl, {
        params: {
            "token": getToken()
        }
    }).then(function(response) {
        callback(response.data);
    }).catch(function(err) {
        if (err.response.status === 400) {
            alert("请检查token参数是否正确");
        }
    });
}
export function login(username, password, callback) {
    axios.get(loginUrl, {
        params: {
            "username": username,
            "password": password
        }
    }).then(function(response) {
        callback(true, response.data);
    }).catch(function(err) {
        callback(false, err.response.data);
    });
}

export function quit() {
    axios.post(logoutUrl, {
        params: {
            "token": getToken()
        }
    });
}

export function loadAlarmEventData(eventId, callback) {
    axios.get(eventDataUrl, {
        params: {
            "token": getQueryString("token"),
            // "token": getToken(),
            "event": eventId
        }
    }).then(function(response) {
        callback(response.data);
    }).catch(function(err) {
        if (err.response && err.response.status === 400) {
            alert("请检查token参数是否正确");
        } else {
            console.log(JSON.stringify(err));
        }
    });
}

export function getQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}


export function loadRamanDetail(materialId, callback) {
    axios.get(ramanUrl + materialId, {
        params: {
            "token": getToken()
        }
    }).then(function(response) {
        callback(response.data);
    }).catch(function(err) {
        if (err.response && err.response.status === 400) {
            alert("请重新登录");
        } else {
            console.log(JSON.stringify(err));
        }
    });
}

