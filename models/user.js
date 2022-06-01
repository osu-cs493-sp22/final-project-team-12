const { DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");
const bcrypt = require("bcryptjs");

const User = sequelize.define("user", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: {
    type: DataTypes.STRING,
    set(value) {
      this.setDataValue("password", bcrypt.hashSync(value, 8));
    },
    allowNull: false,
  },
  role: { type: DataTypes.STRING, allowNull: false },
});

exports.User = User;
exports.UserClientFields = ["name", "email", "password", "role"];
