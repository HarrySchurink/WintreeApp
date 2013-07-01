//applicatie object..........
var guo_app = new Object();
guo_app.proxy = '';
guo_app.loginusername = '';
guo_app.loginpassword = '';
guo_app.loginip = '';
guo_app.maxrows = 10000;


// global variables
var db;
var shortName = 'WebSqlDB';
var version = '1.0';
var displayName = 'WebSqlDB';
var maxSize = 6553500;
 
//klantrecord
 var custdetail = new Object();
custdetail.id = 0;
custdetail.sort = '';
custdetail.contactname = '';
custdetail.city = '';
custdetail.phone1 = '';
custdetail.email = '';
custdetail.longitude = '';
custdetail.latitude = '';
var customers = [];

var alerten = 'N';

var transactionCount = 0;
var transactionProcessing = 0;
var wsrowcount = 0;
var wspages = 0;
var wscurpage = 0;
var wspagesize = 0;

document.addEventListener("deviceready", deviceInfo, false);

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console_log('Received Event: ' + id);
    },
    scan: function() {
        console_log('scanning');
        try {
            window.plugins.barcodeScanner.scan(function(args) {
                console_log("Scanner result: \n" +
                    "text: " + args.text + "\n" +
                    "format: " + args.format + "\n" +
                    "cancelled: " + args.cancelled + "\n");
                /*
                if (args.format == "QR_CODE") {
                    window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
                }
                */
                document.getElementById("info").innerHTML = args.text;
                console_log(args);
        });
        } catch (ex) {
            console_log(ex.message);
        }
    }

};


$(document).ready(function() {
	//initialiseren
	waitOn();
	waitMsg('Starting up');
	onDeviceReady();
	
	//barcode scanner
	app.initialize();
	
	//alert(guo_app.loginusername);
	if (!guo_app.loginusername) {
		document.location.href='#login';
	}
	
	$( '#login' ).live( 'pagebeforeshow',function(event){
		$('#username').val(guo_app.loginusername);
		$('#password').val(guo_app.loginpassword);
		$('#loginip').val(guo_app.loginip);
		$('#proxy').val(guo_app.proxy);
	});
	$( '#custdetail' ).live( 'pagebeforeshow',function(event){
		if (custdetail.id == 10 ) {
			$.mobile.changePage('#subone');
			return;
		} else {
		
			$('#customerid_t').html(custdetail.id);
			$('#customersort_t').html(custdetail.contactname);
			$('#customercity_t').html(custdetail.city);
			$('#customerphone1_t').html(custdetail.phone1);
			$("#customeremail").attr("href", "mailto:" + custdetail.email);
			$("#customeremail").html("Email " + custdetail.email);
			$("#customeremail_t").html(  custdetail.email);
			$("#customerphone1").attr("href", "tel:" + custdetail.phone1);
			$("#customerphone1").html("Call " + custdetail.phone1);
			$("#customerphone1_t").html( custdetail.phone1);
			$("#googlemap").attr(  "src"  , "http://maps.googleapis.com/maps/api/staticmap?center="+custdetail.longitude+","+custdetail.latitude+"&zoom=12&size=300x300&markers=color:blue%7Clabel:A%7C"+custdetail.longitude+","+custdetail.latitude+"&maptype=roadmap18&sensor=false" );
		}

		
	});
	
	
	$("#ul_klanten").on("click", ".custlink", function() { 
		retrieveCustDetails($(this).attr('rel'));
		return false;
	} );
	
	
	$(".loginButton").on( 'click',  function(event) {
		window.localStorage.setItem("guo_app.loginusername", $('#username').val());
		window.localStorage.setItem("guo_app.loginpassword", $('#password').val());
		window.localStorage.setItem("guo_app.loginip", $('#loginip').val());
		window.localStorage.setItem("guo_app.proxy", $('#proxy').val());
		initGlobals();
		$('#settingsmsg').html('Safe succesfull');
		//$.mobile.changePage('#hoofdmenu');
	});

	$("#getws").on( 'click',  function(event) {
		callWebservice();
	})
      
	$("#getws2").on( 'click',  function(event) {
		countWs();
	})
	
	onDbLoad();
	waitOff();
})
   

