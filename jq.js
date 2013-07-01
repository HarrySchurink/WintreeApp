//applicatie object..........
var guo_app = new Object();
guo_app.proxy = '';
guo_app.loginusername = '';
guo_app.loginpassword = '';
guo_app.loginip = '';
guo_app.maxrows = 5000;


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

        console.log('Received Event: ' + id);
    },
    scan: function() {
        console.log('scanning');
        try {
            window.plugins.barcodeScanner.scan(function(args) {
                console.log("Scanner result: \n" +
                    "text: " + args.text + "\n" +
                    "format: " + args.format + "\n" +
                    "cancelled: " + args.cancelled + "\n");
                /*
                if (args.format == "QR_CODE") {
                    window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
                }
                */
                document.getElementById("info").innerHTML = args.text;
                console.log(args);
        });
        } catch (ex) {
            console.log(ex.message);
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
			$.mobile.changePage('#subone');
			return;
		} else {
			//$('#customerdetails').html(custdetail.id + '<br />'+custdetail.sort+'<br />'+custdetail.city+'<br />'+custdetail.phone1+'<br />'+custdetail.email);
			$('#customerid_t').html(custdetail.id);
			$('#customersort_t').html(custdetail.contactname);
			$('#customercity_t').html(custdetail.city);
			$('#customerphone1_t').html(custdetail.phone1);
			//$('#customeremail').val(custdetail.email);
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
		custdetail.id 		= customers[$(this).attr('rel')]['id'];
		custdetail.sort		= customers[$(this).attr('rel')]['sort'];
		custdetail.contactname		= customers[$(this).attr('rel')]['contactname'];
		custdetail.city 	= customers[$(this).attr('rel')]['city'];
		custdetail.phone1 	= customers[$(this).attr('rel')]['phone1'];
		custdetail.email 	= customers[$(this).attr('rel')]['email'];
		custdetail.longitude 	= customers[$(this).attr('rel')]['longitude'];
		custdetail.latitude 	= customers[$(this).attr('rel')]['latitude'];
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
		customerSearch();
	})
	
	onDbLoad();
	waitOff();
})
   
function customerSearch() /*Add parameters and what not*/ { 

	var params = new Object();
	//Algemene paramters (uit de settings dus)
	params.loginip = guo_app.loginip;
	params.loginusername = guo_app.loginusername;
	params.loginpassword = guo_app.loginpassword;
	//parameters bij deze  call; bv via parameters in deze functie..
	params.commandid = 'contacts';
	params.commandid = '';
	//params.viewid = '';
	params.page = '1';
	params.limit = '50';
//	params.params = '?selection=228&ai_page=1&ai_limit='+guo_app.maxrows;
	params.params = '?ai_page=1&ai_limit='+guo_app.maxrows;
	//Omzettten naar json string
	var jparams = JSON.stringify(params);
	
//alert(guo_app.proxy);
	waitOn();
	waitMsg('Retrieving webservice ...');
	$.ajax({
		type: "get", 
		url: guo_app.proxy,
		data: {'jsonparams':jparams},
		dataType: "jsonp",
		contentType: "application/json; charset=utf-8",
		success : customerSearchResult,
		error: ajaxCallFailed,
		failure: ajaxCallFailed
	}); 
} 

function customerSearchResult(data) {
	var html ='';
	if (data.errortxt) {
		alert('Error: (' + data.errorno + ') ' +data.errortxt);
	} else {
		AddAllCustToDB(data);
		return;
		var teller = 0;
		//emptyCustDB();
		
		$.each(data.row, function(index, item) {
			customers[teller] = [];
			customers[teller]['id'] = item.id;
			customers[teller]['sort'] = item.sort;
			customers[teller]['contactname'] = item.contactname;
			customers[teller]['city'] = item.city;
			customers[teller]['phone1'] = item.phone1;
			customers[teller]['email'] = item.email;
			customers[teller]['longitude'] = item.longitude;
			customers[teller]['latitude'] = item.latitude;
			AddCustToDB(item.contactname,  item.city)
			html += '<li ><a class="custlink" data-transition="slide" rel="'+teller+'" href="#custdetail">'+item.contactname+ ' | ' + item.city + '</a></li>';
			teller = teller + 1;
		});
//alert(teller);
		$("#ul_klanten").empty();
		$('#ul_klanten').append($(html));
		$('#ul_klanten').trigger('create');    
		$('#ul_klanten').listview('refresh');
	}
	waitOff();
}


function ajaxCallFailed(error) {
	alert('Ajaxcall Failed');
	waitOff();
}

function onDeviceReady() {
	initGlobals();
}
function initGlobals() {
	if (!window.localStorage.getItem("guo_app.loginip")) {
		window.localStorage.setItem("guo_app.loginip", 'wstsd.wintreemobile.nl:4496/ws_tsd99/ws_AWC_sp_contacts_get');
	}
	if (!window.localStorage.getItem("guo_app.proxy")) {
		window.localStorage.setItem("guo_app.proxy", 'https://www.treecommerce.net/WintreeApp/callback.php?callback=?');
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
	alert('Error: ' + error.message + ' code: ' + error.code);
}
 
// this is called when a successful transaction happens
function successCallBack() {
	//alert("DEBUGGING: success");
}
 
function nullHandler(){
	//	alert('nullhandler()');
};
 
// called when the application loads
function onDbLoad(){
	 
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
		tx.executeSql( 'DROP TABLE IF EXISTS User', [],nullHandler,errorHandler);
		tx.executeSql( 'CREATE TABLE IF NOT EXISTS User(UserId INTEGER NOT NULL PRIMARY KEY, contactname TEXT NOT NULL, city TEXT NOT NULL, sort TEXT NOT NULL, phone1 TEXT NOT NULL, email TEXT NOT NULL, longitude TEXT NOT NULL, latitude TEXT NOT NULL)', [],nullHandler,errorHandler);
	},errorHandler,successCallBack);
	 
}
 
