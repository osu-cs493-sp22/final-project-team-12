const { Router } = require('express');
const { ValidationError } = require('sequelize');

const { User, UserClientFields } = require('../models/user');

const router = Router();

// POST /users - Create a new user
router.post('/', async function (req, res) {
    try {
        const user = await User.create(req.body, UserClientFields);
        res.status(201).send({ id: user.id });
    } catch (e) {
        if (e instanceof ValidationError) {
            res.status(400).send({ error: e.message });
        } else {
            throw e;
        }
    }
});

// POST /users/login - Log in a user
router.post('/login', async function (req, res) {
    res.status(200).send();
});

// GET /users/{id} - Fetch data about a specific user
router.get('/:userId', async function (req, res) {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (user) {
        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).send({ error: 'Specified User ID not found' });
    }
});

module.exports = router;
