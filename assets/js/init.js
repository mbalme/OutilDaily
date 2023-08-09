function js(file) {
    document.write('<script type="text/javascript" src="' + file + '"></script>');
}

js("./assets/js/lib/jquery-1.10.2.min.js");
js("./assets/js/lib/jquery.fittext.js");
js("./assets/js/lib/jquery.tipsy.js");
js("./assets/js/lib/jquery.mobile.custom.min.js");

js("./assets/js/lib/modernizr.custom.js");
js("./assets/js/lib/moment.min.js");
js("./assets/js/lib/url-polyfill.min.js");
js("https://code.createjs.com/1.0.0/soundjs.min.js");

js("./assets/js/app/utils/url.js");
js("./assets/js/app/utils/numbers.js");
js("./assets/js/app/utils/ES5Polyfills.js");
js("./assets/js/app/base/Event.js");
js("./assets/js/app/base/EventDispatcher.js");
js("./assets/js/app/definitions/RoundType.js");
js("./assets/js/app/model/vo/VOTimeUpdate.js");
js("./assets/js/app/model/events/TimerSessionEvent.js");
js("./assets/js/app/model/TimerSession.js");
js("./assets/js/app/model/TimerSessionProxy.js");
js("./assets/js/app/view/TimerView.js");
js("./assets/js/app/controller/TimerController.js");
js("./assets/js/app/Main.js");