const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for lessons within a course
const lessonSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true }, // HTML content or URL to video/resource
    duration: { type: Number }, // in minutes
    order: { type: Number, required: true }, // for ordering lessons
    isPreview: { type: Boolean, default: false }, // if true, available to guest viewers
    createdAt: { type: Date, default: Date.now }
});

// Schema for quizzes as completion criteria
const quizSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
        points: { type: Number, default: 1 }
    }],
    passingScore: { type: Number, default: 70 }, // percentage needed to pass
    timeLimit: { type: Number }, // in minutes, optional
    createdAt: { type: Date, default: Date.now }
});

// Schema for assignments as completion criteria
const assignmentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    dueDate: { type: Date },
    maxPoints: { type: Number, default: 100 },
    passingScore: { type: Number, default: 70 }, // percentage needed to pass
    createdAt: { type: Date, default: Date.now }
});

// Main course schema
const coursesSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, default: "online" },
    price: { type: String, required: true },
    date: { type: String },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: String }, // URL to course thumbnail image
    lessons: [lessonSchema],
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
    completionCriteria: {
        requiredLessons: [{ type: mongoose.Schema.Types.ObjectId }], // IDs of required lessons
        quizzes: [quizSchema],
        assignments: [assignmentSchema],
        minimumPassingGrade: { type: Number, default: 70 } // percentage needed to pass the course
    },
    forum: {
        enabled: { type: Boolean, default: true },
        topics: [{
            title: { type: String },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now },
            posts: [{
                content: { type: String },
                createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                createdAt: { type: Date, default: Date.now }
            }]
        }]
    },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ratings: [{
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Courses", coursesSchema);
