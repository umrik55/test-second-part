// 20190513
var express = require("express");
var hbs = require("hbs"); // шаблонизатор
var bodyParser = require("body-parser");
var consign = require("consign"); //подгрузка модулей разных объектов инвентаризации
var app = express();
app.use(express.static(__dirname + "/public"));

// устанавливаем путь к каталогу с частичными представлениями
hbs.registerPartials(__dirname + "/views/partials");
var nconf = require("nconf");
var filenameconf = "./config.json";
nconf.argv().env().file({ file: filenameconf }); // подключаем конфиг файл
app.use(bodyParser.json({ limit: "5mb" }));
app.set("view engine", "hbs");
app.set("json spaces", 2);

// Подгружаем модули с каталога routes	(бизнес-логика)
consign().include("routes").into(app);

app.listen(nconf.get("ServerPort"), function () {
  console.log(
    "Сервер стартовал на порту " +
      nconf.get("ServerPort") +
      " и ожидает подключения..."
  );
});
