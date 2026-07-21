import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    line: { type: Number, required: true },
    text: { type: String, required: true },
    author: { type: String, required: true },
    initials: { type: String, required: true },
    bg: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    time: { type: String, default: "Just now" }
});

const codeReviewSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    project: { type: String, default: "E-Commerce Platform" },
    file: { type: String, default: "auth/authController.js" },
    code: { type: String, default: "" },
    status: { type: String, enum: ['pending', 'approved', 'changes'], default: 'pending' },
    comments: [commentSchema],
    initials: { type: String, default: "SA" },
    bg: { type: String, default: "linear-gradient(135deg,#534AB7,#7F77DD)" },
    time: { type: String, default: "Just now" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
}, { timestamps: true });

export default mongoose.model('CodeReview', codeReviewSchema);
