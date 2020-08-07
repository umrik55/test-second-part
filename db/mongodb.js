const mongoose = require('mongoose');
const nconf = require('nconf');

module.exports.connect = function() {
	mongoose.connect(nconf.get('asop_auth'),{ useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});
	var db = mongoose.connection;
	db.on("error", console.error.bind(console, "connection error"));
	db.once("open", function(callback){
		  console.log("Connection Succeeded");
	});
	return db;
}

module.exports.clearSessions = function() {
    mongoose.connect(nconf.get('urldb'),{ useCreateIndex: true, useNewUrlParser: true });
    var db = mongoose.connection;

    db.dropCollection('sessions', function(err, result){
    	if(err)
    		return false;
		else
			return true
    });
}
