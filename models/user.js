const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = require('../lib/sequelize');
const { Course } = require('./course');

const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 8));
        },
        allowNull: false,
    },
    role: { type: DataTypes.STRING, allowNull: false },
});

// https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/
User.belongsToMany(Course, { through: 'Students' });
Course.belongsToMany(User, { through: 'Students' });

exports.User = User;
exports.UserClientFields = ['name', 'email', 'password', 'role'];
