const { DataTypes } = require('sequelize');

const sequelize = require('../lib/sequelize');

const Submission = sequelize.define('submission', {
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    timestamp: { type: DataTypes.STRING, allowNull: false },
    grade: { type: DataTypes.FLOAT, allowNull: false },
    file: { type: DataTypes.STRING, allowNull: false },
});

exports.Submission = Submission;
exports.SubmissionClientFields = [
    'assignmentId',
    'studentId',
    'timestamp',
    'grade',
    'file',
];
