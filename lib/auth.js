const jwt = require('jsonwebtoken');

const secret = 'SuperSecret';

function generateAuthToken(userId, role) {
    const payload = { sub: userId, role: role };
    return jwt.sign(payload, secret, { expiresIn: '24h' });
}
exports.generateAuthToken = generateAuthToken;

function requireAuthentication(req, res, next) {
    const authHeader = req.get('authorization') || '';
    const authParts = authHeader.split(' ');
    const token = authParts[0] === 'Bearer' ? authParts[1] : null;

    try {
        const payload = jwt.verify(token, secret);
        console.log('Payload:', payload);
        req.user = payload.sub;
        req.role = payload.role;
        next();
    } catch (err) {
        res.status(401).send({
            error: 'Invalid authentication token',
        });
    }
}
exports.requireAuth = requireAuthentication;

function checkAdmin(req, res, next) {
    const authHeader = req.get('authorization') || '';
    const authParts = authHeader.split(' ');
    const token = authParts[0] === 'Bearer' ? authParts[1] : null;

    try {
        const payload = jwt.verify(token, secret);
        console.log('Payload:', payload);
        req.user = payload.sub;
        req.role = payload.role;
        next();
    } catch (err) {
        console.log('Not logged in');
        req.role = 'student';
        next();
    }
}
exports.checkAdmin = checkAdmin;

function checkAuthToken(req, res, next) {
    const authHeader = req.get('authorization') || '';
    const authParts = authHeader.split(' ');
    const token = authParts[0] === 'Bearer' ? authParts[1] : null;

    try {
        const payload = jwt.verify(token, secret);
        console.log('Payload:', payload);
        req.user = payload.sub;
        req.validAuthToken = true;
        next();
    } catch (err) {
        req.validAuthToken = false;
        next();
    }
}
exports.checkAuthToken = checkAuthToken;
