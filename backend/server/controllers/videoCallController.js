import VideoCall from '../models/videoCallModel.js';
import User from '../models/authModel.js';

// GET /api/calls — get calls for this user
export const getCalls = async (req, res) => {
    try {
        let calls;
        if (req.user.role === 'instructor') {
            calls = await VideoCall.find({ instructorId: req.user.id }).sort({ scheduledAt: -1 });
        } else {
            // Student sees calls from their instructor
            const student = await User.findById(req.user.id);
            if (student && student.instructorId) {
                calls = await VideoCall.find({ instructorId: student.instructorId }).sort({ scheduledAt: -1 });
            } else {
                calls = [];
            }
        }

        res.json(calls);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// POST /api/calls — instructor schedules a call
export const scheduleCall = async (req, res) => {
    try {
        if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Instructor only' });

        const { title, scheduledAt, duration, projectName, notes } = req.body;
        
        // Get instructor name from DB (JWT only has id/role)
        const instructor = await User.findById(req.user.id).select('name');
        
        // Auto-enroll all students of this instructor
        const students = await User.find({ instructorId: req.user.id, role: 'student' });
        
        const newCall = new VideoCall({
            title: title || 'UpgradeX Session',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            duration: duration || 60,
            projectName: projectName || '',
            instructorId: req.user.id,
            instructorName: instructor?.name || 'Instructor',
            participants: students.map(s => s._id),
            status: 'scheduled',
            notes: notes || ''
        });

        await newCall.save();
        res.status(201).json(newCall);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// PUT /api/calls/:id/start — mark as live
export const startCall = async (req, res) => {
    try {
        const call = await VideoCall.findById(req.params.id);
        if (!call) return res.status(404).json({ message: 'Call not found' });
        call.status = 'live';
        await call.save();
        res.json(call);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// PUT /api/calls/:id/end — mark as ended
export const endCall = async (req, res) => {
    try {
        const call = await VideoCall.findById(req.params.id);
        if (!call) return res.status(404).json({ message: 'Call not found' });
        call.status = 'ended';
        await call.save();
        res.json(call);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
