/*
The class responsible for the modification of the view layer and broadcasting view related events to the app.
Only this class has actual knowledge of the view layer (in this case the DOM). This causes the view layer to be easily
replaced with another (for instance an Apcellerator app view)
 */

function TimerView()
{
    EventDispatcher.call(this);

    this._isSetupMode = false;

    // initiate html elements / jquery objects
    this._totalTimeEl = $("#total-time");
    this._totalTimeMinsEl = $('.minutes', this._totalTimeEl);
    this._totalTimeSecondsEl = $('.seconds', this._totalTimeEl);

    this._viewEl = $(".viewport");
    this._mainEl = $(".main");
    this._timerEl = $("#time");

    this._btnStartTimer = $("#btn-start-timer");
    this._btnStopTimer = $("#btn-stop-timer");
    this._btnStartCoffeeBreak = $("#btn-start-coffee-break");
    this._btnFullscreen = $("#btn-fullscreen");
    this._btnSetup = $("#btn-setup");
    this._btnSoundToggle = $("#btn-sound-toggle");

    // styling fix
    this._mainEl.fitText(0.35);

    // tooltips
    $('button').tipsy({gravity: 's', fade:true, offset: 10});

    this._addListeners();

    this.loadAssets();

    this.toggleFullScreen();
}

/**
 * Inherit from EventDispatcher
 */
TimerView.prototype = Object.create( EventDispatcher.prototype );

/**
 * Private vars
 *
 * Elements and time
 */
TimerView.prototype._totalTimeEl = null;
TimerView.prototype._totalTimeMinsEl = null;
TimerView.prototype._totalTimeSecondsEl = null;
TimerView.prototype._timerEl = null;
TimerView.prototype._btnFullscreen = null;
TimerView.prototype._btnStartTimer = null;
TimerView.prototype._btnStopTimer = null;
TimerView.prototype._btnStartCoffeeBreak = null;
TimerView.prototype._btnSoundToggle = null;

/**
 *
 * vars
 */
TimerView.prototype._lastTime = null;
TimerView.prototype._isSetupMode = false;
TimerView.prototype._deltas = [600*1000, 60*1000, 10*1000, 1000];

/**
 * Static vars
 *
 * Events
 */
TimerView.EVENT_START_SESSION       = "EVENT_START_SESSION";
TimerView.EVENT_STOP_SESSION        = "EVENT_STOP_SESSION";
TimerView.EVENT_START_ROUND         = "EVENT_START_ROUND";
TimerView.EVENT_STOP_ROUND          = "EVENT_STOP_ROUND";
TimerView.EVENT_START_COFFEEBREAK   = "EVENT_START_COFFEEBREAK";
TimerView.EVENT_ROUND_TIME_EDIT     = "EVENT_ROUND_TIME_EDIT";
TimerView.LOW_TIME                  = 2;

/**
 *
 */
TimerView.prototype.toggleFullScreen = function() {

    if (!document.fullscreenElement &&    // alternative standard method

        !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }

        ga('send', 'event', 'Application', 'Full Screen open');

    } else {

        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }

        ga('send', 'event', 'Application', 'Full Screen close');
    }
}

/**
 *
 * @param time
 */
TimerView.prototype.setTotalTime = function ( time )
{
    var d = moment.duration( time );
    this._totalTimeMinsEl.text( this.doubleDigit(d.minutes()) );
    this._totalTimeSecondsEl.text( this.doubleDigit(d.seconds()) );
};

/**
 *
 */
TimerView.prototype.removeStatusClasses = function(){

    // todo: some sort of state system
    this._viewEl.removeClass("is-low");
    this._viewEl.removeClass("is-negative");
    this._viewEl.removeClass("is-started");
    this._viewEl.removeClass("is-coffee");
    this._viewEl.removeClass("is-stopped");
};

/**
 *
 * @param status
 */
TimerView.prototype.setStatus = function( status ){

    if(!this._viewEl.hasClass("is-" + status)){
        this.removeStatusClasses();
        this._viewEl.addClass("is-" + status);
    }
};

/**
 *
 * @param time
 * @param roundType
 */
TimerView.prototype.setRoundTime = function ( time, roundType )
{
    var t, m, s;

    // remember s and check for changes

    if ( time < -1000 )
    {
        t = Math.floor( Math.abs(time) / 1000 );

        if(this._lastTime == t){
            return;
        }

        if( !this._isSetupMode && time > -2000 ){
            this.setStatus("negative");
            createjs.Sound.play("alarm");
        }

    }else{

        t = Math.ceil( time / 1000 );

        if(this._lastTime == t){
            return;
        }

        if( !this._isSetupMode && time < TimerView.LOW_TIME*1000 ){

            createjs.Sound.play("tick");
            this.setStatus("low");
        }
    }

    m = Math.floor(t / 60);
    s = t - (m * 60);

    var timeString = "" + this.doubleDigit(m) + this.doubleDigit(s);

    $('.digit .value', this._timerEl).each(function( index ){
        $(this).text( timeString.charAt(index) );
    });

    this._lastTime = t;
};

/**
 *
 * @param number
 * @returns {*}
 */
TimerView.prototype.doubleDigit = function( number ){

    return ("0" + number).slice(-2);
};

/**
 *
 */
TimerView.prototype.startSession = function ()
{
    this.dispatchEvent( TimerView.EVENT_START_SESSION );
};

/**
 *
 */
TimerView.prototype.loadAssets = function(){
    createjs.Sound.registerSound("/assets/snd/tick.mp3", "tick");
    createjs.Sound.registerSound("/assets/snd/alarm.mp3", "alarm");
    createjs.Sound.registerSound("/assets/snd/blop.mp3", "start");
};

