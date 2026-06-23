const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, rollNo, batch, semester, facultyId, designation } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Verify role-specific unique inputs
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

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
      user.education = req.body.education !== undefined ? req.body.education : user.education;
      user.experience = req.body.experience !== undefined ? req.body.experience : user.experience;
      user.projects = req.body.projects !== undefined ? req.body.projects : user.projects;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (user.role === 'Student') {
        user.semester = req.body.semester !== undefined ? req.body.semester : user.semester;
        user.batch = req.body.batch !== undefined ? req.body.batch : user.batch;
      } else if (user.role === 'Faculty') {
        user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          token: generateToken(updatedUser._id),
          profile: updatedUser,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
