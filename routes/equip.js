// 20201201  версия для ГИОЦ Этап 2, передача оборудования в ГИОЦ
// 20201108  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb
// 20201019  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb
// 20200913  версия для ГИОЦ Этап 2, чтение с базы данных mongodb
// 20200909  версия для ГИОЦ.Этап 2;
// 20200228  конфигурация турникетов, peConfig[pe].note_time=timeData;
// 20191120  турникеты
// 20190816  добавляем вывод неработающих валидаторов и мониторов
// 20190704  добавляем прием и отсылку gtfs-rt структуру координат 
// 20190613  добавляем отсылку gps координат 
// 20190531  добавляем турникеты 
// 20190529  убираем начальный ноль для сравнения формулярами 
// 20190521  сервис принятия от АСОП логов оборудования формат малые буквы , длинный пакет данных
// 20190411  сервис принятия от АСОП логов оборудования
module.exports = app => {
	var bodyParser = require('body-parser');
	var fs = require('fs');
	var request = require('request'); 
	var hbs = require('hbs'); // шаблонизатор
	var usersFile = 'data/equips.json'; // файл пользователей
	
	var obPeFile = 'data/equipsPe.json'; // файл оборудования ПЕ
    var obPe = {}; // объявление obj последних сообщений оборудования
	var vapecont = fs.readFileSync(obPeFile, 'utf8');
	obPe = JSON.parse(vapecont);

	var peConfigFile = 'data/configTurnikets.json'; // файл изменения конфигураций
	var content = fs.readFileSync(peConfigFile, 'utf8');
	var peConfig  = JSON.parse(content);
	
	//var tbnIdFile = 'data/driverASOPjson'; // файл тб№ - idтб№
	var _mssql = require('@frangiskos/mssql');
			
	var jsonParser= bodyParser.json({limit:'5mb', type:'application/json'});
	//var jsonParser = bodyParser.json();
	
	var textParser = bodyParser.raw();
	var urlencodedParser = bodyParser.urlencoded({ extended: false });
	app.use(bodyParser.json({ limit: '5mb' }))
	
	//var tempdata=[];
	
	// Бортовые номера для ПЕ
	var tbnId = fs.readFileSync('data/driverASOPjson.json', 'utf8');
	var userstb = JSON.parse(tbnId);		 
		//userf.smenTripCount = users[i].ext_trip_id;
		//var test1 = "C1593";
		//console.log(userstb[0][test1]);		
		
	
	
	
	///////////////mongodb
	var nconf = require('nconf');
	var filenameconf = './config.json';
	nconf
		.argv()
		.env()
		.file({ file: filenameconf }); // подключаем конфиг файл
	//файлы с конфиг-файла
	var urldb = nconf.get('urldb'); // база данных
	var MongoClient = require('mongodb').MongoClient;
	var db;
	//Connection
	MongoClient.connect(urldb, function(err, database) {
		if (err) throw err;
		else {
			db = database;
			console.log('Connected equips.json to MongoDB');
		}
	});
	

	function confirmConfig(pe, trips, timeData, validationArr) {
			try{
			
				var result = false;
				// pe
				try{
					peConfig[pe].note_time=timeData;
					//console.log("валид.ПЕ "+peConfig[pe].validCount);			
					result = true;
				}catch(e){
					console.log("1. Создан вестибуль "+pe);
					peConfig[pe]={};					
					peConfig[pe].note_time=timeData;
					peConfig[pe].note_time_=timeData;
					//peConfig[pe][trips].info="Новий вестибуль "+pe+"<br>";
					peConfig[pe].info="Новий вестибуль "+pe+", "+timeData+"<br>";
					result = false;
				};
				
				
			
			// 
				try{				
					peConfig[pe][trips].timestamp=timeData;					
					result = true;
				}catch(e){
					console.log("2. Создан контролер. "+trips);
					peConfig[pe][trips]={};				
					peConfig[pe][trips].timestamp=timeData;
					peConfig[pe][trips].timestamp_=timeData;
					peConfig[pe].note_time=timeData;
					peConfig[pe][trips].info="Новий контролер "+trips+", "+timeData+"<br>";
					peConfig[pe].info="Новий контролер "+trips+", "+timeData+"<br>";
					console.log("3. Создан массив валидаторов "+validationArr);				
					peConfig[pe][trips].validations=validationArr;
					peConfig[pe][trips].validations_=validationArr;
					
					result = false;					
				};
			///*
					
			
			
				try{
					//console.log(validationArr.length);
					if(result){
						try{
							var val_not;
							val_not = peConfig[pe][trips].validations.length;						}
					    catch(e){
							val_not = -1;
						};							
						if(validationArr.length===val_not){
							//console.log("1111");
							for (var i = 0; i < validationArr.length; i++) {
								//console.log(peConfig[pe][trips].validations.indexOf(validationsArr[i]));
								//console.log(validationArr[i]);
								//console.log(peConfig[pe][trips].validations.indexOf("24701"));
							  if (peConfig[pe][trips].validations.indexOf(validationArr[i]) === -1) {								
								result = false;
								
								peConfig[pe][trips].info="Валідатор - "+validationArr[i]+", "+timeData+"<br>";
								peConfig[pe][trips].timestamp_=peConfig[pe][trips].timestamp;
								peConfig[pe][trips].timestamp=timeData;
								peConfig[pe].note_time=timeData;
								peConfig[pe][trips].validations_=peConfig[pe][trips].validations;
								peConfig[pe][trips].validations=validationArr;
							  }
							}
						}else{					
							result = false;							
							peConfig[pe][trips].info="Не співпадає кількість валідаторів"+", "+timeData+"<br>";
							peConfig[pe][trips].timestamp_=peConfig[pe][trips].timestamp;
							peConfig[pe][trips].timestamp=timeData;
							peConfig[pe].note_time=timeData;
							peConfig[pe][trips].validations_=peConfig[pe][trips].validations;
							peConfig[pe][trips].validations=validationArr;
						}
					}
					
				}catch(e){
					console.log("4. Помилка створення массиву валідаторів ");				
					peConfig[pe][trips].validations=validationArr;
					result = false;
				};
				
				
            //*/   				
				
				
				
				return result;
			}catch(e){
				console.log('----------Error confirm config----------');
				return result;
			}
		}

	// переход на новые транспортные сутки
	function deleteConfig(pe) {
			try{
				var result = false;
				for(key in peConfig[pe]) {
					if((key==="note_time" || key==="note_time_" || key==="info")){
						
					}else{
						//console.log(key + " = " + peConfig[pe][key]);
						//console.log(peConfig[pe][key].timestamp);
						let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
						let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19);
						let local = localISOTime;
						let datenew = new Date(local);
						let date = new Date(peConfig[pe][key].timestamp.substr(0,16));					
						
						//console.log(Date.now());
						//console.log(date);
						//console.log(Date.now()-date);
						if((Date.now()-date)>3600000){
							console.log(Date.now()-date);
							delete peConfig[pe][key];
							peConfig[pe].info="Видаляємо контролер = "+key+", "+datenew+"<br>";
							peConfig[pe].note_time_=new Date();
						}
					}
				}
				
			}catch(e){
				console.log('----------Error delete controler peConfigFile----------');
				//console.log(e);
				return result;
			}
		}	
	// переход на новые транспортные сутки
	function saveConfig() {
			try{	
				var result = false;
				var data = JSON.stringify(peConfig);			
				fs.writeFileSync(peConfigFile, data);
				result = true;
				return result + " save file ";
			}catch(e){
				console.log('----------Error save file peConfigFile----------');
				//console.log(e);
				return result;
			}
		}	

	
	function saveDB(name, data) {
		var result = 0;
		var tempData = { _id: name, cont: data };
		db
			.collection('equips')
			.update({ _id: name }, { tempData }, { upsert: true }, function(
				err,
				result
			) {
				if (err) console.log('Error save mongo equips.json');
				//else console.log('Success save mongo equips.json');
			});
		return result;
	}
	
	function insertDB2(name, data) {
		var result = 0;
		//console.log(name);
		//console.log(data);
		//var tempData = { _id: name, cont: data };
		db
			.collection(name)
			.insertOne({cont: data }, function(
				err,
				result
			) {
				if (err) {
					console.log('Error insert2 mongo agent.json');
					console.log(err);
				}else console.log('Success insert2 mongo agent.json');
			});
		return result;
	}
	
	async function loadDB(name) {		
		try{
		var result1 = await db.collection('equips').find({ _id: name }).toArray();
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		return result1[0].tempData.cont;
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[{}]";
			return result1;
		}		
	}
	
	async function loadDBHistory2(name) {
		try{
	var result1 = await db.collection(name).find().toArray();
	
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		//return result1[0].tempData.cont;		
		return result1;
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	
    // Запрос водителя
	async function qweryBD(nameserv, namebd, log, pass, filii) {
		//	sqlConfig :
		var SqlConfig = {
			//user: 'ttc',
			//password: 'ttc_Admin',
			user: log,
			password: pass,
			server: nameserv,   //'10.11.1.117',
			database: namebd,   //'ASDU_V026',
			options: 
			{
			   //database: 'ASDU_avtobus', //update me
				encrypt: false
			}
			
		};
		// connect BD
		try {
			_mssql.sql.init(SqlConfig);
		} catch (error) {
			console.error(error);
		};
		// qwery BD
		try {
			var data = await _mssql.sql.query(`SELECT * FROM [dbo].[Drivers] where ID=${filii}`);
			return data;
		} catch (error) {
			console.error(error);
		}
	};
	
	 // Запрос формуляра
	async function qweryDuty(nameserv, namebd, log, pass, filii) {
		//	sqlConfig :
		var SqlConfig = {
			//user: 'ttc',
			//password: 'ttc_Admin',
			user: log,
			password: pass,
			server: nameserv,   //'10.11.1.117',
			database: namebd,   //'ASDU_V026',
			options: 
			{
			   //database: 'ASDU_avtobus', //update me
				encrypt: false
			}
			
		};
		// connect BD
		try {
			_mssql.sql.init(SqlConfig);
		} catch (error) {
			console.error(error);
		};
		// qwery BD
		try {
			//var data = await _mssql.sql.query(`SELECT * FROM [dbo].[FactWorkHeader] where ID=${filii}`);
			 var data = await _mssql.sql.query(`SELECT  [Date], [Begin], [End], TabNum, NumPe FROM [ASDU_V026].[dbo].[FactWorkHeader] as f, [ASDU_V026].[dbo].[Drivers] as vod, [ASDU_V026].[dbo].[PE] as pe  where f.ID=${filii} and f.DriverID=vod.ID and f.PeID=pe.ID`);
			return data;
		} catch (error) {
			console.error(error);
		}
	};
	
	async function mainvod(driver){
				
		try{
			var userASDU = "0";	// водитель АСДУ	
			var typeTemp; // текущий тип транспорта
			typeTemp = driver.substr(0, 1);
			if(typeTemp==='A'){
				//console.log("==========Водій = "+driver+" ==========");
				var nameserv = "10.11.1.117";
				var namebd = "ASDU_V026";
				var log = 'Nar';
				var	pass = '123';
				var filiir =driver;
			}
			if(typeTemp==='B') {
				//console.log("==========Водій = "+driver+" ==========");
				var nameserv = "10.11.1.115";
				var namebd = "ASDU_V026";
				var log = 'Nar';
				var	pass = '123';
				var filiir =driver;
			};				
			if(typeTemp==='C'){
				//console.log("==========Водій = "+driver+" ==========");
				var nameserv = "10.11.1.159";
				var namebd = "ASDU_V026";
				var log = 'ttc';
				var	pass = 'ttc_Admin';
				var filiir =driver;
			};
			driver=driver.substr(1);		
			userASDU= await qweryBD(nameserv, namebd, log, pass, driver);	
			//console.log(userASDU);			
			return	"Ф"+userASDU[0].FilialID+" "+(userASDU[0].TabNum+" "+userASDU[0].Name);
		}	
		catch(error){
			console.log(error);
			return	userASDU;
		}
	}	
	
	async function mainduty(driver){
				
		try{
			if(typeof driver == "undefined") return	"";
			var userASDU = "0";	// водитель АСДУ	
			var typeTemp; // текущий тип транспорта
			typeTemp = driver.substr(0, 1);
			if(typeTemp==='A'){
				//console.log("==========Формуляр = "+driver+" ==========");
				var nameserv = "10.11.1.117";
				var namebd = "ASDU_V026";
				var log = 'Nar';
				var	pass = '123';
				var filiir =driver;
			}
			if(typeTemp==='B') {
				//console.log("==========Формуляр = "+driver+" ==========");
				var nameserv = "10.11.1.115";
				var namebd = "ASDU_V026";
				var log = 'Nar';
				var	pass = '123';
				var filiir =driver;
			};				
			if(typeTemp==='C'){
				//console.log("==========Формуляр = "+driver+" ==========");
				var nameserv = "10.11.1.159";
				var namebd = "ASDU_V026";
				var log = 'ttc';
				var	pass = 'ttc_Admin';
				var filiir =driver;
			};
			driver=driver.substr(1);		
			userASDU= await qweryDuty(nameserv, namebd, log, pass, driver);	
			//console.log(userASDU);
			var minbeg;
			var minend;
			if(userASDU[0].Begin.getMinutes()<10){
				minbeg="0"+userASDU[0].Begin.getMinutes();
			}else{
				minbeg =userASDU[0].Begin.getMinutes();
			};  			
			if(userASDU[0].End.getMinutes()<10){
				minend="0"+userASDU[0].End.getMinutes();
			}else{
				minend =userASDU[0].End.getMinutes();
			};  
			var hbeg;
			var hend;
			if(userASDU[0].Begin.getHours()<4){
				hbeg=22+userASDU[0].Begin.getHours();
			}else{
				hbeg =userASDU[0].Begin.getHours()-2;
			};  			
			if(userASDU[0].End.getHours()<4){
				hend=22+userASDU[0].End.getHours();
			}else{
				hend =userASDU[0].End.getHours()-2;
			};  	


			return	("TB="+userASDU[0].TabNum+" РО="+userASDU[0].NumPe+"    ЧАС "+hbeg+":"+minbeg
			         +" - "+hend+":"+minend);
		}	
		catch(error){
			console.log(error);
			return	userASDU;
		}
	}	
	

	async function main(req, res){
		var id = req.params.id; // получаем id
		var content = fs.readFileSync(usersFile, 'utf8');
		var users = JSON.parse(content);
		var user = null;
		// находим в массиве пользователя по id
		for (var i = 0; i < users.length; i++) {
			if (users[i].id == id) {
				user = users[i];
				break;
			}
		}
		var timestamp = user.timestamp.substr(0, 10) +"  "+user.timestamp.substr(11, 5);
	    var ext_driver_id = await mainvod(user.ext_driver_id);
	    var duty_code= await mainduty(user.duty_code);
	    var route = user.route;
		//var location_id = user.location_id;
		if(typeof user.ext_trip_id == "undefined") {
			ext_trip_id ="";
		}else{
			var ind = user.ext_trip_id.indexOf("_");
			var ext_trip_id = user.ext_trip_id.substr(ind+1);
		};
	    var org_id = user.org_id;
	    switch (user.event) {
		  case "SE":
			var event = "Кінець рейсу";
			break;
		  case "SN":
			var event = "Початок рейсу";
			break;
		  case "SP":
			var event = "Початок паузи";
			break;
		  case "SG":
			var event = "Кінець паузи";
			break;
		  case "SI":
			var event = "Вхід до системи";
			break;
		  case "SO":
			var event = "Вихід з системи";
			break;	
		  default:
			var event = "Неопізнана дія";
		}
		
		
		
		
		var user = { 
				timestamp : timestamp,
				ext_driver_id : ext_driver_id,
				duty_code : duty_code,
				route : route,
				ext_trip_id : ext_trip_id,
				org_id : org_id,
				//location_id : location_id,
				event : event				
				};

		
		// отправляем пользователя
		if (user) {
			res.send(user);
		} else {
			res.status(404).send();
		}
		
	}





	/////////////////////

	// получение списка данных
	app.get('/api/qvausers', async function(req, res) {
		//var content = fs.readFileSync(usersFile, 'utf8');
		//var usersP = JSON.parse(content);
		
		var content;
		content = await loadDB(usersFile);		
		//console.log("--------"+content);
		var usersP = JSON.parse(content);
		
		if(usersP.length-700>0){
			var poz = usersP.length-700
			var users =usersP.slice(poz);
		}else{
			var users =usersP;
		};	
		 
		//console.log(users.length)	
		res.send(users);
	});
	// получение одного пользователя по id
	app.get('/api/qvausers/:id', function(req, res) {
		main(req, res)
		
	});
	
	// мониторинг оплаты формуляра  по id
	app.get('/api/monduty/:id', function(req, res) {
		var id = req.params.id; // получаем id
        
		console.log(usersFile)
        var content = fs.readFileSync(usersFile, 'utf8');
        var users = JSON.parse(content);
		
		
		
        var user = null;
        // находим в массиве пользователя по id
		//id="B2239473";
		try{
			for (var i = users.length-1; i >0 ; i--) {				
				if(typeof users[i].duty_code == "undefined"){
					
				}else{ 
				   					
					if (users[i].duty_code == id) {
						 user = users[i];
						break;
					}
				}	
			}
			// отправляем пользователя
			if (user) {
				console.log(user);
				res.send(user);
				
			} else {
				res.status(404).send();
			}
		}	
		catch(err)
		{
			res.send(user);
			console.log(err);
		};
		
    });

		
	// получение отправленных данных
	app.post('/api/qvvalidate', urlencodedParser, function(req, res) {
		if (!req.body) return res.sendStatus(400);
        if (!req.headers.authorization) return res.sendStatus(401);
		if (req.headers.authorization!="User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4=") return res.sendStatus(401);
		console.log(JSON.stringify(req.headers));
		//var kluch = JSON.stringify(req.headers);
		console.log(JSON.stringify(req.headers.authorization));
		console.log(req.body);
	 try {	
		//читаем существующие валидации
		var id;
		var data = fs.readFileSync(usersFile, 'utf8');
				var users = JSON.parse(data);

				// находим максимальный id
				//var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
				// находим максимальный id
				if (users.length == 0) {
					id = 0;
				} else {
					id = Math.max.apply(
						Math,
						users.map(function(o) {
							return o.id;
						})
					);
				}
		
		// Принимаем массив валидаций
		var arr=[];
		var arr1,strtemp;
		var arrtemp=[];
		arr1=JSON.stringify(req.body);
		arr1=arr1.slice(2,arr1.length-4);
		//console.log(arr1);
		arrtemp=arr1.split("");
		//console.log(arrtemp);
		for (var i = 0;  i< arrtemp.length; i++) {	
			if (arrtemp[i]=="{"){
				strtemp=arrtemp[i];
				for (var j = i+1;  j< arrtemp.length; j++) {
					if (arrtemp[j]!="}"){
						if (arrtemp[j]!="\\") strtemp+=arrtemp[j];					
					}else{
						strtemp+=arrtemp[j];
						//console.log(strtemp);
						//var strtemp1=JSON.parse(strtemp);
						arr.push(strtemp);
						strtemp="";
						i=j;
						j=arrtemp.length;
					};
					
				};	
			}; 
			
		};
		//arr1=arr2.split('\"').join('"');
		//console.log("==================");
		//console.log(arr);
		
		//console.log("------------------");
		//console.log("Lentch = "+ arr.length);
		//console.log(arr[0]);
		//console.log("----"+arr[1]);
		//console.log(JSON.parse(arr[0]));
		//console.log(arr);
		for (var i = 0; i < arr.length; i++) {	
		//for (var i = 0; i < 0; i++) {
                var tempParse = JSON.parse(arr[i]);	
//console.log("1111 "+tempParse);				
				var timestamp = tempParse.timestamp;
				var line = tempParse.line;
				var trip_id = tempParse.trip_id;
				var passengers = tempParse.passengers;
				var stop_code = tempParse.stop_code;
				var stop_sequence = tempParse.stop_sequence;
				var location_id = tempParse.location_id;
				var product_id = tempParse.product_id;
				var card_id = tempParse.card_id;
				var doc_num = tempParse.doc_num;					
				
				var user = { 
				timestamp : timestamp,
				line : line,
				trip_id : trip_id,
				passengers : passengers,
				stop_code : stop_code,
				stop_sequence : stop_sequence,
				location_id : location_id,
				product_id : product_id,
				card_id : card_id,
				doc_num : doc_num
				};

				
				// увеличиваем его на единицу
				user.id = id + 1+i;
				//console.log(user.id);
				// добавляем пользователя в массив
				users.push(user);
		};
		var data = JSON.stringify(users);
		// перезаписываем файл с новыми данными
		fs.writeFileSync(usersFile, data);
		res.send("code: 204");
		saveDB(usersFile, data);
	}
	catch (e) {
                console.log(e)
				res.sendStatus(417)
            }
	 }
);
	
	// получение отправленных данных
	app.post('/api/qvausers', jsonParser, function(req, res) {
		if (!req.body) return res.sendStatus(400);

		var timestamp = req.body.timestamp;
		var line = req.body.line;
		var trip_id = req.body.trip_id;
		var passengers = req.body.passengers;
		var stop_code = req.body.stop_code;
		var stop_sequence = req.body.stop_sequence;
		var location_id = req.body.location_id;
		var product_id = req.body.product_id;
		var card_id = req.body.card_id;
		var doc_num = req.body.doc_num;
					
		
		var user = { 
		timestamp : timestamp,
		line : line,
		trip_id : trip_id,
		passengers : passengers,
		stop_code : stop_code,
		stop_sequence : stop_sequence,
		location_id : location_id,
		product_id : product_id,
		card_id : card_id,
		doc_num : doc_num
		};

		var data = fs.readFileSync(usersFile, 'utf8');
		var users = JSON.parse(data);

		// находим максимальный id
		//var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
		// находим максимальный id
		if (users.length == 0) {
			var id = 0;
		} else {
			var id = Math.max.apply(
				Math,
				users.map(function(o) {
					return o.id;
				})
			);
		}
		// увеличиваем его на единицу
		user.id = id + 1;
		// добавляем пользователя в массив
		users.push(user);
		var data = JSON.stringify(users);
		// перезаписываем файл с новыми данными
		fs.writeFileSync(usersFile, data);
		res.send(user);
		saveDB(usersFile, data);
	});
	

	
		// получение координат gtfs-rt с АСОП 
	
    app.post('/gps', bodyParser.json(), function(req, res) {		
	
		if (!req.body) return res.sendStatus(400);
		var tempdata=[];
		var item = 0;
			
		
		var tempstr=req.body;
		tempdata.push(tempstr);
		tempstr=JSON.stringify(req.headers);
		tempdata.push(tempstr);
		var datatemp = JSON.stringify(tempdata);
		// перезаписываем файл с новыми данными
		fs.writeFileSync("data/gpstemp.json", datatemp);		
		
		if (!req.headers.authorization) return res.sendStatus(401);
		if (req.headers.authorization != "User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4="){
            if (req.headers.authorization != "User XF03dCx0vc10+YJESlINEVu1TsiEICH16g5WxAMYOqg=") {return res.sendStatus(401)};
		};
		
		//console.log(JSON.stringify(req.headers));
		//var kluch = JSON.stringify(req.headers);
		//console.log(JSON.stringify(req.headers.authorization));
		//console.log(req.body);
		//console.log(req.path);

	try {
	
	  var btest=JSON.stringify(req.body);
	  if(typeof req.body === "string"){}else{ btest=JSON.stringify(req.body)};
		request.post({ url: "http://193.23.225.42:3001/gpsrt", headers: req.headers, body: btest },	
		//request.post({ url: "http://localhost:3001/gpsrt", headers: req.headers, body: btest },
			function(err, remoteResponse, remoteBody) {
			if (err) {			 
				console.log("Error = "+err);
			};
			console.log("gtfs-rt - ok");
			//res.write(remoteResponse.statusCode.toString()); // copy all headers from remoteResponse
			//res.end(remoteBody);
			
		});

	res.send("code: 204");
		//saveDB(usersFile, data);
	}
	catch (e) {
                console.log(e)
				res.sendStatus(417)
            }
	 }
);

	
	




	// получение состояния оборудования с АСОП (тестовая+продуктовая среда)
	
    app.post('/equips', bodyParser.json(), async function(req, res) {		
	     
		if (!req.body) return res.sendStatus(400);
		var tempdata=[];
		var item = 0;
		var item1 = 0; // указатель блока вaлидаций для истории
		var itemdata=[]; // блок вaлидаций для истории
		
		
		// бортовые номера ПЕ
		// userstb[0][test1]
		
		
		var tempstr=req.body;
		tempdata.push(tempstr);
		tempstr=JSON.stringify(req.headers);
		tempdata.push(tempstr);
		var datatemp = JSON.stringify(tempdata);
		// перезаписываем файл с новыми данными
		fs.writeFileSync("data/equipstemp.json", datatemp);		
		if (!req.headers.authorization) return res.sendStatus(401);
		if (req.headers.authorization != "User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4="){
            if (req.headers.authorization != "User XF03dCx0vc10+YJESlINEVu1TsiEICH16g5WxAMYOqg=") {return res.sendStatus(401)};
		};
		
		//console.log(JSON.stringify(req.headers));
		//var kluch = JSON.stringify(req.headers);
		//console.log(JSON.stringify(req.headers.authorization));
		//console.log(req.body);
		//console.log(req.path);

	try {
	/*
	var arr1 =[];
	arr1=[{
			"last_contact_time": "2019-05-29T11:09:00",
			"device_id" : "11166",
			"device_serial": 1738,
			"location_type" : "A",
			"location_id" : "064",
			"uptime" : "35225",
			"fwVersion": "KVC-1.0.2",
			"validators" : 
			[{"address": "1", "serial_number": "7928", "state": "DV_OK"},
			{ "address": "2", "serial_number": "4731", "state": "DV_OK"},
			{ "address": "3", "serial_number": "4726", "state": "DV_OK"}],
			"application_uptime": "35194",
			"system_state": "RUNNING",
			"gps":
			{ "lat" : "32.124322", "lon" : "42.18163"},
			"driverInterface":
			{"fw_version": "SDI-1.0.0a", "uptime" : "35187",  "hardware_type" : "WAYSION_M7R"},
			"ext_driver_id": "C1596",
			"ext_trip_id": "C87337_4" 						
			}];

	
       var btest=JSON.stringify(arr1); 
	   */
      // передача оборудования в ГИОЦ  "http://185.185.255.181:3000/"
	  	  
	   var btest=JSON.stringify(req.body);
	  // if(typeof req.body === "string"){}else{ btest=JSON.stringify({"last_contact_time": "2019-0-29T11:03:00"})};
	  if(typeof req.body === "string"){}else{ btest=JSON.stringify(req.body)};
	//request.post({ url: "http://193.23.225.42:3001/gps", headers: req.headers, body: btest },	
	//request.post({ url: "http://localhost:3001/gps", headers: req.headers, body: btest },
	request.post({ url: "http://185.185.255.181:3000/equips", headers: req.headers, body: btest },
		function(err, remoteResponse, remoteBody) {
        if (err) { 
		//return res.status(500).end('Error'); 
		console.log("Error = "+err);
		};
		console.log("Oborudovanie - ok");
        //res.write(remoteResponse.statusCode.toString()); // copy all headers from remoteResponse
        //res.end(remoteBody);
		
    });
    

		//res.redirect(307, 'http://localhost:3001' + req.path);

      	
		//читаем существующие статусы оборудования
				
		var id;
		var data = fs.readFileSync(usersFile, 'utf8');
				var users = JSON.parse(data);
				//var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
				// находим максимальный id
				if (users.length == 0) {
					id = 0;
					item=0;
				} else {
					id = Math.max.apply(
						Math,
						users.map(function(o) {
							return o.id;
						})
					);
					if(users[users.length-1].item){
						item=users[users.length-1].item;
					}; 
				}
				
		// Принимаем массив статусов оборудования
	
		
		var arr;
		arr=req.body;
						
		/*			
		arr=[{
			//"Note_time": "2019-08-16T10:45:00",
			"last_contact_time": "2019-11-19T06:49:00",
			"device_id" : "11166",
			"device_serial": 1896,
			"location_type" : "V",
			"location_id" : "1896",
			//"Event" :"DS",
			//"Message":			
			//{
			"uptime" : "35225",
			"fwVersion": "KVC-1.0.2",
			"validators" : 
			[{"address": "1", "serial_number": "7928", "state": "4DV_OK"},
			{ "address": "2", "serial_number": "4731", "state": "DV_OK"},
			{ "address": "3", "serial_number": "4726", "state": "5DV_OK"}],
			//"transitDatabaseVersion": "2032",
			"application_uptime": "35194",
			"system_state": "RUNNING",
			"gps":
			{ "lat" : "32.124322", "lon" : "42.18163"},
			"driverInterface": 
			{"fw_version": "SDI-1.0.0a", "uptime" : "35187",  "hardware_type" : "WAYSION_M7R"},
			
			"ext_driver_id": "C1596",
			"ext_trip_id": "C87337_4" 
						
			//}
			}];
*/
		//console.log(arr[0]);
		
		var info="";  
				
		for (var i = 0; i < arr.length; i++) {			

				var Note_time = arr[i].last_contact_time;				
				var Device_ID = arr[i].device_id;
				var ext_driver_tb = userstb[0][arr[i].ext_driver_id];
				var Location_type = arr[i].location_type;
				var Location = arr[i].location_id;
				var Event = arr[i].device_serial;
				var Message_uptime = arr[i].uptime;
				var Message_fwVersion = arr[i].fw_version;
				var Message_validators ="";
				var ValidatM=[];
				var Message_bad_validators ="";
				var Message_bad_driverInterface ="";
				//console.log(Location);
				try {
				for (var j = 0; j < arr[i].validators.length; j++) {	
				
				Message_validators=Message_validators+"№="+ arr[i].validators[j].address+"_C№="+
										arr[i].validators[j].serial_number+"_Стан="+
										arr[i].validators[j].state+"<br>";
				ValidatM.push(arr[i].validators[j].address);
				
				if(arr[i].validators[j].state==="DV_OK"){
					}else{
						 Message_bad_validators=Message_bad_validators+"№="+ arr[i].validators[j].address+"_C№="+
										arr[i].validators[j].serial_number+"_Стан="+
										arr[i].validators[j].state+"<br>";
					};
					
				};
				
				} catch (err) {

					 Message_validators="";
					 Message_bad_validators ="Валідатори Error"

				};
				
				//var Message_transitDatabaseVersion = arr[i].Message.transitDatabaseVersion;
				var Message_applicationUptime = arr[i].application_uptime;				
				var Message_systemState = arr[i].system_state;
				
				try {

					var Message_gps ="gps: lat="+arr[i].gps.lat+", lon="+arr[i].gps.lon;

				} catch (err) {

					var Message_gps="";

				};
				/*
				if (arr[i].gps.lat !== undefined){
									
					var Message_gps ="gps: lat="+arr[i].gps.lat+", lon="+arr[i].gps.lon;
				}else{
					var Message_gps="";
				};
				*/
				try {

						var Message_driverInterface ="driverInterface: fw_version="+arr[i].driverInterface.fw_version+", uptime="+
								arr[i].driverInterface.uptime+", hardware_type="+
								arr[i].driverInterface.hardware_type;
						if(arr[i].driverInterface.fw_version){
						}else{	
							Message_bad_driverInterface="Монітор Err";
						};		

				} catch (err) {

					var Message_driverInterface ="";
                    Message_bad_driverInterface="Монітор Error";
				};
				/*
				var Message_driverInterface ="driverInterface: fw_version="+arr[i].driverInterface.fw_version+", uptime="+
								arr[i].driverInterface.uptime+", hardware_type="+
								arr[i].driverInterface.hardware_type;
				*/
				try {
				var Message_service_id = arr[i].ext_trip_id;
				} catch (err) {
					var Message_service_id  ="";
				};
				if (Location.length<4 && Location.charAt(0)==="0"){
					Location=Location.substring(1);
				};
				var user = { 
				Note_time : Note_time,
				Device_ID : Device_ID,
				Location_type : Location_type,
				Location : Location,
				Event : Event,
				Message_uptime : Message_uptime,
				Message_fwVersion : Message_fwVersion,
				Message_validators : Message_validators,
				Message_bad_validators : Message_bad_validators,
				Message_bad_driverInterface : Message_bad_driverInterface,
				//Message_transitDatabaseVersion : Message_transitDatabaseVersion,
				Message_applicationUptime : Message_applicationUptime,
				Message_systemState : Message_systemState,
				Message_gps : Message_gps,
				Message_driverInterface : Message_driverInterface,
				Message_service_id : Message_service_id,
				Message_driver_tb : ext_driver_tb
				};
                
				// сохраняем порцию действий в отдельном файле
		
			if(id>1500) {
			//if(timestamp.substring(0,10)!=users[id].timestampsubstring(0,13)) {	
				/*
				if(item>1500){						
						var usersFile1 = 'data/equips'+users[0].Note_time.substring(0,13)+'.json';
						var data = JSON.stringify(users);
						fs.writeFileSync(usersFile1, data);
						saveDB(usersFile1, data);
						item =1;						
				};
				*/
				users.splice(0,1);			
				//users.splice(0,users.length);
			};	
				// увеличиваем его на единицу
				user.id = id + 1+i;
				item=item+1;
				user.item = item;
				// добавляем ltqcndbt пользователя в массив
				users.push(user);
				// увеличиваем его на единицу
				item1=item1+1;
				
				// добавляем  пользователя в массив	истории БД			
				itemdata.push(user);
				
				
//	
	if (user.Location_type === null){
					
				}else{	
					try{
						var pe = user.Location_type.substring(0,1)+user.Location
						if(user.Location_type.substring(0,1)==="V"){
							/* оновление конфигурации вестибуля*/
							var peT = pe;   //вестибуль "V8016"
							var tripsT = user.Event; //контролер "3107"
							var timeDataT = user.Note_time;  //время посылки
							var validationArrT = ValidatM;   // перечень номеров валидаторов ["24703","24706","24707"]     
							confirmConfig(peT, tripsT, timeDataT, validationArrT);
							/* проверка вестибуля на неработающие контролеры*/
							deleteConfig(peT)
							
							
						};
					} catch(err) {
						var pe = "Err"
					};	
					try{
						if (!obPe[pe])	
						{				
							obPe[pe]={
									"Note_time": user.Note_time,
									"Message_bad_driverInterface" : Message_bad_driverInterface,
									"Message_bad_validators" : Message_bad_validators,									
									"Info": 'Час - '+user.Note_time+'<br>'+'РО - '+user.Location+'<br>'+'Валідатор - '+
									user.Message_validators+'<br>'+'Термінал водія - '+user.Message_driverInterface+'<br>' +
									'Статус - '+user.Message_systemState
									};
						}else{
							if(obPe[pe].Note_time){
								if (obPe[pe].Note_time<user.Note_time){
									obPe[pe]={
										"Note_time": user.Note_time,
										"Message_bad_driverInterface" : Message_bad_driverInterface,
										"Message_bad_validators" : Message_bad_validators,									
										"Info": 'Час - '+user.Note_time+'<br>'+'РО - '+user.Location+'<br>'+'Валідатор - '+
										user.Message_validators+'<br>'+'Термінал водія - '+user.Message_driverInterface+"<br>" +
										'Статус - '+user.Message_systemState
										};
								};	
							}else{									
									obPe[pe]={
										"Note_time": user.Note_time,
										"Message_bad_driverInterface" : Message_bad_driverInterface,
										"Message_bad_validators" : Message_bad_validators,									
										"Info": 'Час - '+user.Note_time+'<br>'+'РО - '+user.Location+'<br>'+'Валідатор - '+
										user.Message_validators+'<br>'+'Термінал водія - '+user.Message_driverInterface+'<br>' +
										'Статус - '+user.Message_systemState
										};
								};									
							};					
						//};
					} catch(err) {
						console.log("Error obPE");
					};
					
					
				};
//				
		};
		
		// запись истории в БД
		if(item1>0){
			var usersFile1 = 'equip_'+itemdata[0].Note_time.substring(0,10);
			var data = JSON.stringify(itemdata);
			//insertDB(usersFile1, data);
			insertDB2(usersFile1, data);			
			item =0;			
			var cont28 = [];
			var contval = [];
			var kol =0;
			cont28 = await loadDBHistory2(usersFile1);
			//console.log(cont28);
			
			//cont28 = await loadDBHistory(usersFile1);
			
			
			//var cont29 = JSON.parse(cont28);
			//console.log(cont28[0].cont);
			//console.log(cont28.length + " записей в базу");
			//contval=JSON.parse(cont28[0].cont);
			//console.log(contval.length + " валидаций в блоке 0");
			
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {
					//console.log(contval[j]);
					
				}	
            //console.log("Валидаций = "+kol);  
			}
			
				
		};
		
		
		
		/* запись файла с новыми данными*/
		saveConfig();
		
		var data = JSON.stringify(obPe);
		// перезаписываем BD с новыми данными
		saveDB(obPeFile, data);
		// перезаписываем файл с новыми данными
		fs.writeFileSync(obPeFile, data);	
//		
		var data = JSON.stringify(users);
		// перезаписываем файл с новыми данными
		fs.writeFileSync(usersFile, data);
		res.send("code: 204");
		saveDB(usersFile, data);
	}
	catch (e) {
                console.log(e)
				res.sendStatus(417)
            }
	 }
);
	

	
	
	// удаление пользователя по id
	app.delete('/api/qvausers/:id', function(req, res) {
		var id = req.params.id;
		var data = fs.readFileSync(usersFile, 'utf8');
		var users = JSON.parse(data);
		var index = -1;
		// находим индекс пользователя в массиве
		for (var i = 0; i < users.length; i++) {
			if (users[i].id == id) {
				index = i;
				break;
			}
		}
		if (index || index === 0) {
			// удаляем пользователя из массива по индексу
			var user = users.splice(index, 1)[0];
			var data = JSON.stringify(users);
			fs.writeFileSync(usersFile, data);
			// отправляем удаленного пользователя
			res.send(user);
			saveDB(usersFile, data);
		} else {
			res.status(404).send();
		}
	});
	// изменение пользователя
	app.put('/api/qvausers', jsonParser, function(req, res) {
		if (!req.body) return res.sendStatus(400);

		var userId = req.body.id;
		var timestamp = req.body.timestamp;
		var line = req.body.line;
		var trip_id = req.body.trip_id;
		var passengers = req.body.passengers;
		var stop_code = req.body.stop_code;
		var stop_sequence = req.body.stop_sequence;
		var location_id = req.body.location_id;
		var product_id = req.body.product_id;
		var card_id = req.body.card_id;
		var doc_num = req.body.doc_num;

		var data = fs.readFileSync(usersFile, 'utf8');
		var users = JSON.parse(data);
		var user;
		for (var i = 0; i < users.length; i++) {
			if (users[i].id == userId) {
				user = users[i];
				break;
			}
		}
		// изменяем данные у пользователя
		if (user) {
			user.timestamp = timestamp;
			user.line = line;
			user.trip_id = trip_id;
			user.passengers = passengers;
			user.stop_code = stop_code;
			user.stop_sequence = stop_sequence;
			user.location_id = location_id;
			user.product_id = product_id;
			user.card_id = card_id;
			user.doc_num = doc_num;
									
			var data = JSON.stringify(users);
			fs.writeFileSync(usersFile, data);
			res.send(user);
			saveDB(usersFile, data);
		} else {
			res.status(404).send(user);
		}
	});
};