function countWs() { 

	console_log('countWs('+wscurpage+')');

	var params = new Object();
	//Algemene paramters (uit de settings dus)
	params.loginip = guo_app.loginip;
	params.loginusername = guo_app.loginusername;
	params.loginpassword = guo_app.loginpassword;
	params.commandid = 'contacts_count';
	//params.viewid = '';
	params.page = '1';
	params.limit = '50';
//	params.params = '?selection=228&ai_page=1&ai_limit='+guo_app.maxrows;
	params.params = '?ai_page=1&ai_limit='+guo_app.maxrows;
	//Omzettten naar json string
	var jparams = JSON.stringify(params);
	

	//alert(guo_app.proxy);
	waitOn();
	waitMsg('Counting webservice ...');
	$.ajax({
		type: "get", 
		url: guo_app.proxy,
		data: {'jsonparams':jparams},
		dataType: "jsonp",
		contentType: "application/json; charset=utf-8",
		success : countWsCallback,
		error: ajaxCallFailed,
		failure: ajaxCallFailed
	}); 
} 

function countWsCallback(data) {
	console_log('countWsCallback()');
	var row = data.row[0];
	wsrowcount = row.rows;	
	wspages = 5;
	wspagesize = wsrowcount / wspages;
	wspagesize = Math.ceil(wspagesize);
	wscurpage = 1;
	processWs();
}

/////////////////////////////////////////////////////////////////////////

function processWs() { 
	if (wscurpage > wspages) {
		ListDBValues();
		return;
	}
	console_log('processWs('+wscurpage+')');
	var params = new Object();
	//Algemene paramters (uit de settings dus)
	params.loginip = guo_app.loginip;
	params.loginusername = guo_app.loginusername;
	params.loginpassword = guo_app.loginpassword;
	params.commandid = 'contacts';
	params.page = wscurpage;
	params.limit = wspagesize;
//	params.params = '?selection=228&ai_page=1&ai_limit='+guo_app.maxrows;
	params.params = '?ai_page='+wscurpage+'&ai_limit='+wspagesize;
	var jparams = JSON.stringify(params);
	

	//alert(guo_app.proxy);
	waitOn();
	waitMsg('Retrieving: ' + ( (wscurpage-1)  * (100 / wspages) )  +'-'  + ( wscurpage  * (100 / wspages) )  +'%');
	$.ajax({
		type: "get", 
		url: guo_app.proxy,
		data: {'jsonparams':jparams},
		dataType: "jsonp",
		contentType: "application/json; charset=utf-8",
		success : processWsCallback,
		error: ajaxCallFailed,
		failure: ajaxCallFailed
	}); 
} 

function processWsCallback(data) {

	wscurpage = wscurpage + 1;

	console_log('processWsCallback('+wscurpage+')');
	
	if ( wscurpage  <= wspages + 1) {
		AddAllCustToDB(data);
		
	} else {

		ListDBValues();
		
	}

}


function ajaxCallFailed(error) {
	console_log('ajaxCallFailed()');
	waitOff();
}

function onDeviceReady() {
	initGlobals();
}
function initGlobals() {
	if (!window.localStorage.getItem("guo_app.loginip")) {
		window.localStorage.setItem("guo_app.loginip", 'wstsd.wintreemobile.nl:4496/ws_tsd99/DEVELOPER_ws_AWT_sp_');
	}
	if (!window.localStorage.getItem("guo_app.proxy")) {
		window.localStorage.setItem("guo_app.proxy", 'https://www.treecommerce.net/WintreeApp/callback.php?callback=?');
	}
	if (!window.localStorage.getItem("guo_app.loginusername")) {
		window.localStorage.setItem("guo_app.loginusername", 'hg');
	}
	if (!window.localStorage.getItem("guo_app.loginpassword")) {
		window.localStorage.setItem("guo_app.loginpassword", 'FC59HL1');
	}
	guo_app.loginusername = window.localStorage.getItem("guo_app.loginusername")
	guo_app.loginpassword = window.localStorage.getItem("guo_app.loginpassword")
	guo_app.loginip = window.localStorage.getItem("guo_app.loginip")
	guo_app.proxy = window.localStorage.getItem("guo_app.proxy")
	

}

function deviceInfo() {
		$("#deviceInfo").html('Device Name: '     + device.name     + '<br />' + 
		                'Device PhoneGap: ' + device.phonegap + '<br />' + 
                        'Device Platform: ' + device.platform + '<br />' + 
                        'Device UUID: '     + device.uuid     + '<br />' + 
                        'Device Version: '  + device.version  + '<br />');	

}


// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
	console_log('errorHandler()');

	alert('Error: ' + error.message + ' code: ' + error.code);
}
 