function ListDBValues() {
// list the values in the database to the screen using jquery to update the #lbUsers element
 
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	 
	// this line clears out any content in the #lbUsers element on the page so that the next few lines will show updated
	// content and not just keep repeating lines
	$('#lbUsers').html('');
	 
	// this next section will select all the content from the User table and then go through it row by row
	// appending the UserId company city to the #lbUsers element on the page
	db.transaction(function(transaction) {
		transaction.executeSql('SELECT * FROM User ORDER by contactname desc LIMIT 100;', 
		[],
		function(transaction, result) {
			if (result != null && result.rows != null) {
				var html='';
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					//$('#lbUsers').append('<br>' + row.UserId + '. ' + row.contactname+ ' ' + row.city);
					html += '<li ><a class="custlink" data-transition="slide" rel="'+row.UserId+'" href="#custdetail">'+row.contactname+ ' | ' + row.city + '</a></li>';

				}
				$("#ul_klanten").empty();
				$('#ul_klanten').append($(html));
				$('#ul_klanten').trigger('create');    
				$('#ul_klanten').listview('refresh');
				waitOff();
				
				//alert('looped' + i);
			}
		},
		errorHandler);
		},errorHandler,nullHandler);
	return;
 
}
 
// this is the function that puts values into the database using the values from the text boxes on the screen
function AddValueToDB() {
 
	if (!window.openDatabase) {
	alert('Databases are not supported in this browser.');
	return;
	}
 
	// this is the section that actually inserts the values into the User table
	db.transaction(function(transaction) {
	//transaction.executeSql('INSERT INTO User(contactname, city)VALUES (?,?)',[$('#txcontactname').val(), $('#txcity').val()],nullHandler,errorHandler);
	transaction.executeSql('INSERT INTO User(contactname, city)VALUES (?,?)',[$('#txcontactname').val(), $('#txcity').val()],nullHandler,errorHandler);
	});
	 
	// this calls the function that will show what is in the User table in the database
	ListDBValues();
	 
	return false;
	 
}

function AddCustToDB(ls_contactname, ls_city) {
 
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	 
	db.transaction(function(transaction) {
		transaction.executeSql('INSERT INTO User(contactname, city)VALUES (?,?)',[ls_contactname, ls_city],nullHandler,errorHandler);
	});
	 
	 
	return false;
 
}

function AddAllCustToDB(data) {
 
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	 
	db.transaction(function(tx) {

		//var head = $("#headerteller");
		waitMsg('Start processing data');
		tx.executeSql( 'DROP TABLE IF EXISTS User', [],nullHandler,errorHandler);
		tx.executeSql( 'CREATE TABLE IF NOT EXISTS User(UserId INTEGER NOT NULL PRIMARY KEY, contactname TEXT NOT NULL, city TEXT NOT NULL, sort TEXT NOT NULL, phone1 TEXT NOT NULL, email TEXT NOT NULL, longitude TEXT NOT NULL, latitude TEXT NOT NULL)', [],nullHandler,errorHandler);
		tx.executeSql( 'DELETE FROM User', [],nullHandler,errorHandler);
		var teller = 0;
		$.each(data.row, function(index, item) {
			waitMsg('Start processing data' + teller);
			customers[teller] = [];
			customers[teller]['id'] = item.id;
			customers[teller]['sort'] = item.sort;
			customers[teller]['contactname'] = item.contactname;
			customers[teller]['city'] = item.city;
			customers[teller]['phone1'] = item.phone1;
			customers[teller]['email'] = item.email;
			customers[teller]['longitude'] = item.longitude;
			customers[teller]['latitude'] = item.latitude;
			
			//AddCustToDB(item.contactname,  item.city)
			tx.executeSql('INSERT INTO User(UserId, contactname, city, sort, phone1, email, longitude, latitude)VALUES (?,?,?,?,?,?,?,?)',[item.id, item.contactname, item.city, item.sort, item.phone1, item.email, item.longitude, item.latitude],nullHandler,errorHandler);
			
			teller = teller + 1;
		});
		
		//alert('adsf');
		ListDBValues();
		
	});
	
	 
	return false;
 
}


function emptyCustDB() {
 
	if (!window.openDatabase) {
		alert('Databases are not supported in this browser.');
		return;
	}
	 
	db.transaction(function(transaction) {
		transaction.executeSql('DELETE from User',[],nullHandler,errorHandler);
	});
	ListDBValues();
	 
	return false;
	 
}

function waitOn() {
	$('#waitbox').show();
}

function waitOff() {
	$('#waitbox').hide();
}

function waitMsg(msg) {
	//$('#waitbox').show();
	$('#waitmsg').html(msg);
	
}
