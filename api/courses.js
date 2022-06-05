const { Router } = require('express');
const { ValidationError } = require('sequelize');

const { Course, CourseClientFields } = require('../models/course');
const { Assignment } = require('../models/assignment');
const { User } = require('../models/user');
const { requireAuth } = require('../lib/auth');
const { Parser } = require('json2csv');

const router = Router();

// GET /courses - Fetch the list of all courses
router.get('/', async function (req, res) {
    /*
     * Compute page number based on optional query string parameter `page`.
     * Make sure page is within allowed bounds.
     */
    let page = parseInt(req.query.page) || 1;
    page = page < 1 ? 1 : page;
    const numPerPage = 10;
    const offset = (page - 1) * numPerPage;

    const result = await Course.findAndCountAll({
        limit: numPerPage,
        offset: offset,
    });

    /*
     * Generate HATEOAS links for surrounding pages.
     */
    const lastPage = Math.ceil(result.count / numPerPage);
    const links = {};
    if (page < lastPage) {
        links.nextPage = `/courses?page=${page + 1}`;
        links.lastPage = `/courses?page=${lastPage}`;
    }
    if (page > 1) {
        links.prevPage = `/courses?page=${page - 1}`;
        links.firstPage = '/courses?page=1';
    }

    /*
     * Construct and send response.
     */
    res.status(200).json({
        courses: result.rows,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: result.count,
        links: links,
    });
});

// POST /courses - Create a new course
router.post('/', requireAuth, async function (req, res) {
    if (req.role !== 'admin') {
        res.status(403).send({
            error: 'Invalid credentials',
        });
    } else {
        try {
            const course = await Course.create(req.body, CourseClientFields);
            res.status(201).send({ id: course.id });
        } catch (e) {
            if (e instanceof ValidationError) {
                res.status(400).send({ error: e.message });
            } else {
                throw e;
            }
        }
    }
});

// GET /courses/{id} - Fetch data about a specific course
router.get('/:courseId', async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (course) {
        res.status(200).send(course);
    } else {
        res.status(404).send({ error: 'Specified Course ID not found' });
    }
});

// PATCH /courses/{id} - Update data for a specific course
router.patch('/:courseId', requireAuth, async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId); // used for auth
    let validInstructor = false;
    if (req.role === 'instructor') {
        if (course.instructorId === req.user) {
            validInstructor = true;
        }
    }
    if (req.role !== 'admin' && validInstructor === false) {
        res.status(403).send({
            error: 'Invalid credentials',
        });
    } else {
        const result = await Course.update(req.body, {
            where: { id: courseId },
            fields: CourseClientFields,
        });
        if (result[0] > 0) {
            res.status(204).send();
        } else {
            res.status(404).send({ error: 'Specified Course ID not found' });
        }
    }
});

// DELETE /courses/{id} - Remove a specific course from the database
router.delete('/:courseId', requireAuth, async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    if (req.role !== 'admin') {
        res.status(403).send({
            error: 'Invalid credentials',
        });
    } else {
        const result = await Course.destroy({ where: { id: courseId } });
        if (result > 0) {
            res.status(204).send();
        } else {
            res.status(404).send({ error: 'Specified Course ID not found' });
        }
    }
});

// GET /courses/{id}/students - Fetch a list of the students enrolled in the course
router.get('/:courseId/students', requireAuth, async function (req, res) {
    //This works if students have a courseId (but thats 1:1)
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
        res.status(404).send({ error: 'Specified Course ID not found' });
    } else {
        let validInstructor = false;
        if (req.role === 'instructor') {
            if (course.instructorId === req.user) {
                validInstructor = true;
            }
        }
        if (req.role !== 'admin' && validInstructor === false) {
            res.status(403).send({
                error: 'Invalid credentials',
            });
        } else {
            const students = await Course.findAll({
                where: { id: course.id},
                raw: true,
                /*include: [{
                    model: User,
                    where: { role: 'student' }
                }]*/
                include: User
            });
            //console.log(students)
            res.status(200).json({students});
        }
    }
});

// POST /courses/{id}/students - Update enrollment for a course
router.post('/:courseId/students', requireAuth, async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
        res.status(404).send({ error: 'Specified Course ID not found' });
    } else {
        let validInstructor = false;
        if (req.role === 'instructor') {
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
                // https://sequelize.org/docs/v6/core-concepts/assocs/#foohasmanybar
                //req.body.add.forEach(userId => await course.addUser(userId));
                //req.body.remove.forEach(userId => await course.removeUser(userId));
                await course.addUser(req.body.add);
                //for (const userId of req.body.add) {
                //    await course.addUser(userId);
                //}
                //for (const userId of req.body.remove) {
                //    await course.removeUser(userId);
                //}
                res.status(200).send();
            } catch (e) {
                if (e instanceof ValidationError) {
                    res.status(400).send({ error: e.message });
                } else {
                    throw e;
                }
            }
        }
    }
});

// GET /courses/{id}/roster - Fetch a CSV file containing list of the students enrolled in the course
router.get('/:courseId/roster', requireAuth, async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId);
    let validInstructor = false;
    if (req.role === 'instructor') {
        if (course.instructorId === req.user) {
            validInstructor = true;
        }
    }
    if (req.role !== 'admin' && validInstructor === false) {
        res.status(403).send({
            error: 'Invalid credentials',
        });
    } else {
        /*File upload section*/
        const students = await Course.findAll({
            where: { id: course.id},
            attributes: {exclude: ['id', 'subject', 'number', 'term', 'instructorId', 'createdAt', 'updatedAt']},
            raw: true,
            include: [{model: User, attributes: {exclude: ['id', 'password','role', 'createdAt', 'updatedAt']}}]
        });
        const studentInfo = ['id', 'name', 'email']
        const parser = new Parser({studentInfo})
        const output = parser.parse(students)

        res.status(200).type('text/csv').send(output);
    }
});

// GET /courses/{id}/assignments - Fetch a list of the assignments for the course
router.get('/:courseId/assignments', async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
        res.status(404).send({ error: 'Specified Course ID not found' });
    } else {
        const result = await Assignment.findAndCountAll({
            where: {
                courseId: courseId,
            },
        });
        res.status(200).json({ assignments: result.rows });
    }
});

module.exports = router;
