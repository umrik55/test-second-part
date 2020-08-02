//20170814 ftp modul

    var config = require('./config');


	var hostFtp1 = "10.11.1.10";
	//var hostFtp = "localhost";
	var portFtp1 = 21;
	var userFtp1 = "anonymous";
	var passFtp1 = "@anonymous";
	//var userFtp = "";
	//var passFtp = "";
	
	var hostFtp = "10.1.1.101";
	//var hostFtp = "localhost";
	var portFtp = 21;
	var userFtp = "isgeo";
	var passFtp = "ISGEO_Admin";
	

// ===    read ftp bus params from config  ======
	
	hostFtp = config.get('ftpbus:hostFtp');
	portFtp = config.get('ftpbus:portFtp');
	userFtp = config.get('ftpbus:userFtp');
	passFtp = config.get('ftpbus:passFtp');
	
// ==============================================
	
	console.log('Host:'  +  hostFtp);
	console.log('Port:'  +  portFtp);
	console.log('User:'  +  userFtp);
	console.log('Pass:'  +  passFtp);
	
		
// list dir	ftp
module.exports.listRez = function listRez(name,callback){
	var listRez = [];
	var JSFtp = require("jsftp");

	var Ftp = new JSFtp({
	  host:hostFtp,
	  port: portFtp,  
	  user: userFtp, 
	  pass: passFtp  
	});
	Ftp.ls(name, function(err, res) {	 	  
	  res.forEach(function(file) {
		//console.log(file.name); 
		listRez.push(file.name);
		rezult=listRez;
	});
	callback( listRez);
	Ftp.raw("quit", function(err, data) {
		if (err) return console.error(err);
		console.log("Bye!");
		});		
	});
	
}

// get file ftp


module.exports.getFile = function getFile(nameOut,nameIn,callback){
	var listRez = 0;
	var JSFtp = require("jsftp");

	var Ftp = new JSFtp({
	  host:hostFtp,
	  port: portFtp,  
	  user: userFtp, 
	  pass: passFtp  
	});
	
	Ftp.get(nameOut, nameIn, function(hasErr) {
		//console.log(hadErr);
	
		if (hasErr){
		  console.log("There was an error get  the file.");
		  console.log(hasErr);
		  }
		else{
		  console.log("file copied successfully!");
		  listRez=1;
		};
		
	  callback( listRez);
	  Ftp.raw("quit", function(err, data) {
			if (err) return console.error(err);
			console.log("Bye!");
			});		
	});
	
	//Ftp.raw("quit", function(err, data) {
		//if (err) return console.error(err);
		//console.log("Bye!");		
	//});	
}



// put file ftp
module.exports.putFile = function putFile(nameOut,nameIn,callback){
	var listRez = 0;
	var JSFtp = require("jsftp");

	var Ftp = new JSFtp({
	  host:hostFtp,
	  port: portFtp,  
	  user: userFtp, 
	  pass: passFtp  
	});
	
	Ftp.put(nameOut, nameIn, function(hasErr) {
		if (hasErr){
		  console.log("There was an error put the file.");
		  console.log(hadErr);
		  }
		else{
		  console.log("file put successfully!");
		  listRez=1;
		};
	  callback( listRez);
	  Ftp.raw("quit", function(err, data) {
			if (err) return console.error(err);
			console.log("Bye!");
			});		
	});
	//Ftp.raw("quit", function(err, data) {
		//if (err) return console.error(err);
		//console.log("Bye!");		
	//});	
}

