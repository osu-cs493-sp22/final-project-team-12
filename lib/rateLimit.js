const redis = require('redis');

const redisClient = require('./redis');

const rateLimitWindowMilliseconds = 60000;

async function rateLimit(req, res, next) {
    let key;
    let rateLimitWindowMaxRequests;
    if (req.validAuthToken === true) {
        // With a valid auth token, 30 requests/minute on a per-user basis
        key = 'userId.' + req.user.toString();
        rateLimitWindowMaxRequests = 30;
    } else {
        // Without a valid auth token, 10 requests/minute on a per-IP address basis
        key = req.ip;
        rateLimitWindowMaxRequests = 10;
    }

    let tokenBucket;
    try {
        tokenBucket = await redisClient.hGetAll(key);
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
        await redisClient.hSet(key, [
            ['tokens', tokenBucket.tokens],
            ['last', tokenBucket.last],
        ]);
        next();
    } else {
        await redisClient.hSet(key, [
            ['tokens', tokenBucket.tokens],
            ['last', tokenBucket.last],
        ]);
        res.status(429).send({
            error: 'Too many requests per minute',
        });
    }
}
exports.rateLimit = rateLimit;
