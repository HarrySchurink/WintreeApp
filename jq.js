//applicatie object..........
var guo_app = new Object();
guo_app.proxy = '';
guo_app.loginusername = '';
guo_app.loginpassword = '';
guo_app.loginip = '';
guo_app.maxrows = 1000;


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

//selectierecord
var selection = new Object();
selection.id = 0;
selection.description = '';
var current_selection = 0;

var console_type = 'console';   //maak hier alert van om alle consol meldingen naar scherm te zetten (in app is console niet te benaderen)

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
		if (custdetail.id == 0 ) {
			$.mobile.changePage('#contacts');
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
	
	$( '#selections' ).live( 'pagebeforeshow',function(event){
			ListDbSelections() ;
	});


	$("#ul_selections").on("click", ".selectionlink", function() { 
		countContacts($(this).attr('rel'));
		return false;
	} );
	
	
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
      
	$("#searchcust").on( 'click',  function(event) {
//		countAndImportContacts();
//		importSelections();
//		countContacts();
		ListDbContacts() ;
	})
      
	$("#importsel").on( 'click',  function(event) {
		importSelections();
	})
	
	onDbLoad();
	waitOff();
})
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
function countContacts(ai_selection) { 
	$('#input_custsearch').val('');
	current_selection = ai_selection;
	console_log('countAndImportContacts()');
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
//	params.params = '?as_deviceid=HARRYTEST&selection='+ai_selection+'&ai_page=1&ai_limit='+guo_app.maxrows;
	params.params = '?as_deviceid=HARRYTEST&ai_selection='+current_selection+'&ai_page=1&ai_limit='+guo_app.maxrows;
	console_log(params.params);
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
		success : countContactsCb,
		error: ajaxCallFailed,
		failure: ajaxCallFailed
	}); 
} 

function countContactsCb(data) {

	buildDb('contacts');
	console_log('countContactsCb()');
	var row = data.row[0];
	wsrowcount = row.rows;	
	wspages = Math.ceil(wsrowcount/1000);
	wspagesize = wsrowcount / wspages;
	wspagesize = Math.ceil(wspagesize);
	wscurpage = 1;
	importContacts();
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
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	 
	db = openDatabase(shortName, version, displayName,maxSize);
		 
}

function sqlCallbackClear(){
	console_log('sqlCallbackClear()');
};

/////////////////////////////////////////////////////////////////////////////////////////////////
 
function ListDbContacts() {
	console_log('ListDbContacts()');

// list the values in the database to the screen using jquery to update the #lbUsers element
 
	if (!window.openDatabase) {
		return;
	}
	
	db.transaction(function(transaction) {
		var ls_where = ' 1 = 1 ';
		
		var ls_search = $('#input_custsearch').val();
		if ( ls_search ) {
			ls_search.replace(" ", "%");	
			ls_where = ls_where + " AND ( contactname like '%" + ls_search + "%' or sort like '%" + ls_search + "%') ";
		}
		
		
		
		var ls_sql = "SELECT * FROM contacts WHERE "+ls_where+" ORDER by contactname LIMIT 100;";
		console_log(ls_sql);
		transaction.executeSql(ls_sql, 
		[],
		function(transaction, result) {
			if (result != null && result.rows != null) {
				var html='';
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					html += '<li ><a class="custlink" data-transition="slide" rel="'+row.contactid+'" href="#custdetail">'+row.contactname+ ' | ' + row.city + ' ['+row.sort+']</a></li>';

				}
				$("#ul_klanten").empty();
				$('#ul_klanten').append($(html));
				$('#ul_klanten').trigger('create');    
				$('#ul_klanten').listview('refresh');
				
			}
		},
		errorHandler);
		},errorHandler,listDbContactsHandler);
	return;
 
}

function listDbContactsHandler(){
	console_log('listDbContactsHandler' );
	
	waitOff();
	$.mobile.changePage('#contacts');

};

