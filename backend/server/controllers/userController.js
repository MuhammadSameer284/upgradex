import User from '../models/authModel.js';
import Project from '../models/projectModel.js';

// Get Profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found!" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update Profile
export const updateProfile = async (req, res) => {
    try {
        const { name, bio, location, github, skills } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, bio, location, github, skills },
            { new: true }
        ).select('-password');

        res.json({ message: "Profile updated successfully!", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all students (instructor only)
export const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        
        // Let's attach progress for each student dynamically
        const studentsWithProgress = await Promise.all(students.map(async (student) => {
            // Find student's projects
            const projects = await Project.find({ userId: student._id });
            const mainProject = projects[0] || null;
            
            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                bio: student.bio,
                location: student.location,
                github: student.github,
                skills: student.skills,
                project: mainProject ? mainProject.name : "No active project",
                progress: mainProject ? mainProject.progress : 0,
                status: mainProject ? (mainProject.status === 'completed' ? 'Completed' : mainProject.status === 'review' ? 'Review due' : 'On track') : 'On track',
                initials: student.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
            };
        }));

        res.json(studentsWithProgress);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET /api/users/instructors — list all instructors (for signup dropdown)
export const getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor' }).select('_id name email');
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// GET /api/users/my-students — instructor sees their enrolled students
export const getMyStudents = async (req, res) => {
    try {
        if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Instructor only' });
        const students = await User.find({ instructorId: req.user.id, role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
