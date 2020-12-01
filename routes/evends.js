// 20201201  версия для ГИОЦ Этап 2, передача действий водителей в ГИОЦ
// 20201108  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb
// 20201019  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb
// 20200913  версия для ГИОЦ Этап 2, чтен7ие с базы данных mongodb
// 20191129  убираем запись истории файлов и начальный ноль для номеров из 2 цифр
module.exports = (app) => {
  var bodyParser = require("body-parser");
  var fs = require("fs");
  var request = require('request');
  var hbs = require("hbs"); // шаблонизатор
  var usersFile = "data/evends.json"; // файл пользователей
  var tbnIdFile = "data/driverASOPjson"; // файл тб№ - idтб№

  var _mssql = require("@frangiskos/mssql");
  var jsonParser = bodyParser.json();
  var textParser = bodyParser.raw();
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
  var fetch = require("node-fetch");
  var tbnId = fs.readFileSync("data/driverASOPjson.json", "utf8");
  var userstb = JSON.parse(tbnId);
  var eventPeFile = "data/eventPe.json"; // файл последних действий водителя
  var eventPe = {}; // объявление obj последних действий водителя
  var evpecont = fs.readFileSync(eventPeFile, "utf8");
  eventPe = JSON.parse(evpecont);

  //mongodb
  var nconf = require("nconf");
  var filenameconf = "./config.json";
  nconf.argv().env().file({ file: filenameconf }); // подключаем конфиг файл

  //файлы с конфиг-файла
  var urldb = nconf.get("urldb"); // база данных
  var MongoClient = require("mongodb").MongoClient;
  var db;

  //Connection
  MongoClient.connect(urldb, function (err, database) {
    if (err) throw err;
    else {
      db = database;
      console.log("Connected evends.json to MongoDB");
    }
  });

  function saveDB(name, data) {
    var result = 0;
    var tempData = { _id: name, cont: data };
    db.collection("evends").update(
      { _id: name },
      { tempData },
      { upsert: true },
      function (err, result) {
        if (err) console.log("Error save mongo evends.json");
        else console.log("Success save mongo evends.json");
      }
    );
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
				}else console.log('Success insert2 mongo evends.json');
			});
		return result;
	}
	
  
   async function loadDB(name) {		
		try{
		var result1 = await db.collection('evends').find({ _id: name }).toArray();
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
      server: nameserv, //'10.11.1.117',
      database: namebd, //'ASDU_V026',
      options: {
        //database: 'ASDU_avtobus', //update me
        encrypt: false,
      },
    };

    // connect BD
    try {
      _mssql.sql.init(SqlConfig);
    } catch (error) {
      console.error(error);
    }

    // qwery BD
    try {
      var data = await _mssql.sql.query(
        `SELECT * FROM [dbo].[Drivers] where ID=${filii}`
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  // Запрос формуляра
  async function qweryDuty(nameserv, namebd, log, pass, filii) {
    //	sqlConfig :
    var SqlConfig = {
      user: log,
      password: pass,
      server: nameserv, //'10.11.1.117',
      database: namebd, //'ASDU_V026',
      options: {
        encrypt: false,
      },
    };

    // connect BD
    try {
      _mssql.sql.init(SqlConfig);
    } catch (error) {
      console.error(error);
    }

    // qwery BD
    try {
      //var data = await _mssql.sql.query(`SELECT * FROM [dbo].[FactWorkHeader] where ID=${filii}`);
      var data = await _mssql.sql.query(
        `SELECT  [Date], [Begin], [End], TabNum, NumPe FROM [ASDU_V026].[dbo].[FactWorkHeader] as f, [ASDU_V026].[dbo].[Drivers] as vod, [ASDU_V026].[dbo].[PE] as pe  where f.ID=${filii} and f.DriverID=vod.ID and f.PeID=pe.ID`
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async function mainvod(driver) {
    try {
      var userASDU = "0"; // водитель АСДУ
      var typeTemp; // текущий тип транспорта
      typeTemp = driver.substr(0, 1);
      if (typeTemp === "A") {
        var nameserv = "10.11.1.117";
        var namebd = "ASDU_V026";
        var log = "Nar";
        var pass = "123";
        var filiir = driver;
      }
      if (typeTemp === "B") {
        var nameserv = "10.11.1.115";
        var namebd = "ASDU_V026";
        var log = "Nar";
        var pass = "123";
        var filiir = driver;
      }
      if (typeTemp === "C") {
        var nameserv = "10.11.1.159";
        var namebd = "ASDU_V026";
        var log = "ttc";
        var pass = "ttc_Admin";
        var filiir = driver;
      }
      driver = driver.substr(1);
      userASDU = await qweryBD(nameserv, namebd, log, pass, driver);
      return (
        "Ф" +
        userASDU[0].FilialID +
        " " +
        (userASDU[0].TabNum + " " + userASDU[0].Name)
      );
    } catch (error) {
      console.log(error);
      return userASDU;
    }
  }

  async function mainduty(driver) {
    try {
      if (typeof driver == "undefined") return "";
      var userASDU = "0"; // водитель АСДУ
      var typeTemp; // текущий тип транспорта
      typeTemp = driver.substr(0, 1);
      if (typeTemp === "A") {
        var nameserv = "10.11.1.117";
        var namebd = "ASDU_V026";
        var log = "Nar";
        var pass = "123";
        var filiir = driver;
      }
      if (typeTemp === "B") {
        var nameserv = "10.11.1.115";
        var namebd = "ASDU_V026";
        var log = "Nar";
        var pass = "123";
        var filiir = driver;
      }
      if (typeTemp === "C") {
        //console.log("==========Формуляр = "+driver+" ==========");
        var nameserv = "10.11.1.159";
        var namebd = "ASDU_V026";
        var log = "ttc";
        var pass = "ttc_Admin";
        var filiir = driver;
      }
      driver = driver.substr(1);
      userASDU = await qweryDuty(nameserv, namebd, log, pass, driver);
      //console.log(userASDU);
      var minbeg;
      var minend;
      if (userASDU[0].Begin.getMinutes() < 10) {
        minbeg = "0" + userASDU[0].Begin.getMinutes();
      } else {
        minbeg = userASDU[0].Begin.getMinutes();
      }
      if (userASDU[0].End.getMinutes() < 10) {
        minend = "0" + userASDU[0].End.getMinutes();
      } else {
        minend = userASDU[0].End.getMinutes();
      }
      var hbeg;
      var hend;
      if (userASDU[0].Begin.getHours() < 4) {
        hbeg = 22 + userASDU[0].Begin.getHours();
      } else {
        hbeg = userASDU[0].Begin.getHours() - 2;
      }
      if (userASDU[0].End.getHours() < 4) {
        hend = 22 + userASDU[0].End.getHours();
      } else {
        hend = userASDU[0].End.getHours() - 2;
      }

      return (
        "TB=" +
        userASDU[0].TabNum +
        " РО=" +
        userASDU[0].NumPe +
        "    ЧАС " +
        hbeg +
        ":" +
        minbeg +
        " - " +
        hend +
        ":" +
        minend
      );
    } catch (error) {
      console.log(error);
      return userASDU;
    }
  }

  async function main(req, res) {
    var id = req.params.id; // получаем id
    var content = fs.readFileSync(usersFile, "utf8");
    var users = JSON.parse(content);
    var user = null;
    // находим в массиве пользователя по id
    for (var i = 0; i < users.length; i++) {
      if (users[i].id == id) {
        user = users[i];
        break;
      }
    }
    var timestamp =
      user.timestamp.substr(0, 10) + "  " + user.timestamp.substr(11, 5);
    var ext_driver_id = await mainvod(user.ext_driver_id);
    var duty_code = await mainduty(user.duty_code);
    var route = user.route;
    //var location_id = user.location_id;
    if (typeof user.ext_trip_id == "undefined") {
      ext_trip_id = "";
    } else {
      var ind = user.ext_trip_id.indexOf("_");
      var ext_trip_id = user.ext_trip_id.substr(ind + 1);
    }
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
      timestamp: timestamp,
      ext_driver_id: ext_driver_id,
      duty_code: duty_code,
      route: route,
      ext_trip_id: ext_trip_id,
      org_id: org_id,
      event: event,
    };

    // отправляем пользователя
    if (user) {
      res.send(user);
    } else {
      res.status(404).send();
    }
  }

  // получение списка данных
  app.get("/api/vausers",async function (req, res) {
    //var content = fs.readFileSync(usersFile, "utf8");
    //var usersP = JSON.parse(content);
   
		var content;
		content = await loadDB(usersFile);		
		//console.log("--------"+content);
		//var usersP=content;
		var usersP = JSON.parse(content);
	
	if (usersP.length - 700 > 0) {
      var poz = usersP.length - 700;
      var users = usersP.slice(poz);
    } else {
      var users = usersP;
    }

    res.send(users);
  });

  // получение одного пользователя по id
  app.get("/api/vausers/:id", function (req, res) {
    main(req, res);
  });

  // мониторинг оплаты формуляра  по id
  app.get("/api/monduty/:id", function (req, res) {
    var id = req.params.id; // получаем id

    console.log(usersFile);
    var content = fs.readFileSync(usersFile, "utf8");
    var users = JSON.parse(content);

    var user = null;
    try {
      for (var i = users.length - 1; i > 0; i--) {
        if (typeof users[i].duty_code == "undefined") {
        } else {
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
    } catch (err) {
      res.send(user);
      console.log(err);
    }
  });

  // получение отправленных данных
  app.post("/api/vvalidate", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (!req.headers.authorization) return res.sendStatus(401);
    if (
      req.headers.authorization !=
      "User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4="
    )
      return res.sendStatus(401);
    console.log(JSON.stringify(req.headers));
    console.log(JSON.stringify(req.headers.authorization));
    console.log(req.body);
    try {
      //читаем существующие валидации
      var id;
      var data = fs.readFileSync(usersFile, "utf8");
      var users = JSON.parse(data);

      // находим максимальный id
      //var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
      // находим максимальный id
      if (users.length == 0) {
        id = 0;
      } else {
        id = Math.max.apply(
          Math,
          users.map(function (o) {
            return o.id;
          })
        );
      }

      // Принимаем массив валидаций
      var arr = [];
      var arr1, strtemp;
      var arrtemp = [];
      arr1 = JSON.stringify(req.body);
      arr1 = arr1.slice(2, arr1.length - 4);
      arrtemp = arr1.split("");
      for (var i = 0; i < arrtemp.length; i++) {
        if (arrtemp[i] == "{") {
          strtemp = arrtemp[i];
          for (var j = i + 1; j < arrtemp.length; j++) {
            if (arrtemp[j] != "}") {
              if (arrtemp[j] != "\\") strtemp += arrtemp[j];
            } else {
              strtemp += arrtemp[j];
              arr.push(strtemp);
              strtemp = "";
              i = j;
              j = arrtemp.length;
            }
          }
        }
      }
      for (var i = 0; i < arr.length; i++) {
        var tempParse = JSON.parse(arr[i]);
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
          timestamp: timestamp,
          line: line,
          trip_id: trip_id,
          passengers: passengers,
          stop_code: stop_code,
          stop_sequence: stop_sequence,
          location_id: location_id,
          product_id: product_id,
          card_id: card_id,
          doc_num: doc_num,
        };

        // увеличиваем его на единицу
        user.id = id + 1 + i;

        // добавляем пользователя в массив
        users.push(user);
      }
      var data = JSON.stringify(users);

      // перезаписываем файл с новыми данными
      fs.writeFileSync(usersFile, data);
      res.send("code: 204");
      saveDB(usersFile, data);
    } catch (e) {
      console.log(e);
      res.sendStatus(417);
    }
  });

  // получение отправленных данных
  app.post("/api/vausers", jsonParser, function (req, res) {
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
      timestamp: timestamp,
      line: line,
      trip_id: trip_id,
      passengers: passengers,
      stop_code: stop_code,
      stop_sequence: stop_sequence,
      location_id: location_id,
      product_id: product_id,
      card_id: card_id,
      doc_num: doc_num,
    };
    var data = fs.readFileSync(usersFile, "utf8");
    var users = JSON.parse(data);

    // находим максимальный id
    if (users.length == 0) {
      var id = 0;
    } else {
      var id = Math.max.apply(
        Math,
        users.map(function (o) {
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

  // получение валидаций с АСОП (тестовая+продуктовая среда)
  app.post("/events", bodyParser.json(), async function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var tempdata = [];
    var item = 0;
	var item1 = 0; // указатель блока вaлидаций для истории
		var itemdata=[]; // блок вaлидаций для истории
	
    var tempstr = req.body;
    tempdata.push(tempstr);
    tempstr = JSON.stringify(req.headers);
    tempdata.push(tempstr);
    var datatemp = JSON.stringify(tempdata);

    // перезаписываем файл с новыми данными
    fs.writeFileSync("data/temp.json", datatemp);
    if (!req.headers.authorization) return res.sendStatus(401);
    if (
      req.headers.authorization !=
      "User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4="
    ) {
      if (
        req.headers.authorization !=
        "User XF03dCx0vc10+YJESlINEVu1TsiEICH16g5WxAMYOqg="
      ) {
        return res.sendStatus(401);
      }
    }
	
	
    try {
	  // передача действий водителя  "http://185.185.255.181:3000/
		var btest=JSON.stringify(req.body);
		//console.log("ttt- "+btest);
	    if(typeof req.body === "string"){}else{ btest=JSON.stringify(req.body)};
		//request.post({ url: "http://10.31.11.241:3000/events", headers : req.headers, body : btest},		
		//request.post({ url: "http://sip.ttc.net.ua:3000/events", headers : req.headers, body : btest},
        //request.post({ url: giocEvend, headers : req.headers, body : btest},		
		request.post({ url: "http://185.185.255.181:3000/events", headers : req.headers, body : btest},		
			
			function(err, remoteResponse, remoteBody) {
				if (err) { 
					console.log("Error events copy send = "+err);
				};
				console.log("events copy send - ok");
				//res.write(remoteResponse.statusCode.toString()); // copy all headers from remoteResponse
				//res.end(remoteBody);
			
		});

		
		
		
      //читаем существующие валидации
      var id;
      var data = fs.readFileSync(usersFile, "utf8");
      var users = JSON.parse(data);
      if (users.length == 0) {
        id = 0;
        item = 0;
      } else {
        id = Math.max.apply(
          Math,
          users.map(function (o) {
            return o.id;
          })
        );
        if (users[users.length - 1].item) {
          item = users[users.length - 1].item;
        }
      }

      // Принимаем массив валидаций
      var arr;
      arr = req.body;
      for (var i = 0; i < arr.length; i++) {
        var timestamp = arr[i].timestamp;
        var ext_driver_id = arr[i].ext_driver_id;
        var ext_driver_tb = userstb[0][arr[i].ext_driver_id];
        var duty_code = arr[i].duty_code;
        var route = arr[i].route;
        var ext_trip_id = arr[i].ext_trip_id;
        var tevent = arr[i].event;
        var org_id = arr[i].org_id;
        var location_id = arr[i].location_id;
        if (location_id.length < 4 && location_id.charAt(0) === "0") {
          location_id = location_id.substring(1);
        }
        if (location_id.length < 3 && location_id.charAt(0) === "0") {
          location_id = location_id.substring(1);
        }
        var user = {
          timestamp: timestamp,
          ext_driver_id: ext_driver_id,
          duty_code: duty_code,
          route: route,
          ext_trip_id: ext_trip_id,
          org_id: org_id,
          //ext_driver_tb : ext_driver_tb,
          ext_driver_tb: ext_driver_id,
          location_id: location_id,
          event: tevent,
        };

        //передаем рейс
        if (tevent === "SE" || tevent === "SN") {
          getTrips(location_id, ext_trip_id, timestamp, ext_driver_tb, tevent);
        }

        // сохраняем порцию действий в отдельном файле
        if (id > 2000) {
          //if(timestamp.substring(0,10)!=users[id].timestampsubstring(0,13)) {
          if (item > 1000) {
            var usersFile1 =
              "data/evends" + users[0].timestamp.substring(0, 13) + ".json";
            var data = JSON.stringify(users);
            item = 1;
          }
          users.splice(0, 1);
        }

        // увеличиваем его на единицу
        user.id = id + 1 + i;
        item = item + 1;
        user.item = item;
		
		// увеличиваем его на единицу
		item1=item1+1;
				
		// добавляем  пользователя в массив	истории БД			
		itemdata.push(user);

        // добавляем ltqcndbt пользователя в массив
        users.push(user);
        try {
          var pe = user.ext_driver_id.substring(0, 1) + user.location_id;
        } catch (e) {}
        if (!eventPe[pe]) {
          eventPe[pe] = {
            event: user.event,
            timestamp: user.timestamp,
            ext_driver_id: user.ext_driver_id,
          };
        } else {
          if (eventPe[pe].timestamp < user.timestamp) {
            eventPe[pe] = {
              event: user.event,
              timestamp: user.timestamp,
              ext_driver_id: user.ext_driver_id,
            };
          }
        }
      }
      // запись истории в БД
		if(item1>0){
			var usersFile1 = 'even_'+itemdata[0].timestamp.substring(0,10);
			var data = JSON.stringify(itemdata);
			//insertDB(usersFile1, data);
			insertDB2(usersFile1, data);			
			item =0;			
			var cont28 = [];
			var contval = [];
			var kol =0;
			//cont28 = await loadDBHistory2(usersFile1);
			//console.log(cont28);
			
			//cont28 = await loadDBHistory(usersFile1);
			
			
			//var cont29 = JSON.parse(cont28);
			//console.log(cont28[0].cont);
			//console.log(cont28.length + " записей в базу");
			//contval=JSON.parse(cont28[0].cont);
			//console.log(contval.length + " валидаций в блоке 0");
			/*
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {
					//console.log(contval[j]);
					
				}	
            //console.log("Валидаций = "+kol);  
			}
			*/
				
		};
		
	  
	  
	  
	  var data = JSON.stringify(eventPe);

      // перезаписываем BD с новыми данными
	  saveDB(eventPeFile, data);
	  // перезаписываем файл с новыми данными
      fs.writeFileSync(eventPeFile, data);
      data = JSON.stringify(users);

      // перезаписываем файл с новыми данными
      fs.writeFileSync(usersFile, data);
      res.send("code: 204");
      saveDB(usersFile, data);
    } catch (e) {
      console.log(e);
      res.sendStatus(417);
    }
  });

  async function getTrips(pe, trip, timeData, vod, cod) {
    // передача события рейс водителя
    try {
      var URL = "localhost:3000";
      let response = await fetch(
        "http://" +
          URL +
          "/api/tripsvod/" +
          trip +
          "/" +
          pe +
          "/" +
          vod +
          "/" +
          timeData +
          "/" +
          cod,
        {
          method: "get",
          Host: URL,
          "Accept-Encoding": "gzip,deflate",
          Connection: "Keep-Alive",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: "User XF03dCx0vc10+YJESlINEVu1TsiEICH16g5WxAMYOqg=",
          },
        }
      );
      return true;
    } catch (error) {
      console.log("Не удалось передать действие водителя ");
      return false;
    }
  }

  // удаление пользователя по id
  app.delete("/api/vausers/:id", function (req, res) {
    var id = req.params.id;
    var data = fs.readFileSync(usersFile, "utf8");
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
  app.put("/api/vausers", jsonParser, function (req, res) {
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
    var data = fs.readFileSync(usersFile, "utf8");
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