/////////////////////////////////////////////////////////////////////////////////////////////////
 
function ListDbSelections() {
	waitOn();
	waitMsg('Retrieving selections');
	console_log('ListDbContacts()');

// list the values in the database to the screen using jquery to update the #lbUsers element
 
	if (!window.openDatabase) {
		return;
	}
	
	db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM selections  WHERE selectionid > 0 ORDER by description;', 
		[],
		function(transaction, result) {
			if (result != null && result.rows != null) {
				var html='';
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					html += '<li ><a class="selectionlink" data-transition="slide" rel="'+row.selectionid+'" href="#selectiondetail">'+row.description+  ' ['+row.selectionid+']</a></li>';

				}
				$("#ul_selections").empty();
				$('#ul_selections').append($(html));
				$('#ul_selections').trigger('create');    
				$('#ul_selections').listview('refresh');
				
			}
		},
		errorHandler);
		},errorHandler,listDbSelectionsHandler);
	return;
 
}

function listDbSelectionsHandler(){
	waitOff();
};



//////////////////////////////////////////////////////////////////////////////////////////

function retrieveCustDetails(relid) {
	if (!window.openDatabase) {
		return;
	}
	console_log('retrieveCustDetails - '+relid);
	db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM contacts Where contactid = ' + relid, 
				[],
				function(transaction, result) {
						
					if (result != null && result.rows != null) {
						var row = result.rows.item(0);
						custdetail.id 		= row.contactid;
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

function listDbHandler() {
	console_log('listDbHandler()');
}

/////////////////////////////////////////////////////////////////////////

function importContacts() { 
	if (wscurpage > wspages) {
		ListDbContacts();
		return;
	}
	console_log('importContacts('+wscurpage+')');
	var params = new Object();
	//Algemene paramters (uit de settings dus)
	params.loginip = guo_app.loginip;
	params.loginusername = guo_app.loginusername;
	params.loginpassword = guo_app.loginpassword;
	params.commandid = 'contacts';
	params.page = wscurpage;
	params.limit = wspagesize;
//	params.params = '?selection=228&ai_page=1&ai_limit='+guo_app.maxrows;
	params.params = '?as_deviceid=HARRYTEST&ai_selection='+current_selection+'&ai_page='+wscurpage+'&ai_limit='+wspagesize;
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
		success : importContactsCallback,
		error: ajaxCallFailed,
		failure: ajaxCallFailed
	}); 
} 

function importContactsCallback(data) {

	wscurpage = wscurpage + 1;

	console_log('importContactsCallback('+wscurpage+')');
	
	if ( wscurpage  <= wspages + 1) {
		addAllContactsToDB(data);
		
	} else {

		ListDbContacts();
		
	}

}


function addAllContactsToDB(data) {

	console_log('addAllContactsToDB(start)');
 
	if (!window.openDatabase) {
		return;
	}
	 
	
	db.transaction(function(tx) {

		//var head = $("#headerteller");
		waitMsg('Start processing data');
		console_log('Start processing data');
		transactionProcessing = 0;
		$.each(data.row, function(index, item) {
			transactionProcessing = transactionProcessing + 1;
					
			tx.executeSql('INSERT INTO  contacts(contactid, contactname, city, sort, phone1, email, longitude, latitude)VALUES (?,?,?,?,?,?,?,?)',
							[item.id, item.contactname, item.city, item.sort, item.phone1, item.email, item.longitude, item.latitude],
							sqlCallbackImportContacts,
							errorHandler
						);
		});
		
		//alert('adsf');
	});
	
	console_log('addAllContactsToDB(stop)');
 
	return false;
 
}

function sqlCallbackImportContacts(){
	
	//console_log('sqlCallbackImportContacts()');
	transactionProcessing = transactionProcessing - 1;
	waitMsg('Processing data: ' + transactionProcessing);
	
	if (transactionProcessing == 0) {
//		waitOff();

		importContacts();

			
	}

};


/////////////////////////////////////////////////////////////////////////

function importSelections() { 
	
	buildDb('selections');
	
	console_log('importSelections('+wscurpage+')');
	var params = new Object();
	//Algemene paramters (uit de settings dus)
	params.loginip = guo_app.loginip;
	params.loginusername = guo_app.loginusername;
	params.loginpassword = guo_app.loginpassword;
	params.commandid = 'selections_get';
	params.page = wscurpage;
	params.limit = wspagesize;
//	params.params = '?selection=228&ai_page=1&ai_limit='+guo_app.maxrows;
	var jparams = JSON.stringify(params);
	

	//alert(guo_app.proxy);
	waitOn();
	waitMsg('Retrieving selections: ');
	$.ajax({
		type: "get", 
		url: guo_app.proxy,
		data: {'jsonparams':jparams},
		dataType: "jsonp",
		contentType: "application/json; charset=utf-8",
		success : importSelectionsCallback,
		error: ajaxCallFailed,
		failure: ajaxCallFailed
	}); 
} 

function importSelectionsCallback(data) {

	addAllSelectionsToDB(data);

}

function addAllSelectionsToDB(data) {

	console_log('addAllSelectionsToDB(start)');
 
	if (!window.openDatabase) {
		return;
	}
	 
	
	db.transaction(function(tx) {

		waitMsg('Start processing data');
		console_log('Start processing data');
		transactionProcessing = 0;
		$.each(data.row, function(index, item) {
			transactionProcessing = transactionProcessing + 1;
					
			tx.executeSql('INSERT INTO  selections(selectionid, description)VALUES (?,?)',
							[item.id, item.description],
							sqlCallbackImportSelections,
							errorHandler
						);
		});
		
		//alert('adsf');
	});
	
	return false;
 
}

function sqlCallbackImportSelections(){
	
	transactionProcessing = transactionProcessing - 1;
	waitMsg('Processing data: ' + transactionProcessing);
	
	if (transactionProcessing == 0) {

		ListDbSelections();
			
	}

};


//////////////////////////////////////////////////////////////////////////////////////////////////////


function ajaxCallFailed(error) {
	console_log('ajaxCallFailed()');
	alert('ajaxfail');
	waitOff();
}

function buildDb(tablename) {
	//opruimen oude data en opnieuw maken database
	db.transaction(function(tx){
		if (tablename == 'contacts' || tablename == '*all*') {
			console_log('clearTable contacts');
			tx.executeSql( 'DROP TABLE IF EXISTS contacts', [],sqlCallbackClear,errorHandler);
			tx.executeSql( 'CREATE TABLE IF NOT EXISTS contacts(contactid INTEGER NOT NULL PRIMARY KEY, contactname TEXT NOT NULL, city TEXT NOT NULL, sort TEXT NOT NULL, phone1 TEXT NOT NULL, email TEXT NOT NULL, longitude TEXT NOT NULL, latitude TEXT NOT NULL)', [],sqlCallbackClear,errorHandler);
			tx.executeSql( 'DELETE FROM contacts', [],sqlCallbackClear,errorHandler);
		}
		if (tablename == 'selections' || tablename == '*all*') {
			console_log('clearTable selections');
			tx.executeSql( 'DROP TABLE IF EXISTS selections', [],sqlCallbackClear,errorHandler);
			tx.executeSql( 'CREATE TABLE IF NOT EXISTS selections(selectionid INTEGER NOT NULL PRIMARY KEY, description TEXT NOT NULL)', [],sqlCallbackClear,errorHandler);
			tx.executeSql( 'DELETE FROM selections', [],sqlCallbackClear,errorHandler);
		}

	},errorHandler,successCallBack);
		

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
	if (console_type == 'alert') {
		alert(msg);
	} else {
		console.log(msg);
	}
}