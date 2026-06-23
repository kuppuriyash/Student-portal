const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    requirements: {
      type: [String],
      required: [true, 'Please add requirements'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Internship'],
      required: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Please add an application deadline'],
    },
    applicants: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected'],
          default: 'Applied',
        }
      }
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);
