const redis = require('redis');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT || '6379';

const redisClient = redis.createClient({
    url: `redis://${redisHost}:${redisPort}`,
});

module.exports = redisClient;
