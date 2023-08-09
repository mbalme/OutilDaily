/*
The class responsible for the modification of the view layer and broadcasting view related events to the app.
Only this class has actual knowledge of the view layer (in this case the DOM). This causes the view layer to be easily
replaced with another (for instance an Apcellerator app view)
 */
 
 Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

const accessTokenAirtable = "pat7WzguDsTWwJnOi.16c37f3f2234bf57f6b7b1d01858e6b6241ffbc13eb92e1c82380945dc7c9208"; /* possédé sur Benjamin Termoz*/
const accessTokenGitlab  = "glpat-xQ5Ndidv6Bz3y4Db6ZxX"; /* possédé sur Benjamin Termoz*/


var options = {weekday: "long", month: "long", day: "2-digit"};

dateSprintRef = new Date("11/09/2020");
idSprintRef = 17;
noSprint = Math.floor(Number(parseInt(Number((new Date().getTime()/86400000)-(dateSprintRef.getTime()/86400000)).toFixed(0))/14)) + idSprintRef;

debSprintCourrant = dateSprintRef;
debSprintCourrant=debSprintCourrant.addDays(14*(noSprint-idSprintRef));

finSprintCourrant =  debSprintCourrant;
finSprintCourrant=finSprintCourrant.addDays(14-3);


$("#sprint").html("<a syle='color:white !important;' href='https://canal-tracker.canal-plus.com/plugins/servlet/Wallboard/?dashboardId=23908'>"+
"<img src='https://www.nicepng.com/png/full/52-527751_pics-for-chart-icon-black-and-white-png.png' width='10' height='10'/><span style='color:white;'>"+
"Sprint "+noSprint + "</span></a><br/>" + debSprintCourrant.toLocaleDateString("fr-FR", options) + " - "+ finSprintCourrant.toLocaleDateString("fr-FR", options));


function TimerView() {
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
    $('button').tipsy({
        gravity: 's',
        fade: true,
        offset: 10
    });

    this._addListeners();

    this.loadAssets();

    this.toggleFullScreen();
}

/**
 * Inherit from EventDispatcher
 */
TimerView.prototype = Object.create(EventDispatcher.prototype);

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
TimerView.prototype._deltas = [600 * 1000, 60 * 1000, 10 * 1000, 1000];

/**
 * Static vars
 *
 * Events
 */
TimerView.EVENT_START_SESSION = "EVENT_START_SESSION";
TimerView.EVENT_STOP_SESSION = "EVENT_STOP_SESSION";
TimerView.EVENT_START_ROUND = "EVENT_START_ROUND";
TimerView.EVENT_STOP_ROUND = "EVENT_STOP_ROUND";
TimerView.EVENT_START_COFFEEBREAK = "EVENT_START_COFFEEBREAK";
TimerView.EVENT_ROUND_TIME_EDIT = "EVENT_ROUND_TIME_EDIT";
TimerView.LOW_TIME = 2;

/**
 *
 */
