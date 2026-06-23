const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');

// @desc    Generate a short-lived signed QR token for course attendance
// @route   POST /api/qr/generate
// @access  Private (Faculty)
const generateQRToken = async (req, res) => {
  try {
    const { courseId } = req.body;
    const facultyId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const course = await Course.findOne({ _id: courseId, faculty: facultyId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    // Create a very short-lived signed token (expires in 20 seconds)
    // Using a custom secret or standard JWT secret
    const qrToken = jwt.sign(
      {
        courseId,
        facultyId,
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET,
      { expiresIn: '20s' } // extremely short window for dynamic rotating QR
    );

    res.json({
      success: true,
      data: {
        qrToken,
        expiresIn: 20
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Scan and register attendance using a signed QR token
// @route   POST /api/qr/scan
// @access  Private (Student)
const scanQRToken = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const studentId = req.user._id;

    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'QR token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'QR Code expired or invalid. Please scan the active, rotating QR code displayed in class.'
      });
    }

    const { courseId, facultyId } = decoded;

    // Verify student is actually enrolled in this course
    const course = await Course.findOne({ _id: courseId, students: studentId });
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this subject'
      });
    }

    // Normalize date to midnight (00:00:00.000 UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if student already marked attendance for today
    const attendanceExists = await Attendance.findOne({
      student: studentId,
      course: courseId,
      date: today
    });

    if (attendanceExists) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }

    // Register attendance
    const attendance = await Attendance.create({
      student: studentId,
      course: courseId,
      date: today,
      status: 'Present',
      markedBy: facultyId
    });

    res.status(201).json({
      success: true,
      message: `Attendance marked present for course ${course.name} successfully!`,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateQRToken,
  scanQRToken
};
