const jwt = require("jsonwebtoken");
const jwtSecret = process.env.jwtSecret;

module.exports = {
    // Basic authentication middleware
    auth: (req, res, next) => {
        let token = req.header("Authorization");
        console.log("token", token);
        
        if (!token) {
            return res.status(401).json({message: "You Are Not Authorized!"});
        }
        
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(401).json({message: "Invalid or expired token"});
            }
            
            req.user = decoded;
            next();
        });
    },
    
    // Middleware to check if user is admin (course creator)
    adminAuth: (req, res, next) => {
        let token = req.header("Authorization");
        console.log("token", token);
        
        if (!token) {
            return res.status(401).json({message: "You Are Not Authorized!"});
        }
        
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(401).json({message: "Invalid or expired token"});
            }
            
            if (decoded.role !== 'admin') {
                return res.status(403).json({message: "Access denied. Admin privileges required."});
            }
            
            req.user = decoded;
            next();
        });
    },
    
    // Middleware to check if user is a student
    studentAuth: (req, res, next) => {
        let token = req.header("Authorization");
        
        if (!token) {
            return res.status(401).json({message: "You Are Not Authorized!"});
        }
        
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(401).json({message: "Invalid or expired token"});
            }
            
            if (decoded.role !== 'student' && decoded.role !== 'admin') {
                return res.status(403).json({message: "Access denied. Student registration required."});
            }
            
            req.user = decoded;
            next();
        });
    },
    
    // Middleware to check course enrollment
    enrollmentAuth: (req, res, next) => {
        let token = req.header("Authorization");
        
        if (!token) {
            return res.status(401).json({message: "You Are Not Authorized!"});
        }
        
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(401).json({message: "Invalid or expired token"});
            }
            
            // Admin can access all courses
            if (decoded.role === 'admin') {
                req.user = decoded;
                return next();
            }
            
            // For students, check if they're enrolled in the course
            // This will need to be implemented with the course ID from the request
            // The actual enrollment check will be done in the controller
            
            req.user = decoded;
            next();
        });
    }
}
