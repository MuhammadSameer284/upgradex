import mongoose from 'mongoose';

const videoCallSchema = new mongoose.Schema({
    title: { type: String, required: true },
    scheduledAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 60 }, // minutes
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    projectName: { type: String, default: '' },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    instructorName: { type: String, default: '' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
    meetingLink: { type: String, default: '' },
    notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('VideoCall', videoCallSchema);
