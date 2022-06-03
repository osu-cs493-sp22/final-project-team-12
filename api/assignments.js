const { Router } = require('express');
const { ValidationError } = require('sequelize');

const { Assignment, AssignmentClientFields } = require('../models/assignment');
const { Submission, SubmissionClientFields } = require('../models/submission');
const { Course } = require('../models/course');
const { User } = require('../models/user');
const { requireAuth } = require('../lib/auth');

const router = Router();

// POST /assignments - Create a new assignment
router.post('/', requireAuth, async function (req, res) {
    let validInstructor = false;
    if (req.role === 'instructor') {
        const course = Course.findByPk(req.body.courseId);
        if (course.instructorId === req.user) {
            validInstructor = true;
        }
    }
    if (req.role !== 'admin' && validInstructor === false) {
        res.status(403).send({
            error: 'Invalid credentials',
        });
    } else {
        try {
            const assignment = await Assignment.create(
                req.body,
                AssignmentClientFields
            );
            res.status(201).send({ id: assignment.id });
        } catch (e) {
            if (e instanceof ValidationError) {
                res.status(400).send({ error: e.message });
            } else {
                throw e;
            }
        }
    }
});

// GET /assignments/{id} - Fetch data about a specific assignment
router.get('/:assignmentId', async function (req, res) {
    const assignmentId = parseInt(req.params.assignmentId);
    const assignment = await Assignment.findByPk(assignmentId);
    if (assignment) {
        res.status(200).send(assignment);
    } else {
        res.status(404).send({ error: 'Specified Assignment ID not found' });
    }
});

// PATCH /assignments/{id} - Update data for a specific assignment
router.patch('/:assignmentId', requireAuth, async function (req, res) {
    const assignmentId = parseInt(req.params.assignmentId);
    const assignment = await Assignment.findByPk(assignmentId); // used for auth
    let validInstructor = false;
    if (req.role === 'instructor') {
        const course = Course.findByPk(assignment.courseId);
        if (course.instructorId === req.user) {
            validInstructor = true;
        }
    }
    if (req.role !== 'admin' && validInstructor === false) {
        res.status(403).send({
            error: 'Invalid credentials',
        });
    } else {
        const result = await Assignment.update(req.body, {
            where: { id: assignmentId },
            fields: AssignmentClientFields.filter(
                (field) => field !== 'courseId'
            ),
        });
        if (result[0] > 0) {
            res.status(200).send();
        } else {
            res.status(404).send({
                error: 'Specified Assignment ID not found',
            });
        }
    }
});

// DELETE /assignments/{id} - Remove a specific assignment from the database
router.delete('/:assignmentId', requireAuth, async function (req, res) {
    const assignmentId = parseInt(req.params.assignmentId);
    const assignment = await Assignment.findByPk(assignmentId); // used for auth
    let validInstructor = false;
    if (req.role === 'instructor') {
        const course = Course.findByPk(assignment.courseId);
        if (course.instructorId === req.user) {
            validInstructor = true;
        }
    }
    if (req.role !== 'admin' && validInstructor === false) {
        res.status(403).send({
            error: 'Invalid credentials',
        });
    } else {
        const result = await Assignment.destroy({
            where: { id: assignmentId },
        });
        if (result > 0) {
            res.status(204).send();
        } else {
            res.status(404).send({
                error: 'Specified Assignment ID not found',
            });
        }
    }
});

// GET /assignments/{id}/submissions - Fetch the list of all submissions for an assignment
router.get(
    '/:assignmentId/submissions',
    requireAuth,
    async function (req, res) {
        /*
         * Compute page number based on optional query string parameter `page`.
         * Make sure page is within allowed bounds.
         */
        let page = parseInt(req.query.page) || 1;
        page = page < 1 ? 1 : page;
        const numPerPage = 10;
        const offset = (page - 1) * numPerPage;

        const assignmentId = parseInt(req.params.assignmentId);
        const assignment = await Assignment.findByPk(assignmentId);
        if (!assignment) {
            res.status(404).send({
                error: 'Specified Assignment ID not found',
            });
        } else {
            let validInstructor = false;
            if (req.role === 'instructor') {
                const course = Course.findByPk(assignment.courseId);
                if (course.instructorId === req.user) {
                    validInstructor = true;
                }
            }
            if (req.role !== 'admin' && validInstructor === false) {
                res.status(403).send({
                    error: 'Invalid credentials',
                });
            } else {
                let where = {};
                if (req.query.studentId) {
                    let studentId = parseInt(req.query.studentId);
                    where = {
                        assignmentId: assignmentId,
                        studentId: studentId,
                    };
                } else {
                    where = {
                        assignmentId: assignmentId,
                    };
                }

                const result = await Submission.findAndCountAll({
                    where: where,
                    limit: numPerPage,
                    offset: offset,
                });

                /*
                 * Generate HATEOAS links for surrounding pages.
                 */
                const lastPage = Math.ceil(result.count / numPerPage);
                const links = {};
                if (req.query.studentId) {
                    let studentId = parseInt(req.query.studentId);
                    if (page < lastPage) {
                        links.nextPage = `/${assignmentId}/submissions?page=${
                            page + 1
                        }&studentId=${studentId}`;
                        links.lastPage = `/${assignmentId}/submissions?page=${lastPage}&studentId=${studentId}`;
                    }
                    if (page > 1) {
                        links.prevPage = `/${assignmentId}/submissions?page=${
                            page - 1
                        }&studentId=${studentId}`;
                        links.firstPage = `/${assignmentId}/submissions?page=1&studentId=${studentId}`;
                    }
                } else {
                    if (page < lastPage) {
                        links.nextPage = `/${assignmentId}/submissions?page=${
                            page + 1
                        }`;
                        links.lastPage = `/${assignmentId}/submissions?page=${lastPage}`;
                    }
                    if (page > 1) {
                        links.prevPage = `/${assignmentId}/submissions?page=${
                            page - 1
                        }`;
                        links.firstPage = '/${assignmentId}/submissions?page=1';
                    }
                }

                /*
                 * Construct and send response. (everything after submissions isn't includied in the openapi.yaml)
                 */
                res.status(200).json({
                    submissions: result.rows,
                    pageNumber: page,
                    totalPages: lastPage,
                    pageSize: numPerPage,
                    totalCount: result.count,
                    links: links,
                });
            }
        }
    }
);

// POST /assignments/{id}/submissions - Create a new submission for an assignment
router.post(
    '/:assignmentId/submissions',
    requireAuth,
    async function (req, res) {
        const assignmentId = parseInt(req.params.assignmentId);
        const assignment = await Assignment.findByPk(assignmentId);
        if (!assignment) {
            res.status(404).send({
                error: 'Specified Assignment ID not found',
            });
        } else {
            let validStudent = false;
            if (req.role === 'student') {
                const student = await User.findAll({
                    where: { id: req.user },
                    include: Course,
                });
                console.log('== student courses:', student);
                if (student.courses.length != 0) {
                    if (student.courses[0].courseId === assignment.courseId) {
                        validStudent = true;
                    }
                }
            }
            if (validStudent === false) {
                res.status(403).send({
                    error: 'Invalid credentials',
                });
            } else {
                try {
                    const submission = await Submission.create(
                        req.body,
                        SubmissionClientFields
                    );
                    res.status(201).send({ id: submission.id });
                } catch (e) {
                    if (e instanceof ValidationError) {
                        res.status(400).send({ error: e.message });
                    } else {
                        throw e;
                    }
                }
            }
        }
    }
);

module.exports = router;
