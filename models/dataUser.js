const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");
const UserAccess = require("../models/dataUserAccess");

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  filial: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  api_token: {
    type: String,
    required: true,
  },
  is_active: {
    type: Boolean,
    required: true,
  },
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email }).exec(function (err, user) {
    if (err) {
      return callback(err);
    } else if (!user) {
      let err = new Error("User not found.");
      err.status = 401;
      return callback(err);
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result === true) {
        return callback(null, user);
      } else {
        return callback();
      }
    });
  });
};

//authenticate input against database
UserSchema.statics.authenticateAPI = async function (token) {
  return new Promise((resolve, reject) => {
    User.findOne({ api_token: token }).exec(function (err, user) {
      if (err) {
        return resolve(false);
      } else if (!user) {
        let err = new Error("User not found.");
        err.status = 401;
        return resolve(false);
      }
      return resolve(
        UserAccess.getAccess(user.level, { api_route: 1, _id: 0 })
      );
    });
  });
};

//hashing a password before saving it to the database
UserSchema.pre("save", function (next) {
  let user = this;
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
