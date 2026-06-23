const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getStudentAttendance,
  getStudentGrades,
  getStudentTimetable,
  getStudentStudyMaterials,
  getStudentAssignments,
  submitAssignment,
  getStudentAIRecommendations,
  chatWithAI,
  getStudentJobs,
  applyForJob,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply protection and student check to all student routes
router.use(protect);
router.use(authorize('Student'));

router.get('/dashboard', getStudentDashboard);
router.get('/attendance', getStudentAttendance);
router.get('/grades', getStudentGrades);
router.get('/timetable', getStudentTimetable);
router.get('/materials', getStudentStudyMaterials);
router.get('/assignments', getStudentAssignments);
router.post('/assignments/:id/submit', upload.single('submission'), submitAssignment);
router.get('/ai-recommendations', getStudentAIRecommendations);
router.post('/ai-chat', chatWithAI);
router.get('/jobs', getStudentJobs);
router.post('/jobs/:id/apply', applyForJob);

module.exports = router;