/**
 * // PRIVATE METHODS
 *
 * @private
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

TimerView.prototype._addListeners = function ()
{
    this._btnSoundToggle.click( this._toggleSound.bind(this) );
    this._btnStartTimer.click( this._startRoundHandler.bind(this, "Button") );
    this._btnStopTimer.click( this._stopRoundHandler.bind(this) );
    this._btnFullscreen.click( this.toggleFullScreen.bind(this) );
    this._btnStartCoffeeBreak.click( this._startCoffeeBreakClickHandler.bind(this) );

	var participants = [
		{
			"img":"mzidi.jpg",
			"name":"Marwa"
		},
		{
			"img":"souarab.jpg",
			"name":"Sofiane"
		},
		{
			"img":"bsaul.jpg",			
			"name":"B. Saul"
		},
		{
			"img":"amehrez.jpg",
			"name":"Achraf"
		},
		{
			"img":"btermoz.jpg",
			"name":"B. Termoz"
		},
		{
			"img":"aboixel.jpg",
			"name":"Audrey"
		}];
	shuffle(participants);
    // start timer on space
	i=0;
    $(document).keydown(function(evt) {
        if (evt.keyCode == 32) {
            this._startRoundHandler("Spacebar");
			i=i+1;
			popin = "<img style='width:120px;height:120px;border-radius:60px;' src=\"" + participants[i % (participants.length)].img + "\" / style='float:left;'><br/>" +participants[i % (participants.length)].name;
			$("#participant").html(popin);
        }
    }.bind(this));

    // start timer when tapping on clock on touchscreens
    this._timerEl.bind( "tap", this._startRoundHandler.bind(this, "Tap") );

    this._btnSetup.click( this._toggleSetup.bind(this) );

    // setup buttons
    this._addSetupButtonListeners();
};

/**
 *
 * @private
 */
TimerView.prototype._addSetupButtonListeners = function (){

    var thisTimerView = this;

    var buttonDownTimeout;

    // yes!!
    var editDigit = function(e){

        e.stopPropagation();

        var el = $(this);
        var minus = false;

        var parent = el.parents(".digit");
        var digit = parent.data("digit");
        var valueEl = $(".value", parent);
        var value = parseInt(valueEl.text());

        if( el.hasClass("minus")){
            minus = true;
        }

        var timeChange = minus ? -thisTimerView._deltas[digit] : thisTimerView._deltas[digit];

        var event = {
            type : TimerView.EVENT_ROUND_TIME_EDIT,
            data : timeChange,
            timeUpdate : {
                roundType : RoundType.NORMAL,
                roundTime : null,
                roundTimeChange : timeChange
            }
        };

        thisTimerView.dispatchEvent( event );
    };

    $('button', this._timerEl).bind('vmousedown', function(e) {

        editDigit.call(this, e);

        clearInterval(buttonDownTimeout);
        buttonDownTimeout = setInterval( editDigit.bind(this, e), 200);

    }).bind('vmouseup', function(e) {

        clearInterval(buttonDownTimeout);
    });
};

/**
 *
 * @private
 */
TimerView.prototype._showFlash = function(){

    var flash = $(".flash");

    flash.removeClass("hidden");

    setTimeout(function(){

        flash.addClass("hidden");
    }, 200);
};

/**
 *
 * @private
 */
TimerView.prototype._toggleSound = function(){

    if(createjs.Sound.getMute()){

        createjs.Sound.setMute(false);
        this._btnSoundToggle.removeClass("muted");

        // track
        ga('send', 'event', 'Application', 'Sound On');

    }else{

        this._btnSoundToggle.addClass("muted");
        createjs.Sound.setMute(true);

        // track
        ga('send', 'event', 'Application', 'Sound Off');
    }
};

/**
 *
 * @private
 */
TimerView.prototype._toggleSetup = function(){

    this._viewEl.toggleClass("is-setup");
    this.removeStatusClasses();

    if( this._viewEl.hasClass('is-setup') ){

        this.dispatchEvent( TimerView.EVENT_STOP_ROUND );
        this._isSetupMode = true;

        // track setup click
        ga('send', 'event', 'Application', 'Setup View');

        return;
    }

    // track new time setup when leaving setup - ugly but nasty
    var setupTime = 0;
    var thisTimerView = this;
    $('.digit .value', this._timerEl).each(function( index ){

        setupTime += thisTimerView._deltas[index] * $(this).text();
    });
    ga('send', 'event', 'Setup', 'New Time Setup', 'Regular Clock', setupTime);

    this._isSetupMode = false;
};

/**
 *
 * @param trackSource
 * @private
 */
TimerView.prototype._startRoundHandler = function ( trackSource )
{
    if( this._isSetupMode ){
        this._toggleSetup();
    }

    this.dispatchEvent( TimerView.EVENT_START_ROUND );
    createjs.Sound.play("blop");

    this._showFlash();

    // track
    ga('send', 'event', 'Clock', 'Start new round', trackSource);
};

/**
 *
 * @private
 */
TimerView.prototype._stopRoundHandler = function ()
{
    this.removeStatusClasses();
    this.dispatchEvent( TimerView.EVENT_STOP_ROUND );
};

/**
 *
 * @private
 */
TimerView.prototype._startCoffeeBreakClickHandler = function ()
{
    this.dispatchEvent( TimerView.EVENT_START_COFFEEBREAK );

    ga('send', 'event', 'Clock', 'Start Coffee Break');
};