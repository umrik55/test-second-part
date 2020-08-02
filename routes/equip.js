// 20191120  турникеты
module.exports = (app) => {
  var bodyParser = require("body-parser");
  var fs = require("fs");
  var request = require("request");
  var hbs = require("hbs"); // шаблонизатор
  var usersFile = "data/equips.json"; // файл пользователей
  var obPeFile = "data/equipsPe.json"; // файл оборудования ПЕ
  var obPe = {}; // объявление obj последних сообщений оборудования
  var vapecont = fs.readFileSync(obPeFile, "utf8");
  obPe = JSON.parse(vapecont);
  var _mssql = require("@frangiskos/mssql");
  var jsonParser = bodyParser.json({ limit: "5mb", type: "application/json" });
  var textParser = bodyParser.raw();
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
  app.use(bodyParser.json({ limit: "5mb" }));

  // Бортовые номера для ПЕ
  var tbnId = fs.readFileSync("data/driverASOPjson.json", "utf8");
  var userstb = JSON.parse(tbnId);
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
      console.log("Connected equips.json to MongoDB");
    }
  });

  function saveDB(name, data) {
    var result = 0;
    var tempData = { _id: name, cont: data };
    db.collection("equips").update(
      { _id: name },
      { tempData },
      { upsert: true },
      function (err, result) {
        if (err) console.log("Error save mongo equips.json");
        //else console.log('Success save mongo equips.json');
      }
    );
    return result;
  }

  // Запрос водителя
  async function qweryBD(nameserv, namebd, log, pass, filii) {
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
        var nameserv = "10.11.1.159";
        var namebd = "ASDU_V026";
        var log = "ttc";
        var pass = "ttc_Admin";
        var filiir = driver;
      }
      driver = driver.substr(1);
      userASDU = await qweryDuty(nameserv, namebd, log, pass, driver);
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
  app.get("/api/qvausers", function (req, res) {
    var content = fs.readFileSync(usersFile, "utf8");
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
  app.get("/api/qvausers/:id", function (req, res) {
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
  app.post("/api/qvvalidate", urlencodedParser, function (req, res) {
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
  app.post("/api/qvausers", jsonParser, function (req, res) {
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

  // получение координат gtfs-rt с АСОП
  app.post("/gps", bodyParser.json(), function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var tempdata = [];
    var item = 0;
    var tempstr = req.body;
    tempdata.push(tempstr);
    tempstr = JSON.stringify(req.headers);
    tempdata.push(tempstr);
    var datatemp = JSON.stringify(tempdata);

    // перезаписываем файл с новыми данными
    fs.writeFileSync("data/gpstemp.json", datatemp);
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
      var btest = JSON.stringify(req.body);
      if (typeof req.body === "string") {
      } else {
        btest = JSON.stringify(req.body);
      }
      request.post(
        {
          url: "http://193.23.225.42:3001/gpsrt",
          headers: req.headers,
          body: btest,
        },
        function (err, remoteResponse, remoteBody) {
          if (err) {
            console.log("Error = " + err);
          }
          console.log("gtfs-rt - ok");
        }
      );

      res.send("code: 204");
    } catch (e) {
      console.log(e);
      res.sendStatus(417);
    }
  });

  // получение состояния оборудования с АСОП (тестовая+продуктовая среда)
  app.post("/equips", bodyParser.json(), function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var tempdata = [];
    var item = 0;
    var tempstr = req.body;
    tempdata.push(tempstr);
    tempstr = JSON.stringify(req.headers);
    tempdata.push(tempstr);
    var datatemp = JSON.stringify(tempdata);
    // перезаписываем файл с новыми данными
    fs.writeFileSync("data/equipstemp.json", datatemp);
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
      var btest = JSON.stringify(req.body);
      if (typeof req.body === "string") {
      } else {
        btest = JSON.stringify(req.body);
      }

      //читаем существующие статусы оборудования
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

      // Принимаем массив статусов оборудования
      var arr;
      arr = req.body;
      //console.log(arr[0]);
      var info = "";
      for (var i = 0; i < arr.length; i++) {
        var Note_time = arr[i].last_contact_time;
        var Device_ID = arr[i].device_id;
        var ext_driver_tb = userstb[0][arr[i].ext_driver_id];
        var Location_type = arr[i].location_type;
        var Location = arr[i].location_id;
        var Event = arr[i].device_serial;
        var Message_uptime = arr[i].uptime;
        var Message_fwVersion = arr[i].fw_version;
        var Message_validators = "";
        var Message_bad_validators = "";
        var Message_bad_driverInterface = "";
        try {
          for (var j = 0; j < arr[i].validators.length; j++) {
            Message_validators =
              Message_validators +
              "№=" +
              arr[i].validators[j].address +
              "_C№=" +
              arr[i].validators[j].serial_number +
              "_Стан=" +
              arr[i].validators[j].state +
              "<br>";
            if (arr[i].validators[j].state === "DV_OK") {
            } else {
              Message_bad_validators =
                Message_bad_validators +
                "№=" +
                arr[i].validators[j].address +
                "_C№=" +
                arr[i].validators[j].serial_number +
                "_Стан=" +
                arr[i].validators[j].state +
                "<br>";
            }
          }
        } catch (err) {
          Message_validators = "";
          Message_bad_validators = "Валідатори Error";
        }
        var Message_applicationUptime = arr[i].application_uptime;
        var Message_systemState = arr[i].system_state;
        try {
          var Message_gps =
            "gps: lat=" + arr[i].gps.lat + ", lon=" + arr[i].gps.lon;
        } catch (err) {
          var Message_gps = "";
        }
        try {
          var Message_driverInterface =
            "driverInterface: fw_version=" +
            arr[i].driverInterface.fw_version +
            ", uptime=" +
            arr[i].driverInterface.uptime +
            ", hardware_type=" +
            arr[i].driverInterface.hardware_type;
          if (arr[i].driverInterface.fw_version) {
          } else {
            Message_bad_driverInterface = "Монітор Err";
          }
        } catch (err) {
          var Message_driverInterface = "";
          Message_bad_driverInterface = "Монітор Error";
        }
        try {
          var Message_service_id = arr[i].ext_trip_id;
        } catch (err) {
          var Message_service_id = "";
        }
        if (Location.length < 4 && Location.charAt(0) === "0") {
          Location = Location.substring(1);
        }
        var user = {
          Note_time: Note_time,
          Device_ID: Device_ID,
          Location_type: Location_type,
          Location: Location,
          Event: Event,
          Message_uptime: Message_uptime,
          Message_fwVersion: Message_fwVersion,
          Message_validators: Message_validators,
          Message_bad_validators: Message_bad_validators,
          Message_bad_driverInterface: Message_bad_driverInterface,
          Message_applicationUptime: Message_applicationUptime,
          Message_systemState: Message_systemState,
          Message_gps: Message_gps,
          Message_driverInterface: Message_driverInterface,
          Message_service_id: Message_service_id,
          Message_driver_tb: ext_driver_tb,
        };

        // сохраняем порцию действий в отдельном файле
        if (id > 1500) {
          users.splice(0, 1);
        }

        // увеличиваем его на единицу
        user.id = id + 1 + i;
        item = item + 1;
        user.item = item;

        // добавляем ltqcndbt пользователя в массив
        users.push(user);
        if (user.Location_type === null) {
        } else {
          try {
            var pe = user.Location_type.substring(0, 1) + user.Location;
          } catch (err) {
            var pe = "Err";
          }
          try {
            if (!obPe[pe]) {
              obPe[pe] = {
                Note_time: user.Note_time,
                Message_bad_driverInterface: Message_bad_driverInterface,
                Message_bad_validators: Message_bad_validators,
                Info:
                  "Час - " +
                  user.Note_time +
                  "<br>" +
                  "РО - " +
                  user.Location +
                  "<br>" +
                  "Валідатор - " +
                  user.Message_validators +
                  "<br>" +
                  "Термінал водія - " +
                  user.Message_driverInterface +
                  "<br>" +
                  "Статус - " +
                  user.Message_systemState,
              };
            } else {
              if (obPe[pe].Note_time) {
                if (obPe[pe].Note_time < user.Note_time) {
                  obPe[pe] = {
                    Note_time: user.Note_time,
                    Message_bad_driverInterface: Message_bad_driverInterface,
                    Message_bad_validators: Message_bad_validators,
                    Info:
                      "Час - " +
                      user.Note_time +
                      "<br>" +
                      "РО - " +
                      user.Location +
                      "<br>" +
                      "Валідатор - " +
                      user.Message_validators +
                      "<br>" +
                      "Термінал водія - " +
                      user.Message_driverInterface +
                      "<br>" +
                      "Статус - " +
                      user.Message_systemState,
                  };
                }
              } else {
                obPe[pe] = {
                  Note_time: user.Note_time,
                  Message_bad_driverInterface: Message_bad_driverInterface,
                  Message_bad_validators: Message_bad_validators,
                  Info:
                    "Час - " +
                    user.Note_time +
                    "<br>" +
                    "РО - " +
                    user.Location +
                    "<br>" +
                    "Валідатор - " +
                    user.Message_validators +
                    "<br>" +
                    "Термінал водія - " +
                    user.Message_driverInterface +
                    "<br>" +
                    "Статус - " +
                    user.Message_systemState,
                };
              }
            }
          } catch (err) {
            console.log("Error obPE");
          }
        }
      }
      var data = JSON.stringify(obPe);

      // перезаписываем файл с новыми данными
      fs.writeFileSync(obPeFile, data);
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

  // удаление пользователя по id
  app.delete("/api/qvausers/:id", function (req, res) {
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
  app.put("/api/qvausers", jsonParser, function (req, res) {
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