// this is called when a successful transaction happens
function successCallBack() {
	console_log('successCallBack()');

	//alert("DEBUGGING: success");
}

 


 
// called when the application loads
function onDbLoad(){
	console_log('onDbLoad()');

	 
	// This alert is used to make sure the application is loaded correctly
	// you can comment this out once you have the application working
	//alert("DEBUGGING: we are in the onBodyLoad() function");
	 
	if (!window.openDatabase) {
		// not all mobile devices support databases if it does not, thefollowing alert will display
		// indicating the device will not be albe to run this application
		alert('Databases are not supported in this browser.');
		return;
	}
	 
	db = openDatabase(shortName, version, displayName,maxSize);
	 
	db.transaction(function(tx){
		tx.executeSql( 'DROP TABLE IF EXISTS User', [],sqlCallbackClear,errorHandler);
		tx.executeSql( 'CREATE TABLE IF NOT EXISTS User(UserId INTEGER NOT NULL PRIMARY KEY, contactname TEXT NOT NULL, city TEXT NOT NULL, sort TEXT NOT NULL, phone1 TEXT NOT NULL, email TEXT NOT NULL, longitude TEXT NOT NULL, latitude TEXT NOT NULL)', [],sqlCallbackClear,errorHandler);
		tx.executeSql( 'DELETE FROM User', [],sqlCallbackClear,errorHandler);

		},errorHandler,successCallBack);
	 
}

function sqlCallbackClear(){
	console_log('sqlCallbackClear()');
};

/////////////////////////////////////////////////////////////////////////////////////////////////
 
function ListDBValues() {
	console_log('ListDBValues()');

// list the values in the database to the screen using jquery to update the #lbUsers element
 
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	
	db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM User ORDER by contactname LIMIT 100;', 
		[],
		function(transaction, result) {
			if (result != null && result.rows != null) {
				var html='';
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					html += '<li ><a class="custlink" data-transition="slide" rel="'+row.UserId+'" href="#custdetail">'+row.contactname+ ' | ' + row.city + ' ['+row.UserId+']</a></li>';

				}
				$("#ul_klanten").empty();
				$('#ul_klanten').append($(html));
				$('#ul_klanten').trigger('create');    
				$('#ul_klanten').listview('refresh');
				
			}
		},
		errorHandler);
		},errorHandler,listDbHandler);
	return;
 
}

function listDbHandler(){
	waitOff();
	console_log('listDbHandler()');
};


/////////////////////////////////////////////////////////////////////////////////////////////////

function AddAllCustToDB(data) {

	console_log('AddAllCustToDB(start)');
 
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	 
	
	db.transaction(function(tx) {

		//var head = $("#headerteller");
		waitMsg('Start processing data');
		console_log('Start processing data');
		transactionProcessing = 0;
		$.each(data.row, function(index, item) {
			transactionProcessing = transactionProcessing + 1;
					
			tx.executeSql('INSERT INTO User(UserId, contactname, city, sort, phone1, email, longitude, latitude)VALUES (?,?,?,?,?,?,?,?)',
							[item.id, item.contactname, item.city, item.sort, item.phone1, item.email, item.longitude, item.latitude],
							sqlCallbackSync,
							errorHandler
						);
		});
		
		//alert('adsf');
	});
	
	console_log('AddAllCustToDB(stop)');
 
	return false;
 
}

function sqlCallbackSync(){
	
	//console_log('sqlCallbackSync()');
	transactionProcessing = transactionProcessing - 1;
	waitMsg('Processing data: ' + transactionProcessing);
	
	if (transactionProcessing == 0) {
		waitOff();

		processWs();

			
	}

};


//////////////////////////////////////////////////////////////////////////////////////////

function retrieveCustDetails(relid) {
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	
	db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM User Where UserId = ' + relid, 
				[],
				function(transaction, result) {
						
					if (result != null && result.rows != null) {
						var row = result.rows.item(0);
						custdetail.id 		= row.UserId;
						//custdetail.sort		= customers[$(this).attr('rel')]['sort'];
						custdetail.contactname		= row.contactname;
						custdetail.city 	= row.city;
						custdetail.phone1 	= row.phone1;
						custdetail.email 	= row.email;
						custdetail.longitude 	= row.city.longitude;
						custdetail.latitude 	= row.city.latitude;
						
						$.mobile.changePage('#custdetail');

					}
				}
				,
				errorHandler
				);
		},errorHandler,listDbHandler);
	return;
}

		
function waitOn() {
	$('#waitbox').show();
}

function waitOff() {
	$('#waitbox').hide();
	console_log('Klaar en wegweze');
}

function waitMsg(msg) {
	//$('#waitbox').show();
	$('#waitmsg').html(msg);
	
}

function console_log(msg) {
	if (alerten == 'J') {
		alert(msg);
	} else {
		console.log(msg);
	}
}