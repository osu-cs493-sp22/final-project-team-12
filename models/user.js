const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');
const bcrypt = require('bcryptjs');
const { Course } = require('./course');
const { Assignment } = require('./assignment');
const { Submission } = require('./submission');

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

User.belongsToMany(Course, { through: 'Students' });
Course.belongsToMany(User, { through: 'Students' });

Assignment.hasMany(Submission, { foreignKey: { allowNull: false } });
Submission.belongsTo(Assignment);

Course.hasMany(Assignment, { foreignKey: { allowNull: false } });
Assignment.belongsTo(Course);

exports.User = User;
exports.UserClientFields = ['name', 'email', 'password', 'role'];
