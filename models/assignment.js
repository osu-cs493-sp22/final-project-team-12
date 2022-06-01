const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');

const Assignment = sequelize.define('assignment', {
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    due: { type: DataTypes.STRING, allowNull: false },
});

exports.Assignment = Assignment;
exports.AssignmentClientFields = ['courseId', 'title', 'points', 'due'];
