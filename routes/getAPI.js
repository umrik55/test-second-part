//20190911 Module for use Services API. Передача второй ПЕ для трамвая
//20180807 Module for use Services API DmitryLyamtsev | Last UPD 17122017
/*===================API==================================API==================================API===============
     //Для подключениия функционала в другой модуль:
     var API = require('./getAPI.js')//Подключаем модуль

    //Для получения ВСЕХ формуляров на дату
    var res = new API("2017-11-10", null);//Заполнение конструктора значением даты БЕЗ таб. номера
    res.getFormular(function(obj){
        console.log(obj);
    });

    //Для получения ВСЕХ формуляров на дату для конкретного водителя
    var res = new API("2017-11-10", "1234");//Заполнение конструктора значением даты с таб. номером
    res.getFormular(function(obj){
        console.log(obj+"1");
    });


    //Для получения ВСЕХ заправок машины на дату по борт. номеру
    var res_f = new API("2017-11-08", "7598");

    res_f.getFuel(function(obj){
        console.log(obj);
    });

    //Для получения ВСЕХ данных с АРМ
    var res_arm = new API("2017-11-08", null);

    res_arm.<метод для вызова конкретного АРМа>(function(obj){
        console.log(obj);
    });

     for example Medical-Services:
     res_arm.getMed(function(obj){
        console.log(obj);
    });

 =================================================================================================================*/
