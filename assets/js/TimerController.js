/**
 * Class responsible for all the business logic. Couples the view and the model (which have no knowledge of each other).
 * Reacts to model changes and updates the view. Reacts to view events and updates the model.
 * Is responsible for making decisions based on either of these events
 */

function TimerController ( timerSessionProxy, timerView )
{
    this._timerSessionProxy = timerSessionProxy;
    this._timerView = timerView;

    this._addListeners();
}

TimerController.prototype.roundTimeEdited = function ( time )
{
    this._timerSessionProxy.setRoundTime( time );
};

TimerController.prototype.coffeeBreakTimeEdited = function ( time )
{
    this._timerSessionProxy.setCoffeeBreakTime( time );
};

// PRIVATE METHODS

TimerController.prototype._addListeners = function ()
{
    this._timerSessionProxy.addListener( TimerSessionEvent.SESSION_STARTED,          this._handleSessionStarted.bind(this) );
    this._timerSessionProxy.addListener( TimerSessionEvent.SESSION_STOPPED,          this._handleSessionStopped.bind(this) );
    this._timerSessionProxy.addListener( TimerSessionEvent.ROUND_STARTED,            this._handleRoundStarted.bind(this) );
    this._timerSessionProxy.addListener( TimerSessionEvent.TIMER_UPDATE,             this._handleTimerUpdate.bind(this) );
    this._timerSessionProxy.addListener( TimerSessionEvent.ROUND_TIME_CHANGED,       this._handleRoundTimeChanged.bind(this) );
    this._timerSessionProxy.addListener( TimerSessionEvent.COFFEE_BREAK_TIME_CHANGED,this._handleCoffeeBreakTimeChanged.bind(this) );

    this._timerView.addListener( TimerView.EVENT_START_SESSION,     this._handleStartSessionEvent.bind(this) );
    this._timerView.addListener( TimerView.EVENT_STOP_SESSION,      this._handleStopSessionEvent.bind(this) );
    this._timerView.addListener( TimerView.EVENT_START_ROUND,       this._handleRoundStartEvent.bind(this) );
    this._timerView.addListener( TimerView.EVENT_STOP_ROUND,        this._handleRoundStopEvent.bind(this) );
    this._timerView.addListener( TimerView.EVENT_ROUND_TIME_EDIT,   this._handleRoundTimeEditEvent.bind(this) );
    this._timerView.addListener( TimerView.EVENT_START_COFFEEBREAK, this._handleStartCoffeeBreakEvent.bind(this) );
};

// EVENT HANDLERS

// session related:

TimerController.prototype._handleSessionStarted = function ( event )
{
    this._handleTimerUpdate(event);
};

TimerController.prototype._handleSessionStopped = function ( event )
{
    console.log( event );
};

TimerController.prototype._handleRoundStarted = function ( event )
{
    console.log( event );
};

TimerController.prototype._handleTimerUpdate = function ( event )
{
    this._timerView.setTotalTime( event.timeUpdate.totalTime );
    this._timerView.setRoundTime( event.timeUpdate.roundTime, event.timeUpdate.roundType );
};

TimerController.prototype._handleRoundTimeChanged = function ( event )
{
    this._timerView.setRoundTime( event.timeUpdate.roundTime, event.timeUpdate.roundType );
};

TimerController.prototype._handleCoffeeBreakTimeChanged = function ( event )
{

};

// view related:
TimerController.prototype._handleRoundTimeEditEvent = function (e)
{
    this._timerSessionProxy.changeRoundTime( e.data );
};

TimerController.prototype._handleStartSessionEvent = function ()
{
    console.log("_handleStartSessionClicked");
    this._timerSessionProxy.startSession();
};

TimerController.prototype._handleStopSessionEvent = function ()
{
    console.log("_handleStopSessionClicked");
    this._timerSessionProxy.stopSession();
};

TimerController.prototype._handleRoundStartEvent = function ()
{
    console.log("_handleRoundStartClicked");
    this._timerView.setStatus("started");
    this._timerSessionProxy.startRound();
};

TimerController.prototype._handleRoundStopEvent = function ()
{
    console.log("_handleRoundStartClicked");
    this._timerView.setStatus("stopped");
    this._timerSessionProxy.stopRound();
};

TimerController.prototype._handleStartCoffeeBreakEvent = function ()
{
    console.log("_handleStartCoffeeBreakClicked");
    this._timerView.setStatus("coffee");
    this._timerSessionProxy.startCoffeeBreak();
};