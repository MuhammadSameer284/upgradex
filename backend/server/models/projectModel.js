import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    initials: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, default: "" },
    tech: { type: [String], default: [] },
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'review', 'completed'], default: 'active' },
    members: [{
        initials: String,
        bg: String
    }],
    gradFrom: { type: String, default: "#534AB7" },
    gradTo: { type: String, default: "#7F77DD" },
    barColor: { type: String, default: "#7F77DD" },
    updated: { type: String, default: "Just now" },
    tasks: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    isShared: { type: Boolean, default: false },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
