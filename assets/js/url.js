function setCurrentTime(miliseconds) {
    const t = msToMinuteTime(miliseconds);
    console.log('t', t);
    window.history.replaceState("", "",  location.pathname + '?t=' + msToMinuteTime(miliseconds));
}


function msToMinuteTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return (hrs * 60) + mins + ':' + secs;
}