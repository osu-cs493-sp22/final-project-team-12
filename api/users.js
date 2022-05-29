const { Router } = require('express');

const router = Router();

// POST /users - Create a new user
router.post('/', async function (req, res) {
    res.status(201).send();
});

// POST /users/login - Log in a user
router.post('/login', async function (req, res) {
    res.status(200).send();
});

// GET /users/{id} - Fetch data about a specific user
router.get('/:userId', async function (req, res) {
    res.status(200).send();
});

module.exports = router;
