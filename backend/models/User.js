const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['Student', 'Faculty', 'Admin'],
      required: [true, 'Please select a role'],
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
      trim: true,
    },
    // Student specific details
    rollNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    batch: {
      type: String,
      sparse: true,
      trim: true,
    },
    semester: {
      type: Number,
      sparse: true,
    },
    // Faculty specific details
    facultyId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    designation: {
      type: String,
      sparse: true,
      trim: true,
    },
    // Common profile details
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    education: [
      {
        institution: String,
        degree: String,
        year: String,
        percentage: String,
      }
    ],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      }
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: String,
        link: String,
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
