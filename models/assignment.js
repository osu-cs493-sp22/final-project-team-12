const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');
const { Submission } = require('./submission');

const Assignment = sequelize.define('assignment', {
    title: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    due: { type: DataTypes.STRING, allowNull: false },
});

Assignment.hasMany(Submission, { foreignKey: { allowNull: false } });
Submission.belongsTo(Assignment);

exports.Assignment = Assignment;
exports.AssignmentClientFields = ['courseId', 'title', 'points', 'due'];
