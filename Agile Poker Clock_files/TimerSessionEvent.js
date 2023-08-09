function TimerSessionEvent ( type, timeUpdate )
{
    Event.call( this, type );
    this.timeUpdate = timeUpdate;
}

TimerSessionEvent.prototype = Object.create( Event.prototype );

TimerSessionEvent.TIMER_UPDATE              = "time_update";
TimerSessionEvent.SESSION_STARTED           = "session_started";
TimerSessionEvent.SESSION_STOPPED           = "session_stopped";
TimerSessionEvent.ROUND_STARTED             = "round_started";
TimerSessionEvent.ROUND_TIME_CHANGED        = "round_time_changed";
TimerSessionEvent.COFFEE_BREAK_TIME_CHANGED = "coffee_break_time_changed";


TimerSessionEvent.prototype.toString = function ()
{
    return Event.prototype.toString.call( this ) + " timeUpdate: " + this.timeUpdate.toString();
};