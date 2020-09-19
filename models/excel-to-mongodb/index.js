
var readExcel = require('read-excel-file/node');
var fs = require('fs');
var mongoose = require('mongoose');
const csv=require('csvtojson');
var exec = require('child_process').exec;
var path = require('path');

//format the date to mongodb format
function formatDate(date) {
	var d = new Date(date),
	month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	year = d.getFullYear();
	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;
	return [year, month, day].join('-');
}

var noOfOperations = 0;

//Check if the object is date
function isDate(d){
	return d instanceof Date && !isNaN(d);
}

//Convert to mongodb
exports.covertToMongo = function(data, options, callback){
	//optional parameter 'options'
	if(typeof options === 'function'){
		callback = options;
		options = {};
	}

	noOfOperations = 0;
	return new Promise((resolve, reject) => {
		mongoose.connection.dropCollection('asops', function(err, result) {
		var sRow = 0;
		var eRow = 0;
		var sCol = 0;
		var eCol = 0;
		if(options.safeMode){
			if(options.verbose){
				console.log('Backing up Database');
			}
			//Dump the database in case safe mode is set
			exec('mongodump --host '+data.host+' --db '+data.db+' --out '+'\"'+path.resolve(process.cwd())+'\"', function(error, stdout, stderr){
				if(error){
					if(options.verbose){
						console.log(error);
					}
					if(process.platform == 'win32'){
						reject('It seems that mongo\'s bin is not in your environment path. Go to https://github.com/ngudbhav/excel-tomongodb to see the steps to rectify this issue.');
						return callback('It seems that mongo\'s bin is not in your environment path. Go to https://github.com/ngudbhav/excel-tomongodb to see the steps to rectify this issue.');
					}
					else{
						reject('There seems to be an issue with your mongodb installation as we are unable to find mongodump file in environment path.');
						return callback('There seems to be an issue with your mongodb installation as we are unable to find mongodump file in environment path.');
					}
				}
				else{
					if(options.verbose){
						console.log(stderr);
						console.log(stdout);
					}
				}
			});
		}
		//Try to connect with the provided credentials
				if(options.verbose === true){
					mongoose.connection.on('connected',()=>{
						console.log('connected to database');
					});
				}
				var d = (data.path).toString().slice(data.path.toString().length-3, data.path.toString().length);
				//Get the extension of the input file
					//If the file is in MS EXCEL format (xls/xlsx)
					if (options.allSheets > 0) {
						let promises = [];
						readExcel(fs.createReadStream(data.path), {getSheets: true}).then((sheets) => {
							for (var iSheet = 0; iSheet < options.allSheets; iSheet++) {
								promises.push(new Promise((x, y) => {
									//let excInd = iSheet + 1;
									let nameSh = Object.values(sheets)[iSheet].name;
									let numberSh = iSheet;
									readExcel(fs.createReadStream(data.path), {sheet: nameSh}).then((rows) => {
										var progress = 1;
										var schema = {};
										if (options.customStartEnd === true) {
											//No need to parse the all the rows
											if (options.startRow && options.startCol && options.endRow && options.endCol) {
												sRow = options.startRow - 1;
												eRow = options.endRow;
												sCol = options.startCol - 1;
												eCol = options.endCol;
											} else {
												reject("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
												return callback("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
											}
										} else {
											eCol = rows[0].length;
											eRow = rows.length;
										}
										//Scan the second row to check for the datatypes.
										for (var i = sCol; i < eCol; i++) {
											noOfOperations = 0;
											//console.log(rows[sRow][i])
											try {
												rows[sRow][i] = rows[sRow][i].split(" ").join("_");
											} catch {
												rows[sRow][i] = rows[sRow][i]+" "
											}
											schema[rows[sRow][i]] = 'String';
											//MS Excel date is object in javascript.
											if (typeof (rows[sRow + 1][i]) === 'object') {
												console.log(rows[sRow + 1][i])
												if (isDate(rows[sRow + 1][i])) {
													schema[rows[sRow][i]] = 'Date';
													for (var j = sRow + 1; j < eRow; j++) {
														rows[j][i] = formatDate(rows[j][i]);
													}
												} else {
													//In case of unsupported datatype
													schema[rows[sRow][i]] = 'String';
													//reject("Datatype unrecognized");
													//return callback("Datatype unrecognized");
												}
											}
											//0 or 1 also corresponds to bool
											else if (typeof (rows[sRow + 1][i]) === 'boolean') {
												schema[rows[sRow][i]] = 'Boolean';
											}
										}
										//Create and compile the model to enable mongoose API.
										//console.log(schema)
										schema.type = "Number"
										var t = require('./modelCreateApi').createModel(schema, data.collection);
										var colData = [];
										//Create insertion object to send to insertMany API of mongoose
										for (var i = sRow + 1; i < eRow; i++) {
											var obj = {};
											for (var j in rows[i]) {
												obj[rows[sRow][j]] = rows[i][j];
											}
											console.log(numberSh)
											obj.type = numberSh;
											colData.push(obj);
										}
										//Send the data to database
										t.insertMany(colData, function (error, results) {
											if (error) {
												y(error);
												//return callback(error);
											} else {
												//Clear memory and delete the model to enable concurrent insertions
												x(results);
												//return callback(null, results);
											}
										});
									});
								}))
							}
							Promise.all(promises)
								.then((results) => {
									//delete mongoose.connection.models[t];
									//mongoose.connection.close();
									console.log("All done");
									return callback(true);
								})
								.catch((e) => {
									console.log(e)
									return callback(false);
								});

						})
					} else {
						readExcel(fs.createReadStream(data.path)).then((rows) => {
							var progress = 1;
							var schema = {};
							if (options.customStartEnd === true) {
								//No need to parse the all the rows
								if (options.startRow && options.startCol && options.endRow && options.endCol) {
									sRow = options.startRow - 1;
									eRow = options.endRow;
									sCol = options.startCol - 1;
									eCol = options.endCol;
								} else {
									reject("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
									return callback("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
								}
							} else {
								eCol = rows[0].length;
								eRow = rows.length;
							}
							//Scan the second row to check for the datatypes.
							for (var i = sCol; i < eCol; i++) {
								noOfOperations = 0;
								try {
									rows[sRow][i] = rows[sRow][i].split(" ").join("_");
								} catch {
									rows[sRow][i] = rows[sRow][i]+" "
								}
								if (typeof (rows[sRow + 1][i]) === 'number') {
									schema[rows[sRow][i]] = 'Number';
								} else if (typeof (rows[sRow + 1][i]) === 'string') {
									schema[rows[sRow][i]] = 'String';
								}
								//MS Excel date is object in javascript.
								else if (typeof (rows[sRow + 1][i]) === 'object') {
									if (isDate(rows[sRow + 1][i])) {
										schema[rows[sRow][i]] = 'Date';
										for (var j = sRow + 1; j < eRow; j++) {
											rows[j][i] = formatDate(rows[j][i]);
										}
									} else {
										//In case of unsupported datatype
										schema[rows[sRow][i]] = 'String';
									}
								}
								//0 or 1 also corresponds to bool
								else if (typeof (rows[sRow + 1][i]) === 'boolean') {
									schema[rows[sRow][i]] = 'Boolean';
								}
							}
							//Create and compile the model to enable mongoose API.
							var t = require('./modelCreateApi').createModel(schema, data.collection);
							var colData = [];
							//Create insertion object to send to insertMany API of mongoose
							for (var i = sRow + 1; i < eRow; i++) {
								var obj = {};
								for (var j in rows[i]) {
									obj[rows[sRow][j]] = rows[i][j];
								}
								colData.push(obj);
							}
							//Send the data to database
							t.insertMany(colData, function (error, results) {
								if (error) {
									reject(error);
									return callback(false);
								} else {
									//Clear memory and delete the model to enable concurrent insertions
									delete mongoose.connection.models[t];
									mongoose.connection.close();
									resolve(results);
									return callback(true);
								}
							});
						});
					}
		});
	});
}
