import CodeReview from '../models/codeReviewModel.js';
import User from '../models/authModel.js';

const SAMPLE_CODE = `const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

// Register a new user
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { register };
`;

const initialCommentsSeed = [
    { id: 1, line: 10, text: "Check if email format is valid before querying DB.", author: "Sir Khalid", initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", resolved: false, time: "10m ago" },
    { id: 2, line: 13, text: "Use at least 12 rounds for production. 10 is fine for dev.", author: "Sir Khalid", initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", resolved: false, time: "8m ago" },
    { id: 3, line: 24, text: "Good — sending token and user info together is clean.", author: "Sir Khalid", initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", resolved: true, time: "5m ago" },
];

// Get reviews
export const getReviews = async (req, res) => {
    try {
        let reviews;
        
        if (req.user.role === 'instructor') {
            // Get all students of this instructor
            const students = await User.find({ instructorId: req.user.id, role: 'student' });
            const studentIds = students.map(s => s._id);
            
            // Get reviews from all enrolled students + seed if empty
            reviews = await CodeReview.find({ userId: { $in: [...studentIds, req.user.id] } }).sort({ createdAt: -1 });
        } else {
            reviews = await CodeReview.find({ userId: req.user.id });
        }

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Create a new code review submission
export const createReview = async (req, res) => {
    try {
        const { project, file, code } = req.body;
        if (!code) return res.status(400).json({ message: "Code content is required" });

        const user = await User.findById(req.user.id);
        const name = user ? user.name : "Unknown User";

        const newReview = new CodeReview({
            studentName: name,
            project: project || "E-Commerce Platform",
            file: file || "auth/authController.js",
            code,
            comments: [],
            status: "pending",
            initials: name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(),
            bg: req.user.role === 'instructor' ? "linear-gradient(135deg,#0F6E56,#1D9E75)" : "linear-gradient(135deg,#534AB7,#7F77DD)",
            time: "Just now",
            userId: req.user.id
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update review status (instructor only)
export const updateReviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'changes'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const review = await CodeReview.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        review.status = status;
        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add comment to review
export const addComment = async (req, res) => {
    try {
        const { line, text } = req.body;
        if (!line || !text) return res.status(400).json({ message: "Line number and comment text are required" });

        const review = await CodeReview.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        // Calculate next ID
        const nextId = review.comments.length > 0 ? Math.max(...review.comments.map(c => c.id)) + 1 : 1;

        const user = await User.findById(req.user.id);
        const name = user ? user.name : "User";
        const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

        const newComment = {
            id: nextId,
            line,
            text: text.trim(),
            author: name,
            initials,
            bg: req.user.role === 'instructor' ? "linear-gradient(135deg,#0F6E56,#1D9E75)" : "linear-gradient(135deg,#534AB7,#7F77DD)",
            resolved: false,
            time: "Just now"
        };

        review.comments.push(newComment);
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Resolve comment
export const resolveComment = async (req, res) => {
    try {
        const { id: reviewId, commentId } = req.params;

        const review = await CodeReview.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        const comment = review.comments.find(c => c.id === parseInt(commentId));
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        comment.resolved = true;
        comment.time = "Resolved just now";
        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
