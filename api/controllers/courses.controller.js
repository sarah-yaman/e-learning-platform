const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Courses = require("../model/courses.model");
const { User } = require("../model/user.model");
const Progress = require("../model/progress.model");

module.exports = {
    // Create a new course
    create: async (req, res) => {
        try {
            // Add instructor (current user) to the course data
            const courseData = {
                ...req.body,
                instructor: req.user.userId // From auth middleware
            };
            
            const course = new Courses(courseData);
            const savedData = await course.save();
            
            res.status(200).json({ success: true, data: savedData });
        } catch (error) {
            console.error("Error creating course:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },
    
    // Get all courses (with optional filtering)
    getAll: async (req, res) => {
        try {
            const { search, instructor, category, priceMin, priceMax, sort } = req.query;
            
            // Build query
            let query = {};
            
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (instructor) {
                query.instructor = instructor;
            }
            
            if (priceMin || priceMax) {
                query.price = {};
                if (priceMin) query.price.$gte = priceMin;
                if (priceMax) query.price.$lte = priceMax;
            }
            
            // Build sort options
            let sortOptions = {};
            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        sortOptions.price = 1;
                        break;
                    case 'price_desc':
                        sortOptions.price = -1;
                        break;
                    case 'newest':
                        sortOptions.createdAt = -1;
                        break;
                    case 'oldest':
                        sortOptions.createdAt = 1;
                        break;
                    default:
                        sortOptions.createdAt = -1;
                }
            } else {
                sortOptions.createdAt = -1; // Default sort by newest
            }
            
            const courses = await Courses.find(query)
                .sort(sortOptions)
                .populate('instructor', 'name')
                .select('-completionCriteria.quizzes.questions.correctAnswer'); // Don't send correct answers to client
            
            res.status(200).json({ success: true, data: courses });
        } catch (error) {
            console.error("Error getting courses:", error);
            res.status(500).json({ success: false, message: "Server Error, Try After sometime" });
        }
    },
    
    // Get a single course by ID
    getCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const isPreview = req.query.preview === 'true';
            
            // Check if user is authenticated
            const isAuthenticated = !!req.user;
            const userId = isAuthenticated ? req.user.userId : null;
            
            const course = await Courses.findById(id)
                .populate('instructor', 'name email')
                .populate('prerequisites', 'title description thumbnail');
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Determine if user is enrolled or is the instructor
            let isEnrolled = false;
            let isInstructor = false;
            
            if (isAuthenticated) {
                isInstructor = course.instructor._id.toString() === userId;
                
                if (!isInstructor) {
                    // Check if user is enrolled
                    const progress = await Progress.findOne({ student: userId, course: id });
                    isEnrolled = !!progress;
                }
            }
            
            // Prepare response based on access level
            let responseData;
            
            if (isInstructor || isEnrolled) {
                // Full access - return everything
                responseData = course;
            } else if (isPreview || !isAuthenticated) {
                // Preview access - return limited data
                // Filter lessons to only include preview lessons
                const previewLessons = course.lessons.filter(lesson => lesson.isPreview);
                
                responseData = {
                    ...course.toObject(),
                    lessons: previewLessons,
                    // Remove sensitive data
                    completionCriteria: {
                        minimumPassingGrade: course.completionCriteria.minimumPassingGrade
                    }
                };
            } else {
                // Basic info for authenticated users who aren't enrolled
                responseData = {
                    _id: course._id,
                    title: course.title,
                    description: course.description,
                    type: course.type,
                    price: course.price,
                    date: course.date,
                    instructor: course.instructor,
                    thumbnail: course.thumbnail,
                    prerequisites: course.prerequisites,
                    // Include preview lessons count
                    previewLessonsCount: course.lessons.filter(lesson => lesson.isPreview).length,
                    totalLessonsCount: course.lessons.length
                };
            }
            
            res.status(200).json({ 
                success: true, 
                data: responseData,
                meta: {
                    isEnrolled,
                    isInstructor,
                    isPreview: isPreview || !isAuthenticated
                }
            });
        } catch (error) {
            console.error("Error getting course:", error);
            res.status(500).json({ success: false, message: "Server Error, Try After sometime" });
        }
    },
    
    // Get courses for shopping cart
    getCartWithId: async (req, res) => {
        try {
            const cart = await Courses.find({ _id: { $in: req.body.idArr } })
                .select('title description price thumbnail');
                
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            console.error("Error getting cart items:", error);
            res.status(500).json({ success: false, message: "Server Error, Try After sometime" });
        }
    },
    
    // Delete a course
    delete: async (req, res) => {
        try {
            // Check if user is the course instructor
            const course = await Courses.findById(req.params.id);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            if (course.instructor.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "You are not authorized to delete this course" });
            }
            
            // Delete the course
            await Courses.findByIdAndDelete(req.params.id);
            
            // Delete related progress records
            await Progress.deleteMany({ course: req.params.id });
            
            // Remove course from users' enrolled and completed courses
            await User.updateMany(
                { $or: [{ enrolledCourses: req.params.id }, { completedCourses: req.params.id }] },
                { 
                    $pull: { 
                        enrolledCourses: req.params.id,
                        completedCourses: req.params.id,
                        'certificates.courseId': req.params.id
                    } 
                }
            );
            
            res.status(200).json({ success: true, message: "Course deleted successfully" });
        } catch (error) {
            console.error("Error deleting course:", error);
            res.status(500).json({ success: false, message: "Failed to delete course" });
        }
    },
    
    // Add a lesson to a course
    addLesson: async (req, res) => {
        try {
            const { courseId } = req.params;
            const lessonData = req.body;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Check if user is the course instructor
            if (course.instructor.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "You are not authorized to modify this course" });
            }
            
            // Set the order for the new lesson
            lessonData.order = course.lessons.length + 1;
            
            // Add the lesson to the course
            course.lessons.push(lessonData);
            
            await course.save();
            
            res.status(200).json({ success: true, data: course.lessons[course.lessons.length - 1] });
        } catch (error) {
            console.error("Error adding lesson:", error);
            res.status(500).json({ success: false, message: "Failed to add lesson" });
        }
    },
    
    // Update a lesson
    updateLesson: async (req, res) => {
        try {
            const { courseId, lessonId } = req.params;
            const lessonData = req.body;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Check if user is the course instructor
            if (course.instructor.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "You are not authorized to modify this course" });
            }
            
            // Find the lesson
            const lessonIndex = course.lessons.findIndex(lesson => lesson._id.toString() === lessonId);
            
            if (lessonIndex === -1) {
                return res.status(404).json({ success: false, message: "Lesson not found" });
            }
            
            // Update the lesson
            Object.keys(lessonData).forEach(key => {
                course.lessons[lessonIndex][key] = lessonData[key];
            });
            
            await course.save();
            
            res.status(200).json({ success: true, data: course.lessons[lessonIndex] });
        } catch (error) {
            console.error("Error updating lesson:", error);
            res.status(500).json({ success: false, message: "Failed to update lesson" });
        }
    },
    
    // Delete a lesson
    deleteLesson: async (req, res) => {
        try {
            const { courseId, lessonId } = req.params;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Check if user is the course instructor
            if (course.instructor.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "You are not authorized to modify this course" });
            }
            
            // Find the lesson
            const lessonIndex = course.lessons.findIndex(lesson => lesson._id.toString() === lessonId);
            
            if (lessonIndex === -1) {
                return res.status(404).json({ success: false, message: "Lesson not found" });
            }
            
            // Remove the lesson
            course.lessons.splice(lessonIndex, 1);
            
            // Reorder remaining lessons
            course.lessons.forEach((lesson, index) => {
                lesson.order = index + 1;
            });
            
            await course.save();
            
            res.status(200).json({ success: true, message: "Lesson deleted successfully" });
        } catch (error) {
            console.error("Error deleting lesson:", error);
            res.status(500).json({ success: false, message: "Failed to delete lesson" });
        }
    },
    
    // Add a quiz to a course
    addQuiz: async (req, res) => {
        try {
            const { courseId } = req.params;
            const quizData = req.body;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Check if user is the course instructor
            if (course.instructor.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "You are not authorized to modify this course" });
            }
            
            // Add the quiz to the course
            course.completionCriteria.quizzes.push(quizData);
            
            await course.save();
            
            res.status(200).json({ 
                success: true, 
                data: course.completionCriteria.quizzes[course.completionCriteria.quizzes.length - 1] 
            });
        } catch (error) {
            console.error("Error adding quiz:", error);
            res.status(500).json({ success: false, message: "Failed to add quiz" });
        }
    },
    
    // Add an assignment to a course
    addAssignment: async (req, res) => {
        try {
            const { courseId } = req.params;
            const assignmentData = req.body;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Check if user is the course instructor
            if (course.instructor.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "You are not authorized to modify this course" });
            }
            
            // Add the assignment to the course
            course.completionCriteria.assignments.push(assignmentData);
            
            await course.save();
            
            res.status(200).json({ 
                success: true, 
                data: course.completionCriteria.assignments[course.completionCriteria.assignments.length - 1] 
            });
        } catch (error) {
            console.error("Error adding assignment:", error);
            res.status(500).json({ success: false, message: "Failed to add assignment" });
        }
    },
    
    // Update course completion criteria
    updateCompletionCriteria: async (req, res) => {
        try {
            const { courseId } = req.params;
            const { requiredLessons, minimumPassingGrade } = req.body;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Check if user is the course instructor
            if (course.instructor.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "You are not authorized to modify this course" });
            }
            
            // Update completion criteria
            if (requiredLessons) {
                course.completionCriteria.requiredLessons = requiredLessons;
            }
            
            if (minimumPassingGrade) {
                course.completionCriteria.minimumPassingGrade = minimumPassingGrade;
            }
            
            await course.save();
            
            res.status(200).json({ success: true, data: course.completionCriteria });
        } catch (error) {
            console.error("Error updating completion criteria:", error);
            res.status(500).json({ success: false, message: "Failed to update completion criteria" });
        }
    },
    
    // Get courses created by an instructor
    getInstructorCourses: async (req, res) => {
        try {
            const instructorId = req.params.instructorId || req.user.userId;
            
            const courses = await Courses.find({ instructor: instructorId })
                .select('title description thumbnail price type date createdAt');
                
            res.status(200).json({ success: true, data: courses });
        } catch (error) {
            console.error("Error getting instructor courses:", error);
            res.status(500).json({ success: false, message: "Server Error, Try After sometime" });
        }
    },
    
    // Add a forum topic to a course
    addForumTopic: async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title } = req.body;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Add the topic
            course.forum.topics.push({
                title,
                createdBy: req.user.userId,
                posts: []
            });
            
            await course.save();
            
            res.status(200).json({ 
                success: true, 
                data: course.forum.topics[course.forum.topics.length - 1] 
            });
        } catch (error) {
            console.error("Error adding forum topic:", error);
            res.status(500).json({ success: false, message: "Failed to add forum topic" });
        }
    },
    
    // Add a post to a forum topic
    addForumPost: async (req, res) => {
        try {
            const { courseId, topicId } = req.params;
            const { content } = req.body;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Find the topic
            const topicIndex = course.forum.topics.findIndex(topic => topic._id.toString() === topicId);
            
            if (topicIndex === -1) {
                return res.status(404).json({ success: false, message: "Topic not found" });
            }
            
            // Add the post
            course.forum.topics[topicIndex].posts.push({
                content,
                createdBy: req.user.userId
            });
            
            await course.save();
            
            // Populate the user info for the new post
            await course.populate(`forum.topics.${topicIndex}.posts.${course.forum.topics[topicIndex].posts.length - 1}.createdBy`, 'name');
            
            res.status(200).json({ 
                success: true, 
                data: course.forum.topics[topicIndex].posts[course.forum.topics[topicIndex].posts.length - 1] 
            });
        } catch (error) {
            console.error("Error adding forum post:", error);
            res.status(500).json({ success: false, message: "Failed to add forum post" });
        }
    },
    
    // Get forum topics for a course
    getForumTopics: async (req, res) => {
        try {
            const { courseId } = req.params;
            
            // Find the course
            const course = await Courses.findById(courseId)
                .populate('forum.topics.createdBy', 'name')
                .select('forum');
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            res.status(200).json({ success: true, data: course.forum.topics });
        } catch (error) {
            console.error("Error getting forum topics:", error);
            res.status(500).json({ success: false, message: "Server Error, Try After sometime" });
        }
    },
    
    // Get posts for a forum topic
    getForumPosts: async (req, res) => {
        try {
            const { courseId, topicId } = req.params;
            
            // Find the course
            const course = await Courses.findById(courseId);
            
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            
            // Find the topic
            const topic = course.forum.topics.id(topicId);
            
            if (!topic) {
                return res.status(404).json({ success: false, message: "Topic not found" });
            }
            
            // Populate user info for posts
            await course.populate('forum.topics.posts.createdBy', 'name');
            
            res.status(200).json({ success: true, data: topic });
        } catch (error) {
            console.error("Error getting forum posts:", error);
            res.status(500).json({ success: false, message: "Server Error, Try After sometime" });
        }
    }
};
