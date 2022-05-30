const { Router } = require('express');

const router = Router();

// GET /courses - Fetch the list of all courses
router.get('/', async function (req, res) {
    res.status(200).send();
});

// POST /courses - Create a new course
router.post('/', async function (req, res) {
    res.status(201).send();
});

// GET /courses/{id} - Fetch data about a specific course
router.get('/:courseId', async function (req, res) {
    res.status(200).send();
});

// PATCH /courses/{id} - Update data for a specific course
router.patch('/:courseId', async function (req, res) {
    res.status(204).send();
});

// DELETE /courses/{id} - Remove a specific course from the database
router.delete('/:courseId', async function (req, res) {
    res.status(204).send();
});

// GET /courses/{id}/students - Fetch a list of the students enrolled in the course
router.get('/:courseId/students', async function (req, res) {
    res.status(200).send();
});

// POST /courses/{id}/students - Update enrollment for a course
router.post('/:courseId/students', async function (req, res) {
    res.status(201).send();
});

// GET /courses/{id}/roster - Fetch a CSV file containing list of the students enrolled in the course
router.get('/:courseId/roster', async function (req, res) {
    res.status(200).send();
});

// GET /courses/{id}/assignments - Fetch a list of the assignments for the course
router.get('/:courseId/assignments', async function (req, res) {
    res.status(200).send();
});

module.exports = router;
