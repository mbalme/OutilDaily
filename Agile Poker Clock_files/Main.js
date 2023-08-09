
/*
Main class responsible for starting the app
 */

function Main ()
{
    var console = {};
    console.log = function(){};

    this.timerSession = new TimerSessionProxy();
    this.timerView = new TimerView();
    this.timerController = new TimerController( this.timerSession, this.timerView );

    this.timerView.startSession();
}

$(function(){main = new Main();});