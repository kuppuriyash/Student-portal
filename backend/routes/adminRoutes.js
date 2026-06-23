const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createTimetableSlot,
  createJob,
  postAdminAnnouncement
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply protection and admin check to all admin routes
router.use(protect);
router.use(authorize('Admin'));

router.get('/dashboard', getAdminDashboard);

// User CRUD
router.route('/users').get(getUsers).post(createUser);
router.route('/users/:id').put(updateUser).delete(deleteUser);

// Course CRUD
router.route('/courses').get(getCourses).post(createCourse);
router.route('/courses/:id').put(updateCourse).delete(deleteCourse);

// Timetable and opportunities
router.post('/timetable', createTimetableSlot);
router.post('/jobs', createJob);
router.post('/announcements', postAdminAnnouncement);

module.exports = router;
