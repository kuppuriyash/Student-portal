const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    startTime: {
      type: String,
      required: true, // Format: 'HH:MM' (24-hour, e.g., '09:00')
    },
    endTime: {
      type: String,
      required: true, // Format: 'HH:MM' (24-hour, e.g., '09:50')
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    batch: {
      type: String, // e.g. "CSE 2023"
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Timetable', timetableSchema);
