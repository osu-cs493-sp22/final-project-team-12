const express = require('express');
const morgan = require('morgan');

const api = require('./api');
const { checkAuthToken } = require('./lib/auth');
const { rateLimit } = require('./lib/rateLimit');
const redisClient = require('./lib/redis');
const sequelize = require('./lib/sequelize');

const app = express();
const port = process.env.PORT || 8000;

app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

app.use(checkAuthToken);
app.use(rateLimit);
app.use('/', api);

app.use('*', function (req, res, next) {
    res.status(404).send({
        error: 'Requested resource ' + req.originalUrl + ' does not exist',
    });
});

app.use('*', function (err, req, res, next) {
    console.error('Error:', err);
    res.status(500).send({
        error: 'An error occured, try again later',
    });
});

sequelize.sync().then(function () {
    redisClient.connect().then(function () {
        app.listen(port, function () {
            console.log('Server is listening on port:', port);
        });
    });
});
