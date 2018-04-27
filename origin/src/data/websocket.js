import {getToken} from './data-util';

var url = window.location.host + "/access/socket/web?token=";
var ws, retry, bus = new Vue(),
    stateHandler = function(e) {
        console.log(e);
    };

var registered = null;

if (/^https.*/.test(window.location.protocol)) {
    url = "wss://" + url;
} else {
    url = "ws://" + url;
}

function  connect() {
  ws = new WebSocket(url + getToken());

  ws.onclose = function () {
      console.log("ws closed, reconnet after 10s");
      reconnect();
  };
  ws.onerror = function (event) {
      console.log("ws error:" + JSON.stringify(event));
  };

  ws.onopen = function () {
      console.log("ws opened");

      if (retry) {
          clearInterval(retry);
          retry = null;
      }

      if (registered) {
          registerData(registered);
      }
  };
  ws.onmessage = function (event) {
      dataHandler(event);
  }
}

function reconnect() {
    if (!retry) {
        console.log("reconnect");
        retry = setInterval(connect, 10000);
    }
}

export function sendMessage(msg) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
    }
}

export function startWS(stateCallback) {
    if (stateCallback) {
        stateHandler = stateCallback;
    }

    connect();

    setInterval(function() {
        if (ws && !retry) {
            ws.send('{"code":0}');
        }
    }, 20000);
}

function dataHandler(e) {
    var response = JSON.parse(e.data);
    if (response.code === 200) {
        // donothing
    } else if (response.code === 302) {
        console.log("monitor-event:" + e.data);
        bus.$emit("monitor-event", response.eventData);
    } else {
        // 收到监测实时消息
        bus.$emit("monitor-data", response);
    }

}

export function registerData(monitorPoints) {
    registered = monitorPoints;
    var msg = '{"code":1, "timestamp":' + new Date().getTime() +',"points":["' +
        monitorPoints[0].pointId + '"';
    for (var i = 1; i < monitorPoints.length; i++) {
        msg += ',"' + monitorPoints[i].pointId + '"';
    }
    msg += ']}';

    sendMessage(msg);
}

export {bus};
