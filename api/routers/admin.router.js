const express = require("express");
const router = express.Router();
const { adminAuth } = require('../auth/auth');
const { User } = require('../model/user.model');
const Courses = require('../model/courses.model');
const Progress = require('../model/progress.model');
const { Conversation } = require('../model/message.model');

// Protect all admin routes with adminAuth middleware
router.use(adminAuth);

// Admin dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    // Get counts for dashboard statistics
    const userCount = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const courseCount = await Courses.countDocuments();
    const completedCoursesCount = await Progress.countDocuments({ status: 'completed' });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    // Get popular courses (by enrollment count)
    const popularCourses = await Courses.aggregate([
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          thumbnail: 1,
          instructor: 1,
          enrolledStudentsCount: { $size: { $ifNull: ["$enrolledStudents", []] } }
        }
      },
      { $sort: { enrolledStudentsCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Get completion rates
    const courseCompletionRates = await Courses.aggregate([
      {
        $lookup: {
          from: "progresses",
          localField: "_id",
          foreignField: "course",
          as: "progressRecords"
        }
      },
      {
        $project: {
          title: 1,
          enrolledCount: { $size: { $ifNull: ["$enrolledStudents", []] } },
          completedCount: {
            $size: {
              $filter: {
                input: "$progressRecords",
                as: "progress",
                cond: { $eq: ["$$progress.status", "completed"] }
              }
            }
          }
        }
      },
      {
        $project: {
          title: 1,
          enrolledCount: 1,
          completedCount: 1,
          completionRate: {
            $cond: [
              { $eq: ["$enrolledCount", 0] },
              0,
              { $multiply: [{ $divide: ["$completedCount", "$enrolledCount"] }, 100] }
            ]
          }
        }
      },
      { $sort: { enrolledCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: {
        stats: {
          userCount,
          studentCount,
          courseCount,
          completedCoursesCount
        },
        recentUsers,
        popularCourses,
        courseCompletionRates
      }
    });
  } catch (error) {
    console.error("Error getting admin dashboard data:", error);
    res.status(500).json({ success: false, message: "Server error getting dashboard data" });
  }
});

// User management routes
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email role createdAt enrolledCourses completedCourses');
      
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ success: false, message: "Server error getting users" });
  }
});

router.put("/user/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['student', 'admin', 'guest'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('name email role');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: "Server error updating user role" });
  }
});

// Course management routes
router.get("/courses", async (req, res) => {
  try {
    const courses = await Courses.find()
      .sort({ createdAt: -1 })
      .populate('instructor', 'name email')
      .select('title description price type date createdAt enrolledStudents');
      
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({ success: false, message: "Server error getting courses" });
  }
});

// Student progress reports
router.get("/reports/student-progress", async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ lastAccessedAt: -1 });
      
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error("Error getting student progress reports:", error);
    res.status(500).json({ success: false, message: "Server error getting progress reports" });
  }
});

// Course popularity report
router.get("/reports/course-popularity", async (req, res) => {
  try {
    const coursePopularity = await Courses.aggregate([
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          type: 1,
          instructor: 1,
          enrolledStudentsCount: { $size: { $ifNull: ["$enrolledStudents", []] } },
          ratingsCount: { $size: { $ifNull: ["$ratings", []] } },
          averageRating: { $avg: "$ratings.rating" }
        }
      },
      { $sort: { enrolledStudentsCount: -1 } }
    ]);
    
    // Populate instructor info
    await Courses.populate(coursePopularity, { path: "instructor", select: "name email" });
    
    res.status(200).json({ success: true, data: coursePopularity });
  } catch (error) {
    console.error("Error getting course popularity report:", error);
    res.status(500).json({ success: false, message: "Server error getting course popularity report" });
  }
});

module.exports = router;
