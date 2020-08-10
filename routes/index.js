module.exports = (app) => {
  const User = require("../models/dataUser");
  const bodyParser = require("body-parser");
  let jsonParser = bodyParser.json();
  const UserAccess = require("../models/dataUserAccess");

  /*
    var userData = {
        email: "lyama961@gmail.com",
        username: "Forze961",
        password: "159753",
        filial: 5,
        level: 2,
        api_token: "45454",
        is_active: true
    }

    User.create(userData, function (error, user) {
        if (error) {
            console.log(error)
        } else {
            console.log("OK")
        }
    });
    /*

/*    UserAccess.create({id_level:2}, function (error, user) {
        if (error) {
            console.log(error)
        } else {
            console.log("OK")
        }
    });
    */
  /*
        Auth page render
    */
  app.get("/auth", function (req, res, next) {
    res.render("auth.hbs");
  });

  /*
        Router for admin panel settings (user manager)
    */
  app.get("/admin", jsonParser, function (req, res, next) {
    User.findById(req.session.userId).exec(function (error, user) {
      if (error) {
        return res.redirect("/auth");
      } else {
        if (user != null && user.level > 1) {
          return res.render("admin.hbs");
        } else {
          return res.redirect("/");
        }
      }
    });
  });

  /*
        Get his role for anu users
     */
  app.get("/get-my-data", function (req, res, next) {
    User.findById(req.session.userId).exec(function (error, user) {
      if (error) {
        return res.redirect("/auth");
      } else {
        if (user === null) {
          return res.send([]);
        } else {
          return res.send(user);
        }
      }
    });
  });

  /*
        Auth middlewear after send auth form
    */
  app.post("/auth", jsonParser, function (req, res, next) {
    if (req.body.logemail && req.body.logpassword) {
      User.authenticate(req.body.logemail, req.body.logpassword, function (
        error,
        user
      ) {
        if (error || !user) {
          return res.render("error.hbs", {
            error: "Помилка, логін або пароль не вірні...",
          });
        } else {
          req.session.userId = user._id;
          return res.redirect("/");
        }
      });
    } else {
      return res.render("error.hbs", {
        error: "Помилка, логін або пароль не вірні...",
      });
    }
  });

  /*
        Auth middlewear after logout (kill session)
    */
  app.get("/logout", jsonParser, function (req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect("/auth");
        }
      });
    }
  });

  /*
// confirm that user typed same password twice

if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
}

if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    }

    User.create(userData, function (error, user) {
        if (error) {
            return next(error);
        } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
        }
    });*/
};
