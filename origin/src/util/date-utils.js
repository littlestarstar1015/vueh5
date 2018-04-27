
export function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "";
    }
    var now = new Date(timestamp);
    var year=now.getFullYear();
    var month=now.getMonth()+1;
    var date=now.getDate();
    var hour=now.getHours();
    var minute=now.getMinutes();
    var second=now.getSeconds();
    return year + "-" + pad0(month) + "-" + pad0(date)
        + " "+ pad0(hour) + ":" + pad0(minute) + ":" + pad0(second);
}

function pad0(d) {
    return d < 10 ? '0' + d : d;
}
