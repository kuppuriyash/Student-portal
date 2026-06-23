const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const StudyMaterial = require('../models/StudyMaterial');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Announcement = require('../models/Announcement');

// @desc    Get Faculty Dashboard Stats
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty)
const getFacultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user._id;

    // Faculty courses
    const courses = await Course.find({ faculty: facultyId });
    const courseIds = courses.map(c => c._id);

    // Enrolled students count (unique)
    let uniqueStudentIds = new Set();
    courses.forEach(c => {
      c.students.forEach(s => uniqueStudentIds.add(s.toString()));
    });
    const totalStudents = uniqueStudentIds.size;

    // Material uploads count
    const totalMaterials = await StudyMaterial.countDocuments({ uploadedBy: facultyId });

    // Assignments posted count
    const totalAssignments = await Assignment.countDocuments({ uploadedBy: facultyId });

    // Pending submissions to grade
    const assignments = await Assignment.find({ uploadedBy: facultyId });
    const assignmentIds = assignments.map(a => a._id);
    const pendingGrading = await AssignmentSubmission.countDocuments({
      assignment: { $in: assignmentIds },
      status: 'Submitted'
    });

    // Recent announcements posted
    const announcements = await Announcement.find({ postedBy: facultyId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        coursesCount: courses.length,
        studentsCount: totalStudents,
        materialsCount: totalMaterials,
        assignmentsCount: totalAssignments,
        pendingGrading,
        courses,
        announcements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Faculty Assigned Courses
// @route   GET /api/faculty/courses
// @access  Private (Faculty)
const getFacultyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.user._id }).populate('students', 'name email rollNo');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance for a course (Matrix submit)
// @route   POST /api/faculty/attendance
// @access  Private (Faculty)
const markAttendance = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { courseId, date, records } = req.body; // records: [{ studentId, status: 'Present'|'Absent'|'Excused' }]

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, date, and attendance records' });
    }

    // Verify faculty owns course
    const course = await Course.findOne({ _id: courseId, faculty: facultyId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    // Normalize date to midnight (00:00:00.000 UTC) to prevent duplicates due to timing
    const parsedDate = new Date(date);
    parsedDate.setUTCHours(0, 0, 0, 0);

    const savedRecords = [];
    for (const record of records) {
      const { studentId, status } = record;
      
      // Upsert: Find and update or create
      const attendanceRecord = await Attendance.findOneAndUpdate(
        { student: studentId, course: courseId, date: parsedDate },
        { status, markedBy: facultyId },
        { upsert: true, new: true, runValidators: true }
      );
      savedRecords.push(attendanceRecord);
    }

    res.json({
      success: true,
      message: 'Attendance saved successfully',
      count: savedRecords.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload marks and grade for a student
// @route   POST /api/faculty/grades
// @access  Private (Faculty)
const uploadGrade = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { studentId, courseId, semester, examType, marksObtained, maxMarks, grade, feedback } = req.body;

    const course = await Course.findOne({ _id: courseId, faculty: facultyId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    // Check if grade already exists for student, course, and examType in the same semester
    let gradeRecord = await Grade.findOne({ student: studentId, course: courseId, semester, examType });

    if (gradeRecord) {
      gradeRecord.marksObtained = marksObtained;
      gradeRecord.maxMarks = maxMarks;
      gradeRecord.grade = grade;
      gradeRecord.feedback = feedback;
      gradeRecord.gradedBy = facultyId;
      await gradeRecord.save();
    } else {
      gradeRecord = await Grade.create({
        student: studentId,
        course: courseId,
        semester,
        examType,
        marksObtained,
        maxMarks,
        grade,
        feedback,
        gradedBy: facultyId
      });
    }

    res.json({
      success: true,
      message: 'Grade posted successfully',
      data: gradeRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload study material file
// @route   POST /api/faculty/materials
// @access  Private (Faculty)
const uploadStudyMaterial = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { title, description, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a study material file' });
    }

    const course = await Course.findOne({ _id: courseId, faculty: facultyId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    const material = await StudyMaterial.create({
      title,
      description,
      course: courseId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      uploadedBy: facultyId
    });

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      data: material
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new assignment
// @route   POST /api/faculty/assignments
// @access  Private (Faculty)
const createAssignment = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { title, description, courseId, dueDate, maxMarks } = req.body;

    const course = await Course.findOne({ _id: courseId, faculty: facultyId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    let fileUrl = '';
    let fileName = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      dueDate: new Date(dueDate),
      fileUrl,
      fileName,
      maxMarks: maxMarks || 100,
      uploadedBy: facultyId
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/faculty/assignments/:id/submissions
// @access  Private (Faculty)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const assignmentId = req.params.id;

    const assignment = await Assignment.findOne({ _id: assignmentId, uploadedBy: facultyId });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found or not posted by you' });
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'name email rollNo')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: {
        assignment,
        submissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade student assignment submission
// @route   PUT /api/faculty/submissions/:id/grade
// @access  Private (Faculty)
const gradeSubmission = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const submissionId = req.params.id;
    const { marksObtained, grade, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId).populate('assignment');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Verify faculty owns the assignment
    if (submission.assignment.uploadedBy.toString() !== facultyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to grade this submission' });
    }

    submission.marksObtained = marksObtained;
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'Graded';
    submission.gradedBy = facultyId;

    await submission.save();

    // Proactively post to Grade schema as well so it shows in Student grades
    const existingGrade = await Grade.findOne({
      student: submission.student,
      course: submission.assignment.course,
      examType: 'Assignment',
      // Find matches for same assignment by checking feedback or custom details, 
      // or simply upsert it based on feedback referencing the assignment title.
      // For simplicity, we can log individual grades.
    });

    await Grade.findOneAndUpdate(
      {
        student: submission.student,
        course: submission.assignment.course,
        examType: 'Assignment',
        feedback: `Assignment: ${submission.assignment.title}` // Anchor reference
      },
      {
        semester: 1, // Default or parsed from student
        marksObtained,
        maxMarks: submission.assignment.maxMarks,
        grade,
        feedback: feedback || `Graded assignment: ${submission.assignment.title}`,
        gradedBy: facultyId
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post announcement
// @route   POST /api/faculty/announcements
// @access  Private (Faculty)
const postAnnouncement = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { title, content, category, targetAudience } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      targetAudience: targetAudience || 'All',
      postedBy: facultyId
    });

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get course performance analytics report
// @route   GET /api/faculty/reports/course/:id
// @access  Private (Faculty)
const getStudentPerformanceReport = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const courseId = req.params.id;

    const course = await Course.findOne({ _id: courseId, faculty: facultyId }).populate('students', 'name email rollNo');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    const report = [];
    for (const student of course.students) {
      // 1. Attendance details
      const totalClasses = await Attendance.countDocuments({ student: student._id, course: courseId });
      const presentClasses = await Attendance.countDocuments({ student: student._id, course: courseId, status: 'Present' });
      const excusedClasses = await Attendance.countDocuments({ student: student._id, course: courseId, status: 'Excused' });
      const attendancePercentage = totalClasses > 0 
        ? Math.round(((presentClasses + excusedClasses) / totalClasses) * 100) 
        : 100;

      // 2. Grade details (Quiz, Mid, End, Assignment)
      const studentGrades = await Grade.find({ student: student._id, course: courseId });

      report.push({
        studentId: student._id,
        name: student.name,
        rollNo: student.rollNo,
        attendance: {
          total: totalClasses,
          present: presentClasses,
          excused: excusedClasses,
          percentage: attendancePercentage
        },
        grades: studentGrades.map(g => ({
          examType: g.examType,
          marks: g.marksObtained,
          maxMarks: g.maxMarks,
          grade: g.grade
        }))
      });
    }

    res.json({
      success: true,
      data: {
        courseName: course.name,
        courseCode: course.code,
        studentsCount: course.students.length,
        report
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
