const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Timetable = require('../models/Timetable');
const Job = require('../models/Job');
const Announcement = require('../models/Announcement');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ role: 'Student' });
    const facultyCount = await User.countDocuments({ role: 'Faculty' });
    const adminCount = await User.countDocuments({ role: 'Admin' });
    const coursesCount = await Course.countDocuments({});
    const jobsCount = await Job.countDocuments({});

    // Calculate global attendance average
    const totalAttendance = await Attendance.countDocuments({});
    const presentAttendance = await Attendance.countDocuments({ status: 'Present' });
    const excusedAttendance = await Attendance.countDocuments({ status: 'Excused' });
    
    const globalAttendanceRate = totalAttendance > 0 
      ? Math.round(((presentAttendance + excusedAttendance) / totalAttendance) * 100) 
      : 100;

    // Student department distribution
    const departments = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'];
    const deptStats = [];
    for (const dept of departments) {
      const count = await User.countDocuments({ role: 'Student', department: new RegExp(dept, 'i') });
      deptStats.push({ name: dept, students: count });
    }

    // Recent activities (users created, courses added, jobs posted)
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    const recentJobs = await Job.find({}).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          students: studentsCount,
          faculty: facultyCount,
          admins: adminCount,
          courses: coursesCount,
          jobs: jobsCount,
          attendanceRate: globalAttendanceRate
        },
        deptStats,
        recentUsers,
        recentJobs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= USER CRUD =================

// @desc    Get all users (filtered by role)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a user
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, rollNo, batch, semester, facultyId, designation } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    if (role === 'Student' && !rollNo) {
      return res.status(400).json({ success: false, message: 'Roll number is required for students' });
    }
    if (role === 'Faculty' && !facultyId) {
      return res.status(400).json({ success: false, message: 'Faculty ID is required for faculty' });
    }

    if (role === 'Student' && rollNo) {
      const rollNoExists = await User.findOne({ rollNo });
      if (rollNoExists) {
        return res.status(400).json({ success: false, message: 'Roll number is already registered' });
      }
    }

    if (role === 'Faculty' && facultyId) {
      const facultyIdExists = await User.findOne({ facultyId });
      if (facultyIdExists) {
        return res.status(400).json({ success: false, message: 'Faculty ID is already registered' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      rollNo: role === 'Student' ? rollNo : undefined,
      batch: role === 'Student' ? batch : undefined,
      semester: role === 'Student' ? semester || 1 : undefined,
      facultyId: role === 'Faculty' ? facultyId : undefined,
      designation: role === 'Faculty' ? designation : undefined,
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.department = req.body.department || user.department;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (user.role === 'Student') {
      user.rollNo = req.body.rollNo || user.rollNo;
      user.batch = req.body.batch || user.batch;
      user.semester = req.body.semester !== undefined ? req.body.semester : user.semester;
    } else if (user.role === 'Faculty') {
      user.facultyId = req.body.facultyId || user.facultyId;
      user.designation = req.body.designation || user.designation;
    }

    const updatedUser = await user.save();
    res.json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If student, remove from all enrolled courses
    if (user.role === 'Student') {
      await Course.updateMany({ students: user._id }, { $pull: { students: user._id } });
      await Attendance.deleteMany({ student: user._id });
      await Grade.deleteMany({ student: user._id });
    }

    // If faculty, remove reference from courses
    if (user.role === 'Faculty') {
      await Course.updateMany({ faculty: user._id }, { $unset: { faculty: '' } });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= COURSE CRUD =================

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private (Admin)
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate('faculty', 'name email department facultyId')
      .populate('students', 'name email rollNo');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/admin/courses
// @access  Private (Admin)
const createCourse = async (req, res) => {
  try {
    const { name, code, department, semester, facultyId, description } = req.body;

    const courseExists = await Course.findOne({ code: code.toUpperCase() });
    if (courseExists) {
      return res.status(400).json({ success: false, message: 'Course with this code already exists' });
    }

    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      department,
      semester,
      faculty: facultyId,
      description
    });

    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/admin/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res) => {
  try {
    const { name, code, department, semester, faculty, description, students } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.name = name || course.name;
    course.code = code ? code.toUpperCase() : course.code;
    course.department = department || course.department;
    course.semester = semester !== undefined ? semester : course.semester;
    course.faculty = faculty || course.faculty;
    course.description = description !== undefined ? description : course.description;
    course.students = students || course.students;

    const updatedCourse = await course.save();
    res.json({ success: true, message: 'Course updated successfully', data: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await Attendance.deleteMany({ course: course._id });
    await Grade.deleteMany({ course: course._id });
    await Timetable.deleteMany({ course: course._id });
    
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= TIMETABLE & PLACEMENTS CRUD =================

// @desc    Create timetable slot
// @route   POST /api/admin/timetable
// @access  Private (Admin)
const createTimetableSlot = async (req, res) => {
  try {
    const { courseId, dayOfWeek, startTime, endTime, room, department, batch } = req.body;

    const timetableSlot = await Timetable.create({
      course: courseId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      department,
      batch
    });

    res.status(201).json({ success: true, message: 'Timetable slot created successfully', data: timetableSlot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post placements/internships
// @route   POST /api/admin/jobs
// @access  Private (Admin)
const createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, location, type, salary, deadline } = req.body;

    const job = await Job.create({
      title,
      company,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split(','),
      location,
      type,
      salary,
      deadline: new Date(deadline),
      postedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Job opportunity posted successfully', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post site-wide announcements
// @route   POST /api/admin/announcements
// @access  Private (Admin)
const postAdminAnnouncement = async (req, res) => {
  try {
    const { title, content, category, targetAudience } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      targetAudience: targetAudience || 'All',
      postedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Global announcement posted', data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
