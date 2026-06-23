const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Timetable = require('../models/Timetable');
const StudyMaterial = require('../models/StudyMaterial');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Announcement = require('../models/Announcement');
const Job = require('../models/Job');

// Helper to calculate attendance stats per course
const calculateAttendanceStats = async (studentId, courses) => {
  const stats = [];
  for (const course of courses) {
    const totalClasses = await Attendance.countDocuments({ student: studentId, course: course._id });
    const presentClasses = await Attendance.countDocuments({ student: studentId, course: course._id, status: 'Present' });
    const excusedClasses = await Attendance.countDocuments({ student: studentId, course: course._id, status: 'Excused' });
    
    // Excused counts as half-present or present, let's treat excused as present for percentage
    const attendancePercentage = totalClasses > 0 
      ? Math.round(((presentClasses + excusedClasses) / totalClasses) * 100) 
      : 100; // Default 100% if no classes held yet

    stats.push({
      courseId: course._id,
      courseName: course.name,
      courseCode: course.code,
      facultyName: course.faculty ? course.faculty.name : 'N/A',
      totalClasses,
      presentClasses,
      excusedClasses,
      absentClasses: totalClasses - (presentClasses + excusedClasses),
      percentage: attendancePercentage
    });
  }
  return stats;
};

// @desc    Get Student Dashboard Statistics
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Enrolled courses
    const courses = await Course.find({ students: studentId }).populate('faculty', 'name email');

    // 1. Attendance overview
    const attendanceStats = await calculateAttendanceStats(studentId, courses);
    const overallAttendance = attendanceStats.length > 0
      ? Math.round(attendanceStats.reduce((sum, item) => sum + item.percentage, 0) / attendanceStats.length)
      : 100;

    // 2. Recent Grades
    const grades = await Grade.find({ student: studentId })
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Assignments & submissions tracker
    const assignments = await Assignment.find({ course: { $in: courses.map(c => c._id) } });
    const submissions = await AssignmentSubmission.find({ student: studentId });

    const totalAssignments = assignments.length;
    const completedAssignments = submissions.length;
    const pendingAssignments = totalAssignments - completedAssignments;

    // 4. Announcements
    const announcements = await Announcement.find({
      targetAudience: { $in: ['All', 'Student'] }
    }).sort({ createdAt: -1 }).limit(5);

    // 5. Timetable for today (based on day of week)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayTimetable = await Timetable.find({
      course: { $in: courses.map(c => c._id) },
      dayOfWeek: todayName === 'Sunday' ? 'Monday' : todayName // Fallback to Monday if sunday for demo
    }).populate('course', 'name code');

    res.json({
      success: true,
      data: {
        overallAttendance,
        attendanceStats,
        recentGrades: grades,
        assignmentStats: {
          total: totalAssignments,
          completed: completedAssignments,
          pending: pendingAssignments,
          rate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 100
        },
        todayTimetable,
        announcements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Detailed Subject-wise Attendance
// @route   GET /api/student/attendance
// @access  Private (Student)
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courses = await Course.find({ students: studentId }).populate('faculty', 'name');
    const attendanceStats = await calculateAttendanceStats(studentId, courses);

    // Fetch raw logs
    const logs = await Attendance.find({ student: studentId })
      .populate('course', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: {
        summary: attendanceStats,
        logs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Semester Grades and Results
// @route   GET /api/student/grades
// @access  Private (Student)
const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const grades = await Grade.find({ student: studentId })
      .populate('course', 'name code')
      .sort({ semester: 1, createdAt: -1 });

    // Group by semester
    const semGrades = {};
    grades.forEach(g => {
      if (!semGrades[g.semester]) {
        semGrades[g.semester] = [];
      }
      semGrades[g.semester].push(g);
    });

    // Calculate mock CGPA (GPA points mapping: A+=10, A=9, B+=8, B=7, C=6, D=5, F=0)
    const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0 };
    let totalPoints = 0;
    let totalSubjects = 0;

    grades.forEach(g => {
      if (gradePoints[g.grade] !== undefined) {
        totalPoints += gradePoints[g.grade];
        totalSubjects += 1;
      }
    });

    const cgpa = totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : '0.00';

    res.json({
      success: true,
      data: {
        cgpa,
        semesters: semGrades,
        allGrades: grades
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Course Timetable
// @route   GET /api/student/timetable
// @access  Private (Student)
const getStudentTimetable = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courses = await Course.find({ students: studentId });
    const courseIds = courses.map(c => c._id);

    const timetable = await Timetable.find({ course: { $in: courseIds } })
      .populate('course', 'name code faculty')
      .sort({ startTime: 1 });

    // Group by day of week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklySchedule = {};
    days.forEach(day => {
      weeklySchedule[day] = timetable.filter(item => item.dayOfWeek === day);
    });

    res.json({
      success: true,
      data: weeklySchedule
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Available Study Materials
// @route   GET /api/student/materials
// @access  Private (Student)
const getStudentStudyMaterials = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courses = await Course.find({ students: studentId });
    const courseIds = courses.map(c => c._id);

    const materials = await StudyMaterial.find({ course: { $in: courseIds } })
      .populate('course', 'name code')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Course Assignments with submission statuses
// @route   GET /api/student/assignments
// @access  Private (Student)
const getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courses = await Course.find({ students: studentId });
    const courseIds = courses.map(c => c._id);

    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'name code')
      .sort({ dueDate: 1 });

    const submissions = await AssignmentSubmission.find({ student: studentId });

    // Map submission details onto assignment object
    const result = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
      return {
        ...assignment.toObject(),
        submission: submission ? {
          fileUrl: submission.fileUrl,
          fileName: submission.fileName,
          submittedAt: submission.submittedAt,
          status: submission.status,
          marksObtained: submission.marksObtained,
          grade: submission.grade,
          feedback: submission.feedback
        } : null
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit an Assignment File
// @route   POST /api/student/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user._id;
    const assignmentId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a submission file' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Check if deadline passed
    const isLate = new Date() > new Date(assignment.dueDate);

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentId });
    
    if (existingSubmission) {
      // Overwrite/Update existing submission
      existingSubmission.fileUrl = `/uploads/${req.file.filename}`;
      existingSubmission.fileName = req.file.originalname;
      existingSubmission.submittedAt = Date.now();
      existingSubmission.status = 'Submitted'; // Reset status if re-submitted
      await existingSubmission.save();

      return res.json({
        success: true,
        message: 'Assignment re-submitted successfully',
        data: existingSubmission
      });
    }

    const submission = await AssignmentSubmission.create({
      assignment: assignmentId,
      student: studentId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      submittedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: isLate ? 'Assignment submitted late successfully' : 'Assignment submitted on time successfully',
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Performance recommendations
// @route   GET /api/student/ai-recommendations
// @access  Private (Student)
const getStudentAIRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;
    const grades = await Grade.find({ student: studentId }).populate('course', 'name code');

    // 1. Identify low performing areas (Marks < 75 or grade B/C/D/F)
    const weakSubjects = grades.filter(g => g.marksObtained / g.maxMarks < 0.75);
    const strongSubjects = grades.filter(g => g.marksObtained / g.maxMarks >= 0.75);

    const recommendations = [];

    // Generate recommendations based on performance
    if (weakSubjects.length > 0) {
      for (const gradeItem of weakSubjects) {
        // Fetch materials for that course
        const materials = await StudyMaterial.find({ course: gradeItem.course._id }).limit(3);
        recommendations.push({
          courseId: gradeItem.course._id,
          courseName: gradeItem.course.name,
          courseCode: gradeItem.course.code,
          score: Math.round((gradeItem.marksObtained / gradeItem.maxMarks) * 100),
          grade: gradeItem.grade,
          status: 'Needs Improvement',
          advice: `You have scored ${gradeItem.marksObtained}/${gradeItem.maxMarks} (${gradeItem.grade}) in ${gradeItem.examType}. We recommend spending extra time on fundamentals, reviewing lecture notes, and attempting past worksheets.`,
          suggestedMaterials: materials.map(m => ({
            title: m.title,
            fileUrl: m.fileUrl,
            fileName: m.fileName
          }))
        });
      }
    } else {
      recommendations.push({
        status: 'Excellent',
        advice: 'Outstanding work! You are scoring above 75% across all recorded graded subjects. Maintain this pace, and consider helping peers or exploring advanced research projects.'
      });
    }

    res.json({
      success: true,
      data: {
        weakSubjectsCount: weakSubjects.length,
        strongSubjectsCount: strongSubjects.length,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mock Chatbot for AI Recommendations
// @route   POST /api/student/ai-chat
// @access  Private (Student)
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const studentId = req.user._id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    // Fetch student's grades to ground the chatbot's answers in reality
    const grades = await Grade.find({ student: studentId }).populate('course', 'name code');
    const student = await User.findById(studentId);

    const weakCourses = grades.filter(g => g.marksObtained / g.maxMarks < 0.75).map(g => g.course.name);
    const gradesSummary = grades.map(g => `${g.course.name} (${g.grade})`).join(', ');

    // Mock chatbot logic based on keywords
    let responseText = `Hello ${student.name}. I am your AI Academic Advisor. `;
    
    const msgLower = message.toLowerCase();

    if (msgLower.includes('improve') || msgLower.includes('grade') || msgLower.includes('score')) {
      if (weakCourses.length > 0) {
        responseText += `I see that you currently have lower scores in ${weakCourses.join(', ')}. To improve, try: 1) Downloading resources uploaded by your instructors, 2) Practicing mock exercises daily, and 3) Requesting a study guide. For ${weakCourses[0]}, let's schedule 45 minutes of revision every alternate day.`;
      } else {
        responseText += `Your grades look fantastic (${gradesSummary || 'No grades logged yet'}). To keep improving, challenge yourself with advanced projects, peer tutoring, and internship applications listed in the Placement section!`;
      }
    } else if (msgLower.includes('resume') || msgLower.includes('placement') || msgLower.includes('job')) {
      responseText += `To prepare for placements, go to the 'Resume Builder' tab in your panel. It will compile your projects, experience, and skills into a professional layout. I also recommend checking the 'Internships & Placements' section where companies have posted job openings.`;
    } else if (msgLower.includes('attendance')) {
      const lowAttendance = await calculateAttendanceStats(studentId, await Course.find({ students: studentId }));
      const lowAttCourses = lowAttendance.filter(c => c.percentage < 75).map(c => c.courseName);
      if (lowAttCourses.length > 0) {
        responseText += `Your attendance is below the 75% requirement in: ${lowAttCourses.join(', ')}. Please attend the upcoming sessions to avoid academic penalties.`;
      } else {
        responseText += `Great job! Your attendance is above the 75% threshold in all classes. Keep attending regularly!`;
      }
    } else {
      responseText += `Based on your academic profile, your average performance is solid. If you need help with study schedules, project ideas, or homework tips for any of your courses (${grades.map(g => g.course.code).join(', ') || 'No registered courses'}), just ask!`;
    }

    res.json({
      success: true,
      data: {
        reply: responseText
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Placement & Internship Listings
// @route   GET /api/student/jobs
// @access  Private (Student)
const getStudentJobs = async (req, res) => {
  try {
    const studentId = req.user._id;
    const jobs = await Job.find({}).sort({ deadline: 1 });

    const result = jobs.map(job => {
      const applicantDetail = job.applicants.find(a => a.student.toString() === studentId.toString());
      return {
        ...job.toObject(),
        applied: !!applicantDetail,
        applicationStatus: applicantDetail ? applicantDetail.status : null,
        appliedAt: applicantDetail ? applicantDetail.appliedAt : null,
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply for an internship/placement
// @route   POST /api/student/jobs/:id/apply
// @access  Private (Student)
const applyForJob = async (req, res) => {
  try {
    const studentId = req.user._id;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(a => a.student.toString() === studentId.toString());
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this opportunity' });
    }

    job.applicants.push({
      student: studentId,
      status: 'Applied'
    });

    await job.save();

    res.json({
      success: true,
      message: 'Applied successfully for this opportunity',
      data: job
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
  applyForJob
};
