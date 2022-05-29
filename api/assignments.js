const { Router } = require('express');

const router = Router();

// POST /assignments - Create a new assignment
router.post('/', async function (req, res) {
    res.status(201).send();
});

// GET /assignments/{id} - Fetch data about a specific assignment
router.get('/:assignmentId', async function (req, res) {
    res.status(200).send();
});

// PATCH /assignments/{id} - Update data for a specific assignment
router.patch('/:assignmentId', async function (req, res) {
    res.status(204).send();
});

// DELETE /assignments/{id} - Remove a specific assignment from the database
router.delete('/:assignmentId', async function (req, res) {
    res.status(204).send();
});

// GET /assignments/{id}/submissions - Fetch the list of all submissions for an assignment
router.get('/:assignmentId/submissions', async function (req, res) {
    res.status(200).send();
});

// POST /assignments/{id}/submissions - Create a new submission for an assignment
router.post('/:assignmentId/submissions', async function (req, res) {
    res.status(201).send();
});

module.exports = router;
