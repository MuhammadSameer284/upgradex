import mongoose from 'mongoose'

const authSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    role: String, // 'student' or 'instructor'
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    github: { type: String, default: "" },
    skills: { type: [String], default: [] },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }
});

export default mongoose.model('user', authSchema);