/**
 * Class responsible for broadcasting the actual timing
 * May be moved to a Node.js server in the near future
 */

function TimerSession ()
{
    EventDispatcher.call(this);
    this._sessionStartTime = null;
    this._currentRoundStartTime = null;
    this._interval = null;
    this._roundType = null;

    var startTime = loadStartingTime();

    this._roundTime = startTime ? startTime : 1000 * 7;
    this._coffeeBreakTime = 10 * 60 * 1000;

    var d = new Date();
    new TimerSessionEvent( TimerSessionEvent.SESSION_STARTED, this._getVOTimeUpdate( d ) )
}

function loadStartingTime() {
    var params = (new URL(document.location)).searchParams;
    var requestedTime = params.get("t");
    if (requestedTime) {
        var minutes = requestedTime.split(':')[0];
        var seconds = requestedTime.split(':')[1];

        if (!minutes || !seconds) {
            return;
        }

        if (minutes.length <= 0 && isNumber(minutes) && minutes > 60) {
            minutes = 60;
        }
        if (seconds.length <= 0 && isNumber(seconds) && seconds > 60) {
            seconds = 60;
        }
        return (minutes * 60 * 1000) + (seconds * 1000);
    }
}

TimerSession.prototype = Object.create( EventDispatcher.prototype );


TimerSession.prototype.startSession = function ()
{
    var d = new Date();
    this._sessionStartTime = d.getTime();
    this._interval = window.setInterval( this._updateTime.bind(this), 200 );
    this.dispatchEvent( new TimerSessionEvent( TimerSessionEvent.SESSION_STARTED, this._getVOTimeUpdate( d ) ) );
};

TimerSession.prototype.stopSession = function ()
{
    clearInterval( this._interval );
    this._roundStarted = false;
    this._sessionStartTime = null;
    this._currentRoundStartTime = null;
    this.dispatchEvent( new TimerSessionEvent( TimerSessionEvent.SESSION_STOPPED ) );
};

TimerSession.prototype.startRound = function ()
{
    this._roundType = RoundType.NORMAL;
    this._startNewRound();
};

TimerSession.prototype.stopRound = function ()
{
    this._roundType = null;
};


TimerSession.prototype.startCoffeeBreak = function ()
{
    this._roundType = RoundType.COFFEE_BREAK;
    this._startNewRound();

};

TimerSession.prototype.setRoundTime = function ( roundTime )
{
    if ( this._roundTime == roundTime ) return;

    setCurrentTime(roundTime);

    this._roundTime = roundTime;
    this.dispatchEvent( new TimerSessionEvent( TimerSessionEvent.ROUND_TIME_CHANGED, this._getVOTimeUpdate() ) );

};

TimerSession.prototype.getRoundTime = function ()
{
    return this._roundTime;
};

TimerSession.prototype.setCoffeeBreakTime = function ( coffeeBreakTime )
{
    if ( this._coffeeBreakTime == coffeeBreakTime ) return;
    this._coffeeBreakTime = coffeeBreakTime;
    this.dispatchEvent( new TimerSessionEvent( TimerSessionEvent.COFFEE_BREAK_TIME_CHANGED, this._getVOTimeUpdate() ) );
};

// PRIVATE METHODS

TimerSession.prototype._startNewRound = function ()
{
    var d = new Date();
    this._currentRoundStartTime = d.getTime();
    this.dispatchEvent( new TimerSessionEvent( TimerSessionEvent.ROUND_STARTED, this._getVOTimeUpdate( d ) ) );
};

TimerSession.prototype._updateTime = function ()
{
    this.dispatchEvent( new TimerSessionEvent( TimerSessionEvent.TIMER_UPDATE, this._getVOTimeUpdate() ) );
};

TimerSession.prototype._getVOTimeUpdate = function ( d )
{
    if ( !d ) d = new Date();
    var now = d.getTime();

    var rt = this._roundTime;
    if ( this._roundType )
    {
        rt = ( this._roundType == RoundType.NORMAL ? this._roundTime : this._coffeeBreakTime ) - ( now - this._currentRoundStartTime );
    }

    return new VOTimeUpdate( now - this._sessionStartTime, rt, this._roundType );
};