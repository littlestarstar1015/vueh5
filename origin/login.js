import {login, getQueryString} from './src/data/dataproxy';
import {cacheStationData} from './src/data/data-util';

import polyfile from 'babel-polyfill'

var loginData = {
    username: "",
    password: "",
    errmsg: ""
};

new Vue({
    el: '#login-box',
    data: loginData,

    methods: {
        login: function() {
            if (this.username == "" || this.password == "") {
                loginData.errmsg = "用户名或密码不能为空";
                return;
            }

            login(this.username, this.password, function(success, data) {
                if (success) {
                    cacheStationData(data);
                    location.href = "../mobile/index.html";
                } else {
                    loginData.errmsg = data.message;
                }
            });
        }
    },

    mounted: function() {
        var u = getQueryString("u");
        var p = getQueryString("p");

        if (u) {
            loginData.username = u;
        }

        if (p) {
            loginData.password = p;
        }
    }
})