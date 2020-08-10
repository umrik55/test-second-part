// 20180814 сервіси для посилань меню
module.exports = (app) => {
  var bodyParser = require("body-parser");
  var fs = require("fs");
  var hbs = require("hbs"); // шаблонизатор
  var peFile = "data/pefuel.json"; // файл заправок ПЕ
  var usersFile = "data/users.json"; // файл пользователей
  var refRezFile = "data/rezervuarname.json"; // файл резервуаров
  var refAgentFile = "data/agent.json"; // файл постачальників
  var refValidateFile = "data/validations.json"; // файл по валидациям
  var refCardsFile = "data/cards.json"; // файл по билетным продуктам
  var refEvendsFile = "data/evends.json"; // файл события водителей
  var jsonParser = bodyParser.json();

  const User = require("../models/dataUser");

  // запрос страницы с пользователями
  app.get("/", function (request, response) {
    try {
      var content = fs.readFileSync(usersFile, "utf8");
      var users = JSON.parse(content);
      response.render("inUser.hbs", {
        users: users,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы форма 4 мтп
  app.get("/repportmtp4", function (request, response) {
    try {
      /*
			var content = fs.readFileSync("data/mtp4.json", "utf8");
			var user = JSON.parse(content);
			response.render("inMTP4.hbs", {
				user: user
			});
			return;
			*/

      var content = fs.readFileSync(
        "data/Fuel_2017-06-15_Remaining fuel.json",
        "utf8"
      );
      var user = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл резервуаров
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      response.render("inRepport_mtp.hbs", {
        user: user,
        rezs: rezs,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы ведомость расхода 5.4
  app.get("/repport4", function (request, response) {
    try {
      var content = fs.readFileSync(
        "data/Fuel_2017-06-15_Remaining fuel.json",
        "utf8"
      );
      var user = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл резервуаров
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      response.render("inRepport41.hbs", {
        user: user,
        rezs: rezs,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы ведомость заправки 5.3
  app.get("/repport3", function (request, response) {
    try {
      var content = fs.readFileSync("data/servis_.json", "utf8");
      var user = JSON.parse(content);
      response.render("inRepport3.hbs", {
        user: user,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы ведомость заправки 5.3
  app.get("/repaddeshl", function (request, response) {
    try {
      var content = fs.readFileSync("data/filii.json", "utf8");
      var repps = JSON.parse(content);
      response.render("inESHL.hbs", {
        repps: repps,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с валидациями АСОП
  app.get("/agent", function (request, response) {
    try {
      User.findById(request.session.userId).exec(function (error, user) {
        if (error) {
          return response.redirect("/auth");
        } else {
          if (user === null || user.is_active === false) {
            return response.redirect("/auth");
          } else {
            var content = fs.readFileSync(refValidateFile, "utf8");
            var users = JSON.parse(content);
            //console.log(users);
            response.render("inAgent.hbs", {
              users: users,
            });
          }
        }
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос рейсов с валидациями АСОП
  app.get("/trips", function (request, response) {
    try {
      var content = fs.readFileSync(refValidateFile, "utf8");
      var users = JSON.parse(content);
      //console.log(users);
      //response.render('inAgent.hbs', {
      response.render("inTrips.hbs", {
        users: users,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с билетными продуктами АСОП
  app.get("/cards", function (request, response) {
    try {
      var content = fs.readFileSync(refCardsFile, "utf8");
      var users = JSON.parse(content);
      //console.log(users);
      response.render("inCards.hbs", {
        users: users,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с состоянием оборудования  АСОП
  app.get("/equips", function (request, response) {
    try {
      User.findById(request.session.userId).exec(function (error, user) {
        if (error) {
          return response.redirect("/auth");
        } else {
          if (user === null || user.is_active === false) {
            return response.redirect("/auth");
          } else {
            var content = fs.readFileSync(refEvendsFile, "utf8");
            var users = JSON.parse(content);
            //console.log(users);
            response.render("inEquips.hbs", {
              users: users,
            });
          }
        }
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с событиями водителей  АСОП
  app.get("/evends", function (request, response) {
    try {
      User.findById(request.session.userId).exec(function (error, user) {
        if (error) {
          return response.redirect("/auth");
        } else {
          if (user === null || user.is_active === false) {
            return response.redirect("/auth");
          } else {
            var content = fs.readFileSync(refEvendsFile, "utf8");
            var users = JSON.parse(content);
            //console.log(users);
            response.render("inEvents.hbs", {
              users: users,
            });
          }
        }
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы справочника резервуаров
  app.get("/refrezervuar", function (request, response) {
    try {
      var typeFuelFile = "data/Fuel.json"; // файл типов топлива
      var content = fs.readFileSync(typeFuelFile, "utf8");
      var fuels = JSON.parse(content);
      var content = fs.readFileSync(refRezFile, "utf8");
      var users = JSON.parse(content);
      response.render("inRefRez.hbs", {
        fuels: fuels,
        users: users,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы ведомости запрвки
  app.get("/repport31", function (request, response) {
    try {
      var content = fs.readFileSync("data/repport.json", "utf8");
      var repps = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл резервуаров
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      response.render("inRepport31.hbs", {
        repps: repps,
        rezs: rezs,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы ведомостями
  app.get("/repport", function (request, response) {
    try {
      var content = fs.readFileSync("data/repport.json", "utf8");
      var repps = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл резервуаров
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      response.render("inRepport.hbs", {
        repps: repps,
        rezs: rezs,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы для расчета лимитов заправки РЕ
  app.get("/pelimit", function (request, response) {
    try {
      var content = fs.readFileSync("data/filii.json", "utf8");
      var repps = JSON.parse(content);
      response.render("inLimitPE.hbs", {
        repps: repps,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы инвентаризации резервуаров
  app.get("/rezervuar", function (request, response) {
    try {
      var typeFuelFile = "data/Fuel.json"; // файл типов топлива
      var content = fs.readFileSync(typeFuelFile, "utf8");
      var fuels = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл резервуаров
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      response.render("inRezFuel.hbs", {
        fuels: fuels,
        rezs: rezs,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы прихода в резервуар
  app.get("/add", function (request, response) {
    try {
      var typeFuelFile = "data/Fuel.json"; // файл типов топлива
      var content = fs.readFileSync(typeFuelFile, "utf8");
      var fuels = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл типов топлива
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      typeFuelFile = "data/agent.json"; // файл типов топлива
      content = fs.readFileSync(typeFuelFile, "utf8");
      var agents = JSON.parse(content);

      response.render("inAddFuel.hbs", {
        rezs: rezs,
        agents: agents,
        fuels: fuels,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы перемещения с резервуара
  app.get("/remove", function (request, response) {
    try {
      var typeFuelFile = "data/Fuel.json"; // файл типов топлива
      var content = fs.readFileSync(typeFuelFile, "utf8");
      var fuels = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл типов топлива
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      typeFuelFile = "data/agent.json"; // файл типов топлива
      content = fs.readFileSync(typeFuelFile, "utf8");
      var agents = JSON.parse(content);

      response.render("inRemoveFuel.hbs", {
        rezs: rezs,
        agents: agents,
        fuels: fuels,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с РО
  app.get("/pe", function (request, response) {
    try {
      var typeFuelFile = "data/users.json"; // файл типов топлива
      var content = fs.readFileSync(typeFuelFile, "utf8");
      var mars = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл типов топлива
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      response.render("inPEFuel.hbs", {
        mars: mars,
        rezs: rezs,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с РО Маршрутов
  app.get("/pemar", function (request, response) {
    try {
      var typeFuelFile = "data/mars.json"; // файл типов топлива
      var content = fs.readFileSync(typeFuelFile, "utf8");
      var mars = JSON.parse(content);
      typeFuelFile = "data/rezervuarname.json"; // файл типов топлива
      content = fs.readFileSync(typeFuelFile, "utf8");
      var rezs = JSON.parse(content);
      response.render("inPEMarFuel.hbs", {
        mars: mars,
        rezs: rezs,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
};
