// 20200709  validations update
module.exports = (app) => {
  var bodyParser = require("body-parser");
  var fs = require("fs");
  var hbs = require("hbs"); // шаблонизатор
  var cronJob = require("cron").CronJob;

  //запуск начала новых транспортных суток
  var cron = require("cron");
  var cronJob = cron.job("0 50 3 * * *", function () {
    console.info("Новые транспортные сутки");
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var dateLast =
      d.getFullYear() + "-" + (+d.getMonth() + 1) + "-" + d.getDate();
    initValTr(dateLast);
  });
  cronJob.start();

  //установка флагов разрешения записи файлов
  var valFlag = false;
  var cronFlag = cron.job("*/5 * * * * *", function () {
    valFlag = true;
  });
  cronFlag.start();

  //var usersFile = 'data/agent.json'; // файл пользователей
  var usersFile = "data/validations.json"; // файл пользователей
  var jsonParser = bodyParser.json();
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
  var validPeFile = "data/validPe.json"; // файл последних действий водителя
  var validPe = {}; // объявление obj последних действий водителя
  var vapecont = fs.readFileSync(validPeFile, "utf8");
  validPe = JSON.parse(vapecont);

  //валидации по рейсам ПЕ, водитель
  var peValidTrip = "data/peValidTrips.json"; // файл валидации по рейсам
  var content = fs.readFileSync(peValidTrip, "utf8");
  var peTrip = JSON.parse(content);

  function addvalid(pe, trips, timeData) {
    try {
      var result = false;
      // pe
      try {
        peTrip[pe].validCount = Number(peTrip[pe].validCount) + 1;
        peTrip[pe].timestamp = timeData;
      } catch (e) {
        console.log("1. валид.ПЕ " + trips);
        peTrip[pe] = {};
        peTrip[pe].validCount = 1;
        peTrip[pe].timestamp = "";
      }
      try {
        peTrip[pe][trips].timestampTrips = timeData;
      } catch (e) {
        console.log("2. Время вал. " + trips);
        peTrip[pe][trips] = {};
        peTrip[pe][trips].timestampTrips = timeData;
        peTrip[pe][trips].validTripsCount = 0;
      }
      try {
        peTrip[pe][trips].validTripsCount =
          Number(peTrip[pe][trips].validTripsCount) + 1;
      } catch (e) {
        console.log("3. К-во вал. " + trips);
        peTrip[pe][trips].validTripsCount = 1;
      }
      result = true;
      return result + " validation";
    } catch (e) {
      console.log("----------Error add validation----------");
      return result;
    }
  }

  function addtrip(pe, trips, timeData, vod, cod) {
    try {
      var result = false;
      pe = trips[0] + pe;
      try {
        peTrip[pe].validCount = peTrip[pe].validCount;
      } catch (e) {
        peTrip[pe] = {};
        peTrip[pe].validCount = 0;
        peTrip[pe].timestamp = "";
      }

      try {
        peTrip[pe][trips].timestampTrips = peTrip[pe][trips].timestampTrips;
      } catch (e) {
        peTrip[pe][trips] = {};
        peTrip[pe][trips].timestampTrips = "";
        peTrip[pe][trips].validTripsCount = 0;
      }
      if (cod === "SN") {
        try {
          peTrip[pe][trips][vod].eTimeB = timeData;
        } catch (e) {
          peTrip[pe][trips][vod] = {};
          peTrip[pe][trips][vod].eTimeB = timeData;
          peTrip[pe][trips][vod].eTimeE = "";
        }
      }
      if (cod === "SE") {
        try {
          peTrip[pe][trips][vod].eTimeE = timeData;
        } catch (e) {
          peTrip[pe][trips][vod] = {};
          peTrip[pe][trips][vod].eTimeE = timeData;
          peTrip[pe][trips][vod].eTimeB = "";
        }
      }
      result = true;
      return result + " trip";
    } catch (e) {
      console.log("----------Error add trip----------");
      return result;
    }
  }

  // переход на новые транспортные сутки
  function initValTr(dateLast) {
    try {
      var result = false;
      var data = JSON.stringify(peTrip);
      var peValidTripS = "data/peValidTrips" + dateLast + ".json";
      fs.writeFileSync(peValidTripS, data);

      // формируем файл с данными на текущие сутки
      peTrip = {};
      var data = JSON.stringify(peTrip);
      fs.writeFileSync(peValidTrip, data);

      //console.log("Получаем - " + peTrip);
      result = true;
      return result + " init new date";
    } catch (e) {
      console.log("----------Error init new date----------");
      return false;
    }
  }

  // переход на новые транспортные сутки
  function saveValTr() {
    try {
      var result = false;
      var data = JSON.stringify(peTrip);
      fs.writeFileSync(peValidTrip, data);
      result = true;
      return result;
    } catch (e) {
      console.log("----------Error save file----------");
      return result;
    }
  }

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
      console.log("Connected agent.json to MongoDB");
    }
  });

  function saveDB(name, data) {
    var result = 0;
    var tempData = { _id: name, cont: data };
    db.collection("fuel").update(
      { _id: name },
      { tempData },
      { upsert: true },
      function (err, result) {
        if (err) console.log("Error save mongo agent.json");
        else console.log("Success save mongo agent.json");
      }
    );
    return result;
  }

  // получение списка данных
  app.get("/api/ausers", function (req, res) {
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
  app.get("/api/ausers/:id", function (req, res) {
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

    // отправляем пользователя
    if (user) {
      res.send(user);
    } else {
      res.status(404).send();
    }
  });

  // получение отправленных данных
  app.post("/api/validate", urlencodedParser, function (req, res) {
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

      //проверяем и исправляем на формат массива
      if (arrtemp[0] != "[") {
        arrtemp.splice(0, 0, "[");
        arrtemp.splice(arrtemp.length - 1, 0, "]");
      }
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
      saveDB(usersFile, data);
      res.send("code: 204");
    } catch (e) {
      console.log(e);
      res.sendStatus(417);
    }
  });

  // получение отправленных данных
  app.post("/api/ausers", jsonParser, function (req, res) {
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

  // получение по рейсу начало, конец, водитель id
  app.get("/api/tripsvod/:trips/:pe/:vod/:timeData/:cod", function (req, res) {
    try {
      //console.log("Действия водителя получены 1");
      var trips = req.params.trips; // получаем trips
      var pe = req.params.pe; // получаем pe
      var vod = req.params.vod; // получаем vod
      var timeData = req.params.timeData; // time
      var cod = req.params.cod; // получаем cod

      // добавляем рейс водитель, начало, конец
      addtrip(pe, trips, timeData, vod, cod);
      res.status(200).send();
    } catch (e) {
      res.status(404).send();
    }
  });

  // получение рейсов и валидаций
  app.post("/api/auserstrips", jsonParser, function (req, res) {
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
    try {
      var user = {
        id: 1,
        timestamp: peTrip[location_id].timestamp,
        line: peTrip[location_id].validCount,
        trip_id: trip_id,
        passengers: passengers,
        stop_code: stop_code,
        stop_sequence: stop_sequence,
        location_id: location_id,
        product_id: product_id,
        card_id: card_id,
        doc_num: doc_num,
      };
      var data = JSON.stringify(peTrip[location_id]).replace(/,/g, "<br>");
    } catch (e) {
      var user = {
        id: 1,
        timestamp: "",
        line: "ІНФОРМАЦІЯ ВІДСУТНЯ",
        trip_id: "",
        passengers: "",
        stop_code: "",
        stop_sequence: "",
        location_id: location_id,
        product_id: "",
        card_id: "",
        doc_num: "",
      };
      var data = "";
    }
    user.passengers = peTrip[location_id];
    user.trip_id = data;
    res.send(user);
  });

  // получение валидаций с АСОП (тестовая+продуктовая среда)
  app.post("/validations", bodyParser.json(), function (req, res) {
    console.log("/validations");
    if (!req.body) return res.sendStatus(400);
    var tempdata = [];
    var item = 0;
    var tempstr = req.body;
    tempdata.push(tempstr);
    tempstr = JSON.stringify(req.headers);
    tempdata.push(tempstr);
    var datatemp = JSON.stringify(tempdata);

    // перезаписываем файл с новыми данными
    fs.writeFileSync("data/tempValidations.json", datatemp);
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
      // передача валидаций 10.31.11.241:3000
      var btest = JSON.stringify(req.body);
      if (typeof req.body === "string") {
      } else {
        btest = JSON.stringify(req.body);
      }

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
      var arr;
      arr = req.body;
      for (var i = 0; i < arr.length; i++) {
        var KC, QR, TC;
        var timestamp = arr[i].timestamp;
        var line = arr[i].line;
        var trip_id = arr[i].trip_id;
        var passengers = arr[i].passengers;
        var stop_code = arr[i].stop_code;
        var stop_sequence = arr[i].stop_sequence;
        var location_id = arr[i].location_id;
        var product_id = arr[i].product_id;
        var card_id = arr[i].card_id;
        var doc_num = arr[i].doc_num;
        try {
          var door_id = arr[i].door_id;
          var card_type = arr[i].card_type;
        } catch (e) {
          var door_id = "";
          var card_type = "";
        }

        if (location_id.length < 4 && location_id.charAt(0) === "0") {
          location_id = location_id.substring(1);
        }
        var user = {
          timestamp: timestamp,
          line: line,
          trip_id: trip_id,
          passengers: passengers,
          stop_code: stop_code,
          stop_sequence: stop_sequence,
          location_id: location_id,
          product_id: door_id,
          card_id: card_type,
          doc_num: doc_num,
        };

        // увеличиваем его на единицу
        user.id = id + 1 + i;

        // удаляем 1 пользователя из массива
        if (users.length > 4000) users.splice(0, 1);

        // добавляем пользователя в массив
        users.push(user);
        if (user.stop_code === null) {
          var pe = "V" + user.location_id;
        } else {
          var pe = user.stop_code.substring(0, 1) + user.location_id;
          if (user.location_id === "0289") {
            var pe = "V" + user.location_id;
          }
        }
        if (!validPe[pe]) {
          try {
            if (user.card_id === "KC") {
              try {
                TC = validPe[pe].timestampTC;
              } catch (e) {
                TC = "";
              }
              try {
                QR = validPe[pe].timestampQR;
              } catch (e) {
                QR = "";
              }
              validPe[pe] = {
                timestamp: user.timestamp,
                timestampKC: user.timestamp,
                timestampTC: TC,
                timestampQR: QR,
              };
            }

            if (user.card_id === "TC") {
              try {
                KC = validPe[pe].timestampKC;
              } catch (e) {
                KC = "";
              }
              try {
                QR = validPe[pe].timestampQR;
              } catch (e) {
                QR = "";
              }
              validPe[pe] = {
                timestamp: user.timestamp,
                timestampTC: user.timestamp,
                timestampKC: KC,
                timestampQR: QR,
              };
            }
            if (user.card_id === "QR") {
              try {
                KC = validPe[pe].timestampKC;
              } catch (e) {
                KC = "";
              }
              try {
                TC = validPe[pe].timestampTC;
              } catch (e) {
                TC = "";
              }
              validPe[pe] = {
                timestamp: user.timestamp,
                timestampQR: user.timestamp,
                timestampKC: KC,
                timestampTC: TC,
              };
            }
          } catch (e) {
            validPe[pe] = {
              timestamp: user.timestamp,
            };
            console.log(e);
          }

          // Добавляем валидацию рейса
          var peT = pe;
          try {
            var tripsT = user.trip_id;
          } catch (e) {
            var tripsT = "0";
          }
          try {
            var timeDataT = user.timestamp;
          } catch (e) {
            var timeDataT = "00:00";
          }
          try {
            addvalid(peT, tripsT, timeDataT);
          } catch (e) {
            console.log(
              "Помилка додавання вал. рейсу - " +
                peT +
                "_" +
                tripsT +
                "_" +
                timeDataT
            );
          }
        } else {
          if (validPe[pe].timestamp < user.timestamp) {
            try {
              if (user.card_id === "KC") {
                try {
                  TC = validPe[pe].timestampTC;
                } catch (e) {
                  TC = "";
                }
                try {
                  QR = validPe[pe].timestampQR;
                } catch (e) {
                  QR = "";
                }
                validPe[pe] = {
                  timestamp: user.timestamp,
                  timestampKC: user.timestamp,
                  timestampTC: TC,
                  timestampQR: QR,
                };
              }
              if (user.card_id === "TC") {
                try {
                  KC = validPe[pe].timestampKC;
                } catch (e) {
                  KC = "";
                }
                try {
                  QR = validPe[pe].timestampQR;
                } catch (e) {
                  QR = "";
                }
                validPe[pe] = {
                  timestamp: user.timestamp,
                  timestampTC: user.timestamp,
                  timestampKC: KC,
                  timestampQR: QR,
                };
              }
              if (user.card_id === "QR") {
                try {
                  KC = validPe[pe].timestampKC;
                } catch (e) {
                  KC = "";
                }
                try {
                  TC = validPe[pe].timestampTC;
                } catch (e) {
                  TC = "";
                }
                validPe[pe] = {
                  timestamp: user.timestamp,
                  timestampQR: user.timestamp,
                  timestampKC: KC,
                  timestampTC: TC,
                };
              }
            } catch (e) {
              validPe[pe] = {
                timestamp: user.timestamp,
              };
            }
          }

          // Добавляем валидацию рейса
          var peT = pe;
          try {
            var tripsT = user.trip_id;
          } catch (e) {
            var tripsT = "0";
          }
          try {
            var timeDataT = user.timestamp;
          } catch (e) {
            var timeDataT = "00:00";
          }
          try {
            addvalid(peT, tripsT, timeDataT);
          } catch (e) {
            console.log(
              "Помилка додавання вал. рейсу - " +
                peT +
                "_" +
                tripsT +
                "_" +
                timeDataT
            );
          }
        }
      }

      // запись файлов раз в 5 секунд
      var data = JSON.stringify(validPe);

      // перезаписываем файл с новыми данными
      fs.writeFileSync(validPeFile, data);
      var data1 = JSON.stringify(users);

      // перезаписываем файл с новыми данными
      fs.writeFileSync(usersFile, data1);
      saveDB(usersFile, data1);

      // запись файла рейсов с новыми данными
      saveValTr();
      res.send("code: 204");
    } catch (e) {
      console.log(e);
      res.sendStatus(417);
    }
  });

  // удаление пользователя по id
  app.delete("/api/ausers/:id", function (req, res) {
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
  app.put("/api/ausers", jsonParser, function (req, res) {
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
