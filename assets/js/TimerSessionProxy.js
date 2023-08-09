/**
 * Class acting as a model proxy between the application and the TimerSession
 * This is done so the TimerSession can easily be moved or replaced without having to modify different parts of the app
 */

function TimerSessionProxy ()
{
    EventDispatcher.call(this);

    var networkEnabled = false;

    if(networkEnabled){

        this.initNetwork();
    }else{

        this.initLocal();
    }
}

TimerSessionProxy.prototype = Object.create( EventDispatcher.prototype );

/**
 * Initialize socket.io + messages
 */
TimerSessionProxy.prototype.initNetwork = function(){

};

/**
 * Initialize local timer
 */
TimerSessionProxy.prototype.initLocal = function(){

    this._timerSession = new TimerSession();
    // The timmer session is a client side object. This might change in the future (node.js)
    // but for now just re-route all the events
    this._timerSession.addListener( TimerSessionEvent.SESSION_STARTED,          this._redispatchEvent.bind(this) );
    this._timerSession.addListener( TimerSessionEvent.SESSION_STOPPED,          this._redispatchEvent.bind(this) );
    this._timerSession.addListener( TimerSessionEvent.ROUND_STARTED,            this._redispatchEvent.bind(this) );
    this._timerSession.addListener( TimerSessionEvent.TIMER_UPDATE,             this._redispatchEvent.bind(this) );
    this._timerSession.addListener( TimerSessionEvent.ROUND_TIME_CHANGED,       this._redispatchEvent.bind(this) );
    this._timerSession.addListener( TimerSessionEvent.COFFEE_BREAK_TIME_CHANGED,this._redispatchEvent.bind(this) );

};

TimerSessionProxy.prototype.startSession = function ()
{
    this._timerSession.startSession();
};

TimerSessionProxy.prototype.stopSession = function ()
{
    this._timerSession.stopSession();
};

TimerSessionProxy.prototype.startRound = function ()
{
    this._timerSession.startRound();
};

TimerSessionProxy.prototype.stopRound = function ()
{
    this._timerSession.stopRound();
};


TimerSessionProxy.prototype.startCoffeeBreak = function ()
{
    this._timerSession.startCoffeeBreak();
};

/**
 * Plus is minus
 *
 * @param roundTime
 */
TimerSessionProxy.prototype.changeRoundTime = function ( roundTimeChange )
{
    var newTime = this._timerSession.getRoundTime() + roundTimeChange;
    if (newTime >= 0){
        this._timerSession.setRoundTime( newTime );
    }
};

/**
 * Actual time
 *
 * @param roundTime
 */
TimerSessionProxy.prototype.setRoundTime = function ( roundTime )
{
    this._timerSession.setRoundTime( roundTime );
};

TimerSessionProxy.prototype.setCoffeeBreakTime = function ( coffeeBreakTime )
{
    this._timerSession.setCoffeeBreakTime( coffeeBreakTime );
};

// PRIVATE METHODS
TimerSessionProxy.prototype._redispatchEvent = function ( event )
{
    event.target = this;
    this.dispatchEvent( event );
};