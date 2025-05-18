const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for tracking student progress in a course
const progressSchema = new Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    
    // Track completed lessons
    completedLessons: [{
        lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
        completedAt: { type: Date, default: Date.now }
    }],
    
    // Track quiz attempts and scores
    quizAttempts: [{
        quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
        score: { type: Number, required: true }, // percentage score
        passed: { type: Boolean, required: true },
        answers: [{
            questionId: { type: mongoose.Schema.Types.ObjectId },
            answer: { type: String },
            correct: { type: Boolean }
        }],
        attemptedAt: { type: Date, default: Date.now }
    }],
    
    // Track assignment submissions
    assignmentSubmissions: [{
        assignmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
        submissionContent: { type: String, required: true }, // Text content or file URL
        score: { type: Number }, // Points awarded by instructor
        feedback: { type: String }, // Instructor feedback
        status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
        submittedAt: { type: Date, default: Date.now },
        gradedAt: { type: Date }
    }],
    
    // Overall course progress
    overallProgress: { type: Number, default: 0 }, // percentage of course completed
    overallGrade: { type: Number }, // final grade (percentage)
    certificateIssued: { type: Boolean, default: false },
    certificateIssuedAt: { type: Date },
    
    // Course status
    status: { 
        type: String, 
        enum: ['enrolled', 'in-progress', 'completed', 'failed'], 
        default: 'enrolled' 
    },
    
    // Timestamps
    startedAt: { type: Date, default: Date.now },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

// Create compound index for student and course to ensure uniqueness
progressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
