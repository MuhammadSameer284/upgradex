import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import CodeReview from '../models/codeReviewModel.js';
import Portfolio from '../models/portfolioModel.js';
import User from '../models/authModel.js';

// Get Student Dashboard stats and data
export const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Count stats
        const activeProjectsCount = await Project.countDocuments({ userId, status: 'active' });
        const totalTasksCount = await Task.countDocuments({ userId, done: false });
        const pendingReviewsCount = await CodeReview.countDocuments({ userId, status: 'pending' });
        const portfolioItemsCount = await Portfolio.countDocuments({ userId });

        // Retrieve projects & tasks
        const projects = await Project.find({ userId }).limit(3);
        const tasks = await Task.find({ userId, done: false }).limit(5);

        // Generate activity logs dynamically
        const completedTasks = await Task.find({ userId, done: true }).sort({ updatedAt: -1 }).limit(2);
        const latestProjects = await Project.find({ userId }).sort({ updatedAt: -1 }).limit(1);
        const latestReviews = await CodeReview.find({ userId }).sort({ updatedAt: -1 }).limit(1);

        const activity = [];
        
        if (latestReviews.length > 0) {
            activity.push({
                icon: "ti-git-pull-request",
                iconColor: "#7F77DD",
                iconBg: "rgba(127,119,221,0.12)",
                text: `Submitted code review for ${latestReviews[0].project} (${latestReviews[0].file})`,
                time: "Recently"
            });
        }

        completedTasks.forEach(t => {
            activity.push({
                icon: "ti-checklist",
                iconColor: "#1D9E75",
                iconBg: "rgba(29,158,117,0.12)",
                text: `You completed task "${t.name}" in ${t.project}`,
                time: "Recently"
            });
        });

        if (latestProjects.length > 0) {
            activity.push({
                icon: "ti-folder",
                iconColor: "#FAC775",
                iconBg: "rgba(186,117,23,0.12)",
                text: `You created project "${latestProjects[0].name}"`,
                time: "Recently"
            });
        }

        // Add static fallback if activity is empty
        if (activity.length === 0) {
            activity.push(
                { icon: "ti-checklist", iconColor: "#5DCAA5", iconBg: "rgba(29,158,117,0.12)", text: "Joined workspace and initialized batch 42 tracker.", time: "1d ago" }
            );
        }

        // Fetch next upcoming video call
        const VideoCall = (await import('../models/videoCallModel.js')).default;
        const student = await User.findById(userId);
        let upcomingCall = null;
        if (student && student.instructorId) {
            upcomingCall = await VideoCall.findOne({
                instructorId: student.instructorId,
                scheduledAt: { $gte: new Date() }
            }).sort({ scheduledAt: 1 });
        }

        res.json({
            stats: {
                activeProjects: activeProjectsCount,
                totalTasks: totalTasksCount,
                codeReviews: pendingReviewsCount,
                portfolioItems: portfolioItemsCount
            },
            projects,
            tasks,
            activity,
            upcomingCall
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get Instructor Dashboard stats and data — scoped to instructor's own students
export const getInstructorDashboard = async (req, res) => {
    try {
        const instructorId = req.user.id;

        // Only this instructor's enrolled students
        const myStudents = await User.find({ instructorId, role: 'student' }).select('-password');
        const studentIds = myStudents.map(s => s._id);

        // Count stats scoped to instructor's students
        const totalStudentsCount = myStudents.length;
        const activeProjectsCount = await Project.countDocuments({ userId: { $in: studentIds }, status: 'active' });
        const pendingReviewsCount = await CodeReview.countDocuments({ userId: { $in: studentIds }, status: 'pending' });
        
        // Count instructor's own shared projects as well
        const mySharedProjects = await Project.countDocuments({ instructorId, isShared: true, status: 'active' });

        // Get today's calls
        const VideoCall = (await import('../models/videoCallModel.js')).default;
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay   = new Date(); endOfDay.setHours(23, 59, 59, 999);
        const callsTodayCount = await VideoCall.countDocuments({
            instructorId,
            scheduledAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Build students list with their primary project progress
        const studentsWithProgress = await Promise.all(myStudents.map(async (student) => {
            const projects = await Project.find({ userId: student._id });
            const mainProject = projects[0] || null;
            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                project: mainProject ? mainProject.name : 'No active project',
                progress: mainProject ? mainProject.progress : 0,
                status: mainProject
                    ? (mainProject.status === 'completed' ? 'Completed'
                       : mainProject.status === 'review' ? 'Review due' : 'On track')
                    : 'No project',
                initials: student.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
                bg: 'linear-gradient(135deg,#534AB7,#7F77DD)'
            };
        }));

        // Get pending reviews from instructor's students only
        const pendingReviews = await CodeReview.find({
            userId: { $in: studentIds },
            status: 'pending'
        }).sort({ createdAt: -1 }).limit(5);
        
        // Fetch next upcoming video call
        const upcomingCall = await VideoCall.findOne({
            instructorId,
            scheduledAt: { $gte: new Date() }
        }).sort({ scheduledAt: 1 });

        res.json({
            stats: {
                totalStudents: totalStudentsCount,
                activeProjects: activeProjectsCount + mySharedProjects,
                pendingReviews: pendingReviewsCount,
                callsToday: callsTodayCount
            },
            students: studentsWithProgress,
            reviews: pendingReviews,
            upcomingCall
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
