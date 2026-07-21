import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    initials: { type: String, required: true },
    desc: { type: String, default: "" },
    tech: { type: [String], default: [] },
    gradFrom: { type: String, default: "#534AB7" },
    gradTo: { type: String, default: "#7F77DD" },
    bg: { type: String, default: "rgba(83,74,183,0.15)" },
    date: { type: String, default: "Jun 2026" },
    github: { type: String, default: "#" },
    demo: { type: String, default: "#" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
}, { timestamps: true });

export default mongoose.model('Portfolio', portfolioSchema);
