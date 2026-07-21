import Project from '../models/projectModel.js';
import User from '../models/authModel.js';

const gradPool = [
    ["#534AB7", "#7F77DD"],
    ["#0F6E56", "#1D9E75"],
    ["#712B13", "#D85A30"],
    ["#3C3489", "#AFA9EC"],
    ["#633806", "#EF9F27"],
];

const initialProjectsSeed = [
    {
        initials: "EC", name: "E-Commerce Platform",
        desc: "Full-stack online store with cart, payments, and order tracking.",
        tech: ["React", "Node.js", "MongoDB", "Stripe"],
        progress: 65, status: "active",
        members: [
            { initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
            { initials: "AR", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
        ],
        gradFrom: "#534AB7", gradTo: "#7F77DD", barColor: "#7F77DD",
        updated: "2h ago", tasks: 8, isShared: false
    },
    {
        initials: "SP", name: "Student Portal API",
        desc: "REST API for student records, grades, and attendance.",
        tech: ["Express", "MongoDB", "JWT"],
        progress: 40, status: "active",
        members: [
            { initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
        ],
        gradFrom: "#0F6E56", gradTo: "#1D9E75", barColor: "#1D9E75",
        updated: "5h ago", tasks: 5, isShared: false
    },
    {
        initials: "WA", name: "Weather App",
        desc: "Real-time weather dashboard with 7-day forecast.",
        tech: ["React", "OpenWeather API"],
        progress: 90, status: "review",
        members: [
            { initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
        ],
        gradFrom: "#712B13", gradTo: "#D85A30", barColor: "#D85A30",
        updated: "Yesterday", tasks: 2, isShared: false
    },
    {
        initials: "CB", name: "Chat Bot",
        desc: "AI-powered FAQ bot for Aptech student support.",
        tech: ["Python", "Flask", "OpenAI"],
        progress: 100, status: "completed",
        members: [
            { initials: "SR", bg: "linear-gradient(135deg,#712B13,#D85A30)" },
        ],
        gradFrom: "#085041", gradTo: "#5DCAA5", barColor: "#5DCAA5",
        updated: "Jun 5", tasks: 0, isShared: false
    }
];

// Get Projects
export const getProjects = async (req, res) => {
    try {
        let projects = [];
        
        if (req.user.role === 'instructor') {
            // Instructors see only their own projects
            projects = await Project.find({ userId: req.user.id });
        } else {
            // Students see own projects + shared instructor projects
            const student = await User.findById(req.user.id);
            
            const ownProjects = await Project.find({ userId: req.user.id });
            
            let sharedProjects = [];
            if (student && student.instructorId) {
                sharedProjects = await Project.find({
                    instructorId: student.instructorId,
                    isShared: true,
                    userId: { $ne: req.user.id } // exclude duplicates
                });
            }
            
            projects = [...ownProjects, ...sharedProjects];
        }

        // Seed initial projects for new students
        if (projects.length === 0 && req.user.role === 'student') {
            const seeded = initialProjectsSeed.map(p => ({
                ...p,
                userId: req.user.id
            }));
            projects = await Project.insertMany(seeded);
        }

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Create Project
export const createProject = async (req, res) => {
    try {
        const { name, desc, tech, isShared } = req.body;
        if (!name) return res.status(400).json({ message: "Project name is required" });

        const count = await Project.countDocuments({ userId: req.user.id });
        const [gradFrom, gradTo] = gradPool[count % gradPool.length];

        // Get user name from DB (JWT only has id/role)
        const creator = await User.findById(req.user.id).select('name');

        // Find all enrolled students if instructor is sharing
        let assignedStudents = [];
        if (req.user.role === 'instructor' && isShared) {
            const students = await User.find({ instructorId: req.user.id, role: 'student' });
            assignedStudents = students.map(s => s._id);
        }

        const newProject = new Project({
            initials: name.slice(0, 2).toUpperCase(),
            name: name.trim(),
            desc: desc ? desc.trim() : "New project",
            tech: tech && tech.length ? tech : ["React"],
            progress: 0,
            status: "active",
            members: [{ 
                initials: creator?.name ? creator.name.slice(0, 2).toUpperCase() : 'UX', 
                bg: "linear-gradient(135deg,#534AB7,#7F77DD)" 
            }],
            gradFrom,
            gradTo,
            barColor: gradTo,
            updated: "Just now",
            tasks: 0,
            userId: req.user.id,
            isShared: req.user.role === 'instructor' ? (isShared || false) : false,
            instructorId: req.user.role === 'instructor' ? req.user.id : null,
            assignedStudents
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update Project (progress, status, etc)
export const updateProject = async (req, res) => {
    try {
        const { progress, status, name, desc, tech, isShared } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (progress !== undefined) project.progress = progress;
        if (status !== undefined) project.status = status;
        if (name !== undefined) { project.name = name; project.initials = name.slice(0, 2).toUpperCase(); }
        if (desc !== undefined) project.desc = desc;
        if (tech !== undefined) project.tech = tech;
        
        // Handle share toggle — auto-assign enrolled students
        if (isShared !== undefined && project.userId.toString() === req.user.id) {
            project.isShared = isShared;
            if (isShared && req.user.role === 'instructor') {
                const students = await User.find({ instructorId: req.user.id, role: 'student' });
                project.assignedStudents = students.map(s => s._id);
                project.instructorId = req.user.id;
            }
        }

        project.updated = "Just now";
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete Project
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