TimerView.prototype.toggleFullScreen = function() {

    if (!document.fullscreenElement && // alternative standard method

        !document.mozFullScreenElement && !document.webkitFullscreenElement) { // current working methods
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
TimerView.prototype.setTotalTime = function(time) {
    var d = moment.duration(time);
    this._totalTimeMinsEl.text(this.doubleDigit(d.minutes()));
    this._totalTimeSecondsEl.text(this.doubleDigit(d.seconds()));
};

/**
 *
 */
TimerView.prototype.removeStatusClasses = function() {

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
TimerView.prototype.setStatus = function(status) {

    if (!this._viewEl.hasClass("is-" + status)) {
        this.removeStatusClasses();
        this._viewEl.addClass("is-" + status);
    }
};

/**
 *
 * @param time
 * @param roundType
 */
TimerView.prototype.setRoundTime = function(time, roundType) {
    var t, m, s;

    // remember s and check for changes

    if (time < -1000) {
        t = Math.floor(Math.abs(time) / 1000);

        if (this._lastTime == t) {
            return;
        }

        if (!this._isSetupMode && time > -2000) {
            this.setStatus("negative");
            createjs.Sound.play("alarm");
        }

    } else {

        t = Math.ceil(time / 1000);

        if (this._lastTime == t) {
            return;
        }

        if (!this._isSetupMode && time < TimerView.LOW_TIME * 1000) {

            createjs.Sound.play("tick");
            this.setStatus("low");
        }
    }

    m = Math.floor(t / 60);
    s = t - (m * 60);

    var timeString = "" + this.doubleDigit(m) + this.doubleDigit(s);

    $('.digit .value', this._timerEl).each(function(index) {
        $(this).text(timeString.charAt(index));
    });

    this._lastTime = t;
};

/**
 *
 * @param number
 * @returns {*}
 */
TimerView.prototype.doubleDigit = function(number) {

    return ("0" + number).slice(-2);
};

/**
 *
 */
TimerView.prototype.startSession = function() {
    this.dispatchEvent(TimerView.EVENT_START_SESSION);
};

/**
 *
 */
TimerView.prototype.loadAssets = function() {
    createjs.Sound.registerSound("./assets/snd/tick.mp3", "tick");
    createjs.Sound.registerSound("./assets/snd/alarm.mp3", "alarm");
    createjs.Sound.registerSound("./assets/snd/blop.mp3", "start");
};

/**
 * // PRIVATE METHODS
 *
 * @private
 */
 

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

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

TimerView.prototype._addListeners = function() {
    this._btnSoundToggle.click(this._toggleSound.bind(this));
    this._btnStartTimer.click(this._startRoundHandler.bind(this, "Button"));
    this._btnStopTimer.click(this._stopRoundHandler.bind(this));
    this._btnFullscreen.click(this.toggleFullScreen.bind(this));
    this._btnStartCoffeeBreak.click(this._startCoffeeBreakClickHandler.bind(this));

            //mergerequest("mapaloo", "btermoz");

	window.open("https://canal-tracker.canal-plus.com/secure/RapidBoard.jspa?rapidView=1231&projectKey=SIPPLUS",'Popup','right=100 top=100 location=no menubar=no resizable=no scrollbars=no status=no titlebar=no toolbar=no;');
	var settings = {
			"url": "https://gitlab.canal-plus.com/api/v4/groups/104/projects?private_token="+accessTokenGitlab+"",
			"method": "GET",
			"async": false,
			"timeout": 0,
			"headers": {
				"Private-Token": "true",
			}
		};
		var projectsGit = {};

		$.ajax(settings).done(function(response) {
			projectsGit=response.filter(function(o1){return [125,121,128].some(function(o2){return o1.id==o2})});
			//console.log(projectsGit);
		});
		var branchessCompare = ["develop","vabf","master"];
		branchesCompare = [];
		for(i=0;i < branchessCompare.length-1;++i){
			branchesCompare.push([branchessCompare[i],branchessCompare[i+1]]);
		}
		
		var syntheseDiffs = "<table style='z-index:100; color:white !important;'>";
		$.each(projectsGit,function(i,projectGit){
			var projectId = projectGit["id"];
			syntheseDiffs += "<tr><td>"+ projectGit["name"] +"</td><td>";
			$.each(branchesCompare,function(k,brancheCompare){
							ligne = "";
				$.each([[brancheCompare[0],brancheCompare[1]],[brancheCompare[1],brancheCompare[0]]],function(j,brancheSens){
				if(j==0 && k==0)ligne += " " + brancheCompare[0] + " ";
				settings["url"] = "https://gitlab.canal-plus.com/api/v4/projects/"+projectId+"/repository/compare?private_token="+accessTokenGitlab+"&from="+brancheSens[1]+"&to="+brancheSens[0];
				$.ajax(settings).done(function(response) {
					if(j==1) ligne += " <=> ";
					var weburlCompare = projectGit["web_url"]+"/-/compare/"+brancheSens[1]+"..."+brancheSens[0]+"?from_project_id="+projectId;
					ligne += $("<a>"+response["diffs"].length+"</a>")
								.attr("href",weburlCompare)
								.attr("target","_blank")
								.attr("title",response["commits"].length + " commits / " + response["diffs"].length + " files changed")
								.attr("style",(j==1 && response["diffs"].length > 0) ? "font-weight:bold;color:red;": "color: white !important;")
								.prop('outerHTML')
					//console.log(brancheSens[0] + " => ");
					//console.log(response);
				});
				if(j==1)ligne += " " + brancheCompare[1] + " ";
				});
			//console.log(ligne);
			syntheseDiffs += ligne ;
			});
			syntheseDiffs += "<br/>";
			syntheseDiffs += "</td></tr>";
		});
		syntheseDiffs += "</table>";
		$("header").append(syntheseDiffs);
		$("header").append(getActionsRetro());
		/*
		let actionsretro=debSprintCourrant;
		$("header").append("<div style='padding:50px;z-index:100; color:white !important;' >"+actionsretro+"</div>");
		$("header").append('<iframe class="airtable-embed" src="https://airtable.com/embed/shrSHgiDH3As29Jte?backgroundColor=blue" frameborder="0" onmousewheel="" width="40%" height="300" style="background: transparent; border: 1px solid #ccc;"></iframe>');
		*/

		//console.log(getTicketsJira());
/*
		console.log("toto");
		settings.url = "feed.xml";
		$.ajax(settings).done(function(response) {
		console.log(response);
		//console.log(projectsGit);
		 var toto = $(response);
		 var items = $("item",toto);
			console.log($("<item>"+$(items[0]).html()+"</item>").html());
		});
	*/
		
    var participants = [

        {
        	"person":"btermoz",
        	"name":"B. Termoz"
        }
		,        
		/*{
        	"person":"mzidi",
        	"name":"Marwa"
        },*/

        {
        	"person":"aboixel",
        	"name":"Audrey"
        },
        {
            "person": "sepujol",
            "name": "Sébastien"
        },
        {
            "person": "mapaloo",
            "name": "Marius"
        },
		{
            "person": "adndiaye",
            "name": "Adja"
        },
		{
            "person": "jgenoud",
            "name": "Jérémy"
        }
		/*{
        	"person":"amehrez",
        	"name":"Achraf"
        },
        {
            "person": "souarab",
            "name": "Sofiane"
        },*/
    ];
    var devSupp = [
        {
        	"person":"nmortier",
        	"name":"Nico"
        },
        {
        	"person":"bsaul",			
        	"name":"B. Saul"
        }
    ];	
	
	for (var i = 0; i < devSupp.length; i++) {
		var settings = {
			"url": "https://gitlab.canal-plus.com/api/v4/groups/104/merge_requests?private_token="+accessTokenGitlab+"&state=opened&author_username="+devSupp[i].person,
			"method": "GET",
			"async": false,
			"timeout": 0,
			"headers": {
				"Private-Token": "true",
			}
		};

		$.ajax(settings).done(function(response) {
			if(response.length>0)participants.push(devSupp[i]);
		});	
	}
    shuffle(participants);
    // start timer on space
    i = 0;
    $(document).keydown(function(evt) {
        if (evt.keyCode == 32) {
			console.log("toto");
			$("#participantImg").hide();

		this._startRoundHandler("Spacebar");
            i = i + 1;
			if(i>participants.length) document.location.href="https://canal-tracker.canal-plus.com/plugins/servlet/Wallboard/?dashboardId=23908";
            var pers = participants[i % (participants.length)];
	        $("#participantImg").attr("src", pers.person + ".jpg");
        $("#participantName").html(name);
			
			//$("#participantImg").attr("src","");
			$("#mergerequest").html("<img src='https://media0.giphy.com/media/hqrdSW7r1DFsDZwSnR/giphy.gif?cid=6c09b952qd1mj3czb6eq8tf97dhfi1vyk4l2jzbylct3kkz9&rid=giphy.gif&ct=s' width='100' height='100'/>");
			//$("#participantName").html("");
			//$("").html(),
            mergerequest(pers.person, pers.name);
			//console.log(getTicketsJira(pers.person));
			//tickets(pers.person);
			//if(i>=(participants.length)){$("#mergerequest").prepend("<p>Tour de table OK</p>");}
						$("#participantImg").show();

        }
    }.bind(this));

    // start timer when tapping on clock on touchscreens
    this._timerEl.bind("tap", this._startRoundHandler.bind(this, "Tap"));

    this._btnSetup.click(this._toggleSetup.bind(this));

    // setup buttons
    this._addSetupButtonListeners();
};

function GetSortOrder(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

function tickets(author) {
/*
    var settings = {
        "url": "https://canal-tracker.canal-plus.com/rest/api/2/search?jql=project=SIPPLUS%20and%20assignee="+author+"%20and%20statusCategory!=Done%20and%20sprint%20in%20openSprints()&maxResults=10",
        "method": "GET",
        "timeout": 0,
        "headers": {
            //"Private-Token": "true",
			"Host": "canal-tracker.canal-plus.com",
			"Cookie":"jira.editor.user.mode=wysiwyg; JiraSDSamlssoLoginV2=_f9c6cdc5-be33-4798-bc73-04e96780c575%23%23%23Mathieu.BALME%40cpexterne.org%23%23%23http%3A%2F%2Fsignin.canal-plus.com%2Fadfs%2Fservices%2Ftrust%23%23%23TB9XS; JSESSIONID=E1A33D062FA417510A85DD31149A02F5; atlassian.xsrf.token=BA4V-5MST-FTR2-KKWE_854e75d2997153ee6d74a54f136e8175dd714a31_lin",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			"Access-Control-Allow-Origin": "https://canal-tracker.canal-plus.com",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Content-Security-Policy": "frame-ancestors 'self'",
			"Access-Control-Allow-Headers": "X-Requested-With,content-type, Authorization"
        }
    };

    $.ajax(settings).done(function(response) {
    
        
        //o=""+rett.toString()
        //console.log(o);
        //return o;
		console.log(response);
        //console.log("uuuuuu"+rett.toString());
    }).then(function() { // use a promise to make sure we synchronize off the jsonp

    });
*/
}

function commitsFromMR(projectId,mrid){
	
	    var settings = {
        "url": "https://gitlab.canal-plus.com/api/v4//projects/"+projectId+"/merge_requests/"+mrid+"/commits?private_token="+accessTokenGitlab+"",
        "method": "GET","async":false,
        "timeout": 0,
        "headers": {
            "Private-Token": "true",
        }
    }
	var ret =undefined;
    $.ajax(settings).done(function(commits) {ret=commits;});
	while(ret == undefined){}
		return ret;
}


function GetApproversFromMr(projectId,mrid){
	
	    var settings = {
        "url": "https://gitlab.canal-plus.com/api/v4//projects/"+projectId+"/merge_requests/"+mrid+"/approvals?private_token="+accessTokenGitlab+"",
        "method": "GET","async":false,
        "timeout": 0,
        "headers": {
            "Private-Token": "true",
        }
    }
	var ret =undefined;
    $.ajax(settings).done(function(commits) {ret=commits;});
	while(ret == undefined){}
		return ret;
}

function GetDiscussionsromMr(projectId,mrid){
	
	    var settings = {
        "url": "https://gitlab.canal-plus.com/api/v4//projects/"+projectId+"/merge_requests/"+mrid+"/discussions?private_token="+accessTokenGitlab+"",
        "method": "GET","async":false,
        "timeout": 0,
        "headers": {
            "Private-Token": "true",
        }
    }
	var ret =undefined;
    $.ajax(settings).done(function(commits) {ret=commits;});
	while(ret == undefined){}
		return ret;
}
const groupBy = (array, key) => {
  // Return the end result
  return array.reduce((result, currentValue) => {
    // If an array already present for key, push it to the array. Else create an array and push the object
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
    return result;
  }, {}); // empty object is the initial value for result object
};



function getActionsRetro(){
	var settings = {
	  "url": "https://api.airtable.com/v0/appdLJOmx12QyCKTH/Actions%20retro%20SIP?maxRecords=100&view=Grid%20view&sort%5B0%5D%5Bfield%5D=Created&sort%5B0%5D%5Bdirection%5D=desc",
	  "method": "GET",
	  "timeout": 0,"async":false,
	  "headers": {
		"Authorization": "Bearer "+ accessTokenAirtable  },
	};
	var resp =undefined;
    $.ajax(settings).done(function(commits) {resp=commits;});
	while(resp == undefined){}
	let actionsRetro = resp.records;//.flatMap(a=>a.fields).flatMap(a=>a.HighestSprint)

	let maxspr = Math.max(...resp.records.flatMap(a=>a.fields).flatMap(a=>a.HighestSprint))

	actionsRetro.sort(function(a, b) {
		
		//console.log(a.fields.HighestSprint+ ">= " + b.fields.HighestSprint + " ")
		//console.log(a.fields.HighestSprint>=b.fields.HighestSprint);
	  return  (a.fields.HighestSprint < b.fields.HighestSprint) ? 1 : (a.fields.HighestSprint > b.fields.HighestSprint) ? -1 : 0;
	});
	//console.log(actionsRetro);
	
	actionsRetro = actionsRetro.filter(function(rec){return (rec.fields.HighestSprint==maxspr || rec.fields.Status!="Done");})
	//console.log(actionsRetro);
	
	actionsRetro = actionsRetro.slice(0, 10)
	
	//let maxspr = Math.max(...resp.records.flatMap(a=>a.fields).flatMap(a=>a.HighestSprint))
	//let actionsRetro = resp.records.filter(function(rec){return (rec.fields.HighestSprint==maxspr);})
	//console.log(actionsRetro);
	let corpsTableau=Object.getOwnPropertyNames(groupBy(actionsRetro.flatMap(a=>a.fields),"Categ")).map(a=>
		"<tr><td style='border:1px solid white !important;'>"+a+"</td>"+
		"<td style='border:1px solid white !important;'>"+ groupBy(actionsRetro.flatMap(a=>a.fields),"Categ")[a].map(u=>
		"☐"+ ((u.Porteur==undefined) ?"":u["Porteur"].map(port=>"<img src='" + port + ".jpg' width='"+20+"' style='border-radius:"+(20/2)+"px;' title='" + port + "'/> ").join(""))+
u.Notes+"").join("<br/>")+"</td></tr>").join("");
console.log(corpsTableau);
	//let corpsTab = actionsRetro.map(a=>"<tr><td>["+a.fields.Categ+"] "+a.fields.Notes +"</td></tr>").join("")
	return 	"<br><br><table style='width:35%;color:white !important;'><thead><th></th><th><b>Dernières Actions Retro</b></th></thead><tbody>"+corpsTableau+"</tbody></table>";
}


function getTicketsJira(){
	var settings = {
	  "url": "https://canal-tracker.canal-plus.com/rest/agile/1.0/board/1619/issue?maxResults=100&jql=Sprint%20IN%20openSprints%28%29",
	  "method": "GET","async":false,
	  "timeout": 0,
	  "headers": {
		"Authorization": "Bearer OTUzNzYzNjQ3MDczOhriSt27LZI1gkBIeP5Jo6Qw9NCY",
		"Access-Control-Allow-Origin":"https://canal-tracker.canal-plus.com"
		//"Cookie": "JSESSIONID=8A9C539AA967170B33E523A44213AD39; atlassian.xsrf.token=BA4V-5MST-FTR2-KKWE_efd6fdc8834a71332c4987ca8d97142cf7d598d2_lin"
	  },
	};

	var ret =undefined;
    $.ajax(settings).done(function(commits) {ret=commits;});
	//while(ret == undefined){}
		return ret;
}
 

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function mergerequest(author, name) {

    var settings = {
        "url": "https://gitlab.canal-plus.com/api/v4/groups/104/merge_requests?private_token="+accessTokenGitlab+"&state=opened&author_username="+author,
        "method": "GET","async":true,
        "timeout": 0,
        "headers": {
            "Private-Token": "true",
        }
    };
	        $("#participantImg").attr("src", author + ".jpg");
        $("#participantName").html(name);

    $.ajax(settings).success(function(response) {
		//console.log(response);
        rett = "";
        //ret=response;
        //console.log(response);
        response.sort(GetSortOrder("created_at"));
        if (response.length) {
            rett = "<table><tbody>";
            for (var i = 0; i < response.length; i++) {
				console.log(response[i]);
				                var item2 = response[i];
								

				fileChanges = "";
				settings["url"]="https://gitlab.canal-plus.com/api/v4/projects/"+item2["project_id"]+"/merge_requests/"+item2["iid"]+"/changes?private_token="+accessTokenGitlab+"";
				    $.ajax(settings).done(function(mrchanges) {
						//console.log("filechanges");
						//console.log(mrchanges);
						fileChanges = mrchanges["changes_count"] + " files changed";
					});
                //console.log(i);
                if (true) {
                    //console.log(item2);
                    //console.log(item2["title"]);
                    var intervalTime = new Date(Date.now() - Date.parse(item2["created_at"]));
                    approves = getApprovers(item2);
					
					settingsTwo = settings;
					settingsTwo["url"]="https://gitlab.canal-plus.com/api/v4/projects/"+item2["project_id"]+"/merge_requests/"+item2["iid"]+"/discussions?private_token="+accessTokenGitlab+"";
					var patata="";
					//console.log("toto");
					//					console.log(settings);
					discussions = GetDiscussionsromMr(item2["project_id"],item2["iid"]);
					//$.ajax(settings).done(function(response) {
						console.log(discussions.flatMap(a => a.notes).map(a=>Date.parse(a["updated_at"])));
						patata =	discussions.filter(discussion=>discussion["notes"].some(thread=>thread["resolvable"]==true && thread["resolved"]==true)).length + "/" + 
									discussions.filter(discussion=>discussion["notes"].some(thread=>thread["resolvable"]==true)).length;
						//console.log("entrée"+patata);
					//}).always(function(){
							//});
							/*
							var commitersMR = commitsFromMR(item2["project_id"],item2["iid"]);
							var notesMR = discussions.flatMap(a => a.notes).map(a=>a);
							var approversMR = GetApproversFromMr(item2["project_id"],item2["iid"]);
							var interactions = [];
							console.log("interactions commitmr");
							console.log(commitersMR);
							
							console.log("notes mr");
							console.log(notesMR);

							console.log("approvers mr");
							console.log(approversMR);
							
							var total = [];
							total = total.concat(commitersMR.map(a=>Date.parse(a["created_at"])));
							total = total.concat(notesMR.map(a=>Date.parse(a["updated_at"])));
							total.push(Date.parse(approversMR["updated_at"]));

							console.log("total");
							console.log(total);
							var lastInteraction=total.sort(function (a, b) {	return  a.name > b.name ? 1 : -1;})[0];
							
							var varDateInteractMr = new Date(lastInteraction);
							console.log(varDateInteractMr.toLocaleString());
							*/
							
							var varDateInteractMr = new Date(item2["updated_at"]);
														
							styleMRObsolete="";
							console.log(addDays(varDateInteractMr,2).getTime());
							console.log(new Date().getTime());
							console.log(item2.reviewers);
							if(item2["reviewers"].length==0 || addDays(varDateInteractMr,2).getTime()<new Date().getTime()){
								console.log("obs");
								styleMRObsolete="background:indianred !important;";}
							
							//console.log(interactions);
	
							//console.log("sortie" + patata);
                    var strDuration = parseInt(intervalTime / 86400 / 1000) + 'j ' + intervalTime.toUTCString().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, "$1h");
                    rett += "<tr style='font-size:13px;text-align:left;"+styleMRObsolete+"'>" +
                        "<td style='padding:0 5px; vertical-align:top;'>" 
						+ "<img style='float: left;'src='https://cdn.iconscout.com/icon/free/png-256/gitlab-282507.png' width='20'>" + "</td>" +
                        "<td style='padding:0 5px; vertical-align:top;width: 200px !important;'>" +
							"<a style='color:white !important;' target='_blank' href='"+item2["web_url"]+"'>"+
							item2["references"]["relative"].toString().replace(item2["references"]["short"], "") + 
							"<span style='font-size: x-small;font-weight: normal;'><br/>"+item2["source_branch"] +
							"<br/>"+String.fromCharCode(0x279C)+" "+item2["target_branch"]+"</span>"+
							"</a></td>" +
                        "<td style='padding:0 5px; vertical-align:top;width: 285px !important;'>" + item2["title"].toString() + "<br/>" + approves + "</td>" +
                        "<td style='padding:0 5px; vertical-align:top;'>" + strDuration + "<br/>" + patata + "<br/>" + fileChanges + "</td>"
                        //+"<td>"+approves+"</td>"

                        +
                        "</tr>";
					        $("#participantImg").attr("src", author + ".jpg");
        $("#participantName").html(name);
                    //console.log(rett);
                }

            }
            rett += "</tbody></table>";
        }
        //o=""+rett.toString()
        //console.log(o);
        //return o;

        //console.log("uuuuuu"+rett.toString());
    }).complete(function() { // use a promise to make sure we synchronize off the jsonp
        //console.log("huhihui"+rett);
        //console.log(rett);


        //popin += "<br\>";
        //popin += rett;
        //console.log(popin);
        //$("#participant").html(popin);
		var today = new Date();
		var lastDayOfTheMonth = new Date(today.getFullYear(),today.getMonth()+1,1).addDays(-1);
		//console.log(today);
		//console.log(lastDayOfTheMonth);
		if(today >= (lastDayOfTheMonth.addDays(-7))) {rett = "<h2 style='color:red;margin:auto;'>REMPLIR MTR !</h2>"  + rett;}
        $("#mergerequest").html(rett);
    });

}

function getApprovers(mr) {

        var settings = {
            "url": "https://gitlab.canal-plus.com/api/v4/projects/"+mr["project_id"]+"/merge_requests/"+mr["iid"]+"/discussions"+"?private_token="+accessTokenGitlab+"",
            "method": "GET",
            "timeout": 0,
			"async":false,
            "headers": {
                "Private-Token": "true",
            }
        };		
		discussions = "";
        $.ajax(settings).done(function(resp) {
            discussions = resp;
            //console.log(resp);
        }).then(function() {
        });
		
    tutu = "";
    approvers = mr["reviewers"];
	approvers = approvers.filter(app=>app["username"]!="nmortier");
    approvers.sort(GetSortOrder("username"));
    for (var i = 0; i < approvers.length; i++) {
        srcimg = (approvers[i]["username"] == "mbalme") ?
            approvers[i]["avatar_url"] :
            approvers[i]["username"] + ".jpg";
        //if(i%3==0)tutu+="<br/>";

		approved=false;
        grayscale = "filter: grayscale(1);opacity:0.5;";
		
		//console.log(discussions.flatMap(a => a.notes).filter(u=>u["author"]["username"]==approvers[i]["username"]));
		threads=discussions.flatMap(a => a.notes).filter(di=>di["author"]["username"]==approvers[i]["username"]);
		//console.log(approvers[i]["username"] + " " + threads.filter(thread=>thread["resolvable"]==true && thread["resolved"]==true).length+"/"+threads.filter(thread=>thread["resolvable"]==true).length);
		discussTrouve=false;
		for(j=0; j<discussions.length;j++){
			for(k=0; k<discussions[j]["notes"].length;k++){
				if(discussions[j]["notes"][k]["author"]["username"]==approvers[i]["username"]){
					//grayscale=""; 
					discussTrouve=true; break;}
			}
			if(discussTrouve) break;
		}

        var settings = {
            "url": "https://gitlab.canal-plus.com/api/v4/projects/"+mr["project_id"]+"/merge_requests?private_token="+accessTokenGitlab+"&state=opened&approved_by_ids[]=" + approvers[i]["id"] + "&iids[]=" + mr["iid"],
            "method": "GET",
            "timeout": 0,
			"async":false,
            "headers": {
                "Private-Token": "true",
            }
        };		
        $.ajax(settings).done(function(resp) {
            euh = resp;
            //console.log(resp);
        }).then(function() {
            //console.log("hey");
            //console.log(euh);
            if (euh.length > 0) {
                //grayscale = "";
				approved=true;
            }
        });
		
		threadsOpened =threads.filter(thread=>thread["resolvable"]==true && thread["resolved"]==true).length+"/"+threads.filter(thread=>thread["resolvable"]==true).length;
		if(approved || threads.some(thread=>thread["resolvable"]==true)){grayscale=""};
		
		widthImage=30;
		tutu+="<span>";
		apprName=approvers[i]["name"].toString().split(" ")[1];
        tutu += "<img src='" + srcimg + "' width='"+widthImage+"' style='border-radius:"+(widthImage/2)+"px;" + grayscale + "' title='" + apprName + "  " + threadsOpened +"'/> ";
		if(approved)tutu += "<img src='https://images.emojiterra.com/google/android-pie/512px/2714.png' width='"+widthImage+"'  title='" + apprName + "' style='border-radius: "+(widthImage/2)+"px;position: absolute;margin-left: -"+widthImage+"px;'>";
		tutu += "</span>"
    }
    return tutu;
}
/**
 *
 * @private
 */
TimerView.prototype._addSetupButtonListeners = function() {

    var thisTimerView = this;

    var buttonDownTimeout;

    // yes!!
    var editDigit = function(e) {

        e.stopPropagation();

        var el = $(this);
        var minus = false;

        var parent = el.parents(".digit");
        var digit = parent.data("digit");
        var valueEl = $(".value", parent);
        var value = parseInt(valueEl.text());

        if (el.hasClass("minus")) {
            minus = true;
        }

        var timeChange = minus ? -thisTimerView._deltas[digit] : thisTimerView._deltas[digit];

        var event = {
            type: TimerView.EVENT_ROUND_TIME_EDIT,
            data: timeChange,
            timeUpdate: {
                roundType: RoundType.NORMAL,
                roundTime: null,
                roundTimeChange: timeChange
            }
        };

        thisTimerView.dispatchEvent(event);
    };

    $('button', this._timerEl).bind('vmousedown', function(e) {

        editDigit.call(this, e);

        clearInterval(buttonDownTimeout);
        buttonDownTimeout = setInterval(editDigit.bind(this, e), 200);

    }).bind('vmouseup', function(e) {

        clearInterval(buttonDownTimeout);
    });
};

/**
 *
 * @private
 */
TimerView.prototype._showFlash = function() {

    var flash = $(".flash");

    flash.removeClass("hidden");

    setTimeout(function() {

        flash.addClass("hidden");
    }, 1);
};

/**
 *
 * @private
 */
TimerView.prototype._toggleSound = function() {

    if (createjs.Sound.getMute()) {

        createjs.Sound.setMute(false);
        this._btnSoundToggle.removeClass("muted");

        // track
        ga('send', 'event', 'Application', 'Sound On');

    } else {

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
TimerView.prototype._toggleSetup = function() {

    this._viewEl.toggleClass("is-setup");
    this.removeStatusClasses();

    if (this._viewEl.hasClass('is-setup')) {

        this.dispatchEvent(TimerView.EVENT_STOP_ROUND);
        this._isSetupMode = true;

        // track setup click
        ga('send', 'event', 'Application', 'Setup View');

        return;
    }

    // track new time setup when leaving setup - ugly but nasty
    var setupTime = 0;
    var thisTimerView = this;
    $('.digit .value', this._timerEl).each(function(index) {

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
TimerView.prototype._startRoundHandler = function(trackSource) {
    if (this._isSetupMode) {
        this._toggleSetup();
    }

    this.dispatchEvent(TimerView.EVENT_START_ROUND);
    createjs.Sound.play("blop");

    this._showFlash();

    // track
    ga('send', 'event', 'Clock', 'Start new round', trackSource);
};

/**
 *
 * @private
 */
TimerView.prototype._stopRoundHandler = function() {
    this.removeStatusClasses();
    this.dispatchEvent(TimerView.EVENT_STOP_ROUND);
};

/**
 *
 * @private
 */
TimerView.prototype._startCoffeeBreakClickHandler = function() {
    this.dispatchEvent(TimerView.EVENT_START_COFFEEBREAK);

    ga('send', 'event', 'Clock', 'Start Coffee Break');
};