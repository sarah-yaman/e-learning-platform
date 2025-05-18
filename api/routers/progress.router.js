const express = require("express");
const { auth, adminAuth, studentAuth, enrollmentAuth } = require("../auth/auth");
const router = express.Router();
const progressController = require("../controllers/progress.controller");

// Enrollment routes
router.post("/enroll", studentAuth, progressController.enrollStudent);

// Student progress tracking routes
router.post("/lesson/complete", studentAuth, progressController.markLessonCompleted);
router.post("/quiz/submit", studentAuth, progressController.submitQuizAttempt);
router.post("/assignment/submit", studentAuth, progressController.submitAssignment);

// Instructor routes for grading
router.post("/assignment/grade", adminAuth, progressController.gradeAssignment);

// Progress retrieval routes
router.get("/student/:studentId/course/:courseId", enrollmentAuth, progressController.getStudentProgress);
router.get("/student/:studentId", studentAuth, progressController.getStudentAllProgress);
router.get("/course/:courseId", adminAuth, progressController.getCourseProgress);

module.exports = router;
