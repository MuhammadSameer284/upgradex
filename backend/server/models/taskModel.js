import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    project: { type: String, default: "General" },
    projColor: { type: String, default: "#7F77DD" },
    due: { type: String, default: "No due date" },
    priority: { type: String, enum: ['high', 'med', 'low'], default: 'low' },
    done: { type: Boolean, default: false },
    assignee: { type: String, default: "SA" },
    assigneeBg: { type: String, default: "linear-gradient(135deg,#534AB7,#7F77DD)" },
    status: { type: String, enum: ['Backlog', 'To Do', 'In Progress', 'Done'], default: 'To Do' },
    order: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
