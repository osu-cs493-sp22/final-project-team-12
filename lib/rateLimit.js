const redis = require('redis');

const redisClient = require('./redis');

const rateLimitWindowMilliseconds = 60000;
const rateLimitWindowMaxRequests = 10;

async function rateLimit(req, res, next) {
    const ip = req.ip;

    let tokenBucket;
    try {
        tokenBucket = await redisClient.hGetAll(ip);
    } catch (err) {
        next();
        return;
    }

    tokenBucket = {
        tokens: parseFloat(tokenBucket.tokens) || rateLimitWindowMaxRequests,
        last: parseInt(tokenBucket.last) || Date.now(),
    };

    const timestamp = Date.now();
    const elapsedMilliseconds = timestamp - tokenBucket.last;
    const refreshRate =
        rateLimitWindowMaxRequests / rateLimitWindowMilliseconds;
    tokenBucket.tokens += elapsedMilliseconds * refreshRate;
    tokenBucket.tokens = Math.min(
        rateLimitWindowMaxRequests,
        tokenBucket.tokens
    );
    tokenBucket.last = timestamp;

    if (tokenBucket.tokens >= 1) {
        tokenBucket.tokens -= 1;
        await redisClient.hSet(ip, [
            ['tokens', tokenBucket.tokens],
            ['last', tokenBucket.last],
        ]);
        next();
    } else {
        await redisClient.hSet(ip, [
            ['tokens', tokenBucket.tokens],
            ['last', tokenBucket.last],
        ]);
        res.status(429).send({
            error: 'Too many requests per minute',
        });
    }
}
exports.rateLimit = rateLimit;
