const { default: mongoose, model} = require("mongoose");

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'guest'], default: 'guest' },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
    certificates: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses' },
        issueDate: { type: Date, default: Date.now },
        certificateUrl: { type: String }
    }],
    createdAt: { type: Date, default: Date.now }
})

module.exports = { User: model("User", userSchema) }
