const express = require('express');
const router = express.Router();
const {
  getFacultyDashboard,
  getFacultyCourses,
  markAttendance,
  uploadGrade,
  uploadStudyMaterial,
  createAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  postAnnouncement,
  getStudentPerformanceReport
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply protection and faculty check to all faculty routes
router.use(protect);
router.use(authorize('Faculty'));

router.get('/dashboard', getFacultyDashboard);
router.get('/courses', getFacultyCourses);
router.post('/attendance', markAttendance);
router.post('/grades', uploadGrade);
router.post('/materials', upload.single('material'), uploadStudyMaterial);
router.post('/assignments', upload.single('assignment'), createAssignment);
router.get('/assignments/:id/submissions', getAssignmentSubmissions);
router.put('/submissions/:id/grade', gradeSubmission);
router.post('/announcements', postAnnouncement);
router.get('/reports/course/:id', getStudentPerformanceReport);

module.exports = router;