module.exports = (app) => {
  var nconf = require("nconf");
  var filenameconf = "./config.json";
  nconf.argv().env().file({ file: filenameconf }); // подключаем конфиг файл

  var fs = require("fs");
  var hostFormular = nconf.get("urls_services:hostGetAsdu"); //Хост сервиса для получение формуляров
  var hostAwp = nconf.get("urls_services:hostGetAwp"); //Хост АРМ сервисов

  //Конструктор для обращения к модулю
  function init(n, a, c) {
    this.Date = n;
    this.Num = a;
    this.Filii = c;
  }

  //Проверка пустой ли объект данных
  function isEmptyObject(obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        return false;
      }
    }
    return true;
  }

  //Получение вчерашней даты для поиска заправок
  function dateYesterday(_date, _format, _delimiter) {
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(
      dateItems[yearIndex],
      month,
      dateItems[dayIndex]
    );
    return formatedDate;
  }

  //Получение объекта данных с формулярами
  init.prototype.getFormular = function (callback) {
    try {
      var idUrl;
      var DateForFile = this.Date;
      var Filii = this.Filii;
      //таб. номер не указан в запросе
      // настройка на 2 трол. депо
      if (!this.Num) {
        //idUrl = hostFormular + "asdu/api/FactWorkHeader/?transpID=3&date=" + this.Date + "&T00:00:00.000Z&begin=1899-12-31T22:00:00.000Z&end=1900-01-01T21:59:00.000Z&transpID=2&filialID="+this.Filii;
        idUrl =
          hostFormular +
          "asdu/api/FactWorkHeader/?date=" +
          this.Date +
          "&filialID=" +
          this.Filii;
      } else {
        idUrl =
          hostFormular +
          "asdu/api/FactWorkHeader/?transpID=3&date=" +
          this.Date +
          "&filialID=" +
          this.Filii +
          "&tabNum=" +
          this.Num;
      }
      require("request")(idUrl, function (error, response, body) {
        try {
          var str = JSON.parse(body);
          var newJson = [];
          var num = 0;
          var oblad = 0;
          var condytion = 0;
          if (!isEmptyObject(str)) {
            str.forEach(function (entry) {
              if (entry.A2 == null) {
                oblad = 0;
              } else {
                oblad = entry.A2;
              }
              if (entry.Cond == null) {
                condytion = 0;
              } else {
                condytion = entry.Cond;
              }

              newJson.push({
                id: num,
                validation: 0,
                cond: condytion, //1-наличие кондиционера
                A2: oblad, //Код значення роботи обладнання
                factWorkHeaderID: entry.ID,
                factWorkHeaderDate: entry.D,
                factWorkHeaderBegin: entry.B,
                factWorkHeaderEnd: entry.E,
                factWorkHeaderisClosed: entry.Cn,
                factWorkHeaderconfirm: null,
                smenNum: entry.S,
                smenBegin: null,
                smenEnd: null,
                smenTripCount: null,
                smenWay: null,
                smenZeroWay: null,
                smenWay_1: null,
                vipNum: entry.V,
                vipFilialID: entry.F,
                marNum: entry.M,
                marTranspID: entry.T,
                marName: null,
                driversTabNum: entry.TN,
                driversName: entry.Dr,
                driversClass: null,
                PEID: null,
                PENumPe: entry.Pe,
                PENumGov: entry.SN,
                TypePEName: entry.PN,
                Fd: entry.Fd || null,
                Pr: entry.Pr || null,
                CW: entry.CW || null,
              });
              num++;
              if (entry.Pe2 > 0) {
                newJson.push({
                  id: num,
                  validation: 0,
                  cond: condytion, //1-наличие кондиционера
                  A2: oblad, //Код значення роботи обладнання
                  factWorkHeaderID: entry.ID,
                  factWorkHeaderDate: entry.D,
                  factWorkHeaderBegin: entry.B,
                  factWorkHeaderEnd: entry.E,
                  factWorkHeaderisClosed: entry.Cn,
                  factWorkHeaderconfirm: null,
                  smenNum: entry.S + "-п",
                  smenBegin: null,
                  smenEnd: null,
                  smenTripCount: null,
                  smenWay: null,
                  smenZeroWay: null,
                  smenWay_1: null,
                  vipNum: entry.V,
                  vipFilialID: entry.F,
                  marNum: entry.M,
                  marTranspID: entry.T,
                  marName: null,
                  driversTabNum: entry.TN,
                  driversName: entry.Dr,
                  driversClass: null,
                  PEID: null,
                  PENumPe: entry.Pe2,
                  PENumGov: entry.SN,
                  TypePEName: entry.PN,
                  Fd: entry.Fd || null,
                  Pr: entry.Pr || null,
                  CW: entry.CW || null,
                });
                num++;
              }
            });
          } else {
            callback(null);
          }
          if (newJson.length != 0) {
            var data = JSON.stringify(newJson);
          } else callback(null);

          callback(data);
        } catch (e) {
          callback(null);
          console.log(e);
        }
      });
    } catch (e) {
      callback(null);
      console.log(e);
    }
  };

  //Получение объекта данных по факту заправки на сегодня и вчера
  init.prototype.getFuel = function (callback) {
    try {
      var fuelObj;
      var fuelsObj = {};
      var idUrl;
      var dateYest = dateYesterday(this.Date, "yyyy-mm-dd", "-")
        .toISOString()
        .slice(0, 10); //Получение вчерашней даті и преобразование в строку...

      //Получаем заправки за вчера
      idUrl = hostAwp + "v1/fuel/get-full-activity-json?date=" + dateYest;
      require("request")(idUrl, function (error, response, body) {
        try {
          fuelObj = JSON.parse(body);
          //callback(str);
        } catch (e) {
          callback(null);
          console.log(e);
        }
      });

      //..за сегодня и соединяем с вчерашними
      idUrl = hostAwp + "v1/fuel/get-full-activity-json?date=" + this.Date;
      require("request")(idUrl, function (error2, response2, body2) {
        try {
          var fuelObj2 = JSON.parse(body2);
          if (isEmptyObject(fuelObj)) {
            if (isEmptyObject(fuelObj2)) {
              callback(null);
            } else {
              fuelsObj.fuelTomorow = fuelObj2; //Найдены только сегодняшние заправки
            }
          } else {
            if (isEmptyObject(fuelObj2)) {
              fuelsObj.fuelYesterday = fuelsObj; //Найдены только вчерашние заправоки
            } else {
              fuelsObj.fuelYesterday = fuelObj; //...
              fuelsObj.fuelTomorow = fuelObj2; //Найдены заправки вчера и сегодня
            }
          }
          //console.dir(fuelsObj)
          callback(fuelsObj);
        } catch (e2) {
          callback(null);
          //console.log(e2);
        }
      });
    } catch (e) {
      callback(null);
      console.log(e);
    }
  };

  //Получение объекта данных по факту Мед
  init.prototype.getMed = function (callback) {
    try {
      var idUrl;
      idUrl =
        hostAwp + "v1/medical-service/get-full-activity-json?date=" + this.Date;
      require("request")(idUrl, function (error, response, body) {
        try {
          var str = JSON.parse(body);
          callback(str);
        } catch (e) {
          callback(null);
          console.log(e);
        }
      });
    } catch (e) {
      callback(null);
      console.log(e);
    }
  };

  //Получение объекта данных по факту ВТК
  init.prototype.getVtk = function (callback) {
    try {
      var idUrl;
      idUrl =
        hostAwp + "v1/vehicle-tcd/get-full-activity-json?date=" + this.Date;
      require("request")(idUrl, function (error, response, body) {
        try {
          var str = JSON.parse(body);
          callback(str);
        } catch (e) {
          callback(null);
          console.log(e);
        }
      });
    } catch (e) {
      callback(null);
      console.log(e);
    }
  };

  //Получение объекта данных регистраций климатического оборудования ПЕ 2355
  init.prototype.getClimatyk = function (callback) {
    try {
      var idUrl;
      var DateForFile = this.Date;
      //таб. номер не указан в запросе
      // настройка на 2 трол. депо
      if (!this.Num) {
        // http://10.11.1.114/asdu/api/alarm/2018-01-24/2355/10
        idUrl = hostFormular + "asdu/api/alarm/" + this.Date + "/2355/10";
        //idUrl = hostFormular + "asdu/api/alarm/" + this.Date + "/2318/10";
      } else {
        idUrl = hostFormular + "asdu/api/alarm/" + this.Date + "/2355/10";
        //idUrl = hostFormular + "asdu/api/alarm/" + this.Date + "/2318/10";
      }
      //console.log(idUrl);
      require("request")(idUrl, function (error, response, body) {
        try {
          var str = JSON.parse(body);
          var newJson = [];
          var num = 0;
          if (!isEmptyObject(str)) {
            str.forEach(function (entry) {
              newJson.push({
                id: num,
                factWorkHeaderID: entry.ID,
                factDateTime: entry.D,
                smenNum: entry.S,
                vipNum: entry.V,
                marNum: entry.M,
                driversTabNum: entry.TN,
                A2: entry.A2,
                X: entry.X,
                Y: entry.Y,
              });
              num++;
            });
          } else {
            callback(null);
          }
          //console.log(newJson.length);
          if (newJson.length != 0) {
            var data = JSON.stringify(newJson);
          } else callback(null);

          callback(data);
        } catch (e) {
          callback(null);
          console.log(e);
        }
      });
    } catch (e) {
      callback(null);
      console.log(e);
    }
  };

  //Получение объекта данных регистраций климатического оборудования ПЕ 2355
  init.prototype.getClimatykA = function (callback) {
    try {
      var idUrl;
      var DateForFile = this.Date;
      //console.log(this.Filii);
      //таб. номер не указан в запросе
      // настройка на 2 трол. депо
      if (!this.Num) {
        idUrl =
          hostFormular +
          "asdu/api/alarm/" +
          this.Date +
          "/" +
          this.Num +
          "/" +
          this.Filii;
      } else {
        idUrl =
          hostFormular +
          "asdu/api/alarm/" +
          this.Date +
          "/" +
          this.Num +
          "/" +
          this.Filii;
      }
      require("request")(idUrl, function (error, response, body) {
        try {
          var str = JSON.parse(body);
          var newJson = [];
          var num = 0;
          if (!isEmptyObject(str)) {
            str.forEach(function (entry) {
              newJson.push({
                id: num,
                factWorkHeaderID: entry.ID,
                factDateTime: entry.D,
                smenNum: entry.S,
                vipNum: entry.V,
                marNum: entry.M,
                driversTabNum: entry.TN,
                A2: entry.A2,
                X: entry.X,
                Y: entry.Y,
              });
              num++;
            });
          } else {
            callback(null);
          }
          if (newJson.length != 0) {
            var data = JSON.stringify(newJson);
          } else callback(null);

          callback(data);
        } catch (e) {
          callback(null);
          console.log(e);
        }
      });
    } catch (e) {
      callback(null);
      console.log(e);
    }
  };

  module.exports = init; //экспорт конструктора для заполнения
};
