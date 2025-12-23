const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: String
});

const unitSchema = new mongoose.Schema({
  unitName: String,
  lessons: [lessonSchema]
});

const courseLessonSchema = new mongoose.Schema({
  courseId: {
    type: Object, // not ObjectId — you store the full course object
    required: true
  },
  units: [unitSchema]
}, { timestamps: true });

module.exports = mongoose.model('Lesson', courseLessonSchema);
