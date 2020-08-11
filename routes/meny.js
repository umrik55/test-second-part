// 20180814 сервіси для посилань меню
module.exports = (app) => {
  var bodyParser = require("body-parser");
  var fs = require("fs");
  var usersFile = "data/users.json"; // файл пользователей
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
};
