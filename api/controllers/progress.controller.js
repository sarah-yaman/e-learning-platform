const Progress = require("../model/progress.model");
const { User } = require("../model/user.model");
const Courses = require("../model/courses.model");
const mongoose = require("mongoose");

module.exports = {
    // Enroll a student in a course
    enrollStudent: async (req, res) => {
        try {
            const { studentId, courseId } = req.body;
            
            // Validate student and course exist
            const student = await User.findById(studentId);
            const course = await Courses.findById(courseId);
            
            if (!student) {
                return res.status(404).json({ success: false, message: "Student not found" });
            }
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Check if student is already enrolled
            const existingProgress = await Progress.findOne({ student: studentId, course: courseId });
            if (existingProgress) {
                return res.status(400).json({ success: false, message: "Student already enrolled in this course" });
            }
            
            // Create new progress record
            const newProgress = new Progress({
                student: studentId,
                course: courseId,
                status: 'enrolled'
            });
            
            await newProgress.save();
            
            // Update user's enrolled courses
            await User.findByIdAndUpdate(studentId, {
                $addToSet: { enrolledCourses: courseId }
            });
            
            // Update course's enrolled students
            await Courses.findByIdAndUpdate(courseId, {
                $addToSet: { enrolledStudents: studentId }
            });
            
            res.status(200).json({ success: true, data: newProgress });
        } catch (error) {
            console.error("Error enrolling student:", error);
            res.status(500).json({ success: false, message: "Server error enrolling student" });
        }
    },
    
    // Mark a lesson as completed
    markLessonCompleted: async (req, res) => {
        try {
            const { studentId, courseId, lessonId } = req.body;
            
            // Find the progress record
            const progress = await Progress.findOne({ student: studentId, course: courseId });
            
            if (!progress) {
                return res.status(404).json({ success: false, message: "Progress record not found" });
            }
            
            // Check if lesson is already marked as completed
            const lessonCompleted = progress.completedLessons.some(
                lesson => lesson.lessonId.toString() === lessonId
            );
            
            if (lessonCompleted) {
                return res.status(400).json({ success: false, message: "Lesson already marked as completed" });
            }
            
            // Add lesson to completed lessons
            progress.completedLessons.push({
                lessonId: lessonId,
                completedAt: new Date()
            });
            
            // Update last accessed time
            progress.lastAccessedAt = new Date();
            
            // Update status to in-progress if it was just enrolled
            if (progress.status === 'enrolled') {
                progress.status = 'in-progress';
            }
            
            // Calculate overall progress
            const course = await Courses.findById(courseId);
            const totalLessons = course.lessons.length;
            const completedLessonsCount = progress.completedLessons.length;
            
            progress.overallProgress = Math.round((completedLessonsCount / totalLessons) * 100);
            
            // Check if all required lessons are completed
            const allRequiredLessonsCompleted = course.completionCriteria.requiredLessons.every(
                requiredLesson => progress.completedLessons.some(
                    completedLesson => completedLesson.lessonId.toString() === requiredLesson.toString()
                )
            );
            
            // Check if course is completed
            if (allRequiredLessonsCompleted && progress.overallProgress === 100) {
                // Additional checks for quizzes and assignments would be here
                progress.status = 'completed';
                progress.completedAt = new Date();
                
                // Issue certificate if not already issued
                if (!progress.certificateIssued) {
                    progress.certificateIssued = true;
                    progress.certificateIssuedAt = new Date();
                    
                    // Add certificate to user's certificates
                    await User.findByIdAndUpdate(studentId, {
                        $addToSet: { 
                            certificates: {
                                courseId: courseId,
                                issueDate: new Date(),
                                certificateUrl: `/certificates/${studentId}_${courseId}.pdf` // Example URL
                            },
                            completedCourses: courseId
                        }
                    });
                }
            }
            
            await progress.save();
            
            res.status(200).json({ success: true, data: progress });
        } catch (error) {
            console.error("Error marking lesson as completed:", error);
            res.status(500).json({ success: false, message: "Server error marking lesson as completed" });
        }
    },
    
    // Submit a quiz attempt
    submitQuizAttempt: async (req, res) => {
        try {
            const { studentId, courseId, quizId, answers } = req.body;
            
            // Find the progress record
            const progress = await Progress.findOne({ student: studentId, course: courseId });
            
            if (!progress) {
                return res.status(404).json({ success: false, message: "Progress record not found" });
            }
            
            // Find the course and quiz
            const course = await Courses.findById(courseId);
            const quiz = course.completionCriteria.quizzes.id(quizId);
            
            if (!quiz) {
                return res.status(404).json({ success: false, message: "Quiz not found" });
            }
            
            // Calculate score
            let correctAnswers = 0;
            let totalPoints = 0;
            
            const processedAnswers = answers.map(answer => {
                const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
                
                if (!question) {
                    return {
                        questionId: answer.questionId,
                        answer: answer.answer,
                        correct: false
                    };
                }
                
                const isCorrect = question.correctAnswer === answer.answer;
                
                if (isCorrect) {
                    correctAnswers += 1;
                    totalPoints += question.points;
                }
                
                return {
                    questionId: answer.questionId,
                    answer: answer.answer,
                    correct: isCorrect
                };
            });
            
            const totalQuestions = quiz.questions.length;
            const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
            const score = Math.round((totalPoints / maxPoints) * 100);
            const passed = score >= quiz.passingScore;
            
            // Add quiz attempt
            progress.quizAttempts.push({
                quizId: quizId,
                score: score,
                passed: passed,
                answers: processedAnswers,
                attemptedAt: new Date()
            });
            
            // Update last accessed time
            progress.lastAccessedAt = new Date();
            
            await progress.save();
            
            res.status(200).json({ 
                success: true, 
                data: {
                    score,
                    passed,
                    correctAnswers,
                    totalQuestions
                } 
            });
        } catch (error) {
            console.error("Error submitting quiz attempt:", error);
            res.status(500).json({ success: false, message: "Server error submitting quiz attempt" });
        }
    },
    
    // Submit an assignment
    submitAssignment: async (req, res) => {
        try {
            const { studentId, courseId, assignmentId, submissionContent } = req.body;
            
            // Find the progress record
            const progress = await Progress.findOne({ student: studentId, course: courseId });
            
            if (!progress) {
                return res.status(404).json({ success: false, message: "Progress record not found" });
            }
            
            // Check if assignment exists in the course
            const course = await Courses.findById(courseId);
            const assignment = course.completionCriteria.assignments.id(assignmentId);
            
            if (!assignment) {
                return res.status(404).json({ success: false, message: "Assignment not found" });
            }
            
            // Check if assignment was already submitted
            const existingSubmission = progress.assignmentSubmissions.find(
                submission => submission.assignmentId.toString() === assignmentId
            );
            
            if (existingSubmission) {
                // Update existing submission if it hasn't been graded yet
                if (existingSubmission.status === 'submitted') {
                    existingSubmission.submissionContent = submissionContent;
                    existingSubmission.submittedAt = new Date();
                } else {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Assignment has already been graded and cannot be resubmitted" 
                    });
                }
            } else {
                // Add new submission
                progress.assignmentSubmissions.push({
                    assignmentId: assignmentId,
                    submissionContent: submissionContent,
                    status: 'submitted',
                    submittedAt: new Date()
                });
            }
            
            // Update last accessed time
            progress.lastAccessedAt = new Date();
            
            await progress.save();
            
            res.status(200).json({ success: true, message: "Assignment submitted successfully" });
        } catch (error) {
            console.error("Error submitting assignment:", error);
            res.status(500).json({ success: false, message: "Server error submitting assignment" });
        }
    },
    
    // Grade an assignment (for instructors)
    gradeAssignment: async (req, res) => {
        try {
            const { studentId, courseId, assignmentId, score, feedback } = req.body;
            
            // Find the progress record
            const progress = await Progress.findOne({ student: studentId, course: courseId });
            
            if (!progress) {
                return res.status(404).json({ success: false, message: "Progress record not found" });
            }
            
            // Find the submission
            const submissionIndex = progress.assignmentSubmissions.findIndex(
                submission => submission.assignmentId.toString() === assignmentId
            );
            
            if (submissionIndex === -1) {
                return res.status(404).json({ success: false, message: "Assignment submission not found" });
            }
            
            // Update the submission
            progress.assignmentSubmissions[submissionIndex].score = score;
            progress.assignmentSubmissions[submissionIndex].feedback = feedback;
            progress.assignmentSubmissions[submissionIndex].status = 'graded';
            progress.assignmentSubmissions[submissionIndex].gradedAt = new Date();
            
            await progress.save();
            
            res.status(200).json({ success: true, message: "Assignment graded successfully" });
        } catch (error) {
            console.error("Error grading assignment:", error);
            res.status(500).json({ success: false, message: "Server error grading assignment" });
        }
    },
    
    // Get student progress for a course
    getStudentProgress: async (req, res) => {
        try {
            const { studentId, courseId } = req.params;
            
            const progress = await Progress.findOne({ student: studentId, course: courseId });
            
            if (!progress) {
                return res.status(404).json({ success: false, message: "Progress record not found" });
            }
            
            res.status(200).json({ success: true, data: progress });
        } catch (error) {
            console.error("Error getting student progress:", error);
            res.status(500).json({ success: false, message: "Server error getting student progress" });
        }
    },
    
    // Get all progress records for a student
    getStudentAllProgress: async (req, res) => {
        try {
            const { studentId } = req.params;
            
            const progress = await Progress.find({ student: studentId })
                .populate('course', 'title description thumbnail');
            
            res.status(200).json({ success: true, data: progress });
        } catch (error) {
            console.error("Error getting student progress:", error);
            res.status(500).json({ success: false, message: "Server error getting student progress" });
        }
    },
    
    // Get all students' progress for a course (for instructors)
    getCourseProgress: async (req, res) => {
        try {
            const { courseId } = req.params;
            
            const progress = await Progress.find({ course: courseId })
                .populate('student', 'name email');
            
            res.status(200).json({ success: true, data: progress });
        } catch (error) {
            console.error("Error getting course progress:", error);
            res.status(500).json({ success: false, message: "Server error getting course progress" });
        }
    }
};
