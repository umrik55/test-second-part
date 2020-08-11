var express = require("express");
var hbs = require("hbs"); // шаблонизатор
var bodyParser = require("body-parser");
var consign = require("consign"); //подгрузка модулей разных объектов инвентаризации
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
var app = express();
app.use(express.static(__dirname + "/public"));

// устанавливаем путь к каталогу с частичными представлениями
hbs.registerPartials(__dirname + "/views/partials");
var nconf = require("nconf");
var filenameconf = "./config.json";
nconf.argv().env().file({ file: filenameconf }); // подключаем конфиг файл

const mongoDb = require("./db/mongodb");
const db = mongoDb.connect();

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Asop some auth",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db,
      autoRemove: "interval",
      autoRemoveInterval: 60, // In minutes. Default
    }),
  })
);

// parse incoming requests
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
