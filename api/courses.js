const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Course, CourseClientFields } = require('../models/course')
const { Assignment, AssignmentClientFields } = require('../models/assignment')
const { Submission, SubmissionClientFields } = require('../models/submission')

const router = Router()

// GET /courses - Fetch the list of all courses
router.get('/', async function (req, res) {
  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1
  page = page < 1 ? 1 : page
  const numPerPage = 10
  const offset = (page - 1) * numPerPage

  const result = await Course.findAndCountAll({
    limit: numPerPage,
    offset: offset
  })

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  const lastPage = Math.ceil(result.count / numPerPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/courses?page=${page + 1}`
    links.lastPage = `/courses?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/courses?page=${page - 1}`
    links.firstPage = '/courses?page=1'
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
    links: links
  })
});

// POST /courses - Create a new course
router.post('/', async function (req, res) {
    try {
        const course = await Course.create(
            req.body,
            CourseClientFields
        );
        res.status(201).send({ id: course.id });
    } catch (e) {
        if (e instanceof ValidationError) {
            res.status(400).send({ error: e.message });
        } else {
            throw e;
        }
    }
});

// GET /courses/{id} - Fetch data about a specific course
router.get('/:courseId', async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await course.findByPk(courseId);
    if (course) {
        res.status(200).send(course);
    } else {
        res.status(404).send({ error: 'Specified Course ID not found' });
    }
});

// PATCH /courses/{id} - Update data for a specific course
router.patch('/:courseId', async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId); // used for auth
    const result = await Course.update(req.body, {
        where: { id: courseId },
        fields: CourseClientFields
    });
    if (result[0] > 0) {
        res.status(204).send();
    } else {
        res.status(404).send({ error: 'Specified Course ID not found' });
    }
});

// DELETE /courses/{id} - Remove a specific course from the database
router.delete('/:courseId', async function (req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId); // used for auth
    const result = await Course.destroy({ where: { id: courseId } });
    if (result > 0) {
        res.status(204).send();
    } else {
        res.status(404).send({ error: 'Specified Course ID not found' });
    }
});

// GET /courses/{id}/students - Fetch a list of the students enrolled in the course
router.get('/:courseId/students', async function (req, res) {
    //This works if students have a courseId (but thats 1:1)
    /*const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
        res.status(404).send({ error: 'Specified Course ID not found' });
    } else {
        const result = await Student.findAndCountAll({
            where: {
                courseId: courseId
            }
        })
        res.status(200).json({students: result.rows})
    }*/
    res.status(200).send();
});

// POST /courses/{id}/students - Update enrollment for a course
router.post('/:courseId/students', async function (req, res) {
    /*Same issue with getting students*/
    res.status(201).send();
});

// GET /courses/{id}/roster - Fetch a CSV file containing list of the students enrolled in the course
router.get('/:courseId/roster', async function (req, res) {
    /*File upload section*/
    res.status(200).send();
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
                courseId: courseId
            }
        })
        res.status(200).json({assignments: result.rows})
    }
});

module.exports = router;
