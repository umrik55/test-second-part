// 20181130  сервисы принятия от АСОП билетной продукции
module.exports = (app) => {
  var bodyParser = require("body-parser");
  var fs = require("fs");
  var hbs = require("hbs"); // шаблонизатор
  var usersFile = "data/cards.json"; // файл пользователей
  var jsonParser = bodyParser.json();
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
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
      console.log("Connected cards.json to MongoDB");
    }
  });

  function saveDB(name, data) {
    var result = 0;
    var tempData = { _id: name, cont: data };
    db.collection("cards").update(
      { _id: name },
      { tempData },
      { upsert: true },
      function (err, result) {
        if (err) console.log("Error save mongo cards.json");
        else console.log("Success save mongo cards.json");
      }
    );
    return result;
  }

  // получение списка данных
  app.get("/api/causers", function (req, res) {
    var content = fs.readFileSync(usersFile, "utf8");
    var users = JSON.parse(content);
    res.send(users);
  });

  // получение одного пользователя по id
  app.get("/api/causers/:id", function (req, res) {
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
  app.post("/api/cvalidate", urlencodedParser, function (req, res) {
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
        users.push(user);
      }
      var data = JSON.stringify(users);
      fs.writeFileSync(usersFile, data);
      res.send("code: 204");
      saveDB(usersFile, data);
    } catch (e) {
      console.log(e);
      res.sendStatus(417);
    }
  });

  // получение отправленных данных
  app.post("/api/causers", jsonParser, function (req, res) {
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
  app.post("/tickets", urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
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
      //читаем существующие валидации
      var id;
      var data = fs.readFileSync(usersFile, "utf8");
      var users = JSON.parse(data);
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
        var product_id = tempParse.product_id;
        var doc_num = tempParse.doc_num;
        var rstatus = tempParse.status;
        var line = tempParse.line;
        var trip_id = tempParse.trip_id;
        var stop_code = tempParse.stop_code;
        var stop_sequence = tempParse.stop_sequence;
        var location_id = tempParse.location_id;
        var card_id = tempParse.card_id;
        var payment_channel = tempParse.payment_channel;
        var buyer_channel = tempParse.buyer_channel;
        var price = tempParse.price;
        var currency = tempParse.currency;
        var passengers = tempParse.passengers;
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
          status: rstatus,
          payment_channel: payment_channel,
          buyer_channel: buyer_channel,
          price: price,
          currency: currency,
        };

        // увеличиваем его на единицу
        user.id = id + 1 + i;

        // добавляем билет в массив
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

  // удаление пользователя по id
  app.delete("/api/causers/:id", function (req, res) {
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
  app.put("/api/causers", jsonParser, function (req, res) {
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
