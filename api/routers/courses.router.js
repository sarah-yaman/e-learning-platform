const express = require("express");
const { auth, adminAuth, studentAuth, enrollmentAuth } = require("../auth/auth");
const router = express.Router();
const coursesController = require("../controllers/courses.controller");

// Course management routes (admin/instructor only)
router.post("/add", adminAuth, coursesController.create);
router.delete("/delete/:id", adminAuth, coursesController.delete);
router.get("/instructor/:instructorId?", auth, coursesController.getInstructorCourses);

// Course content management (admin/instructor only)
router.post("/:courseId/lesson", adminAuth, coursesController.addLesson);
router.put("/:courseId/lesson/:lessonId", adminAuth, coursesController.updateLesson);
router.delete("/:courseId/lesson/:lessonId", adminAuth, coursesController.deleteLesson);
router.post("/:courseId/quiz", adminAuth, coursesController.addQuiz);
router.post("/:courseId/assignment", adminAuth, coursesController.addAssignment);
router.put("/:courseId/completion-criteria", adminAuth, coursesController.updateCompletionCriteria);

// Course browsing routes (public)
router.get("/all", coursesController.getAll);
router.get("/:id", coursesController.getCourse);
router.post("/cart", coursesController.getCartWithId);

// Course forum routes
router.post("/:courseId/forum/topic", enrollmentAuth, coursesController.addForumTopic);
router.post("/:courseId/forum/topic/:topicId/post", enrollmentAuth, coursesController.addForumPost);
router.get("/:courseId/forum/topics", enrollmentAuth, coursesController.getForumTopics);
router.get("/:courseId/forum/topic/:topicId", enrollmentAuth, coursesController.getForumPosts);

module.exports = router;
