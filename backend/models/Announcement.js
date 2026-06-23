const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Exam', 'Placement', 'Event', 'General'],
      default: 'General',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Student', 'Faculty'],
      default: 'All',
    },
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

module.exports = mongoose.model('Announcement', announcementSchema);
