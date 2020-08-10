const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchemaAccess = new Schema({
  name_level: {
    type: String,
    required: true,
  },
  id_level: {
    type: Number,
    required: true,
    default: false,
  },
  read_route: {
    type: Boolean,
    default: false,
  },
  set_route: {
    type: Boolean,
    default: false,
  },
  delete_route: {
    type: Boolean,
    default: false,
  },
  change_route: {
    type: Boolean,
    default: false,
  },
  api_route: {
    type: Boolean,
    default: false,
  },
});

//authenticate input against database
UserSchemaAccess.statics.getAccess = async function (level, route) {
  return await UserAccess.findOne({ id_level: level }, route);
};

const UserAccess = mongoose.model("UserAccess", UserSchemaAccess);
module.exports = UserAccess;
